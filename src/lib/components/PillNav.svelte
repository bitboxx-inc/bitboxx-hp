<script lang="ts">
  /** 画面下中央のフローティングピルナビ。
   *  一枚絵サイトの司令塔 — 項目はリンクではなくパネルを開くボタン。 */
  import { createEventDispatcher } from 'svelte';

  export let items: Array<{ id: string; label: string }> = [];
  export let active: string | null = null;

  const dispatch = createEventDispatcher<{ open: string; home: void; menu: void }>();
</script>

<nav
  aria-label="メイン"
  class="fixed bottom-5 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-1 rounded-full bg-ink/90 backdrop-blur-md border border-white/10 px-2 py-2 shadow-[0_18px_40px_-18px_rgba(17,16,20,0.55)]"
>
  <button
    type="button"
    class="grid place-items-center w-9 h-9 rounded-full bg-cream-50 text-ink font-mono text-[13px] leading-none hover:bg-sakura hover:text-white transition-colors"
    aria-label="一枚絵に戻る"
    on:click={() => dispatch('home')}
  >!?</button>

  <div class="hidden md:flex items-center">
    {#each items as item (item.id)}
      <button
        type="button"
        class={`px-3.5 py-2 rounded-full font-mincho text-[12.5px] transition-colors whitespace-nowrap
          ${active === item.id ? 'bg-white/15 text-white' : 'text-cream-50/75 hover:text-white hover:bg-white/10'}`}
        aria-pressed={active === item.id}
        on:click={() => dispatch('open', item.id)}
      >
        {item.label}
      </button>
    {/each}
  </div>

  <button
    type="button"
    class="md:hidden px-4 py-2 rounded-full font-mincho text-[13px] whitespace-nowrap text-cream-50/85 hover:text-white hover:bg-white/10 transition-colors"
    on:click={() => dispatch('menu')}
  >
    メニュー
  </button>

  <button
    type="button"
    class={`ml-1 inline-flex items-center gap-2 px-5 py-2 rounded-full transition-colors font-mincho text-[12.5px] md:text-[13px] whitespace-nowrap
      ${active === 'contact' ? 'bg-sakura text-white' : 'bg-cream-50 text-ink hover:bg-sakura hover:text-white'}`}
    aria-pressed={active === 'contact'}
    on:click={() => dispatch('open', 'contact')}
  >
    相談する
    <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
  </button>
</nav>
