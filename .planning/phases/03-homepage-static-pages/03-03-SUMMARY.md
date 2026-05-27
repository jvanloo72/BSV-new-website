---
phase: 03-homepage-static-pages
plan: 03
subsystem: section-indexes-error-pages-seo
tags: [indexes, error-pages, seo, sitemap, robots, jsonld, empty-state]
requires:
  - "Phase 2 section components (PracticeAreaCard, AttorneyCard) + UI Button"
  - "BaseLayout (site-wide LegalService JSON-LD + SiteFooter Disclaimer + SeoHead meta)"
  - "Locked @theme tokens in src/styles/global.css"
  - "@astrojs/sitemap configured in astro.config.mjs (site: https://bsvlaw.com, /design-system excluded)"
provides:
  - "Practice Areas index (/practice-areas) with three slug-linked cards"
  - "Attorneys index (/attorneys) with all five non-linking AttorneyCards"
  - "Insights index (/blog) with a warm branded empty-state"
  - "Branded 404 + 500 error pages with paths home and to /contact"
  - "/robots.txt static endpoint referencing the sitemap (SEO-08)"
affects:
  - "Phase 4 attorney/practice-area detail routes (index card hrefs resolve to them)"
  - "Phase 5 blog post routes (Insights index switches from empty-state to post list)"
tech-stack:
  added: []
  patterns:
    - "robots.txt as an Astro static endpoint (src/pages/robots.txt.ts) — no astro-robots-txt dependency"
    - "Index pages keep the getCollection read for an honest empty-state branch while rendering curated cards (collections hold placeholder MDX until Phase 4)"
    - "Branded error pages render fixed static content only — no stack traces / internal paths (T-03-07)"
key-files:
  created:
    - "src/pages/robots.txt.ts"
  modified:
    - "src/pages/practice-areas/index.astro"
    - "src/pages/attorneys/index.astro"
    - "src/pages/blog/index.astro"
    - "src/pages/404.astro"
    - "src/pages/500.astro"
decisions:
  - "robots.txt generated via an Astro static endpoint (zero new dependency) rather than installing astro-robots-txt; @astrojs/sitemap does not emit robots.txt on its own"
  - "robots.txt omits /design-system entirely (no Disallow line) so it cannot advertise the hidden gallery (T-03-08)"
metrics:
  duration: "12m"
  completed: "2026-05-27"
  tasks: 3
  files: 6
---

# Phase 3 Plan 03: Section Indexes, Branded Error Pages & SEO Baseline Summary

The navigational spine is now complete: from the homepage a visitor reaches the Practice Areas, Attorneys, and Insights indexes in one click each, every index renders real, on-brand cards (or a warm empty-state), and a wrong URL or server error lands on a branded BSV page with a clear path home and to contact — never a generic Vercel page. The SEO plumbing (per-page SeoHead meta, site-wide LegalService JSON-LD, sitemap, and a new robots.txt) is verified live across the static surface.

## What Was Built

- **Task 1 — Practice Areas + Attorneys indexes (PAGES-04 / PAGES-05):** Rewrote `src/pages/practice-areas/index.astro` to render three `PracticeAreaCard`s linking to the locked slugs (`/practice-areas/mergers-acquisitions`, `/practice-areas/intellectual-property-technology-transactions`, `/practice-areas/tax`) in the `grid gap-8 sm:grid-cols-2 lg:grid-cols-3` layout, keeping the `getCollection('practiceAreas')` read + a graceful empty-state branch. Rewrote `src/pages/attorneys/index.astro` to render all five attorneys (Belcher, Smolen, Van Loo, Zhang, Jiang) as **non-linking** `AttorneyCard`s (reusing the curated team data + the five headshot imports from the homepage) in the `xl:grid-cols-5` layout — the former team member appears nowhere. Both files token-retrofitted from `text-[color:var(...)]` to namespace tokens (`text-h1 font-bold text-text`, `text-body-lg text-text-muted`); both keep the public BaseLayout wrapper (no `noindex`).
- **Task 2 — Insights empty-state + branded 404/500 (PAGES-06 / PAGES-07):** Warmed `src/pages/blog/index.astro`'s `posts.length === 0` branch with on-tone copy ("Insights are on the way — practical analysis from the BSV team on M&A, IP, and tax. Check back soon.") plus a `Button` to `/contact`. Rewrote `src/pages/404.astro` with warm copy ("This page took a wrong turn.") and **two** paths — a primary `Button` to `/` and a secondary `Button` to `/contact`. Rewrote `src/pages/500.astro` keeping the `SITE.email` mailto, adding a path home, and warming the copy. Both error pages render fixed static content only (no stack traces / internal paths, T-03-07) and neither passes `noindex`. All three token-retrofitted.
- **Task 3 — SEO / sitemap / robots / JSON-LD baseline (SEO-01/02/07/08):** Confirmed every Phase 3 public page passes a page-appropriate `title` + `description` to BaseLayout (SeoHead emits title/description/canonical/OG; about + contact already carry real meta). Confirmed BaseLayout still injects the site-wide `LegalService` JSON-LD (no per-page JSON-LD added — that is Phase 4/5). The build emits `sitemap-index.xml` + `sitemap-0.xml` listing `/`, `/about`, `/attorneys`, `/blog`, `/contact`, `/practice-areas` (with `/design-system` excluded). Added `src/pages/robots.txt.ts` — a static endpoint that allows all crawlers and points at the sitemap, deliberately not advertising the hidden gallery.

