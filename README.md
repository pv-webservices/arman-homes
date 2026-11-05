# Arman Homes

A static Astro business website built around the supplied navy-and-gold homepage reference and original logo. No authentication, dashboard, database or application backend.

## Run

Requires Node.js 22.12+ (built here with Node 24).

```sh
npm install
npm run dev
npm run check
npm test
npm run build
npm run preview
```

`dist/` is the static upload directory. Configure your host to serve `404.html` with HTTP status 404 for missing paths, and resolve directory routes to their `index.html`. Do not rewrite every path to the homepage.

## Routes

- `/` — homepage: project slideshow hero, search, projects, Canvas spotlight, film, township, listings
- `/projects/` and `/projects/[slug]/` — Life Republic projects (see below)
- `/properties/` — GET search, filters, result count and availability state
- `/buy-property/`
- `/sell-property/` — seller enquiry
- `/rent-property/`
- `/residential-properties/`
- `/commercial-properties/`
- `/about-us/`
- `/services/`
- `/contact/` — contact enquiry, phone/email/WhatsApp and a general area map link
- `/privacy-policy/`
- `/404.html` — branded error document
- `/properties/[slug]/` — listing detail pages generated from `src/data/properties.mjs`

## Life Republic projects

Project content lives in `src/data/projects.ts` (Canvas – D Tower, Qrious, Echoes, Duet) plus township facts. Sources: the project write-ups supplied by Arman Homes and the developer brochures. Prices are the starting or tentative figures supplied. RERA numbers are shown only where supplied: Echoes PM1261012502409 and Canvas – D Tower PM1260002501184. Edit that file to change prices, configurations or offers, then rebuild.

Routes: `/projects/` (comparison, film, township) and `/projects/[slug]/`. Each project page has a hero, stats, overview, configuration cards with WhatsApp price-sheet links, a gallery with lightbox, amenities, township, a site-visit enquiry (the project name is added to the WhatsApp draft) and a brochure download.

### Source material and derived assets

Raw client files are kept in `source-assets/` (git-ignored, **not** published): 12 brochure PDFs and the 6.8-minute master video. Derived web assets:

| Step | Command | Output |
| --- | --- | --- |
| Extract text, page previews, embedded renders | `py -3 scripts/extract-pdfs.py` (needs `pip install pymupdf`) | `output/pdf-extract/` (working files) |
| Brochure downloads + location map render | `py -3 scripts/prepare-brochures.py` | `public/brochures/*.pdf`, `output/location-map.png` |
| Web images from renders (WebP, full + small, crops for flattened pages) | `node scripts/prepare-project-assets.mjs` | `public/images/projects/`, `src/data/project-images.json` |
| Video | ffmpeg (commands below) | `public/video/` |

Video: the letterbox is cropped (848×364). `life-republic-loop.mp4` (24 s, silent, 3.2 MB) plays only while the film section is on screen and never under reduced motion. `life-republic-film.mp4` (full film, 30 MB) loads only when a visitor presses play.

```sh
ffmpeg -i "source-assets/video/Life Republic Video.mp4" -vf "crop=848:364:0:58,fps=25" -c:v libx264 -preset slower -crf 31 -pix_fmt yuv420p -c:a aac -b:a 80k -movflags +faststart public/video/life-republic-film.mp4
```

The Canvas (25 MB) and Echoes (15 MB) brochures are mostly vector floor plans and cannot shrink further without losing legibility. Their download buttons show the file size.

## Confirmed business information

Edit `src/data/site.ts` for shared contact details and service descriptions. Business name: Arman Homes; phone +91 9354210824; email armanhomess@gmail.com; location Hinjewadi Marunji, Pune. No street address, testimonials, business metrics, RERA number or social accounts were supplied. None were invented or taken from secondary reference artwork.

## Property records

`src/data/properties.mjs` intentionally contains an empty array. The screenshots' sample properties are illustrative. Add only approved real records. A record has these fields:

```ts
type Property = {
  id: string;
  slug: string; // unique lowercase URL slug
  title: string;
  location: string; // use matching filter values, e.g. Hinjewadi or Marunji
  transaction: 'sale' | 'rent';
  category: 'residential' | 'commercial';
  type: 'apartment' | 'villa' | 'house' | 'office' | 'shop' | 'plot';
  price: number; // INR total sale price or monthly rent, never a formatted string
  bedrooms?: number;
  bathrooms?: number;
  area?: number; // square feet
  images: { src: string; alt: string }[]; // minimum one approved property image
  description: string;
  amenities?: string[];
};
```

Rebuild after adding records; static detail routes are generated automatically. Adjust location/type search options for new inventory. Test fixtures live only in the test suite and are never published. Update the empty-inventory assertion when approved records are added. Pagination can be introduced when the actual inventory requires it.

Search URL parameters: `location`, `type`, `budget`, `transaction`, `category`, `bedrooms`. `bedrooms` is a minimum; `budget` is an inclusive maximum. The homepage starts with sale; the listing page supports sale and rent. All records are generated as HTML for crawlable links; URL filtering is applied by lightweight browser JavaScript. Empty inventory gives the same honest availability message with or without JavaScript.

