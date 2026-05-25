# Project Research Summary

**Project:** Belcher, Smolen & Van Loo LLP — Website
**Domain:** Boutique law firm marketing website (referral-close, not lead-acquisition)
**Researched:** 2026-05-25
**Confidence:** HIGH (overall)

## TL;DR for Jon

Six things to take away before reading anything else:

1. **What we're building.** A modern, premium-but-warm marketing site for BSV on Astro 6 + Tailwind v4, deployed on Vercel. Static everywhere except the contact form, which runs as one small server function.
2. **What's locked in.** Astro 6, Tailwind v4, GitHub, Vercel. Astro Actions + Zod for the contact form. Resend for sending the inquiry email. `@vercel/analytics` (cookie-free) for traffic. `schema-dts` for JSON-LD.
3. **What kind of site this is.** A *referral-close* site, not a *lead-acquisition* site. Most visitors arrive already warm (someone referred them). Every page exists to answer three questions: *competent? experienced? responsive?* — not "fill in this form."
4. **The single biggest decision left.** Does BSV use a CRM today (Clio, HubSpot, Salesforce)? If yes, the contact form will post to that CRM in addition to sending an email. If no, the form just sends an email via Resend.
5. **The single biggest risk.** California Rule 7.4: the words "specialist," "expert," and "specialize" are off-limits in our copy (except Stuart's USPTO registration). We'll add an automated check that fails the build if those words appear.
6. **The three things we will deliberately *not* build.** Live chat widget. Lead-magnet ebook downloads. Newsletter popups. Each one would clash with how BSV actually wins clients.

## Executive Summary

BSV's new site is a **referral-close marketing site** — its job is to reassure a prospect who has already heard about BSV from a referrer, not to generate cold leads. That inverts the usual marketing-site priorities: page copy answers "competent, experienced, responsive?" instead of "convert this visitor." The build is a static Astro 6 site with file-based content collections (attorneys, practice areas, deals, blog posts, testimonials) — each piece of content lives as a Markdown/MDX file that Jon can edit directly on GitHub without touching code. The only server-side surface is an Astro Action handling the contact form on Vercel, with Zod validation, a honeypot, and rate-limiting.

The visual direction is **premium foundation (Norm Law) + selective creative graphics (one custom abstract hero + a stylized practice-area icon set)** — restrained overall, warmer than Norm because BSV serves both tech founders and large public acquirers. Color palette is the one piece of the design system deliberately deferred until the design phase.

Three risks dominate the build, and they are **legal, not technical**: (1) the site-wide footer disclaimer must render on every page — we'll add a Playwright test that asserts it; (2) California Rule 7.4 bans "specialist"/"expert"/"specialize" in firm copy — we'll add a `lint:legal` script that fails the build if those words appear; (3) every named client and counterparty in deal experience must be cleared before publication — we'll keep a `CLIENT_DISCLOSURE_CLEARANCE.md` gate. Technical pitfalls (Astro 6 / Tailwind v4 stack-specific gotchas, CSP misconfiguration, image weight) are well-understood and addressed in the dedicated security phase before launch.

## Key Findings

### Recommended Stack

The top of the stack is pre-decided (Astro 6 + Tailwind v4 + GitHub + Vercel). Research focused on the libraries that sit on top and the contact-form backend decision. Full detail in `.planning/research/STACK.md`.

**Core technologies (locked):**
- **Astro 6.3.7** — static site generator, content-first, file-based routing. Requires Node ≥ 22.12.
- **Tailwind CSS v4.3.0** — CSS-first config via `@theme` directive; no `tailwind.config.js`. Integrated via `@tailwindcss/vite`.
- **GitHub** — version control. Repo: `jvanloo72/BSV-new-website`. Push protection + gitleaks scanning recommended.
- **Vercel** — hosting, preview deploys, auto-deploy on merge to `main`. Vercel adapter for Astro is `@astrojs/vercel@10.x`.

**Complementary recommendations:**
- **Astro Actions + Zod** — built-in Astro 6, server-side form validation with CSRF tokens. ABA 477R-aligned out of the box.
- **Resend** — primary contact-form backend recommendation. SOC 2 Type II + GDPR compliant. Email-only — inquiry data never leaves the firm's existing email system.
- **`@vercel/analytics`** — cookie-free, hashed visitors, first-party. No cookie banner needed. Explicitly NOT GA4, NOT session-replay.
- **`schema-dts`** — typed JSON-LD generation (`LegalService`, `Person`, `Article`). Type-checked at build time.
- **Astro `<Image />` + Sharp** — built-in image optimization. Vercel edge optimization off (every image known at build time).
- **`@astrojs/sitemap` + `@astrojs/rss`** — auto-generated sitemap and blog RSS.
- **`astro-icon`** — for the stylized practice-area icon set.
- **Playwright + axe-core + Lighthouse CI** — accessibility and performance gates. Targets: Perf ≥ 90, A11y = 100, SEO ≥ 95.

**Explicitly NOT using:**
- Google Analytics 4 — would force a cookie banner for no upside.
- Session-replay tools (Hotjar, FullStory) — direct ABA 477R conflict.
- Client-side form handlers — server-side validation is non-negotiable for a law firm intake.
- A CMS (Sanity, Contentful) — Markdown + GitHub web editor is the right author experience for a non-coding partner.

### Expected Features

Full detail in `.planning/research/FEATURES.md`. Categorized by table-stakes vs differentiators vs deliberately-out-of-scope.

**Must have (table stakes — every credible firm site has these):**
- Homepage with hero (lead message "Team work to get good results"), three-practice-area teaser, attorney row, selected proof points, CTA to contact
- About / firm overview page (history, locations, recognition including Chambers USA Spotlight 2026)
- Three practice-area pages — M&A, IP & Technology Transactions, Tax — each on its own URL (`/practice-areas/[slug]`)
- Five attorney profile pages — Belcher, Smolen, Van Loo, Zhang, Jiang (Nir Fishbien excluded). Each: photo (placeholder ok), bio, bar admissions, education, focus areas, representative experience
- Blog ("Insights") with named-attorney attribution, per-post disclaimer, RSS, filtering by attorney and practice area
- Contact page with intake form: name, email, organization, brief description of matter (truncated to defuse 477R risk), attorney-client disclaimer above the submit button
- Site-wide footer disclaimer
- Per-page disclaimers on practice area, attorney profile, and blog post pages
- Mobile-responsive, accessible (WCAG 2.1 AA)
- JSON-LD on every page (`LegalService` site-wide, `Person` on attorney pages, `Article` on blog posts)
- SEO meta (title, description, canonical URL, og:image) per page
- Sitemap.xml, robots.txt
- 404 + 5xx error pages

**Differentiators (recommended IN for v1):**
- **Deal-experience grid on practice-area pages** — representative deals with anonymized $-amounts and parties (where pre-cleared). The "proof not adjectives" rule
- **Partner direct-contact callouts on attorney pages** — surface partner email/phone directly. BigLaw hides this; surfacing it proves the "partner-led" positioning structurally
- **Testimonial pull-quotes** — Daniel Brian (Commure GC) on the $6B Athelas–Commure merger is the marquee example
- **Fee-structure transparency band** — short, plain-English explanation of "hourly billing with cost estimate per engagement," visible on contact + practice-area pages
- **Custom abstract hero graphic + stylized practice-area icon set** — Jon's "creative art" requirement, applied with restraint
- **FAQPage schema on practice-area pages** — structured FAQs that double as AEO/AI-search surface

**Differentiators (deferred to v1.x):**
- **Sector landing pages** (e.g., "M&A for AI companies") — judgment call; reassess after launch
- **Co-counsel / referrer hub page** — highest leverage given referrals are #1 lead source, but worth asking Jon at copy phase before committing

**Anti-features (deliberately NOT building — these would clash with positioning):**
- Live chat widget — wrong channel for a partner-access firm
- Lead-magnet ebooks / gated content — referral-driven boutiques don't run on funnels
- Newsletter popup or email-capture lightbox — clashes with premium positioning
- Animated stat counters ("$50B in transactions") — looks gimmicky for a firm whose currency is trust
- Published hourly rate — discussed 1:1, never on the site
- Embedded Google Maps iframe — heavyweight, privacy-leaky; a styled address block is enough
- AI chatbot — ABA 477R + unauthorized practice of law risk
- Paid-ad landing pages — referral-only firm
- Online payments — not v1 surface

### Architecture Approach

Full detail in `.planning/research/ARCHITECTURE.md`. The architecture is deliberately small-footprint so it stays legible to a non-coding partner.

**Major components:**
1. **One `BaseLayout.astro` + three specialized layouts** — `AttorneyLayout`, `PracticeAreaLayout`, `BlogPostLayout` using Astro's slot-transfer pattern. Every page goes through BaseLayout, which injects the site-wide disclaimer, header, and footer.
2. **Five content collections (Zod-typed)** in `src/content/`:
   - `attorneys` — 5 attorney bios (MDX), schema enforces required fields, image budget via `image()` schema helper
   - `practiceAreas` — 3 practice areas (MDX), references lead attorneys via Zod `reference()`
   - `blog` — Insights posts (MDX), `author` references attorneys collection (build fails if author missing), `reviewed_by` required
   - `testimonials` — quote, attribution, role, optional matter
   - `disclaimers` — keyed by id (`footer`, `contact`, `blog`, `practice-area`, `attorney`); single source of truth for compliance text
3. **Three dynamic routes** generated at build via `getStaticPaths()`: `/attorneys/[slug]`, `/practice-areas/[slug]`, `/blog/[slug]`. Index pages for each section are static.
4. **Reusable section components** in `src/components/sections/` (Hero, PracticeAreaCard, AttorneyCard, TestimonialQuote, DealsGrid, FeeStructureBand, CtaBlock, FaqAccordion) consumed by both index pages and individual templates.
5. **`<Disclaimer id="..." />` component** — reads from the `disclaimers` collection and renders. One edit when compliance updates wording.
6. **`<JsonLd />` component + builder functions in `src/lib/jsonld.ts`** — LegalService injected site-wide via BaseLayout; Person added by AttorneyLayout via `head` slot; Article added by BlogPostLayout via `head` slot.
7. **Contact form via Astro Action** in `src/actions/index.ts` — Zod input schema, honeypot field (`name="website"`, sr-only), time-trap, rate limit. `dispatchInquiry()` function is the single backend seam (Resend email, plus optional CRM webhook).
8. **`vercel.json`** — CSP (report-only during build, enforced before launch), X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
9. **Design system in `src/styles/global.css`** — Tailwind v4 `@theme { --color-* ... }` block. Neutral tokens during build; one CSS file edit when design phase locks the palette.

**Data flow:** Markdown/MDX files in `src/content/` → Astro Content Collections (Zod-validated at build) → Layout templates → Section components → Rendered HTML at build time.

### Critical Pitfalls

Full detail in `.planning/research/PITFALLS.md` (20 pitfalls, prevention strategies, phase mapping). The highest-leverage ones:

1. **California Rule 7.4 — "specialist" / "expert" / "specialize" language** — Off-limits without certification. Prevention: `npm run lint:legal` script that scans content for banned terms; fails the build if found. Alternative phrasing: "focused on," "concentrated in," "transaction-focused." Stuart's USPTO registration is the one permitted specialist claim with exact safe phrasing in PITFALLS.md.
2. **ABA Formal Opinion 477R — confidentiality of pre-engagement inquiries** — Plaintext transit, insecure storage, personal-Gmail notification destination, no retention policy are all violations. Prevention: TLS-only intake, encrypted at rest if stored, firm-controlled inbox (`intake@bsvlaw.com`), documented retention policy.
3. **Client-disclosure clearance for representative deals** — The existing bsvlaw.com client list cannot be assumed cleared for the new site. Prevention: `.planning/CLIENT_DISCLOSURE_CLEARANCE.md` reviewed before any bio publishes — non-deferable gate.
4. **Site-wide footer disclaimer missing on a page** — Single biggest compliance hole on law firm sites. Prevention: Playwright crawl test asserts the disclaimer renders on every route; runs in CI.
5. **CSP that blocks the site's own assets** — Common Vercel/Astro launch killer. Prevention: deploy in `Content-Security-Policy-Report-Only` mode early in the build, collect violations as the site grows, switch to enforce only after weeks of clean reports.
6. **Astro 6 / Tailwind v4 stack-specific gotchas** — AI-trained patterns steer toward v3/v5 syntax. Removed: `output: 'hybrid'`. Changed: `getStaticPaths()` params must be strings; `theme()` function deprecated; `border` defaults to `currentColor`. Prevention: lock to docs-current patterns in scaffold phase; include a `tailwind.config.mjs` migration check.
7. **`.env` or `.env.local` committed to git** — Catastrophic for a law firm. Prevention: `.gitignore` entries + gitleaks pre-commit hook + GitHub push protection enabled on repo.
8. **Image weight on hero + headshots** — Mobile performance killer. Prevention: 200 KB-per-image budget enforced via `image()` schema in content collections; pre-launch grep of `dist/`.
9. **JSON-LD that doesn't validate** — Google Rich Results silently fails. Prevention: `schema-dts` for compile-time type safety + pre-launch Rich Results Test pass.
10. **Renaming attorney URL slugs after launch** — Breaks referral links + SEO. Prevention: lock slugs in scaffold phase; never rename; if a name changes, add a redirect.

Phase-mapped pitfall summary:
- **Early-phase blockers:** `.gitignore` + gitleaks; `<Disclaimer />` plumbing in BaseLayout; URL convention lock-in; Astro 6 / Tailwind v4 pattern adherence; markdown-driven content architecture; Vercel preview-deploy workflow.
- **Middle-phase blockers:** `<JsonLd />` with Zod-validated schemas; `lint:legal` banned-terms script; CLIENT_DISCLOSURE_CLEARANCE.md gate before bios ship; honeypot + time-trap together; structured email API (no header concatenation); editorial review gate for blog.
- **Late-phase blockers:** CSP enforce (after report-only soak); rate limiting via Vercel WAF; security headers audit (securityheaders.com A+); Google Rich Results Test; Lighthouse mobile ≥ 90; gitleaks history audit; 200 KB-per-image verification on `dist/`.

## Implications for Roadmap

Suggested phase structure (7 phases), tuned to the granularity setting (Standard) and MVP project mode (vertical slices):

### Phase 1: Scaffold & Shell
**Rationale:** Every other phase depends on the foundation. Once disclaimer plumbing, content-collection schemas, security baseline, and Tailwind v4 design tokens are in, the rest is straight building.
**Delivers:** `npm create astro@latest` project; `astro add tailwind` + `astro add vercel` + `astro add mdx` + `astro add sitemap`; `BaseLayout.astro` with `<SiteHeader />`, `<SiteFooter />`, `<Disclaimer id="footer" />`, `<JsonLd />` slot; five Zod-typed content collections (attorneys, practiceAreas, blog, testimonials, disclaimers); URL conventions locked; `.gitignore` + `.env` rules + gitleaks; `vercel.json` with CSP report-only; preview-deploy workflow verified.
**Addresses:** Table-stakes foundation; preempts pitfalls 4, 5, 6, 7, 10.
**Avoids:** Disclaimer-missing crawl, CSP-blocking-own-site, secret leaks.

### Phase 2: Design System & Visual Identity
**Rationale:** Color palette is the one design decision deliberately deferred — it needs Jon's input. Once locked, every component reads from the same `@theme` tokens, so a swap later is a single-file edit.
**Delivers:** Color palette decision (Jon picks from 2-3 options); `@theme` tokens in `src/styles/global.css`; typography scale; spacing scale; reusable section components — `Hero`, `PracticeAreaCard`, `AttorneyCard`, `TestimonialQuote`, `DealsGrid`, `FeeStructureBand`, `CtaBlock`, `FaqAccordion`; custom abstract hero SVG + stylized practice-area icon set commissioned.
**Uses:** Tailwind v4 `@theme`, `astro-icon`.
**Implements:** Component library that powers Phases 3–5.

### Phase 3: Homepage & Static Pages
**Rationale:** Once the component library exists, index pages compose quickly. Homepage is the highest-stakes page; getting it right early gives Jon something visible to react to.
**Delivers:** Homepage (hero with lead message, practice-area teaser, attorney row, marquee testimonial, recognition strip, CTA); About page; Practice Areas index; Attorneys index; Insights index (empty state ok); 404 + 5xx pages.
**Addresses:** Table-stakes pages 1-5.
**Avoids:** "Lead with credentials" copy mistake — StoryBrand structure enforced.

### Phase 4: Attorney & Practice Area Pages
**Rationale:** Dynamic-route templates + content seeding. Susan Jiang's bio published as `draft: true` until Jon supplies it. Representative-deals content gated by CLIENT_DISCLOSURE_CLEARANCE.md.
**Delivers:** `/attorneys/[slug]` dynamic route + 5 attorney MDX files (Belcher, Smolen, Van Loo, Zhang published; Jiang draft); `/practice-areas/[slug]` dynamic route + 3 practice-area MDX files (M&A, IP & Tech Transactions, Tax); deal-experience grid populated with cleared deals; partner direct-contact callouts; Person + LegalService JSON-LD on each.
**Addresses:** Table-stakes pages 6-10; differentiators (deal grid, partner contact, fee band).
**Avoids:** Rule 7.4 "specialist" copy violation (lint:legal enforced); confidentiality leak (CLIENT_DISCLOSURE_CLEARANCE.md gate).

### Phase 5: Blog (Insights) System
**Rationale:** Blog has more compliance surface than features. Per-post named-attorney attribution and per-post disclaimer must be enforced at the schema level, not the editor's discretion.
**Delivers:** `/blog/[slug]` dynamic route; Insights index with attorney + practice-area filters; RSS feed via `@astrojs/rss`; Article JSON-LD on each post; editorial guidelines doc; one or two seed posts authored by a named attorney to validate the pipeline.
**Addresses:** Blog table stakes; AEO/SEO surface area.
**Avoids:** Anonymous-post compliance hole (Zod schema requires `author` reference); missing disclaimer (BlogPostLayout enforces).

### Phase 6: Contact Form
**Rationale:** Backend choice (Resend-only vs Resend + CRM webhook) is blocked on Jon's answer about whether BSV uses a CRM. Form rendering can proceed in parallel with a stub `dispatchInquiry()`; backend integration happens once Jon confirms.
**Delivers:** Contact page with attorney-client disclaimer above submit; Astro Action with Zod input schema, honeypot, time-trap, server-side validation; rate limiting via Vercel WAF or in-Action throttle; Resend email dispatch to `intake@bsvlaw.com` (assumed); optional CRM webhook dispatch.
**Addresses:** Table-stakes contact form; non-negotiable security checklist.
**Avoids:** ABA 477R violation (encrypted transit, firm-controlled inbox); header injection in email subject (structured API); honeypot bypass (time-trap layered on top).

### Phase 7: Security Hardening & Launch
**Rationale:** Site is functionally complete before security gates are enforced. CSP soaks in report-only mode through Phases 3-6; this phase enforces it. Pre-launch image and credential audits run here.
**Delivers:** CSP switched from report-only to enforce in `vercel.json`; all security headers verified (securityheaders.com A+); image budget audit (every `dist/` image ≤ 200 KB); gitleaks history audit (`git log --all -- '.env*'` returns nothing); Google Rich Results Test pass; Lighthouse mobile Perf ≥ 90, A11y = 100, SEO ≥ 95; redirect map from legacy bsvlaw.com URLs; `/hc-firm-site:check` audit fully passing; pre-launch content review with Jon.
**Addresses:** All security non-negotiables from FIRM_BRIEF + CLAUDE.md.
**Avoids:** Late-phase blockers from pitfalls list.

### Phase Ordering Rationale

- **Scaffold first** because every other phase reads from the content schemas and renders through `BaseLayout` — getting them wrong cascades.
- **Design system before pages** so each page-building phase composes from a stable component library rather than re-inventing styles.
- **Static pages before dynamic** because dynamic routes (Phases 4–5) depend on layouts and section components built in Phases 2–3.
- **Contact form late** because it's the only server-side surface and its backend choice is blocked on a Jon decision — building it last lets the rest of the site progress regardless.
- **Security last** because CSP needs the full site rendered before it can be tightened safely; image/credential audits need the final build.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2** — `gsd-ui-phase` recommended. Color palette options and visual identity decisions need Jon's input via mocks.
- **Phase 6** — depends on Jon's CRM answer. If "yes, we use X," a small research spike on that CRM's webhook may be warranted.
- **Phase 7** — CSP enforcement specifics depend on what the report-only mode captured during Phases 3–6. The exact `Content-Security-Policy` directive is data-driven.

Phases with standard well-documented patterns (no extra research needed):
- **Phases 1, 3, 4, 5** — all standard Astro 6 + Tailwind v4 patterns; STACK.md and ARCHITECTURE.md cover them.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified against npm registry on 2026-05-25; Resend/Vercel/Astro compliance posture confirmed via Context7 against official docs |
| Features | HIGH | Cross-referenced against `.planning/LAW_FIRM_WEBSITE_GUIDE.md` + PROJECT.md Active Requirements + named visual references (Strix, Norm) |
| Architecture | HIGH | Astro Content Collections, dynamic routes, Actions, BaseLayout slot transfer, Tailwind v4 `@theme` all verified via Context7-indexed docs |
| Pitfalls (technical) | HIGH | Astro 6 / Tailwind v4 / Vercel / CSP / rate limiting patterns Context7-verified |
| Pitfalls (legal — CA Rules) | MEDIUM | Rule text and numbering shift periodically; Jon should sanity-check disclaimer language and Rule 7.4 phrasing against current State Bar guidance before launch |
| Honeypot vs modern bots | MEDIUM | Pattern is well-known but bot sophistication shifts; measure spam volume in first 2 weeks post-launch and layer Turnstile/hCaptcha if needed |

**Overall confidence:** HIGH

### Gaps to Address

- **Contact form backend depends on Jon's CRM answer** — handled by Phase 6 question gate. If the answer is "no CRM," default to Resend-only (already the primary recommendation).
- **Color palette** — handled by Phase 2 design phase. Build proceeds with neutral tokens until then.
- **Susan Jiang's bio + URL slug** — handled by Phase 4 with `draft: true`; Jon supplies before launch.
- **Headshots not yet shot** — placeholders throughout build; swap before launch.
- **California Rule 7.4 / Attorney Advertising footer language** — Jon to verify final wording against current State Bar guidance during Phase 7 content review.

## Open Decisions Owed (Jon)

These get resurfaced at the relevant phase, but logging them here for visibility:

1. **CRM question** — Does BSV use Clio Grow, HubSpot, Salesforce, or any other intake system today? *(blocks Phase 6 backend decision)*
2. **Notification inbox** — Confirm `intake@bsvlaw.com` or substitute. *(Phase 6)*
3. **Color palette** — Pick from 2–3 options the design phase will propose. *(Phase 2)*
4. **Susan Jiang** — Paste current bsvlaw.com URL or final bio text. *(Phase 4)*
5. **"Attorney Advertising" footer label** — Confirm exact wording per CA + NY bar rules. *(Phase 7)*
6. **Client-disclosure clearance** — Who reviews the deal list and by when. *(Phase 4 gate)*
7. **Headshot shoot date** — Schedule so finals can swap in before launch.
8. **Preferred name** — "Jon" vs "Jonathan" (defaulting to "Jon" per FIRM_BRIEF).
9. **Co-counsel / referrer hub page** — judgment call at copy phase; ask Jon before committing.

## Sources

### Primary (HIGH confidence)
- Context7-indexed `docs.astro.build` — Astro 6 patterns: Content Collections, dynamic routes, Actions, layouts, image pipeline, Vercel adapter
- Context7-indexed `tailwindlabs/tailwindcss.com` — Tailwind v4 `@theme`, `@tailwindcss/vite`, CSS-first config
- Context7-indexed Resend docs — SOC 2 Type II, GDPR posture, transport security
- Context7-indexed Vercel docs — Analytics (cookie-free), security headers, edge functions, WAF rate limiting
- `npm view` registry queries (2026-05-25) — version verification for all recommended packages
- `.planning/LAW_FIRM_WEBSITE_GUIDE.md` — firm-supplied best practices for law firm websites
- `.planning/FIRM_BRIEF.md` — firm intake, positioning, visual references, security requirements
- `.claude/CLAUDE.md` — project conventions, stack lock-in, communication style

### Secondary (MEDIUM confidence)
- General professional-responsibility framing for ABA Formal Opinion 477R and California Rules of Professional Conduct 1.6, 1.18, 7.1, 7.4, 8.2 — research-level interpretation; Jon to verify against current State Bar guidance before launch

### Tertiary (LOW confidence)
- Bot-sophistication trend lines for honeypot effectiveness — measure spam volume post-launch and layer additional protection if needed

---
*Research completed: 2026-05-25*
*Ready for roadmap: yes*

