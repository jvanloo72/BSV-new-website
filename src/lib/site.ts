/* Firm constants — single source of truth for name, URL, contact, offices.
 *
 * D-29 (site-wide LegalService JSON-LD) reads these values via
 * src/lib/jsonld.ts. SiteFooter (Plan 01) already displays the office
 * locations; future phases (Phase 3 About, Phase 6 Contact, Phase 7 SEO)
 * will pull from the same constants.
 *
 * RESEARCH.md A7: the Silicon Valley street address + postal code are
 * placeholders ("TBD") until Jon confirms before Phase 7 launch. The
 * placeholder values flow through to JSON-LD as literal "TBD" strings,
 * which is intentional — a missing address is worse than a flagged one
 * (Google rejects malformed PostalAddress; "TBD" is just an invalid value
 * Jon will see in the Rich Results Test).
 */

export const SITE = {
  name: 'Belcher, Smolen & Van Loo LLP',
  shortName: 'BSV Law',
  baseUrl: 'https://bsvlaw.com',
  phone: '+1-415-XXX-XXXX', // Replace before launch; Jon confirms in Phase 7.
  email: 'intake@bsvlaw.com',
  offices: [
    {
      streetAddress: '555 California St., Suite 4925',
      addressLocality: 'San Francisco',
      addressRegion: 'CA',
      postalCode: '94104',
      addressCountry: 'US',
    },
    {
      streetAddress: 'TBD', // Silicon Valley primary office — Jon confirms before Phase 7.
      addressLocality: 'Silicon Valley',
      addressRegion: 'CA',
      postalCode: 'TBD',
      addressCountry: 'US',
    },
  ],
} as const;

/* formatOffice — single source of truth for turning one SITE.offices entry into a
   formatted single-line address string. Extracted from SiteFooter (Phase 3 Plan 02)
   so the footer and the About page share one derivation and stay in lockstep.
   Behavior (unchanged from the original footer logic): push the street address only
   when it is present and not the "TBD" placeholder; always push the locality; build
   a "region postal" segment, including the postal code only when it is present and
   not "TBD"; join the collected segments with ", ". Produces "Silicon Valley, CA"
   for the not-yet-confirmed office and "555 California St., Suite 4925, San Francisco,
   CA 94104" for the San Francisco office — so a placeholder address never leaks. */
export function formatOffice(o: (typeof SITE.offices)[number]): string {
  const segs: string[] = [];
  if (o.streetAddress && o.streetAddress !== 'TBD') segs.push(o.streetAddress);
  segs.push(o.addressLocality);
  const region = [o.addressRegion, o.postalCode && o.postalCode !== 'TBD' ? o.postalCode : null]
    .filter(Boolean)
    .join(' ');
  if (region) segs.push(region);
  return segs.join(', ');
}
