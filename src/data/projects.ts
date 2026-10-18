// Life Republic projects showcased by Arman Homes.
// Sources: content supplied by Arman Homes (Oct 2026) and the developer brochures in source-assets/pdfs.
// Prices are "starting" / tentative figures as supplied; always confirm the current price sheet.

export type Configuration = { type: string; area: string; price: string; note?: string };
export type Project = {
  slug: string;
  name: string;
  status: string;
  tagline: string;
  intro: string[];
  homes: string;
  startingPrice: string;
  stats: { value: string; label: string }[];
  configurations: Configuration[];
  pricingNote?: string;
  highlights: string[];
  amenities: string[];
  hero: string;
  card: string;
  gallery: string[];
  rera?: string;
  brochure?: { href: string; size: string };
  offer?: string;
};

export const township = {
  name: 'Life Republic',
  developer: 'Kolte Patil',
  location: 'Life Republic, Near Hinjawadi, Pune',
  stats: [
    { value: '400+', label: 'Acre integrated township' },
    { value: '30,000+', label: 'Residents' },
    { value: '4', label: 'Featured projects' },
    { value: '2–3.5', label: 'BHK residences' },
  ],
  landmarks: [
    ['Indira Institute of Management', '~13 mins'],
    ['D Y Patil University', '~18 mins'],
    ['Phoenix Mall of the Millennium', '~21 mins'],
    ['Balewadi Stadium', '~22 mins'],
  ],
  nearby: [
    { title: 'Schools', icon: 'school', items: ['Crimson Anisha Global School', 'Indira International School', 'Akshara International School', 'Vibgyor School', 'Mahindra International School'] },
    { title: 'IT Parks', icon: 'office', items: ['TCS', 'Wipro', 'Infosys', 'Embassy Tech Zone', 'Quadron Business Park'] },
    { title: 'Shopping', icon: 'bag', items: ['Phoenix Mall of the Millennium', 'Elpro City Square Mall', 'Grand High Street Mall', 'Xion Mall Hinjawadi', 'Balewadi High Street'] },
    { title: 'Healthcare', icon: 'heart', items: ['Aditya Birla Hospital', 'Sahyadri Hospital', 'Surya Mother & Child Hospital', 'Life Point Hospital', 'Apollo Clinic'] },
  ],
  masterLayout: { href: '/brochures/life-republic-master-layout.pdf', size: '10.6 MB' },
};

