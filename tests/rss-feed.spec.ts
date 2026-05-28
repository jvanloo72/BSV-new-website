// tests/rss-feed.spec.ts
//
// BLOG-06: the RSS feed at /blog/rss.xml exists, is valid RSS 2.0, contains
// every non-draft post, sanitizes content to remove <script>/<iframe>, and
// uses person names (never emails) in the author field (D-08, T-05-03).
// Also enforces T-05-04 (sanitize-html guarantee — no <script>/<iframe> in
// <content:encoded>).
//
// SCAFFOLD — skipped until plan 05-04 lands src/pages/blog/rss.xml.ts.
// UNSKIP-WHEN: src/pages/blog/rss.xml.ts exists and uses @astrojs/rss + the
// Astro Container API + sanitize-html to emit the feed.
//
// Plan: 05-01 — scaffold only.

import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as cheerio from 'cheerio';

const DIST_CLIENT = 'dist/client';
const FEED_CANDIDATES = [
  path.join(DIST_CLIENT, 'blog', 'rss.xml'),
  // Some Vercel adapter configurations land static endpoints differently;
  // both paths are checked for robustness.
  path.join('dist', 'blog', 'rss.xml'),
];

function findFeedFile(): string | null {
  for (const candidate of FEED_CANDIDATES) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

test.describe.skip('RSS feed (BLOG-06)', () => {
  test.beforeAll(() => {
    execSync('npm run build', { stdio: 'pipe' });
  });

  test('feed exists at one of the expected paths and is RSS 2.0 with at least one item', () => {
    const feedFile = findFeedFile();
    expect(feedFile, `expected feed at one of: ${FEED_CANDIDATES.join(', ')}`).not.toBeNull();
    const xml = fs.readFileSync(feedFile!, 'utf-8');
    const $ = cheerio.load(xml, { xmlMode: true });

    const root = $('rss');
    expect(root.length, 'root <rss> element missing').toBe(1);
    expect(root.attr('version')).toBe('2.0');

    const items = $('item');
    expect(items.length, 'feed must contain at least one <item>').toBeGreaterThan(0);
  });

  test('each item has the required fields with the correct shapes (no emails in author; no <script>/<iframe> in content)', () => {
    const feedFile = findFeedFile();
    const xml = fs.readFileSync(feedFile!, 'utf-8');
    const $ = cheerio.load(xml, { xmlMode: true });

    const problems: string[] = [];
    $('item').each((idx, item) => {
      const $item = $(item);
      const title = $item.find('title').text();
      const link = $item.find('link').text();
      const pubDate = $item.find('pubDate').text();
      const description = $item.find('description').text();

      // dc:creator OR <author> — @astrojs/rss may emit either.
      const dcCreator = $item.find('dc\\:creator').text();
      const author = $item.find('author').text();
      const personField = dcCreator || author;

      // <content:encoded> — the full sanitized HTML.
      // cheerio in xmlMode accepts the escaped CSS-selector form for namespaced tags.
      const contentEncoded = $item.find('content\\:encoded').text();

      if (!title) problems.push(`item ${idx}: missing <title>`);
      if (!link.startsWith('https://bsvlaw.com/blog/')) {
        problems.push(`item ${idx}: <link> must start with https://bsvlaw.com/blog/ (got ${link})`);
      }
      if (!pubDate || Number.isNaN(Date.parse(pubDate))) {
        problems.push(`item ${idx}: <pubDate> not parseable (got ${pubDate})`);
      }
      if (!description) problems.push(`item ${idx}: missing <description>`);

      if (!personField) {
        problems.push(`item ${idx}: missing <author>/<dc:creator>`);
      } else if (/@/.test(personField)) {
        // D-08 / T-05-03 — never put an email in a public feed payload.
        problems.push(`item ${idx}: author field contains '@' (likely an email): ${personField}`);
      }

      if (!contentEncoded) {
        problems.push(`item ${idx}: missing <content:encoded>`);
      } else {
        // T-05-04 — sanitize-html must strip <script> and <iframe>.
        if (/<script/i.test(contentEncoded)) problems.push(`item ${idx}: <content:encoded> contains <script>`);
        if (/<iframe/i.test(contentEncoded)) problems.push(`item ${idx}: <content:encoded> contains <iframe>`);
      }
    });

    expect(problems, problems.join('\n')).toEqual([]);
  });
});
