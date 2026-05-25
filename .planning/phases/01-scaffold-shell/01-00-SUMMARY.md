---
phase: 01-scaffold-shell
plan: "00"
subsystem: test-infrastructure-and-secret-scanning
tags: [wave-0, scaffold, playwright, gitleaks, test-infrastructure]
requirements:
  - LEGAL-01
  - SEC-04
dependency-graph:
  requires: []
  provides:
    - playwright-config-scaffold
    - test-spec-stubs-skipped
    - gitleaks-config-with-bsv-allowlist
    - pre-commit-hook-script
    - hook-installer-powershell
    - gitleaks-negative-test-shell
    - broken-blog-post-fixture
  affects:
    - plan-01-walking-skeleton (unblocked to begin npm install + Astro scaffold)
    - plan-02-content-collections (zod-negative + disclaimer-set test stubs ready)
    - plan-06-secrets-management (gitleaks binary install + hook activation gated here)
    - plan-07-ci-and-disclaimer-crawl (disclaimer-crawl + baselayout + jsonld stubs ready)
tech-stack:
  added:
    - "@playwright/test (imported by test stubs; install gated in Plan 01 behind checkpoint:human-verify)"
    - "cheerio (imported by disclaimer-crawl.spec.ts; install gated in Plan 01)"
    - "gitleaks (Go binary; install gated in Plan 06 — NOT via npm per RESEARCH.md Pitfall A1)"
  patterns:
    - "Wave 0 scaffold-first: every file created here is a contract that later waves implement against; no scavenger hunt for executors"
    - "test.skip(...) stubs commit as runnable code so npm test runs cleanly while bodies are still empty"
    - "FOOTER_DISCLAIMER_FRAGMENT constant defined once in disclaimer-crawl.spec.ts as the single source of truth (Plan 01 seeds matching text into disclaimers.json)"
    - "Negative-test fixtures live under tests/fixtures/ (outside src/content/) so the content-collection glob does not pick them up"
key-files:
  created:
    - playwright.config.ts
    - tests/disclaimer-crawl.spec.ts
    - tests/zod-negative.spec.ts
    - tests/disclaimer-set.spec.ts
    - tests/baselayout.spec.ts
    - tests/jsonld-legalservice.spec.ts
    - tests/fixtures/broken-blog-post.mdx
    - .gitleaks.toml
    - scripts/hooks/pre-commit
    - scripts/install-git-hooks.ps1
    - tests/gitleaks.spec.sh
  modified: []
decisions:
  - "Plan 00 deliberately does not touch package.json, package-lock.json, or node_modules — npm install lands in Plan 01 behind a checkpoint:human-verify gate (RESEARCH.md Package Legitimacy Audit, all packages [ASSUMED])"
  - "Test bodies are skipped (test.skip) rather than left empty so test runners can enumerate the scaffolds without failing once Plan 01 installs Playwright"
  - "FOOTER_DISCLAIMER_FRAGMENT defined once in disclaimer-crawl.spec.ts; Plan 01 must seed disclaimers.json with text containing that exact substring"
  - "Disclaimer rendering pattern (a) — entry.data.text rendered as plain string — recommended by RESEARCH.md Pattern 4 over splitting into per-id MDX files (preserves D-03 single-JSON-file decision)"
metrics:
  duration_seconds: 193
  completed: "2026-05-25T23:46:54Z"
  tasks: 2
  commits: 2
  files_created: 11
---

# Phase 01 Plan 00: Wave 0 Test Infrastructure & Secret-Scanning Scaffolds Summary

Created 11 scaffold files that close 8 of the 12 Wave 0 gaps catalogued in VALIDATION.md so every downstream Phase 1 plan can run its `<verify>` block against a real file path instead of inventing one on the fly.

## What was built

### Task 1 — Playwright test infrastructure (commit `b13e684`)

- **`playwright.config.ts`** at the repo root. Uses the canonical config from RESEARCH.md §"Pattern 8": `testDir: './tests'`, `fullyParallel: false`, `forbidOnly: !!process.env.CI`, `workers: 1`, `baseURL: 'http://localhost:4321'`, `webServer.command: 'npm run build && npx astro preview'`, `webServer.url: 'http://localhost:4321'`, `webServer.timeout: 120_000`, `webServer.reuseExistingServer: !process.env.CI`. The `@playwright/test` import is valid TypeScript regardless of whether the package is installed; install lands in Plan 01.

- **`tests/disclaimer-crawl.spec.ts`** — skipped stub for the Phase 1 canonical test (D-25 / FOUND-05 / LEGAL-01). Defines the constant `FOOTER_DISCLAIMER_FRAGMENT = 'The information on this website is for general informational purposes only'`. This is the single source of truth for the footer disclaimer text — Plan 01 must seed `src/content/disclaimers/disclaimers.json` so the `footer` entry's `text` contains that substring verbatim. Plan 07 unskips the test and fills the body.

