// tests/draft-exclusion.spec.ts
//
// ATTY-06 / D-07: Susan Jiang ships draft:true — no /attorneys/susan-jiang
// route may be built and her slug must be absent from the sitemap.
//
// SCAFFOLD — fixme until Plan 02 adds susan-jiang.mdx (draft:true) and a build
// exists. UNSKIP-WHEN: src/content/attorneys/susan-jiang.mdx exists.

import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

const DIST_CLIENT = 'dist/client';
const DRAFT_SLUG = 'susan-jiang';

test.describe('Draft attorney exclusion (ATTY-06 / D-07)', () => {
  test('no susan-jiang route built and slug absent from sitemap', () => {
    execSync('npm run build', { stdio: 'pipe' });

    const routeFile = path.join(DIST_CLIENT, 'attorneys', DRAFT_SLUG, 'index.html');
    expect(fs.existsSync(routeFile), `${routeFile} must NOT exist`).toBe(false);

    // sitemap sweep
    const candidates = ['sitemap-0.xml', 'sitemap-index.xml', 'sitemap.xml'];
    const sitemaps = candidates
      .map((c) => path.join(DIST_CLIENT, c))
      .filter((p) => fs.existsSync(p));
    for (const sm of sitemaps) {
      const xml = fs.readFileSync(sm, 'utf-8');
      expect(xml.includes(DRAFT_SLUG), `${sm} must not reference ${DRAFT_SLUG}`).toBe(false);
    }
  });
});
