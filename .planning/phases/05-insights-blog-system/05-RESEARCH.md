# Phase 5: Insights (Blog) System - Research

**Researched:** 2026-05-28
**Domain:** Astro 6 content collections + MDX rendering, `@astrojs/rss` 4.x full-content feeds, `schema-dts` `Article` JSON-LD, Tailwind v4 hand-written prose CSS, client-side URL-param filtering for static pages
**Confidence:** HIGH

## Summary

Phase 5 is a **render-out + new-endpoint + content-formatting** phase, not a greenfield build. Phase 1 scaffolded everything: the `blog` content collection (`author`/`practiceArea` references already typed), the `/blog/[slug]` route with `getStaticPaths` filtering drafts, `BlogPostLayout` wrapping `BaseLayout` with `<Disclaimer id="blog" />` already wired, the `JsonLd.astro` slot-transfer component, `buildLegalServiceLd`/`buildPersonLd`/`buildFaqPageLd` working in `src/lib/jsonld.ts`, and a `buildArticleLd` stub that throws. Phase 4 proved the slot-transfer pattern for `Person` and `FAQPage` JSON-LD. The work is **(a)** implement `buildArticleLd` mirroring Phase 4's pattern, **(b)** add chip-filter UX + post-list rendering on `/blog`, **(c)** build `/blog/rss.xml.ts` using `@astrojs/rss` v4 + the **Astro Container API** to render MDX bodies to HTML + `sanitize-html` to scrub, **(d)** add `AuthorCard` and `FilterChipRow` Astro components, **(e)** hand-author ~20 lines of `.prose-bsv` CSS, **(f)** scaffold + then publish one Jon-authored seed post.

The single most consequential technical finding: **the canonical Astro 6 way to render an MDX body to an HTML string for an RSS feed is `experimental_AstroContainer` from `astro/container`** [VERIFIED: docs.astro.build/en/reference/container-reference/]. The older Astro RSS doc still shows a `markdown-it`-on-`post.body` recipe — that does NOT work for MDX (it would tree-shake JSX expressions and components into nothing). The Container API is still flagged "experimental" but it is the only supported MDX-to-HTML path. Phase 5 has zero MDX components in scope (D-10 defers Callout/Citation), so `compiledContent()` would technically also work for *plain* MDX — but the Container API is forward-compatible if v2 adds components, and it's the path the Astro team has stabilized around.

The second consequential finding: **sanitize-html's modern defaults already permit every tag a law-firm thought-leadership post needs** (`h1`-`h6`, `p`, `ul`, `ol`, `li`, `blockquote`, `a`, `strong`, `em`, `code`, `pre`, `span`, `cite`, `figure`, `figcaption`) — the only addition needed is `img` in `allowedTags` (it's allowed as an *attribute* by default but not as a *tag*) [VERIFIED: sanitize-html v2.17 source]. The 2026-05-25 CLAUDE.md note "(per Astro RSS recipe)" is correct but understates how minimal the config is.

**Primary recommendation:** Build the RSS endpoint with the Container API + `sanitize-html.defaults.allowedTags.concat(['img'])` + a small relative-URL → absolute-URL rewrite step. Mirror the Phase 4 JSON-LD builder pattern verbatim for `buildArticleLd`. Use plain server-rendered links (`<a href>`) as the default chip behavior with a small inline progressive-enhancement script (~30 lines) for instant client-side filtering. Defer everything in `<deferred>` in CONTEXT.md — no Callout/Citation, no per-attorney RSS, no sub-routes.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| `/blog` index page generation | Static build (Astro SSG) | — | `getCollection('blog')` at build; no runtime tier |
| `/blog/[slug]` page generation | Static build (Astro SSG) | — | `getStaticPaths` string params; already correct |
| `/blog/rss.xml` endpoint generation | Static build (`.ts` endpoint) | — | Astro pre-renders endpoints at build by default; static XML file in `dist/` |
| MDX-to-HTML for RSS payload | Build-time Container API | `sanitize-html` (scrub) | `astro/container` renders the component tree; sanitize-html is a security/cleanliness pass before XML serialization |
| `Article` JSON-LD on post pages | Build-time `src/lib/jsonld.ts` builder | `JsonLd.astro` slot transfer | schema-dts typed; same slot pattern as Person/FAQPage |
| Chip-filter interaction | Client (DOM script) | Server-resolved `<a href>` defaults | URL is source of truth; SSG can't read query params, so JS filters in-place; the `<a href>` fallback works without JS |
| Author/practice cross-references | Build-time `getEntry()` | — | `reference()` returns `{collection,id}` — must resolve before render |
| Prose typography (`.prose-bsv`) | Hand-authored CSS in `global.css` | Tailwind v4 `@layer components` (optional) | UI-SPEC explicitly forbids `@tailwindcss/typography` plugin for one prose surface |

## Project Constraints (from CLAUDE.md / .claude/CLAUDE.md)

These have the same authority as locked decisions. The plan must not contradict them.

- **Tech stack locked:** Astro 6 + Tailwind v4 + GitHub + Vercel. No alternatives.
- **Plain-English communication:** Jon is a practicing attorney with **no coding background**. Every command/concept explained before it runs; one concept at a time. Avoid restart-Claude flows.
- **Per-page disclaimers on blog posts** (LEGAL-09) — already plumbed via `BlogPostLayout` rendering `<Disclaimer id="blog" />`. **Do not move or duplicate.**
- **JSON-LD on every page** — site-wide LegalService already in `BaseLayout`; `Article` for blog posts is this phase's work.
- **No image > 200 KB committed** (PERF-02). Cover image for the seed post must obey.
- **Tailwind tokens only** — namespace utilities (`text-text`, `bg-bg`, `px-gutter`), never hardcoded hex. (UI-SPEC re-asserts this.)
- **Decision log:** append Phase 5 decisions D-01..D-14 to `.planning/DECISIONS.md`.
- **Email-only contact, no phone** (D-08, Phase 4) — the byline/author-card never surfaces an email or phone on a blog post; the byline links to the attorney profile page, where the partner-contact callout already renders.
- **No "expert"/"specialist" copy** (Rule 7.4 / LEGAL-03) — `lint:legal` prebuild gate scans `src/content/**/*.mdx`, so blog posts are automatically covered. The seed post must clear this lint.
- **No fabrication** — D-01/D-02 in this phase: Jon writes body text; Claude formats. No invented case citations, IRS bulletin numbers, deal values, or counterparties unless Jon supplies them in his draft.

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Content source & fidelity**
- **D-01:** **Jon writes the seed post; Claude formats only.** Same content-fidelity rule as Phase 4 (D-01/D-02). Claude does not draft post body text. Claude does: scaffold the MDX file with frontmatter, run `lint:legal` on the supplied text, surface any Rule 7.4 / banned-term hits, format headings / lists / links, set up the cover image. Claude does NOT: invent examples, paraphrase Jon's text, write the body.
- **D-02:** **No fabrication of dates, deal values, IRS bulletin numbers, case citations, or quoted authority.** If Jon's draft references a source (IRS notice, Treasury reg, court opinion, SEC filing), it must already be in Jon's draft — Claude doesn't add citations.

**Seed Post (BLOG-09)**
- **D-03:** **Author = Jon Van Loo.** Byline links to `/attorneys/jon-van-loo`. Reuses Jon's existing attorney entry; no schema changes.
- **D-04:** **Topic = a current issue in crypto / blockchain tax.** Tags `practiceArea: tax`. Aligns with Jon's identified thought-leadership area (Phase 4 D-06: "recognized thought leader on tax issues for cryptocurrency — has spoken at PLI and other venues").
- **D-05:** **Hard-stop human-action checkpoint at phase end.** Phase 5 plans BUILD the pipeline first (routes / RSS / `Article` JSON-LD / filter chips / `buildArticleLd()`) and scaffold the seed post with `draft: true`. The final wave is a `checkpoint:human-action`: Jon pastes his draft text → Claude formats into MDX → Jon confirms → Claude flips `draft: false`, runs `lint:legal`, commits, and reports the Vercel preview URL. **Mirrors the FAQ-DRAFT.md / D-13 gate from Phase 4.** Phase cannot close on `draft: true` alone — BLOG-09 requires one published post live.

**Index UX (BLOG-05)**
- **D-06:** **Chip buttons + URL params on the existing `/blog` index.** Two chip rows above the post list:
  - Authors: `All / Aaron / Stuart / Jon / Iris` (the four published attorneys; Susan stays draft, excluded; Fishbien stays excluded)
  - Practice areas: `All / M&A / IP & Tech / Tax`
  - Selecting a chip updates the URL (`?author=jon-van-loo&practice=tax`), making filtered views shareable. Filters compose (AND across dimensions).
  - Filtering is client-side (the post list is small; full hydration not required — Astro view transitions or a thin `<script>` is fine).
  - Empty-filtered-state copy: a warm one-liner ("No posts in that combo yet — try another filter or [browse all]") with a reset link. Reuses the Phase 3 empty-state tone.

**RSS (BLOG-06)**
- **D-07:** **One master feed at `/blog/rss.xml`. Full MDX-rendered HTML.** Subscribers receive the rendered post body, not just a summary. Pulls in `sanitize-html` per the Astro RSS recipe (already noted as conditional in `CLAUDE.md` § Content & Blog). Feed metadata: site title, description, language=`en-us`, link=`/blog`. Per-item: title, link, pubDate (from `publishedAt`), author (from the resolved attorney name), description (=summary), content (=sanitized rendered MDX).
- **D-08:** **No per-attorney or per-practice RSS sub-feeds for v1.** One feed only. Revisit when there are enough posts to make a sub-feed meaningful.

