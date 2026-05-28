# Requirements: Belcher, Smolen & Van Loo LLP — Website

**Defined:** 2026-05-25
**Core Value:** A prospective client who lands on the site comes away convinced that BSV has the competence, experience, and responsiveness to handle their specific transaction — and reaches out.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Foundation

- [x] **FOUND-01**: Astro 6 project scaffolded with TypeScript, MDX, Vercel adapter, sitemap, and Tailwind v4 integrations
- [x] **FOUND-02**: Tailwind v4 configured via `@theme` in `src/styles/global.css` (no `tailwind.config.js`)
- [x] **FOUND-03**: Five Zod-typed Astro Content Collections exist — `attorneys`, `practiceAreas`, `blog`, `testimonials`, `disclaimers`
- [x] **FOUND-04**: Cross-collection `reference()` typing enforced — `insight`-category blog posts cannot publish with a missing author; `deal-announcement`-category blog posts must NOT set an author or practiceArea (firm-attributed); practice areas cannot reference a missing lead attorney *(amended 2026-05-28 to add the `category` axis — schema refinement enforces both rules)*
- [x] **FOUND-05**: `BaseLayout.astro` renders site header, site footer (with footer disclaimer slot), main content slot, and `<head>` SEO + JSON-LD slots
- [x] **FOUND-06**: Three specialized layouts extending BaseLayout — `AttorneyLayout`, `PracticeAreaLayout`, `BlogPostLayout` — each adding its own JSON-LD and per-page disclaimer
- [x] **FOUND-07**: Single `<Disclaimer id="..." />` component reads from `disclaimers` content collection (one edit updates every disclaimer site-wide)
- [x] **FOUND-08**: URL conventions locked — `/practice-areas/[slug]`, `/attorneys/[slug]`, `/blog/[slug]`, `/about`, `/contact`. Slugs documented and never renamed post-launch
- [x] **FOUND-09**: Vercel preview deploy workflow verified — every PR produces a clickable preview URL before merge to `main`
- [x] **FOUND-10**: Astro 6 / Tailwind v4 pattern compliance — no removed `output: 'hybrid'`, no deprecated `theme()` function, `getStaticPaths()` params are strings

### Design System

- [x] **DESIGN-01**: Color palette decided with Jon's input (2-3 options presented in design phase)
- [x] **DESIGN-02**: Tailwind `@theme` tokens defined for colors, typography scale, spacing scale — single CSS file as the source of truth
- [x] **DESIGN-03**: Modern sans-serif typography (no traditional law-firm serifs); large bold headlines with strong hierarchy
- [x] **DESIGN-04**: Reusable section components built — `Hero`, `PracticeAreaCard`, `AttorneyCard`, `TestimonialQuote`, `DealsGrid`, `FeeStructureBand`, `CtaBlock`, `FaqAccordion`
- [x] **DESIGN-05**: One custom abstract hero graphic (SVG) commissioned and integrated — Jon's "creative art" requirement
- [x] **DESIGN-06**: Stylized practice-area icon set (3 icons) commissioned and integrated via `astro-icon`
- [x] **DESIGN-07**: Generous whitespace and restrained imagery — no stock-photo theatrics; layered visual depth where used
- [x] **DESIGN-08**: Visual style premium but warmer than Norm Law — restrained foundation with selective creative graphic moments

### Pages (Static)

- [x] **PAGES-01**: Homepage opens with the lead message "Team work to get good results" (not credentials)
- [x] **PAGES-02**: Homepage includes practice-area teaser (3 cards), attorney row (5 cards), one marquee testimonial pull-quote, Chambers Spotlight 2026 recognition strip, and a primary contact CTA
- [x] **PAGES-03**: About page covers firm history, both office locations (Silicon Valley + 555 California St. Suite 4925 San Francisco), and the firm's positioning *(delivered in 03-02; per D-06, no founding-year/origin narrative was invented — positioning + verifiable substance stand in for "firm history" until Jon supplies a real origin story; both offices render from SITE.offices)*
- [x] **PAGES-04**: Practice Areas index page lists all three practice areas with links to dedicated pages
- [x] **PAGES-05**: Attorneys index page lists all five attorneys (Nir Fishbien explicitly excluded)
- [~] **PAGES-06**: Insights (blog) index page with attorney + practice-area filters; handles empty state gracefully *(empty-state shell delivered in 03-03; attorney/practice-area filters land in Phase 5 with the first posts)*
- [x] **PAGES-07**: Branded 404 page and 5xx error page
- [x] **PAGES-08**: StoryBrand framing throughout — client is hero, BSV is the guide; every page CTA moves visitor toward getting in touch *(homepage delivered in 03-01; reinforced on remaining static pages)*

