# Decision Log — BSV Law Website Build

> Course-documentation log of significant decisions made during the build, per
> `.claude/CLAUDE.md` Decision Log requirement. Each entry: what was decided,
> why, and the teaching insight a non-technical reader (or a future Claude
> executor) should take away.

---

## 2026-05-25 — Phase 1 — Astro 6 + Tailwind v4 + Vercel + MDX + sitemap as the stack

**What was decided:**
Lock the website stack to **Astro 6** (static site framework), **Tailwind CSS v4**
(styling, via the `@tailwindcss/vite` plugin and `@theme` in a single CSS file —
no `tailwind.config.js`), **`@astrojs/vercel`** (Vercel adapter), **`@astrojs/mdx`**
(MDX content), and **`@astrojs/sitemap`** (auto sitemap generation), deployed on
Vercel with auto-deploy from the `main` branch of `jvanloo72/BSV-new-website`.

**Why:**
Locked in `.claude/CLAUDE.md`. Astro is the right framework for a
content-driven marketing site for three reasons specific to BSV: (a) Astro
content collections enforce typed frontmatter at build time, so a non-technical
author cannot break a page with a typo in an MDX field name; (b) Astro ships
static HTML by default — there is no server to keep running, no React hydration
on every page, and no per-request rendering cost; (c) MDX lets blog posts inline
the firm's `<Disclaimer />` component without hand-rolling HTML in every post.
Tailwind v4 dropped the JS config file entirely, which means the design system
lives in a single CSS file (`global.css`) — easier to read for a non-coder
inspecting the codebase. Vercel auto-deploys on every push and gives each PR a
unique preview URL — the right review workflow for Jon to share with Aaron and
Stuart.

**Teaching insight:**
For a content-heavy marketing site whose primary author is non-technical,
"boring static" beats "exciting dynamic" every time. Markdown + MDX content in
a git repo is editable from the GitHub web editor (click the pencil icon → edit
→ click commit), which means no separate CMS to provision, no admin login to
remember, and no third-party vendor whose pricing can spike at renewal. The
right architecture for a non-technical owner is the one with the fewest moving
parts.

---

## 2026-05-25 — Phase 1 — CSP ships in Report-Only mode through Phases 1–6; enforce in Phase 7 (D-15)

**What was decided:**
The `Content-Security-Policy` header in `vercel.json` ships in **Report-Only**
mode (`Content-Security-Policy-Report-Only`) from Phase 1 through Phase 6. CSP
violation reports are POSTed to `/api/csp-report`, a thin logger endpoint added
in Phase 1. The header is **not** switched to enforce mode (the
`Content-Security-Policy` header name without `-Report-Only`) until Phase 7,
after a clean soak across the content-heavy Phases 3–6.

**Why:**
Once CSP enforce mode hits production, any inline style, third-party script, or
unexpected resource load that was not accounted for in the directive set breaks
the page silently — Safari and Chrome both refuse to load the offending
resource and the user sees a half-rendered layout. Report-Only mode logs every
violation without blocking the load, which lets us collect the actual real-
world set of inline styles, fonts, image sources, and connect-src destinations
that the live site needs. By Phase 7 we know exactly what directives are
required and can enforce with confidence — no production scramble to relax a
directive after launch.

**Teaching insight:**
Security headers are easier to ratchet UP gradually than to roll back from a
broken production page. **"Observe before enforce"** is the pattern: ship the
header in a mode that records violations but does not block them, watch the
reports across realistic usage, then flip to enforce once you have evidence
the directive set is correct. The same pattern applies to most security
controls — start in audit mode, then move to enforcement once you have data.

---

## 2026-05-25 — Phase 1 — vercel.json owns the security headers; Astro's `security.csp` config is NOT enabled

**What was decided:**
HTTP security headers (Content-Security-Policy, X-Frame-Options,
X-Content-Type-Options, Referrer-Policy, Permissions-Policy) are configured in
**`vercel.json`** at the repo root, not via Astro's built-in `security.csp`
config option in `astro.config.mjs`. The Astro option is left disabled.

