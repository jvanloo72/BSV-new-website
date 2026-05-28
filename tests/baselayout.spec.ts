// tests/baselayout.spec.ts
//
// Focused BaseLayout sanity check — complements the broader disclaimer crawl.
// Reads dist/client/index.html directly (same filesystem approach used by
// disclaimer-crawl + jsonld-legalservice tests to avoid the
// astro-preview-vs-Vercel-adapter incompatibility introduced by Plan 01-06).
//
// 2026-05-28: the inline footer disclaimer was retired; this test no longer
// asserts a footer-disclaimer text fragment. Instead it asserts:
//   1. The header carries the firm name (or BSV Law short form).
//   2. The footer carries the four canonical linked-disclosure entries
//      (/about, /attorney-advertising, /privacy, /legal-notices).
// The broader site-wide assertion (every route, not just the homepage) lives
// in tests/disclaimer-crawl.spec.ts.

import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as cheerio from 'cheerio';

const FOOTER_LINK_PATHS = [
  '/about',
  '/attorney-advertising',
  '/privacy',
  '/legal-notices',
] as const;

test.beforeAll(() => {
  execSync('npm run build', { stdio: 'pipe' });
});

test.describe('BaseLayout integration', () => {
  test('homepage renders firm name in header and the four canonical footer links', () => {
    const html = fs.readFileSync('dist/client/index.html', 'utf-8');
    const $ = cheerio.load(html);

    const headerText = $('header').text();
    expect(headerText, 'header must contain firm name or BSV Law short form').toMatch(/Belcher.*Smolen.*Van Loo|BSV Law/);

    for (const linkPath of FOOTER_LINK_PATHS) {
      const link = $(`footer a[href="${linkPath}"]`);
      expect(link.length, `homepage footer must link to ${linkPath}`).toBeGreaterThanOrEqual(1);
    }
  });
});
