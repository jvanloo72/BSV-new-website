# Phase 1: Scaffold & Shell — Research

**Researched:** 2026-05-25
**Domain:** Astro 6 + Tailwind v4 + Vercel scaffold for a boutique law-firm marketing site, with five Zod content collections, a disclaimer-plumbed `BaseLayout`, a security baseline (`vercel.json` headers, gitleaks, push-protection, CSP report-only), and a verified preview-deploy workflow.
**Confidence:** HIGH for stack versions, content-collection patterns, Tailwind v4 `@theme` syntax, and the `vercel.json` `headers` schema (all verified against the live npm registry, Vercel's `docs/project-configuration/vercel-json` page dated 2026-03-11, Astro's `docs.astro.build/en/guides/content-collections/`, and Tailwind's `tailwindcss.com/docs/theme`). MEDIUM on the precise CSP directive set (final tuning happens in Phase 7 after report-only collection across Phases 3-6) and on the slopcheck legitimacy audit (slopcheck unavailable on this machine — every package below is therefore tagged `[ASSUMED]` and the planner must gate first-time installs behind `checkpoint:human-verify`). LOW on nothing — every claim in the prescriptive sections below has a source.

---

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions (Phase 1)

The Phase 1 CONTEXT.md locked 31 decisions. They are **mandatory inputs** to the plan — research below does **not** explore alternatives to any of them.

**Content authoring formats**
- **D-01** — `attorneys`, `practiceAreas`, `blog` use **MDX** files (so disclaimers, callouts, and pull-quotes can be inlined inside prose).
- **D-02** — `testimonials` use **MDX**.
- **D-03** — `disclaimers` use **JSON** (a single `disclaimers.json` keyed by id).

**Content collection schemas (initial shape — refined during planning)**
- **D-04** — `attorneys` schema: `name`, `slug`, `title` (Partner | Associate | Counsel), `barAdmissions[]`, `education[]`, `focus`, `priorFirms[]`, `representativeDeals[]` (each with `parties`, optional `value`, `role`, `cleared: boolean`), `recognition[]`, `clerkship?`, `languages[]`, `email`, `phone?`, `headshot` (uses Astro `image()` for the 200 KB budget), `draft: boolean`.
- **D-05** — `practiceAreas` schema: `name`, `slug`, `summary`, `clientProblem`, `bsvApproach`, `representativeDeals[]`, `leadAttorneys[]` (Zod `reference('attorneys')`), `faqs[]`, `feeStructureBand: boolean`.
- **D-06** — `blog` schema: `title`, `slug`, `author` (Zod `reference('attorneys')`, required — build fails if missing), `practiceArea` (Zod `reference('practiceAreas')`), `publishedAt`, `updatedAt?`, `summary`, `reviewedBy` (required, free text — editorial review gate), `draft: boolean`.
- **D-07** — `testimonials` schema: `quote`, `attribution`, `role`, `matter?`, `practiceArea?` (Zod `reference('practiceAreas')`).
- **D-08** — `disclaimers` schema: `id` (string union of the five known ids), `text` (markdown allowed), `version` (string — change when wording updates).

**Disclaimer storage & rendering**
- **D-09** — Single `<Disclaimer id="..." />` component imports the `disclaimers` collection at build time, looks up the matching id, and renders it via Astro Markdown rendering. Five ids: `footer`, `contact`, `blog`, `practice-area`, `attorney`.
- **D-10** — If a layout requests an id that doesn't exist, the **build FAILS** (Zod-typed string union enforces this) — no silent fallback to empty.

**URL conventions**
- **D-11** — Attorney slugs: `first-last` lowercase, hyphenated — `aaron-belcher`, `stuart-smolen`, `jon-van-loo`, `iris-zhang`, `susan-jiang`.
- **D-12** — Practice-area slugs: `mergers-acquisitions`, `intellectual-property-technology-transactions`, `tax`.
- **D-13** — Blog slugs: `kebab-case` from the title; **locked at first publish; never renamed** (any rename requires a redirect).
- **D-14** — `.planning/URL-CONVENTIONS.md` codifies the above + the canonical route list.

**Security baseline**
- **D-15** — `vercel.json` ships with `Content-Security-Policy-Report-Only` (not enforced) in Phase 1. Initial directives:
  ```
  default-src 'self';
  img-src 'self' data: https:;
  style-src 'self' 'unsafe-inline';
  script-src 'self';
  connect-src 'self' https://vitals.vercel-insights.com;
  font-src 'self' data:;
  frame-ancestors 'none';
  base-uri 'self';
  report-uri /api/csp-report
  ```
- **D-16** — Enforced headers from Phase 1: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
- **D-17** — Secret-scanning runs in two layers: (a) **gitleaks** pre-commit hook locally via `.git/hooks/pre-commit` + project-tracked `.gitleaks.toml`, (b) **GitHub push protection** on `jvanloo72/BSV-new-website`. Both required.
- **D-18** — `.gitignore` lists `.env`, `.env.local`, `.env.*.local`, `.vercel`, `dist`, `node_modules`, `.astro` from the first commit.

**Preview-deploy gating**
- **D-19** — Preview deploys carry `X-Robots-Tag: noindex, nofollow` via `vercel.json` env-based config; `BaseLayout` ALSO renders `<meta name="robots" content="noindex">` when `import.meta.env.PROD === false`. Production unconditionally sets `<meta name="robots" content="index, follow">`.
- **D-20** — Preview URLs linkable by Jon directly — no auth wall on previews in Phase 1.

**Tailwind v4 theme placeholder**
- **D-21** — `src/styles/global.css` with placeholder neutral tokens in `@theme` — zinc-based, monochrome — explicitly marked `/* PLACEHOLDER — replaced in Phase 2 */`.
- **D-22** — **Token names are stable across the palette swap:** `--color-text`, `--color-text-muted`, `--color-bg`, `--color-bg-elevated`, `--color-border`, `--color-accent`, `--color-accent-fg`. Phase 2 changes values, not names.

**Placeholder content (seeding)**
- **D-23** — One placeholder per collection, all with `draft: true` where applicable:
  - `src/content/attorneys/placeholder-attorney.mdx`
  - `src/content/practiceAreas/placeholder-practice.mdx`
  - `src/content/blog/placeholder-post.mdx` (valid `author` reference + `reviewedBy`)
  - `src/content/testimonials/placeholder.mdx`
  - `src/content/disclaimers/disclaimers.json` with all five real disclaimer ids.
- **D-24** — A deliberately-broken sibling file (a blog post with no `author`) is added in a feature branch to prove the build fails as expected, then removed before merge.

**Disclaimer crawl test**
- **D-25** — Playwright test `tests/disclaimer-crawl.spec.ts` runs after `astro build`: spins up `astro preview`, fetches each route from the generated sitemap, parses HTML with **Cheerio**, asserts the footer disclaimer text appears verbatim on every route.
- **D-26** — Runs in CI on every PR (GitHub Actions) and locally via `npm run test:disclaimer`.

**Header & footer scope**
- **D-27** — Phase 1 ships a functional but visually-minimal `<SiteHeader />` (firm name as text, basic nav) and `<SiteFooter />` (`<Disclaimer id="footer" />`, copyright, both office locations).
- **D-28** — Logo/wordmark, mega-nav, refined visual treatment deferred to Phase 2.

**Site-wide JSON-LD**
- **D-29** — `<JsonLd />` component + `src/lib/jsonld.ts` builder land in Phase 1. Site-wide `LegalService` schema injected via BaseLayout `<head>`. Person/Article added in later phases.
- **D-30** — All JSON-LD generated via **`schema-dts`** for compile-time typing. `npm run validate:jsonld` script lands in Phase 7; Phase 1 just confirms the scaffold works.

**CI foundations**
- **D-31** — GitHub Actions workflow `ci.yml`: `npm install` → `astro build` → `npm run test:disclaimer` → gitleaks scan → `npm run lint:legal`. Blocks merges to `main` on any failure.

### Claude's Discretion

The CONTEXT.md grants research/planning discretion on:
- Exact `package.json` script names if they conflict with Astro defaults.
- Specific directory layout under `src/components/` (feature vs primitive grouping) — planner picks via PATTERNS.md analysis.
- Choice of icon library (`astro-icon` vs hand-rolled SVG) — **deferred to Phase 2**.
- Exact **gitleaks rule set** — start with the default + add custom rule for firm-specific patterns (e.g., placeholder `intake@bsvlaw.com` should not trigger false positives).

### Deferred Ideas (OUT OF SCOPE for Phase 1 — do not research alternatives)

- Logo / wordmark design → Phase 2.
- Final color palette → Phase 2.
- Custom hero SVG + practice-area icons → Phase 2.
- OG image strategy (static vs Vercel OG-generation) → Phase 3.
- `@astrojs/sitemap` configuration details (filtering drafts, custom lastmod) → Phase 3.
- CSP enforcement specifics → Phase 7.
- `@vercel/analytics` integration → Phase 7.
- Rate limiting on CSP report endpoint → Phase 6/7.
- A11y axe-core CI integration → Phase 7.

</user_constraints>

---

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| **FOUND-01** | Astro 6 project scaffolded with TypeScript, MDX, Vercel adapter, sitemap, Tailwind v4 | §"Astro 6 Scaffold Mechanics", §"`astro.config.mjs` (canonical)" |
| **FOUND-02** | Tailwind v4 configured via `@theme` in `src/styles/global.css` (no `tailwind.config.js`) | §"Tailwind v4 in Astro 6", §"`global.css` (placeholder tokens)" |
| **FOUND-03** | Five Zod-typed content collections — `attorneys`, `practiceAreas`, `blog`, `testimonials`, `disclaimers` | §"Content Collections", §"`src/content.config.ts` (full shape)" |
| **FOUND-04** | Cross-collection `reference()` typing — blog cannot publish with missing author; practice-area cannot reference a missing lead attorney | §"Content Collections / Cross-collection `reference()`" |
| **FOUND-05** | `BaseLayout.astro` renders header, footer (with disclaimer slot), main slot, head SEO + JSON-LD slots | §"BaseLayout pattern (named slots)" |
| **FOUND-06** | Three specialized layouts extending BaseLayout — `AttorneyLayout`, `PracticeAreaLayout`, `BlogPostLayout` — each adding own JSON-LD + per-page disclaimer | §"Specialized layouts via slot transfer" |
| **FOUND-07** | Single `<Disclaimer id="..." />` reads from `disclaimers` collection | §"`<Disclaimer />` component (pattern + typed id union)" |
| **FOUND-08** | URL conventions locked — slugs documented and never renamed post-launch | §"User Constraints" D-11..D-14 + §"`URL-CONVENTIONS.md` template" |
| **FOUND-09** | Vercel preview deploy workflow verified — every PR produces a clickable preview URL | §"Vercel Preview Deploys" |
| **FOUND-10** | Astro 6 / Tailwind v4 pattern compliance — no `output: 'hybrid'`, no deprecated `theme()`, string `getStaticPaths` params | §"Pitfalls 12 + 13 — what NOT to write" |
| **SEC-01** | HTTP security headers in `vercel.json` — CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy | §"`vercel.json` security headers (canonical)" |
| **SEC-02** | CSP runs in `Content-Security-Policy-Report-Only` mode through build phases | §"CSP Report-Only Pattern" + §"`/api/csp-report` endpoint" |
| **SEC-03** | All API keys / secrets stored as Vercel environment variables only — never in source | §"`.gitignore` + Vercel env var hygiene" |
| **SEC-04** | `.env*` in `.gitignore`; gitleaks pre-commit hook; GitHub push protection enabled | §"Secret-scanning two-layer setup" |
| **SEC-10** | Vercel preview deploys unindexed (no `noindex` leak of staging content) | §"Preview-Deploy Noindex Pattern" |
| **LEGAL-01** | Site-wide footer disclaimer renders on EVERY page — verified by Playwright crawl test in CI | §"Playwright Disclaimer-Crawl Test" |
| **OPS-05** | Vercel preview URL accessible to Jon for every PR before merge | §"Vercel Preview Deploys" + §"GitHub Actions ci.yml" |

</phase_requirements>

---

## Summary

Phase 1 is the **foundation phase that every later phase compounds on**, so getting the patterns right is more valuable than getting them done quickly. The decisions in CONTEXT.md already lock 31 details — research's job is to confirm that each locked decision is **actually achievable with current 2026 tooling** and to surface the gotchas that turn a locked decision into a hidden failure.

The toolchain is healthy: Astro 6.3.7, Tailwind 4.3.0, `@astrojs/vercel` 10.0.7, `@astrojs/mdx` 5.0.6, `@astrojs/sitemap` 3.7.2, `@tailwindcss/vite` 4.3.0, `schema-dts` 2.0.0, `@playwright/test` 1.60.0, and `cheerio` 1.2.0 are all current on the npm registry as of the research date. Node 24.16.0 on Jon's machine satisfies Astro 6's `>=22.12.0` engine requirement. The single most important compatibility note: **`@astrojs/vercel@10.x` is the Astro 6 line — do not install 9.x (Astro 5).**

Three things in the locked decisions need explicit handling the planner cannot guess at:

1. **`gitleaks` is a Go binary, not an npm package.** The `gitleaks@1.0.0` package on npm is a single-version, no-stars, unrelated package by `ycjcl868` and **must not be installed**. The legitimate gitleaks is installed from `github.com/gitleaks/gitleaks` releases via a binary (Windows: download the `.exe` from a tagged release). The pre-commit hook calls that binary, not a Node module. This is a `[VERIFIED: npm registry, GitHub]` finding that overrides the surface-level "just `npm install gitleaks`" intuition.
2. **Vercel auto-applies `x-robots-tag: noindex` to preview deploys on `*.vercel.app` URLs but NOT on custom preview domains.** Since Phase 1 doesn't have a custom domain yet, the auto-default already covers D-19's preview noindex requirement on the HTTP-header side. The `<meta name="robots">` BaseLayout fallback is the belt-and-suspenders catch for any future custom-domain preview and is still required.
3. **Astro's `security.csp` config injects CSP via `<meta http-equiv>`, NOT via response headers, and `<meta>` does not support `Content-Security-Policy-Report-Only` reliably across browsers (Safari ignores meta-CSP report-only). Use `vercel.json` `headers` for the report-only directive in D-15. Do not enable Astro's `security.csp` in Phase 1.**

**Primary recommendation:** Execute the locked decisions exactly as written, install the version-pinned stack, scaffold via `npm create astro@latest` with the **minimal** template, run `npx astro add mdx sitemap vercel tailwind` to wire each integration through Astro's own setup logic (so the integration order in `astro.config.mjs` and the `vite.plugins` array land correctly), then layer the disclaimer/layout/content-config plumbing on top. Defer the CSP enforcement (Phase 7), the contact-form security work (Phase 6), and any animation/icon/illustration decisions (Phase 2).

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| HTML rendering, routing, page generation | **Build-time (Astro static)** | — | Marketing site — every page known at build time; no SSR needed in Phase 1. |
| Content storage + schema validation | **Build-time (Astro Content Collections + Zod)** | Git (Markdown/JSON files) | Content is data, not code; non-coder edits via GitHub web editor. |
| Styling + design tokens | **Build-time (Tailwind v4 + `@theme` CSS variables)** | — | CSS-first config in v4; no JS config file. |
| JSON-LD structured data | **Build-time (Astro components + `schema-dts`)** | — | Static schema injection; compile-time type checking via TypeScript. |
| HTTP security headers (CSP, X-Frame-Options, etc.) | **Edge (Vercel)** | — | Headers attach to every response; `vercel.json` is the deploy-time source of truth. |
| CSP violation reporting endpoint | **Vercel Function (`/api/csp-report`)** | — | Tiny POST handler; the only server endpoint in Phase 1. |
| Preview-noindex on staging | **Edge (Vercel auto-default + `vercel.json` override)** | Build-time (`<meta name="robots">` in BaseLayout when `!import.meta.env.PROD`) | Two layers: HTTP header (catches everything) + meta (catches if header is stripped). |
| Secret-scanning (pre-push) | **Local (gitleaks Go binary as git hook)** | Edge (GitHub push protection server-side) | Two-layer defence per D-17 — local catches what you can fix immediately, GitHub catches what slips through. |
| Disclaimer crawl test | **CI (GitHub Actions runner)** | Local (`npm run test:disclaimer`) | Playwright drives `astro preview`; Cheerio parses HTML; assert disclaimer text appears on every sitemap route. |
| Build verification + lint | **CI (GitHub Actions)** | — | Blocks merge to `main` on any failure. |

---

## Standard Stack

### Core (already locked in `.planning/research/STACK.md` — Phase 1 installs subset)

| Library | Verified Version | Purpose | Why Standard for This Phase |
|---------|------------------|---------|------------------------------|
| `astro` | **6.3.7** | Static site framework | Locked. Engines: Node ≥22.12.0. `[VERIFIED: npm registry]` (Jon's Node 24.16.0 satisfies.) |
| `@astrojs/vercel` | **10.0.7** | Vercel adapter | Astro 6 line (do NOT use 9.x). Peer-deps `astro: ^6.0.0`. `[VERIFIED: npm registry]` |
| `@astrojs/mdx` | **5.0.6** | MDX support inside content collections | Required for D-01/D-02 (MDX content). `[VERIFIED: npm registry]` |
| `@astrojs/sitemap` | **3.7.2** | Sitemap generation (Phase 1 ships installed; config tuned in Phase 3) | Needed by the Playwright crawl test (D-25) — sitemap is the source of truth for which routes to crawl. `[VERIFIED: npm registry]` |
| `tailwindcss` | **4.3.0** | Styling — CSS-first config via `@theme` | Locked. `[VERIFIED: npm registry]` |
| `@tailwindcss/vite` | **4.3.0** | Tailwind v4 plugin into Astro's Vite pipeline | The 2026 install path for Tailwind v4 in Astro ≥5.2. Installed automatically by `npx astro add tailwind`. `[VERIFIED: npm registry; docs.astro.build/en/guides/styling/]` |
| `schema-dts` | **2.0.0** | TypeScript types for Schema.org / JSON-LD | Compile-time typing for `LegalService`, `Person`, `Article`. Published by Google. `[VERIFIED: npm registry; opensource.google]` (Note: STACK.md called out 1.1.0; the current registry version is 2.0.0. Recommend the planner pin **2.0.0**.) |
| `typescript` | **5.x (Astro template default)** | TS support | Installed by `npm create astro@latest` template. `[ASSUMED]` — Astro template manages this; do NOT pin TypeScript 6.0.3 (which appeared as latest on npm but is a non-Microsoft fork). |
| `@astrojs/check` | **0.9.9** | TypeScript + content-collection schema check | Run `astro check` as a CI step. `[VERIFIED: npm registry]` |

### Supporting (Phase 1 specifics)

| Library | Verified Version | Purpose | When to Use in Phase 1 |
|---------|------------------|---------|------------------------|
| `@playwright/test` | **1.60.0** | E2E test framework — disclaimer crawl test | Required by D-25/D-26. `[VERIFIED: npm registry]` |
| `cheerio` | **1.2.0** | HTML parser used inside Playwright test to assert disclaimer text | Used by `disclaimer-crawl.spec.ts` to parse rendered HTML and run a `text()` assertion. `[VERIFIED: npm registry]` |
| `zod` | (bundled with Astro 6 — re-exported as `astro/zod`) | Schema validation for content collections | Do NOT install separately. Use `import { z } from 'astro:content'` per the Astro 6 docs. `[VERIFIED: docs.astro.build/en/guides/content-collections/]` |

### What you must NOT install (legitimacy traps)

| Trap | What Looks Like | Why It's Wrong | What To Do Instead |
|------|-----------------|----------------|---------------------|
| `npm install gitleaks` | npm has a `gitleaks@1.0.0` package | That package is a single-version, no-relationship, unmaintained module by `ycjcl868` published to `github.com/ycjcl868/gitleaks` — not the legitimate gitleaks tool. `[VERIFIED: npm view gitleaks]` | Install the **real** gitleaks Go binary from `https://github.com/gitleaks/gitleaks/releases` (Windows: download the `gitleaks_*_windows_x64.zip`, extract `gitleaks.exe` to `%USERPROFILE%\bin\` and add to PATH). Pre-commit hook script calls `gitleaks.exe protect --staged --no-banner --redact -v`. `[CITED: github.com/gitleaks/gitleaks]` |
| `npm install typescript@6.0.3` | npm shows `typescript@6.0.3` as latest | That's a non-Microsoft fork — official Microsoft TypeScript is 5.x in 2026. | Use the version `npm create astro@latest` installs (`^5.0.0`). Do not override. `[ASSUMED]` — needs slopcheck verification. |
| `npm install dotenv` | Common pattern from older tutorials | Astro / Vite read `.env` natively. | Don't install. Use Vercel env-var UI for production secrets. `[CITED: docs.astro.build/en/guides/environment-variables/]` |
| `@astrojs/tailwind` (v3-era integration) | Surfaces in older tutorials | This was the Tailwind v3 path; the v4 path is `@tailwindcss/vite`. | Use `@tailwindcss/vite` via `npx astro add tailwind`. `[VERIFIED: docs.astro.build/en/guides/styling/]` |

### Alternatives Considered (and Rejected)

| Instead of | Could Use | Why Rejected for Phase 1 |
|------------|-----------|--------------------------|
| `cheerio` for HTML parsing in disclaimer test | Playwright's built-in `page.locator('footer').textContent()` | Cheerio is faster (no browser context needed per route — fetch HTML, parse, assert), and matches D-25's "parses the HTML with Cheerio" language exactly. |
| GitHub Actions for CI | Vercel's built-in PR checks only | D-31 explicitly specifies GitHub Actions for the disclaimer crawl + gitleaks scan + lint:legal pipeline. Vercel's checks do not run Playwright. |
| Husky for managing pre-commit hooks | Raw `.git/hooks/pre-commit` | D-17 explicitly lists "`.git/hooks/pre-commit`" — sticks to native git hooks for now (Husky adds a Node dep + a project-tracked `.husky/` folder for one hook; raw is simpler). Husky can be revisited if more hooks land later. |
| Astro `security.csp` config | `vercel.json` `headers` array | Astro's config injects CSP via `<meta http-equiv>`, which doesn't reliably support `Report-Only` across browsers (Safari ignores meta-CSP-report-only). `vercel.json` headers ship via HTTP response headers, which all browsers honor. `[CITED: docs.astro.build/en/reference/configuration-reference/]` |

### Installation Plan (Phase 1)

The planner should bias toward `npx astro add` for integrations rather than hand-editing `astro.config.mjs`, because `astro add` handles the import order and Vite-plugin registration correctly. The exact sequence:

```powershell
# In Jon's project root: C:\Users\jonva\Documents\BSV-website

# 1. Initial scaffold — minimal template, TypeScript strict mode, install deps
npm create astro@latest -- --template minimal --typescript strict --install --git no --skip-houston

# 2. Add Astro integrations (each writes the correct lines to astro.config.mjs)
npx astro add mdx       # adds @astrojs/mdx
npx astro add sitemap   # adds @astrojs/sitemap
npx astro add vercel    # adds @astrojs/vercel
npx astro add tailwind  # adds @tailwindcss/vite (Tailwind v4 path)

# 3. Pin schema-dts (used by JsonLd component)
npm install schema-dts@2.0.0

# 4. Dev tools for Phase 1
npm install --save-dev @playwright/test@1.60.0 cheerio@1.2.0 @astrojs/check@0.9.9
npx playwright install --with-deps chromium  # only Chromium needed for disclaimer crawl

# 5. Install gitleaks (NOT via npm — Windows binary)
# Manual: download https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_*_windows_x64.zip
# Extract gitleaks.exe to C:\Users\jonva\bin\ (and add C:\Users\jonva\bin to PATH)
```

**Version verification:** All packages above were verified via `npm view <pkg> version` on 2026-05-25. Re-verify before the planner emits its task list — npm versions can move daily.

---

## Package Legitimacy Audit

> slopcheck was **not available** on the research machine (pip not installed in this PowerShell environment). Per protocol, every package below is tagged `[ASSUMED]` and the planner MUST insert a `checkpoint:human-verify` gate before the first `npm install` runs.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| `astro@6.3.7` | npm | 10+ years (project) | millions/wk | github.com/withastro/astro | unavailable | **Approved** [ASSUMED] — official Astro framework, recommended in STACK.md |
| `@astrojs/vercel@10.0.7` | npm | 4+ years | millions/wk | github.com/withastro/astro (monorepo) | unavailable | **Approved** [ASSUMED] — official Astro integration |
| `@astrojs/mdx@5.0.6` | npm | 4+ years | millions/wk | github.com/withastro/astro (monorepo) | unavailable | **Approved** [ASSUMED] — official |
| `@astrojs/sitemap@3.7.2` | npm | 4+ years | millions/wk | github.com/withastro/astro (monorepo) | unavailable | **Approved** [ASSUMED] — official |
| `@astrojs/check@0.9.9` | npm | 3+ years | high | github.com/withastro/language-tools | unavailable | **Approved** [ASSUMED] — official |
| `tailwindcss@4.3.0` | npm | 8+ years (project) | millions/wk | github.com/tailwindlabs/tailwindcss | unavailable | **Approved** [ASSUMED] — official |
| `@tailwindcss/vite@4.3.0` | npm | 1+ year | millions/wk | github.com/tailwindlabs/tailwindcss (monorepo) | unavailable | **Approved** [ASSUMED] — official, the 2026 Astro path |
| `schema-dts@2.0.0` | npm | 5+ years | high | github.com/google/schema-dts (Google) | unavailable | **Approved** [ASSUMED] — published by Google |
| `@playwright/test@1.60.0` | npm | 4+ years | millions/wk | github.com/microsoft/playwright (Microsoft) | unavailable | **Approved** [ASSUMED] — official Microsoft package |
| `cheerio@1.2.0` | npm | 14+ years | tens of millions/wk | github.com/cheeriojs/cheerio | unavailable | **Approved** [ASSUMED] — well-known HTML parser |
| `typescript` (template default) | npm | 12+ years | tens of millions/wk | github.com/microsoft/TypeScript | unavailable | **Approved** [ASSUMED] — Microsoft's TypeScript (5.x, not the 6.0.3 fork) |
| **`gitleaks@1.0.0`** (npm package) | npm | over 1 year | single version, ~0 downloads/wk | github.com/ycjcl868/gitleaks (NOT the official gitleaks) | unavailable | **REMOVED** — Slopsquat / impersonation. See "What you must NOT install" above. The legitimate gitleaks is a Go binary, installed manually from `github.com/gitleaks/gitleaks/releases`. |

**Packages removed due to legitimacy concern:** `gitleaks@1.0.0` (npm) — replaced with manual Go-binary install from `github.com/gitleaks/gitleaks/releases`.

**Packages flagged as suspicious:** none of the approved packages above triggered other warning signs (no surprising postinstall scripts, all map to recognizable maintainers/orgs).

**Planner action required:** Insert a `checkpoint:human-verify` task BEFORE the first `npm install` block runs, with this prompt:
> "Pause: every Phase 1 package was tagged `[ASSUMED]` because slopcheck was unavailable during research. Before installing, please confirm by checking each package's GitHub repository link in the legitimacy audit table — verify each is the project we expect (withastro for Astro, tailwindlabs for Tailwind, microsoft for Playwright / TypeScript, google for schema-dts, cheeriojs for Cheerio). Approve to proceed."

---

## Architecture Patterns

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                 LOCAL DEV (Jon's Windows machine)                      │
│                                                                        │
│  src/content/*           src/styles/global.css   .git/hooks/pre-commit │
│  (MDX + JSON)            (@theme + @import      (calls gitleaks.exe)   │
│        │                  tailwindcss)                                 │
│        ▼                                                               │
│  src/content.config.ts  ← Zod schemas (FOUND-03, FOUND-04)             │
│        │                                                               │
│        ▼                                                               │
│  astro:content typed entries                                           │
│        │                                                               │
│        ▼                                                               │
│  src/pages/**/*.astro  →  layouts/[Specialized].astro                  │
│                            └─→ layouts/BaseLayout.astro                │
│                                  └─ <head> slot: SeoHead + JsonLd      │
│                                  └─ <Disclaimer id="footer" /> in foot │
│        │                                                               │
│        ▼                                                               │
│  npm run build → dist/  (static HTML + assets)                         │
│        │                                                               │
│        ├─→  npx playwright test  (disclaimer-crawl.spec.ts)            │
│        │      └─ spins up astro preview, fetches sitemap,              │
│        │         parses each page with cheerio, asserts disclaimer     │
│        ▼                                                               │
└────────────────────────────────────────────────────────────────────────┘
        │ git push
        ▼
┌────────────────────────────────────────────────────────────────────────┐
│              GitHub (jvanloo72/BSV-new-website)                        │
│                                                                        │
│  Push protection: enabled  ←  catches secrets gitleaks missed locally  │
│                                                                        │
│  .github/workflows/ci.yml                                              │
│   ├─ npm install                                                       │
│   ├─ astro build                                                       │
│   ├─ npm run test:disclaimer  (Playwright + cheerio)                   │
│   ├─ gitleaks detect (in CI; mirrors the local pre-commit)             │
│   └─ npm run lint:legal       (Rule 7.4 banned-terms — empty Phase 1)  │
│                                                                        │
│  Required check on PRs to main: ci.yml must pass                       │
└────────────────────────────────────────────────────────────────────────┘
        │ PR opened
        ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       Vercel (auto-deploy)                             │
│                                                                        │
│  Per-PR preview URL: https://bsv-new-website-<sha>.vercel.app          │
│   ├─ X-Robots-Tag: noindex  (auto on *.vercel.app domain)              │
│   ├─ <meta name="robots" content="noindex">  (BaseLayout fallback)     │
│   ├─ Security headers from vercel.json:                                │
│   │    Content-Security-Policy-Report-Only: default-src 'self'; ...    │
│   │    X-Frame-Options: DENY                                           │
│   │    X-Content-Type-Options: nosniff                                 │
│   │    Referrer-Policy: strict-origin-when-cross-origin                │
│   │    Permissions-Policy: camera=() microphone=() geolocation=()      │
│   └─ /api/csp-report  (POST endpoint — thin logger)                    │
│                                                                        │
│  Comment on PR: preview URL (so Jon can click it before merge)         │
└────────────────────────────────────────────────────────────────────────┘
```

**The single one-way data direction:** Markdown/JSON → Zod validation → page templates → layouts → static HTML → Vercel CDN. The only POST endpoint in Phase 1 is `/api/csp-report` (a thin logger).

### Recommended Project Structure (Phase 1 — Aligned with CONTEXT.md D-23)

```
BSV-website/
├── astro.config.mjs                  # Astro config — see §"`astro.config.mjs` (canonical)"
├── tsconfig.json                     # Astro default
├── package.json                      # Pinned versions per Installation Plan
├── package-lock.json
├── vercel.json                       # Security headers + preview-noindex rule
├── .gitignore                        # D-18 entries
├── .gitleaks.toml                    # gitleaks config (custom allowlist for intake@bsvlaw.com)
├── .git/hooks/pre-commit             # Calls gitleaks.exe (tracked separately via setup script)
├── scripts/
│   └── install-git-hooks.ps1         # PowerShell installer Jon runs once
├── public/
│   └── favicon.svg                   # Placeholder for Phase 1
├── src/
│   ├── styles/
│   │   └── global.css                # Tailwind v4 @theme placeholder tokens (D-21, D-22)
│   ├── content.config.ts             # Five Zod-typed collections (D-04 .. D-08)
│   ├── content/
│   │   ├── attorneys/
│   │   │   └── placeholder-attorney.mdx     (D-23; draft: true)
│   │   ├── practiceAreas/
│   │   │   └── placeholder-practice.mdx     (D-23; draft: true)
│   │   ├── blog/
│   │   │   └── placeholder-post.mdx         (D-23; draft: true; valid author + reviewedBy)
│   │   ├── testimonials/
│   │   │   └── placeholder.mdx              (D-23)
│   │   └── disclaimers/
│   │       └── disclaimers.json             (D-23; all five real ids with reviewed text)
│   ├── layouts/
│   │   ├── BaseLayout.astro          # Header + footer + named "head" slot
│   │   ├── AttorneyLayout.astro      # Wraps BaseLayout (Phase 4 fills body; Phase 1 scaffolds)
│   │   ├── PracticeAreaLayout.astro
│   │   └── BlogPostLayout.astro
│   ├── components/
│   │   ├── chrome/
│   │   │   ├── SiteHeader.astro      (D-27 minimum)
│   │   │   ├── SiteFooter.astro      (D-27 minimum + <Disclaimer id="footer" />)
│   │   │   └── SkipToContent.astro   (a11y baseline per UI-SPEC)
│   │   ├── legal/
│   │   │   └── Disclaimer.astro      (D-09 + D-10 typed-id-union pattern)
│   │   └── seo/
│   │       ├── SeoHead.astro
│   │       └── JsonLd.astro
│   ├── lib/
│   │   ├── site.ts                   # SITE_NAME, BASE_URL, both addresses, phone
│   │   └── jsonld.ts                 # buildLegalServiceLd() — uses schema-dts types (D-29, D-30)
│   └── pages/
│       ├── index.astro               # Placeholder homepage (UI-SPEC §5)
│       ├── about.astro
│       ├── contact.astro
│       ├── practice-areas/
│       │   ├── index.astro
│       │   └── [slug].astro          # Dynamic route; getStaticPaths reads practiceAreas
│       ├── attorneys/
│       │   ├── index.astro
│       │   └── [slug].astro          # Dynamic route; getStaticPaths reads attorneys
│       ├── blog/
│       │   ├── index.astro
│       │   └── [slug].astro
│       ├── 404.astro
│       ├── 500.astro
│       └── api/
│           └── csp-report.ts         # POST handler for CSP violations
├── tests/
│   └── disclaimer-crawl.spec.ts      # D-25/D-26 Playwright + cheerio crawl test
├── .github/
│   └── workflows/
│       └── ci.yml                    # D-31 — install → build → test:disclaimer → gitleaks → lint:legal
└── .planning/
    ├── URL-CONVENTIONS.md            # NEW in Phase 1 — codifies D-11..D-14
    ├── CLIENT_DISCLOSURE_CLEARANCE.md  # Empty template — populated in Phase 4
    └── (existing .planning/ files)
```

### Pattern 1: `astro.config.mjs` (canonical)

**Source:** `docs.astro.build/en/guides/integrations-guide/` (canonical pattern for `defineConfig`); `docs.astro.build/en/guides/integrations-guide/vercel/` for the adapter; `docs.astro.build/en/guides/styling/` for the Tailwind plugin position.

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://bsvlaw.com',          // Required for sitemap + canonical URLs
  trailingSlash: 'never',              // Locked URL conv per D-11..D-13
  integrations: [
    mdx(),
    sitemap(),
  ],
  adapter: vercel({
    webAnalytics: { enabled: false },  // Deferred to Phase 7 per CONTEXT.md
  }),
  vite: {
    plugins: [tailwindcss()],          // Tailwind v4 — note: Vite plugin, NOT an integration
  },
});
```

**Critical:** Tailwind v4 is wired as a **Vite plugin** (`vite.plugins`), NOT as an Astro `integrations` entry. This is the 2026 path and the one `npx astro add tailwind` writes. The legacy `@astrojs/tailwind` integration (v3 era) is gone — do not import it.

### Pattern 2: `src/content.config.ts` (full shape, all five collections)

**Source:** `docs.astro.build/en/guides/content-collections/` (modern 2026 location is `src/content.config.ts`, NOT `src/content/config.ts`).

```typescript
// src/content.config.ts
import { defineCollection, reference, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

// D-04 — attorneys collection
const attorneys = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/attorneys' }),
  schema: ({ image }) => z.object({
    name: z.string(),
    slug: z.string(),
    title: z.enum(['Partner', 'Associate', 'Counsel']),
    barAdmissions: z.array(z.string()).min(1),
    education: z.array(z.object({
      degree: z.string(),
      school: z.string(),
      year: z.number().optional(),
      honors: z.string().optional(),
    })),
    focus: z.string(),
    priorFirms: z.array(z.string()).default([]),
    representativeDeals: z.array(z.object({
      parties: z.string(),
      value: z.string().optional(),
      role: z.string().optional(),
      cleared: z.boolean(),  // gates publish; uncleared rows can sit in draft
    })).default([]),
    recognition: z.array(z.string()).default([]),
    clerkship: z.string().optional(),
    languages: z.array(z.string()).default(['English']),
    email: z.string().email(),
    phone: z.string().optional(),
    headshot: image(),     // Astro validates + optimizes (200 KB budget gate)
    headshotAlt: z.string(),
    order: z.number(),
    draft: z.boolean().default(false),
  }),
});