**Why:**
Per RESEARCH.md Pitfall A2: Astro's `security.csp` injects CSP via a
`<meta http-equiv="Content-Security-Policy" content="...">` tag in the
document `<head>`. Three problems with that: (a) **Safari ignores `<meta>`-
delivered CSP in Report-Only mode entirely** — it only respects the HTTP
`Content-Security-Policy-Report-Only` response header — so a meta-tag-only
report-only CSP gives no Safari violation data; (b) `<meta>` tags can only
appear in static HTML responses and are absent from API responses, image
responses, and any non-HTML payload, leaving them unprotected; (c) HTTP
headers delivered via `vercel.json` apply uniformly to every response Vercel
serves, static or function, HTML or JSON. The platform-native HTTP-header path
is strictly more reliable.

**Teaching insight:**
"Use the platform" is a useful rule, but only after you check that the
platform's feature actually delivers the behavior you need across every
browser and every response type. Two equivalent-looking config options
(`astro.config.mjs` vs `vercel.json`) can have very different production
behavior. **Always confirm the delivery mechanism, not just the configured
value.**

---

## 2026-05-25 — Phase 1 — gitleaks is installed as a Go binary, NOT the npm package

**What was decided:**
The secret-scanning pre-commit hook uses **gitleaks installed as a Go binary
from `github.com/gitleaks/gitleaks/releases`**, not the npm package
`gitleaks@1.0.0`. The installation method is documented in the Phase 1
security-baseline plan and verified at first-commit time.

**Why:**
Per RESEARCH.md Pitfall A1: the npm package `gitleaks@1.0.0` is a slopsquat —
a single-version, no-stars, no-history npm package published by an account
unrelated to the real gitleaks maintainers. The legitimate gitleaks tool lives
at `github.com/gitleaks/gitleaks` and is distributed as a Go binary release.
Installing the npm package gives an attacker code execution in the project's
post-install lifecycle script every time a contributor runs `npm install`.
This is the same class of supply-chain attack as `eslint-scope` in 2018 and
the typosquatted `colors`/`faker` incidents in 2022.

**Teaching insight:**
When a planning document says "install gitleaks" (or any other tool), the
first instinct should be to **verify the source** — check the GitHub URL, the
star count, the maintainer's other work, the release history — not to assume
`npm install <name>` will resolve to the right thing. **Slopsquatting is the
supply-chain attack of the 2020s.** The npm registry has no human curation;
any name that is not already claimed can be claimed by anyone tomorrow. The
default-deny posture: install from the project's own canonical release
artifact (Go binary, GitHub release tarball, official Docker image) unless
the documentation explicitly says the npm package is the canonical
distribution.

---

## 2026-05-25 — Phase 1 — Five Zod-typed content collections with cross-collection `reference()` typing (FOUND-03, FOUND-04)

**What was decided:**
Define five Astro content collections in `src/content.config.ts`, each with a
Zod schema: `attorneys`, `practiceAreas`, `blog`, `testimonials`, `disclaimers`.
Cross-collection references use Zod's `reference()` helper — for example, a
blog post's `author` field is `reference('attorneys')`, and a practice area's
`leadAttorneys[]` array is `z.array(reference('attorneys'))`. Build fails at
compile time if a referenced slug does not exist.

**Why:**
The author of this site is a non-coding partner editing MDX files in the
GitHub web editor. Without schemas, a typo in a frontmatter field name (`autor`
instead of `author`, `published_at` instead of `publishedAt`) fails silently —
the page renders with a missing byline or a missing date and nobody notices
until a reader does. With Zod schemas attached to the collection, `astro build`
catches the typo before any preview deploy is generated, and the GitHub Actions
CI step blocks the merge. Cross-collection `reference()` catches the
adjacent error class: a blog post with `author: nir-fishbien` (a slug that
should not exist on the site) fails the build, not the render. The collection
schemas are essentially a contract enforced by the compiler instead of by a
human reviewer.

**Teaching insight:**
**Static type-checking at the content layer is the single highest-leverage
decision for a content-driven site with a non-technical author.** Every error
the schema catches is an error a human reviewer would otherwise have to catch
manually — which means an error that statistically WILL eventually slip past.
The cost (one TypeScript file with five Zod schemas) is paid once; the benefit
(every typo caught at build time) compounds across every commit forever.

---

