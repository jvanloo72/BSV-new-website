// tests/blog-pages-exist.spec.ts
//
// BLOG-01 / BLOG-09: every published blog post (non-draft) renders to a
// dist/client/blog/<slug>/index.html file at build time. Also enforces the
// phase-close invariant BLOG-09 — at least one non-draft post lives in
// src/content/blog/ at phase end.
//
// 2026-05-28: un-skipped after Plan 05-05's seed-post pivot. The original
// pre-pivot expectation was "exactly 1 non-draft post" (single Jon-authored
// seed); after Jon's import of 14 bsvlaw.com/news posts, the count is 14.
// The assertion was relaxed to ≥1 — BLOG-09's substantive requirement is
// "at least one published seed post," which 14 over-satisfies.

import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

const DIST_CLIENT = 'dist/client';
const BLOG_CONTENT_DIR = path.join('src', 'content', 'blog');

function listNonDraftPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_CONTENT_DIR)) return [];
  const slugs: string[] = [];
  for (const entry of fs.readdirSync(BLOG_CONTENT_DIR)) {
    if (!entry.endsWith('.mdx')) continue;
    // Loader pattern is **/[^_]*.mdx — files beginning with '_' are excluded.
    if (entry.startsWith('_')) continue;
    const file = path.join(BLOG_CONTENT_DIR, entry);
    const raw = fs.readFileSync(file, 'utf-8');
    // Find frontmatter slug + draft fields. Very small parser — only matches
    // YAML key:value at the start of a line. Good enough for the fixture
    // shape we control.
    const slugMatch = /^slug:\s*["']?([^"'\n]+)["']?\s*$/m.exec(raw);
    const draftMatch = /^draft:\s*(true|false)\s*$/m.exec(raw);
    if (!slugMatch) continue;
    const isDraft = draftMatch ? draftMatch[1] === 'true' : false;
    if (!isDraft) slugs.push(slugMatch[1]);
  }
  return slugs;
}

test.describe('Blog pages exist (BLOG-01 / BLOG-09)', () => {
  test('every non-draft blog post renders to dist/client/blog/<slug>/index.html and at least one is published', () => {
    execSync('npm run build', { stdio: 'pipe' });
    const slugs = listNonDraftPostSlugs();

    // BLOG-09 phase-close invariant: at least one non-draft post.
    expect(slugs.length, `expected ≥1 non-draft blog post; found ${slugs.length}`).toBeGreaterThanOrEqual(1);

    const missing: string[] = [];
    for (const slug of slugs) {
      const expected = path.join(DIST_CLIENT, 'blog', slug, 'index.html');
      if (!fs.existsSync(expected)) {
        missing.push(`${slug}: no rendered HTML at ${expected}`);
      }
    }
    expect(missing, missing.join('\n')).toEqual([]);
  });
});