## Enquiries

Enquiries are **WhatsApp-only**. No enquiry is ever sent to email or to any other service by this site. When a visitor presses **Send on WhatsApp**, the form is validated, a message is built from the field labels and values (`src/scripts/whatsapp.mjs`, tested in `tests/whatsapp.test.mjs`) and WhatsApp opens in a new tab with it prefilled for `business.whatsapp` in `src/data/site.ts`. Nothing reaches Arman Homes until the visitor presses send in WhatsApp. If the browser blocks the new tab, an "Open WhatsApp to Send" link is shown instead. The link is hidden again as soon as a field changes.

The contact, seller and project forms all work this way. Project forms open with "I would like to enquire about <project>" and include the project name. Validation (required fields, phone, email format), accessible feedback and a honeypot are included. Buttons stay disabled without JavaScript, and phone and WhatsApp links remain available.

The business email (`business.email`) is shown as plain text in the contact page, footer, contact banner and mobile menu. It is deliberately not a `mailto:` link and not an enquiry channel.

## Domain and indexing

No approved domain was supplied. The default build has `noindex,nofollow`, `robots.txt` disallowing crawling, and an empty sitemap. Set an approved origin and explicitly enable indexing for a launch build:

```dotenv
PUBLIC_SITE_URL=https://your-approved-domain.example
PUBLIC_INDEXABLE=true
```

The build then emits canonical URLs, absolute Open Graph image URLs, a populated sitemap and indexable robots directives. No search-engine indexing is guaranteed. Verify the deployed host's redirects, HTTPS, origin, HTTP 404 behavior, sitemap, social previews and enquiry delivery independently.

## Design, assets and motion

Design system, motion and content rules: `DESIGN.md`. Styles are split into `src/styles/base.css` (tokens, type, buttons, motion), `chrome.css` (header, menu, page hero, footer), `sections.css` and `forms.css`.

Images live in `public/images/` as WebP with a full and `-small` derivative. `src/components/Picture.astro` emits `srcset`/`sizes`, intrinsic dimensions and lazy loading (hero images load eagerly with high priority). Alt text comes from `src/data/images.ts`. Sources and licences: `ASSET-SOURCES.json`. No image is presented as a particular Pune property or office.

## AI image generation (build-time, server-side)

Nine purposeful images (hero, five service visuals, consultation, Pune horizon band, process flat-lay) were generated with the OpenAI Image API. Generation runs only in Node; the browser never sees the key or calls OpenAI.

- Key: `OPENAI_API_KEY` in `.env` (git-ignored). Never put it in a `PUBLIC_` variable.
- Central config: `image-generation.config.mjs` — Flare/Sunburst model names, default/premium quality, sizes (1024², 1536×1024, 1024×1536), output widths and WebP quality. Override with `IMAGE_MODEL_FLARE`, `IMAGE_MODEL_SUNBURST`, `IMAGE_QUALITY_DEFAULT`, `IMAGE_QUALITY_PREMIUM`.
- Assets: `scripts/images/manifest.mjs` — one entry per image with placement, orientation, priority, traits, alt text and prompt.
- Routing: `scripts/images/router.mjs` — Flare by default; Sunburst for the hero, photoreal architecture/interiors, people or multi-subject scenes, or when a Flare result was rejected (`--premium=name`). High quality for hero/key assets, medium otherwise. Covered by `tests/image-router.test.mjs`.
- Actual routing used per asset is recorded in `src/data/generated-images.json` (`intent-sell` was regenerated with Sunburst).

```sh
npm run images:plan                                        # model/quality/size per asset, no API calls
npm run images                                             # generate missing originals, write WebP derivatives
npm run images -- --only=hero --force                      # regenerate one asset (paid API call)
npm run images -- --only=floorplan --premium=floorplan --force   # escalate one asset to Sunburst
```

Originals are kept in `output/imagegen/` (git-ignored); derivatives and `src/data/generated-images.json` are committed. No videos exist in the project and none are generated.

## QA

`QA.md` records the latest results. Build, start the preview, then run the scripts from PowerShell (Git Bash rewrites `/` arguments):

```sh
npm run build
npm run preview -- --port 4330
node scripts/site-qa.mjs http://127.0.0.1:4330
node scripts/interaction-qa.mjs http://127.0.0.1:4330
node scripts/shots.mjs http://127.0.0.1:4330 1440 /,/contact/
```

`site-qa.mjs` sweeps all 12 pages at 1440/1024/768/390/320px (status, overflow, one H1, unique titles, descriptions, broken images, uncaught errors), runs Axe WCAG 2.1 AA at 1440 and 390px after animations settle, checks every internal link and fragment, and writes `output/qa/site-qa.json` plus screenshots. `interaction-qa.mjs` checks the mobile menu (including keyboard focus), homepage and expanded search, header states, both enquiry forms and WhatsApp drafts, reduced motion, 404 status and robots. `interaction-qa.mjs` stubs `window.open`, so QA never contacts WhatsApp.

No deployment or enquiry transmission was performed by QA.
