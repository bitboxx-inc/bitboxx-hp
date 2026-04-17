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
      new THREE.Color('#FF7A8A')  // single sakura accent
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

    const count = prefersReduced ? 8 : 16;
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
      const radius = 2.8 + Math.random() * 2.4;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 3.2;
      mesh.position.set(
        Math.cos(theta) * radius,
        y,
        Math.sin(theta) * radius - 1.0
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
        phase: Math.random() * Math.PI * 2
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

    // Tiny particles
    const particleCount = prefersReduced ? 60 : 180;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3]     = (Math.random() - 0.5) * 18;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: '#111014',
      size: 0.035,
      transparent: true,
      opacity: 0.5
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

    const clock = new THREE.Clock();
    let frame = 0;

    const animate = () => {
      frame = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;

      group.rotation.y = mouse.x * 0.45;
      group.rotation.x = -mouse.y * 0.35;
      group.position.y = -scrollY * 0.0015;

      for (const c of cubes) {
        c.mesh.rotation.x += c.rotSpeed.x * 0.01;
        c.mesh.rotation.y += c.rotSpeed.y * 0.01;
        c.mesh.rotation.z += c.rotSpeed.z * 0.01;
        c.mesh.position.y = c.basePos.y + Math.sin(t * c.floatSpeed + c.phase) * c.floatAmp;
        c.mesh.position.x = c.basePos.x + Math.cos(t * c.floatSpeed * 0.6 + c.phase) * c.floatAmp * 0.4;
      }

      mascot.rotation.y = Math.sin(t * 0.6) * 0.5 + mouse.x * 0.6;
      mascot.rotation.x = Math.sin(t * 0.4) * 0.12 + mouse.y * 0.2;
      mascot.position.y = -0.3 + Math.sin(t * 0.9) * 0.18;

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
