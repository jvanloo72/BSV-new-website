---
phase: 04-attorney-practice-area-pages
plan: 02
subsystem: attorney-profiles
tags: [content, mdx, person-json-ld, attorney-layout, deals-grid, compliance, seo, aeo]
requires:
  - buildPersonLd(attorney) — Person JSON-LD builder (Plan 01)
  - src/content.config.ts attorneys schema
  - src/components/sections/DealsGrid.astro, src/components/seo/JsonLd.astro
  - src/assets/headshots/placeholder-*.svg (5 monograms)
provides:
  - Four published attorney profiles (Aaron, Stuart, Jon, Iris) at /attorneys/<slug>
  - Susan Jiang draft:true placeholder (no route, no sitemap entry)
  - Fully rendered AttorneyLayout (Person JSON-LD + email callout + deal grid + disclaimer)
  - Aaron's complete 64-deal representativeDeals (all cleared) published
affects:
  - Plans 03/04 (practice pages) — reuse Aaron's cleared deals in the M&A grid; link to lead attorneys
  - Phase 5 (blog) — Person entries referenced as authors
tech-stack:
  added: []
  patterns:
    - schema-field → component-prop adapter built in layout frontmatter (DealsGrid)
    - image() headshot rendered via <Image> from astro:assets
    - email-only contact callout (mailto), phone field deliberately unset (D-08)
    - barAdmissions min-1 satisfied by a non-committal placeholder (D-05, no fabrication)
key-files:
  created:
    - src/content/attorneys/aaron-belcher.mdx
    - src/content/attorneys/stuart-smolen.mdx
    - src/content/attorneys/jon-van-loo.mdx
    - src/content/attorneys/iris-zhang.mdx
    - src/content/attorneys/susan-jiang.mdx
  modified:
    - src/layouts/AttorneyLayout.astro
    - tests/person-jsonld.spec.ts
    - tests/draft-exclusion.spec.ts
    - tests/pages-exist.spec.ts
    - tests/fishbien-absent.spec.ts
  deleted:
    - src/content/attorneys/placeholder-attorney.mdx
    - src/content/attorneys/placeholder-attorney-headshot.svg
decisions:
  - "Attorney bios replicated verbatim from live bsvlaw.com (re-fetched at build, D-01/D-03)"
  - "Aaron's 64 deals mapped 1:1 from CONTEXT <specifics>, all cleared:true (D-04/D-15)"
  - "Iris + Susan barAdmissions use 'Bar admission details to be confirmed' placeholder (D-05, no invented jurisdiction)"
metrics:
  duration: ~22m
  completed: 2026-05-27
---

# Phase 4 Plan 02: Attorney Profiles Summary

Shipped the attorney-profile vertical slice: five attorney MDX files (Aaron, Stuart, Jon, Iris published; Susan draft) and a fully rendered `AttorneyLayout` that surfaces every schema field — header + headshot, bar admissions, education, focus, clerkship, prior firms, recognition, languages, an email-only contact callout, Aaron's cleared deal grid, per-attorney Person JSON-LD, and the attorney disclaimer. Bios were re-fetched verbatim from the live bsvlaw.com pages (D-01); no facts fabricated (D-02).

## What was built

### Task 1 — Five attorney MDX files — commit `1e7929d`
- Re-fetched the live `bsvlaw.com/team/{aaron-belcher,stuart-smolen,jon-van-loo}-partner/` pages for exact wording (D-01); bios transcribed verbatim, em/curly-quote normalized.
- **aaron-belcher.mdx**: California + New York; NYU J.D., U. Michigan B.A.; prior firm Dewey & LeBoeuf LLP; the FULL 64-deal `representativeDeals` from CONTEXT `<specifics>`, every entry `cleared: true`, with `value` set where the source stated one ($6B Athelas/Commure, $200M Mode Analytics, $1B Compellent, $6.4B Illumina/Roche defense, $2B Taleo, $300M Bioform).
- **stuart-smolen.mdx**: California, Virginia, and "Registered to practice before the U.S. Patent and Trademark Office (USPTO)" (D-16 Rule 7.4-safe phrasing — no banned term); Columbia J.D. (Harlan Fiske Stone Scholar), Yale M.S./M.Phil. Physics, SUNY Stony Brook B.S.; Fed. Circuit clerkship (Hon. S. Jay Plager); recognition "Corporate IP Star, 2017".
- **jon-van-loo.mdx**: name exactly "Jon Van Loo" (ATTY-12); New York + California; Northwestern J.D. magna 2007, Duke M.A. 2004, U. Chicago B.A. 1994; prior firms Linklaters, Dechert; `representativeDeals: []` (D-06) — the 3 interim experience bullets + the crypto thought-leadership line live in the bio body prose.
- **iris-zhang.mdx**: Associate; `barAdmissions: ["Bar admission details to be confirmed"]` (D-05 — satisfies `.min(1)` without inventing a jurisdiction); Columbia J.D., LSE M.S., Nanjing B.Econ.; languages English + Mandarin; bio asserts no bar admission.
- **susan-jiang.mdx**: `draft: true`, minimal "Full bio coming soon." placeholder satisfying all required fields (D-07).
- Deleted `placeholder-attorney.mdx` + its colocated `placeholder-attorney-headshot.svg`.
- Verify: `npx astro check` → 0 errors; `npm run lint:legal` → clean (exit 0).

