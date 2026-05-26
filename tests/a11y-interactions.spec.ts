// tests/a11y-interactions.spec.ts
//
// A11Y-03 / D-10: interactive design-system components must be keyboard-operable
// and respect prefers-reduced-motion. We assert the static markers of those
// properties in the built /_design HTML:
//   - native <details> elements exist (the FaqAccordion is zero-JS, keyboard-
//     operable for free — no client: directive),
//   - at least one `motion-safe:` class is present (motion is gated, not
//     unconditional),
//   - `focus-visible:ring` appears on interactive elements (visible keyboard focus).
//
// Idiom A (analog: tests/disclaimer-crawl.spec.ts) — build first, read
// dist/client/_design/index.html, assert with cheerio / string match.
//
// SKIPPED today because the FaqAccordion + interactive components and /_design
// do not exist yet.
//
// UNSKIP WHEN: FaqAccordion + interactive components on /_design — 02-02

import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as cheerio from 'cheerio';

const DESIGN_HTML = 'dist/client/_design/index.html';

test.describe.skip('A11y interactions (A11Y-03 / D-10)', () => {
  test.beforeAll(() => {
    execSync('npm run build', { stdio: 'pipe' });
  });

  test('FaqAccordion uses native <details> (keyboard-operable, zero-JS)', () => {
    const html = fs.readFileSync(DESIGN_HTML, 'utf-8');
    const $ = cheerio.load(html);
    expect($('details').length, 'expected ≥1 native <details> accordion panel').toBeGreaterThanOrEqual(1);
    expect($('details > summary').length, 'each <details> needs a <summary>').toBeGreaterThanOrEqual(1);
  });

  test('motion is gated behind motion-safe: (respects prefers-reduced-motion)', () => {
    const html = fs.readFileSync(DESIGN_HTML, 'utf-8');
    expect(html, 'expected at least one motion-safe: utility on /_design').toContain('motion-safe:');
  });

  test('interactive elements expose a visible focus ring', () => {
    const html = fs.readFileSync(DESIGN_HTML, 'utf-8');
    expect(html, 'expected focus-visible:ring on interactive elements').toContain('focus-visible:ring');
  });
});
