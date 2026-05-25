# Architecture Research

**Domain:** Boutique law firm marketing website (Astro 6 + Tailwind CSS v4 + Vercel)
**Project:** Belcher, Smolen & Van Loo LLP — bsvlaw.com replacement
**Researched:** 2026-05-25
**Confidence:** HIGH for Astro Content Collections, dynamic routes, Astro Actions, Tailwind v4 `@theme` directive, Vercel adapter pattern (verified against Context7-indexed `docs.astro.build` and `tailwindlabs/tailwindcss.com`). MEDIUM for "Astro 6"-specific naming — Context7 docs reference v5.16.15 as the documented release at indexing time; the patterns recommended here (Content Layer API, Actions, `astro:content`, `@tailwindcss/vite`) are the stable, post-v5 patterns that carry forward and are the right target for any project starting today. If the local `astro` version reports < 6.0 at install, treat that as a non-blocker — the architecture is identical.

---

## Executive Summary (for Jon)

This document is the **map of the house** before we frame a single wall.

Astro is built around an idea that fits this site perfectly: **content lives in plain
files (Markdown for blog posts, a small data file for attorneys), and pages are
templates that read that content and render HTML.** That's it. No database, no
build server, no CMS to learn. When you want to add an attorney, you edit a file.
When you want to add a blog post, you create a new Markdown file. The site
rebuilds and re-deploys automatically.

The architecture we're recommending has five layers:

1. **Design tokens** (one CSS file) — colors, fonts, spacing live here. Change a
   variable, the whole site updates.
2. **Layouts** (3 files) — the page chrome. Every page is wrapped in one of these.
3. **Components** (~20 files) — the reusable pieces: header, footer, attorney
   card, etc.
4. **Content** (Markdown + JSON in `src/content/`) — the actual words and people.
5. **Pages** (~10 files in `src/pages/`) — wire content to layouts and components.

The single rule that keeps the codebase legible: **content is data, not code.**
Adding a new blog post never requires editing a component. Adding a new attorney
never requires editing a page. The system is designed so that you (Jon) can
maintain the site by editing Markdown files long after the build is done.

---

## System Overview

```
┌──────────────────────────────────────────────────────────────────────┐
│                     CONTENT LAYER (src/content/)                     │
│  ┌────────────┐  ┌────────────────┐  ┌────────┐  ┌──────────────┐    │
│  │ attorneys/ │  │ practice-areas/│  │ blog/  │  │ testimonials │    │
│  │ (.json)    │  │ (.mdx)         │  │ (.mdx) │  │ (.json)      │    │
│  └─────┬──────┘  └───────┬────────┘  └────┬───┘  └──────┬───────┘    │
│        │                 │                │             │            │
│        └──── astro:content / Zod schemas (src/content.config.ts) ────┤
│                           │ getCollection() / getEntry() / render()  │
├───────────────────────────┼──────────────────────────────────────────┤
│                  PAGE LAYER (src/pages/)                             │
│  ┌──────────────┐ ┌─────────────────────────┐ ┌──────────────────┐   │
│  │ index.astro  │ │ attorneys/[slug].astro  │ │ blog/[slug].astro│   │
│  │ contact.astro│ │ practice-areas/[slug]   │ │ blog/index.astro │   │
│  └──────┬───────┘ └────────────┬────────────┘ └────────┬─────────┘   │
│         │                      │                       │             │
├─────────┼──────────────────────┼───────────────────────┼─────────────┤
│                  LAYOUT LAYER (src/layouts/)                         │
│  ┌──────────────┐    ┌────────────────┐    ┌────────────────────┐    │
│  │ BaseLayout   │◄───│ AttorneyLayout │    │ BlogPostLayout     │    │
│  │ (HTML shell, │    │ PracticeLayout │────►(extends Base)      │    │
│  │  head, nav,  │    └────────────────┘    └────────────────────┘    │
│  │  footer)     │                                                    │
│  └──────┬───────┘                                                    │
│         │                                                            │
├─────────┼────────────────────────────────────────────────────────────┤
│              COMPONENT LAYER (src/components/)                       │
│  Site chrome:   SiteHeader · SiteNav · SiteFooter · Disclaimer       │
│  Page sections: Hero · CTABlock · PracticeAreaCard · AttorneyCard    │
│  Page sections: TestimonialPullquote · ChambersBadge · FeeNotice     │
│  Forms:         ContactForm · HoneypotField                          │
│  SEO:           SeoHead · JsonLd                                     │
│  Bio specific:  AttorneyBioHeader · DealList · EducationList         │
├──────────────────────────────────────────────────────────────────────┤
│         SERVER LAYER (src/actions/ + src/pages/api/)                 │
│  ┌───────────────────────────────────────────────────────────────┐   │
│  │ Astro Actions (preferred) OR API route POST /api/contact     │   │
│  │  - server-side Zod validation                                 │   │
│  │  - honeypot check                                             │   │
│  │  - rate-limit (best-effort)                                   │   │
│  │  - dispatch to chosen backend (Resend/Formspree/SMTP/etc.)    │   │
│  └───────────────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────────────┤
│         INFRASTRUCTURE (vercel.json + astro.config.mjs)              │
│  Vercel adapter · security headers · build hooks · env vars          │
└──────────────────────────────────────────────────────────────────────┘
```

**Direction of data flow is one-way:**
`Markdown / JSON files` → `Zod schema validation` → `Page template fetches via getCollection/getEntry` → `Layout wraps` → `Components render` → `Static HTML in dist/` → `Vercel CDN`.

The only exception is the contact form, which posts to a server function and writes
or forwards somewhere off-site.

---

## Recommended Project Structure

