// tests/disclaimer-set.spec.ts
//
// Verifies the disclaimer set integrity: the four locked ids exist in
// src/content/disclaimers/disclaimers.json with non-empty text and a
// dated version string. This locks the disclaimer surface against
// accidental id drift between content edits and consuming layouts.
//
// 2026-05-28: the original five-id set ('footer', 'contact', 'blog',
// 'practice-area', 'attorney') was reduced to four — 'footer' was
// retired. The general-disclaimer text now lives on /legal-notices
// and the attorney-advertising notation on /attorney-advertising,
// both linked from the site-wide footer. The four per-page
// disclaimers (contact, blog, practice-area, attorney) are unchanged.

import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';

type DisclaimerEntry = {
  id: string;
  text: string;
  version: string;
};

test.describe('Disclaimer set integrity', () => {
  test('all four per-page disclaimer ids present with non-empty text + version', () => {
    const raw = fs.readFileSync('src/content/disclaimers/disclaimers.json', 'utf-8');
    const data = JSON.parse(raw) as DisclaimerEntry[];

    expect(Array.isArray(data), 'disclaimers.json must be an array').toBe(true);

    const expectedIds = ['contact', 'blog', 'practice-area', 'attorney'].sort();
    const actualIds = data.map((entry) => entry.id).sort();
    expect(actualIds).toEqual(expectedIds);

    for (const entry of data) {
      expect(typeof entry.text, `Entry ${entry.id} text must be a string`).toBe('string');
      expect(entry.text.trim().length, `Entry ${entry.id} text must be non-trivial`).toBeGreaterThan(20);

      expect(typeof entry.version, `Entry ${entry.id} version must be a string`).toBe('string');
      expect(entry.version, `Entry ${entry.id} version must start with an ISO date`).toMatch(/^\d{4}-\d{2}-\d{2}/);
    }
  });
});
