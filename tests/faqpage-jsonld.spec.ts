// tests/faqpage-jsonld.spec.ts
//
// PRAC-08 / SEO-05: each practice-area page that has FAQs must carry a valid
// FAQPage JSON-LD block whose mainEntity Question/Answer count equals the count
// of visible <details> FAQ items. (Validity for AEO/AI-search — NOT a Google
// rich-result gate; see 04-RESEARCH Pitfall 2.)
//
// SCAFFOLD — fixme until Plan 03/04 ship practice pages with Jon-approved FAQs
// (D-13 human gate). UNSKIP-WHEN: src/content/practiceAreas/*.mdx carry faqs
// and PracticeAreaLayout emits <JsonLd data={buildFaqPageLd(faqs)} /> guarded on
// faqs.length > 0.

import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as cheerio from 'cheerio';

const DIST_CLIENT = 'dist/client';
const PRACTICE_SLUGS = [
  'mergers-acquisitions',
  'intellectual-property-technology-transactions',
  'tax',
];

test.describe('FAQPage JSON-LD (PRAC-08 / SEO-05)', () => {
  // UNSKIP-WHEN: practice pages + approved FAQs exist.
  test.fixme('FAQPage mainEntity count matches visible FAQ accordion items', () => {
    execSync('npm run build', { stdio: 'pipe' });
    const failures: string[] = [];
    for (const slug of PRACTICE_SLUGS) {
      const file = path.join(DIST_CLIENT, 'practice-areas', slug, 'index.html');
      if (!fs.existsSync(file)) {
        failures.push(`${slug}: page not built`);
        continue;
      }
      const $ = cheerio.load(fs.readFileSync(file, 'utf-8'));
      let faqLd: Record<string, unknown> | null = null;
      for (const s of $('script[type="application/ld+json"]').toArray()) {
        const parsed = JSON.parse($(s).html() ?? '{}');
        if (parsed['@type'] === 'FAQPage') faqLd = parsed;
      }
      const visibleCount = $('details').length;
      if (visibleCount === 0) continue; // pages with no FAQ guard out the block
      if (!faqLd) {
        failures.push(`${slug}: visible FAQs present but no FAQPage JSON-LD`);
        continue;
      }
      const entities = Array.isArray(faqLd.mainEntity) ? faqLd.mainEntity : [];
      if (entities.length !== visibleCount) {
        failures.push(`${slug}: ${entities.length} JSON-LD Q/A vs ${visibleCount} visible`);
      }
    }
    expect(failures, failures.join('\n')).toEqual([]);
  });
});
