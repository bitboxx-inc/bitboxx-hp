<script>
  import companyInfo from '$lib/data/company_info.json';

  // 日付をYYYY年MM月DD日形式に整形する関数
  function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${year}年${month}月${day}日`;
  }

  export let showTitle = true;
</script>

<div class="prose max-w-none text-gray-700 space-y-6">
    {#if showTitle}
        <h2 class="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">プライバシーポリシー</h2>
    {/if}

    <p class="text-sm">
        {companyInfo.name}
        （以下「当社」といいます。）は、当社の提供するサービスおよびウェブサイト（以下「本サービス」といいます。）における、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます。）を定めます。
    </p>

    <section>
        <h3 class="text-xl font-semibold text-gray-800 mb-3">1. 個人情報の収集と利用目的</h3>
        <p>当社が収集・利用する個人情報は、以下の目的のために利用いたします。</p>
        <ul class="list-disc list-inside pl-4 space-y-2 text-sm">
            <li>本サービスに関するお問い合わせ、資料請求への対応および返信のため。</li>
            <li>製品開発、DX支援サービス等の契約履行および連絡のため。</li>
            <li>当社が提供するサービスに関する情報（新サービス、展示会情報等）の提供のため。</li>
            <li>本サイトの利便性向上および統計データ作成のため（Cookie等を利用）。</li>
            <li>採用活動における審査および連絡のため。</li>
        </ul>
    </section>

    <section>
        <h3 class="text-xl font-semibold text-gray-800 mb-3">2. 個人情報の安全管理</h3>
        <p class="text-sm">
            当社は、個人情報の漏洩、滅失または毀損の防止、その他個人情報の安全管理のために必要かつ適切な措置を講じます。また、個人情報を取り扱う従業員に対し、適切な監督を行います。
        </p>
    </section>

    <section>
        <h3 class="text-xl font-semibold text-gray-800 mb-3">3. 個人情報の第三者提供</h3>
        <p class="text-sm">
            当社は、法令に基づく場合や、人の生命、身体または財産の保護のために必要がある場合を除き、あらかじめユーザーの同意を得ることなく、個人情報を第三者に提供することはありません。
        </p>
    </section>

    <section>
        <h3 class="text-xl font-semibold text-gray-800 mb-3">4. Cookie（クッキー）その他の技術の利用</h3>
        <p class="text-sm">
            本サイトは、アクセス解析、利便性向上を目的としてCookieおよびこれに類する技術を利用することがあります。ユーザーはブラウザの設定によりCookieの利用を拒否できますが、その場合、本サイトの一部機能が利用できなくなる場合があります。
        </p>
    </section>

    <section>
        <h3 class="text-xl font-semibold text-gray-800 mb-3">5. お問い合わせ窓口</h3>
        <p class="text-sm">
            本ポリシーに関するお問い合わせ、個人情報の開示・訂正・利用停止等のご請求は、本サイトのお問い合わせフォームよりご連絡ください。
        </p>
    </section>

    <section>
        <h3 class="text-xl font-semibold text-gray-800 mb-3">6. 事業者情報と本ポリシーの改定</h3>
        <ul class="list-none pl-0 space-y-2 text-sm">
            <li>事業者名: {companyInfo.name}</li>
            <li>代表者: {companyInfo.representative}</li>
            <li>所在地: {companyInfo.address}</li>
            <li>
                当社は、必要に応じて本ポリシーを改定できるものとし、改定後のポリシーは本サイトに掲載したときから効力を生じるものとします。
            </li>
        </ul>
    </section>

    <div class="pt-8 text-right text-sm text-gray-500">
        <p>制定日：{formatDate(companyInfo.established)}</p>
    </div>
</div>