```
bsv-website/
├── astro.config.mjs               # Astro config + Vercel adapter + integrations
├── tsconfig.json                  # TypeScript config (Astro default is fine)
├── vercel.json                    # Security headers, rewrites, env binding
├── package.json
├── .env.example                   # Documents required env vars (no real values)
├── .gitignore                     # Must include .env, .env.local, dist/
├── public/                        # Static assets served as-is
│   ├── favicon.svg
│   ├── robots.txt
│   ├── humans.txt
│   └── images/                    # Pre-optimized images (headshots, logos)
│       └── attorneys/
├── src/
│   ├── styles/
│   │   └── global.css             # Tailwind v4 entry: @import + @theme tokens
│   ├── content.config.ts          # Astro Content Collections — schemas live here
│   ├── content/                   # ALL the words and people on the site
│   │   ├── attorneys/             # One JSON or MDX file per attorney
│   │   │   ├── aaron-belcher.mdx
│   │   │   ├── stuart-smolen.mdx
│   │   │   ├── jon-van-loo.mdx
│   │   │   ├── iris-zhang.mdx
│   │   │   └── susan-jiang.mdx
│   │   ├── practice-areas/
│   │   │   ├── mergers-acquisitions.mdx
│   │   │   ├── ip-technology-transactions.mdx
│   │   │   └── tax.mdx
│   │   ├── blog/                  # One .mdx file per post
│   │   │   └── 2026-05-25-welcome.mdx
│   │   ├── testimonials/          # Pulled into homepage + practice pages
│   │   │   └── testimonials.json
│   │   └── disclaimers/           # Single source of truth for legal copy
│   │       └── disclaimers.json   # footer / contact / blog / practice-area
│   ├── layouts/
│   │   ├── BaseLayout.astro       # The HTML <html><head><body> shell
│   │   ├── AttorneyLayout.astro   # Wraps an attorney profile
│   │   ├── PracticeAreaLayout.astro
│   │   └── BlogPostLayout.astro
│   ├── components/
│   │   ├── chrome/
│   │   │   ├── SiteHeader.astro
│   │   │   ├── SiteNav.astro
│   │   │   ├── SiteFooter.astro
│   │   │   └── SkipToContent.astro    # a11y
│   │   ├── seo/
│   │   │   ├── SeoHead.astro          # title/description/og/canonical
│   │   │   └── JsonLd.astro           # one component, switches on `type` prop
│   │   ├── legal/
│   │   │   └── Disclaimer.astro       # reads from disclaimers.json by `slot`
│   │   ├── sections/
│   │   │   ├── Hero.astro
│   │   │   ├── CTABlock.astro
│   │   │   ├── PracticeAreaGrid.astro
│   │   │   ├── PracticeAreaCard.astro
│   │   │   ├── AttorneyGrid.astro
│   │   │   ├── AttorneyCard.astro
│   │   │   ├── TestimonialPullquote.astro
│   │   │   ├── ChambersBadge.astro
│   │   │   ├── FeeTransparency.astro
│   │   │   └── DealList.astro
│   │   ├── bio/
│   │   │   ├── AttorneyBioHeader.astro
│   │   │   ├── EducationList.astro
│   │   │   └── BarAdmissions.astro
│   │   └── forms/
│   │       ├── ContactForm.astro
│   │       └── HoneypotField.astro
│   ├── lib/                       # Plain TypeScript helpers (no Astro)
│   │   ├── seo.ts                 # buildOgImageUrl(), canonicalUrl(), defaults
│   │   ├── jsonld.ts              # builders: legalService(), person(), article()
│   │   ├── site.ts                # SITE_NAME, BASE_URL, contact info constants
│   │   └── validation.ts          # Zod schemas reused by Actions + forms
│   ├── actions/                   # Astro Actions — server-side form handlers
│   │   └── index.ts               # exports `server.submitContact = defineAction(...)`
│   └── pages/                     # File-based routing (this IS the sitemap)
│       ├── index.astro            # /
│       ├── about.astro            # /about (firm story, team approach)
│       ├── contact.astro          # /contact (renders ContactForm)
│       ├── practice-areas/
│       │   ├── index.astro        # /practice-areas (overview)
│       │   └── [slug].astro       # /practice-areas/mergers-acquisitions etc.
│       ├── attorneys/
│       │   ├── index.astro        # /attorneys
│       │   └── [slug].astro       # /attorneys/aaron-belcher etc.
│       ├── blog/
│       │   ├── index.astro        # /blog (post list)
│       │   └── [slug].astro       # /blog/2026-05-25-welcome
│       └── api/                   # OPTIONAL — only if not using Astro Actions
│           └── contact.ts         # POST /api/contact (server endpoint)
└── .planning/                     # GSD docs — never shipped
```

### Structure rationale (plain English)

- **`src/content/` is the firm's living information.** Five files for attorneys, three
  for practice areas, one Markdown file per blog post. This is the *only* place Jon
  ever needs to edit to add or update content after launch. The pages and components
  are infrastructure that read from here.
- **`src/components/` is grouped by purpose** (`chrome/`, `sections/`, `bio/`, `forms/`,
  `seo/`, `legal/`) so that the file tree itself answers "where does the header
  live?" without searching. Twenty named files in five folders is friendlier than
  one flat folder with twenty files.
- **`src/layouts/` are page wrappers.** A layout is essentially "every page that
  looks like *this* uses this template." Three layouts cover every page type.
- **`src/lib/` is plain TypeScript** (no Astro syntax). Helpers that build SEO
  meta, JSON-LD blobs, and validation schemas live here. Putting them in `lib/`
  keeps `.astro` files focused on rendering.
- **`src/styles/global.css`** is the design system. Tailwind v4 reads its
  configuration from CSS itself (no `tailwind.config.js`), so this file holds
  every brand decision: colors, fonts, spacing tokens.
- **Disclaimers live in one JSON file** (`src/content/disclaimers/disclaimers.json`).
  Reasons: (a) when the firm's compliance counsel updates wording, it's one edit;
  (b) the same disclaimer text never gets accidentally forked across pages;
  (c) the disclaimer can be referenced as a content collection entry by every
  layout that needs it.

---

## Astro Content Collections — Schemas

Astro Content Collections (`astro:content`) is the system that turns the files in
`src/content/` into typed, validated data the page templates can read. Schemas
are written with Zod (a small validation library) and live in `src/content.config.ts`.

The schemas below are concrete recommendations. Field names match the firm brief.

