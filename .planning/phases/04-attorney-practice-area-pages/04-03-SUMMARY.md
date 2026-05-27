---
phase: 04-attorney-practice-area-pages
plan: 03
subsystem: practice-area-pages
tags: [content, mdx, practice-areas, storybrand, faqpage-json-ld, testimonial, deals-grid, fee-band, compliance, aeo]
requires:
  - buildFaqPageLd(faqs) — FAQPage JSON-LD builder (Plan 01)
  - src/content.config.ts practiceAreas + testimonials schemas
  - src/components/sections/{DealsGrid,TestimonialQuote,FeeStructureBand,FaqAccordion,CtaBlock}.astro
  - src/content/attorneys/{aaron-belcher,stuart-smolen,jon-van-loo}.mdx (Plan 02 — leadAttorneys targets)
provides:
  - Three published practice-area pages at /practice-areas/<slug> (M&A, IP & Tech, Tax)
  - Daniel Brian / Athelas–Commure testimonial entry (M&A, featured)
  - Fully rendered PracticeAreaLayout (problem→solution→proof→fee band→CTA→disclaimer, guarded FAQPage)
  - FAQ-DRAFT.md — 3–5 non-promissory FAQs per area staged for Jon's D-13 approval
affects:
  - Plan 04 (04-04) — commits Jon-approved FAQ copy into the MDX faqs: arrays; un-guards FaqAccordion/FAQPage
  - Homepage/index practice links (Phase 3) now resolve to these detail routes
tech-stack:
  added: []
  patterns:
    - getEntries() cross-collection reference resolution for leadAttorneys (raw refs render [object Object])
    - getCollection('testimonials').find(featured && practiceArea.id === entry.id) for the M&A-only testimonial
    - schema-field → component-prop adapters (DealsGrid string[]→{title}, FaqAccordion {question,answer}→{q,a})
    - guarded JSON-LD + accordion emission on faqs.length (human-gated content)
    - CA testimonial disclosure via TestimonialQuote disclosure named slot
key-files:
  created:
    - src/content/practiceAreas/mergers-acquisitions.mdx
    - src/content/practiceAreas/intellectual-property-technology-transactions.mdx
    - src/content/practiceAreas/tax.mdx
    - src/content/testimonials/daniel-brian.mdx
    - .planning/phases/04-attorney-practice-area-pages/FAQ-DRAFT.md
  modified:
    - src/layouts/PracticeAreaLayout.astro
    - tests/pages-exist.spec.ts
    - tests/lead-attorney-link.spec.ts
  deleted:
    - src/content/practiceAreas/placeholder-practice.mdx
    - src/content/testimonials/placeholder.mdx
decisions:
  - "M&A deal grid uses a curated 10-deal subset of Aaron's en-masse-cleared list (LEGAL-04 / D-09); IP & Tax representativeDeals [] (D-10)"
  - "FAQs drafted to FAQ-DRAFT.md only; MDX faqs: [] left empty pending Jon's D-13 approval (committed in Plan 04-04)"
  - "CA testimonial disclosure wording per RESEARCH/PATTERNS, rendered in the disclosure slot (D-18) — Jon confirms final language at review"
metrics:
  duration: ~41m
  completed: 2026-05-27
---

# Phase 4 Plan 03: Practice-Area Pages Summary

Shipped the practice-area vertical slice: three real practice MDX files (Mergers
& Acquisitions, Intellectual Property & Technology Transactions, Tax), the Daniel
Brian / Athelas–Commure testimonial, and a fully rendered `PracticeAreaLayout`
that runs the StoryBrand arc — client problem → BSV's team solution → MDX
narrative → proof (lead-partner callout linking to the profile; M&A also gets the
cleared deal grid and the disclosed testimonial) → one consistent fee band → CTA
→ practice-area disclaimer. FAQPage JSON-LD is wired but guarded on empty `faqs`.
The 3–5 FAQs per practice area were drafted to `FAQ-DRAFT.md` for Jon's D-13
approval gate and were **not** written into the MDX.

