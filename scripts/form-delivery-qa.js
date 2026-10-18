async (page) => {
  const assert = (value, message) => { if (!value) throw new Error(message); };
  const checks = [];
  const base = 'http://127.0.0.1:4322';
  for (const mode of ['success', 'failure']) {
    await page.goto(base + '/contact/');
    await page.route('https://enquiry.example.test/submit', route => route.fulfill({
      status: mode === 'success' ? 200 : 503,
      contentType: 'application/json',
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ success: mode === 'success' }),
    }));
    await page.locator('[data-inquiry-form]').evaluate(form => form.dataset.endpoint = 'https://enquiry.example.test/submit');
    await page.getByLabel('Full Name', { exact: false }).fill('Local QA');
    await page.getByLabel('Phone Number', { exact: false }).fill('+91 9000000000');
    await page.getByLabel('Email Address', { exact: false }).fill('qa@example.com');
    await page.getByLabel('Inquiry Type', { exact: false }).selectOption('General Inquiry');
    await page.getByLabel('Message', { exact: false }).fill('Intercepted request. No delivery.');
    await page.locator('input[name="consent"]').check();
    await page.getByRole('button', { name: 'Prepare WhatsApp Enquiry' }).click();
    await page.waitForFunction(() => !document.querySelector('[data-inquiry-form]').hasAttribute('aria-busy'));
    const status = await page.locator('[data-form-status]').textContent();
    if (mode === 'success') {
      assert(status.includes('accepted'), 'Accepted response gives confirmation');
      assert(await page.locator('input[name="full_name"]').inputValue() === '', 'Form resets after accepted response');
    } else {
      assert(status.includes('could not be confirmed'), 'Failed response gives honest error');
      assert(await page.locator('input[name="full_name"]').inputValue() === 'Local QA', 'Failure preserves input');
    }
    assert(await page.getByRole('button', { name: 'Prepare WhatsApp Enquiry' }).isEnabled(), 'Button resets after response');
    checks.push(mode);
    await page.unroute('https://enquiry.example.test/submit');
  }
  const browser = page.context().browser();
  const noJsContext = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const noJsPage = await noJsContext.newPage();
  await noJsPage.goto(base + '/contact/');
  assert(await noJsPage.getByRole('button', { name: 'Prepare WhatsApp Enquiry' }).isDisabled(), 'No-JS form cannot accidentally submit data in a URL');
  assert(await noJsPage.getByText('JavaScript is needed to prepare this enquiry.', { exact: false }).isVisible(), 'No-JS fallback explained');
  assert(await noJsPage.getByRole('link', { name: '+91 9354210824', exact: true }).first().isVisible(), 'No-JS contact available');
  await noJsPage.goto(base);
  assert(await noJsPage.getByRole('heading', { level: 1 }).isVisible(), 'Content visible without JS');
  const missing = await noJsPage.locator('img').evaluateAll(images => images.filter(img => img.complete && !img.naturalWidth).map(img => img.src));
  assert(missing.length === 0, 'No missing loaded images');
  await noJsContext.close();
  return { passed: true, mockedRequests: checks, noLiveTransmission: true, noJavaScriptFallback: 'passed' };
}
