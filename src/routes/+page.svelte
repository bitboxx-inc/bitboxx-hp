<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=League+Gothic&family=Noto+Serif+JP&display=swap"
          rel="stylesheet">
    <title>株式会社bitboxx</title>
</svelte:head>

<script lang="ts">
  import { base } from '$app/paths';
  // 会社情報JSONファイルをインポート
  import companyInfo from '$lib/data/company_info.json';

  // 修正: プライバシーポリシーコンポーネントをインポート
  import PrivacyPolicy from '$lib/domains/PrivacyPolicy.svelte';


  // --- ECUアイコンパス ---
  const icons = {
    excellent: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z',
    kawaii: 'M17 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm-5 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zM7 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    unique: 'M12 2L6 22h12L12 2zm0 3.82L15.34 16h-6.68L12 5.82z',
    development: 'M16 4h2l2 2v10l-2 2h-4l-2-2v-4l2-2h4V8H8v8h8',
    ai: 'M19 14.5c0 1.95-1.55 3.5-3.5 3.5s-3.5-1.55-3.5-3.5c0-.97.4-1.85 1.04-2.5l-.04-.04c.04-.04.08-.08.13-.12.65-.65 1.52-1.05 2.47-1.05 1.95 0 3.5 1.55 3.5 3.5z',
    design: 'M17 12c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm-5-8H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h6v2h2v-2h4v-2h-4V4z',
    outdoor: 'M12 2l-5 5h10l-5-5zM4 10v9h16v-9H4zm2 2h12v5H6v-5z',
  }

  // --- コンタクトフォームのロジック ---
  let yourname = '';
  let company = '';
  let email = '';
  let tel = '';
  let text = '';
  let pr = false;

  // 修正: モーダルの表示状態
  let showPrivacyModal = false;

  // 修正: モーダルを開く関数
  function openPrivacyModal(event: MouseEvent) {
    event.preventDefault(); // リンクのデフォルト動作（ページ遷移）を防ぐ
    showPrivacyModal = true;
  }

  // 修正: モーダルを閉じる関数
  function closePrivacyModal() {
    showPrivacyModal = false;
  }

  function send() {
    if (isDisabled(pr, yourname, company, email, tel, text)) {
      return;
    }

    const mailto = `mailto:contact@bitboxx.co.jp?subject=ホームページからのお問い合わせ&body=${encodeURIComponent(
      `問い合わせ内容:\n${text}\n\n---\n氏名: ${yourname}\n会社名: ${company}\n電話番号: ${tel}\nメールアドレス: ${email}\n---`
    )}`;
    window.location.href = mailto;
  }

  function isDisabled(pr: boolean, yourname: string, company: string, email: string, tel: string, text: string) {
    return !pr || yourname === '' || company === '' || email === '' || tel === '' || text === '';
  }
</script>


