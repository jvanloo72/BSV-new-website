// tests/disclaimer-crawl.spec.ts
//
// The canonical Phase 1 compliance test (D-25 / D-26 / LEGAL-01). Walks the
// rendered sitemap, opens each route's HTML, and asserts the footer disclaimer
// fragment appears verbatim. Accumulates failures so one run reports every
// missing route.
//
// Implementation deviates from RESEARCH.md §Pattern 8 in one respect: we read
// dist/client/ files directly from disk rather than fetching via
// `astro preview`. That deviation is forced by Plan 01-06's /api/csp-report
// serverless route (the Vercel adapter output cannot be served by
// `astro preview`). Reading files from disk is equivalent for compliance
// assertions — we still walk the same sitemap and assert the same fragment.
//
// FOOTER_DISCLAIMER_FRAGMENT is the SINGLE SOURCE OF TRUTH for the footer
// disclaimer text. It must remain verbatim-equal to the matching substring in
// src/content/disclaimers/disclaimers.json.
//
// 2026-05-28 — the footer disclaimer was trimmed: "Attorney advertising. Prior
// results do not guarantee a similar outcome." now lives at the dedicated
// /attorney-advertising page (Kirkland linked-disclosure pattern). The site-
// wide footer links to that page via the footer nav. Tests below assert:
//   1. FOOTER_DISCLAIMER_FRAGMENT (the trimmed text) appears on every route.
//   2. FOOTER_AA_LEGACY_FRAGMENT is ABSENT from every route's footer.
//   3. The "Attorney Advertising" footer link is present on every route.

import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as cheerio from 'cheerio';

// New (trimmed) footer disclaimer — must end with "without seeking the advice
// of an attorney." (the legacy AA sentences were stripped 2026-05-28).
const FOOTER_DISCLAIMER_FRAGMENT =
  'without seeking the advice of an attorney.';

// Legacy AA sentences that MUST be absent from the site-wide footer now that
// they live on the /attorney-advertising page.
const FOOTER_AA_LEGACY_FRAGMENT =
  'Attorney advertising. Prior results do not guarantee a similar outcome.';

// BLOG_DISCLAIMER_FRAGMENT — verbatim substring of the `id: 'blog'` entry in
// src/content/disclaimers/disclaimers.json. Plan 05-01 BLOG-03: the blog
// disclaimer must render in the BODY of every /blog/<slug> route (in
// addition to the footer disclaimer that the footer-walk asserts). This
// fragment is unique to the blog disclaimer — the footer disclaimer begins
// "The information on this website is...", so a body-text containment check
// against "This article is for general informational purposes only" cannot
// false-positive against the footer.
const BLOG_DISCLAIMER_FRAGMENT =
  'This article is for general informational purposes only';

const DIST_CLIENT = 'dist/client';

const SITEMAP_CANDIDATES = ['sitemap-0.xml', 'sitemap-index.xml', 'sitemap.xml'];

test.beforeAll(() => {
  execSync('npm run build', { stdio: 'pipe' });
});

