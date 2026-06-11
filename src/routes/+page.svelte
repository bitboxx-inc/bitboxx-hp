<svelte:head>
    <title>bitboxx | Excellent. Kawaii. Unique.</title>
    <meta name="description" content="bitboxx (ビットボックス) は、Excellent / Kawaii / Unique の三つのものさしで、事業の核となるプロダクトとシステムを設計・開発する東京のエンジニアリング会社です。"/>
    <link rel="canonical" href={SITE_URL}/>
    <meta property="og:type" content="website"/>
    <meta property="og:site_name" content="bitboxx"/>
    <meta property="og:title" content="bitboxx | Excellent. Kawaii. Unique."/>
    <meta property="og:description" content="Excellent / Kawaii / Unique の三つのものさしで、事業の核となるプロダクトとシステムを設計・開発する東京のエンジニアリング会社。"/>
    <meta property="og:url" content={SITE_URL}/>
    <meta property="og:image" content={`${SITE_URL}og.png`}/>
    <meta property="og:image:width" content="1200"/>
    <meta property="og:image:height" content="630"/>
    <meta property="og:locale" content="ja_JP"/>
    <meta name="twitter:card" content="summary_large_image"/>
    <meta name="twitter:title" content="bitboxx | Excellent. Kawaii. Unique."/>
    <meta name="twitter:image" content={`${SITE_URL}og.png`}/>
    <!-- 静的な会社情報の JSON.stringify のみを埋め込む (ユーザー入力は含まない) -->
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html jsonLdTag}
</svelte:head>

