# Phase 4: Attorney & Practice Area Pages - Research

**Researched:** 2026-05-27
**Domain:** Astro 6 content-collection rendering, schema.org JSON-LD (Person + FAQPage), California Rule 7.1/7.4 advertising compliance, content-lint build gate, AEO/FAQ authoring
**Confidence:** HIGH

## Summary

Phase 4 is a **content + render-out + compliance-gate** phase, not a greenfield build. The scaffolding from Phases 1-2 is complete and verified: five Zod content collections, two `[slug]` dynamic routes that already filter `draft:true` and pass `entry` as a prop, two layouts with reserved JSON-LD comment slots, six section components with known prop shapes, a `JsonLd.astro` render component, a `Disclaimer.astro` driven by the `disclaimers` collection (all five ids present), and `schema-dts@2.0.0` installed. The work is: (1) write 5 attorney MDX + 3 practice-area MDX files matching the existing Zod schemas, (2) render every schema field through the layouts/components, (3) implement `buildPersonLd` and add a `buildFaqPageLd` builder in `src/lib/jsonld.ts`, (4) replace the placeholder `lint:legal` script with a real content scanner wired into CI, (5) add the cleared-deal clearance entry, (6) draft FAQs for a human gate before they are committed.

The single most consequential research finding: **as of 2026-05-07 (20 days ago) Google fully ended FAQ rich results in Search for all site types — there is no longer any way for a law firm (or anyone) to earn a FAQ rich snippet** [VERIFIED: Google Search Central + multiple SEO trackers]. This does **not** change the requirement: `FAQPage` is still a valid Schema.org type, costs nothing, and is the **highest-citation-rate schema type in AI answer engines** (ChatGPT, Perplexity, Google AI Overviews). PRAC-08/SEO-05 should ship the markup for the AEO surface, and the plan should frame success as "valid FAQPage JSON-LD present and parseable" — **not** "FAQ rich result appears in Google" (which is now impossible and must not be a success criterion).

**Primary recommendation:** Treat this as a data-and-render phase. Reuse every existing component as-is (do not re-author them); the only new code is two JSON-LD builders, one content-lint Node script, and the eight MDX content files. Honor the prop-shape adapters (schema field names differ from component prop names — see Pitfall 1). Gate FAQ copy behind Jon's review (D-13) before any commit.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Attorney/practice page generation | Static build (Astro SSG) | — | `getStaticPaths` renders all pages at build; no runtime tier involved |
| Content (bios, deals, FAQs) | MDX content collections | Zod schema (build-time validation) | Jon-editable via GitHub web UI; schema is the safety net |
| `Person` / `FAQPage` JSON-LD | Build-time `src/lib/jsonld.ts` builders | `JsonLd.astro` (renders `<script>`) | schema-dts gives compile-time typing; slot-transfer into `<head>` |
| Rule 7.4 banned-term enforcement | Build-time Node lint script | CI (fails build) | Pure static text scan over `src/content/**/*.mdx`; no runtime |
| Disclaimers | `disclaimers` collection + `Disclaimer.astro` | Layouts (render per-page) | Already wired; layouts already call `<Disclaimer id="attorney"|"practice-area" />` |
| Cross-collection lead-attorney links | Build-time `getEntries()` resolution | PracticeAreaLayout | `leadAttorneys` is `reference('attorneys')` — must resolve, not render raw |

## Project Constraints (from CLAUDE.md / .claude/CLAUDE.md)

These have the same authority as locked decisions. The plan must not contradict them.

- **Tech stack locked:** Astro 6 + Tailwind v4 + GitHub + Vercel. No alternatives.
- **Plain-English communication:** Jon is a practicing attorney with **no coding background**. Every command/concept explained before it runs; one concept at a time. Avoid restart-Claude flows.
- **JSON-LD on every page** (LegalService site-wide already; Person + FAQPage this phase).
- **Per-page disclaimers** on attorney + practice-area pages (already plumbed).
- **No image > 200 KB committed** (placeholder headshots already on disk; no new images this phase).
- **Tailwind tokens only** — namespace utilities (`text-text`, `bg-bg`, `px-gutter`), never hardcoded hex. (All existing components already comply.)
- **Decision log:** append Phase 4 decisions + the D-15 clearance to `.planning/DECISIONS.md`.
- **Email-only contact, no phone numbers anywhere** (D-08). The `SITE.phone` constant exists for the LegalService JSON-LD only and must **not** surface on any attorney/practice page.
- **No language claims results, predicts outcomes, or guarantees representation** (LEGAL-10).

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Content source & fidelity**
- **D-01:** Replicate bsvlaw.com. Bios, M&A testimonial, Aaron's deal tags transfer from the current site. Primary source `.planning/FIRM_BRIEF.md`; executor **re-fetches the live bsvlaw.com attorney pages for exact wording** when needed. Match current site's professional tone — do not invent material.
- **D-02:** No fabrication. Do not invent founding stories, deal values, dates, or bar-admission years. Unknown fact → omit or mark as being confirmed.

**Attorney profiles**
- **D-03:** Bios use the real bsvlaw.com text for Aaron, Stuart, Jon, Iris (not a rewrite into a different voice).
- **D-04:** Aaron Belcher — COMPLETE deal list. Pull the FULL representative-transactions list exactly as published at `https://bsvlaw.com/team/aaron-belcher-partner/` — every deal, verbatim, none dropped/summarized. Captured 64-deal list is in CONTEXT.md `<specifics>`. Re-fetch to confirm wording at build. Reuse same deals in M&A practice deal grid where appropriate.
- **D-05:** Iris Zhang — bar "to be confirmed." Do NOT invent an admission year. The `attorneys` schema requires `barAdmissions` min 1 — resolve without inventing a jurisdiction (e.g., a "Admission details to be confirmed" placeholder entry). Flag to Jon if schema blocks a clean omission.
- **D-06:** Jon Van Loo — short interim 3-bullet experience list (verbatim in CONTEXT.md) + a "recognized thought leader on tax issues for cryptocurrency" line (spoken at PLI, published articles). "Thought leader" is allowed; not a banned Rule 7.4 term.
- **D-07:** Susan Jiang — clean placeholder profile ("full bio coming soon"), `draft: true`, not linked or indexed.

**Partner contact callouts**
- **D-08:** Email only — NO phone numbers anywhere. Pattern `firstname@bsvlaw.com` (jon@, aaron@, stuart@, iris@). Jon confirms exact addresses at review. `phone` field stays unset for every attorney.

