/* BLOG-06: Full-content RSS feed at /blog/rss.xml. Built at compile time as a
 * static endpoint (NOT a serverless function — Pitfall 11). MDX bodies are
 * rendered to a string via the Astro Container API (RESEARCH Pattern 5),
 * URL-rewritten from relative to absolute, and scrubbed via sanitize-html with
 * `img` added to the allowedTags default (Pitfall 3). Per item: `<author>` is
 * the attorney's full name; the email is NEVER emitted (D-08 / T-05-03).
 * Drafts are filtered (Pitfall 9).
 */
import rss from '@astrojs/rss';
import { getCollection, getEntry, render } from 'astro:content';
import { experimental_AstroContainer } from 'astro/container';
import { loadRenderers } from 'astro:container';
import { getContainerRenderer as getMDXRenderer } from '@astrojs/mdx';
import sanitizeHtml from 'sanitize-html';
import { SITE } from '../../lib/site';
import type { APIRoute } from 'astro';

export const GET: APIRoute = async (context) => {
  // Pitfall 9: draft posts must NEVER appear in the public feed.
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  // Stable order: newest first by publishedAt (RESEARCH Pattern 5).
  const sorted = posts.sort(
    (a, b) => +b.data.publishedAt - +a.data.publishedAt,
  );

  // Initialise the MDX renderer once for the whole feed build.
  const container = await experimental_AstroContainer.create({
    renderers: await loadRenderers([getMDXRenderer()]),
  });

  const items = await Promise.all(
    sorted.map(async (post) => {
      // 2026-05-28 — category-aware author resolution. Insight posts have a
      // required author reference; deal-announcement posts have none (firm-
      // attributed). When author is absent, the feed item's <author> field
      // becomes the firm name. D-08 invariant (no email) holds in both branches.
      const author = post.data.author ? await getEntry(post.data.author) : undefined;
      if (post.data.author && !author) {
        throw new Error(
          `RSS: blog post '${post.data.slug}' references unknown author`,
        );
      }
      const { Content } = await render(post);
      const rawHtml = await container.renderToString(Content);

      // Rewrite root-relative URLs (e.g. <a href="/attorneys/jon-van-loo">) to
      // absolute so feed-reader clicks land on bsvlaw.com. The regex only
      // matches /-leading, not //-leading (protocol-relative) — defensive
      // against scheme-strip attacks (T-05-RELURL).
      const absoluteHtml = rawHtml.replace(
        /(href|src)="\/(?!\/)/g,
        `$1="${SITE.baseUrl}/`,
      );

      const cleanHtml = sanitizeHtml(absoluteHtml, {
        // sanitize-html defaults strip <script>, <iframe>, <form>, <style>,
        // on*-handlers. We add <img> because the default permits
        // img-as-attribute, NOT img-as-tag (Pitfall 3).
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        // defaults.allowedAttributes already cover a:[href,name,target] and
        // img:[src,srcset,alt,title,width,height,loading].
      });

      return {
        title: post.data.title,
        link: `${SITE.baseUrl}/blog/${post.data.slug}`,
        pubDate: post.data.publishedAt,
        // D-08 / T-05-03: name only, NEVER the email field. Deal announcements
        // (no Person author) are attributed to the firm.
        author: author ? author.data.name : SITE.name,
        description: post.data.summary,
        content: cleanHtml,
      };
    }),
  );

  return rss({
    title: 'BSV Insights',
    description:
      "Practical analysis from the BSV team on M&A, IP & technology transactions, and tax for the companies building what's next.",
    // context.site comes from astro.config.mjs `site:` — fallback to
    // SITE.baseUrl for defensive parity (verified non-undefined, but defensive).
    site: context.site ?? new URL(SITE.baseUrl),
    items,
    customData: '<language>en-us</language>',
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
  });
};
