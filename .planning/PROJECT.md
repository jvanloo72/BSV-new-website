# Belcher, Smolen & Van Loo LLP — Website

## What This Is

A modern website for **Belcher, Smolen & Van Loo LLP** (BSV), a boutique
California law firm focused on Mergers & Acquisitions, Intellectual Property
& Technology Transactions, and Tax for the technology, life sciences,
cryptocurrency, FinTech, and AI industries. The site replaces the existing
bsvlaw.com with a contemporary, premium-but-warm design that emphasizes the
firm's collaborative, team-driven approach and the outcomes it delivers —
rather than leading with credentials.

## Core Value

A prospective client (founder, GC, PE/VC operator, or co-counsel referrer)
who lands on the site comes away convinced that BSV has the **competence,
experience, and responsiveness** to handle their specific transaction —
and reaches out via the contact form or referral path.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Modern, premium homepage that opens with **"Team work to get good results"** — not credentials
- [ ] Three dedicated practice area pages — M&A, IP & Technology Transactions, Tax — each on its own URL (`/practice-areas/[slug]`)
- [ ] Five attorney profile pages — Aaron Belcher, Stuart Smolen, Jon Van Loo (partners) and Iris Zhang, Susan Jiang (associates) — Nir Fishbien excluded
- [ ] Blog system with named-attorney attribution on every post and per-post legal disclaimer
- [ ] Contact form with attorney-client disclaimer, server-side validation, honeypot spam protection, and TBD backend (chosen at form phase)
- [ ] Site-wide footer disclaimer plus per-page disclaimers on practice area, attorney, and blog pages
- [ ] JSON-LD structured data on every page — `LegalService` for the firm, `Person` for attorneys, `Article` for blog posts
- [ ] SEO copy and meta tags targeting "M&A lawyer Silicon Valley / San Francisco", "technology transactions counsel", "crypto tax attorney", etc.
- [ ] Visible Chambers USA Spotlight 2026 recognition (not the lead)
- [ ] Visible fee-structure transparency — hourly billing paired with an estimate of total cost per engagement
- [ ] Modern sans-serif typography, generous whitespace, restrained imagery with one or two distinctive "creative art" moments (custom abstract hero graphic or stylized practice-area iconography)
- [ ] HTTP security headers configured in `vercel.json` — CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy
- [ ] All API keys stored in Vercel environment variables only; `.env` and `.env.local` excluded from git
- [ ] If a database is used: Row Level Security enabled on all tables; server-side input validation enforced
- [ ] ABA Formal Opinion 477R-compliant intake — pre-engagement inquiries protected end-to-end
- [ ] All committed images ≤ 200 KB; tasteful placeholder headshots until real photos are taken
- [ ] Mobile-responsive, accessibility-aware (WCAG 2.1 AA as the target)
- [ ] Deployed on Vercel; auto-deploy from `main` on the GitHub repo `jvanloo72/BSV-new-website`
- [ ] Pre-launch security audit via `/hc-firm-site:check` — Security section must fully pass

### Out of Scope

- Online payments or fee processing — BSV bills hourly and discusses estimates one-on-one; a payment portal is not the right v1 surface
- Client portal / matter-management system — handled outside the marketing site
- Multilingual content (Mandarin, etc.) — English only for v1, even though Iris Zhang is fluent in Mandarin; revisit if international FinTech intake grows
- Full rebrand of firm name, mark, or identity — this is a modernization, not a rebrand
- Featuring Nir Fishbien (Counsel on current site) — explicit instruction from intake
- Generalist legal content — BSV's lane is M&A, IP/Tech, and Tax; blog posts and SEO stay disciplined
- Lead-magnet ebooks, gated content, popup chat widgets — referral-driven boutique firms don't run on funnels and these would clash with positioning

## Context

**Existing site.** bsvlaw.com is well-organized but reads as traditional and
credentials-forward. The new site should keep BSV's underlying substance and
credibility while feeling modern and visually distinctive.

**Visual references (provided by Jon).** Two reference sites:
1. **Strix Law** (strixlaw.com) — warm, approachable, illustrated landscapes,
   conversational copy.
2. **Norm Law** (normlaw.com) — premium, institutional, monochrome, restrained,
   large bold sans-serif typography.

BSV's target is closer to Norm — premium foundation — but warmer than Norm,
because BSV serves both tech founders and large public acquirers. The plan is
restrained overall with one or two distinctive creative-graphic moments,
**not** a fully illustrated site.

