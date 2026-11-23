/**
 * Exercise packages: every folder `practice/<slug>/` (folders starting with "_" are skipped) holds
 *
 *   exercise.yaml     id, title, module, kind, className, published
 *   task.md           task text: shown on the site and put in front of the exercise class as a /// doc comment
 *   main/*.java       starter code (must compile; methods may throw UnsupportedOperationException)
 *   test/*.java       JUnit tests, at least <ClassName>Test.java
 *   solution/*.java   optional, never committed (.gitignore): reference solution, replaces files of main/
 *
 * Every .java file declares `package at.spengergasse.pos3.<chapter>.<slug>;` (hyphens removed).
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { moduleOf, type ChapterSlug } from '../../src/lib/content/modules.ts';

export const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CLASS_NAME = /^[A-Z][A-Za-z0-9]*$/;
export const KINDS = ['core', 'bonus'] as const;
export type Kind = (typeof KINDS)[number];
export const PACKAGE_ROOT = 'at.spengergasse.pos3';
const IGNORED = new Set(['.DS_Store', 'Thumbs.db']);

export type Exercise = {
	slug: string;
	title: string;
	module: string;
	chapter: ChapterSlug;
	kind: Kind;
	className: string;
	published: boolean;
	/** Fully qualified package, e.g. at.spengergasse.pos3.modernjava.recordpoint */
	pkg: string;
	task: string;
	/** File name -> content */
	main: Record<string, string>;
	test: Record<string, string>;
	solution: Record<string, string>;
};

/** Java package segment for a slug: hyphens removed ("modern-java" -> "modernjava"). */
export const packageSegment = (slug: string) => slug.replace(/-/g, '');

export const packageOf = (chapter: string, slug: string) => `${PACKAGE_ROOT}.${packageSegment(chapter)}.${packageSegment(slug)}`;

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** The .java files directly inside `dir` (no subfolders), by name. */
function javaFiles(dir: string): Record<string, string> {
	if (!existsSync(dir)) return {};
	return Object.fromEntries(
		readdirSync(dir)
			.filter((n) => !IGNORED.has(n) && n.endsWith('.java'))
			.sort()
			.map((n) => [n, readFileSync(join(dir, n), 'utf8')])
	);
}

const PACKAGE_LINE = /^\s*package\s+([\w.]+)\s*;/m;

