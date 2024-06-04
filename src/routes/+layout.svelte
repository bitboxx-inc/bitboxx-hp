<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=League+Gothic&family=Noto+Serif+JP&display=swap" rel="stylesheet">
</svelte:head>

<script lang="ts">
    import "../app.css";
    import ThreeCube from "./ThreeCube.svelte";
    export const prerender = true;
</script>

<slot></slot>

<ThreeCube/>
