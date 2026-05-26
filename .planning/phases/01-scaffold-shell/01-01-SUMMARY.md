---
phase: 01-scaffold-shell
plan: "01"
subsystem: walking-skeleton
tags: [wave-1, astro-6, tailwind-v4, vercel, disclaimer, csp-report-only, walking-skeleton]
requirements:
  - FOUND-01
  - FOUND-02
  - FOUND-03
  - FOUND-05
  - FOUND-07
  - FOUND-09
  - FOUND-10
  - SEC-01
  - SEC-02
  - SEC-03
  - SEC-04
  - SEC-10
  - LEGAL-01
  - OPS-05
dependency-graph:
  requires:
    - plan-00 (test-spec-stubs-skipped, gitleaks-config-with-bsv-allowlist)
    - plan-05 (url-conventions, decisions-log)
  provides:
    - astro-6-project-scaffold
    - four-integrations-installed (mdx, sitemap, vercel, tailwind-v4)
    - disclaimers-content-collection
    - five-disclaimer-texts-seeded
    - typed-disclaimer-component
    - baselayout-with-named-head-slot
    - minimal-site-chrome (SiteHeader + SiteFooter)
    - homepage-shell
    - vercel-json-security-headers (5 headers, CSP report-only)
    - tailwind-v4-css-first-tokens (7 stable names per D-22)
  affects:
    - plan-02-content-collections (extends `collections` export with 4 more; uses Disclaimer component pattern for placeholders)
    - plan-03-jsonld-and-layouts (grows BaseLayout's <head> slot; adds JsonLd + SeoHead + skip-link; layers AttorneyLayout/PracticeAreaLayout/BlogPostLayout on top)
    - plan-04-placeholder-routes (every new page uses BaseLayout or a specialized layout)
    - plan-06-secrets-management (extends vercel.json headers; adds /api/csp-report endpoint)
    - plan-07-ci-and-disclaimer-crawl (unskips tests/disclaimer-crawl.spec.ts now that routes + footer exist)
    - plan-08-phase-close-out (verifies five security headers are live; enables branch protection on main)
tech-stack:
  added:
    - "astro@6.3.7 (peer engine: Node >=22.12)"
    - "@astrojs/mdx@^5.0.6"
    - "@astrojs/sitemap@^3.7.2"
    - "@astrojs/vercel@^10.0.7"
    - "tailwindcss@^4.3.0 + @tailwindcss/vite@^4.3.0 (CSS-first, no tailwind.config.*)"
    - "schema-dts@^2.0.0 (typed JSON-LD; component lands in Plan 03)"
    - "@astrojs/check@^0.9.9 (TypeScript + content schema check)"
    - "@playwright/test@^1.60.0 (Chromium headless shell downloaded)"
    - "cheerio@^1.2.0 (Plan 07 disclaimer-crawl test will use)"
  patterns:
    - "Astro 6 minimal template + four integrations added via `npx astro add` (RESEARCH.md §Installation Plan order: mdx → sitemap → vercel → tailwind)"
    - "Tailwind v4 wires as `vite.plugins`, NOT as an Astro integration (Astro 5.2+ canonical path; no `@astrojs/tailwind` package)"
    - "CSS-first design tokens — global.css `@theme {}` block defines 7 stable token names (D-22); Phase 2 swaps the *values* (zinc placeholder → BSV brand palette) without touching component class strings"
    - "Tailwind v4 default-border-color restoration via `@layer base { *, ::after, ::before, ::backdrop, ::file-selector-button { border-color: var(--color-border, currentColor) } }` (RESEARCH.md Pitfall A3)"
    - "`file()` loader for disclaimers (single JSON file, multiple entries keyed by `id`); `glob()` reserved for Plan 02's per-MDX collections"
    - "Disclaimer component throws on missing entry (D-10 build-fail-on-missing); typed `DisclaimerId` union is the single enforcement point — adding an id requires editing both the union and the JSON"
    - "BaseLayout exposes a named `<slot name=\"head\" />` so Plan 03's JsonLd / SeoHead components can inject into <head> without forking BaseLayout"
    - "CSP ships in Report-Only mode (Phase 1) per D-15 — soak across Phases 3-6, flip to enforce in Phase 7. The `/api/csp-report` endpoint referenced by `report-uri` lands in Plan 06; until then, browsers post to a 404 and the violation is dropped (no page-break impact)"
    - "preview-deploy noindex enforcement is belt-and-suspenders: Vercel auto-applies `x-robots-tag: noindex` on `*.vercel.app` URLs (no config needed); BaseLayout adds `<meta name=\"robots\" content=\"noindex, nofollow\">` when `!import.meta.env.PROD` to cover any future custom-preview domain (D-19)"
key-files:
  created:
    - .gitignore (canonical D-18 entries, no recovery comments)
    - astro.config.mjs (mdx + sitemap + vercel adapter + tailwind v4 vite plugin + site + trailingSlash)
    - package.json (bsv-website; engines node>=22.12; 4 Phase 1 scripts: check, test:disclaimer, lint:legal, install:hooks)
    - package-lock.json
    - tsconfig.json (extends astro/tsconfigs/strict per D-FOUND-01)
    - public/favicon.ico (Astro template default; replaced with brand favicon in Phase 2)
    - public/favicon.svg (Astro template default; replaced with brand favicon in Phase 2)
    - src/styles/global.css (Tailwind v4 import + @theme tokens + @layer base default-border fix + body)
    - src/content.config.ts (disclaimers collection only — Plan 02 extends `collections` export)
    - src/content/disclaimers/disclaimers.json (5 entries: footer/contact/blog/practice-area/attorney, all version 2026-05-25-v1)
    - src/components/legal/Disclaimer.astro (typed DisclaimerId union, throws on missing entry)
    - src/components/chrome/SiteHeader.astro (firm name + nav to 6 routes; aria-current on active link)
    - src/components/chrome/SiteFooter.astro (Disclaimer id="footer" + both office locations + copyright)
    - src/layouts/BaseLayout.astro (head with title/desc/canonical/og + named head slot + isPreview noindex fallback + SiteHeader + main + SiteFooter)
    - src/pages/index.astro (placeholder homepage shell — full content lands in Phase 3)
    - vercel.json (5 HTTP security headers; CSP-Report-Only with default-src 'self', frame-ancestors 'none', report-uri /api/csp-report)
  modified: []
decisions:
  - "Recovery from CLI arg misparse: `npm create astro@latest -- --template minimal --typescript strict --install --git no --skip-houston --yes` was run with Bash's `--` separator on Windows + npm 11; create-astro misparsed `--typescript` as the project directory name, creating a `--typescript/` subdirectory. Recovery: moved scaffold contents up one level, renamed package.json `name` from `--typescript` to `bsv-website`, deleted the orphaned subdirectory. The Astro scaffold itself (node_modules, tsconfig with strict, astro.config.mjs, src/pages/index.astro) was intact. Recovery committed as `chore(01-01): scaffold Astro 6 minimal template (recovery from CLI arg misparse)`. Lesson for future Astro create commands on Windows: prefer interactive (no flags) OR use `--typescript=strict --git=no` (with `=`) instead of space-separated flag values."
  - "Switched mid-plan from parallel-worktree executor mode to inline orchestrator execution. Reason: the first executor (`gsd-executor` subagent) was launched without Bash permission and immediately failed. The second executor encountered intermittent Bash denials (interpreted as 'sandbox throttling') and asked for a Claude Code restart. Inline mode — orchestrator runs commands directly, Jon approves each via Claude Code's permission UI — proved reliable. Trade-off: higher orchestrator context burn, but Jon (no coding background) sees every command in context before it runs. Per `.claude/CLAUDE.md` communication style this is the better fit. Future plans in this phase may stay inline."
  - "Initial GitHub remote (`jvanloo72/BSV-new-website`) had 3 commits on `main` (Initial commit + 2 claude.yml workflow tweaks) with zero shared history with local `master`. Reconciled via `git merge origin/main --allow-unrelated-histories -m \"chore: merge GitHub-side claude.yml workflow setup\"`. Result: master now has planning history + Walking Skeleton + .github/workflows/claude.yml. Pushed master to origin/main as the new baseline. This first PR (`phase-1-walking-skeleton`) intentionally includes the full planning history; future PRs branch off main and will be small per-plan diffs."
  - "Disclaimer text drafted as conservative + legally-cautious. Jon approved all 5 texts inline at the Task 5 checkpoint. The `footer` text contains the verbatim fragment `The information on this website is for general informational purposes only` so Plan 07's disclaimer-crawl test (FOOTER_DISCLAIMER_FRAGMENT in tests/disclaimer-crawl.spec.ts from Plan 00) will pass without further edits. All 5 entries tagged `version: 2026-05-25-v1`."
  - "global.css `@theme` block tokens use Tailwind's zinc scale as Phase 1 placeholder values per D-21 + D-22. Token *names* are locked: `--color-text`, `--color-text-muted`, `--color-bg`, `--color-bg-elevated`, `--color-border`, `--color-accent`, `--color-accent-fg`, `--font-sans`. Phase 2 swaps the *values* (zinc → BSV brand palette) but every component continues to reference the same token names via `text-[color:var(--color-text)]` Tailwind arbitrary-value syntax."
  - "vercel.json CSP report-uri is `/api/csp-report` — the endpoint does not exist in Phase 1 (Plan 06 ships it). Browsers receiving the CSP header will attempt to POST violation reports to a 404 until then. The 404 does not break the page; the violation report is silently dropped. This is intentional: shipping the CSP header earlier exposes any latent CSP-violating code in Phases 2-5 before Plan 06 wires the endpoint."
metrics:
  tasks: 5
  commits: 4
  files_created: 16
  human_checkpoints: 2
  completed: "2026-05-25T23:42:00Z"
---

# Phase 01 Plan 01: Walking Skeleton — Summary

Built the thinnest possible end-to-end pipeline that proves Astro 6 + Tailwind v4 + Vercel adapter + MDX + sitemap cohere as one stack and that a real Vercel preview URL renders the BSV homepage shell with the canonical footer disclaimer. Every subsequent Phase 1 plan layers on this foundation.

## What was built

### Task 1 — Package legitimacy checkpoint (no code)

`checkpoint:human-verify`, `gate="blocking-human"`. Per RESEARCH.md §"Package Legitimacy Audit," slopcheck was unavailable during research so all 10 npm packages were tagged `[ASSUMED]`. Jon visually confirmed each package's GitHub repo owner matches expectations (withastro, tailwindlabs, google, microsoft, cheeriojs). Two known traps explicitly avoided: `gitleaks@1.0.0` on npm (slopsquat by `ycjcl868` — real gitleaks is a Go binary installed in Plan 06) and `typescript@6.0.3` (non-Microsoft fork — the Astro template installs official `typescript@5.x` automatically).

No commit for this task — it's a pure gate.

### Task 2 — Recovery + 4 Astro integrations + dev deps + Playwright Chromium + astro.config.mjs + .gitignore + scripts (commits `ccf7efc` and `5e31417`)

**Recovery commit (`ccf7efc`).** The initial `npm create astro@latest -- --template minimal --typescript strict --install --git no --skip-houston --yes` invocation was misparsed by create-astro on Windows + npm 11 + bash's `--` separator — `--typescript` became the project directory name. Recovery: moved the scaffold from `--typescript/` to the repo root, renamed package.json `name` from `--typescript` to `bsv-website`, deleted the orphaned subdirectory. Net result: clean Astro 6 minimal scaffold (package.json with `astro: ^6.3.7`, tsconfig extending `astro/tsconfigs/strict`, src/pages/, public/favicon.{ico,svg}, node_modules) at the project root.

**Integrations commit (`5e31417`).** Four `npx astro add` commands in canonical order: `mdx --yes` → `sitemap --yes` → `vercel --yes` → `tailwind --yes`. Each one ran its own `npm install` for the integration's package AND patched `astro.config.mjs`. Tailwind v4 correctly wired as `vite.plugins` (NOT as an Astro integration — the legacy `@astrojs/tailwind` package is gone in 2026). Then `npm install --save-dev @playwright/test@1.60.0 cheerio@1.2.0 @astrojs/check@0.9.9`, then `npm install schema-dts@2.0.0`, then `npx playwright install --with-deps chromium` (112 MiB Chromium Headless Shell + small Winldd binary).

Then edited `astro.config.mjs` to match RESEARCH.md §"Pattern 1": added `site: 'https://bsvlaw.com'`, `trailingSlash: 'never'`, and `vercel({ webAnalytics: { enabled: false } })`. Did NOT set `output: 'hybrid'` (Astro 6 removed it) and did NOT enable `security.csp` (CSP ships via vercel.json only).

Overwrote `.gitignore` with the canonical D-18 list (`.env`, `.env.local`, `.env.*.local`, `.vercel`, `dist`, `node_modules`, `.astro`, `*.log`, `.DS_Store`, `Thumbs.db`, `playwright-report/`, `test-results/`) — no recovery comments, no leftover artifacts.

Augmented `package.json` scripts: `check` (astro check), `test:disclaimer` (playwright test on the crawl spec), `lint:legal` (Phase 1 placeholder echo), `install:hooks` (PowerShell hook installer from Plan 00).

Verified: `npm run build` exits 0 with the Astro default `src/pages/index.astro` rendering. `sitemap-index.xml` generated. Vercel adapter copies static files to `.vercel/output/static/`. No `tailwind.config.{js,ts,mjs}` exists at root (Tailwind v4 is CSS-first per FOUND-02).

### Task 3 — Walking Skeleton (commit `c14ac7d`)

**`src/styles/global.css`** — `@import "tailwindcss";` + `@theme {}` block with the 7 placeholder design tokens (zinc scale + system font stack) + `@layer base` restoring Tailwind v3-style default border color + body rule.

**`src/content.config.ts`** — exports `collections = { disclaimers }`. The disclaimers loader uses `file('src/content/disclaimers/disclaimers.json')` (NOT a glob — single JSON file with multiple entries keyed by `id`). Schema is `z.object({ id: z.enum(['footer', 'contact', 'blog', 'practice-area', 'attorney']), text: z.string(), version: z.string() })`. Plan 02 will EXTEND this `collections` export with `attorneys`, `practiceAreas`, `blog`, `testimonials` — not replace it.

**`src/content/disclaimers/disclaimers.json`** — array of 5 entries. The `footer` text contains the verbatim fragment `The information on this website is for general informational purposes only` so Plan 07's crawl test (`FOOTER_DISCLAIMER_FRAGMENT` from Plan 00) passes. All 5 entries tagged `version: 2026-05-25-v1`. All 5 address the no-attorney-client-relationship + not-legal-advice principles per `.planning/LAW_FIRM_WEBSITE_GUIDE.md`. Jon reviewed and approved each text at the Task 5 checkpoint.

**`src/components/legal/Disclaimer.astro`** — typed `DisclaimerId` union (the same 5 ids as the Zod enum); throws on missing entry with a message naming the id and the JSON path (D-10 build-fail-on-missing). Renders `<aside class="disclaimer disclaimer--{id} text-sm text-[color:var(--color-text-muted)] leading-relaxed" role="note"><p>{entry.data.text}</p></aside>` (Option A from RESEARCH.md §"Pattern 4 Open Implementation Question" — plain string rendering, no MDX render() pipeline because the `file()` loader gives `text: string`).

**`src/components/chrome/SiteHeader.astro`** — `Props { currentPath?: string }`. Renders `<header><nav>` with the firm name as `<a href="/">` (using `&amp;`, not `&`), and nav links to `/`, `/about`, `/practice-areas`, `/attorneys`, `/blog`, `/contact`. Active link gets `text-[color:var(--color-text)] font-medium` + `aria-current="page"`. Inactive links get `text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text)]`. Plan 04 expands the chrome (D-28 minimal scope respected here).

**`src/components/chrome/SiteFooter.astro`** — renders `<Disclaimer id="footer" />` first (the canonical footer disclaimer), then a single line listing both office locations ("Silicon Valley · 555 California St., Suite 4925, San Francisco, CA 94104" — Silicon Valley street address TBD per RESEARCH.md A7), then `&copy; {new Date().getFullYear()} Belcher, Smolen & Van Loo LLP. All rights reserved.`.

**`src/layouts/BaseLayout.astro`** — `Props { title, description, canonical?, ogImage? }`. `<head>` with `meta charset utf-8`, `meta viewport`, conditional `meta robots` (noindex when `!import.meta.env.PROD`, per D-19), `title`, `meta description`, optional canonical, OG title/description/image, favicon link, and a named `<slot name="head" />` for per-page JSON-LD additions (Plan 03 uses this). `<body>` renders `<SiteHeader currentPath={Astro.url.pathname} />`, `<main id="main"><slot /></main>`, `<SiteFooter />`.

**`src/pages/index.astro`** — overwrote the Astro default. Uses `BaseLayout` with `title="Belcher, Smolen & Van Loo LLP"` and a description sourced from the firm brief. Body: a single `<h1>` with the firm name and a one-sentence placeholder paragraph. Full homepage content (StoryBrand framing, three trust dimensions, calls to action) lands in Phase 3.

Verified: `npm run build` exits 0. `dist/index.html` contains "Belcher" 4 times (heading + nav + footer + meta description), the verbatim disclaimer fragment exactly once (in the footer), and an opening `<footer` element. `npm run check` exits with 0 errors / 0 warnings / 8 hints (hints are unused-destructured-args in skipped test stubs from Plan 00 — Plan 07 will use them).

### Task 4 — vercel.json security headers (commit `67b2f0c`)

`vercel.json` at the repo root with `$schema: https://openapi.vercel.sh/vercel.json` and one `headers` entry matching `source: "/(.*)"` (every route) with all 5 required headers per D-15 + D-16:

1. **`Content-Security-Policy-Report-Only`** with directives `default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https://vitals.vercel-insights.com; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; report-uri /api/csp-report`. CSP runs in Report-Only mode for the entire Phase 1-6 soak (D-15); the enforce switch (drop the `-Report-Only` suffix) lands in Plan 07.
2. **`X-Frame-Options: DENY`** — defence in depth with CSP `frame-ancestors 'none'`.
3. **`X-Content-Type-Options: nosniff`**.
4. **`Referrer-Policy: strict-origin-when-cross-origin`**.
5. **`Permissions-Policy: camera=(), microphone=(), geolocation=()`** — denies the three sensors a marketing site never needs (RESEARCH.md V9.2).

NOT in vercel.json (intentional): `Content-Security-Policy` (enforce form) — Phase 1 is report-only only. `X-Robots-Tag: noindex` — Vercel auto-applies on `*.vercel.app` URLs. `Strict-Transport-Security` — Vercel auto-applies HSTS on production deploys.

The `/api/csp-report` endpoint does not exist in Phase 1; Plan 06 ships it. Browser violation reports POST to a 404 until then — the 404 doesn't break the page; the violation is silently dropped.

### Task 5 — Disclaimer review + Vercel preview verification (no code)

`checkpoint:human-verify`, `gate="blocking"`. Jon reviewed all 5 disclaimer texts inline (drafted from `.planning/LAW_FIRM_WEBSITE_GUIDE.md` patterns) and approved them as-is — the version pin `2026-05-25-v1` reflects the draft date, so Phase 7's final attorney-advertising review can be tracked against this revision.

Reconciled local master with `origin/main` (3 disjoint commits: Initial + 2 claude.yml workflow tweaks) via `git merge --allow-unrelated-histories`. Pushed branch `phase-1-walking-skeleton` to origin. Jon opened the PR via the GitHub URL returned by the push (`https://github.com/jvanloo72/BSV-new-website/pull/new/phase-1-walking-skeleton`). Vercel-for-GitHub posted a preview URL within ~60 seconds. Jon clicked the preview URL and visually confirmed:

- Firm name "Belcher, Smolen & Van Loo LLP" in the header
- Placeholder paragraph below the heading
- Footer with the canonical disclaimer text + both office locations + copyright line
- No horizontal scroll at ~320px viewport width

ROADMAP.md Success Criterion 1 (Jon clicks a Vercel preview URL from a PR and sees the BSV homepage shell) is **satisfied**.

After approval, the merged master was pushed directly to `origin/main` (the PR auto-closed as merged on GitHub).

## Risk register & open items

- **8 npm audit moderate/high vulnerabilities** were reported during `npm install`. All are in transitive dev dependencies (build tooling / Playwright internals). Not addressed in Phase 1 — `npm audit fix --force` is too aggressive for the bootstrap. Plan 07 CI workflow will surface these on every PR; Phase 7 can decide whether to upgrade or document them as accepted.
- **`tests/gitleaks.spec.sh` is Linux/Bash; on Windows it requires Git Bash to run.** Not invoked by `playwright test`. Plan 06 wires it into the gitleaks install verification step.
- **`/api/csp-report` endpoint missing.** CSP violation reports drop into a 404 until Plan 06 lands the endpoint. Not user-visible.
- **Silicon Valley office street address is a placeholder.** RESEARCH.md A7 flags this; final address confirmed by Jon in Phase 7.
- **Brand favicon + headshots + color palette** all defer to Phase 2.

## Verification evidence

- `npm run build` → exit 0; `dist/index.html` rendered with firm name + verbatim disclaimer fragment + `<footer>` element.
- `npm run check` → 0 errors, 0 warnings, 8 hints (all in skipped test stubs).
- `node -e` script asserting vercel.json structure → "vercel.json security headers OK ✓".
- No `tailwind.config.{js,ts,mjs}` at repo root (FOUND-02 / Pitfall A2).
- Vercel preview URL: rendered correctly per Jon's visual confirmation at the Task 5 checkpoint.
- GitHub: `phase-1-walking-skeleton` PR opened against `main`, Vercel preview URL attached, Jon approved.