```typescript
// src/content.config.ts
import { defineCollection, reference, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

// -------- ATTORNEYS --------
// One MDX file per attorney. Frontmatter is structured data; MDX body is the
// long-form bio paragraphs. Storing bios as MDX (not plain JSON) means Jon can
// embed pull-quotes and links in prose without escaping anything.
const attorneys = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/attorneys' }),
  schema: ({ image }) => z.object({
    name: z.string(),
    role: z.enum(['Partner', 'Associate', 'Counsel']),
    headshot: image(),                    // Astro validates + optimises this
    headshotAlt: z.string(),
    bars: z.array(z.string()),            // ["California", "New York"]
    education: z.array(z.object({
      degree: z.string(),
      school: z.string(),
      year: z.number().optional(),
      honors: z.string().optional(),
    })),
    priorFirms: z.array(z.string()).default([]),
    practiceAreas: z.array(reference('practice-areas')),   // typed cross-link
    focus: z.string(),                    // one-line summary
    representativeDeals: z.array(z.string()).default([]),
    recognitions: z.array(z.string()).default([]),
    languages: z.array(z.string()).default(['English']),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    order: z.number(),                    // controls grid ordering
    draft: z.boolean().default(false),    // hide unfinished bios (Susan Jiang)
  }),
});

// -------- PRACTICE AREAS --------
const practiceAreas = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/practice-areas' }),
  schema: ({ image }) => z.object({
    title: z.string(),                    // "Mergers & Acquisitions"
    shortTitle: z.string(),               // "M&A" (nav use)
    summary: z.string(),                  // 1-2 sentence elevator pitch
    icon: image().optional(),             // stylized practice-area icon
    leadAttorneys: z.array(reference('attorneys')),
    services: z.array(z.string()),        // bullet list of services
    industries: z.array(z.string()).default([]),
    sampleMatters: z.array(z.string()).default([]),
    order: z.number(),
    seoTitle: z.string().optional(),      // overrides default page title
    seoDescription: z.string().optional(),
  }),
});

// -------- BLOG --------
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.mdx', base: './src/content/blog' }),
  // The [^_] pattern ignores files starting with _ — useful for drafts.
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),              // shows in lists + meta description
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: reference('attorneys'),       // every post attributed to an attorney
    practiceArea: reference('practice-areas').optional(),
    cover: image().optional(),
    coverAlt: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

// -------- TESTIMONIALS --------
// A small JSON file — testimonials don't need MDX. Surfaced on homepage and
// optionally on relevant practice-area pages.
const testimonials = defineCollection({
  loader: file('src/content/testimonials/testimonials.json'),
  schema: z.object({
    id: z.string(),
    quote: z.string(),
    attribution: z.string(),              // "Daniel Brian, GC, Commure"
    practiceArea: reference('practice-areas').optional(),
    featured: z.boolean().default(false), // show on homepage
  }),
});

// -------- DISCLAIMERS --------
// Single source of truth for every disclaimer string on the site.
const disclaimers = defineCollection({
  loader: file('src/content/disclaimers/disclaimers.json'),
  schema: z.object({
    id: z.enum(['footer', 'contact', 'blog', 'practice-area', 'attorney']),
    text: z.string(),
    lastReviewed: z.coerce.date(),        // compliance audit trail
  }),
});

export const collections = { attorneys, practiceAreas, blog, testimonials, disclaimers };
```

**Why these schemas, specifically:**
- `reference('attorneys')` and `reference('practice-areas')` give us **typed
  cross-links** — a blog post's `author` field is checked against the actual
  attorney file IDs at build time. Typos are caught before deploy.
- `image()` from the schema helper validates that the file exists and lets
  Astro's image pipeline optimize it (compression, format conversion). This
  is how the 200 KB image budget gets enforced *automatically* — Astro will
  emit a build warning when an unoptimized headshot is committed.
- `draft: z.boolean().default(false)` lets Jon work on Susan Jiang's bio
  without it showing up on the live site. Page templates filter `draft` out.
- `order: z.number()` controls how attorneys and practice areas are displayed
  in grids. Editing the order is just renumbering frontmatter fields.

---

## Routing — Static vs Dynamic

Astro's routing is file-based: a file at `src/pages/foo.astro` produces `/foo`.
For lists of similar pages (one per attorney, one per blog post), we use a
**dynamic route file** named with brackets: `[slug].astro`. Astro reads the
slug from the URL and we look up the right content entry.

| Route                                    | File                                              | Static / Dynamic | Notes |
|------------------------------------------|---------------------------------------------------|------------------|-------|
| `/`                                      | `src/pages/index.astro`                           | Static           | Homepage; reads testimonials + featured deals. |
| `/about`                                 | `src/pages/about.astro`                           | Static           | Firm story; "Team work to get good results." |
| `/contact`                               | `src/pages/contact.astro`                         | Static page + server action | Page is prerendered; form submits to action. |
| `/practice-areas`                        | `src/pages/practice-areas/index.astro`            | Static           | Lists all three practice areas with summaries. |
| `/practice-areas/mergers-acquisitions`   | `src/pages/practice-areas/[slug].astro`           | Dynamic (built at build time via `getStaticPaths`) | Three pages total. |
| `/practice-areas/ip-technology-transactions` | (same)                                        | Dynamic          | |
| `/practice-areas/tax`                    | (same)                                            | Dynamic          | |
| `/attorneys`                             | `src/pages/attorneys/index.astro`                 | Static           | Five attorney cards. |
| `/attorneys/aaron-belcher`               | `src/pages/attorneys/[slug].astro`                | Dynamic          | One per attorney. Susan Jiang filtered out until `draft: false`. |
| `/blog`                                  | `src/pages/blog/index.astro`                      | Static           | Paginated post index. |
| `/blog/2026-05-25-welcome`               | `src/pages/blog/[slug].astro`                     | Dynamic          | One per Markdown file. |
| `POST /api/contact` (or Astro Action)    | `src/actions/index.ts` (preferred)                | Server / on-demand | Only non-static route. |

**Astro 6 default output is static** (the entire site is pre-built as HTML).
Only the contact-form action runs on the server. This is the architecture that
makes the site fast and cheap on Vercel: every page is a CDN file; only one
endpoint runs server code.

Dynamic route example (verified pattern from Astro docs):

```astro
---
// src/pages/attorneys/[slug].astro
import { getCollection, render } from 'astro:content';
import AttorneyLayout from '../../layouts/AttorneyLayout.astro';

export async function getStaticPaths() {
  const attorneys = await getCollection('attorneys', ({ data }) => !data.draft);
  return attorneys.map(entry => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}

const { entry } = Astro.props;
const { Content } = await render(entry);            // renders the MDX body
---
<AttorneyLayout attorney={entry}>
  <Content />
</AttorneyLayout>
```

The same pattern works for `practice-areas/[slug].astro` and `blog/[slug].astro`.

---

## Component Decomposition

The component layer is where most of the work lives. The list below is what to
build and what each piece is responsible for.

