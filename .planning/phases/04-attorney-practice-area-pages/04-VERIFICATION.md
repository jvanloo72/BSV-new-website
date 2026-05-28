---
phase: 04-attorney-practice-area-pages
verified: 2026-05-27T17:45:00Z
status: passed
human_signoff: "Jon Van Loo approved all 4 human-verification items in-session on 2026-05-27 (emails, Iris bar wording, Susan bio fidelity, CA testimonial disclosure wording)."
score: 11/11 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Review Susan (Kezhen) Jiang's published profile at /attorneys/susan-jiang"
    expected: "Profile renders her real bio from bsvlaw.com, her prior firm shows 'Simpson Thacher & Bartlett', the contact email is sjiang@bsvlaw.com, and no fabricated bar admission appears. The 04-04 SUMMARY confirms Jon approved the publication; verify the live page matches the intent."
    why_human: "Her draft:false change was a runtime decision — the test suite now asserts the route EXISTS and is in the sitemap (which passes), but cannot confirm the prose is accurate against the live bsvlaw.com source without a browser review."
  - test: "Review CA testimonial disclosure wording on the M&A practice-area page"
    expected: "The disclosure reads: 'This testimonial reflects one client\'s experience and is not a guarantee of any future result. Prior results do not guarantee a similar outcome.' Confirm this is the exact wording Jon wants (D-18 states 'Jon confirms final language at review')."
    why_human: "Bar compliance wording confirmation for testimonial disclosures requires attorney sign-off, not an automated content grep."
  - test: "Review partner email addresses on all published attorney pages"
    expected: "Aaron: abelcher@bsvlaw.com; Stuart: ssmolen@bsvlaw.com; Jon: jon@bsvlaw.com; Iris: izhang@bsvlaw.com; Susan: sjiang@bsvlaw.com. All render as mailto: links; no phone numbers appear anywhere."
    why_human: "Email addresses require Jon to visually confirm correctness on a rendered preview. The 04-04 SUMMARY records Jon's corrections, but this is a post-correction confirmation."
  - test: "Review Iris Zhang's bar placeholder on her profile page"
    expected: "Her bar admissions section shows 'Bar admission details to follow' — no fabricated jurisdiction. Jon supplies the real admission details before launch."
    why_human: "Attorney of record must confirm that the placeholder language is acceptable for the current publication state and does not create an ABA Rule 7.4 implication."
---

# Phase 4: Attorney & Practice Area Pages — Verification Report

