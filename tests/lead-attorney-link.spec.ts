// tests/lead-attorney-link.spec.ts
//
// PRAC-06: each practice-area page must link to its lead attorney's profile
// (M&A -> aaron-belcher, IP&Tech -> stuart-smolen, Tax -> jon-van-loo; D-11).
// The lead reference is resolved via getEntries() in PracticeAreaLayout, then
// rendered as href="/attorneys/<slug>".
//
// SCAFFOLD — fixme until Plan 03/04 ship practice pages with resolved lead
// callouts. UNSKIP-WHEN: practice-area MDX + PracticeAreaLayout lead link exist.

import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as cheerio from 'cheerio';

const DIST_CLIENT = 'dist/client';
const LEAD: Record<string, string> = {
  'mergers-acquisitions': 'aaron-belcher',
  'intellectual-property-technology-transactions': 'stuart-smolen',
  tax: 'jon-van-loo',
};

test.describe('Lead-attorney link (PRAC-06)', () => {
  // Active as of Plan 03 — practice pages render the lead-attorney callout link.
  test('each practice page links to its lead attorney profile', () => {
    execSync('npm run build', { stdio: 'pipe' });
    const failures: string[] = [];
    for (const [practice, leadSlug] of Object.entries(LEAD)) {
      const f = path.join(DIST_CLIENT, 'practice-areas', practice, 'index.html');
      if (!fs.existsSync(f)) {
        failures.push(`${practice}: page not built`);
        continue;
      }
      const $ = cheerio.load(fs.readFileSync(f, 'utf-8'));
      const href = `/attorneys/${leadSlug}`;
      const found = $(`a[href="${href}"], a[href="${href}/"]`).length > 0;
      if (!found) failures.push(`${practice}: missing link to ${href}`);
    }
    expect(failures, failures.join('\n')).toEqual([]);
  });
});
