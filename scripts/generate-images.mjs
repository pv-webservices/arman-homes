// Build-time, server-side OpenAI image generation.
// Usage: node --env-file=.env scripts/generate-images.mjs [--only=name,name] [--force] [--dry-run] [--premium=name]
// The API key is read from OPENAI_API_KEY and is never written to disk or shipped to the browser.
import { mkdir, readFile, writeFile, access } from 'node:fs/promises';
import sharp from 'sharp';
import { imageConfig } from '../image-generation.config.mjs';
import { imageManifest } from './images/manifest.mjs';
import { route } from './images/router.mjs';

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, value = 'true'] = arg.replace(/^--/, '').split('=');
  return [key, value];
}));
const only = args.only ? new Set(args.only.split(',')) : null;
// --premium=name re-routes assets to Sunburst after an unsatisfactory Flare result.
const flareRejected = new Set((args.premium ?? '').split(',').filter(Boolean));
const META_FILE = 'src/data/generated-images.json';

const exists = (path) => access(path).then(() => true, () => false);

async function requestImage({ prompt, model, quality, size }) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is not set. Add it to .env (never commit it).');
  const response = await fetch(imageConfig.endpoint, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, size, quality, n: 1, output_format: 'png' }),
    signal: AbortSignal.timeout(imageConfig.timeoutMs),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`OpenAI ${response.status}: ${body?.error?.message ?? 'request failed'}`);
  const b64 = body?.data?.[0]?.b64_json;
  if (!b64) throw new Error('OpenAI response contained no image data');
  return Buffer.from(b64, 'base64');
}

async function writeDerivatives(name, orientation, source) {
  const { publicDir, webpQuality, widths } = imageConfig.output;
  const result = {};
  for (const [variant, width] of Object.entries(widths[orientation])) {
    const file = `${publicDir}/${name}${variant === 'small' ? '-small' : ''}.webp`;
    const info = await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality: webpQuality, effort: 5 }).toFile(file);
    result[variant] = { src: `/images/${name}${variant === 'small' ? '-small' : ''}.webp`, width: info.width, height: info.height, bytes: info.size };
  }
  return result;
}

async function main() {
  await mkdir(imageConfig.output.originalsDir, { recursive: true });
  await mkdir(imageConfig.output.publicDir, { recursive: true });
  const meta = (await exists(META_FILE)) ? JSON.parse(await readFile(META_FILE, 'utf8')) : {};
  const tasks = imageManifest.filter((task) => !only || only.has(task.name));
  let failures = 0;

  for (const task of tasks) {
    const routing = route({ ...task, flareRejected: flareRejected.has(task.name) });
    const original = `${imageConfig.output.originalsDir}/${task.name}.png`;
    console.log(`• ${task.name.padEnd(14)} ${routing.model} · ${routing.quality} · ${routing.size}`);
    if (args['dry-run']) continue;
    try {
      let bytes;
      if (!args.force && (await exists(original))) {
        bytes = await readFile(original);
        console.log('  reusing existing original');
      } else {
        bytes = await requestImage({ prompt: task.prompt, ...routing });
        await writeFile(original, bytes);
      }
      const derivatives = await writeDerivatives(task.name, task.orientation, bytes);
      meta[task.name] = { alt: task.alt, placement: task.placement, ...routing, ...derivatives };
      console.log(`  → ${derivatives.full.src} (${Math.round(derivatives.full.bytes / 1024)} KB), small ${Math.round(derivatives.small.bytes / 1024)} KB`);
    } catch (error) {
      failures += 1;
      console.error(`  ✗ ${task.name}: ${error.message}`);
    }
  }
  if (!args['dry-run']) await writeFile(META_FILE, JSON.stringify(meta, null, 2) + '\n');
  if (failures) process.exitCode = 1;
}

await main();
