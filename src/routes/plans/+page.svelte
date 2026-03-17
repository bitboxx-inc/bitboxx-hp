<svelte:head>
    <title>プラン | 株式会社bitboxx</title>
    <meta
            name="description"
            content="フルスタックプラン、システム開発プラン、運用保守プランをご案内します。"
    >
</svelte:head>

<script lang="ts">
  import { base } from '$app/paths';

  const fullStackOverview = [
    '事業課題の整理と優先順位付け',
    '技術選定、設計、開発、改善',
    '運用を見据えた継続支援'
  ];

  const fullStackDetails = [
    '課題整理、要件整理、優先順位付け',
    '新規開発、機能追加、改修',
    '設計、実装、公開後の改善まで対応',
    '運用を除く開発は追加料金不要。内容により同時進行が難しい場合あり'
  ];

  const executiveSupport = [
    'ITアーキテクト水準で継続的に対応',
    '必要なシステムや技術を見極め、設計と実装まで一貫支援',
    '場当たりではなく、将来コストまで踏まえて開発方針を整理',
    '週1回以上のミーティングで進捗確認と意思決定を前進'
  ];

  const fullStackPricing = [
    '基本料金は月額80万円（税込）から'
  ];

  const fullStackNotes = [
    '運用保守が必要なシステム分の料金を加算',
    '保守対象システムが増えた場合は都度お見積もり'
  ];

  const operationSupportItems = [
    '日々の運用作業の代行',
    'ERPの管理者作業',
    '既存システムの保守・軽微修正',
    '不具合時の一次切り分けと改善提案'
  ];

  const developmentPlanItems = [
    '新規開発、機能追加、改修のスポット対応',
    '要件整理から設計、実装、リリースまで対応',
    '運用を見据えて進行'
  ];

  const developmentPlanPricing = [
    '料金はご相談',
    '開発内容、規模、期間に応じて個別にお見積もり'
  ];

  const developmentPlanNotes = [
    'スポット開発後、運用保守契約への移行も可能'
  ];

  const operationSupportPricing = [
    '月額15万円（税込）から'
  ];

  const operationSupportNotes = [
    '対象業務・対象システムに応じて内容を調整',
    '作業量が大きい場合や対象追加時は別途お見積もり'
  ];

  const flow = [
    'お問い合わせ後、30分程度のヒアリング',
    '現状と課題、必要な支援範囲の整理',
    '進め方とお見積もりの提示、支援開始'
  ];

  const reasons = [
    {
      title: '事業に集中できる進行設計',
      description: '事業を前に進めるうえで本当に必要な施策や開発を整理し、優先順位を明確にしたうえで進行します。運用に追われる時間や判断コストを減らし、お客様が本来向き合うべき事業に集中できる状態をつくります。'
    },
    {
      title: '幅広い実績に裏打ちされた技術選定力',
      description: '数千万人規模が利用するWebサービスの開発をはじめ、ホームページ制作、決済サービス導入、クラウド移行まで、幅広い領域で実績を重ねてきました。豊富な経験をもとに、見た目や価格、流行だけで判断せず、お客様の課題や事業フェーズに本当に合った技術を選定し、成果につながる構成をご提案します。'
    },
    {
      title: '選定だけで終わらない実行力',
      description: '必要なシステムやツールの判断だけで終わらせず、設計、開発、導入、運用まで一貫して対応します。提案内容をそのまま実行までつなげられるため、方針だけが残ることなく、事業成果に結びつく形で支援できます。'
    }
  ];
</script>

<style>
    .plans-page {
        font-family: 'Noto Sans JP', sans-serif;
    }
    .plans-heading {
        font-family: 'Noto Sans JP', sans-serif;
        letter-spacing: -0.02em;
    }
</style>

<div class="plans-page">
<section class="bg-white">
    <div class="max-w-6xl mx-auto px-6 pt-20 pb-16 md:pt-24 md:pb-20">
        <h1 class="plans-heading mt-4 text-4xl md:text-6xl font-bold tracking-tight text-gray-900">
            事業に必要なIT活用を、
            <br class="hidden sm:block"/>
            ちょうどいい形で支援。
        </h1>
        <p class="mt-6 max-w-3xl text-base md:text-lg leading-8 text-gray-600">
            開発から運用までをまとめて任せたい場合も、
            必要なところだけスポットで依頼したい場合も、状況に応じた支援。
        </p>
        <div class="mt-8 flex flex-wrap gap-3">
            <a href={`${base}/#contact-form`} class="inline-flex items-center justify-center rounded-md bg-gray-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-700">
                お問い合わせ
            </a>
            <a href={`${base}/#business`} class="inline-flex items-center justify-center rounded-md border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                事業内容を見る
            </a>
        </div>
    </div>
