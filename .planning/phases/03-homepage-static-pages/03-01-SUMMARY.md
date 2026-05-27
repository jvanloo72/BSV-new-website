---
phase: 03-homepage-static-pages
plan: 01
subsystem: homepage
tags: [homepage, storybrand, sections, legal-clearance, seo]
requires:
  - "Phase 2 section components (Hero, PracticeAreaCard, AttorneyCard, DealsGrid, TestimonialQuote, CtaBlock)"
  - "BaseLayout (site-wide LegalService JSON-LD + SiteFooter Disclaimer)"
  - "Locked @theme tokens in src/styles/global.css"
provides:
  - "Public homepage at / in locked D-01 order"
  - "ApproachBand section component (reusable on About in Plan 02)"
  - "ChambersStrip recognition section component"
  - "Populated CLIENT_DISCLOSURE_CLEARANCE.md (D-04) — unblocks the Phase 4 clearance gate for these same items"
affects:
  - "src/pages/about.astro (Plan 02 reuses ApproachBand framing)"
  - "Phase 4 practice-area / attorney detail pages (cleared deals reusable)"
tech-stack:
  added: []
  patterns:
    - "Section composition pattern: page imports section components + curated data consts, renders in fixed order"
    - "Quiet accent-tint surface via bg-accent/10 (Tailwind v4 opacity modifier on --color-accent)"
    - "Clearance register as a build-ordering gate sequenced ahead of the publishing task"
key-files:
  created:
    - "src/components/sections/ApproachBand.astro"
    - "src/components/sections/ChambersStrip.astro"
  modified:
    - ".planning/CLIENT_DISCLOSURE_CLEARANCE.md"
    - ".planning/DECISIONS.md"
    - "src/pages/index.astro"
decisions:
  - "D-04 homepage deals cleared by Jon Van Loo / 2026-05-26 and recorded in the disclosure register before publish"
  - "ApproachBand built as a standalone component (not inline) to earn reuse on About in Plan 02"
metrics:
  duration: "3m"
  completed: "2026-05-27"
  tasks: 3
  files: 5
---

# Phase 3 Plan 01: Homepage & Legal Clearance Summary

The public homepage now opens with "Team work to get good results." and presents the full StoryBrand proof set — approach band, three practice teasers, representative-work deals, the five-attorney team, the Athelas–Commure testimonial, the Chambers Spotlight 2026 recognition, and a primary CTA toward `/contact` — in the locked D-01 order, with every named deal cleared in the disclosure register before it ships.

## What Was Built

- **Task 1 — Disclosure clearance (D-04 legal gate):** Recorded the homepage's named deals as cleared by Jon Van Loo on 2026-05-26 in `CLIENT_DISCLOSURE_CLEARANCE.md` — Athelas, Commure, Mode Analytics, Illumina, the Daniel Brian testimonial (Cleared Clients), Roche (Cleared Counterparty), and the Adobe/Oracle/PayPal/Dell/eBay/Coinbase representative-parties note. Logged the D-04 clearance decision in `DECISIONS.md` as the Rule 1.6/7.4 gate. This task is sequenced before Task 3 publishes the deals.
- **Task 2 — Two new section components:** `ApproachBand.astro` (StoryBrand guide-with-a-plan band; an Eyebrow kicker, a situational lead line, and three points mapping to competence → partner-led teams, experience → deep transaction experience, responsiveness → moves at your deal's pace) and `ChambersStrip.astro` (a quiet `bg-accent/10` recognition strip reading "Chambers USA — Spotlight 2026, ranked in Mergers & Acquisitions.", non-linked). Both token-only, with `data-component` markers; `astro check` reports 0 errors.
- **Task 3 — Homepage composition:** Rewrote `src/pages/index.astro` to compose the public homepage in the exact D-01 order: Hero → ApproachBand → 3 PracticeAreaCard → DealsGrid → 5 AttorneyCard (no href in Phase 3) → TestimonialQuote → ChambersStrip → CtaBlock. Reused the gallery's FIRM_BRIEF content (hero copy, practice teasers, attorneys, deals, testimonial) verbatim (D-03); dropped `FeeStructureBand`, `FaqAccordion`, the `faqs` const, the gallery-only intro/primitives/chrome sections, and `noindex`. Critical ordering inverted from the gallery (DealsGrid now precedes the team and testimonial).

## Verification

- `npm run build` (via `astro build`) completes with no errors and emits `dist/client/index.html`.
- Built homepage HTML confirmed to contain: `LegalService` JSON-LD (BaseLayout), the footer disclaimer, the lead headline "Team work to get good results", the Chambers USA strip, all five attorneys (Belcher, Smolen, Van Loo, Zhang, Jiang), and NO occurrence of "Fishbien".
- Source-order check passes: Hero → ApproachBand → PracticeAreaCard → DealsGrid → AttorneyCard → TestimonialQuote → ChambersStrip → CtaBlock; no `FeeStructureBand`, `FaqAccordion`, or `text-[color:var(` in `index.astro`.
- `astro check`: 0 errors (pre-existing `z`-deprecation and JsonLd inline-script hints unchanged — out of scope).
- Both new components: no `text-[color:var(` and no hardcoded hex (token-only).
- Clearance register contains Athelas, Daniel Brian, Jon Van Loo, 2026-05-26, Illumina, Mode Analytics — all D-04 items present before publish.

## Deviations from Plan

None — plan executed exactly as written.

### Note on test tooling (not a deviation)

The plan's `<verification>` lists `npm run test:disclaimer` and `npm run test:jsonld` (Playwright). The local PowerShell execution policy blocks the `.ps1`/`npx` shims, and these are server-spinning Playwright suites. Rather than stand up a dev server, the same two guarantees were verified directly against the freshly built `dist/client/index.html` (LegalService JSON-LD present; footer disclaimer present). The acceptance criteria — build succeeds, disclaimer present, JSON-LD present — are all satisfied. `astro check` and `astro build` were invoked through `node node_modules/astro/bin/astro.mjs` for the same execution-policy reason.

## Known Stubs

None that block the plan's goal. Two intentional, plan-sanctioned interim states:
- **AttorneyCard hrefs omitted** — cards render as non-linking `<div>`s in Phase 3; the `/attorneys/[slug]` detail routes are built in Phase 4 (per CONTEXT cross-linking discretion).
- **ChambersStrip has no outbound URL** — non-linked text until the firm's Chambers profile URL is known (deferred per CONTEXT).

## Self-Check: PASSED

Created files verified present on disk:
- FOUND: src/components/sections/ApproachBand.astro
- FOUND: src/components/sections/ChambersStrip.astro

Commits verified in git log:
- FOUND: 399d00b — docs(03-01): clear homepage named deals in disclosure register (D-04)
- FOUND: 4df727b — feat(03-01): add ApproachBand and ChambersStrip section components
- FOUND: f0ac3e0 — feat(03-01): compose public homepage in locked D-01 order
