import { CHAPTERS, MODULES, modulesOf, type ModuleSlug } from '#lib/content/modules.js';
import { groupsOf } from '#lib/server/content/index.js';
import type { PageServerLoad } from './$types';

const idsOf = (module: ModuleSlug) => groupsOf(module).map((g) => g.id);

export const load: PageServerLoad = () => ({
	chapters: CHAPTERS.map((chapter) => ({
		...chapter,
		groupIds: modulesOf(chapter.slug).flatMap((m) => idsOf(m.slug)),
		modules: modulesOf(chapter.slug)
			.filter((m) => !m.placeholder)
			.map((m) => ({ ...m, groupIds: idsOf(m.slug) }))
	})),
	allIds: MODULES.flatMap((m) => idsOf(m.slug))
});
