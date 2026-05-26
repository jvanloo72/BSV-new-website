---
phase: 01-scaffold-shell
plan: "02"
subsystem: content-collections
tags: [wave-2, content-collections, zod-schemas, mdx, placeholders, found-04]
requirements:
  - FOUND-03
  - FOUND-04
  - OPS-06
dependency-graph:
  requires:
    - plan-00 (test-spec-stubs-skipped, broken-blog-post-fixture)
    - plan-01 (disclaimers-collection, walking-skeleton)
  provides:
    - five-content-collections-registered
    - attorneys-schema-with-image-validation
    - cross-collection-reference-typing (blog.author -> attorneys, practiceAreas.leadAttorneys -> attorneys, blog.practiceArea -> practiceAreas, testimonials.practiceArea? -> practiceAreas)
    - one-draft-placeholder-per-collection
    - zod-negative-test-implemented (FOUND-04 regression gate)
    - disclaimer-set-test-implemented
  affects:
    - plan-03-jsonld-and-layouts (specialized layouts will render against these placeholders)
    - plan-04-placeholder-routes (dynamic [slug] routes via getStaticPaths against these collections)
    - plan-07-ci-and-disclaimer-crawl (CI workflow runs test:zod-negative + test:disclaimer-set)
key-files:
  created:
    - src/content/attorneys/placeholder-attorney.mdx
    - src/content/attorneys/placeholder-attorney-headshot.svg (co-located — Astro image() validation requires asset-pipeline path, not /public absolute URL)
    - src/content/practiceAreas/placeholder-practice.mdx
    - src/content/blog/placeholder-post.mdx
    - src/content/testimonials/placeholder.mdx
    - public/headshots/placeholder.svg (retained as static asset for future use even though image() validation uses the src/content/ copy)
  modified:
    - src/content.config.ts (added attorneys, practiceAreas, blog, testimonials definitions; preserved existing disclaimers)
    - tests/zod-negative.spec.ts (replaced Plan 00 test.skip with real body)
    - tests/disclaimer-set.spec.ts (replaced Plan 00 test.skip with real body)
    - package.json (added test:zod-negative + test:disclaimer-set scripts)
decisions:
  - "Deviation from plan spec for the placeholder headshot location. Plan 01-02 specified `public/headshots/placeholder.svg` referenced from the attorney MDX as `/headshots/placeholder.svg`. Astro's image() schema helper does NOT accept /public absolute URLs — it requires a path that resolves through the Vite asset pipeline. Build failed with ImageNotFound on the first attempt. Resolution: co-located the headshot at `src/content/attorneys/placeholder-attorney-headshot.svg` and referenced it as `./placeholder-attorney-headshot.svg`. Kept the public/headshots/placeholder.svg file too (in case downstream phases want a static-URL fallback). The plan's spec should be updated to use co-located assets for any future content schemas using image()."
  - "Cross-reference shapes confirmed working end-to-end: blog.author -> attorneys.placeholder-attorney (via Zod reference('attorneys')), blog.practiceArea -> practiceAreas.placeholder-practice, practiceAreas.leadAttorneys[] -> attorneys.placeholder-attorney. Build succeeds, so the reference targets resolve at content-collection sync time."
  - "zod-negative test catches stderr OR stdout from the failed build (the Vite/Astro error stream layering on Windows is inconsistent — both channels can carry the Zod error). Looking in both is more resilient than the spec's stderr-only design."
metrics:
  tasks: 2
  commits: 2
  files_created: 6
  files_modified: 4
  human_checkpoints: 0
  completed: "2026-05-26T09:23:00Z"
---

# Phase 01 Plan 02: Content Collections — Summary

Extended the content collection registry from Plan 01's single `disclaimers` to all five required collections (attorneys, practiceAreas, blog, testimonials, disclaimers) with cross-collection `reference()` typing. Seeded one draft placeholder per collection so the schemas exercise end-to-end with cross-references resolving at build time. Implemented the two Plan 00 test scaffolds — zod-negative (FOUND-04 regression gate) and disclaimer-set integrity — replacing the `test.skip()` stubs with real bodies.

## What was built

### Task 1 — Five content collections + four placeholder MDX seeds (commit `b967842`)

**`src/content.config.ts`** — extended the existing disclaimers-only export to all five collections. Added `reference` to the `astro:content` import and `glob` to the `astro/loaders` import. Each non-disclaimer collection uses `glob({ pattern: '**/*.mdx', base: './src/content/<name>' })` except `blog`, which uses `**/[^_]*.mdx` so files prefixed with `_` (draft naming convention) are skipped without changing the schema. Schemas match RESEARCH.md §"Pattern 2" exactly: attorneys with `image()` headshot + barAdmissions array (min 1) + representativeDeals[] with `cleared:boolean` gate; practiceAreas with `leadAttorneys: z.array(reference('attorneys')).min(1)` cross-link; blog with `author: reference('attorneys')` (REQUIRED — FOUND-04 build-fail gate) and `reviewedBy: z.string().min(1)` (REQUIRED editorial gate); testimonials with optional `practiceArea: reference('practiceAreas').optional()`. The `disclaimers` collection from Plan 01 was preserved unchanged. Final export: `export const collections = { attorneys, practiceAreas, blog, testimonials, disclaimers };`.

**`src/content/attorneys/placeholder-attorney.mdx`** — full valid frontmatter satisfying every required field in the attorneys schema: name, slug, title (Partner), barAdmissions (`["California"]`), education (`[{ degree: "JD", school: "Placeholder University", year: 2000 }]`), focus, email (`placeholder@bsvlaw.com`, distinct from the gitleaks-allowlisted `intake@bsvlaw.com`), headshot (`./placeholder-attorney-headshot.svg` — see deviation note below), headshotAlt, order (99), draft: true. Default-empty arrays (`priorFirms`, `representativeDeals`, `recognition`) and the languages default (`['English']`) come from the schema; the frontmatter only sets values that don't have defaults.

