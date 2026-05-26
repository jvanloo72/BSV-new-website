---
phase: 02-design-system-visual-identity
plan: 01
subsystem: design-system
tags: [tailwind-v4, astro-fonts-api, astro-icon, tokens, components, a11y, csp]
requires:
  - "Phase 1 BaseLayout + chrome + Disclaimer (LEGAL-01)"
  - "Phase 1 D-22 stable token names; D-15/D-16 CSP font-src 'self'"
provides:
  - "global.css @theme: Direction-B palette + 7-step fluid type scale + spacing/radius/shadow tokens (single source of truth, DESIGN-02)"
  - "Self-hosted Hanken Grotesk via Astro Fonts API (DESIGN-03, CSP-clean, CLS-safe)"
  - "astro-icon integration + first thin-line practice icon (DESIGN-06)"
  - "UI primitives (Button, TextLink, Eyebrow) + PracticeAreaCard section component (DESIGN-04)"
  - "BaseLayout noindex? prop; hidden /design-system gallery (noindex + sitemap-excluded, D-16)"
affects:
  - "02-02 / 02-03 (remaining 7 components + creative art consume these tokens + primitives)"
  - "All later pages (every component composes from this token set)"
tech-stack:
  added:
    - "astro-icon ^1.1.5 (local SVG icons)"
    - "sharp ^0.34.5 (pinned; <Image> engine)"
    - "Hanken Grotesk variable woff2 (OFL, self-hosted, ~34 KB)"
  patterns:
    - "Tailwind v4 @theme namespace utilities (bg-bg-elevated, text-accent, text-h3, shadow-card, p-section) — NOT Phase 1 arbitrary-value form"
    - "Astro Fonts API fontProviders.local() with display: swap + auto size-adjust fallback metrics"
    - "Polymorphic Astro component (<a> when href, else <button>)"
key-files:
  created:
    - "src/components/ui/Button.astro"
    - "src/components/ui/TextLink.astro"
    - "src/components/ui/Eyebrow.astro"
    - "src/components/sections/PracticeAreaCard.astro"
    - "src/icons/practice-mergers-acquisitions.svg"
    - "src/pages/design-system.astro"
    - "src/assets/fonts/HankenGrotesk-Variable.woff2"
    - "src/assets/fonts/Hanken-Grotesk-OFL.txt"
  modified:
    - "package.json (astro-icon + sharp)"
    - "astro.config.mjs (fonts[], icon(), sitemap filter)"
    - "src/styles/global.css (@theme rewrite + reduced-motion guard)"
    - "src/layouts/BaseLayout.astro (noindex prop + <Font preload/>)"
    - "tests/design-tokens.spec.ts (un-skipped)"
    - "tests/fonts-selfhost.spec.ts (un-skipped + corrected scan target)"
    - "tests/design-route-hidden.spec.ts (un-skipped + route rename)"
decisions:
  - "Used a single variable Hanken Grotesk woff2 (~34 KB, weight 400-800) instead of 4 static instances — resolves RESEARCH Open Q2, well under the 200 KB budget, fewer files"
  - "Gallery route is /design-system (not /_design) — Astro ignores leading-underscore page filenames (RESEARCH A2 confirmed false); sitemap filter + test updated to match"
metrics:
  duration: "~50 min"
  tasks: 3
  files_created: 8
  files_modified: 7
  completed: 2026-05-26
---

# Phase 2 Plan 01: Design System Foundation Slice Summary

Shipped the thinnest end-to-end design-system slice — locked Direction-B tokens
(palette + 7-step fluid type scale + spacing/radius/warm-shadow) compiled from a
single `global.css` `@theme`, Hanken Grotesk self-hosted CSP-clean via Astro's
Fonts API, three UI primitives + a token-styled `PracticeAreaCard` carrying a
hand-authored thin-line M&A icon, all rendered on a hidden, noindex,
sitemap-excluded `/design-system` gallery. The entire hard-integration pipeline
(Tailwind v4 `@theme` → utilities, Astro Fonts API, astro-icon, sitemap filter,
BaseLayout `noindex` prop) is now proven; a future restyle is a single-file edit.

## What Was Built

| Task | Outcome | Commit |
|------|---------|--------|
| 1 | astro-icon + sharp installed; Hanken Grotesk variable woff2 committed + wired via `fontProviders.local()` (display: swap, served from 'self'); astro-icon integration; sitemap filter; BaseLayout `noindex` prop folded into one robots meta + `<Font preload/>` | `3be4da9` |
| 2 | `global.css` `@theme` rewritten with D-01 hexes + fluid type/spacing/radius/shadow tokens + reduced-motion guard; design-tokens + fonts-selfhost specs un-skipped | `4eb9603` |
| 3 | Button/TextLink/Eyebrow primitives + PracticeAreaCard + M&A practice icon + `/design-system` gallery; design-route-hidden spec un-skipped | `a595fcf` |

## Verification

