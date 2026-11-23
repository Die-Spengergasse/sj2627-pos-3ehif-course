<script lang="ts">
	import type { LineReview } from '#lib/quiz/answer.js';

	let { review }: { review: LineReview } = $props();
</script>

<div class="code" role="group" aria-label="Your answer">
	{#each review.placed as row, i}
		<div class="row" class:ok={row.correct} class:bad={!row.correct}>
			<span class="num" aria-hidden="true">{i + 1}</span>
			<span class="text">{row.text}</span>
			<span class="sr">{row.correct ? 'right' : 'wrong'}</span>
			<b aria-hidden="true">{row.correct ? '✓' : '✕'}</b>
		</div>
	{:else}
		<p class="none">No line placed.</p>
	{/each}
</div>

{#if !review.complete}
	<div class="expected">
		<p class="label">This is the solution:</p>
		{#each review.solution as line, i}
			<div class="row want">
				<span class="num" aria-hidden="true">{i + 1}</span>
				<span class="text">{line}</span>
			</div>
		{/each}
	</div>
{/if}

{#if review.redHerrings.length}
	<p class="herrings">
		Distractors (not part of the solution): {#each review.redHerrings as h, i}<code>{h}</code>{i <
			review.redHerrings.length - 1
				? ', '
				: ''}{/each}
	</p>
{/if}

<style>
	.sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.code,
	.expected {
		display: flex;
		flex-direction: column;
		gap: 2px;
		padding: 12px 16px;
		border: 1px solid var(--border);
		border-radius: 12px;
		background: var(--surface);
		font: 14px/1.8 var(--font-mono);
	}
	.expected {
		margin-top: 10px;
		border-style: dashed;
	}
	.label {
		margin: 0 0 4px;
		color: var(--text-muted);
		font: 600 12px var(--font-sans);
	}
	.row {
		display: flex;
		align-items: baseline;
		gap: 10px;
		padding: 1px 6px;
		border-radius: 6px;
	}
	.row.ok {
		background: var(--success-soft);
	}
	.row.bad {
		background: var(--danger-soft);
	}
	.row.want {
		color: var(--text-muted);
	}
	.num {
		flex: none;
		min-width: 1.8em;
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
		text-align: right;
	}
	.text {
		flex: 1;
		min-width: 0;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		tab-size: 4;
	}
	.ok b {
		color: var(--success);
	}
	.bad b {
		color: var(--danger);
	}
	.none {
		margin: 0;
		color: var(--text-muted);
		font: italic 13px var(--font-sans);
	}
	.herrings {
		margin: 10px 0 0;
		color: var(--text-muted);
		font-size: 13px;
	}
	.herrings code {
		font: 13px var(--font-mono);
	}
	@media (max-width: 700px) {
		.code,
		.expected {
			padding: 10px 12px;
			font-size: 13px;
		}
	}
</style>
