# Upload Arman Homes to DirectAdmin

**Stage 1 local update — 5 November 2026:** WhatsApp-only forms replace the previous email forms. The changes are uncommitted and undeployed. The current public Apache site remains the previous manually uploaded build. Git-based deployment is not configured in this repository. Run Prompt 2 and obtain deployment authorization before replacing production files.

Production website: **https://armanhomes.in**  
Hosting folder: **`/domains/armanhomes.in/public_html/`**  
Upload file: **`output/hosting/arman-homes-public-html.zip`**

The ZIP contains the built website and media, including the hidden `.htaccess` file. It needs no Node.js, npm, WordPress, PHP application or database on the hosting server. The domain can keep pointing to the same hosting account.

## Rebuild the ZIP after changes

On this Windows computer, open the project folder and run:

```powershell
npm run package:hosting
```

This creates a fresh production build, checks the domain and indexing settings, and packages the contents of `dist/` at the root of the ZIP. It does not upload or change the live server. Only the built files go into the ZIP; source files, environment files, credentials, dependencies and source brochures are excluded. Public web brochures and video are included.

## Replace the current static website after authorization

1. Keep the existing `public_html` backup safely outside the live website folder. For a complete WordPress rollback, retain its database too; the file backup alone does not contain database content. This static site does not use or modify that database.
2. Open the domain's `public_html` folder in DirectAdmin. Keep the `public_html` folder itself in place. Back up the current static contents outside `public_html`, then replace them with the new build. Remove stale old files, especially `thank-you/index.html` and old compiled bundles, instead of only overlaying the ZIP. WordPress is no longer the active site; retain its older backup separately. Preserve any hosting-managed `.well-known` certificate-validation folder.
3. Click **Upload** in the top-left toolbar beside **New File**, and select **`arman-homes-public-html.zip`**.
4. Once the upload finishes, select the ZIP and use the file manager's extraction action. Extract into **`/domains/armanhomes.in/public_html/`**.
5. Confirm the layout below. There must be no extra `dist`, `arman-homes` or second `public_html` folder between the hosting folder and `index.html`. Ensure hidden files are visible so you can confirm the new `.htaccess` is present.
6. Remove the uploaded ZIP from `public_html` after successful extraction. Keep the copy on your computer.

```text
public_html/
  .htaccess
  index.html
  404.html
  robots.txt
  sitemap.xml
  favicon.svg
  _astro/
  images/
  brochures/
  video/
  about-us/index.html
  contact/index.html
  projects/...
  properties/...
  ...other website page folders
```

Upload the prepared ZIP, rather than the development project folder. The new `.htaccess` replaces WordPress rewrite rules. It uses `index.html`, redirects HTTP and www requests to `https://armanhomes.in` while retaining paths and queries, disables directory listings and content negotiation, and displays the branded 404 page with a 404 status for missing URLs. Certificate-renewal requests under `.well-known/acme-challenge/` are exempt from the redirect.

Since Stage 2 it also sets browser caching and compression. `/_astro/` files are cached for a year (their names change with every build); images, video and brochures for 7 days; favicons and the manifest for 1 day; HTML, sitemaps and robots.txt revalidate on every visit. Text is compressed with Brotli if the host supports it, otherwise gzip, and images and video are not re-compressed. Every caching and compression directive is wrapped in `<IfModule>`, so a missing module is skipped rather than causing a server error. After upload, check the headers once:

```sh
curl -sI https://armanhomes.in/ | grep -iE "cache-control|content-encoding"
curl -sI https://armanhomes.in/images/brand/logo.webp | grep -i cache-control
```

Expect `no-cache` on the page and `public, max-age=604800` on the image. Because image names stay the same between releases, a replaced image can take up to 7 days to reach returning visitors. Give an urgently changed image a new filename.

## Check immediately after upload

- Open `https://armanhomes.in/` in a private browser window. Confirm the new design and images load.
- Open `/projects/`, a project detail page, `/properties/` and `/contact/` directly, then refresh each page. Test mobile navigation and property search.
- Test a brochure download and the film player.
- Open `http://armanhomes.in/contact/?test=1` and confirm it redirects to `https://armanhomes.in/contact/?test=1`. Check `https://www.armanhomes.in/` too. HTTPS on www requires the hosting certificate to cover www before the redirect can run.
- Open `/robots.txt`, `/sitemap-index.xml` and `/sitemap.xml`; all should reference `https://armanhomes.in`. Normal pages allow indexing; the 404 document remains noindex with no canonical. The removed `/thank-you/` must return 404.
- Open a nonexistent URL such as `/missing-property/`. It should show the branded error page and return HTTP **404**, rather than the homepage with status 200.
- Verify WhatsApp drafts using intercepted handoffs, plus direct `tel:+919354210824` links. Never send a real WhatsApp message or place a call without separate authorization. Forms must never submit to an email service.

The server rules require Apache-compatible `.htaccess` support, including rewrite and directory-index overrides. The existing server identified itself as Apache during preparation. These rules still require verification on the live host after extraction. If a redirect loop or server error occurs, restore the prior website files while the host's HTTPS/override configuration is investigated.

## Content to confirm before publishing

The current property data includes four listings whose source comments identify their photography as illustrative and require real photos and price confirmation before launch (`src/data/properties.mjs`). The upload preparation preserves those records. Confirm them with the owner. Confirm project prices/offers and the privacy copy as well. Old WordPress URLs without matching new pages will return 404; add individual redirects if old URLs need preserving, rather than redirecting all missing pages to the homepage.

## Roll back if needed

Restore the immediately previous static release, including its `.htaccess`, from the pre-update backup. Preserve the hosting-managed `.well-known` directory. Check homepage, inner pages and 404 status. Be aware that the previous release still contains email forms, so it does not satisfy the WhatsApp-only requirement. A WordPress rollback is a separate, older recovery path and is not part of routine static updates.

The packaging command never uploads, changes DNS, modifies a database or transmits a message. The current local verification is documented in [AUDIT-REPORT.md](AUDIT-REPORT.md). Apache redirect rules were tested locally in an isolated container; repeat them on the actual server after deployment, since host-level redirects can add hops before `.htaccess` runs.

Configuration references: [Astro static deployment](https://docs.astro.build/en/guides/deploy/), [Astro environment variables](https://docs.astro.build/en/guides/environment-variables/), [Apache directory indexes](https://httpd.apache.org/docs/2.4/mod/mod_dir.html#directoryindex), [Apache error documents](https://httpd.apache.org/docs/2.4/mod/core.html#errordocument).
