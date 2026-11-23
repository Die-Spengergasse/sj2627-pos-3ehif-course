export const REPO_URL = 'https://github.com/Die-Spengergasse/sj2627-pos-3ehif-course';

/** Prefilled GitHub issue for reporting a mistake on a page. */
export function reportIssueUrl(what: string, title: string, pageUrl: string): string {
	const params = new URLSearchParams({
		title: `Mistake in ${what}: ${title}`,
		body: `Page: ${pageUrl}\n\nWhat is wrong?\n\n`,
		labels: 'inhalt'
	});
	return `${REPO_URL}/issues/new?${params}`;
}
