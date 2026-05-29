# Phase 5 — Insights (Blog) System — Security Audit

**Phase:** 5 — Insights (Blog) System
**Audited:** 2026-05-28
**ASVS Level:** 1 (per `workflow.security_asvs_level`)
**Block-on severity:** high (per `workflow.security_block_on`)
**Branch:** `phase-1-closeout` (HEAD: post-04 closeout commit; 14 blog posts shipped)
**Auditor:** Claude (gsd:secure-phase)

---

## Audit Scope

Phase 5 ships a static-content surface — no runtime forms, no user input,
no secrets, no auth. Attack surface is narrow: MDX → HTML for RSS, inline
filter JavaScript on `/blog`, JSON-LD embedding, optional cover-image path,
and the firm-attributed Article author blob.

Each threat declared in the `<threat_model>` blocks of `05-01-PLAN.md`
through `05-05-PLAN.md` plus the canonical register in `05-RESEARCH.md`
§ Security Domain was verified against shipped code. Implementation files
were never modified.

---

## Threat Verification

| Threat ID | Category | Disposition | Status | Evidence |
|-----------|----------|-------------|--------|----------|
| **T-05-01** | Tampering / XSS — `</script>` breakout in `Article` JSON-LD `headline` | mitigate | **CLOSED — with caveat (see FLAG-1)** | `src/components/seo/JsonLd.astro:23` uses `JSON.stringify(data)` via `set:html`. Built output in `dist/client/blog/crypto-tax-101-clean-up/index.html` contains valid `<script type="application/ld+json">{...}</script>` blocks. No `</script>` breakout in any of the 14 built post HTML files (`Grep` for "</script>" inside JSON-LD blob returned zero hits across all `dist/client/blog/*/index.html`). All inputs (title, author.name, slug) are Zod-validated build-time strings sourced from Jon-authored MDX under git review. Practical risk is low; documentary claim has a defect (FLAG-1). |
| **T-05-02** | Tampering — inline filter script XSS via `window.location.search` | mitigate | **CLOSED** | `src/pages/blog/index.astro:232-295` inline `<script is:inline>` reads `window.location.search` via `URLSearchParams.get()` (lines 234-240), and writes **only** to `aria-pressed` (line 276) and `hidden` (lines 253, 256, 263, 264, 266, 267) attributes via `setAttribute`/`removeAttribute`. No `innerHTML`, no `outerHTML`, no `document.write`, no `eval`, no `new Function`. Even if `?author=<script>` is supplied, the string is compared via `===` against `data-author` slug attributes — no DOM injection sink reachable. Verified by `tests/blog-filter.spec.ts` (6 tests, all pass). |
| **T-05-03** | Information Disclosure — attorney email leaked in RSS `<author>` | mitigate | **CLOSED** | `src/pages/blog/rss.xml.ts:71` hard-codes `author: author ? author.data.name : SITE.name` — never reads `author.data.email`. Built feed `dist/client/blog/rss.xml` returns **zero** matches for `@bsvlaw.com` and **zero** matches for the regex `[a-zA-Z0-9.+_-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+`. Belt-and-braces test guard at `tests/rss-feed.spec.ts:198-202` (`expect(rssXml).not.toContain('@bsvlaw.com')`) and per-item assertion at line 127-135 (`expect(personField).not.toMatch(/@/)`). |
| **T-05-04** | Tampering / XSS — `<script>`/`<iframe>`/`<form>`/`on*=` in RSS payload | mitigate | **CLOSED** | `src/pages/blog/rss.xml.ts:56-63` calls `sanitizeHtml(absoluteHtml, { allowedTags: defaults.concat(['img']) })`. `sanitize-html` defaults strip `<script>`, `<iframe>`, `<form>`, `<style>`, and on*= handlers (verified upstream in 05-RESEARCH § Sources). Built feed `dist/client/blog/rss.xml` has **zero** matches for `<script`, `<iframe`, `<form`, or ` on[a-z]+=` (case-insensitive). Test guard at `tests/rss-feed.spec.ts:141-175` enforces this on every item. |
| **T-05-05** | Information Disclosure / ABA 477R — pre-engagement client comms in post body | accept (human gate) | **CLOSED (substantively)** | The original automated layer (`CLIENT_DISCLOSURE_CLEARANCE.md` clearance register / LEGAL-04) was **formally descoped 2026-05-28** (DECISIONS.md line 607). Substantive control is now Jon's manual review before flipping `draft: false`. VERIFICATION.md confirms Jon reviewed all 14 imported posts prior to publish. Per-post disclaimer (`BlogPostLayout.astro:89` `<Disclaimer id="blog" />`) renders structurally on every post. Disposition correctly reclassified as `accept (human gate)` per the descope. |
| **T-05-06** | Bar compliance — Rule 7.1 / 7.4 misleading-advertising language | accept (human gate) | **CLOSED (substantively)** | The original automated layer (`lint:legal` prebuild scanner / LEGAL-03) was **formally descoped 2026-05-28** (DECISIONS.md line 607). Substantive control is now Jon's manual review. Spot-check of all 14 MDX bodies for banned terms (`Grep` for `specialist`, `expert\b`, `specialize` — case-insensitive — across `src/content/blog/*.mdx`) returned **zero** matches. Spot-check for outcome-prediction language (`guarantee`, `we win`, `outperform`, `best result`) returned **zero** matches. Disposition correctly reclassified as `accept (human gate)` per the descope. |
| **T-05-07** | XSS via image `src` — runtime URL injection in cover image | mitigate | **CLOSED** | `src/content.config.ts:84` declares `cover: image().optional()` (NOT `z.string().url()`). `src/layouts/BlogPostLayout.astro:64-65` uses Astro's `<Image src={post.data.cover}>` — accepts only build-time `ImageMetadata`. Empirically, **none** of the 14 published posts set a `cover:` field (verified via `Grep '^cover:' src/content/blog/*.mdx` — zero hits); all fall back to `${SITE.baseUrl}/og-default.svg` in `src/lib/jsonld.ts:135`. Runtime URL injection is structurally impossible. |
| **T-05-08** | Tab-jacking via `window.opener` on external MDX `<a>` | mitigate | **CLOSED** | `astro.config.mjs:51` wires `mdx({ rehypePlugins: [[rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }]] })`. Verified in built output: 8 of 8 deal-announcement HTML files at `dist/client/blog/*-acquired-by-*/index.html` contain external links to acquirer companies, **all** rendered with `rel="noopener noreferrer"` and `target="_blank"` (verified via `Grep` across `dist/client/blog/`). |
| **T-05-EMAIL** (alias of T-05-03 for byline + Article JSON-LD) | Information Disclosure | mitigate | **CLOSED** | `src/lib/jsonld.ts:145-150` author Person blob carries only `{@type, name, url}` — never `email`. Byline anchor at `BlogPostLayout.astro:50` links to `/attorneys/<slug>` — never `mailto:`. Test guard at `tests/article-jsonld.spec.ts:98-99` asserts `author.url.startsWith('${SITE_BASE_URL}/attorneys/')`. |
| **T-05-IFRAME** | Tampering | mitigate | **CLOSED** | `src/pages/blog/rss.xml.ts:60` adds only `'img'` to defaults; `<iframe>` not in allowlist. Built feed contains zero `<iframe` substrings. |
| **T-05-RELURL** | Tampering — protocol-relative URL hijack via `//evil.com` rewrite | mitigate | **CLOSED** | `src/pages/blog/rss.xml.ts:51-54` uses the regex `/(href\|src)="\/(?!\/)/g` — the `(?!\/)` negative-lookahead prevents `//evil.com` URLs from being matched and prefixed with `${SITE.baseUrl}`. Protocol-relative URLs pass through unchanged and would be caught by sanitize-html if they carried scripts. |
| **T-05-DRAFT** | Information Disclosure — draft post leaks into RSS | mitigate | **CLOSED** | `src/pages/blog/rss.xml.ts:20` filters `getCollection('blog', ({ data }) => !data.draft)`. `src/pages/blog/index.astro:28` applies the same filter. `src/pages/blog/[slug].astro` filters via `getStaticPaths`. Test guard at `tests/rss-feed.spec.ts:177-196` reads draft frontmatter from disk and asserts no draft slug appears in the built RSS. |
| **T-05-IMG** | Information Disclosure — `og-default.svg` content | accept | **CLOSED** | Disposition is `accept`. File contains only public marketing identity. Documented in `05-02-PLAN.md` threat register. |
| **T-05-SC** | Supply-chain — new packages | accept | **CLOSED** | Disposition is `accept`. Three new dependencies (`@astrojs/rss`, `sanitize-html`, `rehype-external-links` + `@types/sanitize-html`) all from established orgs at npm-verified versions matching `CLAUDE.md` locked stack. Documented in `05-01-PLAN.md`. |
| **T-05-IDX** | Information Disclosure — data-author / data-topic on `<li>` | accept | **CLOSED** | Disposition is `accept`. Same data is already in the visible byline. Documented in `05-03-PLAN.md`. |
| **T-05-LEGAL** | Bar compliance — outcome prediction | accept (human gate) | **CLOSED** | Disposition is `accept`. Per-post disclaimer renders structurally; Jon's review at the human-action gate is the substantive control. Spot-check of all 14 MDX bodies returned zero outcome-prediction phrases. |

