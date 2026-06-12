<script lang="ts">
	import { tick } from 'svelte';
	import companyInfo from '$lib/data/company_info.json';
	import PrivacyPolicy from '$lib/domains/PrivacyPolicy.svelte';
	import Suminagashi, { type InkKind } from '$lib/components/Suminagashi.svelte';
	import Reveal from '$lib/components/Reveal.svelte';

	// 本番ドメイン (GitHub Pages + カスタムドメイン)
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

	// "<script" をソースに直書きすると Svelte / vitePreprocess のスクリプト抽出を
	// 誤爆させるため、文字列連結でタグを組み立てる。
	const jsonLdTag =
		'<scr' + 'ipt type="application/ld+json">' + JSON.stringify(orgJsonLd) + '</scr' + 'ipt>';

	// ── ヒーロー: EKU ホバーで真下に墨が落ちる ──
	let ink: Suminagashi;
	let heroEl: HTMLElement;
	function dropUnderWord(e: MouseEvent, kind: InkKind, strength = 1) {
		if (!ink || !heroEl) return;
		const word = (e.currentTarget as HTMLElement).getBoundingClientRect();
		const hero = heroEl.getBoundingClientRect();
		const x = (word.left + word.width / 2 - hero.left) / hero.width;
		const y = (word.top + word.height / 2 - hero.top) / hero.height;
		ink.drop(Math.min(0.95, Math.max(0.05, x)), Math.min(0.95, Math.max(0.05, y)), kind, strength);
	}

	// 主な事業内容 — what we do × どんな価値が生まれるか
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

	// 姿勢 — 三つの言い切り (「選ばれる理由」の凝縮)
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

	// モーダル表示中は背景スクロールを止め、Esc で閉じ、Tab をダイアログ内に閉じ込める。
	$: if (typeof document !== 'undefined') {
		document.body.style.overflow = showPrivacyModal ? 'hidden' : '';
	}

	function onPrivacyKeydown(e: KeyboardEvent) {
		if (!showPrivacyModal) return;
		if (e.key === 'Escape') {
			e.preventDefault();
			closePrivacyModal();
			return;
		}
		if (e.key === 'Tab' && privacyDialogEl) {
			const focusables = privacyDialogEl.querySelectorAll<HTMLElement>(
				'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])'
			);
			if (focusables.length === 0) return;
			const first = focusables[0];
			const last = focusables[focusables.length - 1];
			const active = document.activeElement as HTMLElement | null;
			if (e.shiftKey && (active === first || !active || !privacyDialogEl.contains(active))) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && active === last) {
				e.preventDefault();
				first.focus();
			}
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
	<!-- 静的な会社情報の JSON.stringify のみを埋め込む (ユーザー入力は含まない) -->
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html jsonLdTag}
</svelte:head>

<svelte:window on:keydown={onPrivacyKeydown} />

