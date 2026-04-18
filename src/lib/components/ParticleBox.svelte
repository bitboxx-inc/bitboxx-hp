<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  /** What the particles should assemble into. */
  export let text: string = '';
  /** When `text` is empty, draw the bitboxx !? logomark instead. */
  export let logoMark: boolean = true;
  export let height: number = 380;

  let container: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let raf = 0;
  let observer: IntersectionObserver | null = null;
  let resizeObserver: ResizeObserver | null = null;

  type P = {
    x: number; y: number;
    sx: number; sy: number;
    tx: number; ty: number;
    size: number;
    delay: number;
  };

  onMount(() => {
    if (typeof window === 'undefined') return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let h = 0;
    let particles: P[] = [];
    let animating = false;
    let hasAnimated = false;
    let started = 0;

    const sampleLogo = (octx: CanvasRenderingContext2D) => {
      const size = Math.min(width * 0.26, h * 0.78);
      const cx = width / 2;
      const cy = h / 2;
      const border = size * 0.09;
      octx.fillStyle = '#000';
      octx.fillRect(cx - size / 2, cy - size / 2, size, size);
      octx.fillStyle = '#fff';
      octx.fillRect(
        cx - size / 2 + border,
        cy - size / 2 + border,
        size - border * 2,
        size - border * 2
      );
      octx.fillStyle = '#000';
      octx.font = `900 ${Math.floor(size * 0.58)}px "Space Grotesk", "Helvetica Neue", sans-serif`;
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      octx.fillText('!?', cx, cy + size * 0.03);
    };

    const sampleText = (octx: CanvasRenderingContext2D) => {
      const fontPx = Math.min(width * 0.13, h * 0.72);
      octx.fillStyle = '#000';
      octx.font = `800 ${Math.floor(fontPx)}px "Fraunces", "Space Grotesk", serif`;
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';
      octx.fillText(text, width / 2, h / 2);
    };

    const setup = () => {
      width = container.clientWidth;
      h = container.clientHeight;
      canvas.width = width * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      // offscreen: rasterize the target shape and sample pixels
      const off = document.createElement('canvas');
      off.width = width;
      off.height = h;
      const octx = off.getContext('2d');
      if (!octx) return;
      octx.clearRect(0, 0, width, h);
      if (text) sampleText(octx);
      else if (logoMark) sampleLogo(octx);

      const data = octx.getImageData(0, 0, width, h).data;
      const step = prefersReduced ? 10 : 6;
      const next: P[] = [];
      for (let y = 0; y < h; y += step) {
        for (let x = 0; x < width; x += step) {
          const i = (y * width + x) * 4;
          if (data[i] < 60 && data[i + 3] > 160) {
            const sx = Math.random() * width;
            const sy = Math.random() * h;
            next.push({
              x: sx, y: sy,
              sx, sy,
              tx: x + (Math.random() - 0.5) * 2,
              ty: y + (Math.random() - 0.5) * 2,
              size: 1 + Math.random() * 1.2,
              delay: Math.random() * 0.35
            });
          }
        }
      }
      particles = next;
      hasAnimated = false;
      animating = false;
    };

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = () => {
      raf = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, width, h);

      if (animating) {
        const elapsed = (performance.now() - started) / 1600;
        for (const p of particles) {
          const pt = Math.max(0, Math.min(1, (elapsed - p.delay) / (1 - p.delay)));
          const e = easeOutCubic(pt);
          p.x = p.sx + (p.tx - p.sx) * e;
          p.y = p.sy + (p.ty - p.sy) * e;
        }
        if (elapsed >= 1) {
          animating = false;
          hasAnimated = true;
        }
      } else if (hasAnimated) {
        // idle breathing — each dot wanders within a small radius
        for (const p of particles) {
          p.x += (Math.random() - 0.5) * 0.25 + (p.tx - p.x) * 0.035;
          p.y += (Math.random() - 0.5) * 0.25 + (p.ty - p.y) * 0.035;
        }
      }

      ctx.fillStyle = '#111014';
      for (const p of particles) {
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    };

    let isReady = false;
    let startTimeout: ReturnType<typeof setTimeout> | null = null;

    const start = () => {
      if (!isReady) {
        setup();
        animate();
        isReady = true;
      }
      if (animating) return;
      // Re-scatter so every entry replays fresh.
      for (const p of particles) {
        p.sx = Math.random() * width;
        p.sy = Math.random() * h;
        p.x = p.sx;
        p.y = p.sy;
      }
      hasAnimated = false;
      if (startTimeout) clearTimeout(startTimeout);
      // Small beat so the user sees the scattered state before it assembles.
      startTimeout = setTimeout(() => {
        animating = true;
        started = performance.now();
      }, 180);
    };

    // Fire only when the section is well into the viewport — the top 65 %.
    // Prevents the animation from being already complete when the user arrives.
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) start();
        }
      },
      { rootMargin: '0px 0px -35% 0px', threshold: 0 }
    );
    observer.observe(container);

    resizeObserver = new ResizeObserver(() => {
      if (isReady) setup();
    });
    resizeObserver.observe(container);

    return () => {
      if (startTimeout) clearTimeout(startTimeout);
      cancelAnimationFrame(raf);
      observer?.disconnect();
      resizeObserver?.disconnect();
    };
  });

  onDestroy(() => {
    if (typeof window !== 'undefined' && raf) cancelAnimationFrame(raf);
  });
</script>

<div
  bind:this={container}
  class="relative w-full"
  style="height: {height}px;"
>
  <canvas bind:this={canvas} class="block w-full h-full" aria-hidden="true"></canvas>
</div>
