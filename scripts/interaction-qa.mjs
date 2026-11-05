// Interaction QA against a running server: node scripts/interaction-qa.mjs <baseUrl>
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
await mkdir('output/shots', { recursive: true });

const base = process.argv[2] || 'http://127.0.0.1:4321';
const production = process.argv.includes('--production');
const browser = await chromium.launch({ channel: 'chrome' });
async function testPage(options) {
  const context = await browser.newContext(options);
  await context.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  await context.addInitScript(() => { window.open = () => ({ opener: null, location: { replace() {} } }); });
  return context.newPage();
}
const results = [];
const check = (name, ok, detail = '') => results.push(`${ok ? 'PASS' : 'FAIL'} ${name}${detail ? ` — ${detail}` : ''}`);

// Mobile menu
const mobile = await testPage({ viewport: { width: 390, height: 844 } });
await mobile.goto(base + '/', { waitUntil: 'networkidle' });
await mobile.click('.menu-toggle');
await mobile.waitForTimeout(600);
check('menu opens', await mobile.evaluate(() => document.documentElement.classList.contains('menu-open') && !document.querySelector('#mobile-menu').inert));
await mobile.screenshot({ path: 'output/shots/menu-390.png' });
await mobile.keyboard.press('Escape');
await mobile.waitForTimeout(300);
check('menu closes on Escape', await mobile.evaluate(() => !document.documentElement.classList.contains('menu-open')));

// Home search: office type -> properties URL, matching listing shown
await mobile.selectOption('.hero-search select[name=type]', 'office');
await mobile.click('.hero-search .search-submit');
await mobile.waitForLoadState('networkidle');
const url = new URL(mobile.url());
check('home search submits filters', url.pathname === '/properties/' && url.searchParams.get('type') === 'office', url.search);
check('expanded search shows only matching listing', await mobile.evaluate(() => [...document.querySelectorAll('[data-property]')].filter((c) => !c.hidden).length === 1));

// Header state and hero slideshow
const desk = await testPage({ viewport: { width: 1440, height: 900 } });
await desk.goto(base + '/', { waitUntil: 'networkidle' });
await desk.click('[data-slide-to="2"]');
check('hero control switches slide', await desk.evaluate(() => document.querySelectorAll('[data-slide]')[2].classList.contains('is-active') && document.querySelectorAll('[data-chip]')[2].classList.contains('is-active')));
await desk.evaluate(() => scrollTo(0, 800));
await desk.waitForTimeout(400);
check('header shadow after scroll', await desk.evaluate(() => document.querySelector('[data-header]').classList.contains('solid')));
await desk.click('.home-hero [data-film-open]');
check('film modal opens', await desk.evaluate(() => document.querySelector('[data-film-modal]').open));
await desk.keyboard.press('Escape');

// Project page: gallery lightbox, brochure and project-tagged enquiry
await desk.goto(base + '/projects/echoes/', { waitUntil: 'networkidle' });
await desk.click('[data-lightbox-item="1"]');
check('gallery lightbox opens', await desk.evaluate(() => document.querySelector('[data-gallery-modal]').open && document.querySelector('[data-gallery-modal] img').src.includes('/images/projects/')));
await desk.keyboard.press('ArrowRight');
check('lightbox arrow navigates', (await desk.textContent('[data-caption]')).startsWith('3 /'));
await desk.keyboard.press('Escape');
const brochure = await desk.getAttribute('.project-hero a[download]', 'href');
check('brochure link resolves', (await desk.request.head(base + brochure)).status() === 200, brochure);
check('enquiry carries project', await desk.inputValue('[data-inquiry-form] input[name=project]') === 'Echoes');