| Component                  | Reusable / Page-specific | Responsibility                                                                            | Props                                  |
|----------------------------|--------------------------|-------------------------------------------------------------------------------------------|----------------------------------------|
| **`SiteHeader.astro`**     | Reusable (all pages)     | Logo, primary nav, mobile menu trigger. Sticks to top.                                    | `currentPath` (for active nav state)   |
| **`SiteNav.astro`**        | Reusable (in header)     | The nav links themselves. **Simple horizontal nav, NOT mega-nav.** (See rationale below.) | `currentPath`                           |
| **`SiteFooter.astro`**     | Reusable (all pages)     | Address, phone, email, social if any, site-wide footer disclaimer, Chambers badge.        | none (reads from `lib/site.ts`)        |
| **`SkipToContent.astro`**  | Reusable (a11y)          | Keyboard-only "skip to main content" link for WCAG AA.                                    | none                                   |
| **`Hero.astro`**           | Reusable (homepage + landing pages) | The "Team work to get good results." lead. Headline + subhead + primary CTA + optional creative graphic slot. | `heading`, `subheading`, `cta`, `<slot name="art" />` |
| **`CTABlock.astro`**       | Reusable                 | Reusable call-to-action band ("Have a deal in motion? Talk to us."). Appears at the bottom of every long-form page. | `heading`, `body`, `cta`              |
| **`PracticeAreaCard.astro`** | Reusable               | Single practice-area tile: icon, title, 1-sentence summary, "Learn more" link.            | `practiceArea` (collection entry)      |
| **`PracticeAreaGrid.astro`** | Reusable (homepage + /practice-areas) | Wraps three `PracticeAreaCard`s.                                              | `entries`                              |
| **`AttorneyCard.astro`**   | Reusable                 | Headshot (placeholder OK), name, title, focus, link to bio.                               | `attorney`                             |
| **`AttorneyGrid.astro`**   | Reusable (homepage + /attorneys) | Wraps the five attorney cards in order.                                          | `entries`                              |
| **`AttorneyBioHeader.astro`** | Page-specific (bio)   | Large headshot, name, role, key creds in tight typography.                                | `attorney`                             |
| **`EducationList.astro`**  | Page-specific (bio)      | Structured list of degrees, clerkships, honors.                                           | `education` array                      |
| **`BarAdmissions.astro`**  | Page-specific (bio)      | "Admitted in:" list.                                                                      | `bars` array                           |
| **`DealList.astro`**       | Page-specific (bio + practice-area) | List of representative matters.                                                | `deals` array                          |
| **`TestimonialPullquote.astro`** | Reusable           | Single quote, attribution, styled as a hero-style pull-quote (not a stack of cards).      | `testimonial`                          |
| **`ChambersBadge.astro`**  | Reusable                 | Small "Chambers USA Spotlight 2026" recognition card. Footer + about page.                | none                                   |
| **`FeeTransparency.astro`** | Reusable                | The hourly + estimate disclosure block.                                                   | none                                   |
| **`Disclaimer.astro`**     | Reusable (everywhere)    | Reads disclaimer text from collection by `id`, renders it. Single source of truth.        | `id` (`'footer'` / `'blog'` / etc.)    |
| **`ContactForm.astro`**    | Page-specific (/contact) | Renders the form HTML. Uses Astro Action via `action={actions.submitContact}`.            | none                                   |
| **`HoneypotField.astro`**  | Reusable (in form)       | Hidden field bots fill in; server rejects submissions where it's non-empty.               | none                                   |
| **`SeoHead.astro`**        | Reusable (in BaseLayout) | Renders `<title>`, `<meta description>`, OG tags, canonical, Twitter card.                | `title`, `description`, `image`, `canonical` |
| **`JsonLd.astro`**         | Reusable (in BaseLayout) | Renders a `<script type="application/ld+json">` tag from a builder. One component, switches behavior on `type`. | `type` (`'LegalService'` / `'Person'` / `'Article'`), `data` |

### Mega-nav vs simple nav — recommendation

**Use a simple horizontal nav.** A mega-nav (the big multi-column dropdown that
appears under top-level items) is appropriate when there are dozens of sub-pages
to organize. BSV has at most ~15 page slugs total. The Norm Law and Strix Law
reference sites both use simple nav. A mega-nav would feel BigLaw and contradict
the boutique positioning.

Nav structure:
```
Practice Areas    Attorneys    Blog    About    Contact
```
That's it. Five items. Mobile: hamburger collapses them into a vertical stack.

---

## Layout Strategy

**One root layout, three specialized layouts that compose it.** This is the
Astro-idiomatic pattern (verified in docs: "transferring slots" pattern).

### `src/layouts/BaseLayout.astro` — the root

Owns:
- `<!DOCTYPE html>` and `<html lang="en">`
- `<head>` with `<SeoHead />`, `<JsonLd />` (LegalService for every page),
  favicons, fonts (preload), and the global stylesheet import
- `<body>` with `<SkipToContent />`, `<SiteHeader />`, `<main>` (slot), `<SiteFooter />`

Every other layout wraps `<BaseLayout>` and passes props to it via slots.

```astro
---
// src/layouts/BaseLayout.astro (verified pattern from Astro docs)
import '../styles/global.css';
import SeoHead from '../components/seo/SeoHead.astro';
import JsonLd from '../components/seo/JsonLd.astro';
import SiteHeader from '../components/chrome/SiteHeader.astro';
import SiteFooter from '../components/chrome/SiteFooter.astro';
import SkipToContent from '../components/chrome/SkipToContent.astro';
import { buildLegalServiceLd } from '../lib/jsonld';

interface Props {
  title: string;
  description: string;
  ogImage?: string;
  canonical?: string;
}

const { title, description, ogImage, canonical } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width" />
    <SeoHead title={title} description={description} ogImage={ogImage} canonical={canonical} />
    <!-- Firm-wide LegalService JSON-LD on every page -->
    <JsonLd type="LegalService" data={buildLegalServiceLd()} />
    <!-- Per-page additional JSON-LD passed in via the "head" slot -->
    <slot name="head" />
  </head>
  <body>
    <SkipToContent />
    <SiteHeader currentPath={Astro.url.pathname} />
    <main id="main">
      <slot />
    </main>
    <SiteFooter />
  </body>
</html>
```

### `src/layouts/AttorneyLayout.astro`

