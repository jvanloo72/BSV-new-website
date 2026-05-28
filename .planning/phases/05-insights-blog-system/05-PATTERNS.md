# Phase 5: Insights (Blog) System - Pattern Map

**Mapped:** 2026-05-28
**Files analyzed:** 13 (4 new, 8 edited, 1 deleted)
**Analogs found:** 13 / 13 (100% — every Phase 5 surface has a Phase 1/2/3/4 precedent)

## File Classification

| New / Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/lib/jsonld.ts` (EDIT — implement `buildArticleLd`) | utility (JSON-LD builder) | transform (entry → typed object) | `src/lib/jsonld.ts` `buildPersonLd` + `buildFaqPageLd` (same file) | exact (same file, same return shape) |
| `src/layouts/BlogPostLayout.astro` (EDIT — extend signature, add chrome) | layout | request-response (props → SSR HTML) | `src/layouts/AttorneyLayout.astro` | exact (per-entry layout with slot-transferred per-page JSON-LD + disclaimer) |
| `src/pages/blog/[slug].astro` (EDIT — resolve author ref) | route (dynamic) | request-response (`getStaticPaths` → page) | `src/pages/practice-areas/[slug].astro` | exact (string-slug param + entry prop pattern) + `PracticeAreaLayout`'s `getEntries(leadAttorneys)` for the ref-resolution shape |
| `src/pages/blog/index.astro` (EDIT — chips + list rendering) | route (index) | request-response (`getCollection` → page) | `src/pages/practice-areas/index.astro` (read + render shape) + existing empty-state branch in same file (preserve) | exact (single-collection index w/ filter-not-yet pattern) |
| `src/pages/blog/rss.xml.ts` (NEW) | route (static endpoint) | transform (collection → XML body) | `src/pages/robots.txt.ts` (the only existing `.ts` endpoint) | role-match (static-text-endpoint pattern; payload differs) |
| `src/components/sections/AuthorCard.astro` (NEW) | component (section) | transform (attorney entry → display block) | `src/components/sections/AttorneyCard.astro` | exact (image + name + role + focus + accent CTA on a `bg-bg-elevated` card) |
| `src/components/sections/FilterChipRow.astro` (NEW) | component (section) | request-response (props → `<a>` chip list) | `src/components/ui/Button.astro` (chip-state styling vocab) + `src/components/sections/PracticeAreaCard.astro` (data-component marker convention) | role-match (no chip primitive exists; Button supplies the focus/hover/min-44px pattern, AttorneyCard/PracticeAreaCard supply the rounded-card+border vocabulary) |
| `src/styles/global.css` (EDIT — append `.prose-bsv` block) | config (CSS tokens) | n/a | existing `@theme` block + `@layer base` block in same file | exact (append to same file; reuse named tokens — no new tokens) |
| `src/content.config.ts` (EDIT — Zod `.refine()` for cover/coverAlt) | config (schema) | n/a (schema enforcement) | existing `blog` collection in same file | exact (modify existing collection definition; same Zod pattern as other collections) |
| `src/content/blog/<seed-post>.mdx` (NEW) | content (MDX) | n/a (build-time data) | `src/content/attorneys/<author>.mdx` (frontmatter + draft pattern) | role-match (Markdown content with attorney-reference frontmatter; verbatim Jon-content + draft:true seed pattern from Phase 4 Susan Jiang) |
| `src/content/blog/placeholder-post.mdx` (DELETE) | content (MDX) | n/a | n/a | n/a (removed when seed post lands) |
| `tests/article-jsonld.spec.ts` (NEW) | test | n/a (build + parse `dist/`) | `tests/person-jsonld.spec.ts` | exact (build-in-beforeAll + cheerio JSON-LD parse + per-slug shape assertions) |
| `tests/rss-feed.spec.ts` (NEW) | test | n/a (build + parse XML) | `tests/jsonld-legalservice.spec.ts` (build-in-beforeAll pattern) + `tests/disclaimer-set.spec.ts` (file-fs read of build output) | role-match (build-then-read pattern; XML parse instead of JSON/HTML) |
| `tests/blog-filter.spec.ts` (NEW) | test | n/a (Playwright nav + DOM) | `tests/a11y-interactions.spec.ts` (live nav test) | role-match (Playwright with URL navigation + DOM assertions) |
| `astro.config.mjs` (EDIT — rehype-external-links plugin) | config | n/a | existing integrations block in same file | exact (additive `integrations:` edit) |
| `package.json` (EDIT — new deps + scripts) | config | n/a | existing deps + Phase 4 test scripts | exact |

---

## Pattern Assignments

### `src/lib/jsonld.ts` — `buildArticleLd()` (utility, transform)

**Analog:** `src/lib/jsonld.ts` (same file) — `buildPersonLd()` lines 62-88, `buildFaqPageLd()` lines 94-109

**Imports pattern** (lines 10-18 — already present, do not duplicate):

```typescript
import type { CollectionEntry } from 'astro:content';
import type {
  Article,
  FAQPage,
  LegalService,
  Person,
  WithContext,
} from 'schema-dts';
import { SITE } from './site';
```

> `Article` is already in the type-only import list — no edit needed there.

**Core builder pattern** (copy shape from `buildPersonLd`, lines 62-88):

```typescript
export function buildPersonLd(
  attorney: CollectionEntry<'attorneys'>,
): WithContext<Person> {
  const d = attorney.data;
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: d.name,
    jobTitle: d.title,
    url: `${SITE.baseUrl}/attorneys/${d.slug}`,
    worksFor: {
      '@type': 'Organization' as const,
      name: SITE.name,
      url: SITE.baseUrl,
    },
    // ...
  };
}
```

> Apply to `buildArticleLd`:
> - Signature: `buildArticleLd(post: CollectionEntry<'blog'>, author: CollectionEntry<'attorneys'>): WithContext<Article>` — pass `author` in resolved (not via `getEntry` inside the builder; keep the builder pure, mirror how `buildPersonLd` takes a resolved entry).
> - First line: `const d = post.data;` — match the `const d = entry.data;` pattern used by both `buildPersonLd` and `AttorneyLayout`.
> - Nested object literals use `as const` on `'@type'` (e.g., `'@type': 'Person' as const`) — required by `schema-dts` types. See `buildLegalServiceLd` lines 30, 46 and `buildPersonLd` lines 73, 77.
> - URL construction reuses `SITE.baseUrl` (never hardcode `https://bsvlaw.com`); see line 71 (`${SITE.baseUrl}/attorneys/${d.slug}`) — Article's `mainEntityOfPage` should follow the same template: `${SITE.baseUrl}/blog/${d.slug}`.

