// tests/person-jsonld.spec.ts
//
// ATTY-09 / SEO-03: each published attorney page must carry a valid Person
// JSON-LD block with name/jobTitle/alumniOf/knowsAbout. Mirrors the
// build-in-beforeAll + cheerio convention from jsonld-legalservice.spec.ts.
//
// SCAFFOLD — fixme until Plan 02 ships real attorney pages. UNSKIP-WHEN:
// src/content/attorneys/{aaron-belcher,stuart-smolen,jon-van-loo,iris-zhang}.mdx
// exist and AttorneyLayout emits <JsonLd data={buildPersonLd(...)} />.

import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as cheerio from 'cheerio';

const DIST_CLIENT = 'dist/client';
const PUBLISHED_SLUGS = [
  'aaron-belcher',
  'stuart-smolen',
  'jon-van-loo',
  'iris-zhang',
];

function readPersonLd(slug: string): Record<string, unknown> | null {
  const file = path.join(DIST_CLIENT, 'attorneys', slug, 'index.html');
  if (!fs.existsSync(file)) return null;
  const $ = cheerio.load(fs.readFileSync(file, 'utf-8'));
  for (const s of $('script[type="application/ld+json"]').toArray()) {
    const parsed = JSON.parse($(s).html() ?? '{}');
    if (parsed['@type'] === 'Person') return parsed;
  }
  return null;
}

test.describe('Person JSON-LD (ATTY-09 / SEO-03)', () => {
  test('every published attorney page has valid Person JSON-LD', () => {
    execSync('npm run build', { stdio: 'pipe' });
    const missing: string[] = [];
    for (const slug of PUBLISHED_SLUGS) {
      const ld = readPersonLd(slug);
      if (!ld) {
        missing.push(`${slug}: no Person JSON-LD`);
        continue;
      }
      if (ld['@context'] !== 'https://schema.org') missing.push(`${slug}: bad @context`);
      if (typeof ld.name !== 'string' || !ld.name) missing.push(`${slug}: missing name`);
      if (!ld.jobTitle) missing.push(`${slug}: missing jobTitle`);
      if (!Array.isArray(ld.alumniOf)) missing.push(`${slug}: alumniOf not array`);
      if (!Array.isArray(ld.knowsAbout)) missing.push(`${slug}: knowsAbout not array`);
    }
    expect(missing, missing.join('\n')).toEqual([]);
  });
});
