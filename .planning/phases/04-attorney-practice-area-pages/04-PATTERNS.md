# Phase 4: Attorney & Practice Area Pages - Pattern Map

**Mapped:** 2026-05-27
**Files analyzed:** 13 (8 MDX content, 2 layouts, 1 jsonld lib, 1 lint script, 1 package.json edit)
**Analogs found:** 13 / 13 (every new/modified file has a concrete in-repo analog)

> This phase is **content + render-out + compliance-gate**. The routes, layouts, six
> section components, `JsonLd.astro`, `Disclaimer.astro`, and the Zod schemas all exist.
> The single highest-risk pattern is the **schema-field → component-prop adapter**
> (Pitfall 1 in RESEARCH): the Phase 2 components were authored against the design-gallery's
> own prop names, which differ from the content-collection field names. Every adapter is
> documented verbatim below so the planner can write unambiguous mapping tasks.

---

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/content/attorneys/aaron-belcher.mdx` | content (data) | transform (MDX→Zod→render) | `src/content/attorneys/placeholder-attorney.mdx` | exact |
| `src/content/attorneys/stuart-smolen.mdx` | content (data) | transform | `placeholder-attorney.mdx` | exact |
| `src/content/attorneys/jon-van-loo.mdx` | content (data) | transform | `placeholder-attorney.mdx` | exact |
| `src/content/attorneys/iris-zhang.mdx` | content (data) | transform | `placeholder-attorney.mdx` | exact |
| `src/content/attorneys/susan-jiang.mdx` | content (data, `draft:true`) | transform | `placeholder-attorney.mdx` | exact |
| `src/content/practiceAreas/mergers-acquisitions.mdx` | content (data) | transform | `src/content/practiceAreas/placeholder-practice.mdx` | exact |
| `src/content/practiceAreas/intellectual-property-technology-transactions.mdx` | content (data) | transform | `placeholder-practice.mdx` | exact |
| `src/content/practiceAreas/tax.mdx` | content (data) | transform | `placeholder-practice.mdx` | exact |
| `src/content/testimonials/daniel-brian.mdx` (M&A) | content (data) | transform | `src/content/testimonials/placeholder.mdx` | exact |
| `src/layouts/AttorneyLayout.astro` | layout (render) | request-response (SSG) | self (un-comment reserved slot) + `design-system.astro` composition | exact |
| `src/layouts/PracticeAreaLayout.astro` | layout (render) | request-response (SSG) | self + `design-system.astro` composition | exact |
| `src/lib/jsonld.ts` (`buildPersonLd`, `buildFaqPageLd`) | utility (build-time) | transform | `buildLegalServiceLd()` in same file | exact |
| `scripts/lint-legal.mjs` + allowlist | config/tooling (CLI gate) | batch (file scan) | (no analog — see No Analog Found) | none |
| `package.json` `lint:legal` script | config | — | existing `lint:legal` placeholder + `test:*` scripts | exact |

---

## Pattern Assignments

### Attorney MDX files (5) — `src/content/attorneys/*.mdx`

**Analog:** `src/content/attorneys/placeholder-attorney.mdx`
**Schema contract:** `src/content.config.ts` lines 8-39 (the `attorneys` collection — this is authoritative; every field below is enforced at build).

**Frontmatter shape to replicate** (placeholder lines 1-22 — replace values, keep keys):
```yaml
---
name: "Aaron Belcher"            # ATTY-12: Jon's entry MUST be "Jon Van Loo", never "Jonathan"
slug: "aaron-belcher"            # URL-CONVENTIONS first-last; route reads entry.data.slug
title: "Partner"                 # z.enum(['Partner','Associate','Counsel']) — Iris = "Associate"
barAdmissions:                   # z.array(z.string()).min(1) — REQUIRED, min 1
  - "California"
education:                       # z.array({degree, school, year?, honors?})
  - degree: "JD"
    school: "..."
    year: 2005                   # number, optional — OMIT if unknown (D-02 no fabrication)
focus: "..."                     # z.string() REQUIRED — feeds <meta description> AND knowsAbout (see jsonld)
priorFirms: []                   # default []
representativeDeals:             # see DealsGrid adapter below; Aaron = full 64-deal list
  - parties: "Uniswap acquired Guidestar"
    role: "Represented Guidestar"   # optional
    cleared: true                # REQUIRED boolean — only true for register-listed (Pitfall 5)
recognition: []                  # default []
languages:                       # default ['English']; Iris adds "Mandarin"
  - "English"
email: "aaron@bsvlaw.com"        # z.string().email() REQUIRED — D-08 firstname@bsvlaw.com
                                 # phone: OMIT for every attorney (D-08 — no phone anywhere)
headshot: "../../assets/headshots/placeholder-belcher.svg"   # see headshot-path note below
headshotAlt: "Placeholder headshot for Aaron Belcher, Partner"
order: 1                         # z.number() REQUIRED
draft: false                    # Susan Jiang = true (D-07)
---

Bio prose goes here as the MDX body (rendered via <Content /> — narrative only).
```

**Headshot path adapter (load-bearing — placeholder differs from real):**
- Placeholder MDX uses a **colocated** SVG: `headshot: "./placeholder-attorney-headshot.svg"` (file sits in `src/content/attorneys/`).
- The **real** headshot assets are in `src/assets/headshots/` (verified on disk: `placeholder-belcher.svg`, `placeholder-smolen.svg`, `placeholder-vanloo.svg`, `placeholder-zhang.svg`, `placeholder-jiang.svg`).
- `image()` in a content collection resolves the string **relative to the MDX file**. From `src/content/attorneys/` to `src/assets/headshots/` the relative path is `../../assets/headshots/<file>.svg`.
- Per-attorney mapping: Belcher→`placeholder-belcher.svg`, Smolen→`placeholder-smolen.svg`, Van Loo→`placeholder-vanloo.svg`, Zhang→`placeholder-zhang.svg`, Jiang→`placeholder-jiang.svg`.

**Per-attorney specifics:**
- **Aaron** (`aaron-belcher.mdx`): full 64-deal `representativeDeals` from CONTEXT `<specifics>` lines 234-301, all `cleared: true` (D-15 en-masse clearance, register entry added first).
- **Stuart** (`stuart-smolen.mdx`): USPTO credential phrased as `"registered to practice before the U.S. Patent and Trademark Office (USPTO)"` — Rule 7.4-safe, no banned term. Put in `barAdmissions` and/or bio prose.
- **Jon** (`jon-van-loo.mdx`): D-06 interim — NOT a deal list. Use 3 experience bullets + crypto-thought-leader line in the bio body (prose), not `representativeDeals`. `name: "Jon Van Loo"` (ATTY-12).
- **Iris** (`iris-zhang.mdx`): `title: "Associate"`, `languages: ["English","Mandarin"]`. `barAdmissions: ["Bar admission details to be confirmed"]` to satisfy `.min(1)` without inventing a jurisdiction (D-05 / Pitfall 3). Flag to Jon.
- **Susan** (`susan-jiang.mdx`): `draft: true`, minimal clean placeholder ("full bio coming soon"), still must satisfy all required fields (name, slug, title, barAdmissions.min(1), education, focus, email, headshot, headshotAlt, order).

**Delete after:** `placeholder-attorney.mdx` + `placeholder-attorney-headshot.svg` (RESEARCH Runtime State line 446).

---

### Practice-area MDX files (3) — `src/content/practiceAreas/*.mdx`

**Analog:** `src/content/practiceAreas/placeholder-practice.mdx`
**Schema contract:** `src/content.config.ts` lines 42-61 (the `practiceAreas` collection).

**Frontmatter shape to replicate** (placeholder lines 1-14):
```yaml
---
name: "Mergers & Acquisitions"
slug: "mergers-acquisitions"           # verbose slug per URL-CONVENTIONS; route reads entry.data.slug
summary: "..."                         # feeds <meta description>
clientProblem: "..."                   # StoryBrand problem (PRAC-02)
bsvApproach: "..."                     # StoryBrand solution (PRAC-02)
representativeDeals:                   # z.array(z.string()) — STRING array (see DealsGrid adapter)
  - "Athelas merged with Commure in $6 billion merger"   # M&A ONLY; IP/Tax = [] (D-10)
leadAttorneys:                         # z.array(reference('attorneys')).min(1) — see getEntries below
  - "aaron-belcher"                    # M&A→aaron-belcher; IP→stuart-smolen; Tax→jon-van-loo (D-11)
faqs:                                  # z.array({question, answer}) — see FaqAccordion adapter
  - question: "How much does an M&A lawyer cost?"
    answer: "..."                      # HUMAN-GATED (D-13) — do NOT commit before Jon approves
feeStructureBand: true                 # default true (PRAC-09)
order: 1
draft: false
---

Practice-area narrative body (rendered via <Content />).
```

**Per-practice specifics:**
- **M&A** (`mergers-acquisitions.mdx`): `representativeDeals` = curated cleared M&A strings from Aaron's list (D-09); `leadAttorneys: ["aaron-belcher"]`; renders DealsGrid + Daniel Brian testimonial.
- **IP & Technology** (`intellectual-property-technology-transactions.mdx`): `representativeDeals: []` (D-10 — no grid); `leadAttorneys: ["stuart-smolen"]`; NO testimonial.
- **Tax** (`tax.mdx`): `representativeDeals: []` (D-10); `leadAttorneys: ["jon-van-loo"]`; NO testimonial.

**Delete after:** `placeholder-practice.mdx`.

---

### Testimonial MDX (1) — `src/content/testimonials/daniel-brian.mdx` (M&A only)

**Analog:** `src/content/testimonials/placeholder.mdx` (lines 1-6)
**Schema contract:** `src/content.config.ts` lines 82-92 (`testimonials`).

```yaml
---
quote: "BSV was my rock throughout the $6 billion merger between Athelas and Commure."
attribution: "Daniel Brian"
role: "GC, Commure, Inc."        # z.string() REQUIRED — maps to attributionDetail (see adapter)
matter: "Athelas–Commure merger" # optional
practiceArea: "mergers-acquisitions"  # reference('practiceAreas').optional()
featured: true
---
```
The verbatim quote/attribution already appear in `design-system.astro` lines 196-198 — reuse exactly. (Alternatively the M&A page can render `TestimonialQuote` with inline props rather than a collection entry — planner's discretion; the collection entry is the cleaner, schema-validated path.)

---

### `src/layouts/AttorneyLayout.astro` (layout, render-out)

**Analog:** itself (lines 1-33, the reserved scaffold) + `design-system.astro` composition (lines 194-217 show every section component wired with real props).

**Reserved JSON-LD slot to replace** (current line 24 — a comment):
```astro
{/* Phase 4: <JsonLd slot="head" data={buildPersonLd(attorney)} /> */}
```
becomes (RESEARCH Pattern 3, lines 276-285):
```astro
---
import JsonLd from '../components/seo/JsonLd.astro';
import { buildPersonLd } from '../lib/jsonld';
// ...existing imports
---
<BaseLayout title={title} description={description}>
  <JsonLd slot="head" data={buildPersonLd(attorney)} />
  ...
