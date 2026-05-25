// tests/disclaimer-crawl.spec.ts
//
// Wave 0 scaffold (Plan 01-00). The test body is skipped — Plan 07 fills it
// in per 01-RESEARCH.md §"Pattern 8: Playwright disclaimer-crawl test (D-25)".
//
// The FOOTER_DISCLAIMER_FRAGMENT constant below is the SINGLE SOURCE OF TRUTH
// for the footer disclaimer text. Plan 01 seeds the matching text into
// `src/content/disclaimers/disclaimers.json`. Plan 07 wires the test body.
// Do NOT change the wording here without also updating disclaimers.json.

import { test, expect, request } from '@playwright/test';
import * as cheerio from 'cheerio';

// Canonical disclaimer-fragment constant — substring matched against every
// rendered footer. The full disclaimer paragraph contains additional text;
// we assert only that this sentence appears verbatim.
const FOOTER_DISCLAIMER_FRAGMENT =
  'The information on this website is for general informational purposes only';

test.describe('Disclaimer crawl', () => {
  test.skip('footer disclaimer appears on every sitemap route — implementation lands in Plan 07', async ({ baseURL }) => {
    // TODO: Plan 07 fills this in per RESEARCH.md §"Pattern 8".
    //
    // Reference implementation (do not enable until Plan 07):
    //   1. const ctx = await request.newContext({ baseURL });
    //   2. Fetch /sitemap-0.xml; assert ok().
    //   3. Parse with cheerio (xmlMode: true); extract every <loc>.
    //   4. For each url: fetch path, parse HTML with cheerio, assert
    //      $('footer').text().includes(FOOTER_DISCLAIMER_FRAGMENT).
    //   5. Fail with a list of routes that are missing the disclaimer.
    //
    // Touch FOOTER_DISCLAIMER_FRAGMENT, request, expect, cheerio here so the
    // imports above are not reported as unused once the test is unskipped:
    void FOOTER_DISCLAIMER_FRAGMENT;
    void request;
    void cheerio;
    expect(true).toBe(true);
  });
});
