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
npm run audit
npm run test:audit
npm run preview
# With preview running at 4330:
npm run test:forms
node scripts/interaction-qa.mjs http://127.0.0.1:4330 --production
node scripts/site-qa.mjs http://127.0.0.1:4330 --stage1
```

`dist/` is the static upload directory. For the approved DirectAdmin hosting at armanhomes.in, run `npm run package:hosting` on Windows to build and create `output/hosting/arman-homes-public-html.zip`. Follow [HOSTING-UPLOAD.md](docs/HOSTING-UPLOAD.md) for the exact upload layout, replacement steps, verification and rollback. The included `.htaccess` serves directory `index.html` files, redirects to the HTTPS domain, and serves `404.html` for missing paths.

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

Raw client files are kept in `source-files/client/` (git-ignored, **not** published): 12 brochure PDFs and the 6.8-minute master video. Derived web assets:

| Step | Command | Output |
| --- | --- | --- |
| Extract text, page previews, embedded renders | `py -3 scripts/extract-pdfs.py` (needs `pip install pymupdf`) | `output/pdf-extract/` (working files) |
| Brochure downloads + location map render | `py -3 scripts/prepare-brochures.py` | `public/brochures/*.pdf`, `output/location-map.png` |
| Web images from renders (WebP, full + small, crops for flattened pages) | `node scripts/prepare-project-assets.mjs` | `public/images/projects/`, `src/data/project-images.json` |
| Video | ffmpeg (commands below) | `public/video/` |

Video: the letterbox is cropped (848×364). `life-republic-loop.mp4` (24 s, silent, 3.2 MB) plays only while the film section is on screen and never under reduced motion. `life-republic-film.mp4` (full film, 30 MB) loads only when a visitor presses play.

```sh
ffmpeg -i "source-files/client/video/Life Republic Video.mp4" -vf "crop=848:364:0:58,fps=25" -c:v libx264 -preset slower -crf 31 -pix_fmt yuv420p -c:a aac -b:a 80k -movflags +faststart public/video/life-republic-film.mp4
```

The Canvas (25 MB) and Echoes (15 MB) brochures are mostly vector floor plans and cannot shrink further without losing legibility. Their download buttons show the file size.

## Confirmed business information

Edit `src/data/site.ts` for shared contact details and service descriptions. Business name: Arman Homes; phone +91 9354210824; email armanhomess@gmail.com; location Hinjewadi Marunji, Pune. No street address, testimonials, business metrics, RERA number or social accounts were supplied. None were invented or taken from secondary reference artwork.

## Property records

`src/data/properties.mjs` currently contains four design-supplied records with illustrative photography. Their prices, availability and real photos require owner confirmation before promotion/indexing. The audit preserves those visible records as requested. Add only approved real records. A record has these fields:

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

Rebuild after adding records; static detail routes are generated automatically. Adjust location/type search options for new inventory. Test fixtures live only in the test suite and are never published. The tests check listing completeness and unique slugs. Pagination can be introduced when the actual inventory requires it.

Search URL parameters: `location`, `type`, `budget`, `transaction`, `category`, `bedrooms`. `bedrooms` is a minimum; `budget` is an inclusive maximum. The homepage starts with sale; the listing page supports sale and rent. All records are generated as HTML for crawlable links; URL filtering is applied by lightweight browser JavaScript. Empty inventory gives the same honest availability message with or without JavaScript.

## Enquiries

All six enquiry forms prepare WhatsApp messages for **+91 9354210824**. There is no email form endpoint, delivery service or server backend. The public email **armanhomess@gmail.com** remains in the footer, contact page and privacy policy for direct contact only. No visitor email is collected.

Name, international phone (10–15 digits), enquiry/property type, message and privacy acknowledgement are validated. Seller forms also require property location and details. Project forms include the current project. A valid submit opens WhatsApp synchronously; the visitor reviews and sends manually. Opening WhatsApp never proves delivery. Popup/offline/clipboard restrictions retain the inputs and offer a direct draft link, copyable text and phone call link. Without JavaScript the submit stays disabled and direct WhatsApp/phone links remain usable; Enter cannot transmit the form.

`npm run test:forms` mocks every external handoff. It sends no messages or calls. A real WhatsApp send or phone call requires separate authorization.

## Domain and indexing

The approved production domain is `https://armanhomes.in`. The tracked `.env.production` contains public build settings only and enables indexing for `npm run build` and `npm run package:hosting`:

```dotenv
PUBLIC_SITE_URL=https://armanhomes.in
PUBLIC_INDEXABLE=true
```

The production build emits canonical URLs, absolute Open Graph image URLs, a populated sitemap and indexable robots directives. Development remains non-indexable by default. Shell environment variables take precedence over the file, so the packaging command checks the actual built domain and indexing settings before creating the ZIP. No search-engine indexing is guaranteed. Verify redirects, HTTPS, HTTP 404 behavior, sitemap, social previews and enquiry handoff after upload. Do not add secrets to `.env.production`.

## Design, assets and motion

Design system, motion and content rules: `docs/DESIGN.md`. Styles are split into `src/styles/base.css` (tokens, type, buttons, motion), `chrome.css` (header, menu, page hero, footer), `sections.css` and `forms.css`.

Images live in `public/images/` as WebP with a full and `-small` derivative. `src/components/Picture.astro` emits `srcset`/`sizes`, intrinsic dimensions and lazy loading (hero images load eagerly with high priority). Alt text comes from `src/data/images.ts`. Sources and licences: `docs/ASSET-SOURCES.json`. No image is presented as a particular Pune property or office.

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

Originals are kept in `source-files/illustrations/` (git-ignored); derivatives and `src/data/generated-images.json` are committed. The supplied Life Republic film and short loop are optimized into public/video; no video generation runs during the build.

## QA

`docs/QA.md` records the latest results. Build, start the preview, then run the scripts from PowerShell (Git Bash rewrites `/` arguments):

```sh
npm run build
npm run preview -- --port 4330
node scripts/site-qa.mjs http://127.0.0.1:4330
node scripts/interaction-qa.mjs http://127.0.0.1:4330 --production
node scripts/shots.mjs http://127.0.0.1:4330 1440 /,/contact/
```

`site-qa.mjs` sweeps the main, project and property pages at 1440/1024/768/375/320px (status, overflow, one H1, unique titles, descriptions, broken images, uncaught errors), runs Axe WCAG 2.1 AA at 1440 and 375px after animations settle, checks every internal link and fragment, and writes `output/qa/site-qa.json` plus screenshots. `interaction-qa.mjs` checks the mobile menu (including keyboard focus), homepage and expanded search, header states, both enquiry forms and WhatsApp drafts, reduced motion, 404 status and robots. Use `--production` against the production build to verify the approved canonical, indexable robots and noindex 404; omit it for a non-indexable development build. `npm run test:forms` exercises all enquiry forms and error/fallback paths with mocked WhatsApp handoffs and no external delivery.

The earlier website version was manually uploaded through DirectAdmin on 29 October 2026. There is a Git remote but no verified Git-to-host deployment pipeline. This audit does not commit, push, deploy or send real enquiries.


## Stage 1 and deployment status — 5 November 2026

Framework installed: Astro 7.4.0; npm with package-lock.json. Static routes: 20 content pages and the branded 404 document. No blog, founder profile, service API or application backend is present. See [AUDIT-REPORT.md](docs/AUDIT-REPORT.md) for verified results and remaining release constraints.

The verified public server is Apache at 184.164.144.133 with DirectAdmin upload history. Authoritative DNS is ns1.supercloudapps.com / ns2.supercloudapps.com; GoDaddy is the supplied registrar. Git remote is https://github.com/pv-webservices/arman-homes.git, branch codex/hosting-upload. No Git-based deployment workflow was found. Publishing is a separate authorized action; no commit, push or deployment occurs in Stage 1.

## Folder structure and asset conventions

- `src/pages/`: file routes; project/property details come from their data files.
- `src/components/`, `src/scripts/`, `src/styles/`, `src/data/`: existing presentation, interactions and approved business content.
- `public/images/brand/`, `editorial/`, `illustrations/`, `projects/`: logo, licensed editorial imagery, illustrative imagery and brochure derivatives.
- `public/brochures/`, `public/video/`, `public/_astro/`: downloadable derivatives, video and Apache cache rules. Self-hosted fonts are compiled from Fontsource into `dist/_astro/`.
- `public/favicon*`, `apple-touch-icon.png`, `site.webmanifest`: logo-derived icon set. Run `npm run icons` only when approved brand assets change.
- `source-files/brand/`, `client/`, `illustrations/`, `original-images/`: original source assets and archived unused photos; never deployed.
- `docs/`: release, audit, design and Search Console documentation.
- `scripts/`, `tests/`: asset preparation and verification. `output/` is ignored local evidence; `dist/` is generated deployment output.

Use descriptive lowercase hyphenated names. Update data registries, Astro/CSS references and generator scripts together for asset moves. Keep original masters for Prompt 2. The existing postbuild pruner excludes unused image derivatives from `dist/` while retaining the source files. Hash inventory: `output/stage1/assets.json`. Do not rerun image generators or compress imagery as part of Stage 1.

The source has no standalone lint command; `npm run check` supplies Astro/TypeScript diagnostics. Comprehensive performance, accessibility and final pre-deployment QA belong to Prompt 2.