## Verification

- `npm run build` (via `node node_modules/astro/bin/astro.mjs build`) completes with no errors.
- Task 1 content check: practice-areas index contains all three locked slugs; attorneys index contains all five surnames; no "Fishbien"; neither contains `text-[color:var(`.
- Task 2 content check: blog index retains `posts.length === 0`; 404 contains `/contact` and no `text-[color:var(`; 500 contains `SITE.email` and no `text-[color:var(`.
- Task 3: `dist/client/` contains `sitemap-index.xml` + `sitemap-0.xml` and `robots.txt`; robots.txt references `https://bsvlaw.com/sitemap-index.xml` and contains no `design-system` reference.
- `npm run test:jsonld` — **1 passed** (LegalService JSON-LD present + parses + both office locations).
- `npm run test:disclaimer` — **1 passed** (footer disclaimer present on every sitemap route).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] robots.txt was missing from the build output**
- **Found during:** Task 3
- **Issue:** The plan's Task 3 action anticipated this ("If `robots.txt` is missing from the build output, add the minimal robots generation"). `@astrojs/sitemap` generates the sitemap but does **not** emit a `robots.txt` — the baseline build had no `dist/client/robots.txt`, which would fail the SEO-08 acceptance criterion.
- **Fix:** Added `src/pages/robots.txt.ts`, an Astro static endpoint that allows all crawlers and references the sitemap index. Chose a static endpoint over installing `astro-robots-txt` to add zero new dependency (no package-legitimacy concern) and to keep the noindex/sitemap-exclusion discipline intact — the file omits `/design-system` entirely so it cannot advertise the hidden gallery (T-03-08).
- **Files modified:** `src/pages/robots.txt.ts` (new)
- **Commit:** cea227d

## Threat Surface Notes

No new threat surface beyond the plan's `<threat_model>`. The two error pages render only fixed static copy + `SITE.email` (T-03-07 satisfied — no stack traces, internal paths, or env values). robots.txt does not advertise `/design-system` (T-03-08 satisfied). No inline `<script>` or third-party embed added (T-03-09). No packages installed (T-03-SC).

## Known Stubs

None that block the plan's goal. Two intentional, plan-sanctioned interim states:
- **AttorneyCard hrefs omitted on the Attorneys index** — cards render as non-linking `<div>`s in Phase 3; the `/attorneys/[slug]` detail routes are built in Phase 4 (per CONTEXT cross-linking discretion).
- **Practice Areas card hrefs point to Phase 4 detail routes** — `/practice-areas/[slug]` targets are interim-dead until Phase 4 fills them (acceptable per CONTEXT).

## Note on test tooling (not a deviation)

The local PowerShell execution policy blocks the `.ps1`/`npx` shims, so `astro build` and the Playwright suites were invoked directly via `node node_modules/astro/bin/astro.mjs build` and `node node_modules/@playwright/test/cli.js test ...`. Both `test:jsonld` and `test:disclaimer` ran and passed against the freshly built `dist/client/` output (the tests run their own `npm run build` in `beforeAll`).

## Self-Check: PASSED

Created/modified files verified present on disk:
- FOUND: src/pages/practice-areas/index.astro
- FOUND: src/pages/attorneys/index.astro
- FOUND: src/pages/blog/index.astro
- FOUND: src/pages/404.astro
- FOUND: src/pages/500.astro
- FOUND: src/pages/robots.txt.ts
- FOUND: .planning/phases/03-homepage-static-pages/03-03-SUMMARY.md

Commits verified in git log:
- FOUND: f3532db — feat(03-03): render real Practice Areas and Attorneys index pages
- FOUND: 6648648 — feat(03-03): warm Insights empty-state and brand the 404/500 pages
- FOUND: cea227d — feat(03-03): generate robots.txt referencing the sitemap (SEO-08)
