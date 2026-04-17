<svelte:head>
    <title>bitboxx | Excellent. Kawaii. Unique.</title>
    <meta name="description" content="bitboxx (ビットボックス) は、Excellent / Kawaii / Unique の三つのものさしで、事業の核となるプロダクトとシステムを設計・開発する東京のエンジニアリング会社です。"/>
</svelte:head>

<script lang="ts">
  import companyInfo from '$lib/data/company_info.json';
  import PrivacyPolicy from '$lib/domains/PrivacyPolicy.svelte';
  import HeroCanvas from '$lib/components/HeroCanvas.svelte';
  import Reveal from '$lib/components/Reveal.svelte';
  import Mascot from '$lib/components/Mascot.svelte';
  import ParticleBox from '$lib/components/ParticleBox.svelte';

  const philosophy = [
    {
      code: 'E',
      word: 'Excellent',
      jp: '卓越',
      body: '確かな技術判断と洗練された設計。事業の核になる、十年後も<span class="underline-handwritten">壊れない</span>プロダクトを。',
      tags: ['Architecture', 'Scalability', 'Quality']
    },
    {
      code: 'K',
      word: 'Kawaii',
      jp: '愛らしさ',
      body: '使う人が思わず微笑むディテール。<span class="text-sakura">愛着</span>が生まれるプロダクトは、長く使われ、長く育つ。',
      tags: ['UI · UX', 'Craft', 'Delight']
    },
    {
      code: 'U',
      word: 'Unique',
      jp: '唯一無二',
      body: '既成概念にとらわれない発想。他にはないものづくりを、技術で成立させる<span class="text-sakura">。</span>',
      tags: ['Invention', 'Identity', 'Edge']
    }
  ];

  const services = [
    {
      num: '01',
      title: 'システム・プロダクト開発',
      en: 'Development',
      body: '事業の基盤となるシステムやアプリケーションを、要件整理から設計・実装・リリースまで一貫して担います。',
      bullets: ['Web・モバイル・サーバーの一貫開発', 'クラウド基盤とインフラの設計・構築', '大規模運用に耐える設計と検証']
    },
    {
      num: '02',
      title: '運用・保守・改善',
      en: 'Operations',
      body: '日々の運用から機能追加、性能改善まで。安定稼働と継続的な成長を、同じチームで支えます。',
      bullets: ['継続的な保守と軽微な改修', '障害対応とパフォーマンス改善', '拡張・リニューアルへの段階的移行']
    },
    {
      num: '03',
      title: 'UI / UX 設計',
      en: 'Design',
      body: '使いやすさと美しさの両立。事業の意図が正しく伝わり、日々の業務を邪魔しないインターフェイスを設計します。',
      bullets: ['プロダクトの情報設計と画面設計', 'デザインシステムの整備', 'ブランドから落としたビジュアル設計']
    },
    {
      num: '04',
      title: '技術顧問・アドバイザリー',
      en: 'Advisory',
      body: '技術選定や開発体制づくりをともに考え、意思決定と実行まで伴走します。経営の技術パートナーとしてお使いください。',
      bullets: ['技術戦略と開発体制のレビュー', '採用・育成を含めた組織づくり支援', '中長期のロードマップ策定']
    }
  ];

  const plans = [
    {
      label: 'PLAN 01',
      title: 'アーキテクト伴走',
      price: '¥800,000',
      unit: '/ 月 〜',
      accent: '#111014',
      description: 'ITアーキテクト水準の判断と実行を継続的に任せたい事業に。',
      sections: [
        { title: '支援内容', items: ['事業課題の整理と優先順位付け', '技術選定・設計・開発・改善まで一貫', '運用を見据えた継続支援'] },
        { title: '提供価値', items: ['高単価案件水準のアーキテクトが専属で対応', '単なる要員追加ではなく、技術判断ごと委任可能', '週1以上の定例で意思決定を前進'] }
      ]
    },
    {
      label: 'PLAN 02',
      title: '運用保守',
      price: '¥150,000',
      unit: '/ 月 〜',
      accent: '#111014',
      description: '日々の運用や保守を、継続して安心して任せたい事業に。',
      sections: [
        { title: '支援内容', items: ['日々の運用作業の代行', '既存システムの保守・軽微修正', '不具合時の一次切り分け'] },
        { title: '契約条件', items: ['対象業務に応じて内容を調整', '作業量が大きい場合は別途見積もり'] }
      ],
      linkUrl: 'https://pages.bitboxx.co.jp',
      linkLabel: 'ホームページ向けサービス →'
    },
    {
      label: 'PLAN 03',
      title: 'システム開発',
      price: 'ASK',
      unit: 'スポット',
      accent: '#111014',
      description: '必要な機能や課題に応じ、スポットでつくりきりたい事業に。',
      sections: [
        { title: '支援内容', items: ['新規開発・機能追加・改修', '要件整理から設計・実装・リリースまで', '運用を見据えて進行'] },
        { title: '契約形態', items: ['内容・規模・期間に応じて個別見積もり', '運用保守契約への移行も可能'] }
      ]
    }
  ];

  const reasons = [
    {
      num: '01',
      title: '事業に集中できる進行設計',
      body: '必要な施策と開発を整理し、優先順位を明確化。運用に追われる時間や判断コストを減らし、事業に集中できる状態をつくります。'
    },
    {
      num: '02',
      title: '幅広い実績に裏打ちされた技術判断',
      body: '数千万人規模のWebサービスからホームページ制作、決済導入、クラウド移行まで。技術を先に決めず、経験から最適解を導きます。'
    },
    {
      num: '03',
      title: '選定だけで終わらない実行力',
      body: 'UI/UX設計から開発、運用保守まで一貫対応。方針づくりで終わらせず、実装と運用まで成果に結びつけます。'
    }
  ];

  const caseStudies = [
    {
      label: 'Architect Partnership',
      jp: 'アーキテクト伴走',
      company: '美容系事業会社',
      accent: '#1F1D24',
      body: 'ホームページ制作・事業用システム開発・事業方針の相談まで一貫支援。事業フェーズに応じた技術選定と開発方針の整理を継続的に。',
      items: ['HP制作・システム開発・事業方針の相談を一体で支援', 'システム選定や進め方の整理まで伴走', 'コスト管理や投資判断まで提案']
    },
    {
      label: 'Maintenance Partnership',
      jp: '運用保守',
      company: '不動産会社',
      accent: '#2A272F',
      body: 'ホームページの運用保守や社内アカウント管理など、日常的な運用業務を継続支援。必要時には社内ツール整備などスポット対応も。',
      items: ['HPの更新・運用保守・軽微な改善を継続支援', '社内アカウント管理などの定期運用に対応', '社内ツール整備なども必要に応じて実施']
    }
  ];

  let yourname = '';
  let company = '';
  let email = '';
  let tel = '';
  let text = '';
  let pr = false;
  let showPrivacyModal = false;

  function openPrivacyModal(event: MouseEvent) {
    event.preventDefault();
    showPrivacyModal = true;
  }
  function closePrivacyModal() { showPrivacyModal = false; }

  function send() {
    if (isDisabled(pr, yourname, company, email, tel, text)) return;
    const mailto = `mailto:contact@bitboxx.co.jp?subject=ホームページからのお問い合わせ&body=${encodeURIComponent(
      `問い合わせ内容:\n${text}\n\n---\n氏名: ${yourname}\n会社名: ${company}\n電話番号: ${tel}\nメールアドレス: ${email}\n---`
    )}`;
    window.location.href = mailto;
  }

  function isDisabled(pr: boolean, yourname: string, company: string, email: string, tel: string, text: string) {
    return !pr || yourname === '' || company === '' || email === '' || tel === '' || text === '';
  }
