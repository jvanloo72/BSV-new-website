import { defineCollection, z } from 'astro:content';
import { file } from 'astro/loaders';

/* Phase 1 ships only the `disclaimers` collection. Plan 02 EXTENDS this
 * `collections` export with `attorneys`, `practiceAreas`, `blog`, and
 * `testimonials`. Do NOT replace the export — add keys to it. */

const disclaimers = defineCollection({
  loader: file('src/content/disclaimers/disclaimers.json'),
  schema: z.object({
    id: z.enum(['footer', 'contact', 'blog', 'practice-area', 'attorney']),
    text: z.string(),
    version: z.string(),
  }),
});

export const collections = { disclaimers };
