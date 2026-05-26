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

import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as cheerio from 'cheerio';

const FOOTER_DISCLAIMER_FRAGMENT =
  'The information on this website is for general informational purposes only';

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
});