export const projects: Project[] = [
  {
    slug: 'canvas-d-tower',
    name: 'Canvas – D Tower',
    status: 'The Last Tower',
    tagline: 'The last tower. The highest experience.',
    intro: [
      'A premium address designed for those who desire space, views and elevated living. Canvas – D Tower is the final tower of Canvas at Life Republic, rising 35 storeys to approximately 120 metres.',
      'Expect unobstructed city and township views, 40% open spaces and premium amenities — including a ~38 m infinity-edge lap pool, a multipurpose lawn and balcony decks of 25 to 33 feet.',
    ],
    homes: '3 & 3.5 BHK',
    startingPrice: '₹1.61 Cr',
    stats: [
      { value: '35', label: 'Storeys' },
      { value: '~120 m', label: 'Tower height' },
      { value: '40%', label: 'Open spaces' },
      { value: '6+', label: 'Acre project' },
    ],
    configurations: [
      { type: '3 BHK', area: '1,332 sq. ft.', price: '₹1.61 Cr' },
      { type: '3 BHK', area: '1,452 sq. ft.', price: '₹1.75 Cr' },
      { type: '3.5 BHK', area: '1,495 sq. ft.', price: '₹1.86 Cr' },
      { type: '3.5 BHK', area: '1,700 sq. ft.', price: '₹2.15 Cr*' },
    ],
    pricingNote: 'Tentative pricing. *Subject to change.',
    highlights: ['Unobstructed city & township views', '~120 m high-rise, 35 habitable floors', '40% open spaces', '~20,000 sq. ft. covered amenities', '~2.75 acres of open amenities', '25–33 ft long balcony decks'],
    amenities: ['Infinity-edge lap pool', 'Multipurpose lawn', 'Landscaped podium', 'Clubhouse', 'Kids’ play areas', 'Fitness & wellness'],
    hero: 'canvas-towers',
    card: 'canvas-towers',
    gallery: ['canvas-towers', 'canvas-pool', 'canvas-deck', 'canvas-lawn', 'canvas-living'],
    rera: 'PM1260002501184',
    brochure: { href: '/brochures/canvas-life-republic.pdf', size: '25 MB' },
  },
  {
    slug: 'qrious',
    name: 'Qrious',
    status: 'Now Launching',
    tagline: '2 & 3 BHK spacious homes at Life Republic.',
    intro: [
      'Discover a premium lifestyle in a thoughtfully designed community spread across 7.58 acres. Five iconic towers of G+25/26 floors, with only eight apartments per floor for enhanced privacy.',
      'Modern, spacious layouts crafted for urban living, 40+ lifestyle amenities including The Q Club, and seamless connectivity at Life Republic, Hinjawadi.',
    ],
    homes: '2 & 3 BHK',
    startingPrice: '₹89 Lakh',
    stats: [
      { value: '7.58', label: 'Acres' },
      { value: '5', label: 'Iconic towers' },
      { value: 'G+25/26', label: 'Floors' },
      { value: '8', label: 'Apartments per floor' },
    ],
    configurations: [
      { type: '2 BHK Large', area: '813 sq. ft.', price: '₹89 Lakh' },
      { type: '2 BHK Lux', area: '900 sq. ft.', price: '₹97 Lakh' },
      { type: '3 BHK Large', area: '1,116 sq. ft.', price: '₹1.23 Cr' },
      { type: '3 BHK Lux', area: '1,231 sq. ft.', price: '₹1.38 Cr' },
    ],
    pricingNote: 'Starting prices.',
    highlights: ['5 high-speed elevators', 'Only 8 apartments per floor', 'Modern, spacious layouts', '40+ lifestyle amenities', 'The Q Club', 'Seamless connectivity to Hinjawadi'],
    amenities: ['The Q Club', 'Swimming pool', 'Poolside cabanas', 'Kids’ play area', 'Landscaped gardens', 'Clubhouse'],
    hero: 'qrious-club',
    card: 'qrious-towers',
    gallery: ['qrious-towers', 'qrious-club', 'qrious-pool', 'qrious-cabana', 'qrious-kids', 'qrious-living'],
    brochure: { href: '/brochures/qrious-life-republic.pdf', size: '8.7 MB' },
  },
  {
    slug: 'echoes',
    name: 'Echoes',
    status: 'New Launch',
    tagline: 'Where every day becomes a core memory.',
    intro: [
      'A place where childhood slows down and life feels lighter. Echoes offers 2 & 2.5 BHK timeless homes near the Hinjawadi IT hub, as part of the 400+ acre Life Republic township.',
      'Clear private and shared spaces, an extra room for study or passions, and expansive planning with natural light and ventilation — all within a thriving 30,000+ resident community with schools, malls and IT parks nearby.',
    ],
    homes: '2 & 2.5 BHK',
    startingPrice: '₹85 Lakh',
    stats: [
      { value: '~5.89', label: 'Acre project' },
      { value: '40+', label: 'Amenities across 3 levels' },
      { value: '2', label: 'Clubhouses' },
      { value: '400+', label: 'Acre township' },
    ],
    configurations: [
      { type: '2 BHK', area: '837 sq. ft.', price: '₹85 Lakh onwards' },
      { type: '2.5 BHK', area: '963 sq. ft.', price: '₹1.05 Cr onwards' },
    ],
    highlights: ['Clear private & shared spaces', 'Extra room for study or passions', 'Natural light & ventilation', 'Senior zones & reflexology paths', 'Kids’ play areas', 'Sports & wellness spaces'],
    amenities: ['2 clubhouses', 'Swimming pool & kids’ pool', 'Senior pavilions', 'Toddler & kids’ zones', 'Sports areas', 'Meditation spaces'],
    hero: 'echoes-towers',
    card: 'echoes-towers',
    gallery: ['echoes-towers', 'echoes-pool', 'echoes-entrance', 'echoes-kids', 'echoes-living'],
    rera: 'PM1261012502409',
    brochure: { href: '/brochures/echoes-life-republic.pdf', size: '15 MB' },
  },
  {
    slug: 'duet',
    name: 'Duet',
    status: 'Phase 2 Launch',
    tagline: '2 BHK premium residences, above the noise.',
    intro: [
      'Duet brings 2 BHK premium residences to Life Republic: five majestic towers, 34 floors tall, spread across 5.7 acres with 30+ world-class amenities.',
      'Two levels of amenities — from a semi-olympic size pool, multi-sports court and party lawn to an outdoor workstation pavilion, star-gazing deck, skating rink, gym and a digital gaming zone.',
    ],
    homes: '2 BHK',
    startingPrice: '₹79 Lakh',
    stats: [
      { value: '5.7', label: 'Acres' },
      { value: '5', label: 'Majestic towers' },
      { value: '34', label: 'Floors' },
      { value: '30+', label: 'Amenities' },
    ],
    configurations: [
      { type: '2 BHK', area: '740 sq. ft. carpet', price: '₹79 Lakh', note: 'All inclusive' },
      { type: '2 BHK', area: '768 sq. ft. carpet', price: '₹82 Lakh', note: 'All inclusive' },
    ],
    pricingNote: 'Starting prices, all inclusive.',
    offer: 'Special offers on spot bookings',
    highlights: ['~121 m tall towers', 'Expansive views', 'Two levels of amenities', 'Semi-olympic size pool', 'Outdoor workstation pavilion', 'Exclusive indoor amenities'],
    amenities: ['Semi-olympic pool', 'Multi-sports court', 'Party lawn', 'Star-gazing deck', 'Skating rink', 'Gym, yoga & VR gaming'],
    hero: 'duet-pavilion',
    card: 'duet-pavilion',
    gallery: ['duet-towers', 'duet-pavilion', 'duet-stargazing', 'duet-skating'],
    brochure: { href: '/brochures/duet-life-republic.pdf', size: '6.4 MB' },
  },
];

export function projectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
