# Phase 2: Design System & Visual Identity - Context

**Gathered:** 2026-05-26
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase locks BSV's **visual identity** and ships the **reusable component library** every later page composes from. By the end of Phase 2, the chosen palette / typography / spacing live as `@theme` tokens in `src/styles/global.css` (a future restyle is a single-file edit), eight section components render with realistic placeholder content on a hidden gallery preview page, and the custom hero SVG + three practice-area icons exist on disk and integrate via `astro-icon`. Jon confirms the look on a Vercel preview before Phase 3 (Homepage) begins.

**In scope:**
- Final `@theme` token values (colors, typography scale, spacing scale) in `src/styles/global.css` — reusing the **stable token names locked in Phase 1 (D-22)**; this phase changes values, not names
- Self-hosted **Hanken Grotesk** font wired via Astro's built-in font system (CSP-compliant, no third-party CDN)
- Eight reusable section components: `Hero`, `PracticeAreaCard`, `AttorneyCard`, `TestimonialQuote`, `DealsGrid`, `FeeStructureBand`, `CtaBlock`, `FaqAccordion`
- One custom **converging-linework hero SVG** (hand-authored, final quality, ≤200 KB)
- Three custom **thin-line practice-area icons** (M&A, IP & Technology Transactions, Tax) integrated via `astro-icon`
- Typographic **wordmark + small derived mark** (favicon / mobile header / social avatar) — replaces Phase 1's text-only firm name
- Refined `<SiteHeader>` / `<SiteFooter>` visual treatment (Phase 1 shipped functional-but-minimal versions per D-27/D-28)
- A hidden, `noindex`, sitemap-excluded **component gallery page** (e.g. `/_design`) rendering all eight components with placeholder content
- Restrained, `prefers-reduced-motion`-aware micro-interactions on interactive components

**Out of scope (later phases):**
- Real page content / page assembly — Homepage is Phase 3; attorney + practice-area pages are Phase 4
- Real attorney headshots (placeholders only; swapped before launch, Phase 7)
- Dark mode — explicitly excluded from v1 (see D-04)
- A second/third palette variant for side-by-side Vercel comparison — Jon chose to lock a single palette (see D-03)
- CSP enforcement, Lighthouse/axe launch gates — Phase 7

</domain>

<decisions>
## Implementation Decisions

### Color Palette
- **D-01:** Palette **Direction B — near-black minimalist (Norm-aligned)** is the locked foundation. Token values:
  - `--color-bg`: warm off-white `#F8F5F0`
  - `--color-text`: near-black `#111111`
  - `--color-text-muted`: graphite `#52524E`
  - `--color-bg-elevated`: **a near-white card surface** (lighter than the page; exact value e.g. `#FDFCFA` set during planning) — see D-09 for why this differs from a "bone" fill
  - `--color-border`: warm grey `#D9D2C5`
  - `--color-accent`: deep rust / persimmon `#9A3F1A`
  - `--color-accent-fg`: warm off-white `#F8F5F0`
  - Token **names** are inherited unchanged from Phase 1 D-22 — only values change. Every Phase 1 component reading these keeps working.
- **D-02:** Deep rust `#9A3F1A` is the single accent — used on CTA buttons, links, the Chambers recognition strip, focus rings. Measured ~6.8:1 on the off-white bg (passes WCAG AAA for normal text). The near-black + off-white foundation is intentionally quiet so the accent carries the brand personality. Rationale Jon gave: "gravitas, conservative warm, lawyerly — '20+ years' read."
- **D-03:** **Lock a single palette now; do NOT build 2–3 Vercel variants.** This is a *conscious deviation* from ROADMAP success-criterion #1 ("reviews 2-3 color palette options on a Vercel preview and confirms one"). The A/B/C direction exploration during this discussion substitutes for the side-by-side. Jon still reviews the one rendered palette on a Vercel preview before Phase 3. **Planner + verifier must treat single-palette delivery as correct, not a gap.** (Logged to DECISIONS.md.)
- **D-04:** **Light mode only** for v1. No dark-mode token set, no toggle. Not in v1 requirements; halves the contrast-testing surface.

