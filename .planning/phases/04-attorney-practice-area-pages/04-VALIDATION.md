---
phase: 4
slug: attorney-practice-area-pages
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-27
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | astro check (content-collection schema) + npm run lint:legal (Rule 7.4) + Playwright + cheerio |
| **Config file** | astro.config.mjs / playwright.config.ts (exist) |
| **Quick run command** | `npm run lint:legal && npx astro check` |
| **Full suite command** | `npm run build && npx playwright test` |
| **Estimated runtime** | ~60-120 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run lint:legal && npx astro check`
- **After every plan wave:** Run `npm run build`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** ~120 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-1 | 01 | 1 | ATTY-09, SEO-03, PRAC-08, SEO-05 | T-04-03 | JSON-LD builders return escaped objects | type-check | `npx astro check` | ✅ exists | ⬜ pending |
| 01-2 | 01 | 1 | LEGAL-03 | T-04-02, T-04-04 | banned-term scanner fails build | unit/CLI | `node scripts/lint-legal.mjs` | ✅ exists | ⬜ pending |
| 01-3 | 01 | 1 | LEGAL-04, ATTY-11, ATTY-06 | T-04-01 | clearance register + Wave 0 scaffolds | fs+build | `npx playwright test tests/lint-legal.spec.ts tests/fishbien-absent.spec.ts tests/clearance.spec.ts` | ❌ Wave 0 creates | ⬜ pending |
| 02-1 | 02 | 2 | ATTY-02..05, ATTY-08, ATTY-12, LEGAL-10 | T-04-05, T-04-06, T-04-07 | schema-valid bios, no banned term, no fabrication | type+lint | `npx astro check && npm run lint:legal` | ✅ exists | ⬜ pending |
| 02-2 | 02 | 2 | ATTY-01, ATTY-06, ATTY-07, ATTY-09, ATTY-10, ATTY-11, SEO-03, LEGAL-02 | T-04-08, T-04-09 | Person JSON-LD, email-only callout, draft exclusion | build+parse | `npm run build && npx playwright test tests/person-jsonld.spec.ts tests/draft-exclusion.spec.ts tests/fishbien-absent.spec.ts` | ❌ Wave 0 | ⬜ pending |
| 03-1 | 03 | 2 | PRAC-01..05, LEGAL-06, LEGAL-10 | T-04-10, T-04-11 | cleared deals only, testimonial disclosure | type+lint | `npx astro check && npm run lint:legal` | ✅ exists | ⬜ pending |
| 03-2 | 03 | 2 | PRAC-06, PRAC-07, PRAC-09, SEO-05, LEGAL-08 | T-04-12, T-04-13, T-04-14 | getEntries link resolution, guarded FAQPage, fee band | build+parse | `npm run build && npx playwright test tests/pages-exist.spec.ts tests/lead-attorney-link.spec.ts` | ❌ Wave 0 | ⬜ pending |
| 04-1 | 04 | 3 | PRAC-08, LEGAL-10 | T-04-15 | human approval gate before FAQ commit | manual gate | (blocking checkpoint — Jon approves) | n/a | ⬜ pending |
| 04-2 | 04 | 3 | PRAC-08, SEO-05, LEGAL-10 | T-04-16, T-04-17 | FAQPage Q/A count matches visible FAQs | build+parse | `npm run lint:legal && npm run build && npx playwright test tests/faqpage-jsonld.spec.ts` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] Confirm `astro check` passes on the existing scaffold before adding content (existing CI)
- [x] Confirm Playwright infrastructure exists (12 specs present from Phases 1-2)
- [ ] Create 8 new test scaffolds + 1 fixture in Plan 01 Task 3 (person-jsonld, faqpage-jsonld, lint-legal, fishbien-absent, draft-exclusion, clearance, pages-exist, lead-attorney-link)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Draft FAQ accuracy & non-promissory wording | PRAC-08, LEGAL-10 | Compliance judgment by attorney of record | Jon reviews drafted FAQs before publish (D-13/D-19 — Plan 04 Task 1 blocking gate) |
| Bio wording matches bsvlaw.com | ATTY-02..05 | Content fidelity | Compare rendered bio against live site (Plan 02 review) |
| Iris bar placeholder acceptable | ATTY-05, D-05 | Compliance display decision | Jon confirms "Bar admission details to be confirmed" placeholder (A2) |
| "expertise" banned vs allowlisted | LEGAL-03, D-16 | Compliance judgment | Jon confirms the banned-term word set (A1) |
| Partner email addresses | ATTY-07, D-08 | Firm-internal fact | Jon confirms firstname@bsvlaw.com addresses (A3) |

*Automated checks cover schema, banned terms, JSON-LD validity, draft exclusion, Fishbien absence, lead-attorney links.*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies (04-1 is the one intentional human gate, D-13)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references (Plan 01 Task 3 creates the 8 scaffolds)
- [x] No watch-mode flags
- [x] Feedback latency < 120s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** ready
