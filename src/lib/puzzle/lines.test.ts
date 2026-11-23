import { describe, expect, it } from 'vitest';
import {
	addLine,
	initLines,
	isLineShadow,
	moveLine,
	normaliseLine,
	realLines,
	removeLine,
	setPlaced,
	setPool,
	toLines,
	type LinesBoard
} from './lines.ts';

const texts = (chips: { text: string }[]) => chips.map((c) => c.text);

describe('normaliseLine', () => {
	it('turns tabs into four spaces', () => {
		expect(normaliseLine('\tint x;')).toBe('    int x;');
		expect(normaliseLine('a\tb')).toBe('a    b');
	});
	it('drops trailing whitespace but keeps indentation', () => {
		expect(normaliseLine('    return x;  \t ')).toBe('    return x;');
		expect(normaliseLine('        }')).toBe('        }');
	});
	it('turns a blank line into an empty string', () => {
		expect(normaliseLine('  \t ')).toBe('');
	});
});

describe('initLines', () => {
	it('puts everything in the pool without a saved answer', () => {
		const b = initLines(['a', 'b', 'c'], []);
		expect(texts(b.pool)).toEqual(['a', 'b', 'c']);
		expect(b.placed).toEqual([]);
	});

	it('restores the saved order and keeps the rest in the pool', () => {
		const b = initLines(['a', 'b', 'c', 'd'], ['c', 'a']);
		expect(texts(b.placed)).toEqual(['c', 'a']);
		expect(texts(b.pool)).toEqual(['b', 'd']);
	});

	it('gives every chip a unique id, also for identical lines', () => {
		const b = initLines(['}', '}', 'x'], []);
		const ids = b.pool.map((c) => c.id);
		expect(new Set(ids).size).toBe(3);
		const again = initLines(['}', '}', 'x'], []);
		expect(ids.some((id) => again.pool.some((c) => c.id === id))).toBe(false);
	});

	it('matches duplicate lines one chip at a time', () => {
		const b = initLines(['}', 'x', '}'], ['}']);
		expect(texts(b.placed)).toEqual(['}']);
		expect(texts(b.pool)).toEqual(['x', '}']);
		const both = initLines(['}', 'x', '}'], ['}', '}']);
		expect(texts(both.placed)).toEqual(['}', '}']);
		expect(both.placed[0]!.id).not.toBe(both.placed[1]!.id);
		expect(texts(both.pool)).toEqual(['x']);
	});

	it('ignores saved lines that are gone and saved duplicates beyond the pool', () => {
		const b = initLines(['a', 'b'], ['gone', 'a', 'a', 'b']);
		expect(texts(b.placed)).toEqual(['a', 'b']);
		expect(b.pool).toEqual([]);
	});

	it('compares saved lines exactly, including indentation', () => {
		const b = initLines(['    x'], ['x']);
		expect(b.placed).toEqual([]);
		expect(texts(b.pool)).toEqual(['    x']);
	});
});

describe('addLine', () => {
	const board = () => initLines(['a', 'b', 'c'], ['c']);

	it('appends a pool line to the end', () => {
		const b = board();
		const next = addLine(b, b.pool[0]!.id);
		expect(texts(next.placed)).toEqual(['c', 'a']);
		expect(texts(next.pool)).toEqual(['b']);
	});

	it('returns the same board for an unknown id or a placed chip', () => {
		const b = board();
		expect(addLine(b, 'nope')).toBe(b);
		expect(addLine(b, b.placed[0]!.id)).toBe(b);
	});

	it('does not change the input board', () => {
		const b = board();
		const before = structuredClone(b);
		const next = addLine(b, b.pool[0]!.id);
		expect(next).not.toBe(b);
		expect(b).toEqual(before);
	});
});

describe('removeLine', () => {
	const board = () => initLines(['a', 'b', 'c'], ['a', 'b']);

	it('moves a placed line back to the end of the pool', () => {
		const b = board();
		const next = removeLine(b, b.placed[0]!.id);
		expect(texts(next.placed)).toEqual(['b']);
		expect(texts(next.pool)).toEqual(['c', 'a']);
	});

	it('returns the same board for an unknown id or a pool chip', () => {
		const b = board();
		expect(removeLine(b, 'nope')).toBe(b);
		expect(removeLine(b, b.pool[0]!.id)).toBe(b);
	});

	it('does not change the input board', () => {
		const b = board();
		const before = structuredClone(b);
		removeLine(b, b.placed[1]!.id);
		expect(b).toEqual(before);
	});
});

describe('moveLine', () => {
	const board = () => initLines(['a', 'b', 'c'], ['a', 'b', 'c']);

	it('moves a line down and up', () => {
		const b = board();
		const down = moveLine(b, b.placed[0]!.id, 1);
		expect(texts(down.placed)).toEqual(['b', 'a', 'c']);
		const up = moveLine(down, down.placed[2]!.id, -1);
		expect(texts(up.placed)).toEqual(['b', 'c', 'a']);
	});

	it('does nothing at the edges', () => {
		const b = board();
		expect(moveLine(b, b.placed[0]!.id, -1)).toBe(b);
		expect(moveLine(b, b.placed[2]!.id, 1)).toBe(b);
	});

	it('does nothing for an unknown id or a pool chip', () => {
		const b = initLines(['a', 'b', 'c'], ['a', 'b']);
		expect(moveLine(b, 'nope', 1)).toBe(b);
		expect(moveLine(b, b.pool[0]!.id, -1)).toBe(b);
	});

	it('works with a single placed line', () => {
		const b = initLines(['a', 'b'], ['a']);
		expect(moveLine(b, b.placed[0]!.id, 1)).toBe(b);
		expect(moveLine(b, b.placed[0]!.id, -1)).toBe(b);
	});

	it('does not change the input board', () => {
		const b = board();
		const before = structuredClone(b);
		const next = moveLine(b, b.placed[0]!.id, 1);
		expect(next).not.toBe(b);
		expect(b).toEqual(before);
	});
});

describe('drag helpers', () => {
	it('drops the drag placeholder from saved lines', () => {
		const b = initLines(['a', 'b'], ['a', 'b']);
		const shadow = { ...b.placed[1]!, isDndShadowItem: true };
		expect(isLineShadow(shadow)).toBe(true);
		expect(isLineShadow(b.placed[0]!)).toBe(false);
		expect(realLines([b.placed[0]!, shadow])).toEqual([b.placed[0]]);
		expect(toLines({ pool: [], placed: [b.placed[0]!, shadow] })).toEqual(['a']);
	});

	it('replaces one zone and keeps the other', () => {
		const b: LinesBoard = initLines(['a', 'b', 'c'], ['a']);
		const shadow = { ...b.pool[0]!, isDndShadowItem: true };
		const withPlaced = setPlaced(b, [b.placed[0]!, b.pool[0]!, shadow]);
		expect(texts(withPlaced.placed)).toEqual(['a', 'b']);
		expect(withPlaced.pool).toBe(b.pool);
		const withPool = setPool(b, [shadow, b.pool[1]!]);
		expect(texts(withPool.pool)).toEqual(['c']);
		expect(withPool.placed).toBe(b.placed);
	});

	it('saves the placed texts in order', () => {
		expect(toLines(initLines(['a', 'b', 'c'], ['c', 'a']))).toEqual(['c', 'a']);
	});
});
