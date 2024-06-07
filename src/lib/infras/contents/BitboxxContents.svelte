<script lang="ts">
    import BitboxxLogo from "$lib/domains/BitboxxLogo.svelte";
    import BitboxxTypography from "$lib/infras/BitboxxTypography.svelte";
    import FadeIn from "$lib/infras/fade/FadeIn.svelte";
    import {writable} from "svelte/store";

    export let contents: { link: string; title: string }[] = [];

    const hoverState = writable<number | null>(null);

    function handleMouseEnter(index: number) {
        hoverState.set(index);
    }

    function handleMouseLeave() {
        hoverState.set(null);
    }

</script>


{#each contents as content, index}
    <div class="hover-container" style="line-height: 0.85">
        <FadeIn>
            <a href={content.link}
               class="hover-effect"
               on:mouseenter={() => handleMouseEnter(index)}
               on:mouseleave={handleMouseLeave}>
                <BitboxxTypography widthPx={88} fontSizePx={160} outlined={true}>
                    {String(index + 1).padStart(2, '0')}
                </BitboxxTypography>
                <BitboxxTypography fontSizePx={160}>&nbsp;</BitboxxTypography>
                <BitboxxTypography fontSizePx={160}>{content.title}</BitboxxTypography>
            </a>
        </FadeIn>
        {#if $hoverState === index}
            <div class="hover-line"></div>
        {/if}
    </div>
{/each}
<style>

    .hover-effect:hover {
        color: white; /* 文字色を透明にする */
        -webkit-text-stroke: 1px #D62649; /* アウトラインの色を指定 */
        text-shadow: none; /* テキストシャドウをオフにする */
    }

    .hover-container {
        position: relative;
    }

    .hover-line {
        z-index: -1;
        position: absolute;
        top: 50%;
        left: 0;
        height: 2px;
        width: 100%;
        background-color: #D62649;
        transform: scaleX(0);
        transform-origin: right;
        animation: none;
    }

    .hover-container:hover .hover-line {
        animation: stretch-line 0.7s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    }

    @keyframes stretch-line {
        0% {
            transform: scaleX(0);
        }
        100% {
            transform: scaleX(1);
        }
    }
</style>