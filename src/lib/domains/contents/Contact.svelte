<script lang="ts">
    import BitboxxContentTitle from "$lib/infras/BitboxxContentTitle.svelte";
    import BitboxxContent from "$lib/infras/BitboxxContent.svelte";
    import BitboxxTypography from "$lib/infras/BitboxxTypography.svelte";
    import Display from "$lib/infras/Display.svelte";
    import BitboxxText from "$lib/infras/BitboxxText.svelte";

    let yourname = '';
    let company = '';
    let email = '';
    let tel = '';
    let text = '';
    let pr = false;

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

<Display>
    <BitboxxContent slot="lg">
        <div class="absolute top-0 left-0">
            <BitboxxContentTitle num={5}>CONTACT</BitboxxContentTitle>
        </div>
        <div>
            <table>
                <tbody>
                <tr class="border-b-2 border-black">
                    <th class="w-96">
                        <span class="w-96 h-24">
                            <span style="letter-spacing: 32px; margin-right: -32px;"><BitboxxText
                                    fontSizePx="20">名前</BitboxxText></span>
                        </span>
                    </th>
                    <td class="w-96">
                        <input class="w-96 my-8 mx-4" style="background-color: #FFFFFF; border: solid 1px;"
                               bind:value={yourname}/>
                    </td>
                </tr>
                <tr class="border-b-2 border-black">
                    <th class="w-96">
                        <span class="w-96 h-24"><span
                                style="letter-spacing: 8px; margin-right: -8px;"><BitboxxText
                                fontSizePx="20">会社名</BitboxxText></span></span>
                    </th>
                    <td class="w-96">
                        <input class="w-96 my-8 mx-4" style="background-color: #FFFFFF; border: solid 1px;"
                               bind:value={company}/>
                    </td>
                </tr>
                <tr class="border-b-2 border-black">
                    <th class="w-96">
                        <span class="w-96 h-24"><span
                                style="letter-spacing: 8px; margin-right: -8px;"><BitboxxText
                                fontSizePx="20">メール</BitboxxText></span><br/><BitboxxText
                                fontSizePx="20">アドレス</BitboxxText></span>
                    </th>
                    <td class="w-96">
                        <input class="w-96 my-8 mx-4" style="background-color: #FFFFFF; border: solid 1px;"
                               bind:value={email}/>
                    </td>
                </tr>
                <tr class="border-b-2 border-black">
                    <th class="w-96">
                        <span class="w-96 h-24"><BitboxxText fontSizePx="20">電話番号</BitboxxText></span>
                    </th>
                    <td class="w-96">
                        <input class="w-96 my-8 mx-4" style="background-color: #FFFFFF; border: solid 1px;"
                               bind:value={tel}/>
                    </td>
                </tr>
                <tr class="border-b-2 border-black">
                    <th class="w-96">
                        <span class="w-96 h-24"><BitboxxText fontSizePx="20">問合わせ</BitboxxText><br/><span
                                style="letter-spacing: 32px; margin-right: -32px;"><BitboxxText fontSizePx="20">内容</BitboxxText></span></span>
                    </th>
                    <td class="w-96">
                        <textarea class="w-96 h-48 my-8 mx-4" style="background-color: #FFFFFF; border: solid 1px;"
                                  bind:value={text}></textarea>
                    </td>
                </tr>
                </tbody>
            </table>
            <div class="privacy flex justify-center mt-12">
                <input class="mr-2" type="checkbox" bind:checked={pr}/>
                <label><BitboxxText fontSizePx="20">当社規定の<a href="/#" style="color: #00B3FF;">プライバシーポリシー</a>に同意する</BitboxxText></label>
            </div>
            <div class="w-full mt-6">
                <button disabled={isDisabled(pr, yourname, company, email, tel, text)}
                        class="w-full h-24"
                        style={`color: white; font-size: 40px; font-family: 'Noto Sans JP'; font-weight: 700;
                        background-color: ${isDisabled(pr, yourname, company, email, tel, text) ? 'rgba(214, 38, 73, 0.3)' : 'rgba(214, 38, 73, 1)'};`}
                        on:click={send}>
                    送信する
                </button>
            </div>
        </div>
    </BitboxxContent>

    <BitboxxContent slot="md">
        <div class="absolute top-0 left-0">
            <BitboxxContentTitle num={5}>CONTACT</BitboxxContentTitle>
        </div>
        <div>
            <table>
                <tbody>
                <tr class="border-b-2 border-black">
                    <th class="w-96">
                        <span class="w-96 h-24">
                            <span style="letter-spacing: 32px; margin-right: -32px;"><BitboxxText
                                    fontSizePx="20">名前</BitboxxText></span>
                        </span>
                    </th>
                    <td class="w-96">
                        <input class="w-96 my-8 mx-4" style="background-color: #FFFFFF; border: solid 1px;"
                               bind:value={yourname}/>
                    </td>
                </tr>
                <tr class="border-b-2 border-black">
                    <th class="w-96">
                        <span class="w-96 h-24"><span
                                style="letter-spacing: 8px; margin-right: -8px;"><BitboxxText
                                fontSizePx="20">会社名</BitboxxText></span></span>
                    </th>
                    <td class="w-96">
                        <input class="w-96 my-8 mx-4" style="background-color: #FFFFFF; border: solid 1px;"
                               bind:value={company}/>
                    </td>
                </tr>
                <tr class="border-b-2 border-black">
                    <th class="w-96">
                        <span class="w-96 h-24"><span
                                style="letter-spacing: 8px; margin-right: -8px;"><BitboxxText
                                fontSizePx="20">メール</BitboxxText></span><br/><BitboxxText
                                fontSizePx="20">アドレス</BitboxxText></span>
                    </th>
                    <td class="w-96">
                        <input class="w-96 my-8 mx-4" style="background-color: #FFFFFF; border: solid 1px;"
                               bind:value={email}/>
                    </td>
                </tr>
                <tr class="border-b-2 border-black">
                    <th class="w-96">
                        <span class="w-96 h-24"><BitboxxText fontSizePx="20">電話番号</BitboxxText></span>
                    </th>
                    <td class="w-96">
                        <input class="w-96 my-8 mx-4" style="background-color: #FFFFFF; border: solid 1px;"
                               bind:value={tel}/>
                    </td>
                </tr>
                <tr class="border-b-2 border-black">
                    <th class="w-96">
                        <span class="w-96 h-24"><BitboxxText fontSizePx="20">問合わせ</BitboxxText><br/><span
                                style="letter-spacing: 32px; margin-right: -32px;"><BitboxxText fontSizePx="20">内容</BitboxxText></span></span>
                    </th>
                    <td class="w-96">
                        <textarea class="w-96 h-48 my-8 mx-4" style="background-color: #FFFFFF; border: solid 1px;"
                                  bind:value={text}></textarea>
                    </td>
                </tr>
                </tbody>
            </table>
            <div class="privacy flex justify-center mt-12">
                <input class="mr-2" type="checkbox" bind:checked={pr}/>
                <label><BitboxxText fontSizePx="20">当社規定の<a href="/#" style="color: #00B3FF;">プライバシーポリシー</a>に同意する</BitboxxText></label>
            </div>
            <div class="w-full mt-6">
                <button disabled={isDisabled(pr, yourname, company, email, tel, text)}
                        class="w-full h-24"
                        style={`color: white; font-size: 40px; font-family: 'Noto Sans JP'; font-weight: 700;
                        background-color: ${isDisabled(pr, yourname, company, email, tel, text) ? 'rgba(214, 38, 73, 0.3)' : 'rgba(214, 38, 73, 1)'};`}
                        on:click={send}>
                    送信する
                </button>
            </div>
        </div>
    </BitboxxContent>

    <BitboxxContent slot="sm">
        <div class="absolute top-0 left-4">
            <BitboxxContentTitle num={5} fontSizePx={48} widthPx={40}>CONTACT</BitboxxContentTitle>
        </div>
        <div>
            <table class="mx-4">
                <tbody>
                <tr class="border-b-2 border-black">
                    <th class="w-48" style="font-size: 14px;">
                        <span class="w-48 h-12"><span
                                style="letter-spacing: 28px; margin-right: -28px;">名前</span></span>
                    </th>
                    <td class="w-48">
                        <input class="w-48 my-2 mx-1" style="background-color: #FFFFFF; border: solid 1px;"
                               bind:value={yourname}/>
                    </td>
                </tr>
                <tr class="border-b-2 border-black">
                    <th class="w-48" style="font-size: 14px;">
                        <span class="w-48 h-12"><span
                                style="letter-spacing: 8px; margin-right: -8px;">会社名</span></span>
                    </th>
                    <td class="w-48">
                        <input class="w-48 my-2 mx-1" style="background-color: #FFFFFF; border: solid 1px;"
                               bind:value={company}/>
                    </td>
                </tr>
                <tr class="border-b-2 border-black">
                    <th class="w-48" style="font-size: 14px;">
                        <span class="w-48 h-12"><span
                                style="letter-spacing: 8px; margin-right: -8px;">メール</span><br/>アドレス</span>
                    </th>
                    <td class="w-48">
                        <input class="w-48 my-2 mx-1" style="background-color: #FFFFFF; border: solid 1px;"
                               bind:value={email}/>
                    </td>
                </tr>
                <tr class="border-b-2 border-black">
                    <th class="w-48" style="font-size: 14px;">
                        <span class="w-48 h-12">電話番号</span>
                    </th>
                    <td class="w-48">
                        <input class="w-48 my-2 mx-1" style="background-color: #FFFFFF; border: solid 1px;"
                               bind:value={tel}/>
                    </td>
                </tr>
                <tr class="border-b-2 border-black">
                    <th class="w-48" style="font-size: 14px;">
                        <span class="w-48 h-12">問合わせ<br/><span
                                style="letter-spacing: 28px; margin-right: -28px;">内容</span></span>
                    </th>
                    <td class="w-48">
                        <textarea class="w-48 h-24 my-2 mx-1" style="background-color: #FFFFFF; border: solid 1px;"
                                  bind:value={text}></textarea>
                    </td>
                </tr>
                </tbody>
            </table>
            <div class="privacy flex justify-center mt-8">
                <input class="mr-2" type="checkbox" bind:checked={pr}/>
                <label><BitboxxText fontSizePx="14">当社規定の<a href="/#" style="color: #00B3FF;">プライバシーポリシー</a>に同意する</BitboxxText></label>
            </div>
            <div class="mx-4 mt-4">
                <button disabled={isDisabled(pr, yourname, company, email, tel, text)}
                        class="w-full h-12"
                        style={`color: white; font-size: 24px; font-family: 'Noto Sans JP'; font-weight: 700;
                        background-color: ${isDisabled(pr, yourname, company, email, tel, text) ? 'rgba(214, 38, 73, 0.3)' : 'rgba(214, 38, 73, 1)'};`}
                        on:click={send}>
                    送信する
                </button>
            </div>
        </div>
    </BitboxxContent>
</Display>

<style>
    .privacy {
        font-family: 'Noto Sans JP';
        font-style: normal;
        font-weight: 400;
        font-size: 16px;
        line-height: 23px;
        display: flex;
        align-items: center;
        text-align: center;

        color: #0F0101;
    }
</style>
