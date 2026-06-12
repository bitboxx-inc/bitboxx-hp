<script lang="ts" context="module">
	// 外から墨を落とすための共有ハンドル (EKU ホバー連動用)。
	// ページ側は bind:this でコンポーネント参照を持ち drop() を呼ぶ。
	// 'water' は透明な滴 — 顔料を置かず、既存の墨を輪に押しのける。
	export type InkKind = 'sumi' | 'sakura' | 'water';
</script>

<script lang="ts">
	/**
	 * 墨流し (Suminagashi) — GPU 流体シミュレーション (WebGL2)。
	 *
	 * 物理: Jos Stam の Stable Fluids。半精度テクスチャのピンポンで
	 *   速度場 → 渦度強化 → 発散 → 圧力 (Jacobi) → 投影 → 染料移流 を毎フレーム解く。
	 * 染料は 2 チャンネル (R = 墨, G = 朱 #FF2630)。
	 *
	 * 描画は紙ごとシェーダ内で行う:
	 *   - 紙: クリーム地 + fbm 繊維ノイズ + 周辺減光
	 *   - 墨: 密度勾配から法線を立てた擬似 3D 陰影 (濡れた墨の盛り上がり)
	 *   - 縁濃度: 本物の墨流しと同じく、滲みの輪郭に顔料が溜まる
	 *   - 屈折: 墨の下の紙繊維がわずかに歪む
	 *
	 * 演出: 起動時に朱と墨を交互に落とし、放射状の速度場で押し広げて
	 * 伝統的な墨流しの同心円を「シミュレーションの結果として」生む。
	 *
	 * WebGL2 / float color buffer が無い環境では静かな紙に退化する。
	 */
	import { onMount } from 'svelte';

	let canvas: HTMLCanvasElement;
	let host: HTMLDivElement;

	// 外部から墨を落とす (EKU ホバー連動)。マウント前は無視。
	let dropImpl: ((x: number, y: number, kind: InkKind, strength?: number) => void) | null = null;
	export function drop(x: number, y: number, kind: InkKind, strength = 1) {
		dropImpl?.(x, y, kind, strength);
	}

	onMount(() => {
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const gl = canvas.getContext('webgl2', {
			alpha: false,
			depth: false,
			stencil: false,
			antialias: false,
			preserveDrawingBuffer: false
		}) as WebGL2RenderingContext | null;
		if (!gl || !gl.getExtension('EXT_color_buffer_float')) {
			// 退化: CSS の紙のまま
			canvas.style.display = 'none';
			return;
		}

		// ── シェーダ ──────────────────────────────────────────────
		const VERT = `#version 300 es
      precision highp float;
      in vec2 aPos;
      out vec2 vUv;
      void main () { vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }`;

		const compile = (type: number, src: string) => {
			const s = gl.createShader(type)!;
			gl.shaderSource(s, src);
			gl.compileShader(s);
			if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
				console.error(gl.getShaderInfoLog(s));
			}
			return s;
		};
		const vs = compile(gl.VERTEX_SHADER, VERT);
		const program = (fsSrc: string) => {
			const p = gl.createProgram()!;
			gl.attachShader(p, vs);
			gl.attachShader(
				p,
				compile(gl.FRAGMENT_SHADER, `#version 300 es\nprecision highp float;\n${fsSrc}`)
			);
			gl.linkProgram(p);
			if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(p));
			return p;
		};

		// 方向スプラット (速度 or 染料に Gaussian を足す)
		const FS_SPLAT = `
      in vec2 vUv; out vec4 frag;
      uniform sampler2D uTarget;
      uniform vec2 uPoint; uniform vec3 uValue; uniform float uRadius; uniform float uAspect;
      void main () {
        vec2 d = vUv - uPoint; d.x *= uAspect;
        float a = exp(-dot(d, d) / uRadius);
        vec3 base = texture(uTarget, vUv).xyz;
        frag = vec4(base + uValue * a, 1.0);
      }`;

		// 放射スプラット — 中心から外向きの速度を足す (滴の余韻の揺らぎ用)。
		const FS_SPLAT_RADIAL = `
      in vec2 vUv; out vec4 frag;
      uniform sampler2D uTarget;
      uniform vec2 uPoint; uniform float uStrength; uniform float uRadius; uniform float uAspect;
      void main () {
        vec2 d = vUv - uPoint; d.x *= uAspect;
        float r2 = dot(d, d);
        float a = exp(-r2 / uRadius);
        vec2 dir = r2 < 1e-7 ? vec2(0.0) : normalize(d);
        vec2 base = texture(uTarget, vUv).xy;
        frag = vec4(base + dir * uStrength * a, 0.0, 1.0);
      }`;

		// 滴の作用素 — Mathematical Marbling (Lu et al.) の drop operator。
		// 半径 R の滴が落ちると、既存の染料は p' = c + (p-c)·√(1 + R²/|p-c|²) で
		// 外へ押し出される。シェーダでは逆写像で源をサンプリングし、
		// 滴の内側には新しい顔料 (透明な水滴なら 0) を置く。
		// これが本物の墨流しの同心円を一滴ごとに正確に生む。
		const FS_DROP = `
      in vec2 vUv; out vec4 frag;
      uniform sampler2D uTarget;
      uniform vec2 uPoint; uniform float uR2; uniform vec3 uPigment; uniform float uAspect;
      void main () {
        vec2 d = (vUv - uPoint) * vec2(uAspect, 1.0);
        float r2 = dot(d, d);
        if (r2 <= uR2) {
          // 滴の内側 — 新しい顔料 (縁をわずかに和らげる)
          float core = smoothstep(uR2, uR2 * 0.82, r2);
          vec3 prev = texture(uTarget, vUv).xyz;
          frag = vec4(mix(prev, uPigment, core), 1.0);
        } else {
          // 外側 — 逆写像 p = c + d'·√(1 - R²/|d'|²) で押し出し前の染料を引く
          float f = sqrt(1.0 - uR2 / r2);
          vec2 src = uPoint + (d * f) / vec2(uAspect, 1.0);
          frag = vec4(texture(uTarget, src).xyz, 1.0);
        }
      }`;

		const FS_ADVECT = `
      in vec2 vUv; out vec4 frag;
      uniform sampler2D uVelocity; uniform sampler2D uSource;
      uniform vec2 uTexel; uniform float uDt; uniform float uDissipation;
      void main () {
        vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uTexel;
        frag = vec4(uDissipation * texture(uSource, coord).xyz, 1.0);
      }`;

		// MacCormack 補正 — 前進・後退の往復誤差を打ち消して 2 次精度にする。
		// 半ラグランジュ法の数値拡散で紋様が煙に溶けるのを防ぐ (線が線のまま流れる)。
		// 補正値は後退点近傍の min/max にクランプしてオーバーシュートを抑える。
		const FS_MACCORMACK = `
      in vec2 vUv; out vec4 frag;
      uniform sampler2D uVelocity; uniform sampler2D uSource;  // φ0
      uniform sampler2D uForward;                              // φ1 = A(φ0)
      uniform sampler2D uBack;                                 // φ2 = A⁻¹(φ1)
      uniform vec2 uTexel; uniform vec2 uDyeTexel;
      uniform float uDt; uniform float uDissipation;
      void main () {
        vec3 phi1 = texture(uForward, vUv).xyz;
        vec3 phi0 = texture(uSource, vUv).xyz;
        vec3 phi2 = texture(uBack, vUv).xyz;
        vec3 corrected = phi1 + 0.5 * (phi0 - phi2);
        // 後退点近傍 4 点で挟んでリミット
        vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uTexel;
        vec3 a = texture(uSource, coord + vec2(-uDyeTexel.x, 0.)).xyz;
        vec3 b = texture(uSource, coord + vec2( uDyeTexel.x, 0.)).xyz;
        vec3 c = texture(uSource, coord + vec2(0., -uDyeTexel.y)).xyz;
        vec3 d = texture(uSource, coord + vec2(0.,  uDyeTexel.y)).xyz;
        vec3 lo = min(min(a, b), min(c, d));
        vec3 hi = max(max(a, b), max(c, d));
        frag = vec4(uDissipation * clamp(corrected, lo, hi), 1.0);
      }`;

		const FS_CURL = `
      in vec2 vUv; out vec4 frag;
      uniform sampler2D uVelocity; uniform vec2 uTexel;
      void main () {
        float L = texture(uVelocity, vUv - vec2(uTexel.x, 0.)).y;
        float R = texture(uVelocity, vUv + vec2(uTexel.x, 0.)).y;
        float B = texture(uVelocity, vUv - vec2(0., uTexel.y)).x;
        float T = texture(uVelocity, vUv + vec2(0., uTexel.y)).x;
        frag = vec4(0.5 * (R - L - T + B), 0., 0., 1.);
      }`;

		const FS_VORTICITY = `
      in vec2 vUv; out vec4 frag;
      uniform sampler2D uVelocity; uniform sampler2D uCurl;
      uniform vec2 uTexel; uniform float uCurlStrength; uniform float uDt;
      void main () {
        float L = texture(uCurl, vUv - vec2(uTexel.x, 0.)).x;
        float R = texture(uCurl, vUv + vec2(uTexel.x, 0.)).x;
        float B = texture(uCurl, vUv - vec2(0., uTexel.y)).x;
        float T = texture(uCurl, vUv + vec2(0., uTexel.y)).x;
        float C = texture(uCurl, vUv).x;
        vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
        force /= length(force) + 1e-4;
        force *= uCurlStrength * C * vec2(1., -1.);
        vec2 vel = texture(uVelocity, vUv).xy + force * uDt;
        frag = vec4(clamp(vel, -1000., 1000.), 0., 1.);
      }`;

		const FS_DIVERGENCE = `
      in vec2 vUv; out vec4 frag;
      uniform sampler2D uVelocity; uniform vec2 uTexel;
      void main () {
        float L = texture(uVelocity, vUv - vec2(uTexel.x, 0.)).x;
        float R = texture(uVelocity, vUv + vec2(uTexel.x, 0.)).x;
        float B = texture(uVelocity, vUv - vec2(0., uTexel.y)).y;
        float T = texture(uVelocity, vUv + vec2(0., uTexel.y)).y;
        frag = vec4(0.5 * (R - L + T - B), 0., 0., 1.);
      }`;

		const FS_PRESSURE = `
      in vec2 vUv; out vec4 frag;
      uniform sampler2D uPressure; uniform sampler2D uDivergence; uniform vec2 uTexel;
      void main () {
        float L = texture(uPressure, vUv - vec2(uTexel.x, 0.)).x;
        float R = texture(uPressure, vUv + vec2(uTexel.x, 0.)).x;
        float B = texture(uPressure, vUv - vec2(0., uTexel.y)).x;
        float T = texture(uPressure, vUv + vec2(0., uTexel.y)).x;
        float div = texture(uDivergence, vUv).x;
        frag = vec4((L + R + B + T - div) * 0.25, 0., 0., 1.);
      }`;

		const FS_GRADIENT = `
      in vec2 vUv; out vec4 frag;
      uniform sampler2D uPressure; uniform sampler2D uVelocity; uniform vec2 uTexel;
      void main () {
        float L = texture(uPressure, vUv - vec2(uTexel.x, 0.)).x;
        float R = texture(uPressure, vUv + vec2(uTexel.x, 0.)).x;
        float B = texture(uPressure, vUv - vec2(0., uTexel.y)).x;
        float T = texture(uPressure, vUv + vec2(0., uTexel.y)).x;
        vec2 vel = texture(uVelocity, vUv).xy - 0.5 * vec2(R - L, T - B);
        frag = vec4(vel, 0., 1.);
      }`;

		// ── 表示 — 紙・墨・光をひとつのパスで合成する ─────────────────
		// 紙繊維 (fbm)、墨の擬似 3D 陰影 (密度勾配→法線→拡散+鏡面)、
		// 縁の顔料溜まり、墨下の繊維屈折。すべて染料テクスチャから導出。
		const FS_DISPLAY = `
      in vec2 vUv; out vec4 frag;
      uniform sampler2D uDye;
      uniform vec2 uDyeTexel;
      uniform vec2 uRes;
      uniform float uTime;

      float hash (vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }
      float noise (vec2 p) {
        vec2 i = floor(p), f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x),
                   mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
      }
      float fbm (vec2 p) {
        float v = 0.0, a = 0.5;
        for (int i = 0; i < 3; i++) { v += a * noise(p); p *= 2.13; a *= 0.5; }
        return v;
      }

      // 染料の "高さ" — 薄墨も立ち上がりが見えるよう緩いガンマ
      float heightAt (vec2 uv) {
        vec2 d = texture(uDye, uv).xy;
        return pow(clamp(d.x + d.y, 0.0, 1.6) / 1.6, 0.72);
      }

      void main () {
        vec2 px = vUv * uRes;

        // ── 染料場のサンプリング ──
        vec2 dye = texture(uDye, vUv).xy;
        float sumi = clamp(dye.x, 0.0, 1.4);
        float saku = clamp(dye.y, 0.0, 1.4);
        float density = sumi + saku;

        // 高さ場の勾配 → 法線
        float hC = heightAt(vUv);
        float hX = heightAt(vUv + vec2(uDyeTexel.x, 0.0)) - heightAt(vUv - vec2(uDyeTexel.x, 0.0));
        float hY = heightAt(vUv + vec2(0.0, uDyeTexel.y)) - heightAt(vUv - vec2(0.0, uDyeTexel.y));
        vec3 n = normalize(vec3(-hX * 5.0, -hY * 5.0, 1.0));
        float gradMag = length(vec2(hX, hY));

        // ── 紙 — 墨の厚みでわずかに屈折した繊維 ──
        vec2 refr = vec2(hX, hY) * 14.0;
        vec2 fiberUv = (px + refr) * 0.011;
        float fiber = fbm(fiberUv) * 0.5 + fbm(fiberUv * 3.7 + 13.7) * 0.5;
        vec3 paper = mix(vec3(0.992, 0.988, 0.976), vec3(0.948, 0.941, 0.918), fiber * 0.55);
        // 周辺減光 — ほんのり
        vec2 vc = vUv - 0.5;
        paper *= 1.0 - dot(vc, vc) * 0.14;

        // ── 顔料 ──
        // 朱 #FF2630: 濃い所は深い緋、薄い所は柔らかい珊瑚へ
        vec3 sakuDeep = vec3(0.78, 0.06, 0.10);
        vec3 sakuSoft = vec3(1.0, 0.42, 0.45);
        vec3 sakuCol = mix(sakuSoft, sakuDeep, clamp(saku * 1.4, 0.0, 1.0));
        // 墨: 薄墨は暖かい灰、濃墨はほぼ黒
        vec3 sumiDeep = vec3(0.075, 0.07, 0.085);
        vec3 sumiSoft = vec3(0.52, 0.50, 0.50);
        vec3 sumiCol = mix(sumiSoft, sumiDeep, clamp(sumi * 1.3, 0.0, 1.0));

        float total = max(density, 1e-5);
        vec3 pigment = (sumiCol * sumi + sakuCol * saku) / total;

        // 縁の顔料溜まり — 勾配が立つ輪郭で濃くなる (乾いた滲みの輪)
        float edge = smoothstep(0.012, 0.10, gradMag) * smoothstep(0.7, 0.12, hC);
        pigment *= 1.0 - edge * 0.38;

        // 被覆率 — 滲みの裾は紙が透ける
        float cover = 1.0 - exp(-density * 2.6);
        cover = clamp(cover, 0.0, 0.96);

        // 乗算寄りの吸収合成 (紙に染みる)
        vec3 col = paper * mix(vec3(1.0), pigment, cover);

        // ── 光 — 濡れた墨の盛り上がりに拡散光と細い鏡面 ──
        vec3 L = normalize(vec3(-0.5, 0.62, 0.72));
        float diff = clamp(dot(n, L), 0.0, 1.0);
        col += (diff - 0.62) * 0.05 * cover;          // 起伏の陰影
        vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
        float spec = pow(clamp(dot(n, H), 0.0, 1.0), 48.0);
        col += spec * 0.10 * smoothstep(0.25, 0.9, hC); // 厚い墨だけ濡れて光る

        // 紙の粒 (静的 — ちらつかせない)
        col += (hash(px) - 0.5) * 0.012;

        frag = vec4(col, 1.0);
      }`;

		const progSplat = program(FS_SPLAT);
		const progRadial = program(FS_SPLAT_RADIAL);
		const progDrop = program(FS_DROP);
		const progAdvect = program(FS_ADVECT);
		const progMacCormack = program(FS_MACCORMACK);
		const progCurl = program(FS_CURL);
		const progVorticity = program(FS_VORTICITY);
		const progDivergence = program(FS_DIVERGENCE);
		const progPressure = program(FS_PRESSURE);
		const progGradient = program(FS_GRADIENT);
		const progDisplay = program(FS_DISPLAY);

		// フルスクリーン三角形
		const vao = gl.createVertexArray();
		gl.bindVertexArray(vao);
		const buf = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, buf);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

		type FBO = { fb: WebGLFramebuffer; tex: WebGLTexture; w: number; h: number };
		const createFBO = (w: number, h: number, internal: number): FBO => {
			const tex = gl.createTexture()!;
			gl.bindTexture(gl.TEXTURE_2D, tex);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texStorage2D(gl.TEXTURE_2D, 1, internal, w, h);
			const fb = gl.createFramebuffer()!;
			gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
			gl.clearColor(0, 0, 0, 1);
			gl.clear(gl.COLOR_BUFFER_BIT);
			return { fb, tex, w, h };
		};
		type DoubleFBO = { read: FBO; write: FBO; swap: () => void };
		const createDouble = (w: number, h: number, internal: number): DoubleFBO => {
			let a = createFBO(w, h, internal);
			let b = createFBO(w, h, internal);
			return {
				get read() {
					return a;
				},
				get write() {
					return b;
				},
				swap() {
					const t = a;
					a = b;
					b = t;
				}
			} as DoubleFBO;
		};

		const isCoarse = window.matchMedia('(pointer: coarse)').matches;
		const SIM = isCoarse ? 112 : 160;
		const DYE = isCoarse ? 512 : 1152;
		const PRESSURE_ITERS = isCoarse ? 16 : 24;

		let velocity: DoubleFBO;
		let pressure: DoubleFBO;
		let divergence: FBO;
		let curl: FBO;
		let dye: DoubleFBO;
		let dyeFwd: FBO;
		let dyeBack: FBO;
		let simW = 0,
			simH = 0,
			dyeW = 0,
			dyeH = 0;

		const alloc = () => {
			const aspect = canvas.width / Math.max(1, canvas.height);
			simW = Math.round(SIM * Math.max(1, aspect));
			simH = SIM;
			dyeW = Math.round(DYE * Math.max(1, aspect));
			dyeH = DYE;
			velocity = createDouble(simW, simH, gl.RG16F);
			pressure = createDouble(simW, simH, gl.R16F);
			divergence = createFBO(simW, simH, gl.R16F);
			curl = createFBO(simW, simH, gl.R16F);
			dye = createDouble(dyeW, dyeH, gl.RGBA16F);
			dyeFwd = createFBO(dyeW, dyeH, gl.RGBA16F);
			dyeBack = createFBO(dyeW, dyeH, gl.RGBA16F);
		};

		const resize = () => {
			const w = host.clientWidth;
			const h = host.clientHeight;
			const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
			canvas.width = Math.round(w * dpr);
			canvas.height = Math.round(h * dpr);
			canvas.style.width = `${w}px`;
			canvas.style.height = `${h}px`;
			alloc(); // リサイズで場はリセット (墨は流れ直す)
		};
		resize();

		const uni = (p: WebGLProgram, n: string) => gl.getUniformLocation(p, n);
		const bindTex = (tex: WebGLTexture, unit: number) => {
			gl.activeTexture(gl.TEXTURE0 + unit);
			gl.bindTexture(gl.TEXTURE_2D, tex);
			return unit;
		};
		const blit = (target: FBO | null) => {
			if (target) {
				gl.viewport(0, 0, target.w, target.h);
				gl.bindFramebuffer(gl.FRAMEBUFFER, target.fb);
			} else {
				gl.viewport(0, 0, canvas.width, canvas.height);
				gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			}
			gl.drawArrays(gl.TRIANGLES, 0, 3);
		};

		// ── スプラット ────────────────────────────────────────────
		const aspect = () => canvas.width / Math.max(1, canvas.height);
		const splat = (
			x: number,
			y: number,
			dx: number,
			dy: number,
			ink: number,
			sakura: number,
			radius: number
		) => {
			gl.useProgram(progSplat);
			gl.uniform1f(uni(progSplat, 'uAspect'), aspect());
			if (dx !== 0 || dy !== 0) {
				gl.uniform1i(uni(progSplat, 'uTarget'), bindTex(velocity.read.tex, 0));
				gl.uniform2f(uni(progSplat, 'uPoint'), x, y);
				gl.uniform3f(uni(progSplat, 'uValue'), dx, dy, 0);
				gl.uniform1f(uni(progSplat, 'uRadius'), radius);
				blit(velocity.write);
				velocity.swap();
			}
			if (ink !== 0 || sakura !== 0) {
				gl.uniform1i(uni(progSplat, 'uTarget'), bindTex(dye.read.tex, 0));
				gl.uniform2f(uni(progSplat, 'uPoint'), x, y);
				gl.uniform3f(uni(progSplat, 'uValue'), ink, sakura, 0);
				gl.uniform1f(uni(progSplat, 'uRadius'), radius);
				blit(dye.write);
				dye.swap();
			}
		};

		// 放射状に押し広げる — 墨流しの「次の滴が前の滴を輪にする」力
		const radialPush = (x: number, y: number, strength: number, radius: number) => {
			gl.useProgram(progRadial);
			gl.uniform1i(uni(progRadial, 'uTarget'), bindTex(velocity.read.tex, 0));
			gl.uniform2f(uni(progRadial, 'uPoint'), x, y);
			gl.uniform1f(uni(progRadial, 'uStrength'), strength);
			gl.uniform1f(uni(progRadial, 'uRadius'), radius);
			gl.uniform1f(uni(progRadial, 'uAspect'), aspect());
			blit(velocity.write);
			velocity.swap();
		};

		// 一滴 — drop operator で既存の染料を輪に押し出し、内側に顔料を置く。
		// kind 'water' は透明な滴 (顔料 0) — 墨と交互に落とすと同心円が生まれる。
		const dropAt = (x: number, y: number, kind: InkKind, radius: number) => {
			const pigment: [number, number, number] =
				kind === 'sumi' ? [0.95, 0, 0] : kind === 'sakura' ? [0, 1.0, 0] : [0, 0, 0];
			gl.useProgram(progDrop);
			gl.uniform1i(uni(progDrop, 'uTarget'), bindTex(dye.read.tex, 0));
			gl.uniform2f(uni(progDrop, 'uPoint'), x, y);
			gl.uniform1f(uni(progDrop, 'uR2'), radius * radius);
			gl.uniform3f(uni(progDrop, 'uPigment'), ...pigment);
			gl.uniform1f(uni(progDrop, 'uAspect'), aspect());
			blit(dye.write);
			dye.swap();
			// 滴の余韻 — 表面がわずかに揺れる
			radialPush(x, y, 5, radius * radius * 2.4);
		};
		dropImpl = (x, y, kind, strength = 1) => dropAt(x, 1 - y, kind, 0.05 * strength);

		// ── 1 ステップ ────────────────────────────────────────────
		const step = (dt: number) => {
			gl.disable(gl.BLEND);
			const texel: [number, number] = [1 / simW, 1 / simH];

			gl.useProgram(progCurl);
			gl.uniform1i(uni(progCurl, 'uVelocity'), bindTex(velocity.read.tex, 0));
			gl.uniform2f(uni(progCurl, 'uTexel'), ...texel);
			blit(curl);

			// 渦度は控えめ — 墨流しは粘性の高い層流。乱流にすると紋様が煙に溶ける。
			gl.useProgram(progVorticity);
			gl.uniform1i(uni(progVorticity, 'uVelocity'), bindTex(velocity.read.tex, 0));
			gl.uniform1i(uni(progVorticity, 'uCurl'), bindTex(curl.tex, 1));
			gl.uniform2f(uni(progVorticity, 'uTexel'), ...texel);
			gl.uniform1f(uni(progVorticity, 'uCurlStrength'), 7);
			gl.uniform1f(uni(progVorticity, 'uDt'), dt);
			blit(velocity.write);
			velocity.swap();

			gl.useProgram(progDivergence);
			gl.uniform1i(uni(progDivergence, 'uVelocity'), bindTex(velocity.read.tex, 0));
			gl.uniform2f(uni(progDivergence, 'uTexel'), ...texel);
			blit(divergence);

			gl.useProgram(progPressure);
			gl.uniform2f(uni(progPressure, 'uTexel'), ...texel);
			for (let i = 0; i < PRESSURE_ITERS; i++) {
				gl.uniform1i(uni(progPressure, 'uPressure'), bindTex(pressure.read.tex, 0));
				gl.uniform1i(uni(progPressure, 'uDivergence'), bindTex(divergence.tex, 1));
				blit(pressure.write);
				pressure.swap();
			}

			gl.useProgram(progGradient);
			gl.uniform1i(uni(progGradient, 'uPressure'), bindTex(pressure.read.tex, 0));
			gl.uniform1i(uni(progGradient, 'uVelocity'), bindTex(velocity.read.tex, 1));
			gl.uniform2f(uni(progGradient, 'uTexel'), ...texel);
			blit(velocity.write);
			velocity.swap();

			// 速度の移流 — 半ラグランジュのまま (速度がなまる = 粘性として働く)
			gl.useProgram(progAdvect);
			gl.uniform2f(uni(progAdvect, 'uTexel'), ...texel);
			gl.uniform1f(uni(progAdvect, 'uDt'), dt);
			gl.uniform1f(uni(progAdvect, 'uDissipation'), 0.992);
			gl.uniform1i(uni(progAdvect, 'uVelocity'), bindTex(velocity.read.tex, 0));
			gl.uniform1i(uni(progAdvect, 'uSource'), bindTex(velocity.read.tex, 0));
			blit(velocity.write);
			velocity.swap();

			// 染料の移流 — MacCormack (前進 → 後退 → 補正)。紋様の線を保つ。
			gl.uniform1f(uni(progAdvect, 'uDissipation'), 1.0);
			gl.uniform1i(uni(progAdvect, 'uVelocity'), bindTex(velocity.read.tex, 0));
			gl.uniform1i(uni(progAdvect, 'uSource'), bindTex(dye.read.tex, 1));
			blit(dyeFwd);
			gl.uniform1f(uni(progAdvect, 'uDt'), -dt);
			gl.uniform1i(uni(progAdvect, 'uSource'), bindTex(dyeFwd.tex, 1));
			blit(dyeBack);

			gl.useProgram(progMacCormack);
			gl.uniform1i(uni(progMacCormack, 'uVelocity'), bindTex(velocity.read.tex, 0));
			gl.uniform1i(uni(progMacCormack, 'uSource'), bindTex(dye.read.tex, 1));
			gl.uniform1i(uni(progMacCormack, 'uForward'), bindTex(dyeFwd.tex, 2));
			gl.uniform1i(uni(progMacCormack, 'uBack'), bindTex(dyeBack.tex, 3));
			gl.uniform2f(uni(progMacCormack, 'uTexel'), ...texel);
			gl.uniform2f(uni(progMacCormack, 'uDyeTexel'), 1 / dyeW, 1 / dyeH);
			gl.uniform1f(uni(progMacCormack, 'uDt'), dt);
			gl.uniform1f(uni(progMacCormack, 'uDissipation'), 0.9996);
			blit(dye.write);
			dye.swap();
		};

		let startTime = performance.now();
		const render = () => {
			gl.useProgram(progDisplay);
			gl.uniform1i(uni(progDisplay, 'uDye'), bindTex(dye.read.tex, 0));
			gl.uniform2f(uni(progDisplay, 'uDyeTexel'), 1 / dyeW, 1 / dyeH);
			gl.uniform2f(uni(progDisplay, 'uRes'), canvas.width, canvas.height);
			gl.uniform1f(uni(progDisplay, 'uTime'), (performance.now() - startTime) / 1000);
			gl.disable(gl.BLEND);
			blit(null);
		};

		// ── 演出: 墨流しの所作 ────────────────────────────────────
		// 本物の手順そのまま — 同じ点に墨と水を交互に落とすと、drop operator が
		// 既存の輪を押し広げ、同心円の的 (まと) が育つ。育ったら風で紋様に流す。
		const revealTimers: ReturnType<typeof setTimeout>[] = [];
		const later = (ms: number, fn: () => void, instant: boolean) => {
			if (instant) fn();
			else revealTimers.push(setTimeout(fn, ms));
		};
		const reveal = (instant = false) => {
			// 縦画面では的を小さく・低い位置に (タイポと紙面を取り合わない)
			const portrait = canvas.height > canvas.width;
			const mainC = portrait ? { x: 0.56, y: 0.46, r: 0.03 } : { x: 0.61, y: 0.31, r: 0.052 };
			const sideC = portrait ? { x: 0.2, y: 0.3, r: 0.02 } : { x: 0.28, y: 0.7, r: 0.034 };
			// 主の的 — 右中央上の余白。タイポを避けつつ画面の主役になる大きさへ。
			const main: Array<InkKind> = [
				'sumi',
				'water',
				'sumi',
				'water',
				'sakura',
				'water',
				'sumi',
				'water',
				'sumi',
				'water',
				'sakura',
				'water',
				'sumi',
				'water'
			];
			const mainN = portrait ? 10 : main.length;
			main.slice(0, mainN).forEach((kind, i) => {
				later(
					250 + i * 235,
					() => {
						const jx = (Math.random() - 0.5) * 0.012;
						const jy = (Math.random() - 0.5) * 0.012;
						dropAt(mainC.x + jx, 1 - mainC.y + jy, kind, mainC.r + Math.random() * 0.012);
					},
					instant
				);
			});
			// 脇の的 — 小ぶりに。朱を主役にした輪。
			const side: Array<InkKind> = ['sakura', 'water', 'sumi', 'water', 'sakura', 'water'];
			side.forEach((kind, i) => {
				later(
					1100 + i * 300,
					() => {
						const jx = (Math.random() - 0.5) * 0.01;
						const jy = (Math.random() - 0.5) * 0.01;
						dropAt(sideC.x + jx, 1 - sideC.y + jy, kind, sideC.r + Math.random() * 0.008);
					},
					instant
				);
			});
			// 風 — 広く弱い層流で的をうねらせる。強いと紋様が溶ける。
			const wind = (t: number) => {
				const y = 1 - (mainC.y + Math.sin(t * 5.2) * 0.1 + t * 0.14 - 0.02);
				splat(0.08 + t * 0.86, y, 5 + t * 3, Math.sin(t * 7.0) * 2.2, 0, 0, 0.035);
			};
			for (let i = 0; i < 10; i++) {
				later(4200 + i * 110, () => wind(i / 9), instant);
			}
		};

		// 環境 — 無操作でも場が静かに呼吸する。
		// 滴は中央帯に限定 (隅のタイポを墨で潰さない)。
		let lastAmbient = 0;
		let ambientCount = 0;
		const ambient = (now: number) => {
			if (now - lastAmbient < 3200) return;
			lastAmbient = now;
			ambientCount++;
			if (ambientCount % 3 === 0) {
				const x = 0.3 + Math.random() * 0.45;
				const y = 1 - (0.25 + Math.random() * 0.35);
				const kind: InkKind =
					ambientCount % 9 === 0 ? 'sakura' : ambientCount % 2 === 0 ? 'water' : 'sumi';
				dropAt(x, y, kind, 0.016 + Math.random() * 0.02);
			} else {
				// 普段はそっと掻くだけ — 広く弱い流れ
				const x = 0.1 + Math.random() * 0.8;
				const y = 0.15 + Math.random() * 0.7;
				const ang = Math.random() * Math.PI * 2;
				const v = 1.2 + Math.random() * 1.6;
				splat(x, y, Math.cos(ang) * v, Math.sin(ang) * v, 0, 0, 0.016);
			}
		};

		// ── ポインタ ──────────────────────────────────────────────
		const pointer = { x: 0, y: 0, px: 0, py: 0, moved: false };
		const toUv = (e: PointerEvent) => {
			const r = canvas.getBoundingClientRect();
			return [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height] as const;
		};
		const onMove = (e: PointerEvent) => {
			const [x, y] = toUv(e);
			pointer.px = pointer.moved ? pointer.x : x;
			pointer.py = pointer.moved ? pointer.y : y;
			pointer.x = x;
			pointer.y = y;
			pointer.moved = true;
		};
		let clickCount = 0;
		const clickTimers: ReturnType<typeof setTimeout>[] = [];
		const onDown = (e: PointerEvent) => {
			const [x, y] = toUv(e);
			clickCount++;
			// 一回のタップで小さな的を打つ — 墨 (たまに朱) → 水 → 墨 の三滴。
			const lead: InkKind = clickCount % 3 === 0 ? 'sakura' : 'sumi';
			const seq: Array<[number, InkKind, number]> = [
				[0, lead, 0.034],
				[150, 'water', 0.027],
				[300, lead === 'sakura' ? 'sumi' : 'sakura', 0.018]
			];
			for (const [ms, kind, r] of seq) {
				clickTimers.push(setTimeout(() => dropAt(x, y, kind, r), ms));
			}
		};
		// タイポ DOM が上に重なるため、ヒーローセクション全体で拾う
		const listenEl: HTMLElement = (host.closest('section') as HTMLElement) ?? host;
		listenEl.addEventListener('pointermove', onMove, { passive: true });
		listenEl.addEventListener('pointerdown', onDown, { passive: true });

		const drainPointer = () => {
			if (!pointer.moved) return;
			pointer.moved = false;
			const dx = (pointer.x - pointer.px) * 120;
			const dy = (pointer.y - pointer.py) * 120;
			const speed = Math.hypot(dx, dy);
			if (speed < 0.4) return;
			// 掻く — 染料は足さない。広く弱い層流で既存の紋様を曳くだけ。
			splat(pointer.x, pointer.y, dx, dy, 0, 0, 0.009);
		};

		// ── ループ ────────────────────────────────────────────────
		if (prefersReduced) {
			reveal(true);
			for (let i = 0; i < 60; i++) step(1 / 60);
			render();
			return () => {
				listenEl.removeEventListener('pointermove', onMove);
				listenEl.removeEventListener('pointerdown', onDown);
				dropImpl = null;
			};
		}
		reveal();

		let raf = 0;
		let last = performance.now();
		let running = false;
		const loop = (now: number) => {
			raf = requestAnimationFrame(loop);
			const dt = Math.min(1 / 30, (now - last) / 1000);
			last = now;
			drainPointer();
			ambient(now);
			step(dt);
			render();
		};
		const start = () => {
			if (running) return;
			running = true;
			last = performance.now();
			raf = requestAnimationFrame(loop);
		};
		const stop = () => {
			if (!running) return;
			running = false;
			cancelAnimationFrame(raf);
		};
		const io = new IntersectionObserver((es) => {
			for (const e of es) {
				if (e.isIntersecting) start();
				else stop();
			}
		});
		io.observe(host);
		const onVisibility = () => {
			if (document.hidden) stop();
			else start();
		};
		document.addEventListener('visibilitychange', onVisibility);

		let resizeTimer: ReturnType<typeof setTimeout> | null = null;
		const onResize = () => {
			if (resizeTimer) clearTimeout(resizeTimer);
			resizeTimer = setTimeout(() => {
				resize();
				reveal();
			}, 180);
		};
		window.addEventListener('resize', onResize);

		return () => {
			stop();
			for (const t of revealTimers) clearTimeout(t);
			for (const t of clickTimers) clearTimeout(t);
			io.disconnect();
			document.removeEventListener('visibilitychange', onVisibility);
			window.removeEventListener('resize', onResize);
			listenEl.removeEventListener('pointermove', onMove);
			listenEl.removeEventListener('pointerdown', onDown);
			dropImpl = null;
			gl.getExtension('WEBGL_lose_context')?.loseContext();
		};
	});
</script>

<div bind:this={host} class="absolute inset-0 bg-cream-100">
	<canvas bind:this={canvas} class="absolute inset-0" aria-hidden="true"></canvas>
</div>
