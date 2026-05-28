---
phase: 04-attorney-practice-area-pages
plan: 01
subsystem: shared-foundation
tags: [json-ld, schema-dts, lint, compliance, rule-7.4, clearance, tests, seo, aeo]
requires:
  - schema-dts@2.0.0 (Person + FAQPage types)
  - src/lib/site.ts (SITE constants)
  - src/content.config.ts (attorneys + practiceAreas schemas)
provides:
  - buildPersonLd(attorney) — Person JSON-LD builder (ATTY-09 / SEO-03)
  - buildFaqPageLd(faqs) — FAQPage JSON-LD builder (PRAC-08 / SEO-05)
  - npm run lint:legal — real Rule 7.4 banned-term gate (LEGAL-03)
  - prebuild gate wiring (lint:legal fails the build on a violation)
  - Aaron Belcher 64-deal en-masse clearance row (LEGAL-04 / D-15)
  - 8 Wave 0 Playwright scaffolds + 1 lint fixture
affects:
  - Plan 02 (attorney pages) — calls buildPersonLd; publishes Aaron's cleared deals
  - Plans 03/04 (practice pages) — call buildFaqPageLd; un-skip the content specs
tech-stack:
  added: []
  patterns:
    - schema-dts typed JSON-LD builders mirroring buildLegalServiceLd
    - Node 22 stdlib recursive-readdir content scanner (no new deps)
    - test.fixme + UNSKIP-WHEN markers for interface-first test scaffolds
key-files:
  created:
    - scripts/lint-legal.mjs
    - scripts/lint-legal.allowlist.json
    - tests/_fixtures/lint-legal-violation.mdx
    - tests/person-jsonld.spec.ts
    - tests/faqpage-jsonld.spec.ts
    - tests/lint-legal.spec.ts
    - tests/fishbien-absent.spec.ts
    - tests/draft-exclusion.spec.ts
    - tests/clearance.spec.ts
    - tests/pages-exist.spec.ts
    - tests/lead-attorney-link.spec.ts
  modified:
    - src/lib/jsonld.ts
    - package.json
    - .planning/CLIENT_DISCLOSURE_CLEARANCE.md
decisions:
  - "expertise left banned-by-default in lint:legal (A1) — allowlist is empty, surfaced for Jon"
  - "Aaron's list cleared en masse via the bsvlaw.com URL basis, not enumerating ~60 counterparties (D-15/A5)"
metrics:
  duration: ~50m
  completed: 2026-05-27
---

# Phase 4 Plan 01: Shared Foundation Summary

Interface-first foundation for the attorney/practice-area slice: two schema-dts JSON-LD builders (`buildPersonLd`, `buildFaqPageLd`), the real `lint:legal` Rule 7.4 banned-term scanner wired as a `prebuild` gate, Aaron Belcher's complete deal list cleared en masse in the disclosure register, and 8 Wave 0 Playwright scaffolds (3 active, 5 fixme) so every downstream task has an automated verify.

## What was built

### Task 1 — JSON-LD builders (`src/lib/jsonld.ts`) — commit `e80162b`
- Replaced the throwing `buildPersonLd` stub with a real `WithContext<Person>` builder: `name`, `jobTitle`, `url` (`/attorneys/<slug>`), `worksFor` Organization, `alumniOf` from education, `knowsAbout` from `focus` split on `[;,]`, `email`. **No `sameAs`** — D-02 forbids fabricating profile URLs.
- Added `buildFaqPageLd(faqs)` returning `WithContext<FAQPage>`; safe on empty input (empty `mainEntity`, layout guards emission).
- Typed input as `CollectionEntry<'attorneys'>`; added `FAQPage` to the schema-dts import. `buildArticleLd` (Phase 5) untouched.
- Verify: `npx astro check` → 0 errors.

