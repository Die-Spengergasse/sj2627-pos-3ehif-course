import { describe, expect, it } from 'vitest';
import { buildIndex, frontmatter } from './build.js';

const unit = (fm: string) => `---\n${fm}\n---\n\n# Body\n`;
const okUnit = unit('title: Enums\nminutes: 8');

const pool = (yaml: string) => ({ 'questions/enums.yaml': yaml });
const singleGroup = (id = 'enums-enum-01', unitRef = 'enums/enums', answer = 1) => `
- id: ${id}
  unit: ${unitRef}
  main:
    kind: single
    prompt: Wie speichert Java ein Enum?
    options: [Name, Ordinalzahl]
    answer: ${answer}
    explanation: Ordinalzahl.
`;

function build(files: Partial<Parameters<typeof buildIndex>[0]>) {
	return buildIndex({ units: {}, pools: {}, ...files });
}

describe('frontmatter', () => {
	it('parses the YAML block at the top', () => {
		expect(frontmatter('---\ntitle: A\nminutes: 3\n---\nbody')).toEqual({ title: 'A', minutes: 3 });
	});
	it('rejects a file without frontmatter', () => {
		expect(() => frontmatter('# Title')).toThrow(/missing frontmatter/);
	});
});

describe('buildIndex', () => {
	it('builds units with id, order and defaults', () => {
		const { index, errors } = build({ units: { 'enums/06-enums.md': okUnit, 'enums/02-entity.md': okUnit.replace('Enums', 'Entity') } });
		expect(errors).toEqual([]);
		expect(index.units.map((u) => u.id)).toEqual(['enums/entity', 'enums/enums']);
		expect(index.units[1]).toMatchObject({ module: 'enums', slug: 'enums', order: 6, core: true, status: 'draft' });
	});

	it('reports bad file names, unknown modules and invalid frontmatter', () => {
		const { errors } = build({
			units: {
				'enums/enums.md': okUnit,
				'foo/01-bar.md': okUnit,
				'enums/03-x.md': unit('title: X\nminutes: 99\nextra: 1')
			}
		});
		expect(errors).toEqual(
			expect.arrayContaining([
				expect.stringContaining('enums/enums.md: unit files must be named'),
				expect.stringContaining('unknown module "foo"'),
				expect.stringMatching(/enums\/03-x\.md: minutes: /),
				expect.stringMatching(/enums\/03-x\.md: .*extra/)
			])
		);
	});

	it('rejects units and questions for a placeholder module', () => {
		const { errors } = build({ units: { 'threading/01-intro.md': okUnit }, pools: { 'questions/threading.yaml': '[]' } });
		expect(errors).toEqual([
			'threading/01-intro.md: module "threading" is a placeholder and cannot have units yet',
			'questions/threading.yaml: module "threading" is a placeholder and cannot have questions yet'
		]);
	});

	it('reports duplicate unit numbers', () => {
		const { errors } = build({ units: { 'enums/01-a.md': okUnit, 'enums/01-b.md': okUnit } });
		expect(errors).toContain('two units share the number enums/1');
	});

	it('loads question groups and applies defaults', () => {
		const { index, errors } = build({ units: { 'enums/06-enums.md': okUnit }, pools: pool(singleGroup()) });
		expect(errors).toEqual([]);
		expect(index.groups).toHaveLength(1);
		expect(index.groups[0].followUps).toEqual([]);
	});

	it('reports unknown units, foreign modules, duplicate ids and out-of-range answers', () => {
		const { errors } = build({
			units: { 'enums/06-enums.md': okUnit },
			pools: pool(singleGroup('a') + singleGroup('a') + singleGroup('b', 'enums/nope') + singleGroup('c', 'operatoren/x') + singleGroup('d', 'enums/enums', 5))
		});
		expect(errors).toEqual(
			expect.arrayContaining([
				'duplicate question group id "a"',
				'question group "b": unit "enums/nope" does not exist',
				expect.stringContaining('group "c" refers to unit "operatoren/x" of another module'),
				expect.stringContaining('d.main: answer 5 is out of range (2 options)')
			])
		);
	});

	it('rejects more than two follow-up questions', () => {
		const q = `
      - kind: multi
        prompt: P
        options: [a, b]
        answer: [0, 1]
        explanation: E`;
		const yaml = singleGroup() + `  followUps:${q}${q}${q}\n`;
		const { errors } = build({ units: { 'enums/06-enums.md': okUnit }, pools: pool(yaml) });
		expect(errors.some((e) => e.includes('followUps'))).toBe(true);
	});

	it('reports template errors with question and line', () => {
		const yaml = `
- id: t-1
  unit: enums/enums
  main:
    kind: template
    prompt: P
    explanation: E
    template: |
      @{{Entity}}
      class A {{extends
    reusable: [Nope]
`;
		const { errors } = build({ units: { 'enums/06-enums.md': okUnit }, pools: pool(yaml) });
		expect(errors).toEqual(
			expect.arrayContaining([
				expect.stringMatching(/t-1\.main: template line 2: Marker .* never closed/),
				expect.stringContaining('t-1.main: a template needs at least 2 pieces'),
				expect.stringContaining('Reusable “Nope”')
			])
		);
	});

	describe('line questions', () => {
		const lineGroup = (body: string) => `
- id: l-1
  unit: enums/enums
  main:
    kind: line
    prompt: P
    explanation: E
${body}
`;
		const run = (body: string) => build({ units: { 'enums/06-enums.md': okUnit }, pools: pool(lineGroup(body)) });

		it('accepts lines with indentation and red herrings, and defaults red herrings to none', () => {
			const ok = run('    lines:\n      - "if (x) {"\n      - "    y();"\n      - "}"\n    redHerrings:\n      - "    z();"');
			expect(ok.errors).toEqual([]);
			expect(ok.index.groups[0].main).toMatchObject({ kind: 'line', redHerrings: ['    z();'] });
			const plain = run('    lines: [a, b]');
			expect(plain.errors).toEqual([]);
			expect(plain.index.groups[0].main).toMatchObject({ redHerrings: [] });
		});

		it('needs 2 to 30 lines and at most 15 red herrings', () => {
			expect(run('    lines: [a]').errors.some((e) => e.includes('lines'))).toBe(true);
			const many = Array.from({ length: 31 }, (_, i) => `l${i}`).join(', ');
			expect(run(`    lines: [${many}]`).errors.some((e) => e.includes('lines'))).toBe(true);
			const herrings = Array.from({ length: 16 }, (_, i) => `h${i}`).join(', ');
			expect(run(`    lines: [a, b]\n    redHerrings: [${herrings}]`).errors.some((e) => e.includes('redHerrings'))).toBe(true);
		});

		it('rejects blank, over-long, duplicate and solution-equal red herrings', () => {
			const long = 'x'.repeat(201);
			const { errors } = run(
				`    lines: [a, "   ", "${long}"]\n    redHerrings: ["  ", "${long}", "a", "q", "q", "\\ta"]`
			);
			expect(errors).toEqual(
				expect.arrayContaining([
					expect.stringContaining('l-1.main: line 2 is empty'),
					expect.stringContaining('line 3 is longer than 200'),
					expect.stringContaining('red herring 1 is empty'),
					expect.stringContaining('red herring 2 is longer than 200'),
					expect.stringContaining('red herring "a" also occurs in the solution'),
					expect.stringContaining('duplicate red herring "q"')
				])
			);
		});

		it('compares red herrings with the solution after normalising whitespace', () => {
			const { errors } = run('    lines: ["    a", b]\n    redHerrings: ["\\ta  "]');
			expect(errors.some((e) => e.includes('also occurs in the solution'))).toBe(true);
		});

		it('rejects unknown fields', () => {
			expect(run('    lines: [a, b]\n    distractors: [c]').errors.length).toBeGreaterThan(0);
		});
	});
});
