import { z } from 'zod';
import { MODULE_SLUGS } from './modules.js';

const status = z.enum(['draft', 'reviewed']).default('draft');

export const unitFrontmatter = z.strictObject({
	title: z.string().min(1),
	minutes: z.int().min(1).max(30),
	/** false = "Going further" (optional unit). */
	core: z.boolean().default(true),
	status
});
export type UnitFrontmatter = z.infer<typeof unitFrontmatter>;

const questionBase = {
	/** Markdown. */
	prompt: z.string().min(1),
	/** Optional code shown below the prompt (Java unless the block says otherwise). */
	code: z.string().optional(),
	/** Markdown, shown after answering. */
	explanation: z.string().min(1)
};

const options = z.array(z.string().min(1)).min(2).max(6);

const singleQuestion = z.strictObject({
	kind: z.literal('single'),
	...questionBase,
	options,
	answer: z.int().min(0)
});

const multiQuestion = z.strictObject({
	kind: z.literal('multi'),
	...questionBase,
	options,
	answer: z.array(z.int().min(0)).min(1)
});

/** Parsons puzzle in ParsonXam template syntax ({{piece}}, {{}} empty gap, ~ any order). */
const templateQuestion = z.strictObject({
	kind: z.literal('template'),
	...questionBase,
	template: z.string().min(1),
	redHerrings: z.array(z.string().min(1)).default([]),
	reusable: z.array(z.string().min(1)).default([])
});

/**
 * Parsons puzzle with whole lines in the solution order. Indentation is part of the line text.
 */
const lineQuestion = z.strictObject({
	kind: z.literal('line'),
	...questionBase,
	lines: z.array(z.string().min(1)).min(2).max(30),
	redHerrings: z.array(z.string().min(1)).max(15).default([])
});

export const question = z.discriminatedUnion('kind', [
	singleQuestion,
	multiQuestion,
	templateQuestion,
	lineQuestion
]);
export type Question = z.infer<typeof question>;

export const questionGroup = z.strictObject({
	id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'lowercase words separated by "-"'),
	/** Unit id "<module>/<slug>", e.g. "modern-java-core/records". */
	unit: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*\/[a-z0-9-]+$/, 'expected "<module>/<slug>"'),
	main: question,
	followUps: z.array(question).max(2).default([])
});
export type QuestionGroup = z.infer<typeof questionGroup>;

export const questionPool = z.array(questionGroup);

export const moduleSlug = z.enum(MODULE_SLUGS);
