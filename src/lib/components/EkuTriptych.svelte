<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  // Three "ものさし" — preserved from the hero rhythm:
  // Excellent → 下線 (sakura underline strip)
  // Kawaii    → 文字そのものが sakura
  // Unique    → 句点だけ sakura
  const slides = [
    {
      word: 'Excellent.',
      italic: true,
      accent: 'underline' as const,
      label: '卓越',
      mark: '01 — Standard',
      body: '妥協なく、細部まで仕上げ切ったもの。'
    },
    {
      word: 'Kawaii.',
      italic: true,
      accent: 'fill' as const,
      label: '愛らしさ',
      mark: '02 — Affection',
      body: '使うたびに、すこし好きになっていくもの。'
    },
    {
      word: 'Unique.',
      italic: false,
      accent: 'period' as const,
      label: '唯一無二',
      mark: '03 — Singular',
      body: 'ほかでは見たことのない、新しいかたち。'
    }
  ];

  const SAKURA = '#FF2630';
  const INK = '#111014';

  let container: HTMLElement;
  let stickyEl: HTMLDivElement;
  let canvas: HTMLCanvasElement;
  let activeIdx = 0;

  onMount(() => {
    if (typeof window === 'undefined') return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0;
    let H = 0;

    type P = {
      x: number; y: number;        // current
      tx: number; ty: number;      // target
      sakura: boolean;             // tinted accent?
      size: number;
      jitterAmp: number;
      jitterPhase: number;
    };

    let particles: P[] = [];
    let slideTargets: { x: number; y: number; sakura: boolean }[][] = [];

    const sampleWord = (w: { word: string; italic: boolean; accent: 'underline' | 'fill' | 'period' }) => {
      const off = document.createElement('canvas');
      off.width = W;
      off.height = H;
      const octx = off.getContext('2d', { willReadFrequently: true });
      if (!octx) return [];

      const fontStack = '"Fraunces", "Hiragino Mincho ProN", "Noto Serif JP", Georgia, serif';
      const styleStr = (px: number) => `${w.italic ? 'italic ' : ''}800 ${px}px ${fontStack}`;

      // Start from the larger of width-driven / height-driven sizing.
      let fontPx = Math.min(W * 0.22, H * 0.48);
      // Auto-fit: scale down if the rendered word would overflow 86% of the canvas width.
      octx.font = styleStr(fontPx);
      const measured = octx.measureText(w.word).width;
      const maxTextW = W * 0.86;
      if (measured > maxTextW) {
        fontPx = fontPx * (maxTextW / measured);
      }
      octx.font = styleStr(fontPx);
      octx.textAlign = 'center';
      octx.textBaseline = 'middle';

      // INK pass — black body of the word
      octx.fillStyle = '#000000';
      octx.fillText(w.word, W / 2, H / 2);

      // SAKURA pass — drawn into a separate channel: we sample alpha from a
      // tagged canvas using a magenta-ish marker color, then merge by position.
      const mark = document.createElement('canvas');
      mark.width = W;
      mark.height = H;
      const mctx = mark.getContext('2d');
      if (mctx) {
        mctx.fillStyle = '#ff00ff';
        mctx.textAlign = 'center';
        mctx.textBaseline = 'middle';
        mctx.font = styleStr(fontPx);
        // measure where the word starts/ends so we can paint
        // the per-style accent in the right place.
        const metrics = mctx.measureText(w.word);
        const wordW = metrics.width;
        const left = W / 2 - wordW / 2;
        const baseline = H / 2 + fontPx * 0.08;

        if (w.accent === 'underline') {
          // Sakura highlight strip behind the word — same idea as
          // `.underline-handwritten` in the hero. Sits over the lower glyph
          // body so particles in that band tint sakura.
          mctx.fillRect(left, baseline - fontPx * 0.22, wordW, fontPx * 0.22);
          // Mask: erase parts outside the actual letter shapes by
          // intersecting with the ink pass.
          mctx.globalCompositeOperation = 'destination-in';
          mctx.fillStyle = '#000';
          mctx.font = styleStr(fontPx);
          mctx.fillText(w.word, W / 2, H / 2);
          mctx.globalCompositeOperation = 'source-over';
        } else if (w.accent === 'fill') {
          // Whole word is sakura.
          mctx.fillStyle = '#ff00ff';
          mctx.fillText(w.word, W / 2, H / 2);
        } else if (w.accent === 'period') {
          // Period only — paint the full word in sakura, then knock out
          // the pre-period substring so what remains is exactly the
          // trailing dot (matches the font's actual period glyph).
          const baseWord = w.word.replace(/\.$/, '');
          mctx.textAlign = 'left';
          mctx.textBaseline = 'middle';
          mctx.font = styleStr(fontPx);
          // Re-measure with left alignment so both fills land at the same x.
          const fullW = mctx.measureText(w.word).width;
          const startX = W / 2 - fullW / 2;

          mctx.fillStyle = '#ff00ff';
          mctx.fillText(w.word, startX, H / 2);

          mctx.globalCompositeOperation = 'destination-out';
          mctx.fillStyle = '#000';
          mctx.fillText(baseWord, startX, H / 2);
          mctx.globalCompositeOperation = 'source-over';
        }
      }

      const inkData = octx.getImageData(0, 0, W, H).data;
      const markData = mctx ? mctx.getImageData(0, 0, W, H).data : null;
      const step = prefersReduced ? 8 : 4;
      const out: { x: number; y: number; sakura: boolean }[] = [];
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          const i = (y * W + x) * 4;
          if (inkData[i + 3] > 160) {
            const isSakura = !!markData && markData[i + 3] > 120;
            out.push({ x, y, sakura: isSakura });
          }
        }
      }
      return out;
    };

    const setup = () => {
      // Size to the *visible* sticky pane, not the outer section
      // (otherwise the canvas overflows the sticky and clips at its bottom).
      W = stickyEl.clientWidth;
      H = stickyEl.clientHeight;
      if (W <= 0 || H <= 0) return; // pre-layout — ResizeObserver will retrigger
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      slideTargets = slides.map(sampleWord);

      const maxLen = Math.max(...slideTargets.map((s) => s.length));
      // Build particle pool. Each particle keeps a personal jitter so
      // even "settled" words breathe instead of freezing.
      particles = new Array(maxLen).fill(0).map(() => ({
        x: Math.random() * W,
        y: Math.random() * H,
        tx: Math.random() * W,
        ty: Math.random() * H,
        sakura: false,
        size: 1.2 + Math.random() * 1.5,
        jitterAmp: 0.25 + Math.random() * 0.45,
        jitterPhase: Math.random() * Math.PI * 2
      }));
    };

    const updateTargets = (idx: number) => {
      const targets = slideTargets[idx];
      // Sort targets once per switch so particles travel coherent paths
      // (sorting by hash of position keeps the same particle index → same target).
      for (let i = 0; i < particles.length; i++) {
        if (i < targets.length) {
          particles[i].tx = targets[i].x + (Math.random() - 0.5) * 1.5;
          particles[i].ty = targets[i].y + (Math.random() - 0.5) * 1.5;
          particles[i].sakura = targets[i].sakura;
        } else {
          // Overflow — drift gently off the bottom edge.
          particles[i].tx = Math.random() * W;
          particles[i].ty = H + 40 + Math.random() * 80;
          particles[i].sakura = false;
        }
      }
    };

    setup();
    updateTargets(0);

    const onScroll = () => {
      const rect = container.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = Math.max(1, rect.height - vh);
      const passed = Math.min(Math.max(0, -rect.top), total);
      // Map 0..1 to 0..slides.length. Each slot's morph completes in the
      // first 40%, then dwells for 60% — so the descriptor stays
      // readable even when the user scrolls quickly.
      const p = (passed / total) * slides.length;
      const idx = Math.min(slides.length - 1, Math.floor(p));
      if (idx !== activeIdx) {
        activeIdx = idx;
        updateTargets(idx);
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const ro = new ResizeObserver(() => {
      setup();
      updateTargets(activeIdx);
    });
    ro.observe(stickyEl);

    // Mouse: gentle repulsion field over the canvas.
    const mouse = { x: -9999, y: -9999, active: false };
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active = true;
    };
    const onLeave = () => { mouse.active = false; mouse.x = -9999; mouse.y = -9999; };
    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('mouseleave', onLeave);

    let raf = 0;
    const clock = performance.now();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = (performance.now() - clock) / 1000;
      ctx.clearRect(0, 0, W, H);

      for (const p of particles) {
        // Approach target.
        const dx = p.tx - p.x;
        const dy = p.ty - p.y;
        p.x += dx * (prefersReduced ? 0.25 : 0.09);
        p.y += dy * (prefersReduced ? 0.25 : 0.09);

        // Mouse repulsion — soft, capped.
        if (mouse.active) {
          const mx = p.x - mouse.x;
          const my = p.y - mouse.y;
          const d2 = mx * mx + my * my;
          if (d2 < 110 * 110) {
            const d = Math.max(8, Math.sqrt(d2));
            const f = (110 - d) / 110;
            p.x += (mx / d) * f * 6;
            p.y += (my / d) * f * 6;
          }
        }

        // Idle jitter once settled, so the word breathes.
        const settled = Math.abs(dx) < 1.2 && Math.abs(dy) < 1.2;
        if (settled && !prefersReduced) {
          p.x += Math.sin(t * 1.4 + p.jitterPhase) * p.jitterAmp * 0.12;
          p.y += Math.cos(t * 1.1 + p.jitterPhase) * p.jitterAmp * 0.12;
        }
      }

      // Paint — ink particles first, then sakura on top.
      ctx.fillStyle = INK;
      for (const p of particles) {
        if (p.sakura) continue;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.fillStyle = SAKURA;
      for (const p of particles) {
        if (!p.sakura) continue;
        ctx.fillRect(p.x, p.y, p.size + 0.4, p.size + 0.4);
      }
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('mouseleave', onLeave);
      ro.disconnect();
    };
  });

  onDestroy(() => {});
