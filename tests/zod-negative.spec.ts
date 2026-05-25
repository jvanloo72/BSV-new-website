// tests/zod-negative.spec.ts
//
// Wave 0 scaffold (Plan 01-00). Body skipped — Plan 02 wires it up.
//
// Purpose (D-24): prove that a blog post missing the required `author` field
// causes the Astro build to fail. The negative-test fixture lives at
// `tests/fixtures/broken-blog-post.mdx` (outside src/content/, so the content
// collection glob does not pick it up at normal build time).

import { test, expect } from '@playwright/test';

test.skip('blog post with missing author fails build — implementation lands in Plan 02', async () => {
  // TODO: Plan 02 implements:
  //   1. Copy `tests/fixtures/broken-blog-post.mdx` into `src/content/blog/`.
  //   2. Run `npm run build` via child_process.
  //   3. Assert exit code !== 0.
  //   4. Assert stderr contains a Zod error mentioning the missing `author` field.
  //   5. Remove the copied file (even on test failure — use try/finally).
  expect(true).toBe(true);
});
