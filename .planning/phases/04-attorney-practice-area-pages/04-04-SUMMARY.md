---
plan: 04-04
phase: 04-attorney-practice-area-pages
status: complete
completed: 2026-05-27
requirements: [PRAC-08, SEO-05, LEGAL-10]
---

# Plan 04-04 Summary — FAQ Human-Approval Gate

## Self-Check: PASSED

## What shipped
- **D-13 human-approval gate closed.** The 13 FAQ drafts in `FAQ-DRAFT.md` were
  presented to Jon, who approved all 13 as drafted on 2026-05-27.
- Approved FAQs written into the three practice-area MDX `faqs:` arrays:
  - Mergers & Acquisitions — 5 FAQs
  - Intellectual Property & Technology Transactions — 4 FAQs
  - Tax — 4 FAQs
- `FAQPage` JSON-LD now emits on each practice page (un-guarded once `faqs` is
  non-empty); the `faqpage-jsonld` spec was un-skipped and passes — JSON-LD
  Question/Answer count matches the visible accordion items on all three pages
  (PRAC-08 / SEO-05).

## Review corrections applied in the same pass (Jon, 2026-05-27)
- **Attorney emails overridden** to the firm's real addresses (email only, no
  phone): `abelcher@`, `ssmolen@`, `jon@`, `izhang@`, `sjiang@` `bsvlaw.com`.
- **Susan's prior firm** corrected to "Simpson Thacher & Bartlett" (was the live
  site's misspelled "Thatcher").
- **Iris's bar line** reworded to exactly "Bar admission details to follow."
- M&A practice-page deal subset (~10) kept as curated; Aaron's full 64-deal list
  remains on his profile.

## Verification
- `npx astro check` → 0 errors.
- `npm run lint:legal` → clean (no Rule 7.4 banned terms; FAQ answers are
  non-promissory per Rule 7.1 / LEGAL-10).
- `npm run build` → all pages emit.
- Full Playwright suite → 42 passed, 0 failed (faqpage-jsonld now active).

## Notes
- FAQ answers contain no outcome guarantees, no "results", no banned terms —
  reviewed against Rule 7.1 / 7.4 / LEGAL-10.
