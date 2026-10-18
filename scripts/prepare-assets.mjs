import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
const photos = {
  house: 'photo-1600596542815-ffad4c1539a9',
  living: 'photo-1600210492486-724fe5c67fb0',
  interior: 'photo-1600607687920-4e2a09cf159d',
  residential: 'photo-1600585154340-be6161a56a0c',
  office: 'photo-1497366754035-f200968a6e72',
  skyline: 'photo-1519501025264-65ba15a82390',
};
await mkdir('public/images', { recursive: true });
const sources = [];
for (const [name, id] of Object.entries(photos)) {
  const url = `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1800&q=85`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${name}: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  for (const [suffix, width] of [['', 1600], ['-small', 640]]) {
    await sharp(bytes).resize(width, Math.round(width * 2 / 3), { fit: 'cover' }).webp({ quality: 82 }).toFile(`public/images/${name}${suffix}.webp`);
  }
  sources.push({ name, url, license: 'https://unsplash.com/license', usage: 'Illustrative editorial architecture; not Arman Homes inventory or a claim of geographic location.' });
  console.log(`Prepared ${name}`);
}
await sharp('public/website logo.jpeg').trim({ threshold: 35 }).resize({ width: 600 }).webp({ quality: 90 }).toFile('public/images/logo.webp');
sources.push({ name: 'hero', source: 'Built-in Imagegen', prompt: 'HERO-PROMPT.md', usage: 'AI-generated illustrative architecture, not a genuine listed property. Existing hero assets are retained by this script.' });
await writeFile('ASSET-SOURCES.json', JSON.stringify(sources, null, 2) + '\n');