**Practice-area pages**
- **D-09:** M&A page keeps cleared named deals + the Daniel Brian / Athelas–Commure testimonial (replicating current site). Deal grid from cleared M&A deals (Aaron's list, D-04).
- **D-10:** SKIP deal grids on IP & Technology and Tax pages for now. They still follow problem → solution → proof (lead-partner callout + narrative + FAQ), no deal grid, **no testimonial** (none cleared).
- **D-11:** Lead-attorney callouts: M&A → Aaron Belcher; IP & Technology → Stuart Smolen; Tax → Jon Van Loo. Each links to the attorney's profile (PRAC-06).

**Practice-area FAQs (review gate)**
- **D-12:** Claude drafts 3–5 plain-English FAQs per practice area (M&A, IP & Technology, Tax) for AEO/AI-search (PRAC-08/SEO-05).
- **D-13:** HUMAN APPROVAL GATE — FAQs presented to Jon for review BEFORE written into MDX/committed/published. Do not publish unreviewed FAQs. Hard stop in execution flow.
- **D-14:** FAQ answers accurate and non-promissory — Rule 7.1 (no false/misleading), no outcome guarantees, no results predictions (reinforces LEGAL-10).

**Legal / compliance**
- **D-15:** Client-disclosure clearance (LEGAL-04): Jon clears Aaron's complete representative-transactions list (as published on bsvlaw.com) for publication on 2026-05-27, basis = already public on firm's current site. Executor adds the clearance entry/entries to `.planning/CLIENT_DISCLOSURE_CLEARANCE.md` referencing the bsvlaw.com source before publishing the deals.
- **D-16:** Rule 7.4 lint (LEGAL-03): real `npm run lint:legal` scans content for "specialist", "expert", "specialize" and fails the build on a non-allowlisted hit. Stuart's USPTO credential uses safe phrasing — "registered to practice before the U.S. Patent and Trademark Office (USPTO)" — no banned term. Legitimate exceptions documented in the lint allowlist config.
- **D-17:** Disclaimers (LEGAL-02): each attorney page renders the `attorney` disclaimer; each practice page renders the `practice-area` disclaimer (both already exist).
- **D-18:** Testimonial disclosure (LEGAL-06): the Daniel Brian testimonial on the M&A page carries the California-required disclosure.

**Workflow / ship**
- **D-19:** After building: (1) present draft FAQs for Jon's approval (D-13), then (2) commit, (3) push, (4) merge to `main`, (5) report the production (Vercel) URL. FAQ approval gate precedes any commit of FAQ content.

### Claude's Discretion
- Exact `AttorneyLayout` / `PracticeAreaLayout` markup and how deal grids/FAQ/fee band compose (components already exist).
- `Person` JSON-LD fields (jobTitle, alumniOf, knowsAbout, sameAs) and `FAQPage` JSON-LD shape (SEO-03/SEO-05) — use existing `src/lib/jsonld.ts` builders.
- Fee-structure band wording/tone (hourly + cost estimate) — reuse one consistent band across the three practice pages (PRAC-09/LEGAL-08).
- How to satisfy the `barAdmissions` min-1 schema for Iris without inventing a jurisdiction (D-05).
- Mapping the verbose practice-area slugs and ordering of attorney/practice entries.

### Deferred Ideas (OUT OF SCOPE)
- Anonymized IP & Tax deal experience (deal grids on IP/Tech and Tax pages) — later (D-10).
- Jon Van Loo full deal list — Jon expands beyond the 3 interim bullets later (D-06).
- Susan Jiang real bio — ships hidden until Jon supplies it (D-07).
- Real headshots — placeholders for now; swapped before launch (Phase 7).
- Exact partner email addresses — Jon confirms/corrects at review (D-08).
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| ATTY-01 | `/attorneys/[slug]` route generates one page per attorney | Route + `getStaticPaths` already exist and filter `draft`. Just populate MDX. (Architecture Pattern 1) |
| ATTY-02 | Aaron Belcher profile published | D-04 full 64-deal list (CONTEXT `<specifics>`); re-fetch bsvlaw.com; map to `representativeDeals[]` schema |
| ATTY-03 | Stuart Smolen profile published | FIRM_BRIEF data; USPTO safe phrasing (D-16). Goes in `barAdmissions` + bio prose, not as a banned term |
| ATTY-04 | Jon Van Loo profile published | FIRM_BRIEF + D-06 interim 3-bullet + thought-leader line |
| ATTY-05 | Iris Zhang profile published | FIRM_BRIEF; bar "to be confirmed" → D-05 schema workaround (see Pitfall 3) |
| ATTY-06 | Susan Jiang scaffolded `draft:true` | Already-proven draft-exclusion pattern; not linked/indexed (D-07) |
| ATTY-07 | Partner direct-contact callout on each partner page | Email-only (D-08); render `attorney.data.email` as `mailto:` |
| ATTY-08 | Headshot placeholder | Placeholder SVG + monograms already on disk; `headshot`/`headshotAlt` already required fields |
| ATTY-09 | `Person` JSON-LD on each attorney page | Implement `buildPersonLd()` (currently throws); slot-transfer (Architecture Pattern 3 + Code Examples) |
| ATTY-10 | Attorney disclaimer rendered | `AttorneyLayout` already renders `<Disclaimer id="attorney" />` |
| ATTY-11 | Nir Fishbien appears NOWHERE | Never create a Fishbien MDX entry; validation grep (Validation Architecture) |
| ATTY-12 | Jon referred to as "Jon" | Use "Jon Van Loo" in `name`; never "Jonathan" |
| PRAC-01 | `/practice-areas/[slug]` route per practice area | Route + `getStaticPaths` exist; populate 3 MDX files |
| PRAC-02 | M&A page: problem → solution → proof | `clientProblem`/`bsvApproach` schema fields + DealsGrid + lead-partner + testimonial |
| PRAC-03 | IP & Technology page | Same structure, no deal grid/testimonial (D-10), oriented to Stuart |
| PRAC-04 | Tax page | Same structure, no deal grid/testimonial (D-10), oriented to Jon |
| PRAC-05 | Deal-experience grid (M&A only this phase) | DealsGrid component; deals must be in CLEARANCE register (D-09/D-15) |
| PRAC-06 | Lead-attorney callout links to profile | `leadAttorneys` reference → resolve via `getEntries()` → link to `/attorneys/[slug]` (D-11) |
| PRAC-07 | Practice-area disclaimer rendered | `PracticeAreaLayout` already renders `<Disclaimer id="practice-area" />` |
| PRAC-08 | FAQPage JSON-LD, 3–5 FAQs | `buildFaqPageLd()` new builder + FaqAccordion render; AEO framing (see Pitfall 2) |
| PRAC-09 | Fee-structure transparency band | FeeStructureBand component; one consistent band; NO published rates |
| SEO-03 | `Person` JSON-LD (jobTitle, alumniOf, knowsAbout, sameAs) | schema-dts `Person` type; field mapping in Code Examples |
| SEO-05 | `FAQPage` JSON-LD per practice page | `buildFaqPageLd()`; valid Schema.org even though no rich result (Pitfall 2) |
| LEGAL-02 | Per-page disclaimers | Already plumbed; verify rendered (Validation Architecture) |
| LEGAL-03 | Rule 7.4 lint fails build on banned terms | New `lint:legal` Node script (Don't Hand-Roll + Code Examples) |
| LEGAL-04 | Client-disclosure clearance gate | Add Aaron's deal-list clearance row before publishing (D-15) |
| LEGAL-06 | Testimonials carry CA-required disclosure | Daniel Brian testimonial disclosure wording (Security/Legal Domain) |
| LEGAL-08 | Fee structure communicated (hourly + estimate) | FeeStructureBand copy, no rates |
| LEGAL-10 | No results/outcome/guarantee language | Audit all bio + FAQ + practice copy; reinforced by `attorney` disclaimer text |
</phase_requirements>

---

## Standard Stack

This phase introduces **no new packages**. Everything needed is installed and verified.

### Core (already installed — verified)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `astro` | 6.3.8 (`^6.3.7` in package.json) | SSG, content collections, MDX render | Locked stack [VERIFIED: npm view astro version → 6.3.8 on 2026-05-27] |
| `schema-dts` | 2.0.0 | Compile-time-typed JSON-LD (Person, FAQPage) | Already a dependency; makes a misspelled schema property a TS error [VERIFIED: npm view schema-dts version → 2.0.0; package.json declares `^2.0.0`] |
| `@astrojs/mdx` | ^5.0.6 | MDX rendering of collection bodies | Installed |
| `tailwindcss` + `@tailwindcss/vite` | ^4.3.0 | Styling tokens | Installed; components already token-only |
| `cheerio` | ^1.2.0 (dev) | HTML parsing in Playwright validation tests | Already used by `jsonld-legalservice.spec.ts` |
| `@playwright/test` | ^1.60.0 (dev) | Validation tests | Installed; existing test conventions in `tests/` |

> **package.json note:** `schema-dts` is declared `^2.0.0` here, while `CLAUDE.md`'s stack table lists `schema-dts 1.1.0`. The **installed/declared 2.0.0 is authoritative** — the existing `buildLegalServiceLd()` already imports from `schema-dts@2.0.0` and the `jsonld-legalservice` test passes. Do not downgrade. [VERIFIED: package.json line 38]

### Supporting (built-in to Astro 6 — no install)
| Capability | Module | Purpose |
|------------|--------|---------|
| `getCollection`, `getEntry`, `getEntries`, `render` | `astro:content` | Query + resolve references + render MDX body |
| Zod (`z`), `reference()`, `glob`/`file` loaders | `astro:content` | Already define the schema contract in `src/content.config.ts` |
| Node `fs` / `path` / `glob` | Node 22 stdlib | Content-lint script (no new dependency needed) |

**Installation:** None. `npm install` already satisfies the phase.

## Package Legitimacy Audit

> No external packages are installed in this phase. All dependencies are pre-existing and were verified in prior phases.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| (none added) | — | — | — | — | — | N/A — content + config only |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

*slopcheck was not run because Phase 4 installs zero packages. The `lint:legal` script uses only Node stdlib — no `npm install` step exists for it to gate.*

## Architecture Patterns

### System Architecture Diagram

```
                         BUILD TIME (astro build)
                                  │
        ┌─────────────────────────┼──────────────────────────┐
        │                         │                          │
  src/content/attorneys/*.mdx  src/content/         npm run lint:legal
  src/content/practiceAreas/*.mdx  practiceAreas    (Node script over
        │                    leadAttorneys:           src/content/**/*.mdx)
        │                    reference('attorneys')        │
        ▼                         │                  banned term found?
  Zod schema validation           │                  ──yes──► exit 1 (CI fails build)
  (content.config.ts)             │                  ──no───► exit 0
        │                         │
        ▼                         ▼
  getStaticPaths()          getEntries(leadAttorneys)
  params:{slug:string}      → resolve attorney entries
  props:{entry}                   │
        │                         │
        ▼                         ▼
  [slug].astro ──render(entry)──► <Content/> (MDX body)
        │
        ▼
  AttorneyLayout / PracticeAreaLayout
        │
        ├─ <JsonLd slot="head" data={buildPersonLd(entry)} />      (ATTY-09/SEO-03)
        ├─ <JsonLd slot="head" data={buildFaqPageLd(faqs)} />       (PRAC-08/SEO-05)
        ├─ section components: DealsGrid / FaqAccordion /
        │  FeeStructureBand / TestimonialQuote / CtaBlock
        └─ <Disclaimer id="attorney"|"practice-area" />             (LEGAL-02)
        │
        ▼
  dist/client/attorneys/<slug>/index.html  +  dist/client/practice-areas/<slug>/index.html
```

A reader can trace one attorney page: MDX file → Zod validates → `getStaticPaths` emits a string-slug path → `render()` compiles the body → `AttorneyLayout` injects `Person` JSON-LD into `<head>` (slot transfer through `BaseLayout`) → renders header, contact callout, deal grid, disclaimer → static HTML in `dist/`.

### Component Responsibilities

| File | Responsibility | Phase 4 change |
|------|----------------|----------------|
| `src/content/attorneys/*.mdx` (5) | Attorney data + bio body | **CREATE** (replace placeholder) |
| `src/content/practiceAreas/*.mdx` (3) | Practice data + problem/solution body | **CREATE** (replace placeholder) |
| `src/layouts/AttorneyLayout.astro` | Render attorney fields + Person JSON-LD slot + contact callout | **EDIT** (un-comment/implement JSON-LD slot; compose fields/components) |
| `src/layouts/PracticeAreaLayout.astro` | Render practice fields + FAQPage JSON-LD slot + lead-attorney resolution | **EDIT** (resolve `getEntries`, compose components, FAQPage slot) |
| `src/lib/jsonld.ts` | `buildPersonLd()` (impl), `buildFaqPageLd()` (NEW) | **EDIT** (replace throw-stub; add FAQ builder) |
| `package.json` | `lint:legal` script | **EDIT** (replace placeholder echo) |
| `scripts/lint-legal.mjs` (or `.cjs`) | Banned-term scanner | **CREATE** |
| `scripts/lint-legal.allowlist.json` (or inline) | Documented allowlisted phrases | **CREATE** |
| `.planning/CLIENT_DISCLOSURE_CLEARANCE.md` | Add Aaron deal-list clearance row | **EDIT** (D-15) |
| `tests/*.spec.ts` (new) | Validation tests (see Validation Architecture) | **CREATE** |

### Recommended Project Structure (files this phase touches)
```
src/
├── content/
│   ├── attorneys/          # aaron-belcher.mdx, stuart-smolen.mdx, jon-van-loo.mdx,
│   │                       #   iris-zhang.mdx, susan-jiang.mdx (draft:true)
│   │                       #   (delete placeholder-attorney.mdx)
│   └── practiceAreas/      # mergers-acquisitions.mdx,
│                           #   intellectual-property-technology-transactions.mdx, tax.mdx
│                           #   (delete placeholder-practice.mdx)
├── layouts/                # AttorneyLayout.astro, PracticeAreaLayout.astro (render-out)
├── lib/                    # jsonld.ts (buildPersonLd impl + buildFaqPageLd new)
scripts/                    # lint-legal.mjs + allowlist
tests/                      # person-jsonld, faqpage-jsonld, lint-legal, fishbien-absent,
                            #   clearance, draft-exclusion specs
```

### Pattern 1: Dynamic route + render (ALREADY WORKING — do not rewrite)
**What:** The route reads the collection, filters drafts, emits **string** slug params, passes the entry as a prop, and renders the MDX body.
**When to use:** It already exists for both collections and is correct. Plans must NOT re-author it.
```astro
// src/pages/attorneys/[slug].astro  (EXISTING — verified correct)
export async function getStaticPaths() {
  const attorneys = await getCollection('attorneys', ({ data }) => !data.draft);
  return attorneys.map((entry) => ({
    params: { slug: entry.data.slug }, // STRING param — Astro 6 requires (Pitfall 12)
    props: { entry },
  }));
}
const { entry } = Astro.props;
const { Content } = await render(entry);
```
[VERIFIED: codebase src/pages/attorneys/[slug].astro] — note this uses `entry.data.slug` (the schema's own `slug` field), NOT the loader-generated `id`. Both collections define an explicit `slug` field, so this is consistent and self-contained. Keep using `entry.data.slug`.

### Pattern 2: Cross-collection reference resolution (NEW work in PracticeAreaLayout)
**What:** `leadAttorneys` is `z.array(reference('attorneys')).min(1)`. A `reference()` resolves to `{ collection, id }` — **not** the attorney data. You must call `getEntries()` to get the real entries before you can render a name or link.
**When to use:** PRAC-06 lead-attorney callout that links to the profile.
```astro
// inside PracticeAreaLayout.astro frontmatter
import { getEntries } from 'astro:content';
const leads = await getEntries(practiceArea.data.leadAttorneys);
// leads[i].data.name, leads[i].data.slug → href={`/attorneys/${leads[i].data.slug}`}
```
[CITED: docs.astro.build/en/guides/content-collections — "references must be queried separately... use getEntries() to retrieve multiple referenced entries"]

### Pattern 3: JSON-LD slot transfer (the reserved contract)
**What:** Both layouts already have a commented placeholder showing exactly where the JSON-LD goes. `BaseLayout` exposes a `head` slot; passing `slot="head"` on `<JsonLd>` transfers it into `<head>` with no `BaseLayout` edit.
**When to use:** ATTY-09 (Person) and PRAC-08 (FAQPage).
```astro
// AttorneyLayout.astro — replace the Phase 4 comment
import JsonLd from '../components/seo/JsonLd.astro';
import { buildPersonLd } from '../lib/jsonld';
...
<BaseLayout title={title} description={description}>
  <JsonLd slot="head" data={buildPersonLd(attorney)} />
  ...
</BaseLayout>
```
[VERIFIED: codebase — comment at AttorneyLayout.astro line 24 and PracticeAreaLayout.astro line 22 reserve this exact slot; JsonLd.astro takes `data: object`]

### Pattern 4: Component composition (reuse, don't re-author)
All six section components exist with fixed prop shapes (see Pitfall 1 for the name adapters). The layout body composes them; the MDX `<Content />` supplies prose. Compose in the layout, not in MDX, so JSON-LD and field-driven sections stay deterministic. Keep MDX bodies to narrative prose only.

### Anti-Patterns to Avoid
- **Re-authoring the working `[slug].astro` routes or section components.** They are done and tested. Touching them risks regressing the Phase 2 gallery test.
- **Rendering `leadAttorneys` directly** (it's a reference object, not data — will print `[object Object]`). Resolve with `getEntries()`.
- **Putting a phone number anywhere** (D-08). `SITE.phone` is for LegalService JSON-LD only.
- **Hardcoding hex colors** instead of namespace utility tokens.
- **Making "FAQ rich result appears in Google" a success criterion** — impossible since 2026-05-07 (Pitfall 2).
- **Committing FAQ copy before Jon's review** (D-13 hard gate).
- **Inventing Iris's bar year/jurisdiction** to satisfy the min-1 schema (D-05) — use the placeholder-entry workaround (Pitfall 3).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| JSON-LD object shape | Hand-written `<script>` JSON string | `schema-dts` typed builders in `src/lib/jsonld.ts` | A typo in `knowsAbout` becomes a silent SEO bug; schema-dts makes it a TS error. Existing `buildLegalServiceLd` is the pattern. |
| `<script type=ld+json>` rendering + escaping | Inline `set:html` in each layout | Existing `JsonLd.astro` | Already handles `JSON.stringify` escaping of `<`/`>`/`&`/U+2028 per spec |
| Per-page disclaimer text | Hardcoded disclaimer strings in layouts | Existing `<Disclaimer id="..." />` (collection-driven) | One edit updates site-wide; already plumbed and tested |
| FAQ accordion (expand/collapse, keyboard) | New JS widget | Existing `FaqAccordion` (native `<details>`, zero JS) | Already keyboard-accessible and tested |
| Deal grid / fee band / testimonial / CTA layout | New components | Existing `DealsGrid`/`FeeStructureBand`/`TestimonialQuote`/`CtaBlock` | Built and gallery-tested in Phase 2 |
| Banned-term scanning | A remark/ESLint MDX plugin | A ~40-line Node script over `src/content/**/*.mdx` (see below) | A remark plugin is overkill for "grep 3 words with an allowlist + word boundaries"; a stdlib script is simpler, has zero new deps, and is trivial to run in CI. ESLint-on-MDX adds parser/config complexity Jon would have to maintain. |

**Key insight:** This phase's surface area for *new* code is tiny: two JSON-LD builder functions and one content-lint script. Everything else is data (MDX) and composition (wiring existing components into the two layouts). Resist building anything that already exists.

### Recommended `lint:legal` approach (LEGAL-03 / D-16)

A plain Node script is the prescriptive choice over a remark/ESLint plugin:
- Scans `src/content/**/*.mdx` (and optionally `disclaimers.json` text) for case-insensitive, **word-boundary** matches of the banned roots.
- Banned roots: `specialist`, `specialists`, `specialize`, `specializes`, `specialized`, `specializing`, `specialization`, `expert`, `experts`, `expertise`. Use a regex with `\b` boundaries: e.g. `/\b(special(?:ist|ists|ize[sd]?|izing|ization)|experts?|expertise)\b/gi`. **Decide explicitly** whether "expertise" is banned — California Rule 7.4's concern is communicating that a lawyer is a "certified specialist"/"expert" in a field absent State Bar certification; "expertise" as a noun is a grey area. **Recommendation:** ban `expert`/`experts` and the `special*` family by default; treat `expertise` as allowlist-reviewed (flag it but let an allowlist entry permit specific reviewed phrasings). Surface the exact decision to Jon — it is a compliance judgment, not a code default. **[ASSUMED]** on the precise word set; confirm with Jon (he is the attorney of record).
- Allowlist: a small JSON map of `{ phrase, file, reason }` so a legitimately-reviewed phrase (e.g., a quoted testimonial, or "team of elite specialists" if Jon keeps that FIRM_BRIEF phrasing) does not fail the build. Match allowlist by exact phrase + file so a blanket word isn't globally whitelisted.
- Exit code: non-zero on any non-allowlisted hit, printing file + line + matched term. Wire as a CI step **and** ideally as a `prebuild`/`build` predecessor so success criterion 4 ("runs in CI and fails the build") holds.
- **FIRM_BRIEF flag:** FIRM_BRIEF.md line 174 uses "a team of elite **specialists**" describing how BSV curates outside counsel. If any of that phrasing makes it into site copy, it must be an explicit allowlist entry with Jon's sign-off, or rephrased. The lint scans `src/content`, not `.planning`, so the brief itself is safe — but watch for the phrase migrating into a practice page.

## Common Pitfalls

### Pitfall 1: Schema field names ≠ component prop names (silent render breakage)
**What goes wrong:** The content schema and the Phase 2 components use **different field names**. Passing schema data straight into a component renders nothing or `undefined`.
**The mismatches (verified against both files):**
| Component | Component prop shape | Schema field | Adapter needed |
|-----------|---------------------|--------------|----------------|
| `FaqAccordion` | `items: { q, a }[]` | `practiceAreas.faqs: { question, answer }[]` | map `{question→q, answer→a}` |
| `DealsGrid` | `deals: { title, amount?, context? }[]` | `attorneys.representativeDeals: { parties, value?, role?, cleared }[]` **and** `practiceAreas.representativeDeals: string[]` | map `{parties→title, value→amount, role→context}`; for practice strings build `{title: str}` |
| `TestimonialQuote` | `quote, attribution, attributionDetail?` + `disclosure` slot | `testimonials: { quote, attribution, role, matter? }` | map `role`/`matter` → `attributionDetail`; pass `<Disclaimer>`/disclosure text into the `disclosure` slot |
**Why it happens:** The components were built in Phase 2 from the design gallery's own placeholder shapes, before the content schema field names were finalized.
**How to avoid:** Build the adapter mapping in the layout frontmatter (or a small `src/lib/adapters.ts`), not inside the components. Verify with the `data-component` markers the gallery test already relies on.
**Warning signs:** Empty deal cards, blank FAQ answers, `[object Object]` in output.

### Pitfall 2: FAQPage no longer yields a Google rich result (frame success correctly)
**What goes wrong:** A plan or test asserts "FAQ rich result shows in Google" — which is **impossible as of 2026-05-07**. Google fully ended FAQ rich results for all site types on that date (after restricting them to gov/health sites in Aug 2023). [VERIFIED: Google Search Central blog + Search Engine Land + Search Engine Journal, May 2026]
**Why it matters here:** PRAC-08/SEO-05 still REQUIRE the markup — but its value is **AEO** (AI answer engines: ChatGPT, Perplexity, Google AI Overviews), where FAQPage has one of the highest citation rates of any schema type, and pages with it are reported ~3.2× more likely to surface in AI Overviews. FAQPage remains a valid Schema.org type; unused structured data does not harm Search.
**How to avoid:** Success criterion = "valid, parseable `FAQPage` JSON-LD present on each practice page, with `mainEntity` Question/Answer pairs matching the visible FAQ." Do NOT make a Google rich-result snippet a gate. The Google Rich Results Test (Phase 7 SEO-10) should be run against **Person** + **LegalService** + **Article**; for FAQPage use the schema.org validator (validator.schema.org) to confirm validity, since Google's Rich Results Test will no longer report FAQ enrichment.

### Pitfall 3: `barAdmissions` min-1 vs. Iris "to be confirmed" (D-05)
**What goes wrong:** Schema is `z.array(z.string()).min(1)`. An empty array fails the build; inventing "California 2022" violates D-02/D-05.
**How to avoid (recommended):** Use a single, clearly non-committal placeholder string entry, e.g. `["Bar admission details to be confirmed"]`. This satisfies min-1 without asserting a false jurisdiction/year, and renders as visibly provisional text on the page. The bio prose should likewise omit any admission claim. **Flag to Jon** at review so he supplies the real admission. (Alternative — relaxing the schema to allow an empty array for associates — is a schema change with blast radius across all attorneys and the zod-negative test; the placeholder string is lower-risk and reversible.) **[ASSUMED]** that a placeholder string is acceptable to Jon — confirm at review (it is a compliance-adjacent display decision).

### Pitfall 4: Susan Jiang draft exclusion must hold across route, sitemap, AND links (ATTY-06/D-07)
**What goes wrong:** `draft:true` keeps her out of `getStaticPaths` (no `/attorneys/susan-jiang` page), but a hardcoded link or sitemap entry could still leak her.
**How to avoid:** (a) `draft:true` in her frontmatter (route already filters), (b) confirm `@astrojs/sitemap` does not emit a page that was never built (it won't — no route, no URL), (c) ensure the attorneys **index** page (Phase 3) and any cross-links filter `draft` too. Validation: a test asserting no `/attorneys/susan-jiang` route exists and her slug is absent from `sitemap.xml`. Note: Phase 3 PAGES-05 success criterion lists all five attorneys in the homepage row "Belcher, Smolen, Van Loo, Zhang, Jiang" — reconcile whether the homepage row shows a draft Jiang card (without a working profile link) or excludes her; **flag this to the planner** — it is a cross-phase consistency question (D-07 says "not linked"; the Phase 3 criterion lists her). Recommend: show her on the row as "bio coming soon" with **no link**, or exclude until live — Jon decides.

### Pitfall 5: `representativeDeals` cleared-flag vs. clearance register drift (LEGAL-04)
**What goes wrong:** The `attorneys` schema has a per-deal `cleared: boolean`, but the **authoritative** clearance source is `.planning/CLIENT_DISCLOSURE_CLEARANCE.md`. A deal marked `cleared:true` in MDX that is NOT in the register is a Rule 1.6 risk.
**How to avoid:** D-15 clears Aaron's complete list on the basis it is already public on bsvlaw.com. Add the clearance row(s) to the register BEFORE publishing, then set `cleared:true` only for register-listed names. Consider a validation test that cross-checks cleared deal names against the register (see Validation Architecture). The 64-deal list names ~60+ counterparties — D-15 clears them en masse as "already public on the firm's current site"; the register entry should reference the bsvlaw.com URL as the basis rather than enumerating all 60 individually (acceptable per D-15 wording).

### Pitfall 6: Astro 6 string-slug params (Pitfall 12, already handled)
**What goes wrong:** Astro 6 requires `getStaticPaths` params to be strings; a number/object 500s the build.
**How to avoid:** Already correct in both routes (`params: { slug: entry.data.slug }`). No action — just don't regress it.

## Code Examples

### `buildPersonLd()` — implement the stub (ATTY-09 / SEO-03)
```typescript
// src/lib/jsonld.ts — replace the throwing stub
import type { CollectionEntry } from 'astro:content';
import type { Person, WithContext } from 'schema-dts';

export function buildPersonLd(
  attorney: CollectionEntry<'attorneys'>,
): WithContext<Person> {
  const d = attorney.data;
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: d.name,
    jobTitle: d.title,                          // 'Partner' | 'Associate' | 'Counsel'
    url: `${SITE.baseUrl}/attorneys/${d.slug}`,
    worksFor: { '@type': 'Organization', name: SITE.name, url: SITE.baseUrl },
    alumniOf: d.education.map((e) => ({
      '@type': 'EducationalOrganization' as const,
      name: e.school,
    })),
    knowsAbout: d.focus.split(/[;,]/).map((s) => s.trim()).filter(Boolean),
    // sameAs: only if a real, verified LinkedIn/profile URL exists — D-02 no fabrication.
    // Omit sameAs entirely if none; do NOT invent a profile URL.
    email: d.email,                             // mailto-safe; D-08 email-only
  };
}
```
[VERIFIED: schema-dts@2.0.0 Person type supports jobTitle/alumniOf/knowsAbout/sameAs/worksFor; CITED: schema.org/Person]. **Note `sameAs`:** D-02 forbids fabrication — only include `sameAs` if a real attorney LinkedIn/bio URL is confirmed at review; otherwise omit the property.

### `buildFaqPageLd()` — new builder (PRAC-08 / SEO-05)
```typescript
// src/lib/jsonld.ts — NEW
import type { FAQPage, WithContext } from 'schema-dts';

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
[CITED: schema.org/FAQPage; Google Search Central FAQPage doc — markup still valid post-2026-05-07, used for AEO not rich results]. Guard against empty `faqs` (don't emit an empty `mainEntity` block on pages with no FAQs).

### `lint:legal` Node script skeleton (LEGAL-03 / D-16)
```javascript
// scripts/lint-legal.mjs  (no new dependency — Node 22 stdlib)
import { readFileSync } from 'node:fs';
import { glob } from 'node:fs/promises'; // Node 22 native glob
// Banned roots (confirm exact set with Jon — see Don't Hand-Roll note):
const BANNED = /\b(special(?:ist|ists|ize[sd]?|izing|ization)|experts?|expertise)\b/gi;
// Allowlist: [{ phrase, file, reason }] reviewed + signed off by Jon
import allow from './lint-legal.allowlist.json' with { type: 'json' };
// ... iterate src/content/**/*.mdx, match per line, subtract allowlisted phrases,
//     print file:line:term for each violation, process.exit(violations ? 1 : 0)
```
Then `package.json`: `"lint:legal": "node scripts/lint-legal.mjs"` and add to the CI workflow / `prebuild`. [ASSUMED] Node 22 `fs/promises` `glob` availability — verify; fall back to a small manual recursive readdir if the import is unstable on the CI Node image.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| FAQPage earns Google rich-result snippets | FAQPage earns **no** Google rich result; value is AEO/AI citation only | 2023-08 (restricted to gov/health) → **2026-05-07 (ended entirely)** | Keep the markup (PRAC-08), but frame success as "valid schema for AI search," not "rich snippet in Google" |
| Astro legacy `slug` API + `entry.render()` | `render(entry)` from `astro:content`; `getEntries()` for references; string `getStaticPaths` params | Astro 5→6 | Codebase already on the current API — no migration needed |
| schema-dts 1.x | schema-dts 2.0.0 | — | Installed; CLAUDE.md's 1.1.0 reference is stale — 2.0.0 is authoritative |

**Deprecated/outdated:**
- **Google FAQ rich results** — gone for everyone as of 2026-05-07. Do not chase them.
- **CLAUDE.md `schema-dts 1.1.0` line** — superseded by installed `2.0.0`.

## Runtime State Inventory

> Not a rename/refactor/migration phase — greenfield content addition. Most categories N/A.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — no datastore; content is static MDX | None (verified: no DB in stack this phase) |
| Live service config | None — Vercel deploy reads from git only | None |
| OS-registered state | None | None |
| Secrets/env vars | None — no secrets touched (Person/FAQ JSON-LD use static `SITE` constants) | None |
| Build artifacts | Placeholder MDX (`placeholder-attorney.mdx`, `placeholder-practice.mdx`) become stale once real content lands | **Delete** both placeholder MDX files when real content is added, so they don't generate stray `/attorneys/placeholder-attorney` etc. (they are `draft:true` so currently excluded, but should be removed for cleanliness) |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Exact banned-term word set (whether "expertise" is banned vs. allowlisted) | Don't Hand-Roll / lint:legal | A too-broad list false-fails the build on a legitimate word; too-narrow misses a Rule 7.4 violation. Jon (attorney of record) must confirm the list — compliance judgment, not a code default. |
| A2 | A placeholder string `"Bar admission details to be confirmed"` is acceptable to satisfy Iris's min-1 `barAdmissions` | Pitfall 3 | If Jon rejects it, fallback is a schema change (broader blast radius). Confirm at review. |
| A3 | Partner email pattern `firstname@bsvlaw.com` and `intake@bsvlaw.com` for the firm | User Constraints (D-08) | Wrong address = dead `mailto:`. D-08 already flags Jon confirms each at review. |
| A4 | Node 22 native `fs/promises` `glob` is available on the CI Node image | Code Examples (lint script) | If unavailable, use recursive `readdir` fallback — trivial. |
| A5 | D-15 en-masse clearance (reference bsvlaw.com URL, not enumerate 60+ counterparties) satisfies LEGAL-04 | Pitfall 5 | If reviewer wants each name enumerated, register entry expands. D-15 wording supports the URL-basis approach. |

**If empty:** Not empty — these five items need Jon's confirmation at the review gate before they become locked.

## Open Questions

1. **Homepage Jiang card vs. "not linked" (D-07) cross-phase consistency**
   - What we know: D-07 says Susan Jiang is `draft:true`, "not linked or indexed." Phase 3 PAGES-05 criterion lists all five attorneys (including Jiang) in the homepage row.
   - What's unclear: Does the existing homepage already render a Jiang card with a link (which would break D-07), or a no-link "coming soon" treatment?
   - Recommendation: Planner should add a task to inspect the Phase 3 attorney row + index for any link to a draft attorney and ensure no working link/sitemap entry points to Jiang. Jon decides display treatment. (See Pitfall 4.)

2. **`sameAs` for Person JSON-LD**
   - What we know: D-02 forbids fabrication; sameAs wants real profile URLs (LinkedIn).
   - What's unclear: Whether the firm has canonical LinkedIn/bio URLs to cite.
   - Recommendation: Omit `sameAs` unless Jon supplies verified URLs at review. Never invent.

3. **Exact "expertise" treatment in lint** — see Assumption A1; surface to Jon.

## Environment Availability

> Phase is build-time content + a Node lint script. Minimal external dependencies.

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js ≥22.12 | Astro build + lint script | ✓ (engines pin) | ≥22.12 | — |
| `astro` | build | ✓ | 6.3.8 | — |
| `schema-dts` | JSON-LD typing | ✓ | 2.0.0 | — |
| Live bsvlaw.com pages | D-01 exact-wording re-fetch (execution task) | ✓ (public site) | — | CONTEXT `<specifics>` 64-deal list + FIRM_BRIEF as captured fallback |
| `@playwright/test` + `cheerio` | Validation tests | ✓ | 1.60.0 / 1.2.0 | — |

**Missing dependencies with no fallback:** none
**Missing dependencies with fallback:** Live bsvlaw.com re-fetch — if a page is unreachable at build, the verbatim captured content in CONTEXT.md `<specifics>` and FIRM_BRIEF.md is the authoritative fallback (still D-02-compliant: no fabrication).

## Validation Architecture

> `workflow.nyquist_validation: true` — section required.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | `@playwright/test` 1.60.0 (+ `cheerio` 1.2.0 for HTML parsing) |
| Config file | `playwright.config.ts` (exists; Phase 1) |
| Quick run command | `npx playwright test tests/<file>.spec.ts` |
| Full suite command | `npm test` (runs all specs; each builds in `beforeAll` per existing convention) |

**Existing test conventions to mirror** (from `jsonld-legalservice.spec.ts` / `disclaimer-set.spec.ts`): build once in `beforeAll`, read `dist/client/<path>/index.html`, parse with `cheerio`, assert on parsed JSON-LD. Filesystem specs read source files directly.

### Phase Requirements → Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ATTY-09 / SEO-03 | Each attorney page has valid `Person` JSON-LD with name/jobTitle/alumniOf/knowsAbout | build+parse | `npx playwright test tests/person-jsonld.spec.ts` | ❌ Wave 0 |
| PRAC-08 / SEO-05 | Each practice page has valid `FAQPage` JSON-LD; `mainEntity` Q/A count matches visible FAQs | build+parse | `npx playwright test tests/faqpage-jsonld.spec.ts` | ❌ Wave 0 |
| LEGAL-03 | `lint:legal` exits non-zero on a seeded banned term; zero on clean content; allowlist honored | unit/CLI | `npm run lint:legal` (+ a spec that runs it on a fixture) | ❌ Wave 0 |
| ATTY-11 | "Fishbien" / "Nir" appears in NO built page, sitemap, or collection | grep over `dist/` + `src/content` | `npx playwright test tests/fishbien-absent.spec.ts` | ❌ Wave 0 |
| ATTY-06 / D-07 | No `/attorneys/susan-jiang` route built; slug absent from `sitemap.xml` | build+fs | `npx playwright test tests/draft-exclusion.spec.ts` | ❌ Wave 0 |
| LEGAL-04 | Every `cleared:true` deal name resolves to a row in `CLIENT_DISCLOSURE_CLEARANCE.md` (or D-15 URL-basis) | fs cross-check | `npx playwright test tests/clearance.spec.ts` | ❌ Wave 0 |
| LEGAL-02 / ATTY-10 / PRAC-07 | `attorney` disclaimer on every attorney page; `practice-area` disclaimer on every practice page | build+parse | extend existing `disclaimer-crawl.spec.ts` | ✅ extend |
| PRAC-06 | Each practice page links to its lead attorney's profile URL | build+parse | `npx playwright test tests/lead-attorney-link.spec.ts` (or fold into faqpage spec) | ❌ Wave 0 |
| LEGAL-06 | Daniel Brian testimonial renders with the CA disclosure text | build+parse | fold into a practice-page spec asserting disclosure string present | ❌ Wave 0 |
| ATTY-01/PRAC-01 | All four published attorneys + three practice pages return 200 with correct slugs | build+fs | `npx playwright test tests/pages-exist.spec.ts` | ❌ Wave 0 |
| (schema validity) | Built attorney/practice MDX validate against Zod | build | `npm run build` + `npm run check` (`astro check`) | ✅ scripts exist |

### Sampling Rate
- **Per task commit:** `npm run check` (astro check + Zod) + `npm run lint:legal` (fast, no build) + the single relevant spec.
- **Per wave merge:** `npm test` (full Playwright suite).
- **Phase gate:** Full suite green + `npm run lint:legal` clean + manual review of FAQ copy (D-13 gate) before `/gsd:verify-work`.

### Wave 0 Gaps
- [ ] `tests/person-jsonld.spec.ts` — covers ATTY-09 / SEO-03
- [ ] `tests/faqpage-jsonld.spec.ts` — covers PRAC-08 / SEO-05 (validity, not rich-result)
- [ ] `tests/lint-legal.spec.ts` + fixture — covers LEGAL-03
- [ ] `tests/fishbien-absent.spec.ts` — covers ATTY-11
- [ ] `tests/draft-exclusion.spec.ts` — covers ATTY-06 / D-07
- [ ] `tests/clearance.spec.ts` — covers LEGAL-04
- [ ] `tests/pages-exist.spec.ts` — covers ATTY-01 / PRAC-01
- [ ] Extend `tests/disclaimer-crawl.spec.ts` to assert per-page disclaimers (LEGAL-02)
- [ ] Add `package.json` test scripts mirroring the existing naming (`test:person-jsonld`, etc.)
- [ ] Framework install: none — Playwright + cheerio already present

## Security Domain

> `security_enforcement: true`, `security_asvs_level: 1`. This phase ships **static content only** — no forms, no user input, no secrets, no runtime code. The attack surface is minimal; the dominant "security" concern here is **legal/ethics compliance** (confidentiality + advertising rules), not application security.

### Applicable ASVS Categories (Level 1)

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth surface this phase |
| V3 Session Management | no | Static pages, no sessions |
| V4 Access Control | no | All content public by design |
| V5 Input Validation | partial | No runtime input. Build-time: Zod schema validates all MDX frontmatter; `JsonLd.astro` escapes JSON via `JSON.stringify` (XSS-safe for `<script>` injection) — verified in component comment |
| V6 Cryptography | no | No secrets/crypto this phase |
| V14 Config | minor | `vercel.json` CSP (report-only) already governs; no new script sources added (all components are zero-JS or Astro-bundled) — do not add inline event handlers or external scripts that would need CSP changes |

### Known Threat Patterns for this stack/phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| JSON-LD `<script>` breakout via a `</script>` in a bio/FAQ string | Tampering / XSS | `JsonLd.astro` uses `JSON.stringify` (escapes `<`/`>`/`&`/U+2028) — already safe; do not bypass it with raw `set:html` |
| Confidential client name published without clearance | Information Disclosure (Rule 1.6) | `CLIENT_DISCLOSURE_CLEARANCE.md` gate + `clearance.spec.ts` cross-check (LEGAL-04) |
| Misleading advertising ("expert"/"specialist") | Compliance (CA Rule 7.4) | `lint:legal` build gate (LEGAL-03) |
| Outcome/guarantee language | Compliance (CA Rule 7.1 / LEGAL-10) | Copy audit + `attorney`/`practice-area` disclaimers already state "does not guarantee a particular outcome" / "prior results do not guarantee a similar outcome" (footer) |
| Inadvertent PII/contact harvesting | Information Disclosure | Email-only (D-08); no phone; consider that `mailto:` exposes addresses to scrapers — acceptable per D-08, but the addresses are role/partner addresses the firm already publishes |

### California advertising-rule notes (the real "security" work this phase)

- **Rule 7.4 (Communication of Fields of Practice / Specialization):** A lawyer shall not state or imply they are a "certified specialist" in a field unless certified by the State Bar's Board of Legal Specialization (or an approved org) AND the certifying org is named. Practical effect for copy: avoid "specialist"/"specialize"/"expert" unless allowlisted with Jon's review. **Stuart's "registered to practice before the U.S. Patent and Trademark Office (USPTO)"** is a factual registration statement, not a specialization claim — **Rule 7.4-safe** (contains no banned term) [CITED: CONTEXT D-16; FIRM_BRIEF line 58]. [ASSUMED] on the precise current Rule 7.4 text — confirm with Jon, the attorney of record, before locking the banned-term list.
- **Rule 7.1 (No false or misleading communications):** FAQ answers and bio copy must be accurate and not create unjustified expectations. No outcome predictions, no "we win," no "results."
- **Testimonial / endorsement disclosure (LEGAL-06, D-18):** California permits client testimonials but they must not be false/misleading and, where they could create an unjustified expectation, should carry a disclaimer. The footer already carries "Prior results do not guarantee a similar outcome." For the Daniel Brian testimonial specifically, render an adjacent disclosure via the `TestimonialQuote` `disclosure` slot — recommended wording: **"This testimonial reflects one client's experience and is not a guarantee of any future result. Prior results do not guarantee a similar outcome."** [ASSUMED] exact CA-required wording — Jon confirms final language at review (LEGAL-05 advertising notation is a Phase 7 item; this is the testimonial-specific disclosure). Use the existing `disclosure` slot on `TestimonialQuote` — it was reserved in Phase 2 for exactly this.

> **Confidence flag:** The legal-rule citations above are [ASSUMED] from training knowledge of the California Rules of Professional Conduct, not freshly verified against the State Bar's current published text. Jon Van Loo is the attorney of record and the authoritative source — present the banned-term list and the testimonial disclosure wording to him for confirmation (the workflow already has a review gate, D-13/D-19).

## AEO / FAQ Authoring Guidance (for the drafter — PRAC-08 / D-12)

The planner should hand this to whoever drafts the FAQs (drafts go to Jon for approval, D-13, before commit).

**Format (per LAW_FIRM_WEBSITE_GUIDE Part 3):** question as a subheading, a direct **2–3 sentence** complete answer immediately below. Plain English, no jargon, answer the question fully (don't tease a call). 3–5 FAQs per practice area.

**Rule 7.1/7.4/LEGAL-10 guardrails for every answer:** no "expert"/"specialist"/"specialize"; no outcome guarantees; no "results"; no creating an unjustified expectation; factual and general (not advice for a specific matter).

**Candidate questions by practice area** (drafts — Jon edits/approves):
- **M&A:** "How much does an M&A lawyer cost?" (answer with the hourly + estimate model, no rate) · "When in a deal should a company bring in M&A counsel?" · "What's the difference between an asset sale and a stock sale?" · "How long does a typical middle-market M&A deal take?"
- **IP & Technology Transactions:** "What's the difference between an inbound and outbound technology license?" · "When should a startup file for patent protection?" · "What is open-source compliance and why does it matter in a deal?" · "What does it mean that an attorney is registered to practice before the USPTO?" (ties to Stuart's factual credential — Rule 7.4-safe framing)
- **Tax:** "What is a tax-free reorganization?" · "How is cryptocurrency taxed in an M&A transaction?" · "What tax issues arise when using crypto as compensation?" · "Do I owe U.S. tax if I expatriate?"

These map to Jon's/Stuart's actual focus areas (FIRM_BRIEF) so they reinforce topical authority for AEO. The "how much does it cost" answer should align with the FeeStructureBand copy (hourly + estimate, no published rate).

## Sources

### Primary (HIGH confidence)
- **Codebase** — `src/content.config.ts`, `src/lib/jsonld.ts`, `src/lib/site.ts`, both `[slug].astro` routes, both layouts, all six section components, `JsonLd.astro`, `Disclaimer.astro`, `disclaimers.json`, `package.json`, existing test specs. (Field contracts, prop shapes, slot reservations — directly read.)
- **npm registry** — `astro@6.3.8`, `schema-dts@2.0.0` confirmed current 2026-05-27 (`npm view`).
- **Google Search Central** — [FAQPage structured data doc](https://developers.google.com/search/docs/appearance/structured-data/faqpage) + [Aug 2023 HowTo/FAQ changes blog](https://developers.google.com/search/blog/2023/08/howto-faq-changes).

### Secondary (MEDIUM confidence)
- [Search Engine Land — rise and fall of FAQ schema](https://searchengineland.com/faq-schema-rise-fall-seo-today-463993) and [Search Engine Journal — Google drops FAQ rich results](https://www.searchenginejournal.com/google-drops-faq-rich-results-from-search/574429/) — corroborate the 2026-05-07 full removal (multiple independent trackers agree).
- [schema.org/Person](https://schema.org/Person) and [schema.org/FAQPage](https://schema.org/FAQPage) — property definitions.
- [Astro Content Collections docs](https://docs.astro.build/en/guides/content-collections/) — `getEntries()` reference resolution, `render()`, `getStaticPaths` patterns (also confirmed by the working codebase routes).
- `.planning/LAW_FIRM_WEBSITE_GUIDE.md` Part 3 (AEO/FAQ format), Part 5 (disclaimers).

### Tertiary (LOW confidence — flagged for Jon's confirmation)
- California Rule 7.1 / 7.4 specifics and the exact testimonial-disclosure wording — [ASSUMED] from training; Jon (attorney of record) is authoritative and confirms at the review gate.

## Metadata

**Confidence breakdown:**
- Standard stack / architecture: HIGH — directly verified against the codebase; routes/components/JSON-LD plumbing already exist and pass tests.
- FAQPage/Google rich-result status: HIGH — current (May 2026) and corroborated by multiple sources.
- JSON-LD field shapes: HIGH — schema-dts typed + schema.org cited; existing `buildLegalServiceLd` is the working pattern.
- Rule 7.1/7.4 + testimonial-disclosure exact wording: LOW — [ASSUMED]; deliberately gated behind Jon's review (D-13/D-19).
- lint:legal banned-term word set: MEDIUM — approach is solid; exact word list is a Jon-confirmed compliance judgment.

**Research date:** 2026-05-27
**Valid until:** 2026-06-26 (stack stable; the only fast-moving item — Google FAQ rich-result policy — already bottomed out at "fully removed," so unlikely to reverse soon)
