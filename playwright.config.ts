import { defineConfig, devices } from '@playwright/test';

// Smoke test against the prerendered site. Run `npm run build` first.
// If the site was built with BASE_PATH (GitHub Pages), set the same BASE_PATH here: `vite preview`
// then serves under that path and baseURL points there. The trailing slash lets tests use
// relative paths such as page.goto('./fortschritt').
const base = process.env.BASE_PATH ?? '';
const origin = 'http://localhost:4173';
const siteUrl = `${origin}${base}/`;

export default defineConfig({
	testDir: 'e2e',
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? 'github' : 'list',
	use: { baseURL: siteUrl, trace: 'retain-on-failure' },
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		command: 'npm run preview -- --port 4173 --strictPort',
		url: siteUrl,
		reuseExistingServer: !process.env.CI
	}
});
