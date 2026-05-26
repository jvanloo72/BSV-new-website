# Phase 2: Design System & Visual Identity - Pattern Map

**Mapped:** 2026-05-26
**Files analyzed:** 24 (10 NEW components/pages, 5 NEW assets, 7 NEW tests, ~5 MODIFY config/chrome/style)
**Analogs found:** 21 / 24 (3 have no in-repo analog — hand-authored SVG art + fonts config)

---

## Critical Cross-Cutting Convention (READ FIRST)

**Phase 1 components reference tokens via the arbitrary-value bracket form, NOT the namespace-mapped utility.**

Every Phase 1 component writes color like this:

```astro
class="border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]"
class="text-[color:var(--color-text)]"
class="text-[color:var(--color-text-muted)]"
```

But the UI-SPEC.md component skeletons (and RESEARCH.md Pattern 1) prescribe the **Tailwind v4 namespace-mapped utility** form:

```astro
class="bg-bg-elevated text-accent shadow-card text-h1 p-section border-border"
```

**This is a genuine divergence the planner MUST resolve explicitly.** Both forms read the same `@theme` token (so both keep working after the value swap), but they are different syntaxes:
- Phase 1 chrome: `text-[color:var(--color-text-muted)]` (arbitrary value)
- Phase 2 UI-SPEC: `text-text-muted` (namespace utility — requires the token live under the `--color-*` namespace, which it does)

**Recommended resolution (matches UI-SPEC + RESEARCH):** New Phase 2 components use the **namespace-mapped utilities** (`bg-bg-elevated`, `text-accent`, `text-h1`, `shadow-card`, `p-section`). UI-SPEC §258 explicitly directs refactoring the Phase 1 inline `border-[color:var(...)]` in SiteHeader/SiteFooter to the token utilities (`border-border bg-bg`). So Phase 2 standardizes on the cleaner namespace form AND retrofits the two chrome files to match. The planner should state this as a decision so the verifier does not flag the new components for "not matching Phase 1 syntax" — they intentionally use the better v4 form.

