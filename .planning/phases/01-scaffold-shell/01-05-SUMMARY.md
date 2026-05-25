---
phase: 01-scaffold-shell
plan: 05
subsystem: docs
tags: [url-conventions, slug-policy, decision-log, disclosure-clearance, aba-rule-7-4, slopsquat-defense, csp-report-only]

requires:
  - phase: 01-scaffold-shell
    provides: "Phase plan, CONTEXT (D-01..D-31 locked decisions), and REQUIREMENTS (FOUND-08, LEGAL-04) — none of these required code or test artifacts; pure documentation upstream"
provides:
  - "URL conventions locked in writing — slug formats for attorneys, practice areas, blog; canonical route list of every v1 URL; blog-slug lock clause + 301-redirect change process"
  - "Empty CLIENT_DISCLOSURE_CLEARANCE.md template for Phase 4 to populate before any deal experience publishes (three tables: Clients, Counterparties, Deal Codenames; partner-sign-off process)"
  - "Phase 1 architectural decision log seeded — seven dated entries with What/Why/Teaching-insight structure (stack lock, CSP report-only, vercel.json headers, gitleaks Go binary, Zod-typed collections, Tailwind v4 token name lock, single-Disclaimer-component pattern)"
affects: [02-design-system, 03-static-pages, 04-attorney-and-practice-area-pages, 05-insights-blog, 06-contact-form, 07-security-launch]

tech-stack:
  added: []
  patterns:
    - "Doc-only deliverables with YAML frontmatter that records the lock date and the satisfied requirement ID (FOUND-08 / LEGAL-04)"
    - "Decision Log append convention — Phase N appends entries to .planning/DECISIONS.md per .claude/CLAUDE.md HeyCounsel community-documentation requirement"

key-files:
  created:
    - ".planning/URL-CONVENTIONS.md"
    - ".planning/CLIENT_DISCLOSURE_CLEARANCE.md"
    - ".planning/DECISIONS.md"
    - ".planning/phases/01-scaffold-shell/01-05-SUMMARY.md"
  modified: []

key-decisions:
  - "URL-CONVENTIONS.md is the single source of truth for slug formats — changing a slug post-publish requires a vercel.json 301 redirect AND a DECISIONS.md entry"
  - "Nir Fishbien is explicitly named in URL-CONVENTIONS.md as excluded, not just absent — exclusion is intentional and load-bearing per .claude/CLAUDE.md and FIRM_BRIEF.md"
  - "Blog-slug lock is enforced socially (via the editorial reviewed_by gate), not in code — any author CAN edit a slug, but doing so without a 301 redirect is a process violation"
  - "CLIENT_DISCLOSURE_CLEARANCE.md splits into three tables (Clients, Counterparties, Deal Codenames) rather than a single mixed table — counterparties have a different clearance bar (typically requires public-record confirmation) than clients"
  - "DECISIONS.md entries follow a strict three-section template (What was decided / Why / Teaching insight) so a non-technical HeyCounsel community reader can extract the generalizable lesson without parsing the project specifics"
  - "Decision Log seeded with seven Phase 1 entries — chosen for their architectural load-bearing quality (stack lock, security posture, schema-level contracts) rather than every one of the 31 D-numbered decisions in CONTEXT.md"

patterns-established:
  - "Frontmatter convention for planning docs: locked_at / created date, locked_in_phase / populated_in_phase number, requirement ID reference"
  - "Decision Log entry format: ## YYYY-MM-DD — Phase N — Title, then **What was decided / Why / Teaching insight** sections, with newest entries appended above the trailing ## How to add a new entry heading"
  - "Slug lock + 301-redirect change process — codified in URL-CONVENTIONS.md ## Change Process section, referenced by future-phase planning"
  - "Clearance allowlist + recorded partner sign-off — codified in CLIENT_DISCLOSURE_CLEARANCE.md ## Process section, must be enforced before Phase 4 deal-experience publishes"

requirements-completed: [FOUND-08]

duration: 23min
completed: 2026-05-25
---

# Phase 01 Plan 05: Lock URL Conventions, Disclosure Clearance Template, and Phase 1 Decision Log — Summary

**URL conventions locked in writing (FOUND-08); empty CLIENT_DISCLOSURE_CLEARANCE.md template created for Phase 4; DECISIONS.md seeded with seven dated Phase 1 architectural decision entries per the .claude/CLAUDE.md Decision Log requirement.**

## Performance

- **Duration:** ~23 min
- **Started:** 2026-05-25T23:28:00Z (approximate — agent spawn)
- **Completed:** 2026-05-25T23:51:46Z
- **Tasks:** 2 (both `type=auto`)
- **Files created:** 3 (plus this SUMMARY.md)
- **Files modified:** 0

## Accomplishments

