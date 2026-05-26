---
phase: 01-scaffold-shell
plan: "07"
subsystem: ci-and-disclaimer-crawl
tags: [wave-5, ci, github-actions, disclaimer-crawl, legal-01, baselayout-integration]
requirements:
  - LEGAL-01
  - OPS-05
dependency-graph:
  requires:
    - plan-04 (eight-static-routes, sitemap-0-xml)
    - plan-06 (vercel-adapter-build-shape — informs why we read dist/client/ directly)
  provides:
    - disclaimer-crawl-test (canonical Phase 1 compliance gate)
    - baselayout-integration-test (focused homepage sanity check)
    - github-actions-ci-workflow (D-31)
    - phase-1-full-test-suite (npm test runs all 5 specs)
  affects:
    - plan-08 (final preview deploy + branch protection on main requiring this workflow to pass)
key-files:
  created:
    - .github/workflows/ci.yml
  modified:
    - tests/disclaimer-crawl.spec.ts (Plan 00 test.skip replaced with filesystem-direct body)
    - tests/baselayout.spec.ts (Plan 00 test.skip replaced with filesystem-direct body)
    - package.json (added test:baselayout + catch-all test scripts)
deviations:
  - id: webserver-disabled
    severity: low
    summary: "playwright.config.ts webServer is gated on PLAYWRIGHT_NEEDS_SERVER (Plan 01-06 fix) and is currently never set. All five tests read dist/client/ HTML files from disk directly, with a beforeAll hook running `npm run build`. RESEARCH.md §Pattern 8 designed the crawl test to fetch routes via `astro preview`, but the Vercel adapter output (Plan 01-06 added /api/csp-report) makes astro preview return 404 on every route. Filesystem-direct is equivalent for the compliance assertion — same sitemap, same fragment, same coverage — and is faster (no preview-server startup)."
    consequence: "The tests do not exercise the HTTP layer (Vercel headers, redirects). For Phase 1 that's fine: HTTP-level header verification belongs in Plan 01-08's manual curl check + Phase 7's launch verification. The disclaimer crawl's job is to assert content presence on every route — that's a static-rendering concern."
    remediation_path: "If we ever want HTTP-level testing locally, swap the webServer command to `vercel dev` (requires Vercel CLI installed) or to a static server like `npx serve dist/client`. Set PLAYWRIGHT_NEEDS_SERVER=1 to enable. None of this is needed in Phase 1."
decisions:
  - "Confirmed sitemap filename: dist/client/sitemap-0.xml. The Astro+sitemap output also writes dist/client/sitemap-index.xml as a wrapper that points at sitemap-0.xml. The disclaimer crawl probes for sitemap-0.xml first, then sitemap-index.xml, then sitemap.xml — first match wins. For Phase 1 sitemap-0.xml is the leaf and the test reads it directly."
  - "Plan 01-06's CSP report endpoint changed the build shape: dist/ -> dist/client/ + dist/server/. Every Phase 1 test that reads built HTML (disclaimer-crawl, baselayout, jsonld) reads from dist/client/. Phase 7's launch verification will need to remember this when reading sitemap or HTML from local builds."
  - "CI workflow uses actions/checkout@v5 + actions/setup-node@v5 per RESEARCH.md A5's assumption that v5 is the current major in 2026-05-26. If the first PR run shows v5 is not yet released, fall back to v4 — both lines are still supported. Documented as a Plan 08 verification item."
  - "Gitleaks-action@v2 stays in CI even though the local pre-commit hook is deferred (per Jon's checkpoint decision in Plan 01-06 / DECISIONS.md 2026-05-26). The CI step is a third layer that catches secrets in PRs, independent of the local hook (deferred) and GitHub push protection (enabled). All three layers are server-side / non-local — Jon does not need to install anything for CI gitleaks to work."
  - "Added a catch-all `test` script (`playwright test`) to package.json. Running `npm test` now runs all five Phase 1 spec files in sequence — useful for developer-side smoke-checks and for any future single-step CI workflow rewrite."
metrics:
  tasks: 3
  commits: 2
  files_created: 1
  files_modified: 3
  human_checkpoints: 0
  test_count_total: 5
  test_runtime_seconds: 24.1
  completed: "2026-05-26T10:35:00Z"
---

# Phase 01 Plan 07: Disclaimer Crawl + CI Workflow — Summary

Implemented the canonical Phase 1 disclaimer-crawl test (LEGAL-01 enforcement), the BaseLayout integration sanity check, and the GitHub Actions CI workflow that runs the full Phase 1 test suite on every PR. The crawl test deviates from RESEARCH.md §Pattern 8 — it reads `dist/client/` HTML files from disk instead of hitting them via `astro preview` — because Plan 01-06's CSP endpoint switched the build to a Vercel-adapted output that astro preview can't serve.

## What was built

### Task 1 + Task 2 — Disclaimer crawl + BaseLayout tests (commit `83b771f`)

