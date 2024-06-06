<script lang="ts">
    export let fontSizePx = 20;
</script>

<span style={`font-family: 'Noto Sans JP'; font-size: ${fontSizePx}px;`}>
    <slot/>
</span>