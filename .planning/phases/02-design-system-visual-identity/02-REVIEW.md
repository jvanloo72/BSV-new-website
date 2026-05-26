---
phase: 02-design-system-visual-identity
reviewed: 2026-05-26T00:00:00Z
depth: standard
files_reviewed: 26
files_reviewed_list:
  - astro.config.mjs
  - package.json
  - src/styles/global.css
  - src/layouts/BaseLayout.astro
  - src/components/chrome/SiteHeader.astro
  - src/components/chrome/SiteFooter.astro
  - src/components/ui/Button.astro
  - src/components/ui/TextLink.astro
  - src/components/ui/Eyebrow.astro
  - src/components/sections/Hero.astro
  - src/components/sections/PracticeAreaCard.astro
  - src/components/sections/AttorneyCard.astro
  - src/components/sections/TestimonialQuote.astro
  - src/components/sections/DealsGrid.astro
  - src/components/sections/FeeStructureBand.astro
  - src/components/sections/CtaBlock.astro
  - src/components/sections/FaqAccordion.astro
  - src/pages/design-system.astro
  - tests/contrast.spec.ts
  - tests/design-tokens.spec.ts
  - tests/fonts-selfhost.spec.ts
  - tests/gallery.spec.ts
  - tests/a11y-interactions.spec.ts
  - tests/assets-budget.spec.ts
  - tests/design-route-hidden.spec.ts
findings:
  critical: 0
  blocker: 0
  warning: 6
  info: 7
  total: 13
status: issues_found
---

# Phase 2: Code Review Report

**Reviewed:** 2026-05-26
**Depth:** standard
**Files Reviewed:** 26
**Status:** issues_found

## Summary

Reviewed the Phase 2 design-system implementation: the Tailwind v4 `@theme` token
block, BaseLayout, chrome, UI primitives, the eight section components, the hidden
`/design-system` gallery, and seven Playwright specs.

Overall the token-only discipline holds well: I found **no hardcoded hex** and **no
arbitrary-value `text-[color:var(...)]`** form in any `.astro` component, **no Google
Fonts CDN reference** (font is wired through the local Astro Fonts API with CSP
`font-src 'self'`), the FaqAccordion is correctly a zero-JS native `<details>`, the
footer still renders `<Disclaimer id="footer" />` (LEGAL-01 intact), focus-visible
rings are present on every interactive element, and `@theme` comments are ASCII-only.

The findings below are genuine defects, not validation. The headline issue is a
**Tailwind transition-property collision** that silently kills the hover-lift motion
on two card components (WR-01). Several other findings concern motion-gating
inconsistencies, an SVG-into-`<Image>` mismatch, and a cluster of stale/misleading
test-header documentation that claims specs are skipped when they are not — which
will mislead the non-technical owner about what the suite actually guards.

No security vulnerabilities were found. No Critical/Blocker findings.

## Warnings

### WR-01: Duplicate `transition-*` utilities cancel the hover-lift transform

**File:** `src/components/sections/PracticeAreaCard.astro:24`, `src/components/sections/AttorneyCard.astro:29`
**Issue:** Both cards declare `transition-transform transition-shadow` on the same
element. In Tailwind v4 each of those utilities sets the **same** CSS property,
`transition-property` — `transition-transform` -> `transition-property: transform`
and `transition-shadow` -> `transition-property: box-shadow`. Because they collide on
one property, the later class wins and only `box-shadow` ends up transitioned. The
`motion-safe:hover:-translate-y-1` lift therefore **snaps instantly instead of
animating**, defeating the stated D-10 "motion-safe hover-lift" intent. The comment in
both files explicitly promises an animated lift, so the rendered behavior contradicts
the documented design.
**Fix:** Use a single combined transition declaration covering both properties:
```html
<!-- replace: transition-transform transition-shadow duration-200 ease-out -->
class="... transition-[transform,box-shadow] duration-200 ease-out
       motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-card-hover ..."
```
(or `transition` for the all-properties default). Verify the lift animates after the change.

### WR-02: SVG sources passed to Astro `<Image>` — wrong tool, mismatched aspect intent

