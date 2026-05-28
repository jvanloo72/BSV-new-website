---
phase: 05-insights-blog-system
plan: 04
subsystem: blog
tags:
  - astro
  - rss
  - sanitize-html
  - container-api
  - playwright

requires:
  - phase: 05-insights-blog-system
    plan: 01
    provides: "@astrojs/rss 4.0.18 + sanitize-html 2.17.4 installed and pinned; tests/rss-feed.spec.ts scaffold with UNSKIP-WHEN marker for this plan"
  - phase: 05-insights-blog-system
    plan: 02
    provides: "getEntry(post.data.author) author-resolution pattern (the RSS endpoint mirrors the same shape used in src/pages/blog/[slug].astro); confirmation that the schema's author email field is never read at the route layer (D-08 / T-05-03 mitigation by code-path exclusion)"
  - phase: 01-scaffold-and-shell
    provides: "src/pages/robots.txt.ts — the only existing .ts static endpoint and the APIRoute signature analog; src/lib/site.ts SITE.baseUrl + SITE.name single-source constants"
provides:
  - "src/pages/blog/rss.xml.ts — static Astro endpoint at /blog/rss.xml (BLOG-06). Imports @astrojs/rss + getCollection/getEntry/render from astro:content + experimental_AstroContainer from astro/container + loadRenderers from astro:container + getContainerRenderer as getMDXRenderer from @astrojs/mdx + sanitize-html + SITE constants + APIRoute type. Async GET handler: filters drafts via getCollection({ data }) => !data.draft, sorts newest-first by publishedAt, initialises the Container API once per build, then per-post resolves the author via getEntry, renders Content to a string, rewrites root-relative href/src to absolute via the safe negative-lookahead regex, sanitizes via sanitize-html with defaults.allowedTags.concat(['img']), and returns a per-item shape of { title, link, pubDate, author: author.data.name, description, content: cleanHtml }. Channel: BSV Insights title + locked Practical-analysis-from-the-BSV-team description + en-us language + atom xmlns. Returns rss({...}) — @astrojs/rss serializes content as <content:encoded> CDATA."
  - "tests/rss-feed.spec.ts un-skipped with deferred-pass guards on per-item assertions — 8 live tests covering RSS 2.0 root shape, channel metadata, static-file invariant (Pitfall 11), per-item field shape with no-email guard (T-05-03), no-script/iframe/form/on-handler in content:encoded (T-05-04), no-draft-leak (Pitfall 9), and a whole-file @bsvlaw.com substring belt-and-braces guard (D-08)"
affects:
  - 05-05-seed-post

tech-stack:
  added: []
  patterns:
    - "Astro Container API render-to-string pattern: experimental_AstroContainer.create({ renderers: await loadRenderers([getMDXRenderer()]) }) initialised ONCE per build (not per item) and then container.renderToString(Content) per post. This is the only working path from MDX-with-components to a string in Astro 6 (RESEARCH § Anti-Patterns line 506 — markdown-it silently drops MDX components)"
    - "Safe relative-to-absolute URL rewrite for feed payloads: /(href|src)=\"\\/(?!\\/)/g with $1=\"${SITE.baseUrl}/ — the negative-lookahead (?!\\/) on the second slash protects against scheme-strip attacks (protocol-relative //evil.com would otherwise be rewritten to https://bsvlaw.com//evil.com)"
    - "sanitize-html defaults + one-tag addition: sanitizeHtml.defaults.allowedTags.concat(['img']) — defaults already strip <script>/<iframe>/<form>/<style>/on*= and permit a:[href,name,target] + img:[src,srcset,alt,title,width,height,loading]. Adding <img> is the one explicit allowance the prose surface needs (Pitfall 3)"
    - "D-08 / T-05-03 mitigation by code-path exclusion (not by sanitizer): the route reads author.data.name verbatim; author.data.email is never accessed in this file. The author email field on the schema is one typo away from leaking, so the test layer adds a whole-file @bsvlaw.com substring check and a per-item /@/ regex on the personField as belt-and-braces"
    - "Defensive site fallback: site: context.site ?? new URL(SITE.baseUrl) — context.site is typed URL | undefined per the Astro APIRoute signature; the fallback keeps the build green even if astro.config.mjs site: were removed (it isn't, but defensive)"
    - "Deferred-pass guard on per-item RSS tests: tests that need at least one non-draft post (item-shape, sanitize-html security, no-email) check $('item').length === 0 first, annotate as pending, return early. The first three tests (file-exists + valid-RSS-2.0 + channel-description) run live regardless of post count, exercising the endpoint contract immediately"

