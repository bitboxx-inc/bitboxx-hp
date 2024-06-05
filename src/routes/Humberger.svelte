<script lang="ts">
    import { writable } from 'svelte/store';
    import { onMount } from 'svelte';
    import Top from "$lib/domains/contents/Top.svelte";

    export const isMenuOpen = writable(false);

    let contents = [
        {
            title: 'ABOUT US',
            link: '/#about-us'
        },
        {
            title: 'SERVICE',
            link: '/#service'
        },
        {
            title: 'WORKS',
            link: '/#works'
        },
        {
            title: 'COMPANY',
            link: '/#company'
        },
        {
            title: 'CONTACT',
            link: '/#contact'
        }
    ];

    function toggleMenu() {
        isMenuOpen.update(n => !n);
    }

    function closeMenu() {
        isMenuOpen.set(false);
    }
</script>

<button class="fixed burger" on:click={toggleMenu} aria-label="Toggle menu">
    <img src="/humberger.svg" alt="Menu">
</button>

{#if $isMenuOpen}
    <div class="overlay" role="button" tabindex="0" on:click={closeMenu} on:keydown={(e) => e.key === 'Enter' && closeMenu()} aria-label="Close menu overlay"></div>
    <div class="menu" on:click={closeMenu}>
        <Top contents={contents}></Top>
    </div>
{/if}

<style>
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
        transition: opacity 0.3s ease;
    }

    .menu {
        position: fixed;
        top: 0;
        right: 0;
        width: 100vw;
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
