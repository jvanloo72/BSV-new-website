# Phase 1: Scaffold & Shell - UI Design Contract (Minimal)

**Generated:** 2026-05-25
**Status:** Minimal contract — full visual design contract is owned by Phase 2

---

## Scope Note

Phase 1 ships **visual placeholders**, not finalized design. The ROADMAP
explicitly tags Phase 2 as the UI/visual-identity phase (`**UI hint**: yes`)
and Phase 1 as `**Security hint**: yes`. This UI-SPEC therefore covers only
the structural surfaces the scaffold must render to prove "the disclaimer
appears on every route" — nothing more.

A complete UI-SPEC (palette, typography scale, component variants, hero
graphic spec, icon set) will be produced via `/gsd:ui-phase 2` before
Phase 2 planning.

---

## Surfaces in Phase 1

### 1. `<SiteHeader />`

- **Purpose:** Top of every page; lets visitors get to every section.
- **Content (Phase 1 minimum):**
  - Firm name as text — "Belcher, Smolen & Van Loo LLP" or short form "BSV Law"
  - Primary nav links: Home (`/`), About (`/about`), Practice Areas (`/practice-areas`), Attorneys (`/attorneys`), Insights (`/blog`), Contact (`/contact`)
- **Visual placeholder:** Single horizontal row, firm name on the left, nav links on the right. Neutral zinc-on-white per the placeholder `@theme` tokens. No logo, no mega-nav, no animation in Phase 1.
- **Responsive:** On viewports < 768px, the nav collapses to a single visible link to a future menu (Phase 2 adds the menu UI; Phase 1 ships a stacked text list as the placeholder).

### 2. `<SiteFooter />`

- **Purpose:** Compliance home — renders the site-wide footer disclaimer on every route.
- **Content (Phase 1 minimum):**
  - `<Disclaimer id="footer" />` (renders the canonical text from `src/content/disclaimers/disclaimers.json`)
  - Single line listing both office locations (Silicon Valley primary; San Francisco — 555 California St., Suite 4925)
  - Copyright line with current year (auto-rendered)
- **Visual placeholder:** Single column, small text, generous padding, neutral palette. No social links, no newsletter signup, no clever ornament in Phase 1.

### 3. `BaseLayout.astro`

- **Purpose:** The single integration point every page passes through; ensures disclaimer, header, footer, SEO meta, and site-wide JSON-LD render uniformly.
- **Slots:**
  - `<slot />` — page content
  - `<slot name="head" />` — per-page `<head>` additions (extra JSON-LD, OG overrides)
- **Per-page meta defaults (from `<SeoHead />`):**
  - `<title>` from page frontmatter or computed
  - `<meta name="description">` from page frontmatter
  - `<link rel="canonical">` to the site origin + path
  - `<meta name="robots" content="noindex">` when `!import.meta.env.PROD`
- **Site-wide JSON-LD:** `LegalService` injected once via BaseLayout `<head>`.

### 4. Specialized Layouts (scaffolds only in Phase 1)

- `AttorneyLayout.astro` — wraps BaseLayout, slots in `<Disclaimer id="attorney" />` and `Person` JSON-LD. Visual treatment is Phase 4.
- `PracticeAreaLayout.astro` — wraps BaseLayout, slots in `<Disclaimer id="practice-area" />` and FAQPage JSON-LD placeholder. Visual treatment is Phase 4.
- `BlogPostLayout.astro` — wraps BaseLayout, slots in `<Disclaimer id="blog" />` and `Article` JSON-LD. Visual treatment is Phase 5.

In Phase 1, these layouts exist with their plumbing wired up but render their content slot without ornament. Phase 2's component library replaces the unstyled body.

### 5. Placeholder Pages

These pages exist as routes so the Playwright disclaimer-crawl test has something to walk. Phase 1 renders each with placeholder content:

