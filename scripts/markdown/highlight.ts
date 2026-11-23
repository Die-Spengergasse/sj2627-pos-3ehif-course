import { escapeSvelte } from 'mdsvex';
import { createHighlighter, type BundledLanguage } from 'shiki';
import { renderPlantUml } from './plantuml.ts';

/** Languages that may appear in units. Anything else is rendered as plain text. */
export const LANGUAGES = ['java', 'json', 'kotlin', 'sql', 'http', 'bash', 'yaml', 'xml', 'properties'] as const;

/** Code blocks are dark in both themes (as in ParsonXam). */
const THEME = 'github-dark-default';

const highlighter = createHighlighter({ themes: [THEME], langs: [...LANGUAGES] });

function escapeHtml(text: string): string {
	return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Wraps raw HTML so Svelte does not treat {, } or ` inside it as template syntax. */
function rawHtml(html: string): string {
	return `{@html \`${escapeSvelte(html)}\`}`;
}

/** Shiki HTML for a code block. */
export async function highlightToHtml(code: string, lang: string | undefined): Promise<string> {
	const known = (LANGUAGES as readonly string[]).includes(lang ?? '');
	return (await highlighter).codeToHtml(code, {
		lang: known ? (lang as BundledLanguage) : 'text',
		theme: THEME
	});
}

function figure(inner: string, caption: string | undefined, kind: string): string {
	const figcaption = caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : '';
	return `<figure class="diagram diagram-${kind}">${inner}${figcaption}</figure>`;
}

/**
 * mdsvex highlighter. The text after the language becomes the caption:
 *   ```plantuml Class diagram: Library
 * PlantUML is rendered to SVG at build time (see plantuml.ts) and embedded as an image.
 */
export async function highlight(
	code: string,
	lang: string | null | undefined,
	meta: string | null | undefined,
	filename?: string
): Promise<string> {
	const caption = meta?.trim() || undefined;

	if (lang === 'plantuml') {
		let svg: string;
		try {
			svg = await renderPlantUml(code);
		} catch (e) {
			throw new Error(`${filename ?? 'markdown'}: ${(e as Error).message}`);
		}
		const src = `data:image/svg+xml;base64,${Buffer.from(svg, 'utf8').toString('base64')}`;
		const alt = caption ? `UML diagram: ${caption}` : 'UML diagram';
		return rawHtml(figure(`<img src="${src}" alt="${escapeHtml(alt)}" />`, caption, 'plantuml'));
	}

	return rawHtml(await highlightToHtml(code, lang ?? undefined));
}
