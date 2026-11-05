// Test the actual .htaccess using the isolated loopback Apache container, including TLS.
import http from 'node:http';
import https from 'node:https';
import assert from 'node:assert/strict';
import { readFile, readdir, writeFile } from 'node:fs/promises';
const results = [];
const request = (path, tls = true, host = 'armanhomes.in', method = 'GET') => new Promise((resolve, reject) => {
  const req = (tls ? https : http).request({ hostname: '127.0.0.1', port: tls ? 8448 : 8088, path, method, headers: { Host: host }, rejectUnauthorized: false, servername: 'armanhomes.in' }, res => {
    let body = ''; res.setEncoding('utf8'); res.on('data', chunk => { body += chunk; });
    res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
  });
  req.on('error', reject); req.setTimeout(15000, () => req.destroy(new Error('Timeout'))); req.end();
});
const check = (name, ok) => { assert.ok(ok, name); results.push(name); };
for (const [path, tls, host, target] of [
  ['/', false, 'armanhomes.in', '/'], ['/', true, 'www.armanhomes.in', '/'],
  ['/contact?qa=one%20two', false, 'www.armanhomes.in', '/contact/?qa=one%20two'],
  ['/contact?qa=1', true, 'armanhomes.in', '/contact/?qa=1'],
  ['/index.html?qa=1', false, 'www.armanhomes.in', '/?qa=1'],
  ['/contact/index.html?qa=1', true, 'www.armanhomes.in', '/contact/?qa=1'],
  ['/projects/echoes?qa=1', false, 'www.armanhomes.in', '/projects/echoes/?qa=1'],
]) {
  const res = await request(path, tls, host);
  check(`${tls ? 'HTTPS' : 'HTTP'} ${host}${path}: single permanent redirect`, res.status === 301 && res.headers.location === 'https://armanhomes.in' + target);
  const final = await request(target);
  check(`${target}: redirect target returns 200 without loop`, final.status === 200 && !final.headers.location);
}
for (const path of ['/stage1-missing/', '/nested/stage1-missing/', '/thank-you/', '/source-files/brand/website-logo.jpeg']) {
  const res = await request(path);
  check(`${path}: actual branded 404`, res.status === 404 && res.body.includes('<h1>Page Not Found</h1>') && res.body.includes('noindex, follow') && !res.body.includes('rel="canonical"') && res.body.includes('tel:+919354210824') && res.body.includes('https://wa.me/919354210824'));
}
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const pages = [...sitemap.matchAll(/<loc>https:\/\/armanhomes\.in([^<]*)<\/loc>/g)].map(match => match[1]);
for (const path of pages) {
  const res = await request(path);
  check(`${path}: canonical content and security headers`, res.status === 200 && res.headers['x-content-type-options'] === 'nosniff' && res.headers['referrer-policy'] === 'strict-origin-when-cross-origin' && res.headers['x-frame-options'] === 'SAMEORIGIN');
}
const files = (await readdir('dist', { recursive: true })).filter(file => !file.endsWith('.htaccess'));
let resources = 0;
for (const file of files) {
  if (!/\.[a-z0-9]+$/i.test(file)) continue;
  const urlPath = '/' + file.replaceAll('\\', '/').replace(/(^|\/)index\.html$/, '$1');
  const res = await request(urlPath, true, 'armanhomes.in', 'HEAD');
  check(`${file}: resource responds 200`, res.status === 200); resources++;
  if (file.endsWith('.webmanifest')) check('manifest content type', res.headers['content-type']?.startsWith('application/manifest+json'));
  if (/favicon.*\.png|apple-touch-icon\.png/.test(file)) check(`${file}: PNG content type`, res.headers['content-type'] === 'image/png');
  if (file.endsWith('favicon.svg')) check('SVG content type', res.headers['content-type'] === 'image/svg+xml');
  if (file.endsWith('favicon.ico')) check('ICO content type', /image\/(x-icon|vnd.microsoft.icon)/.test(res.headers['content-type']));
}
await writeFile('output/stage1/apache.json', JSON.stringify({ passed: true, checks: results.length, pages: pages.length, resources, results }, null, 2));
console.log(`${results.length} Apache checks passed; ${pages.length} content pages and ${resources} public resources.`);
