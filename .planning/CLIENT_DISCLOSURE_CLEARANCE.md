---
created: 2026-05-25
populated_in_phase: 4
requirement: LEGAL-04
---

# Client Disclosure Clearance Register

## Why this file exists

Under the firm's confidentiality obligations and the California Rules of
Professional Conduct (Rule 1.6 confidentiality, Rule 7.4 communication of
fields of practice), no client name, counterparty name, or identifying deal
detail may appear on the public BSV website unless it is on the allowlist
below. This file is the single source of truth for what has been cleared for
public mention.

**Phase 4** (attorney bios + practice-area deal grids) populates the tables.
**Phase 1** (this file) creates the empty template so Phase 4 does not have to
re-derive the structure. Before any deal experience publishes — on any
attorney profile, on any practice-area page, in any testimonial, in any blog
post — the relevant entry must exist in one of the tables below and have a
recorded sign-off.

A row appearing here does NOT grant blanket permission. The `Allowed contexts`
column constrains where the name may appear; using it outside that context is
itself a clearance violation.

## Cleared Clients

| Name | Cleared by | Cleared on | Allowed contexts |
| --- | --- | --- | --- |
| (none yet) | | | |

`Allowed contexts` examples: "attorney bio only" (Aaron's prior-deal list on
his profile page), "practice-area deal grid" (the M&A page's representative-
deals strip), "testimonial" (a named-client testimonial pull-quote), "blog
post" (a Tax post that references a closed engagement).

## Cleared Counterparties

| Name | Cleared by | Cleared on | Allowed contexts |
| --- | --- | --- | --- |
| (none yet) | | | |

Counterparties are entities on the OTHER side of a transaction BSV worked on
(e.g., a target company in an acquisition, an acquirer in a divestiture, a
licensee in an IP deal). They are NOT BSV clients but their names may appear
in deal-experience descriptions. Clearance for a counterparty typically requires
confirming the deal is public-record (an SEC 8-K, a closed merger announcement,
a press release) — counterparties in private deals are typically NOT cleared.

## Cleared Deal Codenames

| Codename | Approved by | Approved on |
| --- | --- | --- |
| (none yet) | | |

For deals where neither the client nor the counterparty can be named publicly
but the deal experience still demonstrates relevant work, an anonymized
codename or descriptor may be used (e.g., "$200M SaaS exit", "Cross-border
crypto-fund formation", "Series C lead-investor representation"). Each
codename must be approved by a partner before publishing — codenames can
inadvertently re-identify a deal if too specific.

## Process

Every addition to any table above requires explicit sign-off from a named
attorney with authority to clear the disclosure — currently Aaron Belcher,
Stuart Smolen, or Jon Van Loo. Adding a row without a recorded sign-off is a
Rule 1.6 confidentiality risk AND a Rule 7.4 communication-of-fields-of-
practice risk, and must be flagged in pre-publish review.

When a new entry is added during Phase 4 (or any later phase):

1. The requesting author proposes the entry in a PR.
2. The clearing partner reviews and either signs off in the PR or pushes back
   with the specific reason the name cannot be used.
3. On sign-off, the partner's name and the date are filled in the `Cleared by`
   / `Cleared on` columns in the same commit that adds the row.
4. The entry is referenced from the deal-experience copy that uses the name
   (via a code comment or in PR review notes) so reviewers can verify clearance
   without re-tracing the conversation.

Entries are never removed from this file — if a name later becomes restricted,
its row is marked with a `revoked_on: YYYY-MM-DD` and a `revoked_by:` note in
the same row, and every reference on the live site is removed in the same PR
that records the revocation.
