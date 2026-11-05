// Stage 2 regression checks for the performance/accessibility changes, against a running server.
// Usage: node scripts/perf-qa.mjs <baseUrl> [--headers]
//   --headers  also assert the production .htaccess cache/compression headers (run against Apache, not astro preview)
// Writes output/audit/perf-qa.json and exits non-zero on any failure. External requests are blocked.
import { chromium } from 'playwright';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const base = (process.argv[2] || 'http://127.0.0.1:4330').replace(/\/$/, '');
const checkHeaders = process.argv.includes('--headers');
const results = [];
const check = (name, ok, detail = '') => results.push({ name, ok: !!ok, detail });

const browser = await chromium.launch({ channel: 'chrome' });
const newPage = async (options = {}) => {
  const context = await browser.newContext(options);
  await context.route('**/*', (route) => (new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort()));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  return { page, errors };
};

// 1. Hero: only the first slide image is requested before the load event; the rest hydrate afterwards.
{
  const homeHtml = await readFile('dist/index.html', 'utf8');
  const slideCount = (homeHtml.match(/data-slide(?=[\s>])/g) || []).length;
  const deferredInHtml = (homeHtml.match(/<img[^>]+data-src="[^"]+"/g) || []).length;
  check('hero: every inactive slide image deferred in the built HTML', slideCount > 1 && deferredInHtml === slideCount - 1, `${deferredInHtml} of ${slideCount - 1}`);
  const { page, errors } = await newPage({ viewport: { width: 412, height: 823 }, deviceScaleFactor: 1.75 });
  await page.goto(base + '/', { waitUntil: 'load' });
  check('hero: first slide is eager with fetchpriority=high', await page.$eval('[data-slide] img', (img) => img.loading === 'eager' && img.getAttribute('fetchpriority') === 'high'));
  await page.waitForFunction(() => document.querySelectorAll('[data-slide] img[data-src]').length === 0, null, { timeout: 5000 }).catch(() => {});
  const hydrated = await page.$$eval('[data-slide] img', (imgs) => imgs.every((img) => !img.dataset.src && img.getAttribute('srcset')));
  check('hero: all slides hydrated after load', hydrated);
  await page.waitForLoadState('networkidle');
  // Browser-side timing: compare each inactive slide's request start with the load event.
  const early = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const names = [...document.querySelectorAll('[data-slide] img')].slice(1).map((img) => img.currentSrc.split('/').pop().replace(/-(small|medium)\.webp$|\.webp$/, ''));
    return performance.getEntriesByType('resource')
      .filter((entry) => entry.startTime < nav.loadEventStart && names.some((name) => entry.name.includes(`/${name}`)))
      .map((entry) => entry.name.split('/').pop());
  });
  check('hero: inactive slides not fetched before load', early.length === 0, early.join(', '));
  const posterEarly = await page.evaluate(() => performance.getEntriesByType('resource').some((entry) => entry.name.includes('film-poster')));
  check('film: below-the-fold poster not loaded at the top of the page', !posterEarly);
  const fixedOk = await page.evaluate(() => ['.action-bar', '.whatsapp-fab'].every((selector) => { const el = document.querySelector(selector); return el && !el.closest('.site-footer'); }));
  check('fixed contact controls sit outside <footer>', fixedOk);
  check('footer is not content-visibility contained (keeps Lighthouse contrast checks valid)', await page.$eval('.site-footer', (el) => getComputedStyle(el).contentVisibility !== 'auto'));
  check('hero: no aria-live region announcing every slide', !(await page.$('[data-hero] [aria-live]')));
  check('homepage: no console or page errors', errors.length === 0, errors.join(' | '));
}

// 2. Pause/play toggle (WCAG 2.2.2): visible, keyboard operable, stops advancing, label flips.
{
  const { page } = await newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  const toggle = page.locator('[data-hero-toggle]');
  check('toggle: visible when motion allowed', await toggle.isVisible());
  await toggle.focus();
  await page.keyboard.press('Enter');
  check('toggle: label becomes "Play slideshow"', (await toggle.getAttribute('aria-label')) === 'Play slideshow');
  const before = await page.$eval('[data-slide].is-active', (el) => [...el.parentElement.children].indexOf(el));
  await page.mouse.move(5, 5);
  await page.locator('h2').first().focus().catch(() => {});
  await page.waitForTimeout(7600);
  const after = await page.$eval('[data-slide].is-active', (el) => [...el.parentElement.children].indexOf(el));
  check('toggle: slideshow stays paused after hover/focus leave', before === after, `${before} -> ${after}`);
  await toggle.focus();
  await page.keyboard.press('Space');
  check('toggle: Space resumes, label "Pause slideshow"', (await toggle.getAttribute('aria-label')) === 'Pause slideshow');
  const box = await toggle.boundingBox();
  check('toggle: target at least 44×44px', box && box.width >= 44 && box.height >= 44, box ? `${box.width}×${box.height}` : 'no box');
}
{
  const { page } = await newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  check('toggle: hidden under reduced motion (nothing auto-advances)', !(await page.locator('[data-hero-toggle]').isVisible()));
}

