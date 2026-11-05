# Arman Homes — Stage 1 implementation report

Date: **5 November 2026 (Asia/Kolkata)**. Scope: functionality, WhatsApp/phone enquiries, technical SEO, assets, favicons and indexing handover. Comprehensive performance optimization, the final accessibility audit and final pre-deployment QA are reserved for Prompt 2.

**Local Stage 1 work is complete with warnings. Nothing was committed, pushed or deployed. The public site still has the previous email forms.** The existing working tree already contained substantial staged and unstaged work; it was preserved and incorporated rather than reset. Earlier email-delivery instructions are superseded by the current WhatsApp-only request.

## A. Project discovery

| Item | Verified result |
|---|---|
| Framework | Astro **7.4.0 installed**, static output, trailing slashes. TypeScript; no React application/backend. |
| Toolchain | npm **11.17.0**, Node **24.19.0**, package-lock.json. Python 3 runs the static audit. |
| Routing | Astro file routes; project/property routes generated from data. Initial: **22 HTML pages**. Final: **21 HTML pages**, including the 404 document; **20 indexable canonical pages**. Three machine endpoints: robots.txt, sitemap.xml, sitemap-index.xml. |
| Hosting | Public responses identify **Apache**; existing DirectAdmin upload/rollback documentation matches the hosting history. Static root: `/domains/armanhomes.in/public_html/`. |
| Deployment | Manual static build/ZIP upload is the documented workflow. Git remote: `https://github.com/pv-webservices/arman-homes.git`; branch: `codex/hosting-upload`. **No Git-to-host deployment pipeline was found.** |
| Domain | Preferred origin: `https://armanhomes.in`, non-www, slash-terminated content URLs. A record: **184.164.144.133**. |
| DNS | Current nameservers: **ns1.supercloudapps.com**, **ns2.supercloudapps.com**. GoDaddy is the supplied registrar; authoritative DNS is the hosting nameserver service. |
| Enquiries | Six shared-component forms: Contact, Sell Property, Canvas – D Tower, Qrious, Echoes, Duet. All previously used an email-delivery provider. |
| Contact details | User-confirmed WhatsApp/phone: **+919354210824**. Existing public email retained: **armanhomess@gmail.com**. No email delivery backend remains locally. |
| Other routes/content | Home, About, service overview/five service pages, Projects/four project details, Properties/four detail pages, Contact and Privacy Policy. No blog/article routes, separate terms page or verified founder profile exists. |
| Assets | Brand, editorial, illustrative and project imagery; local brochures/video; self-hosted Fontsource fonts compiled into `_astro/`. Source masters remain outside public output. |

Commands:

```sh
npm run dev
npm run check
npm test
npm run build
npm run audit
npm run test:audit
npm run preview -- --port 4330
# In another terminal with the preview running:
npm run test:forms
node scripts/interaction-qa.mjs http://127.0.0.1:4330 --production
node scripts/site-qa.mjs http://127.0.0.1:4330 --stage1
```

There is no separate lint script. `npm run package:hosting` builds a ZIP without uploading; no fresh release ZIP was needed in Stage 1. Build/packaging must be repeated after Prompt 2.

The complete route table and interaction inventory are in [ROUTE-INVENTORY.md](ROUTE-INVENTORY.md).

## B. Changes completed

### Website functionality and enquiries

