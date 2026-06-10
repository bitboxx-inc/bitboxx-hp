<script lang="ts">
  /** 画面下中央のフローティングピルナビ。デスクトップはリンク列、モバイルはメニュー起動。 */
  import { createEventDispatcher } from 'svelte';

  export let links: Array<[string, string]> = [];
  export let contactHref = '#contact-form';
  export let homeHref = '/';

  const dispatch = createEventDispatcher<{ menu: void }>();
</script>

<nav
  aria-label="メイン"
  class="fixed bottom-5 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-1 rounded-full bg-ink/90 backdrop-blur-md px-2 py-2 shadow-[0_18px_40px_-18px_rgba(17,16,20,0.55)]"
>
  <a
    href={homeHref}
    class="grid place-items-center w-9 h-9 rounded-full bg-cream-50 text-ink font-mono text-[13px] leading-none hover:bg-sakura hover:text-white transition-colors"
    aria-label="bitboxx トップへ"
  >!?</a>

  <div class="hidden md:flex items-center">
    {#each links as [href, label] (href)}
      <a
        {href}
        class="px-3.5 py-2 rounded-full font-mincho text-[12.5px] text-cream-50/75 hover:text-white hover:bg-white/10 transition-colors whitespace-nowrap"
      >
        {label}
      </a>
    {/each}
  </div>

  <button
    type="button"
    class="md:hidden px-4 py-2 rounded-full font-mincho text-[13px] whitespace-nowrap text-cream-50/85 hover:text-white hover:bg-white/10 transition-colors"
    on:click={() => dispatch('menu')}
  >
    メニュー
  </button>

  <a
    href={contactHref}
    class="ml-1 inline-flex items-center gap-2 px-5 py-2 rounded-full bg-cream-50 text-ink hover:bg-sakura hover:text-white transition-colors font-mincho text-[12.5px] md:text-[13px] whitespace-nowrap"
  >
    相談する
    <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
  </a>
</nav>