- `npm run build` succeeds (clean, no errors).
- Compiled `dist/client/_astro/*.css` contains the locked `#9a3f1a` (accent) and `#f8f5f0` (bg); namespace utilities (`bg-bg-elevated`, `text-accent`, `text-h3`, `shadow-card`, `text-display`) resolve to the `@theme` tokens.
- `@font-face` with `font-display: swap`, `font-weight: 400 800`, served from `/_astro/fonts/*.woff2` (same-origin), with auto-generated `size-adjust`/`ascent-override` fallback metrics. ZERO `fonts.googleapis`/`fonts.gstatic` anywhere in `dist/`.
- `/design-system` is `noindex` and absent from the sitemap.
- M&A icon: 597 bytes, `currentColor`, no hardcoded hex; no `client:*` directives; no hardcoded hex in any new component.
- Test suite: **19 passed, 10 skipped, 0 failed** (the 10 skipped are the 02-02/02-03 Wave-0 scaffolds — gallery/assets-budget/a11y-interactions — that require the remaining 7 components). `contrast.spec.ts` (all 7 WCAG pairings AA+) and `disclaimer-crawl.spec.ts` (LEGAL-01) both pass against the new palette.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Non-ASCII characters in `@theme` comments silently discarded the entire token block**
- **Found during:** Task 3 (surfaced when `/design-system` rendered correct class names but the compiled CSS contained Tailwind's DEFAULT theme, not the brand tokens — `--font-sans` showed the stock value, no `--color-*`/`--text-*` brand vars emitted, and no namespace utilities generated).
- **Issue:** The `@theme {}` comments used `§` (section sign) and em-dash characters. Tailwind v4 / Lightning CSS silently dropped the whole `@theme` block on encountering the non-ASCII bytes — no build error, just defaults. This is why Task 2's design-tokens test could not have gone green until Task 3.
- **Fix:** Rewrote all comments inside `global.css` to ASCII-only. Brand tokens + namespace utilities then compiled correctly (CSS bundle hash changed; `#9a3f1a` + `#f8f5f0` + `#fdfcfa` now present).
- **Files modified:** `src/styles/global.css`
- **Commit:** `a595fcf`

**2. [Rule 3 - Blocking] `/_design` route not emitted by Astro (leading-underscore page ignored)**
- **Found during:** Task 3 (anticipated by the plan's explicit fallback instruction).
- **Issue:** RESEARCH Assumption A2 ("a top-level `src/pages/_design.astro` emits `/_design`") is **false** — Astro ignores leading-underscore page filenames anywhere in `src/pages/`. No route built.
- **Fix:** Renamed the page to `src/pages/design-system.astro` → route `/design-system`; updated the sitemap `filter` in `astro.config.mjs` and the route paths/strings in `tests/design-route-hidden.spec.ts`. The noindex + sitemap-exclusion contract (D-16) is unchanged.
- **Files modified:** `src/pages/design-system.astro` (renamed), `astro.config.mjs`, `tests/design-route-hidden.spec.ts`
- **Commit:** `a595fcf`

**3. [Rule 1 - Bug] fonts-selfhost test scanned the wrong build artifact for `@font-face`**
- **Found during:** Task 2.
- **Issue:** The 02-00 scaffold asserted `@font-face`/`font-display` would be in the compiled `*.css` bundle. Astro's Fonts API (the plan-mandated approach) injects `@font-face` into the document `<head>` HTML, not the CSS bundle — so the assertion failed despite correct self-hosting.
- **Fix:** Widened the scan to both `.css` and `.html` in `dist/`, which correctly validates self-hosting regardless of where Astro emits the rule. The security-critical CDN-absence assertion (T-02-01) was unaffected and always passed.
- **Files modified:** `tests/fonts-selfhost.spec.ts`
- **Commit:** `4eb9603`

### Discretionary choices (within plan latitude)

- **Single variable woff2** (not 4 static instances) for Hanken Grotesk — resolves RESEARCH Open Q2; ~34 KB covers weight 400-800. The OFL license text was committed alongside (`Hanken-Grotesk-OFL.txt`) for provenance.

## Authentication Gates

None — no auth, secrets, or external services touched. The Hanken woff2 was obtained programmatically from the OFL-licensed Fontsource package (no human checkpoint required); astro-icon/sharp provenance accepted per the plan's threat register (T-02-SC) and DECISIONS.md supply-chain precedent.

## Token-syntax note (for the verifier)

New Phase 2 components intentionally use Tailwind v4 **namespace-mapped utilities**
(`bg-bg-elevated`, `text-accent`, `text-h3`, `shadow-card`, `p-section`,
`px-gutter`, `border-border`) — the approved standardization (UI-SPEC
§"Token-name contract", PATTERNS §"Critical Cross-Cutting Convention"). This is
correct, not a deviation from Phase 1's arbitrary-value form. Phase 1 chrome is
retrofitted in 02-03.

## Known Stubs

The `/design-system` gallery currently renders only the first slice (UI primitives
+ one PracticeAreaCard). The remaining 7 components (Hero, AttorneyCard,
TestimonialQuote, DealsGrid, FeeStructureBand, CtaBlock, FaqAccordion), the two
other practice icons, the hero illustration, and the wordmark mark are delivered
in 02-02 / 02-03 (their Wave-0 tests — gallery, assets-budget, a11y-interactions —
remain `.skip` until then, by design). This is the intended slice boundary, not an
incomplete stub.

## Self-Check: PASSED

All 8 created files verified present on disk; all 3 task commits (3be4da9, 4eb9603, a595fcf) verified in git log.
