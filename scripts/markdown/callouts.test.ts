import { describe, expect, it } from 'vitest';
import { transformCallouts } from './callouts.ts';

describe('transformCallouts', () => {
	it('wraps a callout in an aside with its default title', () => {
		expect(transformCallouts(':::remember\nText\n:::')).toBe(
			'<aside class="callout callout-remember">\n<p class="callout-title">Remember</p>\n\nText\n\n</aside>'
		);
	});

	it('uses a custom title', () => {
		expect(transformCallouts(':::warning Wrong import\nx\n:::')).toContain(
			'<p class="callout-title">Wrong import</p>'
		);
	});

	it('escapes HTML in titles', () => {
		expect(transformCallouts(':::remember List<String>\nx\n:::')).toContain('List&lt;String&gt;');
	});

	it('renders inline code in titles', () => {
		expect(transformCallouts(':::warning `get()` without a check\nx\n:::')).toContain(
			'<p class="callout-title"><code>get()</code> without a check</p>'
		);
		expect(transformCallouts(':::remember `List<T>`\nx\n:::')).toContain('<code>List&lt;T&gt;</code>');
	});

	it('leaves code fences alone', () => {
		const src = '```text\n:::remember\n:::\n```';
		expect(transformCallouts(src)).toBe(src);
	});

	it('rejects unknown, nested, unclosed and stray callouts with line numbers', () => {
		expect(() => transformCallouts('a\n:::tip\n:::', 'u.md')).toThrow('u.md:2: unknown callout ":::tip"');
		expect(() => transformCallouts(':::remember\n:::warning\n:::\n:::')).toThrow(/cannot be nested/);
		expect(() => transformCallouts(':::remember\ntext')).toThrow(/:1: callout is never closed/);
		expect(() => transformCallouts('text\n:::')).toThrow(/:2: ":::" without an opening callout/);
	});
});