**Color direction.** Not yet locked. Current site is navy + white; open to
keeping that lineage or refreshing. Design phase will explore (a) deep navy +
warm white + single accent, or (b) near-black + white + a confident accent.

**Team.** Three partners (Belcher, Smolen, Van Loo) plus two associates
(Zhang, Jiang). Susan Jiang's bio is incomplete; Jon will paste or link the
final copy when we reach her attorney-profile page. Headshots are not yet
taken — every attorney page builds with placeholders, swapped before launch.

**Clients.** Tech and life-sciences companies and their investors; FinTech
and AI per Chambers. Notable historical clients on the buy-side include
Oracle, Dell, eBay, Adobe, Applied Materials, Disney, Alibaba, Gilead;
counterparties include Dropbox, Twitter, Samsung, Apple, Roche, Zimmer Biomet.

**How clients find the firm.** Attorney referrals and client referrals — not
search and not paid ads. The site's job is to **close the loop** when a
referred prospect Googles "Belcher Smolen Van Loo" and lands on bsvlaw.com,
not to win SEO from scratch.

**Three client fears.** Competence, experience, responsiveness. Every page
should reassure on these with proof — specific deals, named partners,
testimonials — not adjectives.

**Recognition.** Chambers USA Spotlight 2026 — Leading firm, ranked in M&A.
Visible on the site but not the lead.

**Copy framework.** StoryBrand — the client is the hero, BSV is the guide
with a clear plan. Lead with the client's problem; every section moves the
visitor toward getting in touch.

**Project lead.** Jon Van Loo, partner at BSV and a practicing attorney with
**no coding background**. Explanations must be plain English, concept-first,
one idea at a time. Restarts of Claude Code should be avoided unless
absolutely necessary.

## Constraints

- **Tech stack**: Astro 6 + Tailwind CSS v4 + GitHub + Vercel — already decided. Do not propose alternatives.
- **Contact form backend**: TBD — present options (Supabase + Resend, Formspree, Netlify Forms, direct SMTP, CRM webhook) when we reach the form phase. Choice depends on what BSV already uses for intake.
- **Hosting**: Vercel — production deploy auto-runs on merge to `main` of `jvanloo72/BSV-new-website`.
- **Security (non-negotiable for a law firm site)**: vercel.json security headers; secrets in Vercel env only; `.env` in `.gitignore`; server-side input validation; honeypot on contact form; built `dist/` verified to contain no credentials; ABA 477R-compliant intake.
- **Performance**: fast on mobile — image budget of 200 KB per committed asset.
- **Per-page legal**: footer disclaimer everywhere; per-page disclaimers on practice area, attorney, blog, and contact pages.
- **Communication style**: every command and concept explained in plain English before it runs; no assumption of prior coding knowledge.
- **Decision log**: every significant decision appended to `.planning/DECISIONS.md` (HeyCounsel community documentation).

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Tech stack: Astro 6 + Tailwind CSS v4 + GitHub + Vercel | Astro fits a content-driven marketing site (fast static output, MDX for blog); Tailwind v4 keeps styling fast; Vercel auto-deploys from GitHub. Stack pre-decided in `.claude/CLAUDE.md`. | — Pending |
| Lead message "Team work to get good results" — not credentials | Differentiates from BigLaw aesthetic; client is the hero in StoryBrand framing; signals collaborative boutique posture. | — Pending |
| Visual reference: Norm Law foundation + selective creative graphics; warmer than Norm | BSV serves both founders and large public acquirers — pure cold institutional won't fit; pure illustrated won't read premium enough. | — Pending |
| Nir Fishbien excluded from new site | Explicit intake instruction. | — Pending |
| Contact form backend deferred to form phase | Backend choice depends on BSV's existing intake workflow, which Jon will surface during that phase. | — Pending |
| Color direction deferred to design phase | Current site is navy+white; design phase will propose options before locking. | — Pending |
| English only for v1 | Boutique firm; English-speaking referral network is the primary inbound channel. Mandarin reconsidered later if international FinTech intake grows. | — Pending |
| Auto mode (yolo) + Quality model profile + Standard granularity + Parallel execution | Jon is non-technical and wants the build to proceed without manual approval gates; Quality models (Opus) justify the higher cost for a visible client-facing site. | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-05-25 after initialization*