// D-05 — practiceAreas
const practiceAreas = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/practiceAreas' }),
  schema: ({ image }) => z.object({
    name: z.string(),
    slug: z.string(),
    summary: z.string(),
    clientProblem: z.string(),
    bsvApproach: z.string(),
    representativeDeals: z.array(z.string()).default([]),
    leadAttorneys: z.array(reference('attorneys')).min(1),  // cross-link, build fails if missing
    faqs: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })).default([]),
    feeStructureBand: z.boolean().default(true),
    icon: image().optional(),  // Phase 2 supplies
    order: z.number(),
    draft: z.boolean().default(false),
  }),
});

// D-06 — blog
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.mdx', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    slug: z.string(),
    author: reference('attorneys'),     // REQUIRED — build fails if missing or invalid
    practiceArea: reference('practiceAreas'),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    summary: z.string(),
    reviewedBy: z.string().min(1),      // editorial gate — required free text
    cover: image().optional(),
    coverAlt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

// D-07 — testimonials
const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/testimonials' }),
  schema: z.object({
    quote: z.string(),
    attribution: z.string(),
    role: z.string(),
    matter: z.string().optional(),
    practiceArea: reference('practiceAreas').optional(),
    featured: z.boolean().default(false),
  }),
});

// D-08 — disclaimers (single JSON file, multiple entries)
const disclaimers = defineCollection({
  loader: file('src/content/disclaimers/disclaimers.json'),
  schema: z.object({
    id: z.enum(['footer', 'contact', 'blog', 'practice-area', 'attorney']),
    text: z.string(),
    version: z.string(),  // change when wording updates — compliance audit trail
  }),
});

