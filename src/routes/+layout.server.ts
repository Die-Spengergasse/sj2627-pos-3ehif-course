import { CHAPTERS, modulesOf } from '#lib/content/modules.js';
import { unitsOf } from '#lib/server/content/index.js';
import type { LayoutServerLoad } from './$types';

/** Course structure for the side panel: chapters with their modules and units. */
export const load: LayoutServerLoad = () => ({
	nav: CHAPTERS.map(({ slug, title, note }) => ({
		slug,
		title,
		note,
		modules: modulesOf(slug).map(({ slug, title, bonus, placeholder }) => ({
			slug,
			title,
			bonus: bonus ?? false,
			placeholder: placeholder ?? false,
			units: unitsOf(slug).map(({ id, slug, title, core }) => ({ id, slug, title, core }))
		}))
	}))
});
