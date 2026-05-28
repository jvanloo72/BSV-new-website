# Legacy bsvlaw.com Redirect Map

**Created:** 2026-05-28
**Purpose:** Preserve referral and SEO equity from the legacy bsvlaw.com URLs by mapping them to their new equivalents on the modernized site.
**Status:** **NOT yet wired in `vercel.json`** — implementation is a Phase 7 task (per ROADMAP OPS-03). This file is the source of truth for that future config.

---

## How this map works

When Phase 7 lands, each row below becomes a `301` (permanent) redirect entry in `vercel.json`. Search engines transfer the link equity from the old URL to the new one; anyone who clicks an old link (in an email, a blog post, a citation, a backlink) lands on the right place on the new site.

All entries are `301 Permanent` unless noted.

---

## /news/ post redirects (14 entries — Phase 5 imports)

Each legacy `/news/...` URL on bsvlaw.com maps 1:1 to the new `/blog/<slug>` URL. Body content was transferred verbatim from the source (D-01/D-02 — no paraphrasing).

### Insights (named-attorney posts)

| # | Old URL (bsvlaw.com) | New URL (this site) | Author | Status |
|---|---------------------|---------------------|--------|--------|
| 1 | `/inventors-and-coders-beware-what-was-once-capital-gain-is-new-ordinary-income/` | `/blog/inventors-coders-beware-capital-gain-ordinary-income` | Jon Van Loo | 301 |
| 2 | `/unissued-equity-and-stock-options/` | `/blog/unissued-equity-compensation-challenges` | Jon Van Loo | 301 |
| 3 | `/crypto-compensation-tax-nuances-of-paying-in-crypto/` | `/blog/crypto-compensation-tax-nuances` | Jon Van Loo | 301 |
| 4 | `/crypto-tax-101-clean-up/` | `/blog/crypto-tax-101-clean-up` | Jon Van Loo | 301 |
| 5 | `/2025-tax-focus-on-crypto/` | `/blog/crypto-tax-2025-renewed-focus-on-reporting` | Jon Van Loo | 301 |
| 6 | `/patent-filing-tip-of-the-day-labor-day-and-the-importance-of-accurate-inventorship/` | `/blog/patent-filing-tip-accurate-inventorship` | Stuart Smolen | 301 |

### Deal Announcements (firm-attributed posts)

| # | Old URL (bsvlaw.com) | New URL (this site) | Status |
|---|---------------------|---------------------|--------|
| 7 | `/belcher-smolen-van-loo-llp-advises-guidestar-on-its-sale-to-uniswap-labs/` | `/blog/guidestar-acquired-by-uniswap-labs` | 301 |
| 8 | `/belcher-smolen-van-loo-llp-advises-pocket-universe-on-its-sale-to-kerberus/` | `/blog/pocket-universe-acquired-by-kerberus` | 301 |
| 9 | `/belcher-smolen-van-loo-represents-designmind-on-its-sale-to-3cloud/` | `/blog/designmind-acquired-by-3cloud` | 301 |
| 10 | `/belcher-smolen-van-loo-llp-represented-commure-in-its-acquisition-of-memora-health/` | `/blog/commure-acquires-memora-health` | 301 |
| 11 | `/belcher-smolen-van-loo-represents-sano-intelligence-on-sale-of-its-assets-to-one-drop/` | `/blog/sano-intelligence-acquired-by-one-drop` | 301 |
| 12 | `/belcher-smolen-van-loo-represents-hyphen-on-its-sale-to-betterworks/` | `/blog/hyphen-acquired-by-betterworks` | 301 |
| 13 | `/belcher-smolen-van-loo-represents-arcadia-data-on-sale-of-assets-to-cloudera/` | `/blog/arcadia-data-acquired-by-cloudera` | 301 |
| 14 | `/cipherbrowseracquisition/` | `/blog/cipher-browser-acquired-by-coinbase` | 301 |

### /news/ index + pagination

| Old URL (bsvlaw.com) | New URL | Notes |
|----------------------|---------|-------|
| `/news/` | `/blog` | The legacy index page redirects to the new Insights index |
| `/news/page/2/` | `/blog` | Pagination URL also redirects to the new index |
| `/news/page/N/` (any N ≥ 2) | `/blog` | Wildcard rule covers any future legacy pagination URL |

---

## Skipped or retired posts

**None.** All 14 posts that appeared on `bsvlaw.com/news/` (pages 1 + 2) at the time of import (2026-05-28) were imported and published. No legacy `/news/` post is being intentionally dropped or retired — every old URL above has a direct destination on the new site.

If a future post-import iteration retires a legacy URL (e.g. due to a Rule 7.1 / 7.4 concern or because the content is superseded), add a row here with the destination explicitly chosen — `/blog` if the topic still belongs in Insights, or `/contact` if the topic is no longer surface-appropriate. **Never let an imported legacy URL 404.**

---

## Future redirects (out of Phase 5 scope)

The following legacy URLs from `bsvlaw.com` are NOT covered by this map and will be added during Phase 7's redirect-map work. Listed here as a placeholder so nothing slips through the cracks:

- `/` (legacy homepage) → `/`
- `/about/` → `/about`
- `/team/<slug>/` (the five legacy attorney URLs) → `/attorneys/<slug>` (slug mapping confirmed by Jon)
- `/practice-areas/<slug>/` (if any legacy practice pages exist) → `/practice-areas/<slug>`
- `/contact/` (legacy contact page) → `/contact`
- Any other legacy URLs Jon surfaces during the Phase 7 redirect-map review.

These will be added to this file when Phase 7 runs.

---

## Implementation note (Phase 7)

When this map is wired into `vercel.json`, every entry above becomes one object in the `"redirects"` array:

```json
{
  "source": "/inventors-and-coders-beware-what-was-once-capital-gain-is-new-ordinary-income",
  "destination": "/blog/inventors-coders-beware-capital-gain-ordinary-income",
  "permanent": true
}
```

`"permanent": true` produces a 301. `"source"` matches the path *without* the trailing slash; Vercel normalizes both `/foo/` and `/foo` against the same pattern. The wildcard rule for `/news/page/*` uses Vercel's `:path*` syntax:

```json
{
  "source": "/news/page/:path*",
  "destination": "/blog",
  "permanent": true
}
```

A Phase 7 verification test should `curl -I` each old URL and assert `HTTP/2 301` + the correct `location:` header.

---

*Map created during Phase 5 (Insights Blog System) on 2026-05-28. Updated whenever blog content is imported from a legacy source. Read by Phase 7 to populate `vercel.json` before launch.*
