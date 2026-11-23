import type { ChapterSlug, ModuleSlug } from '#lib/content/modules.js';
import { modulesOf } from '#lib/content/modules.js';
import { buildIndex, type ContentFiles, type ContentIndex } from './build.js';

export type { Unit } from './build.js';

const ROOT = '/src/content/';

function relative(files: Record<string, string>): Record<string, string> {
	return Object.fromEntries(Object.entries(files).map(([path, raw]) => [path.slice(ROOT.length), raw]));
}

function load(): ContentIndex {
	const files: ContentFiles = {
		units: relative(import.meta.glob('/src/content/*/*.md', { query: '?raw', import: 'default', eager: true })),
		pools: relative(import.meta.glob('/src/content/questions/*.yaml', { query: '?raw', import: 'default', eager: true }))
	};
	const { index, errors } = buildIndex(files);
	if (errors.length) {
		throw new Error(`Content has ${errors.length} problem(s):\n- ${errors.join('\n- ')}`);
	}
	return index;
}

/** Built once per server/prerender process. Throws if any content file is invalid, which fails the build. */
export const content: ContentIndex = load();

export const unitsOf = (module: ModuleSlug) => content.units.filter((u) => u.module === module);
export const groupsOf = (module: ModuleSlug) => content.groups.filter((g) => g.unit.startsWith(`${module}/`));
export const groupsForUnit = (unitId: string) => content.groups.filter((g) => g.unit === unitId);

/** Question groups of a module or chapter, in course order. */
export function groupsOfModules(modules: readonly { slug: ModuleSlug }[]) {
	return modules.flatMap((m) => groupsOf(m.slug));
}

export function groupsOfChapter(chapter: ChapterSlug) {
	return groupsOfModules(modulesOf(chapter));
}
