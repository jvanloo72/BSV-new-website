/* Firm constants — single source of truth for name, URL, contact, location.
 *
 * D-37 (2026-05-27): the firm's full mailing address is shown in the site
 * footer on every page (Jon's directive, reversing the D-33 address removal).
 * The structured `location` carries the full PostalAddress (street + locality
 * + region + postal + country) so the visible footer NAP and the LegalService
 * JSON-LD stay consistent for local SEO. `basedIn` ("Based in San Francisco.")
 * is retained ONLY for the About-page body copy — it is no longer used in the
 * footer. `footerAddress` is derived from `location` so the footer string has a
 * single source of truth.
 *
 * D-29 (site-wide LegalService JSON-LD) reads these values via src/lib/jsonld.ts.
 */

export const SITE = {
  name: 'Belcher, Smolen & Van Loo LLP',
  shortName: 'BSV Law',
  baseUrl: 'https://bsvlaw.com',
  phone: '+1-415-XXX-XXXX', // Replace before launch; Jon confirms in Phase 7.
  email: 'info@bsvlaw.com',
  // About-page body copy only (NOT the footer — see D-37).
  basedIn: 'Based in San Francisco.',
  // Full firm address — drives both the footer NAP and the JSON-LD PostalAddress.
  location: {
    streetAddress: '555 California St., Suite 4925',
    addressLocality: 'San Francisco',
    addressRegion: 'CA',
    postalCode: '94104',
    addressCountry: 'US',
  },
} as const;

/* footerAddress — the single-line full address shown in the footer on every page
   (D-37). Derived from SITE.location so the visible string and the structured
   data never drift: "555 California St., Suite 4925, San Francisco, CA 94104". */
export const footerAddress = [
  SITE.location.streetAddress,
  SITE.location.addressLocality,
  `${SITE.location.addressRegion} ${SITE.location.postalCode}`,
].join(', ');