- `/` — Single `<h1>` ("Belcher, Smolen & Van Loo LLP") and a placeholder paragraph
- `/about` — Single `<h1>` and a "Coming soon" paragraph
- `/practice-areas` — Index that lists the three practice areas (titles only, links to dynamic routes)
- `/attorneys` — Index that lists the five attorneys (titles only, links to dynamic routes)
- `/blog` — "Insights coming soon" empty state
- `/contact` — Single `<h1>` and an "Email intake@bsvlaw.com" placeholder (the form arrives in Phase 6)
- `/404` and `/500` — Branded error pages with disclaimer

### 6. `<Disclaimer />` Component

- **API:** `<Disclaimer id="footer" | "contact" | "blog" | "practice-area" | "attorney" />`
- **Behavior:** Looks up the matching record in the `disclaimers` collection (a JSON file loaded via Astro's `file()` loader). Renders `entry.data.text` as **plain text inside a `<p>` element**. Markdown rendering via Astro's `render()` is **not applicable** here — `render()` is for `.md`/`.mdx` body content; the disclaimers collection's `text` field is a string. Fails the build if `id` is not in the union (Zod string union on `id`).
- **Visual placeholder:** Small text (size step `--text-sm`), muted color (`--color-text-muted`), top border on the footer instance. Phase 2 reskins via design tokens.

---

## Design Tokens (Placeholder Set)

These tokens live in `src/styles/global.css` `@theme` and are stable across the Phase 2 palette swap.

**Tailwind v4 syntax note.** Values are CSS values referencing the Tailwind-provided `--color-zinc-*` variables (or a literal CSS value like `white`). The Tailwind v3 `theme()` function is **removed** in v4 and MUST NOT be used. The token table below shows v4-correct syntax:

| Token | Phase 1 Placeholder (v4 syntax) | Phase 2 Status |
|-------|---------------------|----------------|
| `--color-text` | `var(--color-zinc-900)` | Replaced by chosen palette |
| `--color-text-muted` | `var(--color-zinc-600)` | Replaced |
| `--color-bg` | `white` | Replaced |
| `--color-bg-elevated` | `var(--color-zinc-50)` | Replaced |
| `--color-border` | `var(--color-zinc-200)` | Replaced |
| `--color-accent` | `var(--color-zinc-900)` | Replaced |
| `--color-accent-fg` | `white` | Replaced |
| `--font-sans` | `system-ui, sans-serif` | Replaced with chosen typeface |
| `--text-xs`/`--text-sm`/`--text-base`/`--text-lg`/`--text-2xl`/`--text-4xl` | Tailwind defaults (inherit from `@import "tailwindcss"`) | Replaced if Phase 2 retunes the scale |

**Phase 2 will change values, not names.** Every component reading these tokens keeps working through the palette swap.

---

## Responsive & Accessibility (Phase 1 Baseline)

- **Viewports:** Layout must work at 320px width and up. No horizontal scroll at any tested viewport.
- **Semantic HTML:** Header is `<header>`, nav is `<nav>`, footer is `<footer>`, main content is `<main>`. Headings follow logical hierarchy.
- **Focus:** All nav links keyboard-reachable with visible focus indicator.
- **Color contrast:** Placeholder palette must meet WCAG AA — zinc-900 on white is ≥ 16:1.
- **Skip link:** "Skip to main content" link is the first focusable element on every page.

---

## Non-Goals in Phase 1

- Logo, wordmark, brand mark — Phase 2.
- Final color palette — Phase 2.
- Custom hero SVG and stylized practice-area icons — Phase 2.
- Reusable section components (`Hero`, `PracticeAreaCard`, `AttorneyCard`, etc.) — Phase 2.
- Animation, micro-interactions — Phase 2.
- Mobile hamburger menu — Phase 2.

---

*Phase: 1-Scaffold & Shell*
*Visual contract scope: minimal chrome only; full UI-SPEC lives in Phase 2*
