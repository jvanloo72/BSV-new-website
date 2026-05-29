# Plan 05-05 Summary — Seed-post publish gate (pivoted)

**Date:** 2026-05-28
**Status:** Goal satisfied by a substantially different path than planned
**Original plan:** `05-05-PLAN.md` — one Jon-authored crypto-tax post, formatted into a single MDX file, flipped from `draft: true` to `draft: false` after Jon's sign-off, placeholder retired in the same commit.
**What actually shipped:** 14 posts imported from bsvlaw.com/news, all published.

---

## Pivot context

Plan 05-05 was non-autonomous by design (`autonomous: false` in frontmatter; a `checkpoint:human-action` task gating the publish). When the executor reached that checkpoint and surfaced the four prompts (title / summary / cover / publish date), Jon responded with a three-step restructure instead of a draft body:

1. **Remove Rule 7.4 lint + clearance gate.** Both LEGAL-03 (`lint:legal` banned-term scanner) and LEGAL-04 (`CLIENT_DISCLOSURE_CLEARANCE.md` register) were descoped. Five files deleted, two REQUIREMENTS.md rows removed, manual review now the operational gate. Recorded in DECISIONS.md (2026-05-28).
2. **Two-category blog schema.** `category: 'insight' | 'deal-announcement'` enum added to `src/content.config.ts`. `author` and `practiceArea` became `.optional()` at the field level; two refinements enforce `insight ⇒ both required` and `deal-announcement ⇒ both absent`. BlogPostLayout, `[slug].astro`, `/blog/index.astro`, `FilterChipRow`, `buildArticleLd`, and `rss.xml.ts` all updated to handle author-less posts. The "Deal Announcements" chip joined the topic row. Article JSON-LD on author-less posts uses the firm `Organization` as author + publisher.
3. **Import 14 posts from bsvlaw.com/news.** All bodies transferred verbatim (D-01/D-02). 6 named-author insights (5 Jon Van Loo tax + 1 Stuart Smolen IP) + 8 firm-attributed deal announcements. After approval, all 14 published in one atomic commit; placeholder-post.mdx retired in the same commit. `.planning/REDIRECT-MAP.md` recorded the 14 legacy `/news/...` → new `/blog/<slug>` 301 mappings + `/news/` index + `/news/page/N` wildcard, ready for Phase 7's `vercel.json` wiring.

A fourth pivot landed after publish — Jon ordered a footer redesign: the site-wide footer disclaimer was retired in favor of four linked pages (`/about`, `/attorney-advertising`, `/privacy`, `/legal-notices`). The disclaimer-crawl test was rewritten to assert the 4-link contract instead of a text fragment. LEGAL-01 and LEGAL-05 amended. Recorded in DECISIONS.md (2026-05-28, separate entry).

---

## How Plan 05-05's stated requirements were satisfied

| Plan 05-05 expectation | What shipped |
|------------------------|--------------|
| Scaffold one MDX with `draft: true` | 14 MDX files scaffolded with `draft: true` in commit `09ab32a` |
| Run `lint:legal` and surface hits | Skipped — LEGAL-03 was descoped in the same pivot. Jon's manual review is now the gate. |
| Wait for Jon's sign-off on the body | Jon approved the import table for all 14 posts (slugs, categories, author assignments) before publish |
| Flip `draft: false` on the published post | All 14 flipped via `sed` in commit `68a8d62` |
| Delete `placeholder-post.mdx` in the same commit | Done (commit `ccbb690` corrected a staging miss in `68a8d62`; deletion landed cleanly) |
| Build + push + report Vercel preview URL | Build green; commit `34a5d20` pushed; Jon inspected the preview |
| BLOG-09 satisfied | Over-satisfied 6× (named-author insights) + 8× (firm-attributed deal announcements) |

---

## Tasks completed (substantively, not by the original task IDs)

1. **05-05 T1 (scaffold):** Done × 14. Commit `09ab32a` created 14 MDX files with `draft: true`, valid frontmatter against the new category-aware schema.
2. **05-05 T2 (checkpoint:human-action):** Replaced by Jon's three-step restructure + approval flow. Approval signal: Jon replied "approved" to the import table on 2026-05-28; later replied "publish all" to the publication-gate prompt.
3. **05-05 T3 (publish + delete placeholder):** Done in commit `68a8d62` (publish flip) + `ccbb690` (placeholder deletion correction). Build verified green; full Playwright suite passed.

---

## Verification evidence (cross-references VERIFICATION.md)

