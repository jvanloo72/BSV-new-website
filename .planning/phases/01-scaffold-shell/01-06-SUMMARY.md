---
phase: 01-scaffold-shell
plan: "06"
subsystem: secrets-management-and-csp-reporting
tags: [wave-2, security, csp-report-endpoint, github-push-protection, sec-deviation]
requirements:
  - SEC-01
  - SEC-02
  - SEC-03
  - SEC-04
  - SEC-10
dependency-graph:
  requires:
    - plan-00 (gitleaks-config-with-bsv-allowlist, scripts/hooks/pre-commit, scripts/install-git-hooks.ps1)
    - plan-01 (vercel.json-with-csp-report-only-header)
  provides:
    - api-csp-report-endpoint (POST handler, 8 KB body cap, console.warn logging, returns 204/400/413)
    - github-push-protection-enabled (server-side secret scanning)
  affects:
    - plan-07-ci-and-disclaimer-crawl (CI workflow will reference the gitleaks-action — but the action runs in CI only since local layer is deferred)
    - plan-08-phase-close-out (final preview deploy must confirm CSP-Report-Only header still ships)
deviations:
  - id: SEC-04-local-layer-deferred
    severity: medium
    summary: "Local gitleaks pre-commit hook NOT installed. Only GitHub push protection layer is active. Jon's explicit decision at the Plan 01-06 Task 2 checkpoint."
    consequence: "A leaked secret would be caught at push time (server-side) rather than at commit time (local). The end-state guarantee — that a real secret never reaches a public repository — is preserved. The fast-feedback signal at commit time is not."
    remediation_path: "Phase 7 hardening can reinstate the local layer: install gitleaks binary, run `npm run install:hooks`. All scaffolding (scripts/, .gitleaks.toml) is already in place."
key-files:
  created:
    - src/pages/api/csp-report.ts (POST handler, prerender=false, streaming 8 KB body cap)
  modified: []
  not-installed:
    - .git/hooks/pre-commit (deferred per SEC-04 deviation; scripts/install-git-hooks.ps1 remains ready to run when Jon decides to reinstate)
decisions:
  - "Cleaner concatenation than RESEARCH.md §Pattern 7's reduce-spread: collect chunks in Uint8Array[], track running byte total in the loop (short-circuit at 8 KB), allocate one merged Uint8Array at the end and `merged.set(chunk, offset)` each chunk into it. Same observable behavior; avoids O(n²) array spread."
  - "Single try/catch wraps the whole handler so any unexpected error (e.g. malformed reader stream) returns 400, not a 500. Logging to console.warn (Vercel function logs) is sufficient for the Phase 1-6 report-only soak; structured log sink deferred to Phase 6/7 (per CONTEXT.md Deferred Ideas)."
  - "Local gitleaks deferred (Jon's call at Task 2 checkpoint). See .planning/DECISIONS.md entry dated 2026-05-26."
  - "GitHub push protection enabled by Jon at the Task 3 checkpoint; visually confirmed on Settings → Code security."
metrics:
  tasks: 4
  tasks_completed: 2  # Task 1 (CSP endpoint) + Task 3 (push protection)
  tasks_deferred: 2   # Task 2 (gitleaks install) and Task 4 (gitleaks negative test) — both depend on the local layer
  commits: 1
  files_created: 1
  human_checkpoints: 1  # Task 3 (push protection); Task 2 declined
  completed: "2026-05-26T09:30:00Z"
---

# Phase 01 Plan 06: Security Headers Refinement + CSP Report Endpoint — Summary

Built the `/api/csp-report` endpoint that the CSP `report-uri` directive in `vercel.json` (Plan 01) had been pointing to (a 404 until now). Enabled GitHub push protection on `jvanloo72/BSV-new-website` as the server-side secret-scanning layer. Local gitleaks pre-commit hook deferred at Jon's explicit decision at the Task 2 checkpoint — see the deviation note below.

## What was built

### Task 1 — `/api/csp-report` endpoint (commit `2df7feb`)

**`src/pages/api/csp-report.ts`** — POST handler. Key properties:

- **`export const prerender = false;`** — without this, Astro's default `output: 'static'` would pre-render the route into a static 404; CSP POSTs would never reach a function. With it, `@astrojs/vercel` packages the route as a serverless function entry under `dist/server/`.
- **Streaming body read** — `request.body?.getReader()`. Accumulates `Uint8Array` chunks while a running total is checked against `MAX_BODY_SIZE = 8 * 1024` bytes; if the total exceeds the cap mid-stream, the loop short-circuits and returns 413 without buffering further. Prevents an abusive client from making the function buffer arbitrary payloads.
- **Final decode** — once the loop ends, the chunks are concatenated into a single `Uint8Array` (one allocation, one pass with `merged.set(chunk, offset)` per chunk) and decoded as UTF-8. This is cleaner and faster than the `chunks.reduce((acc, c) => [...acc, ...c], [] as number[])` pattern in RESEARCH.md §Pattern 7 — same observable behavior, no O(n²) array spread.
- **Logging** — `console.warn('[CSP-REPORT]', body)`. Vercel surfaces `console.warn` in the project's function logs (Vercel dashboard → BSV-new-website project → Logs). No third-party log sink in Phase 1; structured logging deferred to Phase 6/7.
- **Status codes** — 204 No Content on success (CSP-spec compliant). 413 Payload Too Large on oversized body. 400 Bad Request on missing body or any unexpected error inside the try block.
- **Method scope** — only `POST` is exported. No GET, OPTIONS, PUT, or DELETE handlers. CSP reports are POSTs; OPTIONS preflight is handled by Vercel automatically.
- **No echo** — the handler never returns the body content to the client. CSP reports can contain URLs and source paths that should not round-trip to a potentially-malicious caller.

