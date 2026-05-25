# Feature Research

**Domain:** Boutique transactional law firm marketing website (M&A, IP/Tech, Tax — tech, life sciences, crypto, FinTech, AI)
**Researched:** 2026-05-25
**Confidence:** MEDIUM-HIGH

**Source basis.** This research draws on (a) the firm-specific brief at `.planning/FIRM_BRIEF.md`, (b) the in-house reference at `.planning/LAW_FIRM_WEBSITE_GUIDE.md` (April 2026 — covers StoryBrand, SEO, AEO, conversion, disclaimers), (c) the project goals at `.planning/PROJECT.md`, (d) the two named visual references — Strix Law and Norm Law — and (e) common patterns observed across boutique transactional firm websites in 2024–2026. Live web fetching was not available during this research; where a claim depends primarily on memory of the broader market rather than the in-house guide, it is flagged as MEDIUM confidence. Where a claim is reinforced by the in-house guide or by BSV's stated positioning, it is HIGH confidence.

**One-line summary.** For a referral-driven boutique whose visitors are mostly warm (a referred prospect Googling the firm name), feature priority is **reassurance > acquisition**. Every feature should answer one of three questions — *Are they competent? Have they done deals like mine? Will they be responsive?* — and offer one frictionless path forward: get in touch.

---

## Feature Landscape

### Table Stakes (Users Expect These)

These are the features a referred prospect or co-counsel would expect on any credible boutique transactional firm site in 2026. Missing any of them creates immediate doubt about the firm. **Every item in this section becomes a v1 requirement.**

#### Pages

| Feature | Type | Why Expected | Complexity | Astro Notes | Legal Gotchas |
|---------|------|--------------|------------|-------------|---------------|
| **Homepage** | Page | The "front door" — must immediately confirm fit, communicate positioning, and route to contact. For a referred visitor it has to feel premium within the first scroll. | MEDIUM | Single `src/pages/index.astro` composed of section components | Footer disclaimer; "Attorney Advertising" line in California-rule states |
| **About / The Firm** | Page | Visitors who don't know BSV want a one-page summary of who the firm is and why it exists. For referred visitors, this confirms what the referrer told them. | LOW | `src/pages/about.astro` | Footer disclaimer; no claims that imply specialization beyond what California bar rules permit |
| **Practice Areas — index/overview** | Page | One landing page that frames BSV's three practice areas (M&A, IP & Tech, Tax) and links to each. Provides a single URL for nav links and structured-data context. | LOW | `src/pages/practice-areas/index.astro` | Footer disclaimer |
| **Practice Area — M&A** | Page | Each practice area on its own URL is required for SEO and for prospect orientation. M&A is BSV's flagship — most detail belongs here. | MEDIUM | `src/pages/practice-areas/mergers-acquisitions.astro` (or content collection entry). One page per area = 3 pages. | Per-page disclaimer per non-negotiables; `LegalService` JSON-LD; do not state "specialist" / "expert" / "best" — California Rule 7.4 limits specialization claims |
| **Practice Area — IP & Technology Transactions** | Page | Same rationale as M&A. | MEDIUM | Same template as M&A | Same as M&A |
| **Practice Area — Tax** | Page | Same rationale; tax is a distinct buyer search even when bundled with an M&A engagement. Crypto-tax sub-positioning lives here. | MEDIUM | Same template as M&A | Same as M&A |
| **Attorneys — index** | Page | A grid of all five attorneys with photo + name + role. The primary navigation target for "who are these people?" | LOW | `src/pages/attorneys/index.astro` | Footer disclaimer |
| **Attorney Profile — one per attorney** | Page | A dedicated URL per attorney is non-negotiable (FIRM_BRIEF; guide §SEO). Five pages: Belcher, Smolen, Van Loo, Zhang, Jiang. Nir Fishbien explicitly excluded. | MEDIUM | `src/pages/attorneys/[slug].astro` driven by an `attorneys` content collection | Per-page disclaimer; `Person` JSON-LD with bar admissions; Susan Jiang's bio incomplete — needs placeholder copy until Jon provides final |
| **Blog / Insights — index** | Page | Listing page with paginated post cards. The site spec includes a blog; an index is the parent route. | MEDIUM | `src/pages/insights/index.astro` (or `/blog`) with pagination | Footer disclaimer |
| **Blog post — individual** | Page | One URL per post. Each post must be attributed to a named attorney and carry a per-post disclaimer. | MEDIUM | `src/pages/insights/[slug].astro` driven by an `insights` content collection (MDX recommended) | Per-post disclaimer; named-attorney attribution required; `Article` JSON-LD with `author` as `Person` |
| **Contact** | Page | A dedicated `/contact` page with form, office addresses, and phone. The single page where the primary CTA terminates. | MEDIUM | `src/pages/contact.astro` with form island | Inline attorney-client-disclaimer above submit; honeypot; server-side validation; ABA 477R; California rule 1.18 on prospective clients applies — see Pitfalls |
| **404** | Page | Branded 404 that routes visitors back to the homepage or practice areas. Stops them from bouncing if they hit a stale referral link. | LOW | `src/pages/404.astro` | Footer disclaimer |
| **Privacy Policy** | Page | A privacy policy is expected on any site that collects information through a form. Required by California CCPA for any firm whose site is accessed from California (BSV is in California). | LOW | `src/pages/privacy.astro` — content can be from a standard legal template Jon supplies | CCPA / CPRA notice of collection; Google Analytics / fonts disclosure if used |
| **Terms of Use** | Page | A standard "use of this site" notice paired with the privacy policy. Limits the firm's liability for site content. | LOW | `src/pages/terms.astro` | Should reiterate the no-attorney-client-relationship language from the footer |
| **Sitemap.xml** | Page (generated) | Required for SEO so Google can discover every page; expected by Google Search Console. | LOW | `@astrojs/sitemap` integration auto-generates from routes | None |
| **Robots.txt** | File | Tells crawlers what to index. Without it, undesired URLs may be crawled. | LOW | `public/robots.txt` static file | None |