</script>

<section
  bind:this={container}
  id="philosophy"
  class="relative scroll-mt-24"
  style="height: 160vh;"
  aria-label="bitboxx の三つのものさし"
>
  <div
    bind:this={stickyEl}
    class="sticky top-0 h-screen w-full overflow-hidden paper-grain"
  >
    <canvas
      bind:this={canvas}
      class="absolute inset-0 w-full h-full"
      aria-hidden="true"
    ></canvas>

    <div class="relative z-10 h-full max-w-[1400px] mx-auto px-6 md:px-10 pointer-events-none">
      <!-- top-left section label — establishes the unifying concept -->
      <div class="absolute top-24 md:top-28 left-6 md:left-10 max-w-[22ch]">
        <h2 class="font-mincho text-sm font-normal tracking-[0.2em] text-ink/55">三つのものさし</h2>
        <p class="mt-2 font-mincho text-[12px] md:text-[13px] leading-[1.8] text-ink/50">
          このどれかに当てはまるもの、だけをつくります。
        </p>
      </div>

      <!-- top-right progress ticks -->
      <div class="absolute top-24 md:top-28 right-6 md:right-10 flex items-center gap-3">
        {#each slides as s, i (s.word)}
          <span
            class="font-mono text-[10px] tracking-[0.24em]"
            style="color: {i === activeIdx ? INK : 'rgba(17,16,20,0.35)'};"
          >
            0{i + 1}
          </span>
          {#if i < slides.length - 1}
            <span class="w-6 h-px bg-ink/15"></span>
          {/if}
        {/each}
      </div>

      <!-- bottom-left descriptor — stronger to anchor the section.
           All slides rendered; opacity toggles for smooth slide-to-slide fade. -->
      <div class="absolute bottom-10 md:bottom-14 left-6 md:left-10 max-w-md md:max-w-xl">
        {#each slides as s, i}
          <div
            class="font-mincho text-ink transition-opacity duration-300"
            style="opacity: {i === activeIdx ? 1 : 0}; {i === activeIdx ? '' : 'position:absolute; inset:0;'}"
          >
            <p class="font-mono text-[10px] tracking-[0.3em] text-ink/55">{s.mark}</p>
            <p class="mt-3 text-4xl md:text-6xl font-display italic leading-[1.05] tracking-hyper">
              {s.label}<span class="text-sakura">.</span>
            </p>
            <p class="mt-5 md:mt-6 text-[14px] md:text-[16px] leading-[2.1] text-ink/80 max-w-md">
              {s.body}
            </p>
          </div>
        {/each}
      </div>

    </div>
  </div>

</section>

<style>
  /* Hard fallback so static SSR paint is at least readable. */
  canvas { background: transparent; }
</style>
