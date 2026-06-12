<script lang="ts">
	import '../app.css';
	import { base } from '$app/paths';
	import Cursor from '$lib/components/Cursor.svelte';
	import Clock from '$lib/components/Clock.svelte';

	// ナビはホームのセクションへのアンカーのみ。規約ページからも `/#id` で戻れる。
	const navItems: Array<{ id: string; label: string }> = [
		{ id: 'about', label: '私たちのこと' },
		{ id: 'business', label: '事業内容' },
		{ id: 'company', label: '会社概要' }
	];

	let scrollY = 0;
	$: scrolled = scrollY > 24;
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

<svelte:window bind:scrollY />

<div class="relative min-h-screen bg-cream-50 text-ink font-sans flex flex-col overflow-x-clip">
	<Cursor />

	<header class="fixed top-0 left-0 w-full z-[80]">
		<div
			class={`transition-colors duration-300 ${scrolled ? 'bg-cream-50/85 backdrop-blur-md border-b border-ink/10' : ''}`}
		>
			<div class="max-w-[1500px] mx-auto h-16 md:h-[4.5rem] px-5 md:px-10 flex items-center gap-6">
				<a href="{base}/" class="shrink-0 flex items-center" aria-label="bitboxx — トップへ">
					<img src="{base}/black.svg" alt="bitboxx" class="h-5 md:h-[1.35rem] w-auto" />
				</a>

				<!-- 所在のメタデータ — ロゴの右に小さく (時刻と設立年) -->
				<div
					class="hidden lg:block pl-2 font-mono text-[9.5px] leading-[1.6] tracking-[0.18em] text-ink/55"
				>
					<Clock klass="text-[9.5px] text-ink/55" /><br />
					NIHONBASHI, EST. 2024
				</div>

				<nav
					class="hidden md:flex items-center gap-8 ml-auto font-mincho text-[13.5px] text-ink/80"
				>
					{#each navItems as item (item.id)}
						<a href="{base}/#{item.id}" class="hover:text-ink transition-colors">{item.label}</a>
					{/each}
				</nav>

				<a
					href="{base}/#contact-form"
					class="btn-ink ml-auto md:ml-0 inline-flex items-center gap-2.5 pl-5 pr-4 py-2.5 rounded-full text-[13px] font-mincho transition-colors duration-300"
				>
					相談する
					<svg
						class="w-3.5 h-3.5"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg
					>
				</a>
			</div>
		</div>
	</header>

	<main class="flex-1">
		<slot />
	</main>

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
</div>