### Task 2 — AttorneyLayout render-out — commit `962cd3e`
- Replaced the reserved line-24 comment with `<JsonLd slot="head" data={buildPersonLd(attorney)} />` just inside `<BaseLayout>` (ATTY-09/SEO-03 — slot transfer into `<head>`, no BaseLayout edit).
- Rendered the headshot via `<Image>` from `astro:assets`; surfaced bar admissions, education (degree/school/year/honors), focus, clerkship, prior firms, recognition, languages in a definition list.
- Email-only contact callout: `mailto:${attorney.data.email}` (ATTY-07/D-08). `attorney.data.phone` is never rendered anywhere.
- Composed `<DealsGrid>` from the adapter `representativeDeals.filter(d=>d.cleared).map(d=>({title:d.parties, amount:d.value, context:d.role}))` with heading "Representative transactions" — only emitted when there are cleared deals (Aaron). Kept `<slot />` for the MDX narrative and the existing `<Disclaimer id="attorney" />`.
- Token-only utilities throughout; no hardcoded hex.
- Un-skipped the content-dependent specs: `person-jsonld`, `draft-exclusion`, the fishbien built-HTML+sitemap sweep, and the attorney portion of `pages-exist` (split the practice-page assertion into its own `test.fixme` for Plans 03/04).
- Verify: `npm run build` emits the four attorney pages and NO susan-jiang route; full Playwright suite → 38 passed, 3 skipped (practice-page fixmes), 0 failed.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `fishbien-absent.spec.ts` referenced `execSync` without importing it**
- **Found during:** Task 2 verify (first spec run)
- **Issue:** The newly un-skipped built-HTML sweep called `execSync('npm run build')`, but the file only imported `fs`/`path` — `ReferenceError: execSync is not defined`.
- **Fix:** Added `import { execSync } from 'node:child_process';` to the spec.
- **Files modified:** tests/fishbien-absent.spec.ts
- **Commit:** 962cd3e

### Scope adjustment (in-plan, not a deviation)
- `tests/pages-exist.spec.ts` asserted all four attorney + three practice pages in one `test.fixme`. The plan's Task 2 only ships attorney pages (practice pages are Plans 03/04). Split into two tests: an active "all four attorney pages render" and a `test.fixme` "all three practice pages render" (UNSKIP-WHEN Plans 03/04 land). This honors the plan's "un-skip the attorney portions" instruction without failing on not-yet-built practice pages.

## Compliance notes for Jon (review gate)
- **Iris + Susan bar admissions** render the provisional text "Bar admission details to be confirmed" (D-05/A2). Please supply Iris's actual jurisdiction(s) and admission year so the placeholder can be replaced before launch.
- **Partner email addresses** use the `firstname@bsvlaw.com` pattern (aaron@, stuart@, jon@, iris@, susan@) per D-08/A3. Confirm or correct each exact address at review.
- **Aaron's deal values**: where the source line stated a figure it is shown as `amount` (e.g., "$6 billion"). All 64 deals were cleared en masse via the bsvlaw.com URL basis in Plan 01's register (D-15).
- **Susan Jiang** ships hidden (`draft:true`) — no route, no sitemap entry, no working profile link — until you supply her bio (D-07).

## Known Stubs
- **Susan Jiang profile** is an intentional `draft:true` placeholder ("Full bio coming soon.") per D-07 — she ships hidden and is resolved when Jon supplies her bio (deferred). Not a goal-blocking stub: the plan's success criteria explicitly exclude a published Susan page.
- **Iris/Susan barAdmissions placeholder** is intentional per D-05 (no fabrication); flagged above for Jon.

## Threat Flags
None. No new network endpoints, auth paths, file access, or schema changes introduced — static MDX content + render only. Person JSON-LD strings are JSON.stringify-escaped by the existing JsonLd.astro (T-04-09 accept).

## Self-Check: PASSED
- Files created — verified on disk: aaron-belcher.mdx, stuart-smolen.mdx, jon-van-loo.mdx, iris-zhang.mdx, susan-jiang.mdx; placeholder-attorney.mdx + headshot removed.
- AttorneyLayout.astro contains `buildPersonLd` (lines 6, 35) and `mailto:` (line 51); no hardcoded hex; no `attorney.data.phone`.
- Build emits dist/client/attorneys/{aaron-belcher,stuart-smolen,jon-van-loo,iris-zhang}/index.html; susan-jiang ABSENT.
- Commits exist: 1e7929d (Task 1), 962cd3e (Task 2).
- `npx astro check` → 0 errors; `npm run lint:legal` → clean; Playwright → 38 passed / 3 skipped / 0 failed.
