import { existsSync, readdirSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

// Paths are relative (no leading slash) so they resolve under baseURL, which carries BASE_PATH
// when the site is built for GitHub Pages (see playwright.config.ts).

/** The page hydrates with empty progress first; wait until the stored progress is loaded. */
async function hydrated(page: Page) {
	await expect(page.getByRole('button', { name: /Colour scheme/ })).toBeVisible();
}

test('home page: title and chapter overview', async ({ page }) => {
	await page.goto('./');
	await hydrated(page);
	await expect(page).toHaveTitle('POS 3EHIF · Learning Site');
	await expect(page.getByRole('heading', { level: 1, name: 'POS 3EHIF · Learning Site' })).toBeVisible();
	await expect(page.getByRole('heading', { level: 2, name: 'Chapters' })).toBeVisible();
	await expect(page.getByRole('heading', { level: 3, name: 'Modern Java' })).toBeVisible();
	await expect(page.getByRole('heading', { level: 3, name: 'REST & Architecture' })).toBeVisible();
	await expect(page.getByText('Start here')).toBeVisible();
});

test('side panel: stays collapsed after a reload', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('./');
	await hydrated(page);
	const panel = page.getByRole('navigation', { name: 'Course overview' });
	await expect(panel).toBeVisible();

	const toggle = page.getByRole('button', { name: 'Course overview', exact: true });
	await toggle.click();
	await expect(panel).toBeHidden();
	await page.reload();
	await hydrated(page);
	await expect(panel).toBeHidden();
	await toggle.click();
	await expect(panel).toBeVisible();
});

test('side panel: bonus badge and placeholder module', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('./threading');
	await hydrated(page);
	await expect(page.getByRole('heading', { level: 1, name: 'Threading' })).toBeVisible();
	await expect(page.getByText('The units for this module are coming soon.')).toBeVisible();
	await expect(page.getByRole('link', { name: 'Official slide deck' })).toHaveCount(0);

	await page.goto('./modern-java-extras');
	await hydrated(page);
	await expect(page.locator('h1').getByText('Bonus')).toBeVisible();
});

test('progress page loads', async ({ page }) => {
	await page.goto('./progress');
	await hydrated(page);
	await expect(page).toHaveTitle(/My progress/);
	await expect(page.getByRole('heading', { level: 1, name: 'My progress' })).toBeVisible();
	await expect(page.getByRole('heading', { level: 2, name: 'Export' })).toBeVisible();
});

test('practice page loads', async ({ page }) => {
	await page.goto('./practice');
	await hydrated(page);
	await expect(page.getByRole('heading', { level: 1, name: 'Practice' })).toBeVisible();
	await expect(page.getByRole('heading', { level: 2, name: 'All modules' })).toBeVisible();
	// Placeholder modules are not offered for practice.
	await expect(page.getByRole('main').getByText('Threading')).toHaveCount(0);
});

test('theme toggle cycles through system, light and dark and is remembered', async ({ page }) => {
	await page.goto('./');
	await hydrated(page);
	const html = page.locator('html');
	const toggle = page.getByRole('button', { name: /Colour scheme/ });

	await expect(html).not.toHaveAttribute('data-theme', /.*/);
	await toggle.click();
	await expect(html).toHaveAttribute('data-theme', 'light');
	await toggle.click();
	await expect(html).toHaveAttribute('data-theme', 'dark');

	await page.reload();
	await expect(html).toHaveAttribute('data-theme', 'dark');
	await hydrated(page);
	await toggle.click();
	await expect(html).not.toHaveAttribute('data-theme', /.*/);
});

test('course info page loads', async ({ page }) => {
	await page.goto('./course-info');
	await hydrated(page);
	await expect(page).toHaveTitle(/Course info/);
	await expect(page.getByRole('heading', { level: 1, name: 'Course info' })).toBeVisible();
	await expect(page.getByRole('heading', { level: 2, name: 'Grading' })).toBeVisible();
	await expect(page.getByRole('heading', { level: 2, name: 'Exercises: set up once' })).toBeVisible();
	await expect(page.getByText('https://github.com/Die-Spengergasse/sj2627-pos-3ehif-course-materials')).toBeVisible();
	await expect(page.getByRole('main').getByRole('link', { name: 'Constants & Enums', exact: true })).toBeVisible();
});

test('unit: answer a knowledge check question, mark as read and see the progress', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('./');
	await hydrated(page);
	await page.getByRole('main').getByRole('link', { name: 'var, Records, Optional & switch' }).click();
	await page.getByRole('main').getByRole('link', { name: 'Optional: values that may be missing' }).click();
	await expect(page.getByRole('heading', { level: 1, name: 'Optional: values that may be missing' })).toBeVisible();

	const check = page.getByRole('region', { name: 'Question 1' });
	await check.getByText('Optional.ofNullable(numbers.get(name))').click();
	await check.getByRole('button', { name: 'Check answer' }).click();
	await expect(check.getByText('Right!')).toBeVisible();
	// The follow-up question appears once the main question was checked.
	await expect(check.getByText('Follow-up 1.1')).toBeVisible();

	await page.getByRole('button', { name: 'Mark as read' }).click();
	await expect(page.getByText('You marked this unit as read.')).toBeVisible();

	await page.goto('./modern-java-core');
	await hydrated(page);
	await expect(page.getByText('1 / 4 units read')).toBeVisible();
	await page.reload();
	await hydrated(page);
	await expect(page.getByText('1 / 4 units read')).toBeVisible();
});

