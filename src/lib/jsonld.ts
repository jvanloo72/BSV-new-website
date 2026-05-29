/* JSON-LD builders, typed via schema-dts (D-29 / D-30).
 *
 * buildLegalServiceLd() ships in Phase 1 and is injected site-wide by
 * BaseLayout. buildPersonLd() and buildArticleLd() are intentionally
 * stubs; Phases 4 and 5 implement them. The stubs let Plan 01-03 fix the
 * contract (input + output types) without paying the implementation cost
 * yet.
 */

import type { CollectionEntry } from 'astro:content';
import type {
  Article,
  FAQPage,
  LegalService,
  Person,
  WithContext,
} from 'schema-dts';
import { SITE } from './site';

export function buildLegalServiceLd(): WithContext<LegalService> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LegalService',
    name: SITE.name,
    url: SITE.baseUrl,
    telephone: SITE.phone,
    // D-37: full PostalAddress matching the visible footer NAP (street + locality
    // + region + postal + country) for consistent local SEO.
    address: {
      '@type': 'PostalAddress' as const,
      streetAddress: SITE.location.streetAddress,
      addressLocality: SITE.location.addressLocality,
      addressRegion: SITE.location.addressRegion,
      postalCode: SITE.location.postalCode,
      addressCountry: SITE.location.addressCountry,
    },
    areaServed: 'United States',
    knowsAbout: [
      'Mergers and Acquisitions',
      'Intellectual Property',
      'Technology Transactions',
      'Tax',
      'Cryptocurrency Taxation',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'New client intake',
      email: SITE.email,
      telephone: SITE.phone,
      availableLanguage: ['English', 'Mandarin'], // Iris Zhang fluent — FIRM_BRIEF.md.
    },
  };
}

/* Phase 4 (ATTY-09 / SEO-03): takes an attorney CollectionEntry, returns a
 * WithContext<Person>. Slot-transferred into AttorneyLayout's BaseLayout
 * via <JsonLd slot="head" data={buildPersonLd(attorney)} />.
 *
 * D-02 (no fabrication): MUST NOT emit `sameAs`. Profile/social URLs are only
 * added once Jon supplies verified URLs at review — never invented here.
 */
export function buildPersonLd(
  attorney: CollectionEntry<'attorneys'>,
): WithContext<Person> {
  const d = attorney.data;
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: d.name,
    jobTitle: d.title, // 'Partner' | 'Associate' | 'Counsel'
    url: `${SITE.baseUrl}/attorneys/${d.slug}`,
    worksFor: {
      '@type': 'Organization' as const,
      name: SITE.name,
      url: SITE.baseUrl,
    },
    alumniOf: d.education.map((e) => ({
      '@type': 'EducationalOrganization' as const,
      name: e.school,
    })),
    knowsAbout: d.focus
      .split(/[;,]/)
      .map((s) => s.trim())
      .filter(Boolean),
    email: d.email, // mailto-safe; D-08 email-only
    // NB: no `sameAs` — D-02 forbids fabricating profile URLs.
  };
}

/* Phase 4 (PRAC-08 / SEO-05): takes the practiceAreas.faqs shape and returns a
 * WithContext<FAQPage> for AEO/AI-search surfaces. Safe on empty input — the
 * layout decides whether to emit the block (guards on faqs.length === 0).
 */
export function buildFaqPageLd(
  faqs: { question: string; answer: string }[],
): WithContext<FAQPage> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question' as const,
      name: f.question,
      acceptedAnswer: {
        '@type': 'Answer' as const,
        text: f.answer,
      },
    })),
  };
}

/* BLOG-04 / SEO-04: takes a blog post CollectionEntry plus (optionally) the
 * resolved author entry. When `author` is provided (insight category), the
 * Article `author` field is a Person sub-blob. When `author` is undefined
 * (deal-announcement category, firm-attributed), the Article `author` field
 * is an Organization sub-blob (BSV) — same shape as `publisher`. Slot-
 * transferred into BlogPostLayout via <JsonLd slot="head" />. Image fallback:
 * `${SITE.baseUrl}/og-default.svg` when post.data.cover is unset (RESEARCH
 * Open Question 2 resolved via 05-01). D-02: no `sameAs` on the Person
 * sub-blob — never invent profile URLs.
 *
 * Amended 2026-05-28 to add the category=deal-announcement branch.
 */
export function buildArticleLd(
  post: CollectionEntry<'blog'>,
  author?: CollectionEntry<'attorneys'>,
): WithContext<Article> {
  const p = post.data;
  const url = `${SITE.baseUrl}/blog/${p.slug}`;
  // Astro's `image()` schema field returns an ImageMetadata-shaped object
  // with `{ src, width, height, format }`. The `src` is the build-output
  // URL path (e.g. `/_astro/cover.abc123.webp`). When `cover` is unset,
  // fall back to the Wave-0 og-default.svg.
  const imageUrl = p.cover
    ? `${SITE.baseUrl}${(p.cover as { src: string }).src}`
    : `${SITE.baseUrl}/og-default.svg`;
  const orgBlob = {
    '@type': 'Organization' as const,
    name: SITE.name,
    url: SITE.baseUrl,
  };
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: p.title,
    author: author
      ? {
          '@type': 'Person' as const,
          name: author.data.name,
          url: `${SITE.baseUrl}/attorneys/${author.data.slug}`,
        }
      : orgBlob,
    datePublished: p.publishedAt.toISOString(),
    dateModified: (p.updatedAt ?? p.publishedAt).toISOString(),
    image: imageUrl,
    mainEntityOfPage: url,
    publisher: orgBlob,
  };
}