**Totals:** 16 threats verified | 16 closed | 0 open | 0 blocked

---

## Additional Phase 5 Security Invariants (verified)

| Invariant | Status | Evidence |
|-----------|--------|----------|
| D-08 — RSS author NEVER contains email | **CLOSED** | Zero `@bsvlaw.com` substrings in `dist/client/blog/rss.xml`. |
| No draft leak across any surface | **CLOSED** | Filter `({ data }) => !data.draft` applied in `rss.xml.ts:20`, `index.astro:28`, and at `[slug].astro` `getStaticPaths`. |
| `vercel.json` CSP still in `Report-Only` mode (Phase 5 unchanged from Phase 1) | **CLOSED** | `vercel.json:9` carries `Content-Security-Policy-Report-Only`. No new directives added. Phase 7 will switch to enforce. |
| No secrets in source or `dist/` | **CLOSED** | `Grep` of `dist/` for `API_KEY`, `SECRET`, `PASSWORD`, `sk_live`, `sk_test`, `re_\w{20}`, `process.env` returned zero hits. |
| MDX bodies contain no `<script>`, `<iframe>`, `<form>`, or `on*=` handlers | **CLOSED** | `Grep` across all 14 `src/content/blog/*.mdx` returned zero hits. |
| rehype-external-links applies to all external links in MDX | **CLOSED** | 8/8 deal-announcement pages with external links carry `rel="noopener noreferrer" target="_blank"`. No `href="mailto:"` links exist in any MDX body. |