Wraps `BaseLayout`, owns:
- `AttorneyBioHeader`
- The MDX body (`<slot />` passed through from the page)
- `EducationList`, `BarAdmissions`, `DealList`
- Per-page disclaimer block (`<Disclaimer id="attorney" />`)
- Per-page JSON-LD `Person` schema (passed into `BaseLayout`'s `head` slot)
- A `CTABlock` at the bottom

### `src/layouts/PracticeAreaLayout.astro`

Wraps `BaseLayout`, owns:
- A practice-area hero with the area's icon and short summary
- A "Lead attorneys" sub-section that surfaces `AttorneyCard`s by reference
- The MDX body (long-form practice description)
- A `TestimonialPullquote` for that practice area (filtered by reference)
- `FeeTransparency` block
- Per-page disclaimer (`<Disclaimer id="practice-area" />`)
- CTA

### `src/layouts/BlogPostLayout.astro`

Wraps `BaseLayout`, owns:
- Post header (title, author byline → links to attorney bio, publication date)
- The MDX body (`<slot />`)
- Author bio card at the bottom
- Per-post disclaimer (`<Disclaimer id="blog" />`)
- Per-post JSON-LD `Article` schema

---

## Where the Disclaimer Text Lives

**Single source of truth:** `src/content/disclaimers/disclaimers.json`, loaded as
an Astro content collection with strict schema (see schema section above).

```json
{
  "footer": {
    "id": "footer",
    "text": "The information on this website is for general informational purposes only. Nothing on this site should be taken as legal advice...",
    "lastReviewed": "2026-05-25"
  },
  "contact": { "id": "contact", "text": "...", "lastReviewed": "2026-05-25" },
  "blog":    { "id": "blog",    "text": "...", "lastReviewed": "2026-05-25" },
  "practice-area": { ... },
  "attorney": { ... }
}
```

Every page renders `<Disclaimer id="..." />`. The component reads the right
entry by id and renders the text inside a clearly-styled container. **One file
to edit when compliance counsel updates wording.** The `lastReviewed` field
gives a compliance audit trail.

---

## How JSON-LD Is Composed and Injected

**Pattern: one `<JsonLd />` component, multiple builder functions in `src/lib/jsonld.ts`.**

Why this pattern (not one component per schema type):
1. The component is responsible for rendering a `<script type="application/ld+json">`
   tag. The shape of that tag is identical regardless of schema. Forking the
   component per schema type would be three components that differ only in their
   prop type.
2. The builder functions are pure TypeScript and easy to unit-test (no Astro
   needed).
3. Schema types share fields (organization name, URL, sameAs). Builders can
   compose.

```typescript
// src/lib/jsonld.ts
import { SITE } from './site';

export function buildLegalServiceLd() {
  return {
    "@context": "https://schema.org",
    "@type": "LegalService",
    "name": SITE.name,
    "url": SITE.baseUrl,
    "telephone": SITE.phone,
    "address": [
      { "@type": "PostalAddress", "streetAddress": "555 California St., Suite 4925",
        "addressLocality": "San Francisco", "addressRegion": "CA", "postalCode": "94104",
        "addressCountry": "US" }
    ],
    "areaServed": "United States",
    "knowsAbout": ["Mergers and Acquisitions", "Intellectual Property",
                    "Technology Transactions", "Tax", "Cryptocurrency Taxation"],
    "award": "Chambers USA Spotlight 2026 — Leading Firm, M&A"
  };
}

export function buildPersonLd(attorney: AttorneyEntry) { /* ... */ }
export function buildArticleLd(post: BlogEntry, author: AttorneyEntry) { /* ... */ }
```

```astro
---
// src/components/seo/JsonLd.astro
interface Props { type: 'LegalService' | 'Person' | 'Article'; data: object; }
const { data } = Astro.props;
---
<script type="application/ld+json" set:html={JSON.stringify(data)} />
```

**Where it's invoked:**
- `BaseLayout.astro` always emits `LegalService` (firm-wide, every page).
- `AttorneyLayout.astro` adds `Person` via the `head` slot.
- `BlogPostLayout.astro` adds `Article` via the `head` slot.
- `PracticeAreaLayout.astro` can optionally add a `Service` schema if SEO needs it.

---

## Where SEO Meta Comes From

A single `SeoHead.astro` component handles every meta tag. Each page type
populates it from a different source:

| Page type             | `title`                          | `description`                                | `ogImage`                                |
|-----------------------|----------------------------------|----------------------------------------------|------------------------------------------|
| Homepage              | hardcoded in `index.astro`       | hardcoded in `index.astro`                   | static `/og/home.png` in `public/`       |
| `/about`              | hardcoded in `about.astro`       | hardcoded in `about.astro`                   | static `/og/about.png`                   |
| `/contact`            | hardcoded                        | hardcoded                                    | static `/og/contact.png`                 |
| `/practice-areas/[slug]` | `entry.data.seoTitle ?? entry.data.title + " — BSV Law"` | `entry.data.seoDescription ?? entry.data.summary` | per-practice-area image or default |
| `/attorneys/[slug]`   | `entry.data.name + " — BSV Law"` | `entry.data.focus`                           | headshot or default `/og/attorney.png`   |
| `/blog/[slug]`        | `entry.data.title + " — BSV Blog"` | `entry.data.description`                   | `entry.data.cover` or default `/og/blog.png` |

Defaults and helpers (`SITE_NAME`, `BASE_URL`, default OG image) live in
`src/lib/site.ts` and `src/lib/seo.ts`. The page templates pass props into the
layout, which passes them into `SeoHead`. No string concatenation hidden in
components.

---

## Contact Form Wiring

**Two equally valid options. Recommendation: Astro Actions.**

### Option A (recommended): Astro Actions

`src/actions/index.ts` defines a server function with Zod validation built in.
The form `<form>` element uses `action={actions.submitContact}` and the
component imports `actions` from `astro:actions`. Astro handles wiring the
request, parsing form data, running validation, and surfacing field-level
errors back to the form on validation failure. (Verified pattern from Astro
docs.)

```typescript
// src/actions/index.ts
import { defineAction } from 'astro:actions';
import { z } from 'astro/zod';

export const server = {
  submitContact: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(1).max(120),
      email: z.string().email().max(200),
      phone: z.string().max(40).optional(),
      organization: z.string().max(160).optional(),
      matter: z.enum(['M&A', 'IP & Tech Transactions', 'Tax', 'Other']),
      message: z.string().min(20).max(5000),
      // honeypot — must be empty; if filled, bot
      website: z.string().max(0).optional(),
      // explicit consent for ABA 477R / pre-engagement disclaimer
      acknowledged: z.literal('on'),
    }),
    async handler(input, ctx) {
      if (input.website && input.website.length > 0) {
        // honeypot triggered — silently accept then discard
        return { ok: true };
      }
      // dispatch to chosen backend (Resend / Formspree / SMTP / CRM webhook)
      await dispatchInquiry(input);
      return { ok: true };
    },
  }),
};
```

**Why Actions over a manual API route:**
- Validation lives next to the dispatch logic.
- Error states (field-level) flow back to the form via `Astro.getActionResult()`
  with `isInputError()` — verified in docs.
- Less custom server code; less surface area for security bugs.

### Option B: API route at `src/pages/api/contact.ts`

A plain POST endpoint. The form posts to `/api/contact` via standard HTML form
submission. Validation, honeypot check, dispatch all live in that file. Use this
if Jon's chosen backend has SDK quirks that don't compose cleanly with Actions.

### Where validation lives

**Server-side, always.** `src/lib/validation.ts` exports the Zod schema once; the
Action imports it and the client-side JS (if any) imports the *types* derived
from it. Never trust the browser.

### Where the honeypot field lives

Three locations:
1. **`HoneypotField.astro`** — renders a `<input name="website" tabindex="-1"
   aria-hidden="true" autocomplete="off" />` inside a hidden wrapper (visually
   hidden via Tailwind `sr-only` + `position: absolute; left: -9999px`). Humans
   never see it; bots fill all fields.
2. **`ContactForm.astro`** — includes `<HoneypotField />` once.
3. **Server action handler** — if `input.website` is non-empty, silently accept
   (return `{ ok: true }`) and discard. Silent acceptance is better than rejection
   because rejecting signals "honeypot present" to sophisticated bots.

### Choosing the backend (deferred to form phase per CLAUDE.md)

The architecture above is backend-agnostic. The `dispatchInquiry()` function
is the one place that changes when Jon picks Supabase / Resend / Formspree /
SMTP / webhook. Everything upstream of it (validation, honeypot, form UI) is
identical regardless.

---

## Tailwind v4 Specifics

**Verified against `tailwindlabs/tailwindcss.com` docs (HIGH confidence).**

Tailwind v4 is configured **in CSS, not in JavaScript.** No `tailwind.config.js`.
The entire design system lives in `src/styles/global.css`:

```css
/* src/styles/global.css */
@import "tailwindcss";

@theme {
  /* === BSV DESIGN TOKENS === */
  /* Colors — to be finalized in design phase. Placeholder values shown. */
  --color-ink:         oklch(0.18 0.02 250);  /* near-black, slightly cool */
  --color-paper:       oklch(0.99 0.005 90);  /* warm white */
  --color-accent:      oklch(0.45 0.10 230);  /* deep navy */
  --color-muted:       oklch(0.55 0.01 250);  /* subdued text */
  --color-rule:        oklch(0.92 0.005 250); /* hairline dividers */

  /* Typography */
  --font-sans: "Inter", "system-ui", "sans-serif";       /* body */
  --font-display: "Inter Tight", "system-ui", "sans-serif"; /* headlines */

  /* Custom breakpoint for full-bleed desktop hero */
  --breakpoint-3xl: 1920px;

  /* Easing for restrained UI transitions */
  --ease-fluid: cubic-bezier(0.3, 0, 0, 1);
}

/* Optional: site-wide base styles */
@layer base {
  body { @apply bg-paper text-ink font-sans antialiased; }
  h1, h2, h3 { @apply font-display tracking-tight; }
  a { @apply underline-offset-4; }
}
```

**Astro integration is the Vite plugin** (verified from docs):

```bash
npx astro add tailwind     # Astro 5.2.0+ → installs @tailwindcss/vite + sets up
```

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://bsvlaw.com',
  integrations: [mdx(), sitemap()],
  adapter: vercel(),
  vite: { plugins: [tailwindcss()] },
});
```

**Key Tailwind v4 idioms that matter for this project:**

1. **Tokens are CSS variables.** Every `--color-*`, `--font-*`, `--breakpoint-*`
   in `@theme` becomes a Tailwind utility class (`bg-paper`, `text-ink`,
   `font-display`, `3xl:px-32`). Renaming a color = global rename.
2. **No `tailwind.config.js`** — do not create one. v4 ignores it. If a third
   party plugin needs JS config, that's the only reason to add one.
3. **`@layer base` for typography defaults.** Body font, heading font, link
   styles. Keep `@layer base` lean — components own their own styling.
4. **OKLCH for color** is the v4 default in docs; it gives perceptually uniform
   color and accessible contrast easier than HSL. Acceptable to use hex
   (`--color-accent: #1e3a5f`) if Jon's design tool emits hex.
