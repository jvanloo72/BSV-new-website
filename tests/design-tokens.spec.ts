// tests/design-tokens.spec.ts
//
// DESIGN-02: the locked Phase 2 color tokens, declared once in the
// src/styles/global.css `@theme` block, must survive into the compiled CSS that
// Astro emits under dist/_astro/*.css. We grep the built stylesheet for the
// lowercased locked accent + background hexes — proof that the namespace-mapped
// utilities (bg-bg, text-accent, …) actually resolve to the locked values and a
// single-token edit would restyle every consuming component.
//
// Idiom A (analog: tests/jsonld-legalservice.spec.ts) — build first, then read
// the compiled output from disk. The Vercel adapter splits output across
// dist/client/ and dist/server/; compiled CSS bundles live under
// dist/client/_astro/ (and may be referenced from dist/_astro on some adapter
// layouts) so we scan both locations.
//
// SKIPPED today because src/styles/global.css still carries the Phase 1
// placeholder palette (zinc-based), so #9a3f1a / #f8f5f0 are not yet present.
//
// UNSKIP WHEN: global.css @theme rewritten (02-01)

import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

// D-32 cool near-black palette. accent (rust) survives verbatim; the white bg
// (#ffffff) is minified to the short hex #fff by Lightning CSS in the build, so
// we assert the compiled short form.
const LOCKED_HEXES = ['#9c3f2a', '#fff']; // accent + dominant bg (white, minified)

// Compiled CSS may land under either of these depending on adapter layout.
const CSS_ROOTS = ['dist/client/_astro', 'dist/_astro'];

function collectCss(roots: string[]): string[] {
  const found: string[] = [];
  for (const root of roots) {
    if (!fs.existsSync(root)) continue;
    for (const entry of fs.readdirSync(root)) {
      if (entry.endsWith('.css')) found.push(path.join(root, entry));
    }
  }
  return found;
}

test.describe('Compiled design tokens (DESIGN-02)', () => {
  test.beforeAll(() => {
    execSync('npm run build', { stdio: 'pipe' });
  });

  test('locked accent + bg hexes appear in compiled CSS', () => {
    const cssFiles = collectCss(CSS_ROOTS);
    expect(cssFiles.length, 'at least one compiled CSS bundle must exist').toBeGreaterThanOrEqual(1);

    const allCss = cssFiles.map((f) => fs.readFileSync(f, 'utf-8')).join('\n').toLowerCase();

    const missing = LOCKED_HEXES.filter((hex) => !allCss.includes(hex));
    expect(missing, `Locked token hex(es) absent from compiled CSS: ${missing.join(', ')}`).toEqual([]);
  });
});