---

## FLAGs (Non-Blocking)

### FLAG-1 — Documentary defect in JsonLd.astro comment + T-05-01 mitigation claim

**Severity:** informational (not a phase blocker)

The header comment in `src/components/seo/JsonLd.astro:11-14` claims:

> *"JSON.stringify escapes <, >, & and the U+2028/U+2029 separators per the ECMAScript spec when given a plain object, so the inlined `<script>` cannot be closed prematurely by a stray `"</script>"` in a string field unless one is deliberately introduced via build-time code review."*

This claim is **factually incorrect**. Standard `JSON.stringify` does NOT escape `<`, `>`, or `&`. Verified by direct experiment:

```
node -e "console.log(JSON.stringify({headline:'</script><script>alert(1)</script>'}));"
{"headline":"</script><script>alert(1)</script>"}
```

The same false claim is repeated in:
- `.planning/phases/05-insights-blog-system/05-02-PLAN.md:308`
- `.planning/phases/05-insights-blog-system/05-02-PLAN.md:316` (T-05-01 mitigation column)
- `.planning/phases/05-insights-blog-system/05-RESEARCH.md:1241`

**Why this is non-blocking for Phase 5:**

1. **No runtime untrusted input flows into JsonLd in Phase 5.** All fields (`headline`, `author.name`, `slug`) come from Zod-validated build-time MDX frontmatter committed by Jon under git review. An attacker has no path to inject `</script>` short of compromising Jon's account or the repo itself — at which point a JSON-LD breakout is the least of the worries.
2. **Empirical check across all 14 built posts** shows no malicious content (no `</script>` substring inside any `<script type="application/ld+json">` block in `dist/client/blog/*/index.html`).
3. **Phase 1 CSP is in Report-Only mode**, so even a successful breakout would be reported, not blocked — but Phase 7 will switch to enforce.

**Recommendation for Phase 7 (not Phase 5 close):**

When Phase 7 hardens the CSP from Report-Only to enforce, ALSO add a real `</script>` escape to `JsonLd.astro`:

```astro
<script type="application/ld+json" set:html={JSON.stringify(data).replace(/</g, '\\u003c')} />
```

Or use a vetted helper (`serialize-javascript` or equivalent). At the same time, correct the comment in `JsonLd.astro` and the mitigation language in `05-02-PLAN.md` / `05-RESEARCH.md`. This is a **defense-in-depth** improvement, not a Phase 5 blocker.