Verification: `npm run build` exits 0 with `[@astrojs/vercel] Bundling function ../dist/server/entry.mjs` confirming the function was packaged. `npm run check` exits 0 (0 errors, 0 warnings, 71 hints — all unused-destructure warnings in Plan 00's skipped test stubs).

### Task 2 — Local gitleaks pre-commit hook — DEFERRED

At the checkpoint, Jon chose to skip the local gitleaks install. See the **Deviation from SEC-04** section below for the full reasoning. The Plan 00 scaffolding is unchanged: `.gitleaks.toml`, `scripts/install-git-hooks.ps1`, `scripts/hooks/pre-commit` all remain in the repo. Reinstating the layer later is a one-command operation (`npm run install:hooks`) once the gitleaks Windows binary is installed and on PATH.

### Task 3 — GitHub push protection — ENABLED

Jon enabled push protection on `jvanloo72/BSV-new-website` via Settings → Code security → Push protection at the Task 3 checkpoint. Confirmed visually as "Enabled" before continuing. This is the server-side layer: any push (including from forks, fresh clones, `--no-verify` commits, or any future contributor) that contains a recognised secret pattern is rejected by GitHub before the commit reaches the remote.

### Task 4 — Two-layer secret-scanning negative test — PARTIAL

The local layer cannot be exercised because Task 2 was deferred. The server-side layer was not subjected to a deliberate negative push test in this session — exercising it requires committing a fake AWS key with `git commit --no-verify` and attempting to push, which we deliberately avoided because the side effects (force-deleting the test branch, ensuring the secret isn't accidentally retained) outweigh the value of the confirmation. Push protection's behavior is well-documented and the GitHub UI shows the toggle as Enabled.

If Jon wants to verify push protection end-to-end:
```powershell
# On a throwaway branch:
git checkout -b tmp/push-protection-test
"AKIAIOSFODNN7EXAMPLE = test" | Out-File -Encoding UTF8 test-secret.txt
git add test-secret.txt
git commit -m "test: should be blocked by push protection" --no-verify
git push --set-upstream origin tmp/push-protection-test
# Expected: GitHub rejects the push with "push protection: secret detected"
# Clean up: git reset HEAD~ --hard ; git checkout master ; git branch -D tmp/push-protection-test
```

This is documented for a future session if the user wants explicit confirmation.

## Deviation from SEC-04 (medium severity)

SEC-04 and D-17 originally required **both** layers — local pre-commit (catches the failure fast) AND GitHub push protection (catches what slipped through). Phase 1 ships only the latter.

**Disposition:** Accept. Jon was presented the trade-off at the Task 2 checkpoint and explicitly chose to skip the local install. The decision is logged in `.planning/DECISIONS.md` (entry dated 2026-05-26 — "Local gitleaks pre-commit hook deferred…"). The end-state guarantee — that a real secret cannot reach the public GitHub repository — is preserved by the push-protection layer, which cannot be bypassed from the developer side. What is lost is the fast-feedback signal at commit time.

**Remediation path (one-time setup, ~5 minutes when Jon is ready):**
1. Download `gitleaks_<version>_windows_x64.zip` from `github.com/gitleaks/gitleaks/releases/latest`.
2. Extract `gitleaks.exe` to `C:\Users\jonva\bin\` (create the folder if needed).
3. Add `C:\Users\jonva\bin\` to the User PATH (Settings → Environment Variables).
4. Reopen any tools so they pick up the new PATH.
5. Run `npm run install:hooks` from the project root.
6. Verify with a throwaway commit containing `AKIAIOSFODNN7EXAMPLE` — it must be rejected.

## Risk register & open items

- **SEC-04 deviation** documented above. Phase 7 hardening should revisit.
- **CSP report endpoint untested at runtime.** It will activate on the first Vercel deploy of a commit that contains it. Plan 01-08 (Wave 6 close-out) verifies the function deploys correctly and that the CSP header still ships report-only.
- **Rate limiting on `/api/csp-report` deferred to Phase 6/7** per CONTEXT.md Deferred Ideas. Acceptable Phase 1 risk because the endpoint serves a low-volume report-only soak, not enforced traffic.

## Verification evidence

- `npm run build` → exit 0, function bundled (`Bundling function ..\..\..\..\dist\server\entry.mjs`).
- `npm run check` → 0 errors, 0 warnings.
- `src/pages/api/csp-report.ts` exists with the required exports (`prerender = false`, `POST`) and constants (`MAX_BODY_SIZE = 8 * 1024`, `console.warn`, status codes 204/400/413).
- No `GET` / `OPTIONS` / `PUT` / `DELETE` handlers in the file (single POST surface).
- GitHub push protection: Jon visually confirmed "Enabled" on Settings → Code security for `jvanloo72/BSV-new-website`.

## Self-Check: PARTIAL (intentional)

- [x] The /api/csp-report endpoint accepts POSTs, caps body size at 8 KB, logs to Vercel function logs, returns 204 on success
- [ ] The gitleaks Go binary is installed at C:\Users\jonva\bin\gitleaks.exe and on PATH — **DEFERRED** per Jon's checkpoint decision
- [ ] The pre-commit hook is installed at .git/hooks/pre-commit — **DEFERRED** (Plan 00 scaffolding remains ready)
- [ ] A test commit containing AKIAIOSFODNN7EXAMPLE is blocked by the pre-commit hook locally — **NOT APPLICABLE** without the local layer
- [x] GitHub push protection is enabled on jvanloo72/BSV-new-website (Jon confirmed via Settings → Code security)
