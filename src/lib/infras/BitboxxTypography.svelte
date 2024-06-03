<script lang="ts">
    export let fontSizePx: number = 160;
    export let outlined: boolean = false;
    export let widthPx: number = 0;
</script>

<span style={`display: inline-block; ${widthPx > 0 ? 'width:' + widthPx + 'px;' : ''}`}>
    <span class={`${outlined ? 'outlined text-shadow-outline' : ''}`}
          style={`font-family: "League Gothic", sans-serif;
          font-size: ${fontSizePx}px;`}>
        <slot/>
    </span>
</span>

<style lang="css">

    /* 文字を縁取るためのスタイル */
    .outlined {
        -webkit-text-stroke: 1px black; /* Webkitベースのブラウザ用 */
        color: white; /* 文字色を白に設定 */
    }

    /* text-shadowを使用したアウトラインの例 */
    .text-shadow-outline {
        text-shadow: -1px -1px 0 #000,
        1px -1px 0 #000,
        -1px 1px 0 #000,
        1px 1px 0 #000;
        color: white;
    }
</style>
