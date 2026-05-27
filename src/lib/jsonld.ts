/* JSON-LD builders, typed via schema-dts (D-29 / D-30).
 *
 * buildLegalServiceLd() ships in Phase 1 and is injected site-wide by
 * BaseLayout. buildPersonLd() and buildArticleLd() are intentionally
 * stubs; Phases 4 and 5 implement them. The stubs let Plan 01-03 fix the
 * contract (input + output types) without paying the implementation cost
 * yet.
 */

import type { Article, LegalService, Person, WithContext } from 'schema-dts';
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

/* Phase 4 implements: takes an attorney CollectionEntry, returns a
 * WithContext<Person>. Slot-transferred into AttorneyLayout's BaseLayout
 * via <JsonLd slot="head" data={buildPersonLd(attorney)} />.
 */
export function buildPersonLd(_attorney: unknown): WithContext<Person> {
  throw new Error('buildPersonLd not implemented until Phase 4');
}

/* Phase 5 implements: takes a blog post CollectionEntry, returns a
 * WithContext<Article>. Slot-transferred into BlogPostLayout.
 */
export function buildArticleLd(_post: unknown): WithContext<Article> {
  throw new Error('buildArticleLd not implemented until Phase 5');
}
