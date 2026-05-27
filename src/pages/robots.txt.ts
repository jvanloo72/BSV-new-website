/* /robots.txt (SEO-08) — generated as an Astro static endpoint so it ships in
   the build output (dist/client/robots.txt) without adding a dependency.
 *
 * Allows all crawlers and points them at the sitemap index that
 * @astrojs/sitemap emits. It deliberately does NOT advertise the hidden
 * /design-system gallery (T-03-08 / D-16): that route is already excluded from
 * the sitemap and carries a noindex meta tag, and naming it in a public
 * Disallow line would only reveal its existence. We keep robots.txt minimal so
 * it cannot leak internal routes.
 *
 * `site` is read from astro.config.mjs (https://bsvlaw.com).
 */
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  const sitemapUrl = new URL('sitemap-index.xml', site).href;

  const body = `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
