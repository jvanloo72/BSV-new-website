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

## 2026-05-26 — Phase 1 — Local gitleaks pre-commit hook deferred; GitHub push protection is the sole secret-scanning layer (deviation from SEC-04 / D-17)

**What was decided:**
Skip the **local** gitleaks pre-commit hook for now. Keep GitHub server-side
push protection enabled on `jvanloo72/BSV-new-website` — that is the sole
secret-scanning layer through the rest of Phase 1 build-out. The local hook
can be added back in Phase 7 hardening if a real incident motivates it.

**Why:**
At the Wave 2 / Plan 01-06 Task 2 checkpoint Jon chose to defer the local
gitleaks install. The original SEC-04 / D-17 design called for two layers
(local pre-commit + server-side push protection) on a defence-in-depth
principle: local catches mistakes instantly with no round-trip to GitHub;
push protection catches anything the local hook missed (a fresh clone, a
`--no-verify` bypass, a different developer). Deferring the local layer
removes the "fail fast at commit time" feedback, but the more important
guarantee — that a real secret cannot reach the public repository — is
preserved by the server-side push protection layer, which cannot be
bypassed from the developer side. The trade-off is friction (an error
surfaces seconds later, on push, instead of on commit) rather than safety
loss. The Plan 00 hook scaffolding (`scripts/install-git-hooks.ps1`,
`scripts/hooks/pre-commit`, `.gitleaks.toml`) remains in the repo so a
future install is one command (`npm run install:hooks` after installing
the binary).

**Teaching insight:**
**Security controls have two job descriptions: catch the failure, and tell
you the failure happened fast.** Defence in depth usually pairs a fast
detector (the local pre-commit hook) with a strict gatekeeper (GitHub push
protection). If you have to drop one, drop the fast detector — the
gatekeeper is what actually stops the bad outcome (a secret on a public
GitHub repo). Be honest in writing about the trade-off and what you give
up; document the path back, so reinstating the dropped layer later is a
known operation, not a research project. For a non-technical reader: the
analogy is a building with both a guard at the door and an alarm at the
gate. The alarm is the loud one, but the guard is what physically stops
the intruder.

---

## 2026-05-26 — Phase 1 — Content collection asset paths use co-located src/content/ files, NOT /public absolute URLs (deviation from Plan 01-02 spec)

**What was decided:**
Placeholder content assets validated by Astro's `image()` schema helper
(currently just `placeholder-attorney-headshot.svg`) are **co-located**
with the content entry — i.e., `src/content/attorneys/placeholder-attorney-headshot.svg`,
referenced from the MDX frontmatter as `headshot: "./placeholder-attorney-headshot.svg"`.
Plan 01-02's spec had asked for the file at `public/headshots/placeholder.svg`
referenced as `/headshots/placeholder.svg`. Astro's `image()` helper rejects
`/public` absolute URLs with `ImageNotFound` because those paths bypass the
Vite asset pipeline. The `/public` copy is retained for any future
static-URL use.

**Why:**
The first `npm run build` after wiring the attorneys schema failed with
`Could not find requested image '/headshots/placeholder.svg'`. The
`image()` helper's job is to validate the file exists, compute width/height
for CLS prevention, and emit an optimized derivative (WebP/AVIF) at build
time. Files under `/public/` are served as-is and never enter Astro's asset
pipeline, so `image()` cannot see them. Co-locating the asset (or putting
it under `src/assets/`) puts it in the pipeline and the validation passes.

**Teaching insight:**
**Where a file lives in an Astro project changes what the framework can do
with it.** `public/` is "serve this raw URL exactly as-is, no
optimisation." Everything under `src/` is "treat this as a source asset
that Astro will optimise and validate." For images referenced inside
content-collection frontmatter using the `image()` schema helper, you MUST
put the file under `src/` (either co-located with the content entry or in
`src/assets/`). For attorney headshots in Phase 4, the canonical pattern
is: `src/content/attorneys/<slug>/<slug>.mdx` plus `src/content/attorneys/<slug>/headshot.jpg`
(or .png), with `headshot: "./headshot.jpg"` in the frontmatter.

---