- **FOUND-08 satisfied.** `.planning/URL-CONVENTIONS.md` now codifies the slug format for attorneys (`first-last` lowercase), practice areas (verbose hyphenated — `mergers-acquisitions`, `intellectual-property-technology-transactions`, `tax`), and blog (kebab-case-from-title, locked at first publish). The Canonical Route List enumerates every v1 URL. The blog-slug lock clause and the 301-redirect change process are spelled out.
- **LEGAL-04 unblocked for Phase 4.** `.planning/CLIENT_DISCLOSURE_CLEARANCE.md` is the empty template that Phase 4 will populate with cleared client/counterparty names + partner sign-offs before any deal experience publishes. Three tables (Cleared Clients, Cleared Counterparties, Cleared Deal Codenames) and a ## Process section with the addition + revocation workflow.
- **Decision Log seeded.** `.planning/DECISIONS.md` opens with seven dated Phase 1 entries — the load-bearing architectural decisions (stack lock; CSP Report-Only through Phases 1–6; `vercel.json` over Astro `security.csp`; gitleaks Go binary not npm slopsquat; five Zod-typed content collections; Tailwind v4 token name lock; single Disclaimer component reading from a single JSON file). Each entry follows the **What was decided / Why / Teaching insight** format the .claude/CLAUDE.md Decision Log requirement specifies for HeyCounsel community documentation.

## Task Commits

Each task was committed atomically on this worktree branch:

1. **Task 1: Create URL-CONVENTIONS.md + CLIENT_DISCLOSURE_CLEARANCE.md template** — `643fd96` (docs)
2. **Task 2: Seed DECISIONS.md with Phase 1 architectural decision log entries** — `2ee0719` (docs)

A separate SUMMARY commit immediately follows this file's write.

## Files Created/Modified

- `.planning/URL-CONVENTIONS.md` — Locked slug formats and canonical route list. Frontmatter: `locked_at: 2026-05-25`, `locked_in_phase: 1`, `requirement: FOUND-08`. Contains the explicit five-attorney slug list, the explicit three-practice-area slug list, the explicit Nir Fishbien exclusion, the blog-slug lock clause, the `trailingSlash: 'never'` note, and the ## Change Process section.
- `.planning/CLIENT_DISCLOSURE_CLEARANCE.md` — Empty Phase 4 template. Frontmatter: `created: 2026-05-25`, `populated_in_phase: 4`, `requirement: LEGAL-04`. Three placeholder-row tables and a ## Process section detailing partner sign-off + revocation workflow.
- `.planning/DECISIONS.md` — Seven dated Phase 1 architectural entries plus a trailing ## How to add a new entry heading documenting the append convention for later phases.
- `.planning/phases/01-scaffold-shell/01-05-SUMMARY.md` — This file.

## Decisions Made

All decisions documented inside the artifacts themselves; no out-of-band decisions during execution. The plan was followed as written. Three plan-level choices that the executor solidified during writing:

1. **Slug-rename governance is documented at two layers, not just one.** URL-CONVENTIONS.md's ## Change Process names BOTH the `vercel.json` 301-redirect requirement (technical) AND the DECISIONS.md entry requirement (procedural). Phase 4+ planners can find the policy in one place.
2. **Counterparty clearance has a different bar than client clearance.** CLIENT_DISCLOSURE_CLEARANCE.md splits Counterparties into their own table and notes that public-record (SEC 8-K, closed-merger announcement, press release) confirmation is the typical clearance basis — counterparties in private deals are typically NOT cleared. This prevents a Phase 4 author from treating "they're not our client" as equivalent to "they're cleared to name."
3. **The seven seeded decision entries were chosen for architectural load-bearing quality, not by simply enumerating every D-numbered decision in CONTEXT.md.** CONTEXT.md has 31 numbered decisions; the seven chosen for the seed log are the ones whose reasoning would generalize for a HeyCounsel community reader — the rule-of-thumb takeaway, not the project-specific specifics. Later phases append additional entries as new architectural decisions are made.

## Deviations from Plan

**One process deviation encountered and recovered (path-safety):**

### Auto-fixed Issues

**1. [Rule 1 - Bug] Initial Write tool calls landed in the main repo's `.planning/` instead of the worktree's `.planning/`**