### Typography
- **D-05:** **One modern sans for everything** (Norm-aligned) — headlines, body, UI. Hierarchy comes from size + weight + spacing, not from a second typeface. Warmth is delivered by color + whitespace + copy tone, not by the type.
- **D-06:** The typeface is **Hanken Grotesk** — a warmer humanist grotesque, chosen specifically to add subtle warmth to the otherwise-cool Norm-aligned direction.
- **D-07:** Fonts are **self-hosted** via Astro's built-in font system (build-time download + serve from `'self'`). This is *required* by the Phase 1 CSP (`font-src 'self' data:` per D-15) — Google Fonts CDN is not allowed. Apply `font-display: swap` and size-adjust metrics to keep CLS ≤ 0.1 (PERF-05).
- **D-08:** **Dramatic, big-and-bold headline hierarchy** (Norm-style). Large confident headlines dominate the top of each page; strong size jumps between heading levels. Implement the scale as fluid/`clamp()`-based steps so headlines stay dramatic on desktop and controlled on mobile (Claude's discretion on exact stops).

### Surfaces, Motion & Components
- **D-09:** Cards/surfaces (`PracticeAreaCard`, `AttorneyCard`, `DealsGrid` cells, `FeeStructureBand`, `FaqAccordion`) use a **soft drop shadow** and float above the page. **Implication:** `--color-bg-elevated` is retuned to a *near-white* surface (lighter than the warm off-white page) so floating reads correctly — token name unchanged (D-22). Keep the shadow **subtle** (low spread/opacity, warm-tinted) so it stays premium on a warm background rather than looking SaaS-generic.
- **D-10:** **Restrained micro-interactions** on interactive elements: card hover-lift, animated link underline, button hover-deepen, smooth FAQ accordion expand. All must be wrapped so they are disabled under `prefers-reduced-motion: reduce` (accessibility, A11Y target).
- **D-11:** The eight components are the locked Phase 2 set (DESIGN-04): `Hero`, `PracticeAreaCard`, `AttorneyCard`, `TestimonialQuote`, `DealsGrid`, `FeeStructureBand`, `CtaBlock`, `FaqAccordion`. Each renders with realistic placeholder content drawn from FIRM_BRIEF.md (e.g., the Athelas–Commure testimonial, real practice-area names) so the gallery looks real, not lorem-ipsum.

### Creative Art (Hero, Icons, Wordmark)
- **D-12:** Hero illustration concept = **converging linework ("deal flow")** — fine lines converging toward a point, an abstract image of separate parties/workstreams coming together into one closed deal. Deep rust on bone. Editorial, minimal, premium. Hand-authored SVG.
- **D-13:** Three **custom thin-line practice-area icons** in the same visual language as the hero (one coherent system), each an abstract mark for M&A / IP & Technology Transactions / Tax. Integrated via **`astro-icon`** (DESIGN-06) — `astro-icon` is **not yet installed**; this phase adds it. Icons live as local SVGs (e.g. `src/icons/`), not pulled from a third-party Iconify set.
- **D-14:** Wordmark = **typographic wordmark (Hanken Grotesk) + a small custom mark** derived from the converging-lines hero motif, used compactly for favicon, mobile header, and social avatar. This is a *modernization, not a rebrand* — the firm name and identity are unchanged.
- **D-15:** **Claude hand-authors the final-quality hero SVG and the three icons in-repo this phase** (not placeholders). The converging-linework + thin-line aesthetic is highly code-friendly and stays well under the 200 KB image budget. These satisfy DESIGN-05/06 for real; Jon may commission a professional designer to replace them later without structural change.

### Gallery Preview Page
- **D-16:** The component gallery is a **permanent hidden reference route** (e.g. `/_design`) — `noindex`, excluded from the sitemap, not in the site nav. It stays in the repo as a living style-guide. Apply the same `noindex` discipline established in Phase 1 D-19 for preview deploys, and ensure `@astrojs/sitemap` filters it out.

### Claude's Discretion
- Exact hex value for the retuned `--color-bg-elevated` near-white card surface, the precise shadow recipe (spread/blur/opacity/tint), and the exact `clamp()` type-scale stops — pick during planning to hit WCAG AA + CLS ≤ 0.1.
- Spacing-scale base unit and rhythm (e.g., 4px vs 8px base; section vertical spacing) — choose a generous, whitespace-forward scale consistent with DESIGN-07.
- Component file/directory layout under `src/components/` — follow the structure established in Phase 1 (`chrome/`, `legal/`, `seo/`; add a `sections/` or `ui/` grouping as the planner sees fit).
- Precise abstract forms of the three practice-area icons — design to read clearly at small sizes while harmonizing with the hero linework.
- Number/shape of button + link variants needed to support the eight components.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Charter & Scope
- `.planning/PROJECT.md` — Core value, positioning, design direction (premium-but-warmer-than-Norm), color-direction note
- `.planning/REQUIREMENTS.md` — Phase 2 covers **DESIGN-01..08**; also note A11Y-04 (contrast), PERF-02 (≤200 KB images), PERF-03 (`<Image />`/modern formats), PERF-05 (font-display/CLS)
- `.planning/ROADMAP.md` — Phase 2 goal + success criteria (see D-03 for the single-palette deviation from criterion #1)
- `.planning/FIRM_BRIEF.md` — Design Direction section (Strix vs Norm comparison table, "creative art" note, color direction), and the realistic placeholder content source (team, deals, testimonial)

### Inherited Phase 1 Decisions (binding)
- `.planning/phases/01-scaffold-shell/01-CONTEXT.md` — esp. **D-21/D-22** (stable token names), **D-15/D-16** (CSP `font-src 'self'`), **D-19** (noindex discipline), **D-27/D-28** (header/footer + logo deferred to Phase 2)
- `.planning/DECISIONS.md` — Phase 1 build-time decisions incl. the locked-token-names entry; Phase 2's single-palette deviation will be appended here
- `src/styles/global.css` — current placeholder `@theme` block whose **values** this phase rewrites (names stay)
- `src/layouts/BaseLayout.astro` — single integration point; imports `global.css`, mounts `SiteHeader`/`SiteFooter`
- `src/components/chrome/`, `src/components/legal/`, `src/components/seo/` — existing Phase 1 components the new visual system must stay compatible with (esp. `<Disclaimer />`)

### Project Guidance & Best Practices
- `.claude/CLAUDE.md` — non-technical lead, stack lock, plain-English communication, decision-log requirement
- `.planning/LAW_FIRM_WEBSITE_GUIDE.md` — design/SEO/StoryBrand best practices
- `.planning/research/STACK.md` — locked stack + `astro-icon` (1.1.5), `<Image />`/`sharp`, font-handling notes
- `.planning/research/PITFALLS.md` — Tailwind v4 / Astro pitfalls (e.g., border-color default, theme tokens)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/styles/global.css` — Tailwind v4 `@import` + `@theme` block with the **locked token names** and a base layer that restores default border-color and sets body bg/text/font. Phase 2 rewrites token *values* and adds the `--font-sans` value (Hanken Grotesk) + any new scale tokens.
- `src/layouts/BaseLayout.astro` + 3 specialized layouts (`AttorneyLayout`, `PracticeAreaLayout`, `BlogPostLayout`) — already wired; the new components slot into pages these layouts render.
- `src/components/chrome/{SiteHeader,SiteFooter,SkipToContent}.astro`, `src/components/legal/Disclaimer.astro`, `src/components/seo/{SeoHead,JsonLd}.astro` — Phase 1 chrome. SiteHeader/SiteFooter get the refined visual treatment + wordmark this phase.
- Five Zod content collections in `src/content.config.ts` — supply the shape of the realistic placeholder content the gallery renders (attorneys, practiceAreas, testimonials).

### Established Patterns
- Tailwind v4, **no `tailwind.config.js`** — design tokens live only in `global.css` `@theme`.
- Token names are a stable contract (D-22) — components reference `var(--color-*)` / Tailwind utilities mapped to them; never hardcode hex.
- `noindex` + sitemap-exclusion pattern already exists (D-19) — reuse it for `/_design`.
- CSP allows fonts only from `'self'` — self-hosted font pipeline is mandatory, not optional.

### Integration Points
- `src/styles/global.css` — the single integration point for the palette/type/spacing swap.
- `BaseLayout.astro` — where the font is loaded and where header/footer (with wordmark) render.
- `astro.config.mjs` — add the `astro-icon` integration; configure Astro fonts; ensure `@astrojs/sitemap` excludes `/_design`.
- `package.json` — add `astro-icon` (and confirm `sharp` is pinned for `<Image />`).

</code_context>

<specifics>
## Specific Ideas

- Jon explicitly **rewound from palette Direction C to Direction B** mid-discussion — Direction C (warm-neutral / bone foundation) is NOT the choice; Direction B (near-black minimalist) is. Do not reintroduce C.
- The hero must read as **"bringing parties together / precision"**, not as a tech "network graph" — Jon chose the converging-linework concept over the network-of-nodes concept specifically.
- Placeholder content in the gallery should use **real BSV material** from FIRM_BRIEF.md (the Athelas–Commure $6B testimonial from Daniel Brian, real practice-area names, real attorney names) so Jon evaluates the components against realistic copy.
- Visual references remain **Norm Law (foundation) + selective Strix warmth** — but warmth now comes through color/whitespace/copy and the one hero+icon creative moment, not through illustration-heavy layouts.

</specifics>

<deferred>
## Deferred Ideas

- **Professional designer pass** on the hero + icons + wordmark — Jon may commission this later to replace the in-repo SVGs; structure supports a drop-in swap (D-15).
- **OG image visual treatment** — deferred to Phase 3 (SEO meta wiring); Phase 1 stubs a default OG image. Phase 2's wordmark/mark may inform it.
- **Per-page content + full page assembly** — Phases 3–5.
- **Lighthouse / axe-core launch budgets, CSP enforcement** — Phase 7. Phase 2 should design to those targets (AA contrast, CLS ≤ 0.1) but the gates run later.

None of the above is scope creep into Phase 2 — discussion stayed within the design-system boundary.

</deferred>

---

*Phase: 2-Design System & Visual Identity*
*Context gathered: 2026-05-26*
