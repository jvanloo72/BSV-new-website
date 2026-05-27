# Phase 3: Homepage & Static Pages - Context

**Gathered:** 2026-05-26
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase **composes the locked Phase 2 component library into real, navigable
pages**. A prospective client lands on the homepage, reads "Team work to get good
results," moves through a short approach beat, scans practice-area teasers and a
representative-work proof strip, sees the attorney row, a marquee testimonial, and
the Chambers recognition, and is pulled toward contact — and can reach About and
every section index in one click. Branded error pages, `sitemap.xml`/`robots.txt`,
and site-wide `LegalService` JSON-LD round out the phase.

**In scope:**
- **Homepage** (`/`) assembled from existing components in this order:
  Hero → **BSV Approach band** (new small section) → Practice teasers (3) →
  **Representative work** (DealsGrid) → The team (5 AttorneyCards) →
  Testimonial → **Chambers USA Spotlight 2026 strip** → CtaBlock
- **About page** (`/about`) — client-first StoryBrand shape, substance from
  verifiable facts only, two-office block, closing CTA
- **Section index pages**: Practice Areas index, Attorneys index, Insights (blog)
  index shell with graceful empty-state
- **Branded 404 + 5xx** pages (replace generic Vercel pages)
- **`sitemap.xml` + `robots.txt`** live; site-wide `LegalService` JSON-LD via
  BaseLayout confirmed present
- **Per-page SEO meta** (title/description/OG) for the static pages (SEO-01/02/07/08)
- Recording the homepage's named deals into `.planning/CLIENT_DISCLOSURE_CLEARANCE.md`

**Out of scope (later phases):**
- Attorney **detail** pages and practice-area **detail** pages — Phase 4
- Blog post routes, RSS, Article JSON-LD, editorial gate — Phase 5
- The working contact **form** + Astro Action backend — Phase 6 (the `/contact`
  page remains the Phase 1 placeholder this phase links to)
- Real headshots, CSP enforce, Lighthouse/axe launch gates, legacy redirects — Phase 7
- Fee-transparency band and FAQ accordion on the homepage (these live on
  practice-area pages in Phase 4)

</domain>

<decisions>
## Implementation Decisions

### Homepage Layout
- **D-01:** **Homepage is "lean + proof."** Final section order:
  `Hero → BSV Approach band → PracticeAreaCard ×3 → DealsGrid (Representative
  work) → AttorneyCard ×5 → TestimonialQuote → Chambers strip → CtaBlock`.
  Fee-transparency band and FAQ accordion are **deliberately excluded** from the
  homepage — they belong on practice-area pages (Phase 4) where they're more
  useful and avoid front-page redundancy.
- **D-02:** **New "BSV Approach" band directly below the hero.** One line naming
  the client's situation (a complex transaction; the fear of the wrong counsel)
  followed by three tight points mapping to the three client fears from
  FIRM_BRIEF.md: **partner-led teams** (competence), **deep transaction
  experience** (experience), **moves at your deal's pace** (responsiveness). This
  is the StoryBrand "guide with a plan" moment. Keep it restrained/premium
  (Norm-aligned) — a compact band, not a heavy section. Planner decides whether
  this is a new small component or inline composition.
- **D-03:** Reuse the **already-drafted homepage content** from
  `src/pages/design-system.astro` (the gallery) — hero copy, the three practice
  teaser blurbs/links, the five attorney cards, the deals, the Daniel Brian
  testimonial. The gallery is the content source of truth for the homepage; this
  phase moves that composition onto `/` and adds the Approach band + Chambers strip.

### Client-Deal Clearance (legal gate)
- **D-04:** **Jon Van Loo (approving partner) cleared the homepage's named deals
  for publication on 2026-05-26.** Most are already public. The executor MUST
  populate `.planning/CLIENT_DISCLOSURE_CLEARANCE.md` with the following cleared
  items, attributed to Jon Van Loo / 2026-05-26, before the homepage publishes them:
  - Athelas–Commure merger ($6B)
  - Mode Analytics sale ($200M)
  - Illumina defense against Roche's $6.4B hostile bid
  - Representative-parties list: Adobe, Oracle, PayPal, Dell, eBay, Coinbase
  - Daniel Brian (GC, Commure, Inc.) testimonial — "BSV was my rock throughout
    the $6 billion merger between Athelas and Commure."
  This **unblocks the Phase 4 clearance gate** for these same items. Any
  *additional* deals/clients surfaced on Phase 4 detail pages still require their
  own clearance entries.

### About Page
- **D-05:** **Client-first, story woven in.** About opens with the client's world
  and the fear of the wrong counsel, frames BSV as the guide (the team approach,
  partner access, transaction focus = "the plan"), then presents firm substance
  as proof ("why a boutique" — M&A/IP/Tax focus, Chambers, senior team), with the
  two offices near the bottom. Credentials are proof, never the lead — consistent
  with the site-wide positioning.
