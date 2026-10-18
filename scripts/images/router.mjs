import { imageConfig } from '../../image-generation.config.mjs';

// Traits that justify the premium (Sunburst) model. Anything else stays on Flare.
const PREMIUM_TRAITS = new Set([
  'hero', 'photoreal-architecture', 'interior', 'people', 'multi-subject',
  'complex-lighting', 'reference-image', 'detail-sensitive', 'brand-placement',
]);

/**
 * Pick the model for a task. Flare by default; Sunburst only when the task
 * carries a premium trait or Flare already failed for an important asset.
 * @param {{ priority?: 'hero'|'key'|'supporting', traits?: string[], flareRejected?: boolean }} task
 */
export function selectModel(task, config = imageConfig) {
  const premium = task.priority === 'hero'
    || task.flareRejected === true
    || (task.traits ?? []).some((trait) => PREMIUM_TRAITS.has(trait));
  return premium ? config.models.sunburst : config.models.flare;
}

/** High for hero and key client-facing assets, medium for routine/supporting ones. */
export function selectQuality(task, config = imageConfig) {
  return task.priority === 'hero' || task.priority === 'key' ? config.quality.premium : config.quality.default;
}

/** Map a placement orientation to an API size. */
export function selectSize(task, config = imageConfig) {
  const size = config.sizes[task.orientation];
  if (!size) throw new Error(`Unknown orientation "${task.orientation}" for ${task.name}`);
  return size;
}

export function route(task, config = imageConfig) {
  return { model: selectModel(task, config), quality: selectQuality(task, config), size: selectSize(task, config) };
}
