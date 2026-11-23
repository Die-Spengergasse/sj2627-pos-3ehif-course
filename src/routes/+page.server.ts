import { CHAPTERS, modulesOf } from '#lib/content/modules.js';
import { groupsOf, unitsOf } from '#lib/server/content/index.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	chapters: CHAPTERS.map((chapter) => ({
		...chapter,
		modules: modulesOf(chapter.slug).map((m) => ({
			...m,
			units: unitsOf(m.slug).map(({ id, slug, title, core }) => ({ id, slug, title, core })),
			groupIds: groupsOf(m.slug).map((g) => g.id)
		}))
	}))
});
