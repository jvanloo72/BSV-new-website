import { defineCollection, reference, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

/* Five content collections per D-04..D-08. Schemas are the safety net that
 * catches missing fields and bad cross-references at build time. */

// D-04 — attorneys
const attorneys = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/attorneys' }),
  schema: ({ image }) => z.object({
    name: z.string(),
    slug: z.string(),
    title: z.enum(['Partner', 'Associate', 'Counsel']),
    barAdmissions: z.array(z.string()).default([]),
    education: z.array(z.object({
      degree: z.string(),
      school: z.string(),
      year: z.number().optional(),
      honors: z.string().optional(),
    })),
    focus: z.string(),
    priorFirms: z.array(z.string()).default([]),
    representativeDeals: z.array(z.object({
      parties: z.string(),
      value: z.string().optional(),
      role: z.string().optional(),
      cleared: z.boolean(),
    })).default([]),
    recognition: z.array(z.string()).default([]),
    clerkship: z.string().optional(),
    languages: z.array(z.string()).default(['English']),
    email: z.string().email(),
    phone: z.string().optional(),
    headshot: image(),
    headshotAlt: z.string(),
    order: z.number(),
    draft: z.boolean().default(false),
  }),
});

// D-05 — practiceAreas (leadAttorneys cross-references attorneys)
const practiceAreas = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/practiceAreas' }),
  schema: ({ image }) => z.object({
    name: z.string(),
    slug: z.string(),
    summary: z.string(),
    clientProblem: z.string(),
    bsvApproach: z.string(),
    representativeDeals: z.array(z.string()).default([]),
    leadAttorneys: z.array(reference('attorneys')).min(1),
    faqs: z.array(z.object({
      question: z.string(),
      answer: z.string(),
    })).default([]),
    feeStructureBand: z.boolean().default(true),
    icon: image().optional(),
    order: z.number(),
    draft: z.boolean().default(false),
  }),
});

// D-06 — blog (category-aware: 'insight' posts require an attorney author +
// practiceArea; 'deal-announcement' posts are firm-attributed and must NOT
// set author or practiceArea). Schema introduced 2026-05-28 to support
// importing ~14 historical bsvlaw.com/news posts, most of which are
// firm-attributed deal announcements rather than named-attorney insights.
//
// Refinement contracts:
//   - cover ⇒ coverAlt non-empty           (WCAG 2.1 SC 1.1.1, Phase 5 05-01)
//   - category=insight ⇒ author + practiceArea present   (FOUND-04, BLOG-02)
//   - category=deal-announcement ⇒ author + practiceArea ABSENT (firm-only)
const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.mdx', base: './src/content/blog' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    slug: z.string(),
    category: z.enum(['insight', 'deal-announcement']),
    author: reference('attorneys').optional(),
    practiceArea: reference('practiceAreas').optional(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    summary: z.string(),
    cover: image().optional(),
    coverAlt: z.string().optional(),
    draft: z.boolean().default(false),
  })
  .refine(
    (data) => !data.cover || (data.coverAlt !== undefined && data.coverAlt.length > 0),
    { message: 'coverAlt is required when cover is set', path: ['coverAlt'] },
  )
  .refine(
    (data) => data.category !== 'insight' || (data.author !== undefined && data.practiceArea !== undefined),
    { message: 'insight posts require both author and practiceArea', path: ['author'] },
  )
  .refine(
    (data) => data.category !== 'deal-announcement' || (data.author === undefined && data.practiceArea === undefined),
    { message: 'deal-announcement posts must NOT set author or practiceArea (firm-attributed)', path: ['author'] },
  ),
});

// D-07 — testimonials
const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/testimonials' }),
  schema: z.object({
    quote: z.string(),
    attribution: z.string(),
    role: z.string(),
    matter: z.string().optional(),
    practiceArea: reference('practiceAreas').optional(),
    featured: z.boolean().default(false),
  }),
});

// D-08 — disclaimers (single JSON file, multiple entries)
// 2026-05-28: 'footer' removed from the enum — the site-wide footer
// disclaimer was retired in favor of dedicated /legal-notices and
// /attorney-advertising pages linked from the footer (Kirkland
// linked-disclosure pattern). Per-page disclaimers (contact, blog,
// practice-area, attorney) are unchanged.
const disclaimers = defineCollection({
  loader: file('src/content/disclaimers/disclaimers.json'),
  schema: z.object({
    id: z.enum(['contact', 'blog', 'practice-area', 'attorney']),
    text: z.string(),
    version: z.string(),
  }),
});

export const collections = { attorneys, practiceAreas, blog, testimonials, disclaimers };
