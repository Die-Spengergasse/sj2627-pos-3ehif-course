import { describe, expect, it } from 'vitest';
import type { Exercise } from '../practice/exercises.ts';
import { IMPORT, transformExercises } from './exercise.ts';

const exercise = (over: Partial<Exercise> = {}): Exercise => ({
	slug: 'temperature-range',
	title: 'Record: "TemperatureRange" {x}',
	module: 'modern-java-core',
	chapter: 'modern-java',
	kind: 'core',
	className: 'TemperatureRange',
	published: true,
	pkg: 'p',
	task: 'Do **this**.',
	main: {},
	test: {},
	solution: {},
	...over
});

const load = (e: Exercise | undefined) => () => (e ? { exercise: e, problems: [] } : { problems: ['practice/x: exercise.yaml is missing'] });
const FILE = '/repo/src/content/modern-java-core/01-records.md';

describe('transformExercises', () => {
	it('replaces the line with the card, the task as Markdown children, and adds the import', () => {
		const out = transformExercises('---\ntitle: T\n---\n\nText\n\n:::exercise temperature-range\n', FILE, { load: load(exercise()) });
		expect(out).toContain(`---\n<script>\n${IMPORT}\n</script>\n`);
		expect(out).toContain(
			'<ExerciseCard slug="temperature-range" title="Record: &quot;TemperatureRange&quot; &#123;x&#125;" kind="core" className="TemperatureRange">\n\nDo **this**.\n\n</ExerciseCard>'
		);
	});

	it('merges the import into an existing script and leaves code fences alone', () => {
		const src = '<script>\n\tlet x = 1;\n</script>\n\n```text\n:::exercise temperature-range\n```\n:::exercise temperature-range';
		const out = transformExercises(src, FILE, { load: load(exercise()) });
		expect(out.startsWith(`<script>\n${IMPORT}\n\tlet x = 1;`)).toBe(true);
		expect(out).toContain('```text\n:::exercise temperature-range\n```');
		expect(out.match(/<ExerciseCard /g)).toHaveLength(1);
	});

	it('leaves files without exercises unchanged', () => {
		expect(transformExercises('# Hi', FILE, { load: load(undefined) })).toBe('# Hi');
	});

	it('rejects missing, invalid, unpublished and foreign exercises', () => {
		expect(() => transformExercises(':::exercise', FILE)).toThrow(`${FILE}:1: usage ":::exercise <slug>"`);
		expect(() => transformExercises(':::exercise nope', FILE, { load: load(undefined) })).toThrow(
			/:1: exercise "nope" cannot be used:\n {2}practice\/x: exercise.yaml is missing/
		);
		expect(() => transformExercises(':::exercise t', FILE, { load: load(exercise({ published: false })) })).toThrow(
			'is not published'
		);
		expect(() => transformExercises(':::exercise t', FILE, { load: load(exercise({ module: 'enums' })) })).toThrow(
			'belongs to module "enums", not "modern-java-core"'
		);
	});
});
