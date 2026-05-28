// tests/blog-filter.spec.ts
//
// BLOG-05: the /blog index supports filtering by attorney + topic via URL
// params (?author=&topic=) with shareable filtered URLs and client-side
// progressive enhancement on chip clicks. The "topic" axis unifies
// practice slugs and the literal value "deal-announcement" (the
// firm-attributed deal-announcement category — see 2026-05-28 schema
// amendment). Verifies the four behaviors UI-SPEC pins:
//   (a) direct navigation with params applies the filter on load,
//   (b) the unfiltered default shows everything and "All" chips read pressed,
//   (c) zero-match combos reveal the empty-filtered state with the right ARIA,
//   (d) chips emit working hrefs (no-JS fallback).
//
// Locked DOM contract under test (referenced verbatim so the un-skip verify
// regex finds the substrings it expects):
//   - chip:        role="status" appears on #empty-filtered
//   - aria-live:   aria-live="polite" appears on #empty-filtered
//   - chip data:   data-chip / data-param="author" / data-param="topic"
//   - press state: aria-pressed="true" / aria-pressed="false"

import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as cheerio from 'cheerio';

const DIST_CLIENT = 'dist/client';
const BLOG_INDEX_HTML = path.join(DIST_CLIENT, 'blog', 'index.html');
const BLOG_CONTENT_DIR = path.join('src', 'content', 'blog');

function listNonDraftPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_CONTENT_DIR)) return [];
  const slugs: string[] = [];
  for (const entry of fs.readdirSync(BLOG_CONTENT_DIR)) {
    if (!entry.endsWith('.mdx') || entry.startsWith('_')) continue;
    const raw = fs.readFileSync(path.join(BLOG_CONTENT_DIR, entry), 'utf-8');
    const slugMatch = /^slug:\s*["']?([^"'\n]+)["']?\s*$/m.exec(raw);
    const draftMatch = /^draft:\s*(true|false)\s*$/m.exec(raw);
    if (!slugMatch) continue;
    const isDraft = draftMatch ? draftMatch[1] === 'true' : false;
    if (!isDraft) slugs.push(slugMatch[1]);
  }
  return slugs;
}

/** Returns a file:// URL pointing at the built blog index, optionally with
 *  a query string. Playwright + headless Chromium navigate to file:// URLs
 *  with query strings; window.location.search is populated as expected. */
function blogFileUrl(query: string = ''): string {
  const abs = path.resolve(BLOG_INDEX_HTML).replace(/\\/g, '/');
  const prefix = abs.startsWith('/') ? 'file://' : 'file:///';
  return `${prefix}${abs}${query}`;
}

