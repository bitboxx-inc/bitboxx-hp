<script lang="ts">
  /**
   * 1-bit ディザの風景 — 山稜と流れる雲を Bayer 行列で点描する。
   * 「bit」のアイデンティティをそのまま絵にしたクロージングセクション。
   * インクの点 + 太陽だけサクラ。手続き生成なので画像アセット不要。
   */
  import { onMount } from 'svelte';

  let canvas: HTMLCanvasElement;
  let host: HTMLElement;

  const INK = 'rgba(17,16,20,0.82)';
  const SAKURA = '#FF2630';

  // Bayer 4x4 — 0..1 のしきい値
  const BAYER = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
  ].map((row) => row.map((v) => (v + 0.5) / 16));

  onMount(() => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const CELL = 5; // ドット間隔 (CSS px)
    let W = 0;
    let H = 0;
    let cols = 0;
    let rows = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      W = host.clientWidth;
      H = host.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / CELL);
      rows = Math.ceil(H / CELL);
    };
    resize();

    // 軽量 value noise (雲用)
    const perm = new Uint8Array(512);
    for (let i = 0; i < 256; i++) perm[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = (i * 16807 + 13) % (i + 1); // 固定シード — リロードで同じ空
      const t = perm[i];
      perm[i] = perm[j];
      perm[j] = t;
    }
    for (let i = 0; i < 256; i++) perm[256 + i] = perm[i];
    const hash = (x: number, y: number) => perm[(perm[x & 255] + y) & 255] / 255;
    const smooth = (t: number) => t * t * (3 - 2 * t);
    const noise = (x: number, y: number) => {
      const xi = Math.floor(x);
      const yi = Math.floor(y);
      const xf = x - xi;
      const yf = y - yi;
      const a = hash(xi, yi);
      const b = hash(xi + 1, yi);
      const c = hash(xi, yi + 1);
      const d = hash(xi + 1, yi + 1);
      const u = smooth(xf);
      const v = smooth(yf);
      return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
    };

    // 山稜線 — 富士山型の主峰 + 前景の稜線
    const ridgeMain = (nx: number) => {
      const peak = 0.46; // 山頂の x 位置
      const d = Math.abs(nx - peak);
      const slope = Math.max(0, 1 - d * 2.6);
      const detail = noise(nx * 18, 3.7) * 0.025;
      return 0.94 - slope * 0.52 - detail; // y (0=上端)
    };
    const ridgeFore = (nx: number) =>
      0.93 - noise(nx * 5 + 40, 11.3) * 0.14;

    const SUN = { x: 0.76, y: 0.30, r: 0.085 }; // 比率指定

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const sunR = SUN.r * Math.min(W, H * 1.6);
      const sunX = SUN.x * W;
      const sunY = SUN.y * H;

      for (let gy = 0; gy < rows; gy++) {
        const ny = gy / rows;
        for (let gx = 0; gx < cols; gx++) {
          const nx = gx / cols;

          // 輝度 (0 = 黒, 1 = 白) を手続き的に合成
          let L = 0.96 - ny * 0.07; // 空のごく薄いグラデーション

          // 雲 — ゆっくり横に流れる
          const cl = noise(nx * 6 + t * 0.018, ny * 10 + 2.5) * 0.6 +
                     noise(nx * 13 + t * 0.03, ny * 22 + 7.1) * 0.4;
          if (ny < 0.62) {
            const band = Math.sin(Math.min(1, ny / 0.62) * Math.PI); // 中空に集中
            L -= Math.max(0, cl - 0.58) * 1.5 * band;
          }

          // 山 — 主峰 (淡) と前景稜線 (濃)
          if (ny > ridgeMain(nx)) L = Math.min(L, 0.42 + (ny - ridgeMain(nx)) * 0.5);
          if (ny > ridgeFore(nx)) L = Math.min(L, 0.16);

          // 太陽 — サクラの円盤。輪郭を少しだけディザらせる
          const px = nx * W;
          const py = ny * H;
          const sd = Math.hypot(px - sunX, py - sunY);
          const inSun = sd < sunR;

          const threshold = BAYER[gy & 3][gx & 3];
          if (inSun) {
            // 円盤内はほぼ全点、縁だけ間引いて「ビットの円」に
            const edge = (sunR - sd) / sunR;
            if (edge > 0.12 || threshold < edge / 0.12) {
              ctx.fillStyle = SAKURA;
              ctx.fillRect(gx * CELL, gy * CELL, 2.4, 2.4);
            }
            continue;
          }

          if (1 - L > threshold) {
            ctx.fillStyle = INK;
            ctx.fillRect(gx * CELL, gy * CELL, 2.2, 2.2);
          }
        }
      }
    };

    draw();

    let raf = 0;
    let last = 0;
    const loop = (ts: number) => {
      raf = requestAnimationFrame(loop);
      if (ts - last < 90) return; // 約 11fps — 点描の質感に合うコマ送り
      t += (ts - last) / 100;
      last = ts;
      draw();
    };

    // 視界内のときだけ雲を流す
    let running = false;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting && !prefersReduced && !running) {
          running = true;
          raf = requestAnimationFrame(loop);
        } else if (!e.isIntersecting && running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      }
    });
    io.observe(host);

    const ro = new ResizeObserver(() => {
      resize();
      draw();
    });
    ro.observe(host);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  });
</script>

<div bind:this={host} class="relative w-full h-full">
  <canvas bind:this={canvas} class="absolute inset-0" aria-hidden="true"></canvas>
</div>
