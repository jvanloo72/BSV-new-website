// tests/article-jsonld.spec.ts
//
// BLOG-04 / SEO-04: every published blog post page renders an Article JSON-LD
// block in <head> (slot-transferred from BlogPostLayout through BaseLayout).
// Mirrors person-jsonld.spec.ts: build-in-beforeAll + cheerio extraction +
// per-slug shape assertions.
//
// RESOLVED 05-02: buildArticleLd is implemented; BlogPostLayout renders
// <JsonLd slot="head" data={buildArticleLd(post, author)} />. The describe
// block is un-skipped. While placeholder-post.mdx stays draft:true and no
// non-draft posts exist, the test passes vacuously via a pending-annotation
// guard (no slugs to iterate). The moment 05-05 publishes the seed post,
// PUBLISHED_SLUGS becomes non-empty and the full assertion loop runs.
//
// Also folds in the RESEARCH Pitfall 2 contract: a future Astro upgrade
// that breaks the Container API would also break Article JSON-LD via this
// test's beforeAll build step.

import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as cheerio from 'cheerio';

const DIST_CLIENT = 'dist/client';
const BLOG_CONTENT_DIR = path.join('src', 'content', 'blog');
const SITE_BASE_URL = 'https://bsvlaw.com';

interface PostInfo {
  slug: string;
  category: 'insight' | 'deal-announcement';
}

function listNonDraftPosts(): PostInfo[] {
  if (!fs.existsSync(BLOG_CONTENT_DIR)) return [];
  const posts: PostInfo[] = [];
  for (const entry of fs.readdirSync(BLOG_CONTENT_DIR)) {
    if (!entry.endsWith('.mdx') || entry.startsWith('_')) continue;
    const raw = fs.readFileSync(path.join(BLOG_CONTENT_DIR, entry), 'utf-8');
    const slugMatch = /^slug:\s*["']?([^"'\n]+)["']?\s*$/m.exec(raw);
    const draftMatch = /^draft:\s*(true|false)\s*$/m.exec(raw);
    const categoryMatch = /^category:\s*["']?(insight|deal-announcement)["']?\s*$/m.exec(raw);
    if (!slugMatch) continue;
    const isDraft = draftMatch ? draftMatch[1] === 'true' : false;
    if (isDraft) continue;
    if (!categoryMatch) continue;
    posts.push({ slug: slugMatch[1], category: categoryMatch[1] as 'insight' | 'deal-announcement' });
  }
  return posts;
}

function readArticleLd(slug: string): Record<string, unknown> | null {
  const file = path.join(DIST_CLIENT, 'blog', slug, 'index.html');
  if (!fs.existsSync(file)) return null;
  const html = fs.readFileSync(file, 'utf-8');
  const $ = cheerio.load(html);
  // RESEARCH A5 — the JSON-LD <script> MUST appear inside <head>.
  for (const s of $('head > script[type="application/ld+json"]').toArray()) {
    const parsed = JSON.parse($(s).html() ?? '{}');
    if (parsed['@type'] === 'Article') return parsed;
  }
  return null;
}

test.describe('Article JSON-LD (BLOG-04 / SEO-04)', () => {
  test('every published blog post page has valid Article JSON-LD in <head>', () => {
    execSync('npm run build', { stdio: 'pipe' });
    const PUBLISHED = listNonDraftPosts();

    // Deferred-pass guard: while no non-draft post exists on disk there is
    // nothing to assert. Annotate as pending and pass — the moment a
    // non-draft post lands, the assertion loop runs for real.
    if (PUBLISHED.length === 0) {
      test.info().annotations.push({
        type: 'pending',
        description: 'No non-draft blog posts yet',
      });
      return;
    }

    const missing: string[] = [];
    for (const { slug, category } of PUBLISHED) {
      const ld = readArticleLd(slug);
      if (!ld) {
        missing.push(`${slug}: no Article JSON-LD in <head>`);
        continue;
      }
      if (ld['@context'] !== 'https://schema.org') missing.push(`${slug}: bad @context`);
      if (typeof ld.headline !== 'string' || !ld.headline) missing.push(`${slug}: missing headline`);

      const author = ld.author as Record<string, unknown> | undefined;
      if (!author) {
        missing.push(`${slug}: missing author`);
      } else if (category === 'insight') {
        // Insight posts: author is a Person sub-blob with name + /attorneys/<slug> url.
        if (author['@type'] !== 'Person') missing.push(`${slug}: insight author['@type'] is not 'Person'`);
        if (typeof author.name !== 'string' || !author.name) missing.push(`${slug}: missing author.name`);
        if (typeof author.url !== 'string' || !author.url.startsWith(`${SITE_BASE_URL}/attorneys/`)) {
          missing.push(`${slug}: insight author.url must start with ${SITE_BASE_URL}/attorneys/`);
        }
      } else {
        // Deal-announcement posts: author is an Organization sub-blob (the firm).
        if (author['@type'] !== 'Organization') missing.push(`${slug}: deal-announcement author['@type'] is not 'Organization'`);
        if (typeof author.name !== 'string' || !author.name) missing.push(`${slug}: missing author.name`);
        if (typeof author.url !== 'string' || author.url !== SITE_BASE_URL) {
          missing.push(`${slug}: deal-announcement author.url must equal ${SITE_BASE_URL}`);
        }
      }

      const datePublished = ld.datePublished;
      if (typeof datePublished !== 'string' || Number.isNaN(Date.parse(datePublished))) {
        missing.push(`${slug}: datePublished not a parseable ISO string`);
      }
      const dateModified = ld.dateModified;
      if (typeof dateModified !== 'string' || Number.isNaN(Date.parse(dateModified))) {
        missing.push(`${slug}: dateModified not a parseable ISO string`);
      }
      if (typeof ld.image !== 'string' || !ld.image) missing.push(`${slug}: missing image`);

      const mainEntityOfPage = ld.mainEntityOfPage;
      if (typeof mainEntityOfPage !== 'string' || !mainEntityOfPage.endsWith(`/${slug}`)) {
        missing.push(`${slug}: mainEntityOfPage must end with /${slug}`);
      }

      const publisher = ld.publisher as Record<string, unknown> | undefined;
      if (!publisher) {
        missing.push(`${slug}: missing publisher`);
      } else {
        const pubType = publisher['@type'];
        if (pubType !== 'Organization' && pubType !== 'LegalService') {
          missing.push(`${slug}: publisher['@type'] must be 'Organization' or 'LegalService'`);
        }
      }
    }

    expect(missing, missing.join('\n')).toEqual([]);
  });
});
