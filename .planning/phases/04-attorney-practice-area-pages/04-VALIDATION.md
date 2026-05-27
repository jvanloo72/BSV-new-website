---
phase: 4
slug: attorney-practice-area-pages
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-27
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | astro check (content-collection schema) + npm run lint:legal (Rule 7.4) + Playwright (pages.spec) |
| **Config file** | astro.config.mjs / playwright.config.ts (confirm during Wave 0) |
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
| (planner fills) | | | | | | | | | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Confirm `astro check` passes on the existing scaffold before adding content
- [ ] Confirm Playwright `pages.spec` infrastructure exists (from earlier phases) or stub it

*Planner refines; existing infrastructure likely covers most phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Draft FAQ accuracy & non-promissory wording | PRAC-08, LEGAL-10 | Compliance judgment by attorney of record | Jon reviews drafted FAQs before publish (D-13/D-19) |
| Bio wording matches bsvlaw.com | ATTY-02..05 | Content fidelity | Compare rendered bio against live site |

*Automated checks cover schema, banned terms, JSON-LD validity, draft exclusion, Fishbien absence.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 120s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