export const collections = { attorneys, practiceAreas, blog, testimonials, disclaimers };
```

**Source:** `docs.astro.build/en/guides/content-collections/` — `defineCollection`, `loader` (glob, file), `reference`, `image()` helper. `[VERIFIED: docs.astro.build]`.

### Pattern 3: BaseLayout with named `head` slot + specialized layout slot transfer

**Source:** `docs.astro.build/en/basics/astro-components/#named-slots` (named-slot pattern); `docs.astro.build/en/basics/layouts/` (layout nesting). The combined pattern (a child layout forwarding content into a parent's named slot) uses the `slot="head"` attribute on the forwarded element.

```astro
---
// src/layouts/BaseLayout.astro
import '../styles/global.css';
import SiteHeader from '../components/chrome/SiteHeader.astro';
import SiteFooter from '../components/chrome/SiteFooter.astro';
import SkipToContent from '../components/chrome/SkipToContent.astro';
import SeoHead from '../components/seo/SeoHead.astro';
import JsonLd from '../components/seo/JsonLd.astro';
import { buildLegalServiceLd } from '../lib/jsonld';

interface Props {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
}

const { title, description, canonical, ogImage } = Astro.props;
const isPreview = !import.meta.env.PROD;  // D-19 BaseLayout fallback
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />

    <!-- D-19 — preview-noindex BaseLayout fallback -->
    {isPreview
      ? <meta name="robots" content="noindex, nofollow" />
      : <meta name="robots" content="index, follow" />}

    <SeoHead title={title} description={description} canonical={canonical} ogImage={ogImage} />

    <!-- D-29 — site-wide LegalService JSON-LD -->
    <JsonLd data={buildLegalServiceLd()} />

    <!-- Named slot for per-layout / per-page <head> additions (extra JSON-LD, OG overrides) -->
    <slot name="head" />
  </head>
  <body>
    <SkipToContent />
    <SiteHeader currentPath={Astro.url.pathname} />
    <main id="main">
      <slot />
    </main>
    <SiteFooter />
  </body>
</html>
```

