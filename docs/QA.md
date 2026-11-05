# Stage 1 QA — 5 November 2026

Current complete results, limitations, affected files and Stage 2 handover: [AUDIT-REPORT.md](AUDIT-REPORT.md). Route/interaction inventory: [ROUTE-INVENTORY.md](ROUTE-INVENTORY.md).

The previous email-integration report is superseded by the current WhatsApp-only request. Its original local copy is retained under ignored `output/stage1/before/`; it is not a current deployment guide.

| Verification | Result |
|---|---|
| Astro check | 0 errors/warnings/hints |
| Unit suite | 9/9 |
| Production build | 21 HTML pages |
| SEO | 20 indexable URLs; 1,013 internal references; 0 issues |
| WhatsApp / phone links | 135 / 144 validated |
| Forms | 109 checks; 12 desktop/mobile flows; 0 real sends/calls |
| Interactions | 38/38 |
| Browser page/viewport sweep | 63/63; 35 internal links; 0 page errors |
| Local Apache/TLS | 189 checks; 143 public resources; redirects, headers, MIME types and actual 404s pass |
| SEO audit rejection tests | 6/6; intentional mutation rejected and source restored |
| Live read-only browser review | 14/14; existing deployment, not the new changes |
| Asset hashes | 147 files; 0 duplicates; 6 unused originals archived outside public |
| Production dependency audit | 0 reported vulnerabilities |

Comprehensive performance and accessibility auditing is deferred to Prompt 2. No Lighthouse or full Axe run was performed in Stage 1. The existing full audit script remains available; `--stage1` performs the initial functional/responsive sweep only.

Production still has the previous email forms. New changes remain uncommitted and undeployed. Deployment requires a clean replacement of old files, followed by live verification. Search Console owner actions and business-content approvals remain outstanding.
