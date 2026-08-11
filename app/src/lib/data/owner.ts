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
