<script>
	import { base } from '$app/paths';
	import PrivacyPolicy from '$lib/domains/PrivacyPolicy.svelte';
	import { SITE_NAME, abs } from '$lib/site';

	const title = `プライバシーポリシー｜${SITE_NAME}`;
	const description = `${SITE_NAME}のプライバシーポリシー。お客様からお預かりする個人情報の取り扱い方針を定めています。`;
	const url = abs('privacy_policy');
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="robots" content="index,follow" />
	<link rel="canonical" href={url} />
	<meta property="og:type" content="article" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:locale" content="ja_JP" />
</svelte:head>

<div class="max-w-4xl mx-auto px-6 py-12 md:py-20">
	<a
		href="{base}/"
		class="font-mincho text-[13px] text-ink/65 hover:text-sakura transition-colors inline-flex items-center gap-2"
	>
		← トップへ戻る
	</a>
	<div class="mt-10 md:mt-14">
		<PrivacyPolicy />
	</div>
</div>
