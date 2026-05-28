#!/usr/bin/env node
/* lint:legal — California Rule 7.4 banned-term scanner (LEGAL-03 / D-16).
 *
 * California Rule of Professional Conduct 7.4 restricts a lawyer from
 * communicating that they are a "certified specialist" or "expert" in a field
 * absent State Bar certification. This script fails the build if any
 * non-allowlisted banned root appears in authored site content.
 *
 * Scope: src/content/ MDX only. The firm brief (.planning/FIRM_BRIEF.md) uses
 * "specialists"/"expertise" describing how BSV curates outside counsel — that
 * file is deliberately NOT scanned. Watch for that phrasing migrating into a
 * practice page; if it ever does, it must be rephrased or added to the
 * allowlist with Jon's explicit sign-off.
 *
 * Banned roots (Assumption A1 — Jon, the attorney of record, confirms the set):
 *   special / specialist(s) / specialize(s/d) / specializing / specialization
 *   expert(s)
 *   expertise   <-- COMPLIANCE QUESTION OPEN (A1): "expertise" as a noun is a
 *                   grey area under Rule 7.4. It is BANNED BY DEFAULT here
 *                   (over-strict is the safe failure mode). If Jon decides a
 *                   specific reviewed phrasing is acceptable, add it to
 *                   scripts/lint-legal.allowlist.json as a {phrase,file,reason}
 *                   row — do NOT loosen this regex globally.
 *
 * Usage:
 *   node scripts/lint-legal.mjs              # scan src/content (recursive .mdx)
 *   node scripts/lint-legal.mjs <file...>    # scan explicit files (e.g. a fixture)
 *
 * Exit code: 1 on any non-allowlisted hit (prints file:line:term), else 0.
 * Node 22 stdlib only — no dependencies.
 */

import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '..', '..');
const CONTENT_DIR = path.join(ROOT, 'src', 'content');
const ALLOWLIST_PATH = path.join(ROOT, 'scripts', 'lint-legal.allowlist.json');

// Word-boundary, case-insensitive banned roots (D-16 / A1).
const BANNED = /\b(special(?:ist|ists|ize[sd]?|izing|ization)|experts?|expertise)\b/gi;

/* Recursively collect *.mdx under a directory. Used instead of fs/promises
 * `glob` for stability across Node images (Assumption A4 fallback). */
async function collectMdx(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out; // directory absent — nothing to scan
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      out.push(...(await collectMdx(full)));
    } else if (e.isFile() && e.name.endsWith('.mdx')) {
      out.push(full);
    }
  }
  return out;
}

async function loadAllowlist() {
  if (!existsSync(ALLOWLIST_PATH)) return [];
  try {
    const raw = await readFile(ALLOWLIST_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/* A hit is suppressed only when BOTH the matched phrase AND the file path match
 * an allowlist row (exact phrase + file). A blanket word is never globally
 * whitelisted — every exception is scoped to one reviewed file. */
function isAllowlisted(allow, relFile, line) {
  return allow.some(
    (row) =>
      row &&
      typeof row.phrase === 'string' &&
      typeof row.file === 'string' &&
      // file match: allowlist row's path is a suffix of the scanned rel path
      (relFile === row.file || relFile.endsWith(row.file)) &&
      line.toLowerCase().includes(row.phrase.toLowerCase()),
  );
}

async function main() {
  const explicit = process.argv.slice(2);
  const files = explicit.length
    ? explicit.map((f) => path.resolve(ROOT, f))
    : await collectMdx(CONTENT_DIR);

  const allow = await loadAllowlist();
  const violations = [];

  for (const file of files) {
    let text;
    try {
      text = await readFile(file, 'utf-8');
    } catch {
      console.error(`lint:legal — could not read ${file}`);
      continue;
    }
    const relFile = path.relative(ROOT, file).split(path.sep).join('/');
    const lines = text.split(/\r?\n/);
    lines.forEach((line, i) => {
      BANNED.lastIndex = 0;
      let m;
      while ((m = BANNED.exec(line)) !== null) {
        if (isAllowlisted(allow, relFile, line)) continue;
        violations.push({ file: relFile, line: i + 1, term: m[0] });
      }
    });
  }

  if (violations.length) {
    console.error('lint:legal — Rule 7.4 banned-term violations found:\n');
    for (const v of violations) {
      console.error(`${v.file}:${v.line}:${v.term}`);
    }
    console.error(
      `\n${violations.length} violation(s). See scripts/lint-legal.mjs header for the allowlist process.`,
    );
    process.exit(1);
  }

  console.log('lint:legal — clean (no Rule 7.4 banned terms).');
  process.exit(0);
}

main();
