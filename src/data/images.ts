import generated from './generated-images.json';
import projectImages from './project-images.json';
import responsive from './responsive-images.json';

type Variant = { src: string; width: number };
export type ImageAsset = { src: string; small: string; smallWidth: number; medium?: Variant; width: number; height: number; alt: string };

// Medium (~1200px) variants produced by scripts/prepare-responsive-images.mjs, keyed by full-size src.
const mediumBySrc = responsive as Record<string, Variant>;

// Licensed Unsplash photography (see docs/ASSET-SOURCES.json); 1600×1067 full, 640×427 small.
const photography: Record<string, string> = {
  house: 'Contemporary home with a pool and terrace',
  living: 'Bright contemporary living space opening onto a terrace',
  interior: 'Warm contemporary interior with natural light',
  residential: 'Modern home and garden in soft daylight',
  office: 'Modern open-plan office interior',
  skyline: 'City skyline at dusk',
};

const withMedium = (asset: Omit<ImageAsset, 'medium'>): ImageAsset => ({ ...asset, medium: mediumBySrc[asset.src] });

const assets: Record<string, ImageAsset> = Object.fromEntries(
  Object.entries(photography).map(([name, alt]) => [name, withMedium({ src: `/images/editorial/${name}.webp`, small: `/images/editorial/${name}-small.webp`, smallWidth: 640, width: 1600, height: 1067, alt })]),
);

for (const [name, meta] of Object.entries({ ...generated, ...projectImages } as Record<string, { alt: string; full: { src: string; width: number; height: number }; small: { src: string; width: number } }>)) {
  assets[name] = withMedium({ src: meta.full.src, small: meta.small.src, smallWidth: meta.small.width, width: meta.full.width, height: meta.full.height, alt: meta.alt });
}

export function image(name: string): ImageAsset {
  const asset = assets[name];
  if (!asset) throw new Error(`Unknown image "${name}"`);
  return asset;
}

/** Look up an asset by its full-size src (property records store paths, not names). */
export function imageBySrc(src: string): ImageAsset | undefined {
  return Object.values(assets).find((asset) => asset.src === src);
}

/** srcset with every available width: small, optional medium, full. */
export function srcsetFor(asset: ImageAsset): string {
  return [`${asset.small} ${asset.smallWidth}w`, asset.medium && `${asset.medium.src} ${asset.medium.width}w`, `${asset.src} ${asset.width}w`].filter(Boolean).join(', ');
}
