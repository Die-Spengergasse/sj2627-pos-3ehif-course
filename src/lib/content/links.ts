export const REPO_URL = 'https://github.com/Die-Spengergasse/sj2627-pos-3ehif-course';

/** The generated Gradle project with all exercises, which students clone once in IntelliJ. */
export const MATERIALS_REPO_URL = 'https://github.com/Die-Spengergasse/sj2627-pos-3ehif-course-materials';

/** Prefilled GitHub issue for reporting a mistake on a page. */
export function reportIssueUrl(what: string, title: string, pageUrl: string): string {
	const params = new URLSearchParams({
		title: `Mistake in ${what}: ${title}`,
		body: `Page: ${pageUrl}\n\nWhat is wrong?\n\n`,
		labels: 'content'
	});
	return `${REPO_URL}/issues/new?${params}`;
}