## What was built

### Task 1 — Three practice MDX + Daniel Brian testimonial — commit `dce2484`
- **mergers-acquisitions.mdx**: StoryBrand `clientProblem` (deal in motion, fear of
  slow/unfamiliar counsel) + `bsvApproach` (partner-level senior team); a curated
  10-deal `representativeDeals` string array drawn from Aaron's en-masse-cleared
  list (Athelas/Commure $6B, Mode Analytics $200M, Illumina/Roche $6.4B defense,
  Commure/Memora, Uniswap/Guidestar, Docker/Nestybox, Carbon Health/Steady Health,
  Coinbase/Cipher Browser, Compellent/Dell $1B, Oracle/Taleo $2B); `leadAttorneys:
  ["aaron-belcher"]`; `feeStructureBand: true`; `order: 1`.
- **intellectual-property-technology-transactions.mdx**: problem/solution for IP &
  tech (patents, licensing, open-source, software/data); `representativeDeals: []`
  (D-10 — no grid); `leadAttorneys: ["stuart-smolen"]`; `order: 2`. USPTO credential
  phrased factually (Rule 7.4-safe).
- **tax.mdx**: problem/solution for transaction/crypto tax; `representativeDeals: []`
  (D-10); `leadAttorneys: ["jon-van-loo"]`; `order: 3`. "Recognized thought leader"
  phrasing used (allowed; not a banned Rule 7.4 term).
- **daniel-brian.mdx**: verbatim quote "BSV was my rock throughout the $6 billion
  merger between Athelas and Commure.", attribution "Daniel Brian", role "GC,
  Commure, Inc.", matter "Athelas–Commure merger", `practiceArea:
  "mergers-acquisitions"`, `featured: true`.
- All MDX `faqs: []` (D-13 — FAQ copy committed in Plan 04 only after Jon approves).
- No outcome/guarantee/"results" language in any problem/solution prose (LEGAL-10).
- Deleted `placeholder-practice.mdx` + `placeholder.mdx`.
- Verify: `npx astro check` → 0 errors; `npm run lint:legal` → exit 0 clean.

### Task 2 — PracticeAreaLayout render-out + FAQ drafts — commit `f486fef`
- Imported `getEntries`/`getCollection` (astro:content), `JsonLd`, `buildFaqPageLd`,
  and the five section components.
- **Lead-partner callout (PRAC-06):** `const leads = await getEntries(d.leadAttorneys)`
  → renders each lead as `<a href={`/attorneys/${lead.data.slug}`}>` so the reference
  resolves (raw refs would print `[object Object]`).
- **StoryBrand composition:** header → "The problem you're facing" (`clientProblem`)
  → "How BSV's team helps" (`bsvApproach`) → MDX `<slot/>` → lead-partner callout.
- **M&A-only proof:** `DealsGrid` rendered only when `representativeDeals.length > 0`
  (`map(s => ({title: s}))`); testimonial resolved via
  `getCollection('testimonials').find(t => t.data.featured && t.data.practiceArea?.id === practiceArea.id)`
  and rendered with the CA disclosure in `<p slot="disclosure">` (LEGAL-06 / D-18).
  IP & Tax render neither (verified empty in built HTML).
- **Fee band (PRAC-09 / LEGAL-08):** one consistent `FeeStructureBand heading="How we
  bill"` — hourly + up-front estimate, NO published rate — on all three pages.
- **FAQPage guard (SEO-05 / PRAC-08):** `{d.faqs.length > 0 && <JsonLd slot="head"
  data={buildFaqPageLd(d.faqs)} />}` and `FaqAccordion` only when `faqItems.length > 0`
  (`faqs.map(f => ({q: f.question, a: f.answer}))`). Both currently no-op (faqs empty).
- Closed with a `CtaBlock ctaHref="/contact"` and kept `<Disclaimer id="practice-area" />`.
  Token-only utilities; no hardcoded hex (grep-verified 0).
