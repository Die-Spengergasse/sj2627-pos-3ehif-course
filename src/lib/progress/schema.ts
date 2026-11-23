import { z } from 'zod';

export const STORAGE_KEY = 'pos3hif:v1';
/** A store that could not be read is kept here once, so nothing is lost silently. */
export const BROKEN_KEY = 'pos3hif:v1:broken';
export const MAX_RUNS = 50;

const timestamp = z.iso.datetime();

export const groupProgress = z.object({
	/** Leitner box: 0 = new, 1 = failed last time, 2–4 = answered correctly 1–3 times in a row. */
	box: z.int().min(0).max(4),
	lastAt: timestamp,
	runs: z.int().min(0),
	wrong: z.int().min(0)
});
export type GroupProgress = z.infer<typeof groupProgress>;

export const runResult = z.object({
	/** Module slug, chapter slug or "all". */
	scope: z.string(),
	at: timestamp,
	correct: z.int().min(0),
	total: z.int().min(0)
});
export type RunResult = z.infer<typeof runResult>;

export const progressSchema = z.object({
	version: z.literal(1),
	name: z.string().max(100).optional(),
	units: z.record(z.string(), z.object({ readAt: timestamp })).default({}),
	groups: z.record(z.string(), groupProgress).default({}),
	/** Exercises the student ticked as done, by slug. Not checked: IntelliJ cannot report back. */
	exercises: z.record(z.string(), z.object({ doneAt: timestamp })).default({}),
	runs: z.array(runResult).max(MAX_RUNS).default([]),
	/** Shape is owned by practice mode (lib/quiz). */
	currentRun: z.unknown().optional(),
	settings: z
		.object({
			theme: z.enum(['light', 'dark', 'system']).optional()
		})
		.default({})
});
export type Progress = z.infer<typeof progressSchema>;

export function emptyProgress(): Progress {
	return { version: 1, units: {}, groups: {}, exercises: {}, runs: [], settings: {} };
}