5. **Class composition with `@apply`** is fine for layout primitives (e.g.,
   the page-content container width) but should not be the default — utilities
   on the element are clearer.

---

## Astro 6 / Tailwind v4 Patterns Worth Internalizing

1. **Content Layer API** — `glob()` and `file()` loaders from `astro/loaders`
   are the current pattern. Old-style content collections (no `loader`) are
   superseded.
2. **`render(entry)`** is the current API for rendering an MDX/Markdown entry,
   not the older `entry.render()`. Verified in docs as the post-v5 pattern.
3. **`reference('collectionName')`** creates typed cross-collection links.
   Blog post `author` referencing an attorney entry will fail the build if the
   author file doesn't exist. Use this aggressively — it's free correctness.
4. **`image()` in schema** auto-validates and pipes through Astro's image
   optimization. This is the mechanism by which the 200 KB image budget gets
   *enforced* — Astro will warn at build time when a committed image is too
   large.
5. **Astro Actions for forms** — defined in `src/actions/index.ts`, invoked via
   `action={actions.X}` in form, results read via `Astro.getActionResult(actions.X)`.
6. **`<slot name="head" />` in BaseLayout** to let child layouts inject extra
   `<meta>` and JSON-LD without rewriting the head.
7. **Tailwind v4 CSS-first config (`@theme`)** — design tokens are CSS variables,
   not JS objects.
8. **`@tailwindcss/vite` plugin** is the integration (not `@astrojs/tailwind`,
   which was the v3 path).

---

## Data Flow

### Build-time flow (every page except contact form action)

```
1. Markdown/JSON files in src/content/
        ↓
2. content.config.ts validates each entry against its Zod schema
        ↓
3. Page template calls getCollection() or getEntry()
        ↓
4. Page template passes entry data to its Layout as props
        ↓
5. Layout composes BaseLayout + components + slots
        ↓
6. Astro renders each page to static HTML in dist/
        ↓
7. Vercel CDN serves dist/ as static files
```

### Runtime flow (contact form only)

```
1. User fills form → submits to actions.submitContact (POST)
        ↓
2. Astro Action runs on Vercel function runtime
        ↓
3. Zod input schema validates → honeypot check → dispatchInquiry()
        ↓
4. dispatchInquiry() sends email / writes to backend (TBD)
        ↓
5. Action returns { ok: true } or input errors
        ↓
6. Astro.getActionResult() in contact.astro shows success or field errors
```

### How content reaches the page (concrete example: attorney bio)

```
src/content/attorneys/aaron-belcher.mdx
    ↓ (loader: glob; schema: attorneys collection schema)
astro:content typed entry { data: AttorneyData, body: '...' }
    ↓ (in src/pages/attorneys/[slug].astro)
getStaticPaths() emits one path per non-draft attorney
    ↓
Page receives `entry` prop
    ↓
AttorneyLayout wraps: AttorneyBioHeader + EducationList + Content + DealList + Disclaimer + CTABlock
    ↓
BaseLayout wraps that with SeoHead + JsonLd(Person) + SiteHeader + SiteFooter
    ↓
dist/attorneys/aaron-belcher/index.html
```

---

## Recommended Build Order

The order below is a dependency-ordered build sequence. Each step depends on
the prior step's outputs.