</BaseLayout>
```
`JsonLd.astro` (verified lines 17-23) takes `data: object` and renders `<script type="application/ld+json" set:html={JSON.stringify(data)} />`. `slot="head"` transfers into `<head>` via BaseLayout's head slot — **no BaseLayout edit**.

**Disclaimer:** already wired — `<Disclaimer id="attorney" />` at line 32. Do not duplicate.

**Contact callout (ATTY-07, D-08 email-only):** render `attorney.data.email` as a `mailto:` link. NEVER render `attorney.data.phone` (it stays unset; `SITE.phone` is LegalService-JSON-LD-only).

**Body composition:** compose field-driven sections (DealsGrid for attorneys with deals, contact callout) in the layout frontmatter/template; keep MDX `<Content />` for narrative prose (RESEARCH Pattern 4). The `<slot />` at line 30 is where `<Content />` lands.

---

### `src/layouts/PracticeAreaLayout.astro` (layout, render-out)

**Analog:** itself (lines 1-30) + `design-system.astro` (lines 194-220).

**Reserved JSON-LD slot** (current line 22):
```astro
{/* Phase 4: <JsonLd slot="head" data={buildFaqPageLd(practiceArea.data.faqs)} /> */}
```
becomes a real `<JsonLd slot="head" data={buildFaqPageLd(practiceArea.data.faqs)} />`. **Guard empty faqs** — do not emit JSON-LD if `faqs.length === 0` (RESEARCH Code Examples line 408).

**Cross-collection reference resolution (NEW — PRAC-06, RESEARCH Pattern 2 lines 262-271):**
```astro
---
import { getEntries } from 'astro:content';
const leads = await getEntries(practiceArea.data.leadAttorneys);
// leads[i].data.name, leads[i].data.slug
// link: href={`/attorneys/${leads[i].data.slug}`}
---
```
`leadAttorneys` is `z.array(reference('attorneys')).min(1)` — a raw reference is `{collection, id}`, NOT data. Rendering it directly prints `[object Object]`. MUST resolve via `getEntries()` before reading `.data.name` / building the profile link.

**Disclaimer:** already wired — `<Disclaimer id="practice-area" />` at line 29.

---

### `src/lib/jsonld.ts` — `buildPersonLd` (impl) + `buildFaqPageLd` (new)

**Analog:** `buildLegalServiceLd()` in the same file, lines 13-46 (the working, tested pattern).

**Replace the throwing stub** at lines 52-54:
```typescript
export function buildPersonLd(_attorney: unknown): WithContext<Person> {
  throw new Error('buildPersonLd not implemented until Phase 4');
}
```

**Pattern to follow** (mirror `buildLegalServiceLd`'s `'@context'`/`'@type'` header, `as const` on nested `@type`, and reading from `SITE`). RESEARCH Code Examples lines 360-387 give the exact body:
- `name: d.name`, `jobTitle: d.title`, `url: ${SITE.baseUrl}/attorneys/${d.slug}`
- `worksFor: { '@type':'Organization' as const, name: SITE.name, url: SITE.baseUrl }`
- `alumniOf: d.education.map(e => ({ '@type':'EducationalOrganization' as const, name: e.school }))`
- `knowsAbout: d.focus.split(/[;,]/).map(s=>s.trim()).filter(Boolean)`
- `email: d.email`
- `sameAs`: **OMIT entirely** unless Jon supplies a verified URL (D-02 no fabrication).
- Import `type { CollectionEntry } from 'astro:content'` and type the param `attorney: CollectionEntry<'attorneys'>`. `Person`/`WithContext` already imported (line 10).

**`buildFaqPageLd` — NEW** (RESEARCH lines 390-408):
```typescript
import type { FAQPage } from 'schema-dts';  // add FAQPage to the existing line-10 import
export function buildFaqPageLd(
  faqs: { question: string; answer: string }[],
): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question' as const,
      name: f.question,
      acceptedAnswer: { '@type': 'Answer' as const, text: f.answer },
    })),
  };
}
```
Note: `faqs` is the raw `practiceArea.data.faqs` shape (`{question, answer}`), so `buildFaqPageLd` takes schema field names directly — **no adapter** here (the adapter is only for the `FaqAccordion` component, see Shared Patterns).

---

### `scripts/lint-legal.mjs` + `scripts/lint-legal.allowlist.json` (new tooling)

**Analog:** none in-repo (no existing Node CLI script of this kind). Build from RESEARCH Code Examples lines 410-422.
- Node 22 stdlib only (`node:fs`, `node:fs/promises` `glob`, or recursive `readdir` fallback). Zero new deps.
- Scan `src/content/**/*.mdx`. Banned regex (confirm word set with Jon — A1): `/\b(special(?:ist|ists|ize[sd]?|izing|ization)|experts?|expertise)\b/gi`.
- Allowlist JSON: `[{ phrase, file, reason }]`, matched by exact phrase + file.
- Print `file:line:term`; `process.exit(violations ? 1 : 0)`.

**`package.json` edit** — replace line 28:
```json
"lint:legal": "echo 'lint:legal — Phase 1 placeholder; real rules land in Phase 4'"
```
with `"lint:legal": "node scripts/lint-legal.mjs"`. Wire into CI / as a `prebuild` predecessor (success criterion 4). Mirror existing `test:*` script naming for any new test scripts.

---

## Shared Patterns

### Adapter 1: schema fields → component props (Pitfall 1 — THE load-bearing mapping)

Build these adapters **in the layout frontmatter** (or a small `src/lib/adapters.ts`), never inside the components.

**`FaqAccordion`** — component prop is `items: { q, a }[]` (verified `FaqAccordion.astro` lines 9-12), but schema is `faqs: { question, answer }[]`:
```astro
const faqItems = practiceArea.data.faqs.map((f) => ({ q: f.question, a: f.answer }));
// <FaqAccordion items={faqItems} heading="Common questions" />
```

**`DealsGrid`** — component prop is `deals: { title, amount?, context? }[]` (verified `DealsGrid.astro` lines 6-10). Two source shapes:
- From `attorneys.representativeDeals` (`{ parties, value?, role?, cleared }`):
  ```astro
  const deals = attorney.data.representativeDeals
    .filter((d) => d.cleared)                       // only cleared (LEGAL-04)
    .map((d) => ({ title: d.parties, amount: d.value, context: d.role }));
  ```
  Mapping: `parties→title`, `value→amount`, `role→context`.
- From `practiceAreas.representativeDeals` (`string[]`):
  ```astro
  const deals = practiceArea.data.representativeDeals.map((s) => ({ title: s }));
  ```
Reference shape (real props in use): `design-system.astro` line 70 — `{ title: 'Athelas / Commure', amount: '$6B merger', context: '...' }`.

**`TestimonialQuote`** — component props are `quote, attribution, attributionDetail?` (verified `TestimonialQuote.astro` lines 7-11) + a named `disclosure` slot (line 26). Schema `testimonials` is `{ quote, attribution, role, matter? }`:
```astro
<TestimonialQuote
  quote={t.data.quote}
  attribution={t.data.attribution}
  attributionDetail={t.data.role}          {/* role → attributionDetail */}
