<script lang="ts">
	import { onMount } from 'svelte';

	export let klass = '';

	let now = '';

	onMount(() => {
		const fmt = new Intl.DateTimeFormat('ja-JP', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false,
			timeZone: 'Asia/Tokyo'
		});
		const tick = () => {
			now = fmt.format(new Date());
		};
		tick();
		const id = setInterval(tick, 1000);
		return () => clearInterval(id);
	});
</script>

{#if now}
	<span class={`font-mono tabular-nums tracking-[0.18em] ${klass}`} aria-hidden="true">
		TOKYO&nbsp;{now}
	</span>
{/if}
