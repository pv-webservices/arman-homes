import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const manifest = JSON.parse(await readFile(new URL('../src/data/responsive-images.json', import.meta.url), 'utf8'));
const publicPath = (src) => fileURLToPath(new URL(`../public${src}`, import.meta.url));

test('responsive manifest lists medium variants', () => {
  assert.ok(Object.keys(manifest).length > 0, 'run npm run images:responsive');
});

test('each medium variant exists, matches its declared size and is smaller than the full image', async () => {
  for (const [full, medium] of Object.entries(manifest)) {
    assert.match(medium.src, /-medium\.webp$/, `${full}: medium filename`);
    const [fullMeta, mediumMeta] = await Promise.all([sharp(publicPath(full)).metadata(), sharp(publicPath(medium.src)).metadata()]);
    assert.equal(mediumMeta.width, medium.width, `${medium.src}: declared width`);
    assert.equal(mediumMeta.height, medium.height, `${medium.src}: declared height`);
    assert.ok(medium.width < fullMeta.width, `${medium.src}: narrower than the full image`);
    const [fullBytes, mediumBytes] = await Promise.all([stat(publicPath(full)), stat(publicPath(medium.src))]);
    assert.ok(mediumBytes.size < fullBytes.size, `${medium.src}: fewer bytes than the full image`);
  }
});
