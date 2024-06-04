<script lang="ts">
    import {onMount} from "svelte";

    export let id = '';

    let isLgSize = false;
    let isMdSize = false;
    let isSmSize = false;

    // メディアクエリリスナーを設定する関数
    function updateMediaQueries() {
        const lgMediaQuery = window.matchMedia('(min-width: 1400px)'); // Tailwind lg: 1200px
        const mdMediaQuery = window.matchMedia('(min-width: 768px)'); // Tailwind md: 768px
        const smMediaQuery = window.matchMedia('(min-width: 640px)'); // Tailwind sm: 640px

        isLgSize = lgMediaQuery.matches;
        isMdSize = mdMediaQuery.matches && !lgMediaQuery.matches;
        isSmSize = smMediaQuery.matches && !mdMediaQuery.matches && !lgMediaQuery.matches;

        // メディアクエリの変化を監視
        lgMediaQuery.addEventListener('change', (event) => {
            isLgSize = event.matches;
            isMdSize = mdMediaQuery.matches && !event.matches;
            isSmSize = smMediaQuery.matches && !mdMediaQuery.matches && !event.matches;
        });

        mdMediaQuery.addEventListener('change', (event) => {
            if (!lgMediaQuery.matches) {
                isMdSize = event.matches;
                isSmSize = smMediaQuery.matches && !event.matches;
            }
        });

        smMediaQuery.addEventListener('change', (event) => {
            if (!mdMediaQuery.matches && !lgMediaQuery.matches) {
                isSmSize = event.matches;
            }
        });
    }

    // コンポーネントのマウント時にメディアクエリリスナーを設定
    onMount(() => {
        updateMediaQueries();
    });
</script>

<span id={id}>
    {#if isLgSize}
        <slot name="lg"/>
    {:else if isMdSize}
        <slot name="md"/>
    {:else}
        <slot name="sm"/>
    {/if}
</span>
