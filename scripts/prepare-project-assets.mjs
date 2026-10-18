// Turns brochure renders (extracted by scripts/extract-pdfs.py) into web images.
// Usage: node scripts/prepare-project-assets.mjs
// Output: public/images/projects/<name>.webp + <name>-small.webp and src/data/project-images.json
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const X = 'output/pdf-extract';
const OUT = 'public/images/projects';
const FULL = 1920;
const SMALL = 800;

// crop: [left, top, width, height] in source pixels, for flattened brochure pages with text bands.
const assets = [
  // Canvas — D Tower
  { name: 'canvas-towers', src: `${X}/tower-c/images/p04-x95-1655x1213.png`, alt: 'Canvas high-rise towers at Life Republic rising above landscaped podium gardens' },
  { name: 'canvas-pool', src: `${X}/tower-c/images/p05-x100-1662x832.png`, alt: 'Canvas infinity-edge lap pool with palms and township views' },
  { name: 'canvas-lawn', src: `${X}/tower-c/images/p06-x112-1653x827.png`, alt: 'Canvas multipurpose lawn and terraced landscape at dusk' },
  { name: 'canvas-living', src: `${X}/tower-c/images/p07-x117-1653x827.png`, alt: 'Canvas living and dining room interior' },
  { name: 'canvas-deck', src: `${X}/tower-c/images/p08-x122-1659x934.png`, alt: 'Canvas long balcony deck overlooking the city lights' },
  // Qrious
  { name: 'qrious-towers', src: `${X}/life-republic-r-14-qrious-phase-ii-flipchart/images/p03-x44-1693x1181.png`, alt: 'Qrious residential towers at Life Republic' },
  { name: 'qrious-club', src: `${X}/life-republic-r-14-qrious-phase-ii-flipchart/images/p04-x49-2174x1087.png`, alt: 'The Q Club entrance with landscaped water feature' },
  { name: 'qrious-pool', src: `${X}/life-republic-r-14-qrious-phase-ii-flipchart/images/p05-x54-2218x1109.png`, alt: 'Qrious swimming pool beside the clubhouse' },
  { name: 'qrious-cabana', src: `${X}/life-republic-r-14-qrious-phase-ii-flipchart/images/p06-x59-2267x1134.png`, alt: 'Poolside cabana with loungers at Qrious' },
  { name: 'qrious-kids', src: `${X}/life-republic-r-14-qrious-phase-ii-flipchart/images/p07-x64-2232x1116.png`, alt: 'Aerial view of the Qrious kids’ play area' },
  { name: 'qrious-living', src: `${X}/life-republic-r-14-qrious-phase-ii-flipchart/images/p89-x572-2293x1290.png`, alt: 'Qrious sample living room with city view' },
  // Duet (flattened pages: crop away text overlays and caption bands)
  { name: 'duet-towers', src: `${X}/life-republic-r-34-duet-phase-ii-flipchart-octob/images/p04-x143-2481x1754.png`, crop: [0, 0, 1160, 1754], alt: 'Duet towers at Life Republic against a sunset sky' },
  { name: 'duet-pavilion', src: `${X}/life-republic-r-34-duet-phase-ii-flipchart-octob/images/p05-x147-2481x1754.png`, crop: [0, 0, 2481, 1600], alt: 'Duet outdoor workstation pavilion among gardens' },
  { name: 'duet-stargazing', src: `${X}/life-republic-r-34-duet-phase-ii-flipchart-octob/images/p06-x151-2481x1754.png`, crop: [0, 0, 2481, 1600], alt: 'Duet star-gazing deck with a telescope at night' },
  { name: 'duet-skating', src: `${X}/life-republic-r-34-duet-phase-ii-flipchart-octob/images/p07-x155-2481x1754.png`, crop: [0, 0, 2481, 1600], alt: 'Duet skating rink surrounded by greenery' },
  // Echoes
  { name: 'echoes-towers', src: `${X}/echoes/images/p04-x97-1819x1287.png`, alt: 'Echoes towers at Life Republic at sunset' },
  { name: 'echoes-entrance', src: `${X}/echoes/images/p05-x101-1819x912.png`, alt: 'Echoes entrance plaza and retail frontage' },
  { name: 'echoes-pool', src: `${X}/echoes/images/p06-x105-1819x912.png`, alt: 'Echoes swimming pool with palms' },
  { name: 'echoes-kids', src: `${X}/echoes/images/p07-x109-1819x912.png`, alt: 'Echoes kids’ play area beside the towers' },
  { name: 'echoes-living', src: `${X}/echoes/images/p08-x113-1819x912.png`, alt: 'Echoes living and dining interior' },
  // Township
  { name: 'township-aerial', src: `${X}/tower-c/images/p53-x531-2411x1361.png`, alt: 'Bird’s-eye view of the Life Republic township' },
  { name: 'township-tulips', src: `${X}/launching-echoes-at-life-republic-by-kolte-patil/images/p21-x669-4695x3134.png`, width: 1600, quality: 72, alt: 'Tulip sculptures along a landscaped boulevard at Life Republic' },
  { name: 'township-roundabout', src: `${X}/launching-echoes-at-life-republic-by-kolte-patil/images/p22-x670-5450x3062.png`, width: 1600, quality: 72, alt: 'Aerial view of a green roundabout inside Life Republic' },
  { name: 'township-school', src: `${X}/launching-echoes-at-life-republic-by-kolte-patil/images/p23-x673-2400x1348.png`, alt: 'School campus and playing fields within the township' },
  { name: 'township-master-layout', src: `${X}/life-republic-400-acres-integrated-township-mast/images/p01-x32-4950x3510.png`, alt: 'Life Republic ~400 acre township master layout', fit: 'contain' },
];

