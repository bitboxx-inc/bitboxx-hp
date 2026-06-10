<script lang="ts">
  /**
   * 墨流しの流体シミュレーション (GPU / WebGL2)。
   * Jos Stam の Stable Fluids を半精度テクスチャのピンポンで解く:
   *   速度場 → 渦度強化 → 発散 → 圧力 (Jacobi) → 投影 → 染料移流
   * 染料は 2 チャンネル (R = 墨, G = サクラ)。紙色に減算合成して描く。
   * ポインタが速度と墨を注入し、放っておいても環境スプラットで生き続ける。
   * WebGL2 が無い環境ではただの紙 (透明) に退化する。
   */
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let host: HTMLDivElement;

  onMount(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const gl = canvas.getContext('webgl2', {
      alpha: true,
      depth: false,
      stencil: false,
      antialias: false,
      preserveDrawingBuffer: false
    }) as WebGL2RenderingContext | null;
    if (!gl) return; // 退化: 紙のまま
    if (!gl.getExtension('EXT_color_buffer_float')) return;

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
      gl.attachShader(p, compile(gl.FRAGMENT_SHADER, `#version 300 es\nprecision highp float;\n${fsSrc}`));
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS)) console.error(gl.getProgramInfoLog(p));
      return p;
    };

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

    const FS_ADVECT = `
      in vec2 vUv; out vec4 frag;
      uniform sampler2D uVelocity; uniform sampler2D uSource;
      uniform vec2 uTexel; uniform float uDt; uniform float uDissipation;
      void main () {
        vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy * uTexel;
        frag = vec4(uDissipation * texture(uSource, coord).xyz, 1.0);
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

    // 紙への合成 — 顔料は常に原色、濃度はアルファだけが運ぶ
    // (色と α の両方を濃度で割ると薄墨が二乗で消えてしまう)。
    const FS_DISPLAY = `
      in vec2 vUv; out vec4 frag;
      uniform sampler2D uDye;
      void main () {
        vec3 dye = texture(uDye, vUv).xyz;
        float inkD = clamp(dye.x, 0.0, 1.0);
        float sakD = clamp(dye.y, 0.0, 1.0);
        float total = inkD + sakD;
        vec3 hue = total < 1e-4
          ? vec3(0.067, 0.063, 0.078)
          : (inkD * vec3(0.067, 0.063, 0.078) + sakD * vec3(1.0, 0.149, 0.188)) / total;
        float a = clamp(total * 1.7, 0.0, 0.92);
        frag = vec4(hue, a);
      }`;

    const progSplat = program(FS_SPLAT);
    const progAdvect = program(FS_ADVECT);
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
    const createFBO = (w: number, h: number, internal: number, format: number): FBO => {
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
      void format;
      return { fb, tex, w, h };
    };
    type DoubleFBO = { read: FBO; write: FBO; swap: () => void };
    const createDouble = (w: number, h: number, internal: number, format: number): DoubleFBO => {
      let a = createFBO(w, h, internal, format);
      let b = createFBO(w, h, internal, format);
      return {
        get read() { return a; },
        get write() { return b; },
        swap() { const t = a; a = b; b = t; }
      } as DoubleFBO;
    };

    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    const SIM = isCoarse ? 96 : 144;
    const DYE = isCoarse ? 480 : 840;
    const PRESSURE_ITERS = isCoarse ? 14 : 22;

    let velocity: DoubleFBO;
    let pressure: DoubleFBO;
    let divergence: FBO;
    let curl: FBO;
    let dye: DoubleFBO;
    let simW = 0, simH = 0, dyeW = 0, dyeH = 0;

    const alloc = () => {
      const aspect = canvas.width / Math.max(1, canvas.height);
      simW = Math.round(SIM * Math.max(1, aspect));
      simH = SIM;
      dyeW = Math.round(DYE * Math.max(1, aspect));
      dyeH = DYE;
      velocity = createDouble(simW, simH, gl.RG16F, gl.RG);
      pressure = createDouble(simW, simH, gl.R16F, gl.RED);
      divergence = createFBO(simW, simH, gl.R16F, gl.RED);
      curl = createFBO(simW, simH, gl.R16F, gl.RED);
      dye = createDouble(dyeW, dyeH, gl.RGBA16F, gl.RGBA);
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
    const splat = (x: number, y: number, dx: number, dy: number, ink: number, sakura: number, radius: number) => {
      // 速度
      gl.useProgram(progSplat);
      gl.uniform1i(uni(progSplat, 'uTarget'), bindTex(velocity.read.tex, 0));
      gl.uniform2f(uni(progSplat, 'uPoint'), x, y);
      gl.uniform3f(uni(progSplat, 'uValue'), dx, dy, 0);
      gl.uniform1f(uni(progSplat, 'uRadius'), radius);
      gl.uniform1f(uni(progSplat, 'uAspect'), aspect());
      blit(velocity.write);
      velocity.swap();
      // 染料
      gl.uniform1i(uni(progSplat, 'uTarget'), bindTex(dye.read.tex, 0));
      gl.uniform3f(uni(progSplat, 'uValue'), ink, sakura, 0);
      blit(dye.write);
      dye.swap();
    };

    // ── 1 ステップ ────────────────────────────────────────────
    const step = (dt: number) => {
      gl.disable(gl.BLEND);
      const texel: [number, number] = [1 / simW, 1 / simH];

      gl.useProgram(progCurl);
      gl.uniform1i(uni(progCurl, 'uVelocity'), bindTex(velocity.read.tex, 0));
      gl.uniform2f(uni(progCurl, 'uTexel'), ...texel);
      blit(curl);

      gl.useProgram(progVorticity);
      gl.uniform1i(uni(progVorticity, 'uVelocity'), bindTex(velocity.read.tex, 0));
      gl.uniform1i(uni(progVorticity, 'uCurl'), bindTex(curl.tex, 1));
      gl.uniform2f(uni(progVorticity, 'uTexel'), ...texel);
      gl.uniform1f(uni(progVorticity, 'uCurlStrength'), 26);
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

      gl.useProgram(progAdvect);
      gl.uniform2f(uni(progAdvect, 'uTexel'), ...texel);
      gl.uniform1f(uni(progAdvect, 'uDt'), dt);
      gl.uniform1f(uni(progAdvect, 'uDissipation'), 0.992);
      gl.uniform1i(uni(progAdvect, 'uVelocity'), bindTex(velocity.read.tex, 0));
      gl.uniform1i(uni(progAdvect, 'uSource'), bindTex(velocity.read.tex, 0));
      blit(velocity.write);
      velocity.swap();

      gl.uniform1f(uni(progAdvect, 'uDissipation'), 0.9925);
      gl.uniform1i(uni(progAdvect, 'uVelocity'), bindTex(velocity.read.tex, 0));
      gl.uniform1i(uni(progAdvect, 'uSource'), bindTex(dye.read.tex, 1));
      blit(dye.write);
      dye.swap();
    };

    const render = () => {
      gl.useProgram(progDisplay);
      gl.uniform1i(uni(progDisplay, 'uDye'), bindTex(dye.read.tex, 0));
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.clearColor(0, 0, 0, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      blit(null);
    };

    // ── 演出: 立ち上がりの墨入れ ─────────────────────────────
    // 見出し帯 (y ≈ 0.42) を左から右へ、筆を引くように時間差で墨が走る。
    // ひとつだけサクラが差す。
    let splatCounter = 0;
    const revealTimers: ReturnType<typeof setTimeout>[] = [];
    const reveal = (instant = false) => {
      const steps = 14;
      for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        const fire = () => {
          const x = 0.08 + t * 0.84;
          const y = 0.40 + Math.sin(t * Math.PI * 2.2) * 0.07;
          const sakura = i === 9 ? 0.6 : 0;
          splat(x, 1 - y, 12 + t * 4, (Math.random() - 0.5) * 3, sakura ? 0.08 : 0.5, sakura, 0.0035);
        };
        if (instant) fire();
        else revealTimers.push(setTimeout(fire, 350 + i * 55));
      }
    };

    // 環境スプラット — 無操作でも墨がゆっくり呼吸する
    let lastAmbient = 0;
    const ambient = (now: number) => {
      if (now - lastAmbient < 1700) return;
      lastAmbient = now;
      splatCounter++;
      const x = 0.12 + Math.random() * 0.76;
      const y = 0.15 + Math.random() * 0.7;
      const ang = Math.random() * Math.PI * 2;
      const v = 2.5 + Math.random() * 4;
      const sakura = splatCounter % 6 === 0 ? 0.16 : 0;
      splat(x, y, Math.cos(ang) * v, Math.sin(ang) * v, sakura ? 0.03 : 0.2, sakura, 0.0022);
    };

    // ── ポインタ ──────────────────────────────────────────────
    const pointer = { x: 0, y: 0, px: 0, py: 0, down: false, moved: false };
    const toUv = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      return [ (e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height ] as const;
    };
    const onMove = (e: PointerEvent) => {
      const [x, y] = toUv(e);
      pointer.px = pointer.moved ? pointer.x : x;
      pointer.py = pointer.moved ? pointer.y : y;
      pointer.x = x;
      pointer.y = y;
      pointer.moved = true;
    };
    const onDown = (e: PointerEvent) => {
      const [x, y] = toUv(e);
      splatCounter++;
      const sakura = splatCounter % 5 === 0 ? 0.5 : 0;
      splat(x, y, (Math.random() - 0.5) * 14, (Math.random() - 0.5) * 14, sakura ? 0.04 : 0.5, sakura, 0.0028);
    };
    // 上に three.js のレイヤが重なるため、ヒーローのセクション全体で拾う
    const listenEl: HTMLElement = (host.closest('section') as HTMLElement) ?? host;
    listenEl.addEventListener('pointermove', onMove, { passive: true });
    listenEl.addEventListener('pointerdown', onDown, { passive: true });

    const drainPointer = () => {
      if (!pointer.moved) return;
      pointer.moved = false;
      const dx = (pointer.x - pointer.px) * 220;
      const dy = (pointer.y - pointer.py) * 220;
      const speed = Math.hypot(dx, dy);
      if (speed < 0.4) return;
      splatCounter++;
      const sakura = splatCounter % 24 === 0 ? 0.05 : 0;
      const ink = Math.min(0.5, 0.05 + speed * 0.012);
      splat(pointer.x, pointer.y, dx, dy, ink, sakura, 0.0024);
    };

    // ── ループ ────────────────────────────────────────────────
    if (prefersReduced) {
      // 静止画: 即時に墨を入れ、数ステップだけ流して止める
      reveal(true);
      for (let i = 0; i < 36; i++) step(1 / 60);
      render();
      return () => {
        listenEl.removeEventListener('pointermove', onMove);
        listenEl.removeEventListener('pointerdown', onDown);
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
      io.disconnect();
      window.removeEventListener('resize', onResize);
      listenEl.removeEventListener('pointermove', onMove);
      listenEl.removeEventListener('pointerdown', onDown);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  });
</script>

<div bind:this={host} class="absolute inset-0">
  <canvas bind:this={canvas} class="absolute inset-0" aria-hidden="true"></canvas>
</div>
