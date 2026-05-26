# Phase 2: Design System & Visual Identity - Research

**Researched:** 2026-05-26
**Domain:** Design-system tokens (Tailwind v4 `@theme`), self-hosted webfonts (Astro 6 Fonts API), hand-authored SVG art, local-SVG iconography (`astro-icon`), reusable Astro section components, accessibility (WCAG AA contrast, `prefers-reduced-motion`, CLS).
**Confidence:** HIGH — every technical API below was confirmed against the installed package versions (Astro 6.3.7, Tailwind 4.3.0, astro-icon 1.1.5) and current official docs on the research date. The single MEDIUM item (slopcheck unavailable) is flagged in the Package Legitimacy Audit; astro-icon's provenance was verified directly via npm registry + GitHub instead.

## Summary

This phase is almost entirely **prescriptive implementation work**, not exploration — Jon's `02-CONTEXT.md` locks every *what* (palette, typeface, the eight components, the hero concept, the icon set, the gallery route). The research question is narrowly **"how do I implement each locked decision correctly on Astro 6.3.7 + Tailwind 4.3.0 without a `tailwind.config.js`, while staying inside the Phase 1 CSP (`font-src 'self'`) and hitting CLS ≤ 0.1 / WCAG AA?"** Every answer below is confirmed against the installed versions.

Four technical facts drive the whole plan: (1) Tailwind v4 turns `@theme` CSS-variable tokens into utilities **automatically** by namespace — `--color-accent` becomes `text-accent`/`bg-accent`/`border-accent`, `--text-h1` becomes `text-h1`, `--shadow-card` becomes `shadow-card`, `--spacing-section` becomes `p-section`/`gap-section`; this is the entire mechanism for "single-file restyle." (2) Astro 6 ships a **stable, built-in Fonts API** (`fontProviders.local()` + `<Font />` from `astro:assets`) that self-hosts woff2 from `src/`, auto-generates `size-adjust` fallback metrics, emits preload links, and serves everything from `'self'` — this is the CSP-clean, CLS-safe path and beats fontsource/manual `@font-face`. (3) `astro-icon@1.1.5` resolves **local** SVGs from `src/icons/` by filename (`<Icon name="deal-flow" />`) with SVGO optimization and zero CDN/CSP exposure — it does not require Iconify remote sets. (4) `@astrojs/sitemap` excludes a route via the `filter` callback, and `noindex` reuses the Phase 1 `BaseLayout` `<meta name="robots">` mechanism (D-19).

**Primary recommendation:** Rewrite `src/styles/global.css` `@theme` values (keep the D-22 names) + add `--text-*`/`--shadow-*`/`--spacing-*` tokens; wire Hanken Grotesk via Astro's native `fonts` config + `<Font preload />` in `BaseLayout`; add `astro-icon` integration reading `src/icons/`; hand-author one hero SVG (`src/icons/` for the icons, `src/assets/illustrations/` for the hero); build the eight components under `src/components/sections/` + small `ui/` primitives reading only tokens; expose them on a single `/_design` page that is `noindex` (PROD-aware meta) and sitemap-`filter`-excluded.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Color / type / spacing / shadow tokens | Build-time CSS (`@theme`) | — | Tailwind v4 compiles `@theme` vars into utilities at build; no runtime, no JS. Single source of truth. |
| Self-hosted font delivery | Build-time (Astro Fonts API) | Static `'self'` assets | Astro downloads/optimizes woff2 at build, emits `@font-face` + preload; served same-origin (CSP `font-src 'self'`). |
| Hero SVG + practice-area icons | Static assets, inlined at build | — | Hand-authored SVG inlined by `astro-icon` / `<Image>` / direct import; no client JS, no CDN. |
| Reusable section components | Astro components (static HTML) | — | `.astro` components render to static HTML; zero hydration needed for Phase 2 (FAQ accordion uses `<details>`/CSS, not JS — see Pitfall 4). |
| Micro-interactions | Browser (CSS `:hover`/`transition`) | — | Pure CSS transitions gated by `prefers-reduced-motion` media query; no JS framework. |
| Gallery route `/_design` | Build-time static page | — | A normal `.astro` page; `noindex` via meta, sitemap-excluded via `filter`. |

**Key implication for the planner:** Phase 2 ships **zero client-side JavaScript**. Every locked decision (tokens, fonts, SVG, components, micro-interactions, FAQ accordion) is achievable with static HTML + CSS. This keeps the CSP soak clean (no new `script-src` needs) and is the right architecture for a non-coder-owned marketing site.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Color Palette**
- **D-01:** Palette **Direction B — near-black minimalist (Norm-aligned)** is the locked foundation. Token values:
  - `--color-bg`: warm off-white `#F8F5F0`
  - `--color-text`: near-black `#111111`
  - `--color-text-muted`: graphite `#52524E`
  - `--color-bg-elevated`: **a near-white card surface** (lighter than the page; exact value e.g. `#FDFCFA` set during planning) — see D-09
  - `--color-border`: warm grey `#D9D2C5`
  - `--color-accent`: deep rust / persimmon `#9A3F1A`
  - `--color-accent-fg`: warm off-white `#F8F5F0`
  - Token **names** inherited unchanged from Phase 1 D-22 — only values change.
