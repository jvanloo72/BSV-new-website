<!-- GSD:project-start source:PROJECT.md -->

## Project

**Belcher, Smolen & Van Loo LLP — Website**

A modern website for **Belcher, Smolen & Van Loo LLP** (BSV), a boutique
California law firm focused on Mergers & Acquisitions, Intellectual Property
& Technology Transactions, and Tax for the technology, life sciences,
cryptocurrency, FinTech, and AI industries. The site replaces the existing
bsvlaw.com with a contemporary, premium-but-warm design that emphasizes the
firm's collaborative, team-driven approach and the outcomes it delivers —
rather than leading with credentials.

**Core Value:** A prospective client (founder, GC, PE/VC operator, or co-counsel referrer)
who lands on the site comes away convinced that BSV has the **competence,
experience, and responsiveness** to handle their specific transaction —
and reaches out via the contact form or referral path.

### Constraints

- **Tech stack**: Astro 6 + Tailwind CSS v4 + GitHub + Vercel — already decided. Do not propose alternatives.
- **Contact form backend**: TBD — present options (Supabase + Resend, Formspree, Netlify Forms, direct SMTP, CRM webhook) when we reach the form phase. Choice depends on what BSV already uses for intake.
- **Hosting**: Vercel — production deploy auto-runs on merge to `main` of `jvanloo72/BSV-new-website`.
- **Security (non-negotiable for a law firm site)**: vercel.json security headers; secrets in Vercel env only; `.env` in `.gitignore`; server-side input validation; honeypot on contact form; built `dist/` verified to contain no credentials; ABA 477R-compliant intake.
- **Performance**: fast on mobile — image budget of 200 KB per committed asset.
- **Per-page legal**: footer disclaimer everywhere; per-page disclaimers on practice area, attorney, blog, and contact pages.
- **Communication style**: every command and concept explained in plain English before it runs; no assumption of prior coding knowledge.
- **Decision log**: every significant decision appended to `.planning/DECISIONS.md` (HeyCounsel community documentation).

<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

## Recommended Stack

### Core Technologies (locked — confirmed current as of 2026-05-25)

| Technology | Version | Purpose | Why for BSV |
|------------|---------|---------|-------------|
| Astro | **6.3.7** | Static site framework | Already locked. Confirmed latest on npm. Requires Node ≥22.12. Content collections + server actions are the killer features for a content-driven law-firm site. |
| Tailwind CSS | **4.3.0** | Styling | Already locked. Confirmed latest on npm. v4 uses the new Vite plugin (`@tailwindcss/vite`) and a single `@import "tailwindcss";` line — no config file required for our use case. |
| `@tailwindcss/vite` | **4.3.0** | Tailwind v4 integration into Astro's Vite pipeline | Installed automatically when you run `npx astro add tailwind` on Astro ≥5.2 (Astro docs confirm this is the v4 path). |
| Node.js | **≥22.12 LTS** | JavaScript runtime | Required by Astro 6 (peer engine). Vercel build images already support Node 22. |
| `@astrojs/vercel` | **10.0.7** | Vercel adapter | Peer-deps `astro: ^6.0.0`. Required to use Vercel's image optimization API and serverless functions for the contact form action. |

