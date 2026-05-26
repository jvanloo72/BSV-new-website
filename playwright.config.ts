// playwright.config.ts
//
// Wave 0 scaffold (Plan 01-00), refined in Plan 01-06.
//
// The webServer block is gated on PLAYWRIGHT_NEEDS_SERVER because Plan 01-06
// introduced a /api/csp-report serverless route that flips the build output
// from pure-static to a Vercel-adapted bundle. `astro preview` cannot serve
// that bundle (no Vercel function runtime locally) so it returns 404 on /
// and Playwright's webServer poll times out. Tests that hit the filesystem
// only (zod-negative, disclaimer-set) do not need a server and run without
// setting the env var. The disclaimer-crawl test (Plan 07) will set it and
// supply a server-capable command (likely `vercel dev` or a build + static
// serve of dist/client).

import { defineConfig } from '@playwright/test';

const needsServer = !!process.env.PLAYWRIGHT_NEEDS_SERVER;

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  workers: 1,
  use: {
    baseURL: 'http://localhost:4321',
  },
  webServer: needsServer
    ? {
        command: 'npm run build && npx astro preview',
        url: 'http://localhost:4321',
        timeout: 120_000,
        reuseExistingServer: !process.env.CI,
      }
    : undefined,
});
