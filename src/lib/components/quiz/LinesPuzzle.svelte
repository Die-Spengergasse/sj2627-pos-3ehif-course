<script lang="ts">
	import { untrack } from 'svelte';
	import { dndzone, setKeyboardDragTrigger } from 'svelte-dnd-action';
	import { shuffled } from '#lib/quiz/shuffle.js';
	import {
		addLine,
		initLines,
		moveLine,
		removeLine,
		setPlaced,
		setPool,
		toLines,
		type LineChip,
		type LinesBoard
	} from '#lib/puzzle/lines.js';

	interface Props {
		/** Solution lines, including indentation. */
		lines: string[];
		redHerrings: string[];
		/** The saved answer: placed line texts in order. */
		placed: string[];
		/** Locked after answering: nothing can be moved any more. */
		disabled?: boolean;
		onchange: (lines: string[]) => void;
	}
	let { lines, redHerrings, placed, disabled = false, onchange }: Props = $props();

	const FLIP_MS = 120;

	// Space picks a line up for keyboard dragging; Enter is free to move it between the lists.
	setKeyboardDragTrigger('space');

	let board = $state<LinesBoard>(untrack(() => initLines(shuffled([...lines, ...redHerrings]), placed)));

	function commit(next: LinesBoard) {
		if (disabled) return;
		board = next;
		onchange(toLines(next));
	}

	const considerPool = (e: CustomEvent<{ items: LineChip[] }>) => (board = { ...board, pool: e.detail.items });
	const finalizePool = (e: CustomEvent<{ items: LineChip[] }>) => commit(setPool(board, e.detail.items));
	const considerPlaced = (e: CustomEvent<{ items: LineChip[] }>) => (board = { ...board, placed: e.detail.items });
	const finalizePlaced = (e: CustomEvent<{ items: LineChip[] }>) => commit(setPlaced(board, e.detail.items));

	function onPoolKey(e: KeyboardEvent, chip: LineChip) {
		if (e.key !== 'Enter') return;
		e.preventDefault();
		commit(addLine(board, chip.id));
	}

	function onPlacedKey(e: KeyboardEvent, chip: LineChip) {
		if (e.key === 'Enter') {
			e.preventDefault();
			commit(removeLine(board, chip.id));
		} else if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
			e.preventDefault();
			commit(moveLine(board, chip.id, e.key === 'ArrowDown' ? 1 : -1));
		}
	}

	const zone = (items: LineChip[]) => ({
		items,
		flipDurationMs: FLIP_MS,
		type: 'line',
		delayTouchStart: true,
		dragDisabled: disabled,
		dropTargetClasses: ['over'],
		dropTargetStyle: {}
	});
</script>

<p class="sr">
	Put the lines of code in the right order. Tap a line in the pool to append it below; tap a
	line below to put it back. Or drag the lines. With the keyboard: focus a line, Enter moves it,
	Space picks it up, the arrow keys move it, and Alt with arrow up or down changes the order.
</p>

<div class="layout" class:disabled>
	<section class="box" aria-labelledby="pool-title">
		<header>
			<h2 id="pool-title">Lines of code</h2>
			<span>Tap a line to append it</span>
		</header>
		<div
			class="pool"
			aria-label="Lines of code"
			data-testid="line-pool"
			use:dndzone={zone(board.pool)}
			onconsider={considerPool}
			onfinalize={finalizePool}
		>
			{#each board.pool as chip (chip.id)}
				<span
					role="button"
					tabindex="0"
					class="line"
					aria-label="{chip.text}, tap to append"
					onclick={() => commit(addLine(board, chip.id))}
					onkeydown={(e) => onPoolKey(e, chip)}
				><span class="text">{chip.text}</span></span
				>
			{:else}
				<p class="none">All lines are placed.</p>
			{/each}
		</div>
	</section>

	<section class="box" aria-labelledby="placed-title">
		<header>
			<h2 id="placed-title">Your solution</h2>
			<span>{board.placed.length} line{board.placed.length === 1 ? '' : 's'}</span>
		</header>
		<div
			class="placed"
			aria-label="Your solution"
			data-testid="line-placed"
			use:dndzone={zone(board.placed)}
			onconsider={considerPlaced}
			onfinalize={finalizePlaced}
		>
			{#each board.placed as chip, i (chip.id)}
				<span
					role="button"
					tabindex="0"
					class="line placed-line"
					aria-label="Line {i + 1}: {chip.text}, tap to put back"
					onclick={() => commit(removeLine(board, chip.id))}
					onkeydown={(e) => onPlacedKey(e, chip)}
				>
					<span class="num" aria-hidden="true">{i + 1}</span>
					<span class="text">{chip.text}</span>
				</span>
			{:else}
				<p class="none">No line placed yet.</p>
			{/each}
		</div>
	</section>
</div>

<style>
	.sr {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}
	.layout {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.layout.disabled .line {
		cursor: default;
	}
	.box {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 16px;
		border: 1px solid var(--border);
		border-radius: 14px;
		background: var(--surface);
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		flex-wrap: wrap;
		gap: 4px;
	}
	h2 {
		margin: 0;
		font-size: 15px;
		font-weight: 600;
	}
	header span {
		color: var(--text-muted);
		font-size: 12px;
	}
	.pool,
	.placed {
		display: flex;
		flex-direction: column;
		gap: 6px;
		min-height: 56px;
		padding: 2px;
		border-radius: 10px;
	}
	.line {
		display: flex;
		align-items: baseline;
		gap: 10px;
		padding: 4px 10px;
		border: 1px solid var(--border-strong);
		border-radius: 8px;
		background: var(--surface);
		font: 13px/1.6 var(--font-mono);
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
		-webkit-touch-callout: none;
	}
	.line:focus-visible {
		outline: 2px solid var(--primary);
	}
	.placed-line {
		border-color: var(--primary);
		background: var(--primary-soft);
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
	.pool :global(.over),
	.placed:global(.over),
	.placed :global(.over) {
		outline: 2px dashed var(--primary);
		outline-offset: 2px;
	}
	.none {
		margin: 0;
		padding: 8px 10px;
		color: var(--text-muted);
		font: italic 13px var(--font-sans);
	}
	@media (max-width: 700px) {
		.box {
			padding: 12px;
		}
		.line {
			min-height: 40px;
			font-size: 12px;
		}
	}
</style>
