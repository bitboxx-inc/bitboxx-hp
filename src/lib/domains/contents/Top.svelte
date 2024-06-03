<script lang="ts">
    import BitboxxLogo from "$lib/domains/BitboxxLogo.svelte";
    import BitboxxTypography from "$lib/infras/BitboxxTypography.svelte";

    export let contents: {link: string; title: string}[] = [];
</script>

<div id="top" class="h-dvh flex place-items-center">
    <div class="flex-1 flex justify-center">
        <BitboxxLogo/>
    </div>
    <div class="flex-1">
        {#each contents as content, index}
            <div style="line-height: 0.85">
                <a href={content.link}>
                    <BitboxxTypography widthPx={88} fontSizePx={160} outlined={true}>
                        {String(index + 1).padStart(2, '0')}
                    </BitboxxTypography>
                    <BitboxxTypography fontSizePx={160}>&nbsp;</BitboxxTypography>
                    <BitboxxTypography fontSizePx={160}>{content.title}</BitboxxTypography>
                </a>
            </div>
        {/each}
    </div>
</div>