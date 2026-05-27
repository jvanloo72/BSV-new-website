---
phase: 03-homepage-static-pages
plan: 02
subsystem: about-page
tags: [about, storybrand, offices, source-of-truth, dry, seo]
requires:
  - "Phase 2 section component CtaBlock + UI primitives Eyebrow / TextLink"
  - "BaseLayout (site-wide LegalService JSON-LD + SiteFooter Disclaimer + SeoHead meta)"
  - "Locked @theme tokens in src/styles/global.css"
  - "SITE.offices single source of truth in src/lib/site.ts"
provides:
  - "Public About page at /about — client-first StoryBrand, both offices, closing CTA"
  - "formatOffice(o) helper in src/lib/site.ts — shared office-line derivation (footer + About)"
affects:
  - "Phase 4 attorney/practice-area detail routes (About's onward TextLinks resolve to the indexes that link onward to them)"
  - "Any future surface that needs a formatted single-line office string can reuse formatOffice"
tech-stack:
  added: []
  patterns:
    - "Single-source office-line derivation extracted to formatOffice in site.ts (DRY across footer + About)"
    - "StoryBrand page spine: client's world/fear → guide-with-a-plan → substance-as-proof → offices → loop-closing CTA"
    - "Offices rendered text-only from SITE.offices via formatOffice — TBD segments suppressed, no third-party map embed"
key-files:
  created: []
  modified:
    - "src/lib/site.ts"
    - "src/components/chrome/SiteFooter.astro"
    - "src/pages/about.astro"
decisions:
  - "formatOffice extracted into site.ts (not duplicated) so the footer and About share one TBD-omitting derivation and can never drift"
  - "About substance drawn strictly from FIRM_BRIEF.md (D-06) — no invented founding year or origin narrative"
metrics:
  duration: "6m"
  completed: "2026-05-27"
  tasks: 2
  files: 3
---

# Phase 3 Plan 02: About Page Summary

The About page is now a real, navigable `/about` slice that follows the StoryBrand spine: it opens with the client's world and the fear of the wrong counsel, frames BSV as the trusted guide with a plan (partner-led teams, deep transaction experience, deal-pace responsiveness), presents the firm's substance as proof drawn only from verifiable facts, shows both offices from the single source of truth, and closes the loop toward contact and the section indexes. The office-line derivation that the footer and About both need now lives once as a `formatOffice` helper.

## What Was Built

- **Task 1 — `formatOffice` helper + footer refactor:** Added an exported `formatOffice(o)` function to `src/lib/site.ts` carrying the exact TBD-omitting derivation that previously lived inline in `SiteFooter.astro` — push the street address only when present and not `"TBD"`, always push the locality, build a `"region postal"` segment including the postal code only when present and not `"TBD"`, then `join(', ')`. Refactored `SiteFooter.astro` to `import { SITE, formatOffice }` and replace its inline `officeLines` block with `SITE.offices.map(formatOffice)`. All footer markup — the `<Disclaimer id="footer" />` render, both office `<span>` lines, the `mailto`, the copyright, and the locked `mx-auto max-w-6xl px-6` container — is byte-for-byte unchanged. Produces `"Silicon Valley, CA"` (TBD street suppressed) and `"555 California St., Suite 4925, San Francisco, CA 94104"`.
- **Task 2 — Client-first About page:** Rewrote `src/pages/about.astro` from the Phase 1 placeholder into a five-beat StoryBrand page inside the public `BaseLayout` (real title/description, no `noindex`): (1) an `<Eyebrow>` + `max-w-3xl` reading column naming the client's world and the fear of the wrong counsel — opening with a page-appropriate echo of the homepage framing, not a verbatim copy; (2) a "How we work" guide-with-a-plan band whose three points map to competence / experience / responsiveness; (3) a "Why a boutique" proof section built strictly from `FIRM_BRIEF.md` (M&A / IP-Tech / Tax focus, the partners' senior pedigrees — Linklaters, Dechert, Dewey & LeBoeuf, the Federal Circuit clerkship, the crypto-tax practice — fee transparency, and Chambers Spotlight 2026) with credentials as proof, never the lead, and no invented founding year; (4) a two-office block rendering `SITE.offices.map(formatOffice)` inside an `<address class="not-italic">` with no map embed; (5) a closing `CtaBlock` toward `/contact` plus inline `<TextLink>` onward links to `/attorneys` and `/practice-areas`. Token-only throughout — every `text-[color:var(...)]` occurrence removed.

