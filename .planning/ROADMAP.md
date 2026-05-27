# Roadmap: Belcher, Smolen & Van Loo LLP — Website

## Overview

This roadmap takes BSV from an empty repository to a launched, premium-but-warm
marketing site on Astro 6 + Tailwind v4 + Vercel. The journey starts with the
foundation a non-coding partner can safely build on (Phase 1: project scaffold,
content schemas, disclaimer plumbing, security baseline). It then locks in the
visual language Jon will react to (Phase 2: design system with a custom hero
graphic and practice-area icons). With components in hand, the static pages
come together so Jon has something visible to inspect on a preview URL
(Phase 3: homepage and index pages). Then the substance — attorney profiles
with the partner-contact differentiator and practice-area pages with deal grids
and FAQ schema (Phase 4), followed by the Insights blog with named-attorney
attribution and editorial gates (Phase 5). The contact form lands late
(Phase 6) so frontend work isn't blocked on Jon's CRM decision. Finally,
security headers tighten from report-only to enforce, performance and
accessibility gates close, and the site launches (Phase 7).

## Phases

**Phase Numbering:**

- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Scaffold & Shell** - Astro 6 project, content collections, BaseLayout with disclaimer plumbing, security baseline, preview-deploy workflow verified
- [x] **Phase 2: Design System & Visual Identity** - Color palette locked, Tailwind `@theme` tokens, reusable section components, custom hero SVG and practice-area icon set (completed 2026-05-26)
- [x] **Phase 3: Homepage & Static Pages** - Homepage with "Team work to get good results" lead, About, index pages for practice areas and attorneys, 404/5xx, Insights index shell (completed 2026-05-27)
- [ ] **Phase 4: Attorney & Practice Area Pages** - Five attorney profiles (Jiang as draft), three practice-area pages with deal grids, partner-contact callouts, FAQ schema, Rule 7.4 lint
- [ ] **Phase 5: Insights (Blog) System** - Dynamic blog routes, attorney/practice-area filtering, RSS feed, Article JSON-LD, editorial review gate, one seed post live
- [ ] **Phase 6: Contact Form & Intake** - Contact page with ABA 477R-compliant intake, Astro Action with Zod validation, honeypot + time-trap + rate limiting, Resend email dispatch
- [ ] **Phase 7: Security Hardening, Performance & Launch** - CSP switched to enforce, securityheaders.com grade A, Lighthouse mobile gates, redirect map from legacy URLs, custom domain live

## Phase Details

### Phase 1: Scaffold & Shell

