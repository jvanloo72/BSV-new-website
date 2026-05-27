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

/* Phase 5 implements: takes a blog post CollectionEntry, returns a
 * WithContext<Article>. Slot-transferred into BlogPostLayout.
 */
export function buildArticleLd(_post: unknown): WithContext<Article> {
  throw new Error('buildArticleLd not implemented until Phase 5');
}
