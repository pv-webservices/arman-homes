// Derives web logo files from the supplied "public/website logo.jpeg" without altering its artwork.
// logo.webp          — original colours, white background removed (for light surfaces)
// logo-reversed.webp — dark lettering/blocks turned ivory, gold untouched (for navy surfaces)
// logo-mark.webp     — the reversed building mark alone (page loader on navy)
import sharp from 'sharp';

const SOURCE = 'public/website logo.jpeg';
const IVORY = [250, 246, 238];
const WHITE_TOLERANCE = 70; // distance from white over which pixels become fully opaque

const { data, info } = await sharp(SOURCE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

function derive(reversed) {
  const out = Buffer.from(data);
  for (let i = 0; i < out.length; i += 4) {
    const [r, g, b] = [out[i], out[i + 1], out[i + 2]];
    let alpha = Math.min(1, (255 - Math.min(r, g, b)) / WHITE_TOLERANCE);
    if (alpha < 0.12) alpha = 0; // drop the faint vignette so trimming is tight
    out[i + 3] = Math.round(alpha * 255);
    const neutral = Math.max(r, g, b) - Math.min(r, g, b) < 34;
    if (reversed && neutral && (r + g + b) / 3 > 150) out[i + 3] = 0; // light grey drop shadow would glow on navy
    else if (reversed && neutral) {
      // Keep the brushed texture by mapping darkness to a narrow ivory range.
      const shade = 0.82 + 0.18 * (1 - (r + g + b) / 3 / 140);
      out[i] = Math.round(IVORY[0] * shade);
      out[i + 1] = Math.round(IVORY[1] * shade);
      out[i + 2] = Math.round(IVORY[2] * shade);
    }
  }
  return sharp(out, { raw: info });
}

async function save(pipeline, file, width, extract) {
  const png = await pipeline.png().toBuffer();
  let image = sharp(png);
  if (extract) image = image.extract(extract);
  const trimmed = await image.png().toBuffer();
  await sharp(trimmed).trim({ threshold: 1 }).resize({ width }).webp({ quality: 90, alphaQuality: 90 }).toFile(file);
}

await save(derive(false), 'public/images/logo.webp', 520);
await save(derive(true), 'public/images/logo-reversed.webp', 520);
await save(derive(true), 'public/images/logo-mark.webp', 200, { left: 60, top: 170, width: 700, height: 480 });
console.log('Logo derivatives written.');
