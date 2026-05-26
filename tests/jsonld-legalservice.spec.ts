// tests/jsonld-legalservice.spec.ts
//
// Verifies FOUND-05 / D-29 / SEO-02: the site-wide LegalService JSON-LD
// block lands in the rendered HTML, parses cleanly, and contains the firm
// name + both office locations.
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
  test('parses and contains firm name + both office locations', () => {
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

    const address = ld.address;
    expect(Array.isArray(address), 'address must be an array').toBe(true);
    if (!Array.isArray(address)) return;
    expect(address).toHaveLength(2);

    const localities = address.map((a: { addressLocality?: string }) => a.addressLocality);
    expect(localities).toContain('San Francisco');
    expect(localities).toContain('Silicon Valley');
  });
});
