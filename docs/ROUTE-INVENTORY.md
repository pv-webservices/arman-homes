# Stage 1 route and interaction inventory

Checked 5 November 2026. Initial tree: 22 HTML pages including the obsolete thank-you route. Final tree: **21 HTML pages**, consisting of **20 canonical indexable pages** and one branded 404 document. Three machine endpoints: `/robots.txt`, `/sitemap.xml`, `/sitemap-index.xml`. No blog/article routes, separate terms page or verified founder profile exists.

## Content routes

| Route | Page type | Built title | WhatsApp forms |
|---|---|---|---:|
| `/` | Main / informational | Premium Homes at Life Republic, Pune · Arman Homes | 0 |
| `/about-us/` | Main / informational | About Us · Arman Homes | 0 |
| `/buy-property/` | Service | Buy Property in Pune · Arman Homes | 0 |
| `/commercial-properties/` | Service | Commercial Properties · Arman Homes | 0 |
| `/contact/` | Main / informational | Contact Us · Arman Homes | 1 |
| `/privacy-policy/` | Main / informational | Privacy Policy · Arman Homes | 0 |
| `/projects/` | Main / informational | Projects at Life Republic, Hinjawadi · Arman Homes | 0 |
| `/projects/canvas-d-tower/` | Project detail | Canvas – D Tower at Life Republic · Arman Homes | 1 |
| `/projects/duet/` | Project detail | Duet at Life Republic · Arman Homes | 1 |
| `/projects/echoes/` | Project detail | Echoes at Life Republic · Arman Homes | 1 |
| `/projects/qrious/` | Project detail | Qrious at Life Republic · Arman Homes | 1 |
| `/properties/` | Main / informational | Properties in Pune · Arman Homes | 0 |
| `/properties/2-bhk-apartment-wakad/` | Property detail | 2 BHK Apartment · Arman Homes | 0 |
| `/properties/3-bhk-premium-apartment-hinjewadi/` | Property detail | 3 BHK Premium Apartment · Arman Homes | 0 |
| `/properties/4-bhk-luxury-villa-baner/` | Property detail | 4 BHK Luxury Villa · Arman Homes | 0 |
| `/properties/office-space-hinjewadi/` | Property detail | Office Space (Commercial) · Arman Homes | 0 |
| `/rent-property/` | Service | Rent Property in Pune · Arman Homes | 0 |
| `/residential-properties/` | Service | Residential Properties · Arman Homes | 0 |
| `/sell-property/` | Service | Sell Your Property · Arman Homes | 1 |
| `/services/` | Main / informational | Real Estate Services in Pune · Arman Homes | 0 |

## Exclusions and URL behavior

- `/404.html`: branded noindex error document, no canonical, excluded from sitemap. Invalid and nested invalid paths serve it with HTTP 404; direct access to the error document may return 200 with noindex.
- `/thank-you/`: removed because an email delivery confirmation no longer has a purpose; clean deployment must remove the old server file. It returns branded 404 in the local Apache build.
- HTTP, www, index.html and missing trailing slash on real content directories: permanent canonical redirects; query parameters retained. Missing routes are never rewritten to the homepage.
- Property search parameters are user-facing filters on `/properties/`; the canonical is the unfiltered overview. Query variations are not additional sitemap URLs.
- Legacy WordPress slugs were not available in a verified inventory. Unknown old URLs return actual 404; any required individual mappings need the owner's actual old URL list.

## Primary interactions

| Interaction | Routes | Expected behavior / test scope |
|---|---|---|
| Desktop navigation, footer and service/project cards | All | Crawlable links to existing canonical routes; skip link targets main content. |
| Mobile menu | All | Button updates expanded state, focuses menu, Escape restores focus; internal links close the menu. |
| Hero slideshow | Home | Slide controls change image and project chip; reduced motion is respected. |
| Homepage property search | Home → Properties | GET location/type/budget filters; URL and overview controls agree. |
| Property filters, clear, Back/Forward | Properties | Transaction/category/location/type/budget/bedrooms match results; empty state and clear behavior work. |
| Project galleries and location map | Project pages / township sections | Open modal, image navigation by keyboard, Escape closes. |
| Film | Home / Projects | Direct play opens existing video modal; no video compression or performance changes in Stage 1. |
| Brochure downloads | Project details | Existing local PDF resources return 200. |
| Listing gallery and detail links | Properties/detail pages | Static detail routes, images and real contact alternatives. |
| Enquiry forms | Contact, Sell Property, four project details | Required fields, international phone, consent, first-invalid focus, encoded values, project/seller context and canonical source; WhatsApp review/send handoff only. |
| Enquiry fallbacks | Same six forms | Offline and blocked popup keep inputs; direct WhatsApp link; clipboard copy or selected text; call link. No-JS submit remains disabled and direct links work. |
| WhatsApp CTAs | Header/menu/footer, floating desktop widget, mobile bar, services, projects, property details | Official click-to-chat URL with digits-only verified recipient and encoded default/context message. All external tabs use noopener/noreferrer. |
| Phone CTAs | All | `tel:+919354210824`; link inspection only, no real calls. |
| Public business email | Contact/footer/contact band/mobile menu/privacy | armanhomess@gmail.com shown as plain text (unlinked per merged PR #2); no form delivery. |
| Error navigation | Invalid URLs | Home/properties links plus WhatsApp and phone; true 404 and no canonical. |

The floating desktop widget and mobile contact bar are mutually exclusive at mobile widths; existing safe-area padding remains. No additional widget was added.