Both tests follow the same filesystem-direct pattern:
1. `test.beforeAll(() => execSync('npm run build', { stdio: 'pipe' }))` — self-contained.
2. Read rendered HTML from `dist/client/<path>/index.html` (or `dist/client/<path>.html` for non-dir routes).
3. Parse with Cheerio, run focused assertions.

**`tests/disclaimer-crawl.spec.ts`** — the canonical compliance test (D-25/D-26). `readSitemapUrls()` probes `sitemap-0.xml`, `sitemap-index.xml`, `sitemap.xml` in that order; if it finds a sitemap-index, it follows the child sitemaps. `urlToFilePath()` maps a sitemap URL like `https://bsvlaw.com/about` back to `dist/client/about/index.html`. For each URL the test parses the HTML with Cheerio, extracts `$('footer').text()`, and asserts the canonical `FOOTER_DISCLAIMER_FRAGMENT` substring appears. Failures accumulate so one run reports every broken route — not just the first one. The test passes against Phase 1's 6-URL sitemap in 36 ms after the build.

**`tests/baselayout.spec.ts`** — focused homepage sanity check. Reads `dist/client/index.html`, asserts `<header>` contains the firm name (`/Belcher.*Smolen.*Van Loo|BSV Law/`) AND `<footer>` contains the disclaimer fragment. Complementary to the crawl test: the crawl iterates every route; the BaseLayout test is the "layout reached the homepage" sanity gate.

**`package.json`** — added two scripts:
- `test:baselayout` — single-spec invocation
- `test` — catch-all (`playwright test`) that runs every `.spec.ts` in `tests/`

Verification: `npm test` runs 5 specs in 24.1s (build dominates; assertions are sub-100ms each). `npm run test:disclaimer` and `npm run test:baselayout` both pass individually.

### Task 3 — `.github/workflows/ci.yml` (commit `f684aed`)

Standard GitHub Actions pipeline running on `pull_request` to main and `push` to main. Single job (`build-and-test`) on ubuntu-latest with 13 steps:

1. `actions/checkout@v5` with `fetch-depth: 0` (gitleaks needs the full history).
2. `actions/setup-node@v5` with Node 22 + npm cache.
3. `npm ci` (clean install from `package-lock.json`).
4. `npm run check` (astro check — TypeScript + content schemas).
5. `npm run build` (full Vercel-adapted build).
6. `npx playwright install --with-deps chromium` (CI's Chromium download).
7-11. Five test invocations: `test:disclaimer`, `test:baselayout`, `test:zod-negative`, `test:disclaimer-set`, `test:jsonld`.
12. `npm run lint:legal` (Phase 1 placeholder script — Phase 4 wires real Rule 7.4 banned-terms scan).
13. `gitleaks/gitleaks-action@v2` with `GITHUB_TOKEN`.

`actions/checkout@v5` + `actions/setup-node@v5` per RESEARCH.md A5's assumption. If the first PR run shows v5 isn't released yet, fall back to v4 — Plan 08 verifies and adjusts.

The gitleaks-action step is a third secret-scanning layer. The local gitleaks pre-commit hook was deferred at Jon's call in Plan 01-06 (see DECISIONS.md 2026-05-26); GitHub push protection blocks at the protocol layer; this CI step provides PR-time audit-trail scanning independent of both. All three layers are server-side (no Jon local install needed for CI gitleaks).

Branch protection on `main` (require this workflow to pass before merge) lands as a Plan 01-08 manual checkpoint.

## Risk register & open items

- **CI v5 actions assumption** — if `actions/checkout@v5` or `actions/setup-node@v5` is not yet released, the first PR will fail on the action-resolution step. The fix is a one-line edit (downgrade to v4). Plan 08's verification will confirm.
- **Branch protection not yet enabled.** Without it, a PR can merge even if the CI workflow fails. Plan 08 closes this gap by walking Jon through the GitHub Settings → Branches → Add rule UI for `main`.
- **Filesystem-direct deviation** — see the deviations block in the frontmatter. The tests do not exercise the HTTP layer (Vercel headers, redirects, etc.). Phase 1 doesn't need HTTP-layer coverage; Plan 08 + Phase 7 launch verification handle that via manual curl checks against the deployed Vercel preview URL.

## Verification evidence

- `npm test` → 5/5 passed in 24.1s (all five spec files green).
- `npm run test:disclaimer` → 1 passed, 8.1s end-to-end (build + walk + assert).
- `npm run test:baselayout` → 1 passed, 8.4s end-to-end.
- `.github/workflows/ci.yml` exists with all 13 required steps, valid YAML.
- `dist/client/sitemap-0.xml` confirmed as the 6-URL canonical sitemap.

## Self-Check: PASSED

- [x] Playwright disclaimer crawl test walks the rendered sitemap and asserts the footer disclaimer fragment appears on every route
- [x] BaseLayout integration test confirms the firm name + disclaimer appear on the rendered homepage
- [x] GitHub Actions CI workflow runs install → build → astro check → all 5 tests → gitleaks → lint:legal on every PR to main
- [ ] CI workflow blocks merges to main if any step fails — DEFERRED to Plan 08 (branch protection is a manual GitHub Settings click)
