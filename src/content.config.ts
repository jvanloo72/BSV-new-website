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

// D-06 — blog (author + reviewedBy are REQUIRED editorial gates)
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
    reviewedBy: z.string().min(1),
    cover: image().optional(),
    coverAlt: z.string().optional(),
    draft: z.boolean().default(false),
  }),
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
const disclaimers = defineCollection({
  loader: file('src/content/disclaimers/disclaimers.json'),
  schema: z.object({
    id: z.enum(['footer', 'contact', 'blog', 'practice-area', 'attorney']),
    text: z.string(),
    version: z.string(),
  }),
});

export const collections = { attorneys, practiceAreas, blog, testimonials, disclaimers };