<main class="relative">
	<!-- HERO — 墨流し一枚。流体シミュレーションの上に最小限のタイポだけを置く。 -->
	<section
		bind:this={heroEl}
		class="relative h-screen h-[100svh] overflow-hidden touch-pan-y"
		aria-label="bitboxx — Excellent. Kawaii. Unique."
	>
		<Suminagashi bind:this={ink} />

		<!-- EKU — 左上。3 流儀のアクセントは不変。ホバーで真下に墨が落ちる。 -->
		<div
			class="absolute left-5 md:left-10 top-[16svh] md:top-[19svh] z-10 pointer-events-none select-none"
		>
			<h1 class="font-display leading-[0.86] tracking-hyper ink-guard">
				<span class="hero-clip text-[15.5vw] md:text-[11vw] lg:text-[9.2rem] italic">
					<span class="hero-rise" style="--d: 60ms">
						<span
							class="underline-handwritten draw-in pointer-events-auto"
							on:mouseenter={(e) => dropUnderWord(e, 'water', 1.2)}
							role="presentation">Excellent.</span
						>
					</span>
				</span>
				<span
					class="hero-clip text-[15.5vw] md:text-[11vw] lg:text-[9.2rem] pl-[7vw] md:pl-[10vw] italic"
				>
					<span class="hero-rise" style="--d: 170ms">
						<span
							class="text-sakura pointer-events-auto"
							on:mouseenter={(e) => dropUnderWord(e, 'water', 1.2)}
							role="presentation">Kawaii.</span
						>
					</span>
				</span>
				<span
					class="hero-clip text-[15.5vw] md:text-[11vw] lg:text-[9.2rem] pl-[2.5vw] md:pl-[3.5vw]"
				>
					<span class="hero-rise" style="--d: 280ms">
						<span
							class="pointer-events-auto"
							on:mouseenter={(e) => dropUnderWord(e, 'water', 1.0)}
							role="presentation">Unique<span class="text-sakura">.</span></span
						>
					</span>
				</span>
			</h1>
		</div>

		<!-- 右 — 一文。 -->
		<div
			class="hero-fade ink-guard absolute right-5 md:right-10 top-[58svh] md:top-[44svh] z-10 max-w-[19rem] md:max-w-xs text-right md:text-left pointer-events-none select-none"
			style="--d: 900ms"
		>
			<p class="font-mincho text-[19px] md:text-[24px] leading-[1.7] tracking-[0.05em] text-ink">
				まだ見ぬ<span class="relative inline-block">
					<span class="relative z-10">最高</span>
					<span
						class="absolute inset-x-0 bottom-[0.1em] h-[0.26em] bg-sakura/60 -z-0"
						aria-hidden="true"
					></span>
				</span>を、<br />確かな品質で。
			</p>
			<p
				class="mt-4 md:mt-5 font-mincho text-[11.5px] md:text-[12.5px] leading-[2.1] text-ink/60 tracking-[0.04em]"
			>
				唯一無二のアイデアを卓越した技術で実現し、<br
					class="hidden md:block"
				/>愛着あるプロダクトとして世界に届ける。
			</p>
		</div>

		<!-- 最下部 — 事業のストリップ (端から端へ) と、切れた TOKYO。 -->
		<div
			class="hero-fade absolute inset-x-0 bottom-0 z-10 pointer-events-none select-none"
			style="--d: 1150ms"
		>
			<div
				class="ink-guard hidden md:flex justify-between px-10 pb-[11.5vw] font-mono text-[11px] tracking-[0.22em] text-ink/65"
			>
				<span>システム・プロダクト開発</span>
				<span>UI／UX 設計</span>
				<span>運用・保守・改善</span>
				<span>技術顧問</span>
			</div>
			<p
				class="ink-guard absolute bottom-0 right-0 translate-y-[0.24em] pr-2 md:pr-6 font-display font-extrabold leading-none tracking-hyper text-ink text-[24vw] md:text-[15.5vw] whitespace-nowrap"
				aria-hidden="true"
			>
				TOKYO
			</p>
		</div>

		<!-- 左下 — 次の一歩カード (お問い合わせへ)。 -->
		<a
			href="#contact-form"
			class="hero-fade group absolute left-5 md:left-10 bottom-6 md:bottom-9 z-20 flex items-center gap-4 rounded-2xl bg-ink text-cream-50 pl-4 pr-5 py-3.5 md:py-4 shadow-[0_18px_50px_-22px_rgba(17,16,20,0.55)] hover:bg-sakura transition-colors duration-300"
			style="--d: 1300ms"
		>
			<span class="grid place-items-center w-9 h-9 rounded-xl bg-cream-50/10">
				<svg
					viewBox="0 0 24 24"
					width="15"
					height="15"
					fill="none"
					stroke="currentColor"
					stroke-width="1.6"
				>
					<rect x="3.2" y="5.4" width="17.6" height="13.2" rx="2.2" />
					<path d="M3.8 6.4 12 12.6l8.2-6.2" />
				</svg>
			</span>
			<span>
				<span class="block font-mono text-[9.5px] tracking-[0.3em] text-cream-50/65">CONTACT</span>
				<span class="block mt-0.5 font-mincho text-[13px]">プロジェクトを相談する</span>
			</span>
			<svg
				class="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg
			>
		</a>
	</section>

	<!-- 姿勢 — 前提と、三つの言い切り。 -->
	<section id="about" class="relative py-24 md:py-36 scroll-mt-20 paper-grain">
		<div class="max-w-[1400px] mx-auto px-6 md:px-10">
			<Reveal>
				<h2 class="font-mono text-[11px] tracking-[0.3em] text-ink/50">前提</h2>
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
			</Reveal>

			<div class="mt-16 md:mt-24">
				{#each stances as s}
					<Reveal>
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
					</Reveal>
				{/each}
			</div>
		</div>
	</section>

	<!-- 事業内容 -->
	<section id="business" class="relative py-24 md:py-36 scroll-mt-20 paper-grain bg-cream-100/50">
		<div class="max-w-[1400px] mx-auto px-6 md:px-10">
			<Reveal>
				<div class="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
					<h2 class="font-mono text-[11px] tracking-[0.3em] text-ink/50">事業内容</h2>
					<p class="font-mincho text-[13px] text-ink/50">
						提供するもの<span class="mx-3 text-ink/30">／</span>そこから生まれる価値
					</p>
				</div>
			</Reveal>

			<div class="mt-8 md:mt-12">
				{#each services as s}
					<Reveal>
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
					</Reveal>
				{/each}
			</div>
		</div>
	</section>

	<!-- 会社概要 -->
	<section id="company" class="relative py-24 md:py-36 scroll-mt-20 paper-grain">
		<div class="max-w-[1400px] mx-auto px-6 md:px-10">
			<Reveal>
				<h2 class="font-mono text-[11px] tracking-[0.3em] text-ink/50">会社概要</h2>
			</Reveal>
			<Reveal>
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
			</Reveal>
		</div>
	</section>

	<!-- お問い合わせ -->
	<section
		id="contact-form"
		class="relative py-24 md:py-36 scroll-mt-20 paper-grain bg-cream-100/50"
	>
		<div class="max-w-[1400px] mx-auto px-6 md:px-10">
			<Reveal>
				<h2 class="font-mono text-[11px] tracking-[0.3em] text-ink/50">お問い合わせ</h2>
				<p
					class="mt-6 md:mt-8 max-w-2xl font-mincho text-[15px] md:text-[17px] leading-[2] text-ink/75"
				>
					ご相談・お見積りなど、お気軽にどうぞ。
				</p>
			</Reveal>

			<Reveal>
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
                ${
									isDisabled(pr, yourname, email, text)
										? 'bg-ink/5 text-ink/35 cursor-not-allowed'
										: 'bg-ink text-cream-50 hover:bg-sakura'
								}`}
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

					<!-- 右カラム — フォームを使わない人のための直接連絡先 -->
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
					</aside>
				</div>
			</Reveal>
		</div>
	</section>

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
