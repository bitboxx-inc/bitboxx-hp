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
    'システムコンサルティング',
    'システム開発（依頼上限なし）',
    '運用保守'
  ];

  const fullStackDetails = [
    '課題整理、要件整理、優先順位付け',
    '新規開発、追加機能開発、改善開発',
    '設計、実装、リリース、継続的な改善'
  ];

  const executiveSupport = [
    '代表、または同水準のスタッフが外部CTOとして伴走',
    '導入すべきシステムやツールの選定を提案',
    '事業に応じたコスト管理と開発方針の整理を支援'
  ];

  const fullStackPricing = [
    '基本料金は月額77万円から',
    '運用保守が必要なシステムの料金を加算',
    '保守対象システムが増えた場合は都度お見積もり'
  ];

  const operationSupportItems = [
    '社内の定期的な運用作業の代行',
    '既存システムの保守・軽微修正対応',
    '障害時の一次切り分けと改善提案'
  ];

  const developmentPlanItems = [
    '新規システム開発、機能追加、改修のスポット対応',
    '要件整理から設計、実装、リリースまで対応',
    '開発後の運用を見据えた構成と実装方針をご提案'
  ];

  const developmentPlanPricing = [
    '料金はご相談',
    '開発内容、規模、期間に応じて個別にお見積もり',
    'スポット開発後、運用保守契約への移行も可能'
  ];

  const operationSupportPricing = [
    '月額15万円から',
    '対象業務・対象システムに応じて内容を調整',
    '作業量が大きい場合や対象追加時は別途お見積もり'
  ];

  const flow = [
    'お問い合わせ後、30分程度のヒアリングを実施',
    '対象システム、必要な支援範囲、運用体制を整理',
    'お見積もりと進め方をご提示し、支援を開始'
  ];

  const reasons = [
    {
      title: '必要な分だけをご提案します',
      description: '不必要なシステムやサービスを売りつけることはせず、事業に本当に必要な範囲を見極めたうえでご提案します。'
    },
    {
      title: '事業に集中できる状態を重視します',
      description: '本来取り組むべき事業に集中できることを最優先に考え、システムに振り回されない設計と最適化を前提にご提案します。'
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
            ITに関することを
            <br class="hidden sm:block"/>
            必要な範囲で支援します。
        </h1>
        <p class="mt-6 max-w-3xl text-base md:text-lg leading-8 text-gray-600">
            bitboxxでは、事業と開発を一体で支援するフルスタックプラン、
            スポットで依頼できるシステム開発プラン、定期的な運用や保守に対応する運用保守プランをご用意しています。
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
                    <p class="text-sm font-medium text-gray-500">bitboxxを選ぶ理由</p>
                    <h2 class="plans-heading mt-2 text-3xl text-gray-900">事業のためのシステムをご提案します</h2>
                </div>
                <p class="text-sm leading-7 text-gray-600">
                    システム導入そのものが目的にならないよう、必要性と運用負荷の両方を見ながら設計します。
                </p>
            </div>

            <div class="mt-10 grid gap-8 md:grid-cols-2">
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
                    <p class="mt-5 text-3xl font-bold tracking-tight text-gray-900">月額 77万円から</p>
                    <p class="mt-5 text-sm leading-7 text-gray-600">
                        コンサルティング、システム開発、運用保守をまとめて依頼したい企業向けの包括プランです。
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
                        <div class="bg-gray-50 px-6 py-5 text-sm font-medium text-gray-700">伴走体制</div>
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
                </div>
            </div>
        </div>

        <div class="mt-16 pt-6">
            <div class="grid gap-8 lg:grid-cols-[280px_1fr]">
                <div>
                    <p class="text-sm font-medium text-gray-500">プラン 02</p>
                    <h2 class="plans-heading mt-2 text-3xl text-gray-900">運用保守プラン</h2>
                    <p class="mt-5 text-3xl font-bold tracking-tight text-gray-900">月額 15万円から</p>
                    <p class="mt-5 text-sm leading-7 text-gray-600">
                        社内の定期運用や既存システムの保守を継続的に任せたい場合に適したプランです。
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
                        必要な機能や課題に応じて、スポットでシステム開発を依頼したい場合に適したプランです。
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
                <h2 class="plans-heading mt-2 text-3xl text-gray-900">ご支援イメージ</h2>
            </div>
            <p class="text-sm leading-7 text-gray-600">
                実際の支援内容が伝わるよう、代表的なケースを掲載しています。
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
                        HP制作、事業用システム開発、事業方針に関する相談までを一体で支援しています。
                        事業フェーズに応じたシステム整備や開発方針の整理も含めて、継続的にサポートしています。
                    </p>
                    <dl class="mt-6 divide-y divide-gray-200">
                        <div class="grid gap-2 py-4 md:grid-cols-[180px_1fr]">
                            <dt class="text-sm font-medium text-gray-700">主な支援内容</dt>
                            <dd class="text-sm leading-7 text-gray-600">HP制作、システム開発、事業方針相談を一括で支援</dd>
                        </div>
                        <div class="grid gap-2 py-4 md:grid-cols-[180px_1fr]">
                            <dt class="text-sm font-medium text-gray-700">体制</dt>
                            <dd class="text-sm leading-7 text-gray-600">システム選定や進行設計まで含めて伴走</dd>
                        </div>
                        <div class="grid gap-2 py-4 md:grid-cols-[180px_1fr]">
                            <dt class="text-sm font-medium text-gray-700">ご相談内容</dt>
                            <dd class="text-sm leading-7 text-gray-600">システム選定、コスト管理、今後の投資判断まで提案</dd>
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
                        HPの運用保守や社内アカウント管理などの日常的な運用業務を継続して支援しています。
                        あわせて、社内ツールの整備やコラム作成などのスポット対応も行っています。
                    </p>
                    <dl class="mt-6 divide-y divide-gray-200">
                        <div class="grid gap-2 py-4 md:grid-cols-[180px_1fr]">
                            <dt class="text-sm font-medium text-gray-700">主な支援内容</dt>
                            <dd class="text-sm leading-7 text-gray-600">HPの更新、運用保守、軽微な改善対応を継続支援</dd>
                        </div>
                        <div class="grid gap-2 py-4 md:grid-cols-[180px_1fr]">
                            <dt class="text-sm font-medium text-gray-700">定期運用</dt>
                            <dd class="text-sm leading-7 text-gray-600">社内アカウント管理などの定期運用作業を支援</dd>
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
                    新規開発だけでなく、既存システムの運用切り替えや移行についても対応可能です。
                    現在の運用状況や課題を含めて、お気軽にご相談ください。
                </p>
                <a href={`${base}/#contact-form`} class="mt-8 inline-flex items-center justify-center rounded-md bg-gray-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-700">
                    相談する
                </a>
            </aside>
        </div>
    </div>
</section>
</div>
