// tests/jsonld-legalservice.spec.ts
//
// Verifies FOUND-05 / D-29 / SEO-02: the site-wide LegalService JSON-LD
// block lands in the rendered HTML, parses cleanly, and contains the firm
// name + the full address. D-37: a SINGLE PostalAddress carrying the full
// street address (555 California St., Suite 4925, San Francisco, CA 94104) so
// the structured-data NAP matches the visible footer.
//
// Reads dist/client/index.html (the Vercel adapter splits output into
// dist/client/ for static + dist/server/ for functions). Runs a fresh
// build in beforeAll so the test is self-contained.

import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as cheerio from 'cheerio';

const RENDERED_HTML_PATH = 'dist/client/index.html';

test.beforeAll(() => {
  execSync('npm run build', { stdio: 'pipe' });
});

test.describe('LegalService JSON-LD', () => {
  test('parses and contains firm name + city-level San Francisco address', () => {
    const html = fs.readFileSync(RENDERED_HTML_PATH, 'utf-8');
    const $ = cheerio.load(html);

    const scripts = $('script[type="application/ld+json"]').toArray();
    expect(scripts.length, 'at least one JSON-LD script block must exist').toBeGreaterThanOrEqual(1);

    let ld: Record<string, unknown> | null = null;
    for (const s of scripts) {
      const raw = $(s).html() ?? '{}';
      const parsed = JSON.parse(raw);
      if (parsed['@type'] === 'LegalService') {
        ld = parsed;
        break;
      }
    }

    expect(ld, 'a LegalService JSON-LD block must exist').not.toBeNull();
    if (!ld) return;

    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('LegalService');
    expect(ld.name).toBe('Belcher, Smolen & Van Loo LLP');

    // D-37: a single PostalAddress object (not an array) carrying the full NAP.
    const address = ld.address as {
      '@type'?: string;
      addressLocality?: string;
      addressRegion?: string;
      streetAddress?: string;
      postalCode?: string;
    };
    expect(Array.isArray(address), 'address must be a single object, not an array').toBe(false);
    expect(address['@type']).toBe('PostalAddress');
    expect(address.streetAddress).toBe('555 California St., Suite 4925');
    expect(address.addressLocality).toBe('San Francisco');
    expect(address.addressRegion).toBe('CA');
    expect(address.postalCode).toBe('94104');
  });
});