>
  <p slot="disclosure">...CA disclosure...</p>   {/* LEGAL-06 / D-18 */}
</TestimonialQuote>
```
Mapping: `role`→`attributionDetail` (real example: design-system line 198 `attributionDetail="GC, Commure, Inc."`). The `matter` field has no component slot — use it in `attributionDetail` text if desired, or omit.

### CA testimonial disclosure (LEGAL-06 / D-18) — `disclosure` slot
Render the disclosure into `TestimonialQuote`'s `<slot name="disclosure" />`. RESEARCH-recommended wording (Jon confirms at review): *"This testimonial reflects one client's experience and is not a guarantee of any future result. Prior results do not guarantee a similar outcome."* The slot was reserved in Phase 2 for exactly this.

### JSON-LD slot transfer (ATTY-09 / PRAC-08)
`<JsonLd slot="head" data={...} />` inside either layout's `<BaseLayout>`. `JsonLd.astro` handles `JSON.stringify` escaping (XSS-safe). **Source:** `JsonLd.astro` lines 17-23; reserved comment in both layouts (`AttorneyLayout.astro` line 24, `PracticeAreaLayout.astro` line 22). **Apply to:** AttorneyLayout (Person), PracticeAreaLayout (FAQPage).

### Disclaimers (LEGAL-02)
`<Disclaimer id="attorney" />` / `<Disclaimer id="practice-area" />` — collection-driven, already rendered in both layouts. Both ids exist in `disclaimers.json` (lines 18-26). **Do not** add hardcoded disclaimer strings. **Apply to:** both layouts (already present — verify, don't re-add).

### Fee band (PRAC-09 / LEGAL-08)
`FeeStructureBand` props: `heading, body, note?` (verified lines 7-11). Reuse ONE consistent band across all three practice pages. Reference copy: `design-system.astro` lines 205-209 (`heading="How we bill"`, hourly + up-front estimate, NO published rate).

### CTA (StoryBrand close)
`CtaBlock` props: `heading, body?, ctaLabel, ctaHref` (lines 8-13). Reference: design-system lines 212-216 (`ctaHref="/contact"`).

### Token-only styling
All six components already use namespace utilities (`text-text`, `bg-bg`, `px-gutter`, `text-accent`, `rounded-card`). New layout markup must follow — never hardcoded hex.

### `getStaticPaths` string-slug (Pitfall 6 — do NOT regress)
Both routes already emit `params: { slug: entry.data.slug }` (verified `attorneys/[slug].astro` line 8, `practice-areas/[slug].astro` line 8) and filter `draft`. **Do not re-author the routes.** They render via `const { Content } = await render(entry)`.

---

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `scripts/lint-legal.mjs` | config/CLI tooling | batch file-scan | No existing Node CLI scanner in the repo. Build from RESEARCH Code Examples (lines 410-422) using Node stdlib. The only related script is `scripts/install-git-hooks.ps1` (PowerShell, unrelated shape). |
| `scripts/lint-legal.allowlist.json` | config data | — | No existing allowlist file. New `[{phrase,file,reason}]` JSON. |

---

## Metadata

**Analog search scope:** `src/content/{attorneys,practiceAreas,testimonials,disclaimers}/`, `src/layouts/`, `src/components/{sections,seo,legal}/`, `src/lib/`, `src/pages/{attorneys,practice-areas}/`, `src/pages/design-system.astro`, `src/assets/headshots/`, `package.json`, `scripts/`.
**Files scanned:** 21 (read in full or targeted).
**Pattern extraction date:** 2026-05-27
