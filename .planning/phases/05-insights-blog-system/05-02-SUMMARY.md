---
phase: 05-insights-blog-system
plan: 02
subsystem: blog
tags:
  - astro
  - jsonld
  - mdx
  - schema-dts
  - tailwind-v4
  - playwright

requires:
  - phase: 05-insights-blog-system
    plan: 01
    provides: og-default.svg site fallback, Zod coverAlt-when-cover refine, scaffold tests/article-jsonld.spec.ts (UNSKIP-WHEN this plan), rehype-external-links wired into MDX integration
  - phase: 04-attorney-practice-area-pages
    provides: slot-transferred per-page JSON-LD pattern (buildPersonLd at jsonld.ts lines 62-88; AttorneyLayout JsonLd slot=head at line 35), AttorneyCard shape (data-component marker; Image width/height; namespace utilities)
  - phase: 01-scaffold-and-shell
    provides: BlogPostLayout scaffold wrapping BaseLayout with Disclaimer id=blog already wired; BaseLayout slot name=head at line 48; JsonLd.astro JSON.stringify escape contract; blog content collection author=reference(attorneys); string-slug getStaticPaths contract on [slug].astro
provides:
  - "Real buildArticleLd(post, author): WithContext<Article> at src/lib/jsonld.ts — replaces the Phase 1 throw-stub. Returns headline, Person author (name + profile URL), datePublished, dateModified (fallback to publishedAt), image (cover or og-default.svg fallback), mainEntityOfPage, Organization publisher"
  - "BlogPostLayout chrome: Article JSON-LD slot-transferred into <head>, H1, byline (author name → /attorneys/<slug>, ISO <time>), optional 16:9 cover figure, MDX body in .prose-bsv typography surface, AuthorCard inside an 'About the author' section, persistent <Disclaimer id=blog />"
  - "AuthorCard.astro component: 80×80 headshot (160×160 source), name-as-link, role label, focus line, accent 'Read [First name]'s full profile →' CTA. data-component=AuthorCard marker. No hover-lift (card is not a clickable surface, UI-SPEC line 311)"
  - ".prose-bsv CSS rule appended to global.css (~25 lines under @layer components) — owl-selector paragraph rhythm; h2→text-h3 downscale (UI-SPEC); h3; p; ul/ol/li; blockquote; link color + always-visible underline + hover decoration-2 motion-safe; focus-visible outline; [target=_blank]::after '↗' glyph (pairs with rehype-external-links from 05-01); img; pre; inline code. Token-only — references --text-h3, --text-body-lg, --text-body, --color-border, --color-text-muted, --color-accent, --color-text, --radius-card. color-mix() for subtle code tints (Baseline 2023)"
  - "[slug].astro resolves the author reference via getEntry before render — throws if unknown — and passes { post, author } to BlogPostLayout"
  - "tests/article-jsonld.spec.ts un-skipped with a deferred-pass guard: while PUBLISHED_SLUGS is empty (placeholder-post.mdx draft:true), annotates pending and passes; the moment 05-05 lands the seed post the guard falls through and the full assertion loop runs"
affects:
  - 05-03-blog-index-filtering
  - 05-04-rss-feed
  - 05-05-seed-post

tech-stack:
  added: []
  patterns:
    - "Two-arg JSON-LD builder shape: buildArticleLd(post, author) — the route resolves the reference via getEntry, the builder stays pure. Same separation as buildPersonLd but extended for the cross-collection case (a blog post's author is in a different collection)"
    - "Deferred-pass test pattern: an UNSKIP-WHEN test that has no input data yet (no non-draft posts) annotates as pending and returns early — the same code path runs real assertions automatically once the input data lands. Avoids both false-positives and the need for a second un-skip diff in 05-05"
    - "Slot-transferred Article JSON-LD: <JsonLd slot=\"head\" data={buildArticleLd(post, author)} /> in BlogPostLayout — mirrors the Phase 4 Person + FAQPage patterns; BaseLayout untouched (FOUND-10 / D-11)"
    - "Hand-authored prose-bsv CSS in @layer components: ~25 rules instead of @tailwindcss/typography (~1500 lines). One prose surface in the entire site, plugin would be over-engineering (UI-SPEC explicitly forbids)"

