---
phase: 02-design-system-visual-identity
plan: 02
subsystem: design-system
tags: [astro-components, astro-icon, svg, details-accordion, a11y, motion-safe, gallery]
requires:
  - "02-01 tokens (@theme namespace utilities), UI primitives (Button/TextLink/Eyebrow), PracticeAreaCard, astro-icon + Image pipeline, /design-system gallery + BaseLayout noindex prop"
provides:
  - "The 7 remaining locked section components: Hero, AttorneyCard, TestimonialQuote, DealsGrid, FeeStructureBand, CtaBlock, FaqAccordion (DESIGN-04)"
  - "Converging-linework hero SVG (DESIGN-05) + 2 remaining thin-line practice icons IP&Tech/Tax (DESIGN-06)"
  - "5 neutral monogram placeholder headshots under src/assets/headshots/ (ATTY-08)"
  - "Full 8-component /design-system gallery with realistic FIRM_BRIEF content"
  - "gallery + a11y-interactions + assets-budget Wave-0 tests now active and green"
affects:
  - "02-03 (creative identity + chrome refinement consumes these components + the line-art language)"
  - "Phases 3-5 (every marketing page composes from this now-complete component set)"
tech-stack:
  added: []
  patterns:
    - "One-off illustration inlined via `import art from '...svg?raw'` + `set:html` (NOT astro-icon) — astro-icon reserved for the repeated practice icons"
    - "FaqAccordion = native <details>/<summary>, zero JS, group-open:rotate-180 chevron gated motion-safe"
    - "Polymorphic AttorneyCard (<a> when href, else <div>) + astro:assets <Image> with explicit 400x500 dims (no CLS)"
key-files:
  created:
    - "src/components/sections/Hero.astro"
    - "src/components/sections/CtaBlock.astro"
    - "src/components/sections/FeeStructureBand.astro"
    - "src/components/sections/AttorneyCard.astro"
    - "src/components/sections/TestimonialQuote.astro"
    - "src/components/sections/DealsGrid.astro"
    - "src/components/sections/FaqAccordion.astro"
    - "src/assets/illustrations/hero-deal-flow.svg"
    - "src/icons/practice-ip-tech.svg"
    - "src/icons/practice-tax.svg"
    - "src/assets/headshots/placeholder-belcher.svg"
    - "src/assets/headshots/placeholder-smolen.svg"
    - "src/assets/headshots/placeholder-vanloo.svg"
    - "src/assets/headshots/placeholder-zhang.svg"
    - "src/assets/headshots/placeholder-jiang.svg"
  modified:
    - "src/pages/design-system.astro (expanded to all 8 components)"
    - "tests/gallery.spec.ts (un-skipped + dist path retargeted)"
    - "tests/a11y-interactions.spec.ts (un-skipped + dist path retargeted)"
    - "tests/assets-budget.spec.ts (un-skipped)"
decisions:
  - "Hero illustration inlined via ?raw import + set:html (one-off art); astro-icon kept only for the 3 repeated practice icons — matches UI-SPEC 'inline it, not astro-icon'"
  - "Placeholder headshots authored as tiny monogram SVGs (<1KB) under src/assets/headshots/ so astro:assets <Image> processes them (Pitfall 7); plain hex inside the asset SVGs is acceptable (the token-only rule governs .astro components, not asset files)"
metrics:
  duration: "~7 min"
  tasks: 3
  files_created: 15
  files_modified: 4
  completed: 2026-05-26
---

# Phase 2 Plan 02: Remaining Components + Creative Art Summary

Completed the locked component library: the 7 remaining section components
(Hero, AttorneyCard, TestimonialQuote, DealsGrid, FeeStructureBand, CtaBlock,
FaqAccordion) on top of the 02-01 token/primitive foundation, the hand-authored
converging-linework hero SVG plus the two remaining thin-line practice icons
(IP & Tech, Tax), and five neutral monogram placeholder headshots. The
`/design-system` gallery now renders all eight components with realistic
FIRM_BRIEF placeholder content (the Athelas-Commure $6B testimonial, the five
attorneys, the three practice areas, the fee band, the three FAQs). The whole
design system is now reviewable on a Vercel preview, and three previously-skipped
Wave-0 tests (gallery, a11y-interactions, assets-budget) are active and green.

## What Was Built

