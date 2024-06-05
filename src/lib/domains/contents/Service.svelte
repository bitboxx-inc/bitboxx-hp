<script>
    import BitboxxContentTitle from "$lib/infras/BitboxxContentTitle.svelte";
    import BitboxxContent from "$lib/infras/BitboxxContent.svelte";
    import BitboxxTypography from "$lib/infras/BitboxxTypography.svelte";
    import Display from "$lib/infras/Display.svelte";

    let services = [
        {
            title: '自社サービス開発',
            description: 'ニーズに合わせた独自のソリューションを開発。最先端の技術と豊富な経験を活かし、ビジネスの成長をサポート。'
        },
        {
            title: 'システム開発<br/>ウェブサイト制作/運用',
            description: '高性能なシステム開発と魅力的なウェブサイトの制作・運用を一貫して提供。効率的で使いやすいデジタル環境を構築します。'
        },
        {
            title: 'デザイン設計',
            description: '視覚的に優れたデザインを通じて、ブランドの魅力を最大限に引き出します。ユーザー体験を重視した設計で、印象的なデジタルプレゼンスを実現。'
        },
    ]
</script>

<Display>

    <BitboxxContent slot="lg">
        <div class="absolute top-0 left-0">
            <BitboxxContentTitle num={2}>SERVICE</BitboxxContentTitle>
        </div>
        <div class="max-w-screen-xl flex justify-center items-center">
            <table class="table-auto w-full mt-12">
                <tbody>
                {#each services as service}
                    <tr class="border-b-2 border-black" style="height: 190px;">
                        <th class="p-8 m-24">
                            <BitboxxTypography fontSizePx={20}>{@html service.title}</BitboxxTypography>
                        </th>
                        <td style="font-size: 24px;">
                            {@html service.description}
                        </td>
                    </tr>
                {/each}
                </tbody>
            </table>
        </div>
    </BitboxxContent>

    <BitboxxContent slot="md">
        <div class="absolute top-0 left-0">
            <BitboxxContentTitle num={2}>SERVICE</BitboxxContentTitle>
        </div>
        <div class="max-w-screen-xl flex justify-center items-center">
            <table class="table-auto w-full mt-12">
                <tbody>
                {#each services as service}
                    <tr class="border-b-2 border-black" style="height: 50px;">
                        <th class="p-6 m-12">
                            <BitboxxTypography fontSizePx={20}>{@html service.title}</BitboxxTypography>
                        </th>
                        <td style="font-size: 20px;">
                            {@html service.description}
                        </td>
                    </tr>
                {/each}
                </tbody>
            </table>
        </div>
    </BitboxxContent>

    <BitboxxContent slot="sm">
        <div class="absolute top-0 left-4">
            <BitboxxContentTitle num={2} fontSizePx={48} widthPx={40}>SERVICE</BitboxxContentTitle>
        </div>

        <div class="flex flex-col space-y-8 mt-20 mx-8">
            <table class="table-auto w-full mt-12">
                <tbody>
                {#each services as service}
                    <tr class="border-b-2 border-black" style="height: 50px;">
                        <td class="p-6 m-12" style="font-family: 'Noto Sans JP';">
                            <div class="flex justify-center sp-service-title">
                                <BitboxxTypography fontSizePx={24}><b>{@html service.title}</b></BitboxxTypography>
                            </div>
                            <div class="mt-4 sp-service">
                                {@html service.description}
                            </div>
                        </td>
                    </tr>
                {/each}
                </tbody>
            </table>
        </div>
    </BitboxxContent>

</Display>

<style>

    .sp-service-title {

        /* index_Large */
        font-family: 'Noto Sans JP';
        font-style: normal;
        font-weight: 900;
        font-size: 24px;
        line-height: 35px;
        /* leading-trim and text-edge are draft CSS properties.

        Read more: https://drafts.csswg.org/css-inline-3/#leading-trim
        */
        leading-trim: both;
        text-edge: cap;
        display: flex;
        align-items: flex-end;
        text-align: center;

        color: #000000;
    }

    .sp-service {

        font-family: 'Noto Sans JP';
        font-style: normal;
        font-weight: 400;
        font-size: 12px;
        line-height: 17px;
        /* leading-trim and text-edge are draft CSS properties.

        Read more: https://drafts.csswg.org/css-inline-3/#leading-trim
        */
        leading-trim: both;
        text-edge: cap;
        display: flex;
        align-items: center;
        color: #000000;
    }
</style>