**File:** `src/components/sections/AttorneyCard.astro:34-40`, `src/pages/design-system.astro:24-28`
**Issue:** The placeholder headshots are `.svg` files imported and handed to
`astro:assets` `<Image>` with `width={400} height={500}` and `object-cover`. Astro's
image service (sharp) does not raster-optimize SVGs; SVGs are passed through verbatim,
so the `<Image>` optimization the component comments claim ("no CLS", "processed by
`<Image>`", "Pitfall 7") does not actually apply to these assets. It happens to render
because the SVG `viewBox` is already `0 0 400 500`, but the moment a real raster
headshot (`.jpg`/`.webp`) is dropped in at a different intrinsic ratio, `object-cover`
will crop silently and the `width/height` contract becomes the only thing preventing
CLS. The risk is that the SVG path masks whether `<Image>` is configured correctly for
the real photos that replace them before launch.
**Fix:** Either (a) keep placeholders as raster (a tiny WebP monogram) so the
`<Image>` pipeline is exercised end-to-end now, or (b) explicitly document in the
component that SVG placeholders bypass sharp and add a build-time note/test asserting
the eventual real headshots are non-SVG. At minimum, confirm `astro check`/build emits
no warning for SVG-through-`<Image>` on the current Astro version.

### WR-03: Test header docs claim specs are SKIPPED, but no skip exists — suite contract is misdocumented

**File:** `tests/gallery.spec.ts:14-16`, `tests/a11y-interactions.spec.ts:15-18`, `tests/fonts-selfhost.spec.ts:13-15`, `tests/design-tokens.spec.ts:16-19`, `tests/assets-budget.spec.ts:10-16`
**Issue:** Every one of these specs carries a header block stating "SKIPPED today
because ..." plus an "UNSKIP WHEN ..." instruction, yet none of them contains
`test.skip` / `describe.skip` / `test.fixme`. The describes run unconditionally. For a
non-technical owner reading the file to understand what is guarded, this is actively
misleading: the comments assert the test is dormant when it is live (or vice-versa).
`assets-budget.spec.ts:13-14` is the worst case — it claims "the whole describe is
skipped until those assets are committed," which is false, so a reader could wrongly
believe the 200 KB budget is not yet enforced.
**Fix:** Delete the stale "SKIPPED today / UNSKIP WHEN" header blocks now that Phase 2
assets and routes exist and the tests run. Replace with a one-line statement of what
each spec currently asserts.

### WR-04: Footer comment promises "both office strings" but only one address is rendered

**File:** `src/components/chrome/SiteFooter.astro:8-10`, `:36-38`
**Issue:** The file header lists "both office strings" among the elements that "are all
preserved," and `src/lib/site.ts` defines two offices (San Francisco + Silicon Valley).
The footer renders a single `<p>`: `Silicon Valley · 555 California St., Suite 4925,
San Francisco, CA 94104` — which concatenates the Silicon Valley *label* directly onto
the *San Francisco* street address with no separator semantics, reading as one office
at the SF address. The Silicon Valley office has no address of its own here, and the
JSON-LD source (`site.ts`) carries `"TBD"` placeholders. The result is a footer line a
prospective client could read as "Silicon Valley office at 555 California St., San
Francisco" — factually wrong.
**Fix:** Render the two offices as distinct entries (e.g., two lines or a
`offices.map(...)`), and gate the Silicon Valley line until its real `streetAddress` is
confirmed rather than emitting a misleading merged string. Align with `site.ts` so the
visible footer and the JSON-LD agree.

### WR-05: `<details>` summary marker not hidden cross-browser (WebKit still shows a triangle)

**File:** `src/components/sections/FaqAccordion.astro:30`
**Issue:** The summary uses `list-none` to remove the default disclosure triangle. In
Chromium/Firefox `list-style: none` suppresses the marker, but Safari/older WebKit
renders the marker via `::-webkit-details-marker`, which `list-none` does not touch.
On those browsers a default triangle appears alongside the custom accent chevron —
two indicators, degrading the polished look the design system targets.
**Fix:** Add the WebKit pseudo-element suppression, e.g.
`[&::-webkit-details-marker]:hidden` on the `<summary>`, or a small base rule in
`global.css`: `summary::-webkit-details-marker { display: none; }`.

### WR-06: Button `type` prop is silently dropped on the anchor branch with no guard

**File:** `src/components/ui/Button.astro:14`, `:29-41`
**Issue:** `Button` accepts both `href` and `type` props. When `href` is set it renders
an `<a>` and ignores `type`; when `href` is absent it renders a `<button type={type}>`.
Nothing prevents a caller from passing `type="submit"` *with* an `href`, in which case
the submit intent is silently lost (the anchor navigates instead of submitting a form).
For the contact form in a later phase this is a latent footgun — a "submit" button that
quietly does nothing on submit. There is no type/runtime guard surfacing the
contradiction.
**Fix:** Either narrow the prop contract (a discriminated union: link variant takes
`href`, button variant takes `type`) or add a dev-time assertion/console warning when
both `href` and a non-default `type` are passed. At minimum document that `type` is
ignored when `href` is present.

## Info

### IN-01: `set:html` used for the hero SVG — safe here, but establish the boundary

**File:** `src/components/sections/Hero.astro:11`, `:57`
**Issue:** The hero inlines `hero-deal-flow.svg?raw` via `set:html`, which bypasses
Astro's HTML escaping. The source is a static, committed, hand-authored asset so there
is no injection vector today. Flagging it so the pattern is not copied to any
data-derived or user-influenced string later.
**Fix:** Keep `set:html` only for trusted static `?raw` imports; never feed it props,
content-collection data, or form input. A short comment on line 57 stating "trusted
static asset only" would lock the intent.

### IN-02: Hero/Testimonial `data-component` markers ship to production

**File:** `src/components/sections/*.astro` (all 8 carry `data-component="..."`)
**Issue:** The `data-component` attributes exist solely for the gallery test
(`gallery.spec.ts`) but render on every production page that uses these sections. Harmless,
but they leak internal component names into shipped HTML.
**Fix:** Acceptable to keep (cost is negligible). If you prefer clean output, gate them
behind `import.meta.env.DEV` or strip in a build step. Low priority.

### IN-03: `astro check` not in the `test` script or any CI gate visible here

**File:** `package.json:14`, `:27`
**Issue:** `check` (`astro check`) exists as a script but `test` only runs Playwright,
and there is no aggregate script chaining `check` + build + tests. The content-schema /
TS safety net the stack relies on won't run unless invoked explicitly.
**Fix:** Add a `verify` script (`astro check && astro build && playwright test`) and
wire it into CI so type/schema regressions fail the PR. (CI workflow was out of scope
for the listed files; confirm `.github/workflows` calls `astro check`.)

### IN-04: `lint:legal` is a no-op echo placeholder

**File:** `package.json:28`
**Issue:** `"lint:legal": "echo 'lint:legal — Phase 1 placeholder; real rules land in
Phase 4'"` always exits 0 and asserts nothing. If anything references this script as a
gate it provides false assurance.
**Fix:** Acceptable as a documented placeholder; ensure no CI step treats it as a real
check until Phase 4 implements it.

### IN-05: `design-tokens.spec.ts` asserts only the lowercased hex literal survives

**File:** `tests/design-tokens.spec.ts:26`, `:51-54`
**Issue:** The token test lowercases compiled CSS and greps for `#9a3f1a` / `#f8f5f0`.
Tailwind v4 / Lightning CSS may emit colors as `rgb(...)`, `oklch(...)`, or shorthand
under future minification settings, which would make this assertion silently pass-or-
fail on representation rather than on the token actually resolving. It is correct today
but brittle to a build-tooling change.
**Fix:** Optionally also assert the rendered computed color of a sample element, or
accept multiple representations. Low priority — note for future robustness.

### IN-06: Two near-identical animated-underline class strings duplicated

**File:** `src/components/ui/TextLink.astro:15-20`, `src/components/chrome/SiteFooter.astro:44-48`
**Issue:** The footer intake `mailto` link re-authors the exact animated-underline +
focus-ring utility chain that `TextLink` already encapsulates (differing only in
`ring-offset-bg-elevated`). Duplication invites drift if the underline treatment is
later tuned in one place but not the other.
**Fix:** Consider a `TextLink` prop for the offset surface (`ringOffset="elevated"`) and
reuse it in the footer, so the inline-link affordance has one definition.

### IN-07: Stale `/_design` route name throughout test comments

**File:** `tests/gallery.spec.ts:3`, `:53`, `tests/a11y-interactions.spec.ts:6`, `:13`, `:43`, `:48`, `tests/assets-budget.spec.ts` header, `BaseLayout.astro:16`, `design-system.astro:5`
**Issue:** Comments and assertion messages still refer to the route as `/_design`
("Components missing from /_design", "motion-safe: utility on /_design") while the
actual route — and the path the tests read — is `/design-system`. The mismatch is only
in human-facing strings, but for a non-technical owner debugging a failure the message
points at a route that does not exist.
**Fix:** Update the comment/assertion-message strings to say `/design-system` to match
the real route and the file paths already used in the specs.

---

_Reviewed: 2026-05-26_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
