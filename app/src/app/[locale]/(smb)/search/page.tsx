import { getTranslations } from 'next-intl/server';
import { searchListings, nearestTransit } from '@/lib/data/listings';
import { formatSar } from '@/lib/format';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { Button, LinkButton } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { PillOption } from '@/components/ui/PillOption';

export const dynamic = 'force-dynamic';

export default async function SearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'search' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const listings = await searchListings();

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-4">
        <h1 className="font-serif text-xl font-semibold sm:text-2xl">{t('h1')}</h1>
        <p className="mt-1 text-[12.5px] text-ink-soft">{t('meta')}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-[250px_1fr] md:items-start">
        {/* Filters — presentational for this scaffold; not wired to query state yet (see README). */}
        <Card className="flex flex-col gap-5 p-4 md:sticky md:top-4">
          <div>
            <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-wide text-ink-soft">{t('filters.price')}</p>
            <div className="relative mx-1 my-3.5 h-1 rounded bg-line">
              <span className="absolute inset-y-0 rounded bg-accent" style={{ insetInlineStart: '18%', insetInlineEnd: '32%' }} />
            </div>
            <div className="flex justify-between text-xs text-ink-soft tabular-nums">
              <span>SAR 2,000</span>
              <span>SAR 6,500</span>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-wide text-ink-soft">{t('filters.location')}</p>
            <div className="flex flex-wrap gap-1.5">
              {['Riyadh', 'Al Yasmin'].map((tag) => (
                <span key={tag} className="flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2.5 py-1 text-[12.5px]">
                  {tag} <Icon name="x" className="h-2.5 w-2.5" />
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[13px]">
            <span>{t('filters.transitToggle')}</span>
            <Switch on />
          </div>

          <div>
            <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-wide text-ink-soft">{t('filters.beds')}</p>
            <div className="flex flex-wrap gap-1.5">
              <PillOption label="1" />
              <PillOption label="2" />
              <PillOption label="3" on />
              <PillOption label="4+" />
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-wide text-ink-soft">{t('filters.baths')}</p>
            <div className="flex flex-wrap gap-1.5">
              <PillOption label="1" />
              <PillOption label="2" on />
              <PillOption label="3+" />
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-wide text-ink-soft">{t('filters.parking')}</p>
            <div className="flex flex-wrap gap-1.5">
              <PillOption label={t('filters.parkingAny')} />
              <PillOption label={t('filters.parking1')} on />
              <PillOption label={t('filters.parking2cov')} />
            </div>
          </div>

          <div>
            <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-wide text-ink-soft">{t('filters.movein')}</p>
            <input className="w-full rounded-lg border border-line bg-white px-2.5 py-2 text-[13px] text-ink" readOnly value="1 Oct 2026" />
          </div>

          <div className="flex items-center justify-between text-[13px]">
            <span>{t('filters.furnishedToggle')}</span>
            <Switch />
          </div>

          <div className="flex gap-2 border-t border-line pt-3">
            <Button variant="outline" className="flex-1 justify-center">
              {tc('buttons.reset')}
            </Button>
            <Button variant="primary" className="flex-1 justify-center">
              {tc('buttons.apply')}
            </Button>
          </div>
        </Card>

        <div>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-[13.5px] text-ink-soft">
              <b className="text-ink">{listings.length}</b> {t('resultsCount')}
            </div>
            <div className="flex items-center gap-1.5 text-[12.5px] text-ink-soft">
              {t('sort')} <Icon name="chevron" className="h-4 w-4" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {listings.length === 0 ? (
              <Card className="p-6 text-center text-[13px] text-ink-soft">
                No listings yet — run <code>npm run db:seed</code> against a local Postgres to populate demo data.
              </Card>
            ) : null}
            {listings.map((listing) => {
              const transit = nearestTransit(listing);
              return (
                <Card key={listing.id} className="flex flex-col gap-3 p-3.5 sm:flex-row">
                  <div className="flex aspect-video shrink-0 items-center justify-center rounded-lg bg-surface-2 text-ink-soft sm:aspect-square sm:w-40">
                    <Icon name="building" className="h-7 w-7" />
                  </div>
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-2.5">
                      <div>
                        <p className="font-serif text-[15.5px] font-semibold">{listing.title}</p>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[12.5px] text-ink-soft">
                          <Icon name="pin" className="h-3.5 w-3.5" />
                          {listing.unit.property.district}, {listing.unit.property.city}
                        </div>
                      </div>
                      {listing.falAdLicenseNo ? (
                        <Chip variant="accent">
                          <Icon name="shield" className="h-2.5 w-2.5" /> {tc('chips.falVerified')}
                        </Chip>
                      ) : (
                        <Chip variant="warning">
                          <Icon name="clock" className="h-2.5 w-2.5" /> {tc('chips.falPending')}
                        </Chip>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 text-[12.5px]">
                      <span className="flex items-center gap-1.5">
                        <Icon name="bed" className="h-3.5 w-3.5 text-ink-soft" /> {listing.unit.beds} {t('spec.beds')}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon name="bath" className="h-3.5 w-3.5 text-ink-soft" /> {listing.unit.privateBaths}{' '}
                        {listing.unit.privateBaths === 1 ? t('spec.bath') : t('spec.baths')}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Icon name="parking" className="h-3.5 w-3.5 text-ink-soft" /> {listing.unit.parkingSpots}{' '}
                        {listing.unit.parkingCovered ? t('spec.covered') : t('spec.uncovered')}
                      </span>
                      <span>{listing.unit.sizeSqm} m²</span>
                    </div>
                    {transit ? (
                      <div className="flex w-fit items-center gap-1.5 rounded-lg bg-accent-tint px-2.5 py-1 text-[12.5px] text-accent-strong">
                        <Icon name="train" className="h-3.5 w-3.5" />
                        {transit.walkTimeMin} min {t('walkTo')} · {transit.transitStop.name}
                      </div>
                    ) : null}
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1.5">
                      <div className="font-serif text-lg font-semibold tabular-nums">
                        {formatSar(Number(listing.priceMonthly), locale)}
                        <small className="ms-1 font-sans text-xs font-medium text-ink-soft">{tc('priceSuffix')}</small>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline">{tc('buttons.shortlist')}</Button>
                        <LinkButton href={`/listings/${listing.id}`} variant="primary">
                          {tc('buttons.viewDetails')}
                        </LinkButton>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
