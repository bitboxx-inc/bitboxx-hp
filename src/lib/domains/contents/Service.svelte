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

<Display id={"service"}>

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
            <div class="w-full">
                <BitboxxTypography fontSizePx={24}>自社サービス開発</BitboxxTypography>
                <p>
                    ニーズに合わせた独自のソリューションを開発。最先端の技術と豊富な経験を活かし、ビジネスの成長をサポート。
                </p>
            </div>

            <div class="w-full">
                <BitboxxTypography fontSizePx={24}>
                    システム開発<br/>
                    ウェブサイト制作/運用
                </BitboxxTypography>
                <p>
                    高性能なシステム開発と魅力的なウェブサイトの制作・運用を一貫して提供。効率的で使いやすいデジタル環境を構築します。
                </p>
            </div>

            <div class="w-full">
                <BitboxxTypography fontSizePx={24}>
                    デザイン設計
                </BitboxxTypography>
                <p>
                    視覚的に優れたデザインを通じて、ブランドの魅力を最大限に引き出します。ユーザー体験を重視した設計で、印象的なデジタルプレゼンスを実現。
                </p>
            </div>
        </div>
    </BitboxxContent>

</Display>