<script lang="ts">
	// Tables, callouts and diagrams use the same styles as the units.
	import '#lib/styles/prose.css';

	let { children } = $props();
</script>

<article class="prose">
	{@render children()}
</article>
