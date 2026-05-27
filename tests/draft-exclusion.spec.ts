// tests/draft-exclusion.spec.ts
//
// ATTY-06: Susan (Kezhen) Jiang is PUBLISHED (draft: false) per Jon's
// 2026-05-27 instruction — her real bio is on the live bsvlaw.com site, so D-07
// (ship hidden) is superseded. This spec now verifies (a) her page builds and
// is in the sitemap like the other attorneys, and (b) the draft-filtering
// mechanism in the [slug] route is still in place to guard any FUTURE draft.

import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

const DIST_CLIENT = 'dist/client';
const SLUG = 'susan-jiang';

test.describe('Attorney publication + draft mechanism (ATTY-06)', () => {
  test('susan-jiang route is built and present in the sitemap', () => {
    execSync('npm run build', { stdio: 'pipe' });

    const routeFile = path.join(DIST_CLIENT, 'attorneys', SLUG, 'index.html');
    expect(fs.existsSync(routeFile), `${routeFile} must exist (Susan is published)`).toBe(true);

    const candidates = ['sitemap-0.xml', 'sitemap-index.xml', 'sitemap.xml'];
    const sitemaps = candidates
      .map((c) => path.join(DIST_CLIENT, c))
      .filter((p) => fs.existsSync(p));
    // At least one sitemap should reference the published slug.
    const referenced = sitemaps.some((sm) => fs.readFileSync(sm, 'utf-8').includes(SLUG));
    expect(referenced, `a sitemap must reference ${SLUG}`).toBe(true);
  });

  test('the [slug] route still filters drafts (mechanism intact for future drafts)', () => {
    const route = fs.readFileSync(
      path.join('src', 'pages', 'attorneys', '[slug].astro'),
      'utf-8',
    );
    expect(route.includes('!data.draft'), '[slug].astro must still filter draft entries').toBe(true);
  });
});
