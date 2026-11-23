import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { exerciseSlugs, loadExercise, loadExercises, packageOf } from './exercises.ts';
import { exerciseFiles, PKG, tempRoot } from './fixtures.ts';

const load = (files: Record<string, string>, slug = 'demo-record') =>
	loadExercise(join(tempRoot({ [slug]: files }), 'practice', slug), slug);

describe('packageOf', () => {
	it('drops hyphens from chapter and slug', () => {
		expect(packageOf('modern-java', 'demo-record')).toBe(PKG);
	});
});

describe('loadExercise', () => {
	it('loads a valid exercise', () => {
		const { exercise, problems } = load(exerciseFiles());
		expect(problems).toEqual([]);
		expect(exercise).toMatchObject({
			slug: 'demo-record',
			module: 'modern-java-core',
			chapter: 'modern-java',
			kind: 'core',
			className: 'Demo',
			published: true,
			pkg: PKG,
			task: 'Implement `twice`.'
		});
		expect(Object.keys(exercise!.main)).toEqual(['Demo.java']);
		expect(exercise!.solution).toEqual({});
	});

	it('reports problems in exercise.yaml', () => {
		const { problems } = load(
			exerciseFiles({
				'exercise.yaml': 'id: other\nmodule: nope\nkind: pflicht\nclassName: demo\npublished: yes\nfiles: []\n'
			})
		);
		expect(problems).toEqual(
			expect.arrayContaining([
				'practice/demo-record: exercise.yaml: unknown key "files" (allowed: id, title, module, kind, className, published)',
				'practice/demo-record: exercise.yaml: id must be "demo-record" (the folder name), found "other"',
				'practice/demo-record: exercise.yaml: title is missing',
				'practice/demo-record: exercise.yaml: kind must be one of core, bonus',
				'practice/demo-record: exercise.yaml: published must be true or false',
				'practice/demo-record: exercise.yaml: module must be a known module slug, found "nope"',
				'practice/demo-record: exercise.yaml: className must be a Java class name in UpperCamelCase'
			])
		);
	});

	it('rejects placeholder modules', () => {
		const yaml = exerciseFiles()['exercise.yaml'].replace('modern-java-core', 'threading');
		expect(load(exerciseFiles({ 'exercise.yaml': yaml })).problems).toContain(
			'practice/demo-record: exercise.yaml: module "threading" is a placeholder'
		);
	});

	it('needs task.md, the class and its test', () => {
		const files = exerciseFiles();
		delete files['test/DemoTest.java'];
		const { problems } = load({ ...files, 'task.md': '  \n', 'main/Demo.java': '', 'main/Other.java': '' });
		expect(problems).toEqual(
			expect.arrayContaining([
				'practice/demo-record: task.md is missing or empty',
				'practice/demo-record: main/Demo.java is missing',
				'practice/demo-record: test/DemoTest.java is missing'
			])
		);
	});

	it('checks the package of every file', () => {
		const { problems } = load(exerciseFiles({ 'test/Helper.java': 'package at.spengergasse.cash;\nclass Helper {}\n' }));
		expect(problems).toEqual([
			`practice/demo-record: test/Helper.java: must declare "package ${PKG};", found "at.spengergasse.cash"`
		]);
	});

	it('only allows solution files that replace starter files', () => {
		const { problems } = load(exerciseFiles({ 'solution/Extra.java': `package ${PKG};\nclass Extra {}\n` }));
		expect(problems).toEqual(['practice/demo-record: solution/Extra.java has no counterpart in main/ (solutions replace starter files)']);
	});

	it('needs a top-level type with the class name', () => {
		const { problems } = load(exerciseFiles({ 'main/Demo.java': `package ${PKG};\n\nclass Something {}\n` }));
		expect(problems).toEqual(['practice/demo-record: main/Demo.java: no top-level type "Demo" found']);
	});
});

describe('loadExercises', () => {
	it('skips _template and rejects duplicate class names across exercises', () => {
		const second = exerciseFiles({}, 'demo-two');
		for (const key of Object.keys(second)) second[key] = second[key].replace(/demorecord/g, 'demotwo');
		const root = tempRoot({ 'demo-record': exerciseFiles(), 'demo-two': second });
		expect(exerciseSlugs(root)).toEqual(['demo-record', 'demo-two']);
		expect(() => loadExercises(root)).toThrow(
			'practice/demo-two: className "Demo" is already used by practice/demo-record (Shift Shift must find one hit)'
		);
	});

	it('loads the real exercises of this repository', () => {
		expect(() => loadExercises(process.cwd())).not.toThrow();
	});
});
