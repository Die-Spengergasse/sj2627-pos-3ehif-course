import { describe, expect, it } from 'vitest';
import { correctFlags, templatePercent } from './scoring.ts';

const ordered = (expected: string[]) => ({ expected, anyOrder: false });

describe('correctFlags', () => {
	it('marks the longest common subsequence', () => {
		expect(correctFlags(ordered(['a', 'b', 'c']), ['b', 'a', 'c'])).toEqual([true, false, true]);
		expect(correctFlags(ordered(['a', 'b']), ['x', 'a', 'y', 'b'])).toEqual([false, true, false, true]);
	});
	it('takes the earliest match for duplicates', () => {
		expect(correctFlags(ordered(['}', 'x']), ['}', '}', 'x'])).toEqual([true, false, true]);
	});
	it('marks nothing for an empty or unrelated answer', () => {
		expect(correctFlags(ordered(['a']), [])).toEqual([]);
		expect(correctFlags(ordered(['a']), ['z'])).toEqual([false]);
	});
	it('uses the multiset intersection for any-order gaps', () => {
		expect(correctFlags({ expected: ['a', 'b', 'a'], anyOrder: true }, ['b', 'a', 'a', 'a', 'z'])).toEqual([
			true,
			true,
			true,
			false,
			false
		]);
	});
});

describe('templatePercent', () => {
	it('divides matches by the longer side per gap, so extras and misses cost the same', () => {
		expect(templatePercent([ordered(['a', 'b'])], [['a', 'b']])).toBe(100);
		expect(templatePercent([ordered(['a', 'b'])], [['a']])).toBe(50);
		expect(templatePercent([ordered(['a', 'b'])], [['a', 'b', 'x']])).toBeCloseTo(66.67, 1);
	});
	it('sums over all gaps', () => {
		expect(templatePercent([ordered(['a']), ordered(['b'])], [['a'], ['x']])).toBe(50);
	});
	it('scores 0 for nothing placed or nothing expected', () => {
		expect(templatePercent([ordered(['a'])], [[]])).toBe(0);
		expect(templatePercent([], [])).toBe(0);
	});
});
