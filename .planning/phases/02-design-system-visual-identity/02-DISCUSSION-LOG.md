# Phase 2: Design System & Visual Identity - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-26
**Phase:** 2-Design System & Visual Identity
**Areas discussed:** Color palette direction, Typography, Creative-art moments (hero / icons / wordmark), Component library scope + gallery preview

---

## Color palette direction

| Option | Description | Selected |
|--------|-------------|----------|
| A — Refined navy lineage | Deep navy + warm off-white + warm accent; continuous with bsvlaw.com | |
| B — Near-black minimalist (Norm-aligned) | Warm off-white + near-black + confident warm accent; most modern | ✓ |
| C — Warm neutral foundation | Bone/charcoal + warm accent; warmest, closest to Strix | |

**User's choice:** B — Near-black minimalist.
**Notes:** Jon first selected C, then explicitly rewound and switched to B. C is not the choice. (No files had been written at the time of the switch — confirmed the rewind was an internal reset only.)

### Accent color (within Direction B)

| Option | Description | Selected |
|--------|-------------|----------|
| Burnt orange `#B45A2C` | Contemporary warm; original Direction B preview accent | |
| Deep rust / persimmon `#9A3F1A` | Darker, more lawyerly; AAA contrast; "gravitas" | ✓ |
| Antique brass `#A8842C` | Metallic-warm, distinctive; needs darker variant for small-text AA | |

**User's choice:** Deep rust `#9A3F1A`.
**Notes:** Chosen for the "been doing this 20+ years" gravitas read.

### Palette sign-off mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| 2-3 tuned variants on Vercel | Build multiple variants for side-by-side comparison (matches ROADMAP criterion #1) | |
| Lock this now; build just one | Treat today's choice as final; one palette on the gallery | ✓ |

**User's choice:** Lock now, build one.
**Notes:** Conscious deviation from ROADMAP success-criterion #1. Logged to DECISIONS.md and flagged in CONTEXT.md (D-03) so verify-phase does not fail the phase for shipping a single palette.

### Dark mode

| Option | Description | Selected |
|--------|-------------|----------|
| Light mode only | One palette; not in v1 requirements | ✓ |
| Include dark mode | Second token set + toggle | |

**User's choice:** Light mode only.

---

## Typography

| Option | Description | Selected |
|--------|-------------|----------|
| One modern sans | Single sans for everything; Norm-aligned; warmth via color/whitespace | ✓ |
| Sans + modern serif accent | Serif for lead/pull-quotes; warmest via type | |
| Two sans (display + body) | All-sans, more headline character | |

**User's choice:** One modern sans.

### Typeface

| Option | Description | Selected |
|--------|-------------|----------|
| Geist | Vercel-native, neutral-modern | |
| Inter | Ubiquitous, ultra-legible, slightly generic | |
| Hanken Grotesk | Warmer humanist grotesque | ✓ |

**User's choice:** Hanken Grotesk.
**Notes:** Chosen to add subtle warmth to the cool Norm-aligned direction. Self-hosted (CSP `font-src 'self'` requires it).

### Headline hierarchy

| Option | Description | Selected |
|--------|-------------|----------|
| Dramatic / big-and-bold | Large confident headlines, strong size jumps (Norm-style) | ✓ |
| Moderate / restrained | Quieter, more traditional rhythm | |

**User's choice:** Dramatic / big-and-bold.

---

## Creative-art moments (hero / icons / wordmark)

### Hero illustration concept

| Option | Description | Selected |
|--------|-------------|----------|
| Network of connections | Nodes + lines; metaphor for teamwork; risk of SaaS read | |
| Converging linework (deal flow) | Lines converging to a point; parties coming together; editorial | ✓ |
| Geometric arcs / overlapping forms | Pure decorative composition; no metaphor | |

**User's choice:** Converging linework (deal flow).
**Notes:** Chosen over the network concept specifically to read as "precision / bringing parties together," not a tech network graph.

### Practice-area icon style

| Option | Description | Selected |
|--------|-------------|----------|
| Custom thin-line, matched to hero | Coherent system with the hero linework | ✓ |
| Curated Iconify line set | Fast but generic | |
| Filled / duotone accent | Bolder; departs from thin-line aesthetic | |

**User's choice:** Custom thin-line, matched to hero.

### Wordmark / logo

| Option | Description | Selected |
|--------|-------------|----------|
| Typographic wordmark only | Name in Hanken Grotesk; no mark | |
| Wordmark + small derived mark | Wordmark plus a compact mark from the linework motif | ✓ |

**User's choice:** Wordmark + small derived mark.

### Production approach

| Option | Description | Selected |
|--------|-------------|----------|
| Claude generates final SVGs now | Hand-authored, final quality, in-repo | ✓ |
| Placeholders now, commission later | Defers DESIGN-05/06 to a designer handoff | |

**User's choice:** Claude generates final SVGs now (swappable by a designer later).

---

## Component library scope + gallery preview

### Card / surface separation

| Option | Description | Selected |
|--------|-------------|----------|
| Hairline border | Thin warm-grey border, no shadow; most minimal | |
| Tonal fill (no border) | Bone fill, separation by tone | |
| Soft shadow | Cards float with a subtle drop shadow | ✓ |

**User's choice:** Soft shadow.
**Notes:** Implies retuning `--color-bg-elevated` to a near-white card surface (lighter than the page) so floating reads correctly; keep shadow subtle to stay premium on a warm bg.

### Motion

| Option | Description | Selected |
|--------|-------------|----------|
| Restrained micro-interactions | Hover-lift, animated underline, smooth FAQ; reduced-motion aware | ✓ |
| Mostly static | Color/opacity only | |

**User's choice:** Restrained micro-interactions.

### Gallery page fate

| Option | Description | Selected |
|--------|-------------|----------|
| Permanent hidden reference route | `/_design`, noindex, sitemap-excluded; living style-guide | ✓ |
| Remove before launch | Deleted in Phase 7 launch prep | |

**User's choice:** Keep as permanent hidden reference route.

---

## Claude's Discretion

- Exact retuned hex for `--color-bg-elevated`, the shadow recipe, and the `clamp()` type-scale stops (hit WCAG AA + CLS ≤ 0.1).
- Spacing-scale base unit and section rhythm (generous, whitespace-forward).
- Component directory layout under `src/components/`.
- Precise abstract forms of the three practice-area icons.
- Button/link variant set needed by the eight components.

## Deferred Ideas

- Professional designer pass to replace the in-repo SVGs later (drop-in swap supported).
- OG image visual treatment — Phase 3.
- Full page assembly / real content — Phases 3–5.
- Lighthouse / axe budgets, CSP enforcement — Phase 7 (design to those targets now).