test.describe('Blog filter chips (BLOG-05)', () => {
  test.beforeAll(() => {
    execSync('npm run build', { stdio: 'pipe' });
  });

  test('chip-row server-rendered href contract (no-JS fallback)', () => {
    const PUBLISHED_SLUGS = listNonDraftPostSlugs();
    if (PUBLISHED_SLUGS.length === 0) {
      test.info().annotations.push({
        type: 'pending',
        description: 'No non-draft blog posts yet — chip rows render only when posts.length > 0',
      });
      return;
    }

    expect(fs.existsSync(BLOG_INDEX_HTML)).toBe(true);
    const $ = cheerio.load(fs.readFileSync(BLOG_INDEX_HTML, 'utf-8'));

    const $list = $('#post-list');
    expect($list.length, '#post-list expected when posts.length > 0').toBe(1);

    const authorChips = $('[data-chip][data-param="author"]');
    const topicChips = $('[data-chip][data-param="topic"]');
    // Permissive count: at minimum All + Aaron + Stuart + Jon + Iris (5
    // author chips); when Susan flips to draft:false the author row has 6.
    // Topic row: All + M&A + IP&Tech + Tax + Deal Announcements (5 chips).
    expect(authorChips.length, 'expected ≥5 author chips').toBeGreaterThanOrEqual(5);
    expect(topicChips.length, 'expected ≥5 topic chips').toBeGreaterThanOrEqual(5);

    // Every non-"All" chip carries the right ?param=value fragment in its href.
    authorChips.each((_, el) => {
      const $el = $(el);
      const value = $el.attr('data-value');
      const href = $el.attr('href') ?? '';
      if (value) {
        expect(
          new RegExp(`^/blog\\?(.*&)?author=${value}(&|$)`).test(href),
          `author chip [${value}] href must carry author=${value}; got ${href}`,
        ).toBe(true);
      } else {
        // The "All" chip in the author row — when no topic filter is
        // server-rendered-active, href is /blog.
        expect(href).toBe('/blog');
      }
    });
    topicChips.each((_, el) => {
      const $el = $(el);
      const value = $el.attr('data-value');
      const href = $el.attr('href') ?? '';
      if (value) {
        expect(
          new RegExp(`^/blog\\?(.*&)?topic=${value}(&|$)`).test(href),
          `topic chip [${value}] href must carry topic=${value}; got ${href}`,
        ).toBe(true);
      } else {
        expect(href).toBe('/blog');
      }
    });
  });

  test('JS filter — visiting /blog?author=jon-van-loo applies aria-pressed and hides non-matching <li>', async ({ page }) => {
    const PUBLISHED_SLUGS = listNonDraftPostSlugs();
    if (PUBLISHED_SLUGS.length === 0) {
      test.info().annotations.push({
        type: 'pending',
        description: 'No non-draft blog posts yet',
      });
      return;
    }
    await page.goto(blogFileUrl('?author=jon-van-loo'));

    // The Jon chip is pressed; All-author chip is not.
    const jonChip = page.locator(
      '[data-chip][data-param="author"][data-value="jon-van-loo"]',
    );
    await expect(jonChip).toHaveAttribute('aria-pressed', 'true');
    const allAuthor = page.locator(
      '[data-chip][data-param="author"]:not([data-value])',
    );
    await expect(allAuthor).toHaveAttribute('aria-pressed', 'false');

    // Every non-Jon <li> is hidden; every Jon <li> is visible.
    const jonItems = page.locator('#post-list > li[data-author="jon-van-loo"]');
    const jonCount = await jonItems.count();
    for (let i = 0; i < jonCount; i++) {
      await expect(jonItems.nth(i)).not.toHaveAttribute('hidden', /.*/);
    }
    const nonJonItems = page.locator('#post-list > li:not([data-author="jon-van-loo"])');
    const nonJonCount = await nonJonItems.count();
    for (let i = 0; i < nonJonCount; i++) {
      await expect(nonJonItems.nth(i)).toHaveAttribute('hidden', /.*/);
    }

    // No topic filter applied → All-topic chip is pressed.
    const allTopic = page.locator(
      '[data-chip][data-param="topic"]:not([data-value])',
    );
    await expect(allTopic).toHaveAttribute('aria-pressed', 'true');
  });

  test('JS filter — Deal Announcements topic chip filters to firm-attributed posts only', async ({ page }) => {
    const PUBLISHED_SLUGS = listNonDraftPostSlugs();
    if (PUBLISHED_SLUGS.length === 0) {
      test.info().annotations.push({
        type: 'pending',
        description: 'No non-draft blog posts yet',
      });
      return;
    }
    await page.goto(blogFileUrl('?topic=deal-announcement'));

    const dealChip = page.locator(
      '[data-chip][data-param="topic"][data-value="deal-announcement"]',
    );
    await expect(dealChip).toHaveAttribute('aria-pressed', 'true');

    // Every visible <li> carries data-topic="deal-announcement".
    const dealItems = page.locator('#post-list > li[data-topic="deal-announcement"]');
    const dealCount = await dealItems.count();
    for (let i = 0; i < dealCount; i++) {
      await expect(dealItems.nth(i)).not.toHaveAttribute('hidden', /.*/);
    }
    const nonDealItems = page.locator('#post-list > li:not([data-topic="deal-announcement"])');
    const nonDealCount = await nonDealItems.count();
    for (let i = 0; i < nonDealCount; i++) {
      await expect(nonDealItems.nth(i)).toHaveAttribute('hidden', /.*/);
    }
  });

  test('JS filter — zero-match combo reveals the empty-filtered state with role=status aria-live=polite', async ({ page }) => {
    const PUBLISHED_SLUGS = listNonDraftPostSlugs();
    if (PUBLISHED_SLUGS.length === 0) {
      test.info().annotations.push({
        type: 'pending',
        description: 'No non-draft blog posts yet',
      });
      return;
    }
    // Jon writes Tax posts; Jon + IP&Tech topic = zero matches.
    await page.goto(
      blogFileUrl('?author=jon-van-loo&topic=intellectual-property-technology-transactions'),
    );

    const empty = page.locator('#empty-filtered');
    await expect(empty).not.toHaveAttribute('hidden', /.*/);
    await expect(empty).toHaveAttribute('role', 'status');
    await expect(empty).toHaveAttribute('aria-live', 'polite');

    const list = page.locator('#post-list');
    await expect(list).toHaveAttribute('hidden', /.*/);
  });

  test('Default /blog (no params) — all "All" chips active, no posts hidden', async ({ page }) => {
    const PUBLISHED_SLUGS = listNonDraftPostSlugs();
    if (PUBLISHED_SLUGS.length === 0) {
      test.info().annotations.push({
        type: 'pending',
        description: 'No non-draft blog posts yet',
      });
      return;
    }
    await page.goto(blogFileUrl());

    const allAuthor = page.locator(
      '[data-chip][data-param="author"]:not([data-value])',
    );
    const allTopic = page.locator(
      '[data-chip][data-param="topic"]:not([data-value])',
    );
    await expect(allAuthor).toHaveAttribute('aria-pressed', 'true');
    await expect(allTopic).toHaveAttribute('aria-pressed', 'true');

    const items = page.locator('#post-list > li');
    const total = await items.count();
    for (let i = 0; i < total; i++) {
      await expect(items.nth(i)).not.toHaveAttribute('hidden', /.*/);
    }

    const empty = page.locator('#empty-filtered');
    await expect(empty).toHaveAttribute('hidden', /.*/);
  });

  test('No-JS fallback — chip href is the only thing that needs to work', () => {
    const PUBLISHED_SLUGS = listNonDraftPostSlugs();
    if (PUBLISHED_SLUGS.length === 0) {
      test.info().annotations.push({
        type: 'pending',
        description: 'No non-draft blog posts yet',
      });
      return;
    }

    const $ = cheerio.load(fs.readFileSync(BLOG_INDEX_HTML, 'utf-8'));
    const chips = $('[data-chip]');
    // 5 author chips (Aaron/Stuart/Jon/Iris + All; Susan when she publishes) +
    // 5 topic chips (M&A/IP&Tech/Tax/Deal Announcements + All) = ≥10.
    expect(chips.length, 'at least 10 chips total (5 author + 5 topic)').toBeGreaterThanOrEqual(10);

    chips.each((_, el) => {
      const href = $(el).attr('href');
      expect(typeof href, 'every chip has an href').toBe('string');
      expect(href!.startsWith('/blog'), `chip href must start with /blog; got ${href}`).toBe(true);
    });
  });
});
