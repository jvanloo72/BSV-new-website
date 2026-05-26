---
phase: 01-scaffold-shell
plan: "03"
subsystem: jsonld-and-specialized-layouts
tags: [wave-3, json-ld, schema-dts, seo, a11y, slot-transfer, baselayout]
requirements:
  - FOUND-05
  - FOUND-06
  - FOUND-07
dependency-graph:
  requires:
    - plan-01 (baselayout-with-named-head-slot, sitefooter, disclaimer-component)
    - plan-02 (five-content-collections — needed for CollectionEntry types in specialized layouts)
  provides:
    - site-constants (SITE in src/lib/site.ts)
    - legalservice-jsonld-builder (buildLegalServiceLd in src/lib/jsonld.ts)
    - person-and-article-jsonld-stubs (throw-stubs reserving the contract for Phase 4/5)
    - jsonld-render-component (src/components/seo/JsonLd.astro)
    - seohead-component (src/components/seo/SeoHead.astro)
    - skiptocontent-component (src/components/chrome/SkipToContent.astro)
    - baselayout-with-sitewide-jsonld (D-29 site-wide LegalService injection)
    - three-specialized-layouts (AttorneyLayout, PracticeAreaLayout, BlogPostLayout)
    - slot-transfer-contract (specialized layouts inject per-page JSON-LD via <JsonLd slot="head" /> without modifying BaseLayout)
  affects:
    - plan-04-placeholder-routes (the three [slug] dynamic routes use the specialized layouts)
    - plan-07-ci-and-disclaimer-crawl (jsonld-legalservice test now runs in CI)
    - phase-4-attorney-and-practice-area-pages (will fill the JsonLd slot with Person + FAQPage JSON-LD)
    - phase-5-insights-blog (will fill the JsonLd slot with Article JSON-LD)
key-files:
  created:
    - src/lib/site.ts (firm constants — SITE with name, baseUrl, phone, email, two offices)
    - src/lib/jsonld.ts (buildLegalServiceLd + buildPersonLd + buildArticleLd stubs)
    - src/components/seo/JsonLd.astro (generic <script type="application/ld+json"> renderer with set:html)
    - src/components/seo/SeoHead.astro (per-page title + description + canonical? + OG/Twitter)
    - src/components/chrome/SkipToContent.astro (WCAG 2.1 SC 2.4.1 bypass-blocks link)
    - src/layouts/AttorneyLayout.astro (wraps BaseLayout; Disclaimer id="attorney"; JsonLd slot reserved for Phase 4)
    - src/layouts/PracticeAreaLayout.astro (wraps BaseLayout; Disclaimer id="practice-area"; FAQPage slot reserved for Phase 4)
    - src/layouts/BlogPostLayout.astro (wraps BaseLayout; Disclaimer id="blog"; Article slot reserved for Phase 5)
  modified:
    - src/layouts/BaseLayout.astro (added SkipToContent, SeoHead, JsonLd imports; removed inline title/description/canonical/OG since SeoHead owns them now; site-wide buildLegalServiceLd() injection)
    - tests/jsonld-legalservice.spec.ts (replaced Plan 00 test.skip with real body)
    - package.json (added test:jsonld script)
decisions:
  - "Test reads dist/client/index.html, not dist/index.html. The Vercel adapter (Plan 01) splits build output into dist/client/ (static assets) and dist/server/ (serverless function entries). Since Plan 01-06's /api/csp-report endpoint forces a serverless route into the build, the homepage now renders under dist/client/. Phase 7 launch verification + CI workflows (Plan 01-07) must use the same path."
  - "JsonLd component renders inline <script type=\"application/ld+json\" set:html={...} />. Astro escapes <, >, &, U+2028, U+2029 inside JSON.stringify when given a plain object, so an attacker who somehow got a `</script>` substring into a builder's output would still be safely encoded. In Phase 1 the input is always compile-time-typed data from src/lib/site.ts — no runtime user input ever reaches the builder. Phase 6's contact form uses a separate code path that does not feed JsonLd."
  - "SeoHead does not emit <meta name=\"robots\">. That tag stays in BaseLayout because the preview-noindex behavior (D-19) is a layout-wide concern, not a per-page one. If a future per-page robots override is needed, it should be added as a BaseLayout prop, not exported to SeoHead."
  - "buildPersonLd and buildArticleLd are throw-stubs that fix the contract (input + output types via schema-dts) without implementing the bodies yet. Phase 4 / Phase 5 each implements its respective stub. The stubs let Plan 01-03 close cleanly without leaving 'unused export' warnings in src/lib/jsonld.ts (the stubs are exported and referenced from comments in AttorneyLayout / BlogPostLayout)."
