import { readdirSync } from 'node:fs';
import { expect, test, type Page } from '@playwright/test';

// Paths are relative (no leading slash) so they resolve under baseURL, which carries BASE_PATH
// when the site is built for GitHub Pages (see playwright.config.ts).

/** The page hydrates with empty progress first; wait until the stored progress is loaded. */
async function hydrated(page: Page) {
	await expect(page.getByRole('button', { name: /Farbschema/ })).toBeVisible();
}

test('home page: title and chapter overview', async ({ page }) => {
	await page.goto('./');
	await hydrated(page);
	await expect(page).toHaveTitle('POS 3EHIF · Learning Site');
	await expect(page.getByRole('heading', { level: 1, name: 'POS 3EHIF · Learning Site' })).toBeVisible();
	await expect(page.getByRole('heading', { level: 2, name: 'Kapitel' })).toBeVisible();
	await expect(page.getByRole('heading', { level: 3, name: 'Grundlagen & Algorithmen' })).toBeVisible();
	await expect(page.getByRole('heading', { level: 3, name: 'OO-Einstieg' })).toBeVisible();
});

test('side panel: stays collapsed after a reload', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('./');
	await hydrated(page);
	const panel = page.getByRole('navigation', { name: 'Kursübersicht' });
	await expect(panel).toBeVisible();

	const toggle = page.getByRole('button', { name: 'Kursübersicht', exact: true });
	await toggle.click();
	await expect(panel).toBeHidden();
	await page.reload();
	await hydrated(page);
	await expect(panel).toBeHidden();
	await toggle.click();
	await expect(panel).toBeVisible();
});

test('Fortschritt page loads', async ({ page }) => {
	await page.goto('./fortschritt');
	await hydrated(page);
	await expect(page).toHaveTitle(/Mein Fortschritt/);
	await expect(page.getByRole('heading', { level: 1, name: 'Mein Fortschritt' })).toBeVisible();
	await expect(page.getByRole('heading', { level: 2, name: 'Exportieren' })).toBeVisible();
});

test('Üben page loads', async ({ page }) => {
	await page.goto('./ueben');
	await hydrated(page);
	await expect(page.getByRole('heading', { level: 1, name: 'Üben' })).toBeVisible();
	await expect(page.getByRole('heading', { level: 2, name: 'Alle Module' })).toBeVisible();
});

