// Central configuration for build-time AI image generation.
// Server-side only: read by scripts/generate-images.mjs under Node. Never import from src/.
// The API key is never stored here; it is read from process.env.OPENAI_API_KEY at run time.

export const imageConfig = {
  endpoint: 'https://api.openai.com/v1/images/generations',
  models: {
    // Default: standard, supporting and lower-complexity imagery.
    flare: process.env.IMAGE_MODEL_FLARE || 'gpt-image-2.5-flare',
    // Premium: hero, photoreal architecture/interiors, people, complex scenes.
    sunburst: process.env.IMAGE_MODEL_SUNBURST || 'gpt-image-2.5-sunburst',
  },
  quality: {
    default: process.env.IMAGE_QUALITY_DEFAULT || 'medium',
    premium: process.env.IMAGE_QUALITY_PREMIUM || 'high',
  },
  sizes: {
    square: '1024x1024',
    landscape: '1536x1024',
    portrait: '1024x1536',
  },
  // Optimised WebP derivatives written to public/images/.
  output: {
    originalsDir: 'output/imagegen',
    publicDir: 'public/images',
    webpQuality: 80,
    // Widths for the full and small (mobile) derivatives, per orientation. Never upscaled.
    widths: {
      landscape: { full: 1536, small: 768 },
      portrait: { full: 1024, small: 640 },
      square: { full: 1024, small: 640 },
    },
  },
  timeoutMs: 180_000,
};