**Replace the throwing stub at lines 111-116:**

```typescript
/* Phase 5 implements: takes a blog post CollectionEntry, returns a
 * WithContext<Article>. Slot-transferred into BlogPostLayout.
 */
export function buildArticleLd(_post: unknown): WithContext<Article> {
  throw new Error('buildArticleLd not implemented until Phase 5');
}
```

> Replace with the real implementation per UI-SPEC Article JSON-LD table (lines 491-509). Keep the comment header style, drop the `_post: unknown` and the throw.

**Critical D-02 carry-over:** `buildPersonLd` deliberately omits `sameAs` (no fabricated profile URLs — see comment at lines 60-61 and the `// NB: no sameAs` note at line 87). `buildArticleLd` follows the same rule — never fabricate `image`. If `post.data.cover` is absent, fall back to `${SITE.baseUrl}/og-default.png` (an existing site asset) — do not invent a Pexels/Unsplash URL.

---

### `src/layouts/BlogPostLayout.astro` (layout, request-response)

**Analog:** `src/layouts/AttorneyLayout.astro` (the closest exact match — per-entry layout with slot-transferred per-page JSON-LD + disclaimer at bottom). Secondary: `src/layouts/PracticeAreaLayout.astro` (for the ref-resolved-in-parent pattern context).

**Imports pattern** (copy from `AttorneyLayout.astro` lines 1-8):

```astro
---
import BaseLayout from './BaseLayout.astro';
import Disclaimer from '../components/legal/Disclaimer.astro';
import JsonLd from '../components/seo/JsonLd.astro';
import DealsGrid from '../components/sections/DealsGrid.astro';
import { buildPersonLd } from '../lib/jsonld';
import { Image } from 'astro:assets';
import type { CollectionEntry } from 'astro:content';
```

> For BlogPostLayout, drop `DealsGrid`, add `AuthorCard`, swap `buildPersonLd` → `buildArticleLd`:
> ```astro
> import BaseLayout from './BaseLayout.astro';
> import Disclaimer from '../components/legal/Disclaimer.astro';
> import JsonLd from '../components/seo/JsonLd.astro';
> import AuthorCard from '../components/sections/AuthorCard.astro';
> import { buildArticleLd } from '../lib/jsonld';
> import { Image } from 'astro:assets';
> import type { CollectionEntry } from 'astro:content';
> ```

**Props signature pattern** (AttorneyLayout lines 18-25):

```astro
interface Props {
  attorney: CollectionEntry<'attorneys'>;
}

const { attorney } = Astro.props;
const d = attorney.data;
const title = `${d.name} — BSV Law`;
const description = d.focus;
```

> Apply to BlogPostLayout. **The signature change is consequential (Pitfall 4):** replace existing `{ post }` with `{ post, author }`:
> ```astro
> interface Props {
>   post: CollectionEntry<'blog'>;
>   author: CollectionEntry<'attorneys'>;
> }
> const { post, author } = Astro.props;
> const title = `${post.data.title} — BSV Insights`;
> const description = post.data.summary;
> ```

**Slot-transferred JSON-LD pattern** (AttorneyLayout line 35 — THE canonical Phase 4 example):

```astro
<BaseLayout title={title} description={description}>
  <JsonLd slot="head" data={buildPersonLd(attorney)} />
  <article class="bg-bg py-section">
    ...
```

> Apply verbatim with `buildArticleLd(post, author)` and pass through `<slot />` for the body. **Do NOT touch `BaseLayout.astro` (Pitfall: FOUND-10 / D-11 explicit ban).** The `<slot name="head" />` in BaseLayout line 48 already accepts the projection.

**Disclaimer pattern** (AttorneyLayout line 159; existing in current BlogPostLayout line 29 — preserve):

```astro
  <Disclaimer id="attorney" />
</BaseLayout>
```

> BlogPostLayout already renders `<Disclaimer id="blog" />` (line 29). **Keep it as the last child before `</BaseLayout>`** — do not move it inside `<article>`.

**Page chrome pattern** (AttorneyLayout lines 34-58 — the `<article>` + `mx-auto max-w-Xx px-gutter py-section` shell):

```astro
<BaseLayout title={title} description={description}>
  <JsonLd slot="head" data={buildPersonLd(attorney)} />
  <article class="bg-bg py-section">
    <div class="mx-auto max-w-4xl px-gutter">
      <header class="flex flex-col gap-6 sm:flex-row sm:items-center">
        <Image src={d.headshot} alt={d.headshotAlt} width={120} height={120} ... />
        <div>
          <h1 class="text-h1 font-bold text-text">{d.name}</h1>
          <p class="mt-1 text-body-lg text-text-muted">{d.title}</p>
```

> For BlogPostLayout, swap `max-w-4xl` → `max-w-prose` (UI-SPEC locked), drop the headshot from the header (it lives in AuthorCard below), render H1 + byline. The full target structure is pinned in UI-SPEC lines 325-368.

**Author-link styling** (AttorneyLayout line 50-56 — accent + underline TextLink shape):

```astro
<a href={`mailto:${d.email}`} class="text-body font-medium text-accent underline">
  {d.email}
</a>
```

> Reuse this className shape on the byline author link: `class="font-medium text-accent underline"` plus `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-xs`. **PracticeAreaLayout lines 95-99 show the same vocabulary on a profile-link:**
>
> ```astro
> <a href={`/attorneys/${lead.data.slug}`} class="font-medium text-accent underline">
>   {lead.data.name}
> </a>
> ```

