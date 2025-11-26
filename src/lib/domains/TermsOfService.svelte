<script>
  import companyInfo from '$lib/data/company_info.json';

  // 日付をYYYY年MM月DD日形式に整形する関数
  function formatDate(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${year}年${month}月${day}日`;
  }

  // 所在地から管轄裁判所として「〇〇区」の部分を抽出する関数
  function extractWard(address) {
    if (!address) return '';
    const match = address.match(/東京都(.*?区)/);
    // 「中央区」の部分を返す（東京都中央区...の場合）
    return match ? match[1] : address;
  }
</script>

<div class="prose max-w-none text-gray-700 space-y-6">
    <h2 class="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">ウェブサイト利用規約</h2>

    <p class="text-sm">
        本規約は、{companyInfo.name}（以下「当社」といいます。）が運営するウェブサイト（以下「本サイト」といいます。）の利用に関する条件を定めるものです。利用者は本規約に同意の上、本サイトを利用するものとします。
    </p>

    <section class="space-y-4">
        <h3 class="text-xl font-semibold text-gray-800 mb-3">第1条（適用）</h3>
        <ol class="list-decimal list-inside pl-4 space-y-3 text-sm">
            <li>本規約は、本サイトの利用に関する条件を、本サイトを利用するすべての利用者と当社との間で定めるものです。</li>
            <li>利用者は、本サイトの利用を開始した時点で、本規約の全ての記載内容について同意したものとみなされます。</li>
        </ol>
    </section>

    <section class="space-y-4">
        <h3 class="text-xl font-semibold text-gray-800 mb-3">第2条（利用者）</h3>
        <p class="text-sm">
            本規約における利用者とは、本サイトを閲覧、利用するすべての個人および法人を指します。
        </p>
    </section>

    <section class="space-y-4">
        <h3 class="text-xl font-semibold text-gray-800 mb-3">第3条（知的財産権）</h3>
        <ol class="list-decimal list-inside pl-4 space-y-3 text-sm">
            <li>本サイトに掲載されているすべてのコンテンツ（文章、画像、ロゴ等）に関する知的財産権は、すべて当社または当社に利用を許諾した権利者に帰属します。</li>
            <li>利用者は、当社の書面による承諾なく、私的利用の範囲を超えて、コンテンツの複製、転載等を行ってはなりません。</li>
        </ol>
    </section>

    <section class="space-y-4">
        <h3 class="text-xl font-semibold text-gray-800 mb-3">第4条（禁止事項）</h3>
        <p class="text-sm">
            利用者は、本サイトの利用にあたり、次の行為を行ってはなりません。
        </p>
        <ul class="list-disc list-inside pl-6 space-y-2 text-sm">
            <li>法令または公序良俗に違反する行為。</li>
            <li>当社または第三者の知的財産権、名誉その他の権利または利益を侵害する行為。</li>
            <li>本サイトの運営を妨害する行為、または過度な負荷をかける行為。</li>
            <li>虚偽の情報を入力する行為。</li>
        </ul>
    </section>

    <section class="space-y-4">
        <h3 class="text-xl font-semibold text-gray-800 mb-3">第5条（サービスの停止等）</h3>
        <p class="text-sm">
            当社は、保守点検、災害、その他の事由により、事前に通知することなく、本サイトの全部または一部の提供を停止または中断できるものとします。
        </p>
    </section>

    <section class="space-y-4">
        <h3 class="text-xl font-semibold text-gray-800 mb-3">第6条（免責事項）</h3>
        <ol class="list-decimal list-inside pl-4 space-y-3 text-sm">
            <li>当社は、本サイトの情報について、その完全性、正確性、有用性について、いかなる保証も行うものではありません。</li>
            <li>本サイトの利用により生じた損害について、当社は一切の責任を負わないものとします。</li>
            <li>本サイトからリンクされた他のウェブサイトについても、当社は一切の責任を負いません。</li>
        </ol>
    </section>

    <section class="space-y-4">
        <h3 class="text-xl font-semibold text-gray-800 mb-3">第7条（準拠法および管轄裁判所）</h3>
        <ol class="list-decimal list-inside pl-4 space-y-3 text-sm">
            <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
            <li>本サイトの利用に関して紛争が生じた場合は、当社の所在地（{extractWard(companyInfo.address)}）を管轄する裁判所を専属的合意管轄とします。</li>
        </ol>
    </section>

    <div class="pt-8 text-right text-sm text-gray-500">
        <p>制定日：{formatDate(companyInfo.established)}</p>
    </div>
</div>