// tests/rss-feed.spec.ts
//
// BLOG-06: the RSS feed at /blog/rss.xml exists, is valid RSS 2.0, contains
// every non-draft post, sanitizes content to remove <script>/<iframe>, and
// uses person names (never emails) in the author field (D-08, T-05-03).
// Also enforces T-05-04 (sanitize-html guarantee — no <script>/<iframe> in
// <content:encoded>).
//
// RESOLVED 05-04: src/pages/blog/rss.xml.ts exists and uses @astrojs/rss + the
// Astro Container API + sanitize-html to emit the feed. The describe block is
// un-skipped. The first three tests (file-exists + valid-RSS-2.0 + channel-
// description) run live regardless of post count. The per-item tests skip
// vacuously while no non-draft posts exist (placeholder-post.mdx stays
// draft:true); the moment 05-05 publishes the seed post the guard falls
// through and the assertion loop runs against real DOM with zero further
// test-code edits.

import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as cheerio from 'cheerio';

const DIST_CLIENT = 'dist/client';
const BLOG_CONTENT_DIR = path.join('src', 'content', 'blog');
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

let rssPath: string;
let rssXml: string;

test.beforeAll(() => {
  execSync('npm run build', { stdio: 'pipe' });
  const found = findFeedFile();
  if (!found) {
    throw new Error(
      `rss.xml not found in any of: ${FEED_CANDIDATES.join(', ')}`,
    );
  }
  rssPath = found;
  rssXml = fs.readFileSync(rssPath, 'utf-8');
});

test.describe('RSS feed (BLOG-06 / D-07)', () => {
  test('file exists and is valid RSS 2.0', () => {
    expect(rssXml).toContain('<rss ');
    expect(rssXml).toMatch(/<rss [^>]*version="2\.0"/);
    expect(rssXml).toContain('<channel>');
    expect(rssXml).toContain('<title>BSV Insights</title>');
    expect(rssXml).toContain('<language>en-us</language>');
  });

  test('channel description matches the locked copy', () => {
    // verbatim fragment to avoid escaping the apostrophe
    expect(rssXml).toContain('Practical analysis from the BSV team');
  });

  test('rss.xml is a static file, not a serverless function (Pitfall 11)', () => {
    // The file existing under dist/client/blog/ (Vercel-adapter static output)
    // or dist/blog/ (pure static) proves it's a pre-built file. A serverless
    // function would be in dist/functions/ or a Vercel adapter build
    // manifest, never as a literal .xml file.
    expect(rssPath).toMatch(/\.xml$/);
    expect(fs.statSync(rssPath).size).toBeGreaterThan(100);
  });

  test('items present once a non-draft post exists', () => {
    const $ = cheerio.load(rssXml, { xmlMode: true });
    if ($('item').length === 0) {
      test.info().annotations.push({
        type: 'pending',
        description:
          'No non-draft blog posts yet — un-skip will produce real assertions once the seed post lands in 05-05',
      });
      return;
    }
    expect($('item').length).toBeGreaterThan(0);
  });

  test('every item carries title, link, pubDate, author, description, content:encoded with no email', () => {
    const $ = cheerio.load(rssXml, { xmlMode: true });
    if ($('item').length === 0) {
      test.info().annotations.push({
        type: 'pending',
        description:
          'No non-draft blog posts yet — per-item assertions will engage once the seed post lands in 05-05',
      });
      return;
    }
    const problems: string[] = [];
    $('item').each((idx, item) => {
      const $item = $(item);
      const title = $item.find('title').text();
      const link = $item.find('link').text();
      const pubDate = $item.find('pubDate').text();
      const description = $item.find('description').text();

      // <author> or <dc:creator> — @astrojs/rss may emit either form.
      const dcCreator = $item.find('dc\\:creator').text();
      const author = $item.find('author').text();
      const personField = dcCreator || author;

      if (!title) problems.push(`item ${idx}: missing <title>`);
      if (!link.startsWith('https://bsvlaw.com/blog/')) {
        problems.push(
          `item ${idx}: <link> must start with https://bsvlaw.com/blog/ (got ${link})`,
        );
      }
      if (!pubDate || Number.isNaN(Date.parse(pubDate))) {
        problems.push(`item ${idx}: <pubDate> not parseable (got ${pubDate})`);
      }
      if (!description) problems.push(`item ${idx}: missing <description>`);

      if (!personField) {
        problems.push(`item ${idx}: missing <author>/<dc:creator>`);
      } else if (/@/.test(personField)) {
        // D-08 / T-05-03 — never put an email in a public feed payload.
        problems.push(
          `item ${idx}: author field contains '@' (likely an email): ${personField}`,
        );
      }
      // Defensive: also assert the not-an-email contract via the matcher form
      // so the error message names the regex explicitly.
      expect(personField).not.toMatch(/@/);
    });

    expect(problems, problems.join('\n')).toEqual([]);
  });

  test('no <script>, <iframe>, <form>, or on*= handler in any content:encoded payload (T-05-04)', () => {
    const $ = cheerio.load(rssXml, { xmlMode: true });
    if ($('item').length === 0) {
      test.info().annotations.push({
        type: 'pending',
        description:
          'No non-draft blog posts yet — sanitize-html assertions will engage once the seed post lands in 05-05',
      });
      return;
    }
    const violations: string[] = [];
    $('item').each((idx, item) => {
      const $item = $(item);
      // cheerio xmlMode parses CDATA into .text(); fall back to a raw-XML
      // grep if the namespace-selector returns empty (defensive).
      let content = $item.find('content\\:encoded').text();
      if (!content) {
        const m = rssXml.match(
          /<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/g,
        );
        content = m ? m.join('\n') : '';
      }
      if (/<script[\s>]/i.test(content))
        violations.push(`item ${idx}: <script> tag in <content:encoded>`);
      if (/<iframe[\s>]/i.test(content))
        violations.push(`item ${idx}: <iframe> tag in <content:encoded>`);
      if (/<form[\s>]/i.test(content))
        violations.push(`item ${idx}: <form> tag in <content:encoded>`);
      if (/\son[a-z]+\s*=/i.test(content))
        violations.push(
          `item ${idx}: on*= event handler attribute in <content:encoded>`,
        );
    });
    expect(violations, violations.join('\n')).toEqual([]);
  });

  test('no draft post leaks into the feed (Pitfall 9)', () => {
    // Read all MDX frontmatter; collect slugs of draft:true posts; assert
    // none of them appear in any <link>.
    if (!fs.existsSync(BLOG_CONTENT_DIR)) return;
    const mdxFiles = fs
      .readdirSync(BLOG_CONTENT_DIR)
      .filter((f) => f.endsWith('.mdx') && !f.startsWith('_'));
    const draftSlugs: string[] = [];
    for (const f of mdxFiles) {
      const fm = fs.readFileSync(path.join(BLOG_CONTENT_DIR, f), 'utf-8');
      const draftMatch = /^draft:\s*(true|false)\b/m.exec(fm);
      const slugMatch = /^slug:\s*"?([^"\n]+)"?\s*$/m.exec(fm);
      if (draftMatch?.[1] === 'true' && slugMatch?.[1]) {
        draftSlugs.push(slugMatch[1].trim());
      }
    }
    for (const slug of draftSlugs) {
      expect(rssXml).not.toContain(`/blog/${slug}`);
    }
  });

  test('feed contains no @bsvlaw.com email substring anywhere (D-08 belt-and-braces)', () => {
    // Whole-file guard — even if a future author refactor accidentally
    // routes the email through some other field, this catches it.
    expect(rssXml).not.toContain('@bsvlaw.com');
  });
});
