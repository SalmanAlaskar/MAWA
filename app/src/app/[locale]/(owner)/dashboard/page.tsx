import { getTranslations } from 'next-intl/server';
import { getSession } from '@/lib/session';
import { getOwnerDashboard } from '@/lib/data/owner';
import { formatSar, formatDate } from '@/lib/format';
import { PLATFORM_CONFIG } from '@/lib/config';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { StatTile } from '@/components/ui/StatTile';
import { Button } from '@/components/ui/Button';
import { DataTable, Td, Tr } from '@/components/ui/DataTable';

export const dynamic = 'force-dynamic';

export default async function OwnerDashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = getSession();
  const t = await getTranslations({ locale, namespace: 'owner' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const { properties, stats } = await getOwnerDashboard(session.userId);

  const districts = new Set(properties.map((p) => p.district));

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-xl font-semibold sm:text-2xl">{t('title')}</h1>
          <p className="mt-1 text-[12.5px] text-ink-soft">
            {properties.length} properties · {districts.size} districts in {properties[0]?.city ?? 'Riyadh'}
          </p>
        </div>
        <Button variant="primary">
          <Icon name="plus" className="h-3.5 w-3.5" /> {tc('buttons.addProperty')}
        </Button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-3.5 lg:grid-cols-4">
        <StatTile label={t('stat.activeListings')} value={String(stats.activeListingsCount)} delta="+1 this month" />
        <StatTile
          label={t('stat.occupiedUnits')}
          value={`${stats.occupiedUnitsCount}/${stats.totalUnits}`}
          delta={`${stats.totalUnits > 0 ? Math.round((stats.occupiedUnitsCount / stats.totalUnits) * 100) : 0}% occupancy`}
        />
        <StatTile
          label={t('stat.monthlyPayout')}
          value={formatSar(stats.monthlyPayoutNet, locale)}
          delta={t('stat.afterFee', { pct: PLATFORM_CONFIG.ownerFeePct })}
        />
        <StatTile
          label={t('stat.pendingReviews')}
          value={String(stats.pendingReviews)}
          delta={t('stat.awaitingFal')}
          deltaTone="warning"
        />
      </div>

      <Card className="p-1">
        <div className="flex flex-wrap items-center justify-between gap-2 p-3">
          <h3 className="font-serif text-base font-semibold">{t('tableTitle')}</h3>
          <span className="text-[11.5px] text-ink-soft">{t('sortedByStatus')}</span>
        </div>
        <DataTable columns={[t('th.property'), t('th.status'), t('th.price'), t('th.tenant'), t('th.payout')]}>
          {properties.map((property) => {
            const unit = property.units[0];
            const listing = unit?.listing;
            const booking = listing?.bookings[0];
            const occupied = booking && ['active', 'ejar_registration', 'signed'].includes(booking.status);
            return (
              <Tr key={property.id}>
                <Td>
                  <div className="font-semibold">{listing?.title ?? property.address}</div>
                  <div className="text-[11.5px] text-ink-soft">{property.district} District</div>
                </Td>
                <Td>
                  <StatusPill property={property} listing={listing} tc={tc} />
                </Td>
                <Td className="tabular-nums">{listing ? `${formatSar(Number(listing.priceMonthly), locale)}/mo` : tc('dash')}</Td>
                <Td>{occupied ? booking!.smbCompany.legalName : tc('dash')}</Td>
                <Td className="tabular-nums">{occupied ? formatDate(nextPayoutDate(), locale) : tc('dash')}</Td>
              </Tr>
            );
          })}
        </DataTable>
      </Card>
    </div>
  );
}

function nextPayoutDate() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1, 1);
  return d;
}

function StatusPill({
  property,
  listing,
  tc,
}: {
  property: { status: string };
  listing?: { status: string } | null;
  tc: Awaited<ReturnType<typeof getTranslations>>;
}) {
  if (property.status === 'under_review') return <Chip variant="neutral">{tc('chips.underReview')}</Chip>;
  if (property.status === 'draft' || !listing) return <Chip variant="neutral">{tc('chips.draft')}</Chip>;
  if (listing.status === 'live') return <Chip variant="success">{tc('chips.live')}</Chip>;
  if (listing.status === 'pending_fal_license')
    return (
      <Chip variant="warning">
        <Icon name="clock" className="h-2.5 w-2.5" /> {tc('chips.pendingFalLicense')}
      </Chip>
    );
  return <Chip variant="neutral">{tc('chips.underReview')}</Chip>;
}
