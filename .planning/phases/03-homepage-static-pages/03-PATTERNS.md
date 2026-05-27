# Phase 3: Homepage & Static Pages - Pattern Map

**Mapped:** 2026-05-26
**Files analyzed:** 7 modify + up to 2 new (small section components)
**Analogs found:** 9 / 9 (every target has a strong in-repo analog)

This phase **composes the already-built Phase 2 component library into real pages**. It invents no new visual design. The dominant analog for the homepage is `src/pages/design-system.astro`, which already contains the full composition with real FIRM_BRIEF placeholder copy. Most "work" is moving that composition onto `/`, dropping two sections, inserting two small new ones, and rewriting the placeholder pages to use Phase 2 namespace tokens.

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/pages/index.astro` (modify) | page (composition) | request-response (static) | `src/pages/design-system.astro` | exact (composition source of truth) |
| `src/pages/about.astro` (modify) | page (content) | request-response (static) | `src/pages/design-system.astro` (page shell) + `SiteFooter.astro` (office loop) | role-match + exact for office block |
| `src/pages/attorneys/index.astro` (modify) | page (index) | CRUD-read (getCollection) | itself (already correct shape) + `design-system.astro` AttorneyCard loop | exact |
| `src/pages/practice-areas/index.astro` (modify) | page (index) | CRUD-read (getCollection) | itself + `design-system.astro` PracticeAreaCard loop | exact |
| `src/pages/blog/index.astro` (modify) | page (index, empty-state) | CRUD-read (getCollection) | itself (already has empty-state branch) | exact |
| `src/pages/404.astro` (modify) | page (error) | request-response (static) | existing `404.astro` + `CtaBlock`/`Button` for path-back | role-match |
| `src/pages/500.astro` (modify) | page (error) | request-response (static) | existing `500.astro` (already pulls SITE.email) | role-match |
| `src/components/sections/ApproachBand.astro` (NEW, planner's call) | component (section) | static | `FeeStructureBand.astro` (banded 3-point layout) | role-match (closest small banded section) |
| `src/components/sections/ChambersStrip.astro` (NEW, planner's call) | component (section) | static | `TestimonialQuote.astro` (centered single-statement strip) / `FeeStructureBand.astro` | role-match |

## Pattern Assignments

### `src/pages/index.astro` (page, static composition)

**Analog:** `src/pages/design-system.astro` — copy its composition wholesale, then (1) drop `FeeStructureBand` + `FaqAccordion`, (2) reorder per CONTEXT D-01, (3) insert `ApproachBand` after Hero and `ChambersStrip` before `CtaBlock`, (4) drop `noindex` and the gallery-only intro `<header>`/primitives/chrome demo sections.

**Final section order (CONTEXT D-01):**
`Hero -> ApproachBand -> PracticeAreaCard x3 -> DealsGrid -> AttorneyCard x5 -> TestimonialQuote -> ChambersStrip -> CtaBlock`

> NOTE: the gallery currently renders `TestimonialQuote` BEFORE `DealsGrid`. D-01 inverts this (`DealsGrid` then `AttorneyCard` then `TestimonialQuote`). Do not copy the gallery's order verbatim — follow D-01.

**Imports + data block** (`design-system.astro` lines 10-95): copy the BaseLayout + section imports, the 5 headshot `import` statements, and the `attorneys` / `deals` consts verbatim. Drop `FeeStructureBand`, `FaqAccordion`, and `faqs`.

```typescript
import BaseLayout from '../layouts/BaseLayout.astro';
import Hero from '../components/sections/Hero.astro';
import PracticeAreaCard from '../components/sections/PracticeAreaCard.astro';
import AttorneyCard from '../components/sections/AttorneyCard.astro';
import TestimonialQuote from '../components/sections/TestimonialQuote.astro';
import DealsGrid from '../components/sections/DealsGrid.astro';
import CtaBlock from '../components/sections/CtaBlock.astro';
import photoBelcher from '../assets/headshots/placeholder-belcher.svg';
// ...remaining 4 headshots
```

**Hero composition** (`design-system.astro` lines 137-145) — copy exactly:
```astro
<Hero
  eyebrow="Belcher, Smolen & Van Loo LLP"
  headline="Team work to get good results."
  subhead="A boutique M&A, technology, and tax practice for the companies building what's next — partner-led, fast-moving, and built around your transaction."
  ctaLabel="Start a conversation"
  ctaHref="/contact"
  secondaryLabel="See our work"
  secondaryHref="/practice-areas"
