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
    import Humberger from "./Humberger.svelte";
    import Stardust from "./Stardust.svelte";
    import FadeIn from "$lib/infras/fade/FadeIn.svelte";
    import Cube from "./Cube.svelte";

</script>

<Display>
    <header slot="sm">
        <span class="logo">
            <BitboxxLogo width={168} height={43.88}/>
        </span>
        <Humberger/>
    </header>
</Display>

<FadeIn>
    <slot></slot>
</FadeIn>

<ThreeCube/>
<Stardust/>

<style>
    .logo {
        position: absolute;
        width: 35%;
        left: calc(50% - 35% / 2);
        top: 2.98%;
        bottom: 98.19%;
    }
</style>
