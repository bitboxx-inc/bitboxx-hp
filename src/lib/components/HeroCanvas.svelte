<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let container: HTMLDivElement;
  let cleanup: (() => void) | null = null;

  onMount(async () => {
    if (typeof window === 'undefined') return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const THREE: any = await import('three');

    const scene = new THREE.Scene();
    // Atmospheric perspective — far objects fade to the page's cream so the
    // scene reads as a real receding space rather than a flat cluster.
    scene.fog = new THREE.FogExp2(0xfaf8f4, 0.052);

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
    const palette = [
      new THREE.Color('#111014'), // ink
      new THREE.Color('#1F1D24'), // near ink
      new THREE.Color('#2A272F'),
      new THREE.Color('#4B4752'),
      new THREE.Color('#E6E6E2'), // light gray
      new THREE.Color('#CFCFC9'),
      new THREE.Color('#FF2630')  // single sakura accent (birthdays 12/26 + 04/30)
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

    const count = prefersReduced ? 5 : 10;
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
      } else {
        const color = palette[i % palette.length];
        const m = makeMat({ color });
        materialsToDispose.push(m);
        material = m;
      }

      const mesh = new THREE.Mesh(geo, material);
      // Wider radial + Y spread, deeper Z offset so far cubes recede into fog.
      const radius = 2.8 + Math.random() * 3.6;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 3.6;
      mesh.position.set(
        Math.cos(theta) * radius,
        y,
        Math.sin(theta) * radius - 2.5
      );
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      group.add(mesh);

      // Thin edge lines — gives each cube a subtle wireframe overlay
      // reminiscent of a blueprint / CPU render.
      const edges = new THREE.EdgesGeometry(geo, 18);
      const edgeMat = new THREE.LineBasicMaterial({
        color: '#111014',
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
        hitCooldown: 0
      });
    }

    // Mascot cube — the star with kawaii face
    const mascotSize = 1.9;
    const mascotGeo = makeBox(mascotSize);
    const faceTex = makeFaceTexture(THREE);
    const mascotMats = [
      makeMat({ color: '#FFFFFF' }),
      makeMat({ color: '#FFFFFF' }),
      makeMat({ color: '#FFFFFF' }),
      makeMat({ color: '#FFFFFF' }),
      makeMat({ color: '#FFFFFF', map: faceTex }),
      makeMat({ color: '#FFFFFF' })
    ];
    const mascot = new THREE.Mesh(mascotGeo, mascotMats);
    mascot.position.set(1.2, -0.3, 1.4);
    group.add(mascot);

    // Tiny particles — denser and spread deeper into Z to read as "space dust"
    // receding through the fog.
    const particleCount = prefersReduced ? 90 : 260;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 22;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 18 - 4;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: '#111014',
      size: 0.04,
      transparent: true,
      opacity: 0.55,
      fog: true
    });
    const points = new THREE.Points(pGeo, pMat);
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
    // First direct-hit on a cube starts a 10-second window; subsequent
    // direct-hits add to the score. The HUD appears only during play.
    const game = {
      state: 'idle' as 'idle' | 'playing' | 'gameover',
      score: 0,
      startTime: 0,
      duration: 10000
    };

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
      'color:#111014',
      'opacity:0',
      'transition:opacity 280ms ease',
      'text-align:center'
    ].join(';');
    gameUi.innerHTML = `
      <div>
        <div style="font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(17,16,20,0.5);">Time</div>
        <div data-time style="font-size:22px;letter-spacing:0.02em;margin-top:4px;font-variant-numeric:tabular-nums;transition:color 200ms;">10.0</div>
      </div>
      <div style="width:1px;background:rgba(17,16,20,0.18);align-self:stretch;"></div>
      <div>
        <div style="font-size:9px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(17,16,20,0.5);">Score</div>
        <div data-score style="font-size:22px;letter-spacing:0.02em;margin-top:4px;font-variant-numeric:tabular-nums;display:inline-block;">00</div>
      </div>
    `;
    container.appendChild(gameUi);
    const timeEl = gameUi.querySelector('[data-time]') as HTMLElement;
    const scoreEl = gameUi.querySelector('[data-score]') as HTMLElement;

    const pulseScore = () => {
      scoreEl.style.transition = 'transform 90ms ease-out';
      scoreEl.style.transform = 'scale(1.22)';
      setTimeout(() => {
        scoreEl.style.transition = 'transform 260ms cubic-bezier(.2,.8,.2,1)';
        scoreEl.style.transform = 'scale(1)';
      }, 90);
    };

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

      // Feedback: sakura flash + bonus spin.
      stateObj.hitFlash = 1.0;
      stateObj.hitSpin += 14;
      if (stateObj.hitSpin > 30) stateObj.hitSpin = 30;
      stateObj.hitCooldown = now + 260;

      // Game: any direct hit (re)starts the round.
      if (game.state !== 'playing') {
        game.state = 'playing';
        game.score = 0;
        game.startTime = now;
        gameUi.style.opacity = '1';
        timeEl.style.color = '#111014';
      }
      game.score++;
      pulseScore();
    };

    const onClick = (e: MouseEvent) => detonate(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.changedTouches[0];
      if (t) detonate(t.clientX, t.clientY);
    };
    container.addEventListener('click', onClick);
    container.addEventListener('touchend', onTouch, { passive: true });

    const clock = new THREE.Clock();
    let frame = 0;

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      const now = performance.now();

      // Game timer
      if (game.state === 'playing') {
        const remaining = Math.max(0, game.duration - (now - game.startTime));
        timeEl.textContent = (remaining / 1000).toFixed(1);
        scoreEl.textContent = String(game.score).padStart(2, '0');
        // Final 3 seconds: time text turns sakura.
        timeEl.style.color = remaining <= 3000 ? '#FF2630' : '#111014';
        if (remaining <= 0) {
          game.state = 'gameover';
          timeEl.textContent = '00.0';
        }
      }

      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;

      group.rotation.y = mouse.x * 0.45;
      group.rotation.x = -mouse.y * 0.35;
      group.position.y = -scrollY * 0.0015;

      for (const c of cubes) {
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

      mascotState.velocity.multiplyScalar(0.92);
      mascotState.displacement.add(mascotState.velocity.clone().multiplyScalar(0.05));
      mascotState.displacement.multiplyScalar(0.985);
      mascotState.kickRot.multiplyScalar(0.9);
      mascotState.hitFlash *= 0.88;
      mascotState.hitSpin *= 0.88;

      mascot.rotation.y = Math.sin(t * 0.6) * 0.5 + mouse.x * 0.6 + mascotState.kickRot.y * 0.05 + mascotState.hitSpin * 0.05;
      mascot.rotation.x = Math.sin(t * 0.4) * 0.12 + mouse.y * 0.2 + mascotState.kickRot.x * 0.05 + mascotState.hitSpin * 0.04;
      mascot.position.set(
        1.2 + mascotState.displacement.x,
        -0.3 + Math.sin(t * 0.9) * 0.18 + mascotState.displacement.y,
        1.4 + mascotState.displacement.z
      );
      if (mascotState.hitFlash > 0.02) {
        setEmissive(mascot.material, mascotState.hitFlash * 1.0, mascotState.hitFlash * 0.15, mascotState.hitFlash * 0.18);
      } else if ((mascotState as { lastFlash?: number }).lastFlash && (mascotState as { lastFlash?: number }).lastFlash! > 0.02) {
        setEmissive(mascot.material, 0, 0, 0);
      }
      (mascotState as { lastFlash?: number }).lastFlash = mascotState.hitFlash;

      points.rotation.y = t * 0.02;

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
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
      if (ringLayer.parentNode) ringLayer.parentNode.removeChild(ringLayer);
      if (gameUi.parentNode) gameUi.parentNode.removeChild(gameUi);
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
