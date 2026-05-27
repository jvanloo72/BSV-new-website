# Phase 4: Attorney & Practice Area Pages - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-27
**Phase:** 4-Attorney & Practice Area Pages
**Areas discussed:** Proof on IP & Tax pages, Attorney bios & thin profiles, Partner contact callouts, Practice-area FAQs, Aaron Belcher deal list

---

## Overall direction

**User's choice:** Replicate the current bsvlaw.com site — bios, M&A testimonials, and Aaron's deal tags all transfer. Use FIRM_BRIEF.md as captured source; re-fetch bsvlaw.com pages for exact wording. (→ D-01, D-02, D-03)

---

## Proof on IP & Tax pages

| Option | Description | Selected |
|--------|-------------|----------|
| Clear new IP/Tax client/deal names now | Add new entries to the clearance register | |
| Use anonymized descriptors | e.g. "$200M cross-border SaaS licensing" | |
| Skip deal grids on IP & Tax pages | Match current site; add anonymized deals later | ✓ |

**User's choice:** Skip deal grids on IP & Technology and Tax pages for now — the current site has none there and there are no new names to clear. Anonymized IP/Tax deals added later. M&A page keeps its cleared named deals + Daniel Brian / Athelas–Commure testimonial. (→ D-09, D-10)
**Notes:** No testimonial on IP/Tax pages (none cleared).

---

## Attorney bios & thin profiles

| Option | Description | Selected |
|--------|-------------|----------|
| Warm narrative rewrite | New voice, intro paragraph | |
| Use real bsvlaw.com bios, current professional tone | Transfer existing copy | ✓ |

**User's choice:** Use the real bsvlaw.com bios for Aaron, Stuart, Jon, Iris in the current professional tone. (→ D-03)
**Notes:**
- Iris: bar "to be confirmed" — do not invent a year; omit or note being confirmed. (D-05)
- Susan Jiang: clean "full bio coming soon" placeholder, draft until Jon supplies bio. (D-07)
- Jon Van Loo: use a 3-bullet interim representative-experience list (tax-free/taxable company sales; tax-efficient crypto consideration structuring; tax aspects of crypto transactions incl. crypto-as-compensation) + a crypto-tax thought-leadership line (PLI talks, published articles). Jon expands later. (D-06)

---

## Partner contact callouts

| Option | Description | Selected |
|--------|-------------|----------|
| Email + direct phone | Publish both | |
| Email only, no phone | firstname@bsvlaw.com pattern | ✓ |

**User's choice:** Email only — NO phone numbers anywhere. Pattern `firstname@bsvlaw.com` (e.g. jon@bsvlaw.com). Jon confirms/corrects exact addresses at review. (→ D-08)

---

## Practice-area FAQs

| Option | Description | Selected |
|--------|-------------|----------|
| Jon supplies FAQ Q&A | User-authored | |
| Claude drafts, Jon reviews before publish | Draft → approval gate | ✓ |

**User's choice:** Claude drafts 3–5 plain-English FAQs per practice area, presented to Jon for approval BEFORE writing to MDX / committing / publishing. Answers accurate and non-promissory (Rule 7.1; no outcome guarantees). (→ D-12, D-13, D-14)

---

## Aaron Belcher deal list

**User's choice:** Re-fetch `https://bsvlaw.com/team/aaron-belcher-partner/` and capture the COMPLETE representative-transactions list verbatim — every deal, none dropped — for his profile and the M&A deal grid. Already cleared (public on current site, recorded 2026-05-26). (→ D-04, D-15)
**Notes:** 64 deals captured during this discussion; full verbatim list stored in CONTEXT.md `<specifics>`.

---

## Claude's Discretion

- Layout markup for AttorneyLayout / PracticeAreaLayout and component composition
- Person / FAQPage JSON-LD field selection (existing jsonld.ts builders)
- Fee-structure band wording (one consistent band across practice pages)
- Resolving the barAdmissions min-1 schema for Iris without inventing a jurisdiction
- lint:legal allowlist config details

## Deferred Ideas

- Anonymized IP & Tax deal experience (later)
- Jon Van Loo full deal list (Jon expands later)
- Susan Jiang real bio (Jon supplies)
- Real headshots (Phase 7)
- Exact partner email addresses (Jon confirms at review)