test('practice: a round survives a reload and ends with the results', async ({ page }) => {
	await page.goto('./practice/modern-java-core');
	await hydrated(page);
	await page.getByRole('button', { name: 'Start round' }).click();
	await expect(page.getByText(/Question group 1 of \d+/)).toBeVisible();
	const total = Number((await page.getByText(/Question group 1 of \d+/).textContent())!.match(/of (\d+)/)![1]);

	// The run order is random, so the first group may have no radio (multi/template/line): answer only if one exists.
	const radio = page.getByRole('radio').first();
	if ((await radio.count()) > 0) await radio.check();
	await page.getByRole('button', { name: 'Next' }).click();
	await expect(page.getByText(`Question group 2 of ${total}`)).toBeVisible();

	await page.reload();
	await hydrated(page);
	await expect(page.getByText(`Question group 2 of ${total}`)).toBeVisible();

	for (let i = 2; i < total; i++) await page.getByRole('button', { name: 'Next' }).click();
	await page.getByRole('button', { name: 'Submit round' }).click();
	await expect(page.getByRole('heading', { level: 2, name: 'Results' })).toBeVisible();
	await expect(page.getByText(/\d+ of \d+ questions right\./)).toBeVisible();
});

const SWITCH_LINES = ['var type = switch (day) {', 'case SATURDAY, SUNDAY -> "Weekend";', 'default -> "Work day";', '};'];

test('line puzzle: tap the lines in order, then check the answer', async ({ page }) => {
	await page.goto('./modern-java-core/switch-expressions');
	await hydrated(page);
	const check = page.getByRole('region', { name: 'Question 1' });
	const pool = check.getByTestId('line-pool');
	await expect(pool).toBeVisible();

	for (const line of SWITCH_LINES) await pool.getByLabel(`${line}, tap to append`, { exact: true }).click();
	const placed = check.getByTestId('line-placed');
	await expect(placed.locator('.placed-line')).toHaveCount(4);
	await expect(placed.locator('.placed-line').first()).toContainText(SWITCH_LINES[0]);

	await check.getByRole('button', { name: 'Check answer' }).click();
	await expect(check.getByText('Right!')).toBeVisible();
});

test('line puzzle: keyboard moves a line into the answer and back', async ({ page }) => {
	await page.goto('./modern-java-core/switch-expressions');
	await hydrated(page);
	const check = page.getByRole('region', { name: 'Question 1' });
	await check.getByLabel(`${SWITCH_LINES[0]}, tap to append`, { exact: true }).focus();
	await page.keyboard.press('Enter');
	const placed = check.getByTestId('line-placed');
	await expect(placed.locator('.placed-line')).toHaveCount(1);
	await placed.locator('.placed-line').first().focus();
	await page.keyboard.press('Enter');
	await expect(placed.locator('.placed-line')).toHaveCount(0);
});

test('exercise card: copy the class name, mark as done, and the zip is served', async ({ page, context, request }) => {
	await context.grantPermissions(['clipboard-read', 'clipboard-write']);
	await page.goto('./modern-java-core/records');
	await hydrated(page);
	const card = page.getByRole('region', { name: 'Record: TemperatureRange' });
	await expect(card).toBeVisible();
	await expect(card.getByText('Compact constructor:')).toBeVisible();

	await card.getByRole('button', { name: 'Copy class name' }).click();
	await expect(card.getByRole('status')).toHaveText('Copied!');
	expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('TemperatureRange');

	await card.getByLabel('Done').check();
	await page.reload();
	await hydrated(page);
	await expect(page.getByRole('region', { name: 'Record: TemperatureRange' }).getByLabel('Done')).toBeChecked();

	const href = (await card.getByRole('link', { name: 'Download as zip' }).getAttribute('href'))!;
	expect(href.endsWith('/exercises/temperature-range.zip')).toBe(true);
	const zip = await request.get(new URL(href, page.url()).href);
	expect(zip.status()).toBe(200);
	expect((await zip.body()).subarray(0, 2).toString('latin1')).toBe('PK');
});

// Every module with content: each of its units renders.
const modules = readdirSync('src/content').filter((name) => name !== 'questions' && existsSync(`src/content/${name}`));

for (const module of modules) {
	test(`module ${module}: every unit renders`, async ({ page }) => {
		await page.goto(`./${module}`);
		await hydrated(page);
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

		// Slug = filename without the NN- prefix and the .md extension.
		const slugs = readdirSync(`src/content/${module}`)
			.filter((f) => f.endsWith('.md'))
			.map((f) => f.replace(/^\d+-/, '').replace(/\.md$/, ''));
		expect(slugs.length).toBeGreaterThan(0);
		for (const slug of slugs) {
			await page.goto(`./${module}/${slug}`);
			await hydrated(page);
			await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
		}
	});
}