**Phase Goal:** A prospective client can read a complete profile for each of the four published attorneys, see specific representative deals on each practice-area page, find the lead partners on each page, and never encounter a Rule 7.4 copy violation or an uncleared client name.
**Verified:** 2026-05-27T17:45:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Visitor can read complete profiles for all four published attorneys (Aaron, Stuart, Jon, Iris) with bar admissions, education, focus, and representative deals | VERIFIED | Build emits `/attorneys/{aaron-belcher,stuart-smolen,jon-van-loo,iris-zhang}`. Playwright `pages-exist` spec passes. All four contain Person JSON-LD, bar admissions, education, focus. Aaron has 64 deals in the deal grid. |
| 2 | Susan Jiang is published (`draft: false`) per Jon's 2026-05-27 instruction and her route exists at `/attorneys/susan-jiang` | VERIFIED | `src/content/attorneys/susan-jiang.mdx` has `draft: false`. `dist/client/attorneys/susan-jiang/index.html` exists. Sitemap includes `bsvlaw.com/attorneys/susan-jiang`. `draft-exclusion.spec.ts` confirms and passes. |
| 3 | Each practice-area page opens with client problem, BSV's team solution, lead-partner callout linking to the attorney profile, and (M&A only) a cleared deal grid | VERIFIED | All 3 practice pages render `clientProblem` → `bsvApproach` → lead-partner callout. M&A page: `DealsGrid` present with 10 cleared deals; IP & Tax pages: no DealsGrid (D-10). `lead-attorney-link.spec.ts` passes confirming `/attorneys/<slug>` links are live. |
| 4 | No Rule 7.4 banned term (specialist, specialize, expert, expertise) appears in any published content | VERIFIED | `npm run lint:legal` exits 0 on full `src/content/**/*.mdx` scan. `lint-legal.spec.ts` passes (exits 1 on fixture, 0 on real content). Stuart's USPTO phrasing "Registered to practice before the U.S. Patent and Trademark Office (USPTO)" triggers no violation — confirmed by direct file scan. |
| 5 | No uncleared client name appears on any page — clearance register contains Aaron's 64-deal en-masse entry | VERIFIED | `CLIENT_DISCLOSURE_CLEARANCE.md` contains the `aaron-belcher-partner` en-masse row, dated 2026-05-27, cleared by Jon Van Loo (D-15). All 64 `representativeDeals` in `aaron-belcher.mdx` have `cleared: true`. `clearance.spec.ts` passes. |
| 6 | Each attorney page carries a valid Person JSON-LD block (name, jobTitle, alumniOf, knowsAbout) and the attorney-specific per-page disclaimer | VERIFIED | All 4 published attorney pages (+ Susan) contain both a `Person` JSON-LD block and `class="disclaimer--attorney"` in built HTML. `person-jsonld.spec.ts` passes. No `sameAs` property emitted (D-02 honored). |
| 7 | Each practice-area page carries FAQPage JSON-LD with 3-5 approved Q/A entries, and the practice-area-specific per-page disclaimer | VERIFIED | All 3 practice pages render `FAQPage` JSON-LD: M&A=5, IP=4, Tax=4 entries. Jon approved all 13 FAQs on 2026-05-27 (D-13 gate closed, recorded in 04-04-SUMMARY). `faqpage-jsonld.spec.ts` passes. All 3 pages carry `class="disclaimer--practice-area"`. |
| 8 | The M&A page renders the Daniel Brian testimonial with the California required disclosure | VERIFIED | Built HTML contains "BSV was my rock", "Daniel Brian", "GC, Commure, Inc." and "not a guarantee of any future result. Prior results do not guarantee a similar outcome." IP and Tax pages have no testimonial. |
| 9 | A fee structure band (hourly billing + estimate, no published rate) appears on every practice-area page | VERIFIED | All 3 pages include "How we bill" section, "bill hourly", "estimate" text, and no `$NNN/hour` rate. `FeeStructureBand` with `feeStructureBand: true` on all 3 MDX files. |
| 10 | Nir Fishbien appears nowhere — not in content, not in the built HTML, not in the sitemap | VERIFIED | `fishbien-absent.spec.ts` passes both src/content sweep and dist HTML+sitemap sweep. |
| 11 | Jon is named "Jon Van Loo" and his email callout is email-only (no phone) | VERIFIED | `jon-van-loo.mdx` name field is exactly "Jon Van Loo". No "Jonathan" in built HTML. `href="mailto:jon@bsvlaw.com"` present; no `href="tel:"` on any attorney page. |

