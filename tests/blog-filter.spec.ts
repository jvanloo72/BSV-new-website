// tests/blog-filter.spec.ts
//
// BLOG-05: the /blog index supports filtering by attorney + practice area
// via URL params (?author=&practice=) with shareable filtered URLs and
// client-side progressive enhancement on chip clicks. Verifies the four
// behaviors UI-SPEC pins:
//   (a) direct navigation with params applies the filter on load,
//   (b) the unfiltered default shows everything and "All" chips read pressed,
//   (c) zero-match combos reveal the empty-filtered state with the right ARIA,
//   (d) chips emit working hrefs (no-JS fallback).
//
// SCAFFOLD — skipped until plan 05-03 lands the FilterChipRow + the inline
// filter script in src/pages/blog/index.astro.
// UNSKIP-WHEN: src/components/sections/FilterChipRow.astro exists and
// src/pages/blog/index.astro renders chips with data-chip/data-param/
// data-value attributes plus the inline progressive-enhancement <script>.
//
// Plan: 05-01 — scaffold only.
//
// Implementation note: this spec reads dist/client/blog/index.html from disk
// (matches the no-server pattern of disclaimer-crawl.spec.ts). When the test
// goes live, the client-side filter script behavior is exercised by the
// `?author=X` URL form on a Playwright page.goto() against a preview server;
// for now we just shape the test scaffold to make the un-skip surgical.

import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as cheerio from 'cheerio';

const DIST_CLIENT = 'dist/client';

test.describe.skip('Blog filter chips (BLOG-05)', () => {
  test.beforeAll(() => {
    execSync('npm run build', { stdio: 'pipe' });
  });

  test('chips render with correct data-* attributes and "All" chips are aria-pressed by default', () => {
    const indexFile = path.join(DIST_CLIENT, 'blog', 'index.html');
    expect(fs.existsSync(indexFile)).toBe(true);
    const $ = cheerio.load(fs.readFileSync(indexFile, 'utf-8'));

    // Each chip must carry data-chip, data-param (author|practice), and
    // data-value (or empty for the "All" chip).
    const authorChips = $('[data-chip][data-param="author"]');
    const practiceChips = $('[data-chip][data-param="practice"]');
    expect(authorChips.length, 'expected 5 author chips: All / Aaron / Stuart / Jon / Iris').toBe(5);
    expect(practiceChips.length, 'expected 4 practice chips: All / M&A / IP & Tech / Tax').toBe(4);

    // The "All" chip in each row has data-value="" (or no data-value) and
    // aria-pressed="true" when no URL params are present.
    const allAuthor = authorChips.filter((_, el) => !$(el).attr('data-value'));
    const allPractice = practiceChips.filter((_, el) => !$(el).attr('data-value'));
    expect(allAuthor.attr('aria-pressed')).toBe('true');
    expect(allPractice.attr('aria-pressed')).toBe('true');
  });

  test('chip hrefs carry the correct ?author/practice query string (no-JS fallback)', () => {
    const indexFile = path.join(DIST_CLIENT, 'blog', 'index.html');
    const $ = cheerio.load(fs.readFileSync(indexFile, 'utf-8'));

    // Pick the Jon chip, verify href.
    const jonChip = $('[data-chip][data-param="author"][data-value="jon-van-loo"]');
    expect(jonChip.length).toBe(1);
    const jonHref = jonChip.attr('href');
    expect(jonHref).toMatch(/[?&]author=jon-van-loo/);

    // Tax chip, verify href.
    const taxChip = $('[data-chip][data-param="practice"][data-value="tax"]');
    expect(taxChip.length).toBe(1);
    const taxHref = taxChip.attr('href');
    expect(taxHref).toMatch(/[?&]practice=tax/);
  });

  test('with ?author=jon-van-loo URL, the script applies the filter on load', async ({ page }) => {
    await page.goto('/blog?author=jon-van-loo');
    // aria-pressed swap on the matched chip
    const jonChip = page.locator('[data-chip][data-param="author"][data-value="jon-van-loo"]');
    await expect(jonChip).toHaveAttribute('aria-pressed', 'true');
    // non-matching posts in the list become hidden
    const nonJonItems = page.locator('#post-list > li:not([data-author="jon-van-loo"])');
    const count = await nonJonItems.count();
    for (let i = 0; i < count; i++) {
      await expect(nonJonItems.nth(i)).toHaveAttribute('hidden', /.*/);
    }
  });

  test('with a zero-match combo, the empty-filtered state is visible with role=status aria-live=polite', async ({ page }) => {
    // Pick a combo expected to match zero posts at v1: Stuart + Tax (Jon writes Tax).
    await page.goto('/blog?author=stuart-smolen&practice=tax');
    const empty = page.locator('#empty-filtered');
    await expect(empty).toBeVisible();
    await expect(empty).toHaveAttribute('role', 'status');
    await expect(empty).toHaveAttribute('aria-live', 'polite');
  });
});
