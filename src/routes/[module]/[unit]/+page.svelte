<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Badge from '#lib/components/Badge.svelte';
	import Button from '#lib/components/Button.svelte';
	import CheckGroup from '#lib/components/quiz/CheckGroup.svelte';
	import { deckUrl } from '#lib/content/modules.js';
	import { reportIssueUrl } from '#lib/content/links.js';
	import { progress } from '#lib/progress/store.svelte.js';
	import '#lib/styles/prose.css';

	let { data } = $props();
	const Unit = $derived(data.component);
	const read = $derived(progress.isRead(data.unit.id));
</script>

<svelte:head>
	<title>{data.unit.title} · {data.module.title} · POS 3EHIF · Learning Site</title>
</svelte:head>

<nav class="crumbs" aria-label="Breadcrumb">
	<a href={resolve('/[module]', { module: data.module.slug })}>{data.module.title}</a>
</nav>

<header class="unit-head">
	<h1>{data.unit.title}</h1>
	<div class="meta">
		<span>{data.unit.minutes} min</span>
		{#if !data.unit.core}<Badge tone="primary">Going further</Badge>{/if}
		{#if data.unit.status === 'draft'}<Badge tone="warn">Draft</Badge>{/if}
		{#if data.module.bonus}<Badge tone="primary">Bonus</Badge>{/if}
		{#if data.module.deck}
			<a href={deckUrl(data.module.deck)} target="_blank" rel="noopener">Slides for this lesson</a>
		{/if}
	</div>
</header>

<article class="prose">
	<Unit />
</article>

{#if data.checks.length}
	<section class="checks" aria-labelledby="checks-title">
		<h2 id="checks-title">Knowledge check</h2>
		<p class="hint">Check whether you got the key points. Your answers here are not saved.</p>
		{#each data.checks as group, i (group.id)}
			<CheckGroup {group} number={i + 1} />
		{/each}
	</section>
{/if}

<footer class="unit-foot">
	<div class="read" class:done={read}>
		{#if read}
			<p>You marked this unit as read.</p>
			<Button variant="ghost" onclick={() => progress.setRead(data.unit.id, false)}>Undo</Button>
		{:else}
			<Button onclick={() => progress.setRead(data.unit.id, true)}>Mark as read</Button>
		{/if}
	</div>
	<nav class="pager" aria-label="Units">
		{#if data.prev}
			<a class="prev" href={resolve('/[module]/[unit]', { module: data.module.slug, unit: data.prev.slug })}>
				<span>Previous</span>{data.prev.title}
			</a>
		{/if}
		{#if data.next}
			<a class="next" href={resolve('/[module]/[unit]', { module: data.module.slug, unit: data.next.slug })}>
				<span>Next</span>{data.next.title}
			</a>
		{/if}
	</nav>
	<a class="report" href={reportIssueUrl('unit', data.unit.title, page.url.href)} target="_blank" rel="noopener">
		Report a mistake
	</a>
</footer>

<style>
	.crumbs {
		font-size: 14px;
	}
	.crumbs a {
		color: var(--text-muted);
		text-decoration: none;
	}
	.crumbs a:hover {
		color: var(--primary);
	}
	.unit-head {
		margin: 4px 0 32px;
	}
	h1 {
		margin: 0 0 8px;
		font-size: 32px;
		line-height: 1.2;
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 12px;
		font-size: 14px;
		color: var(--text-muted);
	}
	.checks {
		display: flex;
		flex-direction: column;
		gap: 16px;
		margin-top: 48px;
	}
	.checks h2 {
		margin: 0;
		font-size: 24px;
	}
	.checks .hint {
		margin: 0;
		color: var(--text-muted);
	}
	.unit-foot {
		margin-top: 48px;
		padding-top: 24px;
		border-top: 1px solid var(--border);
	}
	.read {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px 16px;
		margin-bottom: 24px;
	}
	.read p {
		margin: 0;
		font-weight: 600;
		color: var(--success);
	}
	.read p::before {
		content: '✓ ';
	}
	.pager {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
	}
	.pager a {
		display: flex;
		flex-direction: column;
		padding: 12px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		color: var(--text);
		font-weight: 600;
		text-decoration: none;
	}
	.pager a:hover {
		border-color: var(--primary);
	}
	.pager span {
		font-size: 13px;
		font-weight: 400;
		color: var(--text-muted);
	}
	.next {
		grid-column: 2;
		text-align: right;
	}
	.report {
		display: inline-block;
		margin-top: 24px;
		font-size: 14px;
		color: var(--text-muted);
	}
	@media (max-width: 600px) {
		.pager {
			grid-template-columns: 1fr;
		}
		.next {
			grid-column: 1;
		}
	}
</style>
