// tests/jsonld-legalservice.spec.ts
//
// Wave 0 scaffold (Plan 01-00). Body skipped — Plan 07 wires it up.
//
// Purpose: verify that the site-wide LegalService JSON-LD block injected by
// BaseLayout (D-29) parses cleanly and contains the firm name. Confirms FOUND-05
// and the JSON-LD scaffold (D-29, D-30).

import { test, expect } from '@playwright/test';

test.skip('LegalService JSON-LD parses and contains firm name — implementation lands in Plan 07', async ({ page }) => {
  // TODO: Plan 07 implements:
  //   1. await page.goto('/');
  //   2. const jsonLdRaw = await page.locator('script[type="application/ld+json"]').first().textContent();
  //   3. const data = JSON.parse(jsonLdRaw);
  //   4. assert data['@type'] === 'LegalService'.
  //   5. assert data.name === 'Belcher, Smolen & Van Loo LLP'.
  expect(true).toBe(true);
});