| Task | Outcome | Commit |
|------|---------|--------|
| 1 | hero-deal-flow.svg (converging linework, currentColor, 1.6 KB) + practice-ip-tech.svg + practice-tax.svg (thin-line, currentColor, <1 KB each); Hero (text-display H1, inlined aria-hidden SVG, composed Button CTAs), CtaBlock, FeeStructureBand (token-only, no published rates) | `2e16c1e` |
| 2 | AttorneyCard (floating-card shell, <Image> headshot with explicit 400x500 dims, polymorphic, no "Fishbien"); 5 monogram placeholder headshots; TestimonialQuote (blockquote/cite + accent open-quote); DealsGrid (.map() cleared deals); FaqAccordion (native <details>, zero JS, motion-safe chevron, 44px summary) | `b288cfe` |
| 3 | /design-system expanded to all 8 components with FIRM_BRIEF content; gallery + a11y-interactions + assets-budget tests un-skipped (+ dist path retargeted to /design-system) | `302c870` |

## Verification

- `npm run build` succeeds (exit 0).
- Built `/design-system` page contains: Hero x1, PracticeAreaCard x3, AttorneyCard x5, TestimonialQuote x1, DealsGrid x1, FeeStructureBand x1, CtaBlock x1, FaqAccordion x1; 7 inline `<svg>`; 3 native `<details>`; **0 `client:` directives**.
- 5 placeholder headshots rendered via `<Image>` (no CLS — explicit width/height).
- No "Fishbien"/"Fishbein" string in the built page (ATTY-11).
- No hardcoded hex in any new `.astro` component (token-only, namespace utilities).
- All assets ≤ 200 KB: hero 1.6 KB, icons 0.75-0.87 KB, headshots 0.4-0.76 KB.
- Full Phase 2 + Phase 1 suite: **29 passed, 0 skipped, 0 failed** (gallery, a11y-interactions, assets-budget now active alongside contrast, design-tokens, fonts-selfhost, design-route-hidden, disclaimer-crawl, jsonld, zod-negative, etc.).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] gallery + a11y test scaffolds pointed at the wrong dist path**
- **Found during:** Task 3.
- **Issue:** The 02-00 scaffolds (`tests/gallery.spec.ts`, `tests/a11y-interactions.spec.ts`) read `dist/client/_design/index.html`, but 02-01 renamed the route to `/design-system` (Astro ignores leading-underscore page filenames). With the planned path, the tests would have failed on a missing file rather than testing the real gallery.
- **Fix:** Retargeted both specs to `dist/client/design-system/index.html` (matching the already-correct `design-route-hidden.spec.ts`) and updated one test-name string for accuracy. The assertions themselves were unchanged.
- **Files modified:** `tests/gallery.spec.ts`, `tests/a11y-interactions.spec.ts`
- **Commit:** `302c870`

### Discretionary choices (within plan latitude)

- **Hero SVG via `?raw` + `set:html`** rather than a `<svg>` literal pasted into Hero.astro — keeps the illustration a single drop-in-replaceable file (D-15) while still inlining it (UI-SPEC: "inline it, NOT astro-icon").
- **Placeholder headshots as monogram SVGs** (initials on a warm-grey ground, 4:5) rather than raster tiles — tiny (<1 KB), brand-aligned, and `<Image>`-processable. Plain hex appears inside these asset SVGs; the token-only rule governs `.astro` components, not committed asset files (consistent with the 02-01 M&A icon precedent).
- **The plan frontmatter names `src/pages/_design.astro`** throughout; the live file is `src/pages/design-system.astro` (the 02-01 rename). All work targeted the real route.

## Authentication Gates

None — no auth, secrets, or external services touched. All assets are hand-authored in-repo.

## Deferred Issues

- **4 Lightning CSS "Unexpected token" optimization warnings** during `npm run build` (build still exits 0). Source: Tailwind v4 scans the `.planning/*.md` design docs and picks up *prose* literal strings like `text-[color:var(--color-*)]` / `border-[color:var(...)]` from the documentation examples, generating malformed utility classes that Lightning CSS warns about. **Pre-existing** (present before 02-02), purely cosmetic, no effect on the built CSS or any rendered page. Logged to `deferred-items.md`. Out of scope for 02-02 (not caused by this slice). Fix candidates later: a Tailwind source exclusion for `.planning/`, or escaping the doc literals.

## Known Stubs

- **AttorneyCard / DealsGrid render placeholder content only.** Real attorney bios, photos, and cleared-deal copy land in Phases 3-5 (gated on `CLIENT_DISCLOSURE_CLEARANCE.md` and final headshots per STATE.md blockers). This is the intended Phase-2 boundary (the gallery is a living style guide, not a published page — it is noindex + sitemap-excluded). Not a blocking stub: the plan's goal is the reusable component set, which is complete.
- **TestimonialQuote `disclosure` slot is empty** by design — reserved for the later California-required `<Disclaimer>` (LEGAL-06, Phase 4+).

## Self-Check: PASSED

All 15 created files verified present on disk; all 3 task commits (2e16c1e, b288cfe, 302c870) verified in git log; full test suite 29/0/0.
