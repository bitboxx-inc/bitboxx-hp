<script>
    import BitboxxContentTitle from "$lib/infras/BitboxxContentTitle.svelte";
    import BitboxxContent from "$lib/infras/BitboxxContent.svelte";
    import BitboxxTypography from "$lib/infras/BitboxxTypography.svelte";
</script>

<BitboxxContent id={"company"}>
    <div class="absolute top-0 left-0">
        <BitboxxContentTitle num={4}>COMPANY</BitboxxContentTitle>
    </div>
    <div class="max-w-4xl mx-auto p-4">
        <table>
            <tbody>
            <tr class="border-b-2 border-black">
                <th class="w-96 h-24" style="mergin-left: -24px;">
                    <span style="font-size: 16px; letter-spacing: 24px;">社名</span>
                </th>
                <td>
                    <div class="w-full p-4" style="font-size: 16px;">株式会社bitboxx</div>
                </td>
            </tr>
            <tr class="border-b-2 border-black">
                <th class="w-96 h-24" style="mergin-left: -24px;">
                    <span style="font-size: 16px; letter-spacing: 24px;">設立</span>
                </th>
                <td>
                    <div class="w-full p-4" style="font-size: 16px;">2024年04月25日</div>
                </td>
            </tr>
            <tr class="border-b-2 border-black">
                <th class="w-96 h-24">
                    <span style="font-size: 16px; letter-spacing: 16px;">代表者</span>
                </th>
                <td>
                    <div class="w-full p-4" style="font-size: 16px;">代表取締役CEO　影島 翔</div>
                </td>
            </tr>
            <tr class="border-b-2 border-black">
                <th class="w-96 h-24">
                    <span style="letter-spacing: 16px;">所在地</span>
                </th>
                <td>
                    <div class="w-full p-4" style="font-size: 16px;">
                        103-0015<br/>
                        東京都中央区日本橋箱崎町16-11<br/>
                        ルミネ日本橋601
                    </div>
                </td>
            </tr>
            <tr class="border-b-2 border-black">
                <th class="w-96 h-24">
                    <span style="letter-spacing: 8px;">主な業務</span>
                </th>
                <td>
                    <div class="w-full p-4" style="font-size: 16px;">
                        <ul>
                            <li>・自社サービス開発</li>
                            <li>・システム開発、ウェブサイト制作/運用</li>
                            <li>・デザイン</li>
                        </ul>
                    </div>
                </td>
            </tr>
            </tbody>
        </table>
    </div>
</BitboxxContent>

