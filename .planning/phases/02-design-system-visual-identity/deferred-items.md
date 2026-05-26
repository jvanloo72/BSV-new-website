# Deferred Items — Phase 02 Design System

Out-of-scope discoveries logged during execution (not fixed; tracked for later).

## 02-02

- **4 Lightning CSS "Unexpected token" optimization warnings** (build still exits 0).
  Source: Tailwind v4 scans the `.planning/*.md` design docs (02-PATTERNS.md,
  02-UI-SPEC.md, 02-CONTEXT.md, 02-03-PLAN.md) and picks up the *prose* literal
  strings `text-[color:var(--color-*)]`, `border-[color:var(...)]`,
  `bg-[color:var(...)]` from the documentation examples, generating malformed
  utility classes that Lightning CSS warns about. Pre-existing (present before
  02-02); purely cosmetic; does not affect the built CSS or any rendered page.
  Fix candidates (later): add a Tailwind `content`/source exclusion for
  `.planning/`, or escape the literals in the docs. Out of scope for 02-02
  (not caused by this slice's changes).