**Never hardcode hex** (`bg-[#9A3F1A]`) — contract violation per D-22 / UI-SPEC §320. The token names are frozen; only `global.css` values change.

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/styles/global.css` (MODIFY) | style | build-time tokens | itself (Phase 1 placeholder `@theme`) | exact (self) |
| `astro.config.mjs` (MODIFY) | config | build config | itself (Phase 1) | exact (self) |
| `package.json` (MODIFY) | config | dependency manifest | itself (Phase 1) | exact (self) |
| `src/layouts/BaseLayout.astro` (MODIFY) | layout | static render | itself (Phase 1) | exact (self) |
| `src/components/chrome/SiteHeader.astro` (MODIFY) | component (chrome) | static render | itself (Phase 1) | exact (self) |
| `src/components/chrome/SiteFooter.astro` (MODIFY) | component (chrome) | static render | itself (Phase 1) | exact (self) |
| `src/components/ui/Button.astro` (NEW) | component (primitive) | static render | `SiteHeader.astro` (Props + nav `<a>` styling) | role-match |
| `src/components/ui/TextLink.astro` (NEW) | component (primitive) | static render | `SiteHeader.astro` nav link | role-match |
| `src/components/ui/Eyebrow.astro` (NEW) | component (primitive) | static render | `Disclaimer.astro` (small typed wrapper) | role-match |
| `src/components/sections/Hero.astro` (NEW) | component (section) | static render | `SeoHead.astro` Props + `index.astro` markup | role-match |
| `src/components/sections/PracticeAreaCard.astro` (NEW) | component (section) | static render | `Disclaimer.astro` (Props + token-styled wrapper) | role-match |
| `src/components/sections/AttorneyCard.astro` (NEW) | component (section) | static render + `<Image>` | `Disclaimer.astro` + content schema `image()` | role-match |
| `src/components/sections/TestimonialQuote.astro` (NEW) | component (section) | static render | `Disclaimer.astro` (`<aside>`/`role` semantics) | role-match |
| `src/components/sections/DealsGrid.astro` (NEW) | component (section) | static render (array prop) | `SiteHeader.astro` (`navLinks.map(...)` list render) | role-match |
| `src/components/sections/FeeStructureBand.astro` (NEW) | component (section) | static render | `SiteFooter.astro` (banded surface on elevated bg) | role-match |
| `src/components/sections/CtaBlock.astro` (NEW) | component (section) | static render | `index.astro` centered section + Button | role-match |
| `src/components/sections/FaqAccordion.astro` (NEW) | component (section) | static render (`<details>`, array prop) | `SiteHeader.astro` (`.map()` over items) | partial |
| `src/pages/_design.astro` (NEW) | page | static render | `src/pages/index.astro` | exact |
| `src/styles/global.css` reduced-motion guard (in MODIFY) | style | build-time CSS | `global.css` `@layer base` block | exact (self) |
| `src/assets/illustrations/hero-deal-flow.svg` (NEW) | asset (SVG) | static inline | `public/headshots/placeholder.svg` (only existing SVG) | partial |
| `src/icons/practice-*.svg` ×3 (NEW) | asset (SVG) | astro-icon inline | none | no analog |
| `src/icons/mark.svg` + `public/favicon.svg` (MODIFY favicon) | asset (SVG) | static | existing `public/favicon.svg` | partial |
| `src/assets/fonts/HankenGrotesk-*.woff2` (NEW) | asset (font) | build-time self-host | none | no analog |
| `tests/design-tokens.spec.ts` (NEW) | test | filesystem/dist grep | `tests/baselayout.spec.ts` | exact |
| `tests/fonts-selfhost.spec.ts` (NEW) | test | dist grep | `tests/jsonld-legalservice.spec.ts` | exact |
| `tests/gallery.spec.ts` (NEW) | test | dist HTML + cheerio | `tests/disclaimer-crawl.spec.ts` | exact |
| `tests/assets-budget.spec.ts` (NEW) | test | filesystem stat | `tests/disclaimer-set.spec.ts` | exact |
| `tests/contrast.spec.ts` (NEW) | test | pure computation | `tests/disclaimer-set.spec.ts` | role-match |
| `tests/a11y-interactions.spec.ts` (NEW) | test | dist HTML + cheerio | `tests/disclaimer-crawl.spec.ts` | role-match |
| `tests/design-route-hidden.spec.ts` (NEW) | test | dist sitemap + HTML grep | `tests/disclaimer-crawl.spec.ts` | exact |

---

## Pattern Assignments

### `src/styles/global.css` (style, MODIFY)

**Analog:** itself — rewrite values, keep names + structure (D-22).

**Keep this exact two-block structure** (lines 1-38 today): `@import "tailwindcss";` → `@theme {...}` → `@layer base {...}`. The `@layer base` block (lines 23-38) reads `var(--color-border)`, `var(--color-bg)`, `var(--color-text)`, `var(--font-sans)` — **leave it intact**; the value swap flows through it automatically (the whole point of D-22).

**Current `@theme` block to rewrite (lines 7-17)** — swap values, ADD type/spacing/shadow/radius tokens per UI-SPEC:
```css
@theme {
  --color-text: var(--color-zinc-900);      /* → #111111 */
  --color-text-muted: var(--color-zinc-600); /* → #52524E */
  --color-bg: #ffffff;                        /* → #F8F5F0 */
  --color-bg-elevated: var(--color-zinc-50);  /* → #FDFCFA */
  --color-border: var(--color-zinc-200);      /* → #D9D2C5 */
  --color-accent: var(--color-zinc-900);      /* → #9A3F1A */
  --color-accent-fg: #ffffff;                 /* → #F8F5F0 */
  --font-sans: ui-sans-serif, system-ui, ...; /* prepend var(--font-hanken) */
}
```
New tokens to ADD (values locked in UI-SPEC §Typography/§Spacing/§Radius&Shadow): `--text-display/-h1/-h2/-h3/-body-lg/-body/-small`, `--spacing-section`, `--spacing-gutter`, `--radius-card`, `--radius-button`, `--shadow-card`, `--shadow-card-hover`.

**Reduced-motion guard to ADD** (new `@media` block; RESEARCH §"prefers-reduced-motion") — append after `@layer base`, mirroring the existing comment style:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation: none !important; transition: none !important; scroll-behavior: auto !important;
  }
}
```

---

### `astro.config.mjs` (config, MODIFY)

**Analog:** itself (lines 1-23).

