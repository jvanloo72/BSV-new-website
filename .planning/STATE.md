---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 04-02-PLAN.md
last_updated: "2026-05-27T22:10:00Z"
last_activity: 2026-05-27 -- Completed Phase 4 Plan 02 (attorney profiles)
progress:
  total_phases: 7
  completed_phases: 3
  total_plans: 20
  completed_plans: 18
  percent: 49
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-25)

**Core value:** A prospective client who lands on the site comes away convinced that BSV has the competence, experience, and responsiveness to handle their specific transaction — and reaches out.
**Current focus:** Phase 4 — Attorney & Practice Area Pages

## Current Position

Phase: 4 (Attorney & Practice Area Pages) — EXECUTING
Plan: 3 of 4
Status: Executing Phase 4
Last activity: 2026-05-27 -- Completed Phase 4 Plan 02 (attorney profiles)

Progress: [████▉░░░░░] 49% (3 of 7 phases complete; Phase 4: 2 of 4 plans)

Resume: `/gsd:execute-phase 4` — Phase 4 Plan 03 (practice-area pages) is next.
Next phase: Phase 4 Plan 03 — three practice-area MDX + PracticeAreaLayout render-out (FAQ drafts gated for Jon).

## Performance Metrics

**Velocity:**

- Total plans completed: 13 (Phase 1)
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Scaffold & Shell | 9/9 | — | — |
| 2 | 4 | - | - |

**Recent Trend:**

- Last 5 plans: —
- Trend: —

*Updated after each plan completion*
| Phase 2 P1 | 50m | 3 tasks | 15 files |
| Phase 2 P2 | 7m | 3 tasks | 19 files |
| Phase 2 P3 | 7m | 2 tasks | 5 files |
| Phase 3 P1 | 3m | 3 tasks | 5 files |
| Phase 3 P3 | 12m | 3 tasks | 6 files |
| Phase 3 P2 | 6m | 2 tasks | 3 files |
| Phase 4 P1 | 50m | 3 tasks | 14 files |
| Phase 4 P2 | 22m | 2 tasks | 11 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table. The full Phase 1 build-time decision log is in .planning/DECISIONS.md (10 entries through 2026-05-26).
Recent decisions affecting current work:

- 2026-05-27: Attorney bios replicated verbatim from the live bsvlaw.com pages (re-fetched at build, D-01/D-03); Aaron's full 64-deal list mapped 1:1 from CONTEXT <specifics> all cleared:true (D-04/D-15); Iris + Susan barAdmissions use a non-committal "Bar admission details to be confirmed" placeholder to satisfy the min-1 schema without inventing a jurisdiction (D-05); email-only mailto callout, phone field left unset everywhere (D-08) (04-02)
- 2026-05-27: lint:legal is a real Node 22 scanner (scripts/lint-legal.mjs) over src/content **.mdx, wired as a prebuild gate; "expertise" is banned-by-default with an empty allowlist pending Jon's compliance call (A1); Aaron Belcher's complete deal list cleared en masse via the bsvlaw.com URL basis rather than enumerating ~60 counterparties (D-15/A5) (04-01)
- 2026-05-27: robots.txt generated via an Astro static endpoint (src/pages/robots.txt.ts) rather than installing astro-robots-txt — @astrojs/sitemap does not emit robots.txt; the endpoint adds zero new dependency, references sitemap-index.xml, and omits /design-system so it cannot advertise the hidden gallery (03-03)
- 2026-05-26: D-04 homepage named deals (Athelas/Commure $6B, Mode Analytics $200M, Illumina/Roche defense, representative-parties list, Daniel Brian testimonial) cleared by Jon Van Loo and recorded in CLIENT_DISCLOSURE_CLEARANCE.md before publish — the Rule 1.6/7.4 gate; also unblocks the Phase 4 clearance gate for these same items (DECISIONS.md)
- 2026-05-26: BSV mark derived as a 3-line convergence-to-knot glyph distilled from the hero motif (modernization, not rebrand, D-14) so it reads at 16-32px; favicon carries explicit accent rust (standalone, not theme-following) while the in-app mark uses currentColor
- 2026-05-26: Whole codebase standardized on Tailwind v4 namespace utilities — Phase 1 chrome retrofitted from the arbitrary-value form (text-[color:var(...)]) to text-text/border-border/bg-bg; token names unchanged (D-22)
- 2026-05-26: Local gitleaks pre-commit hook deferred; GitHub push protection + CI gitleaks-action are the two active secret-scanning layers (DECISIONS.md)
- 2026-05-26: Content-collection image() assets must live under src/ (not /public) for Astro's asset-pipeline validation (DECISIONS.md)
- 2026-05-25: Five Zod-typed content collections with cross-collection reference() typing (DECISIONS.md)
- Pre-init: Tech stack locked — Astro 6 + Tailwind CSS v4 + GitHub + Vercel
- Pre-init: Lead message "Team work to get good results" — not credentials
- Pre-init: Nir Fishbien excluded from the new site
- Pre-init: Contact form backend deferred to Phase 6 (blocked on Jon's CRM answer)
- Pre-init: Color palette deferred to Phase 2 (Jon picks from 2-3 options)

### Pending Todos

None yet.

### Blockers/Concerns

- **Phase 2:** Color palette decision required from Jon (2-3 options will be presented).
- **Phase 4:** Susan Jiang's bio is incomplete — her profile will ship as `draft: true` until Jon supplies final copy.
- **Phase 4:** `CLIENT_DISCLOSURE_CLEARANCE.md` must be populated and reviewed before any representative-deals copy publishes. *(Partly resolved 2026-05-27: the homepage D-04 items — Athelas/Commure, Mode Analytics, Illumina/Roche, the representative-parties list, the Daniel Brian testimonial — are now cleared and reusable; any ADDITIONAL Phase 4 deals/clients still need their own clearance entries.)*
- **Phase 6:** Backend choice (Resend-only vs Resend + CRM webhook) blocked on Jon's CRM answer.
- **Phase 7:** Final "Attorney Advertising" footer wording to be confirmed by Jon against current CA + NY bar guidance.
- **Phase 7:** Headshots must be shot in time to swap before launch.

## Deferred Items

Items acknowledged and carried forward from previous milestone close:

| Category | Item | Status | Deferred At |
|----------|------|--------|-------------|
| *(none)* | | | |

## Session Continuity

Last session: 2026-05-27T22:10:00Z
Stopped at: Completed 04-02-PLAN.md
Resume file: None
