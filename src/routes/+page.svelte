<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { fade } from 'svelte/transition';
	import companyInfo from '$lib/data/company_info.json';
	import PrivacyPolicy from '$lib/domains/PrivacyPolicy.svelte';
	import Orrery, { type OrreryItem } from '$lib/components/Orrery.svelte';

	const SITE_URL = 'https://bitboxx.co.jp/';

	const orgJsonLd = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: companyInfo.name,
		url: SITE_URL,
		logo: `${SITE_URL}black.svg`,
		email: 'contact@bitboxx.co.jp',
		foundingDate: companyInfo.established,
		address: {
			'@type': 'PostalAddress',
			postalCode: companyInfo.postcode,
			addressRegion: '東京都',
			addressLocality: '中央区',
			streetAddress: '日本橋箱崎町16-11 ルミネ日本橋601',
			addressCountry: 'JP'
		}
	};
	const jsonLdTag =
		'<scr' + 'ipt type="application/ld+json">' + JSON.stringify(orgJsonLd) + '</scr' + 'ipt>';

	// 太陽系の項目 = 惑星
	const planets: OrreryItem[] = [
		{ id: 'about', label: '私たちのこと', en: 'APPROACH', r: 2.5, phase: 0 },
		{ id: 'business', label: '事業内容', en: 'BUSINESS', r: 3.45, phase: 90 },
		{ id: 'company', label: '会社概要', en: 'COMPANY', r: 4.35, phase: 180 },
		{ id: 'contact', label: 'お問い合わせ', en: 'CONTACT', r: 5.15, phase: 270 }
	];
	type ViewId = (typeof planets)[number]['id'];

	const services = [
		{
			num: '01',
			title: 'プロダクト開発',
			deliverable: '要件整理から設計・実装・リリースまで。Web／モバイル／サーバー／クラウド基盤。',
			value: 'アイデアを、事業として動くプロダクトに変える。'
		},
		{
			num: '02',
			title: '運用・保守・改善',
			deliverable: '日々の運用、障害対応、性能改善、機能追加。開発と同じチームが続けて担当。',
			value: '作ったものを、毎日少しずつ良くしていく。'
		},
		{
			num: '03',
			title: 'UI／UX 設計',
			deliverable: '情報設計、画面設計、デザインシステム、ブランドから落とすビジュアル。',
			value: '使う人に届く形と、伝わる体験。'
		},
		{
			num: '04',
			title: '技術顧問・アドバイザリー',
			deliverable: '技術戦略、体制レビュー、採用・育成、中長期ロードマップ、投資判断。',
			value: '経営判断の場に、技術の目を入れる。'
		}
	];

	const stances = [
		{
			num: '01',
			headline: '「何をつくるか」から、並走する。',
			contrast: '多くの開発会社は仕様の通りにつくる。私たちは、仕様が固まる前から関わる。'
		},
		{
			num: '02',
			headline: '作って終わり、ではない。',
			contrast: '別会社へ引き継ぐとき、よく落ちる文脈がある。私たちは、その引き継ぎ自体が起きない。'
		},
		{
			num: '03',
			headline: 'つくらない、という選択も持つ。',
			contrast: '何でも引き受ける会社は多い。私たちは、価値が出るものだけを残す。'
		}
	];

	const companyFacts: Array<[string, string]> = [
		['会社名', companyInfo.name],
		['所在地', `〒${companyInfo.postcode}  ${companyInfo.address}`],
		['代表者', companyInfo.representative],
		[
			'設立',
			`${companyInfo.established.substring(0, 4)}年${companyInfo.established.substring(5, 7)}月${companyInfo.established.substring(8, 10)}日`
		],
		['事業内容', companyInfo.business]
	];

	const titles: Record<ViewId, { en: string; ja: string }> = {
		about: { en: 'APPROACH', ja: '私たちのこと' },
		business: { en: 'BUSINESS', ja: '事業内容' },
		company: { en: 'COMPANY', ja: '会社概要' },
		contact: { en: 'CONTACT', ja: 'お問い合わせ' }
	};

	// 創業からの経過日数 — この一つの数値が、HUD の数字・系の回転位相・星の数という
	// 三つの違う形で同時に現れる。
	let dayCount = 0;

	// ── アプリ状態 ──
	let mounted = false; // ハイドレーション後に orrery モードへ
	let view: ViewId | null = null;
	let orrery: Orrery;

	onMount(() => {
		mounted = true;
		const founded = new Date(companyInfo.established + 'T00:00:00+09:00').getTime();
		dayCount = Math.max(0, Math.floor((Date.now() - founded) / 86400000));
		const fromHash = (location.hash || '').replace('#', '') as ViewId;
		if (planets.some((p) => p.id === fromHash)) {
			view = fromHash;
			orrery?.focusTo(fromHash);
		}
		const onPop = () => {
			const h = (location.hash || '').replace('#', '') as ViewId;
			if (planets.some((p) => p.id === h)) enter(h, false);
			else back(false);
		};
		window.addEventListener('popstate', onPop);
		return () => window.removeEventListener('popstate', onPop);
	});

	// アプリモードではページは固定。ウィンドウ内だけがスクロールする。
	$: if (typeof document !== 'undefined' && mounted) {
		document.body.style.overflow = 'hidden';
	}

	function onSelect(e: CustomEvent<string>) {
		enter(e.detail as ViewId, true);
	}

	async function enter(id: ViewId, push: boolean) {
		view = id;
		await tick();
		panelScroller?.scrollTo(0, 0);
		if (push) history.pushState({ view: id }, '', `#${id}`);
	}

	function back(push = true) {
		view = null;
		orrery?.leave();
		if (push && location.hash) history.pushState({}, '', location.pathname);
	}

	let panelScroller: HTMLElement;

	// ── お問い合わせフォーム / プライバシーモーダル ──
	let yourname = '';
	let company = '';
	let email = '';
	let text = '';
	let pr = false;
	let showPrivacyModal = false;
	let privacyDialogEl: HTMLDivElement | null = null;
	let privacyCloseBtnEl: HTMLButtonElement | null = null;
	let privacyTriggerEl: HTMLElement | null = null;

	async function openPrivacyModal(event: MouseEvent) {
		event.preventDefault();
		privacyTriggerEl = event.currentTarget as HTMLElement;
		showPrivacyModal = true;
		await tick();
		privacyCloseBtnEl?.focus();
	}
	function closePrivacyModal() {
		showPrivacyModal = false;
		privacyTriggerEl?.focus();
	}

	function onKeydown(e: KeyboardEvent) {
		if (showPrivacyModal) {
			if (e.key === 'Escape') {
				e.preventDefault();
				closePrivacyModal();
			}
			return;
		}
		if (e.key === 'Escape' && view) {
			e.preventDefault();
			back();
		}
	}

	function send() {
		if (isDisabled(pr, yourname, email, text)) return;
		const companyLine = company ? `\n会社名: ${company}` : '';
		const mailto = `mailto:contact@bitboxx.co.jp?subject=ホームページからのお問い合わせ&body=${encodeURIComponent(
			`問い合わせ内容:\n${text}\n\n---\n氏名: ${yourname}${companyLine}\nメールアドレス: ${email}\n---`
		)}`;
		window.location.href = mailto;
	}
	function isDisabled(pr: boolean, yourname: string, email: string, text: string) {
		return !pr || yourname === '' || email === '' || text === '';
	}