// Contact form: validation then WhatsApp draft
await desk.goto(base + '/contact/', { waitUntil: 'networkidle' });
await desk.click('[data-inquiry-form] button[type=submit]');
check('form blocks empty submit', (await desk.textContent('[data-form-status]')).includes('highlighted'));
await desk.fill('#contact-full_name', 'Test Visitor');
await desk.fill('#contact-phone', '+91 90000 00000');
await desk.selectOption('#contact-type', 'Buy Property');
await desk.fill('#contact-message', 'Looking for a 2 BHK.');
await desk.check('#contact-consent');
await desk.click('[data-inquiry-form] button[type=submit]');
const href = await desk.getAttribute('[data-draft-link]', 'href');
check('form prepares WhatsApp draft', !!href && href.startsWith('https://wa.me/919354210824?text='));

// Internal links resolve
const links = new Set();
for (const path of ['/', '/projects/', '/projects/canvas-d-tower/', '/services/', '/about-us/', '/contact/', '/buy-property/', '/sell-property/', '/properties/']) {
  await desk.goto(base + path, { waitUntil: 'domcontentloaded' });
  for (const h of await desk.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')))) {
    if (h.startsWith('/') ) links.add(h.split('#')[0]);
  }
}
const broken = [];
for (const link of links) {
  const res = await desk.request.get(base + link);
  if (res.status() !== 200) broken.push(`${link} → ${res.status()}`);
}
check(`internal links (${links.size})`, broken.length === 0, broken.join(', '));

// Anchors exist
await desk.goto(base + '/services/', { waitUntil: 'domcontentloaded' });
check('services anchor target exists', await desk.$('#buy-property') !== null);

// Mobile menu keyboard: focus moves into the menu, Escape restores it to the toggle, links navigate
await mobile.goto(base + '/', { waitUntil: 'networkidle' });
await mobile.focus('.menu-toggle');
await mobile.keyboard.press('Enter');
await mobile.waitForTimeout(500);
check('menu focuses first link', await mobile.evaluate(() => document.activeElement?.closest('#mobile-menu') !== null && document.activeElement.textContent.includes('Home')));
check('menu toggle label updates', (await mobile.textContent('[data-menu-label]')) === 'Close menu' && (await mobile.getAttribute('.menu-toggle', 'aria-expanded')) === 'true');
await mobile.keyboard.press('Escape');
await mobile.waitForTimeout(300);
check('Escape restores focus to toggle', await mobile.evaluate(() => document.activeElement?.classList.contains('menu-toggle') && document.querySelector('#mobile-menu').inert));
await mobile.click('.menu-toggle');
await mobile.waitForTimeout(500);
await mobile.getByRole('navigation', { name: 'Mobile navigation' }).getByRole('link', { name: /Contact/ }).click();
await mobile.waitForURL('**/contact/');
check('menu link navigates and closes', await mobile.evaluate(() => !document.documentElement.classList.contains('menu-open')));

// Home search with all three fields, then expanded filters and clear
await desk.goto(base + '/', { waitUntil: 'networkidle' });
await desk.selectOption('.hero-search select[name=location]', 'Marunji');
await desk.selectOption('.hero-search select[name=type]', 'apartment');
await desk.selectOption('.hero-search select[name=budget]', '10000000');
await desk.click('.hero-search .search-submit');
await desk.waitForURL('**/properties/?**');
const homeQuery = new URL(desk.url()).searchParams;
check('home search sends location/type/budget', homeQuery.get('location') === 'Marunji' && homeQuery.get('type') === 'apartment' && homeQuery.get('budget') === '10000000');
check('expanded search restores filters', await desk.evaluate(() => document.querySelector('.expanded select[name=location]').value === 'Marunji' && document.querySelector('.expanded select[name=budget]').value === '10000000'));
check('empty inventory shows honest state', await desk.isVisible('[data-empty]'));
check('filter summary lists choices', (await desk.textContent('[data-filter-summary]')).includes('Marunji, Pune'));
await desk.selectOption('.expanded select[name=category]', 'residential');
await desk.selectOption('.expanded select[name=bedrooms]', '2');
await desk.click('.expanded .search-submit');
await desk.waitForURL('**bedrooms=2**');
check('expanded filters persist', await desk.evaluate(() => document.querySelector('.expanded select[name=bedrooms]').value === '2' && document.querySelector('.expanded select[name=category]').value === 'residential'));
await desk.click('.reset-filters');
await desk.waitForLoadState('networkidle');
check('clear filters resets URL', new URL(desk.url()).search === '');
await desk.goBack();
check('Back restores filtered property URL', new URL(desk.url()).searchParams.get('bedrooms') === '2');
await desk.goForward();
check('Forward restores cleared property search', new URL(desk.url()).search === '');

