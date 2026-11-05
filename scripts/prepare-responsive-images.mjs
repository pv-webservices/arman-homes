// Adds a ~1200px "medium" WebP between the existing small (640–800px) and full (1536–1920px)
// derivatives, so high-DPR phones and mid-size desktop slots stop downloading the full master.
// Usage: node scripts/prepare-responsive-images.mjs
// Output: public/images/<folder>/<name>-medium.webp and src/data/responsive-images.json
//
// Source: the committed full-size WebP derivative (downscale only, never enlarged). The original
// masters stay outside public/ (see README "Asset management").
import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const FOLDERS = ['public/images/projects', 'public/images/illustrations', 'public/images/editorial'];
const MEDIUM_WIDTH = 1200;
const MIN_FULL_WIDTH = 1400; // only worth a middle step when the full image is clearly larger
const QUALITY = 78;
const MANIFEST = 'src/data/responsive-images.json';

const manifest = {};
for (const folder of FOLDERS) {
  const files = (await readdir(folder)).filter((file) => file.endsWith('.webp') && !/-(small|medium)\.webp$/.test(file)).sort();
  for (const file of files) {
    const input = path.join(folder, file);
    const { width } = await sharp(input).metadata();
    if (!width || width < MIN_FULL_WIDTH) continue;
    const output = input.replace(/\.webp$/, '-medium.webp');
    const info = await sharp(input).resize({ width: MEDIUM_WIDTH, withoutEnlargement: true }).webp({ quality: QUALITY, effort: 6, smartSubsample: true }).toFile(output);
    const src = '/' + path.relative('public', input).replaceAll('\\', '/');
    manifest[src] = { src: src.replace(/\.webp$/, '-medium.webp'), width: info.width, height: info.height };
    console.log(`${src.padEnd(52)} ${width}px -> ${info.width}px ${Math.round(info.size / 1024)} KB`);
  }
}
await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`${Object.keys(manifest).length} medium variants written; manifest ${MANIFEST}`);