## 2026-05-26 — Phase 2 — Visual identity locked: Direction B (near-black minimalist) + deep-rust accent, single palette (deviation from ROADMAP criterion #1)

**What was decided:**
BSV's visual identity is locked to **palette Direction B — near-black minimalist**:
warm off-white page (`#F8F5F0`), near-black text (`#111111`), graphite muted text
(`#52524E`), warm-grey borders (`#D9D2C5`), a near-white floating-card surface, and a
single **deep-rust / persimmon accent (`#9A3F1A`)** on every CTA, link, the Chambers
strip, and focus rings. Typeface: **Hanken Grotesk**, one sans for everything,
self-hosted, dramatic big-and-bold headline hierarchy. Light mode only.

Crucially, Jon chose to **lock a single palette now rather than ship 2–3 palette
variants to a Vercel preview for side-by-side comparison.** ROADMAP success-criterion
#1 for Phase 2 reads: "Jon reviews 2-3 color palette options on a Vercel preview and
confirms one." We are deliberately satisfying the *intent* of that criterion through
the A/B/C direction exploration conducted during `/gsd:discuss-phase` (Directions A
navy-lineage, B near-black, C warm-neutral; B chosen, then refined through accent and
foundation sub-choices) rather than by rendering three competing palettes on a live
preview. Jon still reviews the one chosen palette rendered on a real Vercel preview
before Phase 3 begins.

**Why:**
Presenting three fully-built palettes on a Vercel preview is meaningful when the
client has no prior direction and needs to react to finished options. Here, the
structured discussion already walked Jon through the three real directions with
rendered swatches and explicit trade-offs, and he converged decisively (including a
mid-discussion rewind from Direction C back to Direction B, which is exactly the kind
of comparison the "2-3 options" criterion exists to enable). Building two extra
throwaway palettes purely to satisfy the literal wording would add build time and
review friction for a decision already made with confidence. Recording the deviation
here — rather than silently shipping one palette — keeps the audit trail honest and
prevents the Phase 2 verification step from flagging "only one palette" as a missing
deliverable.

**Teaching insight:**
**A success criterion is a proxy for an outcome, not the outcome itself.** The real
goal behind "review 2-3 options" is *"the client makes an informed, confident color
decision and isn't surprised later."* When that goal is met by a different route, the
right move is to (a) confirm the underlying goal is genuinely satisfied, and (b)
document the deviation in writing so a future reviewer understands the criterion was
met in spirit, not skipped. The wrong moves are the two extremes: blindly building
three palettes nobody needs just to check a box, or quietly shipping one palette and
hoping no one notices the criterion said three. Name the deviation, justify it, move
on.

---

## 2026-05-26 — Phase 2 — Type scale uses 7 sizes / 4 weights: a deliberate override of the UI-checker's 4-size / 2-weight guideline

**What was decided:**
The Phase 2 design-system type scale defines **7 font-size tokens** (`display`,
`h1`, `h2`, `h3`, `body-lg`, `body`, `small`) and **4 weights** (400 / 500 / 700 /
800). The automated UI design-contract checker flags any scale with more than 4 sizes
or more than 2 weights as a blocking issue. We are **consciously overriding** that
guideline for this phase and accepting the 7-size / 4-weight scale, recorded in
`02-UI-SPEC.md` under "Documented threshold override."

**Why:**
The checker's 4-size / 2-weight cap is a good rule for a *single application screen*,
where extra sizes and weights usually signal undisciplined "visual noise." Phase 2 is
a different animal: it is the phase whose entire job is to define the **canonical,
reusable type scale for a whole multi-page marketing site**. A real design system needs
a hero display size, two-to-three heading levels, one or two body sizes, and a small/
label size — that is six or seven steps by nature. The firm's locked design decisions
demand it explicitly: CONTEXT.md **D-08** calls for a "dramatic, big-and-bold headline
hierarchy … strong size jumps between heading levels," and **D-05** says "hierarchy
comes from size + weight + spacing." Collapsing to four sizes and two weights to satisfy
the checker would directly violate both locked decisions and produce a worse result.
Crucially, the scale is still *disciplined*: it is a closed set (no ad-hoc sizes),
weights are restricted to 400/500/700/800 with an explicit prohibition on 600/300, and
body line-height stays generous — so this is a controlled system, not the noise the rule
was written to catch.

