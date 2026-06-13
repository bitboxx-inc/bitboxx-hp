<script lang="ts">
	import '../app.css';
	import { base } from '$app/paths';
	import { page } from '$app/stores';
	import Cursor from '$lib/components/Cursor.svelte';

	// ホーム (= 宇宙) はそれ自身で全画面。ヘッダー/フッターは規約ページだけに出す。
	$: isHome =
		$page.url.pathname === `${base}/` || $page.url.pathname === '/' || $page.url.pathname === base;
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<!-- 使用ウェイトのみ読み込む: Fraunces 400/800 (roman+italic), Space Grotesk 400/500,
         Noto Serif JP 300/400, JetBrains Mono 400/700。和文サンセリフはシステムフォールバック。 -->
	<link
		href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,800;1,400;1,800&family=Space+Grotesk:wght@400;500&family=Noto+Serif+JP:wght@300;400&family=JetBrains+Mono:wght@400;700&family=Michroma&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div
	class="relative min-h-screen bg-cream-50 text-ink font-sans flex flex-col overflow-x-clip"
	class:app-cursor={isHome}
>
	<!-- カスタムカーソルは宇宙 (ホーム) のみ。規約等の資料はネイティブカーソルで素直に。 -->
	{#if isHome}
		<Cursor />
	{/if}

	<main class="flex-1">
		<slot />
	</main>

	{#if !isHome}
		<!-- 規約ページのフッターは最小限 — もう一方の規約への導線と著作権だけ。
		     会社情報は本文 (事業者情報) に記載済みなので重複させない。 -->
		<footer class="relative mt-16 border-t border-ink/10 py-8">
			<div
				class="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3"
			>
				<ul class="flex gap-6 font-mincho text-[12px] text-ink/60">
					<li>
						<a href="{base}/terms_of_service" class="hover:text-sakura transition-colors"
							>利用規約</a
						>
					</li>
					<li>
						<a href="{base}/privacy_policy" class="hover:text-sakura transition-colors"
							>プライバシーポリシー</a
						>
					</li>
				</ul>
				<p class="font-mono text-[11px] tracking-[0.12em] text-ink/45">
					© {new Date().getFullYear()} bitboxx Inc.
				</p>
			</div>
		</footer>
	{/if}
</div>
