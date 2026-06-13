<script>
	import { base } from '$app/paths';
	import PrivacyPolicy from '$lib/domains/PrivacyPolicy.svelte';
</script>

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