#### Components (used across pages)

| Feature | Type | Why Expected | Complexity | Astro Notes | Legal Gotchas |
|---------|------|--------------|------------|-------------|---------------|
| **Sticky top navigation** | Component | Universal pattern on modern professional sites. Must include primary CTA ("Get in Touch"). | LOW | Single `Header.astro` component; CSS-only sticky via Tailwind `sticky top-0` | None |
| **Footer with site-wide disclaimer** | Component | Non-negotiable per project rules — disclaimer text on every page. Also holds office addresses, phone, NAP info, copyright. | LOW | Single `Footer.astro` component | Disclaimer wording per LAW_FIRM_WEBSITE_GUIDE §Part 5; "Attorney Advertising" if California-rule-required; jurisdiction notice (CA-licensed) |
| **Primary CTA button** | Component | Repeated across hero, section ends, and nav. One singular ask: "Get in Touch" or "Schedule a Call." | LOW | `CTAButton.astro` with variant props | None |
| **Per-page disclaimer block** | Component | Required on practice-area, attorney, blog, and contact pages. A reusable component keeps wording consistent. | LOW | `Disclaimer.astro` with `variant` prop ("blog" \| "practice-area" \| "attorney" \| "contact") | Variant wording per LAW_FIRM_WEBSITE_GUIDE §Part 5 |
| **Attorney card** | Component | Used on the homepage team strip, attorneys index, and practice-area "Who works on this" sections. Photo + name + role + link. | LOW | `AttorneyCard.astro` taking an attorney collection entry as prop | None — but headshots are placeholders until launch |
| **Practice-area card** | Component | Used on homepage and in the practice-areas index. Icon or graphic + name + one-sentence framing + link. | LOW | `PracticeAreaCard.astro` | None |
| **Contact form** | Component (island) | The conversion endpoint. Must include: name, email, phone (optional), matter type (dropdown), message, honeypot, inline disclaimer, server-side validation, and a TBD backend (form-phase decision). | HIGH | Interactive island — likely `<script>`-driven submit calling an API route (`src/pages/api/contact.ts`), with framework-agnostic vanilla JS to keep dependencies low | ABA 477R; California Rule 1.18 (limit information solicited to avoid creating a prospective-client conflict); attorney-client disclaimer inline above submit; honeypot mandatory; rate limit recommended |
| **JSON-LD structured-data injector** | Component | Required on every page per non-negotiables. A reusable helper keeps schema consistent. | MEDIUM | `JsonLd.astro` component that takes a JS object and emits `<script type="application/ld+json">` | Use `LegalService` for the firm site-wide, `Person` for attorneys, `Article` for blog posts, `BreadcrumbList` for interior pages |
| **SEO meta component** | Component | Per-page `<title>`, `<meta description>`, canonical URL, Open Graph, Twitter Card. | LOW | `SEO.astro` or props on a `BaseLayout.astro` | None |
| **Mobile navigation drawer** | Component | Required on mobile. Hamburger → full-screen overlay with same nav + CTA. | MEDIUM | Small JS island; could use a `<details>` element for no-JS fallback | None |
| **Accessibility skip link** | Component | "Skip to main content" link for screen readers. Required to hit WCAG 2.1 AA, which the brief targets. | LOW | One anchor in `BaseLayout.astro` | WCAG 2.1 AA target per FIRM_BRIEF |
| **Cookie / analytics notice (if analytics used)** | Component | If any analytics or third-party scripts are used, a notice is required under CCPA/CPRA for California visitors. | LOW–MEDIUM | Could be a small banner island, or omitted entirely if no third-party scripts | CCPA / CPRA — only required if cookies are set beyond the strictly necessary set |

---

### Differentiators (Competitive Advantage)

These features are not universal — they signal **premium, boutique, and modern**. They're where BSV competes against (a) BigLaw, which has the brand but not the personal-attention story, and (b) generalist boutiques, which lack BSV's specific transactional credentials.

Each differentiator is evaluated against BSV's three-fear framework — **Competence, Experience, Responsiveness** — and the lead message *Team work to get good results*.

