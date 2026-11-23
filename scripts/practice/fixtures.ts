/** Test helpers: builds a temporary repository root with practice/<slug>/ folders. */
import { cpSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

export const PKG = 'at.spengergasse.pos3.modernjava.demorecord';

export type Files = Record<string, string>;

export function exerciseFiles(overrides: Files = {}, slug = 'demo-record'): Files {
	return {
		'exercise.yaml': `id: ${slug}\ntitle: Demo\nmodule: modern-java-core\nkind: core\nclassName: Demo\npublished: true\n`,
		'task.md': 'Implement `twice`.\n',
		'main/Demo.java': `package ${PKG};\n\n@SuppressWarnings("unused")\npublic record Demo(int value) {\n    public int twice() {\n        throw new UnsupportedOperationException();\n    }\n}\n`,
		'test/DemoTest.java': `package ${PKG};\n\nclass DemoTest {}\n`,
		...overrides
	};
}

/** A temp root with the real template and the given exercises (slug -> files; a null file is left out). */
export function tempRoot(exercises: Record<string, Files>): string {
	const root = mkdtempSync(join(tmpdir(), 'pos3-practice-test-'));
	cpSync(join(process.cwd(), 'practice', '_template'), join(root, 'practice', '_template'), { recursive: true });
	for (const [slug, files] of Object.entries(exercises)) {
		for (const [path, content] of Object.entries(files)) {
			const file = join(root, 'practice', slug, path);
			mkdirSync(dirname(file), { recursive: true });
			writeFileSync(file, content);
		}
	}
	return root;
}
