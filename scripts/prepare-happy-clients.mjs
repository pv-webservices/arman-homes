// Crops the client handover photos (tall phone shots) to 4:5 portraits and writes WebP derivatives.
// Usage: node scripts/prepare-happy-clients.mjs [sourceDir]   (default: source-assets/happy-clients)
import { mkdir } from 'node:fs/promises';
import sharp from 'sharp';

const SOURCE_DIR = process.argv[2] ?? 'source-assets/happy-clients';
const OUT_DIR = 'public/images/happy-clients';
const RATIO = 5 / 4; // height / width
const SIZES = [['', 720], ['-small', 480]];
// Top edge of the crop as a fraction of the photo's height, chosen so faces and the handover stay in frame.
const CROP_TOP = { 1: 0.27, 2: 0.29, 3: 0.3, 4: 0.24, 5: 0.28, 6: 0.19 };

await mkdir(OUT_DIR, { recursive: true });
for (const [n, topFraction] of Object.entries(CROP_TOP)) {
  const input = `${SOURCE_DIR}/happy-client-${n}.jpeg`;
  const { width, height } = await sharp(input).rotate().metadata();
  const cropHeight = Math.min(height, Math.round(width * RATIO));
  const top = Math.min(height - cropHeight, Math.round(height * topFraction));
  for (const [suffix, outWidth] of SIZES) {
    await sharp(input)
      .rotate()
      .extract({ left: 0, top, width, height: cropHeight })
      .resize(outWidth, Math.round(outWidth * RATIO))
      .webp({ quality: 80 })
      .toFile(`${OUT_DIR}/happy-client-${n}${suffix}.webp`);
  }
  console.log(`Prepared happy-client-${n} (crop top ${top}px of ${height}px)`);
}