/>
```

**Practice teaser grid** (`design-system.astro` lines 148-172) — the section wrapper + 3 `PracticeAreaCard` with `icon`/`title`/`blurb`/`href`. The hrefs already point to the locked slugs (`/practice-areas/mergers-acquisitions`, etc.). Copy verbatim.

**Attorney grid** (`design-system.astro` lines 175-192) — section wrapper + `attorneys.map(...)`. Copy verbatim. Note `AttorneyCard` is rendered with NO `href` here (cards are non-linking in Phase 3 until Phase 4 detail routes exist — consistent with CONTEXT "Claude's Discretion" on cross-linking).

**DealsGrid + TestimonialQuote** (`design-system.astro` lines 195-202) — copy both, but place `DealsGrid` BEFORE `TestimonialQuote` per D-01:
```astro
<DealsGrid heading="Representative work" deals={deals} />
<TestimonialQuote
  quote="BSV was my rock throughout the $6 billion merger between Athelas and Commure."
  attribution="Daniel Brian"
  attributionDetail="GC, Commure, Inc."
/>
```

**CtaBlock** (`design-system.astro` lines 212-217) — copy verbatim (final section).

**BaseLayout wrapper** — use the *public* form (no `noindex`), with real homepage SEO. Pull title/description from the existing `index.astro` placeholder (lines 6-7):
```astro
<BaseLayout
  title="Belcher, Smolen & Van Loo LLP"
  description="A boutique California law firm focused on Mergers & Acquisitions, Intellectual Property & Technology Transactions, and Tax for the technology, life sciences, cryptocurrency, FinTech, and AI industries."
>
```

---

### `src/pages/about.astro` (page, content)

**Analog (page shell):** the section-wrapper + container pattern from `design-system.astro` lines 103, 148-149. **Analog (office block):** `SiteFooter.astro` lines 21-30 + 51-53 — mirror this exactly so the TBD-omission behavior is identical.

**Container pattern** (used site-wide — `design-system.astro` line 103, every section component):
```astro
<div class="mx-auto max-w-6xl px-gutter py-section">
```
For prose-width content blocks use `max-w-3xl` (as `TestimonialQuote`/`CtaBlock` do). About should mix a `max-w-3xl` reading column for the StoryBrand narrative with the `max-w-6xl` container for the offices/CTA.

**Office rendering — copy the SiteFooter derivation (lines 21-30) verbatim**, then render with the loop at lines 51-53. This is the single source of truth and produces "Silicon Valley, CA" (TBD street omitted) vs. the full SF address (CONTEXT D-07):
```typescript
import { SITE } from '../lib/site';
const officeLines = SITE.offices.map((o) => {
  const segs: string[] = [];
  if (o.streetAddress && o.streetAddress !== 'TBD') segs.push(o.streetAddress);
  segs.push(o.addressLocality);
  const region = [o.addressRegion, o.postalCode && o.postalCode !== 'TBD' ? o.postalCode : null]
    .filter(Boolean)
    .join(' ');
  if (region) segs.push(region);
  return segs.join(', ');
});
```
```astro
<address class="not-italic space-y-0.5">
  {officeLines.map((line) => <span class="block">{line}</span>)}
