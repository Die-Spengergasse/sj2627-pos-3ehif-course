import { describe, expect, it } from 'vitest';
import { CHAPTER_SLUGS, CHAPTERS, MODULE_SLUGS, MODULES, deckUrl } from './modules.ts';

describe('modules', () => {
	it('lists every module slug exactly once, in course order', () => {
		expect(MODULES.map((m) => m.slug)).toEqual([...MODULE_SLUGS]);
		expect(CHAPTERS.map((c) => c.slug)).toEqual([...CHAPTER_SLUGS]);
	});

	it('keeps chapter and module slugs apart (practice scopes share one URL space)', () => {
		const modules = new Set<string>(MODULE_SLUGS);
		expect(CHAPTER_SLUGS.filter((c) => modules.has(c))).toEqual([]);
		expect(MODULE_SLUGS).not.toContain('all');
		expect(CHAPTER_SLUGS).not.toContain('all');
	});

	it('keeps the modules of a chapter together', () => {
		const order = MODULES.map((m) => m.chapter).filter((c, i, all) => all[i - 1] !== c);
		expect(order).toEqual([...CHAPTER_SLUGS]);
	});

	it('has a deck for every module except Good Code Style and placeholders', () => {
		const withoutDeck = MODULES.filter((m) => !m.deck).map((m) => m.slug);
		expect(withoutDeck).toEqual(['good-code-style', 'threading']);
		expect(MODULES.filter((m) => m.placeholder).map((m) => m.slug)).toEqual(['threading']);
		expect(MODULES.filter((m) => m.bonus).map((m) => m.slug)).toEqual(['modern-java-extras']);
	});

	it('links decks under the 3xHIF slides', () => {
		expect(deckUrl('01a_Constants_Enum')).toBe('https://mfreimueller.github.io/lectures/POS/3xHIF/01a_Constants_Enum/');
	});
});