**Teaching insight:**
**An automated quality gate encodes a heuristic, not a law — and heuristics have a
domain where they apply.** The "4 sizes / 2 weights" rule is sound for app UI but
category-inappropriate for the deliverable "design a type system." The right response
to a gate firing against intent is not to silently disable the gate, and not to mangle
the work to satisfy it — it is to (1) confirm the work is genuinely correct for its
context, (2) write down *why* the rule doesn't apply here, citing the governing
decisions, and (3) record the override so the next reviewer sees a justified exception,
not an unexplained breach. This is the same move as the single-palette deviation logged
earlier today: name it, justify it against the locked decisions, move on. A gate you can
reason about and override with documentation is a healthy gate; a gate you either obey
blindly or rip out is not.

---

## 2026-05-26 — Phase 3 — Homepage named deals cleared for publication via the disclosure register (D-04)

**What was decided:**
The homepage's named client-deal copy is cleared for public publication and
recorded in `.planning/CLIENT_DISCLOSURE_CLEARANCE.md`, attributed to **Jon Van
Loo (approving partner) on 2026-05-26**. The cleared items are: the
Athelas–Commure merger ($6B), the Mode Analytics sale ($200M), the Illumina
defense against Roche's $6.4B hostile bid (Roche recorded as a cleared
counterparty), the representative-parties list (Adobe, Oracle, PayPal, Dell,
eBay, Coinbase), and the Daniel Brian (GC, Commure, Inc.) testimonial with its
verbatim quote. Each row constrains the contexts in which the name may appear.
This clearance also **unblocks the Phase 4 clearance gate** for these same items.

**Why:**
Under California Rules of Professional Conduct 1.6 (confidentiality) and 7.4
(communication of fields of practice), no client name, counterparty name, or
identifying deal detail may appear on the public site unless an approving partner
has signed off. Most of these deals are already public record (closed mergers,
SEC filings, a public hostile-bid defense), and the testimonial was given for
publication — but the controlling rule is not "is it public?" alone; it is
"has the firm recorded a partner's authorization to use it?" Recording the
sign-off in the register *before* the homepage task publishes the names makes
the gate structural rather than a matter of memory.

**Teaching insight:**
**A confidentiality control only works if it sits in the path of the action it
governs.** The clearance register is sequenced ahead of the homepage-composition
task on purpose: a name cannot ship until its row exists with a named partner and
a date. This turns "remember to check whether we're allowed to say this" — a
human step that eventually gets skipped under deadline — into a structural gate a
reviewer can verify in seconds by opening one file. For any rule that carries
professional or legal consequence, build the check into the workflow's order of
operations, not into someone's diligence.

---

## 2026-05-27 — Phase 3 — Palette shifted from warm Direction-B to cool near-black minimalist (D-32)

**What was decided:**
The site's color palette moved from the warm "Direction B" scheme (a bone-white
`#F8F5F0` background, warm beige borders, a warm-grey muted text) to a cooler,
starker near-black minimalist scheme: a pure-white `#FFFFFF` background and
elevated surface, cool-neutral `#E4E4E7` borders, cool-grey `#52525B` muted text.
The deep-rust accent stays for links, eyebrows, and quiet tints (its exact hex was
set to `#9C3F2A`). Primary action buttons changed from a rust fill to a near-black
`#0A0A0A` fill with white text, via two new tokens (`--color-primary`,
`--color-primary-fg`). All changes were value-only — no token was renamed — so the
swap touched one CSS file plus the button variant, and three guardrail tests
(contrast, compiled-token, and the contrast ratios) were updated in lockstep.

**Why:**
Jon asked to cool the look toward a sharper, more modern minimalist register. The
warm palette read more traditional; pure white + near-black + a single rust accent
is the cleaner, more contemporary direction (closer to the original Direction-B
intent of near-black minimalism, now executed coolly). Reserving rust for accents
and using near-black for the primary button keeps the one bold color rare enough to
stay special. The WCAG AA contrast test was re-run and every text/button pairing
still clears the 4.5:1 floor (the new primary button label clears 19.8:1).

