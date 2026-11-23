// State for line puzzles (Parsons puzzles with whole code lines): a pool of lines and one ordered
// list of placed lines. Plain functions that return a new board, so the component stays thin.

export interface LineChip {
	/** Unique per chip on screen; the drag library needs that. */
	id: string;
	text: string;
}

export interface LinesBoard {
	pool: LineChip[];
	placed: LineChip[];
}

let counter = 0;
const chipOf = (text: string): LineChip => ({ id: `l${++counter}`, text });

/**
 * One line of a solution or a red herring: indentation is kept, trailing whitespace is dropped and
 * tabs become four spaces so the code looks the same everywhere.
 */
export function normaliseLine(line: string): string {
	return line.replace(/\t/g, '    ').replace(/\s+$/, '');
}

/**
 * Builds the board from the shuffled pool (solution lines and red herrings together) and the saved
 * answer. Saved lines are matched to unused chips by text, so duplicate lines stay interchangeable.
 */
export function initLines(poolTexts: string[], saved: string[]): LinesBoard {
	const chips = poolTexts.map(chipOf);
	const used = new Set<string>();
	const placed: LineChip[] = [];
	for (const text of saved) {
		const chip = chips.find((c) => !used.has(c.id) && c.text === text);
		if (!chip) continue;
		used.add(chip.id);
		placed.push(chip);
	}
	return { pool: chips.filter((c) => !used.has(c.id)), placed };
}

/** svelte-dnd-action inserts a placeholder while dragging; it is not a real line. */
export const isLineShadow = (c: LineChip) =>
	Boolean((c as LineChip & { isDndShadowItem?: boolean }).isDndShadowItem);

export const realLines = (chips: LineChip[]) => chips.filter((c) => !isLineShadow(c));

/** What is saved: the placed line texts in order. */
export const toLines = (board: LinesBoard): string[] => realLines(board.placed).map((c) => c.text);

/** Appends a pool line to the end of the answer. */
export function addLine(board: LinesBoard, chipId: string): LinesBoard {
	const chip = board.pool.find((c) => c.id === chipId);
	if (!chip) return board;
	return {
		pool: board.pool.filter((c) => c.id !== chipId),
		placed: [...board.placed, chip]
	};
}

/** Takes a placed line back to the pool. */
export function removeLine(board: LinesBoard, chipId: string): LinesBoard {
	const chip = board.placed.find((c) => c.id === chipId);
	if (!chip) return board;
	return {
		pool: [...board.pool, chip],
		placed: board.placed.filter((c) => c.id !== chipId)
	};
}

/** Moves a placed line one step up (-1) or down (+1). */
export function moveLine(board: LinesBoard, chipId: string, delta: -1 | 1): LinesBoard {
	const placed = [...board.placed];
	const from = placed.findIndex((c) => c.id === chipId);
	const to = from + delta;
	if (from < 0 || to < 0 || to >= placed.length) return board;
	[placed[from], placed[to]] = [placed[to]!, placed[from]!];
	return { ...board, placed };
}

/** Replaces a zone after a drop (the drag library hands over the whole new list). */
export const setPool = (board: LinesBoard, chips: LineChip[]): LinesBoard => ({
	...board,
	pool: realLines(chips)
});
export const setPlaced = (board: LinesBoard, chips: LineChip[]): LinesBoard => ({
	...board,
	placed: realLines(chips)
});
