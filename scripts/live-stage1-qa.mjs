// Read-only public HTTP/DNS inspection; never activates enquiries or contacts providers.
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { resolveNs, resolve4 } from 'node:dns/promises';

const origin = 'https://armanhomes.in';
const results = [];
const inspect = async (url, method = 'GET') => {
  try {
    const response = await fetch(url, { method, redirect: 'manual', signal: AbortSignal.timeout(15000) });
    const html = method === 'GET' ? await response.text() : '';
    return { url, status: response.status, location: response.headers.get('location'), contentType: response.headers.get('content-type'), headers: Object.fromEntries(['server','x-content-type-options','referrer-policy','x-frame-options','cache-control'].map(key => [key, response.headers.get(key)])),
      ...(html ? { canonical: html.match(/rel="canonical" href="([^"]+)"/)?.[1], robots: html.match(/name="robots" content="([^"]+)"/)?.[1], emailForm: /formsubmit\.co|emailjs|smtp/i.test(html), h1: html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1], ...(url.endsWith('.xml') || url.endsWith('.txt') ? { body: html } : {}) } : {}) };
  } catch (error) { return { url, error: error.message }; }
};
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const pages = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
for (let i = 0; i < pages.length; i += 4) results.push(...await Promise.all(pages.slice(i, i + 4).map(url => inspect(url))));
const variants = ['http://armanhomes.in/', 'https://www.armanhomes.in/', 'http://www.armanhomes.in/contact?qa=1', origin + '/index.html?qa=1', origin + '/contact', origin + '/contact/index.html?qa=1', origin + '/stage1-missing/', origin + '/nested/stage1-missing/', origin + '/thank-you/', origin + '/robots.txt', origin + '/sitemap.xml', origin + '/sitemap-index.xml'];
for (let i = 0; i < variants.length; i += 4) results.push(...await Promise.all(variants.slice(i, i + 4).map(url => inspect(url))));
const files = (await readdir('dist', { recursive: true })).filter(file => /favicon|apple-touch-icon|site\.webmanifest/.test(file));
const icons = await Promise.all(files.map(file => inspect(origin + '/' + file.replaceAll('\\', '/'), 'HEAD')));
const report = { checkedAt: new Date().toISOString(), ns: await resolveNs('armanhomes.in'), a: await resolve4('armanhomes.in'), pageCount: pages.length, results, icons };
await mkdir('output/stage1', { recursive: true });
await writeFile('output/stage1/live.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
