# Phase 1: Scaffold & Shell - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-25
**Phase:** 1-Scaffold & Shell
**Mode:** `--auto` (every gray area auto-selected; recommended default chosen for each question)
**Areas discussed:** Content formats, Content collection schemas, Disclaimer storage, URL conventions, Security baseline, Preview-deploy gating, Tailwind theme placeholder, Placeholder content, Disclaimer crawl test, Header/footer scope, Site-wide JSON-LD, CI foundations

---

## Content Authoring Formats

| Option | Description | Selected |
|--------|-------------|----------|
| MDX for prose collections, JSON for disclaimers | Prose collections allow inline components (e.g., Disclaimer in blog posts); disclaimers are key→string lookups, JSON is simpler | ✓ |
| MDX everywhere | One format, but disclaimers don't need prose tooling | |
| Markdown (no MDX) everywhere | Simpler but blocks inline components in blog posts | |

**Selected:** MDX for prose collections, JSON for disclaimers (recommended default)
**Notes:** Disclaimers are versioned key→text records; JSON is the right shape. Prose collections benefit from MDX for callouts and inline pull-quotes.

---

## Content Collection Schemas

| Option | Description | Selected |
|--------|-------------|----------|
| Five collections with full Zod typing + cross-collection references | attorneys, practiceAreas, blog, testimonials, disclaimers — `reference()` enforces author/practiceArea links at build time | ✓ |
| Four collections (merge testimonials into attorneys) | Tighter footprint but loses the ability to render a testimonial on a practice-area page | |
| Loose typing (strings only) | Faster to author but loses every build-time guarantee that prevents compliance bugs | |

**Selected:** Five collections with full Zod typing (recommended default — research/ARCHITECTURE.md §Content Collections)

---

## Disclaimer Storage & Rendering

| Option | Description | Selected |
|--------|-------------|----------|
| Single `<Disclaimer id="..." />` component reading from `disclaimers` JSON | One edit updates every disclaimer site-wide; missing id fails build | ✓ |
| Hard-coded disclaimer text in each layout | Faster to ship but compliance updates require touching 5+ files | |
| Disclaimer text in env vars | Avoids commits when text changes but loses version control history | |

**Selected:** Single component + JSON collection (recommended default)

---

## URL Conventions

| Option | Description | Selected |
|--------|-------------|----------|
| `first-last` lowercase hyphenated slugs (matches bsvlaw.com) | Preserves referral links and SEO equity from existing site | ✓ |
| `last-first` | Cleaner alphabetic listing but breaks every existing inbound link | |
| Numeric IDs | Stable but ugly and unfriendly | |

**Selected:** `first-last` slugs locked in `.planning/URL-CONVENTIONS.md` (recommended default)
**Notes:** Pitfall 14 (renaming slugs post-launch) is non-deferable; lock now.

---

## Security Baseline

| Option | Description | Selected |
|--------|-------------|----------|
| CSP report-only in Phase 1, enforce in Phase 7; gitleaks + push protection both | Soak time gathers real violation data before enforcing | ✓ |
| CSP enforced from Phase 1 | Often blocks the site's own assets during build phases | |
| No CSP until Phase 7 | Misses early signal | |

**Selected:** Report-only in Phase 1, layered secret scanning (recommended default — Pitfalls 5 and 7)

---

## Preview-Deploy Gating

| Option | Description | Selected |
|--------|-------------|----------|
| `noindex` via `X-Robots-Tag` header for non-prod env + `<meta robots="noindex">` in BaseLayout when `!PROD` | Prevents staging content from leaking into search before launch | ✓ |
| Password-protected previews | More secure but adds friction for Jon's review workflow | |
| Public previews indexed normally | Risk of staging URLs ranking before the real site | |

**Selected:** `noindex` on non-prod (recommended default)

---

## Tailwind v4 Theme Placeholder