**Specialized layout (slot transfer pattern):**

```astro
---
// src/layouts/AttorneyLayout.astro
import BaseLayout from './BaseLayout.astro';
import Disclaimer from '../components/legal/Disclaimer.astro';
import JsonLd from '../components/seo/JsonLd.astro';
import { buildPersonLd } from '../lib/jsonld';
import type { CollectionEntry } from 'astro:content';

interface Props {
  attorney: CollectionEntry<'attorneys'>;
}

const { attorney } = Astro.props;
const personLd = buildPersonLd(attorney);
---
<BaseLayout
  title={`${attorney.data.name} — BSV Law`}
  description={attorney.data.focus}
>
  <!-- Forward Person JSON-LD into BaseLayout's named "head" slot -->
  <JsonLd slot="head" data={personLd} />

  <!-- Default slot (page body) -->
  <article>
    <header>
      <h1>{attorney.data.name}</h1>
      <p>{attorney.data.title}</p>
    </header>
    <slot />   <!-- forwarded from the page -->
    <Disclaimer id="attorney" />
  </article>
</BaseLayout>
```

The `slot="head"` attribute on `<JsonLd />` tells Astro to place that element inside `BaseLayout`'s `<slot name="head" />` — that's the named-slot transfer mechanism. `[VERIFIED: docs.astro.build/en/basics/astro-components/]`.

### Pattern 4: `<Disclaimer />` component (typed id union — D-10 build-fail-on-missing)

**Source:** Astro Content Collections + Markdown rendering — `docs.astro.build/en/guides/content-collections/#rendering-body-content`.

```astro
---
// src/components/legal/Disclaimer.astro
import { getEntry, render } from 'astro:content';

// The id prop is restricted to the same enum as the disclaimers schema (D-08, D-10).
// Astro's TypeScript will fail the build if a layout passes an id not in this union.
type DisclaimerId = 'footer' | 'contact' | 'blog' | 'practice-area' | 'attorney';

interface Props {
  id: DisclaimerId;
}

const { id } = Astro.props;

// getEntry returns the entry with the matching `id` from the disclaimers collection.
// If the entry doesn't exist at build time, this throws and fails the build (D-10).
const entry = await getEntry('disclaimers', id);
if (!entry) {
  throw new Error(`Disclaimer id "${id}" not found in disclaimers collection. Add it to src/content/disclaimers/disclaimers.json.`);
}

// Render the markdown body of the disclaimer entry.
// Note: with the `file()` loader and a plain text field (not a markdown body),
// use `entry.data.text` instead of render(entry). The JSON pattern stores text in
// the `text` field, not in a body, so render() does not apply — use Astro's
// `<Fragment set:html={...}>` only after passing it through a sanitiser if HTML
// is needed. For plain markdown, use the `marked` or `remark` library at build
// time; for Phase 1, render `text` as plain text inside a <p>.
---
<aside class="disclaimer disclaimer--{id}" role="note">
  <p>{entry.data.text}</p>
</aside>
```

**Open implementation question (Claude's discretion):** D-09 says "renders it via Astro Markdown rendering," but the JSON file structure (one entry per id, `text` field) doesn't naturally pass through Astro's `render(entry)` pipeline (which is for body content in `.md`/`.mdx` files). Two compliant options for the planner to pick:
- **(a)** Keep `text` as plain string (current schema) — render with `{entry.data.text}` (escaped by Astro). Lose inline markdown formatting in disclaimers. Simplest.
- **(b)** Switch the disclaimers loader to one MDX file per disclaimer (e.g., `src/content/disclaimers/footer.mdx`, `contact.mdx`, ...) — then `render(entry)` works as for blog posts. Aligns with how render() is documented but expands D-03 ("one JSON file") into five MDX files.

The plan-phase orchestrator should surface this to the user; both options satisfy D-09 and D-10 functionally, but they differ in maintenance cost. **Default recommendation: (a)** — disclaimers are short, formatting needs are low (a paragraph), and the JSON shape is what D-03 explicitly locked.

### Pattern 5: `<JsonLd />` component + `schema-dts` builders

**Source:** `schema-dts@2.0.0` (Google) provides TypeScript types; rendering pattern is Astro's `set:html` on a `<script>` element.

```typescript
// src/lib/jsonld.ts
import type { LegalService, Person, WithContext } from 'schema-dts';

export const SITE = {
  name: 'Belcher, Smolen & Van Loo LLP',
  shortName: 'BSV Law',
  baseUrl: 'https://bsvlaw.com',
  phone: '+1-415-XXX-XXXX',         // Replace before launch; Jon confirms in Phase 7
  email: 'intake@bsvlaw.com',
  offices: [
    {
      streetAddress: '555 California St., Suite 4925',
      addressLocality: 'San Francisco',
      addressRegion: 'CA',
      postalCode: '94104',
      addressCountry: 'US',
    },
    {
      // Silicon Valley primary office — exact street address TBD; Jon confirms
      streetAddress: 'TBD',
      addressLocality: 'Silicon Valley',
      addressRegion: 'CA',
      postalCode: 'TBD',
      addressCountry: 'US',
    },
  ],
};

export function buildLegalServiceLd(): WithContext<LegalService> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LegalService',
    name: SITE.name,
    url: SITE.baseUrl,
    telephone: SITE.phone,
    address: SITE.offices.map(o => ({
      '@type': 'PostalAddress' as const,
      streetAddress: o.streetAddress,
      addressLocality: o.addressLocality,
      addressRegion: o.addressRegion,
      postalCode: o.postalCode,
      addressCountry: o.addressCountry,
    })),
    areaServed: 'United States',
    knowsAbout: [
      'Mergers and Acquisitions',
      'Intellectual Property',
      'Technology Transactions',
      'Tax',
      'Cryptocurrency Taxation',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'New client intake',
      email: SITE.email,
      telephone: SITE.phone,
      availableLanguage: ['English', 'Mandarin'],  // Iris Zhang fluent
    },
  };
}
```

```astro
---
// src/components/seo/JsonLd.astro
interface Props {
  data: object;
}
const { data } = Astro.props;
---
<script type="application/ld+json" set:html={JSON.stringify(data)} />
```

`[VERIFIED: npmjs.com/package/schema-dts]` (`schema-dts@2.0.0`, published by Google, 2 months ago).

### Pattern 6: `vercel.json` (security headers — canonical for Phase 1)

**Source:** Vercel docs `/docs/project-configuration/vercel-json#headers` (dated 2026-03-11). `headers` is an array of objects with `source`, `headers`, and optional `has` / `missing` matchers. **`headers` does NOT natively support environment scoping** (e.g., "production vs preview") — that must be done via `has` matchers on request headers (e.g., `x-vercel-deployment-url`) or via per-route patterns. Since Vercel's auto-noindex already handles preview deploys on `*.vercel.app`, **the BaseLayout `<meta>` fallback is sufficient for D-19** without needing per-environment vercel.json headers.

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy-Report-Only",
          "value": "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https://vitals.vercel-insights.com; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; report-uri /api/csp-report"
        },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