</script>

<main class="relative">
  <!-- HERO -->
  <section class="relative min-h-screen min-h-[100svh] flex items-end pt-24 pb-20 overflow-hidden paper-grain">
    <!-- 3D canvas -->
    <div class="absolute inset-0 z-0 mask-fade-y">
      <HeroCanvas />
    </div>

    <!-- Main title -->
    <div class="relative z-10 w-full px-6 md:px-10 pb-4">
      <div class="max-w-[1400px] mx-auto">
        <h1 class="font-display leading-[0.82] tracking-hyper break-words">
          <span class="block text-[14vw] md:text-[11vw] lg:text-[9.5rem] italic">
            <span class="underline-handwritten">Excellent.</span>
          </span>
          <span class="block text-[14vw] md:text-[11vw] lg:text-[9.5rem] pl-[6vw] md:pl-[12vw]">
            <span class="text-sakura italic">Kawaii.</span>
          </span>
          <span class="block text-[14vw] md:text-[11vw] lg:text-[9.5rem] pl-[2vw] md:pl-[4vw]">
            Unique<span class="text-sakura">.</span>
          </span>
        </h1>

        <div class="mt-14 md:mt-20 flex flex-col md:flex-row md:items-end md:justify-between gap-10">
          <div class="max-w-2xl">
            <p class="font-mincho font-light text-[26px] md:text-[44px] leading-[1.5] tracking-[0.04em] text-ink">
              まだ見ぬ<span class="relative inline-block">
                <span class="relative z-10">最高</span>
                <span class="absolute inset-x-0 bottom-[0.12em] h-[0.28em] bg-sakura/60 -z-0" aria-hidden="true"></span>
              </span>を、<br class="hidden sm:block"/>
              確かな品質で。
            </p>
            <p class="mt-7 md:mt-10 font-mincho text-[15px] md:text-[17px] leading-[2.1] text-ink/60 max-w-lg tracking-[0.06em]">
              唯一無二のアイデアを卓越した技術で実現し、<br class="hidden md:block"/>
              愛着あるプロダクトとして世界に届ける。
            </p>
          </div>
          <div class="shrink-0">
            <a
              href="#contact-form"
              class="btn-ink group inline-flex items-center gap-3 px-7 py-3.5 rounded-full text-base font-medium transition-colors duration-300"
            >
              <span class="font-display italic text-lg whitespace-nowrap">プロジェクトを相談する</span>
              <svg class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
            </a>
          </div>
        </div>
      </div>
    </div>

  </section>

  <!-- PHILOSOPHY -->
  <section id="philosophy" class="relative py-28 md:py-40 scroll-mt-24 overflow-hidden">
    <div class="max-w-[1400px] mx-auto px-6 md:px-10">
      <Reveal>
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-24">
          <div>
            <p class="font-mono text-xs tracking-[0.32em] uppercase text-ink/50">— 01 / Philosophy</p>
            <h2 class="mt-6 font-display italic text-6xl md:text-8xl tracking-hyper leading-[0.9]">
              三つのものさし、<br/>
              <span class="not-italic">E.K.U.</span>
            </h2>
          </div>
          <p class="max-w-sm font-mincho text-base leading-8 text-ink/70">
            私たちは、作るものすべてを「卓越しているか」「愛らしいか」「唯一無二か」で測ります。どれが欠けても、私たちの仕事ではありません。
          </p>
        </div>
      </Reveal>

      <div class="grid md:grid-cols-3 gap-6 md:gap-8">
        {#each philosophy as p, i}
          <Reveal delay={i + 1}>
            <article class="relative corner-marks soft-card p-8 md:p-10 h-full overflow-hidden bg-white text-ink">
              <span class="cm-bl"></span>
              <span class="cm-br"></span>
              <div class="absolute inset-0 bg-dotgrid-lite opacity-70 pointer-events-none"></div>
              <div class="relative flex items-start justify-between">
                <div class="font-display italic text-[9rem] leading-none tracking-hyper text-ink">
                  {p.code}
                </div>
                <Mascot klass="w-14 h-14 animate-floaty" color="#FFFFFF" cheekColor="#ECECEA" eyeColor="#111014"/>
              </div>
              <div class="relative mt-6">
                <p class="font-mono text-[11px] tracking-[0.3em] uppercase text-ink/50">{p.jp}</p>
                <h3 class="mt-2 font-display italic text-4xl tracking-hyper">
                  {#if p.code === 'E'}
                    <span class="underline-handwritten">{p.word}</span>.
                  {:else if p.code === 'K'}
                    <span class="text-sakura">{p.word}</span>.
                  {:else}
                    {p.word}<span class="text-sakura">.</span>
                  {/if}
                </h3>
                <p class="mt-5 text-sm leading-7 text-ink/75">{@html p.body}</p>
                <div class="mt-7 flex flex-wrap gap-2">
                  {#each p.tags as tag}
                    <span class="text-[11px] font-mono tracking-widest uppercase px-3 py-1 rounded-full border border-ink/15">
                      {tag}
                    </span>
                  {/each}
                </div>
              </div>
            </article>
          </Reveal>
        {/each}
      </div>
    </div>
  </section>

  <!-- SERVICES -->
  <section id="business" class="relative py-28 md:py-40 bg-ink text-cream-50 scroll-mt-24 overflow-hidden">
    <div class="pointer-events-none absolute inset-0 bg-noise opacity-20"></div>
    <div class="pointer-events-none absolute inset-0 bg-dotgrid-dark opacity-30"></div>

    <div class="relative max-w-[1400px] mx-auto px-6 md:px-10">
      <Reveal>
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-24">
          <div>
            <p class="font-mono text-xs tracking-[0.32em] uppercase text-cream-50/50">— 02 / Services</p>
            <h2 class="mt-6 font-display italic text-6xl md:text-8xl tracking-hyper leading-[0.9]">
              What we craft.
            </h2>
          </div>
          <p class="max-w-sm font-mincho text-base leading-8 text-cream-50/70">
            事業の核になるプロダクトから、先進技術による仕組みづくり、UI/UX、アウトドア領域まで。技術と craft を掛け合わせて、一貫して担います。
          </p>
        </div>
      </Reveal>

      <div class="grid md:grid-cols-2 gap-px bg-cream-50/10 rounded-3xl overflow-hidden border border-cream-50/10">
        {#each services as s, i}
          <Reveal delay={(i % 4) + 1}>
            <article class="relative bg-ink p-8 md:p-12 h-full">
              <div class="flex items-start justify-between">
                <span class="font-mono text-xs tracking-[0.32em] text-cream-50/50">{s.num}</span>
                <span class="font-display italic text-cream-50/40">{s.en}</span>
              </div>
              <h3 class="mt-10 font-display text-4xl md:text-5xl tracking-hyper leading-[1.02]">
                {s.title}
              </h3>
              <p class="mt-6 text-sm leading-8 text-cream-50/75 max-w-lg">{s.body}</p>
              <ul class="mt-8 space-y-2">
                {#each s.bullets as b}
                  <li class="flex items-baseline gap-3 text-sm text-cream-50/80">
                    <span class="inline-block w-[6px] h-[6px] bg-cream-50/90 translate-y-[-2px]"></span>
                    {b}
                  </li>
                {/each}
              </ul>
            </article>
          </Reveal>
        {/each}
      </div>
    </div>
  </section>

  <!-- PLANS -->
  <section id="plans" class="relative py-28 md:py-40 scroll-mt-24 overflow-hidden">
    <div class="max-w-[1400px] mx-auto px-6 md:px-10">
      <Reveal>
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-24">
          <div>
            <p class="font-mono text-xs tracking-[0.32em] uppercase text-ink/50">— 03 / Plans</p>
            <h2 class="mt-6 font-display italic text-6xl md:text-8xl tracking-hyper leading-[0.9]">
              三つの<br class="md:hidden"/>関わり方.
            </h2>
          </div>
          <p class="max-w-sm font-mincho text-base leading-8 text-ink/70">
            事業フェーズと必要な関わり方に応じて、最適な形で伴走します。どのプランも、入口は「相談」からです。
          </p>
        </div>
      </Reveal>

      <div class="grid gap-8 lg:grid-cols-3">
        {#each plans as plan, i}
          <Reveal delay={i + 1}>
            <article
              class="relative soft-card p-8 md:p-10 h-full flex flex-col overflow-hidden hover-lift group"
              data-cursor="hover"
            >
              <div
                class="absolute top-0 left-0 h-1.5 w-1/3 rounded-br-xl transition-[width] duration-500 group-hover:w-full"
                style="background: {plan.accent}"
              ></div>
              <div class="flex items-start justify-between">
                <p class="font-mono text-[11px] tracking-[0.32em] uppercase text-ink/50">{plan.label}</p>
                <span
                  class="w-8 h-8 rounded-full flex items-center justify-center text-ink/60 border border-ink/15"
                  style="background-color: {plan.accent}22"
                >
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17l10-10M7 7h10v10"/></svg>
                </span>
              </div>
              <h3 class="mt-6 font-display italic text-4xl tracking-hyper">{plan.title}</h3>
              <p class="mt-4 text-sm leading-7 text-ink/70">{plan.description}</p>

              <div class="mt-8 flex items-baseline gap-2">
                <span class="font-display text-5xl md:text-6xl tracking-hyper">{plan.price}</span>
                <span class="text-sm text-ink/50">{plan.unit}</span>
              </div>

              <div class="mt-8 space-y-6 pt-6 border-t border-ink/10">
                {#each plan.sections as section}
                  <div>
                    <p class="font-mono text-[11px] tracking-[0.28em] uppercase text-ink/50">{section.title}</p>
                    <ul class="mt-3 space-y-2 text-sm leading-7 text-ink/80">
                      {#each section.items as item}
                        <li class="flex items-baseline gap-3">
                          <span class="mt-[5px] inline-block w-1 h-1 rounded-full" style="background: {plan.accent}"></span>
                          <span>{item}</span>
                        </li>
                      {/each}
                    </ul>
                  </div>
                {/each}

                {#if plan.linkUrl}
                  <a
                    href={plan.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    class="inline-flex text-sm font-medium underline underline-offset-4"
                  >
                    {plan.linkLabel}
                  </a>
                {/if}
              </div>
            </article>
          </Reveal>
        {/each}
      </div>
    </div>
  </section>

  <!-- REASONS -->
  <section id="reasons" class="relative py-28 md:py-40 bg-cream-100 scroll-mt-24 overflow-hidden paper-grain">
    <div class="max-w-[1400px] mx-auto px-6 md:px-10 relative">
      <Reveal>
        <div class="grid md:grid-cols-12 gap-10 mb-16 md:mb-24 items-end">
          <div class="md:col-span-7">
            <p class="font-mono text-xs tracking-[0.32em] uppercase text-ink/50">— 04 / Why bitboxx</p>
            <h2 class="mt-6 font-display italic text-6xl md:text-8xl tracking-hyper leading-[0.9] text-balance">
              進行設計、<br/>
              技術判断、<br/>
              <span class="underline-handwritten">実行まで。</span>
            </h2>
          </div>
          <p class="md:col-span-5 font-mincho text-base leading-8 text-ink/70 max-w-md">
            方針だけで終わらせない。判断と実装が同じチームで連続しているから、ぶれずに前へ進みます。
          </p>
        </div>
      </Reveal>

      <div class="grid md:grid-cols-3 gap-6 md:gap-10">
        {#each reasons as r, i}
          <Reveal delay={i + 1}>
            <article class="relative pt-8 border-t-2 border-ink h-full" data-cursor="hover">
              <span class="absolute -top-5 left-0 font-mono text-xs tracking-[0.32em] bg-cream-100 pr-3 text-ink/60">{r.num}</span>
              <h3 class="font-display text-3xl md:text-4xl tracking-hyper leading-[1.1]">{r.title}</h3>
              <p class="mt-6 text-sm leading-8 text-ink/75">{r.body}</p>
            </article>
          </Reveal>
        {/each}
      </div>
    </div>
  </section>

  <!-- CASE STUDIES -->
  <section id="case-studies" class="relative py-28 md:py-40 scroll-mt-24 overflow-hidden">
    <div class="max-w-[1400px] mx-auto px-6 md:px-10">
      <Reveal>
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-24">
          <div>
            <p class="font-mono text-xs tracking-[0.32em] uppercase text-ink/50">— 05 / Works</p>
            <h2 class="mt-6 font-display italic text-6xl md:text-8xl tracking-hyper leading-[0.9]">
              支援の軌跡.
            </h2>
          </div>
          <p class="max-w-sm font-mincho text-base leading-8 text-ink/70">
            どんな「関わり方」で事業に入り込んでいるのか、代表的な事例を。
          </p>
        </div>
      </Reveal>

      <div class="space-y-10 md:space-y-16">
        {#each caseStudies as study, i}
          <Reveal delay={(i % 3) + 1}>
            <article
              class="relative soft-card p-8 md:p-12 grid md:grid-cols-12 gap-8 md:gap-12 items-start"
            >
              <div class="md:col-span-4 flex md:flex-col items-start md:items-start gap-4 md:gap-6">
                <div
                  class="relative w-20 h-20 md:w-28 md:h-28 rounded-xl flex items-center justify-center font-display italic text-4xl md:text-5xl text-white"
                  style="background: {study.accent}"
                >
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <p class="font-mono text-[11px] tracking-[0.28em] uppercase text-ink/50">{study.label}</p>
                  <p class="mt-2 font-display italic text-2xl tracking-hyper">{study.jp}</p>
                </div>
              </div>

              <div class="md:col-span-8">
                <h3 class="font-display text-3xl md:text-5xl tracking-hyper leading-[1.05]">
                  {study.company}
                </h3>
                <p class="mt-6 text-sm md:text-base leading-8 text-ink/75 max-w-2xl">
                  {study.body}
                </p>
                <ul class="mt-8 pt-8 border-t border-ink/10 grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm leading-7 text-ink/80">
                  {#each study.items as item}
                    <li class="flex items-baseline gap-3">
                      <span class="inline-block w-[6px] h-[6px]" style="background: {study.accent}"></span>
                      <span>{item}</span>
                    </li>
                  {/each}
                </ul>
              </div>
            </article>
          </Reveal>
        {/each}
      </div>
    </div>
  </section>

  <!-- PARTICLE INTERMISSION -->
  <section class="relative py-8 md:py-16 overflow-hidden">
    <div class="max-w-[1400px] mx-auto px-6 md:px-10">
      <div class="flex items-center justify-between mb-6 md:mb-8 text-ink/50">
        <p class="font-mono text-[11px] tracking-[0.32em] uppercase">— Identity</p>
        <p class="font-mono text-[11px] tracking-[0.28em] uppercase hidden md:block">bit · box · x</p>
      </div>
      <ParticleBox height={360} />
      <p class="mt-6 md:mt-10 text-center font-mincho text-sm md:text-base text-ink/55 tracking-[0.08em]">
        小さな点の積み重ねが、かたちになる。
      </p>
    </div>
  </section>

  <!-- COMPANY -->
  <section id="company" class="relative py-28 md:py-40 bg-cream-100 paper-grain scroll-mt-24">
    <div class="max-w-[1400px] mx-auto px-6 md:px-10">
      <div class="grid md:grid-cols-12 gap-10 md:gap-16">
        <Reveal klass="md:col-span-5">
          <p class="font-mono text-xs tracking-[0.32em] uppercase text-ink/50">— 06 / Company</p>
          <h2 class="mt-6 font-display italic text-6xl md:text-8xl tracking-hyper leading-[0.88]">
            会社<br/>概要.
          </h2>
          <p class="mt-8 font-mincho text-base leading-8 text-ink/70 max-w-md">
            東京・日本橋箱崎を拠点に、EKU思想のプロダクトづくりを行うエンジニアリング会社です。
          </p>

          <div class="mt-10 flex items-center gap-4">
            <Mascot klass="w-20 h-20 animate-floaty" color="#FFFFFF"/>
            <div class="font-mono text-[11px] tracking-[0.28em] uppercase text-ink/60 leading-7">
              Hello!<br/>
              We are<br/>
              bitboxx.
            </div>
          </div>
        </Reveal>

        <Reveal delay={1} klass="md:col-span-7">
          <dl class="divide-y divide-ink/15 border-y border-ink/15">
            {#each [
              ['会社名', 'Name', companyInfo.name],
              ['所在地', 'Location', `${companyInfo.postcode}  ${companyInfo.address}`],
              ['代表者', 'Founder', companyInfo.representative],
              ['設立', 'Founded', `${companyInfo.established.substring(0, 4)}年${companyInfo.established.substring(5, 7)}月${companyInfo.established.substring(8, 10)}日`],
              ['事業内容', 'Business', companyInfo.business]
            ] as [label, en, value]}
              <div class="grid grid-cols-12 gap-4 py-6">
                <dt class="col-span-4">
                  <p class="font-display italic text-lg tracking-hyper">{label}</p>
                  <p class="font-mono text-[10px] tracking-[0.3em] uppercase text-ink/50">{en}</p>
                </dt>
                <dd class="col-span-8 text-sm md:text-base leading-7 text-ink/85">{value}</dd>
              </div>
            {/each}
          </dl>
        </Reveal>
      </div>
    </div>
  </section>

  <!-- CONTACT -->
  <section id="contact-form" class="relative py-28 md:py-40 bg-ink text-cream-50 scroll-mt-24 overflow-hidden">
    <div class="pointer-events-none absolute inset-0 bg-noise opacity-20"></div>
    <div class="pointer-events-none absolute inset-0 bg-dotgrid-dark opacity-25"></div>

    <div class="relative max-w-[1400px] mx-auto px-6 md:px-10">
      <Reveal>
        <p class="font-mono text-xs tracking-[0.32em] uppercase text-cream-50/50">— 07 / Contact</p>
        <h2 class="mt-6 font-display italic text-6xl md:text-[10rem] tracking-hyper leading-[0.85] text-balance">
          Let's make<br/>
          something wonderful.
        </h2>
        <p class="mt-8 font-mincho text-base md:text-lg leading-8 text-cream-50/75 max-w-xl">
          次の「最高」をつくる相談を、お待ちしています。プロジェクトのご相談、協業のご提案、その他お気軽にどうぞ。
        </p>
      </Reveal>

      <Reveal delay={1}>
        <div class="mt-14 md:mt-20 grid md:grid-cols-12 gap-10 md:gap-16 items-start">
          <div class="md:col-span-5 space-y-8">
            <div>
              <p class="font-mono text-[11px] tracking-[0.28em] uppercase text-cream-50/50">Email</p>
              <a href="mailto:contact@bitboxx.co.jp" class="mt-2 inline-block font-display italic text-3xl md:text-4xl tracking-hyper hover:text-sakura transition-colors">
                contact@bitboxx.co.jp
              </a>
            </div>
            <div>
              <p class="font-mono text-[11px] tracking-[0.28em] uppercase text-cream-50/50">Office</p>
              <p class="mt-2 text-sm leading-7 text-cream-50/85">
                {companyInfo.postcode}<br/>
                {companyInfo.address}
              </p>
            </div>
            <div>
              <p class="font-mono text-[11px] tracking-[0.28em] uppercase text-cream-50/50">Hours</p>
              <p class="mt-2 text-sm text-cream-50/85">平日 10:00 – 19:00 (JST)</p>
            </div>
          </div>

          <div class="md:col-span-7">
            <form on:submit|preventDefault={send} class="space-y-8 bg-cream-50/5 backdrop-blur rounded-3xl border border-cream-50/10 p-8 md:p-10">
              <div class="grid md:grid-cols-2 gap-6">
                <label class="block">
                  <span class="font-mono text-[11px] tracking-[0.28em] uppercase text-cream-50/50">お名前</span>
                  <input
                    type="text"
                    bind:value={yourname}
                    class="mt-2 w-full bg-transparent border-b border-cream-50/25 focus:border-sakura outline-none py-3 text-lg placeholder-cream-50/30"
                    placeholder="山田 太郎"
                  />
                </label>
                <label class="block">
                  <span class="font-mono text-[11px] tracking-[0.28em] uppercase text-cream-50/50">会社名</span>
                  <input
                    type="text"
                    bind:value={company}
                    class="mt-2 w-full bg-transparent border-b border-cream-50/25 focus:border-sakura outline-none py-3 text-lg placeholder-cream-50/30"
                    placeholder="Your Company Inc."
                  />
                </label>
                <label class="block">
                  <span class="font-mono text-[11px] tracking-[0.28em] uppercase text-cream-50/50">メール</span>
                  <input
                    type="email"
                    bind:value={email}
                    class="mt-2 w-full bg-transparent border-b border-cream-50/25 focus:border-sakura outline-none py-3 text-lg placeholder-cream-50/30"
                    placeholder="you@company.com"
                  />
                </label>
                <label class="block">
                  <span class="font-mono text-[11px] tracking-[0.28em] uppercase text-cream-50/50">電話</span>
                  <input
                    type="tel"
                    bind:value={tel}
                    class="mt-2 w-full bg-transparent border-b border-cream-50/25 focus:border-sakura outline-none py-3 text-lg placeholder-cream-50/30"
                    placeholder="03-0000-0000"
                  />
                </label>
              </div>

              <label class="block">
                <span class="font-mono text-[11px] tracking-[0.28em] uppercase text-cream-50/50">お問い合わせ内容</span>
                <textarea
                  bind:value={text}
                  rows="5"
                  class="mt-2 w-full bg-transparent border border-cream-50/20 focus:border-sakura outline-none rounded-2xl p-4 text-lg resize-none placeholder-cream-50/30"
                  placeholder="ご相談内容を自由にどうぞ"
                ></textarea>
              </label>

              <label class="flex items-center gap-3 text-sm text-cream-50/80">
                <input
                  type="checkbox"
                  bind:checked={pr}
                  class="w-4 h-4 accent-sakura"
                />
                <span>
                  <button type="button" on:click={openPrivacyModal} class="underline underline-offset-4 hover:text-sakura">
                    プライバシーポリシー
                  </button>
                  に同意する
                </span>
              </label>

              <button
                type="submit"
                disabled={isDisabled(pr, yourname, company, email, tel, text)}
                class={`group w-full flex items-center justify-between pl-7 pr-2 py-2 rounded-full transition-all duration-500
                  ${isDisabled(pr, yourname, company, email, tel, text)
                    ? 'bg-cream-50/10 text-cream-50/40 cursor-not-allowed'
                    : 'bg-cream-50 text-ink hover:bg-sakura'}`}
              >
                <span class="font-display italic text-xl">送信する</span>
                <span class="w-12 h-12 rounded-full bg-ink text-cream-50 flex items-center justify-center group-hover:rotate-45 transition-transform duration-500">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                </span>
              </button>
            </form>
          </div>
        </div>
      </Reveal>
    </div>
  </section>

  {#if showPrivacyModal}
    <div
      class="fixed inset-0 bg-ink/80 backdrop-blur-sm flex items-center justify-center z-[1000] px-4"
      on:click={closePrivacyModal}
      on:keydown
      role="presentation"
    >
      <div
        class="bg-cream-50 text-ink rounded-3xl shadow-2xl w-full max-w-3xl p-6 md:p-10 max-h-[90vh] flex flex-col"
        on:click|stopPropagation
        on:keydown
        role="presentation"
      >
        <div class="flex justify-between items-center mb-4 pb-4 border-b border-ink/10">
          <h2 class="font-display italic text-3xl tracking-hyper">プライバシーポリシー</h2>
          <button class="text-ink/60 hover:text-ink text-3xl leading-none" on:click={closePrivacyModal} aria-label="閉じる">×</button>
        </div>
        <div class="overflow-y-auto pr-2 flex-1">
          <PrivacyPolicy showTitle={false}/>
        </div>
      </div>
    </div>
  {/if}
</main>

<style>
  :global(.text-cream-50\/8) { color: rgba(251,247,241,0.08); }
</style>