key-files:
  created:
    - "src/pages/blog/rss.xml.ts (84 lines — static endpoint; APIRoute signature mirrors robots.txt.ts but async; the locked seven imports; safe URL-rewrite regex; sanitize-html scrub; author.data.name not .email; rss(...) call with locked BSV Insights metadata)"
    - ".planning/phases/05-insights-blog-system/05-04-SUMMARY.md"
  modified:
    - "tests/rss-feed.spec.ts — un-skipped (removed test.describe.skip); updated SCAFFOLD → RESOLVED 05-04 header; beforeAll runs npm run build and locates dist/client/blog/rss.xml; 8 live tests; per-item assertions gated on $('item').length===0 with a pending-annotation guard mirroring the 05-02 article-jsonld pattern"

key-decisions:
  - "Container API is initialised ONCE per build, before the Promise.all loop, NOT per-post. RESEARCH Pattern 5 line 462-464 pins this — the renderer creation is heavy enough that doing it inside the map() would dominate the per-post cost. With the seed post + future ~10 posts, one-renderer-per-build is the obvious shape; with 100+ posts the savings compound."
  - "site: in the rss() call uses context.site ?? new URL(SITE.baseUrl) rather than just context.site!. The Astro APIRoute typing makes site: URL | undefined (the user might not configure site in astro.config.mjs); we DO configure it (verified at astro.config.mjs:13), so the fallback is purely defensive. The non-null assertion (context.site!) would be valid here but loses the defensive layer for free."
  - "The author-resolution unknown-author check throws (not returns a placeholder) because Zod schema enforces author: reference('attorneys') as required — an unknown reference is a content-collection-build-time corruption, not a runtime case. The throw gives a clear error pointing at the offending blog slug; the build fails loudly. Same defensive shape as 05-02's [slug].astro author resolution."
  - "Per-item author field is author.data.name (verbatim), NOT author.data.name + ' (intake@bsvlaw.com)' or any composite. D-08 / T-05-03 — public RSS payload exposes name only. The whole-file @bsvlaw.com grep guard in the spec catches any future regression where a refactor accidentally routes the email through some composite field."
  - "Test spec un-skip is via removing the test.describe.skip wrapper (not via a runtime flag). The 05-01 scaffold used test.describe.skip(...) so the spec file always loaded but was a no-op; this plan converts it to test.describe(...) so Playwright reports per-test status. The per-item tests use deferred-pass annotation rather than test.skip(empty, reason) — same pattern 05-02 settled on for article-jsonld and 05-03 settled on for blog-filter."
  - "Eight tests total (the plan asked for six). Added two on top: the static-file-not-function check (verifies rssPath ends in .xml + size > 100 bytes — Pitfall 11 belt-and-braces) and the whole-file @bsvlaw.com substring guard (D-08 belt-and-braces). Both run live regardless of post count; both are cheap (filesystem stat + substring search)."

requirements-completed:
  - BLOG-06

# Metrics
duration: 8m
completed: 2026-05-28
---

# Phase 5 Plan 04: RSS Feed Slice Summary

**MVP Slice 3 — subscribe via RSS. A new `src/pages/blog/rss.xml.ts` static Astro endpoint lands; it uses `@astrojs/rss` + the experimental Astro Container API + `sanitize-html` to emit a full-content RSS 2.0 feed at `/blog/rss.xml`. The `tests/rss-feed.spec.ts` 05-01 scaffold is un-skipped behind deferred-pass guards on the per-item assertions; 8 tests are now live.** The feed ships invisible to today's visitor — `placeholder-post.mdx` stays `draft: true` so the channel is currently empty (the `<rss>`/`<channel>`/`<title>`/`<description>`/`<language>` envelope is still emitted; just zero `<item>` elements). The moment 05-05 publishes the seed post, the feed gains its first item with attorney name (NEVER email), 1-2 sentence summary, ISO publish date, and the full sanitized MDX-rendered body inside `<content:encoded>` CDATA.

