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
  import EkuTriptych from '$lib/components/EkuTriptych.svelte';

  // 主な事業内容 — what we do × どんな価値が生まれるか
  const services = [
    {
      num: '01',
      en: 'Product',
      title: 'プロダクト開発',
      deliverable: '要件整理から設計・実装・リリースまで。Web／モバイル／サーバー／クラウド基盤。',
      value: 'アイデアを、事業として動くプロダクトに変える。'
    },
    {
      num: '02',
      en: 'Operation',
      title: '運用・保守・改善',
      deliverable: '日々の運用、障害対応、性能改善、機能追加。開発と同じチームが続けて担当。',
      value: '作ったものを、毎日少しずつ良くしていく。'
    },
    {
      num: '03',
      en: 'Design',
      title: 'UI／UX 設計',
      deliverable: '情報設計、画面設計、デザインシステム、ブランドから落とすビジュアル。',
      value: '使う人に届く形と、伝わる体験。'
    },
    {
      num: '04',
      en: 'Advisory',
      title: '技術顧問・アドバイザリー',
      deliverable: '技術戦略、体制レビュー、採用・育成、中長期ロードマップ、投資判断。',
      value: '経営判断の場に、技術の目を入れる。'
    }
  ];

  // 通ってきた現場
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

  // なぜ bitboxx か — 選ばれる理由
  const reasons = [
    {
      num: 'Reason 01',
      headline: '事業の意思決定そばで動く。',
      body: '「言われたものをつくる」ではなく、「何をつくるべきか」から並走します。技術と事業の両方の目を持って、経営判断の場に座ります。',
      contrast: '多くの開発会社は仕様の通りにつくる。私たちは、仕様が固まる前から関わる。'
    },
    {
      num: 'Reason 02',
      headline: '作って終わり、ではない。',
      body: '同じチームが、立ち上げから運用・改善まで続けて担当します。引き継ぎ事故もなく、書いた人がそのまま守るので、判断が速い。',
      contrast: '別会社へ引き継ぐとき、よく落ちる文脈がある。私たちは、その引き継ぎ自体が起きない。'
    },
    {
      num: 'Reason 03',
      headline: 'つくらない、という選択も持つ。',
      body: 'Excellent / Kawaii / Unique のいずれにも当てはまらないものは、つくりません。やらないことを決めるところから、設計が始まります。',
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

  function openPrivacyModal(event: MouseEvent) {
    event.preventDefault();
    showPrivacyModal = true;
  }
  function closePrivacyModal() { showPrivacyModal = false; }

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

<main class="relative">
  <!-- HERO — unchanged. Dynamic moment. -->
  <section class="relative min-h-screen min-h-[100svh] flex items-end pt-24 pb-20 overflow-hidden paper-grain">
    <div class="absolute inset-0 z-0 mask-fade-y">
      <HeroCanvas />
    </div>

    <div class="relative z-10 w-full px-6 md:px-10 pb-4">
      <div class="max-w-[1400px] mx-auto">
        <h1 class="font-display leading-[0.82] tracking-hyper break-words pointer-events-none">
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
          <div class="max-w-2xl pointer-events-none">
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

  <!-- PHILOSOPHY / 三つのものさし — canvas-driven triptych -->
  <EkuTriptych />

  <!-- 前提 — お客様の時間をつくる -->
  <section class="relative py-20 md:py-28 paper-grain">
    <div class="max-w-[1400px] mx-auto px-6 md:px-10">
      <Reveal>
        <p class="font-mincho text-sm tracking-[0.2em] text-ink/55">前提</p>
        <p class="mt-8 md:mt-12 max-w-3xl font-mincho text-[18px] md:text-[22px] leading-[2.1] text-ink/85 tracking-[0.02em]">
          お客様のお手伝いをするときは、<br class="hidden md:block"/>
          <span class="underline-handwritten">お客様が本来の事業に集中する時間</span>を生み出すことを仕事としています。
        </p>
        <p class="mt-6 md:mt-8 max-w-2xl font-mincho text-[14px] md:text-[15px] leading-[2.1] text-ink/60">
          システム開発そのものは、そのための手段です。
        </p>
      </Reveal>
    </div>
  </section>

  <!-- SERVICES / 主な事業内容 — what we deliver × what value emerges -->
  <section id="business" class="relative py-20 md:py-28 scroll-mt-24 paper-grain">
    <div class="max-w-[1400px] mx-auto px-6 md:px-10">
      <Reveal>
        <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <p class="font-mincho text-sm tracking-[0.2em] text-ink/55">主な事業内容</p>
          <p class="font-mincho text-[13px] md:text-sm text-ink/50">
            提供するもの<span class="mx-3 text-ink/30">／</span>そこから生まれる価値
          </p>
        </div>
      </Reveal>

      <div class="mt-8 md:mt-12">
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
    </div>
  </section>

  <!-- WHY bitboxx / 選ばれる理由 -->
  <section id="reasons" class="relative py-20 md:py-28 scroll-mt-24 paper-grain bg-cream-100/40">
    <div class="max-w-[1400px] mx-auto px-6 md:px-10">
      <Reveal>
        <p class="font-mincho text-sm tracking-[0.2em] text-ink/55">なぜ bitboxx か</p>
        <h2 class="mt-6 md:mt-8 font-display text-[34px] md:text-[56px] leading-[1.1] tracking-hyper text-ink max-w-3xl">
          <span class="italic">技術と事業、</span><br/>
          両方の目を持つ<span class="text-sakura">.</span>
        </h2>
      </Reveal>

      <div class="mt-12 md:mt-16">
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
    </div>
  </section>

  <!-- CAPABILITIES / 通ってきた現場 -->
  <section class="relative py-20 md:py-28 scroll-mt-24 paper-grain">
    <div class="max-w-[1400px] mx-auto px-6 md:px-10">
      <Reveal>
        <p class="font-mincho text-sm tracking-[0.2em] text-ink/55">通ってきた現場</p>
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

  <!-- WORKS / 実績 -->
  <section id="case-studies" class="relative py-20 md:py-28 scroll-mt-24 paper-grain">
    <div class="max-w-[1400px] mx-auto px-6 md:px-10">
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
    <div class="max-w-[1400px] mx-auto px-6 md:px-10">
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

  <!-- CONTACT / お問い合わせ — single column, breathable, only what's needed. -->
  <section id="contact-form" class="relative py-20 md:py-32 scroll-mt-24 paper-grain">
    <div class="max-w-[1400px] mx-auto px-6 md:px-10">
      <Reveal>
        <p class="font-mincho text-sm tracking-[0.2em] text-ink/55">お問い合わせ</p>
        <p class="mt-6 md:mt-8 max-w-2xl font-mincho text-[15px] md:text-[17px] leading-[2] text-ink/75">
          ご相談・お見積りなど、お気軽にどうぞ。
        </p>
      </Reveal>

      <Reveal>
        <form on:submit|preventDefault={send} class="mt-12 md:mt-16 max-w-2xl space-y-10 md:space-y-12">
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

        <!-- footer line — direct contact + hours, single row -->
        <div class="mt-14 md:mt-20 pt-6 border-t border-ink/15 max-w-2xl flex flex-col md:flex-row md:items-center gap-3 md:gap-8 font-mincho text-[12px] tracking-[0.04em] text-ink/55">
          <span>
            直接メール:
            <a href="mailto:contact@bitboxx.co.jp" class="ml-1 text-ink hover:text-sakura transition-colors">
              contact@bitboxx.co.jp
            </a>
          </span>
          <span class="hidden md:block w-px h-3 bg-ink/15" aria-hidden="true"></span>
          <span>平日 10:00–19:00 (JST)</span>
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
