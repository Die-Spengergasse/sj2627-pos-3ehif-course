/**
 * Exercise tooling (run from the repository root):
 *
 *   node scripts/practice/cli.ts generate <dir>       write the materials repository into <dir>
 *   node scripts/practice/cli.ts check                tests must FAIL against the starter code (CI)
 *   node scripts/practice/cli.ts solutions            tests must PASS with solution/ files (local, teacher)
 *   node scripts/practice/cli.ts immutable <old> <new> published exercise files must not change (CI, before push)
 *
 * check and solutions include unpublished exercises, so they can be tested before rollout.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadExercises, type Exercise } from './exercises.ts';
import { materialsTree, writeTree, type Tree } from './generate.ts';

const root = process.cwd();
const template = join(root, 'practice', '_template');

type Result = { tests: number; failed: number };

/** Test results per test class (fully qualified name), from Gradle's JUnit XML reports. */
export function readResults(projectDir: string): Map<string, Result> {
	const results = new Map<string, Result>();
	for (const chapter of readdirSync(projectDir)) {
		const dir = join(projectDir, chapter, 'build', 'test-results', 'test');
		if (!existsSync(dir)) continue;
		for (const file of readdirSync(dir).filter((f) => f.endsWith('.xml'))) {
			const xml = readFileSync(join(dir, file), 'utf8');
			const suite = /<testsuite\b[^>]*>/.exec(xml)?.[0] ?? '';
			const attr = (name: string) => Number(new RegExp(`\\b${name}="(\\d+)"`).exec(suite)?.[1] ?? 0);
			const name = /\bname="([^"]+)"/.exec(suite)?.[1];
			if (name) results.set(name, { tests: attr('tests'), failed: attr('failures') + attr('errors') });
		}
	}
	return results;
}

function gradle(dir: string, args: string[]): number {
	const wrapper = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
	const run = spawnSync(wrapper, [...args, '--console=plain', '--no-configuration-cache'], { cwd: dir, stdio: 'inherit' });
	return run.status ?? 1;
}

/** Generates all exercises (published or not) into a temp dir and runs their tests. */
function runAll(exercises: Exercise[], useSolution: boolean): { dir: string; results: Map<string, Result> } {
	const dir = mkdtempSync(join(tmpdir(), 'pos3-exercises-'));
	const all = exercises.map((e) => ({ ...e, published: true }));
	writeTree(materialsTree(template, all, { useSolution }), dir);
	if (gradle(dir, ['testClasses']) !== 0) {
		throw new Error(`The ${useSolution ? 'solution' : 'starter'} code does not compile (see the Gradle output above). Project: ${dir}`);
	}
	gradle(dir, ['test', '--continue']); // fails on purpose for the starter code
	return { dir, results: readResults(dir) };
}

function check(): void {
	const exercises = loadExercises(root);
	if (!exercises.length) return console.log('No exercises.');
	const { dir, results } = runAll(exercises, false);
	const problems: string[] = [];
	for (const e of exercises) {
		const r = results.get(`${e.pkg}.${e.className}Test`);
		if (!r || r.tests === 0) problems.push(`practice/${e.slug}: ${e.className}Test ran no tests`);
		else if (r.failed === 0) problems.push(`practice/${e.slug}: all tests pass against the starter code – the exercise is already solved or the tests check nothing`);
		else console.log(`ok   ${e.slug}: ${r.failed} of ${r.tests} tests fail against the starter code`);
	}
	if (problems.length) throw new Error(`Exercise check failed:\n${problems.map((p) => `  ${p}`).join('\n')}`);
	rmSync(dir, { recursive: true, force: true });
}

function solutions(): void {
	const exercises = loadExercises(root);
	const withSolution = exercises.filter((e) => Object.keys(e.solution).length > 0);
	for (const e of exercises.filter((x) => !withSolution.includes(x))) console.log(`skip ${e.slug}: no solution/ folder`);
	if (!withSolution.length) return;
	const { dir, results } = runAll(exercises, true);
	const problems: string[] = [];
	for (const e of withSolution) {
		const r = results.get(`${e.pkg}.${e.className}Test`);
		if (!r || r.tests === 0) problems.push(`practice/${e.slug}: ${e.className}Test ran no tests`);
		else if (r.failed > 0) problems.push(`practice/${e.slug}: ${r.failed} of ${r.tests} tests fail with the solution`);
		else console.log(`ok   ${e.slug}: all ${r.tests} tests pass with the solution`);
	}
	if (problems.length) throw new Error(`Solution check failed (project: ${dir}):\n${problems.map((p) => `  ${p}`).join('\n')}`);
	rmSync(dir, { recursive: true, force: true });
}

function filesUnder(dir: string): string[] {
	const out: string[] = [];
	const walk = (current: string) => {
		for (const name of readdirSync(current)) {
			if (name === '.git') continue;
			const full = join(current, name);
			if (statSync(full).isDirectory()) walk(full);
			else out.push(relative(dir, full).split(sep).join('/'));
		}
	};
	walk(dir);
	return out;
}

/** Exercise sources (`<chapter>/src/...`) of the published repository that changed or vanished in the new one. */
export function changedExerciseFiles(oldDir: string, newDir: string): string[] {
	return filesUnder(oldDir)
		.filter((path) => /^[^/]+\/src\//.test(path))
		.filter((path) => {
			const next = join(newDir, path);
			return !existsSync(next) || !readFileSync(next).equals(readFileSync(join(oldDir, path)));
		});
}

function immutable(oldDir: string, newDir: string): void {
	const changed = changedExerciseFiles(oldDir, newDir);
	if (changed.length) {
		throw new Error(
			`Published exercises must not change (students would get conflicts on Update Project).\n` +
				`Add a new exercise instead. Changed or removed:\n${changed.map((p) => `  ${p}`).join('\n')}`
		);
	}
	console.log('ok   no published exercise file changed');
}

function generate(dir: string): Tree {
	const tree = materialsTree(template, loadExercises(root));
	writeTree(tree, dir);
	console.log(`wrote ${tree.size} files to ${dir}`);
	return tree;
}

function main(command: string | undefined, args: string[]): void {
	if (command === 'generate' && args[0]) generate(args[0]);
	else if (command === 'check') check();
	else if (command === 'solutions') solutions();
	else if (command === 'immutable' && args[0] && args[1]) immutable(args[0], args[1]);
	else {
		console.error('usage: node scripts/practice/cli.ts generate <dir> | check | solutions | immutable <old> <new>');
		process.exit(2);
	}
}

// Only when run as a script (tests import the helpers above).
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
	try {
		main(process.argv[2], process.argv.slice(3));
	} catch (error) {
		console.error((error as Error).message);
		process.exit(1);
	}
}
