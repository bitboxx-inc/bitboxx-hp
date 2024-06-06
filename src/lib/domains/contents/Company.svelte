<script>
    import BitboxxContentTitle from "$lib/infras/BitboxxContentTitle.svelte";
    import BitboxxContent from "$lib/infras/BitboxxContent.svelte";
    import Display from "$lib/infras/Display.svelte";
    import BitboxxText from "$lib/infras/BitboxxText.svelte";

    let info = [
        {
            title: '社名',
            description: '株式会社bitboxx',
            letterSp: 16 * 5,
        },
        {
            title: '設立',
            description: '2024年04月25日',
            letterSp: 16 * 5,
        },
        {
            title: '代表者',
            description: '代表取締役CEO　影島 翔',
            letterSp: 16 * 2,
        },
        {
            title: '所在地',
            description: '103-0015<br/>東京都中央区日本橋箱崎町16-11<br/>ルミネ日本橋601',
            letterSp: 16 * 2,
        },
        {
            title: '主な業務',
            description: '<ul><li>・自社サービス開発</li><li>・システム開発、ウェブサイト制作/運用</li><li>・デザイン</li></ul>',
            letterSp: 16 * 1,
        },
    ]
</script>

<Display>

    <BitboxxContent slot="lg">
        <div class="absolute top-0 left-0">
            <BitboxxContentTitle num={4}>COMPANY</BitboxxContentTitle>
        </div>
        <div>
            <table>
                <tbody>
                {#each info as inf}
                    <tr class="border-b-2 border-black">
                        <th class="w-96 h-24">
                            <span style={`letter-spacing: ${inf.letterSp}px; margin-right: -${inf.letterSp}px;`}>
                                <BitboxxText fontSizePx="20">{@html inf.title}</BitboxxText>
                            </span>
                        </th>
                        <td class="w-96 h-24">
                            <div class="w-full p-4">
                                <BitboxxText fontSizePx="18">{@html inf.description}</BitboxxText>
                            </div>
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
        <div>
            <table>
                <tbody>
                {#each info as inf}
                    <tr class="border-b-2 border-black">
                        <th class="w-96 h-24">
                            <span style={`letter-spacing: ${inf.letterSp}px; margin-right: -${inf.letterSp}px;`}>
                                <BitboxxText fontSizePx="20">{@html inf.title}</BitboxxText>
                            </span>
                        </th>
                        <td class="w-96 h-24">
                            <div class="w-full p-4">
                                <BitboxxText fontSizePx="18">{@html inf.description}</BitboxxText>
                            </div>
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
        <div>
            <table class="mx-4">
                <tbody>
                {#each info as inf}
                    <tr class="border-b-2 border-black">
                        <th class="w-40 h-12">
                            <span style={`font-size: 14px; letter-spacing: ${inf.letterSp / 16 * 12}px; margin-right: -${inf.letterSp / 16 * 12}px;`}>{@html inf.title}</span>
                        </th>
                        <td>
                            <div class="w-full p-2" style="font-size: 14px;">{@html inf.description}</div>
                        </td>
                    </tr>
                {/each}
                </tbody>
            </table>
        </div>
    </BitboxxContent>
</Display>

