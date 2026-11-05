# Arman Homes — local verification

Verified on 17 October 2026 against the redesigned build (navy/champagne brand, transparent-to-solid header, full-screen mobile menu, bento service cards, sticky benefits, process, location band, light contact CTA, mobile quick-contact bar). This is local static-build QA, not production validation or accessibility certification.

All checks below pass. No open accessibility, overflow or link issues remain.

## Build and checks

- `npm run check`: 0 errors, 0 warnings, 0 hints.
- `npm run build`: 12 HTML pages plus robots and sitemap endpoints. No property-detail URLs are generated because the property dataset is empty.
- `npm test`: 8/8 tests pass.
- No lint configuration exists. The Astro/TypeScript diagnostics were run instead.

## How it was run

`npm run build`, then `npm run preview -- --port 4330`, then from PowerShell (Git Bash rewrites `/` arguments):

```sh
node scripts/site-qa.mjs http://127.0.0.1:4330
node scripts/interaction-qa.mjs http://127.0.0.1:4330
```

Both scripts use Playwright with installed Chrome (`channel: 'chrome'`). The old `browser-qa.js` and `finish-qa.js` targeted pre-redesign markup. They were replaced by `site-qa.mjs`, and their interaction checks were moved into `interaction-qa.mjs`.

## Route sweep and Axe (`scripts/site-qa.mjs`)

Pages: `/`, `/properties/`, `/buy-property/`, `/sell-property/`, `/rent-property/`, `/residential-properties/`, `/commercial-properties/`, `/about-us/`, `/services/`, `/contact/`, `/privacy-policy/`, `/404/`.

- 12 pages × 5 widths (1440, 1024, 768, 390, 320px): **60/60 cases pass**. The script checked for horizontal overflow, exactly one H1, nonempty meta descriptions, unique titles, broken images, uncaught JavaScript errors and HTTP 200 (except `/404/`).
- **24 Axe scans** at 1440 and 390px using the `wcag2a`, `wcag2aa`, `wcag21a` and `wcag21aa` tags: **0 violations**, with contrast checking on. Before each scan, the script loads fonts, scrolls the page so every `[data-reveal]` section fires, and waits for every finite animation (loader, hero rise/zoom, reveals) to finish. The infinite marquee is excluded from that wait. Scans therefore measure final colours, not mid-fade opacity.
- Internal links: all **21 unique internal hrefs** return 200, and every `#fragment` target exists in the page.
- Screenshots: `output/qa/` (home 1440/768/390, contact 390, sell 390, about 1440, services 768, properties 320).
- Full results: `output/qa/site-qa.json` and `site-qa.log`.

## Interactions (`scripts/interaction-qa.mjs`): 29/29 pass

- Mobile menu: opens and closes, Escape closes it, focus moves to the first link on open and returns to the toggle on Escape, the toggle label switches between "Open menu" and "Close menu", and menu links navigate and close the menu.
- Header: transparent at the top of the homepage and solid after scrolling.
- Homepage search: the Buy/Rent tab, location, type and budget reach `/properties/` as GET parameters. The expanded search restores them. An honest empty-inventory state and a filter summary show. Category and bedroom filters persist, and "Clear all filters" resets the URL.
- Contact and seller forms: empty submit is blocked, invalid phone numbers are rejected with a message, the WhatsApp draft link (`wa.me/919354210824`) encodes the form values, the status message says nothing has been sent, and editing a field hides the stale draft.
- Reduced motion: hero text, reveal sections and the loader all show final state immediately.
- `/missing-property/` returns HTTP 404. The preview `robots.txt` contains `Disallow: /`.
- All internal links from the main pages resolve, and the services anchor targets exist.

## Fixes made in this pass

1. **Services index numerals failed contrast.** The decorative "01–06" numerals on `/services/` were `#e7e0d2` on ivory/sand, 1.14–1.24:1. They are now champagne-bronze `#a87c32`: 3.27:1 on sand and 3.57:1 on paper, which passes the 3:1 large-text threshold (`src/styles/sections.css`, `.service-index`).
2. **Mobile menu did not take keyboard focus.** `setMenu()` focused the first link while the menu was still `visibility: hidden` at the start of its fade, so focus stayed on the toggle. Visibility now switches on instantly when the menu opens and still fades out on close (`src/styles/chrome.css`, `.menu-open .mobile-menu`).

## Lighthouse (mobile, `/`)

Lighthouse 13.5.0, default mobile emulation, headless Chrome, local preview. The reports are `output/qa/lighthouse-mobile.report.html` and `.json`, with no runtime error and no run warnings.

| Category or metric | Result |
| --- | --- |
| Performance | 95 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 66 |
| FCP | 1.7 s |
| LCP | 2.7 s |
| Speed Index | 3.2 s |
| Total blocking time | 10 ms |
| Cumulative layout shift | 0 |

SEO is 66 only because of `is-crawlable`: the preview build is deliberately `noindex`, with `Disallow: /`. LCP (2.7 s, audit score 0.86) is the only performance audit below 0.9. This is a single local lab run, not field Core Web Vitals. Desktop Lighthouse was not run.

## Not re-run in this pass

- The `/properties/[slug]/` template, property cards and gallery lightbox are still unpublished and untested with real records. No fictional listings are exposed.

## Enquiry delivery

Enquiries are WhatsApp-only; the email/endpoint delivery path was removed on 5 November 2026. The form opens WhatsApp with the message prefilled and the visitor sends it. No WhatsApp message was sent during QA.

## Origin and indexing

The default build is `noindex`, with `Disallow: /`, no canonical domain and an empty sitemap. Setting `PUBLIC_SITE_URL` and `PUBLIC_INDEXABLE=true` enables canonical URLs, indexing and sitemap entries. No real production domain has been approved.

## Missing client information and launch work

1. Verified property records, real listing photos, prices, locations, dimensions, availability and amenities.
2. An approved domain and hosting, and permission to deploy. Redirects, HTTPS and 404 behaviour need live checks after deployment.
3. An approved enquiry delivery provider, plus a live receipt test, if direct submissions are wanted.
4. Real social profile URLs. None have been made up.
5. Optional: agency story, team details, directions and business registration details.

No deployment, commit, push, provider activation, enquiry transmission or image-API call was performed during this QA pass.
