// tests/contrast.spec.ts
//
// A11Y-04 (hard requirement): every text / icon / button color pairing in the
// locked Phase 2 palette must meet the WCAG 2.1 AA contrast floor of 4.5:1.
//
// This is the ONE Wave-0 spec that is ACTIVE (not skipped): it is pure math on
// the locked hex values from 02-UI-SPEC.md §"WCAG contrast" and needs no build
// target. It will go green immediately and stays a guardrail — if anyone edits
// a locked palette hex in src/styles/global.css to a value that drops a pairing
// below AA, this test must be updated in lockstep and will catch a regression.
//
// Idiom B (analog: tests/disclaimer-set.spec.ts) — no build, pure computation
// over a known data set.
//
// The expected ratios in the table below are recomputed for the cool near-black
// minimalist palette (D-32, 2026-05-27, superseding the warm Direction-B values).
// We assert each pairing clears the 4.5:1 AA floor; the comment records the
// expected ratio for documentation. `border #E4E4E7` on `bg #FFFFFF` is a
// decorative hairline (1.27:1) — NOT a text/UI-state boundary — so per UI-SPEC
// §"border/bg" it is intentionally EXEMPT and is not gated here.

import { test, expect } from '@playwright/test';

// --- Locked palette (src/styles/global.css @theme; D-32 cool near-black) ---
const PALETTE = {
  bg: '#FFFFFF',
  text: '#111111',
  textMuted: '#52525B',
  bgElevated: '#FFFFFF',
  border: '#E4E4E7',
  accent: '#9C3F2A',
  accentFg: '#FFFFFF',
  primary: '#0A0A0A',
  primaryFg: '#FFFFFF',
} as const;

const AA = 4.5;

// --- WCAG 2.1 relative-luminance + contrast-ratio implementation ----------
// https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
// https://www.w3.org/TR/WCAG21/#dfn-contrast-ratio

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return [r, g, b];
}

function channelLuminance(value8bit: number): number {
  const c = value8bit / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * channelLuminance(r) + 0.7152 * channelLuminance(g) + 0.0722 * channelLuminance(b);
}

function contrastRatio(fg: string, bg: string): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// --- The gated pairings (UI-SPEC §"WCAG contrast"; expected ratio in comment) --
const PAIRINGS: { name: string; fg: string; bg: string; expected: number }[] = [
  { name: 'text on bg', fg: PALETTE.text, bg: PALETTE.bg, expected: 18.88 },
  { name: 'text-muted on bg', fg: PALETTE.textMuted, bg: PALETTE.bg, expected: 7.73 },
  { name: 'text on bg-elevated', fg: PALETTE.text, bg: PALETTE.bgElevated, expected: 18.88 },
  { name: 'text-muted on bg-elevated', fg: PALETTE.textMuted, bg: PALETTE.bgElevated, expected: 7.73 },
  { name: 'accent on bg (link/icon)', fg: PALETTE.accent, bg: PALETTE.bg, expected: 6.65 },
  { name: 'accent on bg-elevated', fg: PALETTE.accent, bg: PALETTE.bgElevated, expected: 6.65 },
  { name: 'accent-fg on accent (tint label)', fg: PALETTE.accentFg, bg: PALETTE.accent, expected: 6.65 },
  { name: 'primary-fg on primary (button label)', fg: PALETTE.primaryFg, bg: PALETTE.primary, expected: 19.80 },
];

test.describe('WCAG contrast (A11Y-04)', () => {
  test('formula sanity: pure black on white is 21:1, identical colors are 1:1', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
    expect(contrastRatio('#777777', '#777777')).toBeCloseTo(1, 5);
  });

  for (const pairing of PAIRINGS) {
    test(`${pairing.name} clears AA (≥ ${AA}:1)`, () => {
      const ratio = contrastRatio(pairing.fg, pairing.bg);
      expect(
        ratio,
        `${pairing.name} (${pairing.fg} on ${pairing.bg}) measured ${ratio.toFixed(2)}:1, expected ≈${pairing.expected}:1`,
      ).toBeGreaterThanOrEqual(AA);
      // Also assert the computed ratio matches the locked UI-SPEC value, so a
      // hex edit that changes contrast (even if still ≥ AA) is surfaced.
      expect(
        ratio,
        `${pairing.name} ratio drifted from the locked UI-SPEC value`,
      ).toBeCloseTo(pairing.expected, 1);
    });
  }

  test('border on bg is decorative and intentionally NOT gated (documented exempt)', () => {
    // Recorded for documentation: this pairing is ~1.27:1 and is allowed to fail
    // AA because the border is a decorative hairline, not a text/UI-state boundary
    // (UI-SPEC §border/bg, WCAG 1.4.11 does not apply). Do NOT add an AA assertion here.
    const ratio = contrastRatio(PALETTE.border, PALETTE.bg);
    expect(ratio).toBeLessThan(AA);
  });
});
