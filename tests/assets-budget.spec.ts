// tests/assets-budget.spec.ts
//
// DESIGN-05 / DESIGN-06 / PERF-02: committed image + font assets must exist
// where the design system expects them AND no single committed asset may exceed
// the 200 KB budget (204800 bytes — CLAUDE.md non-negotiable + UI-SPEC).
//
// Idiom B (analog: tests/disclaimer-set.spec.ts) — pure filesystem, no build.
//
// SKIPPED today because the hero SVG, the 3 practice-area icons, and the
// Hanken Grotesk woff2 files do not exist yet. The size-budget loop below is
// written to be tolerant (it only checks assets that ARE present) so it does
// the right thing the moment files start landing — but the EXISTENCE checks
// (which are the point of DESIGN-05/06) are what require the targets, so the
// whole describe is skipped until those assets are committed.
//
// UNSKIP WHEN: hero SVG + 3 practice icons + woff2 committed (02-01/02-02)

import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const MAX_BYTES = 204800; // 200 KB

// Directories that may hold committed image/font assets.
const ASSET_DIRS = ['src/assets', 'src/icons', 'public'];

const IMAGE_FONT_EXTS = new Set([
  '.svg',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.avif',
  '.gif',
  '.woff',
  '.woff2',
  '.ttf',
  '.otf',
]);

// Recursively collect every image/font file under the given roots.
function collectAssets(roots: string[]): string[] {
  const found: string[] = [];
  const walk = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (IMAGE_FONT_EXTS.has(path.extname(entry.name).toLowerCase())) {
        found.push(full);
      }
    }
  };
  for (const root of roots) walk(root);
  return found;
}

test.describe.skip('Asset budget + existence (DESIGN-05/06, PERF-02)', () => {
  test('every committed image/font asset is ≤ 200 KB', () => {
    const assets = collectAssets(ASSET_DIRS);
    const overBudget: string[] = [];
    for (const file of assets) {
      const size = fs.statSync(file).size;
      if (size > MAX_BYTES) {
        overBudget.push(`${file} — ${size} bytes (> ${MAX_BYTES})`);
      }
    }
    expect(overBudget, `Assets over the 200 KB budget:\n${overBudget.join('\n')}`).toEqual([]);
  });

  test('hero illustration exists and parses as SVG (DESIGN-05)', () => {
    const hero = 'src/assets/illustrations/hero-deal-flow.svg';
    expect(fs.existsSync(hero), `${hero} must exist`).toBe(true);
    const svg = fs.readFileSync(hero, 'utf-8');
    expect(svg, 'hero must be a real <svg> element').toMatch(/<svg[\s>]/);
    expect(fs.statSync(hero).size, 'hero must be ≤ 200 KB').toBeLessThanOrEqual(MAX_BYTES);
  });

  test('three practice-area icons exist under src/icons (DESIGN-06)', () => {
    const icons = fs
      .readdirSync('src/icons')
      .filter((f) => f.startsWith('practice-') && f.endsWith('.svg'));
    expect(icons.length, 'expected 3 practice-* icons in src/icons/').toBeGreaterThanOrEqual(3);
    for (const icon of icons) {
      const full = path.join('src/icons', icon);
      expect(fs.statSync(full).size, `${icon} must be ≤ 200 KB`).toBeLessThanOrEqual(MAX_BYTES);
    }
  });

  test('self-hosted Hanken Grotesk font files exist (DESIGN-03 asset side)', () => {
    const fontDir = 'src/assets/fonts';
    expect(fs.existsSync(fontDir), `${fontDir} must exist`).toBe(true);
    const fonts = fs.readdirSync(fontDir).filter((f) => /\.woff2?$/.test(f));
    expect(fonts.length, 'at least one Hanken Grotesk woff2 must be committed').toBeGreaterThanOrEqual(1);
    for (const f of fonts) {
      const full = path.join(fontDir, f);
      expect(fs.statSync(full).size, `${f} must be ≤ 200 KB`).toBeLessThanOrEqual(MAX_BYTES);
    }
  });
});