**Post-Page Chrome (BLOG-02, BLOG-03, BLOG-04)**
- **D-09:** **Minimal chrome.** Top of post page (above `<slot />`): H1, byline (`By [Author Name] · [Publish date]`, author name links to `/attorneys/[slug]`), no reading-time, no "Updated" date in the header (`updatedAt` still drives `Article.dateModified` JSON-LD when set; just don't surface it visually). Body slot. Bottom of post page (below `<slot />`): Author card (headshot + name + role + one-line summary + "Read [First name]'s full profile →" link), `<Disclaimer id="blog" />`.
- **D-10:** **Plain MDX only — no custom components for v1.** Standard headings, paragraphs, lists, links, blockquotes, code (Shiki via Astro default), and images via `astro:assets`. Add Callout / Citation / etc. later when a real post needs one.

**Article JSON-LD (BLOG-04, SEO-04)**
- **D-11:** **`buildArticleLd(post)` lives in `src/lib/jsonld.ts`, replacing the Phase 1 stub** (the throw at line 115). Returns `WithContext<Article>`. Required fields: `@type`, `@context`, `headline`, `author` (resolved attorney Person blob), `datePublished`, `dateModified`, `image`. Slot-transferred into the `<head>` from `BlogPostLayout`, never written into `BaseLayout` directly — keeps the Phase 1 slot pattern (Pitfall 12 / FOUND-10).

**Editorial Review (LEGAL-09, reworded 2026-05-28)**
- **D-12:** **Review is a human-only process — no schema enforcement, no EDITORIAL.md.** Jon's review and Jon's act-of-publishing (flipping `draft: false` and committing) ARE the review. LEGAL-09 is satisfied structurally by: (1) BLOG-02 Zod `author: reference('attorneys')` — no anonymous posts; (2) BLOG-03 per-post disclaimer in BlogPostLayout — cannot be forgotten; (3) `lint:legal` already scans `src/content/**/*.mdx`; (4) `CLIENT_DISCLOSURE_CLEARANCE.md` same bar applies; (5) `draft: true` default + Jon-controlled flip.
- **D-13:** **`reviewedBy` field is gone and stays gone.** Already removed from `src/content.config.ts`. Do NOT re-add it.

**Workflow / Ship Expectation (operational)**
- **D-14:** End-of-phase order: (1) all infrastructure plans complete on preview; (2) `checkpoint:human-action` — Jon pastes seed-post draft text; (3) Claude formats into MDX, runs `lint:legal`, surfaces any hits to Jon; (4) Jon confirms; (5) Claude flips `draft: false`, commits, pushes, merges to `main`; (6) report the production (Vercel) URL.

### Claude's Discretion

- Exact chip-row layout, hover/active styling, mobile collapse behavior (use existing tokens from `global.css`). **Mostly resolved in UI-SPEC** — rounded-pill, near-black active fill (no accent fill), aria-pressed toggle, `min-h-[44px]`.
- Whether filtering is via `<script>` on the index or a small Astro islands hydration directive — **resolved in UI-SPEC**: inline progressive-enhancement `<script>`, no island (the post list is small, full hydration unnecessary).
- `Article` JSON-LD optional fields (`articleSection`, `keywords`, `wordCount`) — include where free; skip where they'd require new data.
- `sanitize-html` config (allowed tags / attributes) — start with the defaults plus `img`; tighten only if a CSP issue appears.
- Cover image strategy for the seed post (commission an SVG vs. use an existing site asset vs. omit `cover` for v1) — surface options to Jon at the formatting step; constraint: 200 KB image budget.
- How to clean up `placeholder-post.mdx` — **resolved in UI-SPEC research below**: delete on the same commit that publishes the real seed post.
- Whether to add the Zod refinement `cover` present ⇒ `coverAlt` required — **recommended IN scope** (small, lossless, prevents the most common a11y MDX bug).

### Deferred Ideas (OUT OF SCOPE)

- **Custom MDX components for posts** (`<Callout>`, `<Citation>`, `<Definition>`, `<PullQuote>`) — add when a specific post needs them (D-10).
- **Per-attorney / per-practice-area RSS sub-feeds** — revisit when post volume justifies it (D-08).
- **Sub-route filter pages** (`/blog/by-attorney/[slug]`, `/blog/by-practice-area/[slug]`) — chip filters cover BLOG-05 cleanly for v1.
- **Reading-time, "Updated" date in the header, related-posts list** — minimal chrome for v1.
- **Susan Jiang as an author** — gated on her real bio landing (Phase 4 D-07). Filter chip row adds her automatically once she goes `draft: false`.
- **Newsletter signup / RSS-replacement opt-in** — explicitly out of v1 scope per PROJECT.md / REQUIREMENTS.md v2 backlog (V2-04).
- **Cover-image commissioning** — Jon picks at the format step.
- **`reviewedBy` schema field** — gone, stays gone (D-13).

</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| BLOG-01 | `/blog/[slug]` route generates one page per post | Route + `getStaticPaths` already exist and filter draft. Phase 5 adds layout signature `{post, author}`. (Architecture Pattern 1) |
| BLOG-02 | Every post attributed to a named attorney via Zod `reference()` | Already enforced by `src/content.config.ts` line 69 (`author: reference('attorneys')`). Build fails with a typed Zod error if author missing or unknown. **No code change** — verification test recommended. |
| BLOG-03 | Every post renders the blog disclaimer | Already wired — `BlogPostLayout` renders `<Disclaimer id="blog" />`. Layout edit must preserve it. |
| BLOG-04 | Every post renders `Article` JSON-LD (author, datePublished, dateModified, headline, image) | Implement `buildArticleLd()` (currently throws); slot-transfer through `BlogPostLayout` (Architecture Pattern 3 + Code Examples) |
| BLOG-05 | `/blog` index supports filtering by attorney + practice area | Chip-row UX from UI-SPEC; URL params; client-side script + `<a href>` fallback (Architecture Pattern 4 + Code Examples) |
| BLOG-06 | RSS feed at `/blog/rss.xml` via `@astrojs/rss` | New `src/pages/blog/rss.xml.ts` endpoint; Container API for MDX→HTML; sanitize-html scrub; one master feed (Architecture Pattern 5 + Code Examples) |
| BLOG-09 | One seed post published by a named attorney | Scaffold `src/content/blog/<slug>.mdx` with `draft: true` and Jon's `author: jon-van-loo` + `practiceArea: tax` (D-03/D-04); human-action gate at phase end flips `draft: false` (D-05/D-14) |
| SEO-04 | `Article` JSON-LD on every blog post | Covered by BLOG-04 — same builder. SEO-04 is the SEO framing; BLOG-04 is the structural requirement. They share one implementation. |
| LEGAL-09 | Blog editorial process prevents posts without disclaimer | Satisfied structurally — BLOG-02 (Zod author) + BLOG-03 (layout-rendered disclaimer) + existing `lint:legal` + `CLIENT_DISCLOSURE_CLEARANCE.md` + `draft: true` default. D-12 explicitly rewords this requirement as "every post renders the legal disclaimer." Verification test confirms `id="blog"` disclaimer present on every `/blog/[slug]` route. |

</phase_requirements>

---

## Standard Stack

Phase 5 introduces **two new packages** (one runtime, one types-only). Everything else is already installed.

### Core (already installed — verified)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `astro` | 6.3.7 (pinned `^6.3.7`) | SSG, content collections, MDX render, Container API | Locked stack [VERIFIED: npm view astro version → 6.3.7+; package.json line 44] |
| `@astrojs/mdx` | ^5.0.6 | MDX rendering + `getContainerRenderer` export for Container API | Already installed; provides the MDX renderer the Container needs [VERIFIED: package.json line 41] |
| `@astrojs/rss` | **4.0.18** | RSS XML feed generation | **NEW INSTALL.** `peerDependencies` empty so no version conflict. v4 removed the deprecated `drafts` option (no impact — we never used it). Zod moved to independent dep (no impact — we don't import zod from `@astrojs/rss`). [VERIFIED: npm view @astrojs/rss version → 4.0.18 on 2026-05-28; GitHub CHANGELOG] |
| `schema-dts` | ^2.0.0 | Compile-time-typed JSON-LD (Article) | Already a dependency; existing `buildLegalServiceLd`/`buildPersonLd`/`buildFaqPageLd` use it. `Article` type is already exported by the package — no version bump needed. [VERIFIED: package.json line 47] |
| `sharp` | ^0.34.5 | Astro image optimization for cover images | Already installed; `<Image src={post.data.cover}>` works out of the box [VERIFIED: package.json line 48] |

### New (this phase)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@astrojs/rss` | **4.0.18** | RSS XML serialization | `src/pages/blog/rss.xml.ts` only. Imported once. |
| `sanitize-html` | **2.17.4** | Scrub rendered MDX HTML before RSS serialization | RSS endpoint only. Defaults already permit every prose tag we need; only `img` must be added to `allowedTags`. [VERIFIED: npm view sanitize-html version → 2.17.4 on 2026-05-28] |
| `@types/sanitize-html` (devDep) | **2.16.1** | TypeScript types for sanitize-html | Required only for type-checking the RSS endpoint. [VERIFIED: npm view @types/sanitize-html version → 2.16.1] |

### Existing built-in (Astro 6 / Node 22 — no install)
| Capability | Module | Purpose |
|------------|--------|---------|
| `getCollection`, `getEntry`, `getEntries`, `render` | `astro:content` | Already used elsewhere in the codebase; pattern is verified |
| `experimental_AstroContainer` | `astro/container` | Render MDX `<Content/>` to an HTML string for the RSS payload [VERIFIED: docs.astro.build/en/reference/container-reference/] |
| `loadRenderers`, `getContainerRenderer` | `astro:container`, `@astrojs/mdx` | Load the MDX renderer into the Container [VERIFIED: same source] |
| `Intl.DateTimeFormat` | Node 22 / V8 stdlib | Format `publishedAt` as "May 28, 2026" — no date-fns/dayjs needed |

### Installation (one command)

```bash
npm install @astrojs/rss@4.0.18 sanitize-html@2.17.4
npm install -D @types/sanitize-html@2.16.1
```

**Version verification:** all three confirmed current on the npm registry on 2026-05-28 via `npm view`. `@astrojs/rss` 4.0.18 is the latest in the v4 line; no v5 exists. `sanitize-html` 2.17 is the current stable. [VERIFIED: npm registry 2026-05-28]

### Alternatives Considered

| Recommended | Alternative | Why we don't | When alt makes sense |
|-------------|-------------|--------------|----------------------|
| Astro Container API + `sanitize-html` | `markdown-it` on `post.body` (older Astro RSS recipe) | Works for plain Markdown only; **silently drops** MDX JSX expressions and any imported MDX components. The seed post is plain prose now, but the pipeline must work for any future MDX with imports. | A pure-Markdown blog with zero MDX features. Not us. |
| Astro Container API + `sanitize-html` | `unified` + custom remark/rehype pipeline ([gsong.dev pattern](https://gsong.dev/articles/astro-feed-unified/)) | Higher mass — adds 4-5 new deps (`unified`, `remark-parse`, `remark-rehype`, `rehype-stringify`, custom plugins) for the same output we get from Container + sanitize-html. Granular control we don't need for one post. | Multi-feed sites (Atom + JSON Feed + RSS variants), or sites that need to transform MDX AST before serialization. Not us. |
| `experimental_AstroContainer` | `astro/content`'s `render(entry)` → `<Content />` directly | `<Content />` is an Astro component — it can't be rendered to a string outside a `.astro` template. The Container is **the** way to convert it to HTML in a `.ts` endpoint. | N/A — there is no alternative for the same use case. |
| Hand-authored `.prose-bsv` CSS in `global.css` | `@tailwindcss/typography` plugin | One prose surface across the entire site; the plugin would add ~1500 lines of CSS for the rules we use ~9. UI-SPEC explicitly forbids the plugin. | A site with many varied editorial surfaces. Not us. |
| Inline `<script>` for client-side filter | Astro island (`client:idle` component) | The post list is ~5-20 items; full Preact/React hydration is overkill. The script is ~30 lines, no framework, runs after DOMContentLoaded, and naturally degrades to the `<a href>` fallback if JS is disabled. | A filter UI with 100+ items, faceted search, sorting, etc. Not us. |
| `schema-dts` `Article` | `BlogPosting` | SEO-04 wording says "Article". `Article` is the parent of `BlogPosting`; for legal thought-leadership content (which is editorial analysis, not personal blogging), `Article` is the more credible signal. Google treats both identically for rich-result eligibility. [CITED: schema.org/Article hierarchy] | `BlogPosting` is appropriate for personal/diary-style blogs. Not BSV. |
| Defaults + add `img` for `sanitize-html` | Strict per-tag/per-attribute allowlist | Modern sanitize-html defaults already cover every tag we need (h1-h6, p, ul, ol, li, blockquote, a, strong, em, code, pre, span, figure, etc.). A custom allowlist is more code with no security upgrade. | Output destined for cross-site embedding where stricter controls matter. RSS goes to feed readers, which already sandbox. |
| Container API (experimental flag) | `compiledContent()` from Astro 5/6's MDX entry API | `compiledContent()` works for **plain** MDX (no components, no JSX expressions); the Container API works for everything. Phase 5 is plain MDX (D-10) so either works **today** — but the Container API is the future-proof path and what Astro docs recommend [VERIFIED: prass.tech + codetv.dev articles, both 2025+]. Choosing it now avoids a migration later. | Phase 5 only — no benefit to choosing compiledContent given D-10. |

## Package Legitimacy Audit

> Phase 5 installs **two new packages**: `@astrojs/rss` (runtime) and `sanitize-html` (runtime), plus `@types/sanitize-html` (dev/types). Audit follows.

slopcheck CLI was not installed in this environment. Substituting manual verification: registry age check, downloads check, source repo check, and authenticity verification against official documentation.

| Package | Registry | Age | Downloads/wk | Source Repo | Manual check | Disposition |
|---------|----------|-----|--------------|-------------|--------------|-------------|
| `@astrojs/rss` | npm | published since 2022, v4 line current | ~150K/wk (official Astro org) | github.com/withastro/astro/tree/main/packages/astro-rss | OFFICIAL Astro org, referenced from docs.astro.build/en/recipes/rss/ and the locked CLAUDE.md stack | Approved [VERIFIED: docs.astro.build official recipe + CLAUDE.md line 47] |
| `sanitize-html` | npm | published 2014, mature | ~3.5M/wk | github.com/apostrophecms/sanitize-html (now in monorepo) | Maintained by Apostrophe CMS; cited in Astro's official RSS recipe; dep tree includes `htmlparser2` v10 (current) | Approved [VERIFIED: docs.astro.build RSS recipe explicitly recommends it; npm view confirmed 2.17.4] |
| `@types/sanitize-html` | npm | maintained by DefinitelyTyped | ~3.4M/wk | github.com/DefinitelyTyped/DefinitelyTyped | Official DT types package, mirrors sanitize-html versioning (2.16 ~ matches 2.17 minor) | Approved [VERIFIED: npm view returned 2.16.1; DefinitelyTyped is the canonical source for community types] |

**Packages removed due to slopcheck [SLOP] verdict:** none (slopcheck not run)
**Packages flagged as suspicious [SUS]:** none

**Slopcheck unavailability note:** Because slopcheck was not available in this environment, the planner SHOULD insert a `checkpoint:human-verify` task before the `npm install` step that asks the executor to confirm the three packages match the names/versions in this audit table (defensive against typosquats like `@astrojs/rrs` or `sanitize-htnml`). All three names match the official Astro RSS docs and the CLAUDE.md locked stack, so the residual risk is small.

## Architecture Patterns

### System Architecture Diagram

```
                                  BUILD TIME (astro build)
                                            │
        ┌───────────────────────────────────┼─────────────────────────────────┐
        │                                   │                                 │
  src/content/blog/<slug>.mdx        src/lib/jsonld.ts                  src/pages/blog/
    (frontmatter: author=ref,         buildArticleLd(post,author)         index.astro
     practiceArea=ref, publishedAt,                                       [slug].astro
     summary, cover?, coverAlt?,                                          rss.xml.ts  (NEW)
     draft)                                                                      │
        │                                                                        │
        ▼                                                                        │
  Zod schema validation                                                          │
  (content.config.ts)                                                            │
   - author required (BLOG-02)                                                   │
   - practiceArea required                                                       │
   - draft default false                                                         │
   - cover image() optional                                                      │
        │                                                                        │
        ▼                                                                        ▼
                                                                          For each post:
  getCollection('blog', !draft)                                          1. getEntry(author)
        │                                                                2. render(post) → <Content/>
        ├──────────────────────────────┐                                 3. container.renderToString(Content)
        ▼                              ▼                                 4. fix relative URLs
  index.astro                    [slug].astro                            5. sanitize-html(html)
   - getCollection(blog)          - getStaticPaths(string slug)          6. push { title, link, pubDate,
   - getCollection(attorneys)     - getEntry(post.data.author)              author, description=summary,
   - resolve refs server-side     - render(post) → <Content/>               content=clean }
   - emit post list w/             - pass {post, author} to layout              │
     data-author/data-practice         │                                        ▼
   - render FilterChipRow x2           ▼                              rss(...).body
   - inline <script>: progressive  BlogPostLayout                     → dist/blog/rss.xml
     URL-param filter on click     - <JsonLd slot="head"
     + window.onload restore         data={buildArticleLd(post,author)}/>
        │                          - H1, byline (author link), <time>
        ▼                          - optional cover image
  dist/blog/index.html             - prose-bsv MDX body slot
                                   - AuthorCard (resolved attorney)
                                   - <Disclaimer id="blog" /> (already wired)
                                       │
                                       ▼
                                  dist/blog/<slug>/index.html
                                  (Article JSON-LD in <head>,
                                   blog disclaimer in body, valid HTML)
```

A reader can trace one post: MDX file with frontmatter → Zod validates → `getStaticPaths` emits string slug → `getEntry(post.data.author)` resolves the reference → `render(post)` compiles the body → `BlogPostLayout` receives `{post, author}` and injects `Article` JSON-LD via slot transfer → renders byline, optional cover, MDX body via `<slot/>`, AuthorCard, blog disclaimer → static HTML in `dist/blog/<slug>/`. The same `getCollection` + `getEntry` pattern drives the index post-list and the RSS feed; the RSS endpoint additionally uses the Astro Container API to convert `<Content/>` to a string.

### Component Responsibilities

| File | Responsibility | Phase 5 change |
|------|----------------|----------------|
| `src/lib/jsonld.ts` | `buildArticleLd(post, author)` returns `WithContext<Article>` | **EDIT** — replace the throwing stub at line 114 |
| `src/layouts/BlogPostLayout.astro` | Render H1 + byline + cover + slot + AuthorCard + disclaimer; inject `Article` JSON-LD via slot | **EDIT** — extend signature to `{post, author}`, add JsonLd + chrome |
| `src/pages/blog/[slug].astro` | `getStaticPaths` + `getEntry(post.data.author)` + pass `{post, author}` to layout | **EDIT** — add the `getEntry` resolution and pass `author` as a prop |
| `src/pages/blog/index.astro` | Empty-state branch (preserve), filter chip rows, post-list rendering with `data-*`, inline filter script | **EDIT** — augment, don't recreate |
| `src/pages/blog/rss.xml.ts` | Generate `/blog/rss.xml` via `@astrojs/rss` v4 + Container API + sanitize-html | **CREATE** |
| `src/components/sections/FilterChipRow.astro` | Reusable chip-row component (per UI-SPEC) | **CREATE** |
| `src/components/sections/AuthorCard.astro` | Reusable horizontal author block | **CREATE** |
| `src/styles/global.css` | `.prose-bsv` ~20 lines of CSS for MDX body rhythm | **EDIT** — append the prose rule |
| `src/content.config.ts` | Optional Zod `.refine()` — `cover` present ⇒ `coverAlt` required | **EDIT** (recommended) |
| `src/content/blog/<seed-post>.mdx` | One Jon-authored seed post (crypto/blockchain tax) | **CREATE** at the human-action checkpoint |
| `src/content/blog/placeholder-post.mdx` | The Phase 1 scaffold post | **DELETE** in the same commit that publishes the real seed post |
| `astro.config.mjs` | (Optional) `mdx({ rehypePlugins: [...] })` to add `rehype-external-links` for external-link safety on MDX | **EDIT** — see Pitfall 8 |
| `package.json` | Add `@astrojs/rss`, `sanitize-html`, `@types/sanitize-html`; optionally add `test:article-jsonld`, `test:rss-feed`, `test:blog-filter` scripts | **EDIT** |
| `tests/*.spec.ts` (new) | Validation tests (see Validation Architecture) | **CREATE** |

### Recommended Project Structure (files this phase touches)

```
src/
├── content/
│   ├── blog/
│   │   ├── placeholder-post.mdx       # DELETE on publish-seed-post commit
│   │   └── <jons-crypto-tax-post>.mdx # CREATE; draft:true → false at gate
│   └── ...
├── components/
│   └── sections/
│       ├── FilterChipRow.astro        # NEW
│       └── AuthorCard.astro           # NEW
├── lib/
│   └── jsonld.ts                      # buildArticleLd impl (replace throw)
├── layouts/
│   └── BlogPostLayout.astro           # signature → {post,author}; chrome
├── pages/
│   └── blog/
│       ├── index.astro                # chip rows + post list + filter script
│       ├── [slug].astro               # resolve author ref; pass to layout
│       └── rss.xml.ts                 # NEW — Container API + sanitize-html
└── styles/
    └── global.css                     # append .prose-bsv rule
```

### Pattern 1: Dynamic post route + resolve author reference (BLOG-01 / BLOG-02 plumbing)

**What:** The route reads the blog collection, filters drafts, emits string slug params, AND resolves `post.data.author` (a reference) to the full attorney entry before passing both to the layout.

**Why this matters:** The current `[slug].astro` passes only `{ entry }`. Phase 5's `BlogPostLayout` needs the author's `name`, `slug`, `focus`, `headshot`, etc. for the byline + AuthorCard. The Phase 4 `PracticeAreaLayout` already proves the `getEntries()` pattern for references — `[slug].astro` is the right place to resolve, keeping the layout pure-presentational.

```astro
---
// src/pages/blog/[slug].astro — EDIT
import { getCollection, getEntry, render } from 'astro:content';
import BlogPostLayout from '../../layouts/BlogPostLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((entry) => ({
    params: { slug: entry.data.slug },  // STRING (Pitfall 6 / FOUND-10)
    props: { entry },
  }));
}

const { entry } = Astro.props;
const author = await getEntry(entry.data.author);  // resolves { collection, id } → attorney entry
if (!author) throw new Error(`Blog post '${entry.data.slug}' references unknown author`);
const { Content } = await render(entry);
---
<BlogPostLayout post={entry} author={author}>
  <Content />
</BlogPostLayout>
```

[VERIFIED: docs.astro.build/en/guides/content-collections/ — "use the `reference()` function ... to resolve referenced data via `getEntry()` or `getEntries()`"]

### Pattern 2: `Article` JSON-LD via slot transfer (BLOG-04 / SEO-04)

**What:** `buildArticleLd(post, author)` returns a typed `WithContext<Article>`. `BlogPostLayout` injects it via `<JsonLd slot="head" data={...} />`. The slot transfers through `BaseLayout`'s `<slot name="head" />` into the document `<head>`. **No `BaseLayout` edit.** Same pattern as `Person` (Phase 4) and `FAQPage` (Phase 4).

**When to use:** Every blog post page (BLOG-04, SEO-04).

```astro
// src/layouts/BlogPostLayout.astro — frontmatter
import JsonLd from '../components/seo/JsonLd.astro';
import { buildArticleLd } from '../lib/jsonld';
...
<BaseLayout title={title} description={description}>
  <JsonLd slot="head" data={buildArticleLd(post, author)} />
  ...
</BaseLayout>
```

[VERIFIED: codebase — Phase 4 `AttorneyLayout` line 35 and `PracticeAreaLayout` line 50 use the identical slot-transfer pattern; both pass `jsonld-legalservice.spec.ts` / `person-jsonld.spec.ts` / `faqpage-jsonld.spec.ts` (Phase 4 wave 0)]

### Pattern 3: Cover image via `astro:assets` `<Image />` (BLOG-04 image field + PERF-03)

**What:** The blog schema declares `cover: image().optional()` (line 74 of content.config.ts). At render time, `<Image src={post.data.cover} alt={post.data.coverAlt} width={1280} height={720} />` produces an optimized AVIF/WebP variant with lazy loading by default. The 16:9 aspect (1280×720) matches UI-SPEC.

**When to use:** When the post has a cover (the cover field is optional; layout guards on `post.data.cover`).

**Key fact:** Content-collection `image()` assets MUST live under `src/` (not `/public/`). This is already documented in the Phase 1 DECISIONS.md (2026-05-26 entry: "Content-collection image() assets must live under src/"). The seed post's cover (if any) goes under `src/content/blog/images/` or `src/assets/blog/`.

```astro
{post.data.cover && (
  <figure class="mt-10">
    <Image
      src={post.data.cover}
      alt={post.data.coverAlt}
      width={1280}
      height={720}
      class="aspect-[16/9] w-full rounded-card object-cover"
    />
  </figure>
)}
```

`coverAlt` is currently `z.string().optional()` in the schema; UI-SPEC asks for a Zod refinement to make it required-when-cover-present. **Recommended in-scope** — see Pitfall 5.

### Pattern 4: Server-rendered `<a href>` + progressive-enhancement script for chip filters (BLOG-05)

**What:** SSG can't read `Astro.url.searchParams` at build time (only at request time on server-rendered pages [VERIFIED: docs.astro.build/en/guides/content-collections/ — "Search parameters are only available at request time in server-rendered pages"]). So the strategy is:

1. **Server-render all posts** with `data-author="<slug>"` `data-practice="<slug>"` attributes.
2. **Each chip is an `<a href>`** that sets the URL params: `<a href="/blog?author=jon-van-loo&practice=tax">`. The `<a href>` causes a full-page reload — with no JS this still works, just slower.
3. **Inline `<script>` (no `is:inline`, no framework)** runs on `DOMContentLoaded`: reads `window.location.search`, finds the matching chip in each row, sets `aria-pressed="true"`, hides non-matching `<li>` items with the `hidden` attribute, and binds chip-click handlers that call `history.pushState` + re-run the filter — so clicks become instant without a reload.

**Why this works:**
- **JS off:** chip is just a link; navigation works.
- **JS on:** click handler intercepts before navigation, filter runs in-place.
- **Bookmarking / sharing:** the URL always reflects the filter — copy/paste a URL with `?author=jon-van-loo&practice=tax` and the next visitor sees the same filtered view (the script reads the URL on load).
- **Empty-filtered state:** when 0 items remain visible, reveal the `<div id="empty-filtered" hidden>` block (already in UI-SPEC).

**Inline vs `is:inline` vs Astro Island:** UI-SPEC resolved this — inline `<script>` with no framework. Confirm with this research: `is:inline` is the right Astro directive to **prevent Astro from bundling/processing the script**, which keeps the bundle small and CSP-safe (the `<script>` content stays as-is in the HTML, not extracted as a separate hashed asset). For a ~30-line filter that needs no imports, `<script is:inline>` is the cleanest path.

```astro
<!-- src/pages/blog/index.astro — at bottom of section, after <ul> and <div id="empty-filtered"> -->
<script is:inline>
  (function () {
    function readFilter() {
      const params = new URLSearchParams(window.location.search);
      return { author: params.get('author'), practice: params.get('practice') };
    }
    function applyFilter() {
      const { author, practice } = readFilter();
      const items = document.querySelectorAll('#post-list > li');
      let visible = 0;
      items.forEach((li) => {
        const a = li.getAttribute('data-author');
        const p = li.getAttribute('data-practice');
        const match = (!author || a === author) && (!practice || p === practice);
        li.hidden = !match;
        if (match) visible++;
      });
      document.getElementById('empty-filtered').hidden = visible !== 0;
      document.getElementById('post-list').hidden = visible === 0;
      // a11y: update aria-pressed on chips
      document.querySelectorAll('[data-chip]').forEach((chip) => {
        const param = chip.getAttribute('data-param');
        const value = chip.getAttribute('data-value');  // null for "All" chip
        const active = param === 'author' ? author === value : practice === value;
        chip.setAttribute('aria-pressed', String(active));
      });
    }
    function onChipClick(e) {
      const chip = e.currentTarget;
      const href = chip.getAttribute('href');
      // Let JS-disabled clients fall through; for JS clients intercept:
      e.preventDefault();
      history.pushState({}, '', href);
      applyFilter();
    }
    document.addEventListener('DOMContentLoaded', () => {
      applyFilter();
      document.querySelectorAll('[data-chip]').forEach((c) => c.addEventListener('click', onChipClick));
      window.addEventListener('popstate', applyFilter);
    });
  })();
</script>
```

**Note on chip `<a>` semantics:** UI-SPEC specifies `<a href>` (not `<button>`) because the href must work natively when JS is off. The chip carries `aria-pressed` (correct ARIA for a toggle) — note that combining `<a>` with `aria-pressed` is unusual but supported and is the right call here since the element is structurally a navigation link with a toggle-like visual state. (An alternative — `<button onclick>` with no native href — would break the no-JS case.)

### Pattern 5: RSS endpoint with Container API for MDX → HTML (BLOG-06 / D-07)

**What:** A new `src/pages/blog/rss.xml.ts` Astro endpoint. Returns an `XMLResponse` built by `@astrojs/rss`'s `rss()` helper. For each post, the body is rendered via the experimental Container API (the only way to convert MDX-with-components to a string in Astro 6), URL-rewritten to absolute, sanitized via `sanitize-html`, and passed as the item's `content`.

**The four-step body-rendering flow** (the most consequential code in this phase):

1. `const { Content } = await render(post)` — same API used by `[slug].astro`.
2. `const container = await experimental_AstroContainer.create({ renderers: await loadRenderers([getContainerRenderer()]) })` — initialize the renderer.
3. `const rawHtml = await container.renderToString(Content)` — get HTML as a string.
4. `const cleanHtml = sanitizeHtml(rewriteRelativeUrls(rawHtml), { allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']) })` — scrub.

The `rewriteRelativeUrls` step converts `<a href="/attorneys/jon">` → `<a href="https://bsvlaw.com/attorneys/jon">` so feed reader clicks work. A regex `/(href|src)="\//g` → `$1="${SITE.baseUrl}/"` is sufficient because Astro emits clean relative paths in MDX output. (More elaborate setups parse with rehype; we don't need that.)

**Critical detail:** `@astrojs/rss` v4 emits `<content:encoded>` (CDATA-wrapped) for the `content` field, which is what feed readers like Inoreader and Feedly read as the full body. The `description` field renders as `<description>` (often shown as a summary). So we set `description: post.data.summary` and `content: cleanHtml` — readers display summary first, full content when expanded. [VERIFIED: GitHub PR #5366 — the PR that added `content` support to `@astrojs/rss` for full-content feeds]

```typescript
// src/pages/blog/rss.xml.ts — NEW
import rss from '@astrojs/rss';
import { getCollection, getEntry, render } from 'astro:content';
import { experimental_AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer as getMDXRenderer } from '@astrojs/mdx';
import sanitizeHtml from 'sanitize-html';
import { SITE } from '../../lib/site';

export async function GET(context: { site: URL }) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  const container = await experimental_AstroContainer.create({
    renderers: await loadRenderers([getMDXRenderer()]),
  });

  const items = await Promise.all(
    posts
      .sort((a, b) => +b.data.publishedAt - +a.data.publishedAt)
      .map(async (post) => {
        const author = await getEntry(post.data.author);
        const { Content } = await render(post);
        const rawHtml = await container.renderToString(Content);
        const absoluteHtml = rawHtml.replace(/(href|src)="\/(?!\/)/g, `$1="${SITE.baseUrl}/`);
        const cleanHtml = sanitizeHtml(absoluteHtml, {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
          // defaults.allowedAttributes already permit a:[href,name,target] and
          // img:[src,srcset,alt,title,width,height,loading] — sufficient for our prose.
        });
        return {
          title: post.data.title,
          link: `${SITE.baseUrl}/blog/${post.data.slug}`,
          pubDate: post.data.publishedAt,
          author: author!.data.name,         // resolved attorney's full name (D-07, no email)
          description: post.data.summary,    // 1-2 sentence summary
          content: cleanHtml,                // full sanitized MDX-rendered HTML
        };
      })
  );

  return rss({
    title: 'BSV Insights',
    description: 'Practical analysis from the BSV team on M&A, IP & technology transactions, and tax for the companies building what\'s next.',
    site: context.site!,                    // from astro.config.mjs site: 'https://bsvlaw.com'
    items,
    customData: '<language>en-us</language>',
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
  });
}
```

[VERIFIED: docs.astro.build/en/reference/container-reference/ for Container API; @astrojs/rss v4.0.18 npm view + CHANGELOG; sanitize-html v2.17 defaults from raw source on GitHub apostrophecms/sanitize-html/main]

### Anti-Patterns to Avoid

- **Don't rely on `Astro.url.searchParams` at build time** on the static `/blog` index. SSG means the URL is the *path*, not the query string. Filtering must happen client-side.
- **Don't import `markdown-it` to render MDX bodies for RSS.** It's the old Astro recipe; it cannot render MDX JSX expressions or components. Use the Container API. (The current Phase 5 plain-MDX-only constraint makes markdown-it work *today*, but it's the wrong pattern to set.)
- **Don't add `@tailwindcss/typography`** for one prose surface — UI-SPEC explicitly forbids; hand-write `.prose-bsv` (~20 lines).
- **Don't render `post.data.author` directly** — it's `{collection, id}`. Render `author.data.name` after `getEntry()` resolution.
- **Don't put the `Article` JSON-LD inside `<article>` or anywhere outside the `<head>`** — slot through `BaseLayout`'s `head` slot.
- **Don't omit `description` in the RSS item** — empty `<description>` shows blank in most feed readers; UI-SPEC specifies `summary` is description.
- **Don't put an email address in the RSS `author` field** (D-08 / UI-SPEC RSS metadata note). Use `author.data.name` only.
- **Don't try to publish the seed post in the same commit as the pipeline plans** — D-05/D-14 require the post to be a `checkpoint:human-action` wave at phase end.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| RSS XML serialization | Hand-written XML string concatenation | `@astrojs/rss` v4 `rss()` helper | Hand-rolling RSS misses `<atom:link rel="self">`, MIME types, CDATA escaping, etc. The official package is ~7KB and handles every spec edge. |
| MDX-to-HTML string | A regex over post.body, or `marked`/`markdown-it` | `experimental_AstroContainer` + `renderToString` | The only way to render Astro/MDX components to a string. Forward-compatible with D-10 future. |
| HTML scrubbing | Hand-written tag/attribute allowlist | `sanitize-html` defaults | The defaults already cover every prose tag; one extra tag (`img`) added inline. ~3.5M weekly downloads, htmlparser2-backed. |
| `<script type=ld+json>` rendering | Hand-rolled `<script>` with template literal | Existing `JsonLd.astro` | Already escapes `<`/`>`/`&`/U+2028 via `JSON.stringify`. Phase 1 ships it; Phases 3-4 use it without modification. |
| `Article` JSON-LD object shape | Hand-written object literal | `schema-dts` `WithContext<Article>` | A typo in `datePublished` becomes a TS error, not a silent SEO bug. Same pattern as `buildLegalServiceLd`/`buildPersonLd`. |
| Date formatting "May 28, 2026" | `dayjs` / `date-fns` / manual string build | `Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' })` | Built into V8; zero install; same format every time; SSR-safe (no client hydration). |
| Filter UI state machine | Preact/React component + island | Inline `<script is:inline>` (~30 lines) | 5 + 4 chips, 0-20 items, no async state. A framework is more code than the feature. |
| Per-post disclaimer text | Hardcoded string in BlogPostLayout | Existing `<Disclaimer id="blog" />` | Already plumbed and Phase 1-validated; one edit updates site-wide. |
| Prose typography | `@tailwindcss/typography` plugin | ~20 lines of hand-CSS in `global.css` | One prose surface across the site. Plugin is ~1500 lines for our 9 rules. UI-SPEC forbids it. |
| External-link security (target/rel) | Inline `target="_blank" rel="..."` on every `<a>` in MDX | `rehype-external-links` plugin in MDX integration | Authoring-time forgetfulness becomes a tab-jacking vulnerability. A rehype plugin enforces it deterministically at build. |

**Key insight:** Phase 5's *new code* is small: one JSON-LD builder (~25 lines), one RSS endpoint (~50 lines), two Astro components (~80 lines combined), one Zod refinement (~5 lines), one CSS rule (~25 lines), and ~30 lines of inline filter script. Resist building anything bigger.

## Common Pitfalls

### Pitfall 1: `Astro.url.searchParams` is **empty at build time** on static pages (BLOG-05)

**What goes wrong:** A plan that reads `Astro.url.searchParams.get('author')` in `index.astro` frontmatter to server-render the filtered list will compile, but at build time the URL is `/blog` (no query string), so `searchParams.get('author')` is always `null`. The "filtered" page is identical to the unfiltered page in the static output.

**Why it happens:** Astro 6 with no adapter override on the page is fully static — `getStaticPaths` enumerates the URLs. Query strings are a request-time concept, and the request happens after the page is already built.

**How to avoid:** Filter client-side (Pattern 4). Server-render the full list, hide non-matching `<li>` items via inline `<script>` reading `window.location.search`. The URL stays the source of truth; the script reads it on load and on `popstate`.

**Warning signs:** A frontmatter line `const author = Astro.url.searchParams.get('author')` in `index.astro` — that's the smoking gun.

### Pitfall 2: Astro Container API is **experimental** — pin the Astro version

**What goes wrong:** `experimental_AstroContainer` is explicitly flagged "experimental and subject to breaking changes, even in minor or patch releases" [VERIFIED: docs.astro.build/en/reference/container-reference/]. A point-release of Astro could rename or restructure the API.

**Why it matters here:** The RSS endpoint is the entire BLOG-06 deliverable. An Astro upgrade that breaks the Container API breaks the feed.

**How to avoid:**
- Pin `astro` to `^6.3.7` (already the case in package.json).
- When upgrading Astro in any future phase, the upgrade plan MUST include a "verify Container API still imports cleanly" task.
- Add `tests/rss-feed.spec.ts` that builds the site and asserts `/blog/rss.xml` is valid XML with at least one `<item>` (Validation Architecture). If a future Astro version breaks the Container API, this test fails the build — preventing a silent regression in production.

**Backup plan:** If the Container API breaks before this phase ships, **fallback to `compiledContent()`** — Astro's blog entry `entry.compiledContent` (or render() with markdown-it) for MDX-without-components works today and is stable. Per D-10 there are no components in the seed post, so this fallback fully covers our v1 needs. Document the fallback in the Wave 0 plan as a contingency.

### Pitfall 3: `sanitize-html` defaults are **safe** but `<img>` is allowed-as-attribute-not-as-tag

**What goes wrong:** A blog post with `![A diagram](./diagram.svg)` renders to `<img src="..." alt="...">` in the MDX body. After `sanitizeHtml(html, sanitizeHtml.defaults)`, the `<img>` tag is **stripped** because `img` is not in `defaults.allowedTags` — even though `img: ['src', 'alt', ...]` is in `defaults.allowedAttributes`. Result: feed readers display the post body with no images.

**Why it happens:** sanitize-html v2 distinguishes "which tags exist" (allowedTags) from "what attributes those tags may carry" (allowedAttributes). An attribute permission on a stripped tag is dead code.

**How to avoid:** Always pass `allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img'])`. The seed post may not have images, but the pipeline must support them (UI-SPEC permits cover images, and a future post may include an inline figure).

**Verification:** Source-code-confirmed default tags include `address, article, aside, footer, header, h1-h6, hgroup, main, nav, section, blockquote, dd, div, dl, dt, figcaption, figure, hr, li, menu, ol, p, pre, ul, a, abbr, b, bdi, bdo, br, cite, code, data, dfn, em, i, kbd, mark, q, rb, rp, rt, rtc, ruby, s, samp, small, span, strong, sub, sup, time, u, var, wbr, caption, col, colgroup, table, tbody, td, tfoot, th, thead, tr` — but NOT `img`, `iframe`, `script`, `style`, or `form`. [VERIFIED: raw.githubusercontent.com/apostrophecms/sanitize-html main/index.js]

### Pitfall 4: Layout-signature change breaks the `[slug].astro` contract

**What goes wrong:** `BlogPostLayout` Props is currently `{ post }`. Phase 5 changes it to `{ post, author }`. If `[slug].astro` is updated but the Phase 1 placeholder route or any other consumer isn't, TypeScript flags it but a soft edit could miss it. The page would render with `author === undefined` and crash on `author.data.name`.

**How to avoid:** Make both edits in the same task (the same wave), and add a `tests/blog-post-render.spec.ts` test that builds the site and asserts the byline `<a href="/attorneys/jon-van-loo">` is present on every `/blog/<slug>` page. (Today there's only `placeholder-post.mdx` with `draft:true` — but during the human-action gate Jon's real post becomes the validator.)

**One subtle case:** the placeholder-post.mdx has `author: "placeholder-attorney"` which references a draft attorney that may not exist. As long as `placeholder-post.mdx` itself stays `draft: true`, the Zod validation never fires on it (the loader filters drafts). Don't change that pattern until the file is deleted.

### Pitfall 5: `cover` optional but `coverAlt` should be required-when-set (a11y)

**What goes wrong:** The schema currently has `cover: image().optional()` and `coverAlt: z.string().optional()`. A post can ship with `cover` set and `coverAlt` unset, producing an unlabeled image — a WCAG 2.1 SC 1.1.1 (Non-text Content) violation.

**How to avoid (recommended, in-scope):** Add a Zod `.refine()` to the blog schema:

```ts
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.mdx', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      // ... existing fields ...
      cover: image().optional(),
      coverAlt: z.string().optional(),
      draft: z.boolean().default(false),
    }).refine(
      (data) => !data.cover || (data.coverAlt && data.coverAlt.length > 0),
      { message: 'coverAlt is required when cover is set', path: ['coverAlt'] },
    ),
});
```

The refinement runs at build time; missing alt text becomes a Zod error, not an a11y bug. This is **5 lines of code** and matches the FOUND-03 "Zod schemas catch missing fields at build time" principle. Add it.

**Why this is in-scope despite being a small schema change:** the field already exists (no migration), the rule is a11y-mandatory, and UI-SPEC's Accessibility Contract explicitly calls it out ("Cover image: `coverAlt` required when `cover` present"). Adding the refine is a 1-task change with no blast radius.

### Pitfall 6: Astro `getStaticPaths` string-param requirement (FOUND-10 — already handled)

**What goes wrong:** Astro 6 requires `params: { slug: <string> }`. Passing a number or object 500s the build. The current `[slug].astro` already uses `params: { slug: entry.data.slug }` which is a string field — correct.

**How to avoid:** Don't regress this when editing `[slug].astro` to add the `getEntry(author)` call.

### Pitfall 7: Container API + Vite environments + `loadRenderers`

**What goes wrong:** `loadRenderers` is imported from the virtual module `astro:container`, which is only available in Vite environments [VERIFIED: docs.astro.build/en/reference/container-reference/]. Astro endpoints (`.ts` files in `src/pages/`) ARE in the Vite environment at build time, so this works for our RSS endpoint. But: if a future plan tries to use the Container API in a Node script outside Astro (e.g., a custom build hook), `loadRenderers` will not resolve.

**How to avoid:** Keep Container API usage inside `src/pages/blog/rss.xml.ts` (an Astro endpoint, which IS a Vite environment). Don't move it to a `scripts/` Node file.

**Symptom of confusion:** `TypeError: Cannot read properties of undefined (reading 'getContainerRenderer')` — means `loadRenderers` ran in a non-Vite context.

### Pitfall 8: `rehype-external-links` + Astro MDX integration

**What goes wrong:** Inline MDX links to external sites (IRS, court opinions, SEC filings) without `rel="noopener noreferrer" target="_blank"` are a tab-jacking risk and (per UI-SPEC) lack the `↗` glyph affordance. Hand-writing `<a target="_blank" rel="noopener noreferrer">` in MDX every time is fragile.

**How to avoid:** Add `rehype-external-links` to the MDX integration in `astro.config.mjs`. The package is in the locked CLAUDE.md stack ([VERIFIED: CLAUDE.md line ~ Tech Stack §Content & Blog]) but not yet installed.

```js
// astro.config.mjs — EDIT
import mdx from '@astrojs/mdx';
import rehypeExternalLinks from 'rehype-external-links';

export default defineConfig({
  // ...
  integrations: [
    mdx({
      rehypePlugins: [
        [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
      ],
    }),
    sitemap({ /* ... */ }),
    icon(),
  ],
  // ...
});
```

**Does it replace or extend defaults?** Astro's MDX integration accepts `rehypePlugins` as an **additive** list — your plugins are applied **after** Astro's built-in plugins (shiki for code highlighting, autolinking headings) [CITED: docs.astro.build/en/guides/integrations-guide/mdx/]. v2's `extendDefaultPlugins` flag is gone; the new model is "defaults always extend; opt out via `gfm: false` / `smartypants: false`."

**Install needed:** `npm install rehype-external-links@3.0.0` [VERIFIED: npm view rehype-external-links version → 3.0.0 on 2026-05-28]. CLAUDE.md lists 3.0.0 as the locked version — current. Add to the same install command as the RSS deps.

**Note on the UI-SPEC `↗` glyph:** UI-SPEC says external links carry a small `↗` glyph via `::after`. `rehype-external-links` adds the `target/rel` attributes; the glyph can be appended via the plugin's `content` option (renders an element after each external link), OR via CSS `a[target="_blank"]::after { content: " ↗" }` inside `.prose-bsv`. The CSS approach is lower-mass and what UI-SPEC implies. Use CSS.

### Pitfall 9: Deleting `placeholder-post.mdx` mid-flight

**What goes wrong:** The Phase 1 `src/content/blog/placeholder-post.mdx` references `author: "placeholder-attorney"` (a draft attorney from Phase 1 placeholder data). It currently has `draft: true`, so the loader filters it out and Zod doesn't validate the bad ref. Deleting it is safe — except: if any test or CI script expects the file to exist, deletion breaks the test.

**How to avoid:**
- Grep before deletion: `grep -r "placeholder-post" tests/ scripts/ src/` (or use the Grep tool).
- Delete on the same commit that publishes the real seed post (avoid an intermediate state with 0 posts and the empty-state shell, which would temporarily fail BLOG-09).
- Specifically: at the human-action checkpoint (Wave-final), Jon's draft text → MDX file created with `draft: false` AND `placeholder-post.mdx` deleted in the same git commit.

**Verification:** After delete + new-post commit, `git ls-files src/content/blog/` should show exactly one MDX file (the seed post). `npm run build` should succeed. `/blog` should show one post.

### Pitfall 10: View Transitions not required for chip filtering

**What goes wrong:** A plan adds `<ViewTransitions />` to `BaseLayout` for "smooth chip-filter transitions," introducing a new feature, new CSP exemptions, and new bug surface.

**How to avoid:** The chip script uses `history.pushState` + in-place hide/show — no page reload, no transition needed. View Transitions are a Phase 7 polish question if at all. Skip in Phase 5.

### Pitfall 11: Vercel adapter + Astro static endpoint `.ts` file

**What goes wrong:** An Astro `.ts` endpoint in `src/pages/` is, by default, **statically pre-rendered** at build time on Astro 6. With the `@astrojs/vercel` adapter, the same endpoint can sometimes be flagged as serverless if `output: 'server'` is set. The current `astro.config.mjs` doesn't set `output`, so the default is `output: 'static'` for Astro 6 — the RSS file is pre-built into `dist/blog/rss.xml`. Good.

**How to avoid:** Don't add `output: 'server'` or `output: 'hybrid'` to `astro.config.mjs`. The `output: 'hybrid'` mode is removed in Astro 5+ (FOUND-10 / Phase 1 lint). The RSS endpoint runs at build time and produces a static file — exactly what we want.

**Verification:** After build, `dist/blog/rss.xml` (or `dist/client/blog/rss.xml`, depending on Vercel adapter version) should exist as a static XML file, not a serverless function.

## Code Examples

### `buildArticleLd()` — implement the stub (BLOG-04 / SEO-04 / D-11)

```typescript
// src/lib/jsonld.ts — REPLACE the stub at line 114
import type { CollectionEntry } from 'astro:content';
import type { Article, WithContext } from 'schema-dts';
import { SITE } from './site';

export function buildArticleLd(
  post: CollectionEntry<'blog'>,
  author: CollectionEntry<'attorneys'>,
): WithContext<Article> {
  const p = post.data;
  const url = `${SITE.baseUrl}/blog/${p.slug}`;
  // Image: prefer the post's cover; fall back to a site default (D-11 fallback rule).
  // Note: At runtime in jsonld.ts we only have the *image asset reference*, not its
  // public URL. The layout that calls this should pass a resolved URL string via a
  // wrapper, OR the builder accepts the URL directly. Cleaner: build the URL in the
  // layout (where `getImage()` is in-context) and pass it as an arg.
  const imageUrl = p.cover
    ? `${SITE.baseUrl}${(p.cover as any).src ?? ''}` // image() returns { src, width, height }
    : `${SITE.baseUrl}/og-default.png`;              // site default fallback
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title,
    author: {
      '@type': 'Person',
      name: author.data.name,
      url: `${SITE.baseUrl}/attorneys/${author.data.slug}`,
    },
    datePublished: p.publishedAt.toISOString(),
    dateModified: (p.updatedAt ?? p.publishedAt).toISOString(),
    image: imageUrl,
    mainEntityOfPage: url,
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      url: SITE.baseUrl,
    },
  };
}
```

[VERIFIED: schema-dts v2 exports `Article` type; field shapes match Google's Article rich-result requirements per developers.google.com/search/docs/appearance/structured-data/article — `headline`, `image`, `datePublished`, `dateModified`, `author.name`, `author.url`, `publisher` are all recommended]

**Note on `image` URL extraction:** Astro's `image()` schema field returns an `ImageMetadata` object with `{ src, width, height, format }`. The `src` is the build-output URL path (e.g. `/_astro/cover.abc123.webp`). Building the full absolute URL requires `${SITE.baseUrl}${cover.src}`. The plan should test this against an actual cover image to confirm the path shape (a verification task in Wave 0 is recommended). If the path shape differs, fall back to using `getImage({ src: post.data.cover, width: 1200, height: 630 })` in `BlogPostLayout` and pass the resolved URL string to `buildArticleLd(post, author, imageUrl)`.

### `BlogPostLayout.astro` — full structure (D-09 + D-11 + D-12)

```astro
---
// src/layouts/BlogPostLayout.astro — EDIT
import BaseLayout from './BaseLayout.astro';
import Disclaimer from '../components/legal/Disclaimer.astro';
import JsonLd from '../components/seo/JsonLd.astro';
import AuthorCard from '../components/sections/AuthorCard.astro';
import { Image } from 'astro:assets';
import { buildArticleLd } from '../lib/jsonld';
import type { CollectionEntry } from 'astro:content';

interface Props {
  post: CollectionEntry<'blog'>;
  author: CollectionEntry<'attorneys'>;
}

const { post, author } = Astro.props;
const title = `${post.data.title} — BSV Insights`;
const description = post.data.summary;

// Build the visible date once, server-side, so SSR renders static text.
const formattedDate = new Intl.DateTimeFormat('en-US', {
  month: 'long', day: 'numeric', year: 'numeric',
}).format(post.data.publishedAt);
const isoDate = post.data.publishedAt.toISOString().slice(0, 10);
---

<BaseLayout title={title} description={description}>
  <JsonLd slot="head" data={buildArticleLd(post, author)} />

  <article class="bg-bg py-section">
    <div class="mx-auto max-w-prose px-gutter">
      <header>
        <h1 class="text-h1 font-bold text-text">{post.data.title}</h1>
        <p class="mt-4 text-small text-text-muted">
          By <a
            href={`/attorneys/${author.data.slug}`}
            class="text-accent underline decoration-1 underline-offset-2 motion-safe:hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >{author.data.name}</a>
          {' · '}
          <time datetime={isoDate}>{formattedDate}</time>
        </p>
      </header>

      {post.data.cover && (
        <figure class="mt-10">
          <Image
            src={post.data.cover}
            alt={post.data.coverAlt!}    {/* Zod refine guarantees non-empty when cover set */}
            width={1280}
            height={720}
            class="aspect-[16/9] w-full rounded-card object-cover"
          />
        </figure>
      )}

      <div class="prose prose-bsv mt-10 max-w-none text-body text-text">
        <slot />
      </div>
    </div>
  </article>

  <section aria-label="About the author" class="bg-bg pb-section">
    <div class="mx-auto max-w-prose px-gutter">
      <h2 class="sr-only">About the author</h2>
      <AuthorCard attorney={author} />
    </div>
  </section>

  <Disclaimer id="blog" />
</BaseLayout>
```

[CITED: UI-SPEC component contract for `BlogPostLayout.astro` (the locked template) — this code mirrors it 1:1 with the actual builder import]

### `.prose-bsv` CSS rule (~20 lines, hand-authored)

```css
/* src/styles/global.css — APPEND after the @media (prefers-reduced-motion) block */

/* MDX body typography contract for /blog/[slug]. Hand-written rather than
   @tailwindcss/typography — one prose surface, ~20 rules, plugin is overkill.
   Token-only; no hardcoded hex. Rhythm contract from UI-SPEC § Spacing Scale. */
@layer components {
  .prose-bsv > * + * { margin-top: 1.5em; }      /* paragraph-to-paragraph rhythm */
  .prose-bsv h2 { font-size: var(--text-h3); font-weight: 700; margin-top: 1.75em; margin-bottom: 0.5em; line-height: 1.25; }
  .prose-bsv h3 { font-size: var(--text-body-lg); font-weight: 700; margin-top: 1.5em; margin-bottom: 0.4em; }
  .prose-bsv p { font-size: var(--text-body); line-height: 1.625; }
  .prose-bsv ul, .prose-bsv ol { padding-left: 1.25em; }
  .prose-bsv ul { list-style: disc; }
  .prose-bsv ol { list-style: decimal; }
  .prose-bsv li + li { margin-top: 0.5em; }
  .prose-bsv blockquote {
    margin: 2em 0;
    padding-left: 1em;
    border-left: 2px solid var(--color-border);
    font-style: italic;
    color: var(--color-text-muted);
  }
  .prose-bsv a {
    color: var(--color-accent);
    text-decoration: underline;
    text-decoration-thickness: 1px;
    text-underline-offset: 2px;
  }
  @media (hover: hover) and (prefers-reduced-motion: no-preference) {
    .prose-bsv a:hover { text-decoration-thickness: 2px; }
  }
  .prose-bsv a:focus-visible {
    outline: 2px solid var(--color-accent);
    outline-offset: 2px;
    border-radius: 2px;
  }
  .prose-bsv a[target="_blank"]::after {
    content: " ↗";
    color: var(--color-accent);
  }
  .prose-bsv img { display: block; margin: 1.5em auto; max-width: 100%; height: auto; border-radius: var(--radius-card); }
  .prose-bsv pre {
    padding: 1em;
    border-radius: var(--radius-card);
    overflow-x: auto;
    background-color: color-mix(in srgb, var(--color-text) 4%, transparent);
  }
  .prose-bsv code:not(pre code) {
    padding: 0.125em 0.375em;
    border-radius: 0.25em;
    background-color: color-mix(in srgb, var(--color-text) 5%, transparent);
    font-size: 0.92em;
  }
}
```

Notes:
- `color-mix(in srgb, var(--color-text) 4%, transparent)` is a 2024 CSS-stable feature; supported in all current browsers Astro targets [VERIFIED: caniuse.com — Baseline 2023]. Lets us derive a subtle "code background" tint from the text token without adding a new `--color-*` token.
- The `a[target="_blank"]::after` selector pairs with the `rehype-external-links` config — every external link gets a `↗` glyph at zero authoring cost.
- The leading `> * + * { margin-top: 1.5em }` is the Tailwind-typography-inspired "owl selector" idiom and gives the entire prose block consistent vertical rhythm.

### RSS endpoint — see Pattern 5 above (full code listed there)

### `AuthorCard.astro` — sketch

```astro
---
// src/components/sections/AuthorCard.astro — NEW
import { Image } from 'astro:assets';
import type { CollectionEntry } from 'astro:content';

interface Props { attorney: CollectionEntry<'attorneys'>; }
const { attorney } = Astro.props;
const d = attorney.data;
const firstName = d.name.split(' ')[0];
---
<div class="flex flex-col gap-6 sm:flex-row sm:items-center mx-auto max-w-prose rounded-card border border-border bg-bg-elevated p-6 shadow-card">
  <Image
    src={d.headshot}
    alt={d.headshotAlt}
    width={160}
    height={160}
    class="h-20 w-20 rounded-card border border-border bg-bg-elevated object-cover"
  />
  <div class="flex-1">
    <p class="text-h3 font-bold text-text">
      <a
        href={`/attorneys/${d.slug}`}
        class="text-text underline decoration-1 underline-offset-2 motion-safe:hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >{d.name}</a>
    </p>
    <p class="mt-1 text-small uppercase tracking-wide text-text-muted">{d.title}</p>
    <p class="mt-3 text-body text-text-muted">{d.focus}</p>
    <p class="mt-4">
      <a
        href={`/attorneys/${d.slug}`}
        class="text-accent underline decoration-1 underline-offset-2 motion-safe:hover:decoration-2"
      >Read {firstName}&rsquo;s full profile &rarr;</a>
    </p>
  </div>
</div>
```

### `FilterChipRow.astro` — sketch (per UI-SPEC component contract)

```astro
---
// src/components/sections/FilterChipRow.astro — NEW
interface ChipOption { value: string | null; label: string; ariaLabel?: string }
interface Props {
  label: string;
  paramName: 'author' | 'practice';
  options: ChipOption[];
  activeValue: string | null;
  otherActiveParams: Record<string, string | null>;
}
const { label, paramName, options, activeValue, otherActiveParams } = Astro.props;
const labelId = `chiprow-${paramName}`;

function buildHref(value: string | null) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(otherActiveParams)) {
    if (v) params.set(k, v);
  }
  if (value) params.set(paramName, value);
  else params.delete(paramName);
  const qs = params.toString();
  return qs ? `/blog?${qs}` : '/blog';
}
---
<div aria-labelledby={labelId}>
  <p id={labelId} class="mb-2 flex items-center gap-2 text-small font-medium uppercase tracking-wide text-text-muted">
    <span class="block h-1 w-1.5 rounded-full bg-accent" aria-hidden="true"></span>
    {label}
  </p>
  <div class="flex flex-wrap items-center gap-2">
    {options.map((opt) => {
      const isActive = activeValue === opt.value;
      return (
        <a
          href={buildHref(opt.value)}
          data-chip
          data-param={paramName}
          data-value={opt.value}
          aria-pressed={isActive}
          aria-label={opt.ariaLabel}
          class:list={[
            'inline-flex items-center justify-center rounded-full',
            'min-h-[44px] px-4',
            'text-small font-medium',
            'transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg',
            isActive
              ? 'bg-text text-bg border border-text'
              : [
                  'border border-border bg-bg-elevated text-text-muted',
                  'motion-safe:hover:bg-text/[0.04] motion-safe:hover:text-text motion-safe:hover:border-text/[0.15]',
                ],
          ]}
        >{opt.label}</a>
      );
    })}
  </div>
</div>
```

### `index.astro` post-list + chip wiring (sketch)

```astro
---
// src/pages/blog/index.astro — REWRITE inside the posts.length > 0 branch
import { getCollection, getEntry } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Button from '../../components/ui/Button.astro';
import FilterChipRow from '../../components/sections/FilterChipRow.astro';

const posts = await getCollection('blog', ({ data }) => !data.draft);
const sorted = posts.sort((a, b) => +b.data.publishedAt - +a.data.publishedAt);

// Resolve each post's author + practiceArea once, server-side.
const enriched = await Promise.all(sorted.map(async (p) => ({
  post: p,
  author: await getEntry(p.data.author),
  practice: await getEntry(p.data.practiceArea),
})));

// Build chip options from the four PUBLISHED attorneys + three practice areas.
// (Susan auto-excluded — getCollection on attorneys with !draft will surface only
// the four she-isn't-included list; Fishbien never exists at all.)
const attorneys = await getCollection('attorneys', ({ data }) => !data.draft);
const practices = await getCollection('practiceAreas', ({ data }) => !data.draft);

const authorChips = [
  { value: null, label: 'All' },
  ...attorneys.map((a) => ({
    value: a.data.slug,
    label: a.data.name.split(' ')[0],
    ariaLabel: `Show posts by ${a.data.name}`,
  })),
];
const practiceChips = [
  { value: null, label: 'All' },
  ...practices.map((p) => ({ value: p.data.slug, label: p.data.name })),
];
---
<BaseLayout title="Insights — Belcher, Smolen & Van Loo LLP" description="...">
  <section class="mx-auto max-w-3xl px-gutter py-section">
    <h1 class="text-h1 font-bold text-text">Insights</h1>
    <p class="mt-4 text-body-lg text-text-muted">Practical analysis from the BSV team on M&amp;A, IP, and tax for the companies building what&rsquo;s next.</p>

    {posts.length === 0 ? (
      {/* EXISTING empty-state — keep verbatim from Phase 3 */}
    ) : (
      <>
        <div class="mt-10 space-y-3">
          <FilterChipRow label="Filter by attorney" paramName="author" options={authorChips} activeValue={null} otherActiveParams={{ practice: null }} />
          <FilterChipRow label="Filter by practice area" paramName="practice" options={practiceChips} activeValue={null} otherActiveParams={{ author: null }} />
        </div>

        <ul id="post-list" class="mt-10 space-y-6">
          {enriched.map(({ post, author, practice }) => {
            const fdate = new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(post.data.publishedAt);
            const iso = post.data.publishedAt.toISOString().slice(0, 10);
            return (
              <li class="border-b border-border pb-6 last:border-b-0"
                  data-author={author?.data.slug}
                  data-practice={practice?.data.slug}>
                <h2 class="text-h3 font-bold text-text">
                  <a href={`/blog/${post.data.slug}`} class="hover:text-accent transition-colors">{post.data.title}</a>
                </h2>
                <p class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-small text-text-muted">
                  <span>By {author?.data.name}</span>
                  <span aria-hidden="true">·</span>
                  <span class="inline-flex items-center rounded-full border border-border px-2 py-0.5 text-text-muted">{practice?.data.name}</span>
                  <span aria-hidden="true">·</span>
                  <time datetime={iso}>{fdate}</time>
                </p>
                <p class="mt-3 line-clamp-2 text-body text-text-muted">{post.data.summary}</p>
              </li>
            );
          })}
        </ul>

        <div id="empty-filtered" hidden role="status" aria-live="polite" class="mt-12 max-w-prose">
          <h2 class="text-h3 font-bold text-text">No posts in that combo — yet.</h2>
          <p class="mt-3 text-body text-text-muted">
            Try a different filter, or <a href="/blog" class="text-accent underline decoration-1 underline-offset-2 motion-safe:hover:decoration-2">browse all Insights</a>.
          </p>
        </div>

        {/* progressive-enhancement filter script — see Pattern 4 */}
        <script is:inline>/* ... see Pattern 4 ... */</script>
      </>
    )}
  </section>
</BaseLayout>
```

### Seed post scaffold (D-03 / D-04 / D-05)

```mdx
---
title: "[Jon supplies — placeholder before drafting]"
slug: "[Jon supplies — kebab-case]"
author: jon-van-loo
practiceArea: tax
publishedAt: 2026-05-28
summary: "[Jon supplies — 1-2 sentence summary]"
draft: true
# cover: ./images/seed-post-cover.svg          # optional, Jon decides at format step
# coverAlt: "..."                              # required when cover is set (Pitfall 5 refine)
---

<!-- Body text is JON'S DRAFT, VERBATIM (D-01). Claude formats only. -->
[Jon supplies — body text pasted at the human-action checkpoint]
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `pagesGlobToRssItems(import.meta.glob('./posts/*.md'))` | `getCollection('blog')` + manual `items.map()` | Astro 2 → 3 (content collections) | We're already on the modern pattern; the legacy helper still works but is for non-collection blogs only. |
| `markdown-it` on `post.body` for RSS content | `experimental_AstroContainer` + `renderToString(Content)` | Astro 4.9 (Container API introduced) | MDX-with-components actually renders; legacy path silently drops JSX. |
| `@tailwindcss/typography` plugin for all prose | Hand-written `.prose-*` rules for narrow single-prose sites | Tailwind v4 era (utility-first depth + token system) | We use hand-CSS per UI-SPEC. The plugin remains the right choice for sites with many editorial surfaces. |
| Astro 5/6 `BlogPosting` → `Article` debate | Either is valid; Google treats both identically | (no change) | Per SEO-04 wording we choose `Article`. |
| `astro` `Astro.url.searchParams` for filter UIs | Client-side script reading `window.location.search` on static pages | Astro 4+ static-vs-server distinction crystallized | Filter logic stays in `<script>`, URL stays source of truth. |
| Astro v2 `markdown.extendDefaultPlugins: false` | v2+ `markdown.gfm: false` / `markdown.smartypants: false` individual flags | Astro 2.0 | We don't disable defaults; this is informational. |

**Deprecated/outdated:**
- **The pre-Container `markdown-it` RSS recipe** — still in older Astro docs pages but does not work for MDX-with-components. Will likely be updated to the Container approach in future docs revisions.
- **`@astrojs/rss` `drafts` option** — removed in v4.0.0. We don't use it (we filter drafts via `getCollection({ data }) => !data.draft`), so no impact.

## Runtime State Inventory

> Not a rename/refactor/migration phase — greenfield content + new endpoint. Most categories N/A.

| Category | Items Found | Action Required |
|----------|-------------|------------------|
| Stored data | None — no datastore; content is static MDX | None — verified no DB in stack |
| Live service config | None — Vercel deploy reads from git only | None |
| OS-registered state | None | None |
| Secrets / env vars | None — RSS endpoint uses only static `SITE` constants and content-collection reads | None |
| Build artifacts | `placeholder-post.mdx` becomes stale once real seed post lands (currently `draft: true` so loader filters it; but should be removed for cleanliness at publish time) | **Delete** `src/content/blog/placeholder-post.mdx` in the same commit that flips the real seed post's `draft: false`. Pitfall 9 covers the timing. |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Astro 6.3.7's `experimental_AstroContainer` API surface (specifically `loadRenderers` + `getContainerRenderer` from `@astrojs/mdx`) is stable across the v6.3 minor line | Pitfall 2 + Pattern 5 | If a 6.3.x patch release breaks the API, the RSS endpoint breaks. Mitigation: pin `astro@^6.3.7` (already in package.json); add a `tests/rss-feed.spec.ts` build-time test. Fallback: `compiledContent()` for plain MDX (D-10 says no components, so the fallback covers v1). |
| A2 | The `image()` schema field in Astro 6 returns an `ImageMetadata` with a `src` property pointing to the build-output URL path (e.g. `/_astro/cover.abc123.webp`) | `buildArticleLd` example | If the shape is different (e.g. `format`, `src` differs), the absolute-URL build for `Article.image` fails or produces a wrong URL. Mitigation: Wave 0 verification task — render a test post with a cover, inspect `dist/`'s `<script type=ld+json>` content, confirm the URL resolves. Alternative: use `getImage({ src: post.data.cover, width: 1200, height: 630 })` in the layout and pass `imageUrl` to `buildArticleLd`. |
| A3 | `sanitize-html` v2.17 defaults will not change between writing and execution (~weeks) | Pitfall 3 + Pattern 5 | If defaults shift, allowed tags might silently change. Very low risk — sanitize-html is a 12-year-old mature library; defaults are stable. |
| A4 | The CLAUDE.md-locked `rehype-external-links` 3.0.0 is compatible with `@astrojs/mdx` 5.0.6's rehype plugin pipeline | Pitfall 8 | If a peer incompatibility surfaces at install, downgrade to `rehype-external-links@2.x` (still maintained). Verified: rehype-external-links 3.x is the current stable line and Astro MDX 5.x uses unified 11+, which is compatible. [VERIFIED: npm view rehype-external-links peerDependencies — no peer pins on unified version] |
| A5 | The Phase 1 `<JsonLd slot="head">` slot-transfer pattern continues to work for the `Article` blob the same way it works for `Person`/`FAQPage`/`LegalService` | Pattern 2 | If `BaseLayout`'s `<slot name="head">` is missing or renamed, the JSON-LD lands in `<body>` not `<head>`. Risk is low — Phase 4 verified the same pattern with two builders. Wave 0 should include `tests/article-jsonld.spec.ts` that asserts the `<script type="application/ld+json">` appears inside `<head>`. |
| A6 | Jon's seed post body will be plain prose (no IRS bulletin citations, no court opinion links, no quoted authority that would expand scope) | Whole phase | If the body cites multiple SEC filings/IRS notices, the format-step task is bigger than a quick wave. D-02 explicitly says citations must already be in Jon's draft — Claude won't add them — so this is bounded. Mitigation: budget the human-action checkpoint generously. |
| A7 | The 200KB image budget (PERF-02) is enforceable on a future cover image — the seed post may ship without a cover | Code Examples + Pattern 3 | Low risk — `cover` is optional. Jon picks at format step. Add a Wave 0 task to verify the existing image-budget check (Phase 1) covers `src/content/blog/`. |

**If empty:** Not empty — A1, A2, and A5 are the only ones that need a Wave 0 verification task; A3, A4, A6, A7 are flagged for awareness, not blocking.

## Open Questions

1. **Does Jon want the `↗` glyph on every external link in the seed post?**
   - What we know: UI-SPEC specifies `↗` via `::after`; rehype-external-links adds the `target/rel`.
   - What's unclear: Whether Jon wants the visual indicator OR just the security attributes.
   - Recommendation: Default to YES (it's the UI-SPEC contract and the lower-mass path); surface at format step if Jon prefers no glyph.

2. **`og-default.png` site fallback for `Article.image` when no cover is set**
   - What we know: `buildArticleLd` needs an `image` (Google recommends it). If no cover, we fall back to a site default.
   - What's unclear: Does an `og-default.png` exist in `public/` or `src/assets/`?
   - Recommendation: Planner adds a Wave 0 task to either create a 1200×630 site-default OG image (using the existing BSV mark/hero motif) OR confirm one exists. If none exists, propose a minimalist BSV-mark-on-white SVG-rendered-to-PNG. Without it, the JSON-LD has a broken image URL.

3. **`og-default.png` vs PERF-02 image budget**
   - What we know: PERF-02 caps committed images at 200KB.
   - What's unclear: A 1200×630 PNG can easily exceed 200KB; a WebP at the same size is well under.
   - Recommendation: Use a WebP-or-SVG site fallback; pre-build is unnecessary because the build pipeline handles WebP. Pinned in the Wave 0 task above.

4. **Cover image source — `src/content/blog/images/` vs `src/assets/blog/`?**
   - What we know: Content-collection `image()` requires `src/`-rooted paths.
   - What's unclear: There's no convention yet — Phase 4's headshot pattern places them under `src/assets/attorneys/`.
   - Recommendation: Match Phase 4 convention — `src/assets/blog/<slug>-cover.svg|webp`. The MDX frontmatter `cover: ../../assets/blog/<slug>-cover.svg` resolves naturally.

5. **Is "Jon" filter chip the right label, or "Jon Van Loo"?**
   - What we know: UI-SPEC pinned `All / Aaron / Stuart / Jon / Iris` (first names).
   - What's unclear: Nothing — UI-SPEC resolved this. (Recorded here as a courtesy to planner for cross-referencing.)
   - Recommendation: First names per UI-SPEC. The `aria-label` on each chip supplies the full name for screen readers.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js ≥22.12 | Astro build + RSS endpoint | ✓ (engines pin) | ≥22.12 | — |
| `astro` | build + Container API | ✓ | 6.3.7+ | — |
| `@astrojs/mdx` | MDX + Container renderer | ✓ | 5.0.6 | — |
| `schema-dts` | Article JSON-LD typing | ✓ | 2.0.0 | — |
| `sharp` | cover image processing | ✓ | 0.34.5 | — |
| `@astrojs/rss` | RSS XML serialization | ✗ — needs `npm install @astrojs/rss@4.0.18` | — | Hand-roll RSS XML (not recommended; planner inserts the install task) |
| `sanitize-html` | scrub MDX HTML for RSS | ✗ — needs `npm install sanitize-html@2.17.4` | — | Skip sanitization (security risk; not recommended) |
| `@types/sanitize-html` | TS types | ✗ — needs `npm install -D @types/sanitize-html@2.16.1` | — | `// @ts-ignore` the import (lints fail; not recommended) |
| `rehype-external-links` | MDX external-link safety | ✗ — needs `npm install rehype-external-links@3.0.0` | — | Hand-write `target/rel` per link (fragile; not recommended) |
| Vercel build environment | Production deploy | ✓ (existing) | Node 22 default | — |
| `@playwright/test` + `cheerio` | Validation tests | ✓ | 1.60.0 / 1.2.0 | — |

**Missing dependencies with no fallback:** none — every missing item has a viable fallback, but the recommended action is to install them per the locked CLAUDE.md stack.

**Missing dependencies with fallback:** `@astrojs/rss`, `sanitize-html`, `@types/sanitize-html`, `rehype-external-links` — all four are install-only, no other configuration needed.

## Validation Architecture

> `workflow.nyquist_validation: true` — section required.

### Test Framework

| Property | Value |
|----------|-------|
| Framework | `@playwright/test` 1.60.0 (+ `cheerio` 1.2.0 for HTML parsing) |
| Config file | `playwright.config.ts` (exists; Phase 1) |
| Quick run command | `npx playwright test tests/<file>.spec.ts` |
| Full suite command | `npm test` |

**Existing test conventions to mirror:** build once in `beforeAll`, read `dist/<path>/index.html`, parse with `cheerio`, assert JSON-LD content via `script[type="application/ld+json"]`. Use `fs.readFileSync` for file-existence and content-string assertions. The Phase 4 `tests/person-jsonld.spec.ts` and `tests/faqpage-jsonld.spec.ts` are the templates to copy.

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| BLOG-01 | Each non-draft post produces a `/blog/<slug>/index.html` returning 200 | build+fs | `npx playwright test tests/blog-pages-exist.spec.ts` | ❌ Wave 0 |
| BLOG-02 | Build fails when a blog MDX has no `author` field (Zod) | unit (negative case via fixture) | `npx playwright test tests/blog-zod-author.spec.ts` | ❌ Wave 0 |
| BLOG-03 | Every `/blog/<slug>` page renders the disclaimer text from `disclaimers.json` `id="blog"` | build+parse | extend `tests/disclaimer-crawl.spec.ts` (already exists) | ✅ extend |
| BLOG-04 / SEO-04 | Every `/blog/<slug>` page has valid `Article` JSON-LD in `<head>` with `headline`, `author.name`, `author.url`, `datePublished`, `dateModified`, `image`, `mainEntityOfPage`, `publisher` | build+parse | `npx playwright test tests/article-jsonld.spec.ts` | ❌ Wave 0 |
| BLOG-05 | `/blog?author=jon-van-loo` URL — chip with `data-value="jon-van-loo"` has `aria-pressed="true"` after JS runs; non-matching `<li>` items have `hidden` attribute | build+browser script | `npx playwright test tests/blog-filter.spec.ts` (uses Playwright's `page.goto` + `expect.toHaveAttribute`) | ❌ Wave 0 |
| BLOG-05 | URL with no params — all `<li>` visible, all "All" chips `aria-pressed="true"` | browser | same as above | — |
| BLOG-05 | A bookmarkable filtered URL `(?author=&practice=)` works when JS is disabled (fallback) | build+parse | inspect server-rendered HTML — chip `<a href>` carries the right query string | (folded into blog-filter.spec.ts) |
| BLOG-06 | `/blog/rss.xml` is a valid RSS 2.0 document with at least one `<item>`; each item has `<title>`, `<link>`, `<pubDate>`, `<dc:creator>` (or `<author>`), `<description>`, `<content:encoded>` | build+xml-parse | `npx playwright test tests/rss-feed.spec.ts` (parses XML with `fast-xml-parser` or a simple regex test) | ❌ Wave 0 |
| BLOG-06 | RSS `<content:encoded>` contains only allow-listed HTML tags (no `<script>`, no `<iframe>`) | build+regex | folded into rss-feed.spec.ts | — |
| BLOG-09 | At phase close: exactly one published (non-draft) blog post exists | fs | folded into blog-pages-exist.spec.ts (`getCollection` count === 1 with `!draft`) | — |
| LEGAL-09 | Every built blog page contains the blog-disclaimer text (BLOG-03 satisfies structurally) | build+grep | folded into disclaimer-crawl.spec.ts | — |
| (a11y) | Cover-image alt text is non-empty when cover present (Zod refine) | unit | `npx playwright test tests/blog-zod-cover.spec.ts` (negative case) | ❌ Wave 0 |
| (a11y) | Chip row has `aria-labelledby`, chips have `aria-pressed`, empty-filtered has `role="status" aria-live="polite"` | build+parse | folded into blog-filter.spec.ts (DOM attribute assertions) | — |
| (perf) | The RSS endpoint produces a static `.xml` file (not a serverless function) | fs | folded into rss-feed.spec.ts (`fs.existsSync('dist/blog/rss.xml')` or vercel-adapter-specific path) | — |
| (banned-term) | `lint:legal` runs on the seed-post MDX and passes (no expert/specialist hits) | CLI | `npm run lint:legal` (existing) on phase-final commit | ✅ existing |

### Sampling Rate

- **Per task commit:** `npm run check` (astro check + Zod) + `npm run lint:legal` (fast, no build) + the single most-relevant spec.
- **Per wave merge:** `npm test` (full Playwright suite).
- **Phase gate:** Full suite green + `npm run lint:legal` clean + manual Vercel preview review by Jon (D-14 step 6) + production URL reported (D-14 step 6).

### Wave 0 Gaps

- [ ] `tests/blog-pages-exist.spec.ts` — covers BLOG-01 / BLOG-09 (one published post)
- [ ] `tests/blog-zod-author.spec.ts` — covers BLOG-02 (build fails on missing author — uses a fixture to verify the Zod error message)
- [ ] `tests/blog-zod-cover.spec.ts` — covers the new Zod refine (cover requires coverAlt)
- [ ] `tests/article-jsonld.spec.ts` — covers BLOG-04 / SEO-04 (Article JSON-LD valid + complete fields)
- [ ] `tests/blog-filter.spec.ts` — covers BLOG-05 (Playwright `page.goto` with URL params, asserts chip aria-pressed, asserts hidden state)
- [ ] `tests/rss-feed.spec.ts` — covers BLOG-06 (valid RSS 2.0, at least one item, sanitized content, file exists)
- [ ] Extend `tests/disclaimer-crawl.spec.ts` to walk `/blog/<slug>` routes and assert `id="blog"` disclaimer present (LEGAL-09)
- [ ] Add `package.json` test scripts mirroring the existing naming (`test:blog-pages-exist`, `test:article-jsonld`, `test:rss-feed`, `test:blog-filter`)
- [ ] Framework install: none — Playwright + cheerio already present. May want `fast-xml-parser` (~25KB) for the RSS test, OR just regex-check (sufficient).

## Security Domain

> `security_enforcement: true`, `security_asvs_level: 1`. This phase ships **static content + one static endpoint** — no forms, no user input, no secrets, no runtime code, no auth surface. Attack surface is minimal.

### Applicable ASVS Categories (Level 1)

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | no | No auth surface this phase |
| V3 Session Management | no | Static pages |
| V4 Access Control | no | All content public by design |
| V5 Input Validation | partial | No runtime input. Build-time: Zod schema validates MDX frontmatter; the optional Zod refine on `cover`/`coverAlt` adds a11y validation. `JsonLd.astro` uses `JSON.stringify` for `<script>` content (XSS-safe per ECMAScript spec). |
| V6 Cryptography | no | No secrets/crypto this phase |
| V8 Data Protection | minor | No PII collected. The RSS feed publishes attorney **names** (already public on the firm's site); per D-08, **never** the email address in the feed payload. |
| V10 Malicious Code | partial | `sanitize-html` scrubs MDX-rendered HTML before XML serialization — strips `<script>`, `<iframe>`, `<style>`, `<form>`, on-event attributes. Phase 1 CSP (report-only) covers the served HTML. |
| V14 Config | minor | `vercel.json` CSP already governs; new packages don't add inline event handlers or external CDN scripts. The inline `<script is:inline>` for the filter must be allowed by the CSP — confirm `script-src` allows inline (or move to a hashed/non-inline script in Phase 7 if CSP enforces). |

### Known Threat Patterns for this stack/phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Malicious MDX renders `<script>` into RSS payload | Tampering / XSS | `sanitize-html` strips all script tags; allowedTags excludes `<script>` by default — verified. Even if a content author tries `<script>console.log(1)</script>` in MDX, sanitize-html removes it before `<content:encoded>` CDATA-wrap. |
| MDX renders an external `<iframe>` (e.g., YouTube embed) | Tampering | sanitize-html strips `<iframe>` by default (not in `defaults.allowedTags`). If we ever want embeds, add explicitly with src whitelist — but that's a v2 question, not now. |
| `Article` JSON-LD `headline` field contains `</script>` breakout | Tampering / XSS | `JsonLd.astro` uses `JSON.stringify` which escapes `<` → `<` per ECMAScript — safe. (Phase 1 control already verified.) |
| Inline filter `<script is:inline>` introduces XSS via querystring | Tampering | The script never sets `innerHTML` from `window.location.search`; it only reads `.search` for comparison and writes the comparison result into `aria-pressed`. No DOM injection of user input. **Confirm in code review.** |
| RSS feed leaks attorney email in `<author>` | Information Disclosure | D-08 / UI-SPEC RSS metadata: per-item `author` = `attorney.data.name`, NEVER `attorney.data.email`. Verified in Pattern 5 code. |
| Cover image renders user-controlled `<img src="javascript:...">` | XSS | Astro's `<Image>` validates `src` is a build-time-imported asset; runtime URL strings can't be injected. Schema field is `image()` (asset reference), not `z.string().url()`. Safe by construction. |
| External MDX links open in same tab and exploit `window.opener` | Tab-jacking | `rehype-external-links` adds `rel="noopener noreferrer"` to every external link automatically (Pitfall 8). Eliminates the class of bug. |
| Pre-engagement client communications leaked via blog post body | ABA 477R Compliance | Jon's content-fidelity rule (D-01) + clearance register (LEGAL-04) + per-post disclaimer (BLOG-03). Same controls that protected Phase 4. |
| Misleading advertising in post body (Rule 7.1 / 7.4) | Bar Compliance | `lint:legal` prebuild scans `src/content/**/*.mdx` — covers blog posts automatically (Phase 4 control). Jon's human review at the gate adds a second layer. |
| Outcome-prediction language ("we'll win your tax appeal") | Bar Compliance (Rule 7.1 / LEGAL-10) | Blog disclaimer text already covers this: "This article is for general informational purposes only and does not constitute legal advice." Jon's content-fidelity rule + human review at the gate are the substantive controls. |

### California advertising-rule notes for blog posts

- **Rule 7.1 (No false or misleading communications):** Blog content must be accurate and non-promissory. No outcome predictions, no "we win," no guaranteed savings. Jon's review at the human-action checkpoint (D-14) is the substantive control.
- **Rule 7.4 (Communication of Fields of Practice / Specialization):** The seed post is a crypto-tax piece. Jon may legitimately describe himself as a "thought leader" in this area (per Phase 4 D-06) — that phrase passed Phase 4's Rule 7.4 lint. He must not use "specialist" / "expert" / "specialize" except via allowlist (D-16 / `lint:legal`).
- **Per-post disclaimer (BLOG-03 / LEGAL-09):** The blog disclaimer text already in `disclaimers.json`:
  > "This article is for general informational purposes only and does not constitute legal advice. It does not establish an attorney-client relationship with Belcher, Smolen & Van Loo LLP. The information here may not reflect the most current legal developments and may not apply to your specific facts. Consult a qualified attorney about your matter before taking any action."
  This is rendered by `BlogPostLayout` on every post. **Do not move, restyle, or duplicate it.**

> **Confidence flag:** The legal-rule citations above are [ASSUMED] from training knowledge of the California Rules of Professional Conduct, not freshly verified against the State Bar's current published text. Jon Van Loo is the attorney of record and the authoritative source — the human-action checkpoint (D-14) IS the review gate.

## Sources

### Primary (HIGH confidence)

- **Codebase** — `src/content.config.ts`, `src/lib/jsonld.ts`, `src/lib/site.ts`, both `[slug].astro` routes, `BlogPostLayout.astro`, `AttorneyLayout.astro` (Phase 4 reference), `PracticeAreaLayout.astro` (Phase 4 reference), `JsonLd.astro`, `Disclaimer.astro`, `disclaimers.json`, `package.json`, `astro.config.mjs`, `global.css`. Field contracts, prop shapes, slot reservations — directly read 2026-05-28.
- **npm registry (2026-05-28 `npm view`)** — `@astrojs/rss@4.0.18`, `sanitize-html@2.17.4`, `@types/sanitize-html@2.16.1`, `rehype-external-links@3.0.0`, `schema-dts@2.0.0`.
- **Astro Container API reference** — [docs.astro.build/en/reference/container-reference/](https://docs.astro.build/en/reference/container-reference/) — `experimental_AstroContainer.create()`, `loadRenderers()`, `getContainerRenderer()`, `renderToString(): Promise<string>`, experimental status flag.
- **Astro RSS recipe** — [docs.astro.build/en/recipes/rss/](https://docs.astro.build/en/recipes/rss/) — `rss()` helper, `getCollection()` integration, `sanitize-html` recommendation, full-content `content` field pattern.
- **Astro content collections reference resolution** — [docs.astro.build/en/guides/content-collections/](https://docs.astro.build/en/guides/content-collections/) — `getEntry()` / `getEntries()` for `reference()` fields; `searchParams` not available at build time on static pages.
- **Google Article structured data** — [developers.google.com/search/docs/appearance/structured-data/article](https://developers.google.com/search/docs/appearance/structured-data/article) — required/recommended fields, image specs (16:9, 4:3, 1:1; ≥50K pixels), Person vs Organization author, Article vs NewsArticle.
- **schema.org/Article** — [schema.org/Article](https://schema.org/Article) — type hierarchy (BlogPosting subclass of Article), property definitions.
- **`sanitize-html` source** — [raw.githubusercontent.com/apostrophecms/sanitize-html/main/index.js](https://raw.githubusercontent.com/apostrophecms/sanitize-html/main/index.js) — verified default `allowedTags` list includes h1-h6, p, blockquote, ul, ol, li, a, strong, em, code, pre, span, figure, figcaption, etc.; default `allowedAttributes` for `a` and `img`.
- **`@astrojs/rss` v4 CHANGELOG** — [github.com/withastro/astro/blob/main/packages/astro-rss/CHANGELOG.md](https://github.com/withastro/astro/blob/main/packages/astro-rss/CHANGELOG.md) — confirmed v4.0.0 removed deprecated `drafts` option; no breaking API changes to `pagesGlobToRssItems`/`getRssString`/`content` between v3 and v4.

### Secondary (MEDIUM confidence — verified against primary)

- **Astro Container API for RSS — community example** — [prass.tech/blog/rss-full-content-rendering/](https://prass.tech/blog/rss-full-content-rendering/) — full code example for Container API + MDX render-to-string + relative-to-absolute URL rewrite (the pattern Pattern 5 codifies).
- **Container API + relative URLs — community example** — [codetv.dev/blog/mdx-to-rss-astro](https://codetv.dev/blog/mdx-to-rss-astro) — corroborates the same Container API approach for MDX RSS feeds.
- **MDX Container API integration** — [github.com/withastro/astro/pull/5366](https://github.com/withastro/astro/pull/5366) — the original `content` field PR for `@astrojs/rss` confirming full-content feed support.
- **rehype-external-links docs** — [github.com/rehypejs/rehype-external-links](https://github.com/rehypejs/rehype-external-links) — canonical config options (target, rel, content, protocols, test); confirmed it only modifies external links matching protocol patterns.
- **Astro MDX integration** — [docs.astro.build/en/guides/integrations-guide/mdx/](https://docs.astro.build/en/guides/integrations-guide/mdx/) — `rehypePlugins` configuration; plugins applied after Astro defaults.

### Tertiary (LOW confidence — flagged for Jon's review or Wave 0 verification)

- **CLAUDE.md `rehype-external-links@3.0.0` peer compatibility with `@astrojs/mdx@5.0.6`** — npm view returned no peer pin; verified informally. Wave 0 install task verifies at runtime. [VERIFIED at install]
- **California Rule 7.1 / 7.4 specifics for blog content** — [ASSUMED] from training knowledge; Jon (attorney of record) confirms at the human-action gate (D-14).
- **`og-default.png` site fallback existence** — Open Question 2; planner adds Wave 0 task to verify or create.

## Metadata

**Confidence breakdown:**

- Standard stack / Architecture / JSON-LD patterns: **HIGH** — directly verified against the codebase; Phase 4 already shipped the slot-transfer pattern + two JSON-LD builders that this phase mirrors.
- `@astrojs/rss` v4 API: **HIGH** — npm-verified version, GitHub CHANGELOG read, no breaking changes from v3.
- Astro Container API: **HIGH** on the API surface (officially documented + working community examples); **MEDIUM** on the "still experimental" risk — flagged in Pitfall 2 with a fallback.
- `sanitize-html` defaults: **HIGH** — verified by reading source on GitHub `main`.
- Article JSON-LD requirements: **HIGH** — Google's own documentation + schema.org cited.
- Tailwind v4 `.prose-bsv` approach: **HIGH** — UI-SPEC explicitly resolved this; CSS rules use only existing tokens.
- Client-side filter pattern: **HIGH** — `Astro.url.searchParams` build-time behavior officially documented; inline-script pattern is the canonical Astro pattern for static query-filtered indexes.
- CA Rules of Professional Conduct exact wording: **LOW** — [ASSUMED] from training; Jon is the authority.

**Research date:** 2026-05-28
**Valid until:** 2026-06-28 (stack stable; the only moving target — the Container API's experimental status — already has a fallback documented; Astro 6.3 minor line is feature-frozen so the most likely change before this phase ships is a patch-release dependency update, not an API rename)
