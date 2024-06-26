<script lang="ts">
    import BitboxxLogo from "$lib/domains/BitboxxLogo.svelte";
    import BitboxxTypography from "$lib/infras/BitboxxTypography.svelte";
    import { writable } from "svelte/store";
    import Display from "$lib/infras/Display.svelte";
    import FadeIn from "$lib/infras/fade/FadeIn.svelte";
    import { scrollToTarget } from "$lib/infras/utils/scrollToTarget"; // ここでユーティリティをインポート

    export let contents: { link: string; title: string }[] = [];
    const hoverState = writable<number | null>(null);

    function handleMouseEnter(index: number) {
        hoverState.set(index);
    }

    function handleMouseLeave() {
        hoverState.set(null);
    }

    function handleLinkClick(event: Event, link: string) {
        event.preventDefault();
        const targetId = link.replace('/#', '');
        window.location.href = link;
        // scrollToTarget(targetId);
    }
</script>

<Display>
    <div slot="lg">
        <div class="h-dvh flex place-items-center">
            <div class="flex-1 flex justify-center">
                <BitboxxLogo/>
            </div>
            <div class="flex-1 relative ml-24">
                {#each contents as content, index}
                    <div class="hover-container" style="line-height: 0.85">
                        <FadeIn>
                            <a href={content.link}
                               class="hover-effect"
                               on:click|preventDefault={(event) => handleLinkClick(event, content.link)}
                               on:mouseenter={() => handleMouseEnter(index)}
                               on:mouseleave={handleMouseLeave}>
                                <BitboxxTypography widthPx={35} fontSizePx={60} outlined={true}>
                                    {String(index + 1).padStart(2, '0')}
                                </BitboxxTypography>
                                <BitboxxTypography fontSizePx={60}>&nbsp;</BitboxxTypography>
                                <BitboxxTypography fontSizePx={60}>{content.title}</BitboxxTypography>
                            </a>
                        </FadeIn>
                        {#if $hoverState === index}
                            <div class="hover-line"></div>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
    </div>
    <div slot="md">
        <div class="h-dvh flex place-items-center">
            <div class="flex-1 flex justify-center">
                <BitboxxLogo/>
            </div>
            <div class="flex-1 relative ml-24">
                {#each contents as content, index}
                    <div class="hover-container" style="line-height: 0.85">
                        <FadeIn>
                            <a href={content.link}
                               class="hover-effect"
                               on:click|preventDefault={(event) => handleLinkClick(event, content.link)}
                               on:mouseenter={() => handleMouseEnter(index)}
                               on:mouseleave={handleMouseLeave}>
                                <BitboxxTypography widthPx={35} fontSizePx={60} outlined={true}>
                                    {String(index + 1).padStart(2, '0')}
                                </BitboxxTypography>
                                <BitboxxTypography fontSizePx={60}>&nbsp;</BitboxxTypography>
                                <BitboxxTypography fontSizePx={60}>{content.title}</BitboxxTypography>
                            </a>
                        </FadeIn>
                        {#if $hoverState === index}
                            <div class="hover-line"></div>
                        {/if}
                    </div>
                {/each}
            </div>
        </div>
    </div>
    <div slot="sm">
        <div class="h-dvh flex justify-center">
            <div class="flex">
                <span class="flex-1 flex justify-center">
                </span>
                    <span class="flex-1">
                <span class="flex-1 flex justify-center">
                </span>
                </span>
                    <span class="flex-1 flex justify-center">
                </span>
            </div>
            <div class="flex place-items-center">
                <div class="relative">
                    {#each contents as content, index}
                        <div class="hover-container" style="line-height: 0.85">
                            <a href={content.link}
                               class="hover-effect"
                               on:click|preventDefault={(event) => handleLinkClick(event, content.link)}
                               on:mouseenter={() => handleMouseEnter(index)}
                               on:mouseleave={handleMouseLeave}>
                                <BitboxxTypography widthPx={48} fontSizePx={80} outlined={true}>
                                    {String(index + 1).padStart(2, '0')}
                                </BitboxxTypography>
                                <BitboxxTypography fontSizePx={80}>&nbsp;</BitboxxTypography>
                                <BitboxxTypography fontSizePx={80}>{content.title}</BitboxxTypography>
                            </a>
                            {#if $hoverState === index}
                                <div class="hover-line"></div>
                            {/if}
                        </div>
                    {/each}
                </div>
            </div>
        </div>
    </div>
</Display>

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
