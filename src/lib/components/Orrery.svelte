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
	 * Orrery — three.js による本格 3D の空間ナビゲーション。
	 *
	 * 中心に bitboxx「!?」ロゴの立方体 (実材質・環境反射) が回り、項目が惑星として
	 * 黄道面の軌道を回る。スクロール / ドラッグ / ←→ で次の惑星が手前に来て (focus)、
	 * ラベルが実 DOM ボタンになりクリック / Enter で「着陸」= カメラがその惑星へ寄り、
	 * 'select' を上位へ送る。
	 *
	 * 一つの意味ある数値 = 創業日からの経過日数 `day` を、星の数と系の基準位相に使う。
	 * 環境は RoomEnvironment を PMREM したものでクロムのリングに反射を与える。
	 */
	import { createEventDispatcher, onMount } from 'svelte';
	import * as THREE from 'three';
	import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
	import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

	export let items: OrreryItem[] = [];
	export let foundedISO = '2024-04-25';

	const dispatch = createEventDispatcher<{ select: string; focus: string }>();

	let host: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let labelEls: HTMLButtonElement[] = [];
	let sunEl: HTMLAnchorElement;
	let reticleEl: HTMLDivElement;

	let day = 0;
	let focusIndex = 0;

	let api: { leave: () => void; focusTo: (id: string) => void } = {
		leave: () => {},
		focusTo: () => {}
	};
	export function leave() {
		api.leave();
	}
	export function focusTo(id: string) {
		api.focusTo(id);
	}

	const SAKURA = 0xff2630;
	const INK = 0x1b1a1f;

	onMount(() => {
		const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		// ── 意味ある数値 ──
		const founded = new Date(foundedISO + 'T00:00:00+09:00').getTime();
		day = Math.max(0, Math.floor((Date.now() - founded) / 86400000));
		const STAR_COUNT = 320 + (day % 120);

		// ── レンダラ ──
		const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
		renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.toneMappingExposure = 1.08;
		renderer.outputColorSpace = THREE.SRGBColorSpace;

		const scene = new THREE.Scene();
		const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);

		// 環境マップ (クロムの反射用)
		const pmrem = new THREE.PMREMGenerator(renderer);
		const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
		scene.environment = envRT.texture;

		// ── ライト ──
		const hemi = new THREE.HemisphereLight(0xffffff, 0xd6d5da, 0.85);
		scene.add(hemi);
		const key = new THREE.DirectionalLight(0xffffff, 1.5);
		key.position.set(4, 8, -3);
		scene.add(key);
		const rim = new THREE.DirectionalLight(0xffffff, 0.7);
		rim.position.set(-5, 3, 6);
		scene.add(rim);

		// ── マテリアル ──
		const chromeFaint = new THREE.MeshStandardMaterial({
			color: 0xd9d8de,
			metalness: 1.0,
			roughness: 0.22,
			envMapIntensity: 1.0,
			transparent: true,
			opacity: 0.55
		});
		const inkMat = new THREE.MeshStandardMaterial({
			color: INK,
			metalness: 0.35,
			roughness: 0.45,
			flatShading: true
		});
		const redMat = new THREE.MeshStandardMaterial({
			color: SAKURA,
			emissive: SAKURA,
			emissiveIntensity: 0.4,
			metalness: 0.2,
			roughness: 0.35,
			flatShading: true
		});

		// ── 中心: 「!?」ロゴ立方体 ──
		const logoTex = makeLogoTexture();
		logoTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
		const cubeMat = new THREE.MeshPhysicalMaterial({
			map: logoTex,
			color: 0xffffff,
			metalness: 0.0,
			roughness: 0.26,
			clearcoat: 1.0,
			clearcoatRoughness: 0.18,
			envMapIntensity: 0.9
		});
		const CUBE = 1.32;
		const cube = new THREE.Mesh(new RoundedBoxGeometry(CUBE, CUBE, CUBE, 6, 0.07), cubeMat);
		scene.add(cube);
		// 立方体を縁取る細いクロムのフレーム
		const cubeEdge = new THREE.LineSegments(
			new THREE.EdgesGeometry(new THREE.BoxGeometry(CUBE, CUBE, CUBE)),
			new THREE.LineBasicMaterial({ color: 0x9a99a0, transparent: true, opacity: 0.5 })
		);
		cube.add(cubeEdge);

		// ── 軌道リング + 惑星 ──
		const orbitMeshes: THREE.Mesh[] = [];
		const planetMeshes: THREE.Mesh[] = [];
		items.forEach((it) => {
			const orbit = new THREE.Mesh(
				new THREE.TorusGeometry(it.r, 0.0075, 8, 160),
				chromeFaint.clone()
			);
			orbit.rotation.x = Math.PI / 2;
			scene.add(orbit);
			orbitMeshes.push(orbit);

			const planet = new THREE.Mesh(new THREE.IcosahedronGeometry(0.17, 0), inkMat);
			scene.add(planet);
			planetMeshes.push(planet);
		});

		// ── 漂う装飾リング (クロム) ──
		const halos: THREE.Mesh[] = [];
		for (let i = 0; i < 6; i++) {
			const a = i * 1.97;
			const dist = 7 + (i % 3) * 3;
			const radius = 3.4 + (i % 4) * 2.3;
			const ring = new THREE.Mesh(
				new THREE.TorusGeometry(radius, 0.018, 10, 180),
				chromeFaint.clone()
			);
			ring.position.set(Math.cos(a) * dist, (i % 2 ? 1 : -1) * (2 + i * 0.7), Math.sin(a) * dist);
			ring.rotation.set(0.5 + i * 0.4, i * 0.6, i * 0.3);
			ring.userData.spin = 0.06 * (i % 2 ? 1 : -1) * (1 + i * 0.12);
			scene.add(ring);
			halos.push(ring);
		}

		// ── 黄道面の極座標グリッド ──
		const grid = new THREE.PolarGridHelper(9.5, 16, 7, 90, 0x9a99a0, 0x9a99a0);
		(grid.material as THREE.Material).transparent = true;
		(grid.material as THREE.Material).opacity = 0.12;
		scene.add(grid);

		// ── 星 ──
		const starGeo = new THREE.BufferGeometry();
		const starPos = new Float32Array(STAR_COUNT * 3);
		for (let i = 0; i < STAR_COUNT; i++) {
			const a = i * 2.399963229;
			const yy = 1 - (i / (STAR_COUNT - 1)) * 2;
			const rr = Math.sqrt(Math.max(0, 1 - yy * yy));
			const rad = 16 + ((i * 13) % 22);
			starPos[i * 3] = Math.cos(a) * rr * rad;
			starPos[i * 3 + 1] = yy * rad * 0.6;
			starPos[i * 3 + 2] = Math.sin(a) * rr * rad;
		}
		starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
		const stars = new THREE.Points(
			starGeo,
			new THREE.PointsMaterial({
				color: 0x44434a,
				size: 0.05,
				sizeAttenuation: true,
				transparent: true,
				opacity: 0.5
			})
		);
		scene.add(stars);

		// ── カメラ基準 ──
		const CAM_Y = 5.4;
		const CAM_Z = -11.6;
		const ORIGIN = new THREE.Vector3(0, 0, 0);
		const camBase = new THREE.Vector3();
		const lookAt = new THREE.Vector3();
		const tmp = new THREE.Vector3();
		const tmp2 = new THREE.Vector3();

		// ── 入力状態 (Canvas2D 版から踏襲) ──
		let mx = 0,
			my = 0;
		let master = 0,
			masterTarget = 0;
		let dragging = false,
			dragStartX = 0,
			dragBase = 0,
			dragOffset = 0;
		let wheelAcc = 0;
		let approach = { active: false, t: 0, target: new THREE.Vector3() };

		const TAU = Math.PI * 2;
		const norm = (a: number) => {
			while (a > Math.PI) a -= TAU;
			while (a < -Math.PI) a += TAU;
			return a;
		};
		const snap = (i: number) => -Math.PI / 2 - (items[i].phase * Math.PI) / 180;
		const setFocus = (i: number, announce = true) => {
			focusIndex = ((i % items.length) + items.length) % items.length;
			if (announce) dispatch('focus', items[focusIndex].id);
		};
		const planetAngle = (i: number) => (items[i].phase * Math.PI) / 180 + master;

		// ── サイズ ──
		let W = 0,
			H = 0;
		const resize = () => {
			W = host.clientWidth;
			H = host.clientHeight;
			renderer.setSize(W, H);
			camera.aspect = W / Math.max(1, H);
			camera.fov = W < 720 ? 46 : 34;
			camera.updateProjectionMatrix();
		};
		resize();

		const projectPx = (v: THREE.Vector3) => {
			tmp.copy(v).project(camera);
			return { x: (tmp.x * 0.5 + 0.5) * W, y: (-tmp.y * 0.5 + 0.5) * H, behind: tmp.z > 1 };
		};

		const easeInOut = (e: number) => (e < 0.5 ? 4 * e * e * e : 1 - Math.pow(-2 * e + 2, 3) / 2);

		// ── フレーム ──
		const frame = (time: number, dt: number) => {
			// master を focus + 入力へ寄せる
			if (!approach.active) {
				let t = snap(focusIndex) + mx * 0.3 + dragOffset;
				t = master + norm(t - master);
				masterTarget = t;
				master += (masterTarget - master) * Math.min(1, dt * 6);
			}

			// 惑星配置
			for (let i = 0; i < items.length; i++) {
				const ang = planetAngle(i);
				const p = planetMeshes[i];
				p.position.set(Math.cos(ang) * items[i].r, 0, Math.sin(ang) * items[i].r);
				p.rotation.y += dt * 0.5;
				p.rotation.x += dt * 0.3;
				const focused = i === focusIndex;
				p.material = focused ? redMat : inkMat;
				const s = focused ? 1.7 : 1;
				p.scale.setScalar(s);
				const om = orbitMeshes[i].material as THREE.MeshStandardMaterial;
				om.color.setHex(focused ? SAKURA : 0xd9d8de);
				om.emissive.setHex(focused ? SAKURA : 0x000000);
				om.emissiveIntensity = focused ? 0.4 : 0;
				om.opacity = focused ? 0.85 : 0.5;
				om.metalness = focused ? 0.3 : 1.0;
			}

			// 立方体の回転
			cube.rotation.y = time * 0.18;
			cube.rotation.x = time * 0.12;

			// 装飾リングの首振り
			for (const h of halos) {
				h.rotation.z += dt * h.userData.spin;
				h.rotation.x += dt * h.userData.spin * 0.5;
			}
			stars.rotation.y = time * 0.012;

			// カメラ (控えめな parallax + 着陸 fly-in)
			camBase.set(mx * 0.32, CAM_Y, CAM_Z);
			let appE = 0;
			if (approach.active) {
				appE = easeInOut(Math.min(1, approach.t));
				tmp.subVectors(camBase, approach.target).normalize();
				tmp2.copy(approach.target).addScaledVector(tmp, 1.7);
				camera.position.lerpVectors(camBase, tmp2, appE);
				lookAt.lerpVectors(ORIGIN, approach.target, appE);
			} else {
				camera.position.copy(camBase);
				lookAt.set(mx * 0.18, my * 0.12, 0);
			}
			camera.lookAt(lookAt);

			const dim = 1 - appE;
			renderer.toneMappingExposure = 1.08 * (0.4 + 0.6 * dim);

			const fp = planetMeshes[focusIndex];
			renderer.render(scene, camera);

			// ── DOM オーバーレイ (ラベル / レティクル / ワードマーク) ──
			// ワードマークは立方体の下端より下へ
			tmp.set(0, -0.92, 0);
			const cubeBottom = projectPx(tmp);
			if (sunEl) {
				sunEl.style.transform = `translate(-50%,-50%) translate(${cubeBottom.x}px,${cubeBottom.y + 26}px)`;
				sunEl.style.opacity = String(Math.max(0, 1 - appE * 2.2));
			}

			for (let i = 0; i < items.length; i++) {
				const sp = projectPx(planetMeshes[i].position);
				const el = labelEls[i];
				if (!el) continue;
				const focused = i === focusIndex;
				const dist = camera.position.distanceTo(planetMeshes[i].position);
				const depthO = Math.min(1, 9 / dist - 0.2);
				const lo = approach.active
					? 0
					: focused
						? 1
						: W < 720
							? 0
							: Math.max(0, depthO * 0.4 - 0.05);
				el.style.transform = `translate(-50%,-50%) translate(${sp.x}px,${sp.y + 34}px)`;
				el.style.opacity = String(sp.behind ? 0 : lo);
				el.style.pointerEvents = focused && !approach.active ? 'auto' : 'none';
				el.classList.toggle('is-focused', focused);
			}

			// レティクルの四隅ブラケット (DOM, crisp)
			if (reticleEl) {
				if (approach.active) {
					reticleEl.style.opacity = '0';
				} else {
					const c = projectPx(fp.position);
					tmp.copy(fp.position).add(new THREE.Vector3(0, 0.34, 0));
					const top = projectPx(tmp);
					const rad = Math.max(26, Math.hypot(c.x - top.x, c.y - top.y) * 1.8);
					reticleEl.style.opacity = '1';
					reticleEl.style.transform = `translate(-50%,-50%) translate(${c.x}px,${c.y}px)`;
					reticleEl.style.setProperty('--r', `${rad}px`);
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
			if (approach.active) approach.t += dt / 0.85;
			frame(now / 1000, dt);
		};
		if (prefersReduced) {
			master = snap(0);
			frame(0, 0);
		} else {
			raf = requestAnimationFrame(loop);
		}

		// ── 入力 ──
		const onMove = (e: PointerEvent) => {
			const r = host.getBoundingClientRect();
			mx = ((e.clientX - r.left) / r.width) * 2 - 1;
			my = ((e.clientY - r.top) / r.height) * 2 - 1;
			if (dragging) dragOffset = -((e.clientX - dragStartX) / r.width) * 2.0;
		};
		const onDown = (e: PointerEvent) => {
			if (approach.active) return;
			if (e.target !== host && e.target !== canvas) return;
			dragging = true;
			dragStartX = e.clientX;
			dragBase = master;
		};
		const onUp = () => {
			if (!dragging) return;
			dragging = false;
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

		selectHandler = (i: number) => {
			if (approach.active) return;
			if (i !== focusIndex) {
				setFocus(i);
				return;
			}
			approach.active = true;
			approach.t = 0;
			const ang = planetAngle(i);
			approach.target.set(Math.cos(ang) * items[i].r, 0, Math.sin(ang) * items[i].r);
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
			scene.traverse((o) => {
				const mesh = o as THREE.Mesh;
				if (mesh.geometry) mesh.geometry.dispose();
				const mat = mesh.material as THREE.Material | THREE.Material[];
				if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
				else if (mat) mat.dispose();
			});
			logoTex.dispose();
			envRT.texture.dispose();
			pmrem.dispose();
			renderer.dispose();
		};
	});

	// 「!?」ロゴをキャンバステクスチャに描く (box フレーム + ! + ?)
	function makeLogoTexture(): THREE.CanvasTexture {
		const S = 512;
		const c = document.createElement('canvas');
		c.width = c.height = S;
		const x = c.getContext('2d')!;
		x.fillStyle = '#f6f5f2';
		x.fillRect(0, 0, S, S);
		const BOX = 'm240,240H0V0h240v240Zm-226.46-13.54h212.92V13.54H13.54v212.92Z';
		const EXCL =
			'm85.61,92.07l-6.37,54.13h-11.72l-6.53-54.13v-29.43h24.63v29.43Zm-.63,63.42v22.74h-23.45v-22.74h23.45Z';
		const QUES =
			'm158.16,135.43c-.63,1.99-.97,5.08-1.02,9.28h-21.25c.31-8.86,1.16-14.99,2.52-18.37,1.36-3.39,4.88-7.28,10.54-11.69l5.74-4.49c1.89-1.41,3.41-2.96,4.56-4.64,2.1-2.89,3.14-6.06,3.14-9.52,0-3.98-1.16-7.62-3.5-10.89s-6.6-4.92-12.79-4.92-10.4,2.02-12.94,6.06-3.82,8.23-3.82,12.59h-22.74c.63-14.95,5.85-25.54,15.66-31.79,6.19-3.99,13.79-5.98,22.82-5.98,11.86,0,21.7,2.83,29.55,8.5,7.84,5.67,11.76,14.06,11.76,25.18,0,6.82-1.71,12.56-5.11,17.23-1.99,2.83-5.82,6.45-11.49,10.86l-5.59,4.33c-3.04,2.36-5.06,5.12-6.06,8.27Zm.63,42.8h-23.45v-22.74h23.45v22.74Z';
		const margin = 64;
		const scale = (S - margin * 2) / 240;
		x.translate(margin, margin);
		x.scale(scale, scale);
		x.fillStyle = '#231815';
		x.fill(new Path2D(BOX), 'evenodd');
		x.fill(new Path2D(EXCL));
		x.fill(new Path2D(QUES));
		const tex = new THREE.CanvasTexture(c);
		tex.colorSpace = THREE.SRGBColorSpace;
		return tex;
	}

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

	<!-- focus 惑星の照準ブラケット -->
	<div bind:this={reticleEl} class="reticle absolute left-0 top-0 z-10" aria-hidden="true">
		<span class="rb tl"></span>
		<span class="rb tr"></span>
		<span class="rb bl"></span>
		<span class="rb br"></span>
	</div>

	<!-- 立方体 = ブランド核。下にワードマーク。 -->
	<a
		bind:this={sunEl}
		href="#about"
		class="absolute left-0 top-0 z-10 select-none text-center"
		on:click|preventDefault={() => focusBtnHandler(items.findIndex((i) => i.id === 'about'))}
	>
		<span class="font-techno block text-[10px] md:text-[11px] tracking-[0.44em] text-ink/80"
			>BITBOXX</span
		>
		<span class="font-techno block text-[7.5px] tracking-[0.5em] text-ink/40 mt-1.5"
			>E&nbsp;·&nbsp;K&nbsp;·&nbsp;U</span
		>
	</a>

	<!-- 惑星ラベル (実 DOM ボタン) -->
	{#each items as it, i (it.id)}
		<button
			bind:this={labelEls[i]}
			class="planet-label absolute left-0 top-0 z-10 select-none text-center"
			on:click={() => selectHandler(i)}
			on:focus={() => focusBtnHandler(i)}
			aria-label={`${it.label} へ`}
		>
			<span class="font-techno block text-[8.5px] tracking-[0.34em] text-ink/45">{it.en}</span>
			<span
				class="pl-ja font-techno block text-[14px] md:text-[15px] tracking-[0.18em] text-ink mt-1"
				>{it.label}</span
			>
		</button>
	{/each}
</div>

<style>
	.planet-label {
		transition: opacity 0.25s ease;
	}
	:global(.planet-label.is-focused .pl-ja) {
		color: #ff2630;
	}
	.planet-label:focus-visible {
		outline: 1px solid rgba(255, 38, 48, 0.6);
		outline-offset: 6px;
		border-radius: 2px;
	}

	/* 照準ブラケット */
	.reticle {
		width: 0;
		height: 0;
		pointer-events: none;
		transition: opacity 0.2s ease;
	}
	.reticle .rb {
		position: absolute;
		width: 10px;
		height: 10px;
		border: 0 solid rgba(255, 38, 48, 0.85);
	}
	.reticle .tl {
		left: calc(-1 * var(--r, 30px));
		top: calc(-1 * var(--r, 30px));
		border-left-width: 1.4px;
		border-top-width: 1.4px;
	}
	.reticle .tr {
		left: calc(var(--r, 30px) - 10px);
		top: calc(-1 * var(--r, 30px));
		border-right-width: 1.4px;
		border-top-width: 1.4px;
	}
	.reticle .bl {
		left: calc(-1 * var(--r, 30px));
		top: calc(var(--r, 30px) - 10px);
		border-left-width: 1.4px;
		border-bottom-width: 1.4px;
	}
	.reticle .br {
		left: calc(var(--r, 30px) - 10px);
		top: calc(var(--r, 30px) - 10px);
		border-right-width: 1.4px;
		border-bottom-width: 1.4px;
	}
</style>