</script>

<svelte:head>
	<title>bitboxx | Excellent. Kawaii. Unique.</title>
	<meta
		name="description"
		content="bitboxx (ビットボックス) は、Excellent / Kawaii / Unique の三つのものさしで、事業の核となるプロダクトとシステムを設計・開発する東京のエンジニアリング会社です。"
	/>
	<link rel="canonical" href={SITE_URL} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="bitboxx" />
	<meta property="og:title" content="bitboxx | Excellent. Kawaii. Unique." />
	<meta
		property="og:description"
		content="Excellent / Kawaii / Unique の三つのものさしで、事業の核となるプロダクトとシステムを設計・開発する東京のエンジニアリング会社。"
	/>
	<meta property="og:url" content={SITE_URL} />
	<meta property="og:image" content={`${SITE_URL}og.png`} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:locale" content="ja_JP" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="bitboxx | Excellent. Kawaii. Unique." />
	<meta name="twitter:image" content={`${SITE_URL}og.png`} />
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonLdTag}
</svelte:head>

<svelte:window on:keydown={onKeydown} />

<main class="relative" class:is-app={mounted}>
	<!-- ページ見出し (SEO / スクリーンリーダー) — 視覚は空間表現が担う -->
	<h1 class="sr-only">
		株式会社bitboxx — Excellent / Kawaii / Unique. 東京・日本橋のエンジニアリング会社
	</h1>

	<!-- ── 宇宙 (オアリー) — ハイドレーション後のみ ── -->
	{#if mounted}
		<div
			class="orrery-stage fixed inset-0 z-0"
			class:dimmed={view}
			style="background:radial-gradient(120% 95% at 50% 40%, #f6f5f8 0%, #e9e8ed 52%, #d6d5dc 100%)"
		>
			<Orrery
				bind:this={orrery}
				items={planets}
				foundedISO={companyInfo.established}
				on:select={onSelect}
			/>

			<!-- HUD — 未来テックの計器枠。意味ある数値 (創業からの経過日数) はここに一度だけ。 -->
			<div class="pointer-events-none absolute inset-0 z-20">
				<!-- ビューポートの四隅ブラケット -->
				<span class="hud-corner tl"></span>
				<span class="hud-corner tr"></span>
				<span class="hud-corner bl"></span>
				<span class="hud-corner br"></span>

				<div
					class="font-techno absolute left-6 md:left-9 top-6 md:top-8 text-[9px] leading-[2] tracking-[0.3em] text-ink/55"
				>
					BITBOXX INC.<br />
					NIHONBASHI · TOKYO
				</div>
				<div
					class="font-techno absolute right-6 md:right-9 top-6 md:top-8 text-right text-[9px] leading-[2] tracking-[0.3em] text-ink/55"
				>
					EST. 2024.04.25<br />
					DAY {String(dayCount).padStart(4, '0')}
				</div>
				<div
					class="space-hint font-techno absolute left-1/2 -translate-x-1/2 bottom-7 md:bottom-9 text-center text-[8.5px] tracking-[0.34em] text-ink/40"
				>
					SCROLL · DRAG ORBIT ／ SELECT TO LAND
				</div>
			</div>
		</div>

		<!-- デジタルウィンドウの背面 (宇宙はうっすら透ける) -->
		{#if view}
			<button
				class="tech-backdrop"
				on:click={() => back()}
				aria-label="閉じる"
				transition:fade={{ duration: 260 }}
			></button>
		{/if}
	{/if}

	<!-- ── コンテンツ ──
       ハイドレーション前 (= プリレンダー HTML / JS 無効) は通常のスクロール文書として全節を表示。
       ハイドレーション後は選ばれた節を、テックなデジタルウィンドウとして開く。 -->
	<div class="content-root" class:as-panel={mounted}>
		{#if !mounted || view === 'about'}
			<section id="about" class="doc-section" bind:this={panelScroller}>
				{#if mounted}<div class="panel-head">
						<button class="back-btn" on:click={() => back()}>← 空間へ戻る</button>
						<p class="panel-en">{titles.about.en}</p>
					</div>{/if}
				<div class="panel-inner">
					<h2 class="sec-label">私たちのこと</h2>
					<p
						class="mt-8 md:mt-12 max-w-3xl font-mincho text-[20px] md:text-[28px] leading-[1.9] text-ink tracking-[0.02em]"
					>
						お客様のお手伝いをするときは、<br class="hidden md:block" />
						<span class="underline-handwritten">お客様が本来の事業に集中する時間</span
						>を生み出すことを仕事としています。
					</p>
					<p class="mt-5 md:mt-7 font-mincho text-[14px] md:text-[15px] leading-[2.1] text-ink/60">
						システム開発そのものは、そのための手段です。
					</p>
					<div class="mt-14 md:mt-20">
						{#each stances as s}
							<article
								class="grid md:grid-cols-12 gap-3 md:gap-10 py-9 md:py-12 border-t border-ink/15"
							>
								<p class="md:col-span-2 font-mono text-[11px] tracking-[0.3em] text-ink/50 pt-2">
									{s.num}
								</p>
								<div class="md:col-span-10">
									<h3
										class="font-display italic text-[26px] md:text-[40px] leading-[1.25] tracking-hyper text-ink"
									>
										{s.headline}
									</h3>
									<p
										class="mt-4 md:mt-5 font-mincho text-[13px] md:text-[14px] leading-[2] text-ink/60 border-l-2 border-sakura/60 pl-4 max-w-2xl"
									>
										{s.contrast}
									</p>
								</div>
							</article>
						{/each}
					</div>
				</div>
			</section>
		{/if}

		{#if !mounted || view === 'business'}
			<section id="business" class="doc-section" bind:this={panelScroller}>
				{#if mounted}<div class="panel-head">
						<button class="back-btn" on:click={() => back()}>← 空間へ戻る</button>
						<p class="panel-en">{titles.business.en}</p>
					</div>{/if}
				<div class="panel-inner">
					<div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
						<h2 class="sec-label">事業内容</h2>
						<p class="font-mincho text-[13px] text-ink/50">
							提供するもの<span class="mx-3 text-ink/30">／</span>そこから生まれる価値
						</p>
					</div>
					<div class="mt-8 md:mt-12">
						{#each services as s}
							<article
								class="relative grid md:grid-cols-12 gap-4 md:gap-10 py-10 md:py-12 border-t border-ink/15"
							>
								<div class="md:col-span-2">
									<p class="font-mono text-[11px] tracking-[0.3em] text-ink/50">{s.num}</p>
								</div>
								<div class="md:col-span-5">
									<h3 class="font-mincho text-lg md:text-xl text-ink">{s.title}</h3>
									<p
										class="mt-3 font-mincho text-[14px] md:text-[15px] leading-[2] text-ink/70 max-w-md"
									>
										{s.deliverable}
									</p>
								</div>
								<div class="md:col-span-5 md:pl-6 md:border-l md:border-ink/15">
									<p class="font-display italic text-[18px] md:text-[22px] leading-[1.55] text-ink">
										{s.value}
									</p>
								</div>
							</article>
						{/each}
					</div>
				</div>
			</section>
		{/if}

		{#if !mounted || view === 'company'}
			<section id="company" class="doc-section" bind:this={panelScroller}>
				{#if mounted}<div class="panel-head">
						<button class="back-btn" on:click={() => back()}>← 空間へ戻る</button>
						<p class="panel-en">{titles.company.en}</p>
					</div>{/if}
				<div class="panel-inner">
					<h2 class="sec-label">会社概要</h2>
					<dl class="mt-8 md:mt-12">
						{#each companyFacts as [label, value]}
							<div class="grid grid-cols-12 gap-3 md:gap-10 py-6 md:py-7 border-t border-ink/15">
								<dt class="col-span-12 md:col-span-3 font-mincho text-sm md:text-base text-ink">
									{label}
								</dt>
								<dd
									class="col-span-12 md:col-span-9 font-mincho text-[14px] md:text-[15px] leading-[2] text-ink/85"
								>
									{value}
								</dd>
							</div>
						{/each}
					</dl>
				</div>
			</section>
		{/if}

		{#if !mounted || view === 'contact'}
			<section id="contact" class="doc-section" bind:this={panelScroller}>
				{#if mounted}<div class="panel-head">
						<button class="back-btn" on:click={() => back()}>← 空間へ戻る</button>
						<p class="panel-en">{titles.contact.en}</p>
					</div>{/if}
				<div class="panel-inner">
					<h2 class="sec-label">お問い合わせ</h2>
					<p
						class="mt-6 md:mt-8 max-w-2xl font-mincho text-[15px] md:text-[17px] leading-[2] text-ink/75"
					>
						ご相談・お見積りなど、お気軽にどうぞ。
					</p>
					<div class="mt-12 md:mt-16 grid md:grid-cols-12 gap-14 md:gap-10">
						<form
							on:submit|preventDefault={send}
							class="md:col-span-7 max-w-2xl space-y-10 md:space-y-12"
						>
							<label class="block">
								<span class="block font-mono text-[10px] tracking-[0.3em] text-ink/45 uppercase"
									>Name</span
								>
								<input
									type="text"
									bind:value={yourname}
									class="mt-3 w-full bg-transparent border-0 border-b border-ink/20 focus:border-sakura outline-none py-3 text-base md:text-lg font-mincho text-ink placeholder-ink/30 transition-colors"
									placeholder="山田 太郎"
									autocomplete="name"
								/>
							</label>
							<label class="block">
								<span class="block font-mono text-[10px] tracking-[0.3em] text-ink/45 uppercase">
									Company <span class="text-ink/30 ml-1 normal-case">opt.</span>
								</span>
								<input
									type="text"
									bind:value={company}
									class="mt-3 w-full bg-transparent border-0 border-b border-ink/20 focus:border-sakura outline-none py-3 text-base md:text-lg font-mincho text-ink placeholder-ink/30 transition-colors"
									placeholder="Your Company"
									autocomplete="organization"
								/>
							</label>
							<label class="block">
								<span class="block font-mono text-[10px] tracking-[0.3em] text-ink/45 uppercase"
									>Email</span
								>
								<input
									type="email"
									bind:value={email}
									class="mt-3 w-full bg-transparent border-0 border-b border-ink/20 focus:border-sakura outline-none py-3 text-base md:text-lg font-mincho text-ink placeholder-ink/30 transition-colors"
									placeholder="you@company.com"
									autocomplete="email"
								/>
							</label>
							<label class="block">
								<span class="block font-mono text-[10px] tracking-[0.3em] text-ink/45 uppercase"
									>Message</span
								>
								<textarea
									bind:value={text}
									rows="4"
									class="mt-3 w-full bg-transparent border-0 border-b border-ink/20 focus:border-sakura outline-none py-3 text-base font-mincho text-ink placeholder-ink/30 resize-none transition-colors leading-[1.9]"
									placeholder="ご相談内容をご記入ください"
								></textarea>
							</label>
							<div class="flex flex-col gap-6 pt-2">
								<label class="flex items-center gap-3 text-sm text-ink/75">
									<input type="checkbox" bind:checked={pr} class="w-4 h-4 accent-sakura" />
									<span class="font-mincho">
										<button
											type="button"
											on:click={openPrivacyModal}
											class="underline underline-offset-4 hover:text-sakura"
										>
											プライバシーポリシー
										</button>
										に同意する
									</span>
								</label>
								<button
									type="submit"
									disabled={isDisabled(pr, yourname, email, text)}
									class={`self-start inline-flex items-center gap-3 px-7 py-3.5 rounded-full transition-colors duration-300
                    ${isDisabled(pr, yourname, email, text) ? 'bg-ink/5 text-ink/35 cursor-not-allowed' : 'bg-ink text-cream-50 hover:bg-sakura'}`}
								>
									<span class="font-mincho text-sm">送信する</span>
									<svg
										viewBox="0 0 24 24"
										width="14"
										height="14"
										fill="none"
										stroke="currentColor"
										stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg
									>
								</button>
							</div>
						</form>
						<aside
							class="md:col-span-4 md:col-start-9 md:border-l md:border-ink/15 md:pl-10 space-y-10"
						>
							<div>
								<p class="font-mono text-[10px] tracking-[0.3em] text-ink/45 uppercase">Direct</p>
								<a
									href="mailto:contact@bitboxx.co.jp"
									class="mt-3 inline-block font-mincho text-[15px] md:text-base text-ink hover:text-sakura transition-colors"
								>
									contact@bitboxx.co.jp
								</a>
								<p class="mt-2 font-mincho text-[12px] leading-[1.9] text-ink/55">
									平日 10:00–19:00 (JST)
								</p>
							</div>
							<div>
								<p class="font-mono text-[10px] tracking-[0.3em] text-ink/45 uppercase">Office</p>
								<p class="mt-3 font-mincho text-[13px] leading-[2] text-ink/75">
									〒103-0015<br />
									東京都中央区日本橋箱崎町16-11<br />
									ルミネ日本橋601
								</p>
							</div>
							<div>
								<p class="font-mono text-[10px] tracking-[0.3em] text-ink/45 uppercase">Legal</p>
								<ul class="mt-3 space-y-2 font-mincho text-[13px] text-ink/75">
									<li>
										<a href="/terms_of_service" class="hover:text-sakura transition-colors"
											>利用規約</a
										>
									</li>
									<li>
										<a href="/privacy_policy" class="hover:text-sakura transition-colors"
											>プライバシーポリシー</a
										>
									</li>
								</ul>
							</div>
						</aside>
					</div>
				</div>
			</section>
		{/if}
	</div>

	{#if showPrivacyModal}
		<div
			class="fixed inset-0 bg-ink/80 backdrop-blur-sm flex items-center justify-center z-[1000] px-4"
			on:click={(e) => {
				if (e.target === e.currentTarget) closePrivacyModal();
			}}
			on:keydown
			role="presentation"
		>
			<div
				bind:this={privacyDialogEl}
				class="bg-cream-50 text-ink rounded-3xl shadow-2xl w-full max-w-3xl p-6 md:p-10 max-h-[90vh] flex flex-col"
				role="dialog"
				aria-modal="true"
				aria-labelledby="privacy-modal-title"
			>
				<div class="flex justify-between items-center mb-4 pb-4 border-b border-ink/10">
					<h2 id="privacy-modal-title" class="font-display italic text-2xl tracking-hyper">
						プライバシーポリシー
					</h2>
					<button
						bind:this={privacyCloseBtnEl}
						class="text-ink/60 hover:text-ink text-3xl leading-none"
						on:click={closePrivacyModal}
						aria-label="閉じる">×</button
					>
				</div>
				<div class="overflow-y-auto pr-2 flex-1">
					<PrivacyPolicy showTitle={false} />
				</div>
			</div>
		</div>
	{/if}
</main>

<style>
	/* ── ベースライン (JS 前 / 無効): 通常スクロール文書 ── */
	.doc-section {
		position: relative;
		padding: 6rem 1.5rem;
	}
	@media (min-width: 768px) {
		.doc-section {
			padding: 9rem 2.5rem;
		}
	}
	.panel-inner {
		max-width: 1400px;
		margin: 0 auto;
	}
	.sec-label {
		display: inline-flex;
		align-items: center;
		gap: 0.85rem;
		font-family: 'Michroma', 'Space Grotesk', sans-serif;
		font-size: 10px;
		letter-spacing: 0.34em;
		color: rgba(17, 16, 20, 0.6);
	}
	.sec-label::before {
		content: '';
		width: 34px;
		height: 1px;
		background: linear-gradient(90deg, rgba(255, 38, 48, 0.7), rgba(255, 38, 48, 0));
	}

	/* HUD の四隅ブラケット (未来テックの計器枠) */
	.hud-corner {
		position: absolute;
		width: 22px;
		height: 22px;
		border: 0 solid rgba(17, 16, 20, 0.22);
	}
	.hud-corner.tl {
		left: 18px;
		top: 18px;
		border-left-width: 1px;
		border-top-width: 1px;
	}
	.hud-corner.tr {
		right: 18px;
		top: 18px;
		border-right-width: 1px;
		border-top-width: 1px;
	}
	.hud-corner.bl {
		left: 18px;
		bottom: 18px;
		border-left-width: 1px;
		border-bottom-width: 1px;
	}
	.hud-corner.br {
		right: 18px;
		bottom: 18px;
		border-right-width: 1px;
		border-bottom-width: 1px;
	}

	/* 背面 — 宇宙はうっすら透ける */
	.tech-backdrop {
		position: fixed;
		inset: 0;
		z-index: 20;
		width: 100%;
		height: 100%;
		background: rgba(228, 227, 233, 0.5);
		backdrop-filter: blur(2px);
		cursor: pointer;
	}

	/* ── アプリモード: 選んだ節を「テックなデジタルウィンドウ」として中央に開く ── */
	:global(.is-app) .content-root.as-panel {
		position: fixed;
		inset: 0;
		z-index: 30;
		display: grid;
		place-items: center;
		padding: 4vh 3vw;
		pointer-events: none;
	}
	:global(.is-app) .content-root.as-panel .doc-section {
		position: relative;
		width: min(94vw, 1080px);
		height: min(88vh, 880px);
		overflow-y: auto;
		overflow-x: hidden;
		padding: 0 1.4rem 3rem;
		background: rgba(246, 245, 248, 0.94);
		border: 1px solid rgba(17, 16, 20, 0.14);
		box-shadow: 0 40px 120px -40px rgba(17, 16, 20, 0.45);
		pointer-events: auto;
		transform-origin: center;
		animation: swish-open 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
	}
	@media (min-width: 768px) {
		:global(.is-app) .content-root.as-panel .doc-section {
			padding: 0 3rem 4rem;
		}
	}
	/* 四隅のブラケット (「」のフレーム) */
	:global(.is-app) .content-root.as-panel .doc-section::before {
		content: '';
		position: absolute;
		inset: 9px;
		pointer-events: none;
		z-index: 8;
		--c: rgba(255, 38, 48, 0.85);
		background:
			linear-gradient(var(--c), var(--c)) left top / 16px 1.4px no-repeat,
			linear-gradient(var(--c), var(--c)) left top / 1.4px 16px no-repeat,
			linear-gradient(var(--c), var(--c)) right top / 16px 1.4px no-repeat,
			linear-gradient(var(--c), var(--c)) right top / 1.4px 16px no-repeat,
			linear-gradient(var(--c), var(--c)) left bottom / 16px 1.4px no-repeat,
			linear-gradient(var(--c), var(--c)) left bottom / 1.4px 16px no-repeat,
			linear-gradient(var(--c), var(--c)) right bottom / 16px 1.4px no-repeat,
			linear-gradient(var(--c), var(--c)) right bottom / 1.4px 16px no-repeat;
	}
	@keyframes swish-open {
		0% {
			clip-path: inset(47% 0 47% 0);
			opacity: 0;
			transform: scaleX(0.9);
		}
		60% {
			opacity: 1;
		}
		100% {
			clip-path: inset(0 0 0 0);
			opacity: 1;
			transform: scaleX(1);
		}
	}
	/* ウィンドウのタイトルバー */
	.panel-head {
		position: sticky;
		top: 0;
		z-index: 6;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.95rem 1.4rem;
		margin: 0 -1.4rem 2.4rem;
		background: rgba(238, 237, 241, 0.92);
		backdrop-filter: blur(8px);
		border-bottom: 1px solid rgba(17, 16, 20, 0.12);
	}
	@media (min-width: 768px) {
		.panel-head {
			padding: 1rem 3rem;
			margin: 0 -3rem 3rem;
		}
	}
	.back-btn {
		font-family: 'Michroma', 'Space Grotesk', 'Noto Sans JP', sans-serif;
		font-size: 10px;
		letter-spacing: 0.2em;
		color: rgba(17, 16, 20, 0.72);
		transition: color 0.2s ease;
	}
	.back-btn:hover {
		color: #ff2630;
	}
	.panel-en {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		font-family: 'Michroma', 'Space Grotesk', sans-serif;
		font-size: 10px;
		letter-spacing: 0.34em;
		color: rgba(17, 16, 20, 0.45);
	}
	.panel-en::before {
		content: '◢';
		color: rgba(255, 38, 48, 0.8);
		font-size: 8px;
	}

	.orrery-stage {
		transition:
			filter 0.45s ease,
			opacity 0.45s ease;
	}
	.orrery-stage.dimmed {
		filter: blur(5px) saturate(0.9);
		opacity: 0.28;
		pointer-events: none;
	}
</style>
