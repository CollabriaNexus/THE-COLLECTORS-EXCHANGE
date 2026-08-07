/**
 * Watch brands offered as suggestions on the vendor listing form.
 *
 * This is a *suggestion* list, not a whitelist — the brand combobox accepts any
 * free-text value a vendor types, so an obscure or house-marked piece is never
 * blocked by an omission here. Brand is also optional: plenty of the collectibles
 * traded on the Exchange are genuinely unbranded.
 *
 * IMPORTANT — the Indian block matters most for this marketplace. The Collectors
 * Exchange's core trade is Indian vintage, where HMT (Janata, Pilot, Sona et al.),
 * Titan, Allied and West End Watch Co move far more volume than the Swiss holy
 * trinity. Keep those entries accurate and spelled the way Indian collectors search
 * for them; they drive both the dropdown and the SEO keyword surface downstream.
 *
 * Entries are grouped below only for readability — the default export is a single
 * de-duplicated, alphabetically sorted array.
 */

// Swiss & European luxury / mainstream
const SWISS_AND_LUXURY = [
  'A. Lange & Söhne',
  'Alpina',
  'Audemars Piguet',
  'Baume & Mercier',
  'Bell & Ross',
  'Blancpain',
  'Breguet',
  'Breitling',
  'Bvlgari',
  'Cartier',
  'Certina',
  'Chanel',
  'Chopard',
  'Corum',
  'Franck Muller',
  'Frederique Constant',
  'Girard-Perregaux',
  'Glashütte Original',
  'Hamilton',
  'Hermès',
  'Hublot',
  'IWC',
  'Jaeger-LeCoultre',
  'Longines',
  'Maurice Lacroix',
  'Mido',
  'Movado',
  'Omega',
  'Oris',
  'Panerai',
  'Patek Philippe',
  'Piaget',
  'Rado',
  'Raymond Weil',
  'Richard Mille',
  'Roger Dubuis',
  'Rolex',
  'TAG Heuer',
  'Tissot',
  'Tudor',
  'Ulysse Nardin',
  'Vacheron Constantin',
  'Zenith',
];

// Japanese
const JAPANESE = ['Casio', 'Citizen', 'Credor', 'Grand Seiko', 'King Seiko', 'Orient', 'Seiko'];

// German (independent / Glashütte & Pforzheim school)
const GERMAN = ['Junghans', 'Laco', 'Meistersinger', 'Nomos Glashütte', 'Sinn', 'Stowa'];

// Indian — the primary market for this marketplace. Do not prune this block.
const INDIAN = [
  'Allied',
  'Fastrack',
  'Favre-Leuba',
  'HMT',
  'Jaipur Watch Company',
  'Sonata',
  'Titan',
];

// Other notable vintage & everyday names traded on the Exchange
const OTHER_NOTABLE = [
  'Benrus',
  'Bulova',
  'Bulova Accutron',
  'Camy',
  'Cyma',
  'Doxa',
  'Elgin',
  'Enicar',
  'Eterna',
  'Fortis',
  'Gruen',
  'Ricoh',
  'Roamer',
  'Rotary',
  'Services',
  'Smiths',
  'Swatch',
  'Timex',
  'Universal Genève',
  'Waltham',
  'West End Watch Co',
  'Wittnauer',
];

/**
 * Every suggested brand, de-duplicated and sorted alphabetically.
 * `localeCompare` is used so accented names (Genève, Glashütte, Hermès) sort
 * where a reader expects them rather than after `Z`.
 * @type {string[]}
 */
export const WATCH_BRANDS = Array.from(
  new Set([...SWISS_AND_LUXURY, ...JAPANESE, ...GERMAN, ...INDIAN, ...OTHER_NOTABLE]),
).sort((a, b) => a.localeCompare(b, 'en'));

export default WATCH_BRANDS;
