<script lang="ts" context="module">
	export type OrreryItem = {
		id: string;
		label: string; // 和文
		en: string; // 欧文ラベル
		r: number; // 軌道半径
		phase: number; // 軌道上の初期位相 (deg)
	};
</script>

<script lang="ts">
	/**
	 * Orrery — 3 次元グリッド空間に項目を太陽系のように配置した、自作のワイヤーフレーム描画系。
	 *
	 * three.js は使わず、Canvas2D に手書きの透視投影 (vec3 → 回転 → 1/z 射影) を載せている。
	 * これは「ありきたりな 3D ライブラリのツヤ」を避け、製図図面のような幾何で空間を出すため。
	 *
	 * 一つの意味ある数値 = 創業日 (2024-04-25) からの経過日数 `day` を、
	 *   - HUD のモノスペース数字
	 *   - 系全体の基準回転位相 (day をラジアンへ)
	 *   - 遠景の星の数
	 * という別々の形で同時に表現する。数値に意味を持たせ、違う形で出す。
	 *
	 * 操作: スクロール / 横ドラッグ / ←→ で隣の惑星が手前に回り込む (focus)。
	 *       手前の惑星はラベルが実 DOM ボタンになり、クリック / Enter で「着陸」。
	 *       着陸はカメラがその惑星へ急接近し、'select' を上位へ送る。
	 */
	import { createEventDispatcher, onMount } from 'svelte';

	export let items: OrreryItem[] = [];
	/** 創業日 — 意味の源泉 */
	export let foundedISO = '2024-04-25';

	const dispatch = createEventDispatcher<{ select: string; focus: string }>();

	let host: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let labelEls: HTMLButtonElement[] = [];
	let sunEl: HTMLAnchorElement;

	let day = 0; // 創業からの経過日数 (HUD 表示にも使う)
	let focusIndex = 0;

	// ── 公開メソッド (上位がバインドして使う) ───────────────────
	let api: {
		leave: () => void;
		focusTo: (id: string) => void;
	} = { leave: () => {}, focusTo: () => {} };
	export function leave() {
		api.leave();
	}
	export function focusTo(id: string) {
		api.focusTo(id);
	}

	type V3 = { x: number; y: number; z: number };

	onMount(() => {
		const ctx = canvas.getContext('2d')!;
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		// ── 意味ある数値 ──
		const founded = new Date(foundedISO + 'T00:00:00+09:00').getTime();
		day = Math.max(0, Math.floor((Date.now() - founded) / 86400000));
		const STAR_COUNT = 90 + (day % 60); // 星の数 = day の別の形
		const dayPhase = (day % 360) * (Math.PI / 180); // 基準位相 = day の別の形

		// ── カメラ ── 系を斜め上から見下ろす 3/4 ビュー
		const CAM0: V3 = { x: 0, y: 4.0, z: -10.6 };
		const PITCH0 = 0.42;
		const cam = { ...CAM0, pitch: PITCH0, yaw: 0, focal: 900, near: 0.25 };
		let focalBase = 900;

		// ── 入力状態 ──
		let mx = 0,
			my = 0; // 正規化カーソル [-1,1]
		let masterTarget = 0,
			master = 0; // 系の基準回転 (focus を手前へ運ぶ)
		let dragging = false,
			dragStartX = 0,
			dragBase = 0,
			dragOffset = 0;
		let wheelAcc = 0;

		// approach (着陸) アニメーション
		let approach: { active: boolean; t: number; target: V3 } = {
			active: false,
			t: 0,
			target: { x: 0, y: 0, z: 0 }
		};

		const TAU = Math.PI * 2;
		const norm = (a: number) => {
			while (a > Math.PI) a -= TAU;
			while (a < -Math.PI) a += TAU;
			return a;
		};
		const snap = (i: number) => -Math.PI / 2 - (items[i].phase * Math.PI) / 180 + dayPhase;

		const setFocus = (i: number, announce = true) => {
			focusIndex = ((i % items.length) + items.length) % items.length;
			if (announce) dispatch('focus', items[focusIndex].id);
		};

		// ── 投影 ──
		const project = (p: V3, W: number, H: number) => {
			let x = p.x - cam.x,
				y = p.y - cam.y,
				z = p.z - cam.z;
			const cyaw = Math.cos(cam.yaw),
				syaw = Math.sin(cam.yaw);
			const x1 = cyaw * x - syaw * z;
			const z1 = syaw * x + cyaw * z;
			const cp = Math.cos(cam.pitch),
				sp = Math.sin(cam.pitch);
			// 正のピッチ = 見下ろし
			const y1 = cp * y + sp * z1;
			const z2 = -sp * y + cp * z1;
			if (z2 <= cam.near) return null;
			const s = cam.focal / z2;
			return { x: W / 2 + x1 * s, y: H / 2 - y1 * s, s, z: z2 };
		};

		// ── 回転ヘルパ ──
		const rotY = (v: V3, a: number): V3 => {
			const c = Math.cos(a),
				s = Math.sin(a);
			return { x: c * v.x + s * v.z, y: v.y, z: -s * v.x + c * v.z };
		};
		const rotX = (v: V3, a: number): V3 => {
			const c = Math.cos(a),
				s = Math.sin(a);
			return { x: v.x, y: c * v.y - s * v.z, z: s * v.y + c * v.z };
		};

		// 惑星本体 = ワイヤー八面体
		const OCTA: V3[] = [
			{ x: 1, y: 0, z: 0 },
			{ x: -1, y: 0, z: 0 },
			{ x: 0, y: 1, z: 0 },
			{ x: 0, y: -1, z: 0 },
			{ x: 0, y: 0, z: 1 },
			{ x: 0, y: 0, z: -1 }
		];
		const OCTA_E = [
			[0, 2],
			[0, 3],
			[0, 4],
			[0, 5],
			[1, 2],
			[1, 3],
			[1, 4],
			[1, 5],
			[2, 4],
			[2, 5],
			[3, 4],
			[3, 5]
		];

		// 星 (遠景) — day の数だけ、球殻にばらまく
		const stars: V3[] = [];
		for (let i = 0; i < STAR_COUNT; i++) {
			// 決定的分布 (Math.random は使わない: リロードで星が踊らない)
			const a = i * 2.399963229; // 黄金角
			const yy = 1 - (i / (STAR_COUNT - 1)) * 2;
			const rr = Math.sqrt(Math.max(0, 1 - yy * yy));
			const rad = 18 + ((i * 7) % 13);
			stars.push({ x: Math.cos(a) * rr * rad, y: yy * rad * 0.55, z: Math.sin(a) * rr * rad });
		}

		// 惑星のワールド座標 (現在の master で)
		const planetPos = (i: number): V3 => {
			const ang = (items[i].phase * Math.PI) / 180 + master;
			return { x: Math.cos(ang) * items[i].r, y: 0, z: Math.sin(ang) * items[i].r };
		};

		// ── サイズ ──
		let W = 0,
			H = 0,
			dpr = 1;
		const resize = () => {
			W = host.clientWidth;
			H = host.clientHeight;
			dpr = Math.min(window.devicePixelRatio || 1, 2);
			canvas.width = Math.round(W * dpr);
			canvas.height = Math.round(H * dpr);
			canvas.style.width = W + 'px';
			canvas.style.height = H + 'px';
			// 最外周の軌道が画面幅に収まる焦点距離。狭い画面ほど寄る。
			focalBase = W * (W < 720 ? 0.92 : 0.6);
			cam.focal = focalBase;
		};
		resize();

		const INK = '17,16,20';
		const SAKURA = '255,38,48';

		const line = (
			a: { x: number; y: number } | null,
			b: { x: number; y: number } | null,
			col: string,
			w = 1
		) => {
			if (!a || !b) return;
			ctx.strokeStyle = col;
			ctx.lineWidth = w;
			ctx.beginPath();
			ctx.moveTo(a.x, a.y);
			ctx.lineTo(b.x, b.y);
			ctx.stroke();
		};

		// ── 描画 ──
		const draw = (time: number) => {
			ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
			ctx.clearRect(0, 0, W, H);

			// 着陸の進行度 (カメラ急接近)
			let appE = 0;
			if (approach.active) {
				const e = Math.min(1, approach.t);
				appE = e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2; // easeInOutCubic
				cam.x = CAM0.x + (approach.target.x - CAM0.x) * appE * 0.92;
				cam.y = CAM0.y + (approach.target.y + 1.0 - CAM0.y) * appE * 0.92;
				cam.z = CAM0.z + (approach.target.z - 1.2 - CAM0.z) * appE * 0.97;
				cam.focal = focalBase * (1 + appE * 2.6);
			} else {
				cam.x = mx * 0.5;
				cam.y = CAM0.y;
				cam.z = CAM0.z;
				cam.yaw = mx * 0.04;
				cam.pitch = PITCH0 + my * 0.04;
				cam.focal = focalBase;
			}

			// 1) 星
			const starRot = time * 0.000012;
			for (const s of stars) {
				const p = project(rotY(s, starRot), W, H);
				if (!p) continue;
				const o = Math.min(0.28, (p.s / cam.focal) * 7);
				ctx.fillStyle = `rgba(${INK},${o.toFixed(3)})`;
				const r = Math.max(0.6, p.s * 0.004);
				ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
			}

			// 2) 黄道面の格子 — 点群 (3 次元グリッド空間)。線にすると地平で縞になるので点で。
			const G = 9;
			for (let gx = -G; gx <= G; gx++) {
				for (let gz = -G; gz <= G; gz++) {
					const p = project({ x: gx, y: 0, z: gz }, W, H);
					if (!p) continue;
					const rad = Math.hypot(gx, gz);
					const fade = 1 - Math.min(1, rad / (G + 1));
					const o = (0.04 + fade * 0.1) * (1 - appE);
					if (o < 0.012) continue;
					ctx.fillStyle = `rgba(${INK},${o.toFixed(3)})`;
					const r = Math.max(0.6, p.s * 0.0016);
					ctx.fillRect(p.x - r, p.y - r, r * 2, r * 2);
				}
			}

			// 3) 軌道リング
			items.forEach((it, i) => {
				const focused = i === focusIndex;
				const o = (focused ? 0.32 : 0.13) * (1 - appE);
				ctx.strokeStyle = focused
					? `rgba(${SAKURA},${o.toFixed(3)})`
					: `rgba(${INK},${o.toFixed(3)})`;
				ctx.lineWidth = focused ? 1.3 : 1;
				ctx.beginPath();
				let started = false;
				for (let a = 0; a <= 64; a++) {
					const ang = (a / 64) * TAU;
					const p = project({ x: Math.cos(ang) * it.r, y: 0, z: Math.sin(ang) * it.r }, W, H);
					if (!p) {
						started = false;
						continue;
					}
					if (!started) {
						ctx.moveTo(p.x, p.y);
						started = true;
					} else ctx.lineTo(p.x, p.y);
				}
				ctx.stroke();
			});

			// 4) 太陽 (ジャイロスコープ = 3 直交円) + 中心
			const sunR = 0.62;
			const sa = time * 0.00018;
			const planes: Array<(v: V3) => V3> = [
				(v) => rotY(v, sa),
				(v) => rotX(rotY(v, sa), Math.PI / 2),
				(v) => rotY(rotX(v, Math.PI / 2 + sa * 0.6), sa)
			];
			ctx.strokeStyle = `rgba(${INK},${(0.5 * (1 - appE)).toFixed(3)})`;
			ctx.lineWidth = 1.1;
			for (const tf of planes) {
				ctx.beginPath();
				let started = false;
				for (let a = 0; a <= 48; a++) {
					const ang = (a / 48) * TAU;
					const v = tf({ x: Math.cos(ang) * sunR, y: Math.sin(ang) * sunR, z: 0 });
					const p = project(v, W, H);
					if (!p) {
						started = false;
						continue;
					}
					if (!started) {
						ctx.moveTo(p.x, p.y);
						started = true;
					} else ctx.lineTo(p.x, p.y);
				}
				ctx.stroke();
			}
			const sunP = project({ x: 0, y: 0, z: 0 }, W, H);
			if (sunP) {
				ctx.fillStyle = `rgba(${SAKURA},${(0.9 * (1 - appE)).toFixed(3)})`;
				ctx.beginPath();
				ctx.arc(sunP.x, sunP.y, Math.max(2, sunP.s * 0.01), 0, TAU);
				ctx.fill();
				if (sunEl) {
					sunEl.style.transform = `translate(-50%,-50%) translate(${sunP.x}px,${sunP.y + sunP.s * 0.085}px)`;
					sunEl.style.opacity = String(Math.max(0, 1 - appE * 2.2));
				}
			}

			// 5) 惑星 (奥から順に)
			const order = items
				.map((_, i) => i)
				.sort((a, b) => project(planetPos(b), W, H)!.z - project(planetPos(a), W, H)!.z);
			for (const i of order) {
				const wp = planetPos(i);
				const center = project(wp, W, H);
				if (!center) {
					if (labelEls[i]) labelEls[i].style.opacity = '0';
					continue;
				}
				const focused = i === focusIndex;
				const baseR = focused ? 0.3 : 0.17;
				const spin = time * 0.0004 + i;
				const col = focused ? SAKURA : INK;
				const depthO = Math.min(1, (center.s / cam.focal) * 11);
				const bodyO =
					(focused ? 0.95 : 0.3 + 0.45 * depthO) *
					(1 - (approach.active && i !== focusIndex ? appE : 0));

				// 八面体
				const pts = OCTA.map((v) => {
					let r = rotY({ x: v.x * baseR, y: v.y * baseR, z: v.z * baseR }, spin);
					r = rotX(r, spin * 0.6);
					return project({ x: wp.x + r.x, y: wp.y + r.y, z: wp.z + r.z }, W, H);
				});
				for (const [a, b] of OCTA_E)
					line(pts[a], pts[b], `rgba(${col},${bodyO.toFixed(3)})`, focused ? 1.4 : 1);

				// focus のアクセント環
				if (focused && !approach.active) {
					ctx.strokeStyle = `rgba(${SAKURA},0.5)`;
					ctx.lineWidth = 1.2;
					ctx.beginPath();
					ctx.arc(center.x, center.y, center.s * baseR * 1.7, 0, TAU);
					ctx.stroke();
				}

				// ラベル DOM を惑星位置へ
				const el = labelEls[i];
				if (el) {
					// 狭い画面では focus したラベルのみ (重なりを避ける)
					const lo = focused ? 1 : W < 720 ? 0 : Math.max(0, depthO * 0.32 - 0.04);
					el.style.transform = `translate(-50%,-50%) translate(${center.x}px,${center.y + center.s * baseR * 2.4}px)`;
					el.style.opacity = String(approach.active ? (focused ? 0 : 0) : lo);
					el.style.pointerEvents = focused && !approach.active ? 'auto' : 'none';
					el.style.setProperty('--s', focused ? '1' : '0.82');
					el.classList.toggle('is-focused', focused);
				}
			}
		};

		// ── ループ ──
		let raf = 0;
		let last = performance.now();
		const loop = (now: number) => {
			raf = requestAnimationFrame(loop);
			const dt = Math.min(0.05, (now - last) / 1000);
			last = now;

			if (approach.active) {
				approach.t += dt / 0.85;
			} else {
				// master を focus 目標 + 入力オフセットへ滑らかに寄せる
				const preview = mx * 0.32;
				let t = snap(focusIndex) + preview + dragOffset;
				t = master + norm(t - master);
				masterTarget = t;
				master += (masterTarget - master) * Math.min(1, dt * 6);
			}
			draw(now);
		};
		if (prefersReduced) {
			master = snap(0);
			draw(performance.now());
		} else {
			raf = requestAnimationFrame(loop);
		}

		// ── 入力 ──
		const onMove = (e: PointerEvent) => {
			const r = host.getBoundingClientRect();
			mx = ((e.clientX - r.left) / r.width) * 2 - 1;
			my = ((e.clientY - r.top) / r.height) * 2 - 1;
			if (dragging) {
				const dx = (e.clientX - dragStartX) / r.width;
				dragOffset = -dx * 2.0;
			}
		};
		const onDown = (e: PointerEvent) => {
			if (approach.active) return;
			// ラベル/太陽ボタン上の押下はドラッグにしない (クリックを奪わない)
			if (e.target !== host && e.target !== canvas) return;
			dragging = true;
			dragStartX = e.clientX;
			dragBase = master;
		};
		const onUp = () => {
			if (!dragging) return;
			dragging = false;
			// ドラッグ量から最寄りの惑星へスナップ
			const eff = dragBase + dragOffset;
			let best = 0,
				bestD = Infinity;
			for (let i = 0; i < items.length; i++) {
				const d = Math.abs(norm(snap(i) - eff));
				if (d < bestD) {
					bestD = d;
					best = i;
				}
			}
			dragOffset = 0;
			setFocus(best);
		};
		const onWheel = (e: WheelEvent) => {
			if (approach.active) return;
			e.preventDefault();
			wheelAcc += e.deltaY + e.deltaX;
			if (Math.abs(wheelAcc) > 60) {
				setFocus(focusIndex + (wheelAcc > 0 ? 1 : -1));
				wheelAcc = 0;
			}
		};
		const onKey = (e: KeyboardEvent) => {
			if (approach.active) return;
			if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
				e.preventDefault();
				setFocus(focusIndex + 1);
			} else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
				e.preventDefault();
				setFocus(focusIndex - 1);
			}
		};

		host.addEventListener('pointermove', onMove, { passive: true });
		host.addEventListener('pointerdown', onDown, { passive: true });
		window.addEventListener('pointerup', onUp, { passive: true });
		host.addEventListener('wheel', onWheel, { passive: false });
		host.addEventListener('keydown', onKey);
		const onResize = () => resize();
		window.addEventListener('resize', onResize);

		// ── API ──
		api = {
			leave: () => {
				approach.active = false;
				approach.t = 0;
				if (!prefersReduced && !raf) raf = requestAnimationFrame(loop);
			},
			focusTo: (id: string) => {
				const i = items.findIndex((it) => it.id === id);
				if (i >= 0) {
					master = snap(i);
					setFocus(i, false);
				}
			}
		};

		// ラベル/太陽からの選択
		selectHandler = (i: number) => {
			if (approach.active) return;
			if (i !== focusIndex) {
				setFocus(i);
				return;
			}
			approach.active = true;
			approach.t = 0;
			approach.target = planetPos(i);
			dispatch('select', items[i].id);
		};
		focusBtnHandler = (i: number) => {
			if (!approach.active && i !== focusIndex) setFocus(i);
		};

		return () => {
			cancelAnimationFrame(raf);
			host.removeEventListener('pointermove', onMove);
			host.removeEventListener('pointerdown', onDown);
			window.removeEventListener('pointerup', onUp);
			host.removeEventListener('wheel', onWheel);
			host.removeEventListener('keydown', onKey);
			window.removeEventListener('resize', onResize);
		};
	});

	// テンプレートから呼ぶハンドラ (onMount 内で実体を差す)
	let selectHandler: (i: number) => void = () => {};
	let focusBtnHandler: (i: number) => void = () => {};
