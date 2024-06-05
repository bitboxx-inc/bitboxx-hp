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
    import { writable } from 'svelte/store';

    export const prerender = true;

    const isMenuOpen = writable(false);

    function toggleMenu() {
        console.log(1)
        isMenuOpen.update(n => !n);
    }

    function closeMenu() {
        isMenuOpen.set(false);
    }
</script>

<Display>
    <header slot="sm">
        <span class="logo">
            <BitboxxLogo width={168} height={43.88}/>
        </span>
        <button class="fixed burger" on:click={toggleMenu} aria-label="Toggle menu">
            <img src="/humberger.svg" alt="Menu">
        </button>
    </header>
</Display>

{#if $isMenuOpen}
    <div class="overlay" role="button" tabindex="0" on:click={closeMenu} on:keydown={(e) => e.key === 'Enter' && closeMenu()} aria-label="Close menu overlay"></div>
    <div class="menu">
        <ul>
            <li><a href="/#about-us" on:click={closeMenu}>ABOUT US</a></li>
            <li><a href="/#service" on:click={closeMenu}>SERVICE</a></li>
            <li><a href="/#works" on:click={closeMenu}>WORKS</a></li>
            <li><a href="/#company" on:click={closeMenu}>COMPANY</a></li>
            <li><a href="/#contact" on:click={closeMenu}>CONTACT</a></li>
        </ul>
    </div>
{/if}

<slot></slot>

<ThreeCube/>

<style>
    .logo {
        position: absolute;
        width: 35%;
        left: calc(50% - 35% / 2);
        top: 2.98%;
        bottom: 98.19%;
    }

    .burger {
        position: fixed;
        width: 32px;
        height: 28px;
        right: calc(15% - 32px);
        top: 3.5%;
        z-index: 1000;
        background: none;
        border: none;
        cursor: pointer;
    }

    .overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        z-index: 999;
    }

    .menu {
        position: fixed;
        top: 0;
        right: 0;
        width: 200px;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .menu ul {
        list-style: none;
        padding: 0;
        margin: 0;
        text-align: center;
    }

    .menu ul li {
        margin: 10px 0;
    }

    .menu ul li a {
        color: white;
        text-decoration: none;
        font-size: 18px;
    }

    .menu ul li a:hover {
        text-decoration: underline;
    }
</style>