| Order | What | Why this order |
|-------|------|----------------|
| 1     | `astro.config.mjs`, `tsconfig.json`, `package.json` with Astro 6 + MDX + Sitemap + Vercel adapter + `@tailwindcss/vite` | Everything else depends on the toolchain compiling. |
| 2     | `src/styles/global.css` with `@theme` design tokens (color palette deferred to design phase — use neutrals until then) | Components built next will use these tokens. |
| 3     | `src/lib/site.ts` — SITE_NAME, BASE_URL, address, phone, email constants | Used by SiteFooter, SeoHead, JsonLd. |
| 4     | `BaseLayout.astro` and chrome components (`SiteHeader`, `SiteNav`, `SiteFooter`, `SkipToContent`, `Disclaimer`) | Every page depends on these. Build the shell first, then fill it. |
| 5     | `SeoHead.astro` + `JsonLd.astro` + `src/lib/jsonld.ts` (LegalService builder only at this stage) | Wire SEO into BaseLayout from day one — adding it later means revisiting every page. |
| 6     | `src/content.config.ts` — all five collection schemas | Content authoring can't begin until schemas exist; this gates the next four steps. |
| 7     | `src/content/disclaimers/disclaimers.json` (placeholder text Jon will replace) + Disclaimer component reads it | Unblocks per-page disclaimers. |
| 8     | Section components — `Hero`, `CTABlock`, `AttorneyCard`, `AttorneyGrid`, `PracticeAreaCard`, `PracticeAreaGrid`, `TestimonialPullquote`, `ChambersBadge`, `FeeTransparency` | Reusable pieces homepage and section indexes will compose. |
| 9     | Homepage (`/`), `/about`, `/practice-areas` index, `/attorneys` index, `/blog` index | Index pages. They use components from step 8 but don't need dynamic routes. |
| 10    | `AttorneyLayout` + `bio/` components + `src/pages/attorneys/[slug].astro` + populate the four ready attorney content files (Susan Jiang stays `draft: true` until bio arrives) | First dynamic route. Builds on collection schemas (step 6). |
| 11    | `PracticeAreaLayout` + `src/pages/practice-areas/[slug].astro` + three practice-area content files | Second dynamic route. Uses references to attorneys from step 10. |
| 12    | `BlogPostLayout` + `src/pages/blog/[slug].astro` + first welcome post + extend `JsonLd` with `Article` builder | Third dynamic route. Uses references to attorneys. |
| 13    | `ContactForm` + `HoneypotField` + `src/actions/index.ts` + `src/lib/validation.ts` + `/contact` page. **Backend dispatch stub** (real backend chosen in form phase per CLAUDE.md.) | Form is the only server-side surface and depends on everything visual being in place. |
| 14    | `vercel.json` security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) + verify env vars are Vercel-only | Security phase. Site is functionally complete; now hardened. |
| 15    | Sitemap (`@astrojs/sitemap` integration emits it), `robots.txt`, OG images, final image-budget audit, pre-launch `/hc-firm-site:check` | Launch prep. |

**The "everything depends on this" foundation:** steps 1-5 must be solid before
step 6. If the design tokens or layout shell change later, every page rebuilds
visually. Get the chrome right first.

**The "build it once" surfaces:** schemas (step 6), Disclaimer plumbing (step 7),
SEO/JSON-LD wiring (step 5). These should be touched rarely after they're done.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Hardcoding attorney info into pages

**What people do:** Put Aaron Belcher's bio paragraphs directly in
`src/pages/attorneys/aaron-belcher.astro`.

**Why it's wrong:** Six months from now, when Jon needs to update Aaron's
representative deals, he has to edit a `.astro` file (with code in it) instead
of a `.mdx` file (with just frontmatter and prose). The site becomes hostile
to a non-technical maintainer.

**Do this instead:** One dynamic route file (`[slug].astro`) reads from the
content collection. Editing an attorney means editing the matching MDX file.

### Anti-Pattern 2: Duplicating the disclaimer text in every layout

**What people do:** Paste the disclaimer string into the footer component, then
again into the blog layout, then again into the practice-area layout.

**Why it's wrong:** Compliance counsel updates the wording → you must edit
five files. One gets missed. The site is now out of compliance.

**Do this instead:** Disclaimer text lives once in `disclaimers.json`. The
`<Disclaimer id="..." />` component reads from there. One edit, propagates
everywhere.

### Anti-Pattern 3: Client-side-only form validation

**What people do:** Use HTML5 `required` and call it done.

**Why it's wrong:** A bot can POST any payload it wants directly to the action.
Server must validate. ABA Formal Opinion 477R puts an affirmative duty on the
firm to protect client communications — accepting unvalidated form data is
incompatible with that.

**Do this instead:** Zod schema in `src/lib/validation.ts`, imported by the
Action. Browser validation is a UX nicety on top; the server is the source of
truth.

### Anti-Pattern 4: Mega-nav with empty dropdowns

**What people do:** Build a multi-column dropdown nav because "law firm sites
have those."

**Why it's wrong:** BSV has 3 practice areas and 5 attorneys. A mega-nav for
that is theatrical and signals BigLaw aesthetic — the opposite of the brief.

**Do this instead:** Simple five-item horizontal nav. On mobile, hamburger →
vertical stack.

### Anti-Pattern 5: One component per JSON-LD schema type

**What people do:** Create `LegalServiceLd.astro`, `PersonLd.astro`,
`ArticleLd.astro` — three near-identical components.

**Why it's wrong:** All three components have the same body
(`<script type="application/ld+json" set:html={JSON.stringify(data)} />`).
Duplication for no payoff.

**Do this instead:** One `JsonLd.astro` component + builder functions in
`src/lib/jsonld.ts`. Test the builders in isolation.

### Anti-Pattern 6: Putting images in `public/` then forgetting to optimize them

**What people do:** Drop the 4 MB headshot JPG into `public/images/attorneys/`.

**Why it's wrong:** Astro doesn't process anything in `public/`. The 200 KB
budget is violated silently. Mobile performance tanks.

**Do this instead:** Import images via the content collection's `image()` schema
or import them in `.astro` files from `src/assets/`. Astro's image pipeline
optimizes them automatically. Use `public/` only for files that *must* live at
a known URL (favicon, robots.txt, OG previews referenced by URL).

### Anti-Pattern 7: Reaching for client-side JavaScript by default

**What people do:** Build the practice-area cards as a React component.

**Why it's wrong:** Astro's whole value proposition is shipping zero JS by
default. The practice-area cards are static text and a link. They should ship
as HTML and weigh nothing.

**Do this instead:** Use `.astro` components. Only reach for an interactive
framework (`client:load`, React/Preact island) when there's real interactivity
— and on a marketing site with one form, that need is rare. The contact form
itself can be progressive: it works without JS (standard form POST to the
Action endpoint), and JS only enhances error display.

---

## Scaling Considerations

Marketing sites don't scale the way SaaS does. Pages don't get heavier when
traffic grows; CDN handles it. The dimensions that *do* matter here:

| Dimension | Today | If it grows | Adjustment |
|-----------|-------|-------------|------------|
| Number of attorneys | 5 | 10-15 | No change — same dynamic route handles N attorneys. |
| Number of practice areas | 3 | 5-7 | No change. Possibly add sub-areas (`/practice-areas/m-and-a/cross-border`) — new dynamic route. |
| Number of blog posts | 0-10/year | 50+/year | Add tag pages, pagination on `/blog`, RSS feed (`@astrojs/rss` integration). |
| Contact form submissions | Low (referral-driven firm) | If growth surprises | Add rate limiting on the Action; promote backend from Resend-only to Resend + CRM. |
| Languages | English only | Mandarin added | Astro i18n routing; `[lang]/[slug]` patterns. Out of scope for v1. |

The architecture as designed supports all of these without restructuring.

---

## Integration Points

### External Services

| Service | Integration pattern | Notes |
|---------|---------------------|-------|
| **Vercel** | `@astrojs/vercel` adapter in `astro.config.mjs` | Auto-deploy on push to `main`. Build runs Astro → static output in `dist/` → Vercel hosts. |
| **GitHub** | Standard git remote | Source of truth for code; never store secrets here. |
| **Contact backend (TBD)** | Called from `dispatchInquiry()` in `src/actions/index.ts` | Single line of change when backend is chosen. Credentials in Vercel env vars only. |
| **MDX** | `@astrojs/mdx` integration | Blog posts and (optionally) practice-area bodies are MDX, enabling component embeds in prose. |
| **Sitemap** | `@astrojs/sitemap` integration | Auto-generates `/sitemap-index.xml` based on built routes. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Content (MDX/JSON) ↔ Pages | `getCollection()` / `getEntry()` from `astro:content` | One direction: pages read content. Content never imports from pages. |
| Pages ↔ Layouts | Astro component props + slots | Pages pass typed props. Slots transfer content. |
| Layouts ↔ Components | Props + slots | Same. |
| Forms ↔ Server (Action) | `actions.X` typed function call | Astro generates the client glue. Validation is shared via `src/lib/validation.ts`. |
| Components ↔ External JS | Avoided by default | If needed, opt-in with `client:load` / `client:visible` directives. |

---

## How to Keep the Architecture Friendly to Jon

This site is going to outlive its build. Six months from now, Jon needs to be
able to publish a blog post, swap a headshot, fix a typo on a practice-area
page, and update the disclaimer text — without asking Claude.

Design choices that protect that:

1. **All editable content lives in `src/content/`. Nothing else.** Pages and
   components are infrastructure; treat them like plumbing. The day-to-day edit
   is always a `.mdx` or `.json` file with frontmatter.

2. **Frontmatter field names use plain English.** `name`, not `displayName`.
   `email`, not `contactEmailAddress`. `tags`, not `taxonomies`. When Jon
   opens `aaron-belcher.mdx`, the field names tell him what they're for.

3. **One file per concern.** When something is wrong, the file tree tells you
   where to look. Disclaimer wrong? `disclaimers.json`. Wrong photo? Find the
   attorney's MDX file and look at the `headshot` field. Wrong color? Open
   `global.css`.

4. **Comments where the WHY isn't obvious.** Astro and Tailwind both have a
   little syntax. Where syntax could puzzle a non-coder, leave a comment:
   ```astro
   ---
   // This page lists every attorney whose `draft` field is false.
   // To add an attorney: create a new .mdx file in src/content/attorneys/
   // To hide an attorney: set `draft: true` in their frontmatter.
   ---
   ```

5. **No magic strings.** Constants in `src/lib/site.ts` (`SITE_NAME`, `BASE_URL`,
   `OFFICE_ADDRESSES`, `MAIN_PHONE`). When the firm moves offices or adds a
   number, one file changes.

6. **README files in `src/content/` subfolders.** A 3-line `README.md` in
   `src/content/attorneys/` explaining "this folder = attorney bios; one .mdx
   per attorney; field reference is in content.config.ts" is worth more than
   any external documentation.

7. **No JS-heavy interactive components unless they earn their place.** Every
   interactive component is one more thing that can break in a way Jon can't
   diagnose. The Norm Law reference site ships virtually no client-side JS;
   ours should too.

8. **The contact form's failure mode is a plain HTML form submission.** Even
   if every JavaScript bundle on the page fails to load, the form should still
   POST and the server should still handle it. Astro Actions support this
   pattern natively.

9. **Decision log discipline.** Every architectural choice we make goes into
   `.planning/DECISIONS.md` per the CLAUDE.md instruction. Future-Jon (or any
   future maintainer) reads that file and understands why the code looks the
   way it does without spelunking through git history.

---

## Sources

- **Astro Content Collections + Zod schemas** (HIGH): Context7
  `/llmstxt/astro_build_llms_txt` — multiple verified snippets covering
  `defineCollection`, `glob`/`file` loaders, `reference()`, `image()` helper,
  and `render()`. Cross-checked against `docs.astro.build/llms-full.txt`.
- **Dynamic routes with `getStaticPaths`** (HIGH): Context7
  `/llmstxt/astro_build_llms_txt` — verified pattern.
- **Astro Actions for form handling + Zod validation + `isInputError()` + form
  redirect pattern** (HIGH): Context7 `/llmstxt/astro_build_llms_txt`.
- **Layout slot transfer pattern** (HIGH): Context7 docs verified
  (`BaseLayout` + child layouts with named `head` slot).
- **Vercel adapter configuration** (HIGH): Context7 docs verified.
- **Tailwind CSS v4 `@theme` directive + CSS-first config + `@tailwindcss/vite`
  plugin + Astro integration via `astro add tailwind`** (HIGH): Context7
  `/tailwindlabs/tailwindcss.com` — multiple verified snippets.
- **JSON-LD via `<script type="application/ld+json">` in Astro `<head>`** —
  rendering pattern verified by Astro's Head/SEO pattern docs; schema shapes
  from `schema.org` LegalService / Person / Article conventions (general
  domain knowledge, MEDIUM confidence on exact field choices — recommend a
  schema validator check in QA).
- **ABA Formal Opinion 477R** — referenced in CLAUDE.md and FIRM_BRIEF.md;
  applied here as the rationale for server-side validation + protected intake.
- **"Astro 6" version naming** (MEDIUM): Context7-indexed docs reference
  Astro 5.16.15 as the documented current release. The Content Layer + Actions
  + Vercel adapter + `@tailwindcss/vite` patterns documented here are the
  stable post-v5 patterns and will carry into v6. If the installed `astro`
  package on Jon's machine resolves to v5.x, the architecture is unaffected;
  if it resolves to v6.x, this document is forward-compatible.

---
*Architecture research for: Belcher, Smolen & Van Loo LLP marketing website*
*Researched: 2026-05-25*
