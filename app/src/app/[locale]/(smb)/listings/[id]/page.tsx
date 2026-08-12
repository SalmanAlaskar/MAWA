import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getListingById, nearestTransit } from '@/lib/data/listings';
import { prisma } from '@/lib/prisma';
import { formatDate, formatSar } from '@/lib/format';
import { localizeAmenity, localizeCity, localizeDistrict, localizeListingTitle, localizeTransitStop } from '@/lib/i18n-data';
import { PLATFORM_CONFIG } from '@/lib/config';
import { getPaymentProvider } from '@/lib/providers';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { LinkButton } from '@/components/ui/Button';

export const dynamic = 'force-dynamic';

export default async function ListingDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const listing = await getListingById(id);
  if (!listing) notFound();

  const t = await getTranslations({ locale, namespace: 'detail' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const transit = nearestTransit(listing);
  const property = listing.unit.property;

  const split = getPaymentProvider().calculateSplit({
    rent: Number(listing.priceMonthly),
    ownerFeePct: PLATFORM_CONFIG.ownerFeePct,
    smbFeePct: PLATFORM_CONFIG.smbFeePct,
    vatPct: PLATFORM_CONFIG.vatPct,
  });

  const existingBooking = await prisma.booking.findFirst({ where: { listingId: listing.id }, select: { id: true } });

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      <Link href="/search" className="mb-3 inline-flex items-center gap-1.5 text-[12.5px] text-ink-soft">
        <Icon name="arrow" className="h-3 w-3 rotate-180" /> {tc('buttons.backToResults')}
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_300px] lg:items-start">
        <div>
          <div className="flex aspect-[16/8] items-center justify-center gap-1.5 rounded-card bg-surface-2 text-[12.5px] text-ink-soft">
            <Icon name="building" className="h-8 w-8" /> 12 {t('gallery')}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-surface-2" />
            ))}
          </div>

          <h1 className="mb-1 mt-4 font-heading text-xl font-bold sm:text-2xl">{localizeListingTitle(listing.title, locale)}</h1>
          <div className="flex items-center gap-1.5 text-[13.5px] text-ink-soft">
            <Icon name="pin" className="h-3.5 w-3.5" />
            {localizeDistrict(property.district, locale)}, {localizeCity(property.city, locale)} ·{' '}
            {t('nationalAddress', { code: property.nationalAddressCode })}
          </div>

          <Card className="my-4 grid grid-cols-2 gap-3.5 p-4 sm:grid-cols-4">
            <SpecCell icon="bed" b={t('specBeds', { count: listing.unit.beds })} s={t('captionWardrobes')} />
            <SpecCell icon="bath" b={t('specBaths', { count: listing.unit.privateBaths })} s={t('captionEnsuite')} />
            <SpecCell
              icon="parking"
              b={
                listing.unit.parkingCovered
                  ? t('specParkingCovered', { count: listing.unit.parkingSpots })
                  : t('specParkingUncovered', { count: listing.unit.parkingSpots })
              }
              s={t('captionParking')}
            />
            <SpecCell
              icon="train"
              b={transit ? t('specWalkTime', { count: transit.walkTimeMin }) : t('specNoNearbyStop')}
              s={transit ? localizeTransitStop(transit.transitStop.name, locale) : ''}
            />
          </Card>

          <p className="mb-2.5 mt-5 text-[11.5px] font-semibold uppercase tracking-wide text-ink-soft">{t('amenitiesTitle')}</p>
          <div className="flex flex-wrap gap-2">
            {listing.amenities.map((a) => (
              <Chip key={a.amenityId} variant="neutral">
                {localizeAmenity(a.amenity.name, locale)}
              </Chip>
            ))}
          </div>

          <p className="mb-2.5 mt-5 text-[11.5px] font-semibold uppercase tracking-wide text-ink-soft">{t('complianceTitle')}</p>
          <Card className="flex flex-col gap-2.5 p-4">
            <ComplianceRow
              label={t('falLicense')}
              value={listing.falAdLicenseNo ?? tc('chips.falPending')}
            />
            <ComplianceRow label={t('ejarRegistration')} value={t('ejarReadyOnBooking')} />
            <ComplianceRow label={t('ownerIdentity')} value={t('verifiedNafath')} />
            <ComplianceRow label={t('guarantee')} value={t('included')} />
          </Card>
        </div>

        <Card className="flex flex-col gap-3.5 p-4 lg:sticky lg:top-4">
          <p className="text-[11.5px] font-semibold uppercase tracking-wide text-ink-soft">{t('monthlyCost')}</p>
          <PriceRow label={t('rent')} value={formatSar(split.rent, locale)} />
          <PriceRow
            label={t('platformFee', { pct: PLATFORM_CONFIG.smbFeePct })}
            value={formatSar(split.platformFeeSmbSide, locale)}
          />
          <PriceRow label={t('vat', { pct: PLATFORM_CONFIG.vatPct })} value={formatSar(split.vatOnFee, locale)} />
          <div className="flex justify-between border-t border-line pt-2.5 text-[15px] font-bold tabular-nums">
            <span>{t('total')}</span>
            <span>{formatSar(split.totalChargedToSmb, locale)}</span>
          </div>
          <input
            className="w-full rounded-lg border border-line bg-white px-2.5 py-2 text-[13px] text-ink"
            readOnly
            value={`${t('moveInLabel')}: ${formatDate(new Date('2026-10-01'), locale)}`}
          />
          {existingBooking ? (
            <LinkButton href={`/bookings/${existingBooking.id}`} className="justify-center">
              {tc('buttons.requestBook')}
            </LinkButton>
          ) : (
            <button disabled className="w-full cursor-not-allowed rounded-lg bg-accent/50 px-3.5 py-2 text-[13px] font-semibold text-white">
              {tc('buttons.requestBook')}
            </button>
          )}
          <div className="flex gap-2 rounded-lg bg-accent-tint p-2.5 text-[12px] text-ink-soft">
            <Icon name="shield" className="mt-0.5 h-4 w-4 shrink-0 text-accent-strong" />
            <span>{t('guaranteeNote')}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

function SpecCell({ icon, b, s }: { icon: 'bed' | 'bath' | 'parking' | 'train'; b: string; s: string }) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <Icon name={icon} className="h-[18px] w-[18px] text-accent" />
      <b className="text-sm">{b}</b>
      <span className="text-[11.5px] text-ink-soft">{s}</span>
    </div>
  );
}

function ComplianceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-[13px]">
      <Icon name="shield" className="h-4 w-4 text-success" />
      <span>{label}</span>
      <span className="ms-auto text-[12px] tabular-nums text-ink-soft">{value}</span>
    </div>
  );
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[13px] text-ink-soft">
      <span>{label}</span>
      <b className="font-semibold tabular-nums text-ink">{value}</b>
    </div>
  );
}
