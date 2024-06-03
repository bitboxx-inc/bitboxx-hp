<script lang="ts">
    import BitboxxLogo from "$lib/domains/BitboxxLogo.svelte";
    import BitboxxTypography from "$lib/infras/BitboxxTypography.svelte";
    import {onMount} from "svelte";
    import Display from "$lib/infras/Display.svelte";

    export let contents: {link: string; title: string}[] = [];

    let isLgSize = false;

    // メディアクエリリスナーを設定する関数
    function updateMediaQuery() {
        const mediaQuery = window.matchMedia('(min-width: 1200px)'); // Tailwind
        isLgSize = mediaQuery.matches;
        // メディアクエリの変化を監視
        mediaQuery.addEventListener('change', (event) => {
            isLgSize = event.matches;
        });
    }

    // コンポーネントのマウント時にメディアクエリリスナーを設定
    onMount(() => {
        updateMediaQuery();
    });
</script>

<Display id={'top'} >
    <div slot="lg">
        <div class="h-dvh flex place-items-center">
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
    </div>
    <div slot="md">
        <div class="h-dvh flex place-items-center">
            <div class="flex-1 flex justify-center">
                <BitboxxLogo/>
            </div>
            <div class="flex-1">
                {#each contents as content, index}
                    <div style="line-height: 0.85">
                        <a href={content.link}>
                            <BitboxxTypography widthPx={48} fontSizePx={80} outlined={true}>
                                {String(index + 1).padStart(2, '0')}
                            </BitboxxTypography>
                            <BitboxxTypography fontSizePx={80}>&nbsp;</BitboxxTypography>
                            <BitboxxTypography fontSizePx={80}>{content.title}</BitboxxTypography>
                        </a>
                    </div>
                {/each}
            </div>
        </div>
    </div>
    <div slot="sm">
        <div class="">
            <BitboxxLogo/>
        </div>
        <div class="h-dvh flex place-items-center justify-center" style="margin-top: -68px;">
            <div>
                {#each contents as content, index}
                    <div style="line-height: 0.85">
                        <a href={content.link}>
                            <BitboxxTypography widthPx={48} fontSizePx={80} outlined={true}>
                                {String(index + 1).padStart(2, '0')}
                            </BitboxxTypography>
                            <BitboxxTypography fontSizePx={80}>&nbsp;</BitboxxTypography>
                            <BitboxxTypography fontSizePx={80}>{content.title}</BitboxxTypography>
                        </a>
                    </div>
                {/each}
            </div>
        </div>
    </div>
</Display>