## Performance

- **Duration:** ~8m
- **Started:** 2026-05-28T19:50:44Z
- **Completed:** 2026-05-28T19:58:42Z
- **Tasks:** 2
- **Files modified:** 2 (1 created — `src/pages/blog/rss.xml.ts`; 1 modified — `tests/rss-feed.spec.ts`)

## Accomplishments

- **`src/pages/blog/rss.xml.ts` is real.** New 84-line static Astro endpoint at `src/pages/blog/rss.xml.ts`. Header docstring explains the file's role + the threat-model contracts (T-05-03 email exclusion, T-05-04 sanitize-html, T-05-RELURL URL rewrite, Pitfall 9 draft filter, Pitfall 11 static-not-serverless). Imports the locked seven modules in the prescribed order (`@astrojs/rss`, `astro:content`, `astro/container`, `astro:container`, `@astrojs/mdx`, `sanitize-html`, `../../lib/site`, type-only `APIRoute`). The exported `GET: APIRoute` is `async` (the analog `robots.txt.ts` is sync; this one has many awaits) and:
  - filters drafts via `getCollection('blog', ({ data }) => !data.draft)` (Pitfall 9)
  - sorts newest-first by `publishedAt`
  - initialises the Container API ONCE per build via `experimental_AstroContainer.create({ renderers: await loadRenderers([getMDXRenderer()]) })`
  - per post (Promise.all): resolves the author via `getEntry(post.data.author)`, throws on unknown reference, renders `Content` to a string via `container.renderToString(Content)`, rewrites root-relative `href`/`src` to absolute via the safe negative-lookahead regex `/(href|src)="\/(?!\/)/g`, scrubs via `sanitizeHtml(absoluteHtml, { allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']) })`
  - emits each item as `{ title, link, pubDate, author: author.data.name, description, content: cleanHtml }` — `author.data.name` ONLY (D-08 / T-05-03 mitigation by code-path exclusion; `author.data.email` is never read in this file)
  - returns `rss({ title: 'BSV Insights', description: "Practical analysis from the BSV team on M&A, IP & technology transactions, and tax for the companies building what's next.", site: context.site ?? new URL(SITE.baseUrl), items, customData: '<language>en-us</language>', xmlns: { atom: 'http://www.w3.org/2005/Atom' } })`

- **Feed lands as a static file.** `npm run build` produces `dist/client/blog/rss.xml` — a 370-byte well-formed RSS 2.0 envelope (`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="..."><channel><title>BSV Insights</title><description>Practical analysis from the BSV team...</description><link>https://bsvlaw.com/</link><language>en-us</language></channel></rss>`). No `<item>` elements yet because the placeholder is `draft: true`; the envelope shape is correct. `astro.config.mjs` is NOT touched — the endpoint pre-renders at build time per Pitfall 11; no `output: 'server'` setting added.

- **`tests/rss-feed.spec.ts` is un-skipped with 8 live tests.** Removed `test.describe.skip(...)` → `test.describe(...)`. Updated header comment from `SCAFFOLD` to `RESOLVED 05-04`. `test.beforeAll` runs `npm run build` and locates `dist/client/blog/rss.xml` (with fallback to `dist/blog/rss.xml` for adapter robustness). The 8 tests:
  1. **file exists and is valid RSS 2.0** — `<rss `, `version="2.0"`, `<channel>`, `<title>BSV Insights</title>`, `<language>en-us</language>` (LIVE — passes today)
  2. **channel description matches the locked copy** — `Practical analysis from the BSV team` verbatim fragment (LIVE — passes today)
  3. **rss.xml is a static file, not a serverless function (Pitfall 11)** — extension check + size > 100 bytes (LIVE — passes today)
  4. **items present once a non-draft post exists** — gated on `$('item').length === 0` → pending annotation + return (DEFERRED — passes today via guard; live after 05-05)
  5. **every item carries title, link, pubDate, author, description, content:encoded with no email** — gated; full assertion loop including `expect(personField).not.toMatch(/@/)` (DEFERRED — passes today via guard; live after 05-05)
  6. **no `<script>`/`<iframe>`/`<form>`/`on*=` handler in any `<content:encoded>` payload (T-05-04)** — gated; cheerio xmlMode + raw-XML CDATA fallback (DEFERRED — passes today via guard; live after 05-05)
  7. **no draft post leaks into the feed (Pitfall 9)** — reads MDX frontmatter on disk, collects `draft: true` slugs, asserts none of them appear in `/blog/<slug>` link substrings (LIVE — passes today because placeholder-post slug is NOT in the feed)
  8. **feed contains no @bsvlaw.com email substring anywhere (D-08 belt-and-braces)** — whole-file substring check (LIVE — passes today)

  `npx playwright test tests/rss-feed.spec.ts` — **8 passed**.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create src/pages/blog/rss.xml.ts** — `a7dddc6` (feat)
