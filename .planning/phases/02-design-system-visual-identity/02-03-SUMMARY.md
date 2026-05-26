---
phase: 02-design-system-visual-identity
plan: 03
subsystem: design-system
tags: [svg, favicon, wordmark, chrome, astro-icon, tailwind-v4, namespace-utilities, a11y, legal-01]
requires:
  - "02-01 tokens (@theme namespace utilities), astro-icon integration, BaseLayout (renders chrome on every route), /design-system gallery"
  - "02-02 converging-linework hero motif (src/assets/illustrations/hero-deal-flow.svg) — the mark is derived from it"
  - "Phase 1 SiteHeader/SiteFooter (arbitrary-value token form) + Disclaimer (LEGAL-01)"
provides:
  - "Derived convergence mark (src/icons/mark.svg, currentColor, reads at 16-32px) — DESIGN-06"
  - "Updated favicon (public/favicon.svg) from the new mark — standalone, explicit accent rust"
  - "Refined SiteHeader: typographic Hanken wordmark + mark, animated accent nav underline, active indicator + aria-current, focus-visible rings (D-14/D-27)"
  - "Refined SiteFooter: mark + wordmark, intact <Disclaimer id=footer> (LEGAL-01), both offices, intake mailto (D-14/D-28)"
  - "Whole codebase now uses ONE token syntax — Phase 1 chrome retrofitted from text-[color:var(...)] to namespace utilities"
affects:
  - "Phase 2 is now complete (4/4 plans) — design system reviewable on a Vercel preview before Phase 3"
  - "Phases 3-7 (every page inherits the refined chrome + mark/favicon brand identity)"
tech-stack:
  added: []
  patterns:
    - "Derived mark = simplified distillation of the hero motif using the SAME thin-line system (viewBox 0 0 48 48, stroke 1.25, round caps/joins, currentColor) so text-accent themes it and it reads at favicon scale"
    - "Favicon is standalone (not theme-following) so it carries an explicit accent hex (#9a3f1a) rather than currentColor"
    - "Tailwind v4 namespace utilities (border-border, bg-bg, text-text, text-text-muted) are now the single token syntax across the whole codebase"
    - "Animated accent nav underline via after: pseudo + motion-safe:after:transition-[width]; focus rings NEVER motion-gated (A11Y-05)"
key-files:
  created:
    - "src/icons/mark.svg"
  modified:
    - "public/favicon.svg"
    - "src/components/chrome/SiteHeader.astro"
    - "src/components/chrome/SiteFooter.astro"
    - "src/pages/design-system.astro"
decisions:
  - "Mark derived as a 3-line convergence-to-knot glyph (not the full 4-cluster hero) so it stays legible at 16-32px while preserving the hero's deal-flow language (modernization, not rebrand — D-14)"
  - "Wordmark renders the firm name in Hanken weight 800 with the LLP suffix in muted weight 700 — typographic hierarchy from weight/color, consistent with D-05"
  - "Chrome documented in the gallery via a small labeled Chrome note (not a duplicate render) — header/footer already mount on every page through BaseLayout, so re-rendering them would be redundant; the note preserves the 8 data-component markers + noindex"
metrics:
  duration: "~7 min"
  tasks: 2
  files_created: 1
  files_modified: 4
  completed: 2026-05-26
---

# Phase 2 Plan 03: Creative Identity + Chrome Refinement Summary

Landed the firm's visual identity into the site chrome and finished the
token-syntax standardization. Authored `src/icons/mark.svg` — a compact
convergence-to-knot glyph distilled from the 02-02 converging-linework hero
motif, in the same thin-line system (stroke 1.25, round caps, `currentColor`)
so it reads cleanly at 16-32px and themes with `text-accent`. Updated
`public/favicon.svg` to the same glyph (with an explicit accent rust, since the
favicon is not theme-following). Replaced Phase 1's plain text firm name with
the typographic Hanken wordmark + mark in both `SiteHeader` and `SiteFooter`,
added the animated accent nav underline + `focus-visible` rings + active-link
indicator, and retrofitted both chrome files from the Phase 1 arbitrary-value
token form (`text-[color:var(--color-text)]`) to the Phase 2 namespace utilities
(`text-text`, `border-border`, `bg-bg`). The site-wide footer `<Disclaimer>`
(LEGAL-01) was preserved and still renders on every route. The whole codebase
now uses one token syntax and the Phase 2 design system is complete (4/4 plans).

