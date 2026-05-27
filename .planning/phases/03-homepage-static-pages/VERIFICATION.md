---
phase: 03-homepage-static-pages
verified: 2026-05-27T19:25:00Z
status: passed
score: 14/14 must-haves verified
overrides_applied: 0
---

# Phase 3: Homepage & Static Pages — Verification Report

**Phase Goal:** Compose the locked Phase 2 component library into a public homepage, About page, three section-index pages, and branded error pages — with per-page SEO meta, site-wide LegalService JSON-LD, sitemap.xml, and robots.txt live.
**Verified:** 2026-05-27
**Status:** GOAL ACHIEVED
**Re-verification:** No — initial verification

---

## Build Gate

`npm run build` (via `node node_modules/astro/bin/astro.mjs build`) completes with no errors. All pages emitted:
- `dist/client/index.html`
- `dist/client/about/index.html`
- `dist/client/attorneys/index.html`
- `dist/client/practice-areas/index.html`
- `dist/client/blog/index.html`
- `dist/client/404.html`
- `dist/client/500.html`
- `dist/client/robots.txt`
- `dist/client/sitemap-index.xml` + `dist/client/sitemap-0.xml`

---

## Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|---------|
| 1 | Homepage headline reads "Team work to get good results." | VERIFIED | `dist/client/index.html` contains the string; `src/pages/index.astro` line 88 |
| 2 | All five attorneys (Belcher, Smolen, Van Loo, Zhang, Jiang) render on homepage; Fishbien appears nowhere in src/ | VERIFIED | grep confirms all five names in built HTML; Fishbien absent from all src files |
| 3 | D-01 section order: Hero → ApproachBand → PracticeAreaCard → DealsGrid → AttorneyCard → TestimonialQuote → ChambersStrip → CtaBlock | VERIFIED | Position scan of built index.html: positions 9768 / 14985 / 16280 / 21439 / 21539 / 21976 — monotonically increasing |
| 4 | Named deals cleared in CLIENT_DISCLOSURE_CLEARANCE.md before homepage publishes them | VERIFIED | File contains Athelas, Commure, Mode Analytics, Illumina, Daniel Brian, Roche — all attributed to Jon Van Loo / 2026-05-26 |
| 5 | ApproachBand maps three points to competence / experience / responsiveness | VERIFIED | `src/components/sections/ApproachBand.astro`: "Partner-led teams" (competence), "Deep transaction experience" (experience), "Moves at your deal's pace" (responsiveness) |
| 6 | About page opens with client-world framing, shows both offices, closes toward /contact | VERIFIED | Source and built HTML confirmed: "fear of the wrong counsel" opening; "555 California St., Suite 4925, San Francisco, CA 94104" + "Silicon Valley, CA" (TBD suppressed by formatOffice); CtaBlock href="/contact" + TextLink to /attorneys and /practice-areas |
| 7 | formatOffice helper exported from site.ts; footer and About share one derivation | VERIFIED | `src/lib/site.ts` exports `formatOffice`; `src/pages/about.astro` imports and uses it; `src/components/chrome/SiteFooter.astro` imports it |
| 8 | Practice Areas index renders three cards with locked slugs | VERIFIED | Built HTML confirms /practice-areas/mergers-acquisitions, /practice-areas/intellectual-property-technology-transactions, /practice-areas/tax |
| 9 | Attorneys index renders all five (no Fishbien); Insights index shows warm branded empty-state | VERIFIED | Built HTML: all five names present, Fishbien absent; blog index shows "Insights are on the way" + Button to /contact |
| 10 | Branded 404 with path home AND to /contact; branded 500 with SITE.email and path home | VERIFIED | 404: "wrong turn" copy, Button href="/" + Button href="/contact"; 500: "Something went wrong", intake@bsvlaw.com mailto, Button href="/" |
| 11 | robots.txt references sitemap; does not expose /design-system | VERIFIED | `dist/client/robots.txt` contains `Sitemap: https://bsvlaw.com/sitemap-index.xml`; no "design-system" string |
| 12 | sitemap-index.xml + sitemap-0.xml live; /about /attorneys /practice-areas /blog included; /design-system excluded | VERIFIED | Both files present; sitemap-0.xml confirmed to include all four routes and not include design-system |
| 13 | LegalService JSON-LD present site-wide via BaseLayout | VERIFIED | `npm run test:jsonld` — 1 passed; BaseLayout line 46 injects `buildLegalServiceLd()` on every page |
| 14 | Footer disclaimer present on every route | VERIFIED | `npm run test:disclaimer` — 1 passed; crawls all sitemap routes |

**Score:** 14/14 truths verified

---

## Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/pages/index.astro` | Public homepage in D-01 order | VERIFIED | 167 lines; real composition; no FeeStructureBand/FaqAccordion; no noindex |
| `src/components/sections/ApproachBand.astro` | StoryBrand guide-with-a-plan band, 3 points | VERIFIED | 45 lines; data-component="ApproachBand"; three points mapped to competence/experience/responsiveness; token-only |
| `src/components/sections/ChambersStrip.astro` | Quiet accent-tinted Chambers strip | VERIFIED | 15 lines; data-component="ChambersStrip"; bg-accent/10; "Chambers USA — Spotlight 2026"; non-linked |
| `.planning/CLIENT_DISCLOSURE_CLEARANCE.md` | D-04 cleared deals recorded | VERIFIED | Athelas, Commure, Mode Analytics, Illumina, Daniel Brian, Roche, representative-parties — all Jon Van Loo / 2026-05-26 |
| `src/pages/about.astro` | Client-first StoryBrand About; both offices from SITE | VERIFIED | 165 lines; imports formatOffice; StoryBrand spine; offices via SITE.offices.map(formatOffice); no TBD in rendered text; no invented history |
| `src/lib/site.ts` | Exports formatOffice helper | VERIFIED | Function present; produces "Silicon Valley, CA" and "555 California St., Suite 4925, San Francisco, CA 94104" |
| `src/pages/practice-areas/index.astro` | Three practice area cards with locked slugs | VERIFIED | getCollection + graceful empty-state + three PracticeAreaCards |
| `src/pages/attorneys/index.astro` | Five attorney cards (no Fishbien) | VERIFIED | getCollection + team const with five members only |
| `src/pages/blog/index.astro` | Graceful branded empty-state | VERIFIED | posts.length === 0 branch with on-tone copy and /contact Button |
| `src/pages/404.astro` | Branded 404 with home + /contact paths | VERIFIED | Two Buttons; no stack traces; token-only |
| `src/pages/500.astro` | Branded 500 with SITE.email and home path | VERIFIED | SITE.email rendered; one Button to /; token-only |
| `src/pages/robots.txt.ts` | Astro static endpoint for robots.txt | VERIFIED | GET endpoint; references sitemap-index.xml; no design-system mention |

---

## Key Link Verification

| From | To | Via | Status | Evidence |
|------|-----|-----|--------|---------|
| `src/pages/index.astro` | /contact | Hero ctaHref + CtaBlock ctaHref | VERIFIED | Both `ctaHref="/contact"` present in source |
| `src/pages/index.astro` | ApproachBand.astro | import + render after Hero | VERIFIED | Line 13 import; line 97 `<ApproachBand />`; D-01 order confirmed in HTML |
| `src/pages/index.astro` | ChambersStrip.astro | import + render before CtaBlock | VERIFIED | Line 18 import; line 157 `<ChambersStrip />`; position 21539 before CtaBlock at 21976 |
| `src/pages/about.astro` | src/lib/site.ts (SITE.offices) | formatOffice import + map | VERIFIED | Line 22: `import { SITE, formatOffice } from '../lib/site'`; line 24: `SITE.offices.map(formatOffice)` |
| `src/pages/about.astro` | /contact | CtaBlock ctaHref | VERIFIED | Line 154: `ctaHref="/contact"` |
| `src/pages/practice-areas/index.astro` | /practice-areas/[slug] | card hrefs to locked slugs | VERIFIED | All three slugs present in source and built HTML |
| `src/pages/404.astro` | /contact | Button href | VERIFIED | `href="/contact"` present in source |

---

## Data-Flow Trace (Level 4)

No dynamic data fetch involved — all Phase 3 pages use build-time curated constants or `getCollection()` reads. The `getCollection()` results are only consulted for the graceful empty-state branch; actual cards render from curated inline constants (design-system content source per D-03). No hollow prop or disconnected data issue.

---

## Behavioral Spot-Checks

| Behavior | Result | Status |
|----------|--------|--------|
| `npm run build` succeeds, no errors | Exit 0; all pages emitted | PASS |
| `npm run test:disclaimer` — footer disclaimer on every sitemap route | 1 passed | PASS |
| `npm run test:jsonld` — LegalService JSON-LD present site-wide | 1 passed | PASS |
| D-01 order in built index.html (section positions monotonically increasing) | Confirmed via position scan | PASS |
| Fishbien absent from all src/ files | grep returns no matches | PASS |
| robots.txt in dist/client/ references sitemap, not /design-system | Confirmed | PASS |
| sitemap-0.xml excludes /design-system | Confirmed | PASS |

---

## Requirements Coverage

