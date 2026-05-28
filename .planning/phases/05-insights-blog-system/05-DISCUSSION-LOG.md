# Phase 5: Insights (Blog) System - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-28
**Phase:** 5-Insights (Blog) System
**Areas discussed:** Seed post strategy, Index browse + RSS scope, Per-post chrome & MDX components, Editorial review gate

---

## Gray-area selection

**Question:** Which areas should we discuss for Phase 5?

| Option | Description | Selected |
|--------|-------------|----------|
| Seed post strategy | Who authors the first post, what topic, content-fidelity rule | ✓ |
| Index browse + RSS scope | Filter UX on /blog + RSS shape | ✓ |
| Per-post chrome & MDX components | Byline / dates / author card / MDX kit | ✓ |
| Editorial review gate (EDITORIAL.md + reviewedBy) | reviewedBy mechanics + EDITORIAL.md contents | ✓ |

**User's choice:** All four selected.

---

## Seed Post Strategy

### Source of seed-post content

| Option | Description | Selected |
|--------|-------------|----------|
| Jon writes it (Claude formats only) | Strongest fidelity guarantee; matches Phase 4 bsvlaw.com replicate-not-invent precedent | ✓ |
| Claude drafts, Jon reviews before publish | Faster but risks subtle fabrication or legal-advice-adjacent phrasing | |
| Republish an existing Jon-authored piece | CLE handout / PLI excerpt; lowest-risk | |
| Ship empty — placeholder "Inaugural post" stub | Defer real post; BLOG-09 would slip | |

**User's choice:** Jon writes it (Claude formats only).
**Notes:** Same content-fidelity rule as Phase 4 D-01/D-02 — Claude never drafts client-facing legal content. Claude formats MDX, runs lint:legal, surfaces hits.

### Author identity

| Option | Description | Selected |
|--------|-------------|----------|
| Jon Van Loo | Aligns with crypto-tax thought-leadership area (Phase 4 D-06) | ✓ |
| Aaron Belcher | M&A diligence / deal-structure angles | |
| Stuart Smolen | IP / patent strategy / tech-transactions angles | |
| Iris Zhang | Securities / regulatory / compliance angles | |

**User's choice:** Jon Van Loo.

### Topic

| Option | Description | Selected |
|--------|-------------|----------|
| Crypto/blockchain tax — a current issue | Jon's thought-leadership area; practiceArea=tax | ✓ |
| M&A tax structuring — founder-side | F-reorg / QSBS / rollover-equity explainer | |
| Pipeline-ready placeholder — Jon picks topic at draft time | Defer topic to draft step | |
| Other | Different topic Jon has in mind | |

**User's choice:** Crypto/blockchain tax — a current issue.

### Publish-gate workflow

| Option | Description | Selected |
|--------|-------------|----------|
| Hard stop — Jon supplies text, then Claude publishes | Final wave is checkpoint:human-action; mirrors Phase 4 FAQ-DRAFT.md D-13 gate | ✓ |
| Ship with `draft: true` only — close phase without a public post | BLOG-09 stays open | |
| Two posts — one Claude-drafts-Jon-reviews, one Jon-writes | Exercises filter UX with >1 post; adds drafting cycle | |

**User's choice:** Hard stop checkpoint at phase end.

---

## Index Browse + RSS Scope

### Filter UX on /blog

| Option | Description | Selected |
|--------|-------------|----------|
| Chip buttons + URL params (?author=, ?practice=) | Shareable filtered URLs; fits 5 attorneys + 3 practices cleanly | ✓ |
| Sub-routes (/blog/attorney/[slug], /blog/practice-area/[slug]) | Better SEO long-term; 8 extra routes; overkill for v1 | |
| Single dropdown | Compact but hides the filter set; weaker discovery | |
| No filter UI for v1 | Postpone until 8+ posts; BLOG-05 stays open | |

**User's choice:** Chip buttons + URL params.

### RSS scope

| Option | Description | Selected |
|--------|-------------|----------|
| One master feed at /blog/rss.xml, summary-only | Cleanest v1; avoids sanitize-html install | |
| One master feed, full MDX-rendered HTML | Better reader experience; pulls in sanitize-html | ✓ |
| Master feed + per-practice-area sub-feeds | More plumbing; questionable ROI with one post | |

**User's choice:** One master feed, full MDX-rendered HTML.
**Notes:** Pulls in sanitize-html (per Astro RSS recipe). Locked stack already lists this as a conditional install — Phase 5 promotes it from conditional to required.

---

## Per-Post Chrome & MDX Components

### Chrome layout