- **FAQ-DRAFT.md:** drafted 5 M&A, 4 IP & Technology, and 4 Tax FAQs — plain-English,
  2–3 sentence, non-promissory (Rule 7.1/7.4/LEGAL-10: no expert/specialist/specialize,
  no guarantees, no "results"). The "how much does it cost" answer aligns with the fee
  band (hourly + estimate, no rate). Marked "PENDING JON'S APPROVAL — D-13 gate (Plan
  04)". No FAQs written into any MDX.
- Un-skipped two now-satisfiable specs: the practice portion of `pages-exist.spec.ts`
  and `lead-attorney-link.spec.ts`.
- Verify: `npm run build` emits all three practice pages; `pages-exist` + `lead-attorney-link`
  → 3 passed, 0 failed.

## Deviations from Plan

None — plan executed exactly as written. (The `tests/pages-exist.spec.ts` and
`tests/lead-attorney-link.spec.ts` un-skips were the planned UNSKIP-WHEN actions
from the Plan 01 scaffolds, not deviations.)

## Compliance notes for Jon (review gate)
- **FAQ drafts (D-13 — hard gate):** `FAQ-DRAFT.md` holds 13 draft FAQs across the
  three practice areas. None are published. Review and edit; once you approve, the
  final set is committed into each MDX `faqs:` array in **Plan 04-04**.
- **CA testimonial disclosure (D-18):** the Daniel Brian testimonial renders the
  recommended disclosure — "This testimonial reflects one client's experience and is
  not a guarantee of any future result. Prior results do not guarantee a similar
  outcome." Confirm this is the wording you want at review.
- **M&A deal-grid curation (D-09):** the grid shows a curated 10-deal subset of Aaron's
  list (all en-masse-cleared in Plan 01's register). Tell us if you want more, fewer,
  or different deals featured on the practice page.
- **Partner email / bar items** from Plan 02 still pending your confirmation (unchanged).

## Known Stubs
- **MDX `faqs: []`** on all three practice pages is an intentional human-gated stub
  (D-13). The FAQPage JSON-LD and the FaqAccordion are wired and guarded; they
  activate automatically once the approved FAQ copy lands in the MDX in Plan 04-04.
  This is documented and goal-aligned, not a goal-blocking stub.

## Threat Flags
None. No new network endpoints, auth paths, file access, or schema changes — static
MDX content + render only. Deal/FAQ strings flowing into FAQPage JSON-LD are
`JSON.stringify`-escaped by the existing `JsonLd.astro` (T-04-14 accept); the M&A
deal names are register-cleared (T-04-10 mitigate); the testimonial carries the CA
disclosure (T-04-11 mitigate); FAQ copy is behind the D-13 gate (T-04-12 mitigate);
`lint:legal` gate covers Rule 7.4 prose (T-04-13 mitigate).

## Self-Check: PASSED
- Files created — verified on disk: mergers-acquisitions.mdx,
  intellectual-property-technology-transactions.mdx, tax.mdx, daniel-brian.mdx,
  FAQ-DRAFT.md; placeholders removed.
- PracticeAreaLayout.astro contains `getEntries` and a `faqs.length` guard around
  `buildFaqPageLd`; 0 hardcoded hex.
- Build emits dist/client/practice-areas/{mergers-acquisitions,intellectual-property-technology-transactions,tax}/index.html.
- M&A HTML: DealsGrid present, Daniel Brian quote present, full CA disclosure string
  present, link to /attorneys/aaron-belcher present. IP & Tax: no DealsGrid, no
  TestimonialQuote (node-verified).
- MDX `faqs:` arrays still `[]` (no FAQ copy committed); FAQ-DRAFT.md carries the
  PENDING APPROVAL marker.
- Commits exist: dce2484 (Task 1), f486fef (Task 2).
- `npx astro check` → 0 errors; `npm run lint:legal` → exit 0; pages-exist +
  lead-attorney-link specs → 3 passed / 0 failed.
