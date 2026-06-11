<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { heroGameState, heroGameScore } from '$lib/stores/heroGame';
  import { sfx } from '$lib/audio/heroSfx';

  let container: HTMLDivElement;
  let cleanup: (() => void) | null = null;
  let destroyed = false;

  // ダークバリアント — インク地のパネル内に置くとき true。
  // シーン (フォグ・キューブ・エッジ) と UI オーバーレイの色が反転する。
  export let dark = false;

  onMount(async () => {
    if (typeof window === 'undefined') return;

    // three.js + postprocessing は合わせて約 1MB あるので、window load 後の
    // アイドル時間まで読み込みを遅らせる。タイポグラフィ (LCP) が先に塗られ、
    // シーンはその直後に立ち上がる。
    await new Promise<void>((resolve) => {
      const whenIdle = () => {
        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(() => resolve(), { timeout: 2000 });
        } else {
          setTimeout(resolve, 300);
        }
      };
      if (document.readyState === 'complete') whenIdle();
      else window.addEventListener('load', whenIdle, { once: true });
    });
    if (destroyed || !container) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const THREE: any = await import('three');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const PP: any = await import('postprocessing');

    // テーマ定数 — オーバーレイ/シーン双方がここを参照する。
    const FG = dark ? '#F6F6F4' : '#111014';
    const ink = (a: number) => (dark ? `rgba(246,246,244,${a})` : `rgba(17,16,20,${a})`);

    const scene = new THREE.Scene();
    // Atmospheric perspective — far objects fade to the panel's ground color
    // so the scene reads as a real receding space rather than a flat cluster.
    scene.fog = new THREE.FogExp2(dark ? 0x111014 : 0xfaf8f4, 0.052);

    const camera = new THREE.PerspectiveCamera(
      42,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 環境マップ — 物理マテリアル (クリアコート / ガラス) の反射が一段リッチになる
    const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    pmrem.dispose();
    scene.environment = envTex;
    scene.environmentIntensity = dark ? 0.4 : 0.6;

    // ─── Postprocessing — bloom for the neon laser / explosion feel ───
    // Threshold is tuned so dark cubes don't glow but the sun, sakura
    // accents (#FF2630), bursts, and lasers do.
    const composer = new PP.EffectComposer(renderer);
    composer.addPass(new PP.RenderPass(scene, camera));
    const bloom = new PP.BloomEffect({
      intensity: dark ? 1.15 : 1.6,
      // ダークではクリーム色キューブの輝度が高いため、しきい値を上げて
      // サクラ / レーザー / バーストだけが光るようにする。
      luminanceThreshold: dark ? 0.93 : 0.32,
      luminanceSmoothing: 0.18,
      kernelSize: PP.KernelSize.MEDIUM,
      mipmapBlur: true
    });

    // 被写界深度 — デスクトップのみ。マスコット付近 (カメラから約 8) に焦点を置き、
    // 奥のキューブ群をボケに沈める。コスト高なのでモバイルは外す。
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const effects: any[] = [];
    if (finePointer && !prefersReduced && window.innerWidth >= 1024) {
      effects.push(
        new PP.DepthOfFieldEffect(camera, {
          worldFocusDistance: 8.6,
          worldFocusRange: 15,
          bokehScale: 1.6,
          height: 480
        })
      );
    }

    // 質感 — 色収差 + ビネット。グレインは「チカチカ」の原因になるので使わない。
    // 被弾・爆発の瞬間は色収差がスパイクして「画面が歪む」手応えになる。
    const caEffect = new PP.ChromaticAberrationEffect({
      offset: new THREE.Vector2(0.0006, 0.0006),
      radialModulation: true,
      modulationOffset: 0.25
    });
    let caBoost = 0;
    const vignetteEffect = new PP.VignetteEffect({ offset: 0.26, darkness: dark ? 0.5 : 0.36 });

    effects.push(bloom, caEffect, vignetteEffect);
    composer.addPass(new PP.EffectPass(camera, ...effects));

    // Lights — pared back to warm/cool white for a more monochrome scene.
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 6, 6);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe8e8e4, 0.8);
    fill.position.set(-5, -2, 3);
    scene.add(fill);
    const rim = new THREE.PointLight(0xffffff, 1.2, 20);
    rim.position.set(-3, 2, -4);
    scene.add(rim);

    // 無限グリッド — 床と天井の「方眼紙」。シェーダーで線を引く (スクリーンスペース
    // AA + 距離フェード) ので、トーンマッピングや DOF に潰されず視認性を制御できる。
    // 細線 + 5 マスごとの主線の二層。ダークではフォスファーグリーンに灯る。
    // uScroll で前方へ流れ続け、主線の周期ぶん進んだら巻き戻して無限に走る。
    const GRID_CELL = 1.6;
    const gridScroll = { value: 0 };
    const gridInk = new THREE.Color(dark ? '#2EE584' : '#111014');
    const makeGridPlane = (y: number, opacity: number) => {
      const mat = new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uScroll: gridScroll,
          uOpacity: { value: opacity },
          uColor: { value: gridInk }
        },
        vertexShader: `
          varying vec3 vWorld;
          varying float vDist;
          void main () {
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vWorld = wp.xyz;
            vec4 mv = viewMatrix * wp;
            vDist = -mv.z;
            gl_Position = projectionMatrix * mv;
          }`,
        fragmentShader: `
          varying vec3 vWorld;
          varying float vDist;
          uniform float uScroll;
          uniform float uOpacity;
          uniform vec3 uColor;
          void main () {
            vec2 coord = vec2(vWorld.x, vWorld.z + uScroll) / ${GRID_CELL.toFixed(2)};
            // 細線 (1 マス) と主線 (5 マス) の二層 — 方眼紙
            vec2 g1 = abs(fract(coord - 0.5) - 0.5) / fwidth(coord);
            float minor = 1.0 - min(min(g1.x, g1.y), 1.0);
            vec2 c5 = coord / 5.0;
            vec2 g5 = abs(fract(c5 - 0.5) - 0.5) / fwidth(c5);
            float major = 1.0 - min(min(g5.x, g5.y), 1.0);
            float line = max(minor * 0.38, major);
            if (line <= 0.0) discard;
            float fade = exp(-pow(vDist * 0.03, 2.0));
            gl_FragColor = vec4(uColor, line * uOpacity * fade);
          }`
      });
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(160, 120), mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(0, y, -28);
      mesh.frustumCulled = false;
      scene.add(mesh);
      return mesh;
    };
    const gridFloor = makeGridPlane(-3.4, 0.85);
    const gridCeil = makeGridPlane(4.1, 0.32);

    // Rounded box geometry (fallback: use BoxGeometry with high segs + bevel trick)
    const makeBox = (size: number) => {
      const g = new THREE.BoxGeometry(size, size, size, 4, 4, 4);
      // soft bevel trick: push vertices toward sphere slightly
      const pos = g.attributes.position;
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i);
        const target = v.clone().normalize().multiplyScalar(size * 0.58);
        v.lerp(target, 0.15);
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      g.computeVertexNormals();
      return g;
    };

    // Mostly monochrome — one sakura spark survives as the single accent.
    // ダークでは明暗を反転 (明るいキューブがインク地に浮かぶ)。
    const palette = dark
      ? [
          new THREE.Color('#F6F6F4'), // cream
          new THREE.Color('#E6E6E2'),
          new THREE.Color('#CFCFC9'),
          new THREE.Color('#9B989F'),
          new THREE.Color('#3A3741'), // near ink
          new THREE.Color('#4B4752'),
          new THREE.Color('#FF2630') // single sakura accent (birthdays 12/26 + 04/30)
        ]
      : [
          new THREE.Color('#111014'), // ink
          new THREE.Color('#1F1D24'), // near ink
          new THREE.Color('#2A272F'),
          new THREE.Color('#4B4752'),
          new THREE.Color('#E6E6E2'), // light gray
          new THREE.Color('#CFCFC9'),
          new THREE.Color('#FF2630') // single sakura accent (birthdays 12/26 + 04/30)
        ];

    // bitboxx logo texture (!? mark) — rendered onto a generated canvas so
    // the image is crisp and uses consistent padding around the mark.
    const logoTex = makeLogoTexture(THREE);

    const makeMat = (opts: Record<string, unknown> = {}) =>
      new THREE.MeshPhysicalMaterial({
        roughness: 0.32,
        metalness: 0.08,
        clearcoat: 0.55,
        clearcoatRoughness: 0.32,
        sheen: 0.5,
        sheenColor: new THREE.Color('#ffffff'),
        ...opts
      });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cubes: any[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const materialsToDispose: any[] = [];
    const group = new THREE.Group();
    scene.add(group);

    // Wider play field for the mini-game — more cubes, broader spread.
    const count = prefersReduced ? 9 : 18;
    for (let i = 0; i < count; i++) {
      const size = 0.35 + Math.random() * 0.85;
      const geo = makeBox(size);

      // Every ~3rd cube becomes a "logo cube": white body with the bitboxx
      // !? mark painted on one face.
      const isLogoCube = i % 3 === 0;
      let material;
      if (isLogoCube) {
        const body = () => makeMat({ color: '#FFFFFF' });
        const face = makeMat({ color: '#FFFFFF', map: logoTex });
        const mats = [body(), body(), body(), body(), face, body()];
        materialsToDispose.push(...mats);
        material = mats;
      } else if (i % 4 === 2) {
        // ガラスのキューブ — 環境マップと奥のシーンを屈折させる
        const m = makeMat({
          color: '#FFFFFF',
          transmission: 1,
          thickness: size * 0.9,
          roughness: 0.08,
          ior: 1.45,
          clearcoat: 1,
          clearcoatRoughness: 0.08
        });
        materialsToDispose.push(m);
        material = m;
      } else {
        const color = palette[i % palette.length];
        const m = makeMat({ color });
        materialsToDispose.push(m);
        material = m;
      }

      const mesh = new THREE.Mesh(geo, material);
      // Rectangular volume so cubes fill the whole hero stage at varied
      // depths — deep range so there's always a wave incoming from the back.
      mesh.position.set(
        (Math.random() - 0.5) * 16,            // x: ±8
        (Math.random() - 0.5) * 5,             // y: ±2.5
        -24 + Math.random() * 29               // z: -24 .. +5 (deep field)
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(mesh);

      // Thin edge lines — gives each cube a subtle wireframe overlay
      // reminiscent of a blueprint / CPU render.
      const edges = new THREE.EdgesGeometry(geo, 18);
      const edgeMat = new THREE.LineBasicMaterial({
        color: '#111014', // 明るいキューブにインクの稜線 — ダークでも共通で効く
        transparent: true,
        opacity: isLogoCube ? 0.18 : 0.3
      });
      const lines = new THREE.LineSegments(edges, edgeMat);
      mesh.add(lines);
      materialsToDispose.push(edgeMat);

      cubes.push({
        mesh,
        basePos: mesh.position.clone(),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.35,
          (Math.random() - 0.5) * 0.35,
          (Math.random() - 0.5) * 0.15
        ),
        floatSpeed: 0.4 + Math.random() * 0.6,
        floatAmp: 0.18 + Math.random() * 0.42,
        phase: Math.random() * Math.PI * 2,
        // Click-impulse physics — added to base position each frame and
        // decayed back toward zero. Lets the scene "react" to clicks.
        velocity: new THREE.Vector3(),
        displacement: new THREE.Vector3(),
        kickRot: new THREE.Vector3(),
        // Game: sakura flash + extra spin when the cube is "defeated".
        hitFlash: 0,
        hitSpin: 0,
        hitCooldown: 0,
        // Star-Fox-ish: each cube rushes toward the camera at jet speed.
        // Respawns far back so the field is always being replenished.
        forwardSpeed: 2.4 + Math.random() * 1.2
      });
    }

    // Respawn helper — sends a cube back to the depths with fresh state
    // when it passes the near edge of the camera.
    const respawnCube = (c: typeof cubes[number]) => {
      c.basePos.set(
        (Math.random() - 0.5) * 16,
        (Math.random() - 0.5) * 5,
        -26 - Math.random() * 6
      );
      c.velocity.set(0, 0, 0);
      c.displacement.set(0, 0, 0);
      c.kickRot.set(0, 0, 0);
      c.hitFlash = 0;
      c.hitSpin = 0;
      c.hitCooldown = 0;
      c.phase = Math.random() * Math.PI * 2;
      c.forwardSpeed = 2.4 + Math.random() * 1.2;
    };

    // Mascot cube — the star with kawaii face
    const mascotSize = 1.9;
    const mascotGeo = makeBox(mascotSize);
    const faceTex = makeFaceTexture(THREE);
    // Mascot mats: `fog: false` so the boss stays vivid even when it
    // spawns deep in the play field — fog had been hiding it.
    const mascotMats = [
      makeMat({ color: '#FFFFFF', fog: false }),
      makeMat({ color: '#FFFFFF', fog: false }),
      makeMat({ color: '#FFFFFF', fog: false }),
      makeMat({ color: '#FFFFFF', fog: false }),
      makeMat({ color: '#FFFFFF', map: faceTex, fog: false }),
      makeMat({ color: '#FFFFFF', fog: false })
    ];
    const mascot = new THREE.Mesh(mascotGeo, mascotMats);
    mascot.position.set(1.2, -0.3, 1.4);
    group.add(mascot);

    // Boss barrier — translucent sakura sphere over the mascot, only
    // visible while the shield is up. Slowly rotates + pulses opacity.
    const barrierGeo = new THREE.SphereGeometry(1.45, 24, 18);
    const barrierMat = new THREE.MeshBasicMaterial({
      color: '#FF2630',
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      fog: false,
      wireframe: false
    });
    const barrier = new THREE.Mesh(barrierGeo, barrierMat);
    barrier.visible = false;
    group.add(barrier);

    // Warp-speed streaks — each "particle" is rendered as a short line
    // along its forward velocity, so the field reads as a stream of
    // motion lines flying past. Constant forward velocity gives a strong
    // sense of "advancing into depth" regardless of game state.
    const particleCount = prefersReduced ? 90 : 280;
    const STREAK_LEN = 0.7; // world units
    const pX = new Float32Array(particleCount);
    const pY = new Float32Array(particleCount);
    const pZ = new Float32Array(particleCount);
    const linePos = new Float32Array(particleCount * 6); // 2 endpoints per line
    for (let i = 0; i < particleCount; i++) {
      pX[i] = (Math.random() - 0.5) * 24;
      pY[i] = (Math.random() - 0.5) * 13;
      pZ[i] = -24 + Math.random() * 30;
      const o = i * 6;
      linePos[o    ] = pX[i];
      linePos[o + 1] = pY[i];
      linePos[o + 2] = pZ[i];
      linePos[o + 3] = pX[i];
      linePos[o + 4] = pY[i];
      linePos[o + 5] = pZ[i] - STREAK_LEN;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    const pMat = new THREE.LineBasicMaterial({
      color: FG,
      transparent: true,
      opacity: 0.5,
      fog: true
    });
    const points = new THREE.LineSegments(pGeo, pMat);
    scene.add(points);

    // Mouse tracking
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e: MouseEvent) => {
      const r = container.getBoundingClientRect();
      mouse.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      mouse.ty = ((e.clientY - r.top)  / r.height - 0.5) * 2;
    };
    window.addEventListener('mousemove', onMove);

    let scrollY = 0;
    const onScroll = () => { scrollY = window.scrollY; };
    window.addEventListener('scroll', onScroll, { passive: true });

    // ─── Click detonation ────────────────────────────────────────────
    // Clicking anywhere on the hero scene projects the click to z=0 in
    // world space, applies inverse-square impulses to every cube, and
    // emits a sakura ring (DOM overlay) at the click point.
    const mascotState = {
      velocity: new THREE.Vector3(),
      displacement: new THREE.Vector3(),
      kickRot: new THREE.Vector3(),
      hitFlash: 0,
      hitSpin: 0,
      hitCooldown: 0
    };

    // ─── Mini-game ───────────────────────────────────────────────────
    // Star-Fox-ish shooter:
    //   idle    → user clicks a cube → ready
    //   ready   → Space or START click → playing
    //   playing → Arrow keys / WASD strafe the ship on an X-Y plane;
    //              hold Space to auto-fire. Cubes ram the ship if they
    //              reach it; periodically a boss (the kawaii cube) spawns
    //              and shoots projectiles back. HP starts at 3.
    //   gameover→ HP hit 0, show final score, auto-return to idle.
    type GameState = 'idle' | 'ready' | 'playing' | 'gameover';
    const game = {
      state: 'idle' as GameState,
      score: 0,
      hp: 3,
      maxHp: 3,
      invulnerableUntil: 0   // brief i-frames after taking damage
    };

    /** Ship position — velocity-driven so the controls feel like a jet:
     *  keys accelerate, friction slows, no snap-back to center. */
    const POS_MAX_X = 6;
    const POS_MAX_Y = 3.6;
    const VEL_MAX = 13;
    const VEL_DAMP = 0.90;
    const ACCEL_LERP = 0.28; // higher = snappier key response
    const pos = { x: 0, y: 0, vx: 0, vy: 0 };
    /** Smoothed banking — lerps toward velocity-based target so the
     *  camera doesn't snap to 0 when the ship hits a wall. */
    const bank = { z: 0 };
    const keys = { up: false, down: false, left: false, right: false, space: false };
    let lastFireAt = 0;
    const FIRE_INTERVAL_MS = 130;

    // ─── Mascot wake-up taps ──────────────────────────────────────────
    // Only the kawaii mascot is the game's "start switch". Three taps in
    // sequence ramps its tint up and then opens the READY overlay.
    // Other cubes still just kick physics + the sakura ring when clicked.
    let mascotTaps = 0;
    let mascotTapTimer: ReturnType<typeof setTimeout> | null = null;
    const MASCOT_TAP_COLORS = ['#FFC9CE', '#FF8A92', '#FF3B45'];

    const tintMascot = (hex: string) => {
      for (const m of mascotMats) {
        if (m && m.color && typeof m.color.set === 'function') m.color.set(hex);
      }
    };
    const resetMascotTint = () => tintMascot('#FFFFFF');

    const armMascotResetTimer = () => {
      if (mascotTapTimer) clearTimeout(mascotTapTimer);
      mascotTapTimer = setTimeout(() => {
        mascotTaps = 0;
        resetMascotTint();
        mascotTapTimer = null;
      }, 4500);
    };
    const clearMascotResetTimer = () => {
      if (mascotTapTimer) { clearTimeout(mascotTapTimer); mascotTapTimer = null; }
    };

    // ゲームは WASD/Space のキーボード操作前提なので、ファインポインタの
    // 環境だけで起動する。タッチ端末では 3 タップ目もご褒美の色変化に留め、
    // 操作不能な READY 画面に入れない。
    const canPlayGame = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    const handleMascotTap = () => {
      sfx.tap(mascotTaps);
      mascotTaps += 1;
      if (mascotTaps >= 3) {
        mascotTaps = 0;
        clearMascotResetTimer();
        if (canPlayGame) {
          resetMascotTint();
          enterReady();
          return;
        }
        // タッチ端末 — 最終色まで染めてからゆっくり戻す。
        tintMascot(MASCOT_TAP_COLORS[2]);
        armMascotResetTimer();
        return;
      }
      tintMascot(MASCOT_TAP_COLORS[mascotTaps - 1]);
      armMascotResetTimer();
    };

    // ─── Boss ─────────────────────────────────────────────────────────
    // Mascot cube becomes the final boss — appears once per round at the
    // threshold score, has a chunky HP pool, and fires Touhou-style
    // patterns that escalate per phase. Defeat = MISSION CLEAR.
    const boss = {
      active: false,
      hp: 0,
      maxHp: 60,
      nextSpawnScore: 10,
      defeated: false,
      lastFireAt: 0,
      fireInterval: 900,
      pos: new THREE.Vector3(0, 0, -10),
      currentPhase: 0 as 0 | 1 | 2,
      patternIndex: 0,
      patternStartedAt: 0,
      // Shield — triggers at HP thresholds; the boss keeps firing while
      // up and deflects laser hits. The shield itself has HP; players
      // have to shoot it down to resume damaging the boss.
      shielded: false,
      shieldHp: 0,
      shieldMaxHp: 10,
      shieldFlashUntil: 0
    };
    const SHIELD_HP_THRESHOLDS = [40, 20];
    const triggeredShields = new Set<number>();
    const PATTERN_DURATION_MS = 3500;
    /** 0: HP > 66 % — accessible patterns (aimed/spread/cross)
     *  1: HP > 33 % — variety (X, star8, fan5, spiral)
     *  2: HP <= 33 % — bullet-hell (double spiral, star8, fast spiral) */
    const getBossPhase = (): 0 | 1 | 2 => {
      const r = boss.hp / boss.maxHp;
      if (r > 0.66) return 0;
      if (r > 0.33) return 1;
      return 2;
    };

    // Enemy projectile pool — sakura spheres fired by the boss.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type EnemyProj = { mesh: any; vel: any; bornAt: number; trail?: any };
    const enemyProjs: EnemyProj[] = [];
    const enemyProjGeo = new THREE.SphereGeometry(0.18, 10, 8);
    const enemyProjMat = new THREE.MeshBasicMaterial({
      color: '#FF2630',
      transparent: false,
      fog: false
    });

    // HUD — top-center time + score, faded in only during play/gameover.
    const gameUi = document.createElement('div');
    gameUi.style.cssText = [
      'position:absolute',
      'top:5.75rem',
      'left:50%',
      'transform:translateX(-50%)',
      'z-index:6',
      'pointer-events:none',
      'display:flex',
      'gap:2rem',
      'font-family:"JetBrains Mono", ui-monospace, monospace',
      `color:${FG}`,
      'opacity:0',
      'transition:opacity 280ms ease',
      'text-align:center'
    ].join(';');
    gameUi.innerHTML = `
      <div>
        <div style="font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:${ink(0.5)};">HP</div>
        <div data-hp style="font-size:18px;letter-spacing:0.18em;margin-top:6px;line-height:1;">● ● ●</div>
      </div>
      <div style="width:1px;background:${ink(0.18)};align-self:stretch;"></div>
      <div>
        <div style="font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:${ink(0.5)};">Score</div>
        <div data-score style="font-size:28px;letter-spacing:0.02em;margin-top:4px;font-variant-numeric:tabular-nums;display:inline-block;">000</div>
      </div>
      <div style="width:1px;background:${ink(0.18)};align-self:stretch;"></div>
      <div>
        <div style="font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:${ink(0.5)};">Exit</div>
        <div style="font-size:14px;letter-spacing:0.04em;margin-top:8px;color:${ink(0.65)};">
          <span style="display:inline-block;padding:2px 8px;border:1px solid currentColor;border-radius:4px;font-family:inherit;">Esc</span>
        </div>
      </div>
    `;
    container.appendChild(gameUi);
    const scoreEl = gameUi.querySelector('[data-score]') as HTMLElement;
    const hpEl = gameUi.querySelector('[data-hp]') as HTMLElement;

    // Boss HP bar — slim sakura bar near top, appears only when boss active.
    const bossHpEl = document.createElement('div');
    bossHpEl.style.cssText = [
      'position:absolute',
      'top:10rem',
      'left:50%',
      'transform:translateX(-50%)',
      'z-index:6',
      'pointer-events:none',
      'width:260px',
      'opacity:0',
      'transition:opacity 280ms ease',
      'font-family:"JetBrains Mono", ui-monospace, monospace'
    ].join(';');
    bossHpEl.innerHTML = `
      <div style="font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:#FF2630;text-align:center;margin-bottom:6px;">Boss</div>
      <div style="height:3px;background:${ink(0.15)};border-radius:2px;overflow:hidden;">
        <div data-bosshp style="height:100%;background:#FF2630;transform-origin:left center;transform:scaleX(1);transition:transform 200ms ease-out;"></div>
      </div>
    `;
    container.appendChild(bossHpEl);
    const bossHpFillEl = bossHpEl.querySelector('[data-bosshp]') as HTMLElement;

    // Game-over overlay — final score, briefly visible before idle reset.
    const gameOverEl = document.createElement('div');
    gameOverEl.style.cssText = [
      'position:absolute',
      'top:50%',
      'left:50%',
      'transform:translate(-50%, -50%)',
      'z-index:9',
      'pointer-events:none',
      'text-align:center',
      'opacity:0',
      'transition:opacity 280ms ease',
      `color:${FG}`
    ].join(';');
    gameOverEl.innerHTML = `
      <p data-label style="font-family:'JetBrains Mono', ui-monospace, monospace;font-size:10px;letter-spacing:0.4em;text-transform:uppercase;color:${ink(0.55)};margin:0;">Game over</p>
      <p data-title style="margin:14px 0 0;font-family:'Fraunces', ui-serif, serif;font-style:italic;font-weight:800;font-size:72px;letter-spacing:-0.04em;line-height:1;">Down<span style="color:#FF2630">.</span></p>
      <p style="margin:18px 0 0;font-family:'JetBrains Mono', ui-monospace, monospace;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:${ink(0.55)};">
        Final score
        <span data-final style="display:inline-block;margin-left:12px;font-size:18px;color:${FG};font-variant-numeric:tabular-nums;">000</span>
      </p>
    `;
    container.appendChild(gameOverEl);
    const gameOverScoreEl = gameOverEl.querySelector('[data-final]') as HTMLElement;
    const gameOverLabelEl = gameOverEl.querySelector('[data-label]') as HTMLElement;
    const gameOverTitleEl = gameOverEl.querySelector('[data-title]') as HTMLElement;

    // Score-pop layer — small +N labels float up from hit points.
    const scorePopLayer = document.createElement('div');
    scorePopLayer.style.cssText =
      'position:absolute;inset:0;pointer-events:none;z-index:7;overflow:hidden;';
    container.appendChild(scorePopLayer);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spawnScorePop = (worldPoint: any, text = '+1') => {
      // Project the 3D point to canvas screen coords.
      const ndc = worldPoint.clone().project(camera);
      const r = container.getBoundingClientRect();
      const sx = (ndc.x + 1) / 2 * r.width;
      const sy = (1 - ndc.y) / 2 * r.height;
      const el = document.createElement('div');
      el.style.cssText = [
        'position:absolute',
        `left:${sx}px`, `top:${sy}px`,
        'transform:translate(-50%, -50%)',
        "font-family:'JetBrains Mono', ui-monospace, monospace",
        'font-size:14px',
        'font-weight:700',
        'color:#FF2630',
        'pointer-events:none',
        'text-shadow:0 0 8px rgba(255,38,48,0.55)',
        'transition:transform 620ms cubic-bezier(.2,.7,.2,1), opacity 620ms ease-out'
      ].join(';');
      el.textContent = text;
      scorePopLayer.appendChild(el);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      el.offsetWidth;
      el.style.transform = 'translate(-50%, calc(-50% - 56px))';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 660);
    };

    const pulseScore = () => {
      scoreEl.style.transition = 'transform 90ms ease-out';
      scoreEl.style.transform = 'scale(1.22)';
      setTimeout(() => {
        scoreEl.style.transition = 'transform 260ms cubic-bezier(.2,.8,.2,1)';
        scoreEl.style.transform = 'scale(1)';
      }, 90);
    };

    // READY overlay — invitation to start the round, centered.
    const readyOverlay = document.createElement('div');
    readyOverlay.style.cssText = [
      'position:absolute',
      'top:50%',
      'left:50%',
      'transform:translate(-50%, -50%)',
      'z-index:7',
      'pointer-events:none',
      'text-align:center',
      'opacity:0',
      'transition:opacity 260ms ease',
      `color:${FG}`,
      'user-select:none'
    ].join(';');
    readyOverlay.innerHTML = `
      <p style="font-family:'JetBrains Mono', ui-monospace, monospace;font-size:10px;letter-spacing:0.4em;text-transform:uppercase;color:${ink(0.5)};margin:0;">System</p>
      <p style="margin:14px 0 0;font-family:'Fraunces', ui-serif, serif;font-style:italic;font-weight:800;font-size:88px;letter-spacing:-0.04em;line-height:1;">READY<span style="color:#FF2630">.</span></p>
      <p style="margin:20px 0 0;font-family:'JetBrains Mono', ui-monospace, monospace;font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:${ink(0.65)};line-height:2;">
        <span style="display:inline-block;padding:2px 8px;border:1px solid currentColor;border-radius:4px;">↑ ← ↓ →</span>
        or
        <span style="display:inline-block;padding:2px 8px;border:1px solid currentColor;border-radius:4px;">W A S D</span>
        to move<br/>
        Hold
        <span style="display:inline-block;padding:2px 8px;border:1px solid currentColor;border-radius:4px;">SPACE</span>
        to fire ·
        <span style="display:inline-block;padding:2px 8px;border:1px solid currentColor;border-radius:4px;">Esc</span>
        to exit
      </p>
      <button data-start style="
        margin-top:28px;padding:12px 30px;border-radius:9999px;
        background:${dark ? '#F6F6F4' : '#111014'};color:${dark ? '#111014' : '#fff'};
        font-family:'Noto Serif JP', serif;font-size:14px;
        cursor:pointer;border:none;
        transition:background 200ms, color 200ms;pointer-events:auto;">
        START &nbsp;→
      </button>
    `;
    container.appendChild(readyOverlay);
    const startBtn = readyOverlay.querySelector('[data-start]') as HTMLButtonElement;
    startBtn.addEventListener('mouseenter', () => {
      startBtn.style.background = '#FF2630';
      startBtn.style.color = '#fff';
    });
    startBtn.addEventListener('mouseleave', () => {
      startBtn.style.background = dark ? '#F6F6F4' : '#111014';
      startBtn.style.color = dark ? '#111014' : '#fff';
    });

    // Crosshair — Star-Fox-style 4-corner reticle + center dot.
    // Color flips to sakura when the reticle is on a cube.
    const svgNs = 'http://www.w3.org/2000/svg';
    const crosshair = document.createElementNS(svgNs, 'svg');
    crosshair.setAttribute('viewBox', '0 0 48 48');
    crosshair.style.cssText = [
      'position:absolute',
      'top:50%',
      'left:50%',
      'transform:translate(-50%, -50%)',
      'width:46px',
      'height:46px',
      'z-index:8',
      'pointer-events:none',
      'opacity:0',
      'transition:opacity 200ms ease, color 120ms ease',
      `color:${FG}`
    ].join(';');
    crosshair.innerHTML = `
      <path d="M4 14 L4 4 L14 4"   fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M34 4 L44 4 L44 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M44 34 L44 44 L34 44" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M14 44 L4 44 L4 34" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="24" cy="24" r="1.5" fill="currentColor"/>
    `;
    container.appendChild(crosshair);

    // ─── State transitions ───────────────────────────────────────────
    const setGameState = (next: GameState) => {
      game.state = next;
      heroGameState.set(next);
    };
    const showHud = () => { gameUi.style.opacity = '1'; };
    const hideHud = () => { gameUi.style.opacity = '0'; };
    const showReady = () => {
      readyOverlay.style.opacity = '1';
      readyOverlay.style.pointerEvents = 'auto';
    };
    const hideReady = () => {
      readyOverlay.style.opacity = '0';
      readyOverlay.style.pointerEvents = 'none';
    };
    const showCrosshair = () => { crosshair.style.opacity = '1'; };
    const hideCrosshair = () => { crosshair.style.opacity = '0'; };

    const resetShipPos = () => {
      pos.x = 0; pos.y = 0; pos.vx = 0; pos.vy = 0;
    };

    const updateHpDisplay = () => {
      // Render N filled sakura hearts + (max - hp) empty hearts.
      const slots: string[] = [];
      for (let i = 0; i < game.maxHp; i++) {
        slots.push(
          i < game.hp
            ? '<span style="color:#FF2630">●</span>'
            : '<span style="color:${ink(0.18)}">●</span>'
        );
      }
      hpEl.innerHTML = slots.join(' ');
    };

    const setBossActive = (active: boolean, silent = false) => {
      const wasActive = boss.active;
      boss.active = active;
      if (active) {
        boss.hp = boss.maxHp;
        boss.pos.set(0, 0, -10);
        boss.lastFireAt = 0;
        boss.currentPhase = 0;
        boss.patternIndex = 0;
        boss.patternStartedAt = performance.now();
        boss.shielded = false;
        triggeredShields.clear();
        barrier.visible = false;
        mascot.visible = true;
        mascot.scale.setScalar(1.85);
        bossHpEl.style.opacity = '1';
        updateBossHpDisplay();
        if (!wasActive && !silent) sfx.bossSpawn();
      } else {
        mascot.scale.setScalar(1);
        bossHpEl.style.opacity = '0';
        barrier.visible = false;
        boss.shielded = false;
        if (wasActive && !silent) sfx.bossDefeat();
        // Note: visibility is left for callers — registerHit hides
        // (boss exploded), goIdle shows (mascot floats in idle scene).
      }
    };

    const updateBossHpDisplay = () => {
      const ratio = Math.max(0, boss.hp / boss.maxHp);
      bossHpFillEl.style.transform = `scaleX(${ratio})`;
    };

    const enterReady = () => {
      resetShipPos();
      hideHud();
      hideCrosshair();
      showReady();
      setGameState('ready');
      heroGameScore.set(0);
      sfx.start();
    };

    const startPlaying = () => {
      game.score = 0;
      game.hp = game.maxHp;
      game.invulnerableUntil = 0;
      boss.nextSpawnScore = 10;
      boss.defeated = false;
      setBossActive(false, true);
      mascot.visible = false; // hidden during play unless boss
      resetMascotTint();
      scoreEl.textContent = '000';
      updateHpDisplay();
      hideReady();
      showHud();
      showCrosshair();
      setGameState('playing');
      heroGameScore.set(0);
      sfx.start();
    };

    const goIdle = () => {
      hideHud();
      hideReady();
      hideCrosshair();
      hideGameOver();
      resetShipPos();
      // Bring the mascot back as the friendly idle floater.
      mascot.visible = true;
      mascot.scale.setScalar(1);
      setBossActive(false);
      // Tap sequence resets so the next round starts fresh white.
      mascotTaps = 0;
      clearMascotResetTimer();
      resetMascotTint();
      // Clear enemy projectiles.
      for (const p of enemyProjs) scene.remove(p.mesh);
      enemyProjs.length = 0;
      keys.up = keys.down = keys.left = keys.right = keys.space = false;
      setGameState('idle');
    };

    const damagePlayer = () => {
      if (game.state !== 'playing') return;
      const now = performance.now();
      if (now < game.invulnerableUntil) return;
      game.hp = Math.max(0, game.hp - 1);
      game.invulnerableUntil = now + 700;
      updateHpDisplay();
      flashScreen();
      kickShake(0.12);
      sfx.damage();
      if (game.hp <= 0) endGame();
    };

    const flashScreen = () => {
      const flash = document.createElement('div');
      flash.style.cssText =
        'position:absolute;inset:0;background:#FF2630;opacity:0.32;' +
        'pointer-events:none;z-index:9;transition:opacity 320ms ease-out;';
      container.appendChild(flash);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      flash.offsetWidth;
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 360);
    };

    const endGame = (outcome: 'win' | 'lose' = 'lose') => {
      setGameState('gameover');
      hideCrosshair();
      bossHpEl.style.opacity = '0';
      // Clear in-flight enemy projectiles so they don't pepper the
      // game-over screen.
      for (const p of enemyProjs) scene.remove(p.mesh);
      enemyProjs.length = 0;
      if (outcome === 'win') {
        gameOverLabelEl.textContent = 'Mission Complete';
        gameOverTitleEl.innerHTML = 'Clear<span style="color:#FF2630">.</span>';
        sfx.bossDefeat();
      } else {
        gameOverLabelEl.textContent = 'Game over';
        gameOverTitleEl.innerHTML = 'Down<span style="color:#FF2630">.</span>';
        sfx.gameOver();
      }
      gameOverScoreEl.textContent = String(game.score).padStart(3, '0');
      gameOverEl.style.opacity = '1';
      setTimeout(() => goIdle(), 3800);
    };

    const hideGameOver = () => {
      gameOverEl.style.opacity = '0';
    };

    startBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (game.state === 'ready') startPlaying();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const setEmissive = (mat: any, r: number, g: number, b: number) => {
      if (Array.isArray(mat)) {
        for (const m of mat) m?.emissive?.setRGB(r, g, b);
      } else {
        mat?.emissive?.setRGB(r, g, b);
      }
    };

    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const detonatePlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
    const detonatePoint = new THREE.Vector3();

    const ringLayer = document.createElement('div');
    ringLayer.style.cssText =
      'position:absolute;inset:0;pointer-events:none;z-index:5;overflow:hidden;';
    container.appendChild(ringLayer);

    const spawnRing = (x: number, y: number) => {
      const ring = document.createElement('span');
      ring.style.cssText = `
        position:absolute;left:${x}px;top:${y}px;
        width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:9999px;
        border:1.5px solid #FF2630;opacity:0.85;
        transition:transform 700ms cubic-bezier(.2,.8,.2,1), opacity 700ms ease-out;
        will-change:transform, opacity;
      `;
      ringLayer.appendChild(ring);
      // Force layout, then animate.
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      ring.offsetWidth;
      ring.style.transform = 'scale(48)';
      ring.style.opacity = '0';
      setTimeout(() => ring.remove(), 760);

      // Inner core dot fades faster for an "impact" feel.
      const core = document.createElement('span');
      core.style.cssText = `
        position:absolute;left:${x}px;top:${y}px;
        width:6px;height:6px;margin:-3px 0 0 -3px;border-radius:9999px;
        background:#FF2630;opacity:0.95;
        transition:transform 300ms ease-out, opacity 300ms ease-out;
      `;
      ringLayer.appendChild(core);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      core.offsetWidth;
      core.style.transform = 'scale(2.6)';
      core.style.opacity = '0';
      setTimeout(() => core.remove(), 340);
    };

    const detonate = (clientX: number, clientY: number) => {
      const r = container.getBoundingClientRect();
      const localX = clientX - r.left;
      const localY = clientY - r.top;
      ndc.x = (localX / r.width) * 2 - 1;
      ndc.y = -(localY / r.height) * 2 + 1;

      // World matrices must be current before raycasting against animated meshes.
      scene.updateMatrixWorld(true);
      raycaster.setFromCamera(ndc, camera);

      // 1) Physics impulse — projected to a plane at z=0 in world space.
      if (raycaster.ray.intersectPlane(detonatePlane, detonatePoint)) {
        const localPoint = detonatePoint.clone();
        group.worldToLocal(localPoint);

        for (const c of cubes) {
          const dir = c.mesh.position.clone().sub(localPoint);
          const dist = Math.max(0.6, dir.length());
          const strength = 14 / (dist * dist);
          dir.normalize();
          c.velocity.add(dir.multiplyScalar(strength));
          c.kickRot.x += (Math.random() - 0.5) * 0.8;
          c.kickRot.y += (Math.random() - 0.5) * 0.8;
          c.kickRot.z += (Math.random() - 0.5) * 0.4;
        }
        const mdir = mascot.position.clone().sub(localPoint);
        const mdist = Math.max(0.6, mdir.length());
        mdir.normalize().multiplyScalar(20 / (mdist * mdist));
        mascotState.velocity.add(mdir);
        mascotState.kickRot.x += (Math.random() - 0.5) * 0.6;
        mascotState.kickRot.y += (Math.random() - 0.5) * 1.0;

        spawnRing(localX, localY);
      }

      // 2) Game hit — direct cube/mascot strike via raycast.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hittables: any[] = cubes.map((c) => c.mesh).concat([mascot]);
      const intersects = raycaster.intersectObjects(hittables, true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let hitObject: any = null;
      for (const it of intersects) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let obj: any = it.object;
        while (obj && !hittables.includes(obj)) obj = obj.parent;
        if (obj) { hitObject = obj; break; }
      }
      if (!hitObject) return;

      const now = performance.now();
      const cubeState = cubes.find((c) => c.mesh === hitObject);
      const stateObj = cubeState || mascotState;
      if (now < (stateObj.hitCooldown || 0)) return;

      // State transitions on cube hits:
      //   idle    → only the mascot starts things up; the third tap on
      //              the mascot opens READY. Other cubes are just bumps.
      //   ready   → any cube click also counts as "press START" → playing
      //   playing → counts as a fire; score, destroy + burst
      if (game.state === 'idle') {
        stateObj.hitFlash = 0.6;
        stateObj.hitSpin += 8;
        stateObj.hitCooldown = now + 260;
        if (hitObject === mascot) handleMascotTap();
        return;
      }
      if (game.state === 'ready') {
        startPlaying();
        return;
      }

      // game.state === 'playing' — count as a fire.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hitWorldPos = (hitObject as any).getWorldPosition(new THREE.Vector3());
      spawnLaser(hitWorldPos);
      registerHit(hitObject, hitWorldPos, cubeState);
    };

    // Shared hit handler — boss vs regular cube routing.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const registerHit = (hitObject: any, hitPoint: any, cubeState: any) => {
      if (hitObject === mascot && boss.active) {
        // Shield blocks damage to the boss but takes damage itself —
        // the player has to chip through to resume attacking the body.
        if (boss.shielded) {
          spawnBurst(hitPoint);
          sfx.tap(2);
          boss.shieldHp -= 1;
          boss.shieldFlashUntil = performance.now() + 120;
          if (boss.shieldHp <= 0) {
            // Shield shattered — big burst, vulnerable boss again.
            boss.shielded = false;
            barrier.visible = false;
            spawnBurst(boss.pos);
            spawnBurst(boss.pos);
            spawnBurst(boss.pos);
            sfx.bossDefeat();
          }
          return;
        }
        spawnBurst(hitPoint);
        sfx.hit();
        spawnScorePop(hitPoint, '+1');
        boss.hp -= 1;
        boss.pos.z -= 0.3;
        updateBossHpDisplay();
        if (boss.hp <= 0) {
          // Boss down — MISSION CLEAR
          setBossActive(false, true);
          mascot.visible = false;
          boss.defeated = true;
          spawnBurst(hitPoint);
          spawnBurst(hitPoint);
          spawnBurst(hitPoint);
          spawnSparks(hitPoint, 90, 0.6); // フィナーレの大花火
          kickShake(0.16);
          game.score += 25;
          spawnScorePop(hitPoint, '+25');
          scoreEl.textContent = String(game.score).padStart(3, '0');
          heroGameScore.set(game.score);
          pulseScore();
          endGame('win');
          return;
        }
        game.score += 1;
      } else if (cubeState) {
        respawnCube(cubeState);
        spawnBurst(hitPoint);
        sfx.hit();
        spawnScorePop(hitPoint, '+1');
        game.score += 1;
      } else {
        spawnBurst(hitPoint);
      }
      scoreEl.textContent = String(game.score).padStart(3, '0');
      heroGameScore.set(game.score);
      pulseScore();
    };

    // ─── Boss projectile system (Touhou-ish patterns) ────────────────
    /** Cone shot — `rotAngle` is the rotation around the boss→player aim
     *  axis, `spreadAngle` is the cone's half-angle. With spread=0 the
     *  bullet hits the player dead-on; with spread > 0 the bullet flies
     *  past the player at an offset distance proportional to sin(spread)
     *  × distance. This is the Touhou pattern primitive — geometric
     *  decoration around the player's location, not random world angles.
     */
    const fireBossShotConed = (rotAngle: number, spreadAngle: number, speed = 6.5) => {
      const start = boss.pos.clone();
      const target = new THREE.Vector3(pos.x, pos.y, 9);
      const aim = target.clone().sub(start);
      if (aim.lengthSq() < 1e-4) return;
      aim.normalize();
      // Perpendicular basis around the aim axis.
      const worldUp = new THREE.Vector3(0, 1, 0);
      const right = new THREE.Vector3().crossVectors(aim, worldUp);
      if (right.lengthSq() < 1e-6) right.set(1, 0, 0);
      else right.normalize();
      const trueUp = new THREE.Vector3().crossVectors(right, aim).normalize();

      const cs = Math.cos(spreadAngle);
      const ss = Math.sin(spreadAngle);
      const cr = Math.cos(rotAngle);
      const sr = Math.sin(rotAngle);
      const dir = aim.clone().multiplyScalar(cs)
        .add(right.clone().multiplyScalar(ss * cr))
        .add(trueUp.clone().multiplyScalar(ss * sr));
      dir.normalize();

      const proj = new THREE.Mesh(enemyProjGeo, enemyProjMat);
      proj.position.copy(start);
      scene.add(proj);
      enemyProjs.push({
        mesh: proj,
        vel: dir.multiplyScalar(speed),
        bornAt: performance.now()
      });
    };

    // ─── Pattern library ────────────────────────────────────────────
    // Each pattern is a closure that fires shots if its own interval has
    // elapsed, then updates `boss.lastFireAt`. They're invoked every
    // frame; throttling is internal.
    type Pattern = () => void;

    // All radial patterns now go through fireBossShotConed so they
    // actually arc toward the player's hit-box. spreadAngle controls
    // how wide the bullet fans out from the aim line.

    const aimedPattern: Pattern = () => {
      const now = performance.now();
      if (now - boss.lastFireAt < 720) return;
      boss.lastFireAt = now;
      fireBossShotConed(0, 0, 7.5); // dead-on
    };
    const spread3Pattern: Pattern = () => {
      const now = performance.now();
      if (now - boss.lastFireAt < 900) return;
      boss.lastFireAt = now;
      // 3 around aim — a tight tri
      for (let i = 0; i < 3; i++) {
        fireBossShotConed((i / 3) * Math.PI * 2, 0.22, 7.2);
      }
    };
    const fan5Pattern: Pattern = () => {
      const now = performance.now();
      if (now - boss.lastFireAt < 1000) return;
      boss.lastFireAt = now;
      // Horizontal-only 5-fan: rotAngle 0 (right) and π (left), spread
      // increasing → wing-like fan. Mix vertical 0 for player-aimed.
      fireBossShotConed(0, 0.28, 6.6);
      fireBossShotConed(Math.PI, 0.28, 6.6);
      fireBossShotConed(0, 0.16, 6.8);
      fireBossShotConed(Math.PI, 0.16, 6.8);
      fireBossShotConed(0, 0, 7.4);
    };
    /** Plus-shape — 4 cardinals around the aim axis (up, right, down, left). */
    const crossPattern: Pattern = () => {
      const now = performance.now();
      if (now - boss.lastFireAt < 880) return;
      boss.lastFireAt = now;
      for (let i = 0; i < 4; i++) {
        fireBossShotConed((i / 4) * Math.PI * 2, 0.30, 7);
      }
    };
    /** X-shape — 4 diagonals around the aim axis. */
    const xPattern: Pattern = () => {
      const now = performance.now();
      if (now - boss.lastFireAt < 880) return;
      boss.lastFireAt = now;
      for (let i = 0; i < 4; i++) {
        fireBossShotConed((i / 4) * Math.PI * 2 + Math.PI / 4, 0.30, 7);
      }
    };
    /** 8-direction star burst around the aim. */
    const star8Pattern: Pattern = () => {
      const now = performance.now();
      if (now - boss.lastFireAt < 1100) return;
      boss.lastFireAt = now;
      for (let i = 0; i < 8; i++) {
        fireBossShotConed((i / 8) * Math.PI * 2, 0.35, 6.4);
      }
    };
    /** Rotating spiral around the aim axis. */
    const spiralPattern: Pattern = () => {
      const now = performance.now();
      if (now - boss.lastFireAt < 100) return;
      boss.lastFireAt = now;
      const t = (now - boss.patternStartedAt) / 1000;
      const arms = 3;
      for (let i = 0; i < arms; i++) {
        const a = t * 3.6 + (i * Math.PI * 2) / arms;
        fireBossShotConed(a, 0.32, 6);
      }
    };
    /** Two counter-rotating spirals. */
    const doubleSpiralPattern: Pattern = () => {
      const now = performance.now();
      if (now - boss.lastFireAt < 115) return;
      boss.lastFireAt = now;
      const t = (now - boss.patternStartedAt) / 1000;
      const aCw = t * 3.4;
      const aCcw = -t * 3.4 + Math.PI * 0.5;
      fireBossShotConed(aCw, 0.34, 5.8);
      fireBossShotConed(aCw + Math.PI, 0.34, 5.8);
      fireBossShotConed(aCcw, 0.34, 5.8);
      fireBossShotConed(aCcw + Math.PI, 0.34, 5.8);
    };

    const PATTERNS_BY_PHASE: Pattern[][] = [
      // Phase 0 — warm-up, aimed + simple symmetry.
      [aimedPattern, spread3Pattern, crossPattern],
      // Phase 1 — geometry + first taste of spiral.
      [spread3Pattern, xPattern, fan5Pattern, star8Pattern, spiralPattern],
      // Phase 2 — full bullet hell.
      [doubleSpiralPattern, star8Pattern, spiralPattern, fan5Pattern, crossPattern, xPattern]
    ];

    const runBossPattern = () => {
      const phase = getBossPhase();
      // Reset cycle when entering a new phase.
      if (phase !== boss.currentPhase) {
        boss.currentPhase = phase;
        boss.patternIndex = 0;
        boss.patternStartedAt = performance.now();
        boss.lastFireAt = 0;
      }
      const list = PATTERNS_BY_PHASE[phase];
      const now = performance.now();
      if (now - boss.patternStartedAt > PATTERN_DURATION_MS) {
        boss.patternIndex = (boss.patternIndex + 1) % list.length;
        boss.patternStartedAt = now;
        boss.lastFireAt = 0;
      }
      list[boss.patternIndex]();
    };

    // ─── Visual laser + hit burst ────────────────────────────────────
    // Lasers fire from a pair of "wing guns" below the camera and
    // converge on the target point. Burst is a small sakura sphere that
    // pops at the impact location.
    const laserMat = new THREE.LineBasicMaterial({
      color: '#FF2630',
      transparent: true,
      opacity: 0.95,
      fog: false
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type Laser = { line: any; mat: any; bornAt: number };
    const lasers: Laser[] = [];
    const LASER_TTL_MS = 130;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spawnLaser = (target: any) => {
      for (const offsetX of [-0.42, 0.42]) {
        const from = new THREE.Vector3(
          camera.position.x + offsetX,
          camera.position.y - 0.45,
          camera.position.z - 0.6
        );
        const geom = new THREE.BufferGeometry().setFromPoints([from, target]);
        const mat = laserMat.clone();
        const line = new THREE.Line(geom, mat);
        scene.add(line);
        lasers.push({ line, mat, bornAt: performance.now() });
      }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type Burst = { mesh: any; mat: any; geom: any; bornAt: number };
    const bursts: Burst[] = [];
    const BURST_TTL_MS = 420;
    const burstGeoProto = new THREE.SphereGeometry(0.22, 10, 8);

    // ─── 火花 — 寿命つきパーティクルのプール (1 ドローコール) ─────────
    const SPARK_MAX = 360;
    const sparkPos = new Float32Array(SPARK_MAX * 3);
    const sparkVel = new Float32Array(SPARK_MAX * 3);
    const sparkLife = new Float32Array(SPARK_MAX); // 残り (s)
    const sparkLife0 = new Float32Array(SPARK_MAX);
    const sparkCol = new Float32Array(SPARK_MAX * 3);
    const sparkRatio = new Float32Array(SPARK_MAX); // 0..1 (シェーダ側のフェード)
    const sparkGeo = new THREE.BufferGeometry();
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    sparkGeo.setAttribute('aColor', new THREE.BufferAttribute(sparkCol, 3));
    sparkGeo.setAttribute('aRatio', new THREE.BufferAttribute(sparkRatio, 1));
    const sparkMat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      vertexShader: `
        attribute vec3 aColor;
        attribute float aRatio;
        varying vec3 vColor;
        varying float vRatio;
        void main () {
          vColor = aColor;
          vRatio = aRatio;
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = (120.0 * (0.35 + 0.65 * aRatio)) / max(1.0, -mv.z);
          gl_Position = projectionMatrix * mv;
        }`,
      fragmentShader: `
        varying vec3 vColor;
        varying float vRatio;
        void main () {
          vec2 d = gl_PointCoord - 0.5;
          float m = smoothstep(0.5, 0.1, length(d));
          if (vRatio <= 0.001) discard;
          gl_FragColor = vec4(vColor, m * vRatio);
        }`
    });
    const sparkPoints = new THREE.Points(sparkGeo, sparkMat);
    sparkPoints.frustumCulled = false;
    scene.add(sparkPoints);
    let sparkCursor = 0;

    const SPARK_INK = dark ? [0.96, 0.96, 0.95] : [0.13, 0.12, 0.15];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spawnSparks = (at: any, count = 22, sakuraRatio = 0.45) => {
      for (let n = 0; n < count; n++) {
        const i = sparkCursor;
        sparkCursor = (sparkCursor + 1) % SPARK_MAX;
        const o = i * 3;
        sparkPos[o] = at.x;
        sparkPos[o + 1] = at.y;
        sparkPos[o + 2] = at.z;
        // ランダム球殻方向 + 少し前方 (カメラ側) へ
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        const sp = 2.2 + Math.random() * 5.5;
        sparkVel[o] = Math.sin(ph) * Math.cos(th) * sp;
        sparkVel[o + 1] = Math.sin(ph) * Math.sin(th) * sp;
        sparkVel[o + 2] = Math.cos(ph) * sp * 0.7 + 1.2;
        const life = 0.45 + Math.random() * 0.5;
        sparkLife[i] = life;
        sparkLife0[i] = life;
        const sakura = Math.random() < sakuraRatio;
        sparkCol[o] = sakura ? 1.0 : SPARK_INK[0];
        sparkCol[o + 1] = sakura ? 0.149 : SPARK_INK[1];
        sparkCol[o + 2] = sakura ? 0.188 : SPARK_INK[2];
        sparkRatio[i] = 1;
      }
      sparkGeo.attributes.position.needsUpdate = true;
      sparkGeo.attributes.aColor.needsUpdate = true;
      sparkGeo.attributes.aRatio.needsUpdate = true;
    };

    const updateSparks = (dt: number) => {
      let any = false;
      for (let i = 0; i < SPARK_MAX; i++) {
        if (sparkLife[i] <= 0) continue;
        any = true;
        sparkLife[i] -= dt;
        const o = i * 3;
        sparkVel[o] *= 0.965;
        sparkVel[o + 1] = sparkVel[o + 1] * 0.965 - 2.2 * dt; // わずかな重力
        sparkVel[o + 2] *= 0.965;
        sparkPos[o] += sparkVel[o] * dt;
        sparkPos[o + 1] += sparkVel[o + 1] * dt;
        sparkPos[o + 2] += sparkVel[o + 2] * dt;
        sparkRatio[i] = Math.max(0, sparkLife[i] / sparkLife0[i]);
      }
      if (any) {
        sparkGeo.attributes.position.needsUpdate = true;
        sparkGeo.attributes.aRatio.needsUpdate = true;
      }
    };

    // ─── 画面シェイク — 着弾の手応え。減衰するランダムオフセット ───────
    // 同時に色収差もスパイクさせて、画面ごと歪む感触にする。
    let shakeAmp = 0;
    const kickShake = (amount: number) => {
      shakeAmp = Math.min(0.16, shakeAmp + amount);
      caBoost = Math.min(0.0055, caBoost + amount * 0.035);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spawnBurst = (at: any) => {
      const mat = new THREE.MeshBasicMaterial({
        color: '#FF2630',
        transparent: true,
        opacity: 1,
        fog: false
      });
      const mesh = new THREE.Mesh(burstGeoProto, mat);
      mesh.position.copy(at);
      scene.add(mesh);
      bursts.push({ mesh, mat, geom: burstGeoProto, bornAt: performance.now() });
      spawnSparks(at);
      kickShake(0.055);
    };

    // ─── Fire (Space / center-screen raycast) ───────────────────────
    // Casts a ray from camera through the screen center. If a cube is
    // in the line of sight, it's destroyed; either way we spawn a pair
    // of lasers for the "always firing" feel.
    const centerNdc = new THREE.Vector2(0, 0);
    const fire = () => {
      if (game.state !== 'playing') return;
      const now = performance.now();
      if (now - lastFireAt < FIRE_INTERVAL_MS) return;
      lastFireAt = now;

      scene.updateMatrixWorld(true);
      raycaster.setFromCamera(centerNdc, camera);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const hittables: any[] = cubes.map((c) => c.mesh).concat([mascot]);
      const intersects = raycaster.intersectObjects(hittables, true);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let hitObject: any = null;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let hitPoint: any = null;
      for (const it of intersects) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let obj: any = it.object;
        while (obj && !hittables.includes(obj)) obj = obj.parent;
        if (obj) { hitObject = obj; hitPoint = it.point.clone(); break; }
      }

      sfx.laser();

      if (!hitObject) {
        // Miss — still fire lasers off toward depth.
        const farPoint = new THREE.Vector3(
          camera.position.x,
          camera.position.y,
          camera.position.z - 40
        );
        spawnLaser(farPoint);
        return;
      }

      // Hit
      const cubeState = cubes.find((c) => c.mesh === hitObject);
      spawnLaser(hitPoint!);
      registerHit(hitObject, hitPoint!, cubeState);
    };

    const onClick = (e: MouseEvent) => detonate(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (t) detonate(t.clientX, t.clientY);
    };
    container.addEventListener('click', onClick);
    container.addEventListener('touchend', onTouch, { passive: true });

    // ─── Keyboard controls ────────────────────────────────────────────
    // Arrow keys / WASD strafe the ship; Space starts (from READY) or
    // continuously fires (in playing — auto-fire while held); Esc bails
    // back to idle. We only swallow keys when the game is engaged so
    // the user can still type in forms elsewhere on the page.
    const isEngaged = () => game.state === 'ready' || game.state === 'playing';

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          if (isEngaged()) { keys.up = true; e.preventDefault(); }
          break;
        case 'ArrowDown':
        case 'KeyS':
          if (isEngaged()) { keys.down = true; e.preventDefault(); }
          break;
        case 'ArrowLeft':
        case 'KeyA':
          if (isEngaged()) { keys.left = true; e.preventDefault(); }
          break;
        case 'ArrowRight':
        case 'KeyD':
          if (isEngaged()) { keys.right = true; e.preventDefault(); }
          break;
        case 'Space':
          if (game.state === 'ready') {
            e.preventDefault();
            startPlaying();
          } else if (game.state === 'playing') {
            e.preventDefault();
            keys.space = true;
          }
          break;
        case 'Escape':
          if (isEngaged()) { e.preventDefault(); goIdle(); }
          break;
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW': keys.up = false; break;
        case 'ArrowDown':
        case 'KeyS': keys.down = false; break;
        case 'ArrowLeft':
        case 'KeyA': keys.left = false; break;
        case 'ArrowRight':
        case 'KeyD': keys.right = false; break;
        case 'Space': keys.space = false; break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const clock = new THREE.Clock();
    let frame = 0;
    let lastT = 0;

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const dt = Math.min(0.05, t - lastT);
      lastT = t;
      const now = performance.now();

      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;

      // Steering: target-velocity model. Pressed key sets target velocity
      // to ±VEL_MAX; on release the target is 0. Actual velocity lerps
      // toward the target each frame for smooth-but-snappy response.
      // Pitch is intentionally suppressed (only roll banks) so the aim
      // reticle stays rock-steady when moving up/down.
      if (isEngaged()) {
        const targetVx = keys.right ? VEL_MAX : (keys.left ? -VEL_MAX : 0);
        const targetVy = keys.up    ? VEL_MAX : (keys.down ? -VEL_MAX : 0);
        pos.vx += (targetVx - pos.vx) * ACCEL_LERP;
        pos.vy += (targetVy - pos.vy) * ACCEL_LERP;
        pos.x  += pos.vx * dt;
        pos.y  += pos.vy * dt;
        if (pos.x >  POS_MAX_X) { pos.x =  POS_MAX_X; if (pos.vx > 0) pos.vx = 0; }
        if (pos.x < -POS_MAX_X) { pos.x = -POS_MAX_X; if (pos.vx < 0) pos.vx = 0; }
        if (pos.y >  POS_MAX_Y) { pos.y =  POS_MAX_Y; if (pos.vy > 0) pos.vy = 0; }
        if (pos.y < -POS_MAX_Y) { pos.y = -POS_MAX_Y; if (pos.vy < 0) pos.vy = 0; }
        camera.position.set(pos.x, pos.y, 9);
        // Smoothed roll — survives wall-hits without snapping back to 0.
        const targetBank = pos.vx * -0.045;
        bank.z += (targetBank - bank.z) * 0.16;
        camera.rotation.set(0, 0, bank.z);
        group.rotation.set(0, 0, 0);
      } else {
        // Idle drift back to origin.
        pos.vx *= VEL_DAMP;
        pos.vy *= VEL_DAMP;
        pos.x *= 0.94;
        pos.y *= 0.94;
        camera.position.set(0, 0, 9);
        camera.rotation.set(0, 0, 0);
        group.rotation.y = mouse.x * 0.45;
        group.rotation.x = -mouse.y * 0.35;
        group.rotation.z = 0;
      }

      // シェイク — カメラ位置決定の後に重ねて、減衰させる
      if (shakeAmp > 0.001) {
        camera.position.x += (Math.random() - 0.5) * 2 * shakeAmp;
        camera.position.y += (Math.random() - 0.5) * 2 * shakeAmp;
        shakeAmp *= Math.max(0, 1 - dt * 7);
      } else {
        shakeAmp = 0;
      }

      // 色収差スパイクの減衰
      if (caBoost > 0.00005) {
        caEffect.offset.set(0.0006 + caBoost, 0.0006 + caBoost);
        caBoost *= Math.max(0, 1 - dt * 5.5);
      } else if (caBoost !== 0) {
        caBoost = 0;
        caEffect.offset.set(0.0006, 0.0006);
      }

      // グリッドの前進 — 主線の周期 (5 マス) ぶん進んだら巻き戻して無限に流す
      gridScroll.value = (now * 0.0008) % (GRID_CELL * 5);

      group.position.y = -scrollY * 0.0015;


      // Auto-fire while Space is held during play.
      if (game.state === 'playing' && keys.space) fire();

      // Crosshair lock: tint sakura when a cube is sitting under the reticle.
      if (game.state === 'playing') {
        scene.updateMatrixWorld(true);
        raycaster.setFromCamera(centerNdc, camera);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const hittables: any[] = cubes.map((c) => c.mesh).concat([mascot]);
        const intersects = raycaster.intersectObjects(hittables, true);
        crosshair.style.color = intersects.length > 0 ? '#FF2630' : FG;
      }

      // Laser lifecycle — fade and remove.
      for (let i = lasers.length - 1; i >= 0; i--) {
        const l = lasers[i];
        const age = now - l.bornAt;
        if (age >= LASER_TTL_MS) {
          scene.remove(l.line);
          l.line.geometry.dispose();
          l.mat.dispose();
          lasers.splice(i, 1);
        } else {
          l.mat.opacity = 1 - age / LASER_TTL_MS;
        }
      }

      // Burst lifecycle — expand and fade.
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        const age = now - b.bornAt;
        if (age >= BURST_TTL_MS) {
          scene.remove(b.mesh);
          b.mat.dispose();
          bursts.splice(i, 1);
        } else {
          const t01 = age / BURST_TTL_MS;
          b.mesh.scale.setScalar(1 + t01 * 4.2);
          b.mat.opacity = 1 - t01;
        }
      }

      updateSparks(dt);

      // Enemy projectiles — fly forward toward the player. If they reach
      // the player's small hit-box, damage; otherwise they live until
      // they pass the camera or time out.
      for (let i = enemyProjs.length - 1; i >= 0; i--) {
        const p = enemyProjs[i];
        p.mesh.position.x += p.vel.x * dt;
        p.mesh.position.y += p.vel.y * dt;
        p.mesh.position.z += p.vel.z * dt;

        // トレイル — 弾の後方に伸びる残光。初回アクセスで遅延生成する
        if (!p.trail) {
          const tg = new THREE.BufferGeometry();
          tg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3));
          const tm = new THREE.LineBasicMaterial({
            color: '#FF2630',
            transparent: true,
            opacity: 0.42,
            fog: false
          });
          p.trail = new THREE.Line(tg, tm);
          p.trail.frustumCulled = false;
          scene.add(p.trail);
        }
        {
          const tp = p.trail.geometry.attributes.position.array as Float32Array;
          const vlen = Math.max(0.001, Math.hypot(p.vel.x, p.vel.y, p.vel.z));
          const k = 0.85 / vlen;
          tp[0] = p.mesh.position.x;
          tp[1] = p.mesh.position.y;
          tp[2] = p.mesh.position.z;
          tp[3] = p.mesh.position.x - p.vel.x * k;
          tp[4] = p.mesh.position.y - p.vel.y * k;
          tp[5] = p.mesh.position.z - p.vel.z * k;
          p.trail.geometry.attributes.position.needsUpdate = true;
        }

        const dx = p.mesh.position.x - pos.x;
        const dy = p.mesh.position.y - pos.y;
        const dz = p.mesh.position.z - 9;
        const close = Math.abs(dz) < 0.7 && Math.abs(dx) < 0.65 && Math.abs(dy) < 0.65;
        const expired = p.mesh.position.z > 12 || now - p.bornAt > 6500;
        if (close || expired) {
          if (close) damagePlayer();
          scene.remove(p.mesh);
          if (p.trail) {
            scene.remove(p.trail);
            p.trail.geometry.dispose();
            p.trail.material.dispose();
          }
          enemyProjs.splice(i, 1);
        }
      }

      // Update score readout (cheap, only changes on hit but keeps HUD honest).
      if (game.state === 'playing') {
        scoreEl.textContent = String(game.score).padStart(3, '0');
      }

      for (const c of cubes) {
        // Forward drift — each cube advances toward the camera. When it
        // passes the near edge, respawn it deep with fresh state. If
        // the player is in its lane, that's a ram → damage.
        c.basePos.z += c.forwardSpeed * dt;
        if (c.basePos.z > 6.5) {
          if (game.state === 'playing') {
            const dx = c.basePos.x - pos.x;
            const dy = c.basePos.y - pos.y;
            if (Math.abs(dx) < 1.4 && Math.abs(dy) < 1.4) damagePlayer();
          }
          respawnCube(c);
        }

        // Decay physics. Velocity adds to displacement; displacement
        // slowly pulls back toward the base position.
        c.velocity.multiplyScalar(0.93);
        c.displacement.add(c.velocity.clone().multiplyScalar(0.05));
        c.displacement.multiplyScalar(0.985);
        c.kickRot.multiplyScalar(0.9);
        c.hitFlash *= 0.88;
        c.hitSpin *= 0.88;

        c.mesh.rotation.x += c.rotSpeed.x * 0.01 + c.kickRot.x * 0.04 + c.hitSpin * 0.04;
        c.mesh.rotation.y += c.rotSpeed.y * 0.01 + c.kickRot.y * 0.04 + c.hitSpin * 0.05;
        c.mesh.rotation.z += c.rotSpeed.z * 0.01 + c.kickRot.z * 0.04;
        c.mesh.position.set(
          c.basePos.x + Math.cos(t * c.floatSpeed * 0.6 + c.phase) * c.floatAmp * 0.4 + c.displacement.x,
          c.basePos.y + Math.sin(t * c.floatSpeed + c.phase) * c.floatAmp + c.displacement.y,
          c.basePos.z + c.displacement.z
        );

        // Sakura emissive flash during hit decay.
        if (c.hitFlash > 0.02) {
          setEmissive(c.mesh.material, c.hitFlash * 1.0, c.hitFlash * 0.15, c.hitFlash * 0.18);
        } else if (c.lastFlash && c.lastFlash > 0.02) {
          setEmissive(c.mesh.material, 0, 0, 0);
        }
        c.lastFlash = c.hitFlash;
      }

      // Boss — appears once per round at the threshold score. Drifts
      // toward the player, fires phase-based bullet-hell patterns. Once
      // defeated (`boss.defeated`) it does not respawn this round.
      if (game.state === 'playing') {
        if (!boss.active && !boss.defeated && game.score >= boss.nextSpawnScore) {
          setBossActive(true);
        }
        if (boss.active) {
          boss.pos.x += (pos.x - boss.pos.x) * 0.012;
          boss.pos.y += (pos.y - boss.pos.y) * 0.012;
          boss.pos.z += 0.55 * dt;
          if (boss.pos.z > -2.5) boss.pos.z = -2.5;
          boss.pos.x += Math.sin(t * 1.4) * 0.4 * dt;
          boss.pos.y += Math.cos(t * 1.1) * 0.28 * dt;

          // Shield trigger — once HP crosses a threshold, boss raises
          // the barrier. Stays up until player shoots its shieldHp to 0.
          if (!boss.shielded) {
            for (const threshold of SHIELD_HP_THRESHOLDS) {
              if (boss.hp <= threshold && !triggeredShields.has(threshold)) {
                boss.shielded = true;
                boss.shieldHp = boss.shieldMaxHp;
                triggeredShields.add(threshold);
                barrier.visible = true;
                sfx.bossSpawn();
                break;
              }
            }
          }

          // Animate the barrier when up. Opacity scales with shieldHp:
          // a strong shield is dense, a battered one is faint.
          if (boss.shielded) {
            barrier.position.copy(boss.pos);
            barrier.rotation.y += dt * 1.4;
            barrier.rotation.x += dt * 0.6;
            const ratio = Math.max(0, boss.shieldHp / boss.shieldMaxHp);
            const base = 0.10 + ratio * 0.22;
            const pulse = Math.sin(now / 140) * 0.06;
            const flash = now < boss.shieldFlashUntil ? 0.28 : 0;
            barrierMat.opacity = base + pulse + flash;
            const s = mascot.scale.x * 1.05;
            barrier.scale.setScalar(s);
          }

          runBossPattern();
        }
      }

      mascotState.velocity.multiplyScalar(0.92);
      mascotState.displacement.add(mascotState.velocity.clone().multiplyScalar(0.05));
      mascotState.displacement.multiplyScalar(0.985);
      mascotState.kickRot.multiplyScalar(0.9);
      mascotState.hitFlash *= 0.88;
      mascotState.hitSpin *= 0.88;

      mascot.rotation.y = Math.sin(t * 0.6) * 0.5 + mouse.x * 0.6 + mascotState.kickRot.y * 0.05 + mascotState.hitSpin * 0.05;
      mascot.rotation.x = Math.sin(t * 0.4) * 0.12 + mouse.y * 0.2 + mascotState.kickRot.x * 0.05 + mascotState.hitSpin * 0.04;
      if (boss.active && game.state === 'playing') {
        mascot.position.copy(boss.pos);
      } else {
        mascot.position.set(
          1.2 + mascotState.displacement.x,
          -0.3 + Math.sin(t * 0.9) * 0.18 + mascotState.displacement.y,
          1.4 + mascotState.displacement.z
        );
      }
      if (mascotState.hitFlash > 0.02) {
        setEmissive(mascot.material, mascotState.hitFlash * 1.0, mascotState.hitFlash * 0.15, mascotState.hitFlash * 0.18);
      } else if ((mascotState as { lastFlash?: number }).lastFlash && (mascotState as { lastFlash?: number }).lastFlash! > 0.02) {
        setEmissive(mascot.material, 0, 0, 0);
      }
      (mascotState as { lastFlash?: number }).lastFlash = mascotState.hitFlash;

      // Warp-streak update — advance each line's start point along +Z;
      // tail is always STREAK_LEN behind it for the speed-line look.
      const pSpeed = 3.4;
      const linePosArr = pGeo.attributes.position.array as Float32Array;
      for (let i = 0; i < particleCount; i++) {
        pZ[i] += pSpeed * dt;
        if (pZ[i] > 9) {
          pX[i] = (Math.random() - 0.5) * 24;
          pY[i] = (Math.random() - 0.5) * 13;
          pZ[i] = -24 - Math.random() * 6;
        }
        const o = i * 6;
        linePosArr[o    ] = pX[i];
        linePosArr[o + 1] = pY[i];
        linePosArr[o + 2] = pZ[i];
        linePosArr[o + 3] = pX[i];
        linePosArr[o + 4] = pY[i];
        linePosArr[o + 5] = pZ[i] - STREAK_LEN;
      }
      pGeo.attributes.position.needsUpdate = true;

      composer.render();
    };
    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      composer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    cleanup = () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      container.removeEventListener('click', onClick);
      container.removeEventListener('touchend', onTouch);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      if (ringLayer.parentNode) ringLayer.parentNode.removeChild(ringLayer);
      if (gameUi.parentNode) gameUi.parentNode.removeChild(gameUi);
      if (readyOverlay.parentNode) readyOverlay.parentNode.removeChild(readyOverlay);
      if (crosshair.parentNode) crosshair.parentNode.removeChild(crosshair);
      if (bossHpEl.parentNode) bossHpEl.parentNode.removeChild(bossHpEl);
      if (gameOverEl.parentNode) gameOverEl.parentNode.removeChild(gameOverEl);
      if (scorePopLayer.parentNode) scorePopLayer.parentNode.removeChild(scorePopLayer);
      for (const l of lasers) {
        scene.remove(l.line);
        l.line.geometry.dispose();
        l.mat.dispose();
      }
      scene.remove(sparkPoints);
      sparkGeo.dispose();
      sparkMat.dispose();
      for (const g of [gridFloor, gridCeil]) {
        scene.remove(g);
        g.geometry.dispose();
        g.material.dispose();
      }
      for (const p of enemyProjs) {
        if (p.trail) {
          scene.remove(p.trail);
          p.trail.geometry.dispose();
          p.trail.material.dispose();
        }
      }
      envTex.dispose();
      for (const b of bursts) {
        scene.remove(b.mesh);
        b.mat.dispose();
      }
      for (const p of enemyProjs) scene.remove(p.mesh);
      burstGeoProto.dispose();
      laserMat.dispose();
      enemyProjGeo.dispose();
      enemyProjMat.dispose();
      barrierGeo.dispose();
      barrierMat.dispose();
      composer.dispose();
      bloom.dispose();
      clearMascotResetTimer();
      heroGameState.set('idle');
      heroGameScore.set(0);
      renderer.dispose();
      cubes.forEach((c) => {
        c.mesh.geometry.dispose();
        c.mesh.children.forEach((child: { geometry?: { dispose?: () => void } }) => {
          child.geometry?.dispose?.();
        });
      });
      materialsToDispose.forEach((m) => m.dispose?.());
      mascotGeo.dispose();
      mascotMats.forEach((m) => m.dispose());
      faceTex.dispose();
      logoTex.dispose();
      pGeo.dispose();
      pMat.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  });

  onDestroy(() => {
    destroyed = true;
    if (cleanup) cleanup();
  });

  // Draws the bitboxx "!?" logo mark on a canvas and returns a THREE texture.
  // Using a canvas rather than loading the PNG keeps the mark sharp at any
  // cube size and lets us control the padding precisely.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function makeLogoTexture(THREE: any) {
    const size = 512;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d')!;

    // white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // outer frame (matches favicon square border)
    const pad = size * 0.08;
    const border = size * 0.085;
    ctx.fillStyle = '#111014';
    ctx.fillRect(pad, pad, size - pad * 2, size - pad * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(pad + border, pad + border, size - (pad + border) * 2, size - (pad + border) * 2);

    // "!?" mark — solid black, centered
    ctx.fillStyle = '#111014';
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign = 'center';
    const px = Math.floor(size * 0.48);
    ctx.font = `900 ${px}px "Space Grotesk", "Helvetica Neue", Arial, sans-serif`;
    ctx.fillText('!?', size * 0.5, size * 0.68);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function makeFaceTexture(THREE: any) {
    const size = 512;
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // subtle cheek blush
    const blush = (x: number) => {
      const grd = ctx.createRadialGradient(x, size * 0.62, 0, x, size * 0.62, size * 0.16);
      grd.addColorStop(0, 'rgba(255, 160, 170, 0.75)');
      grd.addColorStop(1, 'rgba(255, 160, 170, 0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, size, size);
    };
    blush(size * 0.28);
    blush(size * 0.72);

    // eyes
    ctx.fillStyle = '#111014';
    const eyeY = size * 0.48;
    const eyeR = size * 0.035;
    const drawEye = (x: number) => {
      ctx.beginPath();
      ctx.arc(x, eyeY, eyeR, 0, Math.PI * 2);
      ctx.fill();
      // highlight
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(x - eyeR * 0.35, eyeY - eyeR * 0.35, eyeR * 0.35, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111014';
    };
    drawEye(size * 0.34);
    drawEye(size * 0.66);

    // smile
    ctx.strokeStyle = '#111014';
    ctx.lineWidth = size * 0.012;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(size * 0.5, size * 0.58, size * 0.05, 0, Math.PI);
    ctx.stroke();

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }
</script>

<div bind:this={container} class="absolute inset-0 w-full h-full"></div>