**Current structure to extend:**
```js
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://bsvlaw.com',
  trailingSlash: 'never',
  integrations: [mdx(), sitemap()],          // ← add icon(); add filter to sitemap()
  adapter: vercel({ webAnalytics: { enabled: false } }),
  vite: { plugins: [tailwindcss()] },
});
```

**Three changes** (all per RESEARCH Pattern 2/3 + §Sitemap exclusion):
1. Change import to `import { defineConfig, fontProviders } from 'astro/config';` and add `import icon from 'astro-icon';`.
2. Add top-level `fonts: [{ provider: fontProviders.local(), name: 'Hanken Grotesk', cssVariable: '--font-hanken', fallbacks: ['sans-serif'], options: { variants: [...] } }]` (RESEARCH Pattern 2 has the exact block; weights 400/500/700/800 per UI-SPEC).
3. `integrations: [mdx(), sitemap({ filter: (page) => page !== 'https://bsvlaw.com/_design' }), icon()]`.

---

### `package.json` (config, MODIFY)

**Analog:** itself (lines 24-37).

Add to `dependencies` (alphabetical, matching existing `^`-caret style): `"astro-icon": "^1.1.5"` and `"sharp": "^0.34.5"` (pin sharp per RESEARCH Pitfall 7). Existing entries use caret ranges (`"astro": "^6.3.7"`); follow that convention. Consider adding a `test:` script per new spec following the existing pattern (lines 15-19: `"test:baselayout": "playwright test tests/baselayout.spec.ts"`).

---

### `src/layouts/BaseLayout.astro` (layout, MODIFY)

**Analog:** itself (lines 1-49).

**Props interface to extend (lines 10-15)** — add the `noindex?` prop (resolves RESEARCH Open Question 1 / UI-SPEC §284):
```astro
interface Props {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  noindex?: boolean;   // NEW — /_design passes true to force noindex even in PROD
}
```

**Robots logic to change (lines 23, 31)** — fold `noindex` into the existing `isPreview` decision so there is ONE `<meta name="robots">` (avoids two conflicting tags):
```astro
const { title, description, canonical, ogImage, noindex = false } = Astro.props;
const isPreview = !import.meta.env.PROD;
const robots = (isPreview || noindex) ? 'noindex, nofollow' : 'index, follow';
...
<meta name="robots" content={robots} />
```

**Font wiring to ADD in `<head>`** (RESEARCH Pattern 2) — add the import in frontmatter (`import { Font } from 'astro:assets';`) and one line in `<head>` (near line 35): `<Font cssVariable="--font-hanken" preload />`.

**Keep** the existing `<slot name="head" />` (line 39), `SkipToContent`/`SiteHeader`/`SiteFooter` mount order (lines 42-47), and `JsonLd`/`SeoHead` wiring untouched.

---

### `src/components/chrome/SiteHeader.astro` (component, MODIFY)

**Analog:** itself (lines 1-47).

**Frontmatter Props + data pattern to keep** (lines 1-15): the `interface Props { currentPath?: string }` + `navLinks` array + `.map()` render is the established list-render idiom — reuse it.

**Token-syntax refactor (per UI-SPEC §258):** change the Phase 1 arbitrary-value classes to namespace utilities:
- `border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)]` → `border-b border-border bg-bg`
- `text-[color:var(--color-text)]` → `text-text`; `text-[color:var(--color-text-muted)]` → `text-text-muted`

**Visual upgrades to add:** replace the plain text firm name (lines 20-25) with the typographic wordmark + `<Icon name="mark" />` at compact sizes; nav link active-state keeps `aria-current` (line 38 — already correct, do not regress); add the animated accent underline (UI-SPEC §Motion: `after:` pseudo, `motion-safe:after:transition-[width]`) and `focus-visible:ring-2 focus-visible:ring-accent`.

---

### `src/components/chrome/SiteFooter.astro` (component, MODIFY)

**Analog:** itself (lines 1-25).

**CRITICAL — do not regress the Disclaimer** (line 10): `<Disclaimer id="footer" />` MUST keep rendering (LEGAL-01; the disclaimer-crawl test asserts it on every route). Keep the `import Disclaimer` (line 2) and `import { SITE }` (line 3) pattern.

