// tests/lint-legal.spec.ts
//
// LEGAL-03 / D-16: the real lint:legal Rule 7.4 scanner must (a) exit non-zero
// on a seeded banned term and (b) exit zero on the current clean src/content.
// ACTIVE now (no build needed — the scanner is a standalone Node script).
//
// Mirrors no build-in-beforeAll convention because this is a CLI/unit spec, not
// a rendered-HTML spec. It runs scripts/lint-legal.mjs directly.

import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';

const SCRIPT = 'scripts/lint-legal.mjs';
const FIXTURE = 'tests/_fixtures/lint-legal-violation.mdx';

function runScanner(args: string[]): { code: number; output: string } {
  try {
    const output = execFileSync('node', [SCRIPT, ...args], {
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    return { code: 0, output };
  } catch (err) {
    const e = err as { status?: number; stdout?: string; stderr?: string };
    return {
      code: e.status ?? 1,
      output: `${e.stdout ?? ''}${e.stderr ?? ''}`,
    };
  }
}

test.describe('lint:legal Rule 7.4 scanner', () => {
  test('exits non-zero and reports file:line:term on a banned term', () => {
    const { code, output } = runScanner([FIXTURE]);
    expect(code, 'banned term must fail the scan').not.toBe(0);
    expect(output).toContain('lint-legal-violation.mdx');
    expect(output).toMatch(/:expert\b/i);
  });

  test('exits zero on the current (clean) src/content', () => {
    const { code } = runScanner([]);
    expect(code, 'current content must be clean').toBe(0);
  });
});
