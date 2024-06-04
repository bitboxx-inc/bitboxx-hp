<script>
    import BitboxxContentTitle from "$lib/infras/BitboxxContentTitle.svelte";
    import BitboxxContent from "$lib/infras/BitboxxContent.svelte";
    import Display from "$lib/infras/Display.svelte";

    let info = [
        {
            title: '社名',
            description: '株式会社bitboxx'
        },
        {
            title: '設立',
            description: '2024年04月25日'
        },
        {
            title: '代表者',
            description: '代表取締役CEO　影島 翔'
        },
        {
            title: '所在地',
            description: '103-0015<br/>東京都中央区日本橋箱崎町16-11<br/>ルミネ日本橋601'
        },
        {
            title: '主な業務',
            description: '<ul><li>・自社サービス開発</li><li>・システム開発、ウェブサイト制作/運用</li><li>・デザイン</li></ul>'
        },
    ]
</script>

<Display id={"company"}>

    <BitboxxContent slot="lg">
        <div class="absolute top-0 left-0">
            <BitboxxContentTitle num={4}>COMPANY</BitboxxContentTitle>
        </div>
        <div class="max-w-4xl mx-auto p-4">
            <table>
                <tbody>
                {#each info as inf}
                    <tr class="border-b-2 border-black">
                        <th class="w-96 h-24" style="mergin-left: -24px;">
                            <span style="font-size: 16px; letter-spacing: 24px;">{@html inf.title}</span>
                        </th>
                        <td>
                            <div class="w-full p-4" style="font-size: 16px;">{@html inf.description}</div>
                        </td>
                    </tr>
                {/each}
                </tbody>
            </table>
        </div>
    </BitboxxContent>

    <BitboxxContent slot="md">
        <div class="absolute top-0 left-0">
            <BitboxxContentTitle num={4}>COMPANY</BitboxxContentTitle>
        </div>
        <div class="max-w-4xl mx-auto p-4">
            <table>
                <tbody>
                {#each info as inf}
                    <tr class="border-b-2 border-black">
                        <th class="w-96 h-24" style="mergin-left: -24px;">
                            <span style="font-size: 16px; letter-spacing: 24px;">{@html inf.title}</span>
                        </th>
                        <td>
                            <div class="w-full p-4" style="font-size: 16px;">{@html inf.description}</div>
                        </td>
                    </tr>
                {/each}
                </tbody>
            </table>
        </div>
    </BitboxxContent>

    <BitboxxContent slot="sm">
        <div class="absolute top-0 left-4">
            <BitboxxContentTitle num={4} fontSizePx={48} widthPx={40}>COMPANY</BitboxxContentTitle>
        </div>
        <div class="max-w-4xl mx-auto p-4">
            <table>
                <tbody>
                {#each info as inf}
                    <tr class="border-b-2 border-black">
                        <th class="h-24" style="mergin-left: -24px;">
                            <span style="font-size: 16px; letter-spacing: 24px;">{@html inf.title}</span>
                        </th>
                        <td>
                            <div class="w-full p-4" style="font-size: 16px;">{@html inf.description}</div>
                        </td>
                    </tr>
                {/each}
                </tbody>
            </table>
        </div>
    </BitboxxContent>
</Display>

