// tests/disclaimer-crawl.spec.ts
//
// LEGAL-01 / LEGAL-05 crawl test (amended 2026-05-28).
//
// History: the original Phase 1 test asserted a "footer disclaimer fragment"
// appeared verbatim on every sitemap route, because the site-wide footer
// carried both the general-disclaimer text and the attorney-advertising
// notation inline.
//
// 2026-05-28 redesign: the inline footer disclaimer was retired. The
// general-disclaimer text moved to /legal-notices; the attorney-advertising
// notation moved to /attorney-advertising; the footer now carries a small
// centered link row to those two pages plus /about and /privacy. Compliance
// is satisfied by the link-from-every-page (not the disclaimer-text-on-every-
// page) form (Kirkland linked-disclosure pattern).
//
// This file therefore now asserts the FOOTER LINK CONTRACT instead of any
// footer-disclaimer text fragment. Specifically:
//   1. Every sitemap route exposes <a href="/about"> in its <footer>.
//   2. Every sitemap route exposes <a href="/attorney-advertising"> in its <footer>.
//   3. Every sitemap route exposes <a href="/privacy"> in its <footer>.
//   4. Every sitemap route exposes <a href="/legal-notices"> in its <footer>.
//
// Per-page disclaimers (blog, practice-area, attorney, contact) are
// rendered by their respective layouts and have their own dedicated test
// coverage (e.g. the blog-post fragment test below; person-jsonld /
// practice-area / contact rendering covered by their phase tests).

import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as cheerio from 'cheerio';

// Per-post blog disclaimer fragment — verbatim substring of the `id: 'blog'`
// entry in src/content/disclaimers/disclaimers.json. BLOG-03: the blog
// disclaimer must render in the BODY of every /blog/<slug> route. This
// fragment is unique to the blog disclaimer (it starts "This article" — no
// other disclaimer entry begins that way).
const BLOG_DISCLAIMER_FRAGMENT =
  'This article is for general informational purposes only';

// The four canonical footer links (the linked-disclosure pattern).
const FOOTER_LINK_PATHS = [
  '/about',
  '/attorney-advertising',
  '/privacy',
  '/legal-notices',
] as const;

const DIST_CLIENT = 'dist/client';
const SITEMAP_CANDIDATES = ['sitemap-0.xml', 'sitemap-index.xml', 'sitemap.xml'];

test.beforeAll(() => {
  execSync('npm run build', { stdio: 'pipe' });
});

function readSitemapUrls(): string[] {
  let sitemapFile: string | null = null;
  for (const candidate of SITEMAP_CANDIDATES) {
    const filePath = path.join(DIST_CLIENT, candidate);
    if (fs.existsSync(filePath)) {
      sitemapFile = filePath;
      break;
    }
  }
  if (!sitemapFile) {
    throw new Error(
      `No sitemap found in ${DIST_CLIENT}/ (looked for: ${SITEMAP_CANDIDATES.join(', ')}). ` +
        'Check astro.config.mjs sitemap integration.',
    );
  }

  const xml = fs.readFileSync(sitemapFile, 'utf-8');
  const $xml = cheerio.load(xml, { xmlMode: true });

  const isIndex = $xml('sitemapindex').length > 0;
  if (isIndex) {
    const urls: string[] = [];
    $xml('sitemap loc').each((_, el) => {
      const childUrl = $xml(el).text().trim();
      const childName = path.basename(new URL(childUrl).pathname);
      const childPath = path.join(DIST_CLIENT, childName);
      if (!fs.existsSync(childPath)) return;
      const childXml = fs.readFileSync(childPath, 'utf-8');
      const $child = cheerio.load(childXml, { xmlMode: true });
      $child('url loc').each((__, locEl) => {
        urls.push($child(locEl).text().trim());
      });
    });
    return urls;
  }

  const urls: string[] = [];
  $xml('url loc').each((_, el) => {
    urls.push($xml(el).text().trim());
  });
  return urls;
}

function urlToFilePath(url: string): string | null {
  const pathname = new URL(url).pathname.replace(/\/$/, '');
  if (pathname === '' || pathname === '/') {
    return path.join(DIST_CLIENT, 'index.html');
  }
  const candidates = [
    path.join(DIST_CLIENT, `${pathname.replace(/^\//, '')}.html`),
    path.join(DIST_CLIENT, pathname.replace(/^\//, ''), 'index.html'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

test.describe('Footer link contract (LEGAL-01 / LEGAL-05, linked-disclosure pattern)', () => {
  test('every sitemap route exposes all four canonical footer links', () => {
    const urls = readSitemapUrls();
    expect(
      urls.length,
      'sitemap must list at least the six Phase 1 routes',
    ).toBeGreaterThanOrEqual(6);

    const missing: string[] = [];

    for (const url of urls) {
      const filePath = urlToFilePath(url);
      if (!filePath) {
        missing.push(`${url} — no rendered HTML file under ${DIST_CLIENT}/`);
        continue;
      }
      const html = fs.readFileSync(filePath, 'utf-8');
      const $ = cheerio.load(html);

      for (const linkPath of FOOTER_LINK_PATHS) {
        const link = $(`footer a[href="${linkPath}"]`);
        if (link.length === 0) {
          missing.push(`${url} (${filePath}) — footer missing link to ${linkPath}`);
        }
      }
    }

    expect(
      missing,
      `Routes missing one or more required footer links:\n${missing.join('\n')}`,
    ).toEqual([]);
  });
});

test.describe('Per-page blog disclaimer (BLOG-03)', () => {
  test('blog disclaimer fragment appears in body on every /blog/<slug> route', () => {
    // The per-post blog disclaimer (rendered by <Disclaimer id="blog" />
    // inside BlogPostLayout) must appear in the body of every /blog/<slug>
    // page. /blog (the index page) is EXCLUDED — the index renders without
    // the per-post disclaimer; only individual post pages carry it.
    //
    // When no /blog/<slug> route appears in the sitemap (no published post
    // yet), the filtered set is empty and the test is skipped via test.skip
    // — never false-passes by checking nothing.
    const urls = readSitemapUrls();
    const blogSlugUrls = urls.filter((url) => {
      const pathname = new URL(url).pathname.replace(/\/$/, '');
      return pathname.startsWith('/blog/') && pathname !== '/blog';
    });

    test.skip(
      blogSlugUrls.length === 0,
      'No /blog/<slug> in sitemap — no published post yet',
    );

    const missing: string[] = [];
    for (const url of blogSlugUrls) {
      const filePath = urlToFilePath(url);
      if (!filePath) {
        missing.push(`${url} — no rendered HTML file under ${DIST_CLIENT}/`);
        continue;
      }
      const html = fs.readFileSync(filePath, 'utf-8');
      const $ = cheerio.load(html);
      const bodyText = $('body').text();
      if (!bodyText.includes(BLOG_DISCLAIMER_FRAGMENT)) {
        missing.push(`${url} (${filePath}) — body text does not contain the blog disclaimer fragment`);
      }
    }

    expect(
      missing,
      `/blog/<slug> routes missing the blog disclaimer:\n${missing.join('\n')}`,
    ).toEqual([]);
  });
});