<script lang="ts">
  import { tick, onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import { base } from '$app/paths';
  import companyInfo from '$lib/data/company_info.json';
  import PrivacyPolicy from '$lib/domains/PrivacyPolicy.svelte';
  import HeroCanvas from '$lib/components/HeroCanvas.svelte';
  import Reveal from '$lib/components/Reveal.svelte';
  import { heroGameState } from '$lib/stores/heroGame';
  import { activePanel, type PanelId } from '$lib/stores/panel';

  // ゲーム中はヒーローのタイポグラフィを引っ込めて遊び場を空ける
  $: heroQuiet =
    $heroGameState === 'ready' ||
    $heroGameState === 'playing' ||
    $heroGameState === 'gameover';

  // ── コンテンツパネル — 一枚絵の上にせり上がる紙 ─────────────────
  const panelTitles: Record<PanelId, string> = {
    philosophy: '三つのものさし',
    business: '事業内容',
    reasons: '選ばれる理由',
    works: '実績',
    company: '会社概要',
    contact: 'お問い合わせ'
  };

  let panelCloseBtn: HTMLButtonElement | null = null;
  let panelBodyEl: HTMLDivElement | null = null;
  let lastPanel: PanelId | null = null;

  function closePanel() {
    activePanel.set(null);
  }

  // パネルが開いた / 切り替わったら先頭へ戻してフォーカスを移す
  $: if ($activePanel !== lastPanel) {
    lastPanel = $activePanel;
    if ($activePanel) {
      tick().then(() => {
        panelBodyEl?.scrollTo({ top: 0 });
        panelCloseBtn?.focus();
      });
    }
  }

  // 旧アンカー URL からの深いリンクを受ける (#contact-form など)
  onMount(() => {
    const hash = window.location.hash.replace('#', '');
    const map: Record<string, PanelId> = {
      'contact-form': 'contact',
      contact: 'contact',
      philosophy: 'philosophy',
      business: 'business',
      reasons: 'reasons',
      'case-studies': 'works',
      works: 'works',
      company: 'company'
    };
    if (hash && map[hash]) activePanel.set(map[hash]);
  });

  // 三つのものさし — ヒーローの 3 流儀をそのまま静的に組む
  const ekuSlides = [
    {
      word: 'Excellent.',
      accent: 'underline' as const,
      label: '卓越',
      mark: '01 — Standard',
      body: '妥協なく、細部まで仕上げ切ったもの。'
    },
    {
      word: 'Kawaii.',
      accent: 'fill' as const,
      label: '愛らしさ',
      mark: '02 — Affection',
      body: '使うたびに、すこし好きになっていくもの。'
    },
    {
      word: 'Unique.',
      accent: 'period' as const,
      label: '唯一無二',
      mark: '03 — Singular',
      body: 'ほかでは見たことのない、新しいかたち。'
    }
  ];

  // 本番ドメイン (GitHub Pages + カスタムドメイン)
  const SITE_URL = 'https://bitboxx.co.jp/';

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: companyInfo.name,
    url: SITE_URL,
    logo: `${SITE_URL}black.svg`,
    email: 'contact@bitboxx.co.jp',
    foundingDate: companyInfo.established,
    address: {
      '@type': 'PostalAddress',
      postalCode: companyInfo.postcode,
      addressRegion: '東京都',
      addressLocality: '中央区',
      streetAddress: '日本橋箱崎町16-11 ルミネ日本橋601',
      addressCountry: 'JP'
    }
  };

  // "<script" をソースに直書きすると Svelte / vitePreprocess のスクリプト抽出を
  // 誤爆させるため、文字列連結でタグを組み立てる。
  const jsonLdTag =
    '<scr' + 'ipt type="application/ld+json">' + JSON.stringify(orgJsonLd) + '</scr' + 'ipt>';

  // 主な事業内容 — what we do × どんな価値が生まれるか
  const services = [
    {
      num: '01',
      en: 'Product',
      title: 'プロダクト開発',
      deliverable: '構想の整理、技術選定、設計、実装、リリース、その後の改善まで一気通貫。Web／モバイル／API／クラウド基盤。',
      value: 'アイデアを、事業として動くプロダクトに。'
    },
    {
      num: '02',
      en: 'Operation',
      title: '運用・保守・改善',
      deliverable: '監視、障害対応、性能改善、機能追加。開発したチームがそのまま運用も持ちます。',
      value: '作ったものを、毎日少しずつ良くする。'
    },
    {
      num: '03',
      en: 'Design',
      title: 'UI／UX 設計',
      deliverable: '情報設計、画面設計、デザインシステム。ブランドから画面まで、一貫した体験に。',
      value: '使う人に届く形と、伝わる体験。'
    },
    {
      num: '04',
      en: 'Advisory',
      title: '技術顧問・アドバイザリー',
      deliverable: '技術戦略、体制とコードのレビュー、採用支援、中長期ロードマップ、投資判断の相談。',
      value: '経営判断の場に、技術の目を。'
    }
  ];

  // 通ってきた現場
  const capabilities = [
    {
      tag: '新規サービスの立ち上げ',
      body: '小さく出して、反応を見て、機能を足す。事業の芽をプロダクトに育てる開発。'
    },
    {
      tag: 'AI を組み込んだ業務・プロダクト改善',
      body: '生成 AI・データ分析・自動化を業務フローへ。効果の見える場所から段階導入。'
    },
    {
      tag: '決済・課金・業務システム',
      body: 'オンライン決済、会計連携、売上管理、返金対応。お金が動く部分を、確実に。'
    },
    {
      tag: '既存システムの刷新・運用',
      body: '動かしたまま作り替える。クラウド移行、負荷対策、性能改善まで。'
    }
  ];

  // なぜ bitboxx か — 選ばれる理由
  const reasons = [
    {
      num: 'Reason 01',
      headline: '「何をつくるか」から、並走する。',
      body: '「何をつくるべきか」を決める段階から並走し、技術と事業の両方の目で経営判断に加わります。',
      contrast: '多くの開発会社は仕様の通りにつくる。私たちは、仕様が固まる前から関わる。'
    },
    {
      num: 'Reason 02',
      headline: '作って終わり、ではない。',
      body: '立ち上げから運用・改善まで、同じチームが担当します。書いた人がそのまま守るから、判断が速い。',
      contrast: '別会社へ引き継ぐとき、よく落ちる文脈がある。私たちは、その引き継ぎ自体が起きない。'
    },
    {
      num: 'Reason 03',
      headline: 'つくらない、という選択も持つ。',
      body: '三つのものさしに当てはまらないものは、つくりません。やらないことを決めるところから、設計は始まります。',
      contrast: '何でも引き受ける会社は多い。私たちは、価値が出るものだけを残す。'
    }
  ];

  const works = [
    {
      num: 'Case 01',
      meta: '美容系事業会社 ／ アーキテクト伴走 ／ 継続支援',
      body: 'ホームページ制作、事業用システム開発、事業方針の相談を一体で。システム選定、進め方の整理、コスト管理、投資判断まで。'
    },
    {
      num: 'Case 02',
      meta: '不動産会社 ／ 運用保守 ／ 継続＋スポット',
      body: 'HP の更新、軽微な改善、社内アカウント管理を継続で。必要時には社内ツール整備などにスポットで対応。'
    }
  ];

  const companyFacts: Array<[string, string]> = [
    ['会社名',   companyInfo.name],
    ['所在地',   `〒${companyInfo.postcode}  ${companyInfo.address}`],
    ['代表者',   companyInfo.representative],
    ['設立',     `${companyInfo.established.substring(0, 4)}年${companyInfo.established.substring(5, 7)}月${companyInfo.established.substring(8, 10)}日`],
    ['事業内容', companyInfo.business]
  ];

  let yourname = '';
  let company = '';
  let email = '';
  let text = '';
  let pr = false;
  let showPrivacyModal = false;
  let privacyDialogEl: HTMLDivElement | null = null;
  let privacyCloseBtnEl: HTMLButtonElement | null = null;
  let privacyTriggerEl: HTMLElement | null = null;

  async function openPrivacyModal(event: MouseEvent) {
    event.preventDefault();
    privacyTriggerEl = event.currentTarget as HTMLElement;
    showPrivacyModal = true;
    await tick();
    privacyCloseBtnEl?.focus();
  }
  function closePrivacyModal() {
    showPrivacyModal = false;
    privacyTriggerEl?.focus();
  }

  // モーダル表示中は背景スクロールを止め、Esc で閉じ、Tab をダイアログ内に閉じ込める。
  $: if (typeof document !== 'undefined') {
    document.body.style.overflow = showPrivacyModal ? 'hidden' : '';
  }

  function onPrivacyKeydown(e: KeyboardEvent) {
    // Esc はモーダル → パネルの順に閉じる
    if (e.key === 'Escape' && !showPrivacyModal && $activePanel) {
      e.preventDefault();
      closePanel();
      return;
    }
    if (!showPrivacyModal) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closePrivacyModal();
      return;
    }
    if (e.key === 'Tab' && privacyDialogEl) {
      const focusables = privacyDialogEl.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (active === first || !active || !privacyDialogEl.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  function send() {
    if (isDisabled(pr, yourname, email, text)) return;
    const companyLine = company ? `\n会社名: ${company}` : '';
    const mailto = `mailto:contact@bitboxx.co.jp?subject=ホームページからのお問い合わせ&body=${encodeURIComponent(
      `問い合わせ内容:\n${text}\n\n---\n氏名: ${yourname}${companyLine}\nメールアドレス: ${email}\n---`
    )}`;
    window.location.href = mailto;
  }

  function isDisabled(pr: boolean, yourname: string, email: string, text: string) {
    return !pr || yourname === '' || email === '' || text === '';
  }
</script>

<svelte:window on:keydown={onPrivacyKeydown}/>

<main class="relative">
  <!-- 一枚絵 — このビューポートがサイトの全て。コンテンツはパネルでせり上がる。 -->
  <section class="relative h-screen h-[100svh] flex items-end pt-24 pb-20 overflow-hidden paper-grain">
    <!-- three.js の場 — ゲームのホーム -->
    <div class="absolute inset-0 z-0 mask-fade-y">
      <HeroCanvas />
    </div>

    <div class="relative z-10 w-full px-6 md:px-10 pb-4 pointer-events-none">
      <div class="max-w-[1400px] mx-auto">
        <h1
          class="font-display leading-[0.82] tracking-hyper break-words pointer-events-none transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)]"
          class:opacity-0={heroQuiet}
          class:-translate-y-3={heroQuiet}
        >
          <span class="hero-clip">
            <span class="hero-rise" style="--d:60ms">
              <span class="block text-[14vw] md:text-[11vw] lg:text-[9.5rem] italic">
                <span class="underline-handwritten draw-in">Excellent.</span>
              </span>
            </span>
          </span>
          <span class="hero-clip">
            <span class="hero-rise" style="--d:200ms">
              <span class="block text-[14vw] md:text-[11vw] lg:text-[9.5rem] pl-[6vw] md:pl-[12vw]">
                <span class="text-sakura italic">Kawaii.</span>
              </span>
            </span>
          </span>
          <span class="hero-clip">
            <span class="hero-rise" style="--d:340ms">
              <span class="block text-[14vw] md:text-[11vw] lg:text-[9.5rem] pl-[2vw] md:pl-[4vw]">
                Unique<span class="text-sakura">.</span>
              </span>
            </span>
          </span>
        </h1>

        <div class="mt-14 md:mt-20 flex flex-col md:flex-row md:items-end md:justify-between gap-10">
          <div
            class="max-w-2xl pointer-events-none transition-all duration-500 ease-[cubic-bezier(.2,.8,.2,1)]"
            class:opacity-0={heroQuiet}
            class:translate-y-2={heroQuiet}
            aria-hidden={heroQuiet}
          >
            <p class="hero-fade font-mincho font-light text-[26px] md:text-[44px] leading-[1.5] tracking-[0.04em] text-ink" style="--d:880ms">
              まだ見ぬ<span class="relative inline-block">
                <span class="relative z-10">最高</span>
                <span class="absolute inset-x-0 bottom-[0.12em] h-[0.28em] bg-sakura/60 -z-0" aria-hidden="true"></span>
              </span>を、<br class="hidden sm:block"/>
              確かな品質で。
            </p>
            <p class="hero-fade mt-7 md:mt-10 font-mincho text-[15px] md:text-[17px] leading-[2.1] text-ink/60 max-w-lg tracking-[0.06em]" style="--d:1020ms">
              唯一無二のアイデアを、卓越した技術でかたちにする。<br class="hidden md:block"/>
              手放したくなくなるプロダクトを、世界に。
            </p>
          </div>
          <div class="shrink-0">
            <button
              type="button"
              on:click={() => activePanel.set('contact')}
              class="hero-fade btn-ink group inline-flex items-center gap-3 px-7 py-3.5 rounded-full text-base font-medium transition-colors duration-300 pointer-events-auto"
              style="--d:1160ms"
            >
              <span class="font-display italic text-lg whitespace-nowrap">プロジェクトを相談する</span>
              <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- コンテンツパネル — 一枚絵の上にせり上がる紙。中だけがスクロールする。 -->
  {#if $activePanel}
    <div
      class="fixed inset-0 z-[75]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="panel-title"
      transition:fly={{ y: 36, duration: 340, easing: quintOut }}
    >
      <div class="absolute inset-0 bg-cream-50 paper-grain" aria-hidden="true"></div>
      <div bind:this={panelBodyEl} class="relative h-full overflow-y-auto overscroll-contain">
        <div class="max-w-[1100px] mx-auto px-6 md:px-10 pt-24 md:pt-28 pb-44">
          <div class="flex items-center justify-between gap-6">
            <h2 id="panel-title" class="font-mincho text-sm tracking-[0.2em] text-ink/55">
              {panelTitles[$activePanel]}
            </h2>
            <button
              bind:this={panelCloseBtn}
              type="button"
              on:click={closePanel}
              aria-label="閉じる"
              class="grid place-items-center w-10 h-10 rounded-full border border-ink/15 text-ink/60 text-xl leading-none hover:text-white hover:bg-ink hover:border-ink transition-colors"
            >×</button>
          </div>

          {#if $activePanel === 'philosophy'}
            <Reveal>
              <p class="mt-10 md:mt-14 max-w-3xl font-mincho text-[18px] md:text-[22px] leading-[2.1] text-ink/85 tracking-[0.02em]">
                私たちの仕事は、お客様が<span class="underline-handwritten">本来の事業に集中できる時間</span>をつくることです。
              </p>
              <p class="mt-5 md:mt-6 max-w-2xl font-mincho text-[14px] md:text-[15px] leading-[2.1] text-ink/60">
                システム開発は、そのための手段。そして、次の三つのどれかに当てはまるものだけをつくります。
              </p>
            </Reveal>
            <div class="mt-10 md:mt-14">
              {#each ekuSlides as s (s.word)}
                <Reveal>
                  <article class="grid md:grid-cols-12 gap-4 md:gap-10 py-10 md:py-14 border-t border-ink/15">
                    <div class="md:col-span-2">
                      <p class="font-mono text-[10px] tracking-[0.3em] text-ink/45">{s.mark}</p>
                    </div>
                    <div class="md:col-span-5">
                      <p class="font-display text-[42px] md:text-[58px] leading-none tracking-hyper text-ink">
                        {#if s.accent === 'underline'}<span class="italic underline-handwritten">{s.word}</span>
                        {:else if s.accent === 'fill'}<span class="italic text-sakura">{s.word}</span>
                        {:else}Unique<span class="text-sakura">.</span>{/if}
                      </p>
                    </div>
                    <div class="md:col-span-5">
                      <h3 class="font-display italic text-xl md:text-2xl tracking-hyper text-ink">
                        {s.label}<span class="text-sakura">.</span>
                      </h3>
                      <p class="mt-4 font-mincho text-[14px] md:text-[15px] leading-[2.1] text-ink/75">{s.body}</p>
                    </div>
                  </article>
                </Reveal>
              {/each}
            </div>

          {:else if $activePanel === 'business'}
            <Reveal>
              <p class="mt-8 font-mincho text-[13px] md:text-sm text-ink/50">
                提供するもの<span class="mx-3 text-ink/30">／</span>そこから生まれる価値
              </p>
            </Reveal>
            <div class="mt-4 md:mt-6">
        {#each services as s}
          <Reveal>
            <article class="relative grid md:grid-cols-12 gap-4 md:gap-10 py-10 md:py-12 border-t border-ink/15">
              <div class="md:col-span-2">
                <p class="font-mono text-[11px] tracking-[0.3em] text-ink/55">{s.num}</p>
                <p class="mt-2 font-display italic text-[13px] text-ink/45">{s.en}</p>
              </div>

              <div class="md:col-span-5">
                <h3 class="font-mincho text-lg md:text-xl text-ink">{s.title}</h3>
                <p class="mt-3 font-mincho text-[14px] md:text-[15px] leading-[2] text-ink/70 max-w-md">
                  {s.deliverable}
                </p>
              </div>

              <div class="md:col-span-5 md:pl-6 md:border-l md:border-ink/15">
                <p class="font-mono text-[10px] tracking-[0.3em] text-ink/45">VALUE</p>
                <p class="mt-3 font-display italic text-[18px] md:text-[22px] leading-[1.55] text-ink">
                  {s.value}
                </p>
              </div>
            </article>
          </Reveal>
        {/each}
      </div>

            <h3 class="mt-16 md:mt-20 font-mincho text-sm tracking-[0.2em] text-ink/55">通ってきた現場</h3>
            <div class="mt-6 md:mt-8 grid md:grid-cols-2">
              {#each capabilities as cap, i (cap.tag)}
                <Reveal klass="h-full">
                  <article
                    class={`h-full py-8 md:py-10 border-t border-ink/15 ${i % 2 === 1 ? 'md:pl-12 md:border-l' : 'md:pr-12'}`}
                  >
                    <h4 class="font-mincho text-base md:text-lg text-ink">{cap.tag}</h4>
                    <p class="mt-4 font-mincho text-[14px] md:text-[15px] leading-[2] text-ink/75">{cap.body}</p>
                  </article>
                </Reveal>
              {/each}
            </div>

          {:else if $activePanel === 'reasons'}
            <Reveal>
              <p class="mt-8 md:mt-10 font-display text-[34px] md:text-[52px] leading-[1.1] tracking-hyper text-ink max-w-3xl">
                <span class="italic">技術と事業、</span><br/>
                両方の目を持つ<span class="text-sakura">.</span>
              </p>
            </Reveal>

            <div class="mt-10 md:mt-14">
        {#each reasons as r}
          <Reveal>
            <article class="relative grid md:grid-cols-12 gap-4 md:gap-10 py-10 md:py-14 border-t border-ink/15">
              <div class="md:col-span-3">
                <p class="font-mono text-[11px] tracking-[0.3em] text-ink/55">{r.num}</p>
              </div>
              <div class="md:col-span-9 max-w-3xl">
                <h3 class="font-display italic text-[24px] md:text-[34px] leading-[1.3] tracking-hyper text-ink">
                  {r.headline}
                </h3>
                <p class="mt-5 md:mt-7 font-mincho text-[15px] md:text-[16px] leading-[2.05] text-ink/80">
                  {r.body}
                </p>
                <p class="mt-5 md:mt-6 font-mincho text-[13px] md:text-[14px] leading-[2] text-ink/55 border-l-2 border-sakura/60 pl-4 max-w-2xl">
                  {r.contrast}
                </p>
              </div>
            </article>
          </Reveal>
        {/each}
      </div>

          {:else if $activePanel === 'works'}
            <div class="mt-6 md:mt-10">
        {#each works as w}
          <Reveal>
            <article class="relative grid md:grid-cols-12 gap-3 md:gap-10 py-10 md:py-12 border-t border-ink/15">
              <div class="md:col-span-3">
                <p class="font-mono text-[11px] tracking-[0.3em] text-ink/55">{w.num}</p>
              </div>
              <div class="md:col-span-9">
                <p class="font-mincho text-sm md:text-base text-ink">{w.meta}</p>
                <p class="mt-4 font-mincho text-[14px] md:text-[15px] leading-[2] text-ink/75 max-w-3xl">{w.body}</p>
              </div>
            </article>
          </Reveal>
        {/each}
      </div>

            <h3 class="mt-14 md:mt-16 font-mincho text-sm tracking-[0.2em] text-ink/55">ご依頼のかたち</h3>
            <div class="mt-6 grid md:grid-cols-3">
              {#each [
                ['継続開発・運用保守', '月額で開発と運用をまとめて。いちばん多いかたち。'],
                ['スポット開発', '範囲を決めて、見積りして、作って納める。'],
                ['技術顧問', '月数回の定例で、技術判断の相談役に。']
              ] as [t, d], i (t)}
                <Reveal klass="h-full">
                  <article class={`h-full py-7 md:py-8 border-t border-ink/15 ${i > 0 ? 'md:pl-10 md:border-l' : 'md:pr-10'} ${i === 1 ? 'md:pr-10' : ''}`}>
                    <h4 class="font-mincho text-base text-ink">{t}</h4>
                    <p class="mt-3 font-mincho text-[13px] md:text-[14px] leading-[2] text-ink/70">{d}</p>
                  </article>
                </Reveal>
              {/each}
            </div>

          {:else if $activePanel === 'company'}
            <Reveal>
              <dl class="mt-6 md:mt-10">
          {#each companyFacts as [label, value]}
            <div class="grid grid-cols-12 gap-3 md:gap-10 py-6 md:py-7 border-t border-ink/15">
              <dt class="col-span-12 md:col-span-3 font-mincho text-sm md:text-base text-ink">{label}</dt>
              <dd class="col-span-12 md:col-span-9 font-mincho text-[14px] md:text-[15px] leading-[2] text-ink/85">{value}</dd>
            </div>
          {/each}
        </dl>
            </Reveal>
            <div class="mt-10 pt-6 border-t border-ink/15 flex flex-wrap items-center gap-x-8 gap-y-2 font-mincho text-[13px] text-ink/70">
              <a href="{base}/terms_of_service" class="hover:text-sakura transition-colors">利用規約</a>
              <a href="{base}/privacy_policy" class="hover:text-sakura transition-colors">プライバシーポリシー</a>
              <span class="md:ml-auto text-ink/45 text-[12px]">© {new Date().getFullYear()} bitboxx Inc.</span>
            </div>

          {:else if $activePanel === 'contact'}
            <Reveal>
              <p class="mt-8 max-w-2xl font-mincho text-[15px] md:text-[17px] leading-[2] text-ink/75">
                ご相談・お見積りなど、お気軽にどうぞ。
              </p>
            </Reveal>

            <Reveal>
              <div class="mt-10 md:mt-12 grid md:grid-cols-12 gap-14 md:gap-10">
        <form on:submit|preventDefault={send} class="md:col-span-7 max-w-2xl space-y-10 md:space-y-12">
          <label class="block">
            <span class="block font-mono text-[10px] tracking-[0.3em] text-ink/45 uppercase">Name</span>
            <input
              type="text"
              bind:value={yourname}
              class="mt-3 w-full bg-transparent border-0 border-b border-ink/20 focus:border-sakura outline-none py-3 text-base md:text-lg font-mincho text-ink placeholder-ink/30 transition-colors"
              placeholder="山田 太郎"
              autocomplete="name"
            />
          </label>

          <label class="block">
            <span class="block font-mono text-[10px] tracking-[0.3em] text-ink/45 uppercase">
              Company <span class="text-ink/30 ml-1 normal-case">opt.</span>
            </span>
            <input
              type="text"
              bind:value={company}
              class="mt-3 w-full bg-transparent border-0 border-b border-ink/20 focus:border-sakura outline-none py-3 text-base md:text-lg font-mincho text-ink placeholder-ink/30 transition-colors"
              placeholder="Your Company"
              autocomplete="organization"
            />
          </label>

          <label class="block">
            <span class="block font-mono text-[10px] tracking-[0.3em] text-ink/45 uppercase">Email</span>
            <input
              type="email"
              bind:value={email}
              class="mt-3 w-full bg-transparent border-0 border-b border-ink/20 focus:border-sakura outline-none py-3 text-base md:text-lg font-mincho text-ink placeholder-ink/30 transition-colors"
              placeholder="you@company.com"
              autocomplete="email"
            />
          </label>

          <label class="block">
            <span class="block font-mono text-[10px] tracking-[0.3em] text-ink/45 uppercase">Message</span>
            <textarea
              bind:value={text}
              rows="4"
              class="mt-3 w-full bg-transparent border-0 border-b border-ink/20 focus:border-sakura outline-none py-3 text-base font-mincho text-ink placeholder-ink/30 resize-none transition-colors leading-[1.9]"
              placeholder="ご相談内容をご記入ください"
            ></textarea>
          </label>

          <div class="flex flex-col gap-6 pt-2">
            <label class="flex items-center gap-3 text-sm text-ink/75">
              <input type="checkbox" bind:checked={pr} class="w-4 h-4 accent-sakura"/>
              <span class="font-mincho">
                <button type="button" on:click={openPrivacyModal} class="underline underline-offset-4 hover:text-sakura">
                  プライバシーポリシー
                </button>
                に同意する
              </span>
            </label>

            <button
              type="submit"
              disabled={isDisabled(pr, yourname, email, text)}
              class={`self-start inline-flex items-center gap-3 px-7 py-3.5 rounded-full transition-colors duration-300
                ${isDisabled(pr, yourname, email, text)
                  ? 'bg-ink/5 text-ink/35 cursor-not-allowed'
                  : 'bg-ink text-cream-50 hover:bg-sakura'}`}
            >
              <span class="font-mincho text-sm">送信する</span>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </button>
          </div>
        </form>

        <!-- 右カラム — フォームを使わない人のための直接連絡先 -->
        <aside class="md:col-span-4 md:col-start-9 md:border-l md:border-ink/15 md:pl-10 space-y-10">
          <div>
            <p class="font-mono text-[10px] tracking-[0.3em] text-ink/45 uppercase">Direct</p>
            <a
              href="mailto:contact@bitboxx.co.jp"
              class="mt-3 inline-block font-mincho text-[15px] md:text-base text-ink hover:text-sakura transition-colors"
            >
              contact@bitboxx.co.jp
            </a>
            <p class="mt-2 font-mincho text-[12px] leading-[1.9] text-ink/55">平日 10:00–19:00 (JST)</p>
          </div>
          <div>
            <p class="font-mono text-[10px] tracking-[0.3em] text-ink/45 uppercase">Office</p>
            <p class="mt-3 font-mincho text-[13px] leading-[2] text-ink/75">
              〒103-0015<br/>
              東京都中央区日本橋箱崎町16-11<br/>
              ルミネ日本橋601
            </p>
          </div>
        </aside>
        </div>
            </Reveal>
          {/if}
        </div>
      </div>
    </div>
  {/if}

  {#if showPrivacyModal}
    <div
      class="fixed inset-0 bg-ink/80 backdrop-blur-sm flex items-center justify-center z-[1000] px-4"
      on:click={(e) => { if (e.target === e.currentTarget) closePrivacyModal(); }}
      on:keydown
      role="presentation"
    >
      <div
        bind:this={privacyDialogEl}
        class="bg-cream-50 text-ink rounded-3xl shadow-2xl w-full max-w-3xl p-6 md:p-10 max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-modal-title"
      >
        <div class="flex justify-between items-center mb-4 pb-4 border-b border-ink/10">
          <h2 id="privacy-modal-title" class="font-display italic text-2xl tracking-hyper">プライバシーポリシー</h2>
          <button
            bind:this={privacyCloseBtnEl}
            class="text-ink/60 hover:text-ink text-3xl leading-none"
            on:click={closePrivacyModal}
            aria-label="閉じる"
          >×</button>
        </div>
        <div class="overflow-y-auto pr-2 flex-1">
          <PrivacyPolicy showTitle={false}/>
        </div>
      </div>
    </div>
  {/if}

</main>