**Prose body wrapper pattern** (AttorneyLayout line 151):

```astro
<div class="prose mt-10 max-w-none text-body text-text">
  <slot />
</div>
```

> Apply with the new `.prose-bsv` modifier:
> ```astro
> <div class="prose prose-bsv mt-10 max-w-none text-body text-text">
>   <slot />
> </div>
> ```

---

### `src/pages/blog/[slug].astro` (route, request-response)

**Analog:** `src/pages/practice-areas/[slug].astro` (lines 1-20) — exact same `getStaticPaths` shape. Secondary: `PracticeAreaLayout.astro` line 33 — for the `getEntries`/`getEntry` ref-resolution shape that this page needs to adopt.

**Current pattern** (existing `src/pages/blog/[slug].astro` lines 1-20):

```astro
---
import { getCollection, render } from 'astro:content';
import BlogPostLayout from '../../layouts/BlogPostLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((entry) => ({
    params: { slug: entry.data.slug }, // STRING — Astro 6 requires (FOUND-10 / Pitfall 12)
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);
---

<BlogPostLayout post={entry}>
  <Content />
</BlogPostLayout>
```

> **Keep `getStaticPaths` exactly as-is** — the string-slug pattern is FOUND-10 / Pitfall 6 / Pitfall 12 territory; the comment at line 8 must remain. **Add `getEntry` + pass `author`** after line 14.

**Reference-resolution pattern** (from `PracticeAreaLayout.astro` lines 11, 33):

```astro
import { getCollection, getEntries } from 'astro:content';
// ...
const leads = await getEntries(d.leadAttorneys);
```

