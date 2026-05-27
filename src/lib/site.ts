/* Firm constants — single source of truth for name, URL, contact, location.
 *
 * D-33 (2026-05-27): BSV is a VIRTUAL firm with NO physical offices. Every
 * prior reference to a Silicon Valley office and the 555 California St. address
 * was removed. The public surface says only "Based in San Francisco." and the
 * LegalService JSON-LD carries a city-level PostalAddress (locality + region +
 * country, no streetAddress / postalCode).
 *
 * D-29 (site-wide LegalService JSON-LD) reads these values via src/lib/jsonld.ts.
 */

export const SITE = {
  name: 'Belcher, Smolen & Van Loo LLP',
  shortName: 'BSV Law',
  baseUrl: 'https://bsvlaw.com',
  phone: '+1-415-XXX-XXXX', // Replace before launch; Jon confirms in Phase 7.
  email: 'intake@bsvlaw.com',
  // Human-readable line shown on the footer and About page (no street address —
  // the firm is virtual; D-33).
  basedIn: 'Based in San Francisco.',
  // City-level location used to build the JSON-LD PostalAddress. No streetAddress
  // or postalCode — a virtual firm has none, and a city-only address is valid
  // structured data (Google accepts PostalAddress with locality + region).
  location: {
    addressLocality: 'San Francisco',
    addressRegion: 'CA',
    addressCountry: 'US',
  },
} as const;