**Filed against:** Phase 7 (security hardening) — track separately. Phase 5 does not introduce the defect (it was inherited from Phase 1).

### FLAG-2 — rehype-external-links `protocols` config not explicitly set

**Severity:** informational

`astro.config.mjs:51` configures rehype-external-links with `{ target: '_blank', rel: ['noopener', 'noreferrer'] }` but does NOT set the `protocols` option. Per the plugin's docs, the default protocol list is `['http', 'https']` — meaning `mailto:` and `tel:` external links would NOT receive the safer attributes.

**Why this is non-blocking for Phase 5:**

`Grep` across all 14 MDX bodies returned **zero** `href="mailto:"` and zero `tel:` links — no external mailto/tel links exist in any blog body. The attack surface is empty.

**Recommendation:** If a future post adds a mailto link, the missing `noopener noreferrer` is irrelevant (`mailto:` doesn't open a window). The Phase 5 plan can remain as-is.

### FLAG-3 — `scripts/lint-legal.allowlist.json` residue

**Severity:** informational (already noted in VERIFICATION.md INFO-5)

The `lint:legal` script was descoped 2026-05-28 (per `DECISIONS.md:607`), but the allowlist file at `scripts/lint-legal.allowlist.json` still exists on disk. The `package.json` `lint:legal` script and prebuild hook are correctly removed. This is harmless residue, not a security defect — the file is never read. Closeout cleanup recommendation; not a phase blocker.

---

## Unregistered Flags

None. All threat flags surfaced during implementation map to declared
threat IDs in the threat register.

---

## Out of Scope (Phase 6 / Phase 7 territory)

The following are explicitly out of Phase 5 scope and are NOT audited here:

- CSP switching from Report-Only to enforce mode (Phase 7)
- Lighthouse / axe-core gates (Phase 7)
- Production domain configuration (Phase 7)
- securityheaders.com grade A (Phase 7)
- Contact-form security: ABA 477R + Zod + honeypot + time-trap + rate
  limit + header-injection-proof email (Phase 6)
- Real `</script>` escape in `JsonLd.astro` (FLAG-1; track for Phase 7)

---

## Accepted Risks (Phase 5)

| ID | Risk | Acceptor | Rationale |
|----|------|----------|-----------|
| T-05-05 | Pre-engagement client comms could leak via post body | Jon Van Loo (attorney of record) | Per `DECISIONS.md:607` (2026-05-28 Phase 5 descope), the automated clearance register was descoped. Jon's manual review before flipping `draft: false` is the substantive control. All 14 currently published posts went through this review. |
| T-05-06 | Rule 7.1 / 7.4 misleading-advertising language in post body | Jon Van Loo | Per `DECISIONS.md:607`, the automated `lint:legal` scanner was descoped. Jon's manual review is the substantive control. Spot-check of 14 published bodies shows zero banned terms or outcome-prediction language. |
| T-05-LEGAL | Outcome-prediction language ("we'll win your appeal") | Jon Van Loo | Per Rule 7.1 / LEGAL-10, a substantive judgment call. Per-post disclaimer ("This article is for general informational purposes only and does not constitute legal advice") renders structurally on every post via `BlogPostLayout`. Jon's review at the human-action gate is the substantive control. |
| T-05-IMG | `og-default.svg` content (firm name + "Insights" label) | Plan-time acceptance | No PII, no credentials — public marketing identity only. |
| T-05-SC | Supply-chain risk on three new npm packages | Plan-time acceptance | All from established maintainers at npm-verified versions matching `CLAUDE.md` locked stack. |
| T-05-IDX | `data-author` / `data-topic` attributes on post `<li>` | Plan-time acceptance | Same data is in the visible byline — public by design. |

---

## Audit Outcome

All 16 declared threats are **CLOSED**. Zero `high`-severity gaps. One
**FLAG-1** (informational documentary defect about `JSON.stringify`
behavior) is filed for Phase 7 attention but does not block Phase 5
close — practical attack surface is empty because no runtime untrusted
input flows to `JsonLd`, all 14 built posts are clean, and CSP is in
Report-Only mode pending the Phase 7 hardening pass.

The phase satisfies its security contract.

---

*Audited: 2026-05-28*
*Auditor: Claude (gsd:secure-phase)*
*ASVS Level 1*