**Token refactor:** `border-t border-[color:var(--color-border)] bg-[color:var(--color-bg-elevated)]` → `border-t border-border bg-bg-elevated`; muted text class likewise.

**Visual upgrades:** add the `mark.svg`; keep both office strings (line 13) and the `SITE.email` intake link (lines 16-19). Container is `mx-auto max-w-6xl px-6` (line 9) — keep this width so chrome aligns with content (`max-w-6xl` is the locked content width per UI-SPEC §148).

---

### `src/components/ui/Button.astro` (primitive, NEW)

**Analog:** `src/components/chrome/SiteHeader.astro` (Props interface + conditional `class:list` styling) + `src/components/legal/Disclaimer.astro` (typed Props pattern).

**Pattern to follow** — typed Props, polymorphic `<a>`/`<button>` (UI-SPEC §191):
```astro
---
interface Props {
  variant?: 'primary' | 'secondary';
  href?: string;
  label: string;   // or use <slot/>
}
const { variant = 'primary', href, label } = Astro.props;
---
```
Use `class:list={[...]}` exactly as SiteHeader does (lines 32-37) to switch variant classes. Primary = `bg-accent text-accent-fg`, secondary = `border border-text text-text bg-transparent`, both `rounded-button`, min 44px hit area via padding, `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2`. Render `<a href>` when `href` present, else `<button>`.

---

### `src/components/ui/TextLink.astro` (primitive, NEW)

**Analog:** `SiteHeader.astro` nav link (lines 28-42) — the animated-underline + token-color link idiom.

`text-accent`, always-visible base underline + `motion-safe:` grow (UI-SPEC §Motion "Animated link underline"), `focus-visible` ring. Props: `{ href: string }` + `<slot/>`.

---

### `src/components/ui/Eyebrow.astro` (primitive, NEW)

**Analog:** `Disclaimer.astro` (lines 19-23) — a tiny semantic wrapper with one styled element + `<slot/>`.

`--text-small` → `text-small uppercase text-text-muted tracking-wide`. Minimal: `<p class="..."><slot/></p>`.

---

### `src/components/sections/Hero.astro` (section, NEW)  `data-component="Hero"`

**Analog:** `src/pages/index.astro` (centered section markup, lines 9-16) + `SeoHead.astro` (multi-field Props with optionals).

**Props pattern** (UI-SPEC §197): `interface Props { headline: string; subhead?: string; ctaLabel: string; ctaHref: string; secondaryLabel?: string; secondaryHref?: string; }` — copy the optional-field `??`/conditional-render style from SeoHead (lines 17-22, 26).

