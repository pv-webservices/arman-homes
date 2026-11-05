import test from 'node:test';
import assert from 'node:assert/strict';
import { filterProperties, properties, formatPrice } from '../src/data/properties.mjs';
const fixture = [
  { transaction: 'sale', category: 'residential', type: 'apartment', location: 'Hinjewadi', price: 9000000, bedrooms: 3 },
  { transaction: 'rent', category: 'commercial', type: 'office', location: 'Marunji', price: 40000 },
];
test('published listings are complete and uniquely addressable', () => {
  assert.equal(new Set(properties.map((p) => p.slug)).size, properties.length);
  for (const p of properties) {
    assert.match(p.slug, /^[a-z0-9-]+$/);
    assert.ok(p.title && p.location && p.description && p.images.length > 0 && p.price > 0, p.slug);
    assert.ok(['sale', 'rent'].includes(p.transaction) && ['residential', 'commercial'].includes(p.category), p.slug);
  }
});
test('filters combine transaction, category, type, location, inclusive budget and minimum bedrooms', () => {
  assert.deepEqual(filterProperties(fixture, { transaction: 'sale', category: 'residential', type: 'apartment', location: 'hinjewadi', budget: '9000000', bedrooms: '2' }), [fixture[0]]);
  assert.deepEqual(filterProperties(fixture, { budget: '8999999', bedrooms: '2' }), []);
  assert.deepEqual(filterProperties(fixture, { category: 'commercial', bedrooms: '1' }), []);
  assert.deepEqual(filterProperties(fixture, { transaction: 'rent', budget: '40000' }), [fixture[1]]);
  assert.deepEqual(filterProperties(fixture), fixture);
  assert.deepEqual(filterProperties([], { transaction: 'sale' }), []);
});
test('prices use the Indian short form from the design', () => {
  assert.equal(formatPrice({ price: 12500000, transaction: 'sale' }), '₹1.25 Cr');
  assert.equal(formatPrice({ price: 35000000, transaction: 'sale' }), '₹3.50 Cr');
  assert.equal(formatPrice({ price: 4550000, transaction: 'sale' }), '₹45.5 Lakh');
  assert.equal(formatPrice({ price: 30000, transaction: 'rent' }), '₹30,000 / Month');
  assert.equal(formatPrice({ price: 75000, transaction: 'rent' }), '₹75,000 / Month');
});
test('Life Republic rentals supplied by the client are published at their monthly rents', () => {
  const rent = (title) => properties.filter((p) => p.location === 'Life Republic' && p.transaction === 'rent' && p.title === title).map((p) => p.price);
  assert.ok(rent('1 BHK Apartment').includes(18000));
  assert.ok(rent('2 BHK Apartment').includes(22000));
  assert.ok(rent('3 BHK Apartment').includes(30000));
  assert.ok(rent('3 BHK Villa').includes(50000));
  assert.ok(rent('4 BHK Villa').includes(60000));
  assert.equal(formatPrice({ price: 18000, transaction: 'rent' }), '₹18,000 / Month');
});
test('descriptions read naturally when size or bathrooms are not yet known', () => {
  const p = properties.find((x) => x.slug === '1-bhk-apartment-for-rent-life-republic');
  assert.match(p.description, /^1 BHK Apartment in Life Republic, Pune with 1 bedroom\. Located within Life Republic, .* Available for rent/);
  assert.doesNotMatch(p.description, /undefined/);
});
test('Life Republic rentals can be found with the location filter', () => {
  assert.equal(filterProperties(properties, { location: 'Life Republic', transaction: 'rent' }).length, 5);
  assert.equal(filterProperties(properties, { location: 'life republic', type: 'villa' }).length, 2);
});
