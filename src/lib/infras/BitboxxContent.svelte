<script lang="ts">
    export let id;
</script>

<div id={id} class="relative h-screen flex items-center justify-center">
    <slot/>
</div>