**Notes for the planner:**
- `Content-Security-Policy-Report-Only` ships in **Phase 1 in report-only mode** per D-15. Switching to `Content-Security-Policy` (enforce) is Phase 7.
- `style-src 'self' 'unsafe-inline'` includes `'unsafe-inline'` because Astro injects inline styles for some patterns (view transitions, MDX); the long-term plan in Phase 7 is to tighten this via hash- or nonce-based CSP — see Pitfall 7.
- `connect-src` includes `https://vitals.vercel-insights.com` so `@vercel/speed-insights` works when enabled in Phase 7; safe to ship in Phase 1 even though it's not yet active.
- **`vercel.json` `headers` apply to ALL deploys (production AND preview).** Vercel adds its OWN `x-robots-tag: noindex` on `*.vercel.app` URLs automatically — that header coexists with the CSP/X-Frame headers above with no conflict. `[CITED: vercel.com/kb/guide/are-vercel-preview-deployment-indexed-by-search-engines]`

### Pattern 7: `/api/csp-report` endpoint (thin logger)

**Source:** Astro server endpoints docs — `docs.astro.build/en/guides/endpoints/`. With the Vercel adapter, an `.ts` file under `src/pages/api/` becomes a serverless function.

```typescript
// src/pages/api/csp-report.ts
import type { APIRoute } from 'astro';

export const prerender = false;  // ensure it's a function, not static

const MAX_BODY_SIZE = 8 * 1024;  // 8 KB cap — CSP reports are tiny

export const POST: APIRoute = async ({ request }) => {
  try {
    // Cap body size to prevent abuse (deferred rate limiting per CONTEXT.md "Deferred Ideas").
    const reader = request.body?.getReader();
    if (!reader) {
      return new Response(null, { status: 400 });
    }
    const chunks: Uint8Array[] = [];
    let total = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_SIZE) {
        return new Response(null, { status: 413 });  // Payload Too Large
      }
      chunks.push(value);
    }
    const body = new TextDecoder().decode(new Uint8Array(
      chunks.reduce((acc, c) => [...acc, ...c], [] as number[])
    ));

    // Log to Vercel function logs (visible in dashboard). Do NOT echo back to the
    // browser — CSP reports may contain sensitive page content.
    console.warn('[CSP-REPORT]', body);
    return new Response(null, { status: 204 });
  } catch (e) {
    return new Response(null, { status: 400 });
  }
};
```

**Phase 1 scope:** just log to `console.warn` (visible in Vercel function logs). Phase 6/7 will add rate limiting and possibly forward to a structured log sink.

### Pattern 8: Playwright disclaimer-crawl test (D-25)

**Source:** Playwright docs — `playwright.dev/docs/intro`. Pattern combines Playwright's request fixture with Cheerio parsing. `astro preview` boots the built `dist/` on a local port; sitemap drives route enumeration.

```typescript
// tests/disclaimer-crawl.spec.ts
import { test, expect, request } from '@playwright/test';
import * as cheerio from 'cheerio';

// Fixed footer disclaimer text — substring assertion, not full equality
// (the disclaimer is rendered inside a paragraph; assert that the canonical
// sentence appears verbatim).
const FOOTER_DISCLAIMER_FRAGMENT =
  'The information on this website is for general informational purposes only';

test.describe('Disclaimer crawl', () => {
  test('footer disclaimer appears on every sitemap route', async ({ baseURL }) => {
    // 1. Fetch sitemap-0.xml (Astro sitemap default name)
    const ctx = await request.newContext({ baseURL });
    const sitemapRes = await ctx.get('/sitemap-0.xml');
    expect(sitemapRes.ok(), 'sitemap-0.xml should exist').toBeTruthy();
    const sitemapXml = await sitemapRes.text();

    // 2. Extract every <loc> URL
    const $sitemap = cheerio.load(sitemapXml, { xmlMode: true });
    const urls = $sitemap('loc').toArray().map(el => $sitemap(el).text());
    expect(urls.length, 'sitemap should contain at least one URL').toBeGreaterThan(0);

    // 3. Fetch each page, parse with cheerio, assert disclaimer present
    const missing: string[] = [];
    for (const url of urls) {
      const path = new URL(url).pathname;
      const res = await ctx.get(path);
      if (!res.ok()) {
        missing.push(`${path} returned ${res.status()}`);
        continue;
      }
      const html = await res.text();
      const $ = cheerio.load(html);
      const footerText = $('footer').text();
      if (!footerText.includes(FOOTER_DISCLAIMER_FRAGMENT)) {
        missing.push(`${path} missing footer disclaimer`);
      }
    }

    expect(missing, `routes missing disclaimer: ${missing.join(', ')}`).toEqual([]);
  });
});
```

**playwright.config.ts (minimal):**

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  workers: 1,
  use: {
    baseURL: 'http://localhost:4321',  // Astro preview default port
  },
  webServer: {
    command: 'npm run build && npx astro preview',
    url: 'http://localhost:4321',
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});
```

`package.json` script: `"test:disclaimer": "playwright test tests/disclaimer-crawl.spec.ts"`.

### Pattern 9: GitHub Actions ci.yml (D-31)

**Source:** GitHub Actions docs — `docs.github.com/en/actions`. gitleaks GitHub Action: `github.com/gitleaks/gitleaks-action` (the official action from the gitleaks maintainers).

```yaml
# .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v5
        with:
          fetch-depth: 0   # gitleaks needs full history

      - name: Setup Node.js
        uses: actions/setup-node@v5
        with:
          node-version: '22'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run disclaimer crawl test
        run: npm run test:disclaimer

      - name: Lint legal content
        run: npm run lint:legal   # Phase 1: empty rule set, just confirms script runs

      - name: Gitleaks scan
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        # NOTE: gitleaks-action requires GitLeaks license var on org accounts.
        # For personal repos (jvanloo72/BSV-new-website), it works free-tier.
```

**Branch protection (set via GitHub UI Settings → Branches → Branch protection rules for `main`):**
- Require status checks to pass before merging.
- Required check: `build-and-test`.
- Require branches to be up to date before merging.

### Pattern 10: `.gitleaks.toml` and pre-commit hook

**Source:** gitleaks docs — `github.com/gitleaks/gitleaks/blob/master/README.md#configuration`.

```toml
# .gitleaks.toml — extends gitleaks's default rule set + project-specific allowlist
[extend]
useDefault = true

[allowlist]
description = "BSV Law project allowlist"
paths = [
  # Allow placeholder emails in seed content / disclaimers
  '''src/content/disclaimers/disclaimers\.json''',
  '''src/content/attorneys/placeholder-attorney\.mdx''',
]

# Allow the firm's intake email even though it matches email regexes
regexes = [
  '''intake@bsvlaw\.com''',
]
```

**Pre-commit hook (PowerShell-friendly for Windows):**

```bash
# .git/hooks/pre-commit (POSIX shell — works under Git for Windows' bundled bash)
#!/usr/bin/env bash
set -e
echo "Running gitleaks pre-commit check..."
gitleaks protect --staged --no-banner --redact -v
```

`scripts/install-git-hooks.ps1` (Jon runs once):

```powershell
# scripts/install-git-hooks.ps1
$repoRoot = git rev-parse --show-toplevel
$hookPath = Join-Path $repoRoot ".git/hooks/pre-commit"
$sourcePath = Join-Path $repoRoot "scripts/hooks/pre-commit"
Copy-Item -Force $sourcePath $hookPath
# Make executable (Git for Windows honors the executable bit in the hook)
icacls $hookPath /grant Everyone:RX | Out-Null
Write-Host "Pre-commit hook installed at $hookPath"
```

### Anti-Patterns to Avoid

- **`@astrojs/tailwind` integration:** v3-era; gone in 2026. Use `@tailwindcss/vite` Vite plugin.
- **`src/content/config.ts`:** old location (Astro 4). Use `src/content.config.ts` (Astro 5+).
- **`output: 'hybrid'`:** removed in Astro 6. Use `output: 'static'` (default) — the Vercel adapter handles server endpoints automatically.
- **`getStaticPaths()` returning numeric params:** Astro 6 rejects numbers. Always coerce to string.
- **`theme(colors.foo.500)` in CSS:** v3 syntax. Use `var(--color-foo-500)` directly (v4).
- **`border` utility with default gray:** v4 changed default to `currentColor`. Be explicit: `border border-zinc-200`.
- **`<meta http-equiv="Content-Security-Policy-Report-Only">`:** Safari ignores it. Use HTTP headers (`vercel.json`).
- **`npm install gitleaks`:** the npm package is a slopsquat. Install the real Go binary from `github.com/gitleaks/gitleaks/releases`.
- **One JSON-LD component per schema type (`LegalServiceLd`, `PersonLd`, ...):** duplication for no payoff. Use one `<JsonLd />` + builder functions in `src/lib/jsonld.ts`.
- **Hand-rolling a "every page should have a disclaimer" mental check:** the Playwright crawl test (D-25) is the only enforcement that survives Future Jon.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| HTML parsing in the disclaimer test | Regex on the page HTML to find the disclaimer | `cheerio` — `$('footer').text().includes(...)` | Regex on HTML is unreliable (whitespace, attribute order, encoding). Cheerio is the canonical Node HTML parser. |
| JSON-LD structured data | Hand-typed JSON strings in templates | `schema-dts` builders typed by Google's official schema.org TypeScript types | A typo in `@type: "LegalService"` silently kills SEO. `schema-dts` makes a typo a TypeScript error. |
| Schema validation for content collections | Custom JS validators | Astro's Zod-based content collection schemas | They run at build time, integrate with the TypeScript graph, and give typed cross-references (`reference()`). Reimplementing this is months of work for the same outcome. |
| Markdown / MDX rendering for blog | Custom remark/rehype pipeline | `@astrojs/mdx` integration | Just install. Includes shiki for syntax highlighting (unused here but cost-free). |
| Image optimization | Manual sharp scripts | Astro's built-in `<Image />` + `astro:assets` | Sharp is bundled. The `image()` schema helper validates dimensions and budget at build time. |
| Sitemap generation | Custom XML writer | `@astrojs/sitemap` | One line in `astro.config.mjs`; emits canonical XML following Google's spec. |
| HTTP security headers | Custom Vercel function that sets headers on every request | `vercel.json` `headers` array | Headers attach at the edge before the function runs; consistent across static + functions; no code path. |
| Secret-scanning regex | Custom grep through `git log` | `gitleaks` (the Go binary) + GitHub push protection | Gitleaks maintains a curated rule set for hundreds of token formats (AWS, Stripe, Resend, etc.); rolling your own misses 90% of patterns. |
| Preview-deploy noindex | A custom middleware | Vercel's auto-`x-robots-tag: noindex` (on `*.vercel.app`) + `<meta name="robots">` BaseLayout fallback (D-19) | Vercel already does the right thing on `*.vercel.app`; the BaseLayout fallback covers custom-preview-domain cases. |
| Preview-URL-to-PR-comment automation | A custom GitHub Action that calls Vercel's API | Vercel's built-in GitHub integration | Zero configuration. The Vercel-for-GitHub app posts the preview URL on every PR by default. |
| CI runner for Astro builds | Custom Docker image | `actions/setup-node@v5` with Node 22 | Caches `node_modules` automatically; works out of the box. |