- Replaced all six email forms with **WhatsApp-only** message preparation. Removed email endpoints, AJAX fetches, email hidden fields, submission timestamps/Reply-To, provider timeout states and mandatory visitor email fields. No email dependencies were present to remove. The public email and mailto links remain visible.
- Shared recipient/default-message helper uses the official `https://wa.me/919354210824?text=...` pattern and `encodeURIComponent`. Simple links work without JavaScript. Service/project/property CTAs include the appropriate context; generic contacts have a default property-enquiry message.
- Forms include entered name/phone, selected enquiry/property type, project/seller details when relevant, message and canonical source page. Empty optional fields and unrelated query strings are excluded. No enquiry data goes to application logs or analytics.
- Added/preserved trimmed required-field checks, 10–15 digit international phone validation, sensible length limits, consent, accessible labels/errors, aria-invalid and first-invalid focus. Inputs remain intact on invalid/offline/blocked-popup paths.
- Valid submission opens a tab synchronously within the user action, clears its opener before external navigation, and asks the visitor to review/send manually. Duplicate form activation is briefly locked; pageshow restores the control. No delivery confirmation is claimed.
- Direct draft, copy-message and phone fallbacks remain available. Clipboard rejection reveals a labelled selectable message. No-JS submission stays disabled; direct contact links work, and pressing Enter cannot transmit form values. External-tab anchors use noopener/noreferrer.
- Updated Privacy Policy to describe WhatsApp links, manual sending, phone handoff, clipboard use, existing session storage and possible hosting logs. Removed email-delivery claims and the obsolete provider setup guide.

Files: `src/components/InquiryForm.astro`, `src/scripts/enquiry.ts`, `src/data/site.ts`, `src/pages/index.astro`, `src/pages/[service].astro`, `src/pages/projects/[slug].astro`, `src/pages/privacy-policy.astro`, `src/styles/forms.css`, `.env.example`, `.env.production`.

### Error pages, URLs and headers

- Corrected the branded 404 H1 to **Page Not Found** and added WhatsApp/phone alternatives alongside Home/Properties. Preserved noindex, no canonical and sitemap exclusion.
- Removed `/thank-you/`; it no longer has a legitimate email-confirmation role. A clean deployment must delete its old hosted file. The local Apache release returns branded HTTP 404 for that URL and nested missing URLs.
- Preserved HTTPS/apex/index.html rules, query parameters, real 404s and the certificate-renewal exemption. Ordered directory slash normalization before the domain rule to coalesce combined variants into one redirect in Apache. No SPA fallback or unrelated platform configuration was added.
- Preserved nosniff, strict-origin-when-cross-origin and SAMEORIGIN headers. Added the missing `application/manifest+json` MIME mapping.

Files: `src/pages/404.astro`, `src/layouts/Layout.astro`, `public/.htaccess`, `scripts/package-hosting.ps1`. Deleted: `src/pages/thank-you.astro`, `docs/FORMSUBMIT-SETUP.md`.

### SEO, indexing and icons

- Verified the existing shared unique titles/descriptions, one-H1 hierarchy, self-canonicals, index/follow/image-preview directives, image alts/dimensions, Open Graph/Twitter metadata and 1200×630 brand social card across the final output.
- Verified safe JSON-LD serialization, stable RealEstateAgent/WebSite identifiers and valid BreadcrumbList data. Existing confirmed locality is used; no new address, founder, ratings/reviews, opening hours, article or FAQ claims were introduced. Schema validation does not promise Google rich results.
- Retained crawlable robots.txt and the actual sitemap index/child paths. Postbuild derives the final sitemap from indexable HTML. Removed unreliable all-page checkout/modification timestamps; optional lastmod is omitted until reliable per-page dates exist.
- Extended `npm run audit` to inspect WhatsApp/phone destinations, required message text, external-tab attributes, forms, email integration absence, same-page fragments, CSS resource paths, ICO representation and removed utility routes alongside the existing SEO checks.
- Inspected and verified the existing approved-logo-derived icon family: 48px ICO, 48/96/192/512px PNG, SVG, 180px Apple icon and manifest. Social image and favicon proportions/branding were visually checked. No new logo variation was invented.
- Updated the project-specific Search Console guide: active DNS service, exact 20-URL inventory, excluded routes, manual inspection priorities/two suggested batches, four-week monitoring and owner action boundaries. Google favicon updates may take days/weeks; recrawling and indexing requests have no timing/indexing guarantee.

