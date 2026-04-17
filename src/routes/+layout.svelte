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
    ['philosophy', sectionLinks.philosophy, 'Philosophy'],
    ['business', sectionLinks.business, 'Services'],
    ['plans', sectionLinks.plans, 'Plans'],
    ['case-studies', sectionLinks.caseStudies, 'Works'],
    ['company', sectionLinks.company, 'Company']
  ];
</script>

<div class="relative min-h-screen bg-cream-50 text-ink font-sans flex flex-col overflow-x-hidden">
  <Cursor />

  <!-- Top nav -->
  <header
    class={`fixed top-0 left-0 w-full z-50 transition-all duration-500
      ${scrolled ? 'bg-cream-50/80 backdrop-blur-md border-b border-ink/5' : 'bg-transparent'}`}
  >
    <div class="max-w-[1400px] mx-auto h-20 px-6 md:px-10 flex items-center justify-between">
      <a href="{base}/" class="flex items-center gap-3 group" aria-label="bitboxx">
        <span class="relative flex items-center justify-center w-9 h-9">
          <span class="absolute inset-0 rounded-xl bg-ink group-hover:rotate-12 transition-transform duration-500"></span>
          <span class="absolute inset-[3px] rounded-[10px] bg-sakura group-hover:-rotate-12 transition-transform duration-500"></span>
          <span class="relative text-cream-50 font-display italic font-semibold text-lg">b</span>
        </span>
        <span class="font-display italic text-xl tracking-hyper">bitboxx</span>
      </a>

      <nav class="hidden lg:flex items-center gap-1 text-sm">
        {#each navItems as [key, href, label]}
          <a
            {href}
            class="relative px-4 py-2 rounded-full hover:bg-ink/5 transition-colors"
          >
            <span class="font-mono text-[11px] tracking-widest uppercase text-ink/50 mr-1.5">0{navItems.findIndex(i => i[0] === key) + 1}</span>
            <span class="font-medium">{label}</span>
          </a>
        {/each}
      </nav>

      <div class="flex items-center gap-3">
        <a
          href={sectionLinks.contact}
          class="nav-cta hidden lg:inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-medium transition-colors duration-300 group"
        >
          Contact
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
      class="fixed inset-0 z-[60] bg-white lg:hidden flex flex-col pt-28 px-8 overflow-y-auto paper-grain"
      on:click={closeMenu}
      on:keydown
      role="presentation"
    >
      <nav
        transition:slide={{ duration: 260, easing: quintOut }}
        class="relative flex flex-col gap-6 font-display italic text-5xl tracking-hyper"
        on:click|stopPropagation
        on:keydown
        role="presentation"
      >
        {#each navItems as [, href, label], i}
          <a {href} class="flex items-baseline gap-4 group" on:click={closeMenu}>
            <span class="font-mono not-italic text-xs text-ink/50">0{i + 1}</span>
            <span class="underline-handwritten">{label}</span>
          </a>
        {/each}
        <div class="pt-10">
          <a
            href={sectionLinks.contact}
            class="btn-ink inline-flex items-center gap-3 px-6 py-4 rounded-full text-base not-italic font-sans font-medium transition-colors duration-300"
            on:click={closeMenu}
          >
            お問い合わせ →
          </a>
        </div>
      </nav>
    </div>
  {/if}

  <main class="flex-1">
    <slot/>
  </main>

  <footer class="relative overflow-hidden bg-ink text-cream-50 pt-24 pb-12 mt-24">
    <div class="pointer-events-none absolute inset-0 bg-noise opacity-20"></div>

    <div class="relative max-w-[1400px] mx-auto px-6 md:px-10">
      <div class="grid md:grid-cols-12 gap-10 md:gap-6">
        <div class="md:col-span-6">
          <p class="font-mono text-xs tracking-[0.3em] uppercase text-cream-50/60">bitboxx inc.</p>
          <h3 class="mt-6 font-display italic text-6xl md:text-8xl leading-[0.95] tracking-hyper text-balance">
            Let's build<br/>
            something<br/>
            <span class="text-sakura">kawaii</span> & <span class="italic">excellent</span>.
          </h3>
          <a
            href={`${base}/#contact-form`}
            class="mt-10 inline-flex items-center gap-4 group"
          >
            <span class="font-display italic text-xl">プロジェクトを相談する</span>
            <span class="w-14 h-14 rounded-full bg-cream-50 text-ink flex items-center justify-center group-hover:bg-sakura transition-colors">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </span>
          </a>
        </div>

        <div class="md:col-span-3">
          <p class="font-mono text-xs tracking-[0.3em] uppercase text-cream-50/50">Sitemap</p>
          <ul class="mt-5 space-y-2.5 text-sm">
            {#each navItems as [, href, label]}
              <li><a {href} class="hover:text-sakura transition-colors">{label}</a></li>
            {/each}
            <li><a href={sectionLinks.contact} class="hover:text-sakura transition-colors">Contact</a></li>
          </ul>
        </div>

        <div class="md:col-span-3">
          <p class="font-mono text-xs tracking-[0.3em] uppercase text-cream-50/50">Legal</p>
          <ul class="mt-5 space-y-2.5 text-sm">
            <li><a href="{base}/terms_of_service" class="hover:text-sakura transition-colors">利用規約</a></li>
            <li><a href="{base}/privacy_policy" class="hover:text-sakura transition-colors">プライバシーポリシー</a></li>
          </ul>
        </div>
      </div>

      <div class="mt-20 pt-8 border-t border-cream-50/15 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <p class="font-display italic text-[18vw] md:text-[12vw] leading-[0.85] tracking-hyper text-cream-50/8 select-none">bitboxx</p>
        <p class="font-mono text-xs text-cream-50/40">© {new Date().getFullYear()} bitboxx Inc. All rights reserved.</p>
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
    background-color: #FF7A8A;
  }
  .menu-btn {
    background-color: #111014;
    color: #ffffff;
    box-shadow: 0 10px 24px -12px rgba(17, 16, 20, 0.45);
  }
  .menu-btn:hover {
    background-color: #FF7A8A;
  }
</style>
