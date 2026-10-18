import generated from './generated-images.json';
import projectImages from './project-images.json';

export type ImageAsset = { src: string; small: string; smallWidth: number; width: number; height: number; alt: string };

// Licensed Unsplash photography (see ASSET-SOURCES.json); 1600×1067 full, 640×427 small.
const photography: Record<string, string> = {
  house: 'Contemporary home with a pool and terrace',
  living: 'Bright contemporary living space opening onto a terrace',
  interior: 'Warm contemporary interior with natural light',
  residential: 'Modern home and garden in soft daylight',
  office: 'Modern open-plan office interior',
  skyline: 'City skyline at dusk',
};

const assets: Record<string, ImageAsset> = Object.fromEntries(
  Object.entries(photography).map(([name, alt]) => [name, { src: `/images/${name}.webp`, small: `/images/${name}-small.webp`, smallWidth: 640, width: 1600, height: 1067, alt }]),
);

for (const [name, meta] of Object.entries({ ...generated, ...projectImages } as Record<string, { alt: string; full: { src: string; width: number; height: number }; small: { src: string; width: number } }>)) {
  assets[name] = { src: meta.full.src, small: meta.small.src, smallWidth: meta.small.width, width: meta.full.width, height: meta.full.height, alt: meta.alt };
}

export function image(name: string): ImageAsset {
  const asset = assets[name];
  if (!asset) throw new Error(`Unknown image "${name}"`);
  return asset;
}
