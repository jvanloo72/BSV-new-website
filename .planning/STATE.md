---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Phase 5 Plan 05-05 paused at D-05/D-14 human-action checkpoint (awaiting Jon's seed-post title + summary + cover choice)
last_updated: "2026-05-28T20:05:00.000Z"
last_activity: 2026-05-28 -- Phase 5 plan 05-04 complete (RSS feed slice — Container API + sanitize-html endpoint at /blog/rss.xml)
progress:
  total_phases: 7
  completed_phases: 4
  total_plans: 25
  completed_plans: 24
  percent: 67
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-05-25)

**Core value:** A prospective client who lands on the site comes away convinced that BSV has the competence, experience, and responsiveness to handle their specific transaction — and reaches out.
**Current focus:** Phase 5 — Insights (Blog) System

## Current Position

Phase: 5 (Insights (Blog) System) — EXECUTING
Plan: 5 of 5 (next: 05-05 — seed post; NON-AUTONOMOUS — checkpoint:human-action D-14 for Jon's seed-post copy)
Status: Executing Phase 5
Last activity: 2026-05-28 -- Phase 5 plan 05-04 complete (RSS feed slice — Container API + sanitize-html endpoint at /blog/rss.xml)

Progress: [███████░░░] 67% (4 of 7 phases complete; Phase 5: 4 of 5 plans complete — Wave-0 foundation + BlogPostLayout slice + blog-index filtering slice + RSS feed slice landed)

Resume: `/gsd:execute-phase 5` — 05-04 done; 05-05 is non-autonomous (checkpoint:human-action D-14).
Next plan: 05-05 (seed post; NON-AUTONOMOUS) — scaffold one src/content/blog/<slug>.mdx with draft:true, Jon pastes draft body, Claude formats verbatim + runs lint:legal + surfaces clearance flags + waits for publish/revise/hold sign-off; on publish, flip draft:false + delete placeholder-post.mdx in the same commit (Pitfall 9) + build + push + report preview URL.

## Performance Metrics

**Velocity:**

- Total plans completed: 17 (Phase 1)
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1. Scaffold & Shell | 9/9 | — | — |
| 2 | 4 | - | - |
| 4 | 4 | - | - |
| 5 | 3/5 | - | - |

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
| Phase 4 P3 | 41m | 2 tasks | 8 files |
| Phase 5 P1 | 8m | 3 tasks | 13 files |
| Phase 5 P2 | 6m | 3 tasks | 6 files |
| Phase 5 P3 | 12m | 3 tasks | 3 files |
| Phase 5 P4 | 8m | 2 tasks | 2 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table. The full Phase 1 build-time decision log is in .planning/DECISIONS.md (10 entries through 2026-05-26).
Recent decisions affecting current work:

- 2026-05-28: Phase 5 RSS feed slice landed — new src/pages/blog/rss.xml.ts (84 lines; static endpoint; APIRoute signature mirrors robots.txt.ts but async; locked seven imports — @astrojs/rss + astro:content + astro/container + astro:container + @astrojs/mdx + sanitize-html + SITE constants + APIRoute type; experimental_AstroContainer.create initialised ONCE per build before Promise.all loop; getCollection draft filter — Pitfall 9; per-post getEntry author resolution with throw on unknown reference; container.renderToString(Content) for MDX-to-string; safe negative-lookahead regex /(href|src)=\"\\/(?!\\/)/g for relative-to-absolute URL rewrite — T-05-RELURL; sanitize-html with defaults.allowedTags.concat(['img']) — Pitfall 3 + T-05-04; author: author.data.name only, NEVER .email — D-08 / T-05-03 mitigation by code-path exclusion; rss() with locked BSV Insights channel metadata + en-us language + atom xmlns); astro.config.mjs NOT touched (no output:'server' — static pre-render per Pitfall 11; lands at dist/client/blog/rss.xml); tests/rss-feed.spec.ts un-skipped with 8 live tests (3 fully live regardless of post count + 3 deferred-pass per-item assertions + 1 always-pass draft-leak cross-check + 1 whole-file @bsvlaw.com substring guard — D-08 belt-and-braces); 8 tests pass today via deferred-pass annotation, fall through to real assertions automatically when 05-05 publishes the seed post (05-04)
- 2026-05-28: Phase 5 blog-index filtering slice landed — new src/components/sections/FilterChipRow.astro (98 lines; data-component=FilterChipRow; chip-as-anchor with aria-pressed/data-chip/data-param/data-value; min-h-[44px]; A11Y-05 focus ring; active visual = bg-text text-bg border-text per D-08, NOT bg-accent; buildHref() preserves cross-axis filter state via otherActiveParams); rewritten posts.length>0 branch of src/pages/blog/index.astro (Promise.all+getEntry for author+practice resolution; PRACTICE_DISPLAY map for M&A/IP&Tech/Tax short labels; two FilterChipRow instances above #post-list ul with per-li data-author+data-practice; #empty-filtered region with role=status aria-live=polite; ~50-line inline <script is:inline> filter handler using only attribute writes — never innerHTML, T-05-02 mitigation by construction); tests/blog-filter.spec.ts un-skipped with five live tests behind a deferred-pass guard (mirrors 05-02 article-jsonld pattern — all five pass via guard today; the moment 05-05 publishes the seed post the guard falls through and the assertion loop runs). Inline script is ES5-safe (var/function/IIFE) because is:inline skips Vite+Babel; chip is <a> not <button> so the filter works without JavaScript (anchor-as-toggle, UI-SPEC line 272). Susan's chip auto-appeared because draft flipped to false on 2026-05-28 — permissive test count floors (>=5 author / >=4 practice) anticipated this (05-03)
- 2026-05-28: Phase 5 BlogPostLayout slice landed — buildArticleLd Phase 1 throw-stub replaced with real two-arg (post, author) WithContext&lt;Article&gt; implementation (og-default.svg fallback; no sameAs; no reviewedBy); BlogPostLayout full chrome (JsonLd slot=head + H1 + byline with /attorneys/<slug> link + optional 16:9 cover figure + .prose-bsv MDX body + AuthorCard section + preserved Disclaimer); [slug].astro resolves author via getEntry; new AuthorCard.astro section component (80×80 headshot, no hover-lift — UI-SPEC line 311); .prose-bsv ~25-rule typography block appended to global.css under @layer components, token-only; tests/article-jsonld.spec.ts un-skipped with deferred-pass guard (passes vacuously while no non-draft posts; assertion loop runs automatically when 05-05 lands the seed post). buildArticleLd takes the resolved author as a second arg rather than re-resolving inside jsonld.ts — keeps the builder pure of astro:content runtime concerns and matches the existing buildPersonLd/buildLegalServiceLd shape (05-02)
- 2026-05-28: Phase 5 Wave-0 landed — @astrojs/rss@4.0.18 + sanitize-html@2.17.4 + rehype-external-links@3.0.0 + @types/sanitize-html@2.16.1 installed; six Playwright scaffolds (2 live + 4 SKIPPED with UNSKIP-WHEN markers tied to 05-02/03/04/05); blog Zod schema gains .refine() for cover⇒coverAlt (a11y / WCAG 1.1.1); MDX integration rewrites every external <a> to target=_blank rel=noopener,noreferrer (rehype-external-links); og-default.svg site fallback (1264 B, 1200×630, palette tokens only). Live tests reconstruct the schema shape via plain Zod rather than importing collections.blog.schema — the production definition uses ({image}) =&gt; z.object(...) where image() is a runtime injection; the schema-approximation captures the contracts under test with zero build cost (05-01)
- 2026-05-27: Three practice-area pages shipped — M&A keeps a curated 10-deal cleared grid + the Daniel Brian testimonial with the CA disclosure rendered in the TestimonialQuote disclosure slot (D-09/D-18); IP & Tech and Tax have NO deal grid and NO testimonial (D-10); lead-partner callouts resolve leadAttorneys via getEntries and link to /attorneys/<slug> (D-11). FAQs drafted to FAQ-DRAFT.md only and left out of the MDX faqs: arrays pending Jon's D-13 approval; FAQPage JSON-LD + FaqAccordion are wired but guarded on empty faqs (04-03)
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

Last session: 2026-05-28T19:58:42.000Z
Stopped at: Completed 05-04-PLAN.md (RSS feed slice — Container API + sanitize-html endpoint at /blog/rss.xml)
Resume file: .planning/phases/05-insights-blog-system/05-04-SUMMARY.md
Next: 05-05-PLAN.md (seed post; NON-AUTONOMOUS — checkpoint:human-action D-14) — scaffold one src/content/blog/<slug>.mdx with draft:true; Jon pastes draft body; Claude formats verbatim + runs lint:legal + surfaces clearance flags + waits for publish/revise/hold sign-off; on publish, flip draft:false + delete placeholder-post.mdx in the same commit (Pitfall 9) + build + push + report preview URL.
