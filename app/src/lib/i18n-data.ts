/**
 * Arabic labels for the fixed, known vocabulary of seeded demo content
 * (districts, amenities, transit stops, listing titles/addresses, claim
 * reasons) that's stored in the DB as plain English strings rather than
 * going through next-intl messages. There's no bilingual schema for this
 * content yet — see prisma/schema.prisma's Property/Listing/Amenity models
 * — so this fills the gap without a migration. New seed content outside
 * this vocabulary falls back to the raw English string.
 */

const DISTRICTS_AR: Record<string, string> = {
  'Al Malqa': 'الملقا',
  'Al Narjis': 'النرجس',
  'Al Olaya': 'العليا',
  'Al Yasmin': 'الياسمين',
  Qurtubah: 'قرطبة',
};

const CITIES_AR: Record<string, string> = {
  Riyadh: 'الرياض',
};

const BUILDING_WORDS_AR: Record<string, string> = {
  Villa: 'فيلا',
  Building: 'مبنى',
  Tower: 'برج',
  Apartment: 'شقة',
  Duplex: 'دوبلكس',
};

const AMENITIES_AR: Record<string, string> = {
  Elevator: 'مصعد',
  'Central AC': 'تكييف مركزي',
  Furnished: 'مفروشة',
  "Maid's room": 'غرفة خادمة',
  'Building security': 'أمن المبنى',
  Gym: 'نادي رياضي',
};

const TRANSIT_STOPS_AR: Record<string, string> = {
  'An Narjis Metro Station': 'محطة مترو النرجس',
  'Al Malqa Metro Station': 'محطة مترو الملقا',
};

const CLAIM_REASONS_AR: Record<string, string> = {
  'Rent default': 'تعثر في الإيجار',
  'Property damage': 'ضرر بالعقار',
};

export function localizeDistrict(name: string, locale: string): string {
  if (locale !== 'ar') return name;
  return DISTRICTS_AR[name] ?? name;
}

export function localizeCity(name: string, locale: string): string {
  if (locale !== 'ar') return name;
  return CITIES_AR[name] ?? name;
}

export function localizeAmenity(name: string, locale: string): string {
  if (locale !== 'ar') return name;
  return AMENITIES_AR[name] ?? name;
}

export function localizeTransitStop(name: string, locale: string): string {
  if (locale !== 'ar') return name;
  return TRANSIT_STOPS_AR[name] ?? name;
}

export function claimReasonLabel(reason: string, locale: string): string {
  if (locale !== 'ar') return reason;
  return CLAIM_REASONS_AR[reason] ?? reason;
}

/** e.g. "3BR Duplex, Al Malqa" -> "دوبلكس 3 غرف، الملقا" */
export function localizeListingTitle(title: string, locale: string): string {
  if (locale !== 'ar') return title;
  const match = title.match(/^(\d+)BR (Apartment|Duplex), (.+)$/);
  if (!match) return title;
  const [, beds, type, district] = match;
  const typeAr = BUILDING_WORDS_AR[type] ?? type;
  return `${typeAr} ${beds} غرف، ${localizeDistrict(district, locale)}`;
}

/** e.g. "Al Malqa District, Villa 4" -> "حي الملقا، فيلا 4" */
export function localizeAddress(address: string, locale: string): string {
  if (locale !== 'ar') return address;
  const match = address.match(/^(.+) District, (Villa|Building|Tower) (\d+)$/);
  if (!match) return address;
  const [, district, word, num] = match;
  const wordAr = BUILDING_WORDS_AR[word] ?? word;
  return `حي ${localizeDistrict(district, locale)}، ${wordAr} ${num}`;
}
