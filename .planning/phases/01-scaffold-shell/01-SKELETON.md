---
phase: 1
slug: scaffold-shell
type: walking-skeleton
created: 2026-05-25
---

# Phase 1 Walking Skeleton — BSV Law Website

The Walking Skeleton is the thinnest possible end-to-end pipeline that proves the
locked tech stack works as one cohesive system. Everything in subsequent plans
layers on top of these decisions without renegotiating them.

---

## What "Walking" Means

After Plan 01 completes, Jon can:

1. Open a pull request on `jvanloo72/BSV-new-website`.
2. See a Vercel preview comment appear automatically on the PR.
3. Click the preview URL.
4. See a real BSV homepage shell — firm name in the header, a `<main>` placeholder, the canonical site-wide footer disclaimer at the bottom.
5. Confirm the page reaches the browser via Vercel's CDN, served as static HTML from `dist/`.

Nothing else needs to work yet. No blog, no JSON-LD, no specialized layouts, no CSP-report endpoint. Those land in later plans.

---

## Locked Architectural Decisions (Skeleton Surface)

These decisions are made once during the Walking Skeleton and inherited by every later phase. Renegotiating them later would require a phase-split conversation with Jon.

### Framework
- **Astro 6.3.7** — locked in `.claude/CLAUDE.md`; scaffolded via `npm create astro@latest -- --template minimal --typescript strict`.
- **TypeScript strict mode** — chosen at scaffold time so content collection schemas catch errors at build time.
- **Static output** — `output: 'static'` (the Astro 6 default). The Vercel adapter handles the one `/api/csp-report` function added in Plan 06.

### Build & Deploy
- **`@astrojs/vercel@10.0.7`** — the Astro 6 line of the Vercel adapter (NOT 9.x, which is Astro 5).
- **Vercel-for-GitHub integration** — every PR auto-produces a `*.vercel.app` preview URL. No manual `vercel deploy` step required.
- **`x-robots-tag: noindex` on previews** — Vercel auto-applies this on `*.vercel.app` URLs (verified per RESEARCH.md §"Preview-Deploy Noindex Pattern"). Plan 03's BaseLayout adds the `<meta name="robots">` fallback for any future custom-preview domain.

### Content
- **Astro Content Collections + Zod** — content lives in `src/content/<collection>/` directories; schemas live in `src/content.config.ts` (the Astro 5+ location, NOT `src/content/config.ts`).
- **Authoring formats:** MDX for `attorneys`, `practiceAreas`, `blog`, `testimonials`; JSON for `disclaimers` (per D-01..D-03).
- **One disclaimer JSON file** keyed by id (`footer`, `contact`, `blog`, `practice-area`, `attorney`) — per D-03. Renders as plain text inside a `<p>` (Option A from RESEARCH.md §"Open Implementation Question").

### Styling
- **Tailwind CSS v4.3.0** wired via `@tailwindcss/vite@4.3.0` Vite plugin (NOT the legacy `@astrojs/tailwind` integration).
- **`@theme {}` block in `src/styles/global.css`** — CSS-first config; no `tailwind.config.js`.
- **Placeholder zinc palette** — `--color-text`, `--color-text-muted`, `--color-bg`, `--color-bg-elevated`, `--color-border`, `--color-accent`, `--color-accent-fg`. Token names are stable across the Phase 2 palette swap (D-22).

### Routing
- **`trailingSlash: 'never'`** — every URL is canonical without a trailing `/`. Locked in `astro.config.mjs`.
- **Slug formats locked:**
  - Attorneys: `first-last` lowercase hyphenated (`aaron-belcher`, `stuart-smolen`, `jon-van-loo`, `iris-zhang`, `susan-jiang`) (D-11).
  - Practice areas: `mergers-acquisitions`, `intellectual-property-technology-transactions`, `tax` (D-12).
  - Blog: `kebab-case` from title, locked at first publish, never renamed (D-13).
- **`src/pages/<route>.astro`** is the page surface; dynamic routes use `[slug].astro` and `getStaticPaths()`.

### Layout
- **Single `BaseLayout.astro`** is the integration point — every page imports it directly or through a specialized layout. Renders site header, site footer (with `<Disclaimer id="footer" />`), `<head>` SEO defaults, and a named `head` slot for per-page additions.
- **Three specialized layouts** (`AttorneyLayout`, `PracticeAreaLayout`, `BlogPostLayout`) wrap `BaseLayout` via slot transfer — they don't bypass it.