- **D-06:** **Verifiable facts only — no invented firm history.** Build the page
  strictly from documented material in FIRM_BRIEF.md (practice focus, the
  partners' senior pedigrees, the team-approach philosophy, Chambers). **Do NOT
  fabricate a founding year or origin narrative.** Jon may add a founding story
  later; the page must be complete and launch-ready without it.
- **D-07:** **Offices render from `SITE.offices`** (the single source of truth the
  footer already uses), text-only. Silicon Valley shows as "Silicon Valley, CA"
  (street address still `TBD`); San Francisco shows the full 555 California St.,
  Suite 4925 address. **No third-party map embed** — keeps the page privacy-clean
  and the CSP simple. About closes with a CTA toward `/contact` and links onward
  to the Attorneys and Practice Areas indexes (StoryBrand loop close).

### Claude's Discretion
- **Index pages & cross-linking (NOT separately discussed — decide sensibly):**
  - Homepage practice teaser cards and the Practice Areas index link to
    `/practice-areas/[slug]`; attorney references link to `/attorneys/[slug]`.
    Those **detail pages are built in Phase 4** — in Phase 3 these links may point
    to routes that don't fully exist yet. Prefer an approach where the index pages
    render the available cards (so the preview looks real) and links resolve to
    the Phase-4 detail routes; coordinate with the Phase 4 plan so links aren't
    dead in the interim (e.g., stub detail routes or sequence so Phase 4 fills them).
  - **Insights index** must show a graceful **empty-state** (no posts yet) —
    branded, on-tone, not an error.
  - The primary CTA points to `/contact` (Phase 1 placeholder until Phase 6).
- **Chambers strip & branded error pages (NOT separately discussed — decide
  sensibly):**
  - Chambers USA Spotlight 2026 strip: visible recognition, **not the lead** —
    a quiet horizontal strip (accent-tinted per Phase 2 D-02) above the final CTA.
    Wording references "Chambers USA — Spotlight 2026, ranked in Mergers &
    Acquisitions." Link out to the firm's Chambers profile only if a URL is known;
    otherwise non-linked text.
  - Branded 404 / 5xx: warm on-tone copy, a clear path back home and to contact;
    no generic Vercel page.
- **Data sourcing mechanism:** whether homepage/index data comes from content
  collections or curated page data is the planner's call. Note collections
  currently hold only placeholder MDX; real attorney/practice entries arrive in
  Phase 4. Pick the approach that keeps Phase 3 shippable without blocking on Phase 4.
- **SEO/OG specifics:** per-page titles/descriptions and OG image approach
  (Phase 2 deferred OG visual treatment to here) — planner's discretion, using
  the SeoHead component and Phase 2 wordmark/mark.
- **Token syntax:** the current `index.astro`/`about.astro` placeholders use the
  old arbitrary-value form (`text-[color:var(...)]`); rewrite to the Phase 2
  namespace utilities (`text-text`, etc.) per the Phase 2 retrofit.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Charter & Scope
- `.planning/ROADMAP.md` — Phase 3 goal + 5 success criteria; Phase 4/5/6/7
  boundaries (so this phase doesn't bleed into them)
- `.planning/PROJECT.md` — core value, positioning, StoryBrand framing, the
  three client fears, design direction, key decisions
- `.planning/REQUIREMENTS.md` — Phase 3 covers PAGES-01..08, SEO-01/02/07/08,
  LEGAL-07, OPS-06
- `.planning/FIRM_BRIEF.md` — **content source of truth**: lead message, team
  (5 attorneys, no Fishbien), the deals, the Daniel Brian testimonial, both
  offices, Chambers recognition, client fears, tone
- `.claude/CLAUDE.md` — non-technical lead, plain-English communication,
  non-negotiables (site-wide footer disclaimer, JSON-LD on every page),
  decision-log requirement

### Legal / Compliance
- `.planning/CLIENT_DISCLOSURE_CLEARANCE.md` — **MUST be populated with the D-04
  cleared deals before the homepage publishes them.** Currently an empty template.
- `.planning/URL-CONVENTIONS.md` — locked slug formats for practice-area and
  attorney URLs (D-11..D-14) the index/teaser links must follow

### Inherited Decisions (binding)
- `.planning/phases/02-design-system-visual-identity/02-CONTEXT.md` — the locked
  palette/type/components; D-02 (accent usage), D-16 (`/design-system` is the
  hidden gallery, not a public page)
- `.planning/phases/01-scaffold-shell/01-CONTEXT.md` — token names (D-21/D-22),
  CSP `font-src 'self'` (D-15/16), noindex discipline (D-19)
- `.planning/DECISIONS.md` — running build-time decision log (append D-04 clearance)
- `.planning/LAW_FIRM_WEBSITE_GUIDE.md` — StoryBrand, SEO/AEO, disclaimer best practices

### Code Source of Truth
- `src/pages/design-system.astro` — the **drafted homepage composition** (all 8
  components with real FIRM_BRIEF placeholder copy) this phase moves onto `/`
- `src/lib/site.ts` (`SITE` / `SITE.offices` / `SITE.email`) — offices + intake
  single source of truth for the About office block
- `src/lib/jsonld.ts` — JSON-LD builders (LegalService site-wide)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **All 8 Phase 2 section components exist and render** (`src/components/sections/`):
  `Hero`, `PracticeAreaCard`, `AttorneyCard`, `TestimonialQuote`, `DealsGrid`,
  `FeeStructureBand`, `CtaBlock`, `FaqAccordion` — with the exact prop shapes shown
  in `design-system.astro`. The homepage uses 6 of the 8 (not FeeStructureBand/FaqAccordion).
- **UI primitives**: `Button` (primary/secondary, href+label), `TextLink`, `Eyebrow`.
- **Chrome**: `SiteHeader` (animated underline, aria-current), `SiteFooter`
  (renders offices from `SITE.offices`, omits `TBD` street segments), `Disclaimer`.
- **SEO**: `SeoHead`, `JsonLd` components + `src/lib/jsonld.ts` builders; `BaseLayout`
  injects site-wide `LegalService` and accepts a `noindex` prop.
- **Pages already exist as Phase 1 placeholders**: `index.astro`, `about.astro`,
  `attorneys/index.astro`, `practice-areas/index.astro`, `blog/index.astro`,
  `404.astro`, `500.astro`, `contact.astro`, `[slug]` routes — this phase fills
  them with real composition.
- **Placeholder headshots** (5 SVG monograms) + **hero SVG** + **3 practice icons**
  + **mark.svg** all on disk from Phase 2.

### Established Patterns
- Tailwind v4, no config file; tokens live only in `global.css` `@theme`; components
  reference namespace utilities (`text-text`, `bg-bg`, `px-gutter`, `py-section`,
  `text-h1`) — never hardcode hex. Retrofit the old `text-[color:var(...)]` form
  in the placeholder pages.
- Content width: `mx-auto max-w-6xl px-gutter` container pattern.
- `noindex` + sitemap-exclusion already wired (D-16/D-19) — relevant only for the
  gallery, not the new public pages.
- `@astrojs/sitemap` is configured; `astro.config.mjs` `site:` set — sitemap/robots
  generation should already flow once routes exist.

### Integration Points
- `src/pages/index.astro` and `src/pages/about.astro` — primary edit targets.
- `src/pages/{attorneys,practice-areas,blog}/index.astro` — the three section indexes.
- `src/pages/{404,500}.astro` — branding targets.
- `BaseLayout.astro` — confirm site-wide `LegalService` JSON-LD renders; per-page
  SEO via its title/description (and SeoHead) props.
- `astro.config.mjs` / `robots` — verify `sitemap.xml` + `robots.txt` are live.

</code_context>

<specifics>
## Specific Ideas

- Homepage section order is **fixed** by D-01 — render the gallery's composition
  minus FeeStructureBand/FaqAccordion, plus the new Approach band (after hero) and
  Chambers strip (before final CTA).
- The Approach band's three points must explicitly map to **competence /
  experience / responsiveness** (FIRM_BRIEF "client fears") — that mapping is the
  whole point of the section.
- About's opening line should echo the homepage approach framing ("A complex
  transaction deserves a team that treats it like their only one.") without being
  a verbatim copy — same StoryBrand spine, page-appropriate phrasing.
- Chambers strip is **recognition, not the lead** — keep it quiet and late on the page.

</specifics>

<deferred>
## Deferred Ideas

- **Founding-story paragraph for About** — Jon may write a real "why we founded
  BSV" narrative later; About ships without it (D-06). Future content edit, not a phase.
- **Silicon Valley street address** — still `TBD` in `SITE.offices`; swap in when
  Jon provides it (also affects footer + LegalService JSON-LD address).
- **Chambers profile outbound link** — add the real Chambers URL to the strip when
  known; non-linked text until then.
- **Fee-transparency band + FAQ accordion** — built/placed on practice-area pages
  in Phase 4 (intentionally off the homepage per D-01).

None of the above is scope creep into Phase 3 — discussion stayed within the
homepage/static-pages boundary.

</deferred>

---

*Phase: 3-Homepage & Static Pages*
*Context gathered: 2026-05-26*