function readSitemapUrls(): string[] {
  // Find the first sitemap that exists; follow sitemap-index.xml's children
  // if needed. Returns a flat array of every <loc> URL.
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

  // If it's a sitemap-index, follow the child sitemaps. Otherwise read the
  // urlset directly.
  const isIndex = $xml('sitemapindex').length > 0;
  if (isIndex) {
    const urls: string[] = [];
    $xml('sitemap loc').each((_, el) => {
      const childUrl = $xml(el).text().trim();
      // Map remote sitemap URL back to a local file: strip the host, look up
      // the path under dist/client/. This works because @astrojs/sitemap emits
      // child sitemaps under dist/client/sitemap-N.xml.
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
  // Map a sitemap URL like "https://bsvlaw.com/about" to its rendered HTML
  // file at "dist/client/about/index.html". The root path maps to
  // "dist/client/index.html".
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

test.describe('Disclaimer crawl', () => {
  test('footer disclaimer appears on every sitemap route', () => {
    const urls = readSitemapUrls();
    expect(urls.length, 'sitemap must list at least the six Phase 1 routes').toBeGreaterThanOrEqual(6);

    const missing: string[] = [];

    for (const url of urls) {
      const filePath = urlToFilePath(url);
      if (!filePath) {
        missing.push(`${url} — no rendered HTML file under ${DIST_CLIENT}/`);
        continue;
      }
      const html = fs.readFileSync(filePath, 'utf-8');
      const $ = cheerio.load(html);
      const footerText = $('footer').text();
      if (!footerText.includes(FOOTER_DISCLAIMER_FRAGMENT)) {
        missing.push(`${url} (${filePath}) — footer text does not contain the canonical fragment`);
      }
    }

    expect(missing, `Routes missing footer disclaimer:\n${missing.join('\n')}`).toEqual([]);
  });

  test('legacy attorney-advertising sentences are absent from every footer', () => {
    // Belt-and-braces: prove the AA text was actually removed from the site-
    // wide footer (it now lives on /attorney-advertising). Without this check,
    // a regression that re-added the text but kept the new fragment would
    // pass the test above. The /attorney-advertising page itself contains
    // the AA disclosure in its BODY, NOT in the <footer>, so this footer-
    // scoped check correctly excludes that page.
    const urls = readSitemapUrls();
    const leaks: string[] = [];
    for (const url of urls) {
      const filePath = urlToFilePath(url);
      if (!filePath) continue;
      const html = fs.readFileSync(filePath, 'utf-8');
      const $ = cheerio.load(html);
      const footerText = $('footer').text();
      if (footerText.includes(FOOTER_AA_LEGACY_FRAGMENT)) {
        leaks.push(`${url} (${filePath}) — footer still carries legacy AA text`);
      }
    }
    expect(leaks, `Routes leaking legacy AA text in footer:\n${leaks.join('\n')}`).toEqual([]);
  });

  test('Attorney Advertising footer link is present on every sitemap route', () => {
    // Kirkland linked-disclosure pattern (LEGAL-05): every page carries a
    // footer link to /attorney-advertising; the page itself holds the Cal.
    // Rules of Prof'l Conduct disclosure text.
    const urls = readSitemapUrls();
    const missing: string[] = [];
    for (const url of urls) {
      const filePath = urlToFilePath(url);
      if (!filePath) continue;
      const html = fs.readFileSync(filePath, 'utf-8');
      const $ = cheerio.load(html);
      const link = $('footer a[href="/attorney-advertising"]');
      if (link.length === 0) {
        missing.push(`${url} (${filePath}) — no <a href="/attorney-advertising"> in footer`);
        continue;
      }
      const text = link.text().trim();
      if (!/attorney advertising/i.test(text)) {
        missing.push(`${url} (${filePath}) — footer AA link text is "${text}", expected "Attorney Advertising"`);
      }
    }
    expect(missing, `Routes missing Attorney Advertising footer link:\n${missing.join('\n')}`).toEqual([]);
  });

  test('blog disclaimer fragment appears in body on every /blog/<slug> route', () => {
    // BLOG-03: the per-post blog disclaimer (rendered by <Disclaimer id="blog" />
    // inside BlogPostLayout) must appear in the body of every /blog/<slug>
    // page in addition to the footer disclaimer asserted above. /blog (the
    // index page) is EXCLUDED — the index renders without the per-post
    // disclaimer; only individual post pages carry it.
    //
    // When no /blog/<slug> route appears in the sitemap (no published seed
    // post yet — Phase 5 plan 05-05 lands the seed), the filtered set is
    // empty and the test is skipped via test.skip — never false-passes by
    // checking nothing.
    const urls = readSitemapUrls();
    const blogSlugUrls = urls.filter((url) => {
      const pathname = new URL(url).pathname.replace(/\/$/, '');
      return pathname.startsWith('/blog/') && pathname !== '/blog';
    });

    test.skip(
      blogSlugUrls.length === 0,
      'No /blog/<slug> in sitemap — seed post not yet published (Phase 5 plan 05-05)',
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

    expect(missing, `/blog/<slug> routes missing the blog disclaimer:\n${missing.join('\n')}`).toEqual([]);
  });
});