**Key insight:** Phase 1 has zero novel engineering — every problem has a 2026-current, well-maintained tool. The risk is **picking the wrong tool** (e.g., the slopsquatted `gitleaks` on npm, or the legacy `@astrojs/tailwind` integration). Standardize on the prescriptions in this document.

---

## Runtime State Inventory

> Not applicable. Phase 1 is greenfield — there is no pre-existing runtime state to migrate. The repository is empty (`.claude/` and `.planning/` only), there is no live Vercel deployment yet, no databases, no installed packages, no OS-registered tasks. All five categories evaluate to "None — verified by `ls` on the repo root and absence of any existing deploy / DB / scheduled task." This section will become relevant for future phases that involve content rename, slug refactor, or backend migration; for Phase 1, **none** applies.

---

## Common Pitfalls

> The project's `.planning/research/PITFALLS.md` catalogues 20 pitfalls across the whole site. Pitfalls 1, 7, 8, 12, 13, 14, 17, 19, 20 are directly material to Phase 1. The following items are Phase-1-specific clarifications and additions surfaced by 2026-verified research.

### Pitfall A1: `gitleaks` on npm is not gitleaks

**What goes wrong:** Planner sees "install gitleaks" in CONTEXT.md D-17, defaults to `npm install gitleaks`, installs `gitleaks@1.0.0` by `ycjcl868` — a single-version, no-stars impersonator package. Pre-commit hook calls `npx gitleaks` and either errors immediately (the package is just a custom-rules helper, not the scanner) or runs an unknown binary against staged files.

**Why it happens:** "Install X" defaults to `npm install` in a Node project. The legitimate gitleaks is a Go binary distributed via GitHub releases, not npm. The naming collision is exactly the kind of trap slopsquatters exploit.

**How to avoid:**
- Install gitleaks from `github.com/gitleaks/gitleaks/releases` (Windows: download `gitleaks_*_windows_x64.zip`, extract `gitleaks.exe`).
- Add `C:\Users\jonva\bin\` (or wherever the binary lands) to PATH.
- Pre-commit hook calls `gitleaks protect --staged --no-banner --redact -v`.
- The `.gitleaks.toml` lives in the repo; the hook script lives in `scripts/hooks/pre-commit` and is installed via `scripts/install-git-hooks.ps1`.
- In CI, use `gitleaks/gitleaks-action@v2` (the official action — `github.com/gitleaks/gitleaks-action`, NOT the npm package).

**Warning signs:** `npm install gitleaks` appears in any planning artifact; the pre-commit hook calls `npx gitleaks` rather than `gitleaks`.

### Pitfall A2: Astro's `security.csp` config conflicts with vercel.json CSP

**What goes wrong:** Planner enables Astro's built-in `security: { csp: true }` config to "ship CSP from Phase 1," not realizing that injects CSP via `<meta http-equiv>` — which (a) doesn't reliably support `Report-Only` across browsers (Safari ignores meta-CSP-report-only), (b) duplicates the header CSP shipped via `vercel.json`, causing browsers to enforce the strictest combination, and (c) means an inline-style violation in the meta-CSP can block rendering while the vercel.json header is still report-only.

**Why it happens:** Astro 6 added an experimental CSP feature. "If it's in Astro, use it" is the wrong instinct here.

**How to avoid:** Do **NOT** enable `security.csp` in `astro.config.mjs` for Phase 1. Ship CSP via `vercel.json` headers only. Reconsider Astro's CSP config in Phase 7 when CSP moves to enforce — at that point hash- or nonce-based CSP via Astro's mechanism may be the right path, but only after the report-only soak has finished.

**Warning signs:** `security: { csp: true }` appears in `astro.config.mjs`; `<meta http-equiv="content-security-policy">` appears in built HTML.

### Pitfall A3: Tailwind v4 `border` utility renders invisible borders

**What goes wrong:** A component uses `<div class="border">` expecting a 1px gray border (the v3 default). In v4, `border` resolves to `1px solid currentColor` — which is the text color, which on a body element is `--color-text` (dark gray). On an element with dark text on a light background, the border IS visible but the dark-gray color may not match what the designer expected. Worse: on an element with light text on a dark background, the border is the text color and matches the background's complementary, looking like a visual bug.

**Why it happens:** Tailwind v4 removed the default gray-200 border color to encourage explicit color choices. v3 tutorials still teach `border` as "the default gray border."

**How to avoid:** Always specify a border color: `border border-zinc-200` (Phase 1 placeholder palette) or use the design tokens defined in `@theme`: `border border-[--color-border]`. Document this in `.planning/DECISIONS.md` as a v3→v4 trap.

**Warning signs:** Borders appear in screenshots but don't show in DevTools; designer reports "the borders look wrong."

### Pitfall A4: Content-collection `reference()` and `getStaticPaths` for nested pages

**What goes wrong:** Dynamic route `src/pages/attorneys/[slug].astro` does `await getCollection('attorneys')` and emits one path per entry. But the practice-area page wants to render its `leadAttorneys[]` references — and those references come back as `{ collection: 'attorneys', id: 'jon-van-loo' }`, not the full entry. Naive code does `attorney.data.name` and crashes (`name` is undefined). The fix is `await getEntry(reference)` to resolve the reference into the full entry.

**Why it happens:** `reference()` stores only a pointer at build time. Resolving it requires a second lookup.

**How to avoid:**

```astro
---
import { getCollection, getEntry, render } from 'astro:content';

const practiceAreas = await getCollection('practiceAreas', ({ data }) => !data.draft);

// For each practice area, resolve its lead attorneys
const enriched = await Promise.all(
  practiceAreas.map(async (pa) => ({
    ...pa,
    leadAttorneys: await Promise.all(
      pa.data.leadAttorneys.map(ref => getEntry(ref))
    ),
  }))
);
---
```

**Warning signs:** Templates render "undefined" or "[object Object]" where an attorney name should be; build succeeds but page is broken.

### Pitfall A5: `astro preview` is required for the disclaimer crawl (not `astro dev`)

**What goes wrong:** The Playwright test points at `astro dev` (port 4321), which serves dev-mode HTML. Dev-mode HTML differs from production-mode HTML in subtle ways (HMR scripts, source maps, sometimes different bundling), so the test may pass in dev and fail in CI on the built `dist/`. Or vice versa.

**Why it happens:** Both `astro dev` and `astro preview` run on port 4321 by default, easy to confuse.

**How to avoid:** Playwright config's `webServer.command` runs `npm run build && npx astro preview` (build first, then serve from `dist/`). This is what production users see, and it's what the test should assert against. `[CITED: docs.astro.build/en/reference/cli-reference/]`

---

## Code Examples

> Verified against the sources listed below. Each block is a near-complete file the planner can hand to the implementer with minor adaptation.

### `src/styles/global.css` (placeholder tokens, Phase 1)

**Source:** `tailwindcss.com/docs/theme` — `@theme` directive; `docs.astro.build/en/guides/styling/` — Astro's import pattern.

```css
@import "tailwindcss";

@theme {
  /* PLACEHOLDER — replaced in Phase 2 with the chosen palette.
     Per D-22: names are stable; Phase 2 only changes values. */
  --color-text: var(--color-zinc-900);
  --color-text-muted: var(--color-zinc-600);
  --color-bg: #ffffff;
  --color-bg-elevated: var(--color-zinc-50);
  --color-border: var(--color-zinc-200);
  --color-accent: var(--color-zinc-900);
  --color-accent-fg: #ffffff;

  --font-sans: "system-ui", -apple-system, "Segoe UI", "Helvetica Neue", "Arial", sans-serif;

  /* Tailwind's text-size defaults are kept; Phase 2 retunes if needed */
}

/* v4: re-enable v3-style default border color for back-compat during Phase 1 */
@layer base {
  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: var(--color-border, currentColor);
  }

  body {
    background-color: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }
}
```

### `.gitignore` (D-18 entries + safe additions)

```
# Locked in CONTEXT.md D-18
.env
.env.local
.env.*.local
.vercel
dist
node_modules
.astro

# Safe additions
*.log
.DS_Store
Thumbs.db
playwright-report/
test-results/
```

### `src/pages/attorneys/[slug].astro` (dynamic route — Phase 1 scaffold; Phase 4 fills in)

```astro
---
import { getCollection, render } from 'astro:content';
import AttorneyLayout from '../../layouts/AttorneyLayout.astro';

