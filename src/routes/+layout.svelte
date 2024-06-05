<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=League+Gothic&family=Noto+Serif+JP&display=swap"
          rel="stylesheet">
</svelte:head>

<script lang="ts">
    import "../app.css";
    import ThreeCube from "./ThreeCube.svelte";
    import Display from "$lib/infras/Display.svelte";
    import BitboxxLogo from "$lib/domains/BitboxxLogo.svelte";

    export const prerender = true;
</script>


<Display>
    <header slot="sm">
        <span class="logo">
            <BitboxxLogo width={168} height={43.88}/>
        </span>
        <span class="fixed burger">
            <img src="/humberger.svg">
        </span>
    </header>
</Display>

<slot></slot>

<ThreeCube/>

<style>
    .logo {
        /* logo */
        position: absolute;
        width: 35%;
        left: calc(50% - 35% / 2);
        top: 2.98%;
        bottom: 98.19%;
    }

    .burger {
        /* burger */
        position: fixed;
        width: 32px;
        height: 28px;
        right: calc(15% - 32px);
        top: 3.5%;
    }
</style>