- **`tests/zod-negative.spec.ts`** — skipped stub. Plan 02 wires the D-24 negative test: copy `tests/fixtures/broken-blog-post.mdx` into `src/content/blog/`, run `npm run build`, assert non-zero exit + Zod error in stderr, then remove the file.

- **`tests/disclaimer-set.spec.ts`** — skipped stub. Plan 02 asserts every one of the five locked disclaimer ids (`footer`, `contact`, `blog`, `practice-area`, `attorney`) exists in `disclaimers.json` with non-empty `text` and `version`.

- **`tests/baselayout.spec.ts`** — skipped stub. Plan 07 asserts the BaseLayout header contains the firm name and the footer contains `FOOTER_DISCLAIMER_FRAGMENT`.

- **`tests/jsonld-legalservice.spec.ts`** — skipped stub. Plan 07 parses the site-wide LegalService JSON-LD and asserts `@type === 'LegalService'` and `name === 'Belcher, Smolen & Van Loo LLP'`.

- **`tests/fixtures/broken-blog-post.mdx`** — D-24 negative-test input. MDX frontmatter intentionally omits `author` (a Zod `reference('attorneys')` required field). Frontmatter includes `title`, `slug`, `practiceArea`, `publishedAt`, `summary`, `reviewedBy`. Top-of-file comment warns future authors not to add an `author` field. Lives in `tests/fixtures/` so the content-collection glob (scoped to `./src/content/<collection>/`) does not pick it up at normal build time.

### Task 2 — gitleaks config + pre-commit hook + installer + negative-test shell (commit `6633729`)

- **`.gitleaks.toml`** at the repo root. `[extend] useDefault = true` inherits gitleaks's curated default ruleset (covers AWS, Stripe, Resend, Supabase, GitHub PAT, and hundreds more token formats). `[allowlist]` waives `intake@bsvlaw.com` (the firm's public intake email, expected in placeholder content and the footer disclaimer) and scopes the path allowlist to `src/content/disclaimers/disclaimers.json` and `src/content/attorneys/placeholder-attorney.mdx` only — a real secret in any other path still gets caught.

- **`scripts/hooks/pre-commit`** — POSIX shell script with `set -e` that invokes the gitleaks Go binary (`gitleaks protect --staged --no-banner --redact -v`). The script header explicitly documents that the legitimate gitleaks is a Go binary installed in Plan 06, NOT via npm (RESEARCH.md Pitfall A1: `gitleaks@1.0.0` on npm is a slopsquat by `ycjcl868`).

- **`scripts/install-git-hooks.ps1`** — PowerShell one-time installer. Resolves repo root via `git rev-parse --show-toplevel`, copies `scripts/hooks/pre-commit` into `.git/hooks/pre-commit` with `Copy-Item -Force`, grants execute permission via `icacls $hookPath /grant Everyone:RX`, and echoes the install path plus a reminder that the gitleaks binary install lands in Plan 06.

- **`tests/gitleaks.spec.sh`** — negative-test shell script (NOT a Playwright test; the `.sh` extension matches VALIDATION.md row 01-05-05). Run manually in Plan 06 after the gitleaks binary is installed. On a throwaway branch named `gitleaks-negative-test-<epoch>`, stages a file containing the canonical AWS documentation example key `AKIAIOSFODNN7EXAMPLE`, attempts `git commit`, and asserts the commit exits non-zero (gitleaks blocks). A `trap cleanup EXIT` always restores the working tree, deletes the throwaway branch, and removes the temp file even on script failure.

## Verification

Per-task automated verification ran the canonical PowerShell checks from each task's `<verify>` block:

- **Task 1** — all seven files exist; `tests/disclaimer-crawl.spec.ts` contains the literal `FOOTER_DISCLAIMER_FRAGMENT` constant; `tests/fixtures/broken-blog-post.mdx` does NOT contain an `author:` frontmatter line. PASSED.
- **Task 2** — all four files exist; `.gitleaks.toml` contains both `useDefault = true` and the literal `intake@bsvlaw.com`; the pre-commit hook contains `gitleaks protect --staged`; `tests/gitleaks.spec.sh` contains the literal `AKIAIOSFODNN7EXAMPLE`; the installer references `Copy-Item` and `.git/hooks/pre-commit`. PASSED (after Rule 3 deviation — see below).

No `package.json` or `node_modules/` was created or modified.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Reworded pre-commit hook comment so it no longer contains the literal substring `npx gitleaks`**