</section>

<section class="bg-white">
    <div class="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div class="pt-6">
            <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-500">bitboxxが選ばれる理由</p>
                    <h2 class="plans-heading mt-2 text-3xl text-gray-900">事業成果につながるIT支援</h2>
                </div>
                <p class="text-sm leading-7 text-gray-600">
                    事業理解、技術選定、実行までを切り離さず、目的に合ったIT活用を一貫して支援します。
                </p>
            </div>

            <div class="mt-10 grid gap-8 md:grid-cols-3">
                {#each reasons as reason}
                    <div class="bg-gray-50 px-6 py-6">
                        <h3 class="text-xl font-semibold text-gray-900">{reason.title}</h3>
                        <p class="mt-4 text-sm leading-7 text-gray-700">{reason.description}</p>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</section>

<section class="bg-white">
    <div class="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div class="pt-6">
            <div class="grid gap-8 lg:grid-cols-[280px_1fr]">
                <div>
                    <p class="text-sm font-medium text-gray-500">プラン 01</p>
                    <h2 class="plans-heading mt-2 text-3xl text-gray-900">フルスタックプラン</h2>
                    <p class="mt-5 text-3xl font-bold tracking-tight text-gray-900">月額 80万円（税込）から</p>
                    <p class="mt-5 text-sm leading-7 text-gray-600">
                        ITアーキテクト水準の判断と実行を、継続的に任せたい場合のプラン。
                    </p>
                </div>

                <div class="bg-gray-50">
                    <div class="grid md:grid-cols-[220px_1fr]">
                        <div class="bg-gray-50 px-6 py-5 text-sm font-medium text-gray-700">支援内容</div>
                        <div class="px-6 py-5">
                            <ul class="space-y-3 text-sm leading-7 text-gray-700">
                                {#each fullStackOverview as item}
                                    <li>{item}</li>
                                {/each}
                            </ul>
                        </div>
                    </div>

                    <div class="grid md:grid-cols-[220px_1fr]">
                        <div class="bg-gray-50 px-6 py-5 text-sm font-medium text-gray-700">開発範囲</div>
                        <div class="px-6 py-5">
                            <ul class="space-y-3 text-sm leading-7 text-gray-700">
                                {#each fullStackDetails as item}
                                    <li>{item}</li>
                                {/each}
                            </ul>
                        </div>
                    </div>

                    <div class="grid md:grid-cols-[220px_1fr]">
                        <div class="bg-gray-50 px-6 py-5 text-sm font-medium text-gray-700">提供価値</div>
                        <div class="px-6 py-5">
                            <ul class="space-y-3 text-sm leading-7 text-gray-700">
                                {#each executiveSupport as item}
                                    <li>{item}</li>
                                {/each}
                            </ul>
                        </div>
                    </div>

                    <div class="grid md:grid-cols-[220px_1fr]">
                        <div class="bg-gray-50 px-6 py-5 text-sm font-medium text-gray-700">料金</div>
                        <div class="px-6 py-5">
                            <ul class="space-y-3 text-sm leading-7 text-gray-700">
                                {#each fullStackPricing as item}
                                    <li>{item}</li>
                                {/each}
                            </ul>
                        </div>
                    </div>

                    <div class="grid md:grid-cols-[220px_1fr]">
                        <div class="bg-gray-50 px-6 py-5 text-sm font-medium text-gray-700">料金に関する事項</div>
                        <div class="px-6 py-5">
                            <ul class="space-y-3 text-sm leading-7 text-gray-700">
                                {#each fullStackNotes as item}
                                    <li>{item}</li>
                                {/each}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-16 pt-6">
            <div class="grid gap-8 lg:grid-cols-[280px_1fr]">
                <div>
                    <p class="text-sm font-medium text-gray-500">プラン 02</p>
                    <h2 class="plans-heading mt-2 text-3xl text-gray-900">運用保守プラン</h2>
                    <p class="mt-5 text-3xl font-bold tracking-tight text-gray-900">月額 15万円（税込）から</p>
                    <p class="mt-5 text-sm leading-7 text-gray-600">
                        日々の運用や保守を継続して任せたい場合のプラン。
                    </p>
                </div>

                <div class="bg-gray-50">
                    <div class="grid md:grid-cols-[220px_1fr]">
                        <div class="bg-gray-50 px-6 py-5 text-sm font-medium text-gray-700">支援内容</div>
                        <div class="px-6 py-5">
                            <ul class="space-y-3 text-sm leading-7 text-gray-700">
                                {#each operationSupportItems as item}
                                    <li>{item}</li>
                                {/each}
                            </ul>
                        </div>
                    </div>

                    <div class="grid md:grid-cols-[220px_1fr]">
                        <div class="bg-gray-50 px-6 py-5 text-sm font-medium text-gray-700">料金</div>
                        <div class="px-6 py-5">
                            <ul class="space-y-3 text-sm leading-7 text-gray-700">
                                {#each operationSupportPricing as item}
                                    <li>{item}</li>
                                {/each}
                            </ul>
                        </div>
                    </div>

                    <div class="grid md:grid-cols-[220px_1fr]">
                        <div class="bg-gray-50 px-6 py-5 text-sm font-medium text-gray-700">契約条件</div>
                        <div class="px-6 py-5">
                            <ul class="space-y-3 text-sm leading-7 text-gray-700">
                                {#each operationSupportNotes as item}
                                    <li>{item}</li>
                                {/each}
                            </ul>
                        </div>
                    </div>

                    <div class="grid md:grid-cols-[220px_1fr]">
                        <div class="bg-gray-50 px-6 py-5 text-sm font-medium text-gray-700">ホームページ向け</div>
                        <div class="px-6 py-5">
                            <a
                                href="https://pages.bitboxx.co.jp"
                                target="_blank"
                                rel="noreferrer"
                                class="text-sm leading-7 text-gray-700 underline underline-offset-4 hover:text-gray-900"
                            >
                                ホームページ開発運用に特化したサービスはこちら
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-16 pt-6">
            <div class="grid gap-8 lg:grid-cols-[280px_1fr]">
                <div>
                    <p class="text-sm font-medium text-gray-500">プラン 03</p>
                    <h2 class="plans-heading mt-2 text-3xl text-gray-900">システム開発プラン</h2>
                    <p class="mt-5 text-3xl font-bold tracking-tight text-gray-900">料金はご相談</p>
                    <p class="mt-5 text-sm leading-7 text-gray-600">
                        必要な機能や課題に応じて、スポットで開発したい場合のプラン。
                    </p>
                </div>

                <div class="bg-gray-50">
                    <div class="grid md:grid-cols-[220px_1fr]">
                        <div class="bg-gray-50 px-6 py-5 text-sm font-medium text-gray-700">支援内容</div>
                        <div class="px-6 py-5">
                            <ul class="space-y-3 text-sm leading-7 text-gray-700">
                                {#each developmentPlanItems as item}
                                    <li>{item}</li>
                                {/each}
                            </ul>
                        </div>
                    </div>

                    <div class="grid md:grid-cols-[220px_1fr]">
                        <div class="bg-gray-50 px-6 py-5 text-sm font-medium text-gray-700">料金</div>
                        <div class="px-6 py-5">
                            <ul class="space-y-3 text-sm leading-7 text-gray-700">
                                {#each developmentPlanPricing as item}
                                    <li>{item}</li>
                                {/each}
                            </ul>
                        </div>
                    </div>

                    <div class="grid md:grid-cols-[220px_1fr]">
                        <div class="bg-gray-50 px-6 py-5 text-sm font-medium text-gray-700">契約形態</div>
                        <div class="px-6 py-5">
                            <ul class="space-y-3 text-sm leading-7 text-gray-700">
                                {#each developmentPlanNotes as item}
                                    <li>{item}</li>
                                {/each}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<section class="bg-gray-50">
    <div class="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
                <p class="text-sm font-medium text-gray-500">導入事例</p>
                <h2 class="plans-heading mt-2 text-3xl text-gray-900">導入実績</h2>
            </div>
            <p class="text-sm leading-7 text-gray-600">
                実際の関わり方が伝わる代表的なケース。
            </p>
        </div>

        <div class="mt-10 space-y-8">
            <article class="bg-white">
                <div class="px-6 py-5">
                    <p class="text-sm font-medium text-gray-500">フルスタックプラン</p>
                    <h3 class="plans-heading mt-2 text-2xl text-gray-900">美容系事業会社</h3>
                </div>
                <div class="px-6 py-6">
                    <p class="text-sm leading-7 text-gray-700">
                        HP制作、事業用システム開発、事業方針に関する相談までをまとめて支援しています。
                        事業フェーズに応じたシステム整備や開発方針整理まで含む継続支援。
                    </p>
                    <dl class="mt-6 divide-y divide-gray-200">
                        <div class="grid gap-2 py-4 md:grid-cols-[180px_1fr]">
                            <dt class="text-sm font-medium text-gray-700">主な支援内容</dt>
                            <dd class="text-sm leading-7 text-gray-600">HP制作、システム開発、事業方針の相談をまとめて支援</dd>
                        </div>
                        <div class="grid gap-2 py-4 md:grid-cols-[180px_1fr]">
                            <dt class="text-sm font-medium text-gray-700">体制</dt>
                            <dd class="text-sm leading-7 text-gray-600">システム選定や進め方の整理まで含めて伴走</dd>
                        </div>
                        <div class="grid gap-2 py-4 md:grid-cols-[180px_1fr]">
                            <dt class="text-sm font-medium text-gray-700">ご相談内容</dt>
                            <dd class="text-sm leading-7 text-gray-600">システム選定、コスト管理、今後の投資判断をご提案</dd>
                        </div>
                    </dl>
                </div>
            </article>

            <article class="bg-white">
                <div class="px-6 py-5">
                    <p class="text-sm font-medium text-gray-500">運用保守プラン</p>
                    <h3 class="plans-heading mt-2 text-2xl text-gray-900">不動産会社</h3>
                </div>
                <div class="px-6 py-6">
                    <p class="text-sm leading-7 text-gray-700">
                        HPの運用保守や社内アカウント管理など、日常的な運用業務を継続して支援しています。
                        あわせて、社内ツール整備やコラム作成など、必要なタイミングでのスポット対応。
                    </p>
                    <dl class="mt-6 divide-y divide-gray-200">
                        <div class="grid gap-2 py-4 md:grid-cols-[180px_1fr]">
                            <dt class="text-sm font-medium text-gray-700">主な支援内容</dt>
                            <dd class="text-sm leading-7 text-gray-600">HPの更新、運用保守、軽微な改善を継続支援</dd>
                        </div>
                        <div class="grid gap-2 py-4 md:grid-cols-[180px_1fr]">
                            <dt class="text-sm font-medium text-gray-700">定期運用</dt>
                            <dd class="text-sm leading-7 text-gray-600">社内アカウント管理などの定期的な運用作業を支援</dd>
                        </div>
                        <div class="grid gap-2 py-4 md:grid-cols-[180px_1fr]">
                            <dt class="text-sm font-medium text-gray-700">スポット対応</dt>
                            <dd class="text-sm leading-7 text-gray-600">社内ツール整備やコラム作成などを必要に応じて対応</dd>
                        </div>
                    </dl>
                </div>
            </article>
        </div>
    </div>
</section>

<section class="bg-white">
    <div class="max-w-6xl mx-auto px-6 py-16 md:py-20">
        <div class="grid gap-10 lg:grid-cols-[1fr_320px]">
            <div>
                <p class="text-sm font-medium text-gray-500">ご相談の流れ</p>
                <h2 class="plans-heading mt-2 text-3xl text-gray-900">開始までの進め方</h2>
                <ol class="mt-8 divide-y divide-gray-200 border-t border-b border-gray-200">
                    {#each flow as item, index}
                        <li class="grid gap-3 py-5 md:grid-cols-[56px_1fr]">
                            <div class="text-sm font-semibold text-gray-500">0{index + 1}</div>
                            <p class="text-sm leading-7 text-gray-700">{item}</p>
                        </li>
                    {/each}
                </ol>
            </div>

            <aside class="bg-gray-50 p-6">
                <p class="text-sm font-medium text-gray-500">ご相談</p>
                <h2 class="plans-heading mt-2 text-2xl text-gray-900">個別のご提案も可能です</h2>
                <p class="mt-5 text-sm leading-7 text-gray-600">
                    新規開発だけでなく、既存システムの運用切り替えや移行も対応範囲。
                    現在の状況や困りごとの整理段階から相談可能。
                </p>
                <a href={`${base}/#contact-form`} class="mt-8 inline-flex items-center justify-center rounded-md bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-700">
                    相談する
                </a>
            </aside>
        </div>
    </div>
</section>
</div>
