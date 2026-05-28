# Phase 4: Attorney & Practice Area Pages - Context

**Gathered:** 2026-05-27
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase fills the **already-scaffolded** content collections and layouts with
real content and ships the Rule 7.4 compliance guard. A prospective client can
open a full profile for each of the four published attorneys and read each of the
three practice-area pages (problem → BSV's team solution → proof → FAQ → fee band),
with `Person` and `FAQPage` structured data, per-page disclaimers, and a build that
fails on banned Rule 7.4 copy.

**Guiding principle (locked this discussion):** **Replicate the current bsvlaw.com
site.** Attorney bios, the M&A testimonial, and Aaron Belcher's deal list all
transfer from the existing site. Use the content captured in
`.planning/FIRM_BRIEF.md`; re-fetch the live bsvlaw.com pages for exact wording.

**In scope:**
- Real MDX for 5 attorneys: Aaron Belcher, Stuart Smolen, Jon Van Loo, Iris Zhang
  (published) + Susan Jiang (`draft: true` placeholder)
- Real MDX for 3 practice areas: Mergers & Acquisitions, Intellectual Property &
  Technology Transactions, Tax
- Render-out of `AttorneyLayout` / `PracticeAreaLayout` to surface every field:
  email-only contact callout, deal grid (M&A only), FAQ accordion, fee band,
  disclaimers, `Person` / `FAQPage` JSON-LD
- `npm run lint:legal` real implementation (banned: "specialist", "expert",
  "specialize"; allowlist documented) replacing the Phase 1 placeholder
- Populate `.planning/CLIENT_DISCLOSURE_CLEARANCE.md` with the deals being published

**Out of scope (later / deferred):**
- Deal grids on the IP & Tech and Tax practice pages (no cleared deals there yet —
  see D-07; anonymized IP/Tax deals come later)
- Real headshots (placeholder monograms stay; ATTY-08)
- Blog posts / Article JSON-LD (Phase 5)
- Contact form backend (Phase 6)
- Susan Jiang's real bio (Jon supplies later; ships hidden until then)

</domain>

<decisions>
## Implementation Decisions

### Content Source & Fidelity
- **D-01:** **Replicate bsvlaw.com.** Bios, M&A testimonial, and Aaron's deal tags
  transfer from the current site. Primary source = `.planning/FIRM_BRIEF.md`;
  executor **re-fetches the live bsvlaw.com attorney pages for exact wording** when
  needed. Match the current site's professional tone — do not invent material.
- **D-02:** **No fabrication.** Do not invent founding stories, deal values, dates,
  or bar-admission years. If a fact is unknown, omit it or mark it as being confirmed.

### Attorney Profiles
- **D-03:** **Bios use the real bsvlaw.com text** for Aaron, Stuart, Jon, and Iris,
  matching the current site's professional tone (not a rewrite into a different voice).
- **D-04:** **Aaron Belcher — complete deal list.** Pull the FULL representative-
  transactions list exactly as published at
  `https://bsvlaw.com/team/aaron-belcher-partner/` — every deal, verbatim, none
  dropped or summarized. The complete captured list is in `<specifics>` below.
  Re-fetch to confirm wording at build time. Reuse these same deals in the M&A
  practice-area deal grid where appropriate.
- **D-05:** **Iris Zhang — bar "to be confirmed."** Do NOT invent an admission year.
  Omit the bar admission or note that admission details are being confirmed. (The
  `attorneys` schema requires `barAdmissions` min 1 — executor must resolve this
  without inventing a jurisdiction: e.g., a "to be confirmed" placeholder entry.
  Flag to Jon if the schema blocks a clean omission.)
- **D-06:** **Jon Van Loo — short representative-experience list (interim).** Instead
  of a full deal list, use exactly these three bullets (Jon will expand later):
  - Representing numerous founders and companies in tax-free and taxable sales of
    their companies to buyers for cash and stock
  - Tax-efficient structuring of cryptocurrency and other consideration in transactions
  - Advising on the tax aspects of various cryptocurrency transactions, including the
    use of cryptocurrency as compensation

  Plus a line noting Jon is a **recognized thought leader on tax issues for
  cryptocurrency** — has spoken at PLI and other venues and published articles.
  ("Thought leader" is allowed; it is not a banned Rule 7.4 term.)
- **D-07:** **Susan Jiang — clean placeholder profile** ("full bio coming soon"),
  `draft: true`, not linked or indexed, until Jon supplies her bio.

### Partner Contact Callouts
- **D-08:** **Email only — NO phone numbers anywhere on the site.** Use the firm
  email pattern `firstname@bsvlaw.com` (e.g., `jon@bsvlaw.com`, `aaron@bsvlaw.com`,
  `stuart@bsvlaw.com`, `iris@bsvlaw.com`). Jon confirms/corrects each exact address
  at review. The `phone` field stays unset for every attorney.

### Practice-Area Pages
- **D-09:** **M&A page keeps its cleared named deals + the Daniel Brian / Athelas–
  Commure testimonial**, replicating the current site. Deal grid drawn from the
  cleared M&A deals (Aaron's list, D-04).
- **D-10:** **SKIP deal grids on the IP & Technology and Tax pages for now.** The
  current site has none there and there are no cleared IP/Tax deals. These pages
  still follow problem → solution → proof, but "proof" = lead-partner callout +
  narrative (and FAQ), not a deal grid. No testimonial on IP/Tax pages (none cleared).
  Anonymized IP/Tax deals are a later addition (see Deferred).
- **D-11:** **Lead-attorney callouts:** M&A → Aaron Belcher; IP & Technology →
  Stuart Smolen; Tax → Jon Van Loo. Each links to the attorney's profile (PRAC-06).

### Practice-Area FAQs (review gate)
- **D-12:** **Claude drafts 3–5 plain-English FAQs per practice area** (M&A, IP &
  Technology, Tax) for the AEO/AI-search surface (PRAC-08 / SEO-05).
- **D-13:** **HUMAN APPROVAL GATE — FAQs are presented to Jon for review BEFORE
  they are written into MDX / committed / published.** Do not publish unreviewed
  FAQs. This is a hard stop in the execution flow.
- **D-14:** **FAQ answers must be accurate and non-promissory** — Rule 7.1 (no false
  or misleading claims), no guarantees of outcome, no results predictions
  (reinforces LEGAL-10).

### Legal / Compliance
- **D-15:** **Client-disclosure clearance (LEGAL-04):** Jon Van Loo (clearing
  partner) clears Aaron Belcher's **complete representative-transactions list as
  published on `bsvlaw.com/team/aaron-belcher-partner/`** for publication, on
  2026-05-27, on the basis that it is already public on the firm's current site
  (recorded cleared 2026-05-26). Executor adds the clearance entry/entries to
  `.planning/CLIENT_DISCLOSURE_CLEARANCE.md` referencing the bsvlaw.com source
  before publishing the deals.
- **D-16:** **Rule 7.4 lint (LEGAL-03):** real `npm run lint:legal` scans content
  for "specialist", "expert", "specialize" and fails the build on a non-allowlisted
  hit. Stuart's USPTO credential uses safe phrasing — "registered to practice before
  the U.S. Patent and Trademark Office (USPTO)" — which contains no banned term. Any
  legitimate term needing an exception is documented in the lint allowlist config.
- **D-17:** **Disclaimers (LEGAL-02):** each attorney page renders the `attorney`
  disclaimer; each practice page renders the `practice-area` disclaimer (both already
  exist in `disclaimers.json`).
- **D-18:** **Testimonial disclosure (LEGAL-06):** the Daniel Brian testimonial on
  the M&A page carries the California-required disclosure.

### Workflow / Ship expectation (operational)
- **D-19:** After building: (1) present draft FAQs for Jon's approval (D-13), then
  (2) commit, (3) push, (4) merge to `main`, (5) report the production (Vercel) URL.
  The FAQ approval gate precedes any commit of FAQ content.

### Claude's Discretion
- Exact `AttorneyLayout` / `PracticeAreaLayout` markup and how deal grids/FAQ/fee
  band compose (components already exist from Phase 2).
- `Person` JSON-LD fields (jobTitle, alumniOf, knowsAbout, sameAs) and `FAQPage`
  JSON-LD shape (SEO-03 / SEO-05) — use existing `src/lib/jsonld.ts` builders.
- Fee-structure band wording/tone (hourly + cost estimate) — reuse one consistent
  band across the three practice pages (PRAC-09 / LEGAL-08).
- How to satisfy the `barAdmissions` min-1 schema for Iris without inventing a
  jurisdiction (D-05).
- Mapping the verbose practice-area slugs and ordering of attorney/practice entries.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Live content source (re-fetch for exact wording — D-01)
- `https://bsvlaw.com/team/aaron-belcher-partner/` — Aaron's bio + COMPLETE deal
  list (D-04); cleared to publish (D-15)
- `https://bsvlaw.com/team/stuart-smolen-partner/` — Stuart's bio (confirm slug)
- `https://bsvlaw.com/team/jon-van-loo-partner/` — Jon's bio (confirm slug; deals
  overridden by D-06)
- bsvlaw.com Iris Zhang page — Iris's bio (confirm slug)

### Project charter & content source of truth
- `.planning/FIRM_BRIEF.md` — bios, the M&A deals, the Daniel Brian testimonial,
  team (no Fishbien), positioning, tone, email-only/CRM note
- `.planning/ROADMAP.md` — Phase 4 goal + 5 success criteria; phase boundaries
- `.planning/REQUIREMENTS.md` — Phase 4 covers ATTY-01..12, PRAC-01..09, SEO-03,
  SEO-05, LEGAL-02/03/04/06/08/10
- `.claude/CLAUDE.md` — non-technical lead, plain-English comms, non-negotiables
- `.planning/PROJECT.md` — positioning, StoryBrand, three client fears

### Legal / compliance
- `.planning/CLIENT_DISCLOSURE_CLEARANCE.md` — clearance register; executor adds
  Aaron's deal-list clearance (D-15) before publishing
- `.planning/LAW_FIRM_WEBSITE_GUIDE.md` — Rule 7.1/7.4, AEO/FAQ, testimonial
  disclosure, disclaimer best practices

### URL & inherited decisions (binding)
- `.planning/URL-CONVENTIONS.md` — locked attorney (`first-last`) and practice-area
  (verbose) slugs; Susan ships `draft: true`; Fishbien excluded
- `.planning/phases/03-homepage-static-pages/03-CONTEXT.md` — D-04 cleared homepage
  deals/testimonial that this phase reuses; index/teaser links resolve to these
  detail routes
- `.planning/phases/02-design-system-visual-identity/02-CONTEXT.md` — palette/type,
  section components, token namespace utilities
- `.planning/DECISIONS.md` — append D-15 clearance + Phase 4 decisions

### Code source of truth
- `src/content.config.ts` — `attorneys` / `practiceAreas` / `testimonials` /
  `disclaimers` schemas (the field contract this phase fills)
- `src/layouts/AttorneyLayout.astro`, `src/layouts/PracticeAreaLayout.astro` —
  render targets
- `src/pages/attorneys/[slug].astro`, `src/pages/practice-areas/[slug].astro` —
  dynamic routes (already filter `draft`)
- `src/components/sections/` — `DealsGrid`, `FaqAccordion`, `FeeStructureBand`,
  `TestimonialQuote`, `CtaBlock` (exist; just need real data)
- `src/lib/jsonld.ts` — `Person` / `FAQPage` builders; `src/lib/site.ts` — email
- `src/content/disclaimers/disclaimers.json` — `attorney` + `practice-area` text
- `package.json` — `lint:legal` script (currently placeholder; D-16 replaces it)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- Content collections fully defined (`src/content.config.ts`) — `attorneys` and
  `practiceAreas` schemas already model every field this phase needs (deals,
  education, faqs, leadAttorneys reference, feeStructureBand flag, draft).
- Dynamic `[slug]` routes for attorneys and practice areas exist and already
  filter `draft: true` entries from `getStaticPaths`.
- `AttorneyLayout` and `PracticeAreaLayout` exist (render-out is the work).
- Section components from Phase 2 exist with known prop shapes: `DealsGrid`,
  `FaqAccordion`, `FeeStructureBand`, `TestimonialQuote`, `CtaBlock`.
- `disclaimers.json` already contains the `attorney` and `practice-area` entries.
- Placeholder headshot SVG + monograms on disk (ATTY-08 satisfied by placeholders).

### Established Patterns
- Tailwind v4, tokens in `global.css` `@theme`; use namespace utilities
  (`text-text`, `bg-bg`, `px-gutter`), never hardcoded hex.
- `BaseLayout` injects site-wide `LegalService` JSON-LD and accepts `noindex`.
- Astro 6 `getStaticPaths` requires STRING slug params (Pitfall 12).
- `email` is required in the attorney schema (`z.string().email()`) — D-08 pattern.

### Integration Points
- New MDX files in `src/content/attorneys/` (5) and `src/content/practiceAreas/` (3),
  replacing the placeholder entries.
- `lint:legal` wired into CI (success criterion 4 requires it run in CI and fail
  the build on a violation).
- Homepage/index links from Phase 3 resolve to these detail routes once filled.

</code_context>

<specifics>
## Specific Ideas

### Aaron Belcher — COMPLETE representative-transactions list (D-04, cleared D-15)
Captured verbatim from `https://bsvlaw.com/team/aaron-belcher-partner/` on
2026-05-27. Re-fetch to confirm at build; publish all, none dropped:

- Uniswap acquired Guidestar (represented Guidestar)
- Commure acquired Memora Health (represented Commure)
- 3Cloud acquired DesignMind (represented DesignMind)
- Athelas merged with Commure in $6 billion merger (represented Athelas)
- Thoughtspot acquired Mode Analytics in $200 million transaction (represented Mode Analytics)
- Docker acquired Nestybox (represented Nestybox)
- Uniswap acquired Genie (represented Genie)
- DroneUp acquired Airmap (represented Airmap)
- Cloudinary acquired Indivio (represented Indivio)
- VerticalScope acquired Threadloom (represented Threadloom)
- Reef acquired 2ndKitchen (represented 2ndKitchen)
- Weee! acquired Ricepo (represented Ricepo)
- McGraw Hill acquired Kidaptive (represented Kidaptive)
- VMware acquired Mesh7 (represented Mesh7)
- HyperIce acquired Core Wellness (represented Core Wellness)
- Carbon Health acquired Steady Health (represented Steady Health)
- BetterWorks acquired Hyphen (represented Hyphen)
- Smarsh acquired Entreda (represented Entreda)
- OneDrop acquired Sano (represented Sano)
- Conversocial acquired Assist (represented Assist)
- Cloudera acquired Arcadia Data (represented Arcadia Data)
- IBM acquired Spanugo (represented Spanugo)
- Coinbase acquired Cipher Browser (represented Cipher Browser)
- LaunchMetrics acquired Parklu (represented LaunchMetrics)
- Byte Foods acquired Pantry (represented Pantry)
- LifeSite acquired MustBin (represented MustBin)
- Iodine merged with GoodRx (represented Iodine)
- PON acquired Faraday Bikes (represented Faraday Bikes)
- Foxit Software acquired CVISION (represented Foxit Software)
- Care.com acquired Kinsights (represented Kinsights)
- Kingdom Games acquired 4Soils (represented 4Soils)
- Dropbox corporate transaction (represented undisclosed party)
- Ooma acquired Talkatone (represented Talkatone)
- MyFitnessPal acquired Sessions (represented Sessions)
- Solar Universe acquired Gen110 (represented Gen110)
- AVG acquired Level Platforms (represented AVG)
- AVG acquired PrivacyChoice (represented AVG)
- Courier acquired FastPencil (represented FastPencil)
- Dell acquired RNA Networks (represented Dell)
- Dell acquired Kace (represented Dell)
- Applied Materials corporate/M&A matters (represented Applied Materials)
- Opera Software corporate/M&A matters (represented Opera Software)
- Riverbed corporate/M&A matters (represented Riverbed)
- Salesforce corporate/M&A matters (represented Salesforce)
- eBay acquired Concepto Creativo (represented eBay)
- eBay acquired RedLaser (represented eBay)
- Synopsys acquired Optical Research Associates (represented Synopsys)
- Alibaba.com acquired Auctiva (represented Alibaba.com)
- Zynga acquired UNOH (represented Zynga)
- Zynga acquired XPD Media (represented Zynga)
- Dell acquired SecureWorks (represented Dell)
- Compellent acquired by Dell for $1 billion (represented Dell)
- PayPal acquired Fig Card (represented PayPal)
- PayPal acquired Where, Inc. (represented PayPal)
- Adobe acquired EchoSign (represented Adobe)
- Dell acquired Force10 (represented Dell)
- Oracle acquired GoAhead (represented Oracle)
- Varian Medical Systems acquired Calypso (represented Varian Medical Systems)
- Illumina defended against Roche's $6.4 billion hostile pursuit (represented Illumina)
- Oracle acquired Taleo for $2 billion (represented Oracle)
- StubHub acquired Peekspy (represented StubHub)
- Oclaro merged with OpNext (represented Oclaro)
- Merz Pharma Group acquired Bioform Medical for $300 million (represented Merz Pharma Group)
- Sonata Software acquired Halosys (represented Sonata Software)

### Other specifics
- Jon's profile uses the 3-bullet interim list + crypto-thought-leadership line (D-06).
- M&A page reuses the Daniel Brian / Athelas–Commure testimonial (cleared, D-09/D-18).
- Email-only contact, `firstname@bsvlaw.com` (D-08).
- FAQs drafted then reviewed by Jon before publish (D-12/D-13).

</specifics>

<deferred>
## Deferred Ideas

- **Anonymized IP & Tax deal experience** — IP/Tech and Tax practice pages get deal
  grids later (anonymized descriptors or newly cleared names); skipped now (D-10).
- **Jon Van Loo full deal list** — Jon expands beyond the 3 interim bullets later (D-06).
- **Susan Jiang real bio** — Jon supplies; ships hidden until then (D-07).
- **Real headshots** — placeholders for now; swapped before launch (Phase 7).
- **Exact partner email addresses** — Jon confirms/corrects at review (D-08).

None of the above is scope creep into Phase 4 — discussion stayed within the
attorney/practice-area-pages boundary.

</deferred>

---

*Phase: 4-Attorney & Practice Area Pages*
*Context gathered: 2026-05-27*