- **Found during:** Task 2 verification
- **Issue:** The `<verify>` PowerShell command for Task 2 contains `if ($hook ... -or $hook -match 'npx gitleaks') { Write-Error 'pre-commit hook calls wrong gitleaks (must be binary, not npx)'; exit 1 }`. This regex is unanchored and matches the literal string `npx gitleaks` anywhere in the file. The initial hook contained a multi-line comment warning future authors **NOT** to invoke the hook via "`npx gitleaks`" (matching the language in RESEARCH.md Pitfall A1). The literal substring tripped the verifier even though the actual `gitleaks` invocation is the correct Go-binary call.
- **Fix:** Reworded the comment to say "Do NOT change it to invoke gitleaks through the Node package runner (npm/npx)" — preserving the educational warning (Pitfall A1 reference is still present) without containing the literal `npx gitleaks` substring. The actual invocation remains `gitleaks protect --staged --no-banner --redact -v` — unchanged.
- **Files modified:** `scripts/hooks/pre-commit`
- **Commit:** Folded into `6633729` (the comment fix was applied before the file was first staged).

This is a scope-1 fix to satisfy the literal verifier check while preserving the plan's intent. The plan's `<acceptance_criteria>` ("does NOT contain the string `npx gitleaks` (Pitfall A1 enforcement)") is satisfied; the educational note about the slopsquat trap remains in the comment.

## Authentication Gates

None. No external tools, registries, or services were contacted during this plan.

## Known Stubs

These stubs are intentional Wave 0 scaffolds. Each test body is `test.skip(...)` so the test runner can enumerate the file without executing the unfinished assertion. The Plan number that fills each stub is noted in the file's TODO comment.

| File | Stub reason | Resolved by |
|------|-------------|-------------|
| `tests/disclaimer-crawl.spec.ts` | Body skipped; Plan 07 implements full disclaimer crawl per RESEARCH.md Pattern 8 | Plan 07 |
| `tests/zod-negative.spec.ts` | Body skipped; Plan 02 wires D-24 negative test | Plan 02 |
| `tests/disclaimer-set.spec.ts` | Body skipped; Plan 02 validates all five disclaimer ids in disclaimers.json | Plan 02 |
| `tests/baselayout.spec.ts` | Body skipped; Plan 07 asserts header + footer rendering | Plan 07 |
| `tests/jsonld-legalservice.spec.ts` | Body skipped; Plan 07 parses LegalService JSON-LD | Plan 07 |
| `scripts/hooks/pre-commit` | Script is correct; the `gitleaks` Go binary it invokes is not yet installed | Plan 06 (binary install) |
| `tests/gitleaks.spec.sh` | Script is correct; runs only after Plan 06 installs the gitleaks binary | Plan 06 (manual verification) |

All stubs are documented as Wave 0 contracts that later waves implement against. None block downstream plans from starting.

## Threat Flags

None. This plan creates scaffold files only — no new network endpoints, no new auth paths, no file-system access outside the repo, no schema changes at trust boundaries. The single threat surface added (`tests/gitleaks.spec.sh` containing the fake AWS key `AKIAIOSFODNN7EXAMPLE`) is the canonical AWS documentation example credential — gitleaks's default ruleset already allowlists it as a known-test fingerprint, and the threat register entry `T-1-Secrets-Scaffold` documents the accepted disposition.

## Plan-level success criteria check

- [x] VALIDATION.md Wave 0 row count drops from 12 to 4 — this plan creates 8 of the 12 listed scaffolds (`playwright.config.ts`, the five test specs, `tests/fixtures/broken-blog-post.mdx`, `tests/gitleaks.spec.sh`, `.gitleaks.toml`, `scripts/hooks/pre-commit`, `scripts/install-git-hooks.ps1`). The remaining four — `.github/workflows/ci.yml`, the three test bodies — land in Plans 01 and 07.
- [x] Every test scaffold uses `test.skip(...)` — verified by inspection; future `npm run test:disclaimer` after Plan 01 will run cleanly.
- [x] gitleaks config + pre-commit hook script + installer + negative-test shell script are all committed.

## Self-Check: PASSED

Verified after writing this SUMMARY:

**Created files exist:**

- FOUND: playwright.config.ts
- FOUND: tests/disclaimer-crawl.spec.ts
- FOUND: tests/zod-negative.spec.ts
- FOUND: tests/disclaimer-set.spec.ts
- FOUND: tests/baselayout.spec.ts
- FOUND: tests/jsonld-legalservice.spec.ts
- FOUND: tests/fixtures/broken-blog-post.mdx
- FOUND: .gitleaks.toml
- FOUND: scripts/hooks/pre-commit
- FOUND: scripts/install-git-hooks.ps1
- FOUND: tests/gitleaks.spec.sh

**Commits exist:**

- FOUND: b13e684 — test(01-00): scaffold Playwright config and six test stubs
- FOUND: 6633729 — chore(01-00): scaffold gitleaks config, pre-commit hook, and negative-test shell

Plan 01 is unblocked to begin the Walking Skeleton scaffold (`npm create astro@latest` → `npx astro add` integrations → first `npm install` behind the `checkpoint:human-verify` gate documented in RESEARCH.md Package Legitimacy Audit).