key-files:
  created:
    - "src/components/sections/AuthorCard.astro (49 lines, data-component=AuthorCard, CollectionEntry<'attorneys'> prop, 80×80 headshot, name-as-link, role, focus, accent CTA)"
    - ".planning/phases/05-insights-blog-system/05-02-SUMMARY.md"
  modified:
    - "src/lib/jsonld.ts (throw-stub replaced; real buildArticleLd added, signature (post, author): WithContext<Article>; og-default.svg fallback; no sameAs; no reviewedBy)"
    - "src/layouts/BlogPostLayout.astro (signature → { post, author }; JsonLd slot=head first child; H1 + byline + optional cover figure + .prose-bsv body slot + AuthorCard section + preserved disclaimer; max-w-prose container)"
    - "src/pages/blog/[slug].astro (added getEntry import + await getEntry(entry.data.author) resolution + unknown-author throw + passes post + author to layout; preserves string-slug getStaticPaths)"
    - "src/styles/global.css (appended @layer components .prose-bsv block — ~25 token-only rules)"
    - "tests/article-jsonld.spec.ts (un-skipped; PUBLISHED_SLUGS=listNonDraftPostSlugs(); deferred-pass guard returns with pending annotation when zero non-draft posts; full assertion loop unchanged)"

key-decisions:
  - "buildArticleLd takes the resolved author entry as a second argument rather than re-resolving via getEntry inside jsonld.ts. Rationale: keeps jsonld.ts free of astro:content runtime concerns (the existing buildPersonLd / buildLegalServiceLd are pure), pushes the cross-collection resolution into the route where it naturally belongs (next to the render() + getEntry() calls), and means a future caller can pass a synthetic author entry for testing without standing up the full content runtime"
  - "Image-fallback strategy is `${SITE.baseUrl}/og-default.svg` (the 05-01 Wave-0 asset) rather than `getImage()` resolution. Rationale: the schema field `cover: image().optional()` returns an ImageMetadata shape with `src` being the build-output URL path (e.g. /_astro/cover.abc.webp); the `as { src: string }` cast acknowledges that shape without pulling in getImage(). For posts without a cover (most thought-leadership posts won't have one in v1) the og-default.svg path is referenced verbatim — no asset-pipeline round-trip"
  - "Test-un-skip pattern is deferred-pass with pending annotation, not test.skip(empty, reason). Rationale: test.skip() under Playwright produces a skipped count which 05-05 would then need to flip back to passed (extra coordination); the early-return-with-annotation passes today AND tomorrow with the same code — only the assertion loop's input set changes. Lower-mass than the 05-01 disclaimer-crawl pattern (test.skip with empty list) by one un-skip diff in 05-05"
  - "Author byline in BlogPostLayout uses accent color + always-visible underline (text-accent underline decoration-1 underline-offset-2), NOT just a hover underline. Rationale: UI-SPEC line 112 'Underline-on-hover is not enough — accessibility readers and reduced-motion users need rest-state affordance.' This matches the M&A practice-area link pattern from Phase 4"
  - "AuthorCard's outer container is a plain <div>, not <a>, even though the name and the CTA are both links to /attorneys/<slug>. Rationale: UI-SPEC line 311 explicitly forbids a hover-lift on the outer surface because the card is not a clickable surface — only the name and the CTA inside it are. A hover-lift on a non-clickable card would create a deceptive affordance"

requirements-completed:
  - BLOG-01
  - BLOG-02
  - BLOG-03
  - BLOG-04
  - SEO-04
  - LEGAL-09

# Metrics
duration: 6m
completed: 2026-05-28
---

# Phase 5 Plan 02: BlogPostLayout Slice (Article JSON-LD + Chrome) Summary

**MVP vertical slice — read one published blog post end-to-end. The `buildArticleLd` Phase 1 throw-stub is replaced with a real two-arg implementation; `BlogPostLayout` gains the full chrome (Article JSON-LD slot-transferred into `<head>`, H1 + byline, optional 16:9 cover figure, `.prose-bsv` MDX body, `AuthorCard` section, preserved blog disclaimer); `[slug].astro` resolves the author reference via `getEntry`; the `tests/article-jsonld.spec.ts` 05-01 scaffold is un-skipped behind a deferred-pass guard.** The slice is gated invisible until 05-05 publishes the seed post — `placeholder-post.mdx` stays `draft: true` so no `/blog/<slug>/` HTML is emitted yet.

## Performance

- **Duration:** ~6m
- **Started:** 2026-05-28T19:20:11Z
- **Completed:** 2026-05-28T19:26:11Z
- **Tasks:** 3
- **Files modified:** 6 (1 created — AuthorCard.astro; 5 modified — jsonld.ts, BlogPostLayout.astro, [slug].astro, global.css, article-jsonld.spec.ts)

## Accomplishments

- **`buildArticleLd` is real.** The throw-stub at `src/lib/jsonld.ts:114` is replaced by a `WithContext<Article>` implementation matching the locked UI-SPEC / RESEARCH contract: `@type: Article`, `headline`, Person `author` (name + `/attorneys/<slug>` URL), ISO `datePublished`, ISO `dateModified` (fallback to `publishedAt`), `image` (cover-resolved or `og-default.svg` fallback), `mainEntityOfPage`, Organization `publisher`. Two-arg signature `(post, author)` keeps jsonld.ts pure of `astro:content` runtime concerns.
- **`BlogPostLayout` chrome is complete.** Frontmatter imports `JsonLd`, `AuthorCard`, `Image`, `buildArticleLd`, plus the type-only `CollectionEntry` import. Props interface is `{ post, author }`. First child of `<BaseLayout>` is `<JsonLd slot="head" data={buildArticleLd(post, author)} />` — slot-transfers into BaseLayout's `<slot name="head" />` per the Phase 4 pattern. The body shell: `<article class="bg-bg py-section">` → `<div class="mx-auto max-w-prose px-gutter">` → `<header>` with H1 + byline (author name → `/attorneys/<slug>`, ISO `<time>`) → optional 16:9 `<figure>` with `<Image>` cover (coverAlt non-null asserted from the 05-01 Zod refine) → MDX body slot wrapped in `prose prose-bsv mt-10 max-w-none text-body text-text`. Below the article: `<section aria-label="About the author">` with an sr-only H2 + `<AuthorCard attorney={author} />`. Last child: preserved `<Disclaimer id="blog" />`.
- **`AuthorCard.astro` lands.** New component at `src/components/sections/AuthorCard.astro` (49 lines) — `data-component="AuthorCard"` marker on the outer `<div>`, locked Tailwind v4 namespace shape, `<Image width=160 height=160 class="h-20 w-20 ...">` for retina 80×80 display, name-as-link with motion-safe hover decoration + focus-visible accent ring, role label (text-small uppercase tracking-wide text-text-muted), focus line, accent "Read [First name]'s full profile →" CTA. No hover-lift on the outer container.
- **`.prose-bsv` typography rule appended to `global.css`.** ~25 hand-authored CSS rules under `@layer components`: owl-selector paragraph rhythm (`> * + * { margin-top: 1.5em }`), h2→text-h3 downscale (UI-SPEC), h3, p, ul/ol/li, blockquote, link color + always-visible underline + motion-safe hover thicker decoration, focus-visible outline, `[target="_blank"]::after { content: " ↗" }` (pairs with rehype-external-links from 05-01), img, pre, inline code. Token-only — references `--text-h3`, `--text-body-lg`, `--text-body`, `--color-border`, `--color-text-muted`, `--color-accent`, `--color-text`, `--radius-card`. `color-mix(in srgb, ...)` for subtle code-background tints (CSS-stable as of Baseline 2023).
- **`[slug].astro` resolves the author.** Imports `getEntry` alongside `getCollection, render`; after `const { entry } = Astro.props` resolves `const author = await getEntry(entry.data.author)`; throws with a descriptive error if the reference can't resolve; passes both `post={entry}` and `author={author}` to `BlogPostLayout`. Preserves the `params: { slug: entry.data.slug }` STRING contract (FOUND-10 / Pitfall 12) verbatim.
- **`tests/article-jsonld.spec.ts` un-skipped behind a deferred-pass guard.** Removed `test.describe.skip` → `test.describe`; updated the header comment from "SCAFFOLD" to "RESOLVED 05-02"; added the no-posts-yet guard (annotates pending and returns early when `PUBLISHED_SLUGS.length === 0`). The full assertion loop is unchanged — `@context`, `headline`, author Person shape with `/attorneys/<slug>` URL prefix, ISO date parsing for `datePublished` + `dateModified`, `image`, `mainEntityOfPage` ending with `/<slug>`, Organization-or-LegalService publisher. When 05-05 publishes the seed post, `listNonDraftPostSlugs()` returns one entry, the guard falls through, and the assertion loop runs against the real Article JSON-LD in `dist/client/blog/<slug>/index.html` — zero further test edits required.

## Task Commits

Each task was committed atomically:

1. **Task 1: Replace the buildArticleLd stub with a real implementation** — `a73cfdf` (feat)
2. **Task 2: Add AuthorCard component and .prose-bsv typography rule** — `7691d8b` (feat)
3. **Task 3: Wire BlogPostLayout chrome + author resolution + test un-skip** — `7b69dad` (feat)

## Files Created/Modified

**Created:**
- `src/components/sections/AuthorCard.astro` — 49 lines, `data-component="AuthorCard"`, `CollectionEntry<'attorneys'>` prop, 80×80 headshot, name-as-link, role, focus line, accent CTA

**Modified:**
- `src/lib/jsonld.ts` — throw-stub replaced with real `buildArticleLd(post, author): WithContext<Article>`; signature, fields, and og-default.svg fallback match UI-SPEC/RESEARCH contract; no `sameAs` on Person sub-blob (D-02); no `reviewedBy` anywhere (D-13)
- `src/layouts/BlogPostLayout.astro` — full chrome: signature `{ post, author }`, JsonLd slot=head first child, header with H1 + byline (author name links to `/attorneys/<slug>`, ISO `<time>`), optional 16:9 cover figure, MDX body inside `prose prose-bsv`, AuthorCard section, preserved `<Disclaimer id="blog" />`
- `src/pages/blog/[slug].astro` — added `getEntry` import; resolves `author = await getEntry(entry.data.author)`; throws on unknown author; passes both `post` and `author` to BlogPostLayout; preserves string-slug `getStaticPaths`
- `src/styles/global.css` — appended `@layer components { .prose-bsv ... }` block (~25 rules), token-only
- `tests/article-jsonld.spec.ts` — un-skipped (`test.describe.skip` → `test.describe`); header comment updated to "RESOLVED 05-02"; added deferred-pass guard (early return + pending annotation when zero non-draft posts); assertion loop unchanged

## Decisions Made

1. **`buildArticleLd(post, author)` takes the resolved author entry as an argument rather than re-resolving inside jsonld.ts.** Keeps jsonld.ts pure of `astro:content` runtime concerns (the existing `buildPersonLd` and `buildLegalServiceLd` are pure), pushes the cross-collection resolution into `[slug].astro` where it naturally belongs (next to the `render()` + `getEntry()` calls), and means a future caller can pass a synthetic author entry for testing without standing up the full content runtime. UI-SPEC and PATTERNS both pin this signature.

