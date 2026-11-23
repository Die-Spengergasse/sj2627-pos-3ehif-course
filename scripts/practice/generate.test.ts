import { mkdtempSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { unzipSync } from 'fflate';
import { describe, expect, it } from 'vitest';
import { changedExerciseFiles, readResults } from './cli.ts';
import { loadExercises } from './exercises.ts';
import { chapterBuildGradle, materialsTree, settingsGradle, withTask, writeTree, zipBytes, zipTree } from './generate.ts';
import { exerciseFiles, PKG, tempRoot } from './fixtures.ts';

const decode = (data: Uint8Array | undefined) => new TextDecoder().decode(data);

function setup(published = true) {
	const yaml = exerciseFiles()['exercise.yaml'].replace('published: true', `published: ${published}`);
	const root = tempRoot({
		'demo-record': exerciseFiles({ 'exercise.yaml': yaml, 'solution/Demo.java': `package ${PKG};\n\npublic record Demo(int value) {}\n` })
	});
	return { template: join(root, 'practice', '_template'), exercises: loadExercises(root) };
}

describe('withTask', () => {
	it('puts the task as a /// comment above the type and its annotations', () => {
		const out = withTask('package p;\n\nimport x.Y;\n\n@Deprecated\npublic record Demo(int v) {}\n', 'Demo', 'Demo', 'Line 1\n\nLine 2');
		expect(out).toBe('package p;\n\nimport x.Y;\n\n/// # Demo\n///\n/// Line 1\n///\n/// Line 2\n@Deprecated\npublic record Demo(int v) {}\n');
	});
});

describe('materialsTree', () => {
	it('builds a Gradle multi-project with one subproject per chapter', () => {
		const { template, exercises } = setup();
		const tree = materialsTree(template, exercises);
		expect([...tree.keys()]).toEqual([
			'.gitattributes',
			'.gitignore',
			'gradle.properties',
			'gradle/libs.versions.toml',
			'gradle/wrapper/gradle-wrapper.jar',
			'gradle/wrapper/gradle-wrapper.properties',
			'gradlew',
			'gradlew.bat',
			'modern-java/build.gradle.kts',
			'modern-java/src/main/java/at/spengergasse/pos3/modernjava/demorecord/Demo.java',
			'modern-java/src/test/java/at/spengergasse/pos3/modernjava/demorecord/DemoTest.java',
			'README.md',
			'settings.gradle.kts'
		]);
		expect(tree.get('gradlew')?.executable).toBe(true);
		expect(decode(tree.get('settings.gradle.kts')?.data)).toContain('include("modern-java")');
		const main = decode(tree.get('modern-java/src/main/java/at/spengergasse/pos3/modernjava/demorecord/Demo.java')?.data);
		expect(main).toContain('/// # Demo\n///\n/// Implement `twice`.\n@SuppressWarnings("unused")\npublic record Demo');
		expect(main).toContain('UnsupportedOperationException');
		const readme = decode(tree.get('README.md')?.data);
		expect(readme).toContain('| Chapter 1 · var, Records, Optional & switch | Demo | `Demo` |');
		expect(readme).toContain('If JDK 27 is missing');
	});

	it('leaves out unpublished exercises and can swap in the solution', () => {
		const hidden = setup(false);
		expect([...materialsTree(hidden.template, hidden.exercises).keys()].some((p) => p.includes('/src/'))).toBe(false);

		const { template, exercises } = setup();
		const solved = materialsTree(template, exercises, { useSolution: true });
		const main = decode(solved.get('modern-java/src/main/java/at/spengergasse/pos3/modernjava/demorecord/Demo.java')?.data);
		expect(main).not.toContain('UnsupportedOperationException');
		expect(main).toContain('/// # Demo');
	});

	it('writes the build scripts', () => {
		expect(settingsGradle('x', ['modern-java', 'rest'])).toContain('include("modern-java")\ninclude("rest")');
		const build = chapterBuildGradle('rest', 'dependencies {\n    implementation("a:b:1")\n}');
		expect(build).toContain('JavaLanguageVersion.of(libs.versions.java.get().toInt())');
		expect(build).toContain('implementation("a:b:1")');
		expect(build).toContain('// Exercises of the chapter "REST & Architecture".');
	});
});

describe('zip and files', () => {
	it('zips one exercise deterministically, gradlew stays executable', () => {
		const { template, exercises } = setup();
		const a = zipBytes(zipTree(template, exercises[0]));
		const b = zipBytes(zipTree(template, exercises[0]));
		expect(Buffer.from(a).equals(Buffer.from(b))).toBe(true);
		const files = unzipSync(a);
		expect(decode(files['settings.gradle.kts'])).toContain('rootProject.name = "pos3-demo-record"');
		expect(decode(files['README.md'])).toContain('Open this folder in IntelliJ');
	});

	it('writes a tree to disk, keeps .git and removes old files', () => {
		const { template, exercises } = setup();
		const dir = mkdtempSync(join(tmpdir(), 'pos3-write-'));
		mkdirSync(join(dir, '.git'));
		writeFileSync(join(dir, '.git', 'HEAD'), 'ref');
		writeFileSync(join(dir, 'stale.txt'), 'x');
		writeTree(materialsTree(template, exercises), dir);
		expect(readFileSync(join(dir, '.git', 'HEAD'), 'utf8')).toBe('ref');
		expect(() => statSync(join(dir, 'stale.txt'))).toThrow();
		expect(statSync(join(dir, 'gradlew')).mode & 0o111).not.toBe(0);
	});
});

describe('immutability check', () => {
	it('reports changed or removed exercise sources, but not build files or the README', () => {
		const { template, exercises } = setup();
		const oldDir = mkdtempSync(join(tmpdir(), 'pos3-old-'));
		const newDir = mkdtempSync(join(tmpdir(), 'pos3-new-'));
		writeTree(materialsTree(template, exercises), oldDir);
		writeTree(materialsTree(template, exercises), newDir);
		expect(changedExerciseFiles(oldDir, newDir)).toEqual([]);

		const main = 'modern-java/src/main/java/at/spengergasse/pos3/modernjava/demorecord/Demo.java';
		writeFileSync(join(newDir, main), 'changed');
		writeFileSync(join(newDir, 'README.md'), 'changed');
		expect(changedExerciseFiles(oldDir, newDir)).toEqual([main]);
	});
});

describe('readResults', () => {
	it('reads tests and failures per test class from the JUnit XML reports', () => {
		const dir = mkdtempSync(join(tmpdir(), 'pos3-results-'));
		const reports = join(dir, 'modern-java', 'build', 'test-results', 'test');
		mkdirSync(reports, { recursive: true });
		writeFileSync(
			join(reports, 'TEST-a.DemoTest.xml'),
			'<?xml version="1.0"?>\n<testsuite name="a.DemoTest" tests="9" skipped="0" failures="7" errors="1" timestamp="x">\n</testsuite>'
		);
		expect(readResults(dir)).toEqual(new Map([['a.DemoTest', { tests: 9, failed: 8 }]]));
	});
});