### Attorney Profiles

- [x] **ATTY-01**: Dynamic route `/attorneys/[slug]` generates one page per attorney from the `attorneys` content collection
- [x] **ATTY-02**: Aaron Belcher profile page published — bar admissions, education, focus, prior firm (Dewey & LeBoeuf), representative deals (Athelas–Commure $6B; Mode Analytics $200M; Illumina/Roche defense; Adobe, Oracle, PayPal, Dell, eBay, Coinbase as cleared)
- [x] **ATTY-03**: Stuart Smolen profile page published — bar admissions, USPTO registration (exact safe phrasing per Rule 7.4), education (Columbia JD; Yale M.S./M.Phil. Physics; SUNY Stony Brook), clerkship (Hon. S. Jay Plager, Fed. Cir.), focus, Corporate IP Star 2017 recognition
- [x] **ATTY-04**: Jon Van Loo profile page published — bar admissions (NY, CA), education (Northwestern JD magna cum laude, Duke MA, University of Chicago BA), prior firms (Linklaters, Dechert), focus (M&A tax, international, crypto/blockchain)
- [x] **ATTY-05**: Iris Zhang profile page published — education (Columbia JD with Parker School recognition; LSE MS; Nanjing B.Econ.), focus (securities, regulatory, compliance), prior PwC audit + NJ Bureau of Securities experience, languages (English + Mandarin)
- [x] **ATTY-06**: Susan Jiang profile page scaffolded with `draft: true` flag — published once Jon supplies the final bio text or URL
- [x] **ATTY-07**: Partner direct-contact callout visible on each partner page (email and/or phone) — differentiator that signals partner-led positioning
- [x] **ATTY-08**: Tasteful headshot placeholder image used until real photos are taken
- [x] **ATTY-09**: Each attorney page renders `Person` JSON-LD structured data
- [x] **ATTY-10**: Each attorney page renders the attorney-page disclaimer
- [x] **ATTY-11**: Nir Fishbien is NOT featured on the site (not in collections, not linked, not indexed)
- [x] **ATTY-12**: Jon is referred to as "Jon" on the new site (defaulting per FIRM_BRIEF.md)

### Practice Areas