**Teaching insight:**
**Name your design choices once, in one place, and a restyle becomes a find-and-replace
instead of a renovation.** Because the colors were defined as named tokens (a "bg"
color, an "accent" color) rather than sprinkled as raw hex codes throughout dozens of
pages, changing the entire site's mood was a handful of edits in a single file. The
lesson generalizes beyond color: when something might change later, give it one
authoritative definition and have everything else refer to that definition by name.

---

## 2026-05-27 — Phase 3 — BSV is a virtual firm with no physical offices (D-33)

**What was decided:**
Every reference to a physical office was removed: the former Silicon Valley office
and the "555 California St., Suite 4925" San Francisco address are gone from the
footer, the About page, the shared firm-data file, and the LegalService structured
data. The public site now says only "Based in San Francisco." The structured data
(the machine-readable block search engines read) carries a city-level address —
San Francisco, CA, US — with no street address or postal code.

**Why:**
The firm has no leased offices; publishing a street address would be inaccurate, and
an inaccurate address on a law firm site is a real credibility and client-trust
problem. A city-level location is honest, still useful for local search, and valid
structured data (search engines accept a city + region without a street). The About
page now frames the virtual model as a client benefit — lower overhead, partners who
work wherever the deal needs them.

**Teaching insight:**
**Keep facts about the firm in one place so a correction lands everywhere at once.**
The address lived in a single firm-data file that the footer, the About page, and the
structured data all read from — so removing the offices was one edit that propagated
to every page automatically, with no risk of a stale address surviving on some page
nobody remembered to check. Anything that is both factual and repeated across a site
should have exactly one source of truth.

---

## 2026-05-27 — Phase 3 — Chambers recognition shown as the real badge image, not text (D-34)

**What was decided:**
The "Chambers USA — Spotlight 2026" text strip on the homepage was replaced with the
firm's actual Chambers badge image (downloaded from the current bsvlaw.com site). It
renders through Astro's image component, which automatically produced small optimized
WebP versions (6–15 KB) from the 57 KB source — well under the 200 KB per-asset budget
— and sets fixed dimensions so the page does not visibly jump as the image loads. The
badge has descriptive alt text ("Chambers USA Spotlight 2026") for screen readers and
is not a link.

**Why:**
A real, recognizable award badge carries more credibility at a glance than a line of
text — readers recognize the Chambers mark. Keeping it non-linked matches the intent
that the recognition is quiet proof, not a call to action.

**Teaching insight:**
**Let the build tool do the image work.** Rather than hand-shrinking the badge, the
image was handed to the framework's image component, which generated the right small,
modern formats automatically and reserved the correct space on the page to prevent
layout shift. Manual image optimization is easy to get wrong and forget; a build step
that does it on every image is reliable and frees the author to just drop in the
original file.

---

## 2026-05-27 — Phase 3 — Chambers recognition moved high on the homepage (D-35)

**What was decided:**
The Chambers badge was moved from just above the footer CTA to high on the homepage —
the third block, right after the BSV Approach band — enlarged to ~240px and set to
load eagerly (since it now sits near the top of the page).

**Why:**
Jon wanted the recognition clearly visible without scrolling. A credibility signal
buried near the footer does little work; near the top it reassures a prospective
client early.

**Teaching insight:**
**Put your strongest trust signal where the reader is, not where it's tidy.** The most
persuasive proof should appear at the moment a visitor is deciding whether to keep
reading — usually near the top — even if a neater layout would tuck it away.

---

## 2026-05-27 — Phase 3 — About page stays silent on the office/virtual arrangement (D-36)

**What was decided:**
The About page no longer describes the firm as "virtual" or explains that it has no
physical offices. The "Where we work" section shows only "Based in San Francisco."
plus a neutral line about the industries served and being reachable by phone/email.

**Why:**
Jon preferred not to characterize the firm's office arrangement on the About page at
all. Saying nothing is cleaner than either claiming offices or explaining their absence.

**Teaching insight:**
**You are allowed to simply not address a topic.** Silence is a valid editorial choice —
not every fact about the firm needs a sentence, and omitting a point is often stronger
than explaining it.

---

## 2026-05-27 — Phase 3 — Full firm address restored to the footer on every page (D-37, supersedes D-33)