// 3. content-visibility sections still reveal and render when scrolled to.
{
  const { page } = await newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  for (let y = 0; y < (await page.evaluate(() => document.body.scrollHeight)); y += 400) {
    await page.evaluate((top) => scrollTo(0, top), y);
    // Wait for two rendered frames: IntersectionObserver only evaluates during rendering, so jumping
    // faster than frames paint would skip positions a real (continuous) scroll always passes through.
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(900);
  // Hidden blocks (e.g. the empty-inventory notice) and cards parked off-screen in a horizontal swipe
  // rail never intersect the viewport during a vertical scroll; they are checked separately below.
  const pending = await page.$$eval('[data-reveal]:not(.reveal-in)', (els) => els
    .filter((el) => el.checkVisibility() && !el.closest('.happy-rail'))
    .map((el) => el.className));
  check('homepage: every visible [data-reveal] element revealed after scrolling', pending.length === 0, pending.join(', '));
  const rail = page.locator('.happy-rail');
  await rail.scrollIntoViewIfNeeded();
  for (let i = 0; i < 12; i++) {
    await rail.evaluate((el) => el.scrollBy({ left: 160 }));
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(900);
  const railPending = await page.$$eval('.happy-rail [data-reveal]:not(.reveal-in)', (els) => els.length);
  check('homepage 390px: Happy Clients cards reveal when swiped into view', railPending === 0, `${railPending} pending`);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  check('homepage 390px: no horizontal overflow', !overflow);
}

// 4. Every srcset descriptor matches the real pixel width of its file (prevents wrong downloads).
{
  const { page } = await newPage();
  const files = (await readdir('dist', { recursive: true })).filter((file) => file.endsWith('.html'));
  const candidates = new Map();
  for (const file of files) {
    const html = await readFile(path.join('dist', file), 'utf8');
    for (const [, srcset] of html.matchAll(/\s(?:data-)?srcset="([^"]+)"/g)) {
      for (const part of srcset.split(',')) {
        const [url, descriptor] = part.trim().split(/\s+/);
        if (descriptor?.endsWith('w')) candidates.set(url, Number.parseInt(descriptor, 10));
      }
    }
  }
  const mismatches = [];
  for (const [url, width] of candidates) {
    const natural = await page.evaluate(async (src) => {
      const img = new Image();
      img.src = src;
      await img.decode().catch(() => {});
      return img.naturalWidth;
    }, base + url);
    if (natural !== width) mismatches.push(`${url} declared ${width}w, actual ${natural}px`);
  }
  check(`srcset: ${candidates.size} candidate widths match their files`, mismatches.length === 0, mismatches.slice(0, 5).join('; '));
}

// 5. Keyboard: skip link, visible focus on every stop, Shift+Tab, no traps, dialogs return focus.
{
  const { page } = await newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.keyboard.press('Tab');
  await page.waitForTimeout(400); // the skip link slides in over 0.25s
  const skip = await page.evaluate(() => ({ cls: document.activeElement?.className, top: document.activeElement?.getBoundingClientRect().top }));
  check('keyboard: first Tab reaches the visible skip link', skip.cls === 'skip-link' && skip.top >= 0, JSON.stringify(skip));
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  check('keyboard: skip link moves focus into main content', await page.evaluate(() => !!document.activeElement?.closest('main')));
  // Walk the whole page: every stop must show a focus indicator, and Tab must eventually leave main.
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  const stops = [];
  for (let i = 0; i < 160; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      // An indicator on the element itself, or on its immediate field wrapper (custom search selects).
      const shows = (node) => { const s = getComputedStyle(node); return (s.outlineStyle !== 'none' && Number.parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none'; };
      const wrapper = el.closest('.search-field');
      const visible = shows(el) || (!!wrapper && shows(wrapper) && getComputedStyle(wrapper).outlineStyle !== 'none');
      return { tag: el.tagName, label: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 40), visible, inFooter: !!el.closest('footer') };
    });
    if (!info) break;
    stops.push(info);
    if (info.inFooter) break;
  }
  const invisible = stops.filter((s) => !s.visible);
  check(`keyboard: ${stops.length} homepage focus stops all show a focus indicator`, stops.length > 10 && invisible.length === 0, invisible.slice(0, 4).map((s) => `${s.tag} "${s.label}"`).join('; '));
  check('keyboard: Tab reaches the footer (no focus trap)', stops.some((s) => s.inFooter), `${stops.length} stops`);
  const forward = await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 80));
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  check('keyboard: Shift+Tab then Tab returns to the same element', (await page.evaluate(() => document.activeElement?.outerHTML.slice(0, 80))) === forward);
  // Film dialog: Enter opens, Escape closes, focus returns to the trigger.
  const film = page.locator('.film [data-film-open]');
  await film.focus();
  await page.keyboard.press('Enter');
  check('keyboard: Enter opens the film dialog', await page.$eval('[data-film-modal]', (d) => d.open));
  await page.keyboard.press('Escape');
  check('keyboard: Escape closes the film dialog and focus returns to its button', await page.evaluate(() => !document.querySelector('[data-film-modal]').open && document.activeElement?.matches('[data-film-open]')));
}
{
  const { page } = await newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(base + '/projects/canvas-d-tower/', { waitUntil: 'networkidle' });
  const item = page.locator('[data-lightbox-item]').first();
  await item.focus();
  await page.keyboard.press('Enter');
  check('keyboard: project gallery opens with Enter', await page.$eval('[data-gallery-modal]', (d) => d.open));
  const first = await page.$eval('[data-gallery-modal] img', (img) => img.getAttribute('src'));
  await page.keyboard.press('ArrowRight');
  check('keyboard: ArrowRight shows the next gallery image', (await page.$eval('[data-gallery-modal] img', (img) => img.getAttribute('src'))) !== first);
  await page.keyboard.press('Escape');
  check('keyboard: Escape closes the gallery and returns focus to a gallery item', await page.evaluate(() => !document.querySelector('[data-gallery-modal]').open && !!document.activeElement?.matches('[data-lightbox-item]')));
}