## What Was Built

| Task | Outcome | Commit |
|------|---------|--------|
| 1 | `src/icons/mark.svg` — derived convergence glyph (currentColor, 1.2 KB, reads at 16-32px); `public/favicon.svg` updated to the same glyph with explicit accent rust (0.85 KB) | `55d6d84` |
| 2 | Refined SiteHeader (wordmark + mark, animated underline, active indicator + aria-current, focus rings) and SiteFooter (mark + wordmark, intact Disclaimer, both offices, intake mailto); both files retrofitted to namespace utilities; gallery Chrome note added | `560712c` |

## Verification

- `npm run build` succeeds (exit 0).
- `mark.svg` = 1195 bytes, `favicon.svg` = 853 bytes — both far under the 200 KB budget. `mark.svg` uses `currentColor` only.
- No `text-[color:var(...)]` / `border-[color:var(...)]` / `bg-[color:var(...)]` utility classes remain in either chrome file (the only grep hit is an explanatory ASCII comment in SiteHeader documenting the retrofit).
- `tests/disclaimer-crawl.spec.ts` passes — the footer disclaimer fragment appears on every sitemap route (LEGAL-01 NOT regressed).
- `tests/gallery.spec.ts` passes — all 8 `data-component` markers intact, multiple PracticeAreaCards/AttorneyCards, practice icons render as inline SVG.
- Full suite: **29 passed, 0 skipped, 0 failed** (contrast, design-tokens, design-route-hidden, fonts-selfhost, disclaimer-crawl, disclaimer-set, gallery, a11y-interactions, assets-budget, jsonld, zod-negative).

## Deviations from Plan

None of Rules 1-4 triggered. The plan executed as written, with one note:

- The plan frontmatter lists `src/pages/_design.astro`, but the live gallery route is `src/pages/design-system.astro` (the 02-01 rename — Astro ignores leading-underscore page filenames). All gallery work targeted the real file, consistent with 02-01/02-02. This is the established route, not a new deviation.

### Discretionary choices (within plan latitude)

- **Mark form:** distilled the hero's four converging clusters down to three sweeping lines resolving at one knot + a single outbound line. The full hero motif is too dense to read at 16px; the 3-line distillation keeps the deal-flow language while staying legible at favicon scale (D-14 modernization, not rebrand).
- **Favicon color:** the favicon carries an explicit `#9a3f1a` (locked D-02 accent) rather than `currentColor`, because a favicon is rendered standalone by the browser with no themeable text context. The in-app `mark.svg` keeps `currentColor` so `text-accent` themes it. The plan explicitly permits this ("it may carry an explicit accent color since it is not theme-following").
- **Wordmark hierarchy:** firm name in Hanken weight 800 + the `LLP` suffix in muted weight 700 — typographic differentiation by weight/color (D-05), no extra glyphs.
- **Gallery integration:** added a small labeled "Chrome" note section instead of re-rendering header/footer, since BaseLayout already mounts both on every page (including `/design-system`). This documents the treatment without duplicating chrome or disturbing the 8 markers / noindex prop.

## Authentication Gates

None — no auth, secrets, or external services touched. The mark and favicon are hand-authored in-repo.

## Known Stubs

None. The chrome is production-shaped: real wordmark, derived mark/favicon, intact disclaimer, namespace utilities throughout. (Final attorney headshots and cleared-deal copy remain Phase 3-5 boundaries tracked in STATE.md, unchanged by this plan.)

## Threat Flags

None. T-02-03 (mark/favicon XSS) is mitigated — hand-authored line-art SVG, no embedded script; astro-icon runs SVGO on the inlined mark. T-02-05 (footer disclaimer compliance) is mitigated — `<Disclaimer id="footer" />` still renders on every route, enforced green by `tests/disclaimer-crawl.spec.ts`. No new network endpoint, auth path, or trust-boundary surface introduced.

## Self-Check: PASSED

- `src/icons/mark.svg` — FOUND on disk.
- `public/favicon.svg` (modified) — FOUND on disk.
- Commit `55d6d84` (Task 1) — present in git log.
- Commit `560712c` (Task 2) — present in git log.