**Goal**: Jon can see a deployed-on-Vercel skeleton of the BSV site with the
site-wide footer disclaimer, header, and footer rendering on every route,
backed by typed content collections — the safe foundation every later phase
depends on.
**Mode:** mvp
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07, FOUND-08, FOUND-09, FOUND-10, SEC-01, SEC-02, SEC-03, SEC-04, SEC-10, LEGAL-01, OPS-05
**Success Criteria** (what must be TRUE):

  1. Jon can click a Vercel preview URL produced from a pull request and see a working BSV homepage shell with the firm name, navigation, and the site-wide footer disclaimer rendered.
  2. A Playwright crawl test confirms the footer disclaimer appears on every route — including the empty placeholders for `/about`, `/contact`, `/practice-areas`, `/attorneys`, and `/blog`.
  3. Adding a new Markdown file to any content collection (e.g. a placeholder attorney) makes its page build; deleting a required field (e.g. an attorney's bar admissions) fails the build with a typed Zod error.
  4. A test commit containing a fake API key cannot be pushed — gitleaks pre-commit hook blocks it locally and GitHub push protection blocks it server-side.
  5. The `vercel.json` ships with `Content-Security-Policy-Report-Only`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` headers, verified on the preview deploy.

**Plans**: 9 plans
Plans:
**Wave 1**

- [x] 01-00-PLAN.md — Wave 0 test infrastructure: scaffolds for Playwright config, six test spec files (skipped), gitleaks config + pre-commit hook script + installer + negative-test shell script
- [x] 01-01-PLAN.md — Walking Skeleton: Astro 6 + Tailwind v4 + Vercel adapter + MDX + sitemap scaffold; minimal BaseLayout + SiteHeader + SiteFooter + Disclaimer; seed disclaimers.json with all 5 ids; homepage renders; vercel.json with five security headers
- [x] 01-05-PLAN.md — URL Conventions doc: .planning/URL-CONVENTIONS.md (locked slug formats per D-11..D-14); empty .planning/CLIENT_DISCLOSURE_CLEARANCE.md template; seed .planning/DECISIONS.md with 7 Phase 1 entries

**Wave 2** *(complete)*

- [x] 01-02-PLAN.md — Content Collections: extend src/content.config.ts to all 5 collections (attorneys, practiceAreas, blog, testimonials, disclaimers); one placeholder MDX per collection (draft: true); implement zod-negative + disclaimer-set tests
- [x] 01-06-PLAN.md — Security headers refinement + gitleaks install + CSP report endpoint: /api/csp-report endpoint (8 KB cap, console.warn logging); checkpoint:human-action to install gitleaks Go binary + run scripts/install-git-hooks.ps1 (DEFERRED at Jon's decision — see DECISIONS.md 2026-05-26); checkpoint:human-action to enable GitHub push protection (DONE)

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 01-03-PLAN.md — Specialized Layouts + JSON-LD: site.ts + jsonld.ts (schema-dts builders); JsonLd + SeoHead + SkipToContent components; extend BaseLayout with site-wide LegalService injection; AttorneyLayout + PracticeAreaLayout + BlogPostLayout; implement jsonld-legalservice test

**Wave 4** *(blocked on Wave 3 completion)*

- [ ] 01-04-PLAN.md — Placeholder Routes: refine SiteHeader (aria-current) and SiteFooter (mailto link); create /about, /contact, /practice-areas (index), /attorneys (index), /blog (index), /404, /500; three dynamic [slug] routes with getStaticPaths

**Wave 5** *(blocked on Wave 4 completion)*

- [ ] 01-07-PLAN.md — Disclaimer Crawl Test + CI Workflow: implement disclaimer-crawl.spec.ts (walks sitemap, asserts footer disclaimer on every route); implement baselayout.spec.ts; create .github/workflows/ci.yml (D-31) running install + check + build + 5 tests + gitleaks-action + lint:legal

**Wave 6** *(blocked on Wave 5 completion)*

- [ ] 01-08-PLAN.md — Final preview deploy + Phase 1 sign-off: final PR; verify CI green + Vercel preview URL + live HTTP headers via curl; enable branch protection on main; update STATE.md / REQUIREMENTS.md (mark 17 Phase 1 IDs Validated) / ROADMAP.md (tick Phase 1 checkbox)

**Security hint**: yes

### Phase 2: Design System & Visual Identity

**Goal**: BSV has a locked visual identity — color palette, typography scale,
spacing scale, and a reusable component library — so every later page composes
from the same building blocks and a future restyle is a single-file edit.
**Mode:** mvp
**Depends on**: Phase 1
**Requirements**: DESIGN-01, DESIGN-02, DESIGN-03, DESIGN-04, DESIGN-05, DESIGN-06, DESIGN-07, DESIGN-08
**Success Criteria** (what must be TRUE):

  1. Jon reviews 2-3 color palette options on a Vercel preview and confirms one; that decision lands in `.planning/DECISIONS.md` with the rationale.
  2. The chosen palette, typography scale, and spacing scale live as `@theme` tokens in `src/styles/global.css` — changing a token there updates every component automatically.
  3. A component-gallery preview page renders `Hero`, `PracticeAreaCard`, `AttorneyCard`, `TestimonialQuote`, `DealsGrid`, `FeeStructureBand`, `CtaBlock`, and `FaqAccordion` with realistic placeholder content.
  4. The custom abstract hero SVG and the three stylized practice-area icons are present on disk, integrated via `astro-icon`, and visibly distinct from generic stock imagery.
  5. The look reads premium-but-warm (per the Norm Law foundation + Strix warmth direction) — Jon confirms on the preview before Phase 3 begins.

**Plans**: 4 plans
Plans:
**Wave 1**

- [x] 02-00-PLAN.md — Wave 0 test infrastructure: 7 Playwright/Cheerio/filesystem spec scaffolds (contrast.spec active; the other 6 skipped with UNSKIP-WHEN markers) + package.json test scripts
- [x] 02-01-PLAN.md — Foundation slice: install astro-icon + sharp, self-host Hanken Grotesk (Astro Fonts API), rewrite global.css @theme (Direction-B palette + type/spacing/radius/shadow tokens + reduced-motion guard), wire fonts/icon/sitemap-filter/noindex prop, ship UI primitives + PracticeAreaCard + first practice icon on hidden /_design

**Wave 2** *(depends on 02-01)*

- [x] 02-02-PLAN.md — Remaining 7 components (Hero, AttorneyCard, TestimonialQuote, DealsGrid, FeeStructureBand, CtaBlock, FaqAccordion) + converging-linework hero SVG + 2 remaining practice icons + placeholder headshots; full 8-component /design-system gallery; gallery/a11y/assets tests green

**Wave 3** *(depends on 02-01, 02-02)*

- [x] 02-03-PLAN.md — Creative identity + chrome: derived mark.svg + favicon, typographic wordmark, refined SiteHeader/SiteFooter (animated underline, focus rings), retrofit Phase 1 arbitrary-value token syntax to namespace utilities; footer Disclaimer not regressed

**UI hint**: yes

### Phase 3: Homepage & Static Pages

**Goal**: A prospective client can land on BSV's homepage, see the "Team work
to get good results" lead message, scan a practice-area teaser, browse the
attorney row, read a marquee testimonial and the Chambers Spotlight strip, and
follow a primary CTA toward contact — and navigate to About and the section
indexes from anywhere.
**Mode:** mvp
**Depends on**: Phase 2
**Requirements**: PAGES-01, PAGES-02, PAGES-03, PAGES-04, PAGES-05, PAGES-06, PAGES-07, PAGES-08, SEO-01, SEO-02, SEO-07, SEO-08, LEGAL-07, OPS-06
**Success Criteria** (what must be TRUE):

  1. The homepage opens with the headline "Team work to get good results" — not with awards, credentials, or firm history.
  2. A visitor on the homepage can see three practice-area teaser cards, all five attorneys in an attorney row (Belcher, Smolen, Van Loo, Zhang, Jiang — never Fishbien), a marquee testimonial pull-quote, the Chambers USA Spotlight 2026 recognition strip, and a primary CTA pointing toward the contact page.
  3. The About page presents BSV's positioning, firm history, and both office locations (Silicon Valley + 555 California St. Suite 4925 San Francisco) in plain English, with the client framed as the hero (StoryBrand).
  4. From the homepage, a visitor can reach the Practice Areas index, the Attorneys index, and the Insights index in one click each; the Insights index handles the empty-state gracefully.
  5. A user who navigates to a nonexistent URL or triggers a server error sees branded 404 / 5xx pages (not generic Vercel pages); `sitemap.xml` and `robots.txt` are live; `LegalService` JSON-LD is present site-wide via BaseLayout.

**Plans**: 3 plans
Plans:
**Wave 1**

- [x] 03-01-PLAN.md — Clearance gate + homepage slice: populate CLIENT_DISCLOSURE_CLEARANCE.md with the D-04 cleared deals, create ApproachBand + ChambersStrip, compose the public homepage in D-01 order (PAGES-01/02/08, LEGAL-07)
- [x] 03-03-PLAN.md — Section indexes + branded error pages + SEO baseline: real-looking Practice Areas/Attorneys indexes, graceful Insights empty-state, branded 404/500, verify sitemap.xml/robots.txt/LegalService JSON-LD/SeoHead meta (PAGES-04/05/06/07, SEO-01/02/07/08)

**Wave 2** *(depends on 03-01)*

- [x] 03-02-PLAN.md — About page slice: extract formatOffice helper, client-first StoryBrand About with two-office block + closing CTA, token retrofit (PAGES-03/08, OPS-06)

**UI hint**: yes

### Phase 4: Attorney & Practice Area Pages

**Goal**: A prospective client can read a complete profile for each of the four
published attorneys, see specific representative deals on each practice-area
page, find the lead partners on each page, and never encounter a Rule 7.4
copy violation or an uncleared client name.
**Mode:** mvp
**Depends on**: Phase 3
**Requirements**: ATTY-01, ATTY-02, ATTY-03, ATTY-04, ATTY-05, ATTY-06, ATTY-07, ATTY-08, ATTY-09, ATTY-10, ATTY-11, ATTY-12, PRAC-01, PRAC-02, PRAC-03, PRAC-04, PRAC-05, PRAC-06, PRAC-07, PRAC-08, PRAC-09, SEO-03, SEO-05, LEGAL-02, LEGAL-03, LEGAL-04, LEGAL-06, LEGAL-08, LEGAL-10
**Success Criteria** (what must be TRUE):

  1. A referred prospect can navigate to `/attorneys/aaron-belcher`, `/attorneys/stuart-smolen`, `/attorneys/jon-van-loo`, or `/attorneys/iris-zhang` and read a full bio with bar admissions, education, focus areas, and representative deals; Susan Jiang's profile exists with `draft: true` and is not linked or indexed until Jon supplies the final bio.
  2. Each of the three practice-area pages (`/practice-areas/mergers-acquisitions`, `/practice-areas/intellectual-property-technology-transactions`, `/practice-areas/tax`) opens with the client's problem, then BSV's team-driven solution, then proof (representative deals from `CLIENT_DISCLOSURE_CLEARANCE.md`, lead partner callouts, testimonial), and renders an FAQ section.
  3. Every partner page surfaces a direct email and/or phone callout — proving the "partner-led" positioning structurally; every practice-area page surfaces the fee-structure transparency band (hourly billing + cost estimate).
  4. `npm run lint:legal` runs in CI and fails the build if any non-allowlisted use of "specialist", "expert", or "specialize" appears in content; Stuart's USPTO registration uses the documented allowlisted phrasing.
  5. No deal, client name, or counterparty appears on any practice-area or attorney page unless it is listed in `.planning/CLIENT_DISCLOSURE_CLEARANCE.md`; testimonials carry the California-required disclosure; Nir Fishbien appears nowhere on the site (collections, links, or sitemap).

**Plans**: 4 plans
Plans:
**Wave 1**

- [x] 04-01-PLAN.md — Foundation: buildPersonLd + buildFaqPageLd, real lint:legal Rule 7.4 scanner (prebuild/CI), Aaron 64-deal clearance, Wave 0 test scaffolds *(SUMMARY: 04-01-SUMMARY.md, 3/3 tasks)*

**Wave 2** *(blocked on Wave 1 completion)*

- [ ] 04-02-PLAN.md — Attorney slice: 5 attorney MDX (Susan draft) + AttorneyLayout render-out (Person JSON-LD, email-only callout, Aaron deal grid, disclaimer)
- [ ] 04-03-PLAN.md — Practice slice: 3 practiceArea MDX + Daniel Brian testimonial + PracticeAreaLayout (problem→solution→lead-partner→M&A grid/testimonial→fee band, guarded FAQPage); FAQ drafts staged

**Wave 3** *(blocked on Wave 2 completion)*

- [ ] 04-04-PLAN.md — FAQ approval gate (D-13, non-autonomous): Jon approves drafted FAQs, then write into the 3 practice MDX → FaqAccordion + FAQPage JSON-LD live

**UI hint**: yes

### Phase 5: Insights (Blog) System

**Goal**: A visitor can browse BSV's Insights, filter by attorney or practice
area, read a post attributed to a named partner with a per-post disclaimer,
and subscribe via RSS — and the editorial process structurally prevents an
anonymous post, an unreviewed post, or a post without a disclaimer from ever
publishing.
**Mode:** mvp
**Depends on**: Phase 4
**Requirements**: BLOG-01, BLOG-02, BLOG-03, BLOG-04, BLOG-05, BLOG-06, BLOG-07, BLOG-08, BLOG-09, SEO-04, LEGAL-09
**Success Criteria** (what must be TRUE):

  1. A visitor lands on `/blog`, sees at least one published seed post by a named BSV attorney, and can filter the index by attorney and by practice area.
  2. Every blog post page (`/blog/[slug]`) renders the author's name as a link to their attorney profile, a per-post legal disclaimer, and valid `Article` JSON-LD with author, datePublished, dateModified, headline, and image fields.
  3. Attempting to merge a blog post without an `author` reference fails the Astro build with a typed Zod error; the same is true for missing `reviewed_by`.
  4. RSS subscribers can fetch `/blog/rss.xml` and receive a valid feed of the published posts.
  5. `.planning/EDITORIAL.md` exists and documents the banned-terms policy (Rule 7.4), disclaimer placement, client-name policy, the "no legal advice" rule, and the `reviewed_by` review gate.

**Plans**: TBD

### Phase 6: Contact Form & Intake

**Goal**: A prospective client can submit a contact inquiry through a form
that protects them under ABA Formal Opinion 477R — TLS-only transit, no
third-party storage of the matter description, the firm's controlled inbox as
the destination — while malformed, automated, or abusive submissions are
silently rejected.
**Mode:** mvp
**Depends on**: Phase 5
**Requirements**: FORM-01, FORM-02, FORM-03, FORM-04, FORM-05, FORM-06, FORM-07, FORM-08, FORM-09, FORM-10, FORM-11, SEC-05, SEC-06, SEC-08, SEC-09
**Success Criteria** (what must be TRUE):

  1. A visitor on `/contact` sees the attorney-client disclaimer above the submit button, the privacy notice explaining what's collected and where it goes, and can submit name, email, optional organization, and a character-limited matter description.
  2. A successful submission delivers a structured email to the firm-controlled inbox (default `intake@bsvlaw.com`) via Resend; if Jon confirms BSV uses a CRM, the same Action also POSTs to that CRM's webhook.
  3. A submission with malformed input (bad email, oversized matter description, empty required field) is rejected server-side by Zod before any email or webhook fires; the user sees an inline error and the form still works with JavaScript disabled.
  4. A bot that fills the honeypot field, submits faster than the time-trap threshold, or exceeds the rate-limit window is silently accepted-and-discarded (honeypot/time-trap) or rate-limited (Vercel WAF) — no email is sent and the bot sees a normal success response.
  5. The email subject and headers are built via Resend's structured API (not string concatenation), so a header-injection attempt in any field cannot break out of its envelope; the contact page documents the retention policy and confirms no third-party storage of inquiry text.

**Plans**: TBD
**Security hint**: yes

### Phase 7: Security Hardening, Performance & Launch

**Goal**: BSV's new site launches on its production domain with a tightened
Content-Security-Policy, a securityheaders.com grade of A or higher, mobile
Lighthouse scores meeting the targets, WCAG 2.1 AA conformance verified, and
redirects in place from legacy bsvlaw.com URLs — and `/hc-firm-site:check`
returns a clean security audit.
**Mode:** mvp
**Depends on**: Phase 6
**Requirements**: SEC-07, SEC-11, SEC-12, SEO-06, SEO-09, SEO-10, A11Y-01, A11Y-02, A11Y-03, A11Y-04, A11Y-05, A11Y-06, PERF-01, PERF-02, PERF-03, PERF-04, PERF-05, PERF-06, LEGAL-05, OPS-01, OPS-02, OPS-03, OPS-04
**Success Criteria** (what must be TRUE):

  1. The production deployment scores grade A or higher on securityheaders.com; the CSP is switched from report-only to enforce in `vercel.json` after a clean soak period; a `dist/` audit and gitleaks history scan confirm zero exposed credentials or `.env` files.
  2. Lighthouse mobile scores meet the targets — Performance ≥ 90, Accessibility = 100, SEO ≥ 95 — on the homepage, an attorney page, a practice-area page, a blog post, and the contact page; axe-core in CI is green on every page.
  3. Every committed image in `dist/` is ≤ 200 KB (verified by a pre-build script); fonts load with `font-display: swap`; CLS is ≤ 0.1; no third-party script ships cookies or session-replay.
  4. The production site is live on its custom domain (bsvlaw.com or the agreed transition domain); legacy bsvlaw.com URLs redirect to the new equivalents; `@vercel/analytics` (cookie-free) is running; production auto-deploys from `main` of `jvanloo72/BSV-new-website`.
  5. `/hc-firm-site:check` returns a fully passing Security section; the Google Rich Results Test passes on a sample page of each JSON-LD type (LegalService, Person, Article, FAQPage); the attorney-advertising notation appears with the wording Jon confirms during the final content review.

**Plans**: TBD
**Security hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6 → 7

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Scaffold & Shell | 9/9 | Complete | 2026-05-26 |
| 2. Design System & Visual Identity | 4/4 | Complete    | 2026-05-26 |
| 3. Homepage & Static Pages | 3/3 | Complete | 2026-05-27 |
| 4. Attorney & Practice Area Pages | 1/4 | In progress | - |
| 5. Insights (Blog) System | 0/TBD | Not started | - |
| 6. Contact Form & Intake | 0/TBD | Not started | - |
| 7. Security Hardening, Performance & Launch | 0/TBD | Not started | - |
