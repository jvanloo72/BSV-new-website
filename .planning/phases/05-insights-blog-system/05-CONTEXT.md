# Phase 5: Insights (Blog) System - Context

**Gathered:** 2026-05-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Stand up the full Insights blog pipeline on top of the **already-scaffolded**
`blog` content collection, dynamic `/blog/[slug]` route, and `BlogPostLayout`.
A visitor lands on `/blog`, filters by attorney or practice area, opens a post
attributed to a named partner, sees the per-post legal disclaimer, and (when
they want) subscribes via `/blog/rss.xml`. One real seed post is live by phase
end — Jon-authored, on a crypto/blockchain tax topic, posted under
`/attorneys/jon-van-loo`.

**Guiding principle (carried from Phase 4):** **No fabrication, content
fidelity is Jon's.** Jon writes the seed post; Claude formats it into MDX and
publishes it. Same `draft: true` hidden-until-approved pattern used for Susan
Jiang's profile and the Phase 4 FAQs.

**In scope:**
- `Article` JSON-LD on every post page via `BlogPostLayout` (slot-transferred
  into `BaseLayout`'s `<head>`) — author, datePublished, dateModified,
  headline, image (BLOG-04, SEO-04)
- Filterable `/blog` index — chip buttons over the post list ("All / Aaron /
  Stuart / Jon / Iris" + "All / M&A / IP & Tech / Tax"), URL params
  `?author=` and `?practice=`, shareable filtered URLs (BLOG-05)
- RSS feed at `/blog/rss.xml` via `@astrojs/rss`, **full MDX-rendered HTML**
  with `sanitize-html` (BLOG-06)
- One Jon-authored seed post in `src/content/blog/`, scaffolded with
  `draft: true`, published with `draft: false` once Jon supplies the copy
  (BLOG-09)
- Minimal post-page chrome: H1 + byline (author name links to profile) +
  publish date; body slot; author card at bottom; `blog` disclaimer below
- `buildArticleLd()` in `src/lib/jsonld.ts` — the Phase 1 stub currently
  throws `'buildArticleLd not implemented until Phase 5'`; this phase
  implements it
- Remove the Phase 1 `placeholder-post.mdx` scaffold; the real seed post
  replaces it

**Out of scope (later / deferred):**
- `.planning/EDITORIAL.md` — **descoped by Jon on 2026-05-28** (BLOG-08
  removed from REQUIREMENTS.md). Review is a human-only process; no schema
  enforcement, no separate doc.
- `reviewedBy` field — **descoped by Jon on 2026-05-28** (BLOG-07 removed,
  schema field already removed from `src/content.config.ts`). Author-only
  attribution; review is human-only and never gated mechanically.
- Custom MDX components (Callout, Citation, Definition, PullQuote) — plain
  MDX only for v1; add components when an actual post needs one
- Sub-routes (`/blog/by-attorney/[slug]`, `/blog/by-practice-area/[slug]`)
  — chip filters with URL params cover BLOG-05 cleanly for v1
- Per-attorney / per-practice-area RSS sub-feeds — one master feed only
- Reading-time, related-posts, magazine-style chrome — minimal chrome for v1
- Susan Jiang as an author — she stays `draft: true` until Jon supplies her
  real bio (Phase 4 D-07); only the four published attorneys appear in the
  filter chips
- Contact form, security hardening, analytics, custom domain — Phases 6/7

</domain>

<decisions>
## Implementation Decisions

### Content Source & Fidelity
- **D-01:** **Jon writes the seed post; Claude formats only.** Same content-
  fidelity rule as Phase 4 (D-01/D-02). Claude does not draft post body text.
  Claude does: scaffold the MDX file with frontmatter, run `lint:legal` on
  the supplied text, surface any Rule 7.4 / banned-term hits, format
  headings / lists / links, set up the cover image. Claude does NOT: invent
  examples, paraphrase Jon's text, write the body.
- **D-02:** **No fabrication of dates, deal values, IRS bulletin numbers,
  case citations, or quoted authority.** If Jon's draft references a source
  (IRS notice, Treasury reg, court opinion, SEC filing), it must already be
  in Jon's draft — Claude doesn't add citations.

### Seed Post (BLOG-09)
- **D-03:** **Author = Jon Van Loo.** Byline links to `/attorneys/jon-van-loo`.
  Reuses Jon's existing attorney entry; no schema changes.
- **D-04:** **Topic = a current issue in crypto / blockchain tax.** Tags
  `practiceArea: tax`. Aligns with Jon's identified thought-leadership area
  (Phase 4 D-06: "recognized thought leader on tax issues for cryptocurrency
  — has spoken at PLI and other venues").
- **D-05:** **Hard-stop human-action checkpoint at phase end.** Phase 5
  plans BUILD the pipeline first (routes / RSS / `Article` JSON-LD / filter
  chips / `buildArticleLd()`) and scaffold the seed post with
  `draft: true`. The final wave is a `checkpoint:human-action`: Jon pastes
  his draft text → Claude formats into MDX → Jon confirms → Claude flips
  `draft: false`, runs `lint:legal`, commits, and reports the Vercel
  preview URL. **Mirrors the FAQ-DRAFT.md / D-13 gate from Phase 4.** Phase
  cannot close on `draft: true` alone — BLOG-09 requires one published post
  live.

### Index UX (BLOG-05)
- **D-06:** **Chip buttons + URL params on the existing `/blog` index.**
  Two chip rows above the post list:
  - Authors: `All / Aaron / Stuart / Jon / Iris` (the four published
    attorneys; Susan stays draft, excluded; Fishbien stays excluded)
  - Practice areas: `All / M&A / IP & Tech / Tax`
  - Selecting a chip updates the URL (`?author=jon-van-loo&practice=tax`),
    making filtered views shareable. Filters compose (AND across
    dimensions).
  - Filtering is client-side (the post list is small; full hydration not
    required — Astro view transitions or a thin `<script>` is fine).
  - Empty-filtered-state copy: a warm one-liner ("No posts in that combo
    yet — try another filter or [browse all]") with a reset link. Reuses
    the Phase 3 empty-state tone.

### RSS (BLOG-06)
- **D-07:** **One master feed at `/blog/rss.xml`. Full MDX-rendered HTML.**
  Subscribers receive the rendered post body, not just a summary. Pulls in
  `sanitize-html` per the Astro RSS recipe (already noted as conditional in
  `CLAUDE.md` § Content & Blog). Feed metadata: site title, description,
  language=`en-us`, link=`/blog`. Per-item: title, link, pubDate (from
  `publishedAt`), author (from the resolved attorney name), description
  (=summary), content (=sanitized rendered MDX).
- **D-08:** **No per-attorney or per-practice RSS sub-feeds for v1.** One
  feed only. Revisit when there are enough posts to make a sub-feed
  meaningful.

### Post-Page Chrome (BLOG-02, BLOG-03, BLOG-04)
- **D-09:** **Minimal chrome.** Top of post page (above `<slot />`):
  - H1 (post title)
  - One-line byline: `By [Author Name] · [Publish date]` — author name links
    to `/attorneys/[slug]`
  - No reading-time, no "Updated" date in the header (the `updatedAt`
    schema field still drives `Article.dateModified` JSON-LD when set;
    just don't surface it visually)
  Body slot.
  Bottom of post page (below `<slot />`):
  - Author card: headshot (existing placeholder) + name + role + one-line
    summary + "Read [First name]'s full profile →" link
  - `<Disclaimer id="blog" />` (already rendering — keep as-is)
- **D-10:** **Plain MDX only — no custom components for v1.** Standard
  headings, paragraphs, lists, links, blockquotes, code (Shiki via Astro
  default), and images via `astro:assets`. Add Callout / Citation / etc.
  later when a real post needs one. ("Don't add features beyond what the
  task requires.")

### Article JSON-LD (BLOG-04, SEO-04)
- **D-11:** **`buildArticleLd(post)` lives in `src/lib/jsonld.ts`,
  replacing the Phase 1 stub** (the throw at line 115). Returns
  `WithContext<Article>`. Required fields: `@type`, `@context`, `headline`
  (post.title), `author` (resolved attorney `Person` ref or Person blob),
  `datePublished` (post.publishedAt → ISO), `dateModified` (post.updatedAt
  → ISO, fallback to publishedAt), `image` (resolved cover image URL,
  fallback to a sensible site default). Slot-transferred into the
  `<head>` from `BlogPostLayout`, never written into `BaseLayout` directly
  — keeps the Phase 1 slot pattern (Pitfall 12 / FOUND-10).

### Editorial Review (LEGAL-09, reworded 2026-05-28)
- **D-12:** **Review is a human-only process — no schema enforcement, no
  EDITORIAL.md.** Jon's review and Jon's act-of-publishing (flipping
  `draft: false` and committing) ARE the review. LEGAL-09 is satisfied
  structurally by:
  1. **BLOG-02 / `author: reference('attorneys')`** — Zod build fails
     without a named attorney author; no anonymous posts.
  2. **BLOG-03 / per-post disclaimer** — `BlogPostLayout` renders
     `<Disclaimer id="blog" />` automatically; cannot be forgotten in MDX.
  3. **Rule 7.4 / `lint:legal`** — Already scans `src/content/**/*.mdx` at
     prebuild; banned-term hits block the build (Phase 4 D-16).
  4. **`CLIENT_DISCLOSURE_CLEARANCE.md`** — Same clearance bar applies to
     blog content: no client / counterparty / deal-value reference unless
     it's already in the register (Phase 4 D-15).
  5. **`draft: true` default + Jon-controlled flip** — Posts ship hidden
     until Jon flips `draft: false`. Same pattern as Susan Jiang and the
     Phase 4 FAQs.
- **D-13:** **`reviewedBy` field is gone and stays gone.** Already removed
  from `src/content.config.ts`. Do NOT re-add it in any plan or task.
  Phase 4 D-06 (which originally noted `reviewedBy` as part of the blog
  schema) is hereby **amended** — that line is obsolete; the schema no
  longer requires `reviewedBy`.

### Workflow / Ship Expectation (operational)
- **D-14:** End-of-phase order: (1) all infrastructure plans complete on
  preview; (2) `checkpoint:human-action` — Jon pastes seed-post draft
  text; (3) Claude formats into MDX, runs `lint:legal`, surfaces any hits
  to Jon; (4) Jon confirms; (5) Claude flips `draft: false`, commits,
  pushes, merges to `main`; (6) report the production (Vercel) URL.

### Claude's Discretion
- Exact chip-row layout, hover/active styling, mobile collapse behavior
  (use existing tokens from `global.css`).
- Whether filtering is via `<script>` on the index or a small Astro
  islands hydration directive — pick the simpler that works without JS
  for the unfiltered default view.
- `Article` JSON-LD optional fields (`articleSection`, `keywords`,
  `wordCount`) — include where free; skip where they'd require new data.
- `sanitize-html` config (allowed tags / attributes) — start with the
  Astro RSS recipe defaults; tighten only if a CSP issue appears.
- Cover image strategy for the seed post (commission an SVG vs. use an
  existing site asset vs. omit `cover` for v1) — surface options to Jon at
  the formatting step; constraint: 200 KB image budget.
- How to clean up `placeholder-post.mdx` — delete on the same commit that
  publishes the real seed post, or earlier if the file confuses preview
  builds.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project charter & content source of truth
- `.planning/PROJECT.md` — positioning, StoryBrand, three client fears
- `.planning/FIRM_BRIEF.md` — voice, tone, team (no Fishbien), email-only
  pattern
- `.planning/ROADMAP.md` §"Phase 5" — goal + 5 success criteria; phase
  boundary
- `.planning/REQUIREMENTS.md` — Phase 5 covers **BLOG-01, BLOG-02, BLOG-03,
  BLOG-04, BLOG-05, BLOG-06, BLOG-09, SEO-04, LEGAL-09** (BLOG-07 and
  BLOG-08 were descoped on 2026-05-28; do not re-add)
- `.claude/CLAUDE.md` — non-technical lead, plain-English comms,
  non-negotiables
- `CLAUDE.md` (root) — locked stack; `@astrojs/rss` 4.0.18; `sanitize-html`
  note; `schema-dts` 1.1.0; ≥22.12 Node

### Inherited decisions (binding)
- `.planning/URL-CONVENTIONS.md` — locked `/blog/[slug]` URL shape; never
  rename slugs post-launch
- `.planning/phases/04-attorney-practice-area-pages/04-CONTEXT.md` —
  content-fidelity rule, no-fabrication rule, draft-true pattern for hidden
  publishing, FAQ human-approval gate (D-13) precedent that the seed-post
  checkpoint mirrors. **Note:** D-06 in that file mentions `reviewedBy` as
  part of the blog schema — that line is amended by the current phase's
  D-13. The reviewedBy field is gone.
- `.planning/phases/03-homepage-static-pages/03-CONTEXT.md` — empty-state
  tone; Insights teasers on the homepage will pull from the published
  posts list once any post is live (no re-route)
- `.planning/DECISIONS.md` — append D-01..D-14 from this phase

### Legal / compliance
- `.planning/LAW_FIRM_WEBSITE_GUIDE.md` — Rule 7.1 (no misleading claims),
  Rule 7.4 (banned terms), AEO/FAQ guidance, disclaimer best practices,
  attorney-attribution norms
- `.planning/CLIENT_DISCLOSURE_CLEARANCE.md` — clearance register; any
  client/counterparty/deal reference in the seed post must already be in
  here (or Jon adds an entry before publish)

### Code source of truth
- `src/content.config.ts` lines 63–78 — `blog` schema (the field contract
  this phase fills; **note `reviewedBy` is intentionally absent**)
- `src/pages/blog/index.astro` — Insights index (empty-state shell from
  Phase 3 → augmented with chip filters here)
- `src/pages/blog/[slug].astro` — dynamic post route (already filters
  `draft: true`)
- `src/layouts/BlogPostLayout.astro` — render target; line 14 comment
  flags `<JsonLd slot="head" data={buildArticleLd(post)} />` as the Phase 5
  slot transfer
- `src/lib/jsonld.ts` lines 114–115 — current `buildArticleLd()` stub that
  throws; this phase implements it
- `src/content/disclaimers/disclaimers.json` — `blog` disclaimer text
  (already rendering)
- `src/content/blog/placeholder-post.mdx` — Phase 1 scaffold; removed when
  the real seed post publishes
- `src/components/legal/Disclaimer.astro` — `id="blog"` already wired in
  `BlogPostLayout`

### Astro / RSS recipes
- Astro 6 docs: `getStaticPaths` (already used in `[slug].astro`)
- `@astrojs/rss` 4.0.18 — official recipe at `astro.build/en/recipes/rss/`;
  full-content RSS pattern requires `sanitize-html`
- `schema-dts` 1.1.0 `Article` type — JSON-LD builder typing

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `blog` content collection fully defined — `author: reference('attorneys')`
  + `practiceArea: reference('practiceAreas')` already provide the typed
  filter axes (no schema change needed for BLOG-05).
- `/blog` index already exists with the empty-state shell — augment, don't
  recreate. `getCollection('blog', ({ data }) => !data.draft)` is the
  established filter pattern.
- `/blog/[slug].astro` already wires `getStaticPaths` correctly with string
  params (Pitfall 12 / FOUND-10 satisfied).
- `BlogPostLayout` already wraps `BaseLayout` and renders the `blog`
  `<Disclaimer />` — just needs the `<JsonLd slot="head" />` and chrome.
- `src/lib/jsonld.ts` already exports `buildPersonLd` (Phase 4) — same
  pattern for `buildArticleLd`; reuse the `WithContext<T>` typing and
  `schema-dts` import.
- Placeholder headshot SVGs / monograms exist for the author card (ATTY-08
  satisfied by placeholders).

### Established Patterns
- Tailwind v4 namespace utilities only (`text-text`, `bg-bg`, `px-gutter`);
  tokens live in `src/styles/global.css` `@theme` block (Phase 2 D-22 retrofit).
- `BaseLayout` injects site-wide `LegalService` JSON-LD via slot. Per-page
  JSON-LD (Person on attorney, FAQPage on practice, **Article on blog**)
  comes in via `slot="head"` from the specialized layout.
- Disclaimers driven by `<Disclaimer id="..." />` reading `disclaimers.json`
  — one edit updates every render.
- `lint:legal` (scripts/lint-legal.mjs) prebuild scanner covers all of
  `src/content/**/*.mdx` — blog posts are auto-covered. Allowlist entries
  go in the lint config, not in MDX.
- `draft: true` hide-until-ready convention used by Susan Jiang (Phase 4
  D-07) and the Phase 1 placeholder post.
- Astro 6 + Tailwind v4 lock — no `theme()`, no `output: 'hybrid'`,
  no removed APIs (FOUND-10).

### Integration Points
- New file: `src/pages/blog/rss.xml.ts` — `@astrojs/rss` endpoint per the
  Astro recipe. Add `site:` is already set in `astro.config.mjs`.
- Edit: `src/lib/jsonld.ts` — replace `buildArticleLd()` stub.
- Edit: `src/layouts/BlogPostLayout.astro` — add `<JsonLd slot="head"
  data={buildArticleLd(post)} />`; add byline + author card chrome.
- Edit: `src/pages/blog/index.astro` — add filter chips above the post
  list; URL-param-driven; preserve the empty-state branch.
- Edit: `astro.config.mjs` (if needed) — `@astrojs/sitemap` already
  includes `/blog/*` from Phase 1.
- Delete: `src/content/blog/placeholder-post.mdx` when the real seed post
  goes `draft: false`.
- New file: `src/content/blog/<seed-post-slug>.mdx` — Jon-authored,
  crypto-tax topic, `author: jon-van-loo`, `practiceArea: tax`.
- New install: `sanitize-html` + `@types/sanitize-html` (devDep).

</code_context>

<specifics>
## Specific Ideas

### Seed post (D-03 / D-04 / D-05)
- File path: `src/content/blog/<slug>.mdx` — exact slug TBD when Jon
  supplies the title (lowercased kebab-case per `URL-CONVENTIONS.md`).
- Frontmatter scaffold (before Jon's draft text lands):
  ```yaml
  title: "<Jon supplies>"
  slug: "<Jon supplies>"
  author: jon-van-loo
  practiceArea: tax
  publishedAt: <date Jon publishes>
  summary: "<Jon supplies — 1-2 sentence summary; surfaces on /blog list and in RSS>"
  draft: true   # flipped to false at the human-action checkpoint
  cover: <TBD at format step — SVG or omit>
  coverAlt: "<TBD>"
  ```
- Body text is **Jon's draft, verbatim**. Claude formats only.

### Filter chip row (D-06)
- Author chips: `All / Aaron / Stuart / Jon / Iris` (5 chips; Susan
  excluded — draft:true; Fishbien excluded — site-wide).
- Practice chips: `All / M&A / IP & Tech / Tax` (4 chips; reuses the
  shortened display names from `URL-CONVENTIONS.md` slug mappings, NOT the
  verbose slugs).
- URL contract: `?author=<attorney-slug>&practice=<practice-slug>`. Both
  query params optional; absence means "All".
- Shareable filtered URLs (Jon emailing a partner a link to "all Jon's tax
  posts" = `/blog?author=jon-van-loo&practice=tax`).

### Post-page chrome (D-09)
- Byline format: `By Jon Van Loo · May 28, 2026` — date format matches the
  site convention. Author name is a `<a href="/attorneys/jon-van-loo">`.
- Author card at bottom: small headshot (placeholder until Phase 7), name,
  title, focus summary (one line from `attorneys` schema), profile link.

### `Article` JSON-LD shape (D-11)
- `@context: "https://schema.org"`, `@type: "Article"` (or
  `"BlogPosting"` — pick `Article` per BLOG-04 wording).
- `headline`, `author` (Person `@type` blob, name + url), `datePublished`,
  `dateModified`, `image`, `mainEntityOfPage` (post URL), `publisher`
  (Organization blob for BSV — reuse the LegalService data).

### LEGAL-09 satisfaction (D-12)
- Reworded by Jon on 2026-05-28: "Blog editorial process prevents posts
  that could be construed as legal advice — every post renders the legal
  disclaimer." Satisfied structurally by BLOG-02 (Zod author requirement)
  + BLOG-03 (per-post disclaimer in BlogPostLayout). No additional doc or
  schema field required.

</specifics>

<deferred>
## Deferred Ideas

- **Custom MDX components for posts** (`<Callout>`, `<Citation>`,
  `<Definition>`, `<PullQuote>`) — add when a specific post needs them
  (D-10). Don't build speculatively.
- **Per-attorney / per-practice-area RSS sub-feeds** — revisit when post
  volume justifies it (D-08).
- **Sub-route filter pages** (`/blog/by-attorney/[slug]`,
  `/blog/by-practice-area/[slug]`) — chip filters cover BLOG-05 cleanly
  for v1; sub-routes are an SEO move worth considering after 8+ posts.
- **Reading-time, "Updated" date in the header, related-posts list** —
  minimal chrome for v1; revisit when there are ≥3 posts and the index
  starts looking sparse without them.
- **Susan Jiang as an author** — gated on her real bio landing (Phase 4
  D-07). Filter chip row adds her automatically once she goes
  `draft: false`.
- **Newsletter signup / RSS-replacement opt-in** — explicitly out of v1
  scope per PROJECT.md / REQUIREMENTS.md v2 backlog (V2-04). Don't
  surface email-capture UI on `/blog`.
- **Cover-image commissioning** — Jon picks at the format step (SVG vs.
  reuse vs. omit); not a phase blocker.
- **Removing `placeholder-post.mdx`** — done as part of the publish
  commit; no separate plan.

None of the above is scope creep into Phase 5 — discussion stayed within
the Insights blog system boundary.

</deferred>

---

*Phase: 5-Insights (Blog) System*
*Context gathered: 2026-05-28*
