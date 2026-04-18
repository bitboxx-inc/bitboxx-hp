<svelte:head>
    <title>bitboxx | Excellent. Kawaii. Unique.</title>
    <meta name="description" content="bitboxx (ビットボックス) は、Excellent / Kawaii / Unique の三つのものさしで、事業の核となるプロダクトとシステムを設計・開発する東京のエンジニアリング会社です。"/>
</svelte:head>

<script lang="ts">
  import companyInfo from '$lib/data/company_info.json';
  import PrivacyPolicy from '$lib/domains/PrivacyPolicy.svelte';
  import HeroCanvas from '$lib/components/HeroCanvas.svelte';
  import Reveal from '$lib/components/Reveal.svelte';
  import ParticleBox from '$lib/components/ParticleBox.svelte';

  const services = [
    { num: '01', title: 'システム・プロダクト開発', body: '要件整理から設計・実装・リリース、運用まで。Web／モバイル／サーバー／クラウド基盤。' },
    { num: '02', title: '運用・保守・改善',       body: '障害対応、性能改善、機能追加。開発と同じチームが続けて担当。' },
    { num: '03', title: 'UI／UX 設計',             body: '情報設計、画面設計、デザインシステム、ブランドから落とすビジュアル。' },
    { num: '04', title: '技術顧問・アドバイザリー', body: '技術戦略、体制レビュー、採用・育成、中長期ロードマップ、投資判断。' }
  ];

  const capabilities = [
    {
      tag: '新規サービスの立ち上げ',
      body: 'アイデアを形にして世に出し、事業として育つところまで。小さく始めて、フェーズに合わせて機能を順に組み上げます。'
    },
    {
      tag: 'AI を組み込んだ業務・プロダクト改善',
      body: '生成 AI、データ分析、自動化を事業フローに組み込む。効果の見える場所から段階的に導入します。'
    },
    {
      tag: '決済・課金・業務システム',
      body: 'オンライン決済の導入、会計連携、売上管理、返金対応。お金と業務が動く部分を、確実に。'
    },
    {
      tag: '既存システムの刷新・運用',
      body: '古くなった仕組みを、動かしたまま新しくする。クラウドへの移行、アクセス増にも耐える基盤、性能改善まで。'
    }
  ];

  const plans = [
    {
      label: 'PLAN 01',
      title: 'アーキテクト伴走',
      price: '800,000 円／月〜',
      lead: '技術判断と実行を継続で任せる。',
      items: [
        '事業課題の整理と優先順位付け',
        '技術選定・設計・開発・改善まで一貫',
        '週1以上の定例で意思決定を前進'
      ]
    },
    {
      label: 'PLAN 02',
      title: '運用保守',
      price: '150,000 円／月〜',
      lead: '日々の運用と保守を継続で任せる。',
      items: [
        '日々の運用作業',
        '既存システムの保守・軽微修正',
        '不具合時の一次切り分け'
      ],
      note: '対象業務に応じて内容を調整。作業量が大きい場合は別途見積もり。',
      linkUrl: 'https://pages.bitboxx.co.jp',
      linkLabel: 'ホームページ向けサービス'
    },
    {
      label: 'PLAN 03',
      title: 'システム開発',
      price: 'スポット／個別見積もり',
      lead: '必要な機能や課題を、スポットで仕上げる。',
      items: [
        '新規開発・機能追加・改修',
        '要件整理から実装・リリースまで',
        '運用を見据えた進行'
      ],
      note: '内容・規模・期間に応じて個別見積もり。運用保守契約への移行も可能。'
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
  <!-- HERO — unchanged. Dynamic moment. -->
  <section class="relative min-h-screen min-h-[100svh] flex items-end pt-24 pb-20 overflow-hidden paper-grain">
    <div class="absolute inset-0 z-0 mask-fade-y">
      <HeroCanvas />
    </div>

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

  <!-- PHILOSOPHY / 思想 -->
  <section id="philosophy" class="relative py-20 md:py-28 scroll-mt-24 paper-grain">
    <div class="max-w-[1400px] mx-auto px-6 md:px-10 relative">
      <Reveal>
        <p class="font-mincho text-sm tracking-[0.2em] text-ink/55">大切にしていること</p>
        <div class="mt-8 md:mt-12 max-w-3xl font-mincho text-[15px] md:text-[17px] leading-[2.2] text-ink/85 space-y-6">
          <p>
            我々が作るプロダクトは、<span class="underline-handwritten">Excellent</span>（卓越）、<span class="text-sakura">Kawaii</span>（愛らしさ）、Unique<span class="text-sakura">.</span>（唯一無二）のいずれかを必ず満たします。どれにも当てはまらないものは、つくりません。
          </p>
          <p>
            お客様のお手伝いをするときは、お客様が本来の事業に集中する時間を生み出すことを仕事としています。システム開発そのものは、そのための手段です。
          </p>
        </div>
      </Reveal>
    </div>
  </section>

  <!-- SERVICES / 事業領域 -->
  <section id="business" class="relative py-20 md:py-28 scroll-mt-24 paper-grain">
    <div class="max-w-[1400px] mx-auto px-6 md:px-10 relative">
      <Reveal>
        <p class="font-mincho text-sm tracking-[0.2em] text-ink/55">事業領域</p>
      </Reveal>
      <div class="mt-8 md:mt-12">
        {#each services as s}
          <Reveal>
            <article class="relative grid md:grid-cols-12 gap-3 md:gap-10 py-8 md:py-10 border-t border-ink/15">
              <div class="md:col-span-2">
                <p class="font-mono text-[11px] tracking-[0.3em] text-ink/55">{s.num}</p>
              </div>
              <div class="md:col-span-4">
                <h3 class="font-mincho text-base md:text-lg text-ink">{s.title}</h3>
              </div>
              <p class="md:col-span-6 font-mincho text-[14px] md:text-[15px] leading-[2] text-ink/75 max-w-2xl">
                {s.body}
              </p>
            </article>
          </Reveal>
        {/each}
      </div>
    </div>
  </section>

  <!-- CAPABILITIES / 通ってきた現場 -->
  <section class="relative py-20 md:py-28 scroll-mt-24 paper-grain">
    <div class="max-w-[1400px] mx-auto px-6 md:px-10 relative">
      <Reveal>
        <p class="font-mincho text-sm tracking-[0.2em] text-ink/55">対応領域</p>
      </Reveal>
      <div class="mt-8 md:mt-12">
        {#each capabilities as cap}
          <Reveal>
            <article class="relative grid md:grid-cols-12 gap-3 md:gap-10 py-8 md:py-10 border-t border-ink/15">
              <p class="md:col-span-4 font-mincho text-base md:text-lg text-ink">{cap.tag}</p>
              <p class="md:col-span-8 font-mincho text-[14px] md:text-[15px] leading-[2] text-ink/75 max-w-3xl">{cap.body}</p>
            </article>
          </Reveal>
        {/each}
      </div>
    </div>
  </section>

  <!-- PLANS / 料金 -->
  <section id="plans" class="relative py-20 md:py-28 scroll-mt-24 paper-grain">
    <div class="max-w-[1400px] mx-auto px-6 md:px-10 relative">
      <Reveal>
        <p class="font-mincho text-sm tracking-[0.2em] text-ink/55">料金</p>
      </Reveal>
      <div class="mt-8 md:mt-12">
        {#each plans as plan}
          <Reveal>
            <article class="relative grid md:grid-cols-12 gap-3 md:gap-10 py-10 md:py-12 border-t border-ink/15">
              <div class="md:col-span-3">
                <p class="font-mono text-[11px] tracking-[0.3em] text-ink/55">{plan.label}</p>
                <h3 class="mt-2 font-mincho text-base md:text-lg text-ink">{plan.title}</h3>
              </div>
              <p class="md:col-span-3 font-mono text-sm md:text-base text-ink">
                {plan.price}
              </p>
              <div class="md:col-span-6">
                <p class="font-mincho text-[14px] md:text-[15px] leading-[2] text-ink/85 max-w-2xl">{plan.lead}</p>
                <ul class="mt-4 space-y-1.5 font-mincho text-[13px] md:text-[14px] leading-[2] text-ink/75">
                  {#each plan.items as it}
                    <li>・{it}</li>
                  {/each}
                </ul>
                {#if plan.note}
                  <p class="mt-4 font-mincho text-[12px] md:text-[13px] leading-[1.9] text-ink/55">※ {plan.note}</p>
                {/if}
                {#if plan.linkUrl}
                  <a
                    href={plan.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    class="mt-4 inline-flex items-center gap-2 font-mincho text-[13px] md:text-sm text-ink/85 hover:text-sakura transition-colors"
                  >
                    <span class="underline underline-offset-4 decoration-ink/30">{plan.linkLabel}</span>
                    <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
                  </a>
                {/if}
              </div>
            </article>
          </Reveal>
        {/each}
      </div>
    </div>
  </section>

  <!-- WORKS / 実績 -->
  <section id="case-studies" class="relative py-20 md:py-28 scroll-mt-24 paper-grain">
    <div class="max-w-[1400px] mx-auto px-6 md:px-10 relative">
      <Reveal>
        <p class="font-mincho text-sm tracking-[0.2em] text-ink/55">実績</p>
      </Reveal>
      <div class="mt-8 md:mt-12">
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
    </div>
  </section>

  <!-- COMPANY / 会社概要 -->
  <section id="company" class="relative py-20 md:py-28 scroll-mt-24 paper-grain">
    <div class="max-w-[1400px] mx-auto px-6 md:px-10 relative">
      <Reveal>
        <p class="font-mincho text-sm tracking-[0.2em] text-ink/55">会社概要</p>
      </Reveal>
      <Reveal>
        <dl class="mt-8 md:mt-12">
          {#each companyFacts as [label, value]}
            <div class="grid grid-cols-12 gap-3 md:gap-10 py-6 md:py-7 border-t border-ink/15">
              <dt class="col-span-12 md:col-span-3 font-mincho text-sm md:text-base text-ink">{label}</dt>
              <dd class="col-span-12 md:col-span-9 font-mincho text-[14px] md:text-[15px] leading-[2] text-ink/85">{value}</dd>
            </div>
          {/each}
        </dl>
      </Reveal>
    </div>
  </section>

  <!-- CONTACT / お問い合わせ -->
  <section id="contact-form" class="relative py-20 md:py-28 scroll-mt-24 paper-grain">
    <div class="max-w-[1400px] mx-auto px-6 md:px-10 relative">
      <Reveal>
        <p class="font-mincho text-sm tracking-[0.2em] text-ink/55">お問い合わせ</p>
      </Reveal>

      <Reveal>
        <div class="mt-8 md:mt-12 grid md:grid-cols-12 gap-8 md:gap-16 items-start">
          <div class="md:col-span-4 space-y-6">
            <div class="grid grid-cols-12 gap-3 py-3 border-t border-ink/15">
              <dt class="col-span-4 font-mincho text-sm text-ink/75">Email</dt>
              <dd class="col-span-8">
                <a href="mailto:contact@bitboxx.co.jp" class="font-mincho text-sm text-ink hover:text-sakura transition-colors">
                  contact@bitboxx.co.jp
                </a>
              </dd>
            </div>
            <div class="grid grid-cols-12 gap-3 py-3 border-t border-ink/15">
              <dt class="col-span-4 font-mincho text-sm text-ink/75">所在地</dt>
              <dd class="col-span-8 font-mincho text-sm text-ink/85 leading-7">
                〒{companyInfo.postcode}<br/>{companyInfo.address}
              </dd>
            </div>
            <div class="grid grid-cols-12 gap-3 py-3 border-t border-b border-ink/15">
              <dt class="col-span-4 font-mincho text-sm text-ink/75">営業時間</dt>
              <dd class="col-span-8 font-mincho text-sm text-ink/85">平日 10:00–19:00 (JST)</dd>
            </div>
          </div>

          <div class="md:col-span-8">
            <form on:submit|preventDefault={send} class="space-y-6">
              <div class="grid md:grid-cols-2 gap-x-10 gap-y-6">
                <label class="block">
                  <span class="font-mincho text-[12px] text-ink/60">お名前</span>
                  <input
                    type="text"
                    bind:value={yourname}
                    class="mt-1.5 w-full bg-transparent border-0 border-b border-ink/25 focus:border-sakura outline-none py-2 text-sm placeholder-ink/30"
                    placeholder="山田 太郎"
                  />
                </label>
                <label class="block">
                  <span class="font-mincho text-[12px] text-ink/60">会社名</span>
                  <input
                    type="text"
                    bind:value={company}
                    class="mt-1.5 w-full bg-transparent border-0 border-b border-ink/25 focus:border-sakura outline-none py-2 text-sm placeholder-ink/30"
                    placeholder="Your Company Inc."
                  />
                </label>
                <label class="block">
                  <span class="font-mincho text-[12px] text-ink/60">メール</span>
                  <input
                    type="email"
                    bind:value={email}
                    class="mt-1.5 w-full bg-transparent border-0 border-b border-ink/25 focus:border-sakura outline-none py-2 text-sm placeholder-ink/30"
                    placeholder="you@company.com"
                  />
                </label>
                <label class="block">
                  <span class="font-mincho text-[12px] text-ink/60">電話</span>
                  <input
                    type="tel"
                    bind:value={tel}
                    class="mt-1.5 w-full bg-transparent border-0 border-b border-ink/25 focus:border-sakura outline-none py-2 text-sm placeholder-ink/30"
                    placeholder="03-0000-0000"
                  />
                </label>
              </div>

              <label class="block">
                <span class="font-mincho text-[12px] text-ink/60">お問い合わせ内容</span>
                <textarea
                  bind:value={text}
                  rows="5"
                  class="mt-1.5 w-full bg-transparent border-0 border-b border-ink/25 focus:border-sakura outline-none py-2 text-sm resize-none placeholder-ink/30"
                  placeholder="ご相談内容をご記入ください。"
                ></textarea>
              </label>

              <label class="flex items-center gap-3 text-sm text-ink/75">
                <input type="checkbox" bind:checked={pr} class="w-4 h-4 accent-sakura"/>
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
                class={`inline-flex items-center gap-3 px-6 py-3 rounded-full transition-colors duration-300
                  ${isDisabled(pr, yourname, company, email, tel, text)
                    ? 'bg-ink/5 text-ink/35 cursor-not-allowed'
                    : 'bg-ink text-cream-50 hover:bg-sakura'}`}
              >
                <span class="font-mincho text-sm">送信する</span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7"/></svg>
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
          <h2 class="font-display italic text-2xl tracking-hyper">プライバシーポリシー</h2>
          <button class="text-ink/60 hover:text-ink text-3xl leading-none" on:click={closePrivacyModal} aria-label="閉じる">×</button>
        </div>
        <div class="overflow-y-auto pr-2 flex-1">
          <PrivacyPolicy showTitle={false}/>
        </div>
      </div>
    </div>
  {/if}

  <!-- IDENTITY / 粒子がロゴを形成する。フッタと同じ白地で視覚連続。 -->
  <section class="relative pt-20 md:pt-28">
    <div class="max-w-[1400px] mx-auto px-6 md:px-10 relative">
      <ParticleBox height={300} />
    </div>
  </section>
</main>