**`src/content/attorneys/placeholder-attorney-headshot.svg`** — minimal 200×200 SVG (rect + circle + body silhouette) under 1 KB. Co-located with the attorney MDX so Astro's `image()` helper resolves it through the Vite asset pipeline (see the decision note for why this deviates from the plan).

**`src/content/practiceAreas/placeholder-practice.mdx`** — references `leadAttorneys: ["placeholder-attorney"]`. The Zod `reference('attorneys')` resolves at content sync; the build fails if no attorney with id `placeholder-attorney` exists. This is the cross-collection regression gate.

**`src/content/blog/placeholder-post.mdx`** — references `author: "placeholder-attorney"` (REQUIRED, build fails if missing or pointing to a non-existent attorney) and `practiceArea: "placeholder-practice"` (REQUIRED, build fails if missing). `reviewedBy: "Phase 1 scaffolding"` (REQUIRED editorial gate per D-06). `publishedAt: 2026-05-25` (Zod coerces to Date). `draft: true`.

**`src/content/testimonials/placeholder.mdx`** — minimum fields: quote, attribution, role, featured (false). No `practiceArea` reference because that field is optional in the schema.

**`public/headshots/placeholder.svg`** — retained even though `image()` validation uses the co-located src/content version. Future static-URL references (e.g., generic placeholder in a future component) can use `/headshots/placeholder.svg` without going through the asset pipeline.

Verification: `npm run build` exits 0 with one page (the homepage) generated; all four placeholder content entries are present in the content store but not rendered (no [slug] routes yet — Plan 04 lands those). `npm run check` exits 0 (0 errors, 0 warnings, 71 hints — every hint is an unused-destructured-arg warning in Plan 00's skipped test stubs that Plan 07 will use).

### Task 2 — zod-negative + disclaimer-set test bodies (commit `eb4e36f`)

**`tests/zod-negative.spec.ts`** — replaced Plan 00's `test.skip(...)` scaffold with a real Playwright test. Body: copy `tests/fixtures/broken-blog-post.mdx` into `src/content/blog/broken-temp.mdx`, run `npm run build` via `execSync('npm run build', { stdio: 'pipe' })`. The catch branch concatenates stderr + stdout (both channels can carry the Zod error on Windows — see the decision note) and asserts the combined output matches `/author/i` AND one of `/required|invalid|expected/i`. The `finally` block deletes the temp file even on test failure — leaving it behind would break every subsequent build.

**`tests/disclaimer-set.spec.ts`** — replaced Plan 00's `test.skip(...)` scaffold with a real Playwright test. Body: read `src/content/disclaimers/disclaimers.json`, parse as `DisclaimerEntry[]`, assert the sorted id set equals `['attorney','blog','contact','footer','practice-area']`, then for each entry assert `text.trim().length > 20` and `version` matches `/^\d{4}-\d{2}-\d{2}/`.

**`package.json`** — added `test:zod-negative` and `test:disclaimer-set` scripts. Existing `test:disclaimer` (Plan 00, Plan 07 will use) preserved.

Verification: `npm run test:disclaimer-set` exits 0 in ~18 ms. `npm run test:zod-negative` exits 0 in ~3.4 s (full Astro build runs inside). After zod-negative, `src/content/blog/broken-temp.mdx` does not exist (cleanup verified by `ls src/content/blog/` returning only `placeholder-post.mdx`).

## Risk register & open items

- The `headshot: image()` deviation from the plan spec is documented above and in the commit message. Future content phases (Phase 4 real attorney bios) MUST co-locate headshots with the attorney MDX entries OR move them under `src/assets/`. Direct `/public` absolute paths break `image()` validation.
- The zod-negative test is gated on a full Astro build, so it's ~3.4 s per run. Plan 07's CI workflow will need to budget for that. (Still under the 60s feedback-latency target from VALIDATION.md.)
- The 8 npm audit moderate/high vulnerabilities from Plan 01 are unchanged — no new dependencies added in this plan.

## Verification evidence

- `npm run build` → exit 0; content store populated with attorneys/practiceAreas/blog/testimonials/disclaimers entries; cross-references resolved.
- `npm run check` → 0 errors, 0 warnings, 71 hints (all in skipped Plan 00 test stubs that Plan 07 will use).
- `npm run test:disclaimer-set` → exit 0 in ~11 s including Playwright startup (test itself: 18 ms).
- `npm run test:zod-negative` → exit 0 in ~15 s including Playwright + build (test itself: ~3.4 s).
- `ls src/content/blog/` after zod-negative → only `placeholder-post.mdx` (broken-temp.mdx cleaned up).

## Self-Check: PASSED

- [x] All five Zod content collections are registered: attorneys, practiceAreas, blog, testimonials, disclaimers
- [x] Adding a blog post without an `author` reference fails the build with a typed Zod error (proven by zod-negative test)
- [x] Cross-collection references resolve at build time: practiceAreas.leadAttorneys[] -> attorneys, blog.author -> attorneys, blog.practiceArea -> practiceAreas
- [x] One placeholder MDX per collection exists; all are marked `draft: true` (testimonials has no draft field per schema D-07)
- [x] The two implemented tests from Plan 00 (zod-negative, disclaimer-set) now pass
- [x] `npm run build` exits 0
- [x] `npm run check` exits 0
- [x] `src/content/blog/broken-temp.mdx` does not exist after the zod-negative test runs