2. **Task 2: Un-skip tests/rss-feed.spec.ts with deferred-pass guards** — `fa578fd` (test)

## Files Created/Modified

**Created:**
- `src/pages/blog/rss.xml.ts` — 84-line static endpoint; APIRoute signature mirrors robots.txt.ts (but async); the seven locked imports; draft filter; Container-API render-to-string; safe negative-lookahead URL rewrite; sanitize-html scrub with `defaults.allowedTags.concat(['img'])`; per-item `author: author.data.name` (NEVER `.email`); `rss(...)` call with the locked BSV Insights channel metadata
- `.planning/phases/05-insights-blog-system/05-04-SUMMARY.md`

**Modified:**
- `tests/rss-feed.spec.ts` — un-skipped (`test.describe.skip` → `test.describe`); header updated to `RESOLVED 05-04`; 8 live tests; 4 fully live regardless of post count + 3 deferred-pass via `$('item').length === 0` guard + 1 always-pass (draft-leak — there are no drafts in the feed because no drafts get past the `!data.draft` filter)

## Decisions Made

1. **Container API initialised ONCE per build, before the `Promise.all` loop, NOT per-post.** RESEARCH Pattern 5 lines 462-464 pin this — the renderer creation is heavy enough that doing it inside the `map()` would dominate the per-post cost. With the seed post + future ~10 posts, one-renderer-per-build is the obvious shape; with 100+ posts the savings compound.

2. **`site:` in the `rss()` call uses `context.site ?? new URL(SITE.baseUrl)` rather than `context.site!`.** The Astro `APIRoute` typing makes `site: URL | undefined` (the user might not configure `site` in `astro.config.mjs`); we DO configure it (verified at `astro.config.mjs:13`), so the fallback is purely defensive. The non-null assertion would be valid here but loses the defensive layer for free.

3. **The author-resolution unknown-author check `throw`s** (not return a placeholder). The Zod schema enforces `author: reference('attorneys')` as required — an unknown reference is a content-collection-build-time corruption, not a runtime case. The throw gives a clear error pointing at the offending blog slug; the build fails loudly. Same defensive shape as 05-02's `[slug].astro` author resolution.

4. **Per-item `author` field is `author.data.name` (verbatim), NOT any composite that includes the email.** D-08 / T-05-03 — public RSS payload exposes name only. The whole-file `@bsvlaw.com` grep guard in the spec catches any future regression where a refactor accidentally routes the email through some composite field. Two layers: code-path exclusion in `rss.xml.ts` + whole-file substring check in `tests/rss-feed.spec.ts`.

5. **Test spec un-skip is via removing the `test.describe.skip` wrapper** (not via a runtime flag). The 05-01 scaffold used `test.describe.skip(...)` so the spec file always loaded but was a no-op; this plan converts it to `test.describe(...)` so Playwright reports per-test status. The per-item tests use deferred-pass annotation rather than `test.skip(empty, reason)` — same pattern 05-02 settled on for article-jsonld and 05-03 settled on for blog-filter.

6. **Eight tests total (the plan asked for six).** Added two on top of the plan's prescribed six:
   - **The static-file-not-function check** (`rssPath` ends in `.xml` + size > 100 bytes — Pitfall 11 belt-and-braces). This is a one-line filesystem stat that catches a future hypothetical regression where the endpoint accidentally gets re-routed through the Vercel serverless function adapter.
   - **The whole-file `@bsvlaw.com` substring guard** (D-08 belt-and-braces). Catches any future refactor where the author email accidentally lands in a composite field (e.g., a hypothetical `customData: \`<dc:creator>${author.data.name} (${author.data.email})</dc:creator>\``).
   Both run live regardless of post count; both are cheap; both increase the test layer's confidence without adding scope.

