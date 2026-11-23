<script lang="ts">
	import Button from '#lib/components/Button.svelte';
	import type { Progress } from '#lib/progress/schema.js';
	import { progress } from '#lib/progress/store.svelte.js';
	import { exportFileName, parseProgress } from '#lib/progress/storage.js';

	let pendingImport = $state<Progress | null>(null);
	let importError = $state('');
	let confirmReset = $state(false);
	let message = $state('');

	const summary = (p: Progress) => ({
		units: Object.keys(p.units).length,
		groups: Object.keys(p.groups).length,
		exercises: Object.keys(p.exercises).length,
		runs: p.runs.length
	});
	const current = $derived(summary(progress.data));

	function exportProgress() {
		const blob = new Blob([progress.exportText()], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = exportFileName(new Date());
		a.click();
		URL.revokeObjectURL(url);
	}

	async function chooseFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		message = '';
		pendingImport = null;
		importError = '';
		if (!file) return;
		const result = parseProgress(await file.text());
		if (result.ok) pendingImport = result.progress;
		else importError = result.error;
	}

	function applyImport() {
		if (!pendingImport) return;
		progress.replace(pendingImport);
		pendingImport = null;
		message = 'Your progress was imported.';
	}

	function reset() {
		progress.reset();
		confirmReset = false;
		message = 'Your progress was deleted.';
	}
</script>

<svelte:head>
	<title>My progress · POS 3EHIF · Learning Site</title>
</svelte:head>

<h1>My progress</h1>
<p class="lead">
	Your progress is only stored in this browser. With an export file you can take it to another
	computer or give it to your teacher.
</p>

{#if progress.loaded && !progress.persistent}
	<p class="note warn">
		Your browser does not let this site store data (e.g. in private mode). Your progress is
		lost when you close the tab – export it first.
	</p>
{/if}

{#if message}
	<p class="note ok" role="status">{message}</p>
{/if}

<section>
	<h2>Status</h2>
	<dl class="stats">
		<div><dt>Units read</dt><dd>{current.units}</dd></div>
		<div><dt>Question groups practised</dt><dd>{current.groups}</dd></div>
		<div><dt>Exercises done</dt><dd>{current.exercises}</dd></div>
		<div><dt>Practice rounds</dt><dd>{current.runs}</dd></div>
	</dl>
</section>

<section>
	<h2>Export</h2>
	<label class="field">
		<span>Name (optional, only for the export file)</span>
		<input
			type="text"
			maxlength="100"
			autocomplete="name"
			value={progress.data.name ?? ''}
			onchange={(e) => {
				const name = e.currentTarget.value.trim();
				progress.data.name = name || undefined;
				progress.save();
			}}
		/>
	</label>
	<Button onclick={exportProgress}>Save progress as a file</Button>
</section>

<section>
	<h2>Import</h2>
	<p>Replaces the progress in this browser with the content of an export file.</p>
	<label class="file">
		<input type="file" accept="application/json,.json" onchange={chooseFile} />
	</label>
	{#if importError}
		<p class="note error" role="alert">{importError}</p>
	{/if}
	{#if pendingImport}
		{@const incoming = summary(pendingImport)}
		<div class="confirm">
			<p>
				The file contains {incoming.units} units read, {incoming.groups} question groups,
				{incoming.exercises} exercises done and
				{incoming.runs} practice rounds{pendingImport.name ? ` from ${pendingImport.name}` : ''}. Your
				current progress in this browser will be overwritten.
			</p>
			<div class="actions">
				<Button onclick={applyImport}>Import</Button>
				<Button variant="secondary" onclick={() => (pendingImport = null)}>Cancel</Button>
			</div>
		</div>
	{/if}
</section>

<section>
	<h2>Reset</h2>
	{#if confirmReset}
		<div class="confirm">
			<p>Really delete everything? This cannot be undone.</p>
			<div class="actions">
				<Button variant="danger" onclick={reset}>Yes, delete</Button>
				<Button variant="secondary" onclick={() => (confirmReset = false)}>Cancel</Button>
			</div>
		</div>
	{:else}
		<Button variant="danger" onclick={() => (confirmReset = true)}>Delete progress</Button>
	{/if}
</section>

<style>
	h1 {
		margin: 0 0 8px;
		font-size: 32px;
		line-height: 1.2;
	}
	.lead {
		margin: 0 0 24px;
		color: var(--text-muted);
	}
	section {
		margin-top: 32px;
	}
	h2 {
		margin: 0 0 12px;
		font-size: 20px;
	}
	section p {
		margin: 0 0 12px;
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 8px;
		margin: 0;
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
	.field {
		display: grid;
		gap: 4px;
		max-width: 360px;
		margin-bottom: 12px;
		font-size: 14px;
		color: var(--text-muted);
	}
	.field input {
		padding: 8px 10px;
		border: 1px solid var(--border-strong);
		border-radius: var(--radius);
		background: var(--surface);
		color: var(--text);
		font-size: 16px;
	}
	.confirm {
		margin-top: 12px;
		padding: 14px 16px;
		background: var(--surface);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-lg);
	}
	.actions {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.note {
		padding: 10px 14px;
		border-radius: var(--radius);
	}
	.warn {
		background: var(--warn-soft);
		color: var(--warn);
	}
	.ok {
		background: var(--success-soft);
		color: var(--success);
	}
	.error {
		margin-top: 12px;
		background: var(--danger-soft);
		color: var(--danger);
	}
</style>
