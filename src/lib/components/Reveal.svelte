<script lang="ts">
  import { onMount } from 'svelte';

  export let delay: number = 0;
  export let as: string = 'div';
  export let klass: string = '';

  let el: HTMLElement;

  onMount(() => {
    if (typeof window === 'undefined' || !el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  });
</script>

<svelte:element
  this={as}
  bind:this={el}
  class={`reveal ${delay ? `reveal-delay-${delay}` : ''} ${klass}`}
>
  <slot />
</svelte:element>
