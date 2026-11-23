import { describe, expect, it } from 'vitest';
import { buildPool, parseTemplate } from '#lib/puzzle/template.js';
import { emptyAnswer, isAnswered, isCorrect, lineReview, placedTexts, scorePercent, templateTiles } from './answer.ts';
import type { QuestionView } from './types.ts';

const base = { promptHtml: 'p', explanationHtml: 'e' };
const single: QuestionView = { ...base, kind: 'single', optionsHtml: ['a', 'b', 'c'], answer: 1 };
const multi: QuestionView = { ...base, kind: 'multi', optionsHtml: ['a', 'b', 'c'], answer: [0, 2] };

function template(src: string, herrings: string[] = []): QuestionView & { kind: 'template' } {
	const parsed = parseTemplate(src);
	return { ...base, kind: 'template', lines: parsed.lines, gaps: parsed.gaps, tiles: buildPool(parsed, herrings, []).tiles };
}

describe('single and multi', () => {
	it('needs the exact choice', () => {
		expect(isCorrect(single, { kind: 'single', choice: 1 })).toBe(true);
		expect(isCorrect(single, { kind: 'single', choice: 0 })).toBe(false);
		expect(isCorrect(single, { kind: 'single', choice: null })).toBe(false);
	});

	it('needs exactly the right set, in any order', () => {
		expect(isCorrect(multi, { kind: 'multi', choices: [2, 0] })).toBe(true);
		expect(isCorrect(multi, { kind: 'multi', choices: [0] })).toBe(false);
		expect(isCorrect(multi, { kind: 'multi', choices: [0, 1, 2] })).toBe(false);
	});

	it('knows when something was answered', () => {
		expect(isAnswered(emptyAnswer(single))).toBe(false);
		expect(isAnswered(emptyAnswer(multi))).toBe(false);
		expect(isAnswered({ kind: 'multi', choices: [1] })).toBe(true);
	});
});

describe('template', () => {
	const q = template('@{{Entity}}\nclass A {{extends}} {{B}} {}', ['Table']);

	it('gives every tile an id', () => {
		expect(templateTiles(q).map((t) => [t.pieceId, t.text])).toEqual([
			['t0', 'Entity'],
			['t1', 'extends'],
			['t2', 'B'],
			['t3', 'Table']
		]);
	});

	it('maps placed ids to texts', () => {
		expect(placedTexts(q, { '0': ['t3'], '1': ['t1', 't2'], '7': ['t0'] })).toEqual([['Table'], ['extends', 'B']]);
	});

	it('is correct only at 100 %', () => {
		const right = { kind: 'template' as const, gaps: { '0': ['t0'], '1': ['t1', 't2'] } };
		const half = { kind: 'template' as const, gaps: { '0': ['t3'], '1': ['t1', 't2'] } };
		expect(isCorrect(q, right)).toBe(true);
		expect(isCorrect(q, half)).toBe(false);
		expect(scorePercent(q, half)).toBe(67);
		expect(isAnswered(emptyAnswer(q))).toBe(false);
	});
});

describe('line', () => {
	const q: QuestionView & { kind: 'line' } = {
		...base,
		kind: 'line',
		lines: ['for (int i = 0; i < n; i++) {', '    sum += i;', '}', '}'],
		redHerrings: ['    sum -= i;']
	};
	const ans = (lines: string[]) => ({ kind: 'line' as const, lines });
	const [l0, l1, l2, l3] = q.lines;

	it('is correct only with the exact order', () => {
		expect(isCorrect(q, ans(q.lines))).toBe(true);
		expect(isCorrect(q, ans([l1!, l0!, l2!, l3!]))).toBe(false);
		expect(isCorrect(q, ans([]))).toBe(false);
		expect(emptyAnswer(q)).toEqual(ans([]));
		expect(isAnswered(ans([]))).toBe(false);
		expect(isAnswered(ans([l0!]))).toBe(true);
	});

	it('is not correct when a red herring is placed, even with the solution in order', () => {
		const withHerring = [l0!, '    sum -= i;', l1!, l2!, l3!];
		expect(isCorrect(q, ans(withHerring))).toBe(false);
		expect(isCorrect(q, ans([...q.lines, '    sum -= i;']))).toBe(false);
		const review = lineReview(q, withHerring);
		expect(review.placed.map((p) => p.correct)).toEqual([true, false, true, true, true]);
		expect(review.complete).toBe(false);
	});

	it('is not correct and scores less when lines are missing', () => {
		expect(isCorrect(q, ans([l0!, l1!, l2!]))).toBe(false);
		expect(scorePercent(q, ans([l0!, l1!, l2!]))).toBe(75);
		expect(scorePercent(q, ans([]))).toBe(0);
	});

	it('scores by longest common subsequence divided by the longer side', () => {
		expect(scorePercent(q, ans(q.lines))).toBe(100);
		// One red herring in the middle: 4 right of max(4, 5) lines.
		expect(scorePercent(q, ans([l0!, '    sum -= i;', l1!, l2!, l3!]))).toBe(80);
		// One line moved to the front: the other three still match in order.
		expect(scorePercent(q, ans([l1!, l0!, l2!, l3!]))).toBe(75);
		// Only red herrings.
		expect(scorePercent(q, ans(['    sum -= i;']))).toBe(0);
	});

	it('treats identical lines as interchangeable', () => {
		const review = lineReview(q, [l0!, l1!, '}', '}']);
		expect(review.placed.every((p) => p.correct)).toBe(true);
		expect(review.complete).toBe(true);
		// A third closing brace is extra: only the first two count.
		const extra = lineReview(q, [l0!, l1!, '}', '}', '}']);
		expect(extra.placed.map((p) => p.correct)).toEqual([true, true, true, true, false]);
		expect(extra.complete).toBe(false);
	});

	it('compares indentation exactly', () => {
		expect(isCorrect(q, ans([l0!, 'sum += i;', l2!, l3!]))).toBe(false);
		expect(isCorrect(q, ans([l0!, '        sum += i;', l2!, l3!]))).toBe(false);
	});

	it('lists the solution and the red herrings in the review', () => {
		const review = lineReview(q, [l1!]);
		expect(review.solution).toEqual(q.lines);
		expect(review.redHerrings).toEqual(q.redHerrings);
		expect(review.placed).toEqual([{ text: l1, correct: true }]);
	});
});
