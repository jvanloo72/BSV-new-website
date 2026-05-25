// playwright.config.ts
//
// Wave 0 scaffold. Plan 01-00 creates this file BEFORE the first `npm install`
// runs (Playwright is installed in Plan 01 after the `checkpoint:human-verify`
// gate). The import below is valid TypeScript regardless of whether the
// `@playwright/test` package is installed — it only resolves at runtime.
//
// Source: 01-RESEARCH.md §"Pattern 8: Playwright disclaimer-crawl test (D-25)".
// webServer command builds the site and serves it via `astro preview` on the
// canonical Astro default port (4321).

import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  workers: 1,
  use: {
    baseURL: 'http://localhost:4321',
  },
  webServer: {
    command: 'npm run build && npx astro preview',
    url: 'http://localhost:4321',
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
