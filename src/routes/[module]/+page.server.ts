import { error } from '@sveltejs/kit';
import { CHAPTERS, MODULES, deckUrl } from '#lib/content/modules.js';
import { groupsOf, unitsOf } from '#lib/server/content/index.js';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => MODULES.map((m) => ({ module: m.slug }));

export const load: PageServerLoad = ({ params }) => {
	const module = MODULES.find((m) => m.slug === params.module);
	if (!module) error(404, 'This module does not exist.');
	const chapter = CHAPTERS.find((c) => c.slug === module.chapter)!;
	const units = unitsOf(module.slug).map(({ id, slug, title, minutes, core, status }) => ({
		id,
		slug,
		title,
		minutes,
		core,
		status
	}));
	const groupIds = groupsOf(module.slug).map((g) => g.id);
	const deck = module.deck ? deckUrl(module.deck) : null;
	return { module, chapter, units, groupIds, deck };
};
