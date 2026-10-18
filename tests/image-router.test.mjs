import test from 'node:test';
import assert from 'node:assert/strict';
import { route, selectModel } from '../scripts/images/router.mjs';
import { imageManifest } from '../scripts/images/manifest.mjs';
import { imageConfig } from '../image-generation.config.mjs';

const { flare, sunburst } = imageConfig.models;

test('hero imagery routes to Sunburst at premium quality, landscape', () => {
  assert.deepEqual(route({ name: 'h', priority: 'hero', orientation: 'landscape' }), { model: sunburst, quality: 'high', size: '1536x1024' });
});

test('simple supporting imagery stays on Flare at default quality', () => {
  assert.deepEqual(route({ name: 's', priority: 'supporting', orientation: 'square', traits: [] }), { model: flare, quality: 'medium', size: '1024x1024' });
});

test('premium traits or a rejected Flare result escalate to Sunburst', () => {
  assert.equal(selectModel({ priority: 'supporting', traits: ['interior'] }), sunburst);
  assert.equal(selectModel({ priority: 'supporting', traits: ['people'] }), sunburst);
  assert.equal(selectModel({ priority: 'key', traits: [], flareRejected: true }), sunburst);
  assert.equal(selectModel({ priority: 'key', traits: [] }), flare);
});

test('unknown orientation is rejected', () => {
  assert.throws(() => route({ name: 'x', orientation: 'panorama' }), /Unknown orientation/);
});

test('manifest stays purposeful: unique names, placement, alt text, at most 15 assets', () => {
  assert.ok(imageManifest.length <= 15);
  assert.equal(new Set(imageManifest.map((t) => t.name)).size, imageManifest.length);
  for (const task of imageManifest) {
    assert.ok(task.placement && task.alt && task.prompt, task.name);
    assert.doesNotThrow(() => route(task));
  }
});