### Content & Blog

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Astro Content Collections** (built-in `astro:content`) | (built-in to 6.3.7) | Type-safe collections for blog posts, attorney bios, practice areas, testimonials | Use for **every** content surface. Define a `src/content.config.ts` with Zod schemas — e.g. an `attorneys` collection enforces a `name`, `bar`, `barJurisdictions[]`, `slug`, `photo`, `bio` schema, so a missing field is a build error, not a silently broken page. This is the #1 reliability win for a non-technical author. |
| `@astrojs/mdx` | **5.0.6** | MDX support inside content collections | Blog posts. MDX lets each blog post include a `<Disclaimer />` component automatically + structured callouts ("Practical takeaway", "Tax warning") without hand-writing HTML. Plain Markdown is enough for attorney bios and practice areas. |
| `@astrojs/rss` | **4.0.18** | RSS feed generation for `/blog/rss.xml` | Required for blog SEO + for referrers (other lawyers) to subscribe. Astro docs show the canonical `getCollection('blog').map(...)` recipe. |
| `@astrojs/sitemap` | **3.7.2** | Auto-generate `sitemap-index.xml` and `sitemap-0.xml` | SEO baseline — Google needs this to crawl the practice-area subpages efficiently. Zero-config: add the integration, set `site:` in `astro.config.mjs`. |
| `shiki` | **4.1.0** (transitively bundled by Astro) | Syntax highlighting inside MDX | Not strictly needed for a law firm site (no code blocks), but Astro ships it by default — no install required. |
| `rehype-external-links` | **3.0.0** | Auto-add `rel="noopener noreferrer"` + `target="_blank"` to external links in MDX | Security + UX hygiene on blog posts that cite court cases / IRS bulletins / SEC filings. |
| `sanitize-html` | (per Astro RSS recipe) | Sanitize MDX → RSS HTML | Only needed if we publish full-content RSS (not just summaries). Defer until the blog has 3+ posts. |

### Forms & Backend (the consequential decision)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Astro Actions** (`astro:actions`, built-in) | (built-in to 6.3.7) | Server-validated form submission endpoint | **Use this regardless of which email backend wins.** `defineAction({ accept: 'form', input: z.object({...}) })` runs server-side on Vercel and gives us Zod validation, CSRF tokens, and progressive enhancement (works without JS) — for free. This is what ABA 477R wants: server-side validation, not just browser validation. |
| `astro/zod` (re-exported by Astro) | (built-in to 6.3.7) | Schema validation inside Actions | Re-exported by Astro itself (`import { z } from 'astro/zod'`) so we don't need a separate `zod` install. |
| **Resend** (`resend`) | **6.12.4** | Transactional email (sends the lead notification to `intake@bsvlaw.com`) | **Primary recommendation for the email side.** See the "Contact Form Backend — Prescriptive Recommendation" section below. |

### SEO & Structured Data

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **`schema-dts`** | **1.1.0** | TypeScript types for Schema.org / JSON-LD | Use for the firm-level `LegalService` schema, attorney `Person` schema, blog `Article` schema. Hand-rolled JSON-LD will typo silently; `schema-dts` makes a misspelled property a TypeScript error. We embed the JSON-LD in a `<script type="application/ld+json">` tag in a shared `<BaseLayout>` Astro component. |
| `astro-seo` | **1.0.0** (latest available) | Helper component for `<title>`, `<meta>`, OpenGraph, Twitter cards | Optional — Astro's built-in `<head>` is enough, but `astro-seo` makes meta-tag consistency across pages much easier for a non-technical author. **MEDIUM confidence** on whether this is still the most popular helper in 2026 vs. hand-rolled — but it costs nothing to use it and the API is small. |
| `astro-robots-txt` | **1.0.0** | Auto-generate `/robots.txt` | Tiny utility, generates `User-agent: * / Allow: /` plus the sitemap pointer. Cleaner than committing a static file. |

