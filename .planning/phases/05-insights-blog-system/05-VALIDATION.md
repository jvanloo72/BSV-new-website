---
phase: 5
slug: insights-blog-system
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-28
---

# Phase 5 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Mirrors the Phase 5 RESEARCH.md `## Validation Architecture` section
> (single source of truth — keep this file in sync).

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | `@playwright/test` 1.60.0 (+ `cheerio` 1.2.0 for HTML parsing, optional `fast-xml-parser` 4.x for RSS) |
| **Config file** | `playwright.config.ts` (exists; Phase 1) |
| **Quick run command** | `npx playwright test tests/<file>.spec.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~45 seconds full suite (Playwright + build); ~3-5s per single spec |

---

## Sampling Rate

- **After every task commit:** Run `npm run check` (astro check + Zod) + `npm run lint:legal` (fast, no build) + the single most-relevant `tests/<task>.spec.ts`
- **After every plan wave:** Run `npm test` (full Playwright suite)
- **Before `/gsd:verify-work`:** Full suite must be green + `npm run lint:legal` clean
- **Phase gate:** Full suite green + manual Vercel preview review by Jon (D-14 step 6) + production URL reported (D-14 step 6)
- **Max feedback latency:** ~45 seconds (full suite); ~5 seconds (per-spec)

---

## Per-Task Verification Map

> Plan IDs and task IDs land once the planner emits PLAN.md files. The map below
> covers the Phase 5 requirements → test files; specific task IDs will be filled
> in by the executor as each task lands. Source: RESEARCH.md § Phase Requirements → Test Map.

| Req ID | Behavior | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|--------|----------|------------|-----------------|-----------|-------------------|-------------|--------|
| BLOG-01 | Each non-draft post produces `/blog/<slug>/index.html` returning 200 | — | N/A | build+fs | `npx playwright test tests/blog-pages-exist.spec.ts` | ❌ W0 | ⬜ pending |
| BLOG-02 | Build fails when a blog MDX has no `author` field (Zod) | — | Anonymous post blocked at build | unit (negative case via fixture) | `npx playwright test tests/blog-zod-author.spec.ts` | ❌ W0 | ⬜ pending |
| BLOG-03 | Every `/blog/<slug>` page renders the disclaimer text from `disclaimers.json` `id="blog"` | — | Per-post disclaimer cannot be forgotten | build+parse | extend `tests/disclaimer-crawl.spec.ts` (already exists) | ✅ extend | ⬜ pending |
| BLOG-04 / SEO-04 | Every `/blog/<slug>` page has valid `Article` JSON-LD in `<head>` with `headline`, `author.name`, `author.url`, `datePublished`, `dateModified`, `image`, `mainEntityOfPage`, `publisher` | T-05-01 (JSON-LD `</script>` breakout — already mitigated via `JsonLd.astro` JSON.stringify) | JSON.stringify escapes `<` per ECMAScript | build+parse | `npx playwright test tests/article-jsonld.spec.ts` | ❌ W0 | ⬜ pending |
| BLOG-05 | `/blog?author=jon-van-loo` URL — chip with matching `data-value` has `aria-pressed="true"` after JS runs; non-matching `<li>` items get `hidden` attribute | T-05-02 (inline filter script XSS via querystring) | Script reads `.search` for compare-only, no `innerHTML` write | build+browser script | `npx playwright test tests/blog-filter.spec.ts` | ❌ W0 | ⬜ pending |
| BLOG-05 | URL with no params — all `<li>` visible, all "All" chips `aria-pressed="true"` | — | N/A | browser | folded into blog-filter.spec.ts | — | ⬜ pending |
| BLOG-05 | Bookmarkable filtered URL works when JS is disabled — chip `<a href>` carries the right query string | — | Progressive enhancement; no JS-required UX | build+parse | folded into blog-filter.spec.ts | — | ⬜ pending |
| BLOG-06 | `/blog/rss.xml` is a valid RSS 2.0 document with at least one `<item>`; each item has `<title>`, `<link>`, `<pubDate>`, `<dc:creator>`/`<author>`, `<description>`, `<content:encoded>` | T-05-03 (RSS leaks attorney email) | Per-item `author` = attorney.data.name, NEVER `.email` (D-08) | build+xml-parse | `npx playwright test tests/rss-feed.spec.ts` | ❌ W0 | ⬜ pending |
| BLOG-06 | RSS `<content:encoded>` contains only allow-listed HTML tags (no `<script>`, no `<iframe>`) | T-05-04 (Malicious MDX renders `<script>` into RSS payload) | `sanitize-html` strips by default | build+regex | folded into rss-feed.spec.ts | — | ⬜ pending |
| BLOG-09 | At phase close: exactly one published (non-draft) blog post exists | — | N/A | fs | folded into blog-pages-exist.spec.ts (`getCollection` count === 1 with `!draft`) | — | ⬜ pending |
| LEGAL-09 | Every built blog page contains the blog-disclaimer text (BLOG-03 satisfies structurally) | T-05-05 (Pre-engagement client comms leak via post body) | Content-fidelity rule (D-01) + clearance register + per-post disclaimer | build+grep | folded into disclaimer-crawl.spec.ts | — | ⬜ pending |
| (a11y) | Cover-image alt text is non-empty when cover present (Zod refine) | — | Structural a11y guarantee | unit | `npx playwright test tests/blog-zod-cover.spec.ts` (negative case) | ❌ W0 | ⬜ pending |
| (a11y) | Chip row has `aria-labelledby`, chips have `aria-pressed`, empty-filtered has `role="status" aria-live="polite"` | — | N/A | build+parse | folded into blog-filter.spec.ts (DOM attribute assertions) | — | ⬜ pending |
| (perf) | The RSS endpoint produces a static `.xml` file (not a serverless function) | — | Predictable static delivery; no runtime exec | fs | folded into rss-feed.spec.ts (`fs.existsSync('dist/blog/rss.xml')` or vercel-adapter-specific path) | — | ⬜ pending |
| (banned-term) | `lint:legal` runs on the seed-post MDX and passes (no `expert`/`specialist` hits) | T-05-06 (Misleading advertising in post body) | Existing prebuild scanner | CLI | `npm run lint:legal` (existing) on phase-final commit | ✅ existing | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/blog-pages-exist.spec.ts` — covers BLOG-01 / BLOG-09 (one published post)
- [ ] `tests/blog-zod-author.spec.ts` — covers BLOG-02 (build fails on missing author — uses a fixture to verify the Zod error message)
- [ ] `tests/blog-zod-cover.spec.ts` — covers the new Zod refine (cover requires coverAlt)
- [ ] `tests/article-jsonld.spec.ts` — covers BLOG-04 / SEO-04 (Article JSON-LD valid + complete fields)
- [ ] `tests/blog-filter.spec.ts` — covers BLOG-05 (Playwright `page.goto` with URL params, asserts chip aria-pressed, asserts hidden state, asserts progressive-enhancement fallback)
- [ ] `tests/rss-feed.spec.ts` — covers BLOG-06 (valid RSS 2.0, at least one item, sanitized content, file exists, no email leak)
- [ ] Extend `tests/disclaimer-crawl.spec.ts` to walk `/blog/<slug>` routes and assert `id="blog"` disclaimer present (LEGAL-09)
- [ ] Add `package.json` test scripts mirroring the existing naming (`test:blog-pages-exist`, `test:article-jsonld`, `test:rss-feed`, `test:blog-filter`, `test:blog-zod-author`, `test:blog-zod-cover`)
- [ ] Framework install: none — Playwright + cheerio already present. Optional `fast-xml-parser` (~25KB) for the RSS test; regex-check is sufficient otherwise.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Jon's content-fidelity and Rule 7.1 / 7.4 substantive review of the seed-post draft | BLOG-09 / LEGAL-09 / Rule 7.1 | Jon is the attorney of record; D-14 human-action checkpoint IS the review gate. No automation can confirm subjective Rule 7.1 (no false or misleading communications) or Rule 7.4 (no banned-term hits the lint missed for context-specific reasons). | (1) Read the supplied draft as it would appear on `/blog/<slug>` preview. (2) Confirm no client/counterparty name appears outside `CLIENT_DISCLOSURE_CLEARANCE.md`. (3) Confirm no outcome-prediction or guarantee language. (4) Confirm "thought leader" / similar wording is the only practice-area framing used. (5) Sign off in the commit message. |
| Vercel preview rendering on real devices (mobile + desktop) | BLOG-01..06 + UI-SPEC contracts | Visual rhythm, focus ring visibility, prose line-length on a real handset cannot be perfectly modeled in Playwright headless. | Open the Vercel preview URL on a phone (≤640px) and desktop; verify chip row wraps, filter chips toggle visibly, post page measure is comfortable, cover image (if present) renders at 16:9 within prose width, author card stacks at mobile. |
| RSS feed loads in a real reader (NetNewsWire / Feedly / Reeder) | BLOG-06 | XML validity automation catches schema; only a real reader confirms a subscribing partner sees the right title, author, and full content. | Optional but recommended at phase gate — paste `/blog/rss.xml` URL into NetNewsWire (free) and confirm the seed post renders with body content and the author name (not email). |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references (6 new spec files + 1 extension)
- [ ] No watch-mode flags (Playwright runs once; CI-clean)
- [ ] Feedback latency < 45s (full suite); < 5s (per-spec quick run)
- [ ] `nyquist_compliant: true` set in frontmatter (set by Nyquist auditor at verify-phase time)

**Approval:** pending (will be marked `approved YYYY-MM-DD` after gsd-nyquist-auditor runs on Wave 0 completion)