**Score:** 11/11 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/content/attorneys/aaron-belcher.mdx` | Aaron bio + full 64-deal representativeDeals (all cleared:true) | VERIFIED | 64 `- parties:` entries, all `cleared: true`. Contains "Uniswap acquired Guidestar" and "Illumina". |
| `src/content/attorneys/stuart-smolen.mdx` | Stuart bio; USPTO phrasing; Rule 7.4-safe | VERIFIED | barAdmissions includes "Registered to practice before the U.S. Patent and Trademark Office (USPTO)". Lint clean. |
| `src/content/attorneys/jon-van-loo.mdx` | "Jon Van Loo" exactly; representativeDeals [] (D-06); 3 interim bullets in body prose | VERIFIED | name="Jon Van Loo". representativeDeals: []. Body contains 3 bullets and crypto thought-leader line. |
| `src/content/attorneys/iris-zhang.mdx` | barAdmissions placeholder (no invented jurisdiction); languages English+Mandarin | VERIFIED | barAdmissions: ["Bar admission details to follow"]. languages: [English, Mandarin]. Bio asserts no bar admission. |
| `src/content/attorneys/susan-jiang.mdx` | Published (`draft: false`) per Jon's 2026-05-27 instruction; real bio from bsvlaw.com | VERIFIED | draft: false. priorFirms: ["Simpson Thacher & Bartlett (Palo Alto)"]. barAdmissions: [] (schema allows empty via `.default([])`). |
| `src/layouts/AttorneyLayout.astro` | Person JSON-LD slot + email callout + deals grid composition | VERIFIED | Contains `buildPersonLd`, `mailto:`, `DealsGrid`, `Disclaimer id="attorney"`. No phone render, no hardcoded hex. |
| `src/content/practiceAreas/mergers-acquisitions.mdx` | M&A page data with cleared deals, leadAttorneys [aaron-belcher], 5 approved FAQs | VERIFIED | representativeDeals has 10 cleared strings. leadAttorneys: ["aaron-belcher"]. faqs: 5 entries. |
| `src/content/practiceAreas/intellectual-property-technology-transactions.mdx` | IP page; no deal grid; leadAttorneys [stuart-smolen]; 4 approved FAQs | VERIFIED | representativeDeals: []. leadAttorneys: ["stuart-smolen"]. faqs: 4 entries. |
| `src/content/practiceAreas/tax.mdx` | Tax page; no deal grid; leadAttorneys [jon-van-loo]; 4 approved FAQs | VERIFIED | representativeDeals: []. leadAttorneys: ["jon-van-loo"]. faqs: 4 entries. |
| `src/layouts/PracticeAreaLayout.astro` | getEntries resolution + FAQPage slot (guarded then populated) + section composition | VERIFIED | Contains `getEntries`, guarded FAQPage emission (`faqs.length > 0`), `buildFaqPageLd`, `Disclaimer id="practice-area"`. |
| `src/lib/jsonld.ts` | buildPersonLd + buildFaqPageLd implemented; no sameAs | VERIFIED | Both builders compile. No `sameAs` emitted. `buildArticleLd` stub intentionally preserved for Phase 5. |
| `scripts/lint-legal.mjs` | Real Rule 7.4 banned-term scanner; exits 1 on violation, 0 on clean content | VERIFIED | 137-line implementation. Word-boundary regex. Allowlist support. Exits 1 on fixture, 0 on real content. |
| `scripts/lint-legal.allowlist.json` | Empty allowlist (all exceptions require explicit documentation) | VERIFIED | Contains `[]` — no pre-approved phrases. |
| `.planning/CLIENT_DISCLOSURE_CLEARANCE.md` | Aaron 64-deal en-masse clearance row (D-15), dated 2026-05-27, Jon Van Loo | VERIFIED | Row present in both Cleared Clients and Cleared Counterparties tables with bsvlaw.com URL basis. |
| `.planning/phases/04-attorney-practice-area-pages/FAQ-DRAFT.md` | 3-5 non-promissory FAQs per area with PENDING APPROVAL marker | VERIFIED | 5 M&A + 4 IP + 4 Tax FAQs. Marked "PENDING JON'S APPROVAL — D-13 gate". All copied verbatim into the MDX faqs arrays after approval. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `package.json` | `scripts/lint-legal.mjs` | `"lint:legal": "node scripts/lint-legal.mjs"` + `"prebuild": "npm run lint:legal"` | WIRED | Confirmed in package.json. Scanner runs before every build. |
| `src/lib/jsonld.ts` | `schema-dts` | `WithContext<Person>`, `WithContext<FAQPage>` | WIRED | Both types imported and used in return signatures. |
| `src/layouts/AttorneyLayout.astro` | `src/lib/jsonld.ts` | `buildPersonLd(attorney)` in `<JsonLd slot="head" ...>` | WIRED | Line 35: `<JsonLd slot="head" data={buildPersonLd(attorney)} />`. Person JSON-LD present in all attorney pages. |
| `src/layouts/AttorneyLayout.astro` | `attorney.data.email` | `mailto:${d.email}` link | WIRED | Line 51: `href={\`mailto:${d.email}\`}`. Confirmed in built HTML for all 4 attorneys. |
| `src/layouts/PracticeAreaLayout.astro` | `src/content/attorneys` | `getEntries(practiceArea.data.leadAttorneys)` → `/attorneys/<slug>` link | WIRED | `lead-attorney-link.spec.ts` passes. M&A→aaron-belcher, IP→stuart-smolen, Tax→jon-van-loo links confirmed in built HTML. |
| `src/layouts/PracticeAreaLayout.astro` | `src/lib/jsonld.ts` | `buildFaqPageLd(d.faqs)` guarded on `d.faqs.length > 0` | WIRED | FAQPage JSON-LD present in all 3 practice page HTML. `faqpage-jsonld.spec.ts` passes (Q/A counts match accordion). |
| `src/content/practiceAreas/*.mdx faqs` | `PracticeAreaLayout buildFaqPageLd` | Populated faqs array triggers guarded FAQPage emission | WIRED | All 3 MDX files have non-empty faqs arrays (5+4+4 entries). JSON-LD emits in built HTML. |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `AttorneyLayout.astro` | `attorney.data` (name, barAdmissions, deals, etc.) | `src/content/attorneys/<slug>.mdx` frontmatter via Astro content collection | Yes — 64-deal list, real bio text, real education/bar data | FLOWING |
| `PracticeAreaLayout.astro` | `leads` (lead attorneys) | `getEntries(d.leadAttorneys)` resolving Astro reference() cross-collection | Yes — resolves to real attorney entries with `.data.name` and `.data.slug` | FLOWING |
| `PracticeAreaLayout.astro` | `testimonial` | `getCollection('testimonials').find(t => t.data.featured && ...)` | Yes — resolves Daniel Brian entry for M&A; returns undefined for IP/Tax | FLOWING |
| `PracticeAreaLayout.astro` | `faqItems` | `d.faqs.map(f => ({q: f.question, a: f.answer}))` from MDX frontmatter | Yes — 5+4+4 approved FAQ entries | FLOWING |
| `buildPersonLd(attorney)` | Person JSON-LD `alumniOf`, `knowsAbout`, `email` | `attorney.data.education`, `attorney.data.focus`, `attorney.data.email` from MDX | Yes — real institution names, real focus text, real email | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| `npm run lint:legal` exits 0 on current content | `node scripts/lint-legal.mjs` | "lint:legal — clean (no Rule 7.4 banned terms). EXIT:0" | PASS |
| `npm run lint:legal` exits 1 on fixture with "expert" | `node scripts/lint-legal.mjs tests/_fixtures/lint-legal-violation.mdx` | Reports violation, exits 1 | PASS |
| Build emits all four attorney pages and 3 practice pages | `npm run build` | 5 attorney routes + 3 practice routes in `dist/client/` | PASS |
| All 42 Playwright tests pass | `npx playwright test` | 42 passed, 0 failed | PASS |
| `npx astro check` — zero type errors | `npx astro check` | 0 errors, 0 warnings (69 informational hints only) | PASS |
| Aaron's 64-deal list count | Grep count in MDX | 64 `- parties:` entries, all `cleared: true` | PASS |
| FAQPage mainEntity counts match visible accordion | `faqpage-jsonld.spec.ts` | M&A=5, IP=4, Tax=4 — spec passes | PASS |
| Person JSON-LD on all published attorney pages | `person-jsonld.spec.ts` | All pass — name/jobTitle/alumniOf/knowsAbout present | PASS |
| No Fishbien in content, HTML, or sitemap | `fishbien-absent.spec.ts` | Both tests pass (src sweep + built HTML sweep) | PASS |
| Lead-attorney links resolve correctly | `lead-attorney-link.spec.ts` | 3/3 practice pages link to correct attorney profile | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| ATTY-01 | 04-02 | Dynamic route `/attorneys/[slug]` generates pages from collection | SATISFIED | `[slug].astro` filters `!data.draft`; 5 attorney pages in dist |
| ATTY-02 | 04-02 | Aaron Belcher profile published with full deal list | SATISFIED | 64 deals in MDX; built page confirmed |
| ATTY-03 | 04-02 | Stuart Smolen profile with USPTO phrasing (Rule 7.4-safe) | SATISFIED | USPTO phrasing in barAdmissions; lint clean |
| ATTY-04 | 04-02 | Jon Van Loo profile; "Jon Van Loo" name; NY+CA bars | SATISFIED | name="Jon Van Loo" in MDX; no "Jonathan" in HTML |
| ATTY-05 | 04-02 | Iris Zhang profile with bar placeholder | SATISFIED | barAdmissions: ["Bar admission details to follow"] |
| ATTY-06 | 04-02/04-04 | Susan Jiang published per Jon's 2026-05-27 instruction | SATISFIED | `draft: false`; route built; sitemap includes slug. D-07 superseded by Jon's explicit approval. |
| ATTY-07 | 04-02 | Partner email contact callout on each partner page | SATISFIED | `mailto:` links confirmed in HTML for all 4 published attorneys |
| ATTY-08 | 04-02 | Tasteful headshot placeholder | SATISFIED | `placeholder-*.svg` monograms rendered via `<Image>` on all attorney pages |
| ATTY-09 | 04-01/04-02 | Person JSON-LD on every attorney page | SATISFIED | `person-jsonld.spec.ts` passes; all 5 pages have Person JSON-LD |
| ATTY-10 | 04-02 | Attorney-page disclaimer on each attorney page | SATISFIED | `class="disclaimer--attorney"` confirmed in HTML for all 4 published attorneys (+ Susan) |
| ATTY-11 | 04-01/04-02 | Nir Fishbien not on site | SATISFIED | `fishbien-absent.spec.ts` passes both sweeps |
| ATTY-12 | 04-02 | Jon referred to as "Jon" not "Jonathan" | SATISFIED | MDX name="Jon Van Loo"; no "Jonathan" in built HTML |
| PRAC-01 | 04-03 | Dynamic route `/practice-areas/[slug]` | SATISFIED | 3 practice pages in dist |
| PRAC-02 | 04-03 | M&A page published — problem→BSV solution→proof | SATISFIED | `clientProblem`+`bsvApproach`+lead callout+deals+testimonial confirmed in built HTML |
| PRAC-03 | 04-03 | IP & Tech page published | SATISFIED | Page exists; Stuart as lead; no deals (D-10) |
| PRAC-04 | 04-03 | Tax page published | SATISFIED | Page exists; Jon as lead; no deals (D-10) |
| PRAC-05 | 04-03 | Deal-experience grid on M&A page (cleared names only) | SATISFIED | 10-deal grid on M&A; IP/Tax have none (D-10 scoping — intentional) |
| PRAC-06 | 04-03 | Lead-attorney callout linking to attorney profile | SATISFIED | `lead-attorney-link.spec.ts` passes; M&A→aaron-belcher, IP→stuart-smolen, Tax→jon-van-loo |
| PRAC-07 | 04-03 | Practice-area disclaimer on each practice page | SATISFIED | `class="disclaimer--practice-area"` confirmed for all 3 pages |
| PRAC-08 | 04-04 | FAQPage JSON-LD with 3-5 approved FAQs | SATISFIED | D-13 gate closed; Jon approved 13 FAQs on 2026-05-27; FAQPage JSON-LD in all 3 pages; `faqpage-jsonld.spec.ts` passes |
| PRAC-09 | 04-03 | Fee-structure band on each practice page | SATISFIED | "How we bill" + hourly + estimate confirmed in all 3 pages; no published rate |
| SEO-03 | 04-01/04-02 | Person JSON-LD on every attorney page | SATISFIED | See ATTY-09 |
| SEO-05 | 04-01/04-03/04-04 | FAQPage JSON-LD on each practice page | SATISFIED | See PRAC-08; `faqpage-jsonld.spec.ts` passes |
| LEGAL-02 | 04-02/04-03 | Per-page disclaimers on practice-area and attorney pages | SATISFIED | `disclaimer--attorney` on all attorney pages; `disclaimer--practice-area` on all practice pages. `disclaimer-crawl.spec.ts` passes (footer disclaimer also confirmed site-wide). |
| LEGAL-03 | 04-01 | `npm run lint:legal` scans content, fails build on banned term | SATISFIED | Real scanner wired as `prebuild`; exits 0 on clean content, 1 on fixture; `lint-legal.spec.ts` passes |
| LEGAL-04 | 04-01 | Clearance register populated before any deal publishes | SATISFIED | Aaron's 64-deal en-masse entry in CLIENT_DISCLOSURE_CLEARANCE.md, dated 2026-05-27; `clearance.spec.ts` passes |
| LEGAL-06 | 04-03 | Testimonial CA disclosure rendered (D-18) | SATISFIED | "not a guarantee of any future result. Prior results do not guarantee a similar outcome." in M&A built HTML |
| LEGAL-08 | 04-03 | Fee structure transparency band on practice pages | SATISFIED | Hourly billing + up-front estimate; no published rate — confirmed on all 3 pages |
| LEGAL-10 | 04-02/04-03/04-04 | No outcome guarantees, results predictions | SATISFIED | No "guarantee/predict/outcome/result" language in bios or practice page MDX prose. FAQ answers non-promissory. `lint:legal` gate clean. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `src/lib/jsonld.ts` | 114-116 | `throw new Error('buildArticleLd not implemented until Phase 5')` | Info | Intentional Phase 5 stub — explicit scope boundary, not a gap |
| `src/content/attorneys/susan-jiang.mdx` | 5 | `barAdmissions: []` (empty array) | Info | Intentional per Jon's 2026-05-27 instruction; schema allows empty via `.default([])`; not a fabrication risk |

No TBD, FIXME, or XXX markers found in any Phase 4-modified file.

### Human Verification Required

#### 1. Susan (Kezhen) Jiang Published Profile Review

**Test:** Open `/attorneys/susan-jiang` on a Vercel preview deployment and confirm the bio prose matches the live bsvlaw.com content, the firm shows "Simpson Thacher & Bartlett (Palo Alto)", and no fabricated bar admission appears.
**Expected:** The bio renders the real content from bsvlaw.com, the email shows `sjiang@bsvlaw.com`, languages show English and Mandarin, and no bar jurisdiction is asserted (barAdmissions is empty per schema's `.default([])`).
**Why human:** Her publication status changed mid-phase per Jon's instruction (D-07 superseded). Automated tests confirm the route exists and has Person JSON-LD, but the accuracy of the prose content against the live bsvlaw.com source requires a browser review by Jon.

#### 2. CA Testimonial Disclosure Wording Confirmation

**Test:** Read the testimonial disclosure text on the M&A practice page and confirm it is the wording Jon wants on record.
**Expected:** "This testimonial reflects one client's experience and is not a guarantee of any future result. Prior results do not guarantee a similar outcome." (D-18 states Jon confirms final language at review.)
**Why human:** This is attorney advertising disclosure language that must be confirmed by a California bar member. Automated check confirms the text is present; attorney confirmation of the exact phrasing is required.

#### 3. Partner Email Addresses Visual Confirmation

**Test:** On each published attorney profile, confirm the email callout shows the correct address: `abelcher@bsvlaw.com` (Aaron), `ssmolen@bsvlaw.com` (Stuart), `jon@bsvlaw.com` (Jon), `izhang@bsvlaw.com` (Iris), `sjiang@bsvlaw.com` (Susan).
**Expected:** Each page shows the exact firm email as a clickable mailto link with no phone number visible anywhere on any attorney page.
**Why human:** Jon corrected the emails in the 04-04 pass. A visual confirmation on the rendered page that the right address maps to the right attorney is a low-overhead check appropriate for the attorney of record.

#### 4. Iris Zhang's Bar Admission Placeholder Acceptance

**Test:** Review Iris Zhang's attorney profile page; confirm the bar admissions section shows "Bar admission details to follow" and confirm this is acceptable for the current publication state.
**Expected:** The text "Bar admission details to follow" appears; no jurisdiction or year is asserted; Jon confirms this is acceptable until Iris's real admission details are supplied (D-05).
**Why human:** Displaying an attorney profile with a bar admission placeholder has professional responsibility implications that only Jon can accept on behalf of the firm.

### Gaps Summary

No automated gaps found. All 11 observable truths are VERIFIED, all 29 mapped requirements are SATISFIED, all 42 Playwright tests pass, the build succeeds, and `npm run lint:legal` exits 0.

The 4 human verification items above are the only open items. They do not indicate implementation failures — they require attorney sign-off on content accuracy and professional responsibility decisions that automated tools cannot substitute for.

---

_Verified: 2026-05-27T17:45:00Z_
_Verifier: Claude (gsd-verifier)_
