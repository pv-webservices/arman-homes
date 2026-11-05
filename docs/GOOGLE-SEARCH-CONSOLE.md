# Google Search Console — Arman Homes

Production origin: **https://armanhomes.in/**. Submit **https://armanhomes.in/sitemap-index.xml** after the new ZIP is deployed. It references `sitemap.xml`, which contains every indexable page in this build.

## 1. Before submitting

- Deploy the latest prepared ZIP, including hidden `.htaccess` files. Keep the `public_html` directory in place.
- Confirm HTTPS works and HTTP/www/index.html addresses redirect to the corresponding canonical URL. Refresh an inner page directly.
- Confirm `robots.txt` allows crawling and references `/sitemap-index.xml`.
- Confirm both sitemap XML files return HTTP 200. A missing page must return the branded page with HTTP 404.
- Confirm all favicon URLs return 200. Confirm the homepage has the expected icon links.
- Verify all six WhatsApp enquiry forms using mocked handoffs and check every phone link. A click-to-chat handoff does not prove delivery; real sends/calls require separate approval.
- Confirm the nine property records (four original listings and five Life Republic rentals), photos/prices, project offers and privacy wording with the client before requesting indexing. Do not submit unapproved property content merely to reach an indexing target.

## 2. Verify a Domain property using the active DNS service

The DNS check on 5 November 2026 returned **ns1.supercloudapps.com** and **ns2.supercloudapps.com**. GoDaddy is the supplied registrar, but these are the authoritative nameservers. Editing an inactive GoDaddy DNS zone will not verify the live domain.

