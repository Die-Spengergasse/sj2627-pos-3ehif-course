<script lang="ts">
	import { resolve } from '$app/paths';
	import Button from '#lib/components/Button.svelte';
	import { progress } from '#lib/progress/store.svelte.js';
	import { currentRunSchema } from '#lib/quiz/run.js';
	import { ALL, scopeTitle } from '#lib/quiz/scopes.js';

	let { data } = $props();

	const running = $derived(currentRunSchema.safeParse(progress.data.currentRun).data);
	const recent = $derived(progress.data.runs.slice(-5).reverse());

	function stats(ids: string[]) {
		let fresh = 0;
		let repeat = 0;
		let known = 0;
		for (const id of ids) {
			const box = progress.data.groups[id]?.box ?? 0;
			if (box === 0) fresh++;
			else if (box === 1) repeat++;
			else known++;
		}
		return { fresh, repeat, known };
	}

	const all = $derived(stats(data.allIds));

	const date = (iso: string) =>
		new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
</script>

<svelte:head>
	<title>Practice · POS 3EHIF · Learning Site</title>
</svelte:head>

<h1>Practice</h1>
<div class="rules">
	<p>
		A round has up to <strong>10 question groups</strong>. Each group has one main question and up to
		two follow-up questions on the same topic.
	</p>
	<ul>
		<li>Follow-up questions only count if the main question is right.</li>
		<li>You get the results at the end of the round. You only score 100 % if everything is right.</li>
		<li>Groups with a mistake come back first in the next round.</li>
	</ul>
</div>

{#if running}
	<div class="resume">
		<p>You started a round in <strong>{scopeTitle(running.scope)}</strong>.</p>
		<Button href={resolve('/practice/[scope]', { scope: running.scope })}>Continue round</Button>
	</div>
{/if}

<h2>All modules</h2>
<ul class="scopes">
	<li class="all">
		<div class="info">
			<span class="title">Mixed from all chapters</span>
			{#if data.allIds.length}
				<span class="meta">
					{data.allIds.length} question groups · {all.fresh} new · {all.repeat} to repeat · {all.known} mastered
				</span>
			{:else}
				<span class="meta">No questions yet</span>
			{/if}
		</div>
		{#if data.allIds.length}
			<Button href={resolve('/practice/[scope]', { scope: ALL })}>Practice</Button>
		{/if}
	</li>
</ul>

{#each data.chapters as chapter (chapter.slug)}
	{@const c = stats(chapter.groupIds)}
	<h2>
		{chapter.title}
		{#if chapter.groupIds.length}
			<a class="chapter-practice" href={resolve('/practice/[scope]', { scope: chapter.slug })}>Practice whole chapter</a>
		{/if}
	</h2>
	<p class="chapter-meta">
		{chapter.note}{' · '}{#if chapter.groupIds.length}
			{chapter.groupIds.length} question groups · {c.fresh} new · {c.repeat} to repeat · {c.known} mastered
		{:else}
			no questions yet
		{/if}
	</p>
	<ul class="scopes">
		{#each chapter.modules as m (m.slug)}
			{@const s = stats(m.groupIds)}
			<li>
				<div class="info">
					<span class="title">{m.title}</span>
					{#if m.groupIds.length}
						<span class="meta">
							{m.groupIds.length} question groups · {s.fresh} new · {s.repeat} to repeat · {s.known} mastered
						</span>
					{:else}
						<span class="meta">No questions yet</span>
					{/if}
				</div>
				{#if m.groupIds.length}
					<Button variant="secondary" href={resolve('/practice/[scope]', { scope: m.slug })}>Practice</Button>
				{/if}
			</li>
		{/each}
	</ul>
{/each}

{#if recent.length}
	<h2>Recent rounds</h2>
	<ul class="runs">
		{#each recent as r (r.at)}
			<li>
				<span>{date(r.at)} · {scopeTitle(r.scope)}</span>
				<span class="score">{r.correct} / {r.total}</span>
			</li>
		{/each}
	</ul>
{/if}

<style>
	h1 {
		margin: 0 0 16px;
		font-size: 32px;
		line-height: 1.2;
	}
	h2 {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 4px 12px;
		margin: 32px 0 4px;
		font-size: 20px;
	}
	.chapter-practice {
		margin-left: auto;
		font-size: 14px;
		font-weight: 600;
	}
	.chapter-meta {
		margin: 0 0 10px;
		font-size: 14px;
		color: var(--text-muted);
	}
	.rules p {
		margin: 0 0 8px;
	}
	.rules ul {
		margin: 0;
		padding-left: 20px;
		color: var(--text-muted);
	}
	.resume {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-top: 24px;
		padding: 14px 16px;
		border: 1px solid var(--primary);
		border-radius: var(--radius-lg);
		background: var(--primary-soft);
	}
	.resume p {
		margin: 0;
	}
	.scopes,
	.runs {
		display: grid;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.scopes li {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}
	.scopes li.all {
		border-color: var(--primary);
	}
	.info {
		display: flex;
		flex-direction: column;
		flex: 1;
		min-width: 0;
	}
	.title {
		font-weight: 600;
	}
	.meta {
		font-size: 14px;
		color: var(--text-muted);
	}
	.runs li {
		display: flex;
		justify-content: space-between;
		gap: 12px;
		padding: 8px 0;
		border-bottom: 1px solid var(--border);
		font-size: 15px;
	}
	.score {
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}
</style>
