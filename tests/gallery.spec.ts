// tests/gallery.spec.ts
//
// DESIGN-04 / DESIGN-06: the internal component gallery at /_design must render
// every one of the 8 named design-system components AND surface the practice
// icons. We assert that AT LEAST ONE element carries each [data-component="X"]
// marker (presence, NOT exactly-one — the gallery intentionally renders ≥3
// PracticeAreaCards (M&A / IP / Tax) and ≥5 AttorneyCards), plus ≥3 inline
// <svg> elements for the practice-area iconography.
//
// Idiom A (analog: tests/disclaimer-crawl.spec.ts) — build first, then read
// dist/client/_design/index.html from disk and assert with cheerio. NEVER use
// `astro preview` (Vercel adapter cannot serve the bundle locally).
//
// SKIPPED today because /_design and its components do not exist yet.
//
// UNSKIP WHEN: /_design renders all 8 components — 02-01 for PracticeAreaCard, 02-02 for the rest

import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as cheerio from 'cheerio';

const DESIGN_HTML = 'dist/client/_design/index.html';

// The 8 design-system component names (UI-SPEC §Component Inventory).
const COMPONENTS = [
  'Hero',
  'PracticeAreaCard',
  'AttorneyCard',
  'TestimonialQuote',
  'DealsGrid',
  'FeeStructureBand',
  'CtaBlock',
  'FaqAccordion',
];

test.describe.skip('Design gallery (DESIGN-04/06)', () => {
  test.beforeAll(() => {
    execSync('npm run build', { stdio: 'pipe' });
  });

  test('every named component appears at least once on /_design', () => {
    const html = fs.readFileSync(DESIGN_HTML, 'utf-8');
    const $ = cheerio.load(html);

    const missing: string[] = [];
    for (const name of COMPONENTS) {
      const count = $(`[data-component="${name}"]`).length;
      if (count < 1) missing.push(name);
    }
    expect(missing, `Components missing from /_design: ${missing.join(', ')}`).toEqual([]);
  });

  test('gallery renders multiple PracticeAreaCards and AttorneyCards', () => {
    const html = fs.readFileSync(DESIGN_HTML, 'utf-8');
    const $ = cheerio.load(html);
    expect($('[data-component="PracticeAreaCard"]').length, 'expected ≥3 practice cards').toBeGreaterThanOrEqual(3);
    expect($('[data-component="AttorneyCard"]').length, 'expected ≥5 attorney cards').toBeGreaterThanOrEqual(5);
  });

  test('practice-area icons render as inline SVG (DESIGN-06)', () => {
    const html = fs.readFileSync(DESIGN_HTML, 'utf-8');
    const $ = cheerio.load(html);
    expect($('svg').length, 'expected ≥3 inline <svg> for practice icons').toBeGreaterThanOrEqual(3);
  });
});