metrics:
  tasks: 3
  commits: 3
  files_created: 8
  files_modified: 3
  human_checkpoints: 0
  completed: "2026-05-26T10:30:00Z"
---

# Phase 01 Plan 03: JSON-LD + Specialized Layouts — Summary

Built the JSON-LD + SEO + a11y infrastructure that every later page composes through. BaseLayout grows from Plan 01's Walking Skeleton minimum to its full Phase 1 shape: SkipToContent as the first focusable element, SeoHead as the single source of `<title>` + description + OG, and a site-wide `<JsonLd data={buildLegalServiceLd()} />` injection. Three specialized layouts (AttorneyLayout, PracticeAreaLayout, BlogPostLayout) wrap BaseLayout, each adding its per-page disclaimer and reserving the `<JsonLd slot="head" />` position for Phase 4 / Phase 5 to fill.

## What was built

### Task 1 — JSON-LD + SEO + a11y primitives (commit `4c7b361`)

**`src/lib/site.ts`** — `export const SITE` (as const) with the firm name, baseUrl, phone (placeholder per RESEARCH.md A7), email, and a two-element `offices` array (PostalAddress-shaped). Silicon Valley street + postal are literal `'TBD'` strings — intentional, so Jon sees them flagged in any Rich Results Test rather than silently emitting a malformed PostalAddress.

**`src/lib/jsonld.ts`** — three exports.
- `buildLegalServiceLd(): WithContext<LegalService>` — the canonical site-wide structured data: `@context`, `@type: 'LegalService'`, `name` / `url` / `telephone` pulled from SITE, `address` as a mapped PostalAddress array, `areaServed: 'United States'`, `knowsAbout` with the five practice areas (Mergers and Acquisitions, Intellectual Property, Technology Transactions, Tax, Cryptocurrency Taxation), `contactPoint` with `availableLanguage: ['English', 'Mandarin']` (Iris Zhang fluency per FIRM_BRIEF.md).
- `buildPersonLd(_attorney: unknown): WithContext<Person>` — throw-stub for Phase 4.
- `buildArticleLd(_post: unknown): WithContext<Article>` — throw-stub for Phase 5.

**`src/components/seo/JsonLd.astro`** — `interface Props { data: object; }`. Body is a single `<script type="application/ld+json" set:html={JSON.stringify(data)} />`. A comment block documents the input-trust contract (compile-time-typed only in Phase 1; contact form in Phase 6 uses a separate code path).

**`src/components/seo/SeoHead.astro`** — props `{ title; description; canonical?; ogImage? }`. Emits `<title>`, `<meta name="description">`, conditional `<link rel="canonical">`, OG (title/description/type/image with `/og-default.png` fallback), `<meta name="twitter:card" content="summary_large_image">`. Deliberately does NOT emit `<meta name="robots">` — BaseLayout owns that.

**`src/components/chrome/SkipToContent.astro`** — `<a href="#main">Skip to main content</a>` with the canonical Tailwind `sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 ...` utilities so the link is hidden until keyboard focus.

Verification: `npm run check` exits 0 (0 errors, 0 warnings, 72 hints — the same Plan 00 stub hints; schema-dts types compile cleanly under TS strict).

### Task 2 — BaseLayout extended + three specialized layouts (commit `1231437`)

**`src/layouts/BaseLayout.astro`** — added four imports (SkipToContent, SeoHead, JsonLd, buildLegalServiceLd) and rewrote the `<head>` body:
- After charset + viewport + robots meta, `<SeoHead title={title} description={description} canonical={canonical} ogImage={ogImage} />` is the sole emitter of `<title>` / description / OG / Twitter card.
- The previous Plan 01 inline `<title>{title}</title>` + `<meta name="description">` + conditional `<link rel="canonical">` + OG tags were REMOVED (avoids the duplicate `<title>` defect).
- After the favicon link, `<JsonLd data={buildLegalServiceLd()} />` injects the site-wide LegalService structured data.
- `<slot name="head" />` is preserved at the end of `<head>` — the slot-transfer hook for specialized layouts.
- `<body>` now starts with `<SkipToContent />` BEFORE `<SiteHeader>`, making it the first focusable element on every page.
- The conditional `<meta name="robots">` (D-19) was preserved at its original position.

