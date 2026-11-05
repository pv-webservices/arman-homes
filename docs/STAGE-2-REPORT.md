# Arman Homes — Stage 2 report: performance, accessibility and final pre-deployment QA

Date: **5 November 2026 (Asia/Kolkata)**. Working copy: worktree `claude/arman-homes-prod-ready-233e82`. **Nothing was committed, pushed or deployed. No WhatsApp message was sent and no call was placed.**

## How this stage was set up (read first)

Prompt 1 ran in the main checkout on branch `codex/hosting-upload` (uncommitted). That branch is based on `061ae84` ("first draft"). It does **not** contain the two commits already merged to `main` through GitHub PR #1 (`pv-webservices/arman-homes#1`): the **Happy Clients** homepage section and **five Life Republic rental listings**. Shipping Prompt 1's tree as-is would have silently removed them.

Stage 2 therefore started from both:

1. A snapshot of Prompt 1's final working tree (commit object `4e13740`, made with a temporary index; Prompt 1's checkout, index and branch were not touched). After Stage 2 finished, its tree hash was re-checked and is identical, so no later Prompt 1 change was missed.
2. `main` (`3d71323`, PR #1), merged with `--no-commit`. One conflict (`src/data/properties.mjs`) was resolved by keeping all nine listings and moving their image paths into Prompt 1's new folders.

**Update: PR #2 (`claude/whatsapp-enquiries`, `b8c2ecf`) was merged to `main` while this stage ran**, so `main` was merged again (six conflicts). Resolution:
- **Enquiry forms:** Prompt 1's implementation was kept (`src/scripts/enquiry.ts`; six forms, copy/call fallbacks, canonical source URL, 109 tested checks). PR #2's `src/scripts/whatsapp.mjs` and `tests/whatsapp.test.mjs` were removed as superseded.
- **Email display:** PR #2's decision was adopted. The business email is shown as plain text, not a `mailto:` link, in the header menu, footer, contact band and Contact page, and is now unlinked on the Privacy Policy too.
- **Root `QA.md`:** stays deleted; it lives at `docs/QA.md`.

Every suite was re-run on the merged result (see Section D).

The result is uncommitted in this worktree (merge state retained). "Before" below means Prompt 1 + PR #1 before any Stage 2 optimization.

---

## A. Project summary

| Item | Verified value |
|---|---|
| Framework | Astro 7.4.0, `output: 'static'`, `trailingSlash: 'always'`; TypeScript; no client framework |
| Package manager / runtime | npm 11.17.0 with `package-lock.json`; Node 24.19.0 |
| Hosting | Apache (DirectAdmin) at 184.164.144.133; HTTP/1.1 with server-level gzip observed on the live site |
| Deployment | Manual: `npm run package:hosting` builds a ZIP for `public_html` (see `docs/HOSTING-UPLOAD.md`). No Git-to-host pipeline |
| Canonical domain | `https://armanhomes.in/` (non-www, trailing slash) |
| Routes | 26 HTML documents: 25 indexable content pages + `404.html`; plus `robots.txt`, `sitemap.xml`, `sitemap-index.xml` |
| Indexable / noindex | 25 / 1 (`404.html`, `noindex, follow`, no canonical) |
| Build / checks | `npm run build` (postbuild prunes unused images and writes sitemaps), `npm run check`, `npm test`, `npm run audit`, `npm run test:audit`, `npm run test:forms`, `npm run test:perf` |
| Deployment status | **Not deployed.** The live site still runs the October release (old email forms, no caching headers) |

## B. Performance and accessibility changes made

| Area | Change | Files |
|---|---|---|
| Hero LCP / slider | Slides 2–4 sat inside the viewport (stacked at opacity 0), so `loading="lazy"` could not defer them and all four hero images downloaded with the page. They are now rendered with `<Picture deferred>` (real sources in `data-src`/`data-srcset`, 1×1 placeholder) and swapped in after `load`; the next slide is also hydrated on demand before it is shown. The first slide stays `eager` + `fetchpriority="high"` | `src/components/Picture.astro`, `src/pages/index.astro`, `src/scripts/site.ts` |
| Responsive images | Added a ~1200px `-medium` WebP for the 40 images wider than 1400px (downscaled from the committed full derivative; 38–214 KB vs 137–409 KB full). `srcset` now offers small/medium/full, so DPR 2–3 phones and mid-size desktop slots stop downloading 1536–1920px files. The postbuild pruner ships only the 20 medium files actually referenced | `scripts/prepare-responsive-images.mjs`, `src/data/responsive-images.json`, `src/data/images.ts`, `public/images/**/-medium.webp` |
| Wrong `srcset` widths | Property cards and the property gallery declared 640px editorial images as `768w` and hard-coded 1200×800 dimensions. They now read real widths and dimensions via `imageBySrc()`. All 106 `srcset` candidates across the site are verified against their files | `src/components/PropertyCard.astro`, `src/components/Gallery.astro` |
| Gallery thumbnail bug | Swapping the main property photo set a `srcset` with wrong widths that would override the new `src`; the `srcset` is now removed on swap | `src/scripts/site.ts` |
| Rendering / main thread | Homepage sections after the hero use `content-visibility: auto` with `contain-intrinsic-size: auto 900px`. Throttled (4× CPU) traces: layout work fell from a median ~865 ms to ~510 ms (−40%). Not applied to the footer (would break the fixed mobile contact bar) | `src/styles/sections.css` |
| JavaScript | Removed the dead parallax scroll handler (no `[data-parallax]` element exists). JS stays a single 4.8 KB (gzip) module; no framework runtime, no third-party scripts, no long tasks from site JS | `src/scripts/site.ts` |
| Video | Already efficient (H.264 CRF 31, `preload="none"`, plays only on screen, never under reduced motion; the 30 MB film loads only on demand). Added: the 3 MB background loop is skipped when the browser's Data Saver is on. The film `poster` attribute (42 KB) loaded eagerly at ~130 ms, competing with the hero image, even though the section is far below the fold. It is now a lazy `<img>` behind the video (looks identical, also works without JS), and the modal film's poster is set only when the modal opens | `src/components/FilmSection.astro`, `src/scripts/site.ts` |
| Tried and reverted | `content-visibility` on the footer. Off-screen contained content is not hit-testable, so Lighthouse/axe read the light footer links against the page background and the mobile Accessibility score fell to 96 on every page. Reverted; a `perf-qa` check now guards against re-adding it | `src/styles/sections.css` |
| CSS / fonts | Reviewed, left unchanged: one 11.3 KB (gzip) stylesheet; Fontsource WOFF2 with `font-display: swap`, latin subsets, two preloads (heading 600, body 400). Each weight downloads only where used. Critical-CSS inlining was not adopted: an 11 KB stylesheet is cheap, and inlining would forfeit the new year-long cache on every page view | — |
| Caching | `public/.htaccess`: `/_astro/` hashed assets 1 year `immutable` (enforced with `<If>`, which Apache applies after `<FilesMatch>`, so hashed fonts are not downgraded); images/video/PDF 7 days; favicons/manifest 1 day; HTML/XML/TXT `no-cache` (kept). Prompt 1's `public/_astro/.htaccess` is kept because `package-hosting.ps1` requires it | `public/.htaccess` |
| Compression | Brotli when the host has `mod_brotli`, gzip otherwise (tested both, plus identity); WebP/PNG/JPEG/MP4/PDF/WOFF2 are excluded from re-compression (the live host currently gzips WebP) | `public/.htaccess` |
| Accessibility | (1) Removed `aria-live="polite"` from the hero project cards: screen readers announced a new project every 7 s. (2) Added a pause/play button (WCAG 2.2.2), 44×44px, keyboard operable; a pause persists past hover/focus changes; hidden without JS and under reduced motion. (3) The Happy Clients swipe rail (PR #1) was not keyboard-scrollable (axe `scrollable-region-focusable`, serious); it is now a focusable, labelled region. (4) Homepage search selects had only a faint 14%-opacity focus ring; keyboard focus now gets the site's standard 2px bronze ring | `src/pages/index.astro`, `src/components/Icon.astro`, `src/scripts/site.ts`, `src/styles/sections.css`, `src/components/HappyClients.astro`, `src/styles/forms.css` |
| SEO regression from the merge | Two listings were both titled "2 BHK Apartment" (duplicate `<title>`, audit failure). Listing titles now include transaction and location, e.g. "2 BHK Apartment for Rent in Wakad". The visible H1 is unchanged | `src/pages/properties/[slug].astro` |
| Tooling | `scripts/perf-qa.mjs` / `npm run test:perf` (37 checks); `tests/responsive-images.test.mjs`; `site-qa.mjs` now forces style on reveal elements before finishing animations, because content-visibility otherwise left off-screen reveals mid-fade when axe sampled colours; `prepare-happy-clients.mjs` now reads the archived masters | `scripts/`, `tests/`, `package.json` |
| Docs | Search Console guide updated from 20 to 25 URLs (five rentals added, Day 3 batch); README performance conventions and QA commands; upload guide caching checks | `docs/GOOGLE-SEARCH-CONSOLE.md`, `README.md`, `docs/HOSTING-UPLOAD.md` |

Design, colours, typography, layout, breakpoints, animations and content are unchanged. The only visible addition is the small pause/play button at the end of the hero progress bars (screenshots compared before/after at 1440px and 375px).

## C. Performance results

**Method.** Lighthouse 13.6.0 via headless Chrome, default mobile (simulated slow 4G, 4× CPU) and desktop presets, against the production build served by a local `httpd:2.4` container with the real `.htaccess`. Server-level gzip was enabled in both runs, matching the live host, so Stage 2 gets no credit for compression the host already does. Only the HTTPS/canonical-host redirect was stripped, for local HTTP testing. "Before" = Prompt 1 + PR #1 (`dist-before`); "After" = this final build. Values are **medians of 3 runs** unless marked "1 run". Before figures come from an interleaved before/after session; after figures from a session on the final build immediately afterwards. A first baseline was discarded because a stray Lighthouse job overlapped it.

**Noise warning.** This Windows workstation's cold-start layout is noisy: TBT and Speed Index swing by ±150 ms and ±1.5 s between identical runs. Treat TBT/SI differences under those amounts as noise. Transfer sizes, CLS and the LCP element are deterministic.

### Homepage `/`

| Metric | Mobile before | Mobile after | Desktop before | Desktop after |
|---|---|---|---|---|
| Performance | 81 | 82 | 92 | 94 |
| Accessibility | 100 | 100 | 100 | 100 |
| Best Practices | 100 | 100 | 100 | 100 |
| SEO | 100 | 100 | 100 | 100 |
| FCP | 1.22 s | 1.41 s | 0.33 s | 0.32 s |
| LCP | 3.97 s | **3.42 s** | 1.76 s | 1.69 s |
| Speed Index | 2.99 s | 2.05 s | 0.75 s | 0.80 s |
| TBT | 275 ms | 344 ms (noise band) | 37 ms | 0 ms |
| CLS | 0 | 0 | 0 | 0 |
| Transferred | 512 KB | **439 KB** | 1,592 KB | **1,445 KB** |
| JavaScript | 5 KB | 5 KB | 5 KB | 5 KB |
| Images | 396 KB | **336 KB** | 1,476 KB | **1,342 KB** |
| Requests | 19 | 18 | 24 | 21 |

The hero LCP image is the first slide. Before, all four slides' images were requested at ~90 ms and competed with it; now only slide 1 loads before `load`. Lighthouse still counts the deferred slides because it waits for network idle, so the byte savings shown understate the early-load gain.

### Project page `/projects/canvas-d-tower/`

| Metric | Mobile before | Mobile after | Desktop before | Desktop after |
|---|---|---|---|---|
| Performance | 86 | 93 | 99 | 99 |
| Accessibility / BP / SEO | 100 / 100 / 100 | 100 / 100 / 100 | 100 / 100 / 100 | 100 / 100 / 100 |
| FCP | 1.46 s | 1.03 s | 0.32 s | 0.32 s |
| LCP | 2.70 s | 2.72 s | 0.96 s | 1.03 s |
| Speed Index | 4.38 s | 2.87 s | 0.73 s | 0.63 s |
| TBT | 330 ms | 171 ms | 44 ms | 0 ms |
| CLS | 0 | 0 | 0 | 0 |
| Transferred / JS / images | 543 / 5 / 419 KB | 544 / 5 / 420 KB | 787 / 5 / 663 KB | 788 / 5 / 664 KB |

Stage 2 barely touches this template (no slideshow, no content-visibility). Score differences are within run-to-run variance.

### Listings `/properties/`

| Metric | Mobile before | Mobile after | Desktop before | Desktop after |
|---|---|---|---|---|
| Performance | 77 | 81 | 98 | 98 |
| Accessibility / BP / SEO | 100 / 100 / 100 | 100 / 100 / 100 | 100 / 100 / 100 | 100 / 100 / 100 |
| FCP | 0.97 s | 1.39 s | 0.32 s | 0.31 s |
| LCP | 4.71 s | **3.74 s** | 1.03 s | 1.09 s |
| Speed Index | 2.79 s | 4.28 s (noise band) | 0.68 s | 0.70 s |
| TBT | 284 ms | 266 ms | 0 ms | 0 ms |
| CLS | 0.034 | **0** | 0 | 0 |
| Transferred | 850 KB | **689 KB** | 1,055 KB | 1,056 KB |
| Images | 753 KB | **591 KB** | 957 KB | 958 KB |

The banner (LCP) dropped from the 1600px/285 KB file to the 1200px/123 KB medium variant on a 412px DPR 1.75 phone.

### Single-run spot checks (1 run each)

| Page | Mobile before → after | Desktop before → after |
|---|---|---|
| `/contact/` | P 96 → 93, LCP 2.47 → 2.46 s, 214 → 214 KB, A11y 100 → 100 | P 100 → 100, LCP 0.77 → 0.70 s |
| `/properties/2-bhk-apartment-for-rent-life-republic/` | P 95 → 90, LCP 2.17 → 2.70 s, **257 → 336 KB** | P 100 → 100, LCP 0.81 → 0.57 s, 604 → 508 KB |

**Regression explained:** on the listing page the mobile photo grew by 79 KB because its `srcset` was previously wrong. The 640px file was labelled `768w`, so a phone needing ~660px was given an undersized image. It now receives the correctly sized 1200px medium file. This is a quality fix that costs bytes; desktop dropped 96 KB on the same page.

### Targets

- **CLS ≤ 0.1:** met on every page (0 everywhere after; `/properties/` mobile improved from 0.034).
- **LCP ≤ 2.5 s (lab, mobile):** met on Contact (2.46 s). **Not met** on the homepage (3.42 s), `/properties/` (3.74 s), the project page (2.72 s) and the listing page (2.70 s). The remaining delay is *element render delay*: 0.7–1.3 s of unthrottled main-thread layout before the hero paints (mostly first-paint layout of the ~13,000px homepage and font swap), which Lighthouse multiplies under 4× CPU simulation. Resource load time for the LCP image itself is only ~80–140 ms. Desktop LCP is 0.57–1.69 s on all pages.
- **Performance ≥ 90:** desktop 94–100 on all pages; mobile 90–93 on the project, Contact and listing pages; **81–82 on the homepage and `/properties/`**.
- **Accessibility, Best Practices, SEO ≥ 90:** 100 / 100 / 100 on every tested page and form factor.
- **INP ≤ 200 ms:** cannot be assessed; no field data (see Section I). TBT is a lab proxy, not INP.

Further mobile-LCP gains would need design trade-offs (removing the first-visit loader, simplifying the hero overlay/blur, or splitting the homepage). They are listed in Section H as client decisions rather than made unilaterally.

## D. Final quality assurance (local production build)

| Check | Result |
|---|---|
| Pages tested | 26 (all HTML documents) |
| Build | Pass: 26 pages, sitemap generated for 25 indexable pages |
| Type check (`astro check`) | 0 errors, 0 warnings, 0 hints |
| Lint | No lint configuration exists in the project; `astro check` is the diagnostics gate |
| Unit tests (`npm test`) | 14/14 pass (12 existing incl. PR #1 property tests + 2 new responsive-image tests) |
| SEO audit (`npm run audit`) | Pass: 26 pages, 25 indexable, 1,337 internal links/resources/fragments, 0 issues |
| Audit self-tests (`npm run test:audit`) | 6/6 pass |
| Responsive sweep (`site-qa.mjs`) | 130/130 cases (26 pages × 320/375/768/1024/1440): HTTP status, no horizontal overflow, one H1, unique titles, descriptions, no broken images, no uncaught errors |
| Axe WCAG 2.1 A/AA | 52 scans (26 pages × 1440/375px): **0 violations** after the fixes above (2 genuine issues fixed; 1 harness artifact corrected) |
| Interactions (`interaction-qa.mjs --production`) | 38/38 |
| Forms (`npm run test:forms`) | 109 checks, 12 desktop/mobile flows across 6 forms; zero real messages or calls |
| Stage 2 regression + keyboard (`perf-qa.mjs --headers`) | 40/40 (stable across repeated runs) |
| Apache/TLS container (`apache-stage1-qa.mjs`) | 239/239: 7 redirect combinations → single 301 to canonical; 4 missing/nested/removed/private paths → branded 404; 25 pages with security headers; 188 resources 200 with correct MIME types |
| Internal links | 41 unique internal hrefs, 0 broken; every fragment target exists |
| Missing images / console errors | 0 / 0 |
| Landscape | 12/12: 812×375, 667×375 and 1024×768 on home, contact, project and listings pages. No overflow, and the WhatsApp button or mobile quick-contact bar is visible and not off-screen |

Keyboard (manual-equivalent, scripted with real key presses): the first Tab reaches the visible skip link; skip moves focus into `main`; all 65 homepage focus stops show an indicator; Tab reaches the footer (no trap); Shift+Tab works; the film dialog opens with Enter, closes with Escape and returns focus; the project gallery opens with Enter, ArrowRight advances, Escape closes and returns focus. The mobile menu (Escape, focus in/out) is covered by `interaction-qa`. Reduced motion: the loader, reveals and hero animations are off, nothing auto-advances, and all content is visible.

## E. WhatsApp and phone verification

| Item | Result |
|---|---|
| Enquiry forms | 6 (Contact, Sell Property, Canvas – D Tower, Qrious, Echoes, Duet), all WhatsApp-only |
| WhatsApp links in built HTML | 160, all `https://wa.me/919354210824?text=…` (digits only, `encodeURIComponent`) |
| Phone links | 179, all `tel:+919354210824`, matching the displayed +91 9354210824 |
| Generated messages | Name, phone, enquiry/property type, project or seller details, message and canonical source URL; empty optional fields omitted (form suite) |
| Validation | Required fields, 10–15 digit phone, min/max lengths, consent, `aria-invalid`, field errors linked via `aria-describedby`, focus moves to the first invalid field, entered values kept, duplicate activation locked |
| Fallbacks | Direct WhatsApp link, copy message (with manual-select fallback), click-to-call; offline and blocked-popup messages; no "sent successfully" claim |
| Email delivery | None. No FormSubmit/SMTP/EmailJS/Nodemailer/Gmail API/Resend/PHP mail/endpoint code in `src`, `public`, `dist` or dependencies |
| Public email | armanhomess@gmail.com visible as plain text on every page (mobile menu, contact band, footer) and on the Contact and Privacy pages. It is unlinked per merged PR #2; the brief allows display-only |
| Not tested | Real WhatsApp delivery, native app handoff on physical phones and real calls: all mocked or inspected, as authorized |

## F. Final SEO verification

- **Indexable URLs: 25** (6 main, 5 services, 5 projects, 9 properties). **Noindex: 1** (`404.html`).
- Titles and descriptions unique on every page (audit). One H1 per page. Self-referencing HTTPS canonicals on indexable pages; none on the 404.
- `sitemap.xml`: well-formed XML, exactly the 25 canonical URLs, no 404/redirect/duplicate entries, no unreliable `lastmod`. `sitemap-index.xml` references it. `robots.txt`: `Allow: /`, sitemap index referenced, nothing blocked.
- JSON-LD: 26 `RealEstateAgent` + 26 `WebSite` (stable `@id`s) + 24 `BreadcrumbList`; all parse; no invented address, ratings or hours.
- Image SEO: meaningful alt on informative images, empty alt on decorative ones; descriptive lowercase filenames; every optimized URL resolves.
- Favicons: `favicon.ico` (valid ICO), 48/96/192/512 PNG, 180px Apple icon, SVG and manifest are present, correctly sized, linked from the homepage and served with correct MIME types; robots doesn't block them. Note: `favicon.svg` embeds a PNG rather than vector paths. It works, but is not resolution-independent. Google can take days to weeks to show a new favicon; requesting homepage indexing may help discovery but guarantees nothing.
- `docs/GOOGLE-SEARCH-CONSOLE.md`: present; now lists all 25 URLs with the correct sitemap path, active DNS nameservers, verification and sitemap steps, priorities, exclusions, four-week monitoring, Google Business Profile and Bing guidance.

## G. Deployment readiness

## **READY WITH WARNINGS**

Every required local and pre-deployment check passed on the final build. The production build, typecheck, unit tests, SEO audit and audit self-tests are clean. Across all 26 pages and 5 widths, axe WCAG 2.1 AA, interactions, forms and Stage 2 regression/keyboard checks pass, and the Apache/TLS redirect, 404 and header suite passes. No email delivery remains, WhatsApp and phone links are correct, and the public email is visible. Lighthouse Accessibility, Best Practices and SEO are 100 on every tested page.

Non-blocking warnings:
1. **Mobile lab LCP is above 2.5 s** on the homepage (3.42 s) and `/properties/` (3.74 s, down from 4.71 s), and just above it on the project and listing pages (2.70–2.72 s). The cause is first-paint main-thread work under simulated 4× CPU throttling, not image weight. Field data will decide whether this matters.
2. **Release line decision:** the deployable code is this worktree, not `codex/hosting-upload` (see the opening section).
3. **Content approval:** nine property records (illustrative photos; rentals missing size and tower) should be confirmed before promotion or manual indexing.
4. **Production-only checks are pending** until an authorized deployment (Section I).

## H. Client actions required

1. **Choose the release line.** Approve this combined worktree (Prompt 1 + PR #1 + Stage 2) as the release, rather than `codex/hosting-upload` alone, which would drop the Happy Clients section and five rentals.
2. **Confirm property content** before promoting or requesting indexing of the nine property pages: the four original listings are illustrative records with AI-generated photos, and the five Life Republic rentals have BHK and rent only (size and tower to be confirmed).
3. **Authorize commit/push and deployment** (manual ZIP upload via DirectAdmin). Deploy cleanly: remove the old `thank-you/` folder and old `_astro` bundles.
4. **After deployment:** add the Search Console DNS TXT record at the active DNS service (supercloudapps nameservers), submit `https://armanhomes.in/sitemap-index.xml`, and request indexing of priority pages.
5. Optional: approve one real WhatsApp handoff test and one call test on a phone.
6. Optional design decision: the approved first-visit loader covers the page for up to ~0.9 s on first load. It is kept as designed; removing or shortening it would improve perceived speed.

## I. Unverified or pending

- **Production checks pending deployment:** live HTTP 200/404 behaviour, HTTPS/www redirects (the host may add a hop before `.htaccess`), real cache/compression headers, live sitemap/robots/favicons, console errors on the live host.
- **Field Core Web Vitals / INP:** not available. The PageSpeed Insights API returned HTTP 429 (anonymous daily quota), and the optimized build is not live. Lab TBT is reported instead and is not INP.
- **Lighthouse environment:** local Apache container over HTTP/1.1, default Lighthouse throttling, on a Windows workstation whose cold-start layout timing is noisy (medians of 3 used). Real-network results will differ.
- Physical-device testing (iOS Safari, Android Chrome) and screen-reader testing (NVDA/VoiceOver) were not performed; automated axe and scripted keyboard checks do not prove full WCAG conformance.
- Brotli on the live host is unverified (depends on `mod_brotli`); gzip is confirmed live today.

## J. Completion summary

| Item | Count / status |
|---|---|
| Issues found | **20** |
| Resolved | **17**: PR #1 work missing from Prompt 1's tree; duplicate listing title; eager inactive hero slides; missing mid-size images; wrong `srcset` widths; gallery swap bug; dead parallax code; eager film poster; no long-lived caching; re-gzipping of compressed media; hero `aria-live` every 7 s; no slideshow pause control; non-focusable swipe rail; faint search focus ring; outdated Search Console URL count (20 → 25); broken Happy Clients generator path; QA harness misreading reveals under content-visibility. A self-introduced footer-containment regression was also caught and reverted |
| Unresolved | **3**: mobile lab LCP > 2.5 s on four pages (design trade-offs needed); `favicon.svg` embeds a PNG (cosmetic); no field data for INP/CWV (external) |
| Measured improvements | Homepage mobile LCP 3.97 → 3.42 s, transfer 512 → 439 KB; `/properties/` mobile LCP 4.71 → 3.74 s, transfer 850 → 689 KB, CLS 0.034 → 0; homepage desktop 1,592 → 1,445 KB; hashed assets now cached for a year (headers verified locally) |
| Functional verification | Passed locally (WhatsApp 160 links / 6 forms / 109 form checks; phone 179 links; 38/38 interactions) |
| SEO verification | Passed locally (25 indexable, sitemap/robots/canonicals/JSON-LD/favicons valid; audit 0 issues) |
| Accessibility verification | Automated pass (axe 0 violations in 52 scans; Lighthouse 100; scripted keyboard checks pass). Manual screen-reader and device tests not performed |
| Deployment readiness | **READY WITH WARNINGS**: not deployed, not committed, awaiting authorization |
