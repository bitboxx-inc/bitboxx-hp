<script>
    import BitboxxTypography from "$lib/infras/BitboxxTypography.svelte";

    export let num = 0;
    export let fontSizePx = 96;
    export let widthPx = 88;
</script>

<span class={`${fontSizePx === 96 ? 'rect-before' : ''} `}>
    <BitboxxTypography fontSizePx={fontSizePx} outlined={true} widthPx={widthPx}>{String(num).padStart(2, '0')}</BitboxxTypography>
</span>
<BitboxxTypography fontSizePx={fontSizePx}><slot/></BitboxxTypography>

<style lang="css">
    .rect-before::before {
        content: '';
        display: inline-block;
        width: 64px; /* 矩形の幅を指定 */
        height: 2px; /* 矩形の高さを指定 */
        background-color: black; /* 矩形の背景色を指定 */
        margin-right: 16px; /* テキストとの間のスペースを指定 */
        margin-bottom: 56px;
        vertical-align: middle; /* テキストと縦方向の位置を揃える */
    }
</style>