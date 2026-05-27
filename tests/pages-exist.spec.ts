// tests/pages-exist.spec.ts
//
// ATTY-01 / PRAC-01: the four published attorney pages and three practice-area
// pages must build to real HTML files.
//
// SCAFFOLD — fixme until Plan 02/03/04 ship the content. UNSKIP-WHEN: the seven
// MDX files exist and a build runs.

import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

const DIST_CLIENT = 'dist/client';
const ATTORNEY_SLUGS = ['aaron-belcher', 'stuart-smolen', 'jon-van-loo', 'iris-zhang'];
const PRACTICE_SLUGS = [
  'mergers-acquisitions',
  'intellectual-property-technology-transactions',
  'tax',
];

test.describe('Published pages exist (ATTY-01 / PRAC-01)', () => {
  // UNSKIP-WHEN: attorney + practice content exists.
  test.fixme('all four attorney + three practice pages render to HTML', () => {
    execSync('npm run build', { stdio: 'pipe' });
    const missing: string[] = [];
    for (const slug of ATTORNEY_SLUGS) {
      const f = path.join(DIST_CLIENT, 'attorneys', slug, 'index.html');
      if (!fs.existsSync(f)) missing.push(f);
    }
    for (const slug of PRACTICE_SLUGS) {
      const f = path.join(DIST_CLIENT, 'practice-areas', slug, 'index.html');
      if (!fs.existsSync(f)) missing.push(f);
    }
    expect(missing, `Missing pages:\n${missing.join('\n')}`).toEqual([]);
  });
});