Files: `src/layouts/Layout.astro`, `src/pages/robots.txt.ts`, `src/pages/sitemap.xml.ts`, `scripts/finalize-build.mjs`, `scripts/audit-seo.py`, `scripts/test-seo-audit.py`, `scripts/prepare-icons.mjs`, `public/favicon*`, `public/apple-touch-icon.png`, `public/site.webmanifest`, `public/images/brand/social-card.png`, `docs/GOOGLE-SEARCH-CONSOLE.md`. Much of this structure existed in the incoming uncommitted work and was reverified rather than recreated.

### File organization and handover

- Preserved the existing purpose-based public folders and updated references already present in the working tree. Archived six confirmed-unused original JPEG photos from `public/images/happy-clients/` into `source-files/original-images/client-photos/`; none is referenced by current pages, CSS or scripts.
- SHA-256 scan of **147 public/source files** found **zero duplicate groups**. Source brochures, video, brand master and generated originals remain outside deployed output. Existing postbuild pruning excludes eight unused derivative images from the final build while retaining their source copies for Prompt 2.
- Updated README, upload/recovery instructions, route inventory, tests and this report. Existing layout, typography, imagery, motion, listings and business content were preserved apart from the requested enquiry/privacy/error changes. No image recompression, font optimization, video encoding or comprehensive performance work was performed.

## C. Executed verification

| Check | Actual result | Evidence |
|---|---|---|
| Production build | **21 HTML pages**, successful; **20 canonical indexable URLs** | Astro build output; `dist/` |
| Astro/TypeScript | **0 errors, 0 warnings, 0 hints** | `npm run check` |
| Unit tests | **9/9 passed** | `npm test` |
| SEO audit | **21 pages**, **1,013 internal link/resource/fragment references**, **0 issues** | `output/audit/seo.json` |
| Contact links | **135 WhatsApp links**, **144 phone links** inspected, all correct | Same SEO report; counts include repeated global navigation/footer links |
| Forms | **109 checks passed**, **12 desktop/mobile flows** across six forms, plus no-JS/failure/keyboard checks | `output/audit/forms.json` |
| Interactions | **38/38 passed**, including menu, search, Back/Forward, slideshow, film/gallery, brochure, validation and 404/indexing | `output/audit/interactions.json` |
| Local responsive runtime | **63/63 cases**: all 21 pages at 1440/768/375px; **35 unique internal links**, no failures/page errors/broken images/overflow | `output/qa/site-qa.json`; screenshots in `output/qa/` |
| Actual local Apache/TLS | **189 checks**, **20 content pages**, **143 public resource URLs**, all passed | `output/stage1/apache.json` |
| Redirects | **7 combinations** return a single permanent canonical redirect; target returns 200, query retained, no loop | Same Apache report |
| Error responses | Missing, nested missing, removed thank-you and private source path return branded HTTP **404**, noindex, no canonical | Same Apache report |
| Favicon/manifest | **8/8 URLs** reachable locally and on existing live site; required dimensions/48px ICO verified. Manifest MIME fixed locally | Apache/SEO reports; live baseline report |
| Audit rejection tests | **6/6 passed**; intentional hostname-check mutation was rejected, then source restored | `npm run test:audit`; `output/stage1/audit-mutation.json` |
| Production dependencies | **0 known vulnerabilities reported** | `npm audit --omit=dev`; `output/stage1/dependency-audit.json` |
| Asset inventory | **147 files**, **0 duplicate groups**, **6 unused originals archived** | `output/stage1/assets.json` |
| Missing/broken resources | Initial static audit: **0**; final audit/runtime: **0**. No nonexistent broken-link/asset repairs are claimed | Initial/final checks |
| Email removal | **6 form integrations removed**, no email endpoint/provider code in built HTML/JS or form source; public email retained | Source contract test and SEO audit |
| Real messages/calls | **0**; all handoffs mocked or inspected | Form/interaction suites |

The locally available `httpd:2.4` Docker image was used in an isolated loopback container with the actual built `.htaccess`, HTTP and temporary local TLS. No production configuration was changed. The container and preview process were stopped after verification. There was no remote preview deployment; localhost preview and the Apache container cover the current changes.