</script>

<div
	bind:this={host}
	class="absolute inset-0 touch-none outline-none"
	tabindex="-1"
	role="application"
	aria-label="bitboxx の空間ナビゲーション"
>
	<canvas bind:this={canvas} class="absolute inset-0" aria-hidden="true"></canvas>

	<!-- 太陽 = ブランド核 -->
	<a
		bind:this={sunEl}
		href="#about"
		class="absolute left-0 top-0 z-10 select-none text-center"
		on:click|preventDefault={() => focusBtnHandler(items.findIndex((i) => i.id === 'about'))}
	>
		<span class="block font-display italic text-lg md:text-xl tracking-hyper text-ink">bitboxx</span
		>
		<span class="block font-mono text-[8.5px] tracking-[0.34em] text-ink/45 mt-0.5">E · K · U</span>
	</a>

	<!-- 惑星ラベル (実 DOM ボタン = クリック & キーボード操作の実体) -->
	{#each items as it, i (it.id)}
		<button
			bind:this={labelEls[i]}
			class="planet-label absolute left-0 top-0 z-10 select-none text-center"
			on:click={() => selectHandler(i)}
			on:focus={() => focusBtnHandler(i)}
			aria-label={`${it.label} へ`}
		>
			<span class="block font-mono text-[9px] tracking-[0.28em] text-ink/45">{it.en}</span>
			<span
				class="pl-ja block font-display text-[15px] md:text-[17px] tracking-hyper text-ink mt-0.5"
				>{it.label}</span
			>
		</button>
	{/each}
</div>

<style>
	.planet-label {
		transition: opacity 0.25s ease;
		font-size: calc(1em * var(--s, 1));
	}
	:global(.planet-label.is-focused .pl-ja) {
		color: #ff2630;
	}
	.planet-label:focus-visible {
		outline: 1px solid rgba(255, 38, 48, 0.6);
		outline-offset: 6px;
		border-radius: 2px;
	}
</style>