| Feature | Type | Value Proposition (Tied to BSV Positioning) | Recommend for v1? | Complexity | Notes |
|---------|------|---------------------------------------------|-------------------|------------|-------|
| **Representative deals / matter cards on each practice-area page** | Component (grid of cards) | Single most powerful **Experience** signal. "We did the $6B Athelas–Commure merger" beats any adjective. Cards show deal type + anonymized or named counterparty + role + size (where consent allows). | **YES — v1 essential** | MEDIUM | Anonymize anything not in the public record; consent confirmed where named (e.g., Athelas–Commure is already in Belcher's bio). One content collection (`deals`) referenced from practice-area pages. |
| **Deal-experience client logo strip** | Component | A row of well-known counterparties (Oracle, Dell, eBay, Adobe, Applied Materials, Disney, Alibaba, Gilead, Dropbox, Twitter, Samsung, Apple, Roche, Zimmer Biomet) on the homepage. Instantly communicates the **caliber of transactions** BSV works on. | **YES — v1 essential** | LOW | Use these only as **counterparties / matter context** — never imply current/ongoing client relationships unless true. Wording: "Parties on transactions BSV has advised on include…" Get partner sign-off on the wording. |
| **Testimonial pull-quotes with attribution** | Component | The Daniel Brian / Commure quote and similar pulled from past matters speak directly to **Responsiveness** and **Competence**. Must be attributed (name + title + company) — anonymous testimonials are far weaker and may also be limited by California rules. | **YES — v1 essential** | LOW | California Rule 7.1: testimonials must not be false or misleading; ensure consent on file; do not use language that creates an "expectation of similar results." Add small "Past results do not guarantee a similar outcome" disclaimer near testimonial blocks. |
| **"Team work to get good results" hero treatment** | Component (homepage hero) | The lead message — front and center. The hero is one of BSV's two or three "distinctive visual moments" (per design direction). | **YES — v1 essential** | MEDIUM | Hero is where the brief asks for a "creative art" moment — custom abstract graphic, restrained, not Strix-illustrated. |
| **"How we work" / process strip** | Component | StoryBrand "Plan" element — a 3-step plan removes ambiguity. For BSV, the three steps might be: *(1) Reach out (form or call), (2) We scope your matter and give a fee estimate, (3) The team gets to work — partner-led.* This directly addresses fear of "the unknown." | **YES — v1 essential** | LOW | None |
| **Fee structure / transparency band** | Component | The brief explicitly requires this — hourly billing paired with an estimate. Most BigLaw sites are opaque; saying it openly is a differentiator. | **YES — v1 essential** | LOW | Don't publish hourly rates (guide §Part 4 explicitly recommends against for hourly firms); do publish *approach* — "transparent, upfront fee discussions at the outset of every matter." |
| **Chambers USA Spotlight 2026 badge** | Component | Reassures on **Competence** without leading with credentials. Place tastefully — e.g., a small badge in a homepage "recognition" strip and again in the footer; not above the fold. | **YES — v1 essential** | LOW | Use the official Chambers badge per their attribution rules; link to the BSV Chambers entry. |
| **Industry sector tags (Tech / Life Sciences / Crypto / FinTech / AI)** | Component (filter/tag chips) | BSV's specialization is by *industry*, not just practice area. Surfacing sector tags on practice-area pages, deal cards, and attorney bios lets visitors self-identify ("they do crypto tax — that's me"). | **YES — v1 essential** | LOW | None |
| **Crypto-tax sub-positioning on the Tax page** | Page section | A clear, distinct "crypto, blockchain, token-sale taxation" sub-section under Tax. Jon Van Loo's edge — and a genuinely differentiated search lane. | **YES — v1 essential** | LOW | None |
| **Cross-border / international deal sub-positioning** | Page section | Belcher's cross-border M&A focus and Van Loo's international tax background are differentiators against purely-domestic boutiques. Show this prominently on M&A and Tax pages. | **YES — v1 essential** | LOW | None |
| **Attorney "Recent matters" sub-section on each profile** | Page section | On each attorney's profile, a short list of representative matters specific to them. Personalizes the **Experience** proof at the named-partner level. | **YES — v1 essential** | LOW | Anonymize where consent unclear; named only where in the public record |
| **Partner direct-contact callout on each attorney page** | Component | A small block like *"Reach Jon directly: jon@bsvlaw.com · (415) xxx-xxxx"* or "Email Jon" button. Most BigLaw sites hide partner contact behind a central form. Showing it directly **proves** Partner Access — a core BSV differentiator. | **YES — v1 essential** | LOW | Confirm with each attorney before publishing direct contact info; spam risk — consider obfuscation (mailto via JS) or a per-attorney form variant |
| **"Who works on this" attorney strip on each practice-area page** | Component | At the bottom of each practice-area page, the photos of the partners and associates who lead that area. Reinforces team approach + partner access. | **YES — v1 essential** | LOW | Map of attorneys → practice areas lives in the attorney collection frontmatter |
| **Sector landing pages (e.g., `/sectors/crypto-fintech`)** | Page | Industry-cross-cut landing pages, distinct from practice-area pages. "I'm a FinTech founder" matters more to a referred visitor than "I need IP work." | NO for v1 — defer to v1.x | MEDIUM | Adds 3–5 new routes; risks SEO dilution if content is thin. Wait until practice-area copy is mature. |
| **FAQ section on each practice-area page (with FAQ schema)** | Page section | AEO ranking driver per LAW_FIRM_WEBSITE_GUIDE §Part 3. 4–6 questions per page with `FAQPage` JSON-LD. Pulls into AI Overviews. | **YES — v1 essential** | LOW | FAQ schema must mark up the exact visible text; answers must be complete (don't tease) |
| **Insights filtering — by attorney and by practice area** | Component | Lets a visitor on an attorney's page see *just* that attorney's posts, and a practice-area visitor see *just* that area's posts. Reinforces individual + team authority. | **YES — v1 essential (basic)** | MEDIUM | Two listing routes: `/insights/author/[slug]` and `/insights/topic/[slug]`. Frontmatter on each post: `author`, `practiceAreas[]`. |
| **Related insights at bottom of each post** | Component | Keeps engaged readers on-site; reinforces topical authority for AEO. 3 most-recent posts in the same practice area or by the same author. | **YES — v1 essential** | LOW | Computed at build time from the content collection |
| **Reading time + publish date on each post** | Component | Small but signals professionalism. AI engines also use publish date as a freshness signal (AEO). | **YES — v1 essential** | LOW | Compute reading time from `Astro.glob`/content-collection body length |
| **Anchored share buttons (LinkedIn, X, email link)** | Component | LinkedIn is the relevant channel for transactional-law content. Email-link works for the referral motion. | **YES — v1 essential** | LOW | Use static `mailto:` and `linkedin.com/sharing/share-offsite/?url=` links — no third-party JS (privacy + perf) |
| **RSS feed for the blog** | Generated route | A standard expectation for any blog; co-counsel and journalists subscribe via RSS. | **YES — v1 essential** | LOW | `@astrojs/rss` generates `/rss.xml` from the content collection |
| **Custom abstract hero graphic / illustrated motif** | Visual asset | The brief explicitly asks for "creative art" — one or two distinctive visual moments. This is the design differentiator from a plain Norm-style site. | **YES — v1 essential** | MEDIUM | Restrained — one abstract hero illustration + a stylized icon set for practice areas. SVG to stay under the 200 KB image cap and to scale crisply. |
| **Practice-area iconography (custom SVG set)** | Visual asset | Three custom icons (or small abstract graphics) — one per practice area — used on cards, page heroes, and the homepage. Modest, premium creative-art moment. | **YES — v1 essential** | MEDIUM | SVG, hand-tuned to design system; falls back to the 200 KB image cap easily |
| **Office addresses with embedded static maps** | Component | Premium expectation; SF and Silicon Valley offices on the contact page with addresses and an *image* (static map, not embedded Google Maps) of each. | YES — v1 (image only) | LOW | Use a static map image, not an embedded Google Maps iframe — embedded maps trigger Google's tracking cookies and complicate the CSP |
| **Co-counsel / referrer hub** | Page or section | A one-page resource for attorneys at other firms who refer clients to BSV. Explains BSV's referral terms and the kinds of matters BSV takes. Most boutiques don't do this; given that referrals are BSV's #1 channel (per FIRM_BRIEF), it could move the needle. | YES — v1 if content is ready, else v1.x | MEDIUM | Plain language only; no implicit "we share fees" claim — California Rule 1.5(e) governs referral fee splits |
| **News & recognitions strip (small)** | Component | A tasteful homepage row showing 2–3 most recent recognitions / placements (Chambers, deal announcements, named partner press). Not a full press page. | YES — v1 small variant | LOW | If a deal announcement names a client, confirm consent and avoid implying a current relationship |
| **Search across blog + practice areas + attorneys** | Component | Useful but **not** essential for a 20–40 page site. Defer. | NO — v1.x or later | MEDIUM | Pagefind is the Astro-friendly option (static, no backend) |
| **Multi-language (Mandarin)** | Page set | Out of scope per PROJECT.md — Iris Zhang is fluent, but English-only for v1. | NO — explicit out-of-scope | HIGH | Revisit if international FinTech intake grows |
| **Dark mode toggle** | Component | Cosmetic; not expected of premium law firm sites. | NO — defer or skip | MEDIUM | The brief leans toward a near-black or deep-navy primary — a "dark mode" might be redundant |
| **Partner-quote video clips on each profile** | Component (video) | High-trust signal but high production cost — and depends on partner comfort with on-camera. Wait until headshots are done and Jon has appetite for video. | NO — v2 consideration | HIGH | Self-host or use a privacy-friendly host (Cloudflare Stream); avoid YouTube embeds for CSP simplicity |
| **Animated counters ("$50B+ deal value advised")** | Component | Marketing-y; risks looking BigLaw-corporate. Use a static statement instead if the proof is strong. | NO — skip | LOW | If used at all, keep it static text — never an animated tickertape |
| **Live chat widget (Intercom, Drift, etc.)** | Component | See Anti-Features. | NO | — | — |
| **Newsletter signup form on the blog** | Component | Possibly v1.x; with a referral-driven firm, the audience for a newsletter is unclear. If added later, must be plain "subscribe to occasional insights" — no exit-intent popups. | NO for v1 — v1.x | LOW | Pair with a CCPA-aware opt-in checkbox; no pre-checked boxes |

---

### Anti-Features (Commonly Requested, Often Problematic)

These are features that *look* like they belong on a modern professional services site, and would likely come up in a generic "what should a law firm website have?" search. For BSV, each one **clashes with the positioning** and should be deliberately omitted. Each entry below explains why.

| Anti-Feature | Why It Gets Requested | Why It Clashes with BSV's Positioning | Do This Instead |
|--------------|----------------------|---------------------------------------|-----------------|
| **Live chat widget (Intercom, Drift, Drift-style "Hi, how can we help?")** | Modern SaaS marketing convention; reduces bounce | (1) Confidentiality risk — visitors will type matter details into the chat, creating ABA 477R exposure before any conflict check or formal engagement. (2) Implies a 24/7 "sales floor" — wrong for partner-access positioning. (3) Most boutique transactional firms do not staff chat live; an unanswered "hi" actively damages the **Responsiveness** signal. | Show a single prominent contact path. Commit to a response time ("we respond to all inquiries within one business day") in copy. |
| **Lead-magnet ebooks ("Download our M&A Playbook")** | Content marketing convention; "captures" emails | Wrong audience model. BSV's prospects are GCs, founders, PE operators — not people who want to read an ebook. Email capture funnels are for high-volume B2C-adjacent practices (estate planning, immigration), not boutique M&A. Also: an ebook implies the firm gives away thinking it should charge for. | Publish 6–12 high-quality blog posts per year, each attributed to a named partner. Real thinking, not gated. |
| **Gated content (form-wall to read an article)** | "Capture leads from content readers" | AEO penalty (LAW_FIRM_WEBSITE_GUIDE §Part 3 explicitly: "AI engines cite pages that answer questions fully. Withholding the answer to force a call-to-action backfires"). Gating also signals the firm is more interested in marketing than in being useful. | Publish open. Add a soft "Get in touch" CTA at the bottom, not a wall. |
| **Popup newsletter modal / exit-intent popup** | Conversion-rate-optimization tactic | Cheapens the brand instantly. A boutique premium firm modal popping up "Subscribe!" feels like a SaaS landing page, not a law firm referred to by trusted counsel. Also: most popups violate WCAG focus-trap rules unless carefully built. | A simple inline newsletter signup at the bottom of the insights index (if newsletter is added later) — no modal. |
| **Paid-ad landing pages ("M&A Lawyer — Get a Quote Today")** | Performance-marketing convention | BSV does not acquire via paid ads (FIRM_BRIEF: "Attorney referrals and client referrals — not search and not paid ads"). Building landing pages for a channel that isn't used is wasted complexity. Also: California bar attorney-advertising rules apply more aggressively to anything that *looks* like a paid ad. | Skip entirely. If paid ads are ever considered, design then. |
| **Animated "$1B+ in deals closed" tickertape counters** | Looks impressive in a hero | Reads as boastful and BigLaw-corporate — directly opposite to "team work to get good results." Founders and GCs are sophisticated; specific deals beat vague aggregate counters every time. | A static "Representative Deals" grid with specific named matters and sizes. |
| **Stock photos of handshakes, gavels, columns, or skylines** | Default law-firm imagery | Strix Law and Norm Law both reject this aesthetic. Stock = generic = forgettable. The brief explicitly asks for "creative art" and "modernize away from the current site's traditional look." | Custom abstract graphic + tasteful real photography (real partners, real offices) — placeholders until photos are taken. |
| **Carousels / sliders on the homepage hero** | Common CMS template feature | Hurts page speed; users rarely interact with slide 2+; accessibility nightmare. Distracts from the single core message "Team work to get good results." | A single static hero with one headline, one CTA, and one creative-art moment. |
| **Self-glorifying credentials wall ("Our Awards")** | Pride / common pattern | Inverts StoryBrand — makes the firm the hero, not the client. Chambers Spotlight 2026 *should* be visible, but in a small recognition strip, not a billboard. | One small recognition strip on the homepage; full credentials live inside individual attorney bios. |
| **"Pro Bono" / "Diversity" / "Community" tabs as top-level nav** | Common BigLaw site convention | For a 5-person boutique, the top-nav budget should be: Practice Areas, Attorneys, Insights, Contact. Adding extra nav items dilutes the path to contact. | If BSV wants to mention pro bono or community work, fold it into "About" — one section, not a full page. |
| **Generic news/press release feed** | Common firm-site feature | Most "news" entries are noise (hires, conferences). For a boutique, an aging press feed makes the firm look small. A single "Recognitions" mention plus blog posts is enough. | If a deal is press-worthy, it becomes a blog post by the partner who led it — not a press release. |
| **Detailed bios for every staffer (paralegals, marketing, ops)** | Inherited from larger firms | A 5-attorney site with 15 bios reads as padded. The brief lists 5 attorneys exactly. | Only attorneys get bios. |
| **Hourly rate published on the site** | "Pricing transparency" interpreted maximally | LAW_FIRM_WEBSITE_GUIDE §Part 4 explicitly recommends against publishing hourly rates for hourly firms — broadcasts sticker shock before the matter is scoped. | Publish *approach* — "hourly billing paired with an estimate" — not the rate. |
| **Online payment / pay-my-bill page** | Common at firms with consumer-style billing | Out of scope per PROJECT.md. BSV bills via partner-led estimates, not an Authorize.net checkout. | Skip. |
| **Client portal / matter dashboard** | Premium-firm convention at larger firms | Out of scope per PROJECT.md. Wrong v1 surface. | Skip. |
| **Embedded Google Maps iframe** | Default contact-page treatment | Adds tracking cookies (CCPA notice required), bloats CSP, and adds third-party JS. | Static map *image* + the address as text + a "Get directions" link to Google Maps in a new tab. |
| **Cookie consent that blocks the entire screen** | Over-engineered consent UX | BSV doesn't need a GDPR-style cookie wall — California CCPA model is notice-and-opt-out, not consent. A blocking modal damages first impressions. | A small unobtrusive notice bar, only if cookies are actually set (which depends on whether analytics is used). |
| **TrustPilot / Yelp / Google Reviews widget** | E-commerce / consumer convention | Reviewing law firms by star rating is inappropriate for a transactional boutique. Yelp / Google reviews on professional-services pages can violate California Rule 7.1 if the firm doesn't moderate misleading content. | Attributed testimonials with full names + titles + companies, with consent on file. |
| **AI chatbot / "Ask BSV anything"** | Trendy in 2026 | Risk of confidentiality, conflicts, and unauthorized practice of law if the bot offers anything resembling advice. Even framed as informational, the firm now owns the AI's answer. | A static FAQ section on each practice-area page — directly cited by AI engines and under firm control. |
| **Auto-play background video** | Visual flourish | Hurts performance; accessibility issue; conflicts with restrained-premium aesthetic. | A single static hero with the abstract graphic. |
| **Multiple competing CTAs ("Subscribe", "Download", "Call", "Email")** | Marketing maximalism | StoryBrand violation — one CTA per page (guide §Part 4: "One primary CTA per page"). For BSV: "Get in Touch." | One CTA, repeated. |
| **Aggressive SEO-keyword stuffing in copy** | Pre-2020 SEO playbook | Hurts the conversational-premium tone the design references demand. Google penalizes; AI engines deprioritize. | Natural language, with target keywords used in titles, H1s, and a few H2s. |

---

## Blog System — Detail

Blog features get their own subsection because the brief flagged the blog as needing detail and because most of the **per-post legal compliance** is non-obvious.

### Per-post compliance requirements (non-negotiable)

1. **Named-attorney attribution.** Every post has exactly one `author` field in frontmatter, drawn from the attorneys content collection. The post page renders the author's name, photo, role, and a link to their profile. (`Article` JSON-LD `author` field also populates from this.)
2. **Per-post legal disclaimer.** Reusable `<Disclaimer variant="blog">` component renders the standard "informational only, not legal advice" callout. Recommended placement: top of the post as a small callout *and* at the bottom — both is acceptable per the in-house guide. Choose top placement for v1 (visible before the reader scrolls into substantive content).
3. **Publish date.** Frontmatter `pubDate`. Surfaces in post header, `Article` JSON-LD, and RSS feed. Update date should be a separate field (`updatedDate`) if the post has been substantively revised — important for AEO freshness.
4. **Practice-area tags.** Frontmatter `practiceAreas: [m-and-a, ip-tech, tax]`. Drives the practice-area filter route and the "Related insights" component.
5. **No comments.** Disable comments entirely. Comments on legal content create an avenue for inadvertent advice-giving and moderation overhead the firm doesn't want.

### Required blog routes

| Route | Purpose | Notes |
|-------|---------|-------|
| `/insights` | Blog index, paginated | 10 per page; sort by `pubDate` desc |
| `/insights/[slug]` | Individual post | One per content-collection entry |
| `/insights/author/[attorney-slug]` | Filter by author | Reuses the index card layout |
| `/insights/topic/[practice-area-slug]` | Filter by practice area | Same |
| `/rss.xml` | RSS feed | `@astrojs/rss` |

### Required blog components

| Component | Purpose |
|-----------|---------|
| **PostCard** | Used on index, author archive, topic archive, related-posts, and homepage "Latest Insights" strip |
| **PostHeader** | Title + author block + publish date + reading time + disclaimer callout |
| **AuthorByline** | Photo + name + link to profile + one-line role description |
| **ShareLinks** | LinkedIn share + email link (mailto with prefilled subject + body); deliberately not Twitter/X / Facebook (out-of-audience) |
| **RelatedPosts** | 3 cards — most recent in the same practice area, excluding the current post |
| **TableOfContents** (optional) | Auto-generated from H2/H3 if posts are long-form; recommended for AEO (helps AI engines extract sections) |
| **InsightsArchiveNav** | Side or top filter UI showing "All / By Author / By Topic" |

### Content collection schema (Astro)

```
src/content/
  attorneys/
    aaron-belcher.md
    stuart-smolen.md
    jon-van-loo.md
    iris-zhang.md
    susan-jiang.md
  insights/
    [slug].mdx
  practice-areas/
    mergers-acquisitions.md
    ip-tech-transactions.md
    tax.md
  deals/
    [slug].md
```

Frontmatter for `insights/*`:

```yaml
title: "..."
slug: "..."
author: "jon-van-loo"          # references attorneys collection
pubDate: 2026-01-15
updatedDate: 2026-02-01        # optional
practiceAreas: [tax]           # one or more
sectors: [crypto, fintech]     # optional, optional
description: "..."             # used in meta description and OG
heroImage: "..."               # optional
```

This schema is enforced via Astro's `defineCollection` + Zod, which prevents publishing a post without an attribution (closes the compliance gap automatically).

---

## Feature Dependencies

```
[BaseLayout.astro] ── used by ──> every page
   └── Footer ── contains ──> [SiteDisclaimer]
   └── Header ── contains ──> [Nav, CTAButton, MobileDrawer]
   └── SEO meta ── used by ──> every page
   └── JsonLd ── used by ──> every page (with page-specific schema)

[Attorneys content collection]
   ├── used by ──> /attorneys/index
   ├── used by ──> /attorneys/[slug]
   ├── referenced by ──> [Insights collection].author
   └── referenced by ──> [Practice areas collection].leadAttorneys[]

[Practice areas content collection]
   ├── used by ──> /practice-areas/index
   ├── used by ──> /practice-areas/[slug]
   ├── referenced by ──> [Insights collection].practiceAreas[]
   └── referenced by ──> [Deals content collection].practiceArea

[Deals content collection]
   ├── used by ──> /practice-areas/[slug] (representative deals grid)
   └── used by ──> /attorneys/[slug] (recent matters list)

[Insights content collection]
   ├── used by ──> /insights, /insights/[slug]
   ├── used by ──> /insights/author/[slug]
   ├── used by ──> /insights/topic/[slug]
   ├── used by ──> /rss.xml
   ├── used by ──> Homepage "Latest Insights" strip
   └── used by ──> RelatedPosts on individual post pages

[Contact form]
   ├── requires ──> [API route (server-side)]
   ├── requires ──> [Backend integration — TBD at form phase]
   ├── requires ──> [Honeypot field]
   ├── requires ──> [Inline disclaimer above submit]
   └── requires ──> [Server-side validation + rate limit]

[JSON-LD]
   ├── enhances ──> [SEO meta]
   ├── enhances ──> [Insights] via Article schema
   ├── enhances ──> [Attorneys] via Person schema
   └── enhances ──> [Practice areas] via LegalService + FAQPage schema

[FAQ section on each practice area] ── enhances ──> [JSON-LD FAQPage schema]

[Per-page disclaimer component] ── shared variant of ──> [Footer site-wide disclaimer]

[Contact form] ──conflicts with──> [Live chat widget]   (anti-feature; never both)
[Open insights / blog] ──conflicts with──> [Gated content]   (anti-feature)
[Single primary CTA] ──conflicts with──> [Newsletter popup, lead-magnet ebook]   (anti-features)
```

### Dependency notes

- **Content collections come first.** Before any page can render, the `attorneys`, `practice-areas`, `insights`, and `deals` content collections must be defined with Zod schemas. Build phase ordering must put collection scaffolding before page implementation.
- **Layout + Footer + JSON-LD scaffold blocks all pages.** Because the footer disclaimer is non-negotiable on every page, `BaseLayout` + `Footer` + `JsonLd` should be the very first components built. Every subsequent page just extends this.
- **Attorneys block the homepage.** The homepage's team strip, practice-area pages' "who works on this" sections, and blog post bylines all read from the `attorneys` collection. Bios can be placeholder copy initially, but the schema and slugs must be locked early.
- **Deals block practice-area depth.** A practice-area page with no representative-deal grid feels thin. The `deals` collection should be populated (even with 6–10 anonymized matters) before practice-area pages are considered complete.
- **Contact form is the final v1 dependency.** Backend choice (Supabase + Resend vs. Formspree vs. SMTP, etc.) is explicitly deferred to a dedicated phase per CLAUDE.md. The form's *frontend* and *honeypot* can be built before the backend is chosen.
- **Insights filter routes depend on the collection schema.** `/insights/author/[slug]` and `/insights/topic/[slug]` need consistent slugs across `attorneys` and `practice-areas` collections — define naming convention up front.

---

## MVP Definition

### Launch With (v1)

The minimum the site needs to ship without embarrassing the firm. **Every item in this list must exist on the day the site replaces bsvlaw.com.**

**Pages**
- [ ] Homepage (with hero, social-proof strip, problem framing, practice-areas, "How we work," team, latest insights, contact CTA)
- [ ] About / The Firm
- [ ] Practice Areas index
- [ ] Practice Area — M&A
- [ ] Practice Area — IP & Technology Transactions
- [ ] Practice Area — Tax
- [ ] Attorneys index
- [ ] Attorney profile — Aaron Belcher
- [ ] Attorney profile — Stuart Smolen
- [ ] Attorney profile — Jon Van Loo
- [ ] Attorney profile — Iris Zhang
- [ ] Attorney profile — Susan Jiang (placeholder bio until Jon supplies)
- [ ] Insights index
- [ ] Insights post template (with 3–5 seeded posts, each attributed)
- [ ] Insights filter by author
- [ ] Insights filter by practice area
- [ ] Contact page (with form)
- [ ] Privacy Policy
- [ ] Terms of Use
- [ ] 404
- [ ] /sitemap.xml (auto-generated)
- [ ] /rss.xml (auto-generated)
- [ ] /robots.txt

**Components & cross-cutting**
- [ ] BaseLayout + Header + Footer (with site-wide disclaimer)
- [ ] Per-page disclaimer component (4 variants)
- [ ] CTA button (one variant, used everywhere)
- [ ] Attorney card
- [ ] Practice-area card
- [ ] Deal / matter card
- [ ] Testimonial pull-quote block
- [ ] FAQ accordion (with FAQ JSON-LD)
- [ ] PostCard, PostHeader, AuthorByline, RelatedPosts, ShareLinks
- [ ] Insights archive nav
- [ ] Contact form (frontend + server validation + honeypot — backend TBD)
- [ ] JSON-LD helper (LegalService, Person, Article, BreadcrumbList, FAQPage)
- [ ] SEO meta component
- [ ] Mobile nav drawer
- [ ] Accessibility skip link
- [ ] Custom abstract hero graphic (SVG)
- [ ] Practice-area icon set (3 SVGs)

**Content / data**
- [ ] Attorneys content collection (5 entries, Zod-validated)
- [ ] Practice-areas content collection (3 entries)
- [ ] Deals content collection (10+ anonymized or named matters)
- [ ] Insights content collection (3–5 seeded posts, named-attorney attribution)
- [ ] FAQs on each of the three practice-area pages (4–6 each)
- [ ] One testimonial per practice area (minimum)
- [ ] Chambers Spotlight 2026 badge + link
- [ ] Office addresses + static map images for SF + Silicon Valley

**Compliance / security gates (cross-cutting)**
- [ ] Footer disclaimer on every page
- [ ] Per-page disclaimer on practice-area, attorney, blog, contact pages
- [ ] Inline contact-form disclaimer above submit
- [ ] "Attorney Advertising" notation in footer (verify California rule)
- [ ] Jurisdiction notice (CA-licensed) in footer
- [ ] HTTP security headers in `vercel.json`
- [ ] Honeypot on contact form
- [ ] Server-side input validation on contact form
- [ ] No secrets in `dist/`
- [ ] All committed images ≤ 200 KB

### Add After Validation (v1.x)

Features to add once v1 is live, real traffic data is in, and Jon has bandwidth.

- [ ] Newsletter signup (inline, no modal) — add only if there's clear demand from referrers
- [ ] Sector landing pages (`/sectors/crypto-fintech`, `/sectors/life-sciences`) — once practice-area copy has matured
- [ ] Co-counsel / referrer hub page — formalize the referral motion in one page
- [ ] Full deal-search / deal-filter UI on a `/deals` archive page (only if deals collection grows past ~30)
- [ ] On-site search (Pagefind) — once content past ~30 pages
- [ ] Partner-quote video clips on each profile — after professional headshots are done
- [ ] More extensive FAQ library — pillar pages for AEO authority
- [ ] Google Business Profile linkage + Local SEO push

### Future Consideration (v2+)

- [ ] Mandarin-language version (revisit only if international FinTech intake grows)
- [ ] Light client portal for closed-loop intake (after contact-form data shows demand)
- [ ] Podcast / video series (heavy production cost; only if a partner has commitment)
- [ ] AI-powered Q&A on the site (only if confidentiality and unauthorized-practice risks can be properly bounded — not a v2 default)

### Explicitly Out — Do Not Build

- Live chat widget
- Lead-magnet ebooks
- Gated content
- Popup newsletter modals / exit-intent popups
- Paid-ad landing pages
- Online payments
- Detailed staff bios beyond the 5 attorneys
- Embedded Google Maps iframe
- Auto-play background video
- Carousels / sliders in the hero
- Animated revenue / deal-value counters
- Stock photos of handshakes / gavels / columns
- Star-rating widgets / TrustPilot
- Hourly rate published on the site
- Nir Fishbien profile

---

## Feature Prioritization Matrix

Top-line features only — full v1 list above is the authoritative checklist.

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Homepage with "Team work to get good results" hero | HIGH | MEDIUM | P1 |
| Three practice-area pages on dedicated URLs | HIGH | MEDIUM | P1 |
| Five attorney profile pages | HIGH | MEDIUM | P1 |
| Contact form with disclaimer + honeypot | HIGH | HIGH | P1 |
| Footer with site-wide disclaimer | HIGH | LOW | P1 |
| Per-page disclaimer component | HIGH | LOW | P1 |
| JSON-LD on every page (LegalService, Person, Article) | HIGH | MEDIUM | P1 |
| Blog with named attribution + per-post disclaimer | HIGH | MEDIUM | P1 |
| Representative deals grid on each practice-area page | HIGH | MEDIUM | P1 |
| Attributed testimonial pull-quotes | HIGH | LOW | P1 |
| Fee-structure transparency band | HIGH | LOW | P1 |
| Chambers Spotlight 2026 badge | MEDIUM | LOW | P1 |
| "How we work" 3-step plan | HIGH | LOW | P1 |
| FAQ sections with FAQPage schema | HIGH | LOW | P1 |
| RSS feed | MEDIUM | LOW | P1 |
| Insights filter by author + by practice area | MEDIUM | MEDIUM | P1 |
| Custom abstract hero graphic + practice-area icons | HIGH | MEDIUM | P1 |
| Partner direct-contact callouts on attorney pages | HIGH | LOW | P1 |
| Privacy Policy + Terms of Use | MEDIUM | LOW | P1 |
| HTTP security headers in vercel.json | HIGH | LOW | P1 |
| Sitemap.xml + robots.txt | HIGH | LOW | P1 |
| Sector landing pages (crypto, life sciences, FinTech) | MEDIUM | MEDIUM | P2 |
| Co-counsel / referrer hub page | MEDIUM | MEDIUM | P2 |
| Newsletter signup (inline only) | LOW | LOW | P2 |
| On-site search (Pagefind) | LOW | MEDIUM | P3 |
| Partner-quote videos | MEDIUM | HIGH | P3 |
| Mandarin localization | LOW (today) | HIGH | P3 |
| Live chat widget | NEGATIVE | MEDIUM | P-Skip |
| Lead-magnet ebooks / gated content | NEGATIVE | MEDIUM | P-Skip |

**Priority key:** P1 = ship for v1; P2 = add post-launch when traffic supports it; P3 = future consideration; P-Skip = deliberately not built.

---

## Competitor / Reference Feature Analysis

The two named visual references in the brief plus the existing site.

| Feature | Strix Law | Norm Law | bsvlaw.com (current) | BSV (new site) |
|---------|-----------|----------|---------------------|----------------|
| Hero treatment | Conversational headline + illustrated landscape | Large bold typographic headline, restrained | Traditional credentials-led | **Premium typography + ONE creative-art moment ("Team work to get good results")** |
| Practice areas | Each on own URL | Each on own URL | Each on own URL (per FIRM_BRIEF) | **Each on own URL with rep-deals grid + FAQ + sector tags** |
| Attorneys | Photos + short bios | Photos + concise bios + strong typographic name treatment | Detailed credential-forward bios | **Photos + concise empathy-led intro + recent matters + partner direct contact** |
| Representative deals | Light treatment, narrative-style | Restrained, named matters in body copy | Listed in attorney bios only | **Dedicated grid on each practice-area page + per-attorney recent matters** |
| Testimonials | Pull-quotes used | Restrained / not heavily featured | Limited use | **Attributed pull-quotes on homepage + practice-area pages** |
| Insights / Blog | Has a Notes / writing section | Has an Insights section | Has a blog | **Yes — with named attribution, per-post disclaimer, filter by author + practice area, RSS** |
| Contact | Form + warm copy | Form + restrained copy | Form | **Form on /contact page + form-island on homepage CTA + partner direct-contact on attorney pages** |
| Fee transparency | Not surfaced | Not surfaced (institutional) | Not surfaced | **Surface "hourly with upfront estimate" approach in a band on homepage** |
| Creative-art moments | Many — fully illustrated | None — pure typography | None | **One or two — abstract hero + practice-area icon set** |
| Disclaimers | Standard footer disclaimer | Standard footer disclaimer | Footer disclaimer | **Footer + per-page + per-post + inline-on-form** |
| Live chat | None | None | None | **None (anti-feature)** |
| Newsletter / lead capture | None visible | None visible | None visible | **None for v1 (anti-feature for modal popups)** |
| Multi-language | English only | English only | English only | **English only for v1** |

**Reading.** Both Strix and Norm reject every anti-feature in the list above — no live chat, no lead-magnets, no popups, no stock-photo theatrics. BSV's reference set independently validates the anti-features list. The differences are mostly tonal (warm vs. premium) — and BSV's target is "premium with warmth," so the **structural** features should follow Norm (restraint, typography-led, dedicated URLs, restrained imagery) while the **tonal** features should borrow from Strix (conversational copy, custom illustration sparingly).

---

## Confidence Notes

- **Table stakes — HIGH.** Cross-referenced against LAW_FIRM_WEBSITE_GUIDE.md (which is the firm's own April-2026 reference), PROJECT.md Active Requirements, and FIRM_BRIEF.md.
- **Differentiators — MEDIUM-HIGH.** Tied directly to BSV positioning. Two judgment calls flagged as v1.x (sector landing pages, co-counsel hub) — confidence on the *categorization* is high; confidence on the *exact prioritization* is medium and should be re-evaluated after homepage copy is drafted.
- **Anti-features — HIGH.** Cross-checked against PROJECT.md "Out of Scope" and LAW_FIRM_WEBSITE_GUIDE §Part 4 conversion guidance. Several (live chat, lead magnets, popups, gated content, online payments) are explicitly named in the firm's own materials as positioning conflicts.
- **Blog system — HIGH.** Schema design, attribution requirements, and disclaimer placement are directly required by the non-negotiables.
- **Legal-industry gotchas — MEDIUM-HIGH.** California-specific rules (Rule 1.18 on prospective clients, Rule 7.1 on testimonials, Rule 7.4 on specialization claims, attorney-advertising disclosure) need a final Jon-level sanity check before launch. The disclaimer wording recommended here matches LAW_FIRM_WEBSITE_GUIDE §Part 5 and is fit-for-purpose, but state bar rules should be re-verified before the launch security audit.

## Sources

- `.planning/FIRM_BRIEF.md` — firm positioning, team, client list, design references
- `.planning/PROJECT.md` — Active Requirements, Out of Scope, Constraints
- `.planning/LAW_FIRM_WEBSITE_GUIDE.md` — StoryBrand, SEO, AEO, conversion, disclaimers (the firm's own April-2026 reference)
- `.claude/CLAUDE.md` — communication standards, non-negotiables, copy principles
- Reference sites named in the brief: strixlaw.com (warm boutique reference), normlaw.com (premium institutional reference)
- Domain knowledge — common patterns observed across boutique transactional firm websites in 2024–2026

**Live web research note:** Real-time fetching of strixlaw.com, normlaw.com, and bsvlaw.com was not available during this research session. Recommendations rely on (a) the firm's own April-2026 reference guide, (b) the brief's structured description of those reference sites, and (c) widely-known patterns in the boutique transactional segment. When the design phase begins, a direct visual audit of both reference sites should reconfirm specific layout patterns before final design decisions are locked.

---
*Feature research for: Boutique transactional law firm marketing website (BSV)*
*Researched: 2026-05-25*
