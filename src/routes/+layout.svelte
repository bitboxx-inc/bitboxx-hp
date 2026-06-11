<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/>
    <!-- 使用ウェイトのみ読み込む: Fraunces 400/800 (roman+italic), Space Grotesk 400/500,
         Noto Serif JP 300/400, JetBrains Mono 400/700。和文サンセリフはシステムフォールバック。 -->
    <link
      href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,800;1,400;1,800&family=Space+Grotesk:wght@400;500&family=Noto+Serif+JP:wght@300;400&family=JetBrains+Mono:wght@400;700&display=swap"
      rel="stylesheet"
    />
</svelte:head>

<script lang="ts">
  import "../app.css";
  import { base } from "$app/paths";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { quintOut } from "svelte/easing";
  import { fade, slide } from "svelte/transition";
  import Cursor from "$lib/components/Cursor.svelte";
  import PillNav from "$lib/components/PillNav.svelte";
  import Clock from "$lib/components/Clock.svelte";
  import { activePanel, type PanelId } from "$lib/stores/panel";

  let isMenuOpen = false;

  function toggleMenu() { isMenuOpen = !isMenuOpen; }
  function closeMenu() { isMenuOpen = false; }

  $: if (typeof document !== 'undefined') {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
  }

  $: isHome =
    $page.url.pathname === `${base}/` || $page.url.pathname === '/' || $page.url.pathname === base;

  const navItems: Array<{ id: PanelId; label: string }> = [
    { id: 'philosophy', label: '三つのものさし' },
    { id: 'business', label: '事業内容' },
    { id: 'reasons', label: '選ばれる理由' },
    { id: 'works', label: '実績' },
    { id: 'company', label: '会社概要' }
  ];

  // パネルを開く — 規約ページにいたら先に一枚絵へ戻る
  async function openPanel(id: string) {
    closeMenu();
    if (!isHome) await goto(`${base}/`);
    activePanel.set(id as PanelId);
  }
  function goHome() {
    closeMenu();
    activePanel.set(null);
    if (!isHome) goto(`${base}/`);
  }
</script>

<div class="relative min-h-screen bg-cream-50 text-ink font-sans flex flex-col overflow-x-clip">
  <Cursor />

  <!-- 最小ヘッダー — ロゴと東京時刻のみ。ナビは下のピルに集約。 -->
  <header class="fixed top-0 left-0 w-full z-[78]">
    <div class="max-w-[1500px] mx-auto h-16 px-6 md:px-10 flex items-center justify-between">
      <button type="button" class="flex items-center" aria-label="bitboxx — 一枚絵に戻る" on:click={goHome}>
        <img src="{base}/black.svg" alt="bitboxx" class="h-5 md:h-6 w-auto" />
      </button>
      <Clock klass="text-[10px] text-ink/50" />
    </div>
  </header>

  <PillNav
    items={navItems}
    active={$activePanel}
    on:open={(e) => openPanel(e.detail)}
    on:home={goHome}
    on:menu={toggleMenu}
  />

  <!-- Mobile menu -->
  {#if isMenuOpen}
    <div
      transition:fade={{ duration: 180 }}
      class="fixed inset-0 z-[79] bg-white lg:hidden flex flex-col pt-28 px-8 overflow-y-auto"
      on:click={closeMenu}
      on:keydown
      role="presentation"
    >
      <nav
        transition:slide={{ duration: 260, easing: quintOut }}
        class="relative flex flex-col gap-5 font-mincho text-2xl"
        on:click|stopPropagation
        on:keydown
        role="presentation"
      >
        {#each navItems as item (item.id)}
          <button type="button" class="text-left text-ink/85 hover:text-ink transition-colors" on:click={() => openPanel(item.id)}>
            {item.label}
          </button>
        {/each}
        <button type="button" class="text-left text-ink/85 hover:text-ink transition-colors" on:click={() => openPanel('contact')}>
          お問い合わせ
        </button>
      </nav>
    </div>
  {/if}

  <main class="flex-1">
    <slot/>
  </main>

  <!-- フッターは規約ページのみ — 一枚絵 (ホーム) には出さない -->
  {#if !isHome}
    <footer class="relative pt-14 md:pt-16 pb-28 md:pb-32">
      <div class="relative max-w-[1400px] mx-auto px-6 md:px-10">
        <div class="grid md:grid-cols-12 gap-10 md:gap-12">
          <div class="md:col-span-5">
            <img src="{base}/black.svg" alt="bitboxx" class="h-5 w-auto" />
            <p class="mt-6 font-mincho text-[13px] leading-7 text-ink/75">
              〒103-0015<br/>
              東京都中央区日本橋箱崎町16-11<br/>
              ルミネ日本橋601
            </p>
          </div>

          <div class="md:col-span-4">
            <p class="font-mincho text-[12px] tracking-[0.18em] text-ink/55">会社案内</p>
            <ul class="mt-4 space-y-2 font-mincho text-[13px] text-ink/85">
              {#each navItems as item (item.id)}
                <li>
                  <button type="button" class="hover:text-sakura transition-colors" on:click={() => openPanel(item.id)}>
                    {item.label}
                  </button>
                </li>
              {/each}
              <li>
                <button type="button" class="hover:text-sakura transition-colors" on:click={() => openPanel('contact')}>
                  お問い合わせ
                </button>
              </li>
            </ul>
          </div>

          <div class="md:col-span-3">
            <p class="font-mincho text-[12px] tracking-[0.18em] text-ink/55">規約</p>
            <ul class="mt-4 space-y-2 font-mincho text-[13px] text-ink/85">
              <li><a href="{base}/terms_of_service" class="hover:text-sakura transition-colors">利用規約</a></li>
              <li><a href="{base}/privacy_policy" class="hover:text-sakura transition-colors">プライバシーポリシー</a></li>
            </ul>
          </div>
        </div>

        <div class="mt-12 pt-6 border-t border-ink/10 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <p class="font-mincho text-[12px] text-ink/60">株式会社bitboxx</p>
          <p class="font-mincho text-[12px] text-ink/50">© {new Date().getFullYear()} bitboxx Inc.</p>
        </div>
      </div>
    </footer>
  {/if}
</div>

<style>
  :global(.text-cream-50\/8) { color: rgba(251, 247, 241, 0.08); }
</style>
