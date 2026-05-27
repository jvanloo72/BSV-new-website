# Phase 3: Homepage & Static Pages - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-26
**Phase:** 3-Homepage & Static Pages
**Areas discussed:** Homepage layout, About page
**Areas offered but not selected (→ Claude's discretion):** Index pages & links, Chambers strip & branded error pages

---

## Homepage layout

### Q1 — How full should the homepage be?

| Option | Description | Selected |
|--------|-------------|----------|
| Lean + proof | Hero → practice teasers → representative-work deals strip → attorney row → testimonial → Chambers strip → CTA. Fee + FAQ live on practice-area pages. | ✓ |
| Lean | Roadmap-listed sections only; no deals strip on the front page. | |
| Full | Also folds fee-transparency band + FAQ onto the homepage. | |

**User's choice:** Lean + proof
**Notes:** Deals strip serves as proof of competence/experience (two of the three named client fears). Fee band + FAQ intentionally reserved for Phase 4 practice-area pages to avoid front-page redundancy.

### Q2 — Should the homepage have a "BSV approach" framing beat, and where?

| Option | Description | Selected |
|--------|-------------|----------|
| Compact band after hero | Short section below hero: client's situation + three points mapping to competence/experience/responsiveness. | ✓ |
| Hero subhead only | Keep the approach compressed in the hero subhead; no separate band. | |
| Pair it with the team | Put the approach narrative lower, attached to the attorney row. | |

**User's choice:** Compact band after hero
**Notes:** StoryBrand "guide with a plan" moment. Three points map directly to the three client fears from FIRM_BRIEF.md.

### Q3 — How should the "representative work" strip handle named client deals (clearance file empty)?

| Option | Description | Selected |
|--------|-------------|----------|
| Clear them now & name them | Jon confirms the deals are OK to publish; record in CLIENT_DISCLOSURE_CLEARANCE.md; homepage names them. Unblocks Phase 4. | ✓ |
| Anonymize for now | Show numbers/shape, no client names, until full clearance in Phase 4. | |
| Hold deals until Phase 4 | No deals strip on Phase 3 homepage; testimonial + Chambers carry the proof. | |

**User's choice:** Clear them now & name them
**Notes:** Jon Van Loo is the approving partner. Most deals are already public (Illumina/Roche hostile bid, Athelas/Commure merger). Cleared set recorded in CONTEXT.md D-04, to be written into CLIENT_DISCLOSURE_CLEARANCE.md with Jon as approver dated 2026-05-26.

---

## About page

### Q1 — What shape should About take (client vs. firm)?

| Option | Description | Selected |
|--------|-------------|----------|
| Client-first, story woven in | Opens with client's world + fear; BSV as guide; firm substance as proof; offices at bottom. | ✓ |
| Firm-story forward | Traditional About: leads with who BSV is, then positioning. | |
| Minimal | Short positioning + team approach + offices; little narrative. | |

**User's choice:** Client-first, story woven in
**Notes:** Most consistent with the credentials-light, client-as-hero direction set for the rest of the site.

### Q2 — What should About's "story / why a boutique" substance be built from?

| Option | Description | Selected |
|--------|-------------|----------|
| Verifiable facts only | Build only from documented brief material; no invented founding year/origin. | ✓ |
| I'll write a founding story | Placeholder now, Jon pastes real copy before launch. | |
| Verifiable now + placeholder slot | Verifiable facts plus an optional marked slot for a founding story. | |

**User's choice:** Verifiable facts only
**Notes:** No fabrication of firm history. Page must be complete and launch-ready without a founding story; Jon may add one later (deferred).

---

## Claude's Discretion

- **Index pages & cross-linking** (offered, not selected): index pages render available cards; links resolve to Phase-4 detail routes; Insights index shows a graceful branded empty-state; primary CTA → `/contact` placeholder.
- **Chambers strip & branded error pages** (offered, not selected): quiet accent-tinted recognition strip before the final CTA, "not the lead"; warm on-tone 404/5xx with paths back home and to contact.
- **Data sourcing mechanism** (collections vs. curated page data): planner's call; keep Phase 3 shippable without blocking on Phase 4.
- **SEO/OG specifics**: per-page meta + OG image approach via SeoHead and the Phase 2 wordmark/mark.
- **Token-syntax retrofit** of placeholder pages to Phase 2 namespace utilities.

## Deferred Ideas

- Founding-story paragraph for About (Jon may write later).
- Silicon Valley street address (still TBD in `SITE.offices`).
- Chambers profile outbound link (add real URL when known).
- Fee-transparency band + FAQ accordion (placed on practice-area pages in Phase 4).
