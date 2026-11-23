import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { loadExercises } from './exercises.ts';
import { zipBytes, zipTree } from './generate.ts';

/**
 * Validates `practice/` and writes `static/exercises/<slug>.zip` (standalone Gradle project) for every
 * published exercise when `vite dev` / `vite build` starts, before SvelteKit copies `static/`.
 * Invalid exercises fail the build.
 */
export function buildZips(root: string): string[] {
	const exercises = loadExercises(root).filter((e) => e.published);
	const target = join(root, 'static', 'exercises');
	mkdirSync(target, { recursive: true });
	const wanted = new Set(exercises.map((e) => `${e.slug}.zip`));
	for (const name of readdirSync(target)) if (!wanted.has(name)) rmSync(join(target, name));
	for (const e of exercises) {
		const bytes = zipBytes(zipTree(join(root, 'practice', '_template'), e));
		const file = join(target, `${e.slug}.zip`);
		// Do not touch an unchanged file (keeps dev watchers quiet).
		if (!existsSync(file) || !Buffer.from(bytes).equals(readFileSync(file))) writeFileSync(file, bytes);
	}
	return exercises.map((e) => e.slug);
}

export function practiceZips(): Plugin {
	let root = process.cwd();
	return {
		name: 'practice-zips',
		configResolved(config) {
			root = config.root;
		},
		buildStart() {
			// Vitest loads this config too; the unit tests do not need the zips.
			if (process.env.VITEST) return;
			buildZips(root);
		}
	};
}
