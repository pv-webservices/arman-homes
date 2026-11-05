// All external handoffs are mocked; no WhatsApp navigation, messages, mail or calls.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const base = process.argv[2] || 'http://127.0.0.1:4330';
const browser = await chromium.launch({ channel: 'chrome' });
const results = [];
const check = (label, ok) => { assert.ok(ok, label); results.push(label); };
async function fixture(path = '/contact/', javaScriptEnabled = true, mobile = false) {
  const context = await browser.newContext({ javaScriptEnabled, viewport: mobile ? { width: 375, height: 812 } : { width: 1440, height: 900 } });
  const external = [];
  await context.route('**/*', route => {
    if (new URL(route.request().url()).origin !== new URL(base).origin) { external.push(route.request().url()); return route.abort(); }
    return route.continue();
  });
  await context.addInitScript(() => {
    window.__handoffs = []; window.__blocked = false; window.__clipboardFails = false;
    window.open = () => window.__blocked ? null : { opener: window, location: { replace: url => window.__handoffs.push(url) } };
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: async text => { if (window.__clipboardFails) throw new Error('Denied'); window.__copied = text; } } });
  });
  const page = await context.newPage();
  await page.goto(base + path);
  const form = page.locator('[data-inquiry-form]');
  async function fill() {
    await form.locator('[name=full_name]').fill('QA Visitor & परीक्षण');
    await form.locator('[name=phone]').fill('+44 7700 900123');
    if (await form.locator('[name=property_location]').count()) await form.locator('[name=property_location]').fill('Hinjewadi');
    await form.locator('select').selectOption({ index: 1 });
    if (await form.locator('[name=property_details]').count()) await form.locator('[name=property_details]').fill('QA property details only.');
    await form.locator('[name=message]').fill('QA only: 2 BHK & balcony?\nBudget ₹80 lakh + discussion.');
    await form.locator('[name=consent]').check();
  }
  return { page, form, context, external, fill, send: () => form.locator('[type=submit]').click() };
}
try {
  const paths = ['/contact/', '/sell-property/', '/projects/canvas-d-tower/', '/projects/qrious/', '/projects/echoes/', '/projects/duet/'];
  for (const mobile of [false, true]) for (const path of paths) {
    const f = await fixture(path, true, mobile);
    await f.fill(); await f.send();
    const handoffs = await f.page.evaluate(() => window.__handoffs);
    const url = new URL(handoffs[0]); const message = url.searchParams.get('text');
    check(`${mobile ? 'mobile' : 'desktop'} ${path}: one correctly encoded WhatsApp handoff`, handoffs.length === 1 && url.origin === 'https://wa.me' && url.pathname === '/919354210824' && message.includes('QA Visitor & परीक्षण') && message.includes('₹80 lakh + discussion.') && [...url.searchParams.keys()].length === 1);
    check(`${path}: canonical source and no empty/duplicate fields`, message.includes('Source Page: https://armanhomes.in' + path) && (message.match(/^Name:/gm) || []).length === 1 && !message.includes('Email:') && !message.includes('undefined') && !message.includes('null'));
    if (path.includes('/projects/')) check(`${path}: project context included`, message.includes('Project: ') && message.includes('Enquiry Type: Buy Property'));
    if (path.includes('sell-property')) check('seller context and property details included', message.includes('Enquiry Type: Sell Property') && message.includes('Property Location: Hinjewadi') && message.includes('Property Type: Apartment') && message.includes('QA property details only.'));
    check(`${path}: preserved inputs, no delivery claim and no external request`, await f.form.locator('[name=full_name]').inputValue() === 'QA Visitor & परीक्षण' && (await f.form.locator('[data-form-status]').textContent()).includes('Delivery is not confirmed') && f.external.length === 0 && new URL(f.page.url()).pathname === path);
    await f.page.evaluate(() => document.querySelector('[data-inquiry-form]').requestSubmit());
    check(`${path}: immediate repeat activation blocked`, await f.page.evaluate(() => window.__handoffs.length) === 1);
    await f.form.locator('[data-copy-message]').click();
    check(`${path}: copy message matches generated text`, await f.page.evaluate(() => window.__copied) === message);
    await f.form.locator('[name=message]').fill('Changed message only.');
    check(`${path}: stale draft hidden after editing`, await f.form.locator('[data-form-fallback]').isHidden());
    await f.context.close();
  }
  const f = await fixture();
  await f.send();
  check('empty submit focuses first invalid field and exposes associated error', await f.form.locator('[name=full_name]').evaluate(el => el === document.activeElement && el.getAttribute('aria-invalid') === 'true' && !!document.getElementById(el.getAttribute('aria-describedby')).textContent));
  for (const [name, value] of [['full_name', '  '], ['full_name', 'A'], ['phone', '123456789'], ['phone', '1234567890123456'], ['phone', '91abc9000000000'], ['message', 'short'], ['message', 'x'.repeat(1001)]]) {
    await f.fill();
    await f.form.locator(`[name=${name}]`).evaluate((el, value) => { el.value = value; }, value);
    await f.send();
    check(`${name}: invalid value (${value.length} characters) blocked`, await f.form.locator(`[name=${name}]`).getAttribute('aria-invalid') === 'true' && await f.page.evaluate(() => window.__handoffs.length) === 0);
  }
  await f.fill(); await f.form.locator('select').selectOption(''); await f.send();
  check('enquiry type required', await f.form.locator('select').getAttribute('aria-invalid') === 'true');
  await f.fill(); await f.form.locator('[name=consent]').uncheck(); await f.send();
  check('consent required', await f.form.locator('[name=consent]').getAttribute('aria-invalid') === 'true');
  await f.fill(); await f.context.setOffline(true); await f.send();
  check('offline preserves inputs and exposes draft/copy fallback', (await f.form.locator('[data-form-status]').textContent()).includes('offline') && await f.form.locator('[data-form-fallback]').isVisible() && await f.page.evaluate(() => window.__handoffs.length) === 0);
  await f.context.setOffline(false); await f.page.evaluate(() => { window.__blocked = true; }); await f.send();
  check('popup blocked offers fallback without claiming delivery', (await f.form.locator('[data-form-status]').textContent()).includes('Unable to open') && await f.form.locator('[name=message]').inputValue() !== '');
  await f.page.evaluate(() => { window.__clipboardFails = true; }); await f.form.locator('[data-copy-message]').click();
  check('clipboard rejection offers selectable message', await f.form.locator('[data-message-preview]').isVisible() && (await f.form.locator('[data-message-preview]').inputValue()).includes('New Website Enquiry'));
  await f.page.evaluate(() => dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
  check('Back/pageshow restores submit control', await f.form.locator('[type=submit]').isEnabled());
  await f.page.evaluate(() => { window.__blocked = false; });
  await f.form.locator('[type=submit]').focus(); await f.page.keyboard.press('Enter');
  check('keyboard activation prepares a handoff', await f.page.evaluate(() => window.__handoffs.length) === 1);
  await f.context.close();
  for (const path of paths) {
    const native = await fixture(path, false);
    check(`${path}: no-JS has disabled submit, direct WhatsApp and call links`, await native.form.locator('[type=submit]').isDisabled() && await native.form.locator('a[href^="https://wa.me/"]').count() >= 1 && await native.form.locator('a[href="tel:+919354210824"]').count() === 1);
    await native.fill(); await native.form.locator('[name=phone]').press('Enter');
    check(`${path}: no-JS Enter cannot transmit form values`, new URL(native.page.url()).search === '' && native.external.length === 0);
    await native.context.close();
  }
  await mkdir('output/audit', { recursive: true });
  await writeFile('output/audit/forms.json', JSON.stringify({ passed: true, checks: results.length, flows: 12, real_submissions: 0, results }, null, 2));
  console.log(`${results.length} form checks passed; 12 desktop/mobile flows; zero real messages or calls.`);
} finally { await browser.close(); }
