---
phase: 01-scaffold-shell
plan: "04"
subsystem: placeholder-routes
tags: [wave-4, routes, getstaticpaths, sitemap, 404, 500]
requirements:
  - FOUND-05
  - FOUND-06
  - LEGAL-01
dependency-graph:
  requires:
    - plan-01 (baselayout, sitemap-integration, vercel-adapter)
    - plan-02 (content-collections-with-draft-filter)
    - plan-03 (three-specialized-layouts)
  provides:
    - eight-static-routes (/, /about, /contact, /practice-areas, /attorneys, /blog, /404, /500)
    - three-dynamic-route-shells (attorneys/[slug], practice-areas/[slug], blog/[slug]) — emit zero pages in Phase 1 by design
    - responsive-siteheader (stacks below md breakpoint)
    - sitefooter-with-mailto (links to SITE.email)
    - sitemap-0-xml (six URLs — /404 and /500 deliberately not indexed)
  affects:
    - plan-07 (disclaimer-crawl test walks sitemap-0.xml + asserts disclaimer on every <loc>; will set PLAYWRIGHT_NEEDS_SERVER=1 for the webServer)
    - plan-08 (final preview deploy + branch-protection toggle)
    - phase-3 (real homepage + about content swaps into /index.astro + /about.astro)
    - phase-4 (toggling draft:false on real attorneys lights up /attorneys/[slug] automatically)
    - phase-5 (first non-draft blog post lights up /blog/[slug] automatically)
key-files:
  created:
    - src/pages/about.astro
    - src/pages/contact.astro
    - src/pages/practice-areas/index.astro
    - src/pages/practice-areas/[slug].astro
    - src/pages/attorneys/index.astro
    - src/pages/attorneys/[slug].astro
    - src/pages/blog/index.astro
    - src/pages/blog/[slug].astro
    - src/pages/404.astro
    - src/pages/500.astro
  modified:
    - src/components/chrome/SiteHeader.astro (responsive flex-col -> md:flex-row stack; active-link underline)
    - src/components/chrome/SiteFooter.astro (imports SITE from src/lib/site; mailto link to SITE.email; copyright uses SITE.name)
decisions:
  - "Confirmed the Astro+sitemap output filename: dist/client/sitemap-0.xml (six <url>/<loc> entries). dist/client/sitemap-index.xml is also generated as the wrapper. Plan 07's disclaimer-crawl test must read sitemap-0.xml directly (not sitemap-index.xml) because the canonical URL list is in the leaf file. Recorded here per Plan 01-04 plan output instruction (RESEARCH.md A3)."
  - "404 and 500 are NOT in the sitemap. Astro emits them as static html files at dist/client/{404,500}.html but excludes them from the sitemap-0.xml urlset — correct behavior (error pages should not be indexed). Plan 07's crawl test walks sitemap-0.xml only, so it won't check 404/500. A future Phase 7 launch test could verify 404 by GETting a non-existent URL on the deployed site."
  - "Contact page deliberately renders WITHOUT a <Disclaimer id='contact' /> in Phase 1. That disclaimer attaches to the contact form (Phase 6). The footer disclaimer is still present via SiteFooter, so LEGAL-01 is still satisfied. Avoids the awkwardness of showing the contact-form disclaimer in Phase 1 when there is no form to disclaim about yet."
  - "All Plan 02 placeholders are draft: true, so every Phase 1 index page renders its empty-state branch and every dynamic route emits zero pages. This is the deliberate Phase 1 ship state. The empty states are friendly ('Practice area pages arrive in Phase 4 of the build.') rather than blank — preview viewers see something meaningful even before content lands."
metrics:
  tasks: 3
  commits: 3
  files_created: 10
  files_modified: 2
  human_checkpoints: 0
  completed: "2026-05-26T10:32:00Z"
---

# Phase 01 Plan 04: Placeholder Routes — Summary

Created the full Phase 1 route surface: 8 static pages (homepage, 5 index/static, branded 404, branded 500), 3 dynamic `[slug].astro` shells, and refined SiteHeader (responsive stacking below md) + SiteFooter (mailto link via SITE.email). Every rendered HTML page contains the canonical footer disclaimer. Dynamic routes ship empty by design — Phase 4 and Phase 5 turn them on by toggling `draft: false` on real content.

## What was built

### Task 1 — SiteHeader + SiteFooter refinements (commit `c981153`)

**SiteHeader** — kept Plan 01's `aria-current` + active-link logic; changed the inner `<nav>` from desktop-only (`hidden gap-6 ... md:flex`) to a responsive stack (`flex flex-col gap-3 ... md:flex-row md:items-center md:justify-between`). On viewports below 768px the nav now stacks vertically (placeholder until Phase 2 builds a real mobile menu). Active links get `font-medium underline` for visibility across palettes.

