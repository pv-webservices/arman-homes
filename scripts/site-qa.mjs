// Full-site QA against a running server: node scripts/site-qa.mjs <baseUrl>
// Route sweep at five widths: HTTP status, horizontal overflow, one H1, unique titles,
// descriptions, broken images and uncaught errors. Axe WCAG 2.1 AA scans at 1440 and 390 once
// fonts, hero/reveal animations and the loader have settled. Then an internal link sweep and
// final screenshots. Writes output/qa/site-qa.json and exits non-zero on any failure.
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { properties } from '../src/data/properties.mjs';

const base = process.argv[2] || 'http://127.0.0.1:4330';
const axeSource = createRequire(import.meta.url).resolve('axe-core/axe.min.js');
const routes = ['/', '/projects/', '/projects/canvas-d-tower/', '/projects/qrious/', '/projects/echoes/', '/projects/duet/', '/properties/', ...properties.map((property) => `/properties/${property.slug}/`), '/buy-property/', '/sell-property/', '/rent-property/', '/residential-properties/', '/commercial-properties/', '/about-us/', '/services/', '/contact/', '/privacy-policy/', '/404.html'];
const stage1 = process.argv.includes('--stage1');
const widths = stage1 ? [1440, 768, 375] : [1440, 1024, 768, 375, 320];
const axeWidths = stage1 ? [] : [1440, 375];
const shots = [['/', 1440], ['/', 768], ['/', 390], ['/contact/', 390], ['/sell-property/', 390], ['/about-us/', 1440], ['/services/', 768], ['/properties/', 320]];

await mkdir('output/qa', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext();
const failures = [];
const pageErrors = [];
const internalLinks = new Set();
const titles = new Map();
let cases = 0;
let axeScans = 0;

// Scroll the page so every [data-reveal] intersects, then wait for all finite animations and
// transitions (hero rise/zoom, reveals, loader) to finish. The marquee is infinite and skipped.
async function settle(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    for (const img of document.images) img.loading = 'eager';
    const step = Math.max(200, innerHeight * 0.6);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    document.querySelectorAll('[data-reveal]').forEach((el) => el.classList.add('reveal-in'));
    scrollTo(0, 0);
    await Promise.all([...document.images].map((img) => img.decode().catch(() => {})));
    await new Promise((r) => setTimeout(r, 50));
    // Below-the-fold homepage sections use content-visibility: auto, so off-screen reveal elements have
    // no computed style yet and their transition would only start when axe reads them. Compute style now
    // so those transitions exist and can be finished with the rest.
    document.querySelectorAll('[data-reveal]').forEach((el) => getComputedStyle(el).opacity);
    const finite = () => document.getAnimations().filter((a) => a.effect?.getTiming().iterations !== Infinity && a.playState !== 'finished');
    finite().forEach((animation) => { try { animation.finish(); } catch { /* Non-finishable animations retain their current state. */ } });
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  });
}

async function runAxe(page) {
  await page.addScriptTag({ path: axeSource });
  return page.evaluate(async () => {
    const result = await window.axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
    return result.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => ({ target: n.target.join(' '), summary: n.failureSummary })) }));
  });
}

for (const width of widths) {
  const page = await context.newPage({ viewport: { width, height: 900 } });
  await page.setViewportSize({ width, height: 900 });
  page.on('pageerror', (error) => pageErrors.push({ width, url: page.url(), message: error.message }));
  page.on('console', message => { if (message.type() === 'error' && !message.text().includes('404')) pageErrors.push({ width, url: page.url(), message: message.text() }); });
  for (const route of routes) {
    const response = await page.goto(base + route, { waitUntil: 'load' });
    await settle(page);
    const state = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - innerWidth,
      wideElements: [...document.querySelectorAll('body *')].filter((el) => el.getBoundingClientRect().right > innerWidth + 1 && getComputedStyle(el).position !== 'fixed' && !el.closest('.marquee, [inert], .mobile-menu')).slice(0, 5).map((el) => el.className || el.tagName),
      h1: document.querySelectorAll('h1').length,
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.content,
      brokenImages: [...document.images].filter((img) => img.complete && !img.naturalWidth).map((img) => img.currentSrc || img.src),
      links: [...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href')),
    }));
    state.links.forEach((link) => internalLinks.add(link));
    const status = response.status();
    const problems = [];
    if (route !== '/404.html' && status !== 200) problems.push(`HTTP ${status}`);
    if (state.overflow > 1) problems.push(`overflow ${state.overflow}px (${state.wideElements.join(', ')})`);
    if (state.h1 !== 1) problems.push(`${state.h1} H1s`);
    if (!state.description) problems.push('missing description');
    if (state.brokenImages.length) problems.push(`broken images ${state.brokenImages.join(', ')}`);
    if (width === 1440) {
      if (titles.has(state.title)) problems.push(`duplicate title with ${titles.get(state.title)}`);
      titles.set(state.title, route);
    }
    if (axeWidths.includes(width)) {
      const violations = await runAxe(page);
      axeScans += 1;
      if (violations.length) failures.push({ width, route, axe: violations });
    }
    if (problems.length) failures.push({ width, route, problems });
    cases += 1;
  }
  await page.close();
  console.log(`Checked ${routes.length} pages at ${width}px.`);
}

// Internal links (query strings kept, fragments dropped; fragment targets checked separately)
const page = await context.newPage();
const brokenLinks = [];
for (const link of internalLinks) {
  const [path, hash] = link.split('#');
  const res = await page.request.get(base + (path || '/'));
  if (res.status() !== 200) { brokenLinks.push(`${link} → ${res.status()}`); continue; }
  if (hash) {
    const html = await res.text();
    if (!html.includes(`id="${hash}"`)) brokenLinks.push(`${link} → missing #${hash}`);
  }
}
if (brokenLinks.length) failures.push({ links: brokenLinks });

for (const [route, width] of shots) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(base + route, { waitUntil: 'load' });
  await settle(page);
  const name = `${route.replace(/\//g, '') || 'home'}-${width}`;
  await page.screenshot({ path: `output/qa/${name}.png`, fullPage: true });
}

const summary = { base, date: new Date().toISOString(), passed: failures.length === 0 && pageErrors.length === 0, cases, axeScans, uniqueInternalLinks: internalLinks.size, failures, pageErrors };
await writeFile('output/qa/site-qa.json', JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
await browser.close();
process.exitCode = summary.passed ? 0 : 1;
