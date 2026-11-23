<script lang="ts">
	import type { Snippet } from 'svelte';
	import { asset, resolve } from '$app/paths';
	import Badge from '#lib/components/Badge.svelte';
	import Button from '#lib/components/Button.svelte';
	import { progress } from '#lib/progress/store.svelte.js';

	/** An exercise from practice/<slug>/, written into a unit by `:::exercise <slug>`. The task text is the children. */
	let {
		slug,
		title,
		kind,
		className,
		children
	}: { slug: string; title: string; kind: 'core' | 'bonus'; className: string; children: Snippet } = $props();

	const testClass = $derived(`${className}Test`);
	// The zips are generated into static/exercises/ when the build starts, so asset()'s list of known
	// static files (from svelte-kit sync) may not include them yet.
	const zip = $derived(asset(`/exercises/${slug}.zip` as Parameters<typeof asset>[0]));
	const done = $derived(progress.isDone(slug));
	/** Text of the role="status" region: visible feedback and screen reader announcement in one. */
	let message = $state('');
	let nameEl: HTMLElement;
	let timer: ReturnType<typeof setTimeout> | undefined;
	// VoiceOver skips a message identical to the previous one; a trailing no-break space makes it differ.
	let lastMessage = '';

	function report(text: string) {
		clearTimeout(timer); // repeated clicks restart the feedback instead of stacking timers
		let next = text;
		if (next === lastMessage) next += '\u00A0';
		lastMessage = next;
		message = '';
		requestAnimationFrame(() => (message = next));
		timer = setTimeout(() => (message = ''), 2500);
	}

	async function copy() {
		try {
			await navigator.clipboard.writeText(className);
			report('Copied!');
		} catch {
			// No clipboard access (denied, or not a secure context): select the name so Ctrl+C / ⌘C works.
			const range = document.createRange();
			range.selectNodeContents(nameEl);
			const selection = getSelection();
			selection?.removeAllRanges();
			selection?.addRange(range);
			report('Copy failed – the name is selected, press Ctrl+C / ⌘C');
		}
	}
</script>

<section class="exercise" class:done aria-labelledby="exercise-{slug}">
	<header>
		<span class="label">Exercise</span>
		<h3 id="exercise-{slug}">{title}</h3>
		{#if kind === 'bonus'}<Badge tone="primary">Bonus</Badge>{/if}
	</header>

	<div class="task">
		{@render children()}
	</div>

	<div class="open">
		<code class="name" bind:this={nameEl}>{className}</code>
		<Button variant="secondary" onclick={copy}>Copy class name</Button>
		<span class="status" role="status">{message}</span>
	</div>
	<ol class="steps">
		<li>In IntelliJ press <kbd>Shift</kbd> <kbd>Shift</kbd>, paste and press <kbd>Enter</kbd>. The task is at the top of the class.</li>
		<li>Run <code>{testClass}</code> with the green ▶. All tests green means you are done.</li>
	</ol>

	<footer>
		<label class="check">
			<input type="checkbox" checked={done} onchange={(e) => progress.setDone(slug, e.currentTarget.checked)} />
			Done
		</label>
		<span class="links">
			Not set up yet? <a href={resolve('/course-info')}>Clone the exercises</a> ·
			<a href={zip} download>Download as zip</a>
		</span>
	</footer>
</section>

<style>
	.exercise {
		margin: 28px 0;
		padding: 18px 20px;
		border: 1px solid var(--border);
		border-left: 4px solid var(--primary);
		border-radius: var(--radius-lg);
		background: var(--surface);
	}
	.exercise.done {
		border-left-color: var(--success);
	}
	header {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 4px 10px;
	}
	.label {
		width: 100%;
		font-size: 12px;
		font-weight: 700;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--primary);
	}
	h3 {
		margin: 0;
	}
	.task {
		margin: 10px 0 16px;
	}
	.task > :global(:first-child) {
		margin-top: 0;
	}
	.task > :global(:last-child) {
		margin-bottom: 0;
	}
	.open {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
	}
	.name {
		padding: 6px 10px;
		border-radius: var(--radius);
		background: var(--surface-alt);
		font: 600 14px var(--font-mono);
		user-select: all;
	}
	.status {
		font-size: 14px;
		color: var(--text-muted);
	}
	.steps {
		margin: 12px 0 0;
		padding-left: 20px;
		font-size: 14px;
		color: var(--text-muted);
	}
	.steps li + li {
		margin-top: 4px;
	}
	footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 8px 16px;
		margin-top: 14px;
		padding-top: 12px;
		border-top: 1px solid var(--border);
		font-size: 14px;
	}
	.check {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-weight: 600;
		cursor: pointer;
	}
	.check input {
		width: 18px;
		height: 18px;
		accent-color: var(--success);
	}
	.links {
		color: var(--text-muted);
	}
</style>
