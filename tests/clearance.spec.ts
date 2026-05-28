// tests/clearance.spec.ts
//
// LEGAL-04 / Pitfall 5: every attorney representativeDeals entry marked
// `cleared: true` must have a clearance basis recorded in
// .planning/CLIENT_DISCLOSURE_CLEARANCE.md. ACTIVE now — passes vacuously while
// the placeholder attorney has no cleared deals. Once Plan 02 adds Aaron's
// 64-deal list (all cleared:true under the D-15 en-masse / URL-basis row), this
// test enforces that the register row exists.
//
// D-15 / A5: Aaron's list is cleared en masse by referencing the bsvlaw.com URL
// rather than enumerating each counterparty. This test therefore accepts the
// URL-basis row as satisfying clearance for any Aaron deal — it asserts the
// register references the source URL, not that all ~60 names are listed.

import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const ATTORNEYS_DIR = 'src/content/attorneys';
const REGISTER = '.planning/CLIENT_DISCLOSURE_CLEARANCE.md';
const AARON_SOURCE_URL = 'bsvlaw.com/team/aaron-belcher-partner';

function listMdx(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.mdx'))
    .map((e) => path.join(dir, e.name));
}

// Crude frontmatter scan: count `cleared: true` occurrences in each MDX. The
// authoritative validation is Zod at build time; this spec only cross-checks
// the clearance register, so a lightweight text scan is sufficient and avoids a
// build dependency.
function hasClearedDeals(text: string): boolean {
  return /cleared:\s*true/i.test(text);
}

test.describe('Clearance register cross-check (LEGAL-04)', () => {
  test('every attorney with cleared deals has a register basis', () => {
    const register = fs.readFileSync(REGISTER, 'utf-8');
    const failures: string[] = [];

    for (const file of listMdx(ATTORNEYS_DIR)) {
      const text = fs.readFileSync(file, 'utf-8');
      if (!hasClearedDeals(text)) continue;

      const base = path.basename(file);
      // Aaron's deals are cleared via the D-15 URL-basis row.
      if (base.startsWith('aaron-belcher')) {
        if (!register.includes(AARON_SOURCE_URL)) {
          failures.push(
            `${base} has cleared:true deals but the register lacks the D-15 URL basis (${AARON_SOURCE_URL})`,
          );
        }
        continue;
      }

      // UNSKIP-WHEN: other attorneys gain cleared deals (Plan 02+). Extend with
      // per-name register lookups as those deals are added. For now, flag so a
      // future cleared deal without a register strategy is caught.
      failures.push(
        `${base} has cleared:true deals but no clearance-basis rule is defined yet — extend clearance.spec.ts`,
      );
    }

    expect(failures, failures.join('\n')).toEqual([]);
  });
});
