// tests/fonts-selfhost.spec.ts
//
// DESIGN-03: Hanken Grotesk must be self-hosted (served from 'self'), declared
// with @font-face + font-display in the compiled CSS, and there must be NO
// Google Fonts CDN reference anywhere in the build output (D-07 / CSP
// font-src 'self'). Two independent guards:
//   - zero occurrences of fonts.googleapis / fonts.gstatic across all of dist/,
//   - @font-face and font-display present in a compiled CSS file under dist/.
//
// Idiom A (analog: tests/jsonld-legalservice.spec.ts) — build first, then scan
// the built output from disk.
//
// SKIPPED today because the font is not wired via the Astro Fonts API yet.
//
// UNSKIP WHEN: Hanken Grotesk wired via Astro Fonts API — 02-01

import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

const DIST = 'dist';
const CDN_NEEDLES = ['fonts.googleapis', 'fonts.gstatic'];

// Recursively collect every file under dist/ (for the CDN scan) and every .css
// file (for the @font-face assertion).
function walk(dir: string, onFile: (full: string) => void) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, onFile);
    else onFile(full);
  }
}

test.describe('Self-hosted fonts (DESIGN-03)', () => {
  test.beforeAll(() => {
    execSync('npm run build', { stdio: 'pipe' });
  });

  test('no Google Fonts CDN reference anywhere in dist/', () => {
    const offenders: string[] = [];
    walk(DIST, (full) => {
      // Only scan text-like files; skip binary fonts/images.
      if (/\.(css|js|html|json|xml|txt|map)$/i.test(full)) {
        const content = fs.readFileSync(full, 'utf-8');
        for (const needle of CDN_NEEDLES) {
          if (content.includes(needle)) offenders.push(`${full} → ${needle}`);
        }
      }
    });
    expect(offenders, `Google Fonts CDN references found:\n${offenders.join('\n')}`).toEqual([]);
  });

  test('@font-face + font-display present in build output', () => {
    // Astro's Fonts API injects the self-hosted @font-face (with font-display:
    // swap + auto-generated size-adjust fallback metrics) into the document
    // <head> via the <Font> component — i.e. into the emitted HTML, not the
    // compiled CSS bundle. Scan both .css and .html so the self-host assertion
    // holds wherever Astro chooses to emit the rule.
    let blob = '';
    walk(DIST, (full) => {
      if (/\.(css|html)$/i.test(full)) blob += fs.readFileSync(full, 'utf-8');
    });
    expect(blob.length, 'at least one compiled CSS/HTML file must exist').toBeGreaterThan(0);
    expect(blob, 'self-hosted font requires an @font-face rule').toContain('@font-face');
    expect(blob, 'font must declare font-display for CLS control').toContain('font-display');
  });
});