### Images

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Astro's built-in `<Image />` + `<Picture />`** (`astro:assets`) | (built-in to 6.3.7) | Image optimization, responsive `srcset`, automatic `width`/`height` to prevent CLS, lazy loading | Default. Use for **every** image — attorney headshots, hero art, practice-area icons. Generates WebP/AVIF automatically. |
| `sharp` | **0.34.5** | Underlying image-processing engine | Astro's default image service since v5. Installed automatically by Astro on most package managers, but worth pinning explicitly in `package.json` so a Vercel build never surprises us with a `sharp not found` error. |
| Vercel Image Optimization | (configured via `@astrojs/vercel` adapter) | On-the-fly image resizing at the edge for any image not already statically optimized | **Optional.** Enable `vercel({ imageService: true })` in `astro.config.mjs` only if we end up needing on-demand resizing (we probably don't — every image on a marketing site is known at build time). Defer until proven necessary. |

### Iconography / Creative Art

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `astro-icon` | **1.1.5** | Icon component that pulls from Iconify (200k+ free icons, MIT-licensed sets) | Use for utility icons (location pin, mail, phone, LinkedIn). For the "creative art" goal in the brief (custom abstract hero graphic, stylized practice-area iconography), we'll need either commissioned SVGs or generative art — those go in `src/assets/` as committed SVG files. |
| Custom SVGs in `src/assets/illustrations/` | n/a | The "one or two distinctive creative-graphic moments" called out in `FIRM_BRIEF.md` | Hand-authored SVG. No library needed. SVGs are tiny (well under the 200 KB budget) and infinitely scalable — perfect for the Norm-Law-with-warmth aesthetic. |

### Analytics (privacy-respecting only)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **`@vercel/analytics`** | **2.0.1** | First-party, cookie-free web analytics | **Primary recommendation.** Vercel docs confirm: "tracks website traffic without using third-party cookies. End users are identified by a hash created from the incoming request" (valid for one day, no cross-day or cross-site tracking). Zero third-party scripts, served from the same domain as the site, free up to 2,500 events/month on the Vercel Hobby tier — more than enough for a referral-driven boutique. Avoids the cookie-banner problem entirely. |
| `@vercel/speed-insights` | **2.0.0** | Core Web Vitals reporting (LCP, INP, CLS) from real users | Add at the same time as Analytics. Same privacy profile (no cookies, hashed). Gives us a real-user-monitoring view of how the site performs on attorney laptops + founder phones, which is exactly the audience we care about. |

### Testing

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **`@playwright/test`** | **1.60.0** | End-to-end tests | Two test files are the entire test suite a marketing site needs: (1) `contact-form.spec.ts` — fills the contact form with valid data, asserts a success page; fills it with invalid data, asserts the server returns the validation error; submits with the honeypot filled, asserts the submission is rejected. (2) `pages.spec.ts` — visits every URL in the sitemap and asserts status 200 + that the disclaimer is present in the DOM. |
| `@axe-core/playwright` | **4.11.3** | WCAG 2.1 AA accessibility checks inside Playwright | Adds `await new AxeBuilder({ page }).analyze()` to the `pages.spec.ts` test. Catches missing alt text, low-contrast issues, missing form labels — exactly the failure modes a non-technical author will introduce. WCAG 2.1 AA is the brief's stated target. |
| `@lhci/cli` (Lighthouse CI) | **0.15.1** | Performance / SEO / a11y budgets on every PR | Set hard budgets: Performance ≥ 90, Accessibility = 100, SEO ≥ 95, Best Practices ≥ 95. Lighthouse CI fails the GitHub Action if a budget regresses — this is the safety net that catches a 5MB image being committed before it ships. |
| `@astrojs/check` | **0.9.9** | TypeScript + content-collection schema check | Run `astro check` as a CI step. Catches a missing required field in an attorney bio frontmatter at build time instead of at runtime. |

### Linting & Formatting

| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| `eslint-plugin-astro` | **1.7.0** | Lint `.astro` files | Catches forgotten `client:load`/`client:idle` directives and a11y issues on raw HTML. |
| `eslint-plugin-jsx-a11y` | **6.10.2** | Accessibility lint rules | Works inside `eslint-plugin-astro`'s scope. Catches `<img>` without `alt`, missing form labels, etc. — same protection as axe-core but at edit time, not just at test time. |
| `prettier` | **3.8.3** | Code formatter | Stops human bikeshedding over formatting. |
| `prettier-plugin-astro` | **0.14.1** | Prettier formatting for `.astro` files | Required for Prettier to understand Astro's frontmatter+template syntax. |
| `prettier-plugin-tailwindcss` | **0.8.0** | Auto-sorts Tailwind utility classes into canonical order | Keeps long `class="..."` strings deterministic and diff-friendly. |

### Deployment

| Tool | Purpose | Notes |
|------|---------|-------|
| Vercel (production) | Auto-deploy from `main` branch of `jvanloo72/BSV-new-website` | Already locked in `.claude/CLAUDE.md`. |
| Vercel preview deployments | Per-PR preview URLs | Every PR gets a unique `https://bsv-new-website-<sha>.vercel.app` URL. This is the right preview workflow for Jon to share with Aaron and Stuart for review before merging. **Zero configuration required** — it's on by default. |
| `vercel.json` | Security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) | Hand-write this file at repo root. Astro doesn't manage it. Format confirmed in Vercel docs (single `"headers"` array with `source` + `headers` entries). See PITFALLS.md for the exact CSP pitfalls. |