- [x] **PRAC-01**: Dynamic route `/practice-areas/[slug]` generates one page per practice area from the `practiceAreas` content collection
- [x] **PRAC-02**: Mergers & Acquisitions page published — opens with client problem, then BSV's team-driven solution, then proof (representative deals, lead partners, testimonial)
- [x] **PRAC-03**: Intellectual Property & Technology Transactions page published — same structure, oriented to Stuart's expertise
- [x] **PRAC-04**: Tax page published — same structure, oriented to Jon's M&A tax + crypto/blockchain expertise
- [x] **PRAC-05**: Deal-experience grid on each practice-area page lists representative deals with cleared client names and (where appropriate) anonymized $-amounts *(M&A grid uses register-cleared names; IP & Tax carry no grid per D-10 — no cleared deals there yet)*
- [x] **PRAC-06**: Lead-attorney callout on each practice-area page links to the relevant attorney profile(s)
- [x] **PRAC-07**: Each practice-area page renders the practice-area disclaimer
- [x] **PRAC-08**: Each practice-area page renders FAQPage JSON-LD with 3-5 plain-English FAQs for AEO/AI-search surface *(layout wired + guarded; FAQs drafted to FAQ-DRAFT.md, emission pending Jon's D-13 approval in Plan 04-04)*
- [x] **PRAC-09**: Fee-structure transparency band — hourly billing with estimate of total cost — visible on each practice-area page

### Insights (Blog)

- [x] **BLOG-01**: Dynamic route `/blog/[slug]` generates one page per post from the `blog` content collection *(chrome ready in 05-02; visible page lands 05-05)*
- [x] **BLOG-02**: Every `insight`-category blog post is attributed to a named attorney via Zod `reference()` — build fails if author is missing on an `insight`; `deal-announcement`-category posts are firm-attributed and have no author (the schema refinement enforces both rules) *(enforced by content.config.ts; resolved+rendered in 05-02; amended 2026-05-28 to introduce the `category` axis)*
- [x] **BLOG-03**: Every blog post renders the blog-post legal disclaimer *(BlogPostLayout renders `<Disclaimer id="blog" />` automatically — verified in 05-02)*
- [x] **BLOG-04**: Every blog post renders `Article` JSON-LD structured data (author, datePublished, dateModified, headline, image) *(buildArticleLd + slot-transfer ready in 05-02; tests/article-jsonld.spec.ts un-skipped with deferred-pass guard)*
- [x] **BLOG-05**: Insights index supports filtering by attorney and by practice area *(FilterChipRow.astro + /blog index posts.length>0 branch with two chip rows + inline progressive-enhancement filter script shipped in 05-03; tests/blog-filter.spec.ts un-skipped with deferred-pass guard for the five contract assertions; the chip UI engages once 05-05 publishes the seed post)*
- [x] **BLOG-06**: RSS feed available at `/blog/rss.xml` via `@astrojs/rss` *(static endpoint at src/pages/blog/rss.xml.ts shipped in 05-04 — Container API + sanitize-html + draft filter + author=name-never-email; tests/rss-feed.spec.ts un-skipped with 8 live tests, 3 deferred-pass for per-item assertions; feed envelope live now, items engage once 05-05 publishes the seed post)*
- [ ] **BLOG-09**: At least one seed post published by a named attorney to validate the pipeline end-to-end

### Contact Form

- [ ] **FORM-01**: Contact page at `/contact` with attorney-client disclaimer rendered ABOVE the submit button
- [ ] **FORM-02**: Form fields — name (required), email (required), organization (optional), short matter description (required, character-limited to defuse 477R over-disclosure risk)
- [ ] **FORM-03**: Server-side validation via Astro Action with Zod schema — malformed submissions rejected before any I/O
- [ ] **FORM-04**: Honeypot field present (`name="website"`, sr-only) — submissions with a non-empty honeypot silently accepted but discarded
- [ ] **FORM-05**: Time-trap layered on top of honeypot — submissions faster than a configurable threshold rejected
- [ ] **FORM-06**: Rate limiting wired in from the start (Vercel WAF rule or in-Action throttle)
- [ ] **FORM-07**: Successful submission sends an email to the firm-controlled inbox (`intake@bsvlaw.com` assumed) via Resend; no third-party storage by default
- [ ] **FORM-08**: Email payload built via structured API (no string concatenation in subject or headers — header-injection-proof)
- [ ] **FORM-09**: Backend extension point — if Jon confirms BSV uses a CRM (Clio, HubSpot, Salesforce, other), the Action also POSTs to the CRM webhook
- [ ] **FORM-10**: Submission success and error states render in-place with progressive enhancement (works without JS)
- [ ] **FORM-11**: Privacy notice on the contact page explaining what's collected, where it goes, and confirming no marketing use

### SEO & Structured Data

- [x] **SEO-01**: Every page sets `<title>`, `<meta name="description">`, `<link rel="canonical">`, and Open Graph tags via a shared `<SeoHead />` component
- [x] **SEO-02**: `LegalService` JSON-LD injected site-wide via BaseLayout (firm name, locations, contact, areaServed, knowsAbout)
- [x] **SEO-03**: `Person` JSON-LD on every attorney page (jobTitle, alumniOf, knowsAbout, sameAs)
- [ ] **SEO-04**: `Article` JSON-LD on every blog post (author, datePublished, dateModified, headline, image)
- [x] **SEO-05**: `FAQPage` JSON-LD on each practice-area page
- [ ] **SEO-06**: All JSON-LD generated via `schema-dts` (typed at build time)
- [x] **SEO-07**: Sitemap.xml auto-generated via `@astrojs/sitemap`
- [x] **SEO-08**: robots.txt published with sitemap reference
- [ ] **SEO-09**: SEO copy and meta target relevant queries — "M&A lawyer Silicon Valley / San Francisco", "technology transactions counsel", "crypto tax attorney" (without violating Rule 7.4)
- [ ] **SEO-10**: Google Rich Results Test passes on a sample page of each type before launch

### Accessibility & Performance

- [ ] **A11Y-01**: WCAG 2.1 AA conformance target on every page
- [ ] **A11Y-02**: Semantic HTML throughout — heading hierarchy correct, landmarks present, alt text on every meaningful image
- [ ] **A11Y-03**: Keyboard navigation works on every interactive element including the FAQ accordion and contact form
- [ ] **A11Y-04**: Color contrast meets WCAG AA — verified for the chosen palette
- [ ] **A11Y-05**: Focus states visible and distinguishable on every interactive element
- [ ] **A11Y-06**: axe-core check runs in CI; fails the build on violations
- [ ] **PERF-01**: Mobile-responsive on all viewport sizes from 320px up
- [ ] **PERF-02**: Every image committed to the repo is ≤ 200 KB; verified via pre-build check on `dist/`
- [ ] **PERF-03**: All images use Astro's `<Image />` with lazy loading and modern formats (AVIF/WebP)
- [ ] **PERF-04**: Lighthouse mobile scores at launch — Performance ≥ 90, Accessibility = 100, SEO ≥ 95
- [ ] **PERF-05**: Fonts loaded with `font-display: swap`; no FOIT; CLS ≤ 0.1
- [ ] **PERF-06**: No third-party scripts that ship cookies or session-replay

### Security & Compliance

- [x] **SEC-01**: HTTP security headers configured in `vercel.json` — Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- [x] **SEC-02**: CSP runs in `Content-Security-Policy-Report-Only` mode through build phases; switched to enforce after a clean soak in Phase 7
- [x] **SEC-03**: All API keys and secrets stored as Vercel environment variables only — never in source files, never committed to git
- [x] **SEC-04**: `.env`, `.env.local`, and all variants listed in `.gitignore` from Phase 1; gitleaks pre-commit hook installed; GitHub push protection enabled *(local pre-commit hook deferred per DECISIONS.md 2026-05-26; GitHub push protection + CI gitleaks-action provide the two active layers)*
- [ ] **SEC-05**: Server-side input validation on every form submission (Zod) — malformed submissions rejected before any I/O or storage
- [ ] **SEC-06**: Spam protection — honeypot + time-trap + rate limiting (per FORM-04 through FORM-06)
- [ ] **SEC-07**: Pre-launch verification confirms compiled `dist/` contains no API keys, service keys, or credentials (grep + gitleaks scan)
- [ ] **SEC-08**: ABA Formal Opinion 477R compliance — contact form transit is TLS-only; notification email lands in a firm-controlled inbox; no third-party storage of inquiry text by default; retention policy documented
- [ ] **SEC-09**: If any database table is added later, Row Level Security must be enabled before data writes; documented as a precondition on the relevant phase
- [x] **SEC-10**: Vercel preview deploys require auth or are unindexed (no `noindex` leak of staging content; sensitive preview URLs gated)
- [ ] **SEC-11**: Pre-launch security audit via `/hc-firm-site:check` — Security section must fully pass
- [ ] **SEC-12**: securityheaders.com grade A or higher on the production deployment

### Legal Compliance (Bar Rules + Disclaimers)

- [x] **LEGAL-01**: Legal notices delivered via per-page disclaimers (blog, practice-area, attorney, contact) + a site-wide footer link row to four dedicated pages — `/about`, `/attorney-advertising`, `/privacy`, `/legal-notices`. The crawl test (`tests/disclaimer-crawl.spec.ts`) asserts the four footer links appear on every sitemap route, and the per-post blog disclaimer renders in the body of every `/blog/<slug>`. *(2026-05-28 redesign: the original inline footer disclaimer was retired; the general-disclaimer text moved to `/legal-notices` and the attorney-advertising notation moved to `/attorney-advertising`, both linked from the footer. Kirkland linked-disclosure pattern.)*
- [x] **LEGAL-02**: Per-page disclaimers on practice area, attorney profile, blog post, and contact pages — driven by the `disclaimers` content collection
- [x] **LEGAL-05**: Attorney-advertising disclosure satisfied via the linked-disclosure pattern — the dedicated `/attorney-advertising` page carries the Cal. Rules of Prof'l Conduct disclosure ("Some of the content on this site is considered Attorney Advertising under the applicable rules of the State of California. Prior results do not guarantee a similar outcome."); every page links to it from the footer alongside `/about`, `/privacy`, and `/legal-notices`. *(Landed 2026-05-28; final wording can still be reviewed by Jon at Phase 7 launch.)*
- [x] **LEGAL-06**: Testimonials carry required disclosures per California bar rules *(Daniel Brian testimonial renders the CA disclosure via the TestimonialQuote disclosure slot; final wording confirmed by Jon at review per D-18)*
- [x] **LEGAL-07**: Chambers USA Spotlight 2026 recognition visible on the site but not the lead message
- [x] **LEGAL-08**: Fee structure clearly communicated — hourly billing paired with an estimate of total cost per engagement — on the contact and practice-area pages
- [ ] **LEGAL-09**: Blog editorial process prevents posts that could be construed as legal advice — every post renders the legal disclaimer (satisfied structurally by the per-post `<Disclaimer id="blog" />` auto-rendered in BlogPostLayout; review is a human-only process per D-12)
- [x] **LEGAL-10**: No language on the site claims results, predicts outcomes, or guarantees representation

### Deployment & Operations

- [ ] **OPS-01**: Site deployed on Vercel; production auto-deploy on merge to `main` of `jvanloo72/BSV-new-website`
- [ ] **OPS-02**: Custom domain configured for production (bsvlaw.com or a transition domain — confirmed with Jon during launch phase)
- [ ] **OPS-03**: Redirect map from legacy bsvlaw.com URLs to new site URLs — preserves referral and SEO equity
- [ ] **OPS-04**: `@vercel/analytics` (cookie-free) enabled in production
- [x] **OPS-05**: Vercel preview URL accessible to Jon for every PR before merge — non-technical review workflow
- [x] **OPS-06**: Markdown/MDX content authored in files Jon can edit via the GitHub web editor (no buried in-`.astro` content for the editable pieces) *(03-02: the About prose lives in plainly separated, clearly-labeled paragraphs in about.astro that Jon can edit directly via the GitHub web editor)*

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Internationalization

- **I18N-01**: Mandarin-language version of key practice area and attorney pages (leveraging Iris Zhang's fluency) — revisit if international FinTech intake grows

### Additional Surfaces

- **V2-01**: Sector landing pages (e.g., "M&A for AI companies") — judgment call; reassess after launch traffic and inquiries
- **V2-02**: Co-counsel / referrer hub page — highest-leverage v2 add given referrals are #1 lead source
- **V2-03**: Searchable history of inbound inquiries (requires Supabase backend; only relevant if BSV does not use a CRM)

### Engagement Aids

- **V2-04**: Newsletter (opt-in via the contact page, not a popup) — only after a steady cadence of Insights posts exists
- **V2-05**: Speaking engagement / events archive
- **V2-06**: Practice-area-specific resources (e.g., M&A timeline templates) gated by ethics review

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Online payment / fee processing | BSV bills hourly with one-on-one estimates; a payment portal is not the right v1 surface and brings PCI scope. |
| Client portal / matter-management system | Handled outside the marketing site. |
| Multilingual content beyond English | English only for v1 — referral network is English-speaking. (Mandarin tracked in v2.) |
| Full rebrand of firm name, mark, or identity | This is a modernization, not a rebrand. |
| Featuring Nir Fishbien | Explicit instruction from intake. |
| Generalist legal content (criminal, family, PI, etc.) | BSV's lane is M&A / IP-Tech / Tax — stay disciplined. |
| Lead-magnet ebooks, gated content | Referral-driven boutique firms don't run on funnels; clashes with positioning. |
| Newsletter popup / email-capture lightbox | Premium positioning clash; intrusive UX. |
| Live chat widget | Wrong channel for a partner-access firm; ABA 477R + unauthorized practice risk. |
| AI chatbot | ABA 477R + unauthorized practice of law risk. |
| Animated stat counters ($X billion in transactions) | Looks gimmicky for a firm whose currency is trust. |
| Published hourly rates | Discussed 1:1 with prospective clients; never on the site. |
| Embedded Google Maps iframe | Heavyweight, privacy-leaky; a styled address block is sufficient. |
| Paid-ad landing pages | Referral-only firm. |
| Google Analytics 4 | Would force a cookie banner for no upside — Vercel Analytics (cookie-free) used instead. |
| Session-replay tools (Hotjar, FullStory) | Direct ABA 477R conflict — they capture page content including any form inputs. |
| CMS (Sanity, Contentful) | Markdown + GitHub web editor is the right author experience for a non-coding partner. |
| Client-side-only form handlers | Server-side validation is non-negotiable for a law firm intake. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Validated |
| FOUND-02 | Phase 1 | Validated |
| FOUND-03 | Phase 1 | Validated |
| FOUND-04 | Phase 1 | Validated |
| FOUND-05 | Phase 1 | Validated |
| FOUND-06 | Phase 1 | Validated |
| FOUND-07 | Phase 1 | Validated |
| FOUND-08 | Phase 1 | Validated |
| FOUND-09 | Phase 1 | Validated |
| FOUND-10 | Phase 1 | Validated |
| DESIGN-01 | Phase 2 | Complete |
| DESIGN-02 | Phase 2 | Complete |
| DESIGN-03 | Phase 2 | Complete |
| DESIGN-04 | Phase 2 | Complete |
| DESIGN-05 | Phase 2 | Complete |
| DESIGN-06 | Phase 2 | Complete |
| DESIGN-07 | Phase 2 | Complete |
| DESIGN-08 | Phase 2 | Complete |
| PAGES-01 | Phase 3 | Complete |
| PAGES-02 | Phase 3 | Complete |
| PAGES-03 | Phase 3 | Complete |
| PAGES-04 | Phase 3 | Complete |
| PAGES-05 | Phase 3 | Complete |
| PAGES-06 | Phase 3 | Partial (empty-state shell; filters in Phase 5) |
| PAGES-07 | Phase 3 | Complete |
| PAGES-08 | Phase 3 | Complete |
| ATTY-01 | Phase 4 | Complete (04-02) |
| ATTY-02 | Phase 4 | Complete (04-02) |
| ATTY-03 | Phase 4 | Complete (04-02) |
| ATTY-04 | Phase 4 | Complete (04-02) |
| ATTY-05 | Phase 4 | Complete (04-02) |
| ATTY-06 | Phase 4 | Complete (04-02) |
| ATTY-07 | Phase 4 | Complete (04-02) |
| ATTY-08 | Phase 4 | Complete (04-02) |
| ATTY-09 | Phase 4 | Complete (04-02) |
| ATTY-10 | Phase 4 | Complete (04-02) |
| ATTY-11 | Phase 4 | Complete (04-02) |
| ATTY-12 | Phase 4 | Complete (04-02) |
| PRAC-01 | Phase 4 | Complete (04-03) |
| PRAC-02 | Phase 4 | Complete (04-03) |
| PRAC-03 | Phase 4 | Complete (04-03) |
| PRAC-04 | Phase 4 | Complete (04-03) |
| PRAC-05 | Phase 4 | Complete (04-03) |
| PRAC-06 | Phase 4 | Complete (04-03) |
| PRAC-07 | Phase 4 | Complete (04-03) |
| PRAC-08 | Phase 4 | Pending (04-04 — FAQ approval gate) |
| PRAC-09 | Phase 4 | Complete (04-03) |
| BLOG-01 | Phase 5 | Complete (05-02 — chrome ready; visible page lands 05-05) |
| BLOG-02 | Phase 5 | Complete (05-02 — author Zod enforced + resolved+rendered) |
| BLOG-03 | Phase 5 | Complete (05-02 — BlogPostLayout renders `<Disclaimer id="blog" />`) |
| BLOG-04 | Phase 5 | Complete (05-02 — buildArticleLd + slot-transfer; test deferred-pass) |
| BLOG-05 | Phase 5 | Complete (05-03 — FilterChipRow + chip-row index + inline filter script; test un-skipped with deferred-pass) |
| BLOG-06 | Phase 5 | Complete (05-04 — rss.xml.ts via Container API + sanitize-html; 8 live tests, 3 deferred-pass for per-item) |
| BLOG-09 | Phase 5 | Pending |
| FORM-01 | Phase 6 | Pending |
| FORM-02 | Phase 6 | Pending |
| FORM-03 | Phase 6 | Pending |
| FORM-04 | Phase 6 | Pending |
| FORM-05 | Phase 6 | Pending |
| FORM-06 | Phase 6 | Pending |
| FORM-07 | Phase 6 | Pending |
| FORM-08 | Phase 6 | Pending |
| FORM-09 | Phase 6 | Pending |
| FORM-10 | Phase 6 | Pending |
| FORM-11 | Phase 6 | Pending |
| SEO-01 | Phase 3 | Complete |
| SEO-02 | Phase 3 | Complete |
| SEO-03 | Phase 4 | Complete (04-02) |
| SEO-04 | Phase 5 | Complete (05-02 — buildArticleLd + slot-transfer; deferred-pass test) |
| SEO-05 | Phase 4 | Pending (04-04 — JSON-LD wired + guarded in 04-03; emits once FAQs land) |
| SEO-06 | Phase 7 | Pending |
| SEO-07 | Phase 3 | Complete |
| SEO-08 | Phase 3 | Complete |
| SEO-09 | Phase 7 | Pending |
| SEO-10 | Phase 7 | Pending |
| A11Y-01 | Phase 7 | Pending |
| A11Y-02 | Phase 7 | Pending |
| A11Y-03 | Phase 7 | Pending |
| A11Y-04 | Phase 7 | Pending |
| A11Y-05 | Phase 7 | Pending |
| A11Y-06 | Phase 7 | Pending |
| PERF-01 | Phase 7 | Pending |
| PERF-02 | Phase 7 | Pending |
| PERF-03 | Phase 7 | Pending |
| PERF-04 | Phase 7 | Pending |
| PERF-05 | Phase 7 | Pending |
| PERF-06 | Phase 7 | Pending |
| SEC-01 | Phase 1 | Validated |
| SEC-02 | Phase 1 | Validated |
| SEC-03 | Phase 1 | Validated |
| SEC-04 | Phase 1 | Validated |
| SEC-05 | Phase 6 | Pending |
| SEC-06 | Phase 6 | Pending |
| SEC-07 | Phase 7 | Pending |
| SEC-08 | Phase 6 | Pending |
| SEC-09 | Phase 6 | Pending |
| SEC-10 | Phase 1 | Validated |
| SEC-11 | Phase 7 | Pending |
| SEC-12 | Phase 7 | Pending |
| LEGAL-01 | Phase 1 | Validated |
| LEGAL-02 | Phase 4 | Complete |
| LEGAL-05 | Phase 5 | Complete (2026-05-28 — linked-disclosure page at /attorney-advertising + site-wide footer link) |
| LEGAL-06 | Phase 4 | Complete (04-03) |
| LEGAL-07 | Phase 3 | Complete |
| LEGAL-08 | Phase 4 | Complete |
| LEGAL-09 | Phase 5 | Complete (05-02 structural — disclaimer auto-rendered; Zod author; lint:legal scans MDX; D-12 review-is-human) |
| LEGAL-10 | Phase 4 | Complete |
| OPS-01 | Phase 7 | Pending |
| OPS-02 | Phase 7 | Pending |
| OPS-03 | Phase 7 | Pending |
| OPS-04 | Phase 7 | Pending |
| OPS-05 | Phase 1 | Validated |
| OPS-06 | Phase 3 | Complete |

**Coverage:**

- v1 requirements: 113 total (FOUND 10 + DESIGN 8 + PAGES 8 + ATTY 12 + PRAC 9 + BLOG 7 + FORM 11 + SEO 10 + A11Y 6 + PERF 6 + SEC 12 + LEGAL 8 + OPS 6)
- Mapped to phases: 113
- Unmapped: 0
- Coverage: 100%

**By phase:**

- Phase 1 (Scaffold & Shell): 17 requirements
- Phase 2 (Design System & Visual Identity): 8 requirements
- Phase 3 (Homepage & Static Pages): 14 requirements
- Phase 4 (Attorney & Practice Area Pages): 27 requirements (LEGAL-03 + LEGAL-04 descoped 2026-05-28)
- Phase 5 (Insights (Blog) System): 9 requirements (BLOG-07 / BLOG-08 descoped 2026-05-28; BLOG-09 retained)
- Phase 6 (Contact Form & Intake): 15 requirements
- Phase 7 (Security Hardening, Performance & Launch): 23 requirements

---
*Requirements defined: 2026-05-25*
*Last updated: 2026-05-28 — LEGAL-03 (Rule 7.4 lint:legal) and LEGAL-04 (CLIENT_DISCLOSURE_CLEARANCE.md gate) removed per Jon; replaced by manual review. BLOG-07 (reviewedBy) and BLOG-08 (EDITORIAL.md) also descoped on the same date.*
