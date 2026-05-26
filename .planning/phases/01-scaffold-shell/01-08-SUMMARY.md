---
phase: 01-scaffold-shell
plan: "08"
subsystem: phase-1-signoff
tags: [wave-6, signoff, ci-green, branch-protection, phase-complete]
requirements:
  - FOUND-09
  - OPS-05
  - all-phase-1-ids-validated
dependency-graph:
  requires:
    - all-prior-plans (00, 01, 02, 03, 04, 05, 06, 07)
  provides:
    - phase-1-sign-off-pr (merged to main)
    - branch-protection-on-main (build-and-test status check required)
    - production-vercel-deploy (auto-deployed from main)
    - all-17-phase-1-requirements-validated
    - state-md-marked-phase-1-complete
    - roadmap-md-phase-1-checkbox-ticked
  affects:
    - phase-2 (unblocked — /gsd:plan-phase 2 is the next command)
key-files:
  modified:
    - .planning/STATE.md
    - .planning/REQUIREMENTS.md
    - .planning/ROADMAP.md
decisions:
  - "CI workflow ran green on its first PR — actions/checkout@v5 and actions/setup-node@v5 both exist as RESEARCH.md A5 assumed. No fallback to v4 needed. Future phases should use the same versions."
  - "Vercel preview deploys are gated by 'Deployment Protection' (Vercel Authentication) — every preview URL returns HTTP 401 to unauthenticated requests. This is Vercel's 2026 default for new projects. For curl-based header verification this means we either disable the gate, use a bypass token, or verify on the production URL after merge. Jon chose to visually verify the preview in his browser (logged-in Vercel cookie) and defer header verification to a future check. Recorded as Phase 7 follow-up: run `curl -I https://<production-url>/` and verify all five vercel.json headers + Vercel's auto X-Robots-Tag + HSTS."
  - "Branch protection on main is the 'classic' rule type: require status check `build-and-test`, require branches up to date, require a pull request before merging. This blocks anyone (including Claude in future sessions) from direct-pushing to main."
  - "Plan 01-08 was originally designed to merge to main and only THEN turn on branch protection (so the merge itself wouldn't be blocked by the new rule). In practice Jon enabled branch protection BEFORE the final merge — the build-and-test check had already gone green, so the merge proceeded without issue. The sequence didn't matter."
metrics:
  tasks: 3
  tasks_completed: 3
  commits: 1  # this SUMMARY + STATE/REQ/ROADMAP updates (one commit)
  files_modified: 3
  human_checkpoints: 2  # PR + verify + branch protection + merge (Jon did them in sequence)
  completed: "2026-05-26T18:30:00Z"
---

# Phase 01 Plan 08: Phase 1 Sign-Off — Summary

Phase 1 is complete. The sign-off PR merged to `main`; branch protection requires the `build-and-test` CI check before any future merge; production auto-deploys from `main`; all 17 Phase 1 requirements are marked Validated.

## What happened

### Task 1 — Final PR + CI verification + visual preview (manual checkpoint, all green)

Branch `phase-1-final-signoff` pushed to GitHub with all 18 commits from Waves 2-5 on top of the Walking Skeleton. PR opened. The new CI workflow (Plan 01-07) ran on its first PR ever:

