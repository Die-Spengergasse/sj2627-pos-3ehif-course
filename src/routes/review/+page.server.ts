import { CHAPTERS, modulesOf } from '#lib/content/modules.js';
import { groupsForUnit, groupsOf, unitsOf } from '#lib/server/content/index.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	chapters: CHAPTERS.map((chapter) => ({
		...chapter,
		modules: modulesOf(chapter.slug).map((m) => ({
			slug: m.slug,
			title: m.title,
			groups: groupsOf(m.slug).length,
			units: unitsOf(m.slug).map((u) => {
				const groups = groupsForUnit(u.id);
				return {
					id: u.id,
					slug: u.slug,
					title: u.title,
					core: u.core,
					minutes: u.minutes,
					status: u.status,
					groups: groups.length,
					questions: groups.reduce((n, g) => n + 1 + g.followUps.length, 0)
				};
			})
		}))
	}))
});
