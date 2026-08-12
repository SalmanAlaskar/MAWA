import { prisma } from '../prisma';
import { PLATFORM_CONFIG } from '../config';

export async function getOwnerDashboard(ownerAccountId: string) {
  const properties = await prisma.property.findMany({
    where: { ownerAccountId },
    include: {
      units: {
        include: {
          listing: {
            include: {
              bookings: {
                include: { smbCompany: true },
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const units = properties.flatMap((p) => p.units);
  const listings = units.map((u) => u.listing).filter((l): l is NonNullable<typeof l> => Boolean(l));
  const activeListings = listings.filter((l) => l.status === 'live');
  const occupiedUnits = listings.filter((l) => l.bookings.length > 0 && ['active', 'ejar_registration', 'signed'].includes(l.bookings[0].status));
  const pendingFalReviews = listings.filter((l) => l.status === 'pending_fal_license' || l.status === 'under_review').length +
    properties.filter((p) => p.status === 'under_review').length;

  const monthlyPayoutGross = activeListings.reduce((sum, l) => sum + Number(l.priceMonthly), 0);
  const monthlyPayoutNet = monthlyPayoutGross * (1 - PLATFORM_CONFIG.ownerFeePct / 100);

  return {
    properties,
    stats: {
      activeListingsCount: activeListings.length,
      totalUnits: units.length,
      occupiedUnitsCount: occupiedUnits.length,
      monthlyPayoutNet,
      pendingReviews: pendingFalReviews,
    },
  };
}

export type OwnerDashboard = Awaited<ReturnType<typeof getOwnerDashboard>>;

/** Next payout date is the 1st of next month — same convention as the dashboard's "Next payout" column. */
export function nextPayoutDate() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1, 1);
  return d;
}

/**
 * Per-listing payout ledger (SPEC.md §5's Payment rows are tracked on the
 * SMB side; this derives the owner-side net payout the same way the
 * dashboard's monthlyPayoutNet stat does, just broken out per property).
 */
export async function getOwnerPayouts(ownerAccountId: string) {
  const properties = await prisma.property.findMany({
    where: { ownerAccountId },
    include: {
      units: {
        include: {
          listing: {
            include: {
              bookings: { include: { smbCompany: true }, orderBy: { createdAt: 'desc' }, take: 1 },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  const rows = properties.flatMap((property) =>
    property.units
      .map((unit) => unit.listing)
      .filter((listing): listing is NonNullable<typeof listing> => listing !== null && listing.status === 'live')
      .map((listing) => {
        const booking = listing.bookings[0];
        const occupied = Boolean(booking && ['active', 'ejar_registration', 'signed'].includes(booking.status));
        const grossRent = Number(listing.priceMonthly);
        const feeAmount = grossRent * (PLATFORM_CONFIG.ownerFeePct / 100);
        const netPayout = grossRent - feeAmount;
        return {
          propertyId: property.id,
          listingTitle: listing.title,
          district: property.district,
          tenantName: occupied ? booking!.smbCompany.legalName : null,
          grossRent,
          feeAmount,
          netPayout,
          occupied,
          nextPayoutDate: occupied ? nextPayoutDate() : null,
        };
      })
  );

  const totalNetPayout = rows.filter((r) => r.occupied).reduce((sum, r) => sum + r.netPayout, 0);

  return { rows, totalNetPayout };
}

export type OwnerPayouts = Awaited<ReturnType<typeof getOwnerPayouts>>;

/**
 * The owner's own vetting status (SPEC.md §3.1 owner onboarding) — same
 * ComplianceCheck rows the ops Compliance Queue reviews, shown here
 * read-only from the owner's side.
 */
export async function getOwnerCompliance(ownerAccountId: string) {
  const [account, checks] = await Promise.all([
    prisma.account.findUnique({ where: { id: ownerAccountId } }),
    prisma.complianceCheck.findMany({
      where: { accountId: ownerAccountId },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  const approvedCount = checks.filter((c) => c.status === 'approved').length;

  return { account, checks, approvedCount, totalCount: checks.length };
}

export type OwnerCompliance = Awaited<ReturnType<typeof getOwnerCompliance>>;
