import { error } from '@sveltejs/kit';
import { CHAPTERS, MODULES } from '#lib/content/modules.js';
import { groupsOf } from '#lib/server/content/index.js';
import { groupView } from '#lib/server/content/views.js';
import { ALL, isPracticeScope, scopeModules, scopeTitle } from '#lib/quiz/scopes.js';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () =>
	[ALL, ...CHAPTERS.map((c) => c.slug), ...MODULES.map((m) => m.slug)].map((scope) => ({ scope }));

export const load: PageServerLoad = async ({ params }) => {
	const { scope } = params;
	if (!isPracticeScope(scope)) error(404, 'This practice area does not exist.');
	const pool = scopeModules(scope).flatMap((m) => groupsOf(m.slug));
	return { scope, title: scopeTitle(scope), groups: await Promise.all(pool.map(groupView)) };
};