- **Found during:** Task 1 (during the post-write verification step)
- **Issue:** The Write tool was invoked with absolute path `C:\Users\jonva\Documents\BSV-website\.planning\URL-CONVENTIONS.md`, which does NOT contain the worktree segment `.claude/worktrees/agent-a4d518d754e80569a/` and therefore resolved to the **main repository's** `.planning/` directory, not the worktree's. This is exactly the absolute-path-safety failure mode called out in the execute-plan.md `<task_commit_protocol>` step 0b ("Before any Edit or Write call that uses an absolute path, verify the path resolves inside the current worktree").
- **Fix:** Re-wrote both files using the full worktree-qualified absolute path (`C:\Users\jonva\Documents\BSV-website\.claude\worktrees\agent-a4d518d754e80569a\.planning\…`). Then verified the files in the worktree (`git status --short` showed them as `??` correctly), and removed the two misplaced untracked files from the main repo via `rm` (they were untracked there, so the cleanup had zero impact on the main repo's git history).
- **Files modified:** `.planning/URL-CONVENTIONS.md`, `.planning/CLIENT_DISCLOSURE_CLEARANCE.md` (the worktree copies, not the misplaced ones; the misplaced ones were deleted from the main repo before any commit was made).
- **Verification:** `git status --short` post-recovery showed the misplaced paths gone and the worktree paths staged. The Task 1 PowerShell acceptance script passed cleanly against the worktree copies. Task 2's DECISIONS.md was written directly to the worktree-qualified path on the first try (no recovery needed for Task 2).
- **Committed in:** `643fd96` (Task 1 commit — the recovered files are what was committed; the misplaced copies never made it into any commit).

---

**Total deviations:** 1 auto-fixed (path-safety bug recovered before any commit).
**Impact on plan:** Zero impact on plan content. The recovery was procedural — the file contents that ultimately committed are identical to what the plan specified. No scope creep, no missing artifacts, no architectural change.

## Issues Encountered

- **PowerShell verification scripts had to be invoked with an explicit `Set-Location -LiteralPath '<worktree>'`.** A first attempt that relied on PowerShell inheriting the Bash cwd ran against the main repo (where the files no longer exist after the path-safety recovery above) and failed with `Missing: .planning/URL-CONVENTIONS.md`. Resolved by passing the worktree path explicitly to `Set-Location` before invoking the verification logic. Documented here so a future executor on the same worktree pattern can skip the diagnosis step.
- **A stale `/tmp/verify_task1.ps1` file from a sibling agent existed.** The Windows `%TEMP%` directory is shared across agents on the same machine. Resolved by using a unique-named script file (`/tmp/verify_0105_t1.ps1`) and by switching to inline `-Command` invocation that does not depend on the temp file at all. Documented here as a general worktree-isolation gotcha for the BSV multi-agent setup.

## User Setup Required

None — no external service configuration required. This plan is documentation-only.

## Next Phase Readiness

- **For Plan 01-00 (Wave 0 sibling — Walking Skeleton):** No interaction. Plan 01-05 touches only `.planning/*.md` files; Plan 01-00 touches only `tests/` and `scripts/`. Zero file overlap, as the orchestrator note confirmed.
- **For later Phase 1 plans:** `.planning/URL-CONVENTIONS.md` is referenced by Plan 01-00 (`trailingSlash: 'never'` is set in `astro.config.mjs` per Plan 01); future plans that add routes should update the Canonical Route List in the same PR.
- **For Phase 4:** `.planning/CLIENT_DISCLOSURE_CLEARANCE.md` is the gate template. Phase 4's deal-experience copy MUST add rows here with partner sign-off before any client or counterparty name appears on the site. This requirement is restated in the plan's `LEGAL-04` traceability row in REQUIREMENTS.md.
- **For all later phases:** `.planning/DECISIONS.md` is the append target. Per the trailing ## How to add a new entry section, each phase appends its own architecturally-load-bearing decisions following the **What / Why / Teaching insight** template.

## Self-Check: PASSED

Verified after writing this SUMMARY.md:

- **Files exist on disk:**
  - `.planning/URL-CONVENTIONS.md` — FOUND
  - `.planning/CLIENT_DISCLOSURE_CLEARANCE.md` — FOUND
  - `.planning/DECISIONS.md` — FOUND
  - `.planning/phases/01-scaffold-shell/01-05-SUMMARY.md` — FOUND (being written now)
- **Commits exist on this worktree branch:**
  - `643fd96` — Task 1 — FOUND (`git log --oneline` shows it)
  - `2ee0719` — Task 2 — FOUND (`git log --oneline` shows it)
- **Acceptance criteria from PLAN.md:**
  - URL-CONVENTIONS.md contains every required substring per the Task 1 PowerShell verification script — PASS (script printed `URL-CONVENTIONS + CLIENT_DISCLOSURE_CLEARANCE templates OK`).
  - DECISIONS.md has 7 dated entries per the Task 2 PowerShell verification script — PASS (script printed `DECISIONS.md seeded with Phase 1 entries (7 dated entries)`).
  - LEGAL-04 reference present in CLIENT_DISCLOSURE_CLEARANCE.md — PASS.

---

*Phase: 01-scaffold-shell*
*Plan: 05*
*Completed: 2026-05-25*
