// tests/baselayout.spec.ts
//
// Focused BaseLayout sanity check — complements the broader disclaimer crawl.
// Reads dist/client/index.html directly (same filesystem approach used by
// disclaimer-crawl + jsonld-legalservice tests to avoid the
// astro-preview-vs-Vercel-adapter incompatibility introduced by Plan 01-06).

import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as cheerio from 'cheerio';

const FOOTER_DISCLAIMER_FRAGMENT =
  'The information on this website is for general informational purposes only';

test.beforeAll(() => {
  execSync('npm run build', { stdio: 'pipe' });
});

test.describe('BaseLayout integration', () => {
  test('homepage renders firm name in header and disclaimer in footer', () => {
    const html = fs.readFileSync('dist/client/index.html', 'utf-8');
    const $ = cheerio.load(html);

    const headerText = $('header').text();
    expect(headerText, 'header must contain firm name or BSV Law short form').toMatch(/Belcher.*Smolen.*Van Loo|BSV Law/);

    const footerText = $('footer').text();
    expect(footerText, 'footer must contain the canonical disclaimer fragment').toContain(FOOTER_DISCLAIMER_FRAGMENT);
  });
});
