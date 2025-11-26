<svelte:head>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=League+Gothic&family=Noto+Serif+JP&display=swap"
          rel="stylesheet">
</svelte:head>

<script lang="ts">
  import "../app.css";
  import {base} from "$app/paths";
  import { quintOut } from 'svelte/easing';
  import { fade, slide } from 'svelte/transition';

  // ハンバーガーメニューの開閉状態を管理するリアクティブ変数
  let isMenuOpen = false;

  // メニューを開閉するトグル関数
  function toggleMenu() {
    isMenuOpen = !isMenuOpen;
  }

  // リンクがクリックされたときにメニューを閉じる関数
  function closeMenu() {
    isMenuOpen = false;
  }
</script>


<div class="min-h-screen bg-white text-gray-900 flex flex-col font-sans">

    <header class="sticky top-0 left-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
        <div class="max-w-7xl mx-auto h-20 px-6 flex items-center justify-between">

            <a href="{base}/" class="flex items-center">
                <img src="{base}/black.svg" alt="bitboxx logo" class="h-8"/>
            </a>

            <nav class="hidden md:flex items-center space-x-10 text-base font-medium text-gray-700">
                <a href="#philosophy" class="hover:text-gray-900 transition">私たちの哲学</a>
                <a href="#business" class="hover:text-gray-900 transition">事業内容</a>
                <a href="#company" class="hover:text-gray-900 transition">会社概要</a>
                <a href="#contact-form" class="hover:text-gray-900 transition">お問い合わせ</a>
            </nav>

            <a href="#contact-form" class="hidden md:inline-flex px-5 py-2 text-sm font-medium border border-gray-300 rounded-full hover:bg-gray-50 transition">
                お問い合わせ
            </a>

            <button class="md:hidden text-2xl text-gray-700 z-50" on:click={toggleMenu}>
                {#if isMenuOpen}
                    ✕
                {:else}
                    ☰
                {/if}
            </button>
        </div>
    </header>

    {#if isMenuOpen}
        <div
                transition:fade={{ duration: 150 }}
                class="fixed inset-0 bg-white **z-[999]** md:hidden flex flex-col pt-24 px-6"
                on:click={closeMenu}
        >
            <nav
                    transition:slide={{ duration: 250, easing: quintOut }}
                    class="flex flex-col space-y-8 text-2xl font-bold text-gray-800"
                    on:click|stopPropagation
            >
                <a href="#philosophy" class="hover:text-gray-900 transition" on:click={closeMenu}>私たちの哲学</a>
                <a href="#business" class="hover:text-gray-900 transition" on:click={closeMenu}>事業内容</a>
                <a href="#company" class="hover:text-gray-900 transition" on:click={closeMenu}>会社概要</a>

                <div class="pt-8 border-t border-gray-100">
                    <a href="#contact-form" class="text-xl font-medium text-white bg-gray-900 hover:bg-gray-700 transition px-6 py-3 rounded-full inline-block w-full text-center" on:click={closeMenu}>
                        お問い合わせ
                    </a>
                </div>
            </nav>
        </div>
    {/if}

    <main class="flex-1">
        <slot/>
    </main>

    <footer class="border-t border-gray-100 bg-white py-14">
        <div class="max-w-7xl mx-auto px-6 text-sm text-gray-500 flex flex-col md:flex-row justify-between gap-6">

            <div class="space-y-3">
                <span class="font-bold text-lg text-gray-900">bitboxx</span>
                <p>© 2025 bitboxx Inc.</p>
            </div>

            <div class="flex flex-col md:flex-row md:space-x-8 space-y-2 md:space-y-0">
                <a href="/terms_of_service" class="hover:text-gray-700 transition">利用規約</a>
                <a href="/privacy_policy" class="hover:text-gray-700 transition">プライバシーポリシー</a>
            </div>
        </div>
    </footer>

</div>

<style>
</style>