2. **Image-fallback strategy is `${SITE.baseUrl}/og-default.svg` (the 05-01 Wave-0 asset), referenced verbatim, with a typed cast for the cover path.** The schema field `cover: image().optional()` returns an ImageMetadata shape with `src` being the build-output URL path (e.g. `/_astro/cover.abc.webp`). The `as { src: string }` cast acknowledges that shape without pulling in `getImage()`. For posts without a cover (most thought-leadership posts won't have one in v1) the og-default.svg path is referenced verbatim — no asset-pipeline round-trip. RESEARCH Open Question 2 resolved.

3. **Test-un-skip pattern is deferred-pass with pending annotation, not `test.skip(empty, reason)`.** `test.skip()` under Playwright produces a skipped count which 05-05 would need to flip back to passed (extra coordination); the early-return-with-annotation passes today AND tomorrow with the same code — only the assertion loop's input set changes. Lower-mass than the 05-01 disclaimer-crawl pattern (`test.skip` with empty list) by one un-skip diff in 05-05.

4. **Author byline in BlogPostLayout uses accent color + always-visible underline, not just hover-underline.** UI-SPEC line 112: "Underline-on-hover is not enough — accessibility readers and reduced-motion users need rest-state affordance." Matches the M&A practice-area link pattern from Phase 4. The motion-safe `decoration-2` thickening only applies to the hover state.

5. **AuthorCard's outer container is a plain `<div>`, not an `<a>`.** UI-SPEC line 311 explicitly forbids a hover-lift on the outer surface — the card is not a clickable surface; only the name and the CTA inside it are. A hover-lift on a non-clickable card would create a deceptive affordance. The AttorneyCard analog on the homepage CAN hover-lift because the whole card IS the link; AuthorCard's structure differs intentionally.

## Deviations from Plan

None — plan executed exactly as written.

The plan asked for the buildArticleLd two-arg signature with nine specific fields, the og-default.svg fallback, no `sameAs`, no `reviewedBy`; all four checks pass. The plan asked for AuthorCard with the locked Tailwind shape, 80×80 headshot, name-as-link, role, focus, accent CTA, no hover-lift; the verify script confirms each. The plan asked for `.prose-bsv` referencing only existing CSS variables; the variable-only check passes. The plan asked for BlogPostLayout's Props interface to declare both `post` and `author`, the JsonLd slot transfer first, the guarded cover figure, the MDX body inside `prose prose-bsv`, AuthorCard inside the "About the author" section, the disclaimer last; all six checks pass. The plan asked for `[slug].astro` to add `getEntry` + author resolution + throw + pass both props + preserve the string-slug `getStaticPaths`; all five checks pass. The plan asked for `tests/article-jsonld.spec.ts` to be un-skipped with a `PUBLISHED_SLUGS.length === 0` guard; both conditions hold.

One verification-script note: the plan's regex for the `buildArticleLd` signature did not include a trailing comma after `CollectionEntry<'attorneys'>`. The implementation uses idiomatic TypeScript with a trailing comma (matches the existing `buildPersonLd` style); a slightly relaxed regex (`,?\s*`) confirmed the signature is shape-correct. No code change needed.

## Issues Encountered

None. All three tasks ran first-try with no Rule 1/2/3 auto-fixes required. The Wave-0 foundation (05-01) accurately specified every dependency this slice needed: `rehype-external-links` for the `[target="_blank"]::after` pairing, `og-default.svg` for the image fallback, the Zod refine on coverAlt for the `coverAlt!` non-null assertion in the cover figure, the article-jsonld.spec.ts scaffold awaiting un-skip.

## User Setup Required

None — no external service configuration required for plan 05-02. The chrome ships invisible until 05-05 publishes the seed post (`placeholder-post.mdx` stays `draft: true`; the loader filters it out; no `/blog/<slug>/` HTML is emitted by `npm run build`).

## Verification Evidence

- `npm run check` — 0 errors, 0 warnings, 68 pre-existing hints (`z is deprecated` from astro:content + JsonLd `is:inline` notice — both pre-existing from earlier phases). File count rose from 70 to 71 (the new AuthorCard.astro is type-checked).
- `npm run build` — succeeded; all existing routes (`/`, `/about`, `/attorneys/*`, `/practice-areas/*`, `/blog`, `/contact`, `/design-system`, `/robots.txt`) regenerated cleanly. No `/blog/<slug>/` HTML emitted (placeholder-post.mdx stays draft:true, as designed).
- `npx playwright test tests/article-jsonld.spec.ts` — 1 passed (the deferred-pass guard annotates "pending" with the expected description and returns before the assertion loop).
- `npm test` — 49 passed, 8 skipped (all 8 skips are the still-deferred 05-01 scaffolds: blog-pages-exist, blog-filter ×4, rss-feed ×2, disclaimer-crawl blog-route — every skip is tied to an UNSKIP-WHEN marker for 05-03/04/05). Zero regressions in `disclaimer-crawl`, `person-jsonld`, `faqpage-jsonld`, `jsonld-legalservice`, `pages-exist`, `lead-attorney-link`, `lint-legal`, `zod-negative`, `fishbien-absent`, `draft-exclusion`, `gallery`.
- `npm run lint:legal` — clean, no Rule 7.4 banned terms.
- `git diff src/layouts/BaseLayout.astro src/components/seo/JsonLd.astro src/components/legal/Disclaimer.astro src/content/blog/placeholder-post.mdx` — empty (none of these files were edited, as required by the plan's verification block).

## Threat Flags

None. The two threat-model items relevant to this plan (T-05-01 Article JSON-LD `</script>` escape and T-05-07 cover-image XSS) were already mitigated structurally by Phase 1 — JsonLd.astro uses `JSON.stringify` which escapes the script-breakout characters per ECMAScript spec; the schema field `cover: image()` rejects raw URL strings at build time. This plan introduces no new network endpoints, no new auth paths, no new file-access patterns, and no schema changes at trust boundaries.

## Next Phase Readiness

**Plan 05-03 (blog-index-filtering) is unblocked:**
- `BlogPostLayout` ships the full chrome — the filtered index can link to `/blog/<slug>` confident that the resulting page renders correctly.
- `AuthorCard` is reusable if a future surface (v2 "Recent posts by Aaron" band on the attorney profile, etc.) needs it.

**Plan 05-04 (RSS feed) is unblocked:**
- `buildArticleLd` is implemented; if the RSS pipeline wants to emit per-item Article JSON-LD into a `<content:encoded>` payload, the builder is available.
- The author-resolution pattern (`getEntry(post.data.author)` in the route, pass to the layout) maps directly to the RSS endpoint's per-item processing.

**Plan 05-05 (seed post) is unblocked:**
- The moment Jon's seed post lands with `draft: false`, the `[slug].astro` route emits `dist/client/blog/<slug>/index.html` with the full chrome; the `tests/article-jsonld.spec.ts` deferred-pass guard falls through and the real assertion loop runs.
- The `coverAlt!` non-null assertion in BlogPostLayout's cover figure is safe — the 05-01 Zod refine guarantees a non-empty coverAlt whenever cover is set, so Jon either ships without a cover or with a complete alt-text pair.

**No blockers introduced.**

## Self-Check: PASSED

All files claimed in this summary verified to exist on disk; all three task commits verified in `git log`.

- `src/components/sections/AuthorCard.astro` — FOUND (49 lines, includes `data-component="AuthorCard"`, `h-20 w-20`, `firstName`)
- `src/lib/jsonld.ts` — FOUND (no `throw new Error('buildArticleLd not implemented'` remains; `buildArticleLd(post, author)` signature present; `og-default.svg` referenced; no emitted `sameAs:` or `reviewedBy:` keys)
- `src/layouts/BlogPostLayout.astro` — FOUND (interface Props has both `post` and `author`; `<JsonLd slot="head"` first child; `<AuthorCard attorney={author} />`; preserved `<Disclaimer id="blog" />`; `max-w-prose`; `prose-bsv`)
- `src/pages/blog/[slug].astro` — FOUND (`getEntry` imported; `await getEntry(entry.data.author)` resolution; `post={entry} author={author}`; `params: { slug: entry.data.slug }` preserved)
- `src/styles/global.css` — FOUND (`.prose-bsv` block present after the reduced-motion media query; no new `#hex` literals inside the prose block)
- `tests/article-jsonld.spec.ts` — FOUND (un-skipped; `PUBLISHED_SLUGS.length === 0` guard present)
- Commit `a73cfdf` — FOUND (Task 1: buildArticleLd implementation)
- Commit `7691d8b` — FOUND (Task 2: AuthorCard + .prose-bsv)
- Commit `7b69dad` — FOUND (Task 3: BlogPostLayout chrome + author resolution + test un-skip)

---

*Phase: 05-insights-blog-system*
*Plan: 02*
*Completed: 2026-05-28*
