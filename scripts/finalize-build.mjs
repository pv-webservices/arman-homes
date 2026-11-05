import { readdir, readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import path from 'node:path';

const origin = 'https://armanhomes.in';
const files = await readdir('dist', { recursive: true });
const text = (await Promise.all(files.filter(file => /\.(html|css|js|xml|webmanifest)$/.test(file)).map(file => readFile(path.join('dist', file), 'utf8')))).join('\n');
const pruned = [];
for (const file of await readdir('dist/images', { recursive: true })) {
  if (!/\.(webp|avif|png|jpe?g)$/.test(file)) continue;
  if (text.includes('/images/' + file.replaceAll('\\', '/'))) continue;
  await rm(path.join('dist/images', file));
  pruned.push(file);
}
await mkdir('output/audit', { recursive: true });
await writeFile('output/audit/pruned-images.json', JSON.stringify({ count: pruned.length, files: pruned }, null, 2));
const pages = [];
for (const file of files.filter(file => file.endsWith('.html'))) {
  const html = await readFile(path.join('dist', file), 'utf8');
  if (!/<meta name="robots" content="index, follow, max-image-preview:large"/.test(html)) continue;
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  if (!canonical?.startsWith(origin + '/')) throw new Error(`Missing production canonical: ${file}`);
  pages.push(canonical);
}
// No reliable per-page publication dates exist; omit optional lastmod rather than use checkout times.
const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.sort().map(url => `<url><loc>${escape(url)}</loc></url>`).join('')}</urlset>`);
await writeFile('dist/sitemap-index.xml', `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${origin}/sitemap.xml</loc></sitemap></sitemapindex>`);
console.log(`Sitemap index generated for ${pages.length} indexable pages.`);