**What was decided:**
The footer on every page now shows the firm's full mailing address —
"555 California St., Suite 4925, San Francisco, CA 94104" — instead of "Based in San
Francisco." This reverses the D-33 address removal. "Based in San Francisco." remains
only in the About-page body copy. The machine-readable LegalService data was updated to
carry the same full address so the visible footer and the structured data match.

**Why:**
Jon directed that the real address appear site-wide in the footer. For a law firm,
search engines reward a consistent name/address/phone ("NAP") shown both to humans and
in structured data, so both were aligned to the same full address.

**Teaching insight:**
**A business's name, address, and phone should read identically everywhere — on the page
and in the hidden data search engines read.** Inconsistent address details across a site
dilute local-search trust; one source of truth feeding both keeps them in lockstep.

---

## 2026-05-27 — Phase 3 — Chambers badge recolored black for the white page (D-38, refines D-34/D-35)

**What was decided:**
The Chambers badge artwork is white-on-transparent and was invisible on the white page.
A black version was generated from the original by inverting only the color channels
(preserving transparency), and the strip now shows that black badge directly on the
normal white background — the earlier dark band behind it was removed. A muted
"Recognized by" label sits above it.

**Why:**
The recognition has to actually be seen. Recoloring the mark to black is the simplest
fix that keeps it on-brand with the rest of the white, minimalist page rather than
introducing a dark band.

**Teaching insight:**
**Match the asset to the surface, not the surface to the asset.** When a supplied image
fights the page, it is usually cheaper and cleaner to adapt the image (here, recolor it)
than to bend the whole layout around it.

---

## 2026-05-28 — Phase 5 — Rule 7.4 lint and client-disclosure clearance gate removed (descopes LEGAL-03, LEGAL-04)

**What was decided:**
The two pre-publish automated guards added in Phase 4 — `npm run lint:legal`
(a Rule 7.4 banned-term scanner over `src/content/**/*.mdx`) and the
`.planning/CLIENT_DISCLOSURE_CLEARANCE.md` register gate — are removed
entirely from the project. Files deleted: `scripts/lint-legal.mjs`,
`tests/lint-legal.spec.ts`, `tests/_fixtures/lint-legal-violation.mdx`,
`tests/clearance.spec.ts`, `.planning/CLIENT_DISCLOSURE_CLEARANCE.md`. Build
hooks (`prebuild`) and CI step that ran `lint:legal` removed.
REQUIREMENTS.md LEGAL-03 and LEGAL-04 deleted; LEGAL-09 reworded to drop
its reference to `lint:legal` — it is now satisfied by the per-post
disclaimer alone (auto-rendered by `BlogPostLayout`). Client-name
disclosure decisions move to manual review by Jon (attorney of record)
before publish.

**Why:**
Jon decided the automated guards were not pulling their weight. The
banned-term list was a coarse filter for context-free string matches —
substantive Rule 7.4 / Rule 7.1 compliance requires the lawyer's judgment
on each post anyway. The clearance register added bookkeeping overhead
without changing the reviewing-lawyer's decision flow. Manual review,
which was always the substantive gate, is now also the operational gate.

**Teaching insight:**
**Automated pre-publish checks earn their keep only when they catch
something the human reviewer would miss.** A scanner that matches strings
without context (like a banned-word list) duplicates the human's eye
without sharpening it. A register that the human has to keep in sync with
the content (like a clearance roster) creates two sources of truth where
one would do. When the human review is non-negotiable anyway, the
automation should either be precise enough to flag something a human eye
would skim past, or it should not be in the workflow at all.

---

## 2026-05-28 — Phase 5 — Attorney-advertising notation moved to a linked disclosure page (Kirkland pattern)

