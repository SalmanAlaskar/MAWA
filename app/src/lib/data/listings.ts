import { prisma } from '../prisma';

/**
 * Search/listing data access. Filtering here is a straightforward Prisma
 * `where` clause — SPEC.md §6 recommends Postgres/PostGIS for geo + faceted
 * search at MVP scale and Elasticsearch/Meilisearch only once that outgrows
 * Postgres; this scaffold doesn't reach for either since there's no real
 * catalog size yet.
 */
export interface SearchFilters {
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  minBaths?: number;
  furnishedOnly?: boolean;
}

const listingInclude = {
  unit: { include: { property: true } },
  amenities: { include: { amenity: true } },
  transitDistances: { include: { transitStop: true } },
} as const;

export async function searchListings(filters: SearchFilters = {}) {
  const listings = await prisma.listing.findMany({
    where: {
      status: { in: ['live', 'pending_fal_license', 'under_review'] },
      priceMonthly: {
        gte: filters.minPrice,
        lte: filters.maxPrice,
      },
      unit: {
        beds: filters.minBeds ? { gte: filters.minBeds } : undefined,
        privateBaths: filters.minBaths ? { gte: filters.minBaths } : undefined,
        furnished: filters.furnishedOnly ? true : undefined,
      },
    },
    include: listingInclude,
    orderBy: { createdAt: 'desc' },
  });

  return listings;
}

export type SearchListing = Awaited<ReturnType<typeof searchListings>>[number];

export async function getListingById(id: string) {
  return prisma.listing.findUnique({
    where: { id },
    include: listingInclude,
  });
}

export type ListingDetail = NonNullable<Awaited<ReturnType<typeof getListingById>>>;

export function nearestTransit(listing: { transitDistances: { walkTimeMin: number; distanceM: number; transitStop: { name: string } }[] }) {
  if (listing.transitDistances.length === 0) return null;
  return [...listing.transitDistances].sort((a, b) => a.walkTimeMin - b.walkTimeMin)[0];
}