### Task 2 — `lint:legal` scanner — commit `dbdc94d`
- `scripts/lint-legal.mjs`: Node 22 stdlib recursive-readdir scanner over `src/content` `.mdx`, word-boundary banned roots `/\b(special(?:ist|ists|ize[sd]?|izing|ization)|experts?|expertise)\b/gi`. Prints `file:line:term`, exits 1 on a non-allowlisted hit, 0 when clean. Accepts explicit file args for fixture scanning.
- `scripts/lint-legal.allowlist.json` starts empty `[]`. Allowlist matches require BOTH phrase and file (no global whitelisting).
- `package.json`: real `"lint:legal": "node scripts/lint-legal.mjs"` + `"prebuild": "npm run lint:legal"` so the gate runs before every build (LEGAL-03 criterion 4).
- Verify: clean scan exits 0; fixture scan reports `tests/_fixtures/lint-legal-violation.mdx:8:expert` and exits 1.

### Task 3 — Clearance + Wave 0 scaffolds — commit `0672884`
- `CLIENT_DISCLOSURE_CLEARANCE.md`: added a Cleared-Clients row and a Cleared-Counterparties row clearing Aaron Belcher's complete representative-transactions list en masse via the `bsvlaw.com/team/aaron-belcher-partner/` URL basis (D-15/A5), dated 2026-05-27, clearer Jon Van Loo, allowed contexts = attorney bio (aaron-belcher) + M&A deal grid.
- 8 test scaffolds: **active now** — `lint-legal.spec.ts`, `fishbien-absent.spec.ts` (src/content sweep), `clearance.spec.ts` (cleared-deal → register cross-check, currently vacuous + Aaron URL-basis rule). **`test.fixme` with UNSKIP-WHEN** — `person-jsonld`, `faqpage-jsonld`, `draft-exclusion`, `pages-exist`, `lead-attorney-link`.
- `tests/_fixtures/lint-legal-violation.mdx` (contains "expert"), excluded from the production glob.
- Matching `test:*` scripts added to `package.json`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `*/` inside a block comment broke `lint-legal.mjs` parse**
- **Found during:** Task 2 verify
- **Issue:** The literal `src/content/**/*.mdx` written inside the JSDoc block comment contained the `*/` sequence, which prematurely closed the comment and produced a `SyntaxError: Unexpected token '*'` on every run.
- **Fix:** Replaced the `**/*.mdx` literal in comment text with `src/content (recursive .mdx)`. No behavior change to the scanner logic.
- **Files modified:** scripts/lint-legal.mjs
- **Commit:** dbdc94d (fixed before the Task 2 commit)

**2. [Rule 3 - Blocking] Created the lint fixture during Task 2 instead of Task 3**
- **Found during:** Task 2 verify
- **Issue:** Task 2's `<verify>` command scans `tests/_fixtures/lint-legal-violation.mdx`, but the plan creates that fixture in Task 3 — the Task 2 verify could not run without it.
- **Fix:** Created the fixture during Task 2 so the verify could pass; it was then staged/committed with the rest of the Wave 0 scaffolds in Task 3 (its logical home). No duplicate content.
- **Files modified:** tests/_fixtures/lint-legal-violation.mdx
- **Commit:** 0672884

## Compliance notes for Jon (review gate)

- **A1 — "expertise" treatment:** `expertise` is currently BANNED by default in `lint:legal` (over-strict = safe). The allowlist is empty. If you want a specific reviewed phrasing permitted, add a `{phrase, file, reason}` row to `scripts/lint-legal.allowlist.json` — do not loosen the regex.
- **A5 — Aaron's clearance basis:** Aaron's ~60 counterparties were cleared en masse by referencing the public bsvlaw.com URL rather than listing each name (per D-15 wording). If you prefer each counterparty enumerated, the register row can be expanded.

## Known Stubs
None. (`buildArticleLd` remains a Phase 5 stub by design — out of this plan's scope and explicitly not touched.)

## Self-Check: PASSED
- Files created — all present: scripts/lint-legal.mjs, scripts/lint-legal.allowlist.json, tests/_fixtures/lint-legal-violation.mdx, and the 8 spec files (verified on disk).
- Commits exist: e80162b (Task 1), dbdc94d (Task 2), 0672884 (Task 3).
- `npx astro check` → 0 errors. `npm run lint:legal` → exit 0 clean / exit 1 on fixture. Full Playwright suite → 34 passed, 6 skipped (fixme scaffolds), 0 failed.