## Contact Form Backend — Prescriptive Recommendation

### Primary Recommendation: **Vercel serverless function (Astro Action) + Resend, email-only delivery, no database**

| Requirement from BSV's brief | How this pattern satisfies it |
|------------------------------|------------------------------|
| **ABA 477R confidentiality** | Lead data lives only in the firm's own email system (already protected by their existing BAA / IT controls). Resend is SOC 2 Type II and GDPR compliant (verified in Resend's own docs) — used as a transport layer only. No third-party CRM, no marketing database, no "we mine your data" SaaS in the picture. |
| **Server-side input validation** | Astro Actions enforce Zod validation server-side before any external call. Submissions that don't match the schema return a 400 without ever touching Resend. |
| **Honeypot spam protection** | A hidden `<input name="company_name_2">` field validated in the Action handler — if it has content, return 200 silently and don't call Resend. Adds zero UX friction and stops 95%+ of unsophisticated bots. |
| **No secrets in source / `.env` ignored** | Resend API key is set in Vercel's environment variable UI; the local `.env.local` file is gitignored from day one. |
| **Jon has no coding background** | The action handler is ~25 lines of TypeScript that he never has to touch after setup. Adding a new form field is two changes: add to the Zod schema, add the `<input>` to the Astro template. No database to migrate, no RLS policy to debug. |
| **Already on Vercel** | Zero new vendors to onboard. The serverless function lives in the same project, same dashboard, same billing. |
| **Disposable / rebuildable** | If we ever outgrow this (we won't), swapping in Supabase or a CRM webhook is one file's worth of change. |

### Backup Recommendation (if Jon's firm wants leads in a database for follow-up tracking): **Vercel + Resend + Supabase**

- The firm needs a searchable history of inbound inquiries (e.g., "did we hear from this prospect before?"), AND
- The firm doesn't already have a CRM, AND
- Jon is comfortable adding a new SaaS vendor
- Enable Row Level Security (RLS) on the `leads` table with a `service_role`-only write policy.
- Server-side insert uses the Supabase **service role key** (in Vercel env), never the anon key.
- The anon key never appears in client-side code (Astro Actions guarantee this — but verify by grepping `dist/`).
- Confirm Supabase Data Processing Agreement (DPA) is signed.
- Document a data-retention policy: e.g., leads auto-deleted after 24 months unless converted to clients.

### Why **not** each of the alternatives Jon listed

| Option | Why we don't recommend it as primary |
|--------|--------------------------------------|
| **Formspree** | Lead data sits in Formspree's database (a third-party SaaS) before reaching the firm. For most marketing sites that's fine; for a law firm under ABA 477R it adds a third party to the confidentiality chain *for no benefit we can't get more cleanly from Resend*. Formspree is also more expensive ($10/mo for the cheapest plan that removes their branding) than the Resend approach (free). Fine for a fallback if Resend is rejected for some reason. |
| **Netlify Forms** | We're not on Netlify. Adopting Netlify Forms means introducing a second hosting provider for one feature — not worth the operational complexity. Same ABA-477R concern as Formspree: leads sit in Netlify's database. |
| **Direct SMTP from a serverless function** | Technically possible (use a library like `nodemailer` with the firm's Microsoft 365 / Google Workspace SMTP credentials), but: (a) SMTP credentials are higher-risk to leak than a Resend API key, (b) deliverability is worse — emails from a Vercel IP to an MS365 account often hit spam, (c) Resend handles DKIM/SPF/DMARC setup for `bsvlaw.com` for us. Skip. |
| **`mailto:` form** | This isn't a form — it opens the user's email client. Half of prospects on a corporate Outlook setup will get a broken experience, and the firm captures nothing if the email never sends. It also exposes `intake@bsvlaw.com` to email-scraping bots. Hard no. |
| **CRM webhook (HubSpot/Salesforce/Clio)** | Best long-term answer **if BSV already runs one of these.** The Astro Action just POSTs the validated payload to the CRM's inbound webhook. Same security profile as the primary recommendation but with a real lead-management tool on the back end. **Ask Jon what BSV uses for intake before locking the primary recommendation in stone** — if the firm has Clio Grow or HubSpot, route to that instead of/in addition to email. |

### Decision to confirm with Jon at the contact-form phase

## Installation (Primary Recommendation)

# Astro itself (already pinned by the locked stack)

# Adapter for Vercel + content + SEO

# Tailwind v4 via the official Vite plugin

# Forms + email

# SEO / structured data

# Icons + images

# Privacy-friendly analytics (Vercel-native, no cookies, no third-party scripts)

# Dev dependencies

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Astro Content Collections + MDX | A headless CMS (Sanity, Contentful, Strapi) | Only if a non-technical author needs to edit content without touching git. For BSV, Jon plus the partners is the entire author team — they're fine in git via the GitHub web UI for one-off edits. A CMS adds cost ($99+/mo) and another vendor for no real benefit. |
| Resend (email backend) | Formspree | Use Formspree only if for some reason we can't add a server-side function (we can — we're on Vercel) or if the firm explicitly wants a vendor-managed inbox with built-in spam UI (they don't need it). |
| `@vercel/analytics` | Plausible (self-hosted or cloud) | Use Plausible if (a) the firm wants a public-facing analytics page or (b) we ever move off Vercel. Plausible is also excellent on privacy (cookie-free, GDPR-clean), but it's $9+/mo and requires inserting a `<script>` from `plausible.io` (which some corporate firewalls block, and some over-aggressive ad blockers strip). Vercel Analytics is served from `bsvlaw.com` itself — same origin, can't be blocked. |
| `@vercel/analytics` | Google Analytics 4 | **Never use GA4 on a law firm site without a cookie banner.** GA4 sets cookies, sends data to a US-based third party (Google), and creates a GDPR/CCPA exposure with no business justification for a referral-driven boutique that doesn't run paid ads. |
| Astro's built-in `<Image />` | Cloudinary / imgix | Only if BSV ends up wanting non-developer-managed image uploads (it won't — all imagery is curated). Built-in `<Image />` + Sharp produces WebP/AVIF that match what Cloudinary would output, with zero per-image transformation cost. |
| Custom SVG illustrations (committed to repo) | Generative imagery from Midjourney / DALL·E at runtime | Generative art is fine as a *source* for the one-time hero illustrations, but everything committed should be a finalized SVG so the 200 KB image budget and the JSON-LD `image:` references stay deterministic. |
| `schema-dts` | Hand-rolled JSON-LD `<script>` tags | Hand-rolling is OK for the simplest case (one `LegalService` blob), but the moment we have five attorney pages and a blog post template, type-checking pays for itself. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Google Analytics 4 (or any GA-family product) | Cookies + third-party data transfer to Google = mandatory cookie banner = friction on a referral landing page. No upside for a firm that doesn't buy paid traffic. | `@vercel/analytics` (cookie-free, first-party, hashed visitors) |
| Hotjar / FullStory / session-replay tools | Records visitor input including (potentially) what they typed into the contact form before submitting. Direct ABA 477R conflict — pre-engagement client communications must remain confidential, and session replay of a half-typed inquiry is not confidential. | None. A boutique law firm doesn't need session replay. If we want to know what's converting, look at the analytics dashboard. |
| `mailto:` links as the contact form | Opens the visitor's email client; breaks on corporate Outlook; exposes the firm's intake address to scrapers; the firm captures nothing if the email never sends. | Astro Action + Resend (the primary recommendation above). |
| Intercom / Drift / Olark chat widgets | Loads a third-party script with cookies on every page; the brief explicitly excludes "popup chat widgets" from scope. | Don't add chat. The "schedule a call" CTA is the conversion path. |
| `<script>` tags from CDN URLs (e.g., loading jQuery from a CDN) | Tightens the CSP we have to write in `vercel.json` and adds a third-party SPOF. | Bundle everything via Astro's Vite pipeline. No CDN scripts. |
| `dotenv` package + a committed `.env.example` | Astro/Vite read `.env` natively. A separate `dotenv` package is unnecessary. `.env.example` is fine to commit, but `.env` and `.env.local` **must** be in `.gitignore`. | Native Astro environment variable loading + Vercel env variable UI for production. |
| TinaCMS / Decap CMS (formerly Netlify CMS) | Adds an authoring UI on top of git-based content. Worth considering later if non-technical partners want to edit content without GitHub, but it's an extra integration with its own auth model. | Astro Content Collections, edited via the GitHub web UI (which is "click pencil icon, edit, click commit"). |
| Squoosh image service | Astro removed it as the default in v5 in favor of Sharp. Don't re-import `squooshImageService` — it's deprecated. | Sharp (default, built-in). |
| Manual hand-rolled CSS (without Tailwind) | Tailwind v4 is locked. Trying to split between Tailwind and a custom CSS file invites style conflicts and class-name collisions. | Tailwind utilities + a small `@theme {}` block in `src/styles/global.css` for the firm's brand colors and font choices. |

## Stack Patterns by Variant

- The Astro Action `POST`s the validated lead to the CRM webhook **in addition to** the Resend email.
- Order: validate → honeypot check → Resend send → CRM webhook (so a CRM outage never silently swallows a lead).
- All credentials in Vercel environment variables.
- Resend email to `intake@bsvlaw.com` is the only persistence layer. The firm's email system **is** the lead database.
- This is the cheapest and lowest-risk path. Recommended default.
- Add Supabase. Enable RLS on the `leads` table. Service-role insert from the Astro Action only. Never expose the anon key to the client.

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `astro@6.3.7` | Node ≥22.12 | Confirmed via `npm view astro@6.3.7 engines`. Vercel build images use Node 22 by default. |
| `@astrojs/vercel@10.0.7` | `astro@^6.0.0` | Confirmed via `npm view @astrojs/vercel@10.0.7 peerDependencies`. **Do not** install `@astrojs/vercel@9.x` — that's the Astro 5 line. |
| `@astrojs/mdx@5.0.6` | `astro@^6.0.0` | Confirmed via `npm view @astrojs/mdx peerDependencies`. |
| `@astrojs/sitemap@3.7.2` | `astro@^6.0.0` | (no peer dependency declared — works across Astro majors) |
| `tailwindcss@4.3.0` + `@tailwindcss/vite@4.3.0` | Astro ≥5.2 | Astro docs explicitly call out v5.2+ as the minimum for the v4 Vite plugin path. We're on 6.3.7, so fine. |
| `sharp@0.34.5` | Node ≥18.17 | Already required by Astro. |

## Sources

- **Context7** `/websites/astro_build_en` — Astro 6 Content Collections, Actions + Zod, RSS, MDX, Tailwind v4 integration path, Vercel adapter + image service, Sharp as default image service. (HIGH confidence)
- **Context7** `/websites/resend` — SOC 2 Type II + GDPR compliance confirmed; data residency (account data US-based, sending region configurable); webhook data retention guidance. (HIGH confidence)
- **Context7** `/websites/vercel` — `vercel.json` `headers` schema; Web Analytics cookie-free / hashed-visitor model; Speed Insights privacy posture. (HIGH confidence)
- **Context7** `/google/schema-dts` — `WithContext<T>`, `Person`, `Article` patterns. (HIGH confidence)
- **Context7** `/formspree/formspree-js` — Formspree client API (used to evaluate it as a fallback, not adopted). (HIGH confidence on facts)
- **Context7** `/plausible/docs` — Cookie-free analytics, GDPR compliance, proxy patterns (referenced as an alternative). (HIGH confidence)
- **npm registry** — exact current versions for every package listed (`npm view <pkg> version` + `npm view <pkg> peerDependencies` on 2026-05-25). (HIGH confidence)
- **Tailwind CSS official docs** — `https://tailwindcss.com/docs/installation` confirmed Tailwind v4.3 is the current stable version and `@tailwindcss/vite` is the recommended install path. (HIGH confidence)

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