| Option | Description | Selected |
|--------|-------------|----------|
| Neutral zinc-based placeholder tokens, named stable across the Phase 2 swap | Unblocks Phase 1 work without front-running Jon's design decision | ✓ |
| Defer all `@theme` setup to Phase 2 | Blocks any styling in Phase 1, including header/footer |  |
| Pick a candidate palette now (navy + white from current site) | Front-runs Jon's design decision |  |

**Selected:** Neutral zinc placeholder with stable token names (recommended default)

---

## Placeholder Content Seeding

| Option | Description | Selected |
|--------|-------------|----------|
| One placeholder per collection (all `draft: true`); five real disclaimer ids | Proves schemas + dynamic routes work end-to-end without leaking placeholder content into builds | ✓ |
| No placeholders — wait for real content | Phase 1 can't validate that dynamic routes actually work |  |
| Multiple placeholders per collection | Adds noise without additional signal |  |

**Selected:** One placeholder per collection (recommended default)

---

## Disclaimer Crawl Test

| Option | Description | Selected |
|--------|-------------|----------|
| Playwright + Cheerio crawl of every sitemap route post-build, in CI | Catches the single biggest compliance hole (missing disclaimer on any route) | ✓ |
| Manual visual QA before each release | Doesn't scale and is forgotten under pressure |  |
| Unit-test the layout in isolation | Doesn't catch routes that bypass the layout |  |

**Selected:** Playwright + Cheerio crawl in CI (recommended default — Pitfall 4)

---

## Header & Footer Scope (Phase 1)

| Option | Description | Selected |
|--------|-------------|----------|
| Functional but visually-minimal header + footer; nav links to all section roots; footer disclaimer; placeholder typography | Unblocks Phase 1 deliverable (clickable preview URL) without front-running Phase 2 design | ✓ |
| Full visual design in Phase 1 | Locks in Phase 2's design decisions prematurely | |
| Defer header/footer to Phase 3 | Phase 1's "footer disclaimer on every route" success criterion can't be met | |

**Selected:** Functional minimal chrome (recommended default)

---

## Site-Wide JSON-LD

| Option | Description | Selected |
|--------|-------------|----------|
| `<JsonLd />` component + `src/lib/jsonld.ts` builder; LegalService injected via BaseLayout in Phase 1 | Plumbing scaffolded once; later phases add Person/Article via their layouts | ✓ |
| Defer all JSON-LD to Phase 3 (SEO) | LegalService is site-wide; building it twice (once for the shell, once for SEO) doubles the work | |

**Selected:** Build plumbing + LegalService in Phase 1 (recommended default)

---

## CI Foundations

| Option | Description | Selected |
|--------|-------------|----------|
| GitHub Actions workflow that runs `npm install` → `astro build` → `test:disclaimer` → gitleaks → `lint:legal` on every PR | Phase 1 establishes the CI floor every later phase builds on | ✓ |
| Manual checks only | Doesn't survive scale or Jon's non-technical maintenance | |
| Vercel build checks only | Doesn't include disclaimer crawl or gitleaks | |

**Selected:** Layered CI from Phase 1 (recommended default)

---

## Claude's Discretion

- Exact `package.json` script names if they conflict with Astro defaults — picked at planning time.
- Specific directory layout under `src/components/` — planner picks via PATTERNS.md analysis.
- Choice of icon library (`astro-icon` vs hand-rolled SVG) — deferred to Phase 2 design phase.
- Exact gitleaks rule set — start with default + custom rule for firm-specific placeholder patterns.

## Deferred Ideas

- Logo / wordmark design → Phase 2
- Final color palette → Phase 2 (needs Jon's input)
- Custom hero SVG and practice-area icon set → Phase 2
- OG image strategy (static vs dynamic) → Phase 3
- `@astrojs/sitemap` filtering details → Phase 3
- CSP enforcement specifics → Phase 7
- `@vercel/analytics` production rollout → Phase 7
- Rate limiting on the CSP report endpoint → Phase 6/7
- axe-core CI integration → Phase 7
