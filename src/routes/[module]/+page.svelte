<script lang="ts">
	import { resolve } from '$app/paths';
	import Badge from '#lib/components/Badge.svelte';
	import Button from '#lib/components/Button.svelte';
	import { progress } from '#lib/progress/store.svelte.js';
	import { moduleSummary } from '#lib/progress/summary.js';

	let { data } = $props();

	const core = $derived(data.units.filter((u) => u.core));
	const extra = $derived(data.units.filter((u) => !u.core));
	const summary = $derived(moduleSummary(data.units, data.groupIds, progress.data));
</script>

<svelte:head>
	<title>{data.module.title} · POS 3EHIF · Learning Site</title>
</svelte:head>

<p class="kicker"><a href={resolve('/')}>{data.chapter.title}</a></p>
<h1>
	{data.module.title}
	{#if data.module.bonus}<Badge tone="primary">Bonus</Badge>{/if}
</h1>
{#if data.module.bonus}
	<p class="hint">Optional – for anyone who wants to go further.</p>
{/if}
{#if data.deck}
	<p class="lead">
		<a href={data.deck}>Official slide deck</a>
	</p>
{/if}

{#if data.units.length === 0}
	<p class="empty">The units for this module are coming soon.</p>
{:else}
	{#if progress.loaded}
		<p class="summary">
			{summary.unitsRead} / {summary.units} units read{summary.groups
				? ` · ${summary.groupsKnown} / ${summary.groups} question groups mastered`
				: ''}
		</p>
	{/if}
	<h2>Units</h2>
	<ol class="units">
		{#each core as u (u.id)}
			<li class:read={progress.isRead(u.id)}>
				<span class="check" aria-label={progress.isRead(u.id) ? 'read' : 'not read yet'}></span>
				<a href={resolve('/[module]/[unit]', { module: data.module.slug, unit: u.slug })}>{u.title}</a>
				<span class="meta">
					{#if u.status === 'draft'}<Badge tone="warn">Draft</Badge>{/if}
					{u.minutes} min
				</span>
			</li>
		{/each}
	</ol>
	{#if extra.length}
		<h2>Going further</h2>
		<p class="hint">Optional – for anyone who wants to go further.</p>
		<ol class="units">
			{#each extra as u (u.id)}
				<li class:read={progress.isRead(u.id)}>
					<span class="check" aria-label={progress.isRead(u.id) ? 'read' : 'not read yet'}></span>
					<a href={resolve('/[module]/[unit]', { module: data.module.slug, unit: u.slug })}>{u.title}</a>
					<span class="meta">
						{#if u.status === 'draft'}<Badge tone="warn">Draft</Badge>{/if}
						{u.minutes} min
					</span>
				</li>
			{/each}
		</ol>
	{/if}
{/if}

{#if data.groupIds.length}
	<div class="practice">
		<Button href={resolve('/practice/[scope]', { scope: data.module.slug })}>Practice this module</Button>
	</div>
{/if}

<style>
	.kicker {
		margin: 0;
		font-size: 14px;
		font-weight: 600;
		color: var(--text-muted);
	}
	h1 {
		margin: 0 0 8px;
		font-size: 32px;
		line-height: 1.2;
	}
	h2 {
		margin: 32px 0 12px;
		font-size: 20px;
	}
	.lead {
		margin: 0 0 24px;
		color: var(--text-muted);
	}
	.summary {
		margin: -16px 0 0;
		color: var(--text-muted);
	}
	.hint,
	.empty {
		color: var(--text-muted);
	}
	.units {
		display: grid;
		gap: 8px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.units li {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 12px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}
	.check {
		flex: none;
		width: 18px;
		height: 18px;
		border: 2px solid var(--border-strong);
		border-radius: 50%;
	}
	.read .check {
		border-color: var(--success);
		background: var(--success);
		box-shadow: inset 0 0 0 3px var(--surface);
	}
	.units a {
		font-weight: 600;
		text-decoration: none;
		color: var(--text);
	}
	.units a:hover {
		color: var(--primary);
	}
	.meta {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-left: auto;
		font-size: 14px;
		color: var(--text-muted);
	}
	.practice {
		margin-top: 24px;
	}
</style>
