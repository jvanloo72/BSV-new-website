---
phase: 02-design-system-visual-identity
plan: 00
subsystem: testing
tags: [playwright, cheerio, wcag, contrast, design-tokens, fonts, sitemap, a11y, nyquist]

# Dependency graph
requires:
  - phase: 01-scaffold-shell
    provides: Playwright + Cheerio test harness, dist/client build layout, disclaimer-crawl/disclaimer-set/jsonld test idioms, playwright.config.ts webServer gating
provides:
  - Wave-0 automated verification contract for Phase 2 (7 spec files)
  - tests/contrast.spec.ts (ACTIVE) — WCAG AA gate on the 7 locked palette pairings
  - 6 skipped Idiom-A/B specs with UNSKIP-WHEN markers naming the unblocking plan
  - package.json test:<name> script per new spec
affects: [02-01, 02-02, design-system, verify-work]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Wave-0 scaffold: skipped specs carry an explicit `// UNSKIP WHEN: <condition> (plan)` comment naming the plan that activates them"
    - "Pure-math gate (contrast) ships ACTIVE with no build dependency; build-dependent specs ship skipped until their dist target exists"
    - "Presence-not-exactly-one assertions for gallery [data-component] markers (≥1 per name)"

key-files:
  created:
    - tests/contrast.spec.ts
    - tests/assets-budget.spec.ts
    - tests/design-tokens.spec.ts
    - tests/gallery.spec.ts
    - tests/a11y-interactions.spec.ts
    - tests/design-route-hidden.spec.ts
    - tests/fonts-selfhost.spec.ts
  modified:
    - package.json

key-decisions:
  - "contrast.spec also asserts each ratio toBeCloseTo the locked UI-SPEC value (not just ≥4.5) so any palette-hex edit that shifts contrast is surfaced, not silently tolerated"
  - "border/bg pairing (1.38:1) is asserted toBeLessThan AA and documented exempt per UI-SPEC — never gated"
  - "design-tokens + fonts specs scan both dist/client/_astro and dist/_astro (and walk all of dist/) to be robust to Vercel-adapter output layout"

patterns-established:
  - "Wave-0 UNSKIP-WHEN marker convention: every skipped spec names the unblocking plan inline"
  - "No spec uses astro preview / webServer — all build in beforeAll and read dist/ from disk (Phase 1 idiom)"

requirements-completed: [DESIGN-02, DESIGN-03, DESIGN-04, DESIGN-05, DESIGN-06]

# Metrics
duration: 12min
completed: 2026-05-26
---

# Phase 02 Plan 00: Wave-0 Test Scaffolding Summary

**Seven Phase-2 verification specs — one ACTIVE WCAG-AA contrast gate on the locked palette plus six skipped Idiom-A/B scaffolds with UNSKIP-WHEN markers — establishing the Nyquist contract before any design-system code ships.**

## Performance

- **Duration:** ~12 min
- **Tasks:** 2
- **Files modified:** 8 (7 created tests + package.json)

## Accomplishments
- `tests/contrast.spec.ts` is ACTIVE and green: implements the WCAG 2.1 relative-luminance formula in-test and gates all 7 text/icon/button pairings at the AA 4.5:1 floor (border/bg documented exempt). 9 assertions pass with no build dependency.
- Six build/filesystem-dependent specs scaffolded and skipped with `// UNSKIP WHEN: <condition> (plan)` comments: design-tokens, fonts-selfhost, gallery, assets-budget, a11y-interactions, design-route-hidden.
- `gallery.spec.ts` asserts ≥1 `[data-component]` per the 8 component names (presence, not exactly-one) plus ≥3 PracticeAreaCards / ≥5 AttorneyCards / ≥3 inline SVG.
- `package.json` gained a `test:<name>` script for all 7 new specs in the existing style.
- Full suite: 14 passed, 15 skipped, 0 failures.

## Task Commits

Each task was committed atomically:

1. **Task 1: contrast (active) + assets-budget + design-tokens scaffolds** - `f940420` (test)
2. **Task 2: gallery / a11y / hidden-route / fonts scaffolds (skipped)** - `bf5bcc1` (test)

**Plan metadata:** _(this docs commit)_

## Files Created/Modified
- `tests/contrast.spec.ts` - ACTIVE: WCAG AA math on the 7 locked palette pairings (A11Y-04)
- `tests/assets-budget.spec.ts` - skipped: asset existence + ≤200KB budget (DESIGN-05/06, PERF-02)
- `tests/design-tokens.spec.ts` - skipped: compiled-CSS locked-hex grep (DESIGN-02)
- `tests/gallery.spec.ts` - skipped: 8 component markers + ≥3 icons on /_design (DESIGN-04/06)
- `tests/a11y-interactions.spec.ts` - skipped: `<details>` + motion-safe: + focus-visible:ring (A11Y-03/D-10)
- `tests/design-route-hidden.spec.ts` - skipped: sitemap exclusion + noindex (D-16)
- `tests/fonts-selfhost.spec.ts` - skipped: no Google Fonts CDN + @font-face/font-display (DESIGN-03)
- `package.json` - added 7 `test:<name>` scripts

## Decisions Made
- contrast.spec asserts ratios `toBeCloseTo` the locked UI-SPEC values (not just `≥ 4.5`) so a palette edit that still passes AA but drifts the ratio is still caught. Rationale: the palette hexes are frozen (D-22); contrast is a property of those exact values.
- border/bg is asserted `toBeLessThan(4.5)` and documented exempt rather than skipped, so the decorative-hairline rationale is encoded in the test, not just prose.

## Deviations from Plan
None - plan executed exactly as written. (The plan's annotation listed text/bg-elevated as "≥4.5"; UI-SPEC computes 18.42. The spec gates the AA floor and pins each ratio to its UI-SPEC value, so both are satisfied.)

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 2 Nyquist coverage is in place: every DESIGN-0x / A11Y / D-16 / PERF-02 behavior now has an automated verify that exists before its implementation.
- Plan 02-01 (global.css @theme rewrite, fonts via Astro Fonts API, /_design + sitemap filter) un-skips: design-tokens, fonts-selfhost, design-route-hidden, and the PracticeAreaCard portion of gallery.
- Plan 02-02 (remaining components + assets) un-skips: gallery (remaining components + icons), assets-budget, a11y-interactions.
- VALIDATION.md `nyquist_compliant` is now satisfiable for the planner to flip.

## Self-Check: PASSED

---
*Phase: 02-design-system-visual-identity*
*Completed: 2026-05-26*