### Security Baseline
- **`vercel.json` ships all five required HTTP security headers from Phase 1.** CSP is in `Content-Security-Policy-Report-Only` mode (D-15); soak runs through Phases 3–6; enforcement lands in Phase 7.
- **Secret-scanning is two-layered:** gitleaks pre-commit hook locally + GitHub push protection server-side (D-17).
- **`.gitignore` excludes `.env`, `.env.local`, `.env.*.local`, `.vercel`, `dist`, `node_modules`, `.astro` from the first commit** (D-18).

### Test Infrastructure
- **Playwright 1.60.x + Cheerio 1.2.0** — drives the disclaimer crawl test that walks the sitemap and asserts the footer disclaimer renders on every route.
- **GitHub Actions** runs `npm install → astro build → npm run test:disclaimer → gitleaks → npm run lint:legal` on every PR (D-31).
- **Branch protection on `main`** — required check is the CI workflow.

---

## Directory Layout (Walking Skeleton)

By the end of Plan 01, the repo looks like:

```
BSV-website/
├── astro.config.mjs           # Astro + integrations + Vercel adapter + Tailwind plugin
├── tsconfig.json              # Astro template default
├── package.json               # Pinned versions per RESEARCH.md Installation Plan
├── package-lock.json
├── vercel.json                # Five security headers + CSP report-only
├── .gitignore                 # D-18 entries
├── public/
│   └── favicon.svg            # Placeholder
├── src/
│   ├── styles/
│   │   └── global.css         # Tailwind @theme placeholder tokens
│   ├── content.config.ts      # Disclaimers collection only (Plan 02 adds the other four)
│   ├── content/
│   │   └── disclaimers/
│   │       └── disclaimers.json  # All five real disclaimer ids
│   ├── components/
│   │   ├── chrome/
│   │   │   ├── SiteHeader.astro       # Firm name + nav
│   │   │   └── SiteFooter.astro       # Disclaimer + locations + copyright
│   │   └── legal/
│   │       └── Disclaimer.astro       # Typed-id-union; reads disclaimers collection
│   ├── layouts/
│   │   └── BaseLayout.astro
│   └── pages/
│       └── index.astro                # Single `<h1>` + paragraph rendered via BaseLayout
└── .planning/                          # (existing)
```

Subsequent plans expand this layout. Nothing here gets removed or renamed.

---

## What's NOT In The Skeleton

These are explicitly deferred and addressed in later plans:

| Concern | Lands In |
|---------|---------|
| The other four content collections (`attorneys`, `practiceAreas`, `blog`, `testimonials`) | Plan 02 |
| Specialized layouts (`AttorneyLayout`, `PracticeAreaLayout`, `BlogPostLayout`) | Plan 03 |
| `<JsonLd />` component + `src/lib/jsonld.ts` (LegalService schema) | Plan 03 |
| `<SeoHead />` component + meta defaults | Plan 03 |
| Additional placeholder routes (`/about`, `/practice-areas`, `/attorneys`, `/blog`, `/contact`, `/404`, `/500`) | Plan 04 |
| `<SkipToContent />` accessibility component | Plan 04 |
| URL conventions documentation (`.planning/URL-CONVENTIONS.md`) | Plan 05 |
| Refined `vercel.json` headers (final CSP directives + `X-Robots-Tag` per-environment) | Plan 06 |
| `/api/csp-report` endpoint | Plan 06 |
| gitleaks Go binary install + pre-commit hook | Plan 06 |
| GitHub push protection (manual setup) | Plan 06 |
| Disclaimer crawl Playwright test implementation | Plan 07 |
| GitHub Actions CI workflow | Plan 07 |
| Final Vercel preview verification + Phase 1 sign-off | Plan 08 |

---

## Verification (End of Plan 01)

The Walking Skeleton is "walking" when:

- `npm run build` exits 0 and produces a `dist/index.html`.
- `dist/index.html` contains the firm name, a `<main>` placeholder, and the canonical footer disclaimer text.
- A PR opened on `jvanloo72/BSV-new-website` produces a Vercel preview URL.
- Jon clicks the preview URL and visually confirms the homepage shell renders.

---

*Walking Skeleton documented: 2026-05-25*
*Phase 1 — Scaffold & Shell*