| Option | Description | Selected |
|--------|-------------|----------|
| Minimal byline + author card at end | H1, byline (author → profile link), publish date, body, author card, disclaimer | ✓ |
| Magazine-style — add reading time + updated date | Computed reading-time; more chrome | |
| Practice-area chip + related posts list | Requires ≥2 posts; risky with one seed | |

**User's choice:** Minimal byline + author card at end.

### MDX component kit

| Option | Description | Selected |
|--------|-------------|----------|
| Bare — standard MDX only | No custom components; add later when a post needs one | ✓ |
| Two essentials: <Callout> and <Citation> | Builds the most-cited helpers up front | |
| Full kit — Callout, Citation, Definition, PullQuote | Risk: building components that may never be used | |

**User's choice:** Bare MDX only.

---

## Editorial Review Gate (EDITORIAL.md + reviewedBy)

> **Mid-discussion descope.** After the questions in this section ran, Jon
> removed BLOG-07 (reviewedBy schema field) and BLOG-08 (EDITORIAL.md
> documentation) from REQUIREMENTS.md and amended LEGAL-09 to: "Blog
> editorial process prevents posts that could be construed as legal advice
> — every post renders the legal disclaimer." The reviewedBy field is
> already removed from src/content.config.ts, the placeholder post, and
> the test fixture; the build passes.
>
> **CONTEXT.md reflects the descoped state:** review is human-only (no
> schema field, no EDITORIAL.md). The questions and answers below are
> preserved here for audit only.

### reviewedBy field mechanics

| Option | Description | Selected |
|--------|-------------|----------|
| Free-text name of the reviewing partner | Honor system + Rule 7.4 lint catches banned terms | ✓ |
| Reference to an attorney slug (typed) | Stricter; breaks if reviewer is external | |
| Free-text name + required date | Audit trail (reviewedBy + reviewedAt) | |

**User's choice:** Free-text name.
**Notes:** Choice is now moot — Jon descoped BLOG-07 entirely. The field is gone from the schema. CONTEXT.md D-13 records this explicitly so no downstream plan re-adds it.

### EDITORIAL.md contents

| Option | Description | Selected |
|--------|-------------|----------|
| All five core sections | Banned terms, disclaimer placement, client-name policy, no-legal-advice, review checklist | ✓ |
| Add a 7.1 'no results/outcomes/guarantees' line | Reinforces LEGAL-10 | |
| Add a draft-to-publish workflow checklist | Step-by-step for Jon | |
| Add a 'do not republish without clearance' rule | Echoes Phase 4 D-01 | |

**User's choice:** All five core sections.
**Notes:** Also moot — Jon descoped BLOG-08. No EDITORIAL.md gets generated. CONTEXT.md D-12 explicitly maps LEGAL-09 satisfaction to BLOG-02 (author reference) + BLOG-03 (disclaimer) + existing lint:legal + clearance register + draft:true convention — all already enforced structurally.

---

## Wrap-up

| Option | Description | Selected |
|--------|-------------|----------|
| I'm ready for context | Write CONTEXT.md and route to plan-phase | ✓ |
| Explore more gray areas | Surface additional gray areas | |

**User's choice:** Ready for context.
**Notes:** Jon then sent the descope message for BLOG-07 / BLOG-08. CONTEXT.md was written with the descope applied.

---

## Claude's Discretion

Per CONTEXT.md `<decisions>` § "Claude's Discretion":
- Chip-row layout, hover/active styling, mobile collapse behavior
- Whether filtering uses `<script>` or an Astro islands hydration directive
- `Article` JSON-LD optional fields (`articleSection`, `keywords`, `wordCount`)
- `sanitize-html` allowed-tags/attrs config — start with Astro RSS recipe defaults
- Cover image strategy (commission SVG vs. reuse vs. omit) — surfaced to Jon at format step
- When/how `placeholder-post.mdx` gets deleted

---

## Deferred Ideas

Per CONTEXT.md `<deferred>`:
- Custom MDX components (Callout, Citation, Definition, PullQuote)
- Per-attorney / per-practice-area RSS sub-feeds
- Sub-route filter pages (/blog/by-attorney/[slug], /blog/by-practice-area/[slug])
- Reading-time / "Updated" header date / related-posts list
- Susan Jiang as an author (gated on her real bio landing)
- Newsletter signup / email-capture UI (V2-04)
- Cover-image commissioning

---

## Cross-phase notes

- **Phase 4 D-06 amendment:** The Phase 4 04-CONTEXT.md `<decisions>` lists `reviewedBy` as part of the blog schema. That line is amended by Phase 5 D-13 — the field is gone and stays gone. No re-add.
- **LEGAL-09 reword:** Tracked in REQUIREMENTS.md as of 2026-05-28; satisfied structurally by BLOG-02 + BLOG-03 + lint:legal + clearance register + draft:true convention.
