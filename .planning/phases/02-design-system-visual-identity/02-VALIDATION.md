---
phase: 2
slug: design-system-visual-identity
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-26
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Derived from 02-RESEARCH.md "Validation Architecture". No new test framework — Playwright + Cheerio already installed in Phase 1.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `@playwright/test` 1.60.0 + `cheerio` 1.2.0 (installed Phase 1) |
| **Config file** | `playwright.config.*` (exists from Phase 1; reuse) |
| **Quick run command** | `npm run build` (token / route / SVG / sitemap failures surface at build) |
| **Full suite command** | `npm run test` then `npm run build` |
| **Estimated runtime** | ~60 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run build`
- **After every plan wave:** Run `npm run test` + `npm run build`
- **Before `/gsd:verify-work`:** Full suite green + Jon's Vercel-preview confirmation (ROADMAP criterion 5)
- **Max feedback latency:** ~60 seconds

---

## Per-Task Verification Map

| Req ID | Wave | Behavior | Test Type | Automated Command | File Exists | Status |
|--------|------|----------|-----------|-------------------|-------------|--------|
| DESIGN-02 | 1 | `@theme` tokens compile; `text-accent`/`bg-bg-elevated`/`shadow-card`/`text-h1` resolve to locked values | build + asset grep | `npm run build` then grep `dist/_astro/*.css` for `#9a3f1a` / `#f8f5f0` | ❌ W0 (`tests/design-tokens.spec.ts`) | ⬜ pending |
| DESIGN-02 | — | Single-token edit restyles a component (single-file restyle) | manual/visual | Vercel preview review by Jon (criterion 2) | ✅ manual | ⬜ pending |
| DESIGN-03 | 1 | Hanken Grotesk self-hosted, served from `'self'`, `font-display: swap`, no Google Fonts URL anywhere | build + grep | `npm run build`; grep `dist/` for `fonts.googleapis`/`fonts.gstatic` (= 0); assert `font-display` in CSS | ❌ W0 (`tests/fonts-selfhost.spec.ts`) | ⬜ pending |
| DESIGN-04 | 2 | `/_design` renders all 8 components | Playwright + Cheerio | `playwright test tests/gallery.spec.ts` — assert `data-component="…"` for each of the 8 | ❌ W0 (`tests/gallery.spec.ts`) | ⬜ pending |
| DESIGN-05 | 2 | Hero SVG exists, valid SVG, ≤ 200 KB | filesystem | file under `src/assets/illustrations/`, size ≤ 204800 B, parses as SVG | ❌ W0 (`tests/assets-budget.spec.ts`) | ⬜ pending |
| DESIGN-06 | 2 | 3 practice-area icons in `src/icons/`, each ≤ 200 KB, render via `<Icon>` on `/_design` | filesystem + Playwright | assert 3 files exist; assert 3 inline `<svg>` in `/_design` HTML | ❌ W0 (`tests/gallery.spec.ts` + `tests/assets-budget.spec.ts`) | ⬜ pending |
| DESIGN-07/08 | — | Premium-but-warm look; generous whitespace | manual/visual | Vercel preview review by Jon (criterion 5) | ✅ manual | ⬜ pending |
| A11Y-04 | 1 | Contrast text/bg, text-muted/bg, accent/bg, accent-fg/accent, border/bg all ≥ AA | computed assertion | compute WCAG ratios for the 5 pairings (pure math on locked hexes, no axe) | ❌ W0 (`tests/contrast.spec.ts`) | ⬜ pending |
| A11Y-03 / D-10 | 2 | Interactive components keyboard-operable; motion respects `prefers-reduced-motion` | Playwright | `<details>` toggles via keyboard; assert `motion-safe:`/`motion-reduce:` guard present | ❌ W0 (`tests/a11y-interactions.spec.ts`) | ⬜ pending |
| D-16 | 2 | `/_design` is `noindex` AND absent from `sitemap.xml` | build + grep | grep `dist/sitemap-0.xml` for `_design` (= 0); grep `/_design` HTML for `noindex` (present) | ❌ W0 (`tests/design-route-hidden.spec.ts`) | ⬜ pending |
| PERF-02 | 1 | No committed image/font asset > 200 KB | filesystem | size scan over `src/assets/`, `src/icons/`, `public/` | ❌ W0 (`tests/assets-budget.spec.ts`) | ⬜ pending |
| PERF-05 | — | CLS ≤ 0.1 from fonts | manual/Phase 7 | Lighthouse on Vercel (Phase 7 gate); Phase 2 designs for it via Fonts API fallback metrics | ✅ deferred | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/design-tokens.spec.ts` — DESIGN-02 (compiled-CSS token values present)
- [ ] `tests/fonts-selfhost.spec.ts` — DESIGN-03 (self-hosted, no CDN URL, font-display swap)
- [ ] `tests/gallery.spec.ts` — DESIGN-04/06 (8 components + 3 icons render on `/_design`)
- [ ] `tests/assets-budget.spec.ts` — DESIGN-05/06 + PERF-02 (asset existence + ≤200 KB)
- [ ] `tests/contrast.spec.ts` — A11Y-04 (5 WCAG pairings computed from locked hexes)
- [ ] `tests/a11y-interactions.spec.ts` — D-10/A11Y-03 (keyboard + reduced-motion)
- [ ] `tests/design-route-hidden.spec.ts` — D-16 (noindex + sitemap exclusion)
- [ ] No new framework install needed — Playwright + Cheerio present from Phase 1.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| "Premium-but-warm" look reads correctly; generous whitespace | DESIGN-07/08 | Subjective aesthetic judgment | Jon reviews `/_design` + any sample on a Vercel preview (criterion 5) before Phase 3 |
| Single-token-edit restyle is felt as "one-file change" | DESIGN-02 (criterion 2) | Demonstration, not assertion | Change one `@theme` value, rebuild, observe components update |
| CLS ≤ 0.1 in the field | PERF-05 | Lighthouse runs at Phase 7 launch gate | Design-for now via Fonts API size-adjust metrics; measured Phase 7 |

---

## Validation Sign-Off

- [ ] All tasks have an automated verify or a Wave 0 dependency
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (7 spec files above)
- [ ] No watch-mode flags
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter (by planner once Wave 0 tasks are in plans)

**Approval:** pending
