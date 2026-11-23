import {
	CHAPTERS,
	isChapterSlug,
	isModuleSlug,
	MODULES,
	modulesOf,
	type Module
} from '#lib/content/modules.js';

/** Practice scopes: one module, one chapter or all modules. */
export const ALL = 'all';

export function isPracticeScope(scope: string): boolean {
	return scope === ALL || isChapterSlug(scope) || isModuleSlug(scope);
}

export function scopeTitle(scope: string): string {
	if (scope === ALL) return 'All modules';
	if (isChapterSlug(scope)) return CHAPTERS.find((c) => c.slug === scope)?.title ?? scope;
	return MODULES.find((m) => m.slug === scope)?.title ?? scope;
}

/** The modules a scope covers, in course order. */
export function scopeModules(scope: string): readonly Module[] {
	if (scope === ALL) return MODULES;
	if (isChapterSlug(scope)) return modulesOf(scope);
	const module = MODULES.find((m) => m.slug === scope);
	return module ? [module] : [];
}
