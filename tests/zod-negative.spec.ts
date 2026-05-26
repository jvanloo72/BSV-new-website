// tests/zod-negative.spec.ts
//
// Proves FOUND-04 / D-24 end-to-end: a blog post missing the required
// `author` field causes the Astro build to fail with a Zod error. The
// fixture lives outside src/content/ (at tests/fixtures/) so the regular
// collection globs do not pick it up at normal build time; the test
// copies it in temporarily and removes it in a finally block.

import { test, expect } from '@playwright/test';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

test.describe('Zod negative — missing author', () => {
  test('blog post with missing author fails build', () => {
    const fixture = path.join('tests', 'fixtures', 'broken-blog-post.mdx');
    const target = path.join('src', 'content', 'blog', 'broken-temp.mdx');

    fs.copyFileSync(fixture, target);

    try {
      let stderrOutput = '';
      let buildSucceeded = false;

      try {
        execSync('npm run build', { stdio: 'pipe' });
        buildSucceeded = true;
      } catch (err) {
        const e = err as { stderr?: Buffer | string; stdout?: Buffer | string };
        const stderr = e.stderr ? e.stderr.toString() : '';
        const stdout = e.stdout ? e.stdout.toString() : '';
        stderrOutput = stderr + stdout;
      }

      expect(buildSucceeded, 'Expected build to fail when blog post is missing required author').toBe(false);
      expect(stderrOutput, 'Expected build output to mention the missing author field').toMatch(/author/i);
      expect(
        /required|invalid|expected/i.test(stderrOutput),
        'Expected build output to indicate a Zod constraint violation (required/invalid/expected)',
      ).toBe(true);
    } finally {
      if (fs.existsSync(target)) {
        fs.unlinkSync(target);
      }
    }
  });
});
