import { mdsvex } from 'mdsvex';
import type { PreprocessorGroup } from 'svelte/compiler';
import { transformCallouts } from './callouts.ts';
import { highlight } from './highlight.ts';
import { transformExercises } from './exercise.ts';

const exercises: PreprocessorGroup = {
	name: 'exercises',
	markup({ content, filename }) {
		if (!filename?.endsWith('.md')) return;
		return { code: transformExercises(content, filename) };
	}
};

const callouts: PreprocessorGroup = {
	name: 'callouts',
	markup({ content, filename }) {
		if (!filename?.endsWith('.md')) return;
		return { code: transformCallouts(content, filename) };
	}
};

/** Preprocessors for Markdown pages and units. Order matters: containers (`:::exercise`) run on the raw text before callouts. */
export const markdown: PreprocessorGroup[] = [
	exercises,
	callouts,
	mdsvex({
		extensions: ['.md'],
		highlight: { highlighter: highlight },
		// quotes must stay off: smartypants would also curl the quotes inside inline Svelte expressions
		// such as <a href={resolve('/privacy')}> and break the page. Type curly quotes directly where wanted.
		smartypants: { quotes: false, ellipses: true, backticks: false, dashes: 'oldschool' }
	})
];