</address>
```
> Planner consideration: this derivation now lives in two places (footer + About). A small `formatOffice(o)` helper in `src/lib/site.ts` would DRY it — planner's call, but at minimum copy the logic exactly so behavior matches. No third-party map embed (D-07).

**Closing CTA** — reuse `CtaBlock` (same as homepage) pointing to `/contact`, plus `TextLink` (see Shared Patterns) onward links to `/attorneys` and `/practice-areas` (StoryBrand loop close, D-07).

**Typography tokens** — headings use `text-h1`/`text-h2`/`text-h3 font-bold text-text`; body uses `text-body`/`text-body-lg text-text-muted`; kicker via `<Eyebrow>`. See `design-system.astro` header lines 104-111 for the exact heading+body pattern. Do NOT use the old `text-3xl ... text-[color:var(--color-text)]` form the current placeholder uses.

**Content constraint (D-06):** verifiable facts only — no invented founding year or origin narrative. Substance from FIRM_BRIEF.md.

---

### `src/pages/attorneys/index.astro` (page, index, CRUD-read)

**Analog:** itself — the file already has the correct `getCollection` + empty-state + map structure. The Phase 3 work is (1) **token retrofit** (replace `text-3xl ... text-[color:var(--color-text)]` with `text-h1 font-bold text-text`, etc.), and (2) optionally render real `AttorneyCard`s instead of a bare `<ul>` so the preview "looks real" (CONTEXT Claude's-Discretion: "render the available cards so the preview looks real").

**Current correct collection-read pattern** (lines 1-6, keep):
```typescript
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
const attorneys = await getCollection('attorneys', ({ data }) => !data.draft);
```
**Card-render upgrade option:** map to `AttorneyCard` (see its prop shape below) using the same `attorneys` curated data the homepage uses, OR map the collection entries. Note: collections currently hold only placeholder MDX (CONTEXT line 124) — planner decides curated-data vs. collection. The empty-state branch (lines 14-17) is already the right pattern; keep a graceful branded fallback.

**Links** resolve to `/attorneys/[slug]` (Phase 4 detail routes). Acceptable to be interim-dead per CONTEXT cross-linking note.

---

### `src/pages/practice-areas/index.astro` (page, index, CRUD-read)

**Analog:** itself + the homepage practice teaser grid (`design-system.astro` lines 148-172). Same treatment as attorneys index: keep the `getCollection('practiceAreas', ...)` + empty-state structure (lines 1-6, 14-17), retrofit tokens, and optionally render real `PracticeAreaCard`s in the `grid gap-8 sm:grid-cols-2 lg:grid-cols-3` layout for a real-looking preview. Links to `/practice-areas/[slug]` (locked slugs in URL-CONVENTIONS.md).

---

### `src/pages/blog/index.astro` (page, index, empty-state)

**Analog:** itself — **this file is already the canonical empty-state pattern** (lines 14-17 render a branded "no posts yet" message). Phase 3 work: token retrofit + warm the empty-state copy on-tone (CONTEXT: "graceful empty-state — branded, on-tone, not an error"). Keep the `getCollection('blog', ...)` read and the `posts.length === 0` branch.

```astro
{posts.length === 0 ? (
  <p>...branded on-tone empty state...</p>
) : (
  <ul>{posts.map((entry) => (...))}</ul>
)}
```

---

### `src/pages/404.astro` and `src/pages/500.astro` (pages, error)

**Analogs:** the existing files (already minimal + correct BaseLayout usage). Phase 3 work: token retrofit + warm on-tone copy + clear path home AND to contact (CONTEXT). Reuse `Button` and/or `CtaBlock` for the "path back."

- `404.astro` already links home (line 13) — add a path to `/contact`, retrofit `text-3xl ... text-[color:var(...)]` -> `text-h1/text-h2 font-bold text-text`.
- `500.astro` already imports `SITE` and surfaces `SITE.email` (lines 2-3, 13-14) — keep that, retrofit tokens, warm the copy.

Both must NOT pass `noindex` (they replace generic Vercel pages but are normal routes).

---

### `src/components/sections/ApproachBand.astro` (NEW — planner's call, D-02)

**Analog:** `FeeStructureBand.astro` — the closest existing "compact banded section with an accent marker + heading + supporting copy" (its lines 16-30). The Approach band is the StoryBrand "guide with a plan" beat: one situational lead line + three points mapping to **competence / experience / responsiveness** (CONTEXT D-02 + Specifics).

**Copy the FeeStructureBand structural skeleton** (banded floating surface, accent leading marker):
```astro
<section data-component="ApproachBand" class="bg-bg py-section">
  <div class="mx-auto max-w-6xl px-gutter">
    <!-- lead line, then a 3-up grid: partner-led teams / deep transaction
         experience / moves at your deal's pace -->
  </div>