- `actions/checkout@v5` resolved ✓
- `actions/setup-node@v5` resolved ✓ (no fallback to v4 needed — RESEARCH.md A5's assumption was correct)
- All 13 workflow steps green: npm ci, astro check, build, playwright install, test:disclaimer, test:baselayout, test:zod-negative, test:disclaimer-set, test:jsonld, lint:legal, gitleaks-action

Vercel posted the preview URL: `https://bsv-new-website-89dzqay5d-bsvlawproject.vercel.app`. Vercel's "Deployment Protection" (Vercel Authentication) gates the URL behind SSO — curl from outside returns HTTP 401, but Jon (logged into Vercel) can click through in a browser. Jon visually verified all six Phase 1 routes (`/`, `/about`, `/contact`, `/practice-areas`, `/attorneys`, `/blog`): each renders the header (firm name + 6 nav links + active-page underline) and the footer with the canonical disclaimer text.

Live HTTP header curl verification was deferred to a future check against the production URL — see Decisions block. This is a low-severity deferral because `vercel.json` is unchanged from Plan 01 (Jon visually confirmed headers on that PR), and Phase 7's launch verification will run a full curl check then.

### Task 2 — Branch protection on main + merge (manual checkpoint)

Jon enabled classic branch protection on `main` via GitHub Settings → Branches:
- ☑ Require status checks to pass before merging
- ☑ Required check: `build-and-test`
- ☑ Require branches to be up to date before merging
- ☑ Require a pull request before merging

Then merged the sign-off PR via the GitHub UI. Vercel auto-deployed to production within ~90 seconds.

### Task 3 — Planning state files updated (this commit)

Three files changed to reflect Phase 1 close-out:

- **`.planning/STATE.md`**: frontmatter `status: in-progress`, `completed_phases: 1`, `completed_plans: 9`, `percent: 14`. Current Position section advanced to Phase 2 (Design System & Visual Identity), status "Ready to plan", resume command `/gsd:plan-phase 2`. Velocity table seeded with Phase 1 row.
- **`.planning/REQUIREMENTS.md`**: 17 Phase 1 requirement checkboxes ticked (`[ ]` → `[x]`) in the body lists; corresponding traceability table rows changed `Pending` → `Validated`. The SEC-04 row notes the deferred local gitleaks layer per DECISIONS.md 2026-05-26.
- **`.planning/ROADMAP.md`**: Phase 1 list entry ticked (`- [x]`); progress table row updated to `9/9 | Complete | 2026-05-26`.

## Production state

- **Production URL**: lives on Vercel's `*.vercel.app` (custom domain `bsvlaw.com` is a Phase 7 task).
- **Branch**: `main` is the trunk; auto-deploys on every push.
- **Branch protection**: active. No direct pushes to `main`; PRs gated on `build-and-test`.
- **CI**: GitHub Actions workflow `.github/workflows/ci.yml` runs on every PR.
- **Secrets**: GitHub push protection enabled (server-side); CI gitleaks-action runs on every PR (PR-time backstop). Local pre-commit hook deferred per DECISIONS.md 2026-05-26.

## What's locked in for Phase 2 to build on

- **Stack**: Astro 6 + Tailwind v4 + Vercel adapter + MDX + sitemap — all four integrations wired and tested end-to-end.
- **Content layer**: five Zod-typed collections + cross-reference typing. Every later phase's content additions are gated by the same schemas — Phase 4's real attorney bios drop into the same shape.
- **Layout layer**: `BaseLayout` + three specialized layouts. The slot-transfer pattern (`<JsonLd slot="head" data={...} />`) is the contract for adding per-page structured data in Phases 4 and 5.
- **Components**: SiteHeader (responsive nav with active-link state), SiteFooter (disclaimer + mailto + locations), Disclaimer (typed id), JsonLd + SeoHead + SkipToContent.
- **Routes**: 8 static + 3 dynamic-route shells. The dynamic shells are inert in Phase 1 (every entry is draft) and light up automatically when Phase 4/5 flip drafts to `false`.
- **Security baseline**: 5 HTTP headers via vercel.json, CSP report-only soak begins, /api/csp-report endpoint live, GitHub push protection on.
- **Test suite**: 5 specs — disclaimer-crawl, baselayout, zod-negative, disclaimer-set, jsonld-legalservice — all green locally and in CI in ~24 s.
- **Design tokens**: 7 placeholder token names locked (`--color-text`, `--color-text-muted`, `--color-bg`, `--color-bg-elevated`, `--color-border`, `--color-accent`, `--color-accent-fg`, `--font-sans`). Phase 2 changes the *values* without touching any component's class strings.

## Deferred to Phase 7 (or later)

- Live curl verification of the five `vercel.json` security headers + Vercel auto-headers (HSTS, X-Robots-Tag). Easy to run against the production URL when Vercel deployment-protection isn't in the way.
- Local gitleaks pre-commit hook. Scaffolding is ready (`scripts/install-git-hooks.ps1`, `.gitleaks.toml`); reinstating is a one-command operation when Jon installs the binary.
- Custom domain (`bsvlaw.com` or transition domain). Phase 7 task.
- Tightening CSP from `Report-Only` to enforce mode. Phase 7 after a clean soak through Phases 3-6.

## Self-Check: PASSED

- [x] Final Phase 1 PR opened; CI ran green (build + check + 5 tests + gitleaks + lint:legal); Vercel preview URL posted
- [x] Jon clicked the preview URL and visually confirmed all six Phase 1 routes render header + footer disclaimer
- [x] Branch protection rule on main requires the `build-and-test` CI workflow to pass — no PR merges without green CI
- [x] Phase 1 sign-off PR merged to main; production auto-deploy live
- [x] STATE.md, REQUIREMENTS.md, ROADMAP.md updated to reflect Phase 1 complete
- [ ] Live HTTP header curl verification — DEFERRED to a future check against the production URL (Vercel preview is auth-walled; production is not)

## Next step

`/gsd:plan-phase 2` — Phase 2 is **Design System & Visual Identity**. Requires Jon's color-palette decision (2-3 options will be presented). UI hint: yes.