// 6. Production cache/compression headers (Apache with the built .htaccess only).
if (checkHeaders) {
  const head = async (url, encoding = 'br, gzip') => {
    const res = await fetch(base + url, { method: 'GET', headers: { 'Accept-Encoding': encoding } });
    await res.arrayBuffer();
    return res.headers;
  };
  const html = await readFile('dist/index.html', 'utf8');
  const css = html.match(/\/_astro\/[^"]+\.css/)?.[0];
  const js = html.match(/\/_astro\/[^"]+\.js/)?.[0];
  for (const asset of [css, js].filter(Boolean)) {
    const headers = await head(asset);
    check(`headers ${asset}: immutable 1-year cache`, headers.get('cache-control') === 'public, max-age=31536000, immutable', headers.get('cache-control'));
    check(`headers ${asset}: compressed`, /br|gzip/.test(headers.get('content-encoding') || ''), headers.get('content-encoding'));
  }
  const pageHeaders = await head('/');
  check('headers /: HTML revalidates (no-cache)', pageHeaders.get('cache-control') === 'no-cache', pageHeaders.get('cache-control'));
  check('headers /: compressed', /br|gzip/.test(pageHeaders.get('content-encoding') || ''), pageHeaders.get('content-encoding'));
  check('headers /: security headers kept', pageHeaders.get('x-content-type-options') === 'nosniff' && pageHeaders.get('x-frame-options') === 'SAMEORIGIN' && pageHeaders.get('referrer-policy') === 'strict-origin-when-cross-origin');
  const gzipOnly = await head('/', 'gzip');
  check('headers /: gzip fallback for clients without Brotli', gzipOnly.get('content-encoding') === 'gzip', gzipOnly.get('content-encoding'));
  const image = await head('/images/brand/logo.webp');
  check('headers image: 7-day cache, not re-compressed', image.get('cache-control') === 'public, max-age=604800' && !image.get('content-encoding'), `${image.get('cache-control')} / ${image.get('content-encoding')}`);
  const icon = await head('/favicon-48x48.png');
  check('headers favicon: 1-day cache', icon.get('cache-control') === 'public, max-age=86400', icon.get('cache-control'));
  const missing = await fetch(base + '/perf-qa-missing/');
  check('missing route still returns 404', missing.status === 404, String(missing.status));
}

await browser.close();
await mkdir('output/audit', { recursive: true });
await writeFile('output/audit/perf-qa.json', JSON.stringify({ base, passed: results.every((r) => r.ok), results }, null, 2));
for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'} ${r.name}${r.detail ? ` — ${r.detail}` : ''}`);
console.log(`${results.filter((r) => r.ok).length}/${results.length} perf-qa checks passed`);
process.exitCode = results.every((r) => r.ok) ? 0 : 1;
