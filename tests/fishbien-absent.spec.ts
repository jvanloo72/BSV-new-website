// tests/fishbien-absent.spec.ts
//
// ATTY-11: the former-attorney name "Fishbien" / "Nir" must appear in NO
// authored content. ACTIVE now over src/content (filesystem). The built-HTML +
// sitemap sweep is UNSKIPPED once Phase 4 content + a build land — see the
// fixme block below.

import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const FORBIDDEN = /fishbien|\bnir\b/i;
const CONTENT_DIR = 'src/content';

function collectFiles(dir: string, exts: string[]): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectFiles(full, exts));
    else if (exts.some((e) => entry.name.endsWith(e))) out.push(full);
  }
  return out;
}

test.describe('Fishbien / Nir absent (ATTY-11)', () => {
  test('no authored src/content file mentions the forbidden name', () => {
    const files = collectFiles(CONTENT_DIR, ['.mdx', '.json']);
    const hits: string[] = [];
    for (const f of files) {
      const text = fs.readFileSync(f, 'utf-8');
      if (FORBIDDEN.test(text)) hits.push(f);
    }
    expect(hits, `Files mentioning the forbidden name:\n${hits.join('\n')}`).toEqual([]);
  });

  // UNSKIP-WHEN: Phase 4 content + build exist (this plan ships only the
  // scaffold; Plan 02/03/04 add the attorney/practice pages). Then assert the
  // name is absent from dist/client/**/*.html and the sitemap too.
  test.fixme('forbidden name absent from built HTML + sitemap', () => {
    // execSync('npm run build'); walk dist/client/**/*.html + sitemap, assert
    // FORBIDDEN matches zero rendered pages and zero sitemap <loc> entries.
  });
});