Heading uses `text-display font-extrabold` (the only `--text-display` usage). Hero SVG inlined (NOT astro-icon — it's a one-off illustration; import the SVG directly) with `aria-hidden="true"`. Add `data-component="Hero"` on the section root (gallery test marker, UI-SPEC §186). Compose the new `Button` primitive for CTAs.

---

### `src/components/sections/PracticeAreaCard.astro` (section, NEW)  `data-component="PracticeAreaCard"`

**Analog:** `Disclaimer.astro` (Props + single token-styled wrapper) + RESEARCH §"Token-only component" skeleton (verbatim usable).

**Pattern** (RESEARCH Code Examples, exact):
```astro
---
import { Icon } from 'astro-icon/components';
interface Props { title: string; blurb: string; icon: string; href: string; }
const { title, blurb, icon, href } = Astro.props;
---
<a href={href} data-component="PracticeAreaCard"
   class="group block rounded-card bg-bg-elevated p-8 shadow-card border border-border
          transition-transform duration-200 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-card-hover">
  <Icon name={icon} class="size-10 text-accent" aria-hidden="true" />
  <h3 class="mt-4 text-h3 font-bold text-text">{title}</h3>
  <p class="mt-2 text-body text-text-muted">{blurb}</p>
</a>
```
Import idiom: `import { Icon } from 'astro-icon/components';` (RESEARCH Pattern 3).

---

### `src/components/sections/AttorneyCard.astro` (section, NEW)  `data-component="AttorneyCard"`

**Analog:** `PracticeAreaCard` (above, same floating-card shell) + `content.config.ts` `image()` usage (lines 34, 56) for the `<Image>` headshot.

Same card shell + `<Image src={photo} ... />` from `astro:assets` with explicit width/height (no CLS). **Placeholder headshots must live under `src/assets/`** (not `/public`) so `<Image>` processes them (RESEARCH Pitfall 7 / DECISIONS note). Props: `{ name, role, focus, photo, href, alt }`. Descriptive `alt` (A11Y-02). Never include "Fishbien" (ATTY-11).

---

### `src/components/sections/TestimonialQuote.astro` (section, NEW)  `data-component="TestimonialQuote"`

**Analog:** `Disclaimer.astro` (lines 21-23) — semantic element (`<aside role="note">`) + token text. Here use `<blockquote>` + `<cite>` (UI-SPEC §223 for A11Y-02 semantics).

Props: `{ quote, attribution, attributionDetail, disclosure? }`. `--text-body-lg`/`--text-h3` weight 500 on `bg`; small accent open-quote glyph; `text-text-muted` attribution. `max-w-3xl mx-auto` measure (UI-SPEC §224).

---

### `src/components/sections/DealsGrid.astro` (section, NEW)  `data-component="DealsGrid"`

**Analog:** `SiteHeader.astro` `navLinks.map(...)` (lines 27-44) — the array-prop → `.map()` grid-cell render.

Props: `{ deals: { title; amount?; context? }[]; heading? }`. Map over `deals` rendering floating cells (`bg-bg-elevated rounded-card shadow-card`). Responsive grid `gap-2xl` (use spacing-step utilities). Same `.map()` + optional-field conditional style as SiteHeader.

---

### `src/components/sections/FeeStructureBand.astro` (section, NEW)  `data-component="FeeStructureBand"`

**Analog:** `SiteFooter.astro` (lines 8-9) — a banded full-width surface on `bg-bg-elevated` with constrained inner container.

Props: `{ heading, body, note? }`. Reuse the footer's `mx-auto max-w-6xl px-6` inner container idiom. Small accent leading marker. Static, no hover.

---

### `src/components/sections/CtaBlock.astro` (section, NEW)  `data-component="CtaBlock"`

**Analog:** `index.astro` centered section (lines 9-16) + new `Button` primitive.

Props: `{ heading, body?, ctaLabel, ctaHref }`. Centered `max-w-3xl py-section`. Compose `Button` (primary). `data-component="CtaBlock"`.

---

### `src/components/sections/FaqAccordion.astro` (section, NEW)  `data-component="FaqAccordion"`

**Analog:** `SiteHeader.astro` `.map()` idiom (lines 27-44) for iterating `items` — but render native `<details>/<summary>` (RESEARCH Pattern 4, **zero JS**).

Props: `{ items: { q: string; a: string }[]; heading? }`. Each item = `<details>` panel (`bg-bg-elevated rounded-card border border-border`), `<summary>` = question (H3-weight) + accent chevron rotating `motion-safe:`. NO `client:*` directive (UI-SPEC §319 — a `client:` directive is a regression). `<summary>` padded to ≥44px, `focus-visible` ring.

---

### `src/pages/_design.astro` (page, NEW)

**Analog:** `src/pages/index.astro` (exact — page wrapping BaseLayout).

**Pattern** (index.astro lines 1-8 + RESEARCH §"/_design page robots"):
```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/sections/Hero.astro';
// ...import all 8 section components...
---
<BaseLayout title="Design System (internal)" description="Internal component gallery" noindex>
  <!-- render all 8 components with FIRM_BRIEF placeholder content (UI-SPEC §Component Inventory) -->
</BaseLayout>
```
Pass `noindex` (the new BaseLayout prop) — do NOT add a slotted `<meta robots>` (the BaseLayout prop is the clean single-tag path). Verify at first build that `src/pages/_design.astro` emits route `/_design` (RESEARCH Assumption A2 — flagged for build verification).

---

## Asset Files (SVG + fonts)

### Hero + icons + mark (NEW SVG)

**No code analog** — hand-authored per D-15. The only existing SVG is `public/headshots/placeholder.svg` (partial reference for SVG file shape only). Author per UI-SPEC §Creative Art Contract: `viewBox="0 0 48 48"`, `fill="none" stroke="currentColor" stroke-width≈1.25 stroke-linecap/linejoin="round"` for the 4 marks; hero in `src/assets/illustrations/hero-deal-flow.svg`. All use `currentColor` (no hardcoded hex — RESEARCH Pattern 5) so `text-accent` themes them. `aria-hidden="true"` when decorative (RESEARCH Pitfall 6). Practice icons → `src/icons/` (astro-icon default dir, resolves by filename). An existing `public/favicon.svg` is present — the new `mark.svg` informs an updated favicon.

### Hanken Grotesk woff2 (NEW)

**No analog.** Acquisition task (RESEARCH §Environment Availability): obtain genuine Hanken Grotesk woff2 (weights 400/500/700/800, or one variable file ≤~100 KB) → commit to `src/assets/fonts/`. Self-hosted only — **never** a Google Fonts CDN link (D-07 / CSP `font-src 'self'`). Likely a `checkpoint:human-action` in the plan.

---

## Test Files (Wave 0)

All 7 tests follow ONE of two established Phase 1 test idioms. **Both build first via `execSync('npm run build')` in `beforeAll`** and **read `dist/client/` from disk** (NOT `astro preview` — the Vercel adapter breaks preview; see disclaimer-crawl.spec.ts header comment lines 8-13 + playwright.config.ts lines 5-13).

### Idiom A — dist HTML + Cheerio (analog: `tests/disclaimer-crawl.spec.ts` / `tests/jsonld-legalservice.spec.ts`)

Import block to copy verbatim:
```ts
import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as cheerio from 'cheerio';

test.beforeAll(() => { execSync('npm run build', { stdio: 'pipe' }); });
```
Then `const html = fs.readFileSync('dist/client/<path>.html', 'utf-8'); const $ = cheerio.load(html);` and assert with `$('selector')`. The disclaimer-crawl `readSitemapUrls()`/`urlToFilePath()` helpers (lines 36-102) are reusable for any sitemap-walking test.

- **`tests/gallery.spec.ts`** (DESIGN-04/06): read `dist/client/_design/index.html`, assert ≥1 `[data-component="X"]` for each of the 8 component names (presence, NOT exactly-one — the gallery renders ≥3 PracticeAreaCards and ≥5 AttorneyCards) + count ≥3 inline `<svg>` for icons. Analog: disclaimer-crawl (cheerio over a built page).
- **`tests/a11y-interactions.spec.ts`** (D-10/A11Y): cheerio-assert `<details>` present, `motion-safe:`/`motion-reduce:` classes present, `focus-visible:ring` present. Analog: disclaimer-crawl.
- **`tests/design-route-hidden.spec.ts`** (D-16): grep `dist/client/sitemap-0.xml` for `_design` (must be ZERO — reuse disclaimer-crawl's sitemap-read), grep `_design/index.html` for `noindex` (must be PRESENT). Analog: disclaimer-crawl (exact — same sitemap+HTML disk reads).
- **`tests/fonts-selfhost.spec.ts`** (DESIGN-03): build, then grep across `dist/` for `fonts.googleapis`/`fonts.gstatic` (must be ZERO) and assert `font-display` + `@font-face` in compiled CSS. Analog: jsonld-legalservice (build + dist file read + assertion).
- **`tests/design-tokens.spec.ts`** (DESIGN-02): build, grep compiled `dist/_astro/*.css` for `#9a3f1a` / `#f8f5f0`. Analog: jsonld-legalservice (build + dist grep).

### Idiom B — filesystem / pure-computation (analog: `tests/disclaimer-set.spec.ts`)

Import block (no build needed for pure-source/computation tests):
```ts
import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
```
Then read source files / `fs.statSync` for sizes / compute in-test.

- **`tests/assets-budget.spec.ts`** (DESIGN-05/06, PERF-02): `fs.statSync` over `src/assets/`, `src/icons/`, `public/` image+font assets; assert each `≤ 204800` bytes and SVGs parse. Analog: disclaimer-set (filesystem read + per-entry assertions loop, lines 28-34).
- **`tests/contrast.spec.ts`** (A11Y-04): pure WCAG relative-luminance math on the 5 locked hex pairings (values + expected ratios already computed in UI-SPEC §"WCAG contrast"); assert each ≥ 4.5:1. Analog: disclaimer-set (no build, pure assertions over a known data set).

**Naming + comment convention:** every Phase 1 test opens with a `// tests/<name>.spec.ts` header comment block explaining what it covers and which decision IDs (e.g. disclaimer-crawl lines 1-17). Match this. Also add a matching `"test:<name>": "playwright test tests/<name>.spec.ts"` script in package.json (existing pattern, package.json lines 15-19).

---

## Shared Patterns

### Token referencing (applies to ALL new + modified components)
**Source:** `src/styles/global.css` `@theme` (the single source of truth) + RESEARCH Pattern 1.
**Apply to:** every component. Use namespace-mapped utilities — `bg-bg`, `bg-bg-elevated`, `text-text`, `text-text-muted`, `text-accent`, `text-accent-fg`, `border-border`, `shadow-card`, `shadow-card-hover`, `rounded-card`, `rounded-button`, `text-display`/`-h1`/`-h2`/`-h3`/`-body-lg`/`-body`/`-small`, `p-section`/`py-section`/`gap-section`, `px-gutter`. **Never** hardcode hex. Phase 1's `text-[color:var(--color-*)]` arbitrary form is the legacy syntax — Phase 2 standardizes on the namespace form and retrofits SiteHeader/SiteFooter (see "Critical Cross-Cutting Convention" at top).

### Component frontmatter / Props convention
**Source:** `Disclaimer.astro` (lines 1-18), `SeoHead.astro` (lines 10-22), `SiteHeader.astro` (lines 1-15).
**Apply to:** every new component. The idiom: `interface Props { ... }` with `?` for optionals, then `const { ...defaults } = Astro.props;`, then the template. Optional fields render conditionally (`{canonical && <link.../>}`, SeoHead line 26) or default in the destructure (`currentPath = '/'`, SiteHeader line 6).

### List/array render
**Source:** `SiteHeader.astro` lines 27-44 — `{ items.map((item) => (<li>...</li>)) }` with `class:list={[...]}` for conditional classes.
**Apply to:** DealsGrid, FaqAccordion, PracticeAreaCard grids on `/_design`.

### Motion gating
**Source:** RESEARCH §"prefers-reduced-motion" + UI-SPEC §Motion. **Apply to:** every interactive component. Use Tailwind `motion-safe:` variants on utilities AND the global `@media (prefers-reduced-motion: reduce)` backstop in `global.css`. Focus rings are NOT motion-gated (must always show).

### Disclaimer composition (do-not-regress)
**Source:** `SiteFooter.astro` line 10 (`<Disclaimer id="footer" />`) + `Disclaimer.astro`.
**Apply to:** SiteFooter refinement MUST keep rendering the footer disclaimer (LEGAL-01; disclaimer-crawl test enforces on every route). New TestimonialQuote has an optional `disclosure?` slot for later `<Disclaimer>` use (LEGAL-06).

### Test scaffolding
**Source:** `disclaimer-crawl.spec.ts` (build-in-beforeAll + dist-disk-read + cheerio) and `disclaimer-set.spec.ts` (filesystem + pure assertions). **Apply to:** all 7 Wave-0 tests. NEVER use `astro preview` (Vercel-adapter incompatibility — playwright.config.ts gates `webServer` behind `PLAYWRIGHT_NEEDS_SERVER`, default off).

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/icons/practice-*.svg` ×3 | asset (SVG icon) | astro-icon inline | No existing custom line-icon set; hand-authored per D-15. Use UI-SPEC §Creative Art viewBox/stroke spec. |
| `src/assets/fonts/HankenGrotesk-*.woff2` | asset (font) | self-hosted | No font ever committed; acquisition + Astro Fonts API config is greenfield. |
| `astro.config.mjs` `fonts:[...]` block | config | build | No prior `fonts` config in the repo; new top-level key (RESEARCH Pattern 2 supplies the exact block). |

(Hero SVG + `mark.svg` have a weak partial analog only in `public/headshots/placeholder.svg` / `public/favicon.svg` — SVG file shape, not visual pattern.)

---

## Metadata

**Analog search scope:** `src/components/{chrome,legal,seo}/`, `src/layouts/`, `src/pages/`, `src/styles/`, `src/lib/`, `src/content.config.ts`, `tests/`, `astro.config.mjs`, `package.json`, `playwright.config.ts`, `public/`.
**Files scanned:** 18 source/config/test files read in full.
**Pattern extraction date:** 2026-05-26
