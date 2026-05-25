---
phase: 1
slug: scaffold-shell
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-25
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.60.x (E2E + disclaimer crawl) + Astro 6 build-time Zod (schema validation) |
| **Config file** | `playwright.config.ts` (Wave 0 installs) |
| **Quick run command** | `npm run test:disclaimer` |
| **Full suite command** | `npm run build && npm run test:disclaimer && npm run lint:legal && npm run gitleaks` |
| **Estimated runtime** | ~45 seconds (build ~15s + disclaimer crawl ~20s + lint:legal <5s + gitleaks ~5s) |

---

## Sampling Rate

- **After every task commit:** Run `npm run build` (catches Zod schema breakage immediately)
- **After every plan wave:** Run `npm run test:disclaimer` (the Playwright disclaimer-crawl test)
- **Before `/gsd:verify-work`:** Full suite must be green (build + disclaimer + lint:legal + gitleaks)
- **Max feedback latency:** 60 seconds end-to-end

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-00-W0-01 | 00 (Wave 0) | 0 | — | — | Test framework available | infra | `npx playwright --version` | ❌ W0 | ⬜ pending |
| 01-00-W0-02 | 00 (Wave 0) | 0 | — | — | `playwright.config.ts` exists | infra | `test -f playwright.config.ts` | ❌ W0 | ⬜ pending |
| 01-00-W0-03 | 00 (Wave 0) | 0 | — | — | `.gitleaks.toml` exists | infra | `test -f .gitleaks.toml` | ❌ W0 | ⬜ pending |
| 01-07-CI-01 | 07 (Wave 5) | 5 | — | — | CI workflow exists | infra | `test -f .github/workflows/ci.yml` | ❌ Wave 5 | ⬜ pending |
| 01-01-01 | 01 (Scaffold) | 1 | FOUND-01 | — | Astro 6 project boots | build | `npm run build` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 (Scaffold) | 1 | FOUND-02 | — | Tailwind v4 styles compile | build | `npm run build` | ❌ W0 | ⬜ pending |
| 01-01-03 | 01 (Scaffold) | 1 | FOUND-10 | — | No deprecated Tailwind v3 patterns | lint | `npm run build` (would fail) | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 (Collections) | 1 | FOUND-03 | — | Five Zod-typed collections defined | unit | `npm run build` (loads schemas) | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 (Collections) | 1 | FOUND-04 | — | Missing-author blog post fails build | unit | `tests/zod-negative.spec.ts` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 (Collections) | 1 | FOUND-03 | — | Five disclaimer ids exist in `disclaimers.json` | unit | `tests/disclaimer-set.spec.ts` | ❌ W0 | ⬜ pending |
| 01-03-01 | 03 (Layout) | 2 | FOUND-05 | — | `BaseLayout.astro` exists and renders site title | E2E | `tests/baselayout.spec.ts` | ❌ W0 | ⬜ pending |
| 01-03-02 | 03 (Layout) | 2 | FOUND-06 | — | Three specialized layouts extend BaseLayout | source | `grep -l "BaseLayout" src/layouts/*.astro \| wc -l = 3` | ❌ W0 | ⬜ pending |
| 01-03-03 | 03 (Layout) | 2 | FOUND-07, LEGAL-01 | — | `<Disclaimer />` renders on every sitemap route | E2E | `tests/disclaimer-crawl.spec.ts` | ❌ W0 | ⬜ pending |
| 01-03-04 | 03 (Layout) | 2 | SEO-02 (placeholder) | — | LegalService JSON-LD valid on homepage | E2E | `tests/jsonld-legalservice.spec.ts` | ❌ W0 | ⬜ pending |
| 01-04-01 | 04 (URL conventions) | 2 | FOUND-08 | — | `.planning/URL-CONVENTIONS.md` exists | source | `test -f .planning/URL-CONVENTIONS.md` | ❌ W0 | ⬜ pending |
| 01-05-01 | 05 (Security headers) | 3 | SEC-01, SEC-02 | T-1-CSP | `vercel.json` headers present | source | `grep -c "Content-Security-Policy-Report-Only" vercel.json = 1` | ❌ W0 | ⬜ pending |
| 01-05-02 | 05 (Security headers) | 3 | SEC-01 | T-1-Clickjack | X-Frame-Options DENY | source | `grep -c "X-Frame-Options.*DENY" vercel.json = 1` | ❌ W0 | ⬜ pending |
| 01-05-03 | 05 (Security headers) | 3 | SEC-10 | T-1-Indexing | Preview `noindex` header configured | source | `grep "X-Robots-Tag" vercel.json` | ❌ W0 | ⬜ pending |
| 01-05-04 | 05 (Security headers) | 3 | SEC-03, SEC-04 | T-1-Secrets | `.env*` in `.gitignore` | source | `grep -c "^\.env" .gitignore = 4` | ❌ W0 | ⬜ pending |
| 01-05-05 | 05 (Security headers) | 3 | SEC-04 | T-1-Secrets | gitleaks blocks fake secret | E2E | `tests/gitleaks.spec.sh` (attempts to commit fake key) | ❌ W0 | ⬜ pending |
| 01-06-01 | 06 (Disclaimer collection) | 1 | LEGAL-01 | — | All 5 disclaimer ids have text + version | unit | `tests/disclaimer-set.spec.ts` | ❌ W0 | ⬜ pending |
| 01-07-01 | 07 (Preview deploy) | 4 | OPS-05 | T-1-Indexing | Vercel preview URL accessible from PR | manual | See Manual-Only table below | N/A | ⬜ pending |
| 01-07-02 | 07 (Preview deploy) | 4 | OPS-05 | T-1-Indexing | Preview deploy carries `noindex` header | E2E | `curl -I preview-url \| grep "x-robots-tag.*noindex"` | ❌ W0 | ⬜ pending |
| 01-08-01 | 08 (CI workflow) | 3 | — | — | CI runs build + disclaimer + gitleaks + lint:legal on PR | E2E | GitHub Actions PR check status | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `playwright.config.ts` — Playwright configured to spin up `astro preview` and run E2E tests
- [ ] `tests/disclaimer-crawl.spec.ts` — Disclaimer crawl test (walks sitemap, asserts disclaimer text on each route)
- [ ] `tests/zod-negative.spec.ts` — Negative test asserting Zod rejects malformed content (e.g., blog post with no author)
- [ ] `tests/disclaimer-set.spec.ts` — Unit test asserting all five disclaimer ids exist with non-empty text + version
- [ ] `tests/baselayout.spec.ts` — Asserts BaseLayout renders site title and disclaimer
- [ ] `tests/jsonld-legalservice.spec.ts` — Asserts LegalService JSON-LD parses and contains firm name
- [ ] `tests/gitleaks.spec.sh` — Shell test that tries to commit a fake AWS key and expects gitleaks to block
- [ ] `tests/fixtures/broken-blog-post.mdx` — Intentionally broken fixture for zod-negative.spec.ts (kept on a feature branch, never merged to `main`)
- [ ] `.gitleaks.toml` — gitleaks config with allowlist for placeholder addresses (`intake@bsvlaw.com`)
- (Moved to Plan 07 / Wave 5) — `.github/workflows/ci.yml` CI workflow lives in Plan 07, not Wave 0. Wave 0 ships only the test scaffolds and configs; the CI workflow that runs them is created later, once those tests have real bodies.
- [ ] `scripts/install-git-hooks.ps1` — PowerShell installer that drops the gitleaks pre-commit hook into `.git/hooks/` (Windows-friendly for Jon)
- [ ] `npm install` of Phase 1 dependencies (Playwright, Cheerio, schema-dts, astro integrations) — gated by a `checkpoint:human-verify` task per RESEARCH.md slopcheck-unavailable mitigation
- [ ] gitleaks Go binary downloaded from `github.com/gitleaks/gitleaks/releases` (NOT the npm slopsquat) — also gated by `checkpoint:human-verify`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Jon can click a Vercel preview URL from a PR and see the site shell | OPS-05 | Requires logged-in GitHub session + Vercel project connection — cannot be automated in CI | After opening a PR, look for the `vercel` bot comment with the "Preview" link. Click it. Verify the homepage renders with the firm name in the header and the footer disclaimer at the bottom. |
| `gh secret scanning` / push protection blocks a real-feeling AWS key on push to GitHub | SEC-04 | Requires GitHub server-side enforcement, not testable locally | On a throwaway branch, commit a file with `AKIAIOSFODNN7EXAMPLE` and run `git push`. GitHub should reject the push with a "secret scanning" error. Remove the commit and force-delete the branch after verification. |
| Color-contrast of placeholder palette meets WCAG AA (zinc-900 on white) | A11Y-04 (carried forward) | Visual eye-test for confirmation; automated check arrives in Phase 7 | Visit the preview URL. Verify text reads clearly on white. (Zinc-900 has measured contrast of 16:1; this is a sanity check.) |

---

## Validation Sign-Off

- [ ] All tasks have automated verify command or Wave 0 dependency
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify (Wave 0 covers all gaps)
- [ ] Wave 0 covers all MISSING references (Playwright config, test files, fixtures, CI workflow, gitleaks)
- [ ] No watch-mode flags (CI runs are one-shot)
- [ ] Feedback latency < 60s
- [ ] `nyquist_compliant: true` set in frontmatter (after Wave 0 lands)

**Approval:** pending