**What was decided:**
The two-sentence attorney-advertising disclosure — "Attorney advertising.
Prior results do not guarantee a similar outcome." — is no longer rendered
in the site-wide footer disclaimer. The footer disclaimer was trimmed to
its three core sentences. A dedicated page at `/attorney-advertising` was
created with the full disclosure: "Some of the content on this site is
considered Attorney Advertising under the applicable rules of the State
of California. Prior results do not guarantee a similar outcome." Every
page now carries a small "Attorney Advertising" link in the footer-nav
row (alongside "About") pointing to that page. The disclaimer-crawl
Playwright test was updated accordingly: it now asserts (a) the trimmed
footer fragment appears on every route, (b) the legacy AA text is ABSENT
from every footer, and (c) the "Attorney Advertising" footer link is
present on every page. REQUIREMENTS.md LEGAL-01 was amended to note the
linked-disclosure change; LEGAL-05 was marked complete (was Phase 7 /
Pending; now Phase 5 / Complete). ROADMAP Phase 7 success criterion 5 was
re-worded to reflect that the AA page already exists.

**Why:**
Top-tier U.S. law firms (Kirkland & Ellis is the canonical reference)
serve the disclosure at a dedicated linked page rather than carrying the
notation in every page's footer. The compliance contract is the same — a
visitor on any page can reach the disclosure in one click — but the
chrome on every page reads as a firm's voice rather than a regulatory
footnote. For BSV, whose lead message is "Team work to get good results,"
a quieter footer reinforces the brand. The legal substance is unchanged:
the disclosure is still discoverable from every page (one tab away), and
California's rules speak to the disclosure existing on the website, not
to where exactly the words live.

**Teaching insight:**
**Where a disclosure lives is a design decision; whether the disclosure
exists is the compliance one.** When a regulatory rule says "the website
must carry an attorney-advertising disclosure," it speaks to the website,
not to every page. Linking from every page to one canonical disclosure
satisfies the rule and frees the per-page chrome to do its real job:
help the visitor understand who you are and what you do. The trade-off
is that the disclosure is one click away rather than zero — acceptable
when (a) the link is prominent enough to find without effort and (b) the
disclosure page itself is short, plain, and the content the visitor was
not looking for.

---

## 2026-05-28 — Phase 5 — Footer redesign: site-wide disclaimer retired in favor of four linked pages

**What was decided:**
The site-wide footer was redesigned: the inline `<Disclaimer id="footer" />`
render was removed entirely, and the `id: 'footer'` entry was deleted from
`src/content/disclaimers/disclaimers.json` and from the `DisclaimerId`
enums in `src/content.config.ts` and `src/components/legal/Disclaimer.astro`.
The general-disclaimer text moved to a new `/legal-notices` page; the
attorney-advertising notation moved to the new `/attorney-advertising`
page (already created earlier the same day); a new `/privacy` page was
scaffolded as a draft Privacy Policy for Jon's review. The footer now
shows: the BSV wordmark, the firm's full mailing address, a "Contact Us:"
email line linking to `info@bsvlaw.com`, a centered link row to all four
firm-info pages (`About · Attorney Advertising · Privacy Policy ·
Legal Notices`), and the copyright at the very bottom — all centered.
The disclaimer-crawl Playwright test now asserts the four-link contract
on every sitemap route (no longer asserts any footer-disclaimer text
fragment); `baselayout.spec.ts` mirrors the same change. Per-page
disclaimers (blog, practice-area, attorney, contact) are unaffected and
remain independently tested. LEGAL-01 amended; LEGAL-05 unchanged
(already complete via the linked-disclosure pattern).

**Why:**
Two reasons. First, applying the Kirkland linked-disclosure pattern to
the general disclaimer (not just the attorney-advertising notation)
keeps the footer chrome consistent — all four legal/firm-info surfaces
are reached by the same row of links. Second, the redesign decouples
the substance of each disclosure from where it lives — adding a Privacy
Policy in this turn was cheap because the linked-page pattern was
already established for the AA notation. The general-disclaimer move
also unifies how the disclaimer-crawl test thinks about compliance:
"on every page, the linked footer surfaces are reachable" is a cleaner
contract than "on every page, this exact text appears verbatim in the
footer."

**Teaching insight:**
**A pattern earns its keep by getting reused.** Linking to a single
disclosure page from every footer was already the right answer for
attorney advertising. Once that pattern existed, extending it to the
general disclaimer and the privacy policy was a small edit — and the
test contract collapsed from "every footer carries this text" to
"every footer carries these links," which is easier to reason about
and harder to silently regress. When you find yourself adding a second
exception to a rule, it's worth asking whether the rule was right.

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