// Both enquiry forms: invalid phone, WhatsApp draft, no false delivery claim, stale draft hidden
for (const seller of [false, true]) {
  const p = seller ? 'seller' : 'contact';
  await desk.goto(base + (seller ? '/sell-property/#seller-enquiry' : '/contact/'), { waitUntil: 'networkidle' });
  await desk.fill(`#${p}-full_name`, 'QA Example');
  await desk.fill(`#${p}-phone`, 'abc');
  if (seller) {
    await desk.fill('#seller-property_location', 'Marunji');
    await desk.selectOption('#seller-type', 'Apartment');
    await desk.fill('#seller-details', 'Local QA fixture only');
  } else {
    await desk.selectOption('#contact-type', 'Buy Property');
  }
  await desk.fill(`#${p}-message`, 'Local QA only. No enquiry is sent.');
  await desk.check(`#${p}-consent`);
  await desk.click(`#${p}-message >> xpath=ancestor::form//button[@type="submit"]`);
  check(`${p} form rejects invalid phone`, (await desk.getAttribute(`#${p}-phone`, 'aria-invalid')) === 'true' && (await desk.textContent(`#${p}-phone-error`)).includes('valid phone'));
  await desk.fill(`#${p}-phone`, '+91 90000 00000');
  await desk.click(`#${p}-message >> xpath=ancestor::form//button[@type="submit"]`);
  const form = desk.locator('[data-inquiry-form]').filter({ has: desk.locator(`#${p}-message`) });
  const draftHref = await form.locator('[data-draft-link]').getAttribute('href');
  check(`${p} draft encodes values`, !!draftHref && draftHref.includes('QA%20Example') && (await form.locator('[data-form-status]').textContent()).includes('Delivery is not confirmed'));
  await desk.fill(`#${p}-message`, 'Changed message');
  check(`${p} stale draft hidden after edit`, await form.locator('[data-draft-link]').isHidden());
}

// Reduced motion, 404 status and indexing settings for the selected build
const reduced = await testPage({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
await reduced.goto(base + '/', { waitUntil: 'networkidle' });
check('reduced motion shows content immediately', await reduced.evaluate(() => {
  const heroOpacity = getComputedStyle(document.querySelector('.hero-in')).opacity;
  const reveals = [...document.querySelectorAll('[data-reveal]')].every((el) => getComputedStyle(el).opacity === '1');
  return heroOpacity === '1' && reveals && getComputedStyle(document.querySelector('.loader')).display === 'none';
}));
check('missing route returns 404', (await desk.request.get(base + '/missing-property/')).status() === 404);
const robots = await (await desk.request.get(base + '/robots.txt')).text();
if (production) {
  check('production robots allows indexing', robots.includes('Allow: /') && !robots.includes('Disallow: /') && robots.includes('Sitemap: https://armanhomes.in/sitemap-index.xml'));
  check('production homepage uses approved canonical and indexing', await reduced.evaluate(() => document.querySelector('link[rel="canonical"]')?.href === 'https://armanhomes.in/' && document.querySelector('meta[name="robots"]')?.content === 'index, follow, max-image-preview:large'));
  await reduced.goto(base + '/404.html');
  check('404 page remains noindex', (await reduced.locator('meta[name="robots"]').getAttribute('content')) === 'noindex, follow');
} else {
  check('preview robots blocks indexing', robots.includes('Disallow: /'));
}

await writeFile('output/audit/interactions.json', JSON.stringify({ passed: !results.some(r => r.startsWith('FAIL')), checks: results.length, results }, null, 2));
console.log(results.join('\n'));
await browser.close();
process.exitCode = results.some((r) => r.startsWith('FAIL')) ? 1 : 0;
