<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=League+Gothic&family=Noto+Sans+JP:wght@400;500;700;800&display=swap"
          rel="stylesheet">
    <title>株式会社bitboxx</title>
</svelte:head>

<script lang="ts">
  // 会社情報JSONファイルをインポート
  import companyInfo from '$lib/data/company_info.json';

  // 修正: プライバシーポリシーコンポーネントをインポート
  import PrivacyPolicy from '$lib/domains/PrivacyPolicy.svelte';

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

<style>
    .top-page {
        font-family: 'Noto Sans JP', sans-serif;
    }

    .top-heading {
        font-family: 'Noto Sans JP', sans-serif;
        letter-spacing: -0.02em;
    }
</style>

<main class="top-page flex-1">

    <section class="max-w-6xl mx-auto px-6 pt-28 pb-24 md:pt-32 md:pb-28">
        <h1 class="top-heading text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] text-gray-900">
            必要なものだけを見極め、
            <br class="hidden sm:block"/>
            事業に合う形でつくる。
        </h1>
        <p class="mt-8 max-w-3xl text-base md:text-lg leading-8 text-gray-600">
            bitboxx は、事業に必要なシステムの見極めから開発、運用までを支援します。
            不必要に複雑な仕組みを増やさず、使い続けられる設計を重視しています。
        </p>
        <div class="mt-10">
            <a href="#contact-form" class="inline-flex items-center justify-center rounded-md bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-700">
                プロジェクトのご相談
            </a>
        </div>
    </section>

    <section id="philosophy" class="max-w-6xl mx-auto px-6 py-20 md:py-24 scroll-mt-24">
        <div class="grid gap-8 lg:grid-cols-[240px_1fr]">
            <div>
                <p class="text-sm font-medium text-gray-500">私たちの考え方</p>
                <h2 class="top-heading mt-2 text-3xl text-gray-900">システムは事業のためにある</h2>
            </div>
            <div class="space-y-6 text-base leading-8 text-gray-600">
                <p>
                    私たちは、必要以上に複雑な仕組みや過剰な導入を避け、本当に必要なものだけを見極めて提案します。
                </p>
                <p>
                    大切にしているのは、事業が前に進むこと、現場が無理なく使い続けられること、そして運用に振り回されないことです。
                </p>
            </div>
        </div>
    </section>

    <section id="business" class="max-w-6xl mx-auto px-6 py-20 md:py-24 scroll-mt-24">
        <div class="grid gap-8 lg:grid-cols-[240px_1fr]">
            <div>
                <p class="text-sm font-medium text-gray-500">事業内容</p>
                <h2 class="top-heading mt-2 text-3xl text-gray-900">支援領域</h2>
            </div>
            <div class="space-y-10">
                <div class="grid gap-2 md:grid-cols-[220px_1fr]">
                    <h3 class="text-lg font-semibold text-gray-900">システム・プロダクト開発</h3>
                    <p class="text-sm leading-7 text-gray-600">事業の核となるシステムやプロダクトを、設計から実装、改善まで一貫して支援します。</p>
                </div>
                <div class="grid gap-2 md:grid-cols-[220px_1fr]">
                    <h3 class="text-lg font-semibold text-gray-900">事業に合わせた技術導入</h3>
                    <p class="text-sm leading-7 text-gray-600">新しい技術を目的化せず、現場の運用と事業計画に合う形で導入を検討し、無理のない変化を支援します。</p>
                </div>
                <div class="grid gap-2 md:grid-cols-[220px_1fr]">
                    <h3 class="text-lg font-semibold text-gray-900">UI/UX 設計</h3>
                    <p class="text-sm leading-7 text-gray-600">見た目だけでなく、使い続けやすさや運用しやすさまで含めて設計します。</p>
                </div>
                <div class="grid gap-2 md:grid-cols-[220px_1fr]">
                    <h3 class="text-lg font-semibold text-gray-900">業界特化の共創支援</h3>
                    <p class="text-sm leading-7 text-gray-600">業種ごとの業務理解を前提に、既存業務の整理、改善、DX化を中長期で支援します。</p>
                </div>
            </div>
        </div>
    </section>

    <section id="company" class="max-w-4xl mx-auto px-6 py-20 md:py-24 scroll-mt-24">
        <h2 class="top-heading text-3xl font-bold mb-12 text-center">会社概要</h2>
        <div class="bg-gray-50 p-8 md:p-10">
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

    <section id="contact-form" class="w-full py-24 mt-12 mb-24 bg-gray-900 scroll-mt-24">
        <div class="max-w-4xl mx-auto px-6">
            <h2 class="top-heading text-3xl font-bold text-center mb-16 text-white">お問い合わせ</h2>

            <div class="bg-white p-8 md:p-12">
                <p class="mb-10 text-center text-gray-600">
                    新規開発、運用保守、既存システムの見直しや移行まで、お気軽にご相談ください。
                </p>

                <form on:submit|preventDefault={send} class="space-y-8">
                    <div class="relative group">
                        <label for="yourname" class="block text-sm font-medium text-gray-500 mb-2">お名前</label>
                        <input
                                id="yourname"
                                type="text"
                                bind:value={yourname}
                                class="w-full p-2 border-b-2 border-gray-300 focus:border-gray-900 outline-none transition duration-300 text-lg"
                                style="background-color: transparent;"
                        />
                    </div>

                    <div class="relative group">
                        <label for="company" class="block text-sm font-medium text-gray-500 mb-2">会社名</label>
                        <input
                                id="company"
                                type="text"
                                bind:value={company}
                                class="w-full p-2 border-b-2 border-gray-300 focus:border-gray-900 outline-none transition duration-300 text-lg"
                                style="background-color: transparent;"
                        />
                    </div>

                    <div class="relative group">
                        <label for="email" class="block text-sm font-medium text-gray-500 mb-2">メールアドレス</label>
                        <input
                                id="email"
                                type="email"
                                bind:value={email}
                                class="w-full p-2 border-b-2 border-gray-300 focus:border-gray-900 outline-none transition duration-300 text-lg"
                                style="background-color: transparent;"
                        />
                    </div>

                    <div class="relative group">
                        <label for="tel" class="block text-sm font-medium text-gray-500 mb-2">電話番号</label>
                        <input
                                id="tel"
                                type="tel"
                                bind:value={tel}
                                class="w-full p-2 border-b-2 border-gray-300 focus:border-gray-900 outline-none transition duration-300 text-lg"
                                style="background-color: transparent;"
                        />
                    </div>

                    <div class="relative group">
                        <label for="text" class="block text-sm font-medium text-gray-500 mb-2">お問い合わせ内容</label>
                        <textarea
                                id="text"
                                bind:value={text}
                                rows="6"
                                class="w-full p-3 border border-gray-300 focus:border-gray-900 outline-none transition duration-300 text-lg resize-none"
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
                                    w-full py-4 text-lg font-semibold rounded-md transition-all duration-300
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