**SiteFooter** — switched from a hardcoded firm name + copyright to importing `SITE` from `src/lib/site.ts` (Plan 03's constants). New line: `New client intake: <a href="mailto:intake@bsvlaw.com" class="underline">intake@bsvlaw.com</a>`. The footer disclaimer, both office locations, and the dynamic copyright year are unchanged.

### Task 2 — Seven static pages (commit `fcdc426`)

All seven follow the same `<BaseLayout title=... description=...>` shell with a `<section class="mx-auto max-w-3xl px-6 py-16">` container, a `<h1>`, and one placeholder paragraph.

- **`/about`** — "Coming soon. Full About content arrives in Phase 3 of the build."
- **`/contact`** — mailto link + "A full contact form arrives in Phase 6 of the build." Deliberately omits `<Disclaimer id="contact" />` — that attaches to the form when it lands. Footer disclaimer is still present.
- **`/practice-areas/`** — `getCollection('practiceAreas', ({ data }) => !data.draft)`. Empty-state branch renders in Phase 1 ("Practice area pages arrive in Phase 4 of the build."). Phase 4 lights up the list when real entries flip to `draft: false`.
- **`/attorneys/`** — same pattern, "Attorney profiles arrive in Phase 4 of the build."
- **`/blog/`** — same pattern, labelled "Insights" in the H1, "The Insights blog arrives in Phase 5 of the build."
- **`/404`** — "Page not found" with a link back to `/`. Vercel serves this when no route matches.
- **`/500`** — "Something went wrong" with a mailto fallback. Vercel serves on server errors.

Verified: `npm run build` exits 0 and emits all 8 expected HTML files under `dist/client/`. Grepping for the footer-disclaimer fragment `general informational purposes only` returns OK on all 8 pages.

### Task 3 — Three dynamic-route shells (commit `1fa2523`)

Each `[slug].astro` follows the canonical Astro 6 pattern:

```astro
export async function getStaticPaths() {
  const entries = await getCollection('<collection>', ({ data }) => !data.draft);
  return entries.map((entry) => ({
    params: { slug: entry.data.slug }, // STRING — Astro 6 / FOUND-10 / Pitfall 12
    props: { entry },
  }));
}
const { entry } = Astro.props;
const { Content } = await render(entry);
```

- **`attorneys/[slug].astro`** wraps `AttorneyLayout` passing `attorney={entry}` and renders `<Content />`. AttorneyLayout (Plan 03) supplies the `<h1>`, `<Disclaimer id="attorney" />`, and the reserved Person JSON-LD slot.
- **`practice-areas/[slug].astro`** wraps `PracticeAreaLayout` passing `practiceArea={entry}`. PracticeAreaLayout supplies the disclaimer + reserved FAQPage slot.
- **`blog/[slug].astro`** wraps `BlogPostLayout` passing `post={entry}`. BlogPostLayout supplies the disclaimer + reserved Article slot.

Phase 1 ships ZERO dynamic-route pages because every Plan 02 placeholder is `draft: true`. Build prerenders 8 static routes + 0 dynamic. This is the intended Phase 1 ship state — Phase 4 toggles `draft: false` on the four published attorneys and the three real practice areas; Phase 5 publishes the first real Insights post.

Verified: `npm run build` exits 0 (empty `getStaticPaths` arrays return cleanly). `npm run check` exits 0 with 0 errors / 0 warnings / 71 hints.

## Risk register & open items

- The sitemap excludes `/404` and `/500`. Correct behavior; Plan 07's disclaimer-crawl test walks sitemap URLs only, so 404/500 are not in scope for that test. A future launch verification (Phase 7) could GET a non-existent URL on production and assert the disclaimer is present.
- The contact page in Phase 1 has no client-side validation, no form, and no honeypot. All of that lands in Phase 6 along with the Astro Action + Resend backend. Footer disclaimer still satisfies LEGAL-01 for the route.
- The Plan 03 `<meta property="og:image" content="/og-default.png" />` references a file that does not yet exist in `public/`. Phase 3 supplies it. Acceptable Phase 1 risk — no preview deploy is being shared with external parties yet.
- Astro renders `<title>BSV Insights</title>` for `/blog/` (the index) — that's mildly inconsistent with `/blog/[slug]` which uses `${post.data.title} — BSV Insights`. Both are fine; Phase 5 can revisit the title strategy if needed.

## Verification evidence

- `npm run build` → exit 0; prerendered 8 routes (`/`, `/about`, `/contact`, `/practice-areas/`, `/attorneys/`, `/blog/`, `/404`, `/500`).
- `npm run check` → 0 errors, 0 warnings, 71 hints.
- `dist/client/sitemap-0.xml` → 6 `<url>/<loc>` entries (the 6 static routes that should be indexed). Verified by `cat dist/client/sitemap-0.xml`.
- Disclaimer presence on every rendered HTML — grep across the 8 files returns OK on all of them.
- Dynamic [slug] routes emit zero pages — `dist/client/attorneys/<slug>/`, `dist/client/practice-areas/<slug>/`, `dist/client/blog/<slug>/` directories do NOT exist post-build (verified).

## Self-Check: PASSED

- [x] Eleven placeholder routes exist: /, /about, /contact, /practice-areas (+ dynamic shell), /attorneys (+ dynamic shell), /blog (+ dynamic shell), /404, /500
- [x] Every placeholder route uses BaseLayout (directly or via a specialized layout) so the footer disclaimer appears everywhere
- [x] Dynamic routes use getStaticPaths() with STRING params (Astro 6 / FOUND-10)
- [x] Site nav links in SiteHeader point to routes that now actually exist
- [x] Dynamic routes filter `({ data }) => !data.draft` — draft content cannot leak into sitemap or dynamic URL
