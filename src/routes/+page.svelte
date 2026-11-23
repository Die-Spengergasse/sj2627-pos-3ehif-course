<script lang="ts">
	import { resolve } from '$app/paths';
	import Badge from '#lib/components/Badge.svelte';
	import Button from '#lib/components/Button.svelte';
	import { progress } from '#lib/progress/store.svelte.js';
	import { moduleSummary, nextUnit } from '#lib/progress/summary.js';

	let { data } = $props();

	const modules = $derived(data.chapters.flatMap((c) => c.modules));
	const next = $derived(nextUnit(modules, progress.data));
	const started = $derived(Object.keys(progress.data.units).length > 0);
</script>

<svelte:head>
	<title>POS 3EHIF · Learning Site</title>
</svelte:head>

<h1>POS 3EHIF · Learning Site</h1>
<p class="lead">
	Short units, knowledge checks, practice questions and small exercises for POS, matching the
	slides from class. <a href={resolve('/how-it-works')}>How this site works</a>
</p>

<!-- Progress is only known in the browser; until then the entry points stay neutral. -->
<div class="start">
	{#if progress.loaded && next}
		<div class="next">
			<span class="label">{started ? 'Continue learning' : 'Start here'}</span>
			<a href={resolve('/[module]/[unit]', { module: next.module.slug, unit: next.unit.slug })}>
				{next.unit.title}
			</a>
			<span class="meta">{next.module.title}</span>
		</div>
	{:else if progress.loaded && started}
		<div class="next">
			<span class="label">All read</span>
			<span>You have read every unit. Revise with practice mode.</span>
		</div>
	{/if}
	<Button variant={progress.loaded && next ? 'secondary' : 'primary'} href={resolve('/practice')}>Practice</Button>
</div>

<h2>Chapters</h2>
{#each data.chapters as chapter (chapter.slug)}
	<section class="chapter" aria-labelledby="chapter-{chapter.slug}">
		<div class="chapter-head">
			<span class="note">{chapter.note}</span>
			<h3 id="chapter-{chapter.slug}">{chapter.title}</h3>
			{#if chapter.modules.some((m) => m.groupIds.length)}
				<a class="practice" href={resolve('/practice/[scope]', { scope: chapter.slug })}>Practice chapter</a>
			{/if}
		</div>
		<ol class="modules">
			{#each chapter.modules as m (m.slug)}
				{@const s = moduleSummary(m.units, m.groupIds, progress.data)}
				<li>
					<div class="head">
						<a href={resolve('/[module]', { module: m.slug })}>{m.title}</a>
						{#if m.bonus}<Badge tone="primary">Bonus</Badge>{/if}
					</div>
					{#if s.units === 0}
						<p class="meta">Units coming soon.</p>
					{:else}
						<div
							class="bar"
							role="progressbar"
							aria-label="Units read in {m.title}"
							aria-valuemin={0}
							aria-valuemax={s.units}
							aria-valuenow={s.unitsRead}
						>
							<span style:width="{(100 * s.unitsRead) / s.units}%"></span>
						</div>
						<p class="meta">
							{s.unitsRead} / {s.units} units read{s.groups
								? ` · ${s.groupsKnown} / ${s.groups} question groups mastered`
								: ''}
						</p>
					{/if}
				</li>
			{/each}
		</ol>
	</section>
{/each}

<style>
	h1 {
		margin: 0 0 8px;
		font-size: 32px;
		line-height: 1.2;
	}
	h2 {
		margin: 36px 0 12px;
		font-size: 20px;
	}
	h3 {
		margin: 0;
		font-size: 18px;
	}
	.lead {
		margin: 0 0 24px;
		color: var(--text-muted);
	}
	.start {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px 16px;
	}
	.next {
		display: flex;
		flex: 1;
		flex-direction: column;
		min-width: 240px;
		padding: 14px 16px;
		border: 1px solid var(--primary);
		border-radius: var(--radius-lg);
		background: var(--primary-soft);
	}
	.label {
		font-size: 13px;
		font-weight: 600;
		color: var(--primary-dark);
	}
	.next a {
		font-size: 18px;
		font-weight: 600;
		color: var(--text);
		text-decoration: none;
	}
	.next a:hover {
		color: var(--primary);
	}
	.chapter {
		margin-bottom: 28px;
	}
	.chapter-head {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 8px 12px;
		margin-bottom: 10px;
	}
	.note {
		padding: 0 8px;
		border-radius: 4px;
		background: var(--primary-soft);
		color: var(--primary-dark);
		font-size: 11px;
		font-weight: 700;
		line-height: 20px;
	}
	.practice {
		margin-left: auto;
		font-size: 14px;
		font-weight: 600;
	}
	.modules {
		display: grid;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
		counter-reset: module;
	}
	.modules li {
		padding: 14px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		counter-increment: module;
	}
	.head {
		display: flex;
		align-items: baseline;
		gap: 12px;
	}
	.head::before {
		content: counter(module) '.';
		font: 600 14px var(--font-mono);
		color: var(--text-muted);
	}
	.head a {
		font-weight: 600;
		color: var(--text);
		text-decoration: none;
	}
	.head a:hover {
		color: var(--primary);
	}
	.meta {
		margin: 0;
		font-size: 14px;
		color: var(--text-muted);
	}
	.bar {
		height: 6px;
		margin: 10px 0 6px;
		border-radius: 999px;
		background: var(--surface-alt);
		overflow: hidden;
	}
	.bar span {
		display: block;
		height: 100%;
		background: var(--success);
	}
</style>
