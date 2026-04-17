<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  let dot: HTMLDivElement | null = null;
  let ring: HTMLDivElement | null = null;
  let raf = 0;
  let supported = false;

  const target = { x: -100, y: -100 };
  const pos = { x: -100, y: -100 };

  onMount(() => {
    if (typeof window === 'undefined') return;
    supported = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!supported || !dot || !ring) return;

    const onMove = (e: MouseEvent) => {
      target.x = e.clientX;
      target.y = e.clientY;
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const hover = !!t.closest('a, button, input, textarea, select, label, [data-cursor="hover"]');
      ring?.classList.toggle('is-hover', hover);
      dot?.classList.toggle('is-hover', hover);
    };
    const onLeave = () => {
      target.x = -100;
      target.y = -100;
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    window.addEventListener('mouseleave', onLeave);

    const tick = () => {
      pos.x += (target.x - pos.x) * 0.18;
      pos.y += (target.y - pos.y) * 0.18;
      if (dot) dot.style.transform = `translate3d(${target.x}px, ${target.y}px, 0)`;
      if (ring) ring.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      window.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  });

  onDestroy(() => {
    if (typeof window !== 'undefined' && raf) cancelAnimationFrame(raf);
  });
</script>

<div class="cursor-ring" bind:this={ring} aria-hidden="true"></div>
<div class="cursor-dot" bind:this={dot} aria-hidden="true"></div>