await mkdir(OUT, { recursive: true });
const meta = {};
for (const asset of assets) {
  let base = sharp(asset.src, { limitInputPixels: false }).rotate();
  if (asset.crop) {
    const [left, top, width, height] = asset.crop;
    base = base.extract({ left, top, width, height });
  }
  // Normalise colour (some renders carry ProPhoto profiles) and flatten transparency.
  const source = await base.toColourspace('srgb').flatten({ background: '#ffffff' }).png().toBuffer();
  const result = {};
  for (const [variant, width] of [['full', asset.width ?? FULL], ['small', SMALL]]) {
    const file = `${OUT}/${asset.name}${variant === 'small' ? '-small' : ''}.webp`;
    const info = await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality: variant === 'small' ? 76 : (asset.quality ?? 80), effort: 5 }).toFile(file);
    result[variant] = { src: file.replace('public', ''), width: info.width, height: info.height, bytes: info.size };
  }
  meta[asset.name] = { alt: asset.alt, credit: 'Artist’s impression — Life Republic by Kolte Patil brochure', ...result };
  console.log(`${asset.name.padEnd(24)} ${result.full.width}×${result.full.height} ${Math.round(result.full.bytes / 1024)} KB / ${Math.round(result.small.bytes / 1024)} KB`);
}
// Location map (rendered from its vector PDF by scripts/prepare-brochures.py) and the film poster frame.
const extras = [
  { name: 'location-map', src: 'output/location-map.png', widths: [1600, 800], alt: 'Life Republic location map showing road connectivity to Hinjawadi, Wakad and the Mumbai–Pune highway', credit: 'Life Republic by Kolte Patil' },
  { name: 'film-poster', src: 'output/loop-poster.png', widths: [848], alt: 'Aerial view of Life Republic township towers', credit: 'Life Republic film' },
];
for (const extra of extras) {
  const [fullWidth, smallWidth] = extra.widths;
  const full = await sharp(extra.src).resize({ width: fullWidth }).webp({ quality: 80 }).toFile(`${OUT}/${extra.name}.webp`);
  const small = smallWidth ? await sharp(extra.src).resize({ width: smallWidth }).webp({ quality: 76 }).toFile(`${OUT}/${extra.name}-small.webp`) : full;
  meta[extra.name] = {
    alt: extra.alt, credit: extra.credit,
    full: { src: `/images/projects/${extra.name}.webp`, width: full.width, height: full.height },
    small: { src: `/images/projects/${extra.name}${smallWidth ? '-small' : ''}.webp`, width: small.width, height: small.height },
  };
}
await writeFile('src/data/project-images.json', JSON.stringify(meta, null, 2) + '\n');
