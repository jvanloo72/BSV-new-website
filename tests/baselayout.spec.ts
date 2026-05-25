// tests/baselayout.spec.ts
//
// Wave 0 scaffold (Plan 01-00). Body skipped — Plan 07 wires it up.
//
// Purpose: verify the BaseLayout component renders the firm name in the
// header and the footer disclaimer in the footer. Confirms FOUND-05.

import { test, expect } from '@playwright/test';

test.skip('BaseLayout renders firm name in header and disclaimer in footer — implementation lands in Plan 07', async ({ page }) => {
  // TODO: Plan 07 implements:
  //   1. await page.goto('/');
  //   2. Assert header text contains 'Belcher, Smolen & Van Loo LLP' or 'BSV Law'.
  //   3. Assert footer text contains the FOOTER_DISCLAIMER_FRAGMENT defined in
  //      `tests/disclaimer-crawl.spec.ts` ('The information on this website is
  //      for general informational purposes only').
  expect(true).toBe(true);
});