**`src/layouts/AttorneyLayout.astro`** — `interface Props { attorney: CollectionEntry<'attorneys'> }`. Body: `<BaseLayout title={\`${attorney.data.name} — BSV Law\`} description={attorney.data.focus}>` containing an `<article>` with `<h1>{name}</h1><p>{title}</p><slot />` and `<Disclaimer id="attorney" />` after the slot. A comment block reserves the `<JsonLd slot="head" data={buildPersonLd(attorney)} />` position for Phase 4.

**`src/layouts/PracticeAreaLayout.astro`** — `interface Props { practiceArea: CollectionEntry<'practiceAreas'> }`. Body: BaseLayout with the practice-area title + summary; renders the practice area's name in `<h1>`; slot for body; `<Disclaimer id="practice-area" />`. Reserves the FAQPage JSON-LD slot for Phase 4.

**`src/layouts/BlogPostLayout.astro`** — `interface Props { post: CollectionEntry<'blog'> }`. Body: BaseLayout with `${post.data.title} — BSV Insights` + post summary; renders the post title in `<h1>`; slot; `<Disclaimer id="blog" />`. Reserves the Article JSON-LD slot for Phase 5.

Verification: `npm run build` exits 0. The function bundle still ships (CSP endpoint unchanged). `dist/client/index.html` contains the LegalService JSON-LD with the firm name, both office localities, both contact methods, and the SkipToContent link as the first `<body>` child.

### Task 3 — jsonld-legalservice test body (commit `5f5b923`)

**`tests/jsonld-legalservice.spec.ts`** — replaces Plan 00's `test.skip(...)` with a real body. `test.beforeAll` runs `npm run build` via `execSync` so the test is self-contained. The test loads `dist/client/index.html` (NOT `dist/index.html` — the Vercel adapter splits output), parses with Cheerio, iterates all `<script type="application/ld+json">` blocks until it finds one with `'@type' === 'LegalService'`, then asserts the firm name, both office localities (`'San Francisco'` and `'Silicon Valley'`), and the `@context`.

**`package.json`** — added `test:jsonld` script. Total Phase 1 test surface now: `test:disclaimer-set`, `test:zod-negative`, `test:jsonld` (the disclaimer-crawl test in `test:disclaimer` remains test.skip pending Plan 07's wiring).

Verification: `npm run test:jsonld` exits 0 in ~7 s (build + test).

## Risk register & open items

- The Plan 00 scaffold comment on `tests/jsonld-legalservice.spec.ts` said "implementation lands in Plan 07" — that was wrong; this plan owned it. The comment is replaced with the canonical header in the rewritten file. No cross-reference cleanup needed.
- The `<meta property="og:image" content="/og-default.png" />` references a file that does not yet exist in `public/`. Phase 3 supplies it (or Plan 06 of Phase 3 wires Vercel's OG-generation function). Until then the OG image is a broken link — acceptable in Phase 1 because no preview deploy is shared with external parties yet.
- `buildPersonLd` and `buildArticleLd` throw at runtime. Calling them in Phase 1 would crash a build. They are deliberately not called anywhere in Phase 1 code; the contract-only existence is enough for Plan 03 to declare success.
- The `Telephone: +1-415-XXX-XXXX` placeholder will appear in production JSON-LD if the build runs before Phase 7 swaps in the real number. The Schema.org `LegalService.telephone` type accepts any string, so this won't break validation — but Jon must remember to replace it during Phase 7 final review.

## Verification evidence

- `npm run check` → 0 errors, 0 warnings, 72 hints (one additional hint vs Plan 02 — the new test file added during Plan 03).
- `npm run build` → exit 0; `dist/client/index.html` rendered.
- `grep` on `dist/client/index.html` confirms: `<script type="application/ld+json">{"@context":"https://schema.org","@type":"LegalService",...`, `Belcher, Smolen & Van Loo LLP`, `San Francisco`, `Silicon Valley`, and `<a href="#main" class="sr-only ...">Skip to main content</a>` as the first focusable element.
- `npm run test:jsonld` → exit 0 in ~6.9 s; one assertion block (5 expectations) all green.

## Self-Check: PASSED

- [x] BaseLayout injects LegalService JSON-LD into <head> of every page rendered through it
- [x] Specialized layouts (AttorneyLayout, PracticeAreaLayout, BlogPostLayout) wrap BaseLayout and add per-page disclaimer + (reserved) per-page JSON-LD slot
- [x] The LegalService JSON-LD is parseable JSON containing the firm name and both office locations (verified by test:jsonld)
- [x] SkipToContent is the first focusable element on every page (visible in dist/client/index.html as the first <body> child)