## Deviations from Plan

**Two extra tests added beyond the plan's prescribed six.** Documented under Decision #6 above. These are belt-and-braces additions (static-file check + whole-file email substring guard) — they don't change the plan's scope, they harden the existing contracts.

**No other deviations.** Every plan instruction landed verbatim:
- The locked seven imports are present in the prescribed order.
- The async GET handler filters drafts, sorts newest-first, initialises the Container API once, per-post resolves the author and renders Content to a string, rewrites root-relative URLs with the safe negative-lookahead regex, scrubs via `sanitize-html` with `defaults.allowedTags.concat(['img'])`, and returns `rss({...})` with the locked BSV Insights metadata.
- `author: author.data.name` — never `.email`.
- `astro.config.mjs` is NOT touched (no `output: 'server'`, no `output: 'hybrid'`).
- `getCollection('blog', ({ data }) => !data.draft)` filter is present (Pitfall 9).
- `npm run check` passes (0 errors, 0 warnings, 68 pre-existing hints — same baseline as 05-03).
- `npm run build` succeeds; `dist/client/blog/rss.xml` is 370 bytes (empty channel — expected — placeholder still draft:true).
- `npx playwright test tests/rss-feed.spec.ts` — 8 passed.
- `npm test` — 62 passed, 2 skipped. The 2 remaining skips are the still-deferred 05-05 markers (`blog-pages-exist` + `disclaimer-crawl` blog-route). Zero regressions.
- `npm run lint:legal` — clean, no Rule 7.4 banned terms.
- `grep '@bsvlaw.com' dist/client/blog/rss.xml` — empty (D-08 email invariant — the channel is empty today; the substring will remain absent once the seed post lands because the route reads `author.data.name`, not `.email`).

## Issues Encountered

**One Windows-shell escaping artifact (no code change required).** The plan's Task 2 verify script uses a `node -e` invocation with `\"version=\\\"2.0\\\"\"` in argv. On Windows, the cmd.exe / PowerShell layer mangles the escaped quotes before Node's argv parser sees them, so the literal-substring check trips with "want true got false" even though the file does contain `version="2.0"`. Confirmed the substring is present via direct Grep (`grep 'version=\"2\\.0\"' tests/rss-feed.spec.ts` returns the matching line). No code change required — the spec file is correct; the verify shell-quote escaping is a tooling-layer false positive. This is the same class of verify-regex literal-string trip that 05-02 (Article JSON-LD signature trailing-comma) and 05-03 (`client:` substring in docstring) noted before. Worth logging as a planning pattern: verify scripts that embed regex-literal substrings inside `node -e` should prefer reading the file via `fs.readFileSync` from a separate `.mjs` rather than via argv-passed strings on Windows.

No Rule 1/2/3 auto-fixes required. Both tasks ran first-try.

## User Setup Required

None — no external service configuration required for plan 05-04. The endpoint runs at build time only; no API keys, no third-party endpoints, no environment variables. The feed URL `https://bsvlaw.com/blog/rss.xml` will be live the moment the next Vercel deploy publishes the current branch.

## Verification Evidence

- `npm run check` — 0 errors, 0 warnings, 68 pre-existing hints (`z is deprecated` from astro:content + the JsonLd `is:inline` notice — both pre-existing; same baseline as 05-03). File count: 73 (unchanged from 05-03 — `src/pages/blog/rss.xml.ts` is a `.ts` not `.astro` so it's not in astro check's file count).
- `npm run build` — succeeded; `dist/client/blog/rss.xml` lands at 370 bytes (the empty-channel envelope — `<rss>`/`<channel>`/`<title>BSV Insights</title>`/`<description>Practical analysis from the BSV team...</description>`/`<link>https://bsvlaw.com/</link>`/`<language>en-us</language>` — no `<item>` because placeholder is `draft:true`, as designed).
- `npx playwright test tests/rss-feed.spec.ts` — 8 passed.
- `npm test` — 62 passed, 2 skipped (the 2 skips are: 1 `blog-pages-exist` + 1 `disclaimer-crawl` blog-route — both still tied to 05-05 UNSKIP-WHEN markers). Zero regressions in disclaimer-crawl, person-jsonld, faqpage-jsonld, jsonld-legalservice, pages-exist, lead-attorney-link, lint-legal, zod-negative, fishbien-absent, draft-exclusion, gallery, blog-zod-author, blog-zod-cover, article-jsonld, blog-filter.
- `npm run lint:legal` — clean, no Rule 7.4 banned terms.
- Final grep guard: `grep '@bsvlaw.com' dist/client/blog/rss.xml` — empty (D-08 email invariant satisfied).