| Requirement | Plan | Description | Status | Evidence |
|-------------|------|-------------|--------|---------|
| PAGES-01 | 03-01 | Homepage opens with "Team work to get good results" | PASS | `dist/client/index.html` line-verified |
| PAGES-02 | 03-01 | Homepage: 3 practice teasers, 5 attorney cards, testimonial, Chambers strip, /contact CTA | PASS | All confirmed in built HTML |
| PAGES-03 | 03-02 | About page: both offices, positioning (D-06: no invented founding year) | PASS | 555 California St + Silicon Valley CA in built HTML; no founding year in source |
| PAGES-04 | 03-03 | Practice Areas index with links to three areas | PASS | All three locked slugs in built HTML |
| PAGES-05 | 03-03 | Attorneys index: all five attorneys, Fishbien excluded | PASS | All five names present; Fishbien absent |
| PAGES-06 | 03-03 | Insights index with graceful empty-state (filters deferred to Phase 5) | PARTIAL (by design) | Empty-state shell verified; filters explicitly deferred to Phase 5 per REQUIREMENTS.md |
| PAGES-07 | 03-03 | Branded 404 + 5xx error pages | PASS | Both verified in built HTML |
| PAGES-08 | 03-01, 03-02, 03-03 | StoryBrand framing throughout; CTAs toward /contact | PASS | Every page closes with /contact CTA; client-as-hero framing throughout |
| SEO-01 | 03-03 | Every page: title, description, canonical, OG via SeoHead | PASS | BaseLayout line 42 injects SeoHead on all pages; all Phase 3 pages pass real title/description |
| SEO-02 | 03-03 | LegalService JSON-LD site-wide via BaseLayout | PASS | test:jsonld passes; BaseLayout line 46 confirmed |
| SEO-07 | 03-03 | sitemap.xml auto-generated | PASS | sitemap-index.xml + sitemap-0.xml in dist/client/ |
| SEO-08 | 03-03 | robots.txt with sitemap reference | PASS | dist/client/robots.txt confirmed |
| LEGAL-07 | 03-01 | Chambers USA Spotlight 2026 visible but not the lead | PASS | ChambersStrip placed 7th of 8 sections; bg-accent/10 kept visually quiet |
| OPS-06 | 03-02 | Content editable via GitHub web editor (plainly separated prose) | PASS | about.astro prose in clearly labeled, flat paragraph blocks; comment explicitly notes Jon can edit via GitHub web editor |

**Note on PAGES-06:** The empty-state shell is delivered and verified. Attorney/practice-area filters are explicitly documented as deferred to Phase 5 in REQUIREMENTS.md ("empty-state shell; filters in Phase 5"). This is not a gap — it is a plan-sanctioned, roadmap-documented split delivery.

---

## Anti-Patterns Found

| File | Pattern | Severity | Assessment |
|------|---------|----------|-----------|
| `src/lib/site.ts` | `'TBD'` in streetAddress / postalCode; `XXX-XXXX` in phone | INFO | All reference "Phase 7" or "Jon confirms before Phase 7" explicitly — pass the debt-marker gate. Not rendering as visible text (suppressed by formatOffice). |
| `src/pages/about.astro` line 13 | `"TBD street omitted"` in code comment | INFO | Comment documents behavior — not a code issue. No styling or rendering impact. |
| `src/components/legal/Disclaimer.astro` | `text-[color:var(--color-text-muted)]` | INFO | Phase 1 component, not modified in Phase 3. Appears in built HTML of all pages via BaseLayout. Out of scope for Phase 3 token-retrofit (Phase 3 files are all clean). |
| `src/pages/contact.astro` | `text-[color:var(...]` | INFO | Phase 1 placeholder, not modified in Phase 3. Deferred retrofit to Phase 6. |

**No blockers found.** All Phase 3-authored files are token-clean.

---

## Human Verification Required

### 1. Chambers Strip Visual Weight

**Test:** Open the built homepage in a browser and scan from top to bottom.
**Expected:** The Chambers USA strip reads as quiet recognition, not as a credential lead. It should register as background context — visitors should not notice it before the practice area cards or attorney row.
**Why human:** Visual prominence and reading order cannot be verified by grep or HTML analysis.

### 2. About Page StoryBrand Feel

**Test:** Read the About page as if you are a prospective founder or GC landing for the first time.
**Expected:** The page opens on your situation (the fear of the wrong counsel), not on BSV's credentials. The "Why a boutique" section should read as proof, not as self-promotion.
**Why human:** Tone and StoryBrand feel require human judgment; content is structurally correct but qualitative impact cannot be automated.

### 3. Empty-State Insights Index On-Tone Check

**Test:** Visit /blog in a browser.
**Expected:** The empty state should feel branded and warm — "Insights are on the way" — not like a broken page or a generic placeholder.
**Why human:** Visual brand feel and copy tone require human review.

---

## Gaps Summary

No gaps. All 14 must-haves are verified against the codebase. Both Playwright suites pass. The build is clean. All Phase 3 source files are token-clean (no `text-[color:var(` or hardcoded hex). Fishbien is absent from all src files. The D-04 clearance register is fully populated before the homepage publishes named deals. The PAGES-06 partial delivery (empty-state only, filters in Phase 5) is documented in REQUIREMENTS.md as intentional phased delivery — not a gap.

---

_Verified: 2026-05-27T19:25:00Z_
_Verifier: Claude (gsd-verifier)_
