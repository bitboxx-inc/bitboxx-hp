<script lang="ts">
  /**
   * ヒーローテイクオーバー。
   * 見出しの語間に埋まったインクのカード (中身は HeroCanvas のダーク版) が、
   * スクロールに連動して全画面へ展開する。clip-path のみを動かすので
   * レイアウトは発生せず、canvas は常にフルサイズで描画される。
   */
  import { onMount } from 'svelte';
  import HeroCanvas from './HeroCanvas.svelte';
  import { heroGameState } from '$lib/stores/heroGame';

  let section: HTMLElement;
  let stage: HTMLDivElement;
  let cardFrame: HTMLSpanElement; // 折りたたみ時のカード位置を定義する透明プレースホルダ
  let panel: HTMLDivElement;
  let progress = 0; // 0 = カード, 1 = 全画面
  let eased = 0;
  let reduced = false;

  $: gameActive =
    $heroGameState === 'ready' ||
    $heroGameState === 'playing' ||
    $heroGameState === 'gameover';

  // 見出しの退場・ステートメントの入場をスクロール進行から導く
  $: headlineOpacity = Math.max(0, 1 - eased * 1.6);
  $: statementOn = eased > 0.78 && !gameActive;
  // 展開が進むまでカード内のクリックを止める (極小カードでゲームが始まるのを防ぐ)
  $: panelInteractive = eased > 0.7;

  function applyClip() {
    if (!panel || !cardFrame || !stage) return;
    const s = stage.getBoundingClientRect();
    const c = cardFrame.getBoundingClientRect();
    const k = 1 - eased;
    const top = (c.top - s.top) * k;
    const left = (c.left - s.left) * k;
    const right = (s.right - c.right) * k;
    const bottom = (s.bottom - c.bottom) * k;
    const r = 28 * k;
    panel.style.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round ${r}px)`;
  }

  onMount(() => {
    reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      // モーション減: スクラブせず、最初から全画面のパネルとして見せる
      progress = 1;
      eased = 1;
      applyClip();
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const range = Math.max(1, rect.height - window.innerHeight);
      progress = Math.min(1, Math.max(0, -rect.top / range));
      eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      applyClip();
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  });
</script>

<section bind:this={section} class="relative" style="height: 280vh;" aria-label="bitboxx">
  <div bind:this={stage} class="sticky top-0 h-screen overflow-hidden paper-grain bg-cream-50">
    <!-- 見出しレイヤ — カードの左右 (モバイルは上下) に割れて退場する -->
    <div
      class="absolute inset-0 z-10 pointer-events-none flex items-center"
      style={`opacity:${headlineOpacity};`}
      aria-hidden={eased > 0.6}
    >
      <div class="w-full max-w-[1500px] mx-auto px-6 md:px-10">
        <div class="flex flex-col md:flex-row items-center justify-center gap-7 md:gap-12">
          <h1 class="contents">
            <span
              class="block font-display italic leading-[1.02] tracking-hyper text-[13.5vw] md:text-[5.4vw] text-center md:text-right will-change-transform"
              style={`transform: translate(${-eased * 16}vw, 0);`}
            >
              <span class="underline-handwritten">Excellent.</span><br />
              <span class="text-sakura">Kawaii.</span>
            </span>

            <!-- カードの座席 — パネルはこの矩形から全画面へ展開する -->
            <span
              bind:this={cardFrame}
              class="block w-[86vw] md:w-[34vw] aspect-[16/10] shrink-0"
              aria-hidden="true"
            ></span>

            <span
              class="block leading-[1.02] tracking-hyper text-center md:text-left will-change-transform"
              style={`transform: translate(${eased * 16}vw, 0);`}
            >
              <span class="block font-display text-[13.5vw] md:text-[5.4vw]">Unique<span class="text-sakura">.</span></span>
              <span class="mt-4 md:mt-5 block font-mincho text-[13px] md:text-[15px] leading-[2] tracking-[0.06em] text-ink/65">
                まだ見ぬ最高を、確かな品質で。
              </span>
            </span>
          </h1>
        </div>
      </div>
    </div>

    <!-- スクロール誘導 — 進行とともに消える -->
    <div
      class="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none font-mono text-[10px] tracking-[0.34em] uppercase text-ink/45"
      style={`opacity:${Math.max(0, 1 - eased * 3)};`}
      aria-hidden="true"
    >
      Scroll
    </div>

    <!-- インクのパネル — clip-path だけが動く -->
    <div
      bind:this={panel}
      class="absolute inset-0 z-20 bg-ink"
      class:pointer-events-none={!panelInteractive}
      style="clip-path: inset(42% 33% 42% 33% round 28px);"
    >
      <div class="absolute inset-0">
        <HeroCanvas dark />
      </div>

      <!-- 展開後のステートメント — ゲーム中は引っ込む -->
      <div
        class="absolute inset-0 z-10 pointer-events-none transition-opacity duration-500"
        style={`opacity:${statementOn ? 1 : 0};`}
        aria-hidden={!statementOn}
      >
        <div class="h-full max-w-[1500px] mx-auto px-6 md:px-10 flex flex-col justify-between pt-28 md:pt-32 pb-24 md:pb-28">
          <p class="font-mincho font-light text-[30px] md:text-[52px] leading-[1.5] tracking-[0.04em] text-cream-50 max-w-3xl">
            まだ見ぬ<span class="relative inline-block">
              <span class="relative z-10">最高</span>
              <span class="absolute inset-x-0 bottom-[0.12em] h-[0.28em] bg-sakura/70 -z-0" aria-hidden="true"></span>
            </span>を、<br class="hidden sm:block" />
            確かな品質で。
          </p>

          <div class="self-end text-right">
            <p class="font-mincho text-[13px] md:text-[15px] leading-[2.2] text-cream-50/70">
              唯一無二のアイデアを、卓越した技術でかたちにする。<br class="hidden md:block" />
              手放したくなくなるプロダクトを、世界に。
            </p>
            <a
              href="#contact-form"
              class={`mt-6 inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-cream-50 text-ink hover:bg-sakura hover:text-white transition-colors duration-300 ${statementOn ? 'pointer-events-auto' : ''}`}
            >
              <span class="font-display italic text-lg whitespace-nowrap">プロジェクトを相談する</span>
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