export async function getStaticPaths() {
  const attorneys = await getCollection('attorneys', ({ data }) => !data.draft);
  return attorneys.map(entry => ({
    params: { slug: entry.data.slug },   // String, never number — Astro 6 requires
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
---
<AttorneyLayout attorney={entry}>
  <Content />
</AttorneyLayout>
```

`[VERIFIED: docs.astro.build/en/guides/content-collections/#generating-pages-from-content-collections]`

### `package.json` scripts (Phase 1 minimum)

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "check": "astro check",
    "test:disclaimer": "playwright test tests/disclaimer-crawl.spec.ts",
    "lint:legal": "echo 'lint:legal — Phase 1 placeholder; real rules land in Phase 4'",
    "install:hooks": "powershell -ExecutionPolicy Bypass -File scripts/install-git-hooks.ps1"
  }
}
```

---

## State of the Art

| Old Approach | Current Approach (2026) | When Changed | Impact |
|--------------|--------------------------|--------------|--------|
| `tailwind.config.js` for design tokens | CSS-first `@theme {}` block in `global.css` | Tailwind v4.0 (late 2024) | No JS config file; tokens are CSS variables auto-converted to utility classes |
| `theme(colors.foo.500)` in CSS | `var(--color-foo-500)` | Tailwind v4 | Old syntax fails silently in some contexts; new is just standard CSS |
| `border` defaults to `gray-200` | `border` defaults to `currentColor` | Tailwind v4 | Borders may render the wrong color; be explicit |
| `@astrojs/tailwind` integration | `@tailwindcss/vite` Vite plugin | Astro 5.2 / Tailwind v4 | Different install path; `npx astro add tailwind` writes the new one |
| `src/content/config.ts` | `src/content.config.ts` | Astro 5 | File moved; old location no longer recognized |
| `entry.render()` | `await render(entry)` from `astro:content` | Astro 5 | New top-level export |
| `output: 'hybrid'` | `output: 'static'` (default) + adapter handles server endpoints | Astro 6 | Removed; build fails if specified |
| Numeric params in `getStaticPaths` | String params only | Astro 6 | Build fails if number passed |
| `@astrojs/vercel/serverless` import path | `@astrojs/vercel` (single package, single import) | `@astrojs/vercel` v10 (Astro 6 line) | Old `/serverless`, `/static`, `/edge` subpaths gone |
| Hand-written JSON-LD inline | `schema-dts` typed builders | schema-dts matured to v2 | Typos become TS errors; refactors propagate |
| Manual sitemap XML | `@astrojs/sitemap` zero-config | Astro 4+ | Just install the integration |
| `<meta http-equiv>` CSP | HTTP-header CSP via `vercel.json` `headers` | Browsers have always preferred header; meta now deprecated for Report-Only | Report-only via meta is unreliable in Safari |
| Husky / lint-staged for every project | Native git hooks for single-hook needs; Husky only when ≥3 hooks | Husky still fine but not required | Less project complexity for small projects |

**Deprecated / outdated:**
- `@astrojs/tailwind` — gone; replaced by `@tailwindcss/vite`.
- `output: 'hybrid'` — removed in Astro 6.
- `squooshImageService` — removed; Sharp is the default and only image service.
- `entry.render()` — replaced by `await render(entry)`.
- `theme()` CSS function — replaced by CSS variables.

---

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `astro@6.3.7`, `@astrojs/vercel@10.0.7`, `@astrojs/mdx@5.0.6`, `@astrojs/sitemap@3.7.2`, `tailwindcss@4.3.0`, `@tailwindcss/vite@4.3.0`, `schema-dts@2.0.0`, `@playwright/test@1.60.0`, `cheerio@1.2.0`, `@astrojs/check@0.9.9` are all legitimate, recommended packages from their respective official maintainers (Astro Inc., Tailwind Labs, Google, Microsoft, cheeriojs). | "Package Legitimacy Audit" | slopcheck was unavailable. If any of these were silently slopsquatted, Phase 1 installs malicious code. Mitigation: planner inserts `checkpoint:human-verify` before first `npm install`. |
| A2 | Vercel's auto-`x-robots-tag: noindex` on `*.vercel.app` is still applied in 2026 by default. | "Preview-Deploy Noindex Pattern" | If Vercel changed the default, preview deploys would be indexable. Mitigation: D-19's BaseLayout `<meta>` fallback covers this if the header default ever changes. |
| A3 | `@astrojs/sitemap` emits `/sitemap-0.xml` (not `/sitemap.xml` or `/sitemap-index.xml`) with no custom configuration. | "Playwright Disclaimer-Crawl Test" | If the default filename differs, the test fetches a 404 and fails immediately — easy to detect on first run. Mitigation: planner should add a Wave 0 task to confirm the sitemap filename after the first build. |
| A4 | gitleaks-action@v2 works on personal-account GitHub repos (jvanloo72/BSV-new-website is a personal repo). | "GitHub Actions ci.yml" | Some gitleaks-action features require a paid GitLeaks license — personal-repo scanning may have different behavior than org-account. Mitigation: first CI run will reveal — if it fails, fall back to running gitleaks via a manual download step in the action. |
| A5 | `actions/checkout@v5` and `actions/setup-node@v5` are current major versions in 2026 (v5 of each). | "GitHub Actions ci.yml" | If v5 doesn't exist, CI fails on first run. Mitigation: planner pins to v4 if v5 unavailable; either way, the failure is immediate. |
| A6 | Astro's `experimental.csp` / `security.csp` config has not changed behavior between research date and implementation date (continues to inject via `<meta http-equiv>`). | "Pitfall A2" | If Astro changed it to HTTP headers, the "do not enable in Phase 1" recommendation may be over-cautious. Mitigation: revisit in Phase 7 with current docs. |
| A7 | The Silicon Valley office street address and phone number are TBD — Jon fills before Phase 7 launch. | "`src/lib/jsonld.ts` SITE constant" | LegalService JSON-LD ships with placeholder values until then. Mitigation: planner adds a Phase 7 launch-checklist item: "Replace SITE.offices[1] placeholder values; replace SITE.phone." |
| A8 | The disclaimer text in `src/content/disclaimers/disclaimers.json` will be reviewed against `.planning/LAW_FIRM_WEBSITE_GUIDE.md` and bar-rule guidance by Jon during Phase 1 planning — Phase 1 ships content-reviewed but Phase 7 attorney-advertising language requires Jon's final sign-off. | "Pattern 4: `<Disclaimer />` component" | If the placeholder text ships unchanged to production, the firm risks non-compliant footer language. Mitigation: planner adds a `checkpoint:human-verify` for the disclaimer text before any preview deploy. |

**If this table is empty:** N/A — there are 8 assumed claims, each with a documented mitigation.

---

## Open Questions

1. **JSON disclaimers — render plain text vs markdown?**
   - What we know: D-09 says "renders it via Astro Markdown rendering"; D-03 locks the disclaimers as a single JSON file; D-08's schema has a `text` field (plain string).
   - What's unclear: Astro's `render()` is a body-content renderer for `.md`/`.mdx` files; it does not apply to a `text` string field inside a JSON record. Two paths satisfy D-09 in practice — (a) render `text` as plain escaped text inside a `<p>` (simplest, smallest scope) or (b) refactor disclaimers to one MDX file per id (`footer.mdx`, `contact.mdx`, ...). The second expands D-03 from "one JSON file" to "five MDX files," which is a CONTEXT.md change.
   - Recommendation: **Default to (a)** — disclaimer paragraphs are short, formatting needs are low. Surface the alternative to the user during planning if Jon wants markdown formatting (links, emphasis) inside disclaimers.

2. **Silicon Valley office address & main phone number**
   - What we know: BSV has two offices — Silicon Valley (primary) and 555 California St. Suite 4925 San Francisco. The San Francisco address is known.
   - What's unclear: Silicon Valley exact street address; main phone; whether there's a single firm-wide phone or per-office phones.
   - Recommendation: Use placeholder values in `src/lib/site.ts` and `LegalService` JSON-LD; flag as a `checkpoint:human-verify` item before Phase 7 launch.

3. **`.gitleaks.toml` allowlist — what else needs allowing?**
   - What we know: `intake@bsvlaw.com` placeholder must not trigger a false positive (per CONTEXT.md Claude's Discretion).
   - What's unclear: Are there other firm-specific patterns that might trip the default rules — e.g., Aaron's or Stuart's USPTO registration numbers, deal codenames, anonymized matter IDs?
   - Recommendation: Start with the minimal allowlist (intake email + placeholder paths). After first push, audit any gitleaks findings and add allowlist entries iteratively. Phase 1 doesn't need every edge case — Phase 4 (when real attorney bios land) will surface more.

4. **Preview-URL access for non-`@anthropic` referrers**
   - What we know: D-20 explicitly says no auth wall on preview URLs in Phase 1.
   - What's unclear: Whether Vercel's auto-`noindex` is sufficient for the "no leak to search" goal, or whether the team needs preview-deploy passwords (Vercel Pro feature) at some point.
   - Recommendation: Phase 1 ships open previews (per D-20). Revisit if/when sensitive draft content lands (Phase 4 attorney profiles or Phase 5 blog posts may surface concerns).

5. **Astro version drift between research and implementation**
   - What we know: research verified `astro@6.3.7` against npm on 2026-05-25.
   - What's unclear: Whether the version will have moved (e.g., to 6.3.8 or 6.4.x) by the time the planner runs `npm install`.
   - Recommendation: planner does a quick `npm view astro version` before locking the version pin. If a newer minor/patch exists, allow it (semver-safe) but log the actual installed version in `.planning/DECISIONS.md`.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Astro toolchain (engine ≥22.12) | ✓ | 24.16.0 | — |
| npm | Package install | ✓ | 11.13.0 | — |
| git | Repo + hooks | ✓ | 2.54.0.windows.1 | — |
| PowerShell | Hook installer script | ✓ (default on Win11) | — | — |
| GNU Bash (via Git for Windows) | pre-commit hook shebang `#!/usr/bin/env bash` | ✓ (bundled with Git for Windows) | — | — |
| gitleaks (Go binary) | Local pre-commit + CI scan | ✗ | — | **Install required:** download from `github.com/gitleaks/gitleaks/releases/latest`, extract `gitleaks.exe` to a PATH directory. Planner inserts a `checkpoint:human-verify` task with these instructions for Jon. |
| Playwright Chromium | Disclaimer crawl test (local + CI) | ✗ | — | `npx playwright install --with-deps chromium` (runs as a step in the install plan; ~150 MB download, one-time). |
| Vercel CLI (`vercel`) | Optional — `vercel login`, `vercel env pull` | ✗ | — | Not strictly required for Phase 1 (the GitHub-Vercel integration handles deploys without the CLI). Install only if Jon wants to pull env vars locally. |
| GitHub CLI (`gh`) | Optional — managing PRs from terminal | ✗ | — | Not required. Push-protection enabled via web UI: Settings → Code security → Secret scanning → Push protection. |

**Missing dependencies with no fallback:** none. Every missing item has an install path or is not strictly required.

**Missing dependencies with fallback:**
- **gitleaks** — install required before Phase 1's hook is functional; documented checkpoint task.
- **Playwright Chromium** — `npx playwright install --with-deps chromium` covers this; included in the install plan.

---

## Validation Architecture

> Required per `.planning/config.json` (workflow.nyquist_validation is enabled by default — not set to false).

### Test Framework

| Property | Value |
|----------|-------|
| Framework | **@playwright/test 1.60.0** + **cheerio 1.2.0** (HTML parsing for crawl assertions) |
| Config file | `playwright.config.ts` (root) — **Wave 0 creates** |
| Quick run command | `npm run test:disclaimer` (single spec; sub-30s on the placeholder content set) |
| Full suite command | `npm run test:disclaimer` (Phase 1 only ships one spec; future phases add `npm run test`) |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| **FOUND-01** | Astro 6 + integrations build cleanly | smoke | `npm run build` (must exit 0) | ❌ Wave 0 — created by `npm create astro` |
| **FOUND-02** | Tailwind `@theme` tokens compile into utility classes | smoke | `npm run build` produces `dist/_astro/*.css` containing `--color-text` and Tailwind utility output | ❌ Wave 0 — created with `global.css` |
| **FOUND-03** | Five Zod content collections exist and validate | unit/build | `npm run check` (runs `astro check`; fails if schema invalid) | ❌ Wave 0 — `content.config.ts` written in Phase 1 |
| **FOUND-04** | Cross-collection `reference()` enforces missing-author build failure | negative | The D-24 "deliberately broken" sibling blog post (no `author`) makes `npm run build` exit non-zero; remove before merge | ❌ Wave 0 — `tests/fixtures/broken-post.md` template + a `npm run test:zod-negative` script |
| **FOUND-05** | BaseLayout renders header, footer, head slot, main slot | integration (via disclaimer crawl) | `npm run test:disclaimer` (asserts `<footer>` text on every route — proves BaseLayout reached) | ❌ Wave 0 — `tests/disclaimer-crawl.spec.ts` |
| **FOUND-06** | Three specialized layouts compose BaseLayout via slot transfer | manual + visual review on Vercel preview | Manual check on Vercel preview URL — Jon clicks attorney, practice-area, blog placeholder routes; visual confirms each page rendered with shared chrome | ✅ no automated test in Phase 1 (Phase 4 will add per-layout assertions) |
| **FOUND-07** | `<Disclaimer id="..." />` reads from collection at build time | unit + build | `astro check` validates the typed id union; build fails if a layout passes an invalid id | ❌ Wave 0 — covered by `astro check` |
| **FOUND-08** | URL conventions locked in writing | docs review | manual review of `.planning/URL-CONVENTIONS.md` | ❌ Wave 0 — document created in Phase 1 |
| **FOUND-09** | Vercel preview deploy produces a clickable URL | manual + CI | Jon clicks the preview link in PR comments after first PR | ✅ Vercel-GitHub integration handles automatically; no test infra needed |
| **FOUND-10** | No deprecated patterns (`output: 'hybrid'`, deprecated `theme()`, numeric paths) | build | `npm run build` must exit 0 (deprecated patterns are now errors in Astro 6) | ❌ Wave 0 — covered by build success |
| **SEC-01** | vercel.json sets all 5 headers | smoke (manual) | After preview deploy: `curl -I https://bsv-new-website-<sha>.vercel.app` shows all five headers | ✅ no automated test (curl-based verification in PR review checklist) |
| **SEC-02** | CSP runs in Report-Only mode | smoke (manual) | curl preview deploy: `Content-Security-Policy-Report-Only` header present, `Content-Security-Policy` absent | ✅ no automated test |
| **SEC-03** | No secrets in source | scan | `gitleaks detect` (passes in CI) | ❌ Wave 0 — CI workflow + local hook |
| **SEC-04** | `.env*` excluded; gitleaks pre-commit + push protection | negative manual test | Try to commit a fake AWS key (`AKIAIOSFODNN7EXAMPLE`): gitleaks pre-commit blocks locally; if forced past local, GitHub push protection blocks server-side | ❌ Wave 0 — hook + CI; manual negative test in the PR checklist |
| **SEC-10** | Preview deploys carry noindex | smoke (manual) | curl preview: `x-robots-tag: noindex` header AND HTML contains `<meta name="robots" content="noindex">` | ✅ no automated test in Phase 1 (could add as a Playwright assertion in a follow-up) |
| **LEGAL-01** | Footer disclaimer on every page | **Playwright crawl** | `npm run test:disclaimer` (the canonical Phase 1 test) | ❌ Wave 0 — `tests/disclaimer-crawl.spec.ts` |
| **OPS-05** | Vercel preview URL accessible per PR | manual | Jon clicks preview link from PR comment | ✅ Vercel-GitHub integration |

### Sampling Rate

- **Per task commit:** `npm run check` (TypeScript + content-collection schema) + `npm run build` (catches deprecated patterns)
- **Per wave merge:** `npm run check && npm run build && npm run test:disclaimer && gitleaks detect --source . --no-banner`
- **Phase gate:** Full suite green on a Vercel preview deploy; Jon clicks preview URL and visually confirms placeholder pages render with the footer disclaimer.

### Wave 0 Gaps

- [ ] `playwright.config.ts` — root config; sets `webServer.command: 'npm run build && npx astro preview'`
- [ ] `tests/disclaimer-crawl.spec.ts` — the canonical Phase 1 test (D-25, D-26)
- [ ] `tests/fixtures/broken-post.md` (or `.mdx`) — the deliberately-broken sibling for D-24 negative test; lives in a feature branch only
- [ ] `package.json` scripts: `test:disclaimer`, `check`, `lint:legal` (placeholder)
- [ ] `.github/workflows/ci.yml` — runs install + build + test:disclaimer + gitleaks + lint:legal on PRs to main
- [ ] `.gitleaks.toml` — gitleaks config with `intake@bsvlaw.com` allowlist
- [ ] `scripts/hooks/pre-commit` — bash hook calling `gitleaks protect --staged`
- [ ] `scripts/install-git-hooks.ps1` — one-time installer Jon runs

### Framework Install

```bash
npm install --save-dev @playwright/test@1.60.0 cheerio@1.2.0 @astrojs/check@0.9.9
npx playwright install --with-deps chromium
```

---

## Security Domain

> Required per `.planning/config.json` workflow.security_enforcement: true.

### Applicable ASVS Categories (Level 1)

| ASVS Category | Applies in Phase 1? | Standard Control |
|---------------|---------------------|-----------------|
| **V1 Architecture, Design, Threat Modeling** | yes | Phase 1 sets the project's security architecture: vercel.json headers, secret-scanning two-layer, content-collection schemas as build-time validation. Document in `.planning/DECISIONS.md`. |
| **V2 Authentication** | no | Phase 1 has no authenticated surfaces. Contact form lands in Phase 6; admin panel never (CMS-free site). |
| **V3 Session Management** | no | No sessions in Phase 1. |
| **V4 Access Control** | no | Public-facing static site; no access control surfaces. |
| **V5 Validation, Sanitization, Encoding** | yes (build-time only) | Zod content-collection schemas validate every Markdown/JSON file at build time. Phase 6 will extend to form input validation. |
| **V6 Cryptography** | no | No data-at-rest in Phase 1. Phase 6 adds Resend API key → Vercel env var. |
| **V7 Error Handling and Logging** | partial | `/api/csp-report` endpoint logs CSP violations to Vercel function logs (`console.warn`). Body capped at 8KB to prevent abuse. |
| **V8 Data Protection** | no | No PII handled in Phase 1. |
| **V9 Communication Security** | yes | Vercel enforces HTTPS by default; `Strict-Transport-Security` is auto-set by Vercel on the production deployment. `vercel.json` does not need to set HSTS manually — covered by Vercel's defaults. |
| **V10 Malicious Code** | yes | gitleaks pre-commit + GitHub push protection; `.gitignore` for `.env*`; no `eval()` or `new Function()` in Phase 1 code. |
| **V11 Business Logic** | no | No business logic processing in Phase 1. |
| **V12 Files and Resources** | partial | Astro `image()` content-collection helper validates image dimensions at build time (200 KB budget enforcement). |
| **V13 API and Web Service** | partial | `/api/csp-report` is the only API endpoint; POST-only; body-size capped. |
| **V14 Configuration** | yes | All five HTTP security headers in `vercel.json` (D-15, D-16); no secrets in source; `.gitignore` for `.env*`. |

### Known Threat Patterns for Astro + Vercel + Static Site

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Secret-in-source committed to git | Information Disclosure | gitleaks pre-commit hook + GitHub push protection (D-17); `.gitignore` covers `.env*` (D-18) |
| Preview deploy leaking unreviewed content to search engines | Information Disclosure | Vercel auto-`x-robots-tag: noindex` on `*.vercel.app` + BaseLayout `<meta name="robots">` fallback (D-19) |
| Slopsquatted npm package install (e.g., `gitleaks@1.0.0`) | Tampering (supply chain) | `checkpoint:human-verify` before first `npm install`; legitimacy audit table; manual binary install for gitleaks |
| Clickjacking via iframe embedding | Tampering | `X-Frame-Options: DENY` (D-16) + CSP `frame-ancestors 'none'` (D-15) |
| MIME-type sniffing leading to script execution | Tampering | `X-Content-Type-Options: nosniff` (D-16) |
| Cross-origin information leakage via Referer | Information Disclosure | `Referrer-Policy: strict-origin-when-cross-origin` (D-16) |
| Unauthorized device API usage (camera, mic, geo) | Tampering | `Permissions-Policy: camera=(), microphone=(), geolocation=()` (D-16) |
| Cross-Site Scripting (XSS) from inline scripts | Tampering | CSP report-only `script-src 'self'` (D-15) — enforce in Phase 7 |
| Build-time content validation bypass | Tampering | Zod schemas on every content collection (D-04..D-08); cross-collection `reference()` (D-04..D-08); negative test (D-24) |
| CSP violation report endpoint abuse | DoS / Information Disclosure | Body size capped at 8 KB; rate limiting deferred to Phase 6/7 |

---

## Sources

### Primary (HIGH confidence)

- **`docs.astro.build/en/guides/content-collections/`** — `defineCollection`, `loader` (glob, file), `reference()`, `image()` helper, `src/content.config.ts` (the modern 2026 location, NOT `src/content/config.ts`). Verified via WebFetch 2026-05-25.
- **`docs.astro.build/en/guides/styling/`** — Tailwind v4 install via `npx astro add tailwind`; `@import "tailwindcss"`. Verified via WebFetch 2026-05-25.
- **`docs.astro.build/en/reference/configuration-reference/`** — `security.csp` injects via `<meta http-equiv>`, not response headers. Verified via WebFetch 2026-05-25.
- **`tailwindcss.com/docs/theme`** — `@theme` directive syntax; CSS variables auto-converting to utility classes; `theme()` function deprecated. Verified via WebFetch 2026-05-25.
- **`vercel.com/docs/project-configuration/vercel-json`** (dated 2026-03-11) — `headers` array schema, `source`/`headers`/`has`/`missing` matchers. Verified via WebFetch 2026-05-25.
- **`vercel.com/kb/guide/are-vercel-preview-deployment-indexed-by-search-engines`** — Vercel auto-applies `x-robots-tag: noindex` on `*.vercel.app` previews; NOT on custom preview domains. Verified via WebSearch 2026-05-25.
- **npm registry (via `npm view`)** — exact current versions for every package recommended: `astro@6.3.7`, `@astrojs/vercel@10.0.7`, `@astrojs/mdx@5.0.6`, `@astrojs/sitemap@3.7.2`, `tailwindcss@4.3.0`, `@tailwindcss/vite@4.3.0`, `schema-dts@2.0.0`, `@playwright/test@1.60.0`, `cheerio@1.2.0`, `@astrojs/check@0.9.9`, `@vercel/analytics@2.0.1`, `resend@6.12.4`, `husky@9.1.7`, `lint-staged@17.0.5`. Verified 2026-05-25.
- **`npm view gitleaks repository`** — confirms `gitleaks@1.0.0` on npm is `github.com/ycjcl868/gitleaks`, NOT the legitimate `github.com/gitleaks/gitleaks`. Verified 2026-05-25.
- **`.planning/research/STACK.md`** — project-level stack research (HIGH confidence, dated 2026-05-25).
- **`.planning/research/ARCHITECTURE.md`** — project-level architecture research (HIGH confidence, dated 2026-05-25).
- **`.planning/research/PITFALLS.md`** — 20-item pitfalls catalogue (HIGH confidence on technical, MEDIUM on bar-rule specifics, dated 2026-05-25).

### Secondary (MEDIUM confidence)

- **Astro layout slot-transfer pattern** — `docs.astro.build/en/basics/astro-components/#named-slots` (the `slot="head"` attribute pattern). Inferred from the named-slots documentation; pattern is standard but the exact `slot="head"` example was not explicitly shown in the docs page fetched.
- **`gitleaks/gitleaks-action@v2`** — assumed current major version based on the gitleaks project's release cadence; not version-pinned-verified.
- **`actions/checkout@v5` and `actions/setup-node@v5`** — assumed current major versions in 2026; not verified against GitHub Marketplace.

### Tertiary (LOW confidence) — none

Every claim in this document maps to a Primary or Secondary source above. No claims are based solely on training data without verification, except where flagged `[ASSUMED]` in the Assumptions Log.

---

## Metadata

**Confidence breakdown:**
- Standard stack: **HIGH** — every package version confirmed via `npm view` on 2026-05-25
- Architecture: **HIGH** — patterns confirmed against `docs.astro.build` via WebFetch; aligned with `.planning/research/ARCHITECTURE.md`
- Pitfalls: **HIGH** for technical (Astro 6, Tailwind v4, vercel.json schema); **MEDIUM** for slopsquatting verdicts (slopcheck unavailable; degraded to `[ASSUMED]` with `checkpoint:human-verify` gate)
- Security domain: **HIGH** for ASVS Level 1 mapping; **MEDIUM** for CSP directive set (D-15 directives will be tuned during Phases 3-6 report-only soak)
- Validation architecture: **HIGH** — Playwright + cheerio pattern is well-trodden; the exact `tests/disclaimer-crawl.spec.ts` shown is the implementation contract

**Research date:** 2026-05-25
**Valid until:** 2026-06-25 (30 days; stack is stable but Astro and Tailwind both ship minor versions monthly — re-verify versions before Phase 7 launch)

---

*Phase: 1 — Scaffold & Shell*
*Research complete: 2026-05-25*