## Threat Flags

None. The threat model in the plan (T-05-03 RSS author-field email leak, T-05-04 MDX-script XSS in `<content:encoded>`, T-05-IFRAME embed leak, T-05-RELURL relative-URL rewrite, T-05-DRAFT draft-post leak) is fully mitigated structurally:
- **T-05-03:** Code reads `author.data.name`, never `.email`. Test layer adds whole-file `@bsvlaw.com` substring guard + per-item `expect(personField).not.toMatch(/@/)`.
- **T-05-04:** sanitize-html with `defaults.allowedTags.concat(['img'])` strips `<script>` / `<iframe>` / `<form>` / `<style>` / `on*=`. Test layer asserts via cheerio + raw-XML CDATA fallback.
- **T-05-IFRAME:** `<iframe>` not in `defaults.allowedTags`; only `<img>` is added explicitly. Future v2 embeds would require a deliberate config change. Test layer catches it via the same T-05-04 path.
- **T-05-RELURL:** The regex `/(href|src)="\/(?!\/)/g` rewrites root-relative URLs to absolute using `${SITE.baseUrl}`. The `(?!\/)` negative-lookahead protects against `//evil.com` protocol-relative attacks.
- **T-05-DRAFT:** `getCollection('blog', ({ data }) => !data.draft)` filter at the top of the handler. Test layer cross-checks: reads MDX frontmatter on disk, collects `draft: true` slugs, asserts none of them appear in the rendered XML.

No new network endpoints. No new auth paths. No new file-access patterns. No schema changes at trust boundaries.

## Next Phase Readiness

**Plan 05-05 (seed post) is unblocked:**
- The moment Jon's seed post lands with `draft: false`:
  - `getCollection('blog', !data.draft)` returns one entry.
  - The Container API renders its MDX body to a string.
  - The URL-rewrite + sanitize-html scrub produce a clean HTML payload.
  - `rss(...)` emits a feed with one `<item>` containing title + link + pubDate + author name (NEVER email) + summary + `<content:encoded>` CDATA full body.
  - `tests/rss-feed.spec.ts`'s three deferred-pass guards (items-present, per-item shape, no-script/iframe content) fall through; the full assertion loop runs against real DOM with **zero further test edits**.
  - The whole-file `@bsvlaw.com` substring guard continues to pass — author name flows through `author.data.name`, never through `.email`.

**No blockers introduced.**

## Self-Check: PASSED

All files claimed in this summary verified to exist on disk; both task commits verified in `git log`.

- `src/pages/blog/rss.xml.ts` — FOUND (84 lines; locked seven imports; async GET; draft filter; Container API; URL rewrite; sanitize-html; `author.data.name` not `.email`; `rss({...})` with locked BSV Insights metadata)
- `tests/rss-feed.spec.ts` — FOUND (no `test.describe.skip`; `version="2.0"` regex; `not.toMatch(/@/)`; `<script` + `<iframe` checks; `draftSlugs` cross-check; 8 live tests via `npx playwright test`)
- `dist/client/blog/rss.xml` — FOUND (370 bytes; well-formed RSS 2.0 envelope; empty channel — expected — placeholder is still `draft:true`)
- Commit `a7dddc6` — FOUND (Task 1: rss.xml.ts endpoint)
- Commit `fa578fd` — FOUND (Task 2: rss-feed.spec.ts un-skip)

---

*Phase: 05-insights-blog-system*
*Plan: 04*
*Completed: 2026-05-28*