> For a single-ref field (blog's `author` is `reference('attorneys')`, not an array), use `getEntry` instead. The target edit:
>
> ```astro
> import { getCollection, getEntry, render } from 'astro:content';
> import BlogPostLayout from '../../layouts/BlogPostLayout.astro';
>
> export async function getStaticPaths() {
>   const posts = await getCollection('blog', ({ data }) => !data.draft);
>   return posts.map((entry) => ({
>     params: { slug: entry.data.slug }, // STRING — Astro 6 requires (FOUND-10 / Pitfall 12)
>     props: { entry },
>   }));
> }
>
> const { entry } = Astro.props;
> const author = await getEntry(entry.data.author);
> if (!author) throw new Error(`Blog post '${entry.data.slug}' references unknown author`);
> const { Content } = await render(entry);
> ---
>
> <BlogPostLayout post={entry} author={author}>
>   <Content />
> </BlogPostLayout>
> ```

**Draft-filter pattern** (line 6) — already correct. The placeholder-post.mdx stays `draft: true` so it never enters the `getStaticPaths` enumeration; that means Zod never validates its bogus `author: "placeholder-attorney"` reference. Do not change the filter; do not change the placeholder until the seed-post commit deletes it (Pitfall 9 from RESEARCH).

---

### `src/pages/blog/index.astro` (route, request-response)

**Analog:** `src/pages/practice-areas/index.astro` (read + render shape) + existing `src/pages/blog/index.astro` (preserve the empty-state branch verbatim).

**Existing pattern to preserve** (current `src/pages/blog/index.astro` lines 1-47):

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Button from '../../components/ui/Button.astro';

const posts = await getCollection('blog', ({ data }) => !data.draft);
---

<BaseLayout title="..." description="...">
  <section class="mx-auto max-w-3xl px-gutter py-section">
    <h1 class="text-h1 font-bold text-text">Insights</h1>
    {posts.length === 0 ? (
      <div class="mt-6">
        <p class="text-body-lg text-text-muted">
          Insights are on the way — practical analysis from the BSV team on
          M&amp;A, IP, and tax for the companies building what&rsquo;s next.
          Check back soon.
        </p>
        ...
        <Button variant="primary" href="/contact" label="Get in touch" />
      </div>
    ) : (
      <ul class="mt-6 space-y-3">...
```

> **Preserve** lines 19-34 (the `posts.length === 0` branch — header, two `<p>`s, Get in touch CTA — verbatim per UI-SPEC table line 188-197). **Replace** the `else` arm (lines 35-44) with the full chip-rows + post list + empty-filtered-state branch from UI-SPEC lines 388-417.

**Reference-resolution-in-index pattern** (from `PracticeAreaLayout.astro` line 33; same applies in this index now that we render `author.data.name` and `practiceArea.data.name`):

```astro
const leads = await getEntries(d.leadAttorneys);
```

> The index needs author + practiceArea names resolved per post. Resolve once over the whole collection, then map per item:
>
> ```astro
> const posts = await getCollection('blog', ({ data }) => !data.draft);
> const postsWithRefs = await Promise.all(posts.map(async (post) => ({
>   post,
>   author: (await getEntry(post.data.author))!,
>   practiceArea: (await getEntry(post.data.practiceArea))!,
> })));
> // Then sort by publishedAt DESC for stable list order:
> postsWithRefs.sort((a, b) => +b.post.data.publishedAt - +a.post.data.publishedAt);
> ```

**Empty-state branch as a template for empty-filtered-state** (existing index lines 19-34 already proves the warm-tone pattern from Phase 3):

```astro
<div class="mt-6">
  <p class="text-body-lg text-text-muted">...warm copy...</p>
  <p class="mt-4 text-body text-text-muted">...</p>
  <Button variant="primary" href="/contact" label="Get in touch" />
</div>
```

> Apply the **same warmth** to the empty-filtered-state div (UI-SPEC lines 408-414): role="status" aria-live="polite", an `<h2 class="text-h3">`, a `<p class="text-body text-text-muted">`, and an inline TextLink reset link to `/blog`. **No Button** in the empty-filtered branch — UI-SPEC line 208 explicitly forbids it ("an extra button would suggest something went wrong, which it didn't").

---

### `src/pages/blog/rss.xml.ts` (NEW — route/static endpoint, transform)

**Analog:** `src/pages/robots.txt.ts` — the only existing `.ts` static endpoint in the codebase.

**Endpoint signature pattern** (`robots.txt.ts` lines 13-26 — full file):

```typescript
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = new URL('sitemap-index.xml', site).href;

  const body = `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
```

> **Copy the `export const GET: APIRoute = ({ site }) => { ... }` signature.** The `site` field comes from `astro.config.mjs` (`site: 'https://bsvlaw.com'`) — same source the JSON-LD builders use via `SITE.baseUrl`. The RSS endpoint can use `context.site` directly (typed `URL | undefined`) or import `SITE` from `../../lib/site` — prefer `context.site` to match `robots.txt.ts`'s pattern.
>
> The RSS endpoint diverges in payload: instead of returning a hand-built string, it returns the result of `rss({ ... })` from `@astrojs/rss` (which itself returns a `Response`). The full target shape is pinned in RESEARCH lines 451-498 (Pattern 5). The two divergences from `robots.txt.ts`:
> 1. `async function GET` (because `getCollection` and the Container API are async).
> 2. Return value is `rss(...)` (a Response factory) instead of `new Response(body, ...)`.

**Async-collection-read pattern** (already in every Astro page in this codebase; canonical example from `blog/index.astro` line 11):

```astro
const posts = await getCollection('blog', ({ data }) => !data.draft);
```

> Reuse verbatim — the RSS feed must apply the same `!data.draft` filter (Pitfall 9: no draft post leaks into the public feed).

**`SITE.baseUrl` usage** (from `src/lib/jsonld.ts` line 25 / line 71):

```typescript
url: SITE.baseUrl,
// ...
url: `${SITE.baseUrl}/attorneys/${d.slug}`,
```

> For the `link:` field of each RSS item, build URLs the same way: `link: \`${SITE.baseUrl}/blog/${post.data.slug}\``. Mirror the absolute-URL convention from Pattern 5 (RESEARCH line 481).

**Sanitize-html + Container API note (no codebase analog):** This block is genuinely new — no analog. Follow RESEARCH Pattern 5 (lines 450-501) verbatim. The single mandatory deviation from the sanitize-html defaults is `allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img'])` (Pitfall 3 — `<img>` is allowed-as-attribute-not-as-tag by default).

---

### `src/components/sections/AuthorCard.astro` (NEW — component, transform)

**Analog:** `src/components/sections/AttorneyCard.astro` — exact match for the image + name + role + focus + accent CTA on a `bg-bg-elevated` card.

**Imports + Props pattern** (`AttorneyCard.astro` lines 9-21):

```astro
---
import { Image } from 'astro:assets';
import type { ImageMetadata } from 'astro';

interface Props {
  name: string;
  role: string;
  focus: string;
  photo: ImageMetadata;
  alt: string;
  href?: string;
}

const { name, role, focus, photo, alt, href } = Astro.props;
const Tag = href ? 'a' : 'div';
---
```

> For AuthorCard, take the full attorney entry as a single prop (per UI-SPEC lines 299-303 — keeps the call site terse since the layout already has `author` in scope):
>
> ```astro
> import { Image } from 'astro:assets';
> import type { CollectionEntry } from 'astro:content';
>
> interface Props {
>   attorney: CollectionEntry<'attorneys'>;
> }
>
> const { attorney } = Astro.props;
> const d = attorney.data;
> const firstName = d.name.split(' ')[0]; // "Aaron" / "Stuart" / "Jon" / "Iris"
> ```

**Card surface pattern** (`AttorneyCard.astro` lines 25-33 — the floating-card vocabulary; D-09 carryover):

```astro
<Tag
  href={href}
  data-component="AttorneyCard"
  class="group block overflow-hidden rounded-card border border-border bg-bg-elevated shadow-card
         transition-[transform,box-shadow] duration-200 ease-out
         motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-card-hover
         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
         focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
>
```

> **For AuthorCard, drop the hover-lift** (UI-SPEC line 311 — "no hover-lift on the card itself" because the card is not a clickable surface, only the name and the CTA inside it are). Keep the `data-component`, the radius, the border, the elevated bg, the shadow. Use a `<div>` not a `<Tag>` polymorphic — the AuthorCard is never the whole-card link.
>
> The card frame becomes:
> ```astro
> <div data-component="AuthorCard"
>      class="flex flex-col gap-6 sm:flex-row sm:items-center
>             mx-auto max-w-prose rounded-card border border-border
>             bg-bg-elevated p-6 shadow-card">
> ```

**Image pattern** (`AttorneyCard.astro` lines 34-40 — explicit width/height for no-CLS):

```astro
<Image
  src={photo}
  alt={alt}
  width={400}
  height={500}
  class="aspect-[4/5] w-full object-cover"
/>
```

> For AuthorCard the source is `d.headshot` (an `image()` from the schema, line 34 of `content.config.ts`), the alt is `d.headshotAlt`, and the dimensions / aspect are different (UI-SPEC lines 307-308): 160×160 source, 80×80 display, `aspect-square` not `aspect-[4/5]`:
>
> ```astro
> <Image
>   src={d.headshot}
>   alt={d.headshotAlt}
>   width={160}
>   height={160}
>   class="h-20 w-20 rounded-card border border-border bg-bg-elevated object-cover"
> />
> ```

**Name + role + focus + CTA block** (`AttorneyCard.astro` lines 41-52):

```astro
<div class="p-6">
  <h3 class="text-h3 font-bold text-text">{name}</h3>
  <p class="mt-1 text-small font-medium uppercase tracking-wide text-text-muted">{role}</p>
  <p class="mt-3 text-body text-text-muted">{focus}</p>
  {
    href && (
      <span class="mt-4 inline-block text-small font-medium text-accent">
        View profile &rarr;
      </span>
    )
  }
</div>
```

> Apply verbatim, with two changes:
> - The name wraps in `<a href={\`/attorneys/${d.slug}\`}>` (UI-SPEC line 309 — the entire name is the link, anchor wraps the H3 text only; same shape as the index post-list title-only-anchor pattern).
> - The CTA is required (not optional via `href &&`); copy is `Read ${firstName}'s full profile →` per UI-SPEC line 222. Render as a TextLink-styled `<a>` (accent + underline) not a `<span>`:
>
>   ```astro
>   <a href={`/attorneys/${d.slug}`} class="mt-4 inline-block text-small font-medium text-accent underline ...focus-visible classes...">
>     Read {firstName}'s full profile &rarr;
>   </a>
>   ```

**Accessibility marker** (UI-SPEC line 218 — gives screen readers a section landmark):

> Wrap the parent section (in `BlogPostLayout`) with `<section aria-label="About the author">` containing a `<h2 class="sr-only">About the author</h2>` ABOVE the AuthorCard div. Do not move this into AuthorCard itself — the component is reusable; the screen-reader heading is contextual to the post page.

---

### `src/components/sections/FilterChipRow.astro` (NEW — component, request-response)

**Analog:** No exact chip analog exists in the codebase. **Closest matches by function:**
1. `src/components/ui/Button.astro` — for focus-ring, hit-area, and motion-safe hover vocabulary
2. `src/components/sections/FaqAccordion.astro` line 30 — for the `min-h-[44px]` pattern + focus-visible ring on a summary/interactive

**Button vocabulary to inherit** (`Button.astro` lines 16-26):

```astro
const base =
  'inline-flex items-center justify-center rounded-button px-6 py-3 text-body font-medium ' +
  'transition-colors duration-150 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ' +
  'focus-visible:ring-offset-2 focus-visible:ring-offset-bg';

const variants = {
  primary: 'bg-primary text-primary-fg motion-safe:hover:bg-primary/90',
  secondary:
    'border border-text text-text bg-transparent motion-safe:hover:bg-text/[0.04]',
};
```

> Two adaptations for FilterChipRow chip:
> - Swap `rounded-button` → `rounded-full` (chip is pill-shaped per UI-SPEC line 273).
> - Swap `px-6 py-3 text-body` → `px-4 min-h-[44px] text-small` (UI-SPEC line 277 — chip is denser than a Button but still ≥44px tap target).
> - Active state ≈ Button "primary" (`bg-text text-bg border-text` per UI-SPEC line 275 — note `bg-text` and `bg-primary` resolve to the same near-black value but the semantic chip variant uses `bg-text`).
> - Rest state ≈ a third variant not in Button: `border border-border bg-bg-elevated text-text-muted` (UI-SPEC lines 273-274).
> - Hover state: `motion-safe:hover:bg-text/[0.04] motion-safe:hover:text-text` (motion-gated; site-wide pattern from Button secondary variant).

**Min-44px-tap-target pattern** (`FaqAccordion.astro` line 30):

```astro
class="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 px-6 py-4
       text-h3 font-bold text-text
       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
       focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
```

> Carry `min-h-[44px]` + the full `focus-visible:` block forward. Drop `text-h3 font-bold` (chip is small + medium, not heading-weight).

**`data-component` marker convention** (every section component has one — `AttorneyCard.astro` line 27 `data-component="AttorneyCard"`, `PracticeAreaCard.astro`, `FaqAccordion.astro` line 22):

> Add `data-component="FilterChipRow"` to the row container `<div>`. Also add `data-chip` to every `<a>` inside (UI-SPEC line 409 — the inline filter script reads `document.querySelectorAll('[data-chip]')`).

**Anchor-as-toggle pattern (no analog — new):** UI-SPEC line 272 + 287 explicitly mandates `<a href>` chips carrying `aria-pressed`. This is the unusual combination — most ARIA references show `aria-pressed` on `<button>`. Per UI-SPEC rationale: the href must work without JS (degradation), but the element is structurally a toggle. **Implement chips as `<a href="/blog?...">` with `aria-pressed="true"|"false"`.** RESEARCH Pattern 4 + Pitfall 4 confirm.

**Props signature** (from UI-SPEC lines 258-265):

```typescript
interface ChipOption { value: string | null; label: string; ariaLabel?: string }
interface Props {
  label: string;                                       // "Filter by attorney"
  paramName: 'author' | 'practice';                    // URL query-param key
  options: ChipOption[];                               // first option's value is null (the "All" chip)
  activeValue: string | null;                          // current URL-param value
  otherActiveParams: Record<string, string | null>;    // preserves the other axis's filter on click
}
```

> `value: null` represents the "All" chip; selecting it should produce an href that **drops** this row's URL param (preserves the other row's). Pattern is purely internal to the component — no analog needed.

**Label + accent-dot pattern** (from `PracticeAreaLayout.astro` line 86):

```astro
<span class="block h-1 w-10 rounded-full bg-accent" aria-hidden="true"></span>
```

> UI-SPEC line 271 specifies a **smaller** accent dot before the chip-row label: `<span class="block h-1 w-1.5 rounded-full bg-accent" aria-hidden="true"></span>` (1.5 wide, not 10 wide — scaled down for the chip context per UI-SPEC line 147 "scaled down" note).

---

### `src/styles/global.css` — `.prose-bsv` block (EDIT, config)

**Analog:** existing `@theme` block (lines 14-60) and `@layer base` block (lines 66-81) in the same file.

**Style of existing rules to mimic** (line 66-81):

```css
@layer base {
  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: var(--color-border, currentColor);
  }

  body {
    background-color: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
  }
}
```

> **Append** a new `@layer components` block at the end of the file (after the reduced-motion media query, after line 95). Use `var(--color-*)`, `var(--text-*)`, `var(--spacing-*)` references — never hex literals (D-22 rule). The targeted selectors come from UI-SPEC Spacing-Scale-MDX-rhythm (lines 58-65) + Visual-States Reference (lines 588-613):
>
> ```css
> @layer components {
>   .prose-bsv > * + * { margin-top: 1.5em; }
>   .prose-bsv h2 { font-size: var(--text-h3); font-weight: 700; margin-top: 0.75em; margin-bottom: 0.5em; }
>   .prose-bsv h3 { font-size: var(--text-body-lg); font-weight: 700; margin-top: 0.5em; margin-bottom: 0.4em; }
>   .prose-bsv blockquote { margin-top: 2em; margin-bottom: 2em; /* + the rest of the rhythm contract */ }
>   .prose-bsv a { color: var(--color-accent); text-decoration: underline; text-underline-offset: 2px; }
>   .prose-bsv a[target="_blank"]::after { content: " \2197"; /* ↗ glyph, UI-SPEC line 118 */ }
>   .prose-bsv ul, .prose-bsv ol { padding-left: 1.5rem; }
>   .prose-bsv li + li { margin-top: 0.5em; }
> }
> ```

**Token-reuse contract** (UI-SPEC line 36 + global.css comment lines 4-8):

> "Token NAMES are stable across Phases 1-2 (D-22); ... a future restyle is a single-file edit." Honoring this means: **every value in `.prose-bsv` references a CSS variable, never a hex.** Underline color = `currentColor` (which inherits the link's `var(--color-accent)`). External-link glyph = the same accent color via inheritance. No new `--prose-*` tokens — UI-SPEC line 38 forbids adding tokens.

---

### `src/content.config.ts` — Zod `.refine()` for cover/coverAlt (EDIT, config)

**Analog:** existing `blog` collection definition in the same file (lines 64-78).

**Current schema pattern** (lines 64-78):

```typescript
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.mdx', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    slug: z.string(),
    author: reference('attorneys'),
    practiceArea: reference('practiceAreas'),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    summary: z.string(),
    cover: image().optional(),
    coverAlt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});
```

> Apply RESEARCH Pitfall 5 fix:
>
> ```typescript
> schema: ({ image }) => z.object({
>   // ... same fields ...
> }).refine(
>   (data) => !data.cover || (data.coverAlt && data.coverAlt.length > 0),
>   { message: 'coverAlt is required when cover is set', path: ['coverAlt'] },
> ),
> ```

**No-reviewedBy carry-through (D-13):** the schema does NOT include `reviewedBy`. Do not re-add it. Phase 4 D-06 reference to `reviewedBy` is amended by Phase 5 D-13 (CONTEXT.md lines 168-172).

---

### `src/content/blog/<seed-post>.mdx` (NEW — content)

**Analog:** `src/content/attorneys/<author>.mdx` (any of the four published attorneys) for the frontmatter shape. Specifically the Susan Jiang `draft: true` pattern from Phase 4 D-07 — same hide-until-approved gating.

> No code excerpt needed — the frontmatter shape is pinned in CONTEXT.md lines 329-339. Apply verbatim. Body text is Jon's, verbatim, at the human-action checkpoint (D-05).

---

### `tests/article-jsonld.spec.ts` (NEW — test)

**Analog:** `tests/person-jsonld.spec.ts` — exact match. Same pattern: build the site in `beforeAll`, iterate over known slugs, cheerio-parse the rendered HTML, extract the `script[type="application/ld+json"]` whose `@type` matches the target schema, assert per-slug shape.

**Imports + constants pattern** (`person-jsonld.spec.ts` lines 11-23):

```typescript
import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as cheerio from 'cheerio';

const DIST_CLIENT = 'dist/client';
const PUBLISHED_SLUGS = [
  'aaron-belcher',
  'stuart-smolen',
  'jon-van-loo',
  'iris-zhang',
];
```

> Apply verbatim. For article-jsonld, the slugs are the published-post slugs (initially: the one seed post slug; the test reads them from `src/content/blog/*.mdx` excluding drafts, OR hardcodes the seed slug until Phase 6 adds more). RESEARCH Pitfall 2 also recommends adding a build-time `verify Container API still imports cleanly` test — fold into this same spec file.

**Extractor function pattern** (`person-jsonld.spec.ts` lines 25-34):

```typescript
function readPersonLd(slug: string): Record<string, unknown> | null {
  const file = path.join(DIST_CLIENT, 'attorneys', slug, 'index.html');
  if (!fs.existsSync(file)) return null;
  const $ = cheerio.load(fs.readFileSync(file, 'utf-8'));
  for (const s of $('script[type="application/ld+json"]').toArray()) {
    const parsed = JSON.parse($(s).html() ?? '{}');
    if (parsed['@type'] === 'Person') return parsed;
  }
  return null;
}
```

> Adapt with `path.join(DIST_CLIENT, 'blog', slug, 'index.html')` and `if (parsed['@type'] === 'Article') return parsed;`.

**Per-slug assertion pattern** (`person-jsonld.spec.ts` lines 36-54):

```typescript
test.describe('Person JSON-LD (ATTY-09 / SEO-03)', () => {
  test('every published attorney page has valid Person JSON-LD', () => {
    execSync('npm run build', { stdio: 'pipe' });
    const missing: string[] = [];
    for (const slug of PUBLISHED_SLUGS) {
      const ld = readPersonLd(slug);
      if (!ld) {
        missing.push(`${slug}: no Person JSON-LD`);
        continue;
      }
      if (ld['@context'] !== 'https://schema.org') missing.push(`${slug}: bad @context`);
      if (typeof ld.name !== 'string' || !ld.name) missing.push(`${slug}: missing name`);
      if (!ld.jobTitle) missing.push(`${slug}: missing jobTitle`);
      // ...
    }
    expect(missing, missing.join('\n')).toEqual([]);
  });
});
```

> Adapt the field assertions to the Article shape per UI-SPEC lines 495-507: `headline` (string), `author` (object with `@type: 'Person'`, `name`, `url`), `datePublished` (ISO string), `dateModified` (ISO string), `image` (string URL), `mainEntityOfPage` (string URL), `publisher` (object with `@type: 'LegalService'` or similar).
>
> **Initial state of the test:** like `person-jsonld.spec.ts` was when first written (see line 8 SCAFFOLD comment), this test should be SCAFFOLD-marked with an UNSKIP-WHEN condition pointing at the seed-post landing. Once the seed post publishes, unskip.

---

### `tests/rss-feed.spec.ts` (NEW — test)

**Analog:** `tests/jsonld-legalservice.spec.ts` (the build-in-beforeAll pattern, lines 20-22) + `tests/disclaimer-set.spec.ts` (the file-fs read of build output, lines 19-20).

**Build-in-beforeAll pattern** (`jsonld-legalservice.spec.ts` lines 20-22):

```typescript
test.beforeAll(() => {
  execSync('npm run build', { stdio: 'pipe' });
});
```

> Reuse verbatim. The RSS feed lands at `dist/client/blog/rss.xml` after build.

**File-read pattern** (`disclaimer-set.spec.ts` lines 19-20):

```typescript
const raw = fs.readFileSync('src/content/disclaimers/disclaimers.json', 'utf-8');
const data = JSON.parse(raw) as DisclaimerEntry[];
```

> Adapt for XML: read `dist/client/blog/rss.xml`, parse with a lightweight XML parser (or with cheerio's XML mode: `cheerio.load(xml, { xmlMode: true })`). Assert:
> - File exists.
> - Top element is `<rss>` with `version="2.0"`.
> - At least one `<item>` exists (RESEARCH Pitfall 2 — guards against silent Container API regression).
> - Every item has `<title>`, `<link>` (starting with `https://bsvlaw.com/blog/`), `<pubDate>`, `<author>` (a string, not an email — D-08 carry-through), `<description>`, `<content:encoded>`.
> - No `<item>` contains a `draft: true` post (cross-check against `src/content/blog/*.mdx` frontmatter).

---

### `tests/blog-filter.spec.ts` (NEW — test)

**Analog:** `tests/a11y-interactions.spec.ts` — closest match for Playwright nav + DOM assertions on the rendered preview server (not a static-file read).

> No direct code excerpt — the spec needs a running dev/preview server (per the existing Playwright config). Asserts:
> - Visit `/blog`; both chip rows render with the correct labels and chip count.
> - Click "Tax" practice chip; URL updates to `/blog?practice=tax`; non-tax posts are hidden via `[hidden]`.
> - Click an author chip in addition; URL becomes `/blog?author=X&practice=tax`; only matching posts visible.
> - With a filter combo that matches zero posts, the empty-filtered-state `#empty-filtered` is visible (`hidden` attribute removed); `aria-live="polite"` is present.
> - Direct-navigation: visit `/blog?author=jon-van-loo&practice=tax` directly; on load the filter is applied and `aria-pressed="true"` is set on the matching chips.
> - JS-disabled fallback: skip if testing in JS-disabled Playwright context — out of scope for first pass.

---

### `astro.config.mjs` (EDIT — `rehype-external-links`)

**Analog:** existing `integrations:` block in the same file (read it before editing — its exact line numbers vary).

**Target shape** (from RESEARCH Pitfall 8, lines 620-637):

```javascript
import mdx from '@astrojs/mdx';
import rehypeExternalLinks from 'rehype-external-links';

export default defineConfig({
  // ...
  integrations: [
    mdx({
      rehypePlugins: [
        [rehypeExternalLinks, { target: '_blank', rel: ['noopener', 'noreferrer'] }],
      ],
    }),
    // ... sitemap(), icon(), etc.
  ],
});
```

> The exact edit is additive — preserve every other integration and config option already in `astro.config.mjs`. Install `rehype-external-links@3.0.0` alongside the RSS deps.

---

### `package.json` (EDIT — new deps + scripts)

**Deps to add** (RESEARCH Standard Stack lines 144-149 + 162):

```bash
npm install @astrojs/rss@4.0.18 sanitize-html@2.17.4 rehype-external-links@3.0.0
npm install -D @types/sanitize-html@2.16.1
```

**Scripts to add** (mirror existing test:* convention; see existing Phase 4 spec scripts in package.json):

- `"test:article-jsonld": "playwright test tests/article-jsonld.spec.ts"`
- `"test:rss-feed": "playwright test tests/rss-feed.spec.ts"`
- `"test:blog-filter": "playwright test tests/blog-filter.spec.ts"`

---

## Shared Patterns

### Slot-transferred per-page JSON-LD

**Source:** `src/layouts/AttorneyLayout.astro` line 35 + `src/layouts/PracticeAreaLayout.astro` line 50
**Apply to:** `BlogPostLayout.astro`

```astro
<BaseLayout title={title} description={description}>
  <JsonLd slot="head" data={buildPersonLd(attorney)} />
```

> The `<JsonLd slot="head" />` element MUST be the first child inside `<BaseLayout>`. The `BaseLayout` projects via `<slot name="head" />` at line 48. Site-wide LegalService JSON-LD is already injected by BaseLayout line 46 — Article JSON-LD is additive (Google handles multiple JSON-LD blocks on one page). **Never** edit BaseLayout to add per-page JSON-LD (Pitfall 12 / FOUND-10 / D-11).

### Astro `<Image>` with explicit width/height (no CLS)

**Source:** `src/components/sections/AttorneyCard.astro` lines 34-40 + `src/layouts/AttorneyLayout.astro` lines 39-45
**Apply to:** `AuthorCard.astro` (headshot), `BlogPostLayout.astro` (cover image)

```astro
import { Image } from 'astro:assets';
// ...
<Image
  src={photo}
  alt={alt}
  width={400}
  height={500}
  class="aspect-[4/5] w-full object-cover"
/>
```

> Explicit width/height pinned in pixels (the SOURCE dimensions for Astro to optimize). The displayed dimensions come from Tailwind utility classes. Lazy-loading is the Astro default — do not pass `loading="eager"` except on the homepage hero (Phase 2 carryover).

### Disclaimer rendering at layout level

**Source:** `src/components/legal/Disclaimer.astro` consumed by `AttorneyLayout.astro` line 159, `PracticeAreaLayout.astro` line 150, current `BlogPostLayout.astro` line 29
**Apply to:** preserved in updated `BlogPostLayout.astro`

```astro
<Disclaimer id="blog" />
```

> The id-driven disclaimer pattern is THE structural enforcement of LEGAL-09 (D-12 / CONTEXT.md lines 158-163). The component throws at build time if the `id` is unknown (`Disclaimer.astro` lines 13-18). Do not move this into MDX; do not duplicate it.

### `mx-auto max-w-* px-gutter py-section` page container

**Source:** every Astro page in the codebase — canonical:
- `src/pages/practice-areas/index.astro` line 46 — `max-w-6xl`
- `src/pages/blog/index.astro` line 18 — `max-w-3xl`
- `src/layouts/AttorneyLayout.astro` line 37 — `max-w-4xl`
- `src/layouts/PracticeAreaLayout.astro` lines 54, 61, 77, 84 — `max-w-3xl`

**Apply to:** Phase 5 surfaces per UI-SPEC width hierarchy (UI-SPEC lines 543-547):
- `/blog` index page section wrapper: `max-w-3xl` (preserve existing)
- `/blog/[slug]` post body wrapper: `max-w-prose` (NEW for this phase — narrower than the attorney/practice pages)
- AuthorCard: `max-w-prose` (matches the post body it follows)

> **Never use `max-w-6xl` in Phase 5** — UI-SPEC line 549 explicitly forbids it ("the Insights surface is a content-reading surface, not a layout-grid surface").

### Focus-visible accent ring on every interactive element

**Source:** site-wide A11Y-05 contract. Examples:
- `src/components/ui/Button.astro` lines 19-20
- `src/components/sections/AttorneyCard.astro` lines 31-32
- `src/components/sections/FaqAccordion.astro` lines 32-33

```
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent
focus-visible:ring-offset-2 focus-visible:ring-offset-bg
```

> **Apply to every interactive element introduced in Phase 5:** every chip, every post-title link, the byline author link, the author-card name link, the author-card CTA link, the empty-filtered-state reset link. Never gate focus rings on `motion-safe` (Phase 2 D-10) — they're never animation, always present.

### TextLink primitive (accent + always-visible underline)

**Source:** `src/layouts/PracticeAreaLayout.astro` lines 95-99 — the canonical example

```astro
<a
  href={`/attorneys/${lead.data.slug}`}
  class="font-medium text-accent underline"
>
  {lead.data.name}
</a>
```

**Apply to:** byline author link, AuthorCard name link, AuthorCard "Read full profile" CTA, empty-filtered "browse all Insights" link.

> UI-SPEC line 111 mandates underline ALWAYS visible at rest (not hover-only). The exact class shape varies slightly across surfaces — the layout-rendered ones use `font-medium text-accent underline`; MDX-rendered ones use the `.prose-bsv a { ... }` CSS rule. Both produce the same visual output.

### Build-then-cheerio test pattern

**Source:** `tests/jsonld-legalservice.spec.ts` lines 20-22 + `tests/person-jsonld.spec.ts` lines 36-54

```typescript
import { execSync } from 'node:child_process';
import * as cheerio from 'cheerio';

test.beforeAll(() => {
  execSync('npm run build', { stdio: 'pipe' });
});

// Then read dist/client/<path>/index.html and cheerio-parse
```

**Apply to:** `tests/article-jsonld.spec.ts` (HTML mode) + `tests/rss-feed.spec.ts` (XML mode via `cheerio.load(xml, { xmlMode: true })`).

### Draft-exclusion filter

**Source:** `src/pages/blog/[slug].astro` line 6, `src/pages/practice-areas/[slug].astro` line 6, `src/pages/attorneys/[slug].astro` line 6, `src/pages/blog/index.astro` line 11

```typescript
const posts = await getCollection('blog', ({ data }) => !data.draft);
```

**Apply to:** every collection read introduced in Phase 5. **Critical for RSS** (Pitfall 9): the RSS endpoint MUST apply this filter — no draft post leaks into the public feed.

---

## No Analog Found

Files with no close codebase precedent (the planner should use RESEARCH.md patterns instead):

| Surface | Role | Data Flow | Reason | RESEARCH section to use |
|---|---|---|---|---|
| Container API → string for MDX body | (inside `rss.xml.ts`) | transform | First time the codebase renders an Astro component to a string outside a `.astro` template | RESEARCH Pattern 5 (lines 437-501) + Pitfall 2 + Pitfall 7 |
| `sanitize-html` allowlist | (inside `rss.xml.ts`) | transform | First HTML scrubbing pass in the codebase | RESEARCH Pattern 5 (line 477) + Pitfall 3 |
| Inline progressive-enhancement filter `<script>` | (inside `blog/index.astro`) | client-side event handling | First inline non-bundled script on a content page (Phase 1's SkipToContent is a different shape) | RESEARCH Pattern 4 (lines 388-431) |
| Chip pill component | (in `FilterChipRow.astro`) | request-response | No chip / pill / toggle-link primitive exists; Button and FaqAccordion summary are the closest functional matches but neither produces a pill | UI-SPEC Component Contracts (lines 252-291) + Visual States (lines 560-587) |
| `<time datetime>` semantic markup | (in BlogPostLayout + post-list item) | n/a | No existing `<time>` element in the codebase | UI-SPEC lines 216-217 |

---

## Metadata

**Analog search scope:**
- `src/layouts/` (4 files)
- `src/pages/` (13 files)
- `src/components/sections/` (10 files)
- `src/components/ui/` (1 file)
- `src/components/seo/` (1 file)
- `src/components/legal/` (1 file)
- `src/lib/` (2 files)
- `src/styles/` (1 file)
- `src/content.config.ts` (1 file)
- `tests/` (20 files, focus on the Phase 4 Wave 0 JSON-LD + disclaimer specs)

**Files scanned:** ~25 of 60+ source files (focused on the analogs called out in the prompt)
**Pattern extraction date:** 2026-05-28
**Phase:** 5 — Insights (Blog) System