/** Reads and validates one exercise folder. Problems are prefixed with "practice/<slug>". */
export function loadExercise(dir: string, slug: string): { exercise?: Exercise; problems: string[] } {
	const where = `practice/${slug}`;
	const problems: string[] = [];
	const fail = (message: string) => problems.push(`${where}: ${message}`);

	if (!SLUG.test(slug)) fail('folder name must be lowercase a-z, 0-9 and "-" (e.g. "record-point")');
	const yamlPath = join(dir, 'exercise.yaml');
	if (!existsSync(yamlPath)) return { problems: [...problems, `${where}: exercise.yaml is missing`] };

	let doc: unknown;
	try {
		doc = parse(readFileSync(yamlPath, 'utf8'));
	} catch (error) {
		return { problems: [...problems, `${where}/exercise.yaml: cannot be parsed: ${(error as Error).message}`] };
	}
	if (!isObject(doc)) return { problems: [...problems, `${where}/exercise.yaml: must be a YAML mapping`] };

	const known = ['id', 'title', 'module', 'kind', 'className', 'published'];
	for (const key of Object.keys(doc)) if (!known.includes(key)) fail(`exercise.yaml: unknown key "${key}" (allowed: ${known.join(', ')})`);
	if (doc.id !== slug) fail(`exercise.yaml: id must be "${slug}" (the folder name), found ${JSON.stringify(doc.id)}`);
	if (typeof doc.title !== 'string' || doc.title.trim() === '') fail('exercise.yaml: title is missing');
	if (!(KINDS as readonly unknown[]).includes(doc.kind)) fail(`exercise.yaml: kind must be one of ${KINDS.join(', ')}`);
	if (typeof doc.published !== 'boolean') fail('exercise.yaml: published must be true or false');

	const module = typeof doc.module === 'string' ? moduleOf(doc.module) : undefined;
	if (!module) fail(`exercise.yaml: module must be a known module slug, found ${JSON.stringify(doc.module)}`);
	else if (module.placeholder) fail(`exercise.yaml: module "${module.slug}" is a placeholder`);

	const className = typeof doc.className === 'string' ? doc.className : '';
	if (!CLASS_NAME.test(className)) fail('exercise.yaml: className must be a Java class name in UpperCamelCase');

	const taskPath = join(dir, 'task.md');
	const task = existsSync(taskPath) ? readFileSync(taskPath, 'utf8').trim() : '';
	if (!task) fail('task.md is missing or empty');

	const main = javaFiles(join(dir, 'main'));
	const test = javaFiles(join(dir, 'test'));
	const solution = javaFiles(join(dir, 'solution'));
	if (className) {
		if (!main[`${className}.java`]) fail(`main/${className}.java is missing`);
		if (!test[`${className}Test.java`]) fail(`test/${className}Test.java is missing`);
	}
	for (const name of Object.keys(solution)) {
		if (!main[name]) fail(`solution/${name} has no counterpart in main/ (solutions replace starter files)`);
	}

	if (problems.length || !module) return { problems };

	const pkg = packageOf(module.chapter, slug);
	const files = { main, test, solution };
	for (const [folder, list] of Object.entries(files)) {
		for (const [name, source] of Object.entries(list)) {
			const declared = PACKAGE_LINE.exec(source)?.[1];
			if (declared !== pkg) fail(`${folder}/${name}: must declare "package ${pkg};", found ${declared ? `"${declared}"` : 'none'}`);
		}
	}
	if (main[`${className}.java`] && !findTypeLine(main[`${className}.java`], className)) {
		fail(`main/${className}.java: no top-level type "${className}" found`);
	}
	if (problems.length) return { problems };

	return {
		problems,
		exercise: {
			slug,
			title: (doc.title as string).trim(),
			module: module.slug,
			chapter: module.chapter,
			kind: doc.kind as Kind,
			className,
			published: doc.published as boolean,
			pkg,
			task,
			main,
			test,
			solution
		}
	};
}

/** Index of the line that declares the top-level type `name` (class, record, interface or enum), or -1. */
export function typeLineIndex(source: string, name: string): number {
	const declaration = new RegExp(
		`^(?:public\\s+)?(?:(?:final|abstract|sealed|non-sealed|static|strictfp)\\s+)*(?:class|record|interface|enum)\\s+${name}\\b`
	);
	return source.split('\n').findIndex((line) => declaration.test(line));
}

function findTypeLine(source: string, name: string): boolean {
	return typeLineIndex(source, name) >= 0;
}

/** Exercise folders under `<root>/practice`, sorted; "_template" and other "_" folders are not exercises. */
export function exerciseSlugs(root: string): string[] {
	const source = join(root, 'practice');
	if (!existsSync(source)) return [];
	return readdirSync(source)
		.filter((name) => !name.startsWith('_') && !name.startsWith('.') && statSync(join(source, name)).isDirectory())
		.sort();
}

/** Loads every exercise and checks the rules across exercises. Throws with all problems at once. */
export function loadExercises(root: string): Exercise[] {
	const problems: string[] = [];
	const exercises: Exercise[] = [];
	for (const slug of exerciseSlugs(root)) {
		const result = loadExercise(join(root, 'practice', slug), slug);
		problems.push(...result.problems);
		if (result.exercise) exercises.push(result.exercise);
	}
	const byClass = new Map<string, string>();
	for (const e of exercises) {
		const other = byClass.get(e.className);
		if (other) problems.push(`practice/${e.slug}: className "${e.className}" is already used by practice/${other} (Shift Shift must find one hit)`);
		else byClass.set(e.className, e.slug);
	}
	if (problems.length) throw new Error(`Invalid exercises:\n${problems.map((p) => `  ${p}`).join('\n')}`);
	return exercises;
}
