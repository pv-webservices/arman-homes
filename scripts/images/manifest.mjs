// Every generated asset has one purpose and one placement. Do not add decorative filler.
// priority: hero | key | supporting  — drives quality.
// traits: drive model routing (see router.mjs).

const STYLE = 'Editorial architectural photography, natural believable perspective, refined restrained luxury, '
  + 'palette of deep midnight navy, warm off-white and soft champagne-gold light. Crisp material detail. '
  + 'Absolutely no text, no lettering, no signage, no logos, no watermarks, no UI. Illustrative, not a specific real property.';

export const imageManifest = [
  {
    name: 'hero',
    placement: 'Homepage hero, full-bleed background',
    orientation: 'landscape', priority: 'hero', traits: ['photoreal-architecture', 'complex-lighting'],
    alt: 'Contemporary residential towers and a modern home glowing at dusk in a green Pune suburb',
    prompt: 'Wide cinematic photograph at blue hour of a contemporary premium residential neighbourhood in the western suburbs of Pune, India. '
      + 'On the RIGHT 60% of the frame: an elegant modern mid-rise residential tower with stone-clad and glass facade, warmly lit balconies with planters, '
      + 'and in front of it a low-rise contemporary home with timber screens, large glazed openings and warm amber interior light, landscaped garden with frangipani and palms. '
      + 'The LEFT 40% is calm, uncluttered deep navy twilight sky over soft distant silhouettes of the Sahyadri hills, suitable for a text overlay. '
      + 'Faint warm horizon glow, no people, eye-level viewpoint. ' + STYLE,
  },
  {
    name: 'intent-buy',
    placement: 'Homepage "Buy" intent card (tall bento tile) and Buy Property page',
    orientation: 'portrait', priority: 'key', traits: ['photoreal-architecture', 'interior'],
    alt: 'A front door opening into a warm, light-filled contemporary home',
    prompt: 'Vertical photograph of the entrance of a contemporary Indian apartment home at golden hour: a tall solid walnut front door standing open, '
      + 'a slim brass handle, a terrazzo floor threshold and a glimpse into a bright living room with linen sofa, indoor plants and soft evening sunlight. '
      + 'Inviting, calm, sense of arriving home. No people. ' + STYLE,
  },
  {
    name: 'intent-rent',
    placement: 'Homepage "Rent" intent card and Rent Property page',
    orientation: 'portrait', priority: 'supporting', traits: ['interior'],
    alt: 'A bright, furnished contemporary apartment living room with a large window',
    prompt: 'Vertical interior photograph of a bright, tastefully furnished contemporary apartment living room in Pune, ready to move in: '
      + 'oatmeal linen sofa, rattan accent chair, oak coffee table, a navy throw, large window with sheer curtains overlooking green treetops and distant mid-rise buildings, '
      + 'soft morning daylight. No people. ' + STYLE,
  },
  {
    name: 'intent-sell',
    placement: 'Homepage "Sell" intent card and Sell Property page',
    orientation: 'square', priority: 'key', traits: [],
    alt: 'House keys passed across a table during a property conversation',
    prompt: 'Close-up photograph of two hands passing a set of brass house keys with a plain tan leather key tag across a dark walnut table, '
      + 'soft window light from the left, a closed navy notebook and a fountain pen softly out of focus. Warm, trustworthy, quiet moment. '
      + 'Only hands visible, no faces. ' + STYLE,
  },
  {
    name: 'residential-community',
    placement: 'Homepage residential tile, Residential Properties page hero and services page',
    orientation: 'landscape', priority: 'key', traits: ['photoreal-architecture'],
    alt: 'A landscaped residential apartment community with a garden courtyard in morning light',
    prompt: 'Photograph of a modern gated residential apartment community in suburban Pune in soft morning light: three elegant mid-rise towers with '
      + 'balconies and planters around a lush landscaped podium garden with a lawn, walking path, mature trees and a calm lap pool. '
      + 'A tranquil, family-friendly atmosphere, no people, slight elevated viewpoint. ' + STYLE,
  },
  {
    name: 'commercial-building',
    placement: 'Homepage commercial tile, Commercial Properties page hero and services page',
    orientation: 'landscape', priority: 'key', traits: ['photoreal-architecture'],
    alt: 'A modern glass office building with ground-floor commercial spaces in late afternoon light',
    prompt: 'Photograph of a contemporary commercial building in a modern Indian business corridor in warm late-afternoon light: '
      + 'a clean glass and light-stone facade with office floors above and double-height ground-floor retail units with blank glass shopfronts, '
      + 'a wide paved forecourt with trees, a couple of distant blurred pedestrians. ' + STYLE,
  },
  {
    name: 'consultation',
    placement: 'Homepage about section, About Us page and Contact page',
    orientation: 'landscape', priority: 'key', traits: ['people', 'multi-subject'],
    alt: 'A couple discussing a floor plan with a property advisor across a table',
    prompt: 'Natural candid photograph of a young Indian couple in smart casual clothes sitting across a light oak table from a friendly property advisor, '
      + 'reviewing a printed architectural floor plan together in a calm, modern office with warm wood, cream walls, a plant and soft window light. '
      + 'Genuine relaxed expressions, shallow depth of field, documentary feel. The paper shows only simple plan lines, no readable text. ' + STYLE,
  },
  {
    name: 'pune-horizon',
    placement: 'Homepage location band and contact call-to-action background (under a dark overlay)',
    orientation: 'landscape', priority: 'supporting', traits: [],
    alt: 'Evening view across growing western Pune suburbs toward green hills',
    prompt: 'Wide aerial photograph at dusk over a growing western Pune suburb: clusters of modern mid-rise residential towers with lit windows, tree-lined roads with light trails, '
      + 'and the green rolling Sahyadri hills on the horizon under a deep navy sky with a thin warm amber band of light. Calm, aspirational. ' + STYLE,
  },
  {
    name: 'floorplan',
    placement: 'Homepage process section and Services page process visual',
    orientation: 'square', priority: 'supporting', traits: [],
    alt: 'A hand-drawn floor plan with a pencil and house keys on a desk',
    prompt: 'Overhead flat-lay photograph of a hand-drawn architectural floor plan sketch on cream paper (simple lines only, no readable text), '
      + 'a brass key ring, a graphite pencil, a small cup of chai and a sprig of greenery on a deep navy linen surface, soft directional daylight. ' + STYLE,
  },
  // Featured listing cards (from the supplied homepage design). Illustrative photography for each listing.
  {
    name: 'listing-3bhk-hinjewadi',
    placement: 'Featured property card and detail page: 3 BHK Premium Apartment, Hinjewadi',
    orientation: 'landscape', priority: 'key', traits: ['photoreal-architecture'],
    alt: 'Premium residential apartment tower with glass balconies in warm evening light',
    prompt: 'Photograph of a premium contemporary residential apartment tower in Hinjewadi, Pune, at golden hour: 14 storeys, cream stone and glass facade, '
      + 'wide glass-railed balconies with planters, warm lights starting to glow, landscaped entrance driveway with palms in the foreground, slightly low eye-level angle, '
      + 'blue sky with soft clouds. ' + STYLE,
  },
  {
    name: 'listing-2bhk-wakad',
    placement: 'Featured property card and detail page: 2 BHK Apartment for rent, Wakad',
    orientation: 'landscape', priority: 'key', traits: ['interior'],
    alt: 'Furnished 2 BHK apartment living room with a sofa, dining corner and balcony doors',
    prompt: 'Interior photograph of a well-furnished 2 BHK apartment living room in Wakad, Pune: grey fabric L-shaped sofa, wooden coffee table, compact dining table for four, '
      + 'warm cove lighting, wooden TV unit, sliding glass doors to a balcony with city view at dusk, polished vitrified tile floor. Inviting, ready to move in. No people. ' + STYLE,
  },
  {
    name: 'listing-villa-baner',
    placement: 'Featured property card and detail page: 4 BHK Luxury Villa, Baner',
    orientation: 'landscape', priority: 'key', traits: ['photoreal-architecture', 'complex-lighting'],
    alt: 'Two-storey contemporary luxury villa with lit interiors and a landscaped lawn at dusk',
    prompt: 'Photograph of a two-storey contemporary luxury villa in Baner, Pune, at dusk: flat roof planes with warm edge lighting, large glazed openings glowing amber, '
      + 'stone and timber cladding, a manicured lawn with palms and garden lights, a short stone driveway, deep blue twilight sky. No people. ' + STYLE,
  },
  {
    name: 'listing-office-hinjewadi',
    placement: 'Featured property card and detail page: Office Space (Commercial) for rent, Hinjewadi',
    orientation: 'landscape', priority: 'key', traits: ['photoreal-architecture'],
    alt: 'Modern glass commercial office building in Hinjewadi at sunset',
    prompt: 'Photograph of a modern glass-curtain-wall commercial office building in the Hinjewadi IT district of Pune at sunset: blue-tinted glass reflecting the warm sky, '
      + 'interior office floors softly lit, landscaped forecourt with trees, viewed from street level at a slight angle. ' + STYLE,
  },
];