## 2026-05-25 — Phase 1 — Tailwind v4 token names are locked across the Phase 2 palette swap (D-22)

**What was decided:**
Phase 1 ships placeholder neutral tokens in `src/styles/global.css` (a
zinc-based monochrome palette, explicitly commented `/* PLACEHOLDER — replaced
in Phase 2 */`). The Tailwind v4 `@theme` block defines a stable set of
**token names**: `--color-text`, `--color-text-muted`, `--color-bg`,
`--color-bg-elevated`, `--color-border`, `--color-accent`, `--color-accent-fg`.
Phase 2 will change the **values** of these tokens (to whatever final palette
Jon chooses from the design options) but will NOT change the names. Every
component built in Phase 1 reads these names; the palette swap is a single CSS
file edit.

**Why:**
Phase 2 needs Jon's input to lock the final color palette — we cannot front-run
that decision in Phase 1. But Phase 1 has to ship components (`BaseLayout`,
`SiteHeader`, `SiteFooter`, `Disclaimer`) and those components have to read
color values from somewhere. Locking the token NAMES while leaving the VALUES
deliberately neutral lets the scaffold ship without prejudicing Phase 2's
design decision. When the palette is chosen, only the `@theme` block changes —
no component needs editing, no PR has to touch every file.

**Teaching insight:**
When you cannot decide a design value yet, **name the slot now and fill it
later**. Stable names + late-bound values is a pattern that scales well across
many domains: feature flags, environment configs, theme tokens, A/B test
variants. The cost of choosing a name early (one minute of bikeshedding) is
much lower than the cost of swapping values across every component that
hardcoded the placeholder.

---

## 2026-05-25 — Phase 1 — The disclaimer is a single component reading from a single JSON file (D-03, D-09, D-10)

**What was decided:**
All legal disclaimers live in a single JSON file —
`src/content/disclaimers/disclaimers.json` — keyed by id (`footer`, `contact`,
`blog`, `practice-area`, `attorney`). A single `<Disclaimer id="..." />`
component reads from this file at build time and renders the matching text via
Astro Markdown rendering. The id parameter is a Zod-typed string union; if a
layout requests an id that does not exist in the JSON, **the build FAILS** —
no silent fallback to empty text.

**Why:**
California Rule 7.4 and the firm's compliance posture require legal
disclaimers on every relevant page (footer site-wide, plus specific
disclaimers on `/contact`, every blog post, every practice-area page, every
attorney profile). If the wording of any disclaimer ever needs updating — a
bar-rule change, a malpractice-insurance carrier requirement, an attorney-
advertising clarification — the update MUST propagate to every page where
that disclaimer appears. The single-source pattern means: one edit to
`disclaimers.json`, every page picks up the new text on the next build.
Without the single source, the disclaimer copy will drift — some pages will
update, others will not, and a compliance audit later will find an
inconsistent message.

The Zod-typed string union for `id` prevents the worst failure mode: a
layout requesting `<Disclaimer id="atorney" />` (typo) silently rendering
nothing. With the typed union, that typo is a build-time error, not a
silent omission on every attorney page.

**Teaching insight:**
**Compliance text is exactly the kind of content that drifts when scattered.**
The professional cost of drift (a disclaimer that's two months out of date on
the contact page) is much higher than the engineering cost of centralization
(one JSON file, one component). Whenever the same text MUST appear in
multiple places with identical wording — disclaimers, copyright notices,
trademark attributions, privacy-policy excerpts — centralize it once, then
let the build enforce that every consumer sees the same version.

---

## How to add a new entry

Each phase appends entries to this file during its build, recording the
significant architectural decisions made in that phase. The orchestrator may
automate this via the `gsd-transition` workflow.

Conventions for new entries:

1. Heading format: `## YYYY-MM-DD — Phase N — Decision title`
2. Three required sections, in order:
   - `**What was decided:**`
   - `**Why:**`
   - `**Teaching insight:**`
3. Keep the Teaching insight aimed at a non-technical reader (per
   `.claude/CLAUDE.md` HeyCounsel community-documentation requirement). The
   insight should generalize — not "we did X" but "here is the rule of thumb
   X is an instance of."
4. Newest entries at the BOTTOM of the dated section (chronological order),
   above this `## How to add a new entry` heading.
