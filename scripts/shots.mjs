// Local visual QA: node scripts/shots.mjs <baseUrl> <width> <path,path> [outDir]
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const [base = 'http://127.0.0.1:4322', width = '1440', paths = '/', out = 'output/shots'] = process.argv.slice(2);
await mkdir(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const context = await browser.newContext({ viewport: { width: Number(width), height: Number(width) < 700 ? 844 : 900 }, deviceScaleFactor: 1 });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
for (const path of paths.split(',')) {
  await page.goto(base + path, { waitUntil: 'networkidle' });
  // Scroll through so lazy images load and one-time reveals fire.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 150)); }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 900));
  });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  const name = (path.replace(/\W+/g, '-').replace(/^-|-$/g, '') || 'home') + `-${width}`;
  await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
  console.log(`${name}: overflow=${overflow}px`);
}
if (errors.length) console.log('ERRORS:\n' + [...new Set(errors)].join('\n'));
await browser.close();