1. Open [Google Search Console](https://search.google.com/search-console/) using the intended owner Google account. Add a **Domain** property for `armanhomes.in` (no `https://` or path).
2. Copy the exact TXT value beginning `google-site-verification=`. This value must come from Search Console; this project does not invent one.
3. In the hosting account that manages the `supercloudapps.com` nameservers, open the domain's **DNS Management**. In this DirectAdmin setup that is normally the domain's DNS Management screen. If DNS edits are unavailable there, ask the hosting provider managing these nameservers to add the TXT record.
4. Add a **TXT** record at the domain root. Depending on the editor, the root name is `@`, blank, or `armanhomes.in.`; use the form required by that DNS screen. Paste the verification value exactly and retain the normal/default TTL. Do not replace existing mail, SPF or other TXT records.
5. Wait for publication, then click **Verify** in Search Console. Propagation can take time; retain the TXT record after success. Do not change nameservers to make this task work.

For a URL-prefix property instead, use `https://armanhomes.in/` and one of Google's supported verification methods. A Domain property covers HTTP, HTTPS and subdomains together.

## 3. Submit the sitemap index

In the verified property, open **Sitemaps**, enter `https://armanhomes.in/sitemap-index.xml`, and submit it. The child sitemap includes **25 indexable URLs**. The build generates the list from the actual indexable HTML pages, without last-modified timestamps: reliable per-page publication dates are not available.

XML displayed in a browser may say that it has no style information. That is normal: a sitemap is machine-readable XML, not a styled webpage. A newly submitted sitemap can remain pending while Google processes it. **“Couldn't fetch” is a fetch problem to investigate**, not proof that everything is fine for 24 hours: first check its exact HTTPS URL, status, robots rules, certificate and hosting availability, then retry. Processing and indexing have no fixed 24-hour guarantee.

### All 25 indexable URLs, grouped

Main pages (6):

- https://armanhomes.in/
- https://armanhomes.in/about-us/
- https://armanhomes.in/contact/
- https://armanhomes.in/services/
- https://armanhomes.in/properties/
- https://armanhomes.in/privacy-policy/

Services (5):

- https://armanhomes.in/buy-property/
- https://armanhomes.in/sell-property/
- https://armanhomes.in/rent-property/
- https://armanhomes.in/residential-properties/
- https://armanhomes.in/commercial-properties/

Projects (5):

- https://armanhomes.in/projects/
- https://armanhomes.in/projects/canvas-d-tower/
- https://armanhomes.in/projects/qrious/
- https://armanhomes.in/projects/echoes/
- https://armanhomes.in/projects/duet/

Property details (9; confirm these records before submission):

- https://armanhomes.in/properties/3-bhk-premium-apartment-hinjewadi/
- https://armanhomes.in/properties/2-bhk-apartment-wakad/
- https://armanhomes.in/properties/4-bhk-luxury-villa-baner/
- https://armanhomes.in/properties/office-space-hinjewadi/
- https://armanhomes.in/properties/1-bhk-apartment-for-rent-life-republic/
- https://armanhomes.in/properties/2-bhk-apartment-for-rent-life-republic/
- https://armanhomes.in/properties/3-bhk-apartment-for-rent-life-republic/
- https://armanhomes.in/properties/3-bhk-villa-for-rent-life-republic/
- https://armanhomes.in/properties/4-bhk-villa-for-rent-life-republic/

The five Life Republic rentals come from the merged homepage update (GitHub PR #1). The client supplied BHK and monthly rent only; size and tower are still to be confirmed.

### Optional manual indexing requests

Use URL Inspection → **Test live URL** → **Request indexing** for priority pages after content approval. Sitemap submission is normally sufficient. These batches are an organizational suggestion, not a Google quota or a promise of indexing:

- Day 1 (10): homepage, Projects overview, the four project details, Contact, About Us, Services and Properties overview.
- Day 2 (10): the five service pages, up to four approved property details and Privacy Policy.
- Day 3 (up to 5): the remaining approved property details.

Privacy Policy is intentionally indexable for transparency; manual indexing it is low priority.

Do not submit `/thank-you/`, `/404.html`, nonexistent URLs, search-query variants, `/index.html`, HTTP or www duplicates. The obsolete thank-you route has been removed and must return 404 after a clean upload. The error document has `noindex, follow` and no canonical; duplicate variants redirect to the canonical URL. Keep noindex pages crawlable so Google can see their directive.

## 4. Weeks 1–4

- **Week 1:** verify the Domain property, submit the sitemap, inspect the homepage, then check sitemap processing and the Pages report. Inspect the homepage and priority pages; investigate server errors, redirect loops, unexpected noindex or wrong canonicals. “Discovered” or “Crawled — currently not indexed” does not justify repeated daily requests.
- **Week 2:** review valid breadcrumb structured data and any reported parsing issues. Organization/RealEstateAgent data can help describe the business but does not guarantee an Enhancements report or rich result. No founder Person, Article or FAQ schema is emitted because no verified founder, posts or FAQ content exists.
- **Week 3:** review internal links and the confirmed Google Business Profile if applicable, then run [PageSpeed Insights](https://pagespeed.web.dev/) on the homepage and a project/contact page. Local Lighthouse TBT is a lab measurement; INP requires field interaction data and may be unavailable on a new site.
- **Week 4:** review unresolved indexing exclusions and sitemap health, search queries and indexed pages, update only verified content, and confirm the owner's [Google Business Profile](https://www.google.com/business/) details. Add the domain to [Bing Webmaster Tools](https://www.bing.com/webmasters/) and submit the same sitemap index when authorized.

## 5. Google search favicon

This build supplies a logo-based SVG, 48px ICO, 48/96/192/512px PNGs and a 180px Apple touch icon, all on a solid navy background. The homepage links the icons and manifest. Keep these URLs public and crawlable. Google can take days to weeks to recrawl and update the search icon. Requesting a homepage recrawl may help discovery; timing and display are not guaranteed.

Sources: [Google DNS ownership verification](https://support.google.com/webmasters/answer/9008080), [Google sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [sitemap report troubleshooting](https://support.google.com/webmasters/answer/7451001), [Google favicon requirements](https://developers.google.com/search/docs/appearance/favicon-in-search).

## Actions still for the owner

Stage 1 creates code and this guide only. DNS TXT verification, Search Console ownership verification, sitemap submission, manual URL indexing requests, and Bing submission have not been performed. Deploy only after authorization and Prompt 2. Recheck the public site after deployment; the current live site still has the previous email forms. Keep the nine property records out of manual indexing batches until their details and photographs are approved.
