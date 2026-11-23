<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { ChapterSlug, ModuleSlug } from '#lib/content/modules.js';
	import { progress } from '#lib/progress/store.svelte.js';

	type NavModule = {
		slug: ModuleSlug;
		title: string;
		bonus: boolean;
		placeholder: boolean;
		units: { id: string; slug: string; title: string; core: boolean }[];
	};

	type NavChapter = {
		slug: ChapterSlug;
		title: string;
		note: string;
		modules: NavModule[];
	};

	let { chapters }: { chapters: NavChapter[] } = $props();

	const courseInfo = resolve('/course-info');
	const path = $derived(page.url.pathname);
	const currentModule = $derived(page.params.module);
	const currentChapter = $derived(
		chapters.find((c) => c.modules.some((m) => m.slug === currentModule))?.slug
	);
	// Only the chapter you are in is open; outside a module every chapter with content is.
	const isOpen = (c: NavChapter) =>
		currentChapter ? currentChapter === c.slug : c.modules.some((m) => m.units.length > 0);
</script>

<nav class="course" aria-label="Course overview">
	<a class="info" href={courseInfo} aria-current={path === courseInfo ? 'page' : undefined}>
		Course info
	</a>
	{#each chapters as c (c.slug)}
		<details class="chapter" open={isOpen(c)}>
			<summary>
				<span class="note">{c.note}</span>
				<span class="chapter-title">{c.title}</span>
			</summary>
			{#each c.modules as m (m.slug)}
				{@const moduleHref = resolve('/[module]', { module: m.slug })}
				<details class="module" open={currentModule === m.slug}>
					<summary>
						<a href={moduleHref} aria-current={path === moduleHref ? 'page' : undefined}>{m.title}</a>
						{#if m.bonus}<span class="tag" title="Bonus: optional module">Bonus</span>{/if}
					</summary>
					{#if m.units.length}
						<ol>
							{#each m.units as u (u.id)}
								{@const href = resolve('/[module]/[unit]', { module: m.slug, unit: u.slug })}
								<li>
									<a {href} aria-current={path === href ? 'page' : undefined}>
										<span class="title">{u.title}</span>
										{#if !u.core}<span class="tag" title="Going further (optional)">+</span>{/if}
										{#if progress.isRead(u.id)}<span class="read" title="read">✓</span>{/if}
									</a>
								</li>
							{/each}
						</ol>
					{:else}
						<p class="soon">coming soon</p>
					{/if}
				</details>
			{/each}
		</details>
	{/each}
</nav>

<style>
	.course {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 16px 12px 32px;
		font-size: 14px;
	}
	.info {
		padding: 6px 8px;
		border-radius: var(--radius);
		color: var(--text);
		font-weight: 700;
		text-decoration: none;
	}
	.info:hover {
		background: var(--surface-alt);
	}
	.chapter {
		margin-top: 4px;
	}
	.chapter > summary,
	.module > summary {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 8px;
		border-radius: var(--radius);
		cursor: pointer;
	}
	.chapter > summary {
		font-weight: 700;
	}
	.module > summary {
		font-weight: 600;
	}
	.chapter > summary:hover,
	.module > summary:hover {
		background: var(--surface-alt);
	}
	summary a {
		flex: 1;
		color: var(--text);
		text-decoration: none;
	}
	.note {
		flex: none;
		padding: 0 6px;
		border-radius: 4px;
		background: var(--primary-soft);
		color: var(--primary-dark);
		font-size: 11px;
		font-weight: 700;
		line-height: 18px;
	}
	.chapter-title {
		flex: 1;
	}
	.module {
		margin-left: 8px;
	}
	ol {
		margin: 2px 0 8px;
		padding: 0;
		list-style: none;
		counter-reset: unit;
	}
	ol li {
		counter-increment: unit;
	}
	li a {
		display: flex;
		align-items: baseline;
		gap: 6px;
		padding: 5px 8px 5px 12px;
		border-radius: var(--radius);
		color: var(--text-muted);
		text-decoration: none;
		line-height: 1.35;
	}
	ol li a::before {
		content: counter(unit) '.';
		min-width: 1.6em;
		font-variant-numeric: tabular-nums;
		color: var(--text-muted);
	}
	li a:hover {
		background: var(--surface-alt);
		color: var(--text);
	}
	a[aria-current='page'] {
		background: var(--primary-soft);
		color: var(--primary);
		font-weight: 600;
	}
	li a[aria-current='page']::before {
		color: var(--primary);
	}
	.title {
		flex: 1;
	}
	.tag {
		padding: 0 5px;
		border-radius: 4px;
		background: var(--primary-soft);
		color: var(--primary);
		font-size: 11px;
		font-weight: 700;
	}
	.read {
		color: var(--success);
		font-weight: 700;
	}
	.soon {
		margin: 0 0 6px;
		padding: 2px 8px 2px 12px;
		color: var(--text-muted);
		font-style: italic;
	}
</style>