- **D-02:** Deep rust `#9A3F1A` is the single accent — CTA buttons, links, Chambers strip, focus rings. ~6.8:1 on the off-white bg (Jon's measurement — verify during planning).
- **D-03:** **Lock a single palette now; do NOT build 2–3 Vercel variants.** Conscious deviation from ROADMAP criterion #1. **Planner + verifier must treat single-palette delivery as correct, not a gap.** (Logged to DECISIONS.md.)
- **D-04:** **Light mode only** for v1. No dark-mode token set, no toggle.

**Typography**
- **D-05:** **One modern sans for everything** — headlines, body, UI. Hierarchy from size + weight + spacing, not a second typeface.
- **D-06:** The typeface is **Hanken Grotesk**.
- **D-07:** Fonts are **self-hosted** via Astro's built-in font system. Required by Phase 1 CSP (`font-src 'self' data:` per D-15). Google Fonts CDN not allowed. `font-display: swap` + size-adjust metrics to keep CLS ≤ 0.1 (PERF-05).
- **D-08:** **Dramatic, big-and-bold headline hierarchy.** Implement as fluid/`clamp()`-based steps (Claude's discretion on exact stops).

**Surfaces, Motion & Components**
- **D-09:** Cards/surfaces use a **soft drop shadow** and float above the page. `--color-bg-elevated` retuned to a *near-white* surface (token name unchanged). Shadow **subtle** (low spread/opacity, warm-tinted).
- **D-10:** **Restrained micro-interactions** (card hover-lift, animated link underline, button hover-deepen, smooth FAQ expand) — all disabled under `prefers-reduced-motion: reduce`.
- **D-11:** The eight components are the locked Phase 2 set: `Hero`, `PracticeAreaCard`, `AttorneyCard`, `TestimonialQuote`, `DealsGrid`, `FeeStructureBand`, `CtaBlock`, `FaqAccordion`. Each renders realistic placeholder content from FIRM_BRIEF.md (Athelas–Commure testimonial, real practice-area names).

**Creative Art**
- **D-12:** Hero = **converging linework ("deal flow")** — fine lines converging to a point. Deep rust on bone. Hand-authored SVG. *(Not a network-of-nodes graph — see Specific Ideas.)*
- **D-13:** Three **custom thin-line practice-area icons** (M&A / IP & Technology Transactions / Tax) in the hero's visual language. Integrated via **`astro-icon`** (not yet installed; this phase adds it). Local SVGs (e.g. `src/icons/`), not a third-party Iconify set.
- **D-14:** Wordmark = **typographic (Hanken Grotesk) + a small custom mark** derived from the converging-lines motif (favicon / mobile header / social avatar). Modernization, not rebrand.
- **D-15:** **Claude hand-authors the final-quality hero SVG + three icons in-repo this phase** (not placeholders). Drop-in-replaceable by a designer later.

**Gallery Preview Page**
- **D-16:** Component gallery = **permanent hidden reference route** (e.g. `/_design`) — `noindex`, sitemap-excluded, not in nav. Reuse Phase 1 D-19 `noindex` discipline; `@astrojs/sitemap` filters it out.

### Claude's Discretion
- Exact hex for retuned `--color-bg-elevated` near-white surface; precise shadow recipe (spread/blur/opacity/tint); exact `clamp()` type-scale stops — pick to hit WCAG AA + CLS ≤ 0.1.
- Spacing-scale base unit and rhythm (4px vs 8px base; section vertical spacing) — generous, whitespace-forward, consistent with DESIGN-07.
- Component file/directory layout under `src/components/` — follow Phase 1 structure (`chrome/`, `legal/`, `seo/`; add `sections/`/`ui/` as planner sees fit).
- Precise abstract forms of the three practice-area icons.
- Number/shape of button + link variants needed to support the eight components.

### Deferred Ideas (OUT OF SCOPE)
- Professional designer pass on hero/icons/wordmark (drop-in swap later, D-15).
- OG image visual treatment (Phase 3).
- Per-page content + full page assembly (Phases 3–5).
- Lighthouse / axe-core launch budgets, CSP enforcement (Phase 7). **Design to those targets (AA contrast, CLS ≤ 0.1) but the gates run later.**
- Dark mode (D-04). A second/third palette for side-by-side (D-03).
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DESIGN-01 | Color palette decided with Jon's input | Already decided (D-01/02/03). Palette renders on a Vercel preview before Phase 3; verifier treats single palette as correct (D-03). |
| DESIGN-02 | `@theme` tokens for colors, typography scale, spacing scale — single CSS file source of truth | "Tailwind v4 `@theme`" section: exact token-namespace → utility mapping. Rewrite `src/styles/global.css` keeping D-22 names. |
| DESIGN-03 | Modern sans, no serifs; large bold headlines, strong hierarchy | "Self-Hosting Hanken Grotesk" + fluid `clamp()` type scale (`--text-*` tokens). |
| DESIGN-04 | Eight reusable section components | "Component Architecture" section: file layout, props, token-only styling, placeholder content from FIRM_BRIEF. |
| DESIGN-05 | One custom abstract hero SVG, integrated | "Hand-Authoring SVG" section: converging-linework, `currentColor`, viewBox, ≤200 KB, `src/assets/illustrations/`. |
| DESIGN-06 | 3 practice-area icons via `astro-icon` | "astro-icon for Local SVGs" section: install, `src/icons/`, `<Icon name>`, no CDN/CSP issue. |
| DESIGN-07 | Generous whitespace, restrained imagery | Spacing-scale token guidance; the one hero+icon creative moment; no stock-photo theatrics. |
| DESIGN-08 | Premium but warmer than Norm — restrained foundation + selective creative moments | Palette + whitespace + the single hero/icon system deliver warmth (per FIRM_BRIEF Norm+Strix synthesis). |

Also relevant (designed-for now, gated later): **A11Y-04** contrast, **PERF-02** ≤200 KB images, **PERF-03** `<Image>`/modern formats, **PERF-05** font-display/CLS ≤ 0.1.
</phase_requirements>

---

## Standard Stack

### Core (already installed — verified in `package.json` + `node_modules`)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Astro | **6.3.7** (installed; 6.3.8 available) | Static site framework + built-in Fonts API + `astro:assets` | [VERIFIED: node_modules/astro/package.json] Fonts API is **stable** in 6.0+, not experimental [CITED: astro.build/blog/astro-6]. |
| Tailwind CSS | **4.3.0** | `@theme` token system → utilities, no config file | [VERIFIED: package.json] v4 generates utilities from `@theme` CSS vars by namespace. |
| `@tailwindcss/vite` | **4.3.0** | Tailwind v4 Vite plugin (already wired in `astro.config.mjs`) | [VERIFIED: astro.config.mjs] |
| `sharp` | (transitive via Astro) | `<Image>` optimization engine | [ASSUMED] Not pinned in `package.json` — see Don't-Hand-Roll + Pitfall 7. Pin it. |

### To Add This Phase
| Library | Version | Purpose | Why |
|---------|---------|---------|-----|
| `astro-icon` | **1.1.5** | Inline local SVG icons from `src/icons/`, auto SVGO-optimized | [VERIFIED: npm registry] DESIGN-06 names it explicitly. Maintained by `natemoo-re` (Astro core team); repo `github.com/natemoo-re/astro-icon`; created 2021-12; **no postinstall script**. Resolves local SVG by filename — no Iconify remote set required, no CDN, CSP-clean. |

### Fonts — no npm package needed
Astro's **built-in** Fonts API (`fontProviders.local()` + `<Font />` from `astro:assets`) self-hosts the woff2 files you place in `src/`. **Do NOT install `@fontsource-variable/hanken-grotesk`** — fontsource is a *provider option* inside the same API, but D-07 requires self-hosting from `'self'`; the `local()` provider is the most direct CSP-clean route and avoids an extra dependency. (If a future maintainer prefers fontsource, `fontProviders.fontsource()` also self-hosts at build time and is CSP-clean — but `local()` is the recommendation since you control the exact woff2 files committed under the 200 KB budget.)

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Astro Fonts API `local()` | Manual `@font-face` in `global.css` + woff2 in `src/assets/fonts/` | Works and is CSP-clean, but you lose Astro's auto-generated `size-adjust`/`ascent-override` fallback metrics — which are exactly what keeps CLS ≤ 0.1 (PERF-05). The Fonts API does this for free. **Use the Fonts API.** |
| Astro Fonts API `local()` | `fontProviders.fontsource()` | Also self-hosts at build, CSP-clean. `local()` preferred for explicit control over which woff2 weights are committed (200 KB budget) and zero new dependency. |
| `astro-icon` | Inline `.astro` SVG components | astro-icon is named in DESIGN-06 and gives auto-SVGO + a clean `<Icon name>` API. For the **hero** (a larger one-off illustration) a direct SVG import or `<Image>` is fine; for the **3 repeated practice-area icons**, astro-icon is the right tool. |

**Installation:**
```bash
npm install astro-icon@1.1.5
npm install sharp@0.34.5   # pin explicitly (Pitfall 7) — Astro's default image engine
```
Then download Hanken Grotesk woff2 files (the weights you actually use, e.g. 400/500/700/800) into `src/assets/fonts/` — committed, served from `'self'`.

**Version verification (performed 2026-05-26):**
- `npm view astro version` → 6.3.8 (installed: 6.3.7) [VERIFIED: npm registry]
- `npm view astro-icon version` → 1.1.5 [VERIFIED: npm registry]
- `npm view @astrojs/sitemap version` → 3.7.3 (installed: 3.7.2 per package.json) [VERIFIED: npm registry]
- `npm view tailwindcss version` → 4.3.0 (installed 4.3.0) [VERIFIED: npm registry]
- `npm view astro-icon scripts.postinstall` → empty (no postinstall) [VERIFIED: npm registry]

## Package Legitimacy Audit

> slopcheck could not be installed in this environment (no `pip`/`pip3` on PATH). Per protocol, packages are degraded to `[ASSUMED]` and the planner **should gate the one new install behind a `checkpoint:human-verify` task** — though astro-icon's provenance is independently strong (see below) and it is already named in the locked stack (STACK.md) and DESIGN-06.

| Package | Registry | Age | Source Repo | postinstall | slopcheck | Disposition |
|---------|----------|-----|-------------|-------------|-----------|-------------|
| `astro-icon@1.1.5` | npm | ~4.4 yrs (created 2021-12-04) | github.com/natemoo-re/astro-icon (Nate Moore, Astro core team) | none | unavailable | **Approved** — provenance verified via npm registry + GitHub; named in DESIGN-06 & STACK.md |
| `sharp@0.34.5` | npm | mature, ubiquitous | github.com/lovell/sharp | (prebuilt binaries) | unavailable | **Approved** — Astro's default image engine; pin only |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

*slopcheck unavailable → both packages tagged `[ASSUMED]`. The planner may add one lightweight `checkpoint:human-verify` before the `astro-icon` install, or accept the independent provenance verification above (registry age 4+ years, official Astro-team author, GitHub repo, no postinstall). Recommend the latter — this matches the gitleaks-binary supply-chain discipline already established in DECISIONS.md.*

---

## Architecture Patterns

### System Architecture Diagram

```
                          src/styles/global.css  (@theme block — THE source of truth)
                          ┌──────────────────────────────────────────────┐
                          │  --color-*  --text-*  --spacing-*  --shadow-*  │
                          │  --font-sans: "Hanken Grotesk", ...            │
                          └───────────────────────┬──────────────────────┘
                                                  │ Tailwind v4 compiles vars → utilities
                                                  │ (text-accent, bg-bg-elevated, text-h1,
                                                  │  shadow-card, p-section, gap-section …)
                                                  ▼
   astro.config.mjs                       ┌────────────────────────────┐
   ┌──────────────────────────┐  fonts    │   Reusable components       │
   │ fonts:[ local() Hanken ] ─┼──────────▶  src/components/sections/   │
   │ integrations:[ icon(),    │           │   Hero, PracticeAreaCard,   │
   │   sitemap({filter}) ]      │  icons    │   AttorneyCard, …(8 total)  │
   └─────────┬─────────────────┘◀──────────┤   src/components/ui/        │
             │                  <Icon>      │   Button, Link, Card prims  │
             │ <Font preload/>             └──────────────┬─────────────┘
             ▼ (in BaseLayout <head>)                     │ composed with placeholder props
   src/layouts/BaseLayout.astro                           ▼
   (Phase 1; add <Font>, refined          ┌────────────────────────────┐
    SiteHeader/SiteFooter + wordmark)      │  src/pages/_design.astro    │
                                           │  (noindex meta + sitemap    │
   Hand-authored SVG:                      │   filter-excluded gallery)  │
   src/icons/{ma,ip,tax}.svg  ─────────────┤  renders all 8 components    │
   src/assets/illustrations/hero.svg ──────┘                              │
                                           └─────────────────────────────┘
   @astrojs/sitemap filter:(page)=> page !== '…/_design'  excludes the route
```

### Recommended Project Structure
```
src/
├── styles/
│   └── global.css              # @theme rewrite (D-22 names) + new --text/--spacing/--shadow tokens
├── assets/
│   ├── fonts/                  # Hanken Grotesk woff2 (committed, served from 'self')
│   └── illustrations/
│       └── hero-deal-flow.svg  # the converging-linework hero (one-off, larger)
├── icons/                      # astro-icon default dir — local SVGs by filename
│   ├── practice-mergers-acquisitions.svg
│   ├── practice-ip-tech.svg
│   ├── practice-tax.svg
│   └── mark.svg                # the small derived wordmark mark (favicon/avatar)
├── components/
│   ├── chrome/                 # Phase 1 — SiteHeader/SiteFooter get wordmark + refined treatment
│   ├── legal/                  # Phase 1 — Disclaimer (untouched; new components must compose with it)
│   ├── seo/                    # Phase 1
│   ├── ui/                     # NEW — Button, TextLink primitives (variants per discretion)
│   └── sections/               # NEW — the 8 locked section components
│       ├── Hero.astro
│       ├── PracticeAreaCard.astro
│       ├── AttorneyCard.astro
│       ├── TestimonialQuote.astro
│       ├── DealsGrid.astro
│       ├── FeeStructureBand.astro
│       ├── CtaBlock.astro
│       └── FaqAccordion.astro
└── pages/
    └── _design.astro           # hidden gallery (noindex + sitemap-excluded)
```
> Note: a file at `src/pages/_design.astro` produces the route `/_design`. Astro does **not** special-case the leading underscore in `src/pages/` (underscore-prefixed files are only ignored inside dynamic/content dirs, not as top-level page names) — so the route renders normally and you rely on `noindex` + sitemap `filter` to hide it (D-16). Confirm the built route is `/_design` during planning. [ASSUMED — verify the emitted route name at build]

### Pattern 1: Tailwind v4 `@theme` — tokens become utilities by namespace
**What:** In Tailwind v4 there is **no `tailwind.config.js`**. You declare CSS custom properties inside an `@theme {}` block in `global.css`; Tailwind reads the *namespace prefix* of each variable and generates matching utility classes automatically.
**When to use:** For every design token in this phase.
**The namespace → utility mapping (this is the core mechanism for DESIGN-02 "single-file restyle"):**

| `@theme` variable namespace | Generates utilities | Example |
|------------------------------|---------------------|---------|
| `--color-*` | `text-*`, `bg-*`, `border-*`, `fill-*`, `ring-*`, `divide-*`, `outline-*` | `--color-accent` → `text-accent`, `bg-accent`, `ring-accent` |
| `--font-*` | `font-*` | `--font-sans` → `font-sans` |
| `--text-*` | `text-*` (font-size) | `--text-h1` → `text-h1` |
| `--spacing-*` | padding/margin/gap/width/etc. | `--spacing-section` → `p-section`, `py-section`, `gap-section` |
| `--shadow-*` | `shadow-*` | `--shadow-card` → `shadow-card` |
| `--radius-*` | `rounded-*` | `--radius-card` → `rounded-card` |

**Example (the global.css rewrite — keep D-22 names, change values, add scales):**
```css
/* Source pattern: tailwindcss.com/docs/theme + Astro Tailwind v4 integration */
@import "tailwindcss";

@theme {
  /* Colors — D-22 names UNCHANGED, D-01 values (light mode only, D-04) */
  --color-text:        #111111;
  --color-text-muted:  #52524E;
  --color-bg:          #F8F5F0;
  --color-bg-elevated: #FDFCFA;   /* near-white floating surface (D-09; final hex = discretion) */
  --color-border:      #D9D2C5;
  --color-accent:      #9A3F1A;
  --color-accent-fg:   #F8F5F0;

  /* Font (D-05/06) — value points at the Fonts API cssVariable + fallback stack */
  --font-sans: var(--font-hanken), ui-sans-serif, system-ui, -apple-system,
    "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;

  /* Fluid type scale (D-08) — clamp()-based; exact stops = discretion */
  --text-h1: clamp(2.5rem, 1.5rem + 4vw, 4.5rem);
  --text-h2: clamp(2rem, 1.4rem + 2.4vw, 3rem);
  --text-h3: clamp(1.5rem, 1.2rem + 1.2vw, 2rem);
  --text-body: 1.0625rem;
  --text-small: 0.875rem;

  /* Spacing rhythm (DESIGN-07) — generous, whitespace-forward; base = discretion */
  --spacing-section: clamp(3rem, 2rem + 6vw, 8rem);

  /* Soft warm-tinted floating shadow (D-09) — subtle, low opacity, rust-tinted black */
  --shadow-card: 0 1px 2px rgba(60, 30, 15, 0.04),
                 0 8px 24px rgba(60, 30, 15, 0.06);
  --radius-card: 0.75rem;
}
```
> Keep the existing Phase 1 `@layer base` block (border-color reset + body bg/text/font) — it already reads `var(--color-border)`/`var(--color-bg)`/`var(--font-sans)`, so it keeps working after the value swap (the entire point of D-22).

### Pattern 2: Self-hosting Hanken Grotesk via the Astro Fonts API (CSP-clean, CLS-safe)
**What:** Astro 6's built-in Fonts API registers fonts in `defineConfig`, downloads/caches/optimizes them at build, auto-generates `size-adjust` fallback metrics (the CLS fix), emits preload links, and serves the woff2 from your own origin.
**When to use:** This is the locked path for D-07 (self-hosted) + PERF-05 (font-display/CLS ≤ 0.1).
**astro.config.mjs (add `fonts` + import `fontProviders`):**
```js
// Source: docs.astro.build/en/guides/fonts/ + font-provider-reference (verified 2026-05-26)
import { defineConfig, fontProviders } from 'astro/config';
// …existing imports…

export default defineConfig({
  site: 'https://bsvlaw.com',
  trailingSlash: 'never',
  fonts: [{
    provider: fontProviders.local(),
    name: 'Hanken Grotesk',
    cssVariable: '--font-hanken',
    fallbacks: ['sans-serif'],          // Astro auto-generates size-adjust metric fonts from these
    options: {
      variants: [
        { src: ['./src/assets/fonts/HankenGrotesk-Regular.woff2'],  weight: '400', style: 'normal' },
        { src: ['./src/assets/fonts/HankenGrotesk-Medium.woff2'],   weight: '500', style: 'normal' },
        { src: ['./src/assets/fonts/HankenGrotesk-Bold.woff2'],     weight: '700', style: 'normal' },
        { src: ['./src/assets/fonts/HankenGrotesk-ExtraBold.woff2'],weight: '800', style: 'normal' }, // dramatic headlines (D-08)
      ],
    },
  }],
  // …integrations / adapter / vite…
});
```
**BaseLayout.astro `<head>` (one line):**
```astro
---
import { Font } from 'astro:assets';
---
<head>
  …
  <Font cssVariable="--font-hanken" preload />
</head>
```
- The `<Font>` component injects the `@font-face` rules (with `font-display: swap` — Astro's default) **and** the `<link rel="preload" as="font" crossorigin>` for the preloaded variant, all same-origin → satisfies CSP `font-src 'self'` with no header change.
- The `--font-sans` token in `global.css` references `var(--font-hanken)` so all existing components keep using `font-sans`.
- **CLS:** Astro generates `size-adjust`/`ascent-override`/`descent-override` on a synthetic fallback face automatically from `fallbacks` — this is what eliminates the swap-reflow and keeps CLS ≤ 0.1. No manual metric tuning needed (the manual `@font-face` alternative would require it by hand — see Alternatives).

### Pattern 3: `astro-icon` for local custom SVGs
**What:** `astro-icon` reads `.svg` files from `src/icons/` and inlines them via `<Icon name="filename" />`, auto-optimizing with SVGO. No remote/Iconify set required.
**When to use:** The 3 practice-area icons (D-13) and the small wordmark mark (D-14).
**astro.config.mjs:**
```js
// Source: astroicon.dev/guides/customization + github.com/natemoo-re/astro-icon (verified 2026-05-26)
import icon from 'astro-icon';
export default defineConfig({
  integrations: [mdx(), sitemap({ /* filter below */ }), icon()],   // default iconDir: 'src/icons'
});
```
**Usage in a component:**
```astro
---
import { Icon } from 'astro-icon/components';
---
<Icon name="practice-mergers-acquisitions" class="size-10 text-accent" aria-hidden="true" />
```
- File `src/icons/practice-mergers-acquisitions.svg` → `<Icon name="practice-mergers-acquisitions" />`. Sub-folders create namespaced sets (`name="set/icon"`).
- Inlined at build → no CDN, no extra network request, **no CSP impact** (it's same-origin inline SVG, not a remote `<img>` or `<script>`).
- Make icon SVGs use `fill="currentColor"`/`stroke="currentColor"` so `text-accent` (D-02) themes them — see Pattern 5.

### Pattern 4: FaqAccordion without JavaScript — native `<details>`/`<summary>`
**What:** Build the FAQ accordion (D-11) from native `<details>`/`<summary>` elements with CSS-animated disclosure, **not** a JS framework component.
**When to use:** The `FaqAccordion` component. Native `<details>` gives keyboard nav (A11Y-03), correct semantics, and zero hydration — keeping Phase 2 JS-free (clean CSP soak).
**Why:** A JS accordion would need `client:` hydration → a `script-src` entry to soak → friction against the Phase 7 CSP enforce. `<details>` is built into HTML, fully accessible, and the "smooth expand" (D-10) can use CSS `interpolate-size`/`transition` gated by `prefers-reduced-motion`.

### Pattern 5: SVG that follows the theme via `currentColor`
**What:** Author the hero and icons with `stroke="currentColor"` / `fill="currentColor"` (no hardcoded hex) so a parent `text-accent` class paints them deep rust (D-02/D-12).
**When to use:** All hand-authored SVG.
**Example (icon skeleton):**
```svg
<!-- src/icons/practice-tax.svg — thin-line, currentColor, decorative -->
<svg viewBox="0 0 48 48" fill="none" stroke="currentColor"
     stroke-width="1.25" stroke-linecap="round" xmlns="http://www.w3.org/2000/svg">
  <!-- converging thin lines forming an abstract tax mark -->
  <path d="M8 12 L40 12 M14 12 L24 36 M34 12 L24 36" />
</svg>
```

### Anti-Patterns to Avoid
- **Reintroducing `tailwind.config.js`** to define colors/spacing — v4 puts tokens in `@theme`; a config file fragments the single source of truth (DESIGN-02). [Pitfall 12, PITFALLS.md]
- **Hardcoding hex in components** (`bg-[#9A3F1A]`) — defeats D-22. Always `bg-accent` / `text-accent` etc. so the restyle stays a single-file edit.
- **Linking Google Fonts CDN** (`<link href="fonts.googleapis.com">`) — violates D-07 CSP `font-src 'self'` and causes CDN-latency CLS [PITFALLS.md Pitfall 16].
- **A JS-hydrated accordion / carousel** — adds a `script-src` need against the CSP soak; use `<details>` (Pattern 4).
- **Hardcoded color inside SVG** — breaks `text-accent` theming and dark-mode-ability; use `currentColor` (Pattern 5).
- **`display:none` to hide `/_design` from nav while forgetting `noindex`/sitemap** — the route is still crawlable; you must do both meta `noindex` + sitemap `filter` (D-16).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Self-hosted font `@font-face` + CLS metric tuning | Hand-written `@font-face` + manual `size-adjust`/`ascent-override` | Astro Fonts API `local()` + `<Font>` | Astro auto-generates the fallback metrics that hit CLS ≤ 0.1 (PERF-05); hand-tuning is error-prone. |
| Image optimization / responsive `srcset` / dimensions | `<img>` with manual width/height | Astro `<Image>` (`astro:assets`) + `sharp` | Auto WebP/AVIF, auto dimensions (prevents CLS), lazy-load. PERF-02/03. (SVGs are the exception — inline them directly, Astro doesn't optimize SVG.) |
| Inlining + optimizing repeated SVG icons | Copy-pasting `<svg>` into each component | `astro-icon` `<Icon name>` | Auto-SVGO, single source file per icon, clean API. DESIGN-06. |
| Type scale | Magic-number font sizes per component | `clamp()` `--text-*` tokens in `@theme` | Fluid scale = dramatic on desktop, controlled on mobile (D-08); one place to tune. |
| Token-to-utility plumbing | Manual CSS classes | Tailwind v4 `@theme` namespace auto-generation | The whole point of DESIGN-02's single-file restyle. |

**Key insight:** Phase 2 is a "use the platform" phase. Astro 6 + Tailwind v4 ship native solutions for every hard part (fonts, images, tokens); the only genuinely hand-authored artifacts are the **SVG art** (hero + 3 icons + mark) and the **component markup** — both of which are pure static HTML/SVG with zero dependencies.

## Common Pitfalls

### Pitfall 1: Tailwind v3 muscle-memory (`theme()`, config file, default border color)
**What goes wrong:** Using `theme(colors.accent)` in CSS, defining colors in `tailwind.config.js`, or assuming `border` renders a visible border by default.
**Why it happens:** v4 was a rewrite; most training data and tutorials are v3-era. [PITFALLS.md Pitfall 12]
**How to avoid:** All tokens in `@theme`; reference as `var(--color-accent)` or the generated utility (`text-accent`). The Phase 1 `@layer base` border-color reset is already in `global.css` — **keep it**.
**Warning signs:** `border` elements appear borderless; `theme(...)` in a `.css` file; a populated `tailwind.config.js`.

### Pitfall 2: Font CLS from missing fallback metrics
**What goes wrong:** Text reflows ("jumps") when Hanken Grotesk swaps in; CLS > 0.1, failing PERF-05.
**Why it happens:** A bare `@font-face` with `font-display: swap` but no `size-adjust` reflows on swap.
**How to avoid:** Use the Astro Fonts API with a `fallbacks: ['sans-serif']` entry — Astro generates the metric-matched fallback automatically. Add `<Font preload />` for the above-the-fold weight only (preload sparingly).
**Warning signs:** Visible page jump on cold-cache reload on throttled mobile; Lighthouse CLS yellow/red. (Verified in Phase 7, but **design for it now**.)

### Pitfall 3: Accent contrast assumption not actually measured
**What goes wrong:** D-02 cites ~6.8:1 for `#9A3F1A` on `#F8F5F0`, but **accent text vs. accent-as-button-fill** are different checks — white/`accent-fg` text *on* the rust button, and rust text *on* the bone bg, are two separate AA tests. Muted graphite `#52524E` on bone must also clear 4.5:1.
**Why it happens:** A single "the accent passes" mental check misses the inverse pairing.
**How to avoid:** During planning, compute (and record in the plan) contrast for: accent-on-bg, text-on-bg, text-muted-on-bg, accent-fg-on-accent, text-on-bg-elevated. All normal text ≥ 4.5:1 (A11Y-04). Border `#D9D2C5` is non-text (3:1 UI guidance, not a hard AA text gate).
**Warning signs:** Muted text or button labels that "look fine" but fail a contrast checker.

### Pitfall 4: Hydrating the accordion (CSP / JS creep)
**What goes wrong:** Reaching for a React/Preact accordion island adds `client:` hydration and a new `script-src` requirement against the Phase 1 CSP soak.
**How to avoid:** Native `<details>`/`<summary>` (Pattern 4). Keep Phase 2 JS-free.
**Warning signs:** A `client:load`/`client:idle` directive appears in a Phase 2 component; new entries needed in `script-src`.

### Pitfall 5: `/_design` leaks into the index or sitemap
**What goes wrong:** The gallery page gets crawled, indexed, or listed in `sitemap.xml` — exposing a "backstage" page (D-16).
**How to avoid:** Two controls, both required: (a) `noindex` — BaseLayout already emits `<meta name="robots" content="noindex,nofollow">` on non-PROD (D-19); for a permanent hidden route you additionally need it `noindex` **even in PROD**, so the `_design.astro` page must set robots `noindex` explicitly (don't rely on the preview-only PROD-false path). (b) sitemap `filter: (page) => page !== 'https://bsvlaw.com/_design'`.
**Warning signs:** `/_design` appears in built `sitemap-0.xml`; the page lacks an explicit `noindex` meta in a PROD build.

### Pitfall 6: SVG accessibility — decorative vs meaningful
**What goes wrong:** Screen readers announce a decorative hero/icon, or a meaningful icon has no label.
**How to avoid:** Decorative art → `aria-hidden="true"` (the hero is decorative; the rust converging-lines is mood, not information). Icons that *replace* text → `role="img"` + `<title>`/`aria-label`. astro-icon forwards `aria-hidden`/`title` props.
**Warning signs:** axe-core flags (Phase 7) — but author correctly now.

### Pitfall 7: `sharp` not pinned → Vercel build surprise
**What goes wrong:** `<Image>` (used for any raster placeholder, e.g. headshot stand-ins in `AttorneyCard`) needs `sharp`; if it's only transitive, a Vercel build can fail with "sharp not found." [PITFALLS.md Pitfall 15; DECISIONS.md asset-path note]
**How to avoid:** `npm install sharp@0.34.5` to pin it in `package.json`. Note `AttorneyCard` placeholder headshots, per DECISIONS.md, must live under `src/` (not `/public`) for `image()`/`<Image>` to process them.

## Code Examples

### Token-only component (PracticeAreaCard skeleton — no hardcoded color, soft floating shadow D-09)
```astro
---
// src/components/sections/PracticeAreaCard.astro
import { Icon } from 'astro-icon/components';
interface Props { title: string; blurb: string; icon: string; href: string; }
const { title, blurb, icon, href } = Astro.props;
---
<a href={href}
   class="group block rounded-card bg-bg-elevated p-8 shadow-card border border-border
          transition-transform duration-200 motion-safe:hover:-translate-y-1">
  <Icon name={icon} class="size-10 text-accent" aria-hidden="true" />
  <h3 class="mt-4 text-h3 font-bold text-text">{title}</h3>
  <p class="mt-2 text-body text-text-muted">{blurb}</p>
</a>
```
- `motion-safe:hover:-translate-y-1` is the hover-lift (D-10) — Tailwind's `motion-safe:` variant only applies when `prefers-reduced-motion` is **not** reduce, so the reduced-motion requirement is satisfied for free.

### `prefers-reduced-motion` (D-10) — two correct mechanisms
```css
/* In global.css, for any non-utility transitions you author by hand */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
}
```
```html
<!-- Or, per-element via Tailwind's built-in variant (preferred for component utilities) -->
<button class="transition-colors motion-safe:hover:bg-accent/90">…</button>
<a class="relative motion-safe:after:transition-[width] hover:after:w-full …">animated underline</a>
```
**Recommendation:** use Tailwind's `motion-safe:` / `motion-reduce:` variants on component utilities (they map to the media query) AND keep the global `@media (prefers-reduced-motion: reduce)` guard as a backstop for any hand-authored keyframes.

### Sitemap exclusion of `/_design`
```js
// Source: docs.astro.build sitemap guide (verified 2026-05-26) — only `filter` exists, no `exclude`
sitemap({ filter: (page) => page !== 'https://bsvlaw.com/_design' })
```

### `/_design` page robots (explicit PROD noindex, D-16)
```astro
---
// src/pages/_design.astro
import BaseLayout from '../layouts/BaseLayout.astro';
// …import all 8 components…
---
<BaseLayout title="Design System (internal)" description="Internal component gallery">
  <meta slot="head" name="robots" content="noindex, nofollow" />   <!-- explicit, even in PROD -->
  <!-- render Hero, PracticeAreaCard ×3, AttorneyCard ×5, TestimonialQuote, DealsGrid,
       FeeStructureBand, CtaBlock, FaqAccordion with FIRM_BRIEF placeholder content -->
</BaseLayout>
```
> Note BaseLayout currently sets robots based on `isPreview`; in PROD it emits `index, follow`. The `/_design` page must override to `noindex` regardless of environment. Confirm during planning whether the slotted meta overrides or duplicates BaseLayout's tag — if duplicates, prefer adding a `noindex?: boolean` prop to BaseLayout so `/_design` passes `noindex` cleanly (cleaner than two conflicting `<meta robots>` tags).

## Runtime State Inventory

> This phase is greenfield-styling, **not** a rename/refactor/migration. No stored data, live-service config, OS-registered state, secrets, or build artifacts carry the design tokens at runtime — tokens compile into CSS at build time and `astro-icon` inlines SVG at build time. **None applicable — verified: Phase 2 produces only source files (CSS, SVG, .astro, woff2) consumed at build; no runtime/stored/registered state.**

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` `theme.extend` | `@theme {}` CSS variables in the stylesheet | Tailwind v4 (late 2024) | No JS config; tokens are CSS vars that auto-generate utilities. |
| Manual `@font-face` + Google Fonts `<link>` | Astro built-in Fonts API (`fontProviders.local()` + `<Font>`) | Astro 6.0 (stable) | Self-hosting, optimization, preload, CLS-fixing fallback metrics — built in, CSP-clean. |
| `experimental.fonts` flag | Top-level `fonts` array in `defineConfig` | Astro 6.0 stable | Fonts API graduated from experimental; **no flag needed** in 6.3.7. [CITED: astro.build/blog/astro-6] |
| `squooshImageService` | `sharp` (default) | Astro 5+ | Don't import Squoosh; it's deprecated [STACK.md]. |

**Deprecated/outdated:**
- `theme()` function in CSS, JS-config colors, default-gray `border` — all v3; gone in v4.
- Linking webfonts from a CDN — incompatible with the firm's CSP and worse for CLS.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | slopcheck unavailable → `astro-icon`/`sharp` tagged `[ASSUMED]`; provenance independently verified strong | Package Legitimacy Audit | LOW — astro-icon is an official-Astro-team package, 4+ yrs, no postinstall, named in DESIGN-06/STACK.md. Planner may add one `checkpoint:human-verify` or accept the registry+GitHub provenance. |
| A2 | A top-level page at `src/pages/_design.astro` emits the route `/_design` (leading underscore not special at page-root level) | Project Structure / Pitfall 5 | LOW — verify emitted route at first build; if Astro ignores it, rename to `/design-system` or `/_/design` and keep noindex+filter. |
| A3 | Astro's `<Font>` default `font-display` is `swap` and it auto-generates `size-adjust` fallback metrics from `fallbacks` | Pattern 2 / Pitfall 2 | LOW-MED — docs confirm auto fallbacks; exact `font-display` default should be confirmed and `swap` set explicitly if configurable (PERF-05 requires swap). Verify in Phase 2 build output. |
| A4 | Exact AA contrast ratios for the locked palette pairings not independently re-measured here | Pitfall 3 | MED — Jon cited ~6.8:1 for accent; planner MUST compute all five pairings and record them (A11Y-04). If a pairing fails, the discretion hexes (`bg-elevated`, possibly `text-muted`) are the tuning levers, not the locked D-01 values. |

## Open Questions (RESOLVED)

1. **Does the slotted `<meta name="robots">` on `/_design` override or duplicate BaseLayout's existing robots tag?**
   - What we know: BaseLayout emits one robots meta based on `isPreview`.
   - What's unclear: two `<meta name="robots">` tags = ambiguous; crawlers may honor the most restrictive, but it's untidy.
   - **RESOLVED:** add an optional `noindex?: boolean` prop to BaseLayout (cleanest); `/_design` passes `noindex`. Implemented in plan 02-01 Task 1.

2. **Which Hanken Grotesk weights to commit (200 KB-per-asset budget)?**
   - What we know: D-08 wants dramatic headlines (needs a heavy weight, 700/800); body needs 400/500.
   - What's unclear: whether to ship a variable woff2 (one file, all weights) or static instances.
   - **RESOLVED:** ship a single **variable** Hanken Grotesk woff2 (covers all weights, typically < 100 KB, fits the budget); fall back to static instances only if the variable file is unexpectedly large. Implemented in plan 02-01 Task 1.

3. **Wordmark "small derived mark" (D-14) — exact form.**
   - What we know: derived from the converging-lines hero motif; used at favicon/avatar size.
   - **RESOLVED:** author as a tiny standalone SVG in `src/icons/mark.svg` (themeable via currentColor) plus a separate `public/favicon.svg`; must read at 16–32 px. Implemented in plan 02-03 Task 1.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js ≥22.12 | Astro 6 build | ✓ (assumed; Phase 1 built green) | per `engines` | — |
| Astro 6.3.7 | everything | ✓ | 6.3.7 installed | — |
| Tailwind 4.3.0 | tokens | ✓ | 4.3.0 installed | — |
| `astro-icon` | DESIGN-06 icons | ✗ (to install) | 1.1.5 target | inline `.astro` SVG components (less clean) |
| `sharp` | `<Image>` placeholders | ⚠ transitive only | pin 0.34.5 | — (must pin; Pitfall 7) |
| Hanken Grotesk woff2 files | D-06/07 fonts | ✗ (to obtain) | — | Must download from a legitimate source (Google Fonts repo / official) and commit to `src/assets/fonts/`. **Obtain only the woff2; do NOT add a Google Fonts CDN link.** |

**Missing dependencies with no fallback:** Hanken Grotesk woff2 files must be obtained and committed — without them the font cannot be self-hosted (D-07). This is a content/asset acquisition task the plan must include (likely a `checkpoint:human-action` or a fetch-and-verify task confirming the woff2 is the genuine Hanken Grotesk and ≤ budget).
**Missing dependencies with fallback:** `astro-icon` (fallback: hand-written inline SVG components, but DESIGN-06 names astro-icon so install it).

## Validation Architecture

> nyquist_validation: `.planning/config.json` not present / key absent → treated as **enabled**. This section is REQUIRED; the orchestrator creates VALIDATION.md from it.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `@playwright/test` 1.60.0 + `cheerio` 1.2.0 (both installed, Phase 1) |
| Config file | `playwright.config.*` (exists from Phase 1; reuse) |
| Quick run command | `npm run build` (token presence, SVG presence, route emission all surface at build) |
| Full suite command | `npm run test` (Playwright) then `npm run build` |

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DESIGN-02 | `@theme` tokens compile into CSS; `text-accent`/`bg-bg-elevated`/`shadow-card`/`text-h1` utilities resolve to the locked values | build + asset grep | `npm run build` then grep compiled CSS in `dist/_astro/*.css` for `#9a3f1a` / `#f8f5f0` | ❌ Wave 0 (`tests/design-tokens.spec.ts`) |
| DESIGN-02 | Changing one token value in `global.css` changes a rendered component (single-file restyle) | manual/visual | Vercel preview review by Jon | ✅ manual (D-03/criterion 2) |
| DESIGN-03 | Hanken Grotesk self-hosted, served from `'self'`, `font-display: swap`, `@font-face` present, no Google Fonts URL anywhere | build + grep | `npm run build`; grep `dist/` for `fonts.googleapis`/`fonts.gstatic` (must be ZERO); assert `font-display` in compiled CSS | ❌ Wave 0 (`tests/fonts-selfhost.spec.ts`) |
| DESIGN-04 | `/_design` renders all 8 components (Hero, PracticeAreaCard, AttorneyCard, TestimonialQuote, DealsGrid, FeeStructureBand, CtaBlock, FaqAccordion) | Playwright + Cheerio | `playwright test tests/gallery.spec.ts` — assert a stable `data-component="…"` marker for each of the 8 | ❌ Wave 0 (`tests/gallery.spec.ts`) |
| DESIGN-05 | Hero SVG exists on disk, is valid SVG, ≤ 200 KB | filesystem | node/PS check: file exists under `src/assets/illustrations/`, size ≤ 204800 bytes, parses as SVG | ❌ Wave 0 (`tests/assets-budget.spec.ts`) |
| DESIGN-06 | 3 practice-area icons exist in `src/icons/`, each ≤ 200 KB, render via `<Icon>` on `/_design` | filesystem + Playwright | assert 3 files exist; assert 3 inline `<svg>` present in `/_design` HTML | ❌ Wave 0 (extend `tests/gallery.spec.ts` + `tests/assets-budget.spec.ts`) |
| DESIGN-07/08 | Premium-but-warm look; generous whitespace | manual/visual | Vercel preview review by Jon (criterion 5) | ✅ manual |
| A11Y-04 | Contrast: text/bg, text-muted/bg, accent/bg, accent-fg/accent all ≥ AA | computed assertion | compute WCAG ratios for the 5 pairings in a unit test (no axe needed — pure math on the locked hexes) | ❌ Wave 0 (`tests/contrast.spec.ts`) |
| A11Y / D-10 | Interactive components keyboard-operable (FAQ `<details>`, links, buttons); motion respects `prefers-reduced-motion` | Playwright | `<details>` toggles via keyboard; assert `motion-safe:`/`motion-reduce:` classes or media-query guard present | ❌ Wave 0 (`tests/a11y-interactions.spec.ts`) |
| D-16 | `/_design` is `noindex` AND absent from `sitemap.xml` | build + grep | grep built `dist/sitemap-0.xml` for `_design` (must be ZERO); grep `/_design` HTML for `noindex` (must be PRESENT) | ❌ Wave 0 (`tests/design-route-hidden.spec.ts`) |
| PERF-02 | No committed image > 200 KB (incl. SVG + woff2 sanity) | filesystem | size scan over `src/assets/`, `src/icons/`, `public/` for image/font assets | ❌ Wave 0 (`tests/assets-budget.spec.ts`) |
| PERF-05 | CLS ≤ 0.1 from fonts | manual/Phase 7 | Lighthouse on Vercel preview (gate runs Phase 7); Phase 2 designs for it via Fonts API fallback metrics | ✅ deferred to Phase 7 (design-for now) |

### Sampling Rate
- **Per task commit:** `npm run build` (catches token/route/SVG failures immediately).
- **Per wave merge:** `npm run test` + `npm run build` (full Playwright + asset/sitemap/contrast checks).
- **Phase gate:** Full suite green + Jon's Vercel-preview confirmation (criterion 5) before `/gsd:verify-work`.

### Wave 0 Gaps
- [ ] `tests/design-tokens.spec.ts` — covers DESIGN-02 (compiled-CSS token values present)
- [ ] `tests/fonts-selfhost.spec.ts` — covers DESIGN-03 (self-hosted, no CDN URL, font-display swap)
- [ ] `tests/gallery.spec.ts` — covers DESIGN-04/06 (all 8 components + 3 icons render on `/_design`)
- [ ] `tests/assets-budget.spec.ts` — covers DESIGN-05/06 + PERF-02 (asset existence + ≤200 KB)
- [ ] `tests/contrast.spec.ts` — covers A11Y-04 (5 WCAG pairings computed from locked hexes)
- [ ] `tests/a11y-interactions.spec.ts` — covers D-10/A11Y-03 (keyboard + reduced-motion)
- [ ] `tests/design-route-hidden.spec.ts` — covers D-16 (noindex + sitemap exclusion)
- [ ] No new framework install needed — Playwright + Cheerio already present from Phase 1.

## Security Domain

> `security_enforcement` config key not located in this session; treat as enabled. Phase 2 is design-only (no auth, sessions, access control, crypto), so most ASVS categories are N/A — but the **CSP interaction** is the live security concern.

### Applicable ASVS Categories
| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | — (no auth in Phase 2) |
| V3 Session Management | no | — |
| V4 Access Control | no | `/_design` is "security by obscurity + noindex," not access-controlled — acceptable per D-16 (no confidential content; same posture as Phase 1 D-20). If real client content later lands on a hidden route, revisit. |
| V5 Input Validation | no | — (no forms in Phase 2; contact form is Phase 6) |
| V6 Cryptography | no | — |
| V14 Configuration (CSP) | **yes** | Keep all Phase 2 assets same-origin so the report-only CSP (`font-src 'self'`, `script-src 'self'`, `img-src 'self' data: https:`) stays clean: self-hosted fonts (not CDN), inline SVG (not remote), zero new `<script>`. |

### Known Threat Patterns for this stack
| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Webfont loaded from third-party CDN (CSP bypass + privacy leak) | Information Disclosure | Self-host via Astro Fonts API `local()`; `font-src 'self'` (D-07). |
| Hidden gallery route indexed/leaked | Information Disclosure | `noindex` meta + sitemap `filter` (D-16); no confidential content on it (D-20 precedent). |
| Inline-script creep from a JS component widening `script-src` | Tampering (CSP erosion) | Keep Phase 2 JS-free; native `<details>` for the accordion (Pattern 4). |
| Untrusted SVG with embedded script | XSS | Hand-authored SVG only; astro-icon runs SVGO which strips scripts. Don't paste third-party SVG without review. |

## Sources

### Primary (HIGH confidence)
- `docs.astro.build/en/guides/fonts/` + `font-provider-reference` — `fontProviders.local()` config, `<Font>` from `astro:assets`, auto fallback metrics, preload. (verified 2026-05-26)
- `astro.build/blog/astro-6` — Fonts API is **stable** (no experimental flag) in Astro 6.0. (verified 2026-05-26)
- `docs.astro.build` sitemap guide — `filter` is the only exclusion option; verbatim example. (verified 2026-05-26)
- `astroicon.dev/guides/customization` + `github.com/natemoo-re/astro-icon` — local `src/icons/`, `<Icon name>` resolution, `iconDir`, auto-SVGO. (verified 2026-05-26)
- npm registry — `astro@6.3.8`, `astro-icon@1.1.5` (no postinstall, created 2021-12, repo natemoo-re), `@astrojs/sitemap@3.7.3`, `tailwindcss@4.3.0`. (verified 2026-05-26)
- Installed `node_modules/astro/package.json` → 6.3.7; `package.json`; `astro.config.mjs`; `src/styles/global.css`; `src/layouts/BaseLayout.astro`; `vercel.json` (read directly this session).

### Secondary (MEDIUM confidence)
- Project `.planning/research/STACK.md` (astro-icon 1.1.5, sharp 0.34.5 pin, font notes) and `PITFALLS.md` (Pitfalls 12, 15, 16, 7) — cross-referenced.
- WebSearch (Astro Fonts API / astro-icon) — corroborated by the primary docs above.

### Tertiary (LOW confidence)
- A2 (leading-underscore page route behavior) — reasoned, flagged for build-time verification.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — versions verified against installed packages + npm.
- Tailwind v4 `@theme` token→utility mechanism: HIGH — matches installed 4.3.0 model + PITFALLS.md.
- Astro Fonts API (self-host, CSP, CLS): HIGH — confirmed stable in 6.x via official docs + release blog.
- astro-icon local SVG: HIGH — official docs + repo + npm provenance.
- Sitemap `filter`: HIGH — verbatim from docs.
- Contrast ratios: MEDIUM — planner must compute the 5 pairings (A11Y-04); only accent-on-bg cited by Jon.
- Package legitimacy: MEDIUM — slopcheck unavailable; provenance independently verified strong.

**Research date:** 2026-05-26
**Valid until:** ~2026-06-25 (Astro/Tailwind are fast-moving; re-verify Fonts API + astro-icon if planning slips a month).
