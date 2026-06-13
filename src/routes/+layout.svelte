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
		href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,400;0,800;1,400;1,800&family=Space+Grotesk:wght@400;500&family=Noto+Serif+JP:wght@300;400&family=JetBrains+Mono:wght@400;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="relative min-h-screen bg-cream-50 text-ink font-sans flex flex-col overflow-x-clip">
	<Cursor />

	{#if !isHome}
		<header
			class="fixed top-0 left-0 w-full z-[80] bg-cream-50/85 backdrop-blur-md border-b border-ink/10"
		>
			<div class="max-w-[1500px] mx-auto h-16 px-5 md:px-10 flex items-center">
				<a href="{base}/" class="flex items-center gap-3" aria-label="bitboxx — 空間へ戻る">
					<img src="{base}/black.svg" alt="bitboxx" class="h-5 w-auto" />
					<span class="font-mincho text-[12px] text-ink/55">← 空間へ戻る</span>
				</a>
			</div>
		</header>
	{/if}

	<main class="flex-1">
		<slot />
	</main>

	{#if !isHome}
		<footer class="relative pt-16 md:pt-20 pb-10">
			<div class="relative max-w-[1400px] mx-auto px-6 md:px-10">
				<div class="flex flex-col md:flex-row md:items-end md:justify-between gap-10">
					<div>
						<img src="{base}/black.svg" alt="bitboxx" class="h-5 w-auto" />
						<p class="mt-5 font-mincho text-[12.5px] leading-[2] text-ink/65">
							〒103-0015 東京都中央区日本橋箱崎町16-11 ルミネ日本橋601
						</p>
					</div>
					<ul class="flex flex-wrap gap-x-8 gap-y-2 font-mincho text-[12.5px] text-ink/70">
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
						<li>
							<a href="mailto:contact@bitboxx.co.jp" class="hover:text-sakura transition-colors"
								>contact@bitboxx.co.jp</a
							>
						</li>
					</ul>
				</div>
				<div
					class="mt-10 pt-5 border-t border-ink/10 flex flex-col md:flex-row md:items-center md:justify-between gap-1.5"
				>
					<p class="font-mincho text-[12px] text-ink/55">株式会社bitboxx</p>
					<p class="font-mono text-[11px] tracking-[0.12em] text-ink/45">
						© {new Date().getFullYear()} bitboxx Inc.
					</p>
				</div>
			</div>
		</footer>
	{/if}
</div>
