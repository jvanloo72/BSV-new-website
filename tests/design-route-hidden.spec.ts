// tests/design-route-hidden.spec.ts
//
// D-16: the internal /_design gallery must NOT be discoverable by search
// engines. Two independent guards:
//   - it is ABSENT from the generated sitemap (sitemap filter in astro.config),
//   - its rendered HTML carries a `noindex` robots directive.
//
// Idiom A (analog: tests/disclaimer-crawl.spec.ts) — build first, then read the
// sitemap + the /_design HTML from disk. We reuse the same sitemap-on-disk read
// pattern as the disclaimer crawl (the Vercel adapter writes the sitemap under
// dist/client/sitemap-0.xml).
//
// SKIPPED today because /_design and the sitemap filter do not exist yet.
//
// UNSKIP WHEN: /_design route + sitemap filter live — 02-01

import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

const DIST_CLIENT = 'dist/client';
const DESIGN_HTML = path.join(DIST_CLIENT, '_design', 'index.html');
const SITEMAP_CANDIDATES = ['sitemap-0.xml', 'sitemap-index.xml', 'sitemap.xml'];

function readAllSitemapXml(): string {
  // Concatenate every sitemap XML file present so a single string search covers
  // both a flat urlset and a sitemap-index + children layout.
  let combined = '';
  for (const candidate of SITEMAP_CANDIDATES) {
    const filePath = path.join(DIST_CLIENT, candidate);
    if (fs.existsSync(filePath)) {
      combined += fs.readFileSync(filePath, 'utf-8');
    }
  }
  // Also fold in any numbered child sitemaps.
  for (const entry of fs.existsSync(DIST_CLIENT) ? fs.readdirSync(DIST_CLIENT) : []) {
    if (/^sitemap-\d+\.xml$/.test(entry) && !SITEMAP_CANDIDATES.includes(entry)) {
      combined += fs.readFileSync(path.join(DIST_CLIENT, entry), 'utf-8');
    }
  }
  return combined;
}

test.describe.skip('Hidden /_design route (D-16)', () => {
  test.beforeAll(() => {
    execSync('npm run build', { stdio: 'pipe' });
  });

  test('/_design is absent from the sitemap', () => {
    const xml = readAllSitemapXml();
    expect(xml.length, 'a sitemap must exist').toBeGreaterThan(0);
    expect(xml.includes('_design'), 'sitemap must not reference /_design').toBe(false);
  });

  test('/_design HTML carries a noindex robots directive', () => {
    const html = fs.readFileSync(DESIGN_HTML, 'utf-8');
    expect(html, '/_design must declare noindex').toContain('noindex');
  });
});
