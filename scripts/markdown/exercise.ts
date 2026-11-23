/**
 * Turns a one-line exercise reference into the ExerciseCard component before mdsvex sees the file:
 *
 *   :::exercise temperature-range
 *
 * becomes `<ExerciseCard slug=… title=… kind=… className=…>` with the exercise's task.md as Markdown
 * children, and the unit gets `import ExerciseCard from '#lib/components/ExerciseCard.svelte'` in its
 * instance `<script>` (created after the frontmatter if there is none, merged if there is one).
 *
 * The exercise must exist, be valid, be published, and belong to the module of the unit.
 * Lines inside code fences are left alone. Must run before the callout transform, which rejects
 * unknown `:::` containers.
 */
import { join } from 'node:path';
import { loadExercise, type Exercise } from '../practice/exercises.ts';

const LINE = /^:::exercise(?:[ \t]+(\S+))?[ \t]*$/;
const FENCE = /^(`{3,}|~{3,})/;
const SCRIPT_OPEN = /^<script(?![^>]*\bcontext=["']module["'])(?![^>]*\bmodule\b)[^>]*>/;
export const IMPORT = "import ExerciseCard from '#lib/components/ExerciseCard.svelte';";
const UNIT_PATH = /src\/content\/([^/]+)\/[^/]+\.md$/;

export interface ExerciseOptions {
	/** Loads practice/<slug>/. Defaults to the working directory. */
	load?: (slug: string) => { exercise?: Exercise; problems: string[] };
}

function escapeAttribute(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/\{/g, '&#123;')
		.replace(/\}/g, '&#125;');
}

const defaultLoad = (slug: string) => loadExercise(join(process.cwd(), 'practice', slug), slug);

export function transformExercises(source: string, file = 'markdown', options: ExerciseOptions = {}): string {
	if (!source.includes(':::exercise')) return source;
	const load = options.load ?? defaultLoad;
	const unitModule = UNIT_PATH.exec(file.split('\\').join('/'))?.[1];
	const lines = source.split('\n');
	let fence: string | null = null;
	let found = false;
	let scriptLine = -1;

	// First line after the frontmatter (where a new <script> goes).
	let bodyStart = 0;
	if (lines[0]?.trim() === '---') {
		const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---');
		if (end > 0) bodyStart = end + 1;
	}

	const out = lines.map((line, i) => {
		const fenceMatch = FENCE.exec(line.trim());
		if (fenceMatch) {
			if (fence === null) fence = fenceMatch[1][0];
			else if (fenceMatch[1][0] === fence) fence = null;
			return line;
		}
		if (fence !== null) return line;
		if (scriptLine < 0 && SCRIPT_OPEN.test(line)) scriptLine = i;

		const match = LINE.exec(line);
		if (!match) return line;
		const where = `${file}:${i + 1}`;
		const slug = match[1];
		if (!slug) throw new Error(`${where}: usage ":::exercise <slug>"`);
		const { exercise, problems } = load(slug);
		if (!exercise) {
			throw new Error(`${where}: exercise "${slug}" cannot be used:\n  ${problems.join('\n  ') || `practice/${slug}/ not found`}`);
		}
		if (!exercise.published) throw new Error(`${where}: exercise "${slug}" is not published (published: false)`);
		if (unitModule && exercise.module !== unitModule) {
			throw new Error(`${where}: exercise "${slug}" belongs to module "${exercise.module}", not "${unitModule}"`);
		}
		found = true;
		const attrs = [
			`slug="${escapeAttribute(exercise.slug)}"`,
			`title="${escapeAttribute(exercise.title)}"`,
			`kind="${exercise.kind}"`,
			`className="${escapeAttribute(exercise.className)}"`
		].join(' ');
		return `\n<ExerciseCard ${attrs}>\n\n${exercise.task}\n\n</ExerciseCard>\n`;
	});
	if (!found) return source;

	if (scriptLine >= 0) {
		const line = out[scriptLine];
		const tagEnd = line.indexOf('>') + 1;
		out[scriptLine] = `${line.slice(0, tagEnd)}\n${IMPORT}${line.slice(tagEnd)}`;
	} else {
		out.splice(bodyStart, 0, `<script>\n${IMPORT}\n</script>\n`);
	}
	return out.join('\n');
}
