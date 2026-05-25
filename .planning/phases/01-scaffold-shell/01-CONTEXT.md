# Phase 1: Scaffold & Shell - Context

**Gathered:** 2026-05-25
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the **safe foundation every later phase depends on**: an Astro 6 project scaffolded with the locked stack (Tailwind v4, MDX, Vercel adapter, sitemap), five Zod-typed content collections, a `BaseLayout` with header / footer / site-wide disclaimer / SEO + JSON-LD slots, URL conventions locked in writing, a security baseline (`vercel.json` headers, gitleaks, `.gitignore`), and a verified Vercel preview-deploy workflow. By the end of Phase 1, Jon can open a preview URL produced from a pull request and see a working (if visually unfinished) BSV site shell with the footer disclaimer rendering on every route.

**In scope:**
- Astro 6 + Tailwind v4 + MDX + Vercel adapter + sitemap project scaffold
- Five Zod-typed content collections (`attorneys`, `practiceAreas`, `blog`, `testimonials`, `disclaimers`) with cross-collection `reference()` typing
- `BaseLayout.astro` and three specialized layouts (`AttorneyLayout`, `PracticeAreaLayout`, `BlogPostLayout`)
- `<Disclaimer id="..." />` component reading from the `disclaimers` collection
- URL conventions locked in `.planning/URL-CONVENTIONS.md`
- `vercel.json` with security headers (CSP report-only, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- `.gitignore` for `.env*`, gitleaks pre-commit hook, GitHub push protection
- Vercel preview deploy workflow verified end-to-end
- Playwright test that asserts the footer disclaimer renders on every route
- One placeholder content file per collection (proves the schema + dynamic routing works)

**Out of scope (later phases):**
- Visual design (Phase 2) — Phase 1 ships neutral placeholder tokens only
- Real content (Phases 3-5) — Phase 1 uses placeholders
- Contact form (Phase 6) — Phase 1 ships a `/contact` page shell only
- CSP enforcement (Phase 7) — Phase 1 ships CSP in report-only mode

</domain>

<decisions>
## Implementation Decisions

### Content Authoring Formats
- **D-01:** `attorneys`, `practiceAreas`, `blog` use **MDX** files so the disclaimer component, callouts, and pull-quotes can be inlined inside prose without breaking the schema.
- **D-02:** `testimonials` use **MDX** so a quote can be marked up (attribution, role, matter link) without bespoke parsing.
- **D-03:** `disclaimers` use **JSON** (a single `disclaimers.json` keyed by id — `footer`, `contact`, `blog`, `practice-area`, `attorney`). One file, one edit when compliance text changes; the `<Disclaimer />` component reads the matching id.
  - *Auto-mode rationale:* `[auto] Content formats — Q: "MDX everywhere or mixed?" → Selected: "MDX for prose collections, JSON for disclaimers" (recommended default — disclaimers are key→string lookups, not prose).*

### Content Collection Schemas (initial shape — refined during planning)
- **D-04:** `attorneys` schema: `name`, `slug`, `title` (Partner | Associate | Counsel), `barAdmissions[]`, `education[]`, `focus`, `priorFirms[]`, `representativeDeals[]` (each with `parties`, optional `value`, `role`, `cleared: boolean`), `recognition[]`, `clerkship?`, `languages[]`, `email`, `phone?`, `headshot` (uses Astro `image()` for the 200 KB budget), `draft: boolean`.
- **D-05:** `practiceAreas` schema: `name`, `slug`, `summary`, `clientProblem`, `bsvApproach`, `representativeDeals[]`, `leadAttorneys[]` (Zod `reference('attorneys')`), `faqs[]`, `feeStructureBand: boolean`.
- **D-06:** `blog` schema: `title`, `slug`, `author` (Zod `reference('attorneys')`, required — build fails if missing), `practiceArea` (Zod `reference('practiceAreas')`), `publishedAt`, `updatedAt?`, `summary`, `reviewedBy` (required, free text — editorial review gate), `draft: boolean`.
- **D-07:** `testimonials` schema: `quote`, `attribution`, `role`, `matter?`, `practiceArea?` (Zod `reference('practiceAreas')`).
- **D-08:** `disclaimers` schema: `id` (string union of the five known ids), `text` (markdown allowed), `version` (string — change when wording updates).

### Disclaimer Storage & Rendering
- **D-09:** Single `<Disclaimer id="..." />` component imports the `disclaimers` collection at build time, looks up the matching id, and renders it via Astro Markdown rendering. Five ids exist: `footer` (used in `<SiteFooter />`), `contact` (used on `/contact`), `blog` (used in `BlogPostLayout`), `practice-area` (used in `PracticeAreaLayout`), `attorney` (used in `AttorneyLayout`).
- **D-10:** If a layout requests an id that doesn't exist in the collection, the build FAILS (Zod-typed string union enforces this) — no silent fallback to empty.

### URL Conventions
- **D-11:** Slug format for attorneys is `first-last` lowercase, hyphenated — `aaron-belcher`, `stuart-smolen`, `jon-van-loo`, `iris-zhang`, `susan-jiang`. Matches the bsvlaw.com pattern for the four attorneys with known URLs.
- **D-12:** Slug format for practice areas: `mergers-acquisitions`, `intellectual-property-technology-transactions`, `tax`.
- **D-13:** Blog slugs: `kebab-case` deriving from the title; lock at first publish; never renamed (any rename requires a redirect).
- **D-14:** A `.planning/URL-CONVENTIONS.md` document codifies all of the above plus the canonical route list. Updated only via explicit decision.

### Security Baseline
- **D-15:** `vercel.json` ships with `Content-Security-Policy-Report-Only` (not enforced) in Phase 1 — soak through Phases 3-6 and switch to enforcement only in Phase 7. Initial directives: `default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https://vitals.vercel-insights.com; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; report-uri /api/csp-report` (the `/api/csp-report` endpoint is a thin logger added in Phase 1).
- **D-16:** Other headers in `vercel.json` enforced from Phase 1: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
- **D-17:** Secret-scanning runs in **two layers**: (a) gitleaks installed as a pre-commit hook locally via `.git/hooks/pre-commit` and a project-tracked `.gitleaks.toml`; (b) GitHub push protection enabled on the `jvanloo72/BSV-new-website` repo. Both are required — local catches what you can fix immediately, server-side catches what slipped through.
- **D-18:** `.gitignore` lists `.env`, `.env.local`, `.env.*.local`, `.vercel`, `dist`, `node_modules`, `.astro` from the first commit.

### Preview-Deploy Gating
- **D-19:** Vercel preview deploys carry `X-Robots-Tag: noindex, nofollow` via `vercel.json` env-based config; `BaseLayout` also renders `<meta name="robots" content="noindex">` when `import.meta.env.PROD === false`. Production unconditionally sets `<meta name="robots" content="index, follow">`. This prevents staging content from leaking into search indexes before launch.
- **D-20:** Preview URLs are linkable by Jon directly — no auth wall on previews in Phase 1; revisit if pre-launch reveals problems (e.g., a sensitive draft post). Acceptable risk in Phase 1 because no real client-confidential content lives there yet.

### Tailwind v4 Theme Placeholder
- **D-21:** Phase 1 ships `src/styles/global.css` with placeholder neutral tokens in `@theme` — zinc-based, monochrome — explicitly marked `/* PLACEHOLDER — replaced in Phase 2 */`. This unblocks scaffold work without front-running Jon's design decision in Phase 2.
- **D-22:** Token names are stable across the palette swap: `--color-text`, `--color-text-muted`, `--color-bg`, `--color-bg-elevated`, `--color-border`, `--color-accent`, `--color-accent-fg`. Phase 2 changes values, not names — every component reading them keeps working.

### Placeholder Content (Seeding)
- **D-23:** Phase 1 seeds **one** placeholder per collection so the dynamic routes + Zod schemas can be proven to work end-to-end before any real content lands:
  - `src/content/attorneys/placeholder-attorney.mdx` (with `draft: true`)
  - `src/content/practiceAreas/placeholder-practice.mdx` (with `draft: true`)
  - `src/content/blog/placeholder-post.mdx` (with `draft: true` + valid `author` reference + `reviewedBy`)
  - `src/content/testimonials/placeholder.mdx`
  - `src/content/disclaimers/disclaimers.json` with all five real disclaimer ids (text reviewed against `LAW_FIRM_WEBSITE_GUIDE.md`)
- **D-24:** A deliberately-broken sibling file (e.g., a blog post with no `author`) is added in a feature branch during scaffold validation to prove the build fails as expected, then removed before merge.

### Disclaimer Crawl Test
- **D-25:** Playwright test `tests/disclaimer-crawl.spec.ts` runs after `astro build`: it spins up `astro preview`, fetches each route from the generated sitemap, parses the HTML with Cheerio, and asserts the footer disclaimer text from `disclaimers.json` appears verbatim on every route. Fails the CI job if any route is missing the disclaimer.
- **D-26:** The test runs in CI on every PR (GitHub Actions) and locally via `npm run test:disclaimer`.

### Header & Footer Scope (Phase 1 only)
- **D-27:** Phase 1 ships a functional but visually-minimal `<SiteHeader />` and `<SiteFooter />`. Header: firm name (text only, no logo yet), basic nav links to `/`, `/about`, `/practice-areas`, `/attorneys`, `/blog`, `/contact`. Footer: `<Disclaimer id="footer" />`, copyright, and a single line with both office locations.
- **D-28:** Logo/wordmark, mega-nav, and refined visual treatment are deferred to Phase 2.

### Site-Wide JSON-LD (LegalService)
- **D-29:** `<JsonLd />` component + `src/lib/jsonld.ts` builder land in Phase 1. The site-wide `LegalService` schema (firm name, both locations, telephone, areaServed, knowsAbout) is injected via BaseLayout `<head>`. Person/Article schemas are added by specialized layouts in later phases.
- **D-30:** All JSON-LD generated via `schema-dts` for compile-time typing. `npm run validate:jsonld` script runs the Schema.org validator on `dist/` HTML in Phase 7; Phase 1 just confirms the script and component scaffold work.

### CI Foundations
- **D-31:** GitHub Actions workflow `ci.yml` runs on every PR: `npm install` → `astro build` → `npm run test:disclaimer` → gitleaks scan → `npm run lint:legal` (Rule 7.4 banned-terms check — empty content allowed in Phase 1; real enforcement lands in Phase 4). The workflow blocks merges to `main` if any step fails.

### Claude's Discretion
- Exact `package.json` script names if they conflict with Astro defaults — picked at planning time.
- Specific directory layout under `src/components/` (e.g., whether to group by feature or by primitive) — planner picks via PATTERNS.md analysis.
- Choice of icon library (`astro-icon` vs hand-rolled SVG components) — deferred to Phase 2 design phase.
- Exact gitleaks rule set — start with the default + add a custom rule for any firm-specific patterns (e.g., placeholder `intake@bsvlaw.com` should not trigger false positives).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Charter & Scope
- `.planning/PROJECT.md` — Project context, Core Value, Active Requirements, Constraints, Key Decisions
- `.planning/REQUIREMENTS.md` — 117 v1 requirements with REQ-IDs (Phase 1 covers FOUND-01..10, SEC-01..04, SEC-10, LEGAL-01, OPS-05)
- `.planning/ROADMAP.md` — 7-phase roadmap with goal, requirements list, and success criteria per phase
- `.planning/STATE.md` — Project memory and active phase pointer
- `.planning/FIRM_BRIEF.md` — Firm-specific brief (the source of truth for positioning, team, security, design direction)

### Research
- `.planning/research/STACK.md` — Locked stack + complementary library recommendations with current 2026 versions
- `.planning/research/ARCHITECTURE.md` — 15-step dependency-ordered build sequence; layout strategy; content-collection schemas
- `.planning/research/PITFALLS.md` — 20 pitfalls with phase mapping; Pitfalls 1-10 + 12-13 directly affect Phase 1
- `.planning/research/FEATURES.md` — Categorized feature list (for downstream phases; Phase 1 only needs the foundation)
- `.planning/research/SUMMARY.md` — Executive summary with phase-ordering recommendation

### Project Guidance
- `.claude/CLAUDE.md` — Project instructions (non-technical lead, stack lock-in, security non-negotiables, StoryBrand copy framework, decision log requirement)
- `.planning/LAW_FIRM_WEBSITE_GUIDE.md` — Best practices for law firm websites (SEO, AEO, disclaimers, StoryBrand) — referenced by FEATURES.md and PITFALLS.md

### To Be Created During Phase 1
- `.planning/URL-CONVENTIONS.md` — Slug formats and canonical route list (locked in this phase, never renamed)
- `.planning/CLIENT_DISCLOSURE_CLEARANCE.md` — Empty template created in Phase 1; populated in Phase 4 before any deal experience publishes
- `.planning/DECISIONS.md` — Decision log per CLAUDE.md requirement; Phase 1 appends scaffold decisions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- None — greenfield project. No prior components, hooks, or utilities to reuse.

### Established Patterns
- None established in code yet. Patterns are being defined by this phase:
  - Astro 6 + Tailwind v4 + Vercel adapter as the foundational stack (locked)
  - Astro Content Collections with Zod schemas as the content layer
  - One `BaseLayout` + three specialized layouts via slot transfer
  - File-based content (MDX + one JSON for disclaimers) so a non-coding partner can edit via the GitHub web editor

### Integration Points
- `BaseLayout.astro` is the single integration point where every page picks up: site header, site footer (with `<Disclaimer id="footer" />`), `<SeoHead />`, site-wide `<JsonLd type="LegalService" />`. Specialized layouts extend BaseLayout via slot.
- `src/content/config.ts` is the single integration point where every content collection's schema lives. All Zod schemas live here.
- `vercel.json` is the single integration point for HTTP security headers and any environment-aware rewrites/headers (e.g., the preview `noindex` rule).

</code_context>

<specifics>
## Specific Ideas

- Jon explicitly identified **Strix Law (strixlaw.com)** and **Norm Law (normlaw.com)** as visual references — Phase 1's neutral placeholder palette should not look like either yet, but should not lock in choices that conflict with either direction.
- Jon explicitly stated the lead is a non-coder — Phase 1 must produce a project layout that a non-coder can edit via the GitHub web editor (markdown + json + minimal `.astro` files for content). No content buried in `.astro` files except the chrome (header / footer / layout).
- Jon explicitly listed the **stack as locked** — Astro 6 + Tailwind v4 + GitHub + Vercel. No alternatives proposed.

</specifics>

<deferred>
## Deferred Ideas

- **Logo / wordmark design** — deferred to Phase 2. Phase 1 ships text-only firm name.
- **Final color palette** — deferred to Phase 2 (needs Jon's input). Phase 1 ships placeholder neutral tokens.
- **Custom hero SVG and practice-area icon set** — deferred to Phase 2 (commissioned as part of design).
- **OG image strategy** (static images vs Vercel OG-generation function) — deferred to Phase 3 (SEO meta wiring). Phase 1 stubs a default OG image.
- **`@astrojs/sitemap` configuration details** (filtering drafts, custom lastmod) — deferred to Phase 3 (when real content exists); Phase 1 ships the integration installed with defaults.
- **CSP enforcement specifics** — deferred to Phase 7. The exact `Content-Security-Policy` directive set depends on what the report-only mode captured during Phases 3-6.
- **`@vercel/analytics` integration** — deferred to Phase 7 (production rollout). Phase 1 installs the package but does not enable it.
- **Rate limiting on the CSP report endpoint** — deferred to Phase 6/7 (with the contact form rate-limiting strategy). Phase 1 ships the endpoint unrate-limited but with a body-size cap.
- **A11y axe-core CI integration** — deferred to Phase 7 launch gates. Phase 1 sets up the test framework only.

</deferred>

---

*Phase: 1-Scaffold & Shell*
*Context gathered: 2026-05-25*