<main class="flex-1">

    <section class="max-w-7xl mx-auto px-6 pt-32 pb-40 text-center">
        <h1 class="text-7xl md:text-9xl font-extrabold tracking-tighter leading-none">
                <span class="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                    まだ見ぬ最高を、<br class="sm:hidden"/>確かな品質で。
                </span>
        </h1>
        <p class="mt-12 max-w-3xl mx-auto text-gray-600 text-xl leading-relaxed font-light">
            私たち bitboxx (ビットボックス) の使命は、唯一無二のアイデアを卓越した技術で実現し、
            人々の心を満たす愛着あるプロダクトとして世界に届けることです。
        </p>
        <div class="mt-16">
            <a href="#contact-form" class="inline-flex items-center justify-center px-10 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-gray-900 hover:bg-gray-700 transition-colors">
                プロジェクトのご相談
            </a>
        </div>
    </section>

    <section id="philosophy" class="max-w-7xl mx-auto px-6 py-28 bg-gray-50 border-t border-b border-gray-100 mt-24 scroll-mt-24">
        <h2 class="text-3xl font-bold text-center mb-4 text-gray-700">私たちの哲学</h2>
        <p class="text-xl text-center text-gray-500 font-light mb-16">Excellent / Kawaii / Unique</p>
        <div class="max-w-6xl mx-auto grid md:grid-cols-3 gap-10 text-left">
            <div class="p-10 bg-white border border-gray-100 rounded-3xl shadow-lg hover:shadow-xl transition">
                <div class="w-10 h-10 mb-4 text-gray-900">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d={icons.excellent}/></svg>
                </div>
                <h3 class="text-xl font-bold mb-2">Excellent</h3>
                <p class="text-gray-600 leading-relaxed text-sm">
                    確かな技術力と洗練された設計思想に基づき、企業の基盤を支える高品質かつ持続可能なプロダクトを創造します。
                </p>
            </div>
            <div class="p-10 bg-white border border-gray-100 rounded-3xl shadow-lg hover:shadow-xl transition">
                <div class="w-10 h-10 mb-4 text-gray-900">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d={icons.kawaii}/></svg>
                </div>
                <h3 class="text-xl font-bold mb-2">Kawaii</h3>
                <p class="text-gray-600 leading-relaxed text-sm">
                    思わず微笑むような愛らしさと、使う人の気持ちに寄り添う心地よさを設計。プロダクトに感情的なつながりをもたらします。
                </p>
            </div>
            <div class="p-10 bg-white border border-gray-100 rounded-3xl shadow-lg hover:shadow-xl transition">
                <div class="w-10 h-10 mb-4 text-gray-900">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d={icons.unique}/></svg>
                </div>
                <h3 class="text-xl font-bold mb-2">Unique</h3>
                <p class="text-gray-600 leading-relaxed text-sm">
                    既成概念にとらわれない発想と専門性で、市場に新たな価値を生み出す唯一無二のソリューションを提供します。
                </p>
            </div>
        </div>
    </section>

    <section id="business" class="max-w-7xl mx-auto px-6 py-24 mt-24 scroll-mt-24">
        <h2 class="text-3xl font-bold text-center mb-16">事業内容</h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div class="p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition">
                <div class="w-8 h-8 mb-4 text-gray-700">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d={icons.development}/></svg>
                </div>
                <h3 class="text-lg font-semibold mb-2">システム・プロダクト開発</h3>
                <p class="text-gray-600 text-sm leading-relaxed">
                    お客様のビジネスの「核」となるプロダクトを共に創り上げます。堅牢な設計と、使う人への配慮を大切にします。
                </p>
            </div>
            <div class="p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition">
                <div class="w-8 h-8 mb-4 text-gray-700">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d={icons.ai}/></svg>
                </div>
                <h3 class="text-lg font-semibold mb-2">先進技術による事業変革</h3>
                <p class="text-gray-600 text-sm leading-relaxed">
                    最新技術を道具として捉え、人々の働き方をより豊かに、よりクリエイティブにするための仕組みを設計し、未来を見据えた変革を支援します。
                </p>
            </div>
            <div class="p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition">
                <div class="w-8 h-8 mb-4 text-gray-700">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d={icons.design}/></svg>
                </div>
                <h3 class="text-lg font-semibold mb-2">UI/UX クラフトと設計</h3>
                <p class="text-gray-600 text-sm leading-relaxed">
                    「美しい」だけでなく「使いやすい」を極めるデザイン。製品を愛せるようになるまでのプロセスを共に作り上げます。
                </p>
            </div>
            <div class="p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition">
                <div class="w-8 h-8 mb-4 text-gray-700">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d={icons.outdoor}/></svg>
                </div>
                <h3 class="text-lg font-semibold mb-2">アウトドア事業・共創支援</h3>
                <p class="text-gray-600 text-sm leading-relaxed">
                    デジタルの力でアウトドアの価値を再定義。五感を刺激する新しい体験を持つ製品開発と、サプライチェーンの変革を含む産業全体のDX化を両軸で支援し、持続可能な成長基盤を提供します。
                </p>
            </div>
        </div>
    </section>

    <section id="company" class="max-w-4xl mx-auto px-6 pt-16 pb-24 mt-24 scroll-mt-24">
        <h2 class="text-3xl font-bold mb-12 text-center">会社概要</h2>
        <div class="bg-gray-50 rounded-2xl p-10 border border-gray-100 shadow-sm">
            <dl class="space-y-5 text-gray-700 text-base">
                <div class="flex border-b border-gray-200 pb-2">
                    <dt class="font-semibold w-1/4 min-w-[100px]">会社名</dt>
                    <dd class="w-3/4">{companyInfo.name}</dd>
                </div>
                <div class="flex border-b border-gray-200 pb-2">
                    <dt class="font-semibold w-1/4 min-w-[100px]">所在地</dt>
                    <dd class="w-3/4">
                        {companyInfo.postcode}<br/>
                        {companyInfo.address}
                    </dd>
                </div>
                <div class="flex border-b border-gray-200 pb-2">
                    <dt class="font-semibold w-1/4 min-w-[100px]">代表者</dt>
                    <dd class="w-3/4">{companyInfo.representative}</dd>
                </div>
                <div class="flex border-b border-gray-200 pb-2">
                    <dt class="font-semibold w-1/4 min-w-[100px]">設立</dt>
                    <dd class="w-3/4">
                        {companyInfo.established.substring(0, 4)}年
                        {companyInfo.established.substring(5, 7)}月
                        {companyInfo.established.substring(8, 10)}日
                    </dd>
                </div>
                <div class="flex">
                    <dt class="font-semibold w-1/4 min-w-[100px]">事業内容</dt>
                    <dd class="w-3/4">{companyInfo.business}</dd>
                </div>
            </dl>
        </div>
    </section>

    <section id="contact-form" class="w-full py-24 mt-24 mb-32 bg-gray-900 scroll-mt-24">
        <div class="max-w-4xl mx-auto px-6">
            <h2 class="text-3xl font-bold text-center mb-16 tracking-wider text-white">お問い合わせ</h2>

            <div class="bg-white p-8 md:p-12 border border-gray-100 rounded-2xl shadow-xl">
                <p class="mb-10 text-center text-gray-600 font-light">
                    次の「最高」の創造に向けた、プロジェクトのご相談や協業のご提案をお待ちしております。
                </p>

                <form on:submit|preventDefault={send} class="space-y-8">
                    <div class="relative group">
                        <label for="yourname" class="block text-sm font-medium text-gray-500 mb-2">お名前</label>
                        <input
                                id="yourname"
                                type="text"
                                bind:value={yourname}
                                class="w-full p-2 border-b-2 border-gray-300 focus:border-gray-900 outline-none transition duration-300 text-lg font-light"
                                style="background-color: transparent;"
                        />
                    </div>

                    <div class="relative group">
                        <label for="company" class="block text-sm font-medium text-gray-500 mb-2">会社名</label>
                        <input
                                id="company"
                                type="text"
                                bind:value={company}
                                class="w-full p-2 border-b-2 border-gray-300 focus:border-gray-900 outline-none transition duration-300 text-lg font-light"
                                style="background-color: transparent;"
                        />
                    </div>

                    <div class="relative group">
                        <label for="email" class="block text-sm font-medium text-gray-500 mb-2">メールアドレス</label>
                        <input
                                id="email"
                                type="email"
                                bind:value={email}
                                class="w-full p-2 border-b-2 border-gray-300 focus:border-gray-900 outline-none transition duration-300 text-lg font-light"
                                style="background-color: transparent;"
                        />
                    </div>

                    <div class="relative group">
                        <label for="tel" class="block text-sm font-medium text-gray-500 mb-2">電話番号</label>
                        <input
                                id="tel"
                                type="tel"
                                bind:value={tel}
                                class="w-full p-2 border-b-2 border-gray-300 focus:border-gray-900 outline-none transition duration-300 text-lg font-light"
                                style="background-color: transparent;"
                        />
                    </div>

                    <div class="relative group">
                        <label for="text" class="block text-sm font-medium text-gray-500 mb-2">お問い合わせ内容</label>
                        <textarea
                                id="text"
                                bind:value={text}
                                rows="6"
                                class="w-full p-3 border border-gray-300 focus:border-gray-900 outline-none transition duration-300 rounded-lg text-lg font-light resize-none"
                                style="background-color: transparent;"
                        ></textarea>
                    </div>

                    <div class="flex items-center justify-center pt-4">
                        <input
                                id="privacy-check"
                                type="checkbox"
                                bind:checked={pr}
                                class="mr-3 h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-800"
                        />
                        <label for="privacy-check" class="text-sm text-gray-600 select-none">
                            <button type="button" on:click={openPrivacyModal} class="text-gray-900 underline hover:text-gray-700 transition">
                                当社規定のプライバシーポリシー
                            </button>
                            に同意する
                        </label>
                    </div>

                    <div class="pt-6">
                        <button
                                type="submit"
                                disabled={isDisabled(pr, yourname, company, email, tel, text)}
                                class={`
                                    w-full py-4 text-lg font-semibold rounded-full transition-all duration-300
                                    ${isDisabled(pr, yourname, company, email, tel, text)
                                       ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                       : 'bg-gray-900 text-white hover:bg-gray-700 shadow-lg'}
                                `}
                                on:click={send}
                        >
                            送信する
                        </button>
                    </div>

                </form>
            </div>
        </div>
    </section>


    {#if showPrivacyModal}
        <div
                class="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-[1000]"
                on:click={closePrivacyModal}
        >
            <div
                    class="bg-white rounded-xl shadow-2xl w-full max-w-3xl m-4 p-6 md:p-10 max-h-[90vh] flex flex-col"
                    on:click|stopPropagation
            >
                <div class="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
                    <h2 class="text-2xl font-bold text-gray-900">プライバシーポリシー</h2>
                    <button class="text-gray-500 hover:text-gray-900 text-3xl" on:click={closePrivacyModal}>
                        &times;
                    </button>
                </div>

                <div class="overflow-y-auto pr-2 flex-1">
                    <PrivacyPolicy showTitle={false}/>
                </div>
            </div>
        </div>
    {/if}

</main>