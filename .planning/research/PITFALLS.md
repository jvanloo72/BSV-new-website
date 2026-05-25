# Pitfalls Research

**Domain:** Boutique law firm marketing website (Astro 6 + Tailwind v4 + Vercel) for a California/New York licensed M&A, IP/Tech, and Tax practice
**Researched:** 2026-05-25
**Confidence:** HIGH for technical pitfalls (Context7 + official Astro/Tailwind/Vercel docs); MEDIUM for bar-rule specifics (general guidance from training data — Jon should sanity-check final disclaimer language against his current California Rules of Professional Conduct before launch, since rules around testimonials and "specialist" language have shifted multiple times in the last decade)

---

## Critical Pitfalls

These are the failure modes that, if missed, force a rewrite, expose the firm to a bar complaint, or break the live site silently.

---

### Pitfall 1: Disclaimer drift — the footer disclaimer exists on the homepage but quietly disappears on a subroute

**What goes wrong:**
The footer disclaimer is added to `BaseLayout.astro` early. Later, a contributor (or Claude in a future session) builds a new page — a thank-you page, a 404, a redirected blog landing — using a different layout, or as a bare `.astro` route, and the footer is missing. Same risk on the contact form's confirmation page, which often ends up as a one-off route with no shared layout. The disclaimer being on "every page" is the non-negotiable requirement in `.claude/CLAUDE.md`, and a missing one on even a single page is a defensible bar complaint trigger.

**Why it happens:**
Astro makes it trivial to create a one-off page without `Layout` import. There's no compiler-level enforcement that every route uses the shared layout. The mistake compounds when a non-coder skims a PR and the visual diff looks fine on the page being edited.

**How to avoid:**
- Build a single `<Disclaimer />` component and a `<Footer />` component that contains it; both live in `src/components/`.
- Make `BaseLayout.astro` the only layout — no exceptions. Every `.astro` page must wrap content in `<BaseLayout>`.
- Add a Playwright (or Astro check) integration test that crawls every URL emitted by `npm run build` and asserts the disclaimer text is present in the rendered HTML. The test lives in `tests/disclaimer.spec.ts`. If it fails, CI fails, deploy is blocked.
- Specifically test: `/`, `/practice-areas/*`, `/attorneys/*`, `/blog/*`, `/contact`, `/thank-you` (or whatever the post-submit page is), `/404`.

**Warning signs:**
- A new page is added without importing `BaseLayout`.
- The contact form's success state is rendered inline on the contact page (good) instead of redirecting to a separate route (risk).
- A Markdown/MDX file is rendered without specifying a layout in its frontmatter.

**Phase to address:** Early — set up `<BaseLayout>` + `<Disclaimer />` + the crawl test in the initial scaffold phase, before any practice area or blog content is built. The test prevents regression for the rest of the build.

---

### Pitfall 2: Contact form posts plaintext PII to an insecure backend, violating ABA Formal Opinion 477R

**What goes wrong:**
A prospective client describes a deal — sometimes including counterparty names, valuation, or sensitive context — in the contact form. The form submits via plain HTTP, or stores the lead in a database without encryption at rest, or sends the notification email through an unauthenticated SMTP relay, or emails it to a personal Gmail address. ABA Formal Op. 477R requires lawyers to make a fact-specific assessment of confidentiality risk and use reasonable safeguards; an obvious failure (no TLS, no access controls, personal email inbox, public S3 bucket) creates a professional-responsibility exposure even before an engagement exists. The duty of confidentiality attaches to "prospective client" communications under ABA Model Rule 1.18 and California Rule 1.18 regardless of whether the engagement is ever formed.

**Why it happens:**
Form backends get chosen for convenience, not security posture. "I'll just hook it up to my Gmail" is the fastest path and often the default suggested by tutorials. Supabase tables get created with RLS disabled because the first iteration just needs to work. Notification emails get routed to whoever set up the project, not to a firm-controlled inbox with a retention policy.

**How to avoid:**
- TLS everywhere: the form must POST to an HTTPS endpoint (Vercel enforces this by default — verify by running `curl -I http://bsvlaw.com` and confirming a 308 to HTTPS).
- The notification email goes to a **firm-controlled inbox** (e.g., `intake@bsvlaw.com`) hosted on the firm's existing mail provider, not Jon's personal Gmail. Document the inbox owner and rotation policy in `.planning/DECISIONS.md`.
- If the backend stores leads (Supabase, Postgres, etc.): RLS enabled by default, the `leads` table has no public read policy, only the service role can insert, and the column-level encryption is documented. Add a check in the security audit phase that runs `select * from pg_policies where tablename = 'leads'` and verifies a deny-by-default policy exists.
- Use Resend / Postmark / SES with SPF, DKIM, and DMARC configured for `bsvlaw.com` — bare SMTP from a random VPS will land in spam and may leak to third parties along the relay path.
- The form description text states explicitly: "Do not include confidential or privileged information in your message until a relationship has been formally established with our firm." (Recommended language is already in `.planning/LAW_FIRM_WEBSITE_GUIDE.md`.)
- Lead retention: define a retention policy (90 days? 1 year?) and document it; an indefinitely-retained pile of prospective client communications is a liability.

**Warning signs:**
- `vercel env` shows API keys for `RESEND_API_KEY` or `SUPABASE_SERVICE_ROLE_KEY` but they are also visible in `git log -p -- .env*`.
- The form's `action` attribute points to `mailto:` (sends from the visitor's mail client — bypasses every safeguard).
- The Supabase dashboard for the `leads` table shows the green "RLS disabled" banner.
- The notification email goes to `jon.vanloo@gmail.com` not `intake@bsvlaw.com`.

**Phase to address:** Late — dedicated security phase, but the backend choice happens earlier when the contact form phase begins. The form-phase decision must consider 477R; don't defer the security review until after the form is live.

---

### Pitfall 3: "Specialist" / "expert" / "specialize in" language that violates California Rule of Professional Conduct 7.4

**What goes wrong:**
The site copy uses words like "specialist," "specialize," or "expert" to describe BSV or its attorneys ("Stuart is a specialist in patent law," "our M&A specialists," "tax expert Jon Van Loo"). California Rule 7.4 prohibits lawyers from holding themselves out as "certified" or as a "specialist" in a particular field unless they have been certified by the California Board of Legal Specialization (or an ABA-accredited program) AND make the prescribed disclosure. Stuart Smolen is a Registered Patent Attorney with the USPTO, which is a *limited* permitted exception — he can describe that registration accurately, but a general "patent specialist" claim still risks the rule. New York has a parallel rule (NY Rule 7.4) and similar restrictions.

**Why it happens:**
"Specialist" is intuitively the right word for a boutique firm that does only three practice areas. The marketing instinct is to use the most precise, confident word available. Most non-attorney content writers don't know the term is restricted. AI-generated copy uses "specialist" / "expert" reflexively unless prompted away from it.

**How to avoid:**
- Add a project-level lint rule: a markdown/MDX check that scans all content files for the substrings `specialist`, `specialise`, `specialize`, `expert`, `expertise`, `certified`, and prints a warning on every match for human review. Run it as part of `npm run lint:legal` and in CI.
- Use safer language in copy: "focused on," "concentrated in," "deep experience in," "transaction-focused," "tax-focused," "boutique practice in." All of these are accurate and bar-compliant.
- For Stuart Smolen specifically: he is permitted to state "Registered to practice before the United States Patent and Trademark Office" — that's a fact, not a "specialist" claim. Use that exact phrasing on his bio.
- For California-bar-rule jurisdiction statement on the footer (already required by Cal. Rule 7.1–7.5 advertising regime): "Belcher, Smolen & Van Loo LLP is licensed to practice law in California and New York. This website is not intended to solicit clients in jurisdictions where the firm is not licensed."
- The lead message "Team work to get good results" is safe. "Specialists in M&A" is not.

**Warning signs:**
- A draft attorney bio uses "specializes in" or "is a specialist in."
- The homepage hero or practice-area page uses "expert" / "expertise" as a noun applied to BSV or its attorneys.
- The Chambers Spotlight tile reuses Chambers' own language verbatim without filtering (Chambers freely uses "leading," which is fine; verify it doesn't use "specialist").

**Phase to address:** Middle — content writing phase. Before any practice area or attorney bio is published, the `npm run lint:legal` check must pass. Re-run at every content addition.

---

### Pitfall 4: JSON-LD structured data that silently fails Google's Rich Results test

**What goes wrong:**
Every page gets a JSON-LD block (`LegalService`, `Person`, `Article`) — but the block has a typo, a missing required field, an incorrect `@context`, or mismatched data (e.g., `Person.name` says "Aaron Belcher" but `url` points to `/attorneys/stuart-smolen`). The page still renders fine for human visitors. Google quietly drops the structured data, the site doesn't get rich snippets, and no one notices for months. AEO (answer-engine citations) also suffers — AI engines lean heavily on schema to identify content type.

**Why it happens:**
JSON-LD is invisible to humans, has no compile-time validation in Astro, and no error message when wrong. The schema.org spec is large and the required fields for each type are easy to miss. Copy-pasting between attorney pages introduces stale data.

**How to avoid:**
- Build a single `<JsonLd type="..." data={...} />` component in `src/components/seo/JsonLd.astro` that uses a Zod schema (Astro ships Zod) to validate inputs at build time. If `LegalService` requires `name`, `url`, `telephone`, `address`, the Zod schema enforces them — a missing field fails `npm run build`, not silently in production.
- Add a build-time test that fetches every page from the dev server (or the built `dist/`), extracts each `<script type="application/ld+json">` block, and validates it against schema.org via a library like `schema-dts` or by posting to Google's Rich Results test endpoint.
- Manually run the Google Rich Results Test (https://search.google.com/test/rich-results) on the homepage, one attorney page, and one blog post during the SEO phase. Capture screenshots into `.planning/research/seo-verification/`.
- Don't hand-write JSON-LD inline on each page — drive it from the page's frontmatter or content collection, so the schema is auto-generated and consistent.

**Warning signs:**
- A page renders fine in browser, but `view-source` shows the JSON-LD `name` field is empty / says `[object Object]` / has trailing commas (invalid JSON).
- Two attorney pages have visibly identical `Person` JSON-LD blocks (copy-paste error — the second one still references the first).
- Google Search Console "Enhancements" section shows zero recognized structured-data items after the site has been live for two weeks.

**Phase to address:** Middle (build phase) for the `<JsonLd />` component and validation; Late (pre-launch SEO phase) for the Rich Results verification.

---

### Pitfall 5: "Representative deals" / "Notable clients" copy that exposes confidential client identity

**What goes wrong:**
The current bsvlaw.com lists Aaron Belcher's representative deals — Athelas–Commure, Mode Analytics, Illumina/Roche — plus a roster of M&A buy-side clients (Oracle, Dell, eBay, Adobe…). Some of these clients pre-cleared the disclosure; some didn't, or pre-cleared a *different* version (e.g., "Disney" might have been approved for a specific bio at a prior firm but not for BSV's new public marketing site). California Rule 1.6 (confidentiality) and Rule 1.9 (former clients) prohibit disclosure of information acquired in representation absent consent, and that prohibition covers the *identity* of clients in many circumstances — even if it's known publicly elsewhere, *the lawyer's confirmation* of the relationship is the breach.

**Why it happens:**
The current site is the easiest source of copy for the new site. Copy-paste is the fastest path. The relationship between "Aaron used to work at Dewey, where he represented Oracle" and "BSV publishes that Aaron represented Oracle" is non-obvious to a non-lawyer working from the existing site. The "notable representative clients" list in `FIRM_BRIEF.md` was generated from the existing site and inherits whatever clearance issues already exist.

**How to avoid:**
- Before any client name (or deal-with-named-counterparty) goes onto the new site, each name must be on a **client-disclosure clearance list** maintained in `.planning/CLIENT_DISCLOSURE_CLEARANCE.md`. The list records: client name, the partner who confirmed clearance, the date, the source of clearance (Chambers submission, prior bio, public M&A filing), and the specific copy approved.
- Deals tied to SEC-filed transactions (public M&A, registered offerings) are generally safer — the transaction is public record. Private deals require explicit consent.
- For ambiguous cases, default to **anonymized framing**: "Counsel to a public technology acquirer in a $200M cross-border IP-license-out transaction" rather than "Represented Adobe in the Figma deal."
- Add a tooling check: `npm run lint:legal` (the same one that catches "specialist") also lists every proper noun appearing in `src/content/` and `src/data/attorneys/` for spot-review against the clearance list.
- Chambers Spotlight 2026 ranking can be cited verbatim because Chambers publishes it — but verify the Chambers text doesn't itself name unclearable clients before using it as a quote.

**Warning signs:**
- A representative-deals tile lists a client name not on the clearance list.
- An attorney bio's "prior firm experience" includes specific transactions from the prior firm (this is the most dangerous category — pre-BSV deals are most likely to lack clearance for *BSV*'s use).
- A blog post mentions a client by name as context for a legal-news commentary post (e.g., "When we advised X on…").

**Phase to address:** Middle — content writing. Block on clearance list completion before any attorney bio or representative-deals section is published. This is a non-deferable gate.

---

### Pitfall 6: Blog post that crosses the line from "general information" into "legal advice"

**What goes wrong:**
A blog post titled "What Should Be in a Master Services Agreement?" or "How to Structure a Token Sale for Tax Efficiency" gives concrete, actionable, specific guidance that a reader could rely on. A non-client reader reads it, acts on it, and either (a) makes a costly mistake that they then sue BSV over claiming they relied on the post, or (b) becomes a "prospective client" under Rule 1.18 with no engagement letter and unclear conflict checking. Even with the disclaimer, the specificity matters — courts and bar regulators look at the *content* of the communication, not just the legend at the bottom.

**Why it happens:**
SEO and AEO best practices reward concrete, complete, actionable answers. The `LAW_FIRM_WEBSITE_GUIDE.md` advocates writing blog posts that "answer questions completely" because AI answer engines cite pages that don't withhold the answer. This is good marketing advice and a legal-risk amplifier — the more useful the post, the more reliance it invites.

**How to avoid:**
- Every blog post carries the disclaimer (already required by `.claude/CLAUDE.md`) — both at the top *and* at the bottom for posts longer than 800 words.
- Editorial review by a BSV attorney (Aaron, Stuart, or Jon depending on subject) before publish. Add a `reviewed_by` frontmatter field to the blog content collection's Zod schema — `npm run build` fails if a post is missing it.
- Tone calibration: blog posts present "considerations," "factors," and "common structures" — not "do this." Compare:
  - **Risky:** "For your token sale, use a SAFT structure and file a Reg D 506(c) exemption."
  - **Safer:** "Token sales commonly use one of three structures — SAFT, direct sale under Reg D, or Reg S offshore. Each has different securities and tax implications; counsel should evaluate which fits the specific project."
- No comparisons of BSV to other firms by name. No predictions of case outcomes. No "guaranteed results" language.
- Author attribution is required on every post (already in non-negotiables) — and the author's bio link makes the path to contact clear, so readers who *should* talk to counsel are pushed toward the contact form.

**Warning signs:**
- A post uses second-person imperative ("File this form by April 15") without an "if you are subject to this filing" qualifier.
- A post quotes a specific dollar threshold or statutory citation as if applicable to the reader's situation without the qualifier.
- A post is missing the `reviewed_by` field in frontmatter.

**Phase to address:** Late — at the point the blog system is built, both the technical (frontmatter schema, disclaimer component) and editorial (review gate) controls must be in place before the first post publishes.

---

### Pitfall 7: Content Security Policy that blocks the site's own assets (Tailwind v4 inline styles, Astro hydration scripts, Google Fonts, hCaptcha)

**What goes wrong:**
The security-headers phase adds a strict CSP like `default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'` to `vercel.json`. The site stops rendering correctly: Tailwind v4's inline styles get blocked, Astro's view transitions stop working because the small inline scripts they inject violate `script-src 'self'`, Google Fonts (or whatever webfont CDN is used) is blocked, and if there's a CAPTCHA the iframe is blocked. Jon sees a broken site, the CSP gets weakened to `unsafe-inline 'unsafe-eval' *` to make it work, and the security headers become decorative.

**Why it happens:**
"Add a strict CSP" is a common security-audit checklist item, written generically. The actual CSP required by Astro 6 + Tailwind v4 + Vercel + any third-party services (fonts, analytics, CAPTCHA, form backend) is non-trivial. Astro injects inline styles and scripts for hydration, view transitions, and image optimization; Tailwind v4 uses CSS variables but its preflight and some `@layer` content can emit inline styles. Discovering each block requires opening DevTools on every page.

**How to avoid:**
- Start CSP in **report-only mode** (`Content-Security-Policy-Report-Only`) on a Vercel preview deployment, with a `report-uri` pointing to a logger (e.g., `report-uri.com` free tier, or a simple `/api/csp-report` endpoint). Browse every page. Collect every violation. Then write the enforcement CSP based on the *actual* observed needs.
- Use hashes or nonces, not `'unsafe-inline'`. Astro can emit a build-time CSP that hashes its own inline scripts — there's an `experimental.csp` config option. Verify it works against the Astro 6 release notes.
- Explicit allow-list for third parties: fonts.googleapis.com / fonts.gstatic.com if Google Fonts is used, the chosen form backend's domain, hCaptcha/Turnstile if used. Document every entry in `vercel.json` with a comment explaining *why*.
- Test the CSP against every page including the contact form's POST flow — many forms work fine on GET but break under CSP on the redirect-after-POST step.

**Warning signs:**
- The browser console shows "Refused to apply inline style" / "Refused to execute inline script" warnings on the deployed site.
- The CSP contains `'unsafe-inline'` for `style-src` or `script-src` — almost always a sign the iteration was abandoned.
- View transitions stop working (Astro's swap functions inject scripts).
- The contact form CAPTCHA renders blank.

**Phase to address:** Late (security phase), but **start in report-only mode early** — at the end of the design phase or early build phase — so violations are collected as the site grows, not all at once at the end.

---

### Pitfall 8: `.env` or `.env.local` accidentally committed to git, leaking the contact-form backend keys

**What goes wrong:**
During local setup, Jon runs `vercel env pull .env.local` (or the form-backend setup wizard writes a `.env` file). The Astro starter's `.gitignore` covers `.env` but maybe not `.env.local`, or a custom-named file is written (e.g., `.env.production.local`). Jon commits and pushes. The file is now in the public GitHub repo. Resend / Supabase / SMTP credentials are exposed. By the time anyone notices, the leak has been crawled by automated secret scanners and the keys are being abused — sending phishing email from `intake@bsvlaw.com`, or worse, reading the leads table.

**Why it happens:**
`.gitignore` is the first thing built and the easiest to misconfigure. `vercel env pull` writes a file the dev didn't choose the name of. GitHub's secret-scanning catches some patterns but not all (Resend keys, custom-shaped tokens, Postmark tokens are sometimes missed). Jon has no coding background and the "what's in this commit" review step is unlikely to surface an unfamiliar dotfile.

**How to avoid:**
- Project `.gitignore` covers `.env`, `.env.*`, `.env.local`, `.env.*.local`, and the entire root-level pattern `*.env` — generously broad is fine because production env vars live in Vercel, not the repo.
- Add a `.gitattributes` entry and a pre-commit hook (using `husky` + `git-secrets` or `gitleaks`) that scans staged changes for known key prefixes (e.g., `re_`, `sk_`, `eyJ`, `SUPABASE_`) and blocks the commit. Run the same scan in CI on every push to `main`.
- Enable GitHub's secret-scanning + push-protection on the `jvanloo72/BSV-new-website` repo (Settings → Code security → Secret scanning → Push protection: enabled).
- Document in `README.md` and `CONTRIBUTING.md`: "Never commit anything named `.env*`. If you need to share env vars, use Vercel's env-var UI."
- Pre-launch audit: `git log --all --full-history -- ".env*"` should return no results. If anything is found, **rotate every credential and rewrite history** — leaking the secret is irrevocable; you can only invalidate it.

**Warning signs:**
- `git status` shows an `.env*` file in the working tree that's not gitignored.
- GitHub sends a secret-leak email to the repo owner.
- `vercel env pull` is run for the first time without `.env.local` already being in `.gitignore`.

**Phase to address:** Early — the very first commit of the project. Set up `.gitignore`, push-protection, and gitleaks before any feature work begins.

---

### Pitfall 9: Honeypot field that bots routinely fill anyway (because it's discoverable)

**What goes wrong:**
The contact form has a hidden honeypot input (`<input name="website" style="display:none">`) per the non-negotiables in `.claude/CLAUDE.md`. Modern spam bots are aware of this pattern: they detect `display:none` / `visibility:hidden` / `aria-hidden="true"` via DOM inspection, skip those fields, and submit anyway. Spam volume drops only slightly. Meanwhile, accessibility tools and password managers can see the field and a non-bot user with a password manager auto-fills it, triggering false-positive rejection. The first sign of trouble is Jon's intake inbox filling with junk despite the "honeypot" being checked off as done.

**Why it happens:**
The "honeypot" pattern is widely copy-pasted from 2014-era tutorials. The simplest form is the most well-known and least effective.

**How to avoid:**
- Use a **time-trap honeypot**: timestamp the form render (server-side in an Astro Action), and reject submissions that arrive in less than 2 seconds (humans don't fill out a form that fast) or more than 30 minutes (the page sat open in a forgotten tab, or it's an automated replay).
- Name the honeypot field something innocuous that a human would never see: `phone_secondary` or `comment_url`, and hide it with CSS class that's **not** `display:none` (use absolute positioning offscreen: `position:absolute; left:-9999px; top:-9999px; height:0; width:0; overflow:hidden`) plus `tabindex="-1"` and `autocomplete="off"` and `aria-hidden="true"`. Password managers usually skip aria-hidden fields. If filled, reject.
- Add a JS-required cryptographic token: the form embeds a CSRF token that's verified server-side. Bots that fetch the HTML without executing JS can still see it, but it raises the bar.
- Combine with rate limiting (see Pitfall 10) — honeypot alone is necessary but not sufficient.
- After launch, monitor the rejected-submission log for a week. If spam still arrives, layer in hCaptcha or Cloudflare Turnstile (invisible by default).
- Never silently reject — log honeypot-triggered rejections with the IP, user-agent, and timestamp so a human can audit if a legit lead got blocked.

**Warning signs:**
- The honeypot field's CSS uses only `display:none`.
- The form has no server-side timestamp check.
- The intake inbox sees spam volume comparable to before the honeypot was added.

**Phase to address:** Middle (contact form build phase) — both the honeypot and the time trap go in together; don't ship one without the other.

---

### Pitfall 10: Missing rate limiting on the contact-form endpoint — bots POST 10,000 leads in a minute

**What goes wrong:**
Vercel functions scale-to-zero is great for cost, but it also means there's no built-in rate limit. A bot discovers the contact endpoint and submits 10,000 valid-looking entries in a minute. The leads table fills with junk; if the notification email fires per submission, the firm's notification inbox is DDoS'd; if there's a per-submission Resend / Twilio / Postmark cost, the firm gets a four-figure bill; the honeypot may not catch all of these if the bot is paying attention.

**Why it happens:**
"Rate limiting" sounds like a problem for large-scale apps. A boutique law firm marketing site is assumed not to be a target — until someone runs an automated scraping or form-spamming run as collateral damage.

**How to avoid:**
- Vercel's built-in rate limiting via the WAF / firewall: configure a rule on `/api/contact` (or wherever the form posts) — 5 requests per minute per IP, deny otherwise. This is configurable in the Vercel dashboard or via `vercel firewall rules add` and is the lowest-effort option for a static-site-plus-one-endpoint architecture.
- For more control, use `@vercel/firewall` in the form handler — `checkRateLimit('contact-form', { request })` and return 429 on rate-limited responses. This is documented in Vercel's docs.
- Alternative: Upstash Redis (free tier) with a sliding-window rate limit keyed by IP, since Upstash is officially partnered with Vercel and works inside Vercel Functions.
- Whatever the rate limit, log every 429 with IP and timestamp; review weekly.
- Pair with a daily budget alert in Vercel — if the function invocation count for `/api/contact` exceeds 100/day, send Jon an email.
- Make sure rate limiting comes **before** any expensive operation (email send, DB write) in the handler — rate-check first, then do work.

**Warning signs:**
- The contact endpoint has no rate-limit middleware.
- The Vercel project has no WAF rule applied.
- A single IP appears 50+ times in the leads table within an hour.

**Phase to address:** Late (security phase), but plumbing must be in the contact form's initial design — adding rate limiting after the fact requires refactoring the handler.

---

### Pitfall 11: Email subject / header injection in the form-notification email (the form is an open relay)

**What goes wrong:**
The contact form sends a notification email to `intake@bsvlaw.com`. The notification's "Subject" line is built by concatenating user input: `Subject: New inquiry from ${formData.name}`. A bot submits a `name` field containing `\r\nBcc: spam@target.com\r\n\r\nFree Viagra!` — and the email becomes an open relay, blasting BSV's mail-from address to spam targets. SPF/DMARC may catch some of it, but BSV's domain reputation is now compromised.

**Why it happens:**
Email header injection is a well-known but under-publicized vulnerability — most form tutorials don't mention it. Astro Actions + Resend / SendGrid / Postmark APIs use structured JSON inputs that prevent it *if used as the SDK intends*, but any raw-SMTP setup or templating shortcut reintroduces the bug.

**How to avoid:**
- Use a modern email API (Resend, Postmark, SendGrid v3) and pass `name` / `email` / `body` as **separate JSON fields** to the SDK. Never concatenate user input into a header string.
- Server-side validation strips `\r` and `\n` characters from all input fields before the email is built. Add to the Zod schema: `z.string().refine(s => !/[\r\n]/.test(s), 'Invalid characters')`.
- The Subject line is **static**: `"New BSV intake submission"`. The user's name goes in the body, not the header.
- The Reply-To header is set from the validated `email` field, not from user-controlled input that could contain header chars.

**Warning signs:**
- Form handler code contains string concatenation with user input into a `Subject:` or `From:` or `To:` field.
- No regex check for newline characters on incoming form fields.
- The mail provider's docs warn about something — read them.

**Phase to address:** Middle (contact form build phase). This pitfall lives inside the handler implementation.

---

### Pitfall 12: Tailwind v4 migration assumptions — `theme()` function in CSS, `tailwind.config.js` based config, default border color

**What goes wrong:**
Claude (or any contributor) writes Tailwind code patterns it learned during the v3 era — using `theme(colors.navy.500)` inside a CSS file, defining colors in `tailwind.config.js`, expecting `border` utility to render a gray border by default. In Tailwind v4 (the project's pre-decided stack), `theme()` is **deprecated** in favor of CSS variables (`var(--color-navy-500)`); config lives in a CSS `@theme` block, not a JS file; and `border` defaults to `currentColor`, not `gray-200`. The site doesn't break dramatically — it renders, but with invisible or wrong borders, missing colors, and confusing build errors that look like typos.

**Why it happens:**
Tailwind v4 was a major rewrite (released late 2024, refined through 2025–2026). Most Tailwind tutorials, Stack Overflow answers, and AI-trained patterns are still v3-era. Astro starters have updated, but copy-pasted snippets from external sources will use v3 syntax.

**How to avoid:**
- The single source of truth for Tailwind v4 syntax is the official upgrade guide at https://tailwindcss.com/docs/upgrade-guide. Read it once at project start; pin a link in `.planning/DECISIONS.md`.
- Theme configuration lives in a `@theme` block in the main CSS file:
  ```css
  @import "tailwindcss";
  @theme {
    --color-navy-500: #1e3a8a;
    --color-warm-white: #faf9f7;
    --font-display: "Inter", sans-serif;
  }
  ```
- For media queries that need theme values: `@media (width >= theme(--breakpoint-xl))` (note: it's the CSS variable name, not the dot notation).
- Default border color: explicitly set `border-color` on borders that should be gray, OR add the v3-compat base layer:
  ```css
  @layer base {
    *, ::after, ::before, ::backdrop, ::file-selector-button {
      border-color: var(--color-gray-200, currentColor);
    }
  }
  ```
- If using `tailwind.config.js`, it should be empty or used only for plugin registration — colors and spacing belong in CSS.
- During code review, search for `theme(` and `tailwind.config` references in PRs and flag them.

**Warning signs:**
- `tailwind.config.js` has a populated `theme.extend.colors` block (this is a v3 pattern).
- CSS uses `theme(colors.navy.500)` (dot notation — v3 style).
- An element with `class="border"` appears as if it has no border (because `currentColor` matches text color which matches background).

**Phase to address:** Early — project scaffold and design phase. Lock in v4 patterns in the first Tailwind file written; don't drift back to v3 syntax.

---

### Pitfall 13: Astro 6 content collections — using deprecated `defineCollection` patterns from Astro 4/5

**What goes wrong:**
Blog and attorney content is set up using `src/content/config.ts` with the legacy schema (no `loader`), or using `output: 'hybrid'` which was removed in Astro 6. The build fails with cryptic errors, or — worse — the build succeeds but with subtly different behavior than expected (TypeScript types are wrong, getStaticPaths returns numeric params which v6 rejects, content queries don't return what you'd expect).

**Why it happens:**
Astro 6 introduces several breaking changes from v5: the Content Layer API now uses `createSchema()` instead of a schema function; `output: 'hybrid'` is removed (use `output: 'static'`); `getStaticPaths()` params must be strings or `undefined`; the adapter API now uses `entrypointResolution` instead of `entryType`. Documentation, blog posts, and AI-trained snippets predating v6 will steer you wrong.

**How to avoid:**
- Use the Content Layer API with the modern pattern:
  ```ts
  // src/content.config.ts
  import { defineCollection, z } from 'astro:content';
  import { glob } from 'astro/loaders';

  const blog = defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
    schema: ({ image }) => z.object({
      title: z.string(),
      author: z.enum(['aaron-belcher', 'stuart-smolen', 'jon-van-loo', 'iris-zhang', 'susan-jiang']),
      reviewed_by: z.string(),  // enforce review gate (see Pitfall 6)
      published: z.date(),
      heroImage: image().optional(),
    }),
  });

  export const collections = { blog };
  ```
- In `astro.config.mjs`: do not use `output: 'hybrid'`. Use `output: 'static'`.
- Run `npx @astrojs/upgrade` if migrating from an existing Astro project; on a greenfield Astro 6 project this is moot.
- Pin the Astro version in `package.json` and run `npm outdated astro` before each major change.

**Warning signs:**
- `npm run build` emits a "`output: 'hybrid'` has been removed" error.
- `getStaticPaths()` returns `{ params: { id: 1 } }` (number) instead of `{ params: { id: '1' } }` (string).
- `src/content/config.ts` exists but the file is named `src/content.config.ts` in Astro 6 (the location moved).

**Phase to address:** Early — project scaffold phase, when content collections are defined.

---

### Pitfall 14: Renaming attorney URL slugs after launch — kills referral links and SEO ranking

**What goes wrong:**
Susan Jiang's profile URL is set up as `/attorneys/susan-jiang` initially. Later, someone decides she should be at `/team/susan` to match a navigation change, and a redirect is added — or worse, no redirect, and old links 404. The existing bsvlaw.com had her at a slug that "doesn't follow the same pattern" (per `FIRM_BRIEF.md`), and the temptation will be to "fix" the URL post-launch. The result: every referral email containing her old link breaks, every Google ranking for her name resets, and bar directory listings that point to her old URL now 404. Same risk for any attorney slug, practice area slug, or blog post URL changed after launch.

**Why it happens:**
URL design feels like a malleable detail during the build. The fact that URLs are essentially immutable once external sites link to them isn't intuitive to a non-coder. The bsvlaw.com legacy has at least one pattern inconsistency (Susan's existing slug), which invites "let's normalize" thinking after launch.

**How to avoid:**
- Lock the URL pattern **before launch**, in writing, in `.planning/DECISIONS.md`. Convention: `/attorneys/[firstname]-[lastname]` lowercased and hyphenated (aaron-belcher, stuart-smolen, jon-van-loo, iris-zhang, susan-jiang). `/practice-areas/[area-slug]`. `/blog/[year]/[slug]` or `/blog/[slug]` — pick one and document.
- Treat every URL on the new site as a stable, public identifier from day one. Pre-launch is the *only* time URL changes are free.
- If the legacy bsvlaw.com has URLs that the new site is replacing, set up 301 redirects in `vercel.json` from every old URL → new URL. Build a redirect map at the start of the migration phase, not after launch.
- After launch, every URL change requires a 301 redirect. Set a project norm: "Slugs are immutable. Changes require a redirect entry and a record in DECISIONS.md."
- For Susan Jiang specifically — Jon will paste her existing URL when we build her page; coordinate with him to either (a) match her current slug on the new site (preserves existing referral links) or (b) normalize her slug and add a 301 from the old.

**Warning signs:**
- A PR renames a file under `src/pages/attorneys/` without adding a redirect to `vercel.json`.
- A discussion thread proposes "let's restructure URLs" post-launch.
- Google Search Console shows a spike in 404s after a deploy.

**Phase to address:** Early — URL conventions get locked in the design / IA phase, before the first attorney or practice area page is built. Migration redirects from bsvlaw.com get added during the launch phase.

---

### Pitfall 15: Image weight — a single uncompressed headshot blows the 200 KB per-image budget

**What goes wrong:**
The placeholder headshots are tasteful and committed at 1.8 MB each because no one ran them through compression. When real headshots arrive, they get committed straight from the photographer's export: 6–12 MB per attorney. The repo bloats, page weight balloons, Lighthouse scores tank, and Vercel's free-tier bandwidth gets eaten by the homepage's team grid. The non-negotiable "no image larger than 200 KB" is silently violated.

**Why it happens:**
Image optimization happens at the moment of commit — there's no automatic gate. A photographer's export is "the right file." A non-coder doesn't have squoosh, sharp, or imagemin in their workflow.

**How to avoid:**
- Use Astro's built-in `<Image />` component for **every** image on the site. Astro processes images at build time using Sharp — the source can be a 6 MB original; the output to the browser will be optimized webp/avif.
- Source images go in `src/assets/` (Astro processes them); avoid `public/` for raw originals (Astro doesn't optimize those — they're served as-is).
- Add a pre-commit hook that checks: any file matching `*.{jpg,jpeg,png,webp,gif}` in the commit, if larger than 200 KB AND committed to `public/`, blocks the commit. Files in `src/assets/` can be larger because they'll be processed by Astro at build time — but cap source files at 2 MB to keep the repo lean.
- For attorney headshots specifically: standard treatment is a 600×800px portrait at quality 80 in webp — typically 50–80 KB. Define a `<Headshot />` component that wraps `<Image />` with these defaults.
- Run `npm run build`, then `du -sh dist/_astro/*.webp` (or PowerShell equivalent) to confirm all rendered images are within budget.
- Hero images: target ≤120 KB at LCP-relevant size; lazy-load everything below the fold (Astro `<Image>` does this by default with `loading="lazy"`).

**Warning signs:**
- A `.jpg` or `.png` over 500 KB appears in `git status`.
- The browser DevTools Network tab shows an image transfer > 200 KB on any page.
- Lighthouse Performance score is below 90 on mobile.

**Phase to address:** Early — image-pipeline conventions go in during the design / scaffold phase. The pre-commit hook is the safety net.

---

### Pitfall 16: Cumulative Layout Shift from web fonts and images without dimensions

**What goes wrong:**
The site uses Google Fonts (or similar) for the modern sans-serif typography. The font loads after the page renders, causing a flash of unstyled text → flash of styled text reflow → visible "jump" of the entire page. Headshots and hero images render without explicit `width` / `height`, so the layout reflows again when each image loads. Lighthouse's Cumulative Layout Shift (CLS) score tanks; Google ranks the site lower; users notice the jankiness and bounce.

**Why it happens:**
CLS is invisible to humans on a fast wired connection — it only shows up on mobile, on slow networks. The dev preview always feels fine. The fix (font preloading, explicit image dimensions, `font-display: optional`) is well-known but easy to skip.

**How to avoid:**
- Use Astro's `<Image />` component for every image — it sets `width` and `height` automatically from source metadata, preventing image-driven CLS by reserving the space ahead of load.
- Self-host the webfont. Don't link Google Fonts CDN; download the woff2 files, place them in `src/assets/fonts/`, declare them in CSS with `@font-face` + `font-display: optional` or `font-display: swap`. Eliminates CDN latency and gives full control over loading behavior.
- Preload the primary font weights: `<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>` in `BaseLayout`.
- Use `size-adjust` / `ascent-override` on the `@font-face` declaration to size-match the fallback so the swap from fallback to web font causes no reflow.
- Test on Vercel's preview deployment using Chrome DevTools → Network → Slow 3G + Performance → record. Look for layout shift events.
- Target CLS < 0.1 on mobile. Verify in Lighthouse on a deployed preview, not in dev mode.

**Warning signs:**
- A page contains `<img>` without `width` / `height` attributes.
- The CSS uses a Google Fonts `<link>` tag directly instead of self-hosted `@font-face`.
- Lighthouse CLS is yellow or red (≥ 0.1).
- The page visibly "jumps" when reloaded with a cold cache on a throttled connection.

**Phase to address:** Middle (build phase, when typography + image components are built) and verified in Late (pre-launch performance audit).

---

### Pitfall 17: Forgetting to set per-page canonical URLs — duplicate content from www/non-www, trailing-slash, query params

**What goes wrong:**
Astro doesn't set canonical URLs by default. The site is reachable at `https://bsvlaw.com/practice-areas/mergers-acquisitions/`, `https://bsvlaw.com/practice-areas/mergers-acquisitions`, `https://www.bsvlaw.com/practice-areas/mergers-acquisitions/`, and `https://bsvlaw.com/practice-areas/mergers-acquisitions?utm_source=newsletter`. Google sees four pages of identical content and either picks one arbitrarily or splits ranking signal across all four. SEO ranking suffers; structured data may even be associated with the wrong URL.

**Why it happens:**
Canonical URL setup is a one-line addition that's easy to forget. Astro's default layouts don't include `<link rel="canonical">`. Vercel doesn't normalize trailing slashes unless told to.

**How to avoid:**
- In `astro.config.mjs`: set `site: 'https://bsvlaw.com'` and `trailingSlash: 'never'` (or `'always'`, pick one and stick with it).
- In `vercel.json`, set `cleanUrls: true` and configure redirects from the non-canonical variants:
  ```json
  {
    "redirects": [
      { "source": "https://www.bsvlaw.com/(.*)", "destination": "https://bsvlaw.com/$1", "permanent": true }
    ]
  }
  ```
- In `BaseLayout.astro`, emit `<link rel="canonical" href={canonicalUrl}>` where `canonicalUrl` is computed from `Astro.url.pathname` and the configured `site`:
  ```astro
  const canonical = new URL(Astro.url.pathname, Astro.site).href;
  ```
- Strip query strings from canonical (UTM params should not affect canonical URL).
- After launch, verify in Google Search Console "Pages" report that no URL has the "Duplicate without user-selected canonical" warning.

**Warning signs:**
- A page's source contains no `<link rel="canonical">` tag.
- A site:bsvlaw.com Google search returns trailing-slash and non-trailing-slash variants of the same page.
- Google Search Console reports "Duplicate, Google chose different canonical than user."

**Phase to address:** Early (in `BaseLayout` setup) and verified Late (SEO audit phase).

---

### Pitfall 18: Linking to opposing counsel, courts, or third parties — defamation and professional-responsibility friction

**What goes wrong:**
A blog post discusses an active matter and links to the opposing counsel's website, or names a judge in an analysis post that's critical of a ruling, or links to a state-court docket in a way that could be read as advocacy. Aside from defamation risk, ABA Model Rule 8.2(a) prohibits lawyers from making false statements about the qualifications or integrity of judges; Rule 3.6 limits trial publicity; Rule 7.1 prohibits false or misleading communications. A boutique transactional firm is less exposed than a litigation firm, but commentary on M&A regulatory decisions, IP litigation outcomes, or tax-court rulings can drift into the same territory.

**Why it happens:**
Blog content benefits from concrete examples and links — but the legal-news / commentary-on-cases genre walks a line that requires more care than a typical content marketing post.

**How to avoid:**
- Editorial guideline: blog posts about pending matters, opposing counsel, or named judges require a separate pre-publication review by at least one partner.
- Linking practice: link to *official* sources (the court's docket on PACER, the SEC filing, the IRS guidance) rather than to a counterparty's website. Outbound links should be `rel="nofollow noopener"` by default.
- Avoid evaluating named individuals (judges, opposing counsel) in posts. Discuss the legal reasoning, not the people.
- For posts that touch on cases BSV was involved in: see Pitfall 5 — confidentiality + this consideration both apply.
- Standard disclaimer plus a stronger one on case-commentary posts: "Commentary on legal developments reflects the author's analysis; it is not a statement about any party, attorney, or judge involved."

**Warning signs:**
- A blog post draft names a specific judge in critical terms.
- A draft links directly to an opposing counsel's site as the primary example.
- A draft discusses an ongoing matter in which BSV (or a known co-counsel) is involved.

**Phase to address:** Late — blog editorial guidelines should be documented before the first commentary post publishes.

---

### Pitfall 19: Hiding routine content edits behind multi-step processes Jon can't run

**What goes wrong:**
The site is built to require running `npm install`, `npm run dev`, and editing `.astro` files with frontmatter — fine for a developer. Jon, who has no coding background, needs to change a phone number, fix a typo in his bio, or update fee-disclosure language. Each edit requires opening the terminal, finding the file, navigating Astro syntax, committing, pushing, waiting for the Vercel deploy. He won't do it. Edits sit undone for weeks; the site drifts from accurate.

**Why it happens:**
Developer-friendly defaults aren't user-friendly. Astro's content collections are a strong technical choice but require git literacy to edit.

**How to avoid:**
- Use **markdown files for all editable content** (attorney bios, practice area descriptions, blog posts). Markdown is human-readable in any text editor; it doesn't require knowing JSX or `.astro` syntax. Jon can edit on GitHub.com directly via the web editor.
- Bios, practice area copy, and the firm's mission statement live in `src/content/site/`, NOT inside `.astro` components. The `.astro` file is the layout; the markdown is the content.
- Frontmatter is kept minimal and well-documented: each file starts with a comment block explaining what each field does.
- Add a "How to edit the site" section to the project's `README.md` written for a non-coder: "To fix a typo on your bio: 1. Open this URL on GitHub… 2. Click the pencil icon… 3. Edit the text… 4. Click 'Commit changes'."
- Consider, post-launch, a lightweight CMS layer (Decap CMS, TinaCMS) that gives Jon a form-based editor backed by the same markdown files. Defer until needed — many boutique firms manage fine without one.
- Don't ever require Jon to run a terminal command for a routine content change.

**Warning signs:**
- An attorney bio's text is inlined inside an `.astro` component instead of a markdown file.
- A typo fix requires opening 3+ files.
- Jon asks for help making the same kind of edit twice.

**Phase to address:** Early — content architecture must be markdown-driven from day one. Refactoring later is expensive.

---

### Pitfall 20: Pushing changes to production without a preview Jon can click and approve

**What goes wrong:**
Claude (or any contributor) makes a content or design change and merges to `main`. The Vercel auto-deploy runs and the change is live. Jon sees it for the first time on the live site — maybe he doesn't notice; maybe he notices something is wrong but the change has already been live for hours; maybe a client visiting in those hours sees the broken state. Worse: a regulator or bar reviewer screenshots the broken state during a routine check.

**Why it happens:**
Auto-deploy from `main` is a great default for solo developers but skips human review. The `gsd` auto-mode (per `PROJECT.md` decisions: "Auto mode (yolo)") explicitly wants the build to proceed without manual approval gates — but that decision applies to *development workflow*, not to *production deploys of visible client-facing changes*.

**How to avoid:**
- Default branch strategy: development on a feature branch → push to GitHub → Vercel automatically creates a **preview deployment** with a unique URL → Jon clicks the preview URL, reviews, approves → merge to `main` → production deploy.
- Configure Vercel to comment the preview URL on every PR.
- Even in `--auto` / yolo mode for the build, draft a "visible changes require a preview link Jon approves" rule and respect it for any change that alters layout, copy, or design.
- For pure technical changes (dependency bumps, build-config refactors) that don't affect the rendered output, full-auto is acceptable — verify with a screenshot comparison test if available.
- For typo fixes and tiny copy changes Jon makes himself via GitHub web editor: GitHub's "Commit directly to main" is acceptable for these — the preview-link gate is for changes he didn't make himself.

**Warning signs:**
- A change merges to `main` without a corresponding preview link in the PR.
- Jon hears about a live change from someone other than the build process.
- The Vercel project doesn't have a `production` branch protection rule.

**Phase to address:** Early — workflow conventions go in during the GitHub / Vercel setup phase.

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems on this project specifically.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hand-write JSON-LD inline on each page | Fast first page | Drift across pages; one wrong block silently kills SEO; impossible to refactor | Never on a multi-page firm site |
| Hardcode the disclaimer text in each layout | Easier to find while developing | Inconsistent edits; bar-rule update means hunting through every file | Never — use a single `<Disclaimer />` component |
| Skip the `<Image />` component for "just this one image" | Saves 5 minutes | One 6 MB headshot in the repo, weeks of bandwidth, Lighthouse hit | Only for SVGs (which Astro doesn't need to optimize) |
| `display:none` honeypot only, no time trap | Fastest implementation | Real spam volume; intake inbox unusable in 3–6 months | Never — pair with time trap from day one |
| CSP set to `unsafe-inline 'unsafe-eval' *` to "fix later" | Site renders in dev | Security headers are decorative; bar / client audit catches it | Never on production; use report-only mode first |
| Generic "specializes in" copy because it sounds right | Faster copywriting | Cal. Rule 7.4 risk; potential bar complaint | Never — use "focused on" instead |
| Copy representative deals from current bsvlaw.com without re-clearance | Fast bio copy | Rule 1.6 confidentiality exposure | Never without explicit per-client sign-off |
| Skip pre-commit gitleaks because "we'll be careful" | No setup time | One bad commit and Resend / Supabase keys are public; rotation required | Never — install gitleaks day one |
| Auto-deploy main without preview review for "minor" copy changes | One less click | Live broken state visible to clients between deploy and discovery | Acceptable only for typo fixes Jon makes himself via GitHub UI |
| Skip the 200 KB image gate "because we'll check later" | Fast image addition | Repo bloat; bandwidth cost; missed launch target | Never — automated check is required |
| Skip rate limiting because "we're not a big target" | Faster contact form ship | One bot run = 10,000 junk leads, possible Resend bill | Never — Vercel WAF rule is one command |
| Use Tailwind v3 patterns "because that's what I know" | Familiar syntax | v4 build errors, weird styling bugs | Never — this project is v4, period |

---

## Integration Gotchas

Common mistakes when connecting to external services this project will use.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Vercel deployment | Assuming `vercel.json` headers apply to static pages (they do) AND prerender 404s (they don't always) | Test headers on `/404` and on the contact-form POST response, not just GET pages |
| Vercel env vars | Adding a secret as "Plain Text" instead of "Sensitive" in the dashboard | Mark secrets (API keys, DB credentials) as Sensitive — Vercel masks them in logs |
| Vercel env vars | Setting env vars only in Production, not Preview, causing preview deploys to silently break | Set env vars in all three environments (Production, Preview, Development) unless you specifically want them gated |
| Resend / email API | Using a personal domain for the From: address ("via resend.com" fallback) | Verify `bsvlaw.com` DNS records (SPF, DKIM, DMARC) in Resend; send From: an `intake@bsvlaw.com` or `noreply@bsvlaw.com` |
| Supabase (if chosen) | Building features against the `anon` key only — appears to work because RLS is initially permissive | Enable RLS on every table immediately; default-deny; explicitly grant minimum policies; use `service_role` only server-side |
| Supabase (if chosen) | Inserting from client-side JS with the anon key | Always insert via an Astro Action / API route using the service_role key; never expose service_role to the client |
| Google Search Console | Verifying the wrong protocol/host variant (`http://bsvlaw.com` vs `https://www.bsvlaw.com`) | Verify all four variants; set `https://bsvlaw.com` as the canonical preference |
| GitHub Actions / CI | Storing secrets in workflow files | Use GitHub repo secrets; reference via `${{ secrets.NAME }}`; rotate any secret that accidentally appeared in plaintext |
| Astro sitemap integration | Sitemap excludes attorney / blog pages because they're built from a content collection | Verify generated sitemap.xml includes every URL after build; configure `@astrojs/sitemap` with `customPages` or `filter` if needed |
| Astro view transitions | Forms break across page transitions because the form submit happens inside a soft-nav | Add `data-astro-reload` to the contact form's action link or use a full reload for POST endpoints |
| Cloudflare Turnstile / hCaptcha (if added later) | CAPTCHA iframe blocked by strict CSP | Add the captcha provider's domain to `frame-src` and `script-src` in the CSP |
| Vercel Functions / Astro server routes | Cold-start latency on the first contact-form submission of the day | Acceptable for low-traffic intake; use Vercel's "always warm" only if cold starts become a noticeable UX issue |
| GitHub branch protection | Setting "Require pull request reviews" but allowing the owner to bypass | Require at least the Vercel preview check to pass on `main`; require Jon's review on visible changes |

---

## Performance Traps

Patterns that work at small scale but fail as the site grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Unoptimized hero image on homepage | LCP > 2.5s on mobile; Lighthouse Performance < 90 | `<Image />` with explicit width/height; `loading="eager"` only on the LCP image; webp/avif format | Immediately on slow connections; visible on launch |
| Self-hosted font without `font-display` setting | FOIT (flash of invisible text) for 1–3 seconds | `font-display: optional` for the primary font; `swap` if optional causes wrong-font flash | Immediately on first paint over 3G |
| Blog index page that renders all posts inline | Page weight grows linearly with post count | Paginate at 10 posts/page; or render only the latest 10 with a link to a full archive | At ~30+ blog posts |
| JSON-LD computed inside a slow loop in the layout | Build time grows linearly with page count | Memoize / generate JSON-LD per content entry inside the content collection, not per render | At 50+ pages, build slows perceptibly |
| Loading view-transitions on a 100% static site | Slight extra JS for no benefit on a referral-driven site where most sessions are single-page-view | Use view transitions only if you measure the engagement benefit; otherwise skip | Always — but the cost is tiny |
| Storing all blog images in `public/` (unoptimized) | 200 KB rule violated; Vercel bandwidth limits | Use `src/assets/` for blog images; Astro processes at build time | Beyond free Vercel bandwidth tier (~100 GB/month) |
| Server endpoint that does DB write before honeypot/rate-limit check | Backend cost scales with bot volume; possible DoS | Validate honeypot, then rate limit, then validate input, then write to DB | At first bot run |
| Notification email synchronous in the request handler | Slow form submit (1–3 seconds) | Acknowledge form receipt to user immediately, fire notification email async (Astro background task or Vercel queue) | Acceptable for low volume; tune if submit feels slow |

---

## Security Mistakes

Domain-specific security issues for a law firm marketing site, beyond OWASP basics.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing prospective-client form data in plaintext at rest | Rule 1.18 / 1.6 / ABA 477R violation; PII exposure if breached | Encrypt at rest (Supabase storage is encrypted by default; verify); apply column-level encryption for any free-text field |
| Notification email to a personal inbox | Single-attorney point of failure; data leaves firm control if attorney leaves | Send to firm-controlled `intake@bsvlaw.com`; multiple recipients; document inbox ownership |
| Logs (Vercel function logs, Sentry, etc.) capture form submissions in full | PII / prospective-client confidences in third-party log storage | Redact form bodies in logs; use a structured logger that masks specific fields; review log retention |
| Storing visitor IP without policy | Privacy implication; potentially CCPA-relevant for California visitors | Store IP only with rate-limit / abuse purpose; retention policy ≤ 30 days; document in a privacy notice |
| User-agent string stored with each lead | Minor PII exposure; useful for spam detection but unnecessary for legit leads | Store only on rate-limit-rejected entries, not on accepted leads |
| No CCPA / privacy notice page | California Consumer Privacy Act exposure for any data collected from California visitors | Add a `/privacy` page describing what data the site collects, how it's used, and how to request deletion |
| GitHub repo public with `.env.example` containing real keys | Even "example" files can leak production keys if real values pasted in | `.env.example` contains only placeholder values; never real keys |
| Vercel project not enrolled in Vercel's audit log | No record of who deployed what, when | Enable Vercel team audit log (paid plans); for Hobby tier, rely on git history |
| Open Redirect on the contact-form `next` parameter | Phishing vector — bad actor sends a link with `?next=evil.com` and the form redirects there post-submit | Whitelist `next` redirect targets to same-origin; reject external URLs |
| Reflected XSS on the thank-you / confirmation page | A submitted name with `<script>` renders unescaped on confirmation | Astro escapes by default — but verify any `set:html` usage on the confirmation page is escaped (better: don't echo user input back at all) |
| Stale package-lock.json with known-vulnerable transitive deps | Supply-chain risk | Enable Dependabot / Renovate; review weekly; npm audit on every PR |

---

## UX Pitfalls

Common user experience mistakes for a referral-driven business law firm site.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Hero leads with firm credentials ("Founded 2009, ranked by Chambers, BigLaw alumni") | Referred visitors get no confirmation that this is the firm they were told to call — they want their name confirmed | Hero leads with "Team work to get good results" (per non-negotiables) and the three practice areas; recognition is visible but not the lead |
| One generic "Contact Us" CTA on every page | Cold-search visitors and referral visitors have different needs; both are served the same wide funnel | Primary CTA "Schedule a Conversation" or "Request a Fee Estimate"; sticky in the nav |
| Practice areas described in jargon ("section 368 tax-free reorganizations," "Hart-Scott-Rodino premerger filings") without plain-English framing | Sophisticated GCs and PE counsel read it fine; founders / first-time deal-makers bounce | Lead each practice area with a plain-English sentence ("Selling your company or buying another"), then expand into specifics for sophisticated readers |
| Attorney bios that are wall-of-text credentials | Page reads like a CV; no sense of the person | StoryBrand framing: lead with a one-line description of what kind of client problem this attorney solves; specifics follow |
| Mobile design treated as a stretched-desktop afterthought | Most referred visitors check the site on their phone the moment the referral comes in | Mobile-first build; test every page on a real iPhone before the desktop layout is finalized |
| Contact form asks for too much upfront (LinkedIn URL, company name, role, industry, deal size) | Friction kills referral-warm leads | Minimum viable form: name, email, phone optional, one free-text "Tell us about your matter" field; everything else can be asked in the first call |
| Fee disclosure hidden in an FAQ at the bottom | Cost is one of the three client fears (per FIRM_BRIEF.md) — burying it amplifies the anxiety | Fee-structure note on the homepage AND each practice area page: "Hourly billing with upfront estimates" |
| No "what happens next" plan after the form is submitted | The post-submit unknown is conversion-killing | Confirmation page (or inline message): "Thanks. One of our partners will email you within one business day." Set the expectation and meet it |
| Headshot quality varies between attorneys (some pro-shot, some snapshots) | Inconsistent visual quality undermines the "boutique professional" positioning | All headshots same style, same lighting, same neutral background; defer launch if photos aren't done |
| Susan Jiang's profile is incomplete at launch (per FIRM_BRIEF.md) | Empty / placeholder bio undermines the "we're all senior, all engaged" message | Don't launch her page until the bio is complete; or don't list her on the team page until ready |
| Calendly / scheduling widget embedded prominently | Implies BSV is a transactional-volume practice; mismatch with boutique partner-led positioning | Use a "Schedule a Conversation" link in the post-submit email, not a public Calendly on the page itself |
| Cookie banner / consent dialog without context | Friction for a low-tracking site; required by GDPR/CCPA only if you actually track | Add cookie banner only if analytics is enabled; if no third-party tracking, no banner needed (still add a privacy notice page) |

---

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces. Run through this before launch and after any layout/structure change.

- [ ] **Footer disclaimer:** Renders on every page (including `/404`, `/thank-you`, redirected URLs) — verify by build-time crawl test, not just visual check
- [ ] **Contact form disclaimer:** Visible above or adjacent to the submit button — not in a collapsed accordion or behind a tooltip
- [ ] **Blog post disclaimer:** Present on every post; check both top-of-post callout and footer of post; verify Zod schema enforces `published: date` so no draft accidentally goes live without a date
- [ ] **Practice area disclaimer:** Present on each of the three practice area pages
- [ ] **JSON-LD blocks:** Each page has the right schema type (LegalService on home, Person on attorney pages, Article on blog posts); each block validates against Google Rich Results Test; the data inside actually matches the page
- [ ] **Canonical URLs:** Every page has `<link rel="canonical">`; canonical points to the correct trailing-slash variant; no query strings
- [ ] **Image weight:** Every image rendered in `dist/` is under 200 KB (run `du -sh dist/_astro/*.{webp,avif,jpg,png}` to verify); no committed source image is over 2 MB
- [ ] **Headshots:** All five attorneys have real (or matched-style placeholder) photos — no mix of styles
- [ ] **CSP:** Configured in `vercel.json`; tested with no console warnings on every page; no `unsafe-inline` in `script-src`
- [ ] **Security headers:** `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` set; verify with `curl -I https://bsvlaw.com` and securityheaders.com (target: A or A+)
- [ ] **`.env` files:** Not in git history (`git log --all --full-history -- ".env*"` returns nothing); gitleaks pre-commit hook installed; GitHub push protection enabled
- [ ] **Contact form rate limit:** Vercel WAF rule on `/api/contact` configured; manual test confirms 429 after 5+ submits/minute
- [ ] **Honeypot + time trap:** Both present on contact form; honeypot field hidden offscreen (not just `display:none`); server-side timestamp check ≥ 2 seconds
- [ ] **Email subject injection:** Form handler does NOT concatenate user input into email headers; Zod validation rejects `\r`/`\n` in any field
- [ ] **Notification destination:** Notification email goes to firm-controlled inbox, not personal Gmail
- [ ] **Lead retention policy:** Documented in `.planning/DECISIONS.md`; cron / scheduled function to purge old leads if applicable
- [ ] **"Specialist" / "expert" lint:** `npm run lint:legal` passes — no banned terms in any rendered content
- [ ] **Client-disclosure clearance:** Every named client and named counterparty is on the clearance list; representative-deals copy matches the approved text
- [ ] **Attorney URL slugs:** Match the planned convention (`/attorneys/[firstname]-[lastname]`); locked in writing; Susan Jiang's slug coordinated with the existing bsvlaw.com URL
- [ ] **Redirects from bsvlaw.com legacy URLs:** Listed in `vercel.json` redirects; 301 status; tested with `curl`
- [ ] **Sitemap:** Generated; includes every public URL; submitted to Google Search Console
- [ ] **Robots.txt:** Allows crawling of public pages; disallows `/api/*` and any non-public admin paths
- [ ] **Mobile:** Tested on a real iPhone, not just Chrome DevTools device mode; touch targets ≥ 44px; no horizontal scroll
- [ ] **Performance:** Lighthouse Performance score ≥ 90 on mobile; CLS < 0.1; LCP < 2.5s
- [ ] **Accessibility:** Lighthouse Accessibility score ≥ 95; no `alt=""` on informational images; form fields all have `<label>`; color contrast meets WCAG 2.1 AA
- [ ] **Preview deploy workflow:** Each PR creates a Vercel preview; preview URL is the artifact Jon reviews; main branch protected
- [ ] **Vercel env vars:** Set in Production, Preview, and Development; secrets marked Sensitive
- [ ] **Privacy / CCPA notice:** `/privacy` page exists; describes data collection; reachable from footer
- [ ] **Attorney advertising disclosure:** Footer notes "This website may be considered attorney advertising. Prior results do not guarantee a similar outcome." (or whatever the final language is — verify against current CA + NY rules)
- [ ] **Jurisdiction statement:** Footer states the firm is licensed in California and New York
- [ ] **Chambers Spotlight recognition:** Displayed but not the lead; matches the exact ranking text Chambers granted

---

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Missing disclaimer on a page | LOW | Add the disclaimer in the next commit; verify the build-time test now catches it; document the gap in `.planning/DECISIONS.md` |
| `.env` committed to git | HIGH | Rotate **every** credential immediately; `git filter-repo` to scrub history; force-push (only acceptable destructive operation in this scenario); enable GitHub push protection if not already; assume any committed secret is compromised |
| Client name disclosed without clearance | MEDIUM–HIGH | Remove immediately; assess whether the disclosure caused harm; if applicable, self-report to the affected client and the State Bar |
| "Specialist" language shipped to production | LOW | Edit content; deploy; document in DECISIONS.md; the bar typically gives notice before action, but don't wait |
| JSON-LD broken across the site | LOW (technical) | Fix the validation; rebuild; resubmit sitemap; Google may take 1–2 weeks to reindex |
| CSP blocks the site after deploy | MEDIUM (visibility) | Roll back via Vercel dashboard immediately; debug in report-only mode on preview; redeploy when verified |
| Bot spam fills leads table | MEDIUM | Add rate limiting if absent; purge spam entries; add honeypot time trap if absent; consider hCaptcha layer |
| Email subject injection exploited | HIGH | Disable the form immediately; review SPF/DMARC for damage; replace handler with structured-input API; assess if any phishing went out from the firm's address |
| Image too large committed | LOW | Optimize and re-commit; `git filter-repo` if the image bloat is severe; install pre-commit size check |
| Attorney URL slug needs to change post-launch | MEDIUM | Add 301 redirect in `vercel.json` from old URL → new; never delete the redirect; document the change |
| Privacy / CCPA complaint received | MEDIUM | Have the privacy notice ready before launch (cheapest insurance); designate a privacy contact; respond within the statutory window (45 days for CCPA deletion requests) |
| Susan Jiang bio is still incomplete at launch | LOW | Remove her from the team page temporarily; add her once the bio is final; no broken page goes live |

---

## Pitfall-to-Phase Mapping

How roadmap phases should address each pitfall.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1. Disclaimer drift | Early (scaffold) | Playwright crawl test fails CI if any page missing disclaimer |
| 2. ABA 477R contact form security | Late (security) — but backend choice in form-build phase | Manual review of TLS, env vars, RLS, notification destination |
| 3. Cal. Rule 7.4 "specialist" language | Middle (content) | `npm run lint:legal` passes; manual review of every bio |
| 4. JSON-LD validation | Middle (build) and Late (SEO audit) | Google Rich Results Test on representative pages; build-time Zod schema |
| 5. Client-disclosure / Rule 1.6 | Middle (content) | `CLIENT_DISCLOSURE_CLEARANCE.md` complete; no proper noun in content lacks a row |
| 6. Blog as legal advice | Late (blog-system build) | Editorial review process documented; `reviewed_by` field required in frontmatter |
| 7. CSP misconfiguration | Late (security) — start in report-only mode in middle (build) | Browser console clean on every page; securityheaders.com A+ |
| 8. `.env` committed | Early (scaffold) — day-one setup | gitleaks pre-commit hook + GitHub push protection enabled; `git log` audit |
| 9. Honeypot bypass | Middle (form build) | Time trap implemented; honeypot field hidden offscreen, not `display:none` |
| 10. Missing rate limiting | Late (security) — but plumbing in form-build phase | Manual rate-limit test (curl in a loop); Vercel WAF rule configured |
| 11. Email header injection | Middle (form build) | Code review; structured email API SDK only; Zod rejects newlines |
| 12. Tailwind v4 patterns | Early (design / scaffold) | Code review catches v3 patterns; `theme()` usage flagged |
| 13. Astro 6 content collections | Early (scaffold) | `npm run build` runs without deprecation warnings; `output: 'hybrid'` absent |
| 14. URL slug churn | Early (information architecture) | URL conventions in `.planning/DECISIONS.md`; slug changes require redirect entry |
| 15. Image weight | Early (image pipeline) + Late (audit) | Pre-commit size check; `dist/` audit before launch |
| 16. CLS from fonts/images | Middle (typography + image components) | Lighthouse CLS < 0.1 on mobile in deployed preview |
| 17. Missing canonical URLs | Early (`BaseLayout` setup) | Every page source has `<link rel="canonical">`; Search Console clean |
| 18. Linking to opposing counsel / courts | Late (blog editorial guidelines) | Editorial review of every commentary-genre post |
| 19. Multi-step content edits | Early (content architecture) | Jon can edit a bio via GitHub web editor; tested with him before launch |
| 20. No preview before prod deploy | Early (workflow setup) | Branch protection on `main`; preview URL on every PR |

**Phase legend:**
- **Early** = setup, design, information architecture (first 1–2 phases of the roadmap)
- **Middle** = component build, content writing, contact form build (middle of the roadmap)
- **Late** = security audit, SEO audit, pre-launch checklist (final phases)

---

## Sources

- **Astro 6 breaking changes and Content Layer API** — Context7 (`/withastro/astro`), official Astro v6 release docs (HIGH confidence)
- **Tailwind CSS v4 upgrade guide** — Context7 (`/tailwindlabs/tailwindcss.com`), tailwindcss.com/docs/upgrade-guide (HIGH confidence)
- **Vercel security headers, CSP, rate limiting, @vercel/firewall** — Context7 (`/websites/vercel`), vercel.com/docs/cdn-security/security-headers (HIGH confidence)
- **Vercel env var management and `.env` handling** — Context7 (`/websites/vercel`), vercel.com/docs/environment-variables (HIGH confidence)
- **Astro Actions and API endpoints (CSRF / validation patterns)** — Context7 (`/withastro/astro`) (HIGH confidence)
- **Astro Image component, optimization, CLS prevention** — Context7 (`/withastro/astro`) (HIGH confidence)
- **ABA Formal Opinion 477R (lawyer obligation to protect client communications)** — General professional-responsibility training; Jon should verify against the current ABA opinion text before launch (MEDIUM confidence)
- **California Rules of Professional Conduct 1.6, 1.18, 7.1, 7.4, 7.5, 8.2** — General professional-responsibility training; rule numbering and text shift periodically; Jon to verify final disclaimer/advertising language against current State Bar guidance (MEDIUM confidence)
- **New York Rules of Professional Conduct 7.4 (advertising), 1.6, 1.18** — General training; parallel structure to California rules (MEDIUM confidence)
- **StoryBrand framework and conversion patterns** — Internal `.planning/LAW_FIRM_WEBSITE_GUIDE.md` (HIGH confidence — already firm-curated)
- **OWASP general web vulnerability classes (header injection, XSS, CSRF, rate limiting)** — General security knowledge (HIGH confidence)
- **Honeypot anti-bot patterns and limitations** — General security knowledge (MEDIUM confidence on current bot sophistication; verify after launch by measuring spam volume)

---
*Pitfalls research for: boutique California/New York law firm marketing site on Astro 6 + Tailwind v4 + Vercel*
*Researched: 2026-05-25*