</section>
```
Reuse the accent marker idiom from FeeStructureBand line 22: `<span class="block h-1 w-10 rounded-full bg-accent" aria-hidden="true"></span>`. Use the 3-col grid idiom from the practice grid (`grid gap-8 sm:grid-cols-... lg:grid-cols-3`). Keep it restrained/premium (D-02) — a compact band, not a heavy section.

> Planner may instead inline this directly in `index.astro` (D-02 explicitly leaves the component-vs-inline choice to the planner). A standalone component is recommended only if it earns reuse on About (which echoes the same framing per Specifics).

---

### `src/components/sections/ChambersStrip.astro` (NEW — planner's call)

**Analog:** `TestimonialQuote.astro` (centered single-statement strip, lines 16-27) for the centered layout; `FeeStructureBand.astro` for the accent-tint surface idea. Per CONTEXT D-02 / Claude's-Discretion: a **quiet accent-tinted horizontal strip** placed just above the final `CtaBlock`, wording "Chambers USA — Spotlight 2026, ranked in Mergers & Acquisitions." Non-linked text unless a Chambers profile URL is known (deferred).

**Accent-tint surface** — Tailwind v4 generates opacity modifiers from the `--color-accent` token, so a quiet tint is `bg-accent/10` (or a hairline `border-accent/20`). Recognition, not the lead — keep it visually light:
```astro
<section data-component="ChambersStrip" class="bg-bg py-section">
  <div class="mx-auto max-w-6xl px-gutter">
    <div class="rounded-card bg-accent/10 px-6 py-5 text-center text-body text-text">
      <!-- Chambers USA — Spotlight 2026, ranked in Mergers & Acquisitions -->
    </div>
  </div>
</section>
```

## Shared Patterns

### Page shell (BaseLayout + per-page SEO)
**Source:** `src/layouts/BaseLayout.astro` (Props lines 11-20) + `src/components/seo/SeoHead.astro`
**Apply to:** every page in this phase.
Pass `title` + `description` (required) and optional `canonical` / `ogImage`. **Do not** pass `noindex` on any public Phase 3 page (it's gallery-only). The site-wide `LegalService` JSON-LD is injected automatically by BaseLayout (line 46) — pages need do nothing for it. Per-page SEO meta = the `title`/`description` props (SeoHead emits title/description/canonical/OG; robots lives in BaseLayout).
```astro
<BaseLayout title="..." description="...">
  ...sections / content...
