<script lang="ts">
	import { resolve } from '$app/paths';
	import Badge from '#lib/components/Badge.svelte';

	let { data } = $props();

	const modules = $derived(data.chapters.flatMap((c) => c.modules));
	const units = $derived(modules.flatMap((m) => m.units));
	const drafts = $derived(units.filter((u) => u.status === 'draft'));
	const withoutQuestions = $derived(units.filter((u) => u.groups === 0));
</script>

<svelte:head>
	<title>Review · POS 3EHIF · Learning Site</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<h1>Review</h1>
<p class="lead">
	All content with its status. This page is not linked anywhere and is meant for the teacher's review.
</p>

<dl class="stats">
	<div><dt>Units</dt><dd>{units.length}</dd></div>
	<div><dt>of which drafts</dt><dd>{drafts.length}</dd></div>
	<div><dt>Fragengruppen</dt><dd>{units.reduce((n, u) => n + u.groups, 0)}</dd></div>
	<div><dt>Units without questions</dt><dd>{withoutQuestions.length}</dd></div>
</dl>

{#snippet status(s: 'draft' | 'reviewed')}
	{#if s === 'draft'}<Badge tone="warn">Draft</Badge>{:else}<Badge tone="primary">Reviewed</Badge>{/if}
{/snippet}

{#each data.chapters as chapter (chapter.slug)}
	<section>
		<h2>{chapter.note}: {chapter.title}</h2>
		{#each chapter.modules as m (m.slug)}
			<h3>
				<a href={resolve('/[module]', { module: m.slug })}>{m.title}</a>
				<span class="count">{m.groups} Fragengruppen</span>
			</h3>
			{#if m.units.length}
				<table>
					<thead>
						<tr><th>Unit</th><th>Status</th><th>Minutes</th><th>Groups</th><th>Questions</th></tr>
					</thead>
					<tbody>
						{#each m.units as u (u.id)}
							<tr>
								<td>
									<a href={resolve('/[module]/[unit]', { module: m.slug, unit: u.slug })}>{u.title}</a>
									{#if !u.core}<span class="tag">Going further</span>{/if}
								</td>
								<td>{@render status(u.status)}</td>
								<td>{u.minutes}</td>
								<td class:zero={u.groups === 0}>{u.groups}</td>
								<td>{u.questions}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{:else}
				<p class="empty">No units yet.</p>
			{/if}
		{/each}
	</section>
{/each}

<style>
	h1 {
		margin: 0 0 8px;
		font-size: 32px;
	}
	.lead {
		margin: 0 0 24px;
		color: var(--text-muted);
	}
	h2 {
		margin: 32px 0 8px;
		font-size: 20px;
	}
	h3 {
		display: flex;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 8px;
		margin: 20px 0 8px;
		font-size: 16px;
	}
	h3 a {
		color: var(--text);
	}
	.count,
	.empty {
		color: var(--text-muted);
		font-size: 14px;
		font-weight: 400;
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 8px;
		margin: 0 0 8px;
	}
	.stats div {
		padding: 12px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}
	.stats dt {
		font-size: 14px;
		color: var(--text-muted);
	}
	.stats dd {
		margin: 0;
		font-size: 24px;
		font-weight: 700;
	}
	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 14px;
	}
	th,
	td {
		padding: 8px 10px;
		border-bottom: 1px solid var(--border);
		text-align: left;
	}
	th {
		color: var(--text-muted);
		font-weight: 600;
	}
	td.zero {
		color: var(--warn);
		font-weight: 700;
	}
	.tag {
		margin-left: 8px;
		padding: 0 6px;
		border-radius: 4px;
		background: var(--primary-soft);
		color: var(--primary);
		font-size: 11px;
		font-weight: 700;
	}
</style>
