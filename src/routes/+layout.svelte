<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com"/>
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous"/>
    <link
      href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700;1,800&family=Space+Grotesk:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@300;400;600&family=JetBrains+Mono:wght@400;500&display=swap"
      rel="stylesheet"
    />
</svelte:head>

<script lang="ts">
  import "../app.css";
  import { base } from "$app/paths";
  import { page } from "$app/stores";
  import { onMount } from "svelte";
  import { quintOut } from "svelte/easing";
  import { fade, slide } from "svelte/transition";
  import Cursor from "$lib/components/Cursor.svelte";

  let isMenuOpen = false;
  let scrolled = false;

  function toggleMenu() { isMenuOpen = !isMenuOpen; }
  function closeMenu() { isMenuOpen = false; }

  onMount(() => {
    const onScroll = () => { scrolled = window.scrollY > 24; };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  });

  $: if (typeof document !== 'undefined') {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
  }

  $: isHome = $page.url.pathname === `${base}/` || $page.url.pathname === '/' || $page.url.pathname === base;

  const sectionLinks = {
    philosophy: `${base}/#philosophy`,
    business: `${base}/#business`,
    reasons: `${base}/#reasons`,
    plans: `${base}/#plans`,
    caseStudies: `${base}/#case-studies`,
    company: `${base}/#company`,
    contact: `${base}/#contact-form`
  };

  const navItems: Array<[string, string, string]> = [
    ['philosophy', sectionLinks.philosophy, '大切にしていること'],
    ['business', sectionLinks.business, '事業領域'],
    ['plans', sectionLinks.plans, '料金'],
    ['case-studies', sectionLinks.caseStudies, '実績'],
    ['company', sectionLinks.company, '会社概要']
  ];
</script>

<div class="relative min-h-screen bg-cream-50 text-ink font-sans flex flex-col overflow-x-hidden">
  <Cursor />

  <!-- Top nav -->
  <header
    class={`fixed top-0 left-0 w-full z-[70] transition-all duration-500
      ${scrolled ? 'bg-cream-50/80 backdrop-blur-md border-b border-ink/5' : 'bg-transparent'}`}
  >
    <div class="max-w-[1400px] mx-auto h-20 px-6 md:px-10 flex items-center justify-between">
      <a href="{base}/" class="flex items-center" aria-label="bitboxx">
        <img src="{base}/black.svg" alt="bitboxx" class="h-6 md:h-7 w-auto" />
      </a>

      <nav class="hidden lg:flex items-center gap-6 text-sm">
        {#each navItems as [, href, label]}
          <a {href} class="font-mincho text-ink/80 hover:text-ink transition-colors">
            {label}
          </a>
        {/each}
      </nav>

      <div class="flex items-center gap-3">
        <a
          href={sectionLinks.contact}
          class="nav-cta hidden lg:inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-mincho transition-colors duration-300 group"
        >
          お問い合わせ
          <svg class="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
        </a>

        <button
          class="menu-btn lg:hidden relative z-[61] w-12 h-12 flex items-center justify-center rounded-2xl transition-colors duration-300"
          on:click={toggleMenu}
          aria-label={isMenuOpen ? 'メニューを閉じる' : 'メニューを開く'}
          aria-expanded={isMenuOpen}
        >
          {#if isMenuOpen}
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          {:else}
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M4 8h16M4 16h16"/>
            </svg>
          {/if}
        </button>
      </div>
    </div>
  </header>

  <!-- Mobile menu -->
  {#if isMenuOpen}
    <div
      transition:fade={{ duration: 180 }}
      class="fixed inset-0 z-[60] bg-white lg:hidden flex flex-col pt-28 px-8 overflow-y-auto"
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
        {#each navItems as [, href, label]}
          <a {href} class="text-ink/85 hover:text-ink transition-colors" on:click={closeMenu}>
            {label}
          </a>
        {/each}
        <a href={sectionLinks.contact} class="text-ink/85 hover:text-ink transition-colors" on:click={closeMenu}>
          お問い合わせ
        </a>
      </nav>
    </div>
  {/if}

  <main class="flex-1">
    <slot/>
  </main>

  <footer class="relative py-14 md:py-16">
    <div class="relative max-w-[1400px] mx-auto px-6 md:px-10">
      <div class="grid md:grid-cols-12 gap-10 md:gap-12">
        <div class="md:col-span-4">
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
            {#each navItems as [, href, label]}
              <li><a {href} class="hover:text-sakura transition-colors">{label}</a></li>
            {/each}
            <li><a href={sectionLinks.contact} class="hover:text-sakura transition-colors">お問い合わせ</a></li>
          </ul>
        </div>

        <div class="md:col-span-4">
          <p class="font-mincho text-[12px] tracking-[0.18em] text-ink/55">規約</p>
          <ul class="mt-4 space-y-2 font-mincho text-[13px] text-ink/85">
            <li><a href="{base}/terms_of_service" class="hover:text-sakura transition-colors">利用規約</a></li>
            <li><a href="{base}/privacy_policy" class="hover:text-sakura transition-colors">プライバシーポリシー</a></li>
          </ul>
        </div>
      </div>

      <div class="mt-12 pt-6 border-t border-ink/10 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <p class="font-mincho text-[12px] text-ink/60">株式会社bitboxx</p>
        <p class="font-mincho text-[12px] text-ink/50">© {new Date().getFullYear()} bitboxx Inc. All rights reserved.</p>
      </div>
    </div>
  </footer>
</div>

<style>
  :global(.text-cream-50\/8) { color: rgba(251, 247, 241, 0.08); }

  /* Ensure the top-right CTA + hamburger stay solid ink regardless of load order */
  .nav-cta {
    background-color: #111014;
    color: #ffffff;
  }
  .nav-cta:hover {
    background-color: #FF2630;
  }
  .menu-btn {
    background-color: #ffffff;
    color: #111014;
    border: 1px solid #111014;
  }
  .menu-btn:hover {
    background-color: #FF2630;
    color: #ffffff;
    border-color: #FF2630;
  }
</style>
