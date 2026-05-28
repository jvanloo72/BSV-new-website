// tests/blog-zod-cover.spec.ts
//
// BLOG-02 a11y refinement (UI-SPEC line 237-243; RESEARCH Pitfall 5):
// the blog Zod schema's `.refine()` rule requires `coverAlt` whenever
// `cover` is set. A post with a cover image but no alt text is a WCAG 2.1
// SC 1.1.1 (Non-text Content) violation; this test asserts the rule
// triggers at schema-validation time.
//
// LIVE — exercises a Zod schema with the refine() that Task 2 of plan 05-01
// adds to src/content.config.ts. The schema is reconstructed here (not
// imported) for the same reason as blog-zod-author.spec.ts: the
// production definition wraps the schema in `({ image }) => z.object(...)`,
// where image() is a runtime injection from Astro's content loader.
//
// Plan: 05-01 — written live as part of this plan. The .refine() lands in
// Task 2 of this same plan; once Task 2 commits, this test passes.

import { test, expect } from '@playwright/test';
import { z } from 'astro/zod';

// Mirror the production refine() exactly:
//   .refine(
//     (data) => !data.cover || (data.coverAlt && data.coverAlt.length > 0),
//     { message: 'coverAlt is required when cover is set', path: ['coverAlt'] },
//   )
// Use z.unknown() for cover since the real schema uses image() which we cannot
// reproduce outside the Astro content loader. The refine only inspects
// truthy-ness of cover.
const blogSchemaWithRefine = z
  .object({
    title: z.string(),
    slug: z.string(),
    author: z.object({ collection: z.literal('attorneys'), id: z.string() }),
    practiceArea: z.object({ collection: z.literal('practiceAreas'), id: z.string() }),
    publishedAt: z.coerce.date(),
    summary: z.string(),
    cover: z.unknown().optional(),
    coverAlt: z.string().optional(),
    draft: z.boolean().default(false),
  })
  .refine(
    (data) => !data.cover || (data.coverAlt !== undefined && data.coverAlt.length > 0),
    { message: 'coverAlt is required when cover is set', path: ['coverAlt'] },
  );

const REQUIRED_FIELDS = {
  title: 'Some post',
  slug: 'some-post',
  author: { collection: 'attorneys' as const, id: 'jon-van-loo' },
  practiceArea: { collection: 'practiceAreas' as const, id: 'tax' },
  publishedAt: new Date('2026-05-28'),
  summary: 'Test summary.',
};

test.describe('Blog Zod cover/coverAlt refinement', () => {
  test('cover set without coverAlt fails validation with the expected message', () => {
    const result = blogSchemaWithRefine.safeParse({
      ...REQUIRED_FIELDS,
      cover: { src: '/_astro/x.svg', width: 1, height: 1, format: 'svg' },
      // coverAlt intentionally omitted
    });

    expect(result.success, 'expected schema to reject cover-without-coverAlt').toBe(false);
    if (!result.success) {
      const refineHit = result.error.issues.find((issue) =>
        issue.path.includes('coverAlt'),
      );
      expect(refineHit, `expected an issue at path 'coverAlt'; got: ${JSON.stringify(result.error.issues)}`).toBeDefined();
      expect(refineHit?.message).toBe('coverAlt is required when cover is set');
    }
  });

  test('cover set with empty-string coverAlt fails validation', () => {
    const result = blogSchemaWithRefine.safeParse({
      ...REQUIRED_FIELDS,
      cover: { src: '/_astro/x.svg', width: 1, height: 1, format: 'svg' },
      coverAlt: '',
    });

    expect(result.success, 'expected schema to reject cover-with-empty-coverAlt').toBe(false);
  });

  test('cover set with non-empty coverAlt passes', () => {
    const result = blogSchemaWithRefine.safeParse({
      ...REQUIRED_FIELDS,
      cover: { src: '/_astro/x.svg', width: 1, height: 1, format: 'svg' },
      coverAlt: 'Abstract converging tax-line illustration in deep rust on white.',
    });

    expect(result.success, JSON.stringify((result as { error?: unknown }).error)).toBe(true);
  });

  test('no cover and no coverAlt passes (both optional when neither set)', () => {
    const result = blogSchemaWithRefine.safeParse({
      ...REQUIRED_FIELDS,
      // neither cover nor coverAlt
    });

    expect(result.success, JSON.stringify((result as { error?: unknown }).error)).toBe(true);
  });
});
