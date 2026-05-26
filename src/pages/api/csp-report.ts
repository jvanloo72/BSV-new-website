// src/pages/api/csp-report.ts
//
// CSP violation report sink (D-15 / SEC-02). Browsers receiving the
// Content-Security-Policy-Report-Only header in vercel.json POST violation
// reports here. We log to Vercel function logs (no DB, no third-party sink
// in Phase 1) and return 204. Body size is capped at 8 KB via a streaming
// read so an abusive client cannot make us buffer arbitrary payloads.
//
// IMPORTANT: prerender must be false — without it Astro pre-renders this
// route into a static 404 (output: 'static' is the default), and CSP POSTs
// would never reach a function.

import type { APIRoute } from 'astro';

export const prerender = false;

const MAX_BODY_SIZE = 8 * 1024;

export const POST: APIRoute = async ({ request }) => {
  try {
    const reader = request.body?.getReader();
    if (!reader) {
      return new Response(null, { status: 400 });
    }

    const chunks: Uint8Array[] = [];
    let total = 0;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_SIZE) {
        return new Response(null, { status: 413 });
      }
      chunks.push(value);
    }

    const merged = new Uint8Array(total);
    let offset = 0;
    for (const chunk of chunks) {
      merged.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const body = new TextDecoder().decode(merged);

    // Vercel surfaces console.warn in the project's function logs. We do
    // NOT echo the body back to the browser — CSP reports can contain URLs
    // and source-code paths that should not round-trip to an attacker.
    console.warn('[CSP-REPORT]', body);

    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 400 });
  }
};
