// Listings supplied in the approved homepage design. Photography is illustrative (AI-generated):
// replace `images` with real property photos and confirm prices before launch.
const LIFE_REPUBLIC = 'Located within Life Republic, the ~400 acre integrated township by Kolte Patil near the Hinjawadi IT hub.';
const describeRooms = ({ bedrooms, bathrooms }) => {
  if (!bedrooms) return '';
  return ` with ${bedrooms} ${bedrooms === 1 ? 'bedroom' : 'bedrooms'}${bathrooms ? ` and ${bathrooms} bathrooms` : ''}`;
};
const listing = (fields) => ({
  ...fields,
  description: `${fields.title} in ${fields.location}, Pune${describeRooms(fields)}${fields.area ? `, approximately ${fields.area.toLocaleString('en-IN')} sq ft` : ''}. `
    + (fields.location === 'Life Republic' ? `${LIFE_REPUBLIC} ` : '')
    + `Available ${fields.transaction === 'rent' ? 'for rent' : 'for sale'} through Arman Homes. Contact us to confirm current availability, pricing and viewing arrangements.`,
});

export const properties = [
  listing({ id: 'p1', slug: '3-bhk-premium-apartment-hinjewadi', title: '3 BHK Premium Apartment', location: 'Hinjewadi', transaction: 'sale', category: 'residential', type: 'apartment', price: 12500000, bedrooms: 3, bathrooms: 3, area: 1400, images: [{ src: '/images/illustrations/listing-3bhk-hinjewadi.webp', alt: 'Premium residential apartment tower with glass balconies in warm evening light' }] }),
  listing({ id: 'p2', slug: '2-bhk-apartment-wakad', title: '2 BHK Apartment', location: 'Wakad', transaction: 'rent', category: 'residential', type: 'apartment', price: 30000, bedrooms: 2, bathrooms: 2, area: 1000, images: [{ src: '/images/illustrations/listing-2bhk-wakad.webp', alt: 'Furnished 2 BHK apartment living room with a sofa, dining corner and balcony doors' }] }),
  listing({ id: 'p3', slug: '4-bhk-luxury-villa-baner', title: '4 BHK Luxury Villa', location: 'Baner', transaction: 'sale', category: 'residential', type: 'villa', price: 35000000, bedrooms: 4, bathrooms: 4, area: 3200, images: [{ src: '/images/illustrations/listing-villa-baner.webp', alt: 'Two-storey contemporary luxury villa with lit interiors and a landscaped lawn at dusk' }] }),
  listing({ id: 'p4', slug: 'office-space-hinjewadi', title: 'Office Space (Commercial)', location: 'Hinjewadi', transaction: 'rent', category: 'commercial', type: 'office', price: 75000, area: 1500, images: [{ src: '/images/illustrations/listing-office-hinjewadi.webp', alt: 'Modern glass commercial office building in Hinjewadi at sunset' }] }),
  // Life Republic rentals added Nov 2026 — client supplied BHK and monthly rent only; size and tower to be confirmed.
  listing({ id: 'p5', slug: '1-bhk-apartment-for-rent-life-republic', title: '1 BHK Apartment', location: 'Life Republic', transaction: 'rent', category: 'residential', type: 'apartment', price: 18000, bedrooms: 1, images: [{ src: '/images/editorial/interior.webp', alt: 'Warm contemporary interior with natural light' }] }),
  listing({ id: 'p6', slug: '2-bhk-apartment-for-rent-life-republic', title: '2 BHK Apartment', location: 'Life Republic', transaction: 'rent', category: 'residential', type: 'apartment', price: 22000, bedrooms: 2, images: [{ src: '/images/editorial/living.webp', alt: 'Bright contemporary living space opening onto a terrace' }] }),
  listing({ id: 'p7', slug: '3-bhk-apartment-for-rent-life-republic', title: '3 BHK Apartment', location: 'Life Republic', transaction: 'rent', category: 'residential', type: 'apartment', price: 30000, bedrooms: 3, images: [{ src: '/images/illustrations/listing-3bhk-hinjewadi.webp', alt: 'Premium residential apartment tower with glass balconies in warm evening light' }] }),
  listing({ id: 'p8', slug: '3-bhk-villa-for-rent-life-republic', title: '3 BHK Villa', location: 'Life Republic', transaction: 'rent', category: 'residential', type: 'villa', price: 50000, bedrooms: 3, images: [{ src: '/images/editorial/house.webp', alt: 'Contemporary home with a pool and terrace' }] }),
  listing({ id: 'p9', slug: '4-bhk-villa-for-rent-life-republic', title: '4 BHK Villa', location: 'Life Republic', transaction: 'rent', category: 'residential', type: 'villa', price: 60000, bedrooms: 4, images: [{ src: '/images/illustrations/listing-villa-baner.webp', alt: 'Two-storey contemporary luxury villa with lit interiors and a landscaped lawn at dusk' }] }),
];

/**
 * @template {{transaction?: string, category?: string, type?: string, location?: string, price: number, bedrooms?: number}} T
 * @param {T[]} records
 * @param {Record<string, string>} filters
 * @returns {T[]}
 */
export function filterProperties(records, filters = {}) {
  return records.filter((p) => {
    for (const field of ['transaction', 'category', 'type', 'location']) {
      if (filters[field] && String(p[field]).toLowerCase() !== String(filters[field]).toLowerCase()) return false;
    }
    const max = Number(filters.budget);
    if (max > 0 && p.price > max) return false;
    const beds = Number(filters.bedrooms);
    return !(beds > 0 && (!p.bedrooms || p.bedrooms < beds));
  });
}

/**
 * Indian short form used in the design: ₹1.25 Cr, ₹45 Lakh, ₹30,000 / Month.
 * @param {{ price: number, transaction?: string }} property
 * @returns {string}
 */
export function formatPrice(property) {
  const { price } = property;
  const lakh = Number((price / 1e5).toFixed(2));
  const amount = price >= 1e7 ? `₹${(price / 1e7).toFixed(2)} Cr` : price >= 1e5 ? `₹${lakh} Lakh` : `₹${price.toLocaleString('en-IN')}`;
  return amount + (property.transaction === 'rent' ? ' / Month' : '');
}