test('theme toggle cycles through system, light and dark and is remembered', async ({ page }) => {
	await page.goto('./');
	await hydrated(page);
	const html = page.locator('html');
	const toggle = page.getByRole('button', { name: /Farbschema/ });

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

test('Kursinfo page loads', async ({ page }) => {
	await page.goto('./kursinfo');
	await hydrated(page);
	await expect(page).toHaveTitle(/Kursinfo/);
	await expect(page.getByRole('heading', { level: 1, name: 'Kursinfo' })).toBeVisible();
	await expect(page.getByRole('heading', { level: 2, name: 'Bewertung' })).toBeVisible();
	await expect(page.getByRole('heading', { level: 2, name: 'Setup: J;DE' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Datentypen', exact: true }).first()).toBeVisible();
});

test('unit: read it, answer a Wissenscheck question, mark as read and see the progress', async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 800 });
	await page.goto('./');
	await hydrated(page);
	await page.getByRole('link', { name: 'Was ist Programmieren?' }).first().click();
	await page.getByRole('link', { name: 'Programme und Programmiersprachen' }).first().click();
	await expect(page.getByRole('heading', { level: 1, name: 'Programme und Programmiersprachen' })).toBeVisible();

	const check = page.getByRole('region', { name: 'Frage 1' });
	await check.getByText('Eine Folge von Anweisungen an den Computer').click();
	await check.getByRole('button', { name: 'Antwort prüfen' }).click();
	await expect(check.getByText('Richtig!')).toBeVisible();
	// The Vertiefungsfrage appears once the main question was checked.
	await expect(check.getByText('Vertiefung 1.1')).toBeVisible();

	await page.getByRole('button', { name: 'Als gelesen markieren' }).click();
	await expect(page.getByText('Du hast diese Einheit als gelesen markiert.')).toBeVisible();

	await page.goto('./was-ist-programmieren');
	await hydrated(page);
	await expect(page.getByText('1 / 3 Einheiten gelesen')).toBeVisible();
	await page.reload();
	await hydrated(page);
	await expect(page.getByText('1 / 3 Einheiten gelesen')).toBeVisible();
});

test('Üben: a run survives a reload and ends with the Auswertung', async ({ page }) => {
	await page.goto('./ueben/datentypen');
	await hydrated(page);
	await page.getByRole('button', { name: 'Runde starten' }).click();
	await expect(page.getByText(/Fragengruppe 1 von \d+/)).toBeVisible();
	const total = Number((await page.getByText(/Fragengruppe 1 von \d+/).textContent())!.match(/von (\d+)/)![1]);

	// The run order is random, so the first group may have no radio (multi/template/line): answer only if one exists.
	const radio = page.getByRole('radio').first();
	if ((await radio.count()) > 0) await radio.check();
	await page.getByRole('button', { name: 'Weiter' }).click();
	await expect(page.getByText(`Fragengruppe 2 von ${total}`)).toBeVisible();

	await page.reload();
	await hydrated(page);
	await expect(page.getByText(`Fragengruppe 2 von ${total}`)).toBeVisible();

	for (let i = 2; i < total; i++) await page.getByRole('button', { name: 'Weiter' }).click();
	await page.getByRole('button', { name: 'Runde abgeben' }).click();
	await expect(page.getByRole('heading', { level: 2, name: 'Auswertung' })).toBeVisible();
	await expect(page.getByText(/\d+ von \d+ Fragen richtig\./)).toBeVisible();
});

test('line puzzle: tap the lines in order, then check the answer', async ({ page }) => {
	await page.goto('./datentypen/speicher-und-initialisierung');
	await hydrated(page);
	const check = page.getByRole('region', { name: 'Frage 2' });
	const pool = check.getByTestId('line-pool');
	await expect(pool).toBeVisible();

	for (const line of ['int punkte;', 'punkte = 2500;', 'System.out.println("Punkte: " + punkte);']) {
		await pool.getByLabel(`${line}, antippen zum Anhängen`, { exact: true }).click();
	}
	const placed = check.getByTestId('line-placed');
	await expect(placed.locator('.placed-line')).toHaveCount(3);
	await expect(placed.locator('.placed-line').first()).toContainText('int punkte;');

	await check.getByRole('button', { name: 'Antwort prüfen' }).click();
	await expect(check.getByText('Richtig!')).toBeVisible();
});

test('line puzzle: keyboard moves a line into the answer and back', async ({ page }) => {
	await page.goto('./datentypen/speicher-und-initialisierung');
	await hydrated(page);
	const check = page.getByRole('region', { name: 'Frage 2' });
	const line = check.getByLabel('int punkte;, antippen zum Anhängen', { exact: true });
	await line.focus();
	await page.keyboard.press('Enter');
	const placed = check.getByTestId('line-placed');
	await expect(placed.locator('.placed-line')).toHaveCount(1);
	await placed.locator('.placed-line').first().focus();
	await page.keyboard.press('Enter');
	await expect(placed.locator('.placed-line')).toHaveCount(0);
});

const modules = [
	'operatoren',
	'zuweisung',
	'verzweigung',
	'user-input',
	'schleifen-while',
	'schleifen-do-while',
	'schleifen-for',
	'arrays',
	'sortieren',
	'string-methoden',
	'convert',
	'switch-case',
	'funktionen',
	'repl',
	'oo-intro',
	'konstruktoren',
	'this-setter-getter',
	'referenzen',
	'uml',
	'javadoc',
	'dateioperationen'
];

for (const module of modules) {
	test(`module ${module}: every unit renders`, async ({ page }) => {
		await page.goto(`./${module}`);
		await hydrated(page);
		await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

		// Every unit of the module: slug = filename without the NN- prefix and the .md extension.
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

test('practice button: J;DE link with the zip URL, and the zip is served', async ({ page, request }) => {
	await page.goto('./verzweigung/if-und-else');
	await hydrated(page);
	const button = page.getByRole('link', { name: /Übe in J;DE: Gerade oder ungerade/ });
	await expect(button).toBeVisible();

	const href = (await button.getAttribute('href'))!;
	expect(href.startsWith('jide://practice?src=')).toBe(true);
	const src = decodeURIComponent(href.slice('jide://practice?src='.length));
	expect(src.startsWith('https://die-spengergasse.github.io/')).toBe(true);
	expect(src.endsWith('/practice/gerade-ungerade.zip')).toBe(true);
	// The hint links to the J;DE download.
	await expect(page.getByRole('link', { name: 'Download' })).toHaveAttribute(
		'href',
		'https://github.com/mfreimueller/jide/releases/latest'
	);

	// The zip lives next to the pages of this build (same path as in the link, without the origin).
	const zip = await request.get('./practice/gerade-ungerade.zip');
	expect(zip.status()).toBe(200);
	const body = await zip.body();
	expect(body.subarray(0, 2).toString('latin1')).toBe('PK');
});
