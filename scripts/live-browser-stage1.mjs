// Public pages only; never interact with enquiry, call or external service links.
import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chrome' });
const results = [], errors = [];
await mkdir('output/stage1/live-browser', { recursive: true });
try {
  for (const width of [1440, 375]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    page.on('pageerror', error => errors.push({ width, message: error.message }));
    page.on('console', message => { if (message.type() === 'error') errors.push({ width, message: message.text() }); });
    for (const path of ['/', '/about-us/', '/services/', '/buy-property/', '/projects/echoes/', '/contact/', '/privacy-policy/']) {
      const response = await page.goto('https://armanhomes.in' + path, { waitUntil: 'load' });
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].filter(image => image.loading !== 'lazy').map(image => image.decode().catch(() => {}))); });
      const state = await page.evaluate(() => ({ h1: document.querySelectorAll('h1').length, brokenLoadedImages: [...document.images].filter(image => image.complete && !image.naturalWidth).map(image => image.src), overflow: document.documentElement.scrollWidth - innerWidth, title: document.title, emailForm: !!document.querySelector('form[action*="formsubmit"]') }));
      results.push({ path, width, status: response.status(), ...state });
      if (path === '/' || path === '/contact/') await page.screenshot({ path: `output/stage1/live-browser/${path === '/' ? 'home' : 'contact'}-${width}.png` });
    }
    await page.close();
  }
  const report = { passed: errors.length === 0 && results.every(row => row.status === 200 && row.h1 === 1 && row.brokenLoadedImages.length === 0 && row.overflow <= 1), cases: results.length, errors, results };
  await writeFile('output/stage1/live-browser.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
} finally { await browser.close(); }