## Verification

- `npm run build` (via `node node_modules/astro/bin/astro.mjs build`) completes with no errors and emits `dist/client/about/index.html`.
- Source check on `src/pages/about.astro`: references `formatOffice` / `SITE.offices`, contains `/contact`, and contains no `text-[color:var(` occurrence — PASS.
- Rendered `/about` HTML contains `555 California St`, `Silicon Valley`, `/contact`, `/attorneys`, and `/practice-areas`, with no malformed `"…San Francisco, CA 94104, TBD"` office string — PASS.
- `test:disclaimer` (disclaimer-crawl.spec.ts, run via `node node_modules/@playwright/test/cli.js`) — **1 passed**: footer disclaimer present on every sitemap route, including `/about` (footer refactor did not regress it).
- `test:jsonld` (jsonld-legalservice.spec.ts) — **1 passed**: site-wide `LegalService` JSON-LD parses and contains the firm name + both office locations.

## Deviations from Plan

None — plan executed exactly as written.

### Note on the source token-check (not a deviation)

Task 2's automated source assertion is a blunt substring match for `text-[color:var(`. The first draft of the About page's header comment used that literal string while documenting the constraint ("no `text-[color:var(...)]`"), which tripped the substring check even though the page contains no such *usage*. The comment was reworded to describe the constraint without the literal token form; no styling/markup changed. The page uses only Tailwind v4 namespace utilities.

### Note on test tooling (not a deviation)

The local PowerShell execution policy blocks the `.ps1`/`npx`/`playwright` shims, so `astro build` and the Playwright suites were invoked directly via `node node_modules/astro/bin/astro.mjs build` and `node node_modules/@playwright/test/cli.js test ...` — the same approach used in Plans 01 and 03. Both Playwright suites run their own `npm run build` in `beforeAll`, so they exercise the freshly built `/about` output.

## Threat Surface Notes

No new threat surface beyond the plan's `<threat_model>`. T-03-04 (information disclosure / office address) is mitigated — offices render only from `SITE.offices` through `formatOffice`, which suppresses the TBD Silicon Valley street so no partial/placeholder address leaks (verified by the render assertion). T-03-05 (CSP / no map embed) holds — About adds no inline `<script>` and no third-party embed, so the locked `font-src 'self'` CSP is not loosened. T-03-06 (firm-substance copy) holds — every substance claim traces to `FIRM_BRIEF.md`; no fabricated history. No packages installed (T-03-SC).

## Known Stubs

None that block the plan's goal. Two intentional, plan-sanctioned interim states inherited from the phase:
- **About's onward `/attorneys` and `/practice-areas` links** resolve to the Phase 3 index pages, whose card links to `/attorneys/[slug]` and `/practice-areas/[slug]` detail routes are interim-dead until Phase 4 fills them (acceptable per CONTEXT cross-linking discretion).
- **Silicon Valley street address** remains `TBD` in `SITE.offices`; `formatOffice` renders it as "Silicon Valley, CA" until Jon supplies the street (deferred — also affects footer + LegalService JSON-LD).

## Self-Check: PASSED

Modified files verified present on disk:
- FOUND: src/lib/site.ts (exports formatOffice)
- FOUND: src/components/chrome/SiteFooter.astro (imports formatOffice)
- FOUND: src/pages/about.astro
- FOUND: .planning/phases/03-homepage-static-pages/03-02-SUMMARY.md

Commits verified in git log:
- FOUND: 5c43bc1 — refactor(03-02): extract formatOffice helper and consume it in SiteFooter
- FOUND: cf95730 — feat(03-02): rewrite About as a client-first StoryBrand slice