### Existing live site — read-only comparison

Public checks on 5 November found all **20 content URLs HTTP 200**, crawlable robots.txt, a 20-URL sitemap, the expected canonical domain, real branded missing/nested HTTP 404s and the three security headers. All eight icon/manifest URLs returned 200. A separate browser review passed **14 cases** across seven major pages at desktop/mobile widths, with no page/console errors, loaded-image failures or horizontal overflow.

The live site **still contains the old six email forms, old thank-you route and old 404 wording**. Its manifest lacks a content type. A combined HTTP/www/slash URL starts with an extra host-level redirect; the local rules cannot eliminate a redirect executed by the host before `.htaccess`. The local manifest fix, WhatsApp changes and updated error document require an authorized deployment and then live rechecking. Evidence: `output/stage1/live.json`, `output/stage1/live-browser.json`. These observations do not establish production verification of the new code.

## D. Required client decisions

1. Confirm or replace the **four illustrative property records**, their photographs, prices and availability before promoting/indexing those records. Confirm current project prices/offers with the owner; existing content was preserved, not newly certified.
2. Authorize deployment after Prompt 2. Confirm whether the existing DirectAdmin ZIP workflow should continue; a Git deployment pipeline would be a separate implementation request.
3. If old WordPress URLs must be retained, supply the actual legacy URLs and intended replacement pages for individual mappings. No significant content URL changes were made here.

Phone/WhatsApp is supplied and consistent; the existing public email is retained. No further contact-detail decision is needed for Stage 1. Real WhatsApp sends/calls, if desired for end-to-end acceptance, require separate authorization.

## E. Outstanding issues and limits

- **Deployment pending:** live email forms still violate the new enquiry requirement until the authorized release replaces them. Delete stale `thank-you/` and old bundles as part of clean deployment; overlaying files alone is insufficient.
- **Host-level redirect behavior:** local Apache rules pass, but the current upstream HTTP redirect can add hops. Confirm hosting HTTPS/domain settings during the authorized release; no DNS/server settings were changed here.
- **Content approval:** the illustrative listing facts are technically indexable in the preserved build but remain unapproved business content. Do not request their indexing or advertise them until confirmed.
- **Search Console:** DNS TXT verification, owner verification, sitemap submission and URL indexing requests have not been performed. Owner instructions are complete; no token was invented and no external account was modified.
- **Real handoff/delivery:** native mobile WhatsApp behavior, actual message receipt and calling were not tested. Mocked handoffs do not prove receipt.
- **Stage 2:** comprehensive performance/accessibility work, final pre-deployment QA and real-user Core Web Vitals remain unperformed in this stage. No final production-readiness claim is made.
- **Legacy URL history:** no verified complete old WordPress URL inventory was available. Unknown URLs return real 404s rather than blanket homepage redirects.

## F. Handover to Prompt 2

Preserve the approved design/content, verified contact details, WhatsApp-only enquiry contract, visible public email, consent/validation/fallback handling, no false delivery claims, 20 canonical URL paths, true 404/noindex/no-canonical behavior, robots/sitemap consistency and source masters. Keep testing external handoffs without sending messages or placing calls. Retain all existing uncommitted work; no commit, push or deployment is authorized by this stage.

Use the current build/runtime evidence as a functionality baseline, then address performance, the full accessibility audit and final release checks. Rebuild and rerun affected functional/SEO/Apache checks after changes. Verify the actual live release only after deployment authorization.

**STAGE 1 STATUS: READY WITH WARNINGS**

Next stage: **PROMPT 2 — PERFORMANCE OPTIMIZATION, ACCESSIBILITY & FINAL PRE-DEPLOYMENT QA.**

Reference guidance: [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [Google favicon requirements](https://developers.google.com/search/docs/appearance/favicon-in-search), [Google ownership verification](https://support.google.com/webmasters/answer/9008080), [Apache rewrite documentation](https://httpd.apache.org/docs/2.4/mod/mod_rewrite.html).