</BaseLayout>
```

### Content-width container
**Source:** used in `design-system.astro` line 103 and every section component.
**Apply to:** any page-level content block in this phase.
```astro
<div class="mx-auto max-w-6xl px-gutter">   <!-- full content width -->
<div class="mx-auto max-w-3xl px-gutter">   <!-- prose / centered narrow column -->
```
Wrap a vertical-rhythm section with `class="bg-bg py-section"` on the `<section>` (see Hero line 29, DealsGrid line 20).

### Token namespace utilities (REQUIRED retrofit)
**Source:** `src/styles/global.css` `@theme` (lines 14-51) + all Phase 2 components.
**Apply to:** all rewritten placeholder pages — replace the old arbitrary-value form.
- Color: `text-text`, `text-text-muted`, `bg-bg`, `bg-bg-elevated`, `border-border`, `text-accent`, `bg-accent`, `text-accent-fg` (opacity modifiers like `bg-accent/10` are valid).
- Type: `text-display`, `text-h1`, `text-h2`, `text-h3`, `text-body-lg`, `text-body`, `text-small`.
- Spacing: `py-section` / `mb-section`, `px-gutter`.
- Radius/shadow: `rounded-card`, `rounded-button`, `shadow-card`, `shadow-card-hover`.
NEVER use `text-[color:var(--color-text)]` (the Phase 1 form the placeholders currently use) or hardcoded hex.

### CTA / links
**Source:** `Button.astro` (Props lines 7-14), `CtaBlock.astro`, `TextLink.astro`.
**Apply to:** every page's conversion path (-> `/contact`) and cross-links.
```astro
<Button variant="primary" href="/contact" label="Start a conversation" />
<Button variant="secondary" href="/practice-areas" label="See our work" />
<TextLink href="/about">team approach</TextLink>   <!-- inline links -->
```
The primary CTA target `/contact` is the Phase 1 placeholder until Phase 6 (CONTEXT) — link to it anyway.

### Eyebrow kicker
**Source:** `Eyebrow.astro` — slot-only, renders `text-small uppercase tracking-wide text-text-muted`.
**Apply to:** section/heading kickers on Home + About (e.g. above the Approach band lead line).

### Section component prop shapes (for composition)
**Source files** under `src/components/sections/`:
| Component | Props |
|-----------|-------|
| `Hero` | `headline` (req), `subhead?`, `eyebrow?`, `ctaLabel` (req), `ctaHref` (req), `secondaryLabel?`, `secondaryHref?` |
| `PracticeAreaCard` | `title`, `blurb`, `icon` (astro-icon name, e.g. `practice-tax`), `href` — all required |
| `AttorneyCard` | `name`, `role`, `focus`, `photo` (`ImageMetadata` — must be an imported asset), `alt`; optional `href` (omit in Phase 3 -> renders `<div>`, no "View profile") |
| `TestimonialQuote` | `quote`, `attribution` (req), `attributionDetail?`; optional `disclosure` slot |
| `DealsGrid` | `deals: { title; amount?; context? }[]`, `heading?` |
| `CtaBlock` | `heading`, `ctaLabel`, `ctaHref` (req), `body?` |
| `FeeStructureBand` | `heading`, `body` (req), `note?` — NOT used on homepage (D-01) |

### Collection-read index pattern
**Source:** `attorneys/index.astro`, `practice-areas/index.astro`, `blog/index.astro` (lines 1-6 + the `length === 0` branch).
**Apply to:** all three index pages.
```typescript
const items = await getCollection('<name>', ({ data }) => !data.draft);
```
Always include the empty-state branch (`items.length === 0`) with branded on-tone copy.

### Disclaimer (do NOT regress)
**Source:** `SiteFooter.astro` line 49 renders `<Disclaimer id="footer" />` on every route via BaseLayout.
**Apply to:** nothing extra needed in Phase 3 — the footer disclaimer already crawls on every page (the disclaimer-crawl test asserts it). Page-level disclaimers (contact/blog/practice-area/attorney) are Phase 4-6 concerns. Do not remove the footer render.

## No Analog Found

None. Every Phase 3 target maps to a strong in-repo analog. The two NEW small components (`ApproachBand`, `ChambersStrip`) are close role-matches to `FeeStructureBand` / `TestimonialQuote` and reuse established surface/marker/container idioms — no need to reach for RESEARCH.md patterns.

## Metadata

**Analog search scope:** `src/pages/`, `src/components/sections/`, `src/components/ui/`, `src/components/chrome/`, `src/components/seo/`, `src/components/legal/`, `src/layouts/`, `src/lib/`, `src/styles/`
**Files scanned:** 18 (design-system page, 6 section components, 5 placeholder pages, 3 chrome/seo/legal components, 2 ui primitives, BaseLayout, site.ts, jsonld.ts, global.css)
**Pattern extraction date:** 2026-05-26