- `npm run build` → 14 `dist/client/blog/<slug>/index.html` files generated; `/blog/rss.xml` carries 14 `<item>` entries; sitemap-0.xml lists every `/blog/<slug>`.
- `npm test` → 61+ passed, 1 skipped (the broken-blog-post fixture marker, intentional).
- D-08 invariant verified: `grep '@bsvlaw.com' dist/client/blog/rss.xml` returns 0.
- All 14 D-NN decisions from CONTEXT.md observably honored in shipped code.

---

## Files modified / created (full list across the pivot commits)

**Schema + layout + library:**
- `src/content.config.ts` — category enum + two refinements
- `src/layouts/BlogPostLayout.astro` — conditional byline (Person link vs firm name) + conditional AuthorCard
- `src/pages/blog/[slug].astro` — conditional `getEntry()` on the optional author reference
- `src/lib/jsonld.ts` — `buildArticleLd` signature now `(post, author?)`; Organization author when undefined
- `src/pages/blog/index.astro` — `?author=` + `?topic=` URL contract; per-category data attributes on `<li>`
- `src/components/sections/FilterChipRow.astro` — `paramName` type widened to `'author' | 'topic'`
- `src/pages/blog/rss.xml.ts` — per-item author falls back to firm name when no Person

**Content:**
- 14 new MDX files in `src/content/blog/`
- `src/content/blog/placeholder-post.mdx` — deleted
- `src/content/disclaimers/disclaimers.json` — footer entry deleted

**Pages:**
- `src/pages/attorney-advertising.astro` — new
- `src/pages/privacy.astro` — new (DRAFT, awaiting Jon's review)
- `src/pages/legal-notices.astro` — new

**Footer redesign:**
- `src/components/chrome/SiteFooter.astro` — centered; Contact Us label; 4-link nav row; no inline disclaimer
- `src/lib/site.ts` — `SITE.email: 'info@bsvlaw.com'` (was `intake@bsvlaw.com`)

**Tests:**
- `tests/zod-negative.spec.ts` — accepts the new refinement message
- `tests/blog-zod-author.spec.ts` + `tests/blog-zod-cover.spec.ts` — already live from 05-01
- `tests/article-jsonld.spec.ts` — category-aware (Person vs Organization)
- `tests/blog-filter.spec.ts` — `?author=&topic=` contract + Deal Announcements chip test
- `tests/disclaimer-crawl.spec.ts` — 4-link contract instead of text fragment
- `tests/baselayout.spec.ts` — same 4-link assertion on homepage
- `tests/disclaimer-set.spec.ts` — reduced from 5 ids to 4
- `tests/blog-pages-exist.spec.ts` — un-skipped; assertion relaxed from `=== 1` to `≥ 1`

**Cleanup:**
- `scripts/lint-legal.mjs` — deleted (LEGAL-03 descope)
- `scripts/lint-legal.allowlist.json` — deleted (residual from LEGAL-03 descope cleanup)
- `tests/lint-legal.spec.ts` + `tests/_fixtures/lint-legal-violation.mdx` — deleted
- `tests/clearance.spec.ts` — deleted (LEGAL-04 descope)
- `.planning/CLIENT_DISCLOSURE_CLEARANCE.md` — deleted
- `package.json` `prebuild` + `lint:legal` scripts — removed
- `.github/workflows/ci.yml` "Lint legal content" step — removed
- `src/components/legal/Disclaimer.astro` `DisclaimerId` union — `'footer'` removed

**Planning docs:**
- `.planning/REQUIREMENTS.md` — LEGAL-03/04 deleted; FOUND-04 + BLOG-02 + LEGAL-01 + LEGAL-05 + LEGAL-09 amended; BLOG-09 + SEO-04 marked Complete
- `.planning/ROADMAP.md` — Phase 7 success criterion 5 reworded
- `.planning/DECISIONS.md` — four 2026-05-28 entries
- `.planning/REDIRECT-MAP.md` — new

---

## Commits (chronological)

| Commit | Title |
|--------|-------|
| `be9d21f` | feat(05): remove Rule 7.4 lint + client-disclosure clearance gate |
| `a00094d` | feat(05): add two-category blog schema (insight + deal-announcement) |
| `09ab32a` | feat(05): import 14 bsvlaw.com/news posts as draft:true MDX |
| `68a8d62` | feat(05): publish all 14 imported posts + add REDIRECT-MAP.md |
| `ccbb690` | fix(05): actually delete placeholder-post.mdx |
| `7bab5b5` | feat(05): trim Guidestar; linked AA disclosure; footer About link; firm email = info@bsvlaw.com |
| `34a5d20` | feat(05): centered footer redesign — site-wide disclaimer retired, 4 linked pages |

---

## Open follow-up for Phase 7

The `/privacy` page shipped as a **draft scaffold** marked clearly on the page itself. Jon must read through and amend any phrasing before launch. This is a deliberate non-blocking follow-up — every other Phase 5 surface is final.
