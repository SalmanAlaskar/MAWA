import { getTranslations } from 'next-intl/server';
import { getSession } from '@/lib/session';
import { getOwnerPayouts } from '@/lib/data/owner';
import { formatSar, formatDate } from '@/lib/format';
import { localizeDistrict, localizeListingTitle } from '@/lib/i18n-data';
import { Card } from '@/components/ui/Card';
import { StatTile } from '@/components/ui/StatTile';
import { DataTable, Td, Tr } from '@/components/ui/DataTable';

export const dynamic = 'force-dynamic';

export default async function PayoutsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = getSession();
  const t = await getTranslations({ locale, namespace: 'owner.payouts' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const { rows, totalNetPayout } = await getOwnerPayouts(session.userId);

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-5">
        <h1 className="font-heading text-xl font-bold sm:text-2xl">{tc('nav.payouts')}</h1>
        <p className="mt-1 text-[12.5px] text-ink-soft">{t('meta', { count: rows.filter((r) => r.occupied).length })}</p>
      </div>

      <div className="mb-5 max-w-xs">
        <StatTile label={t('totalLabel')} value={formatSar(totalNetPayout, locale)} />
      </div>

      {rows.length === 0 ? (
        <Card className="p-6 text-center text-[13px] text-ink-soft">{t('emptyState')}</Card>
      ) : (
        <Card className="p-1">
          <DataTable
            columns={[t('th.property'), t('th.tenant'), t('th.grossRent'), t('th.fee'), t('th.netPayout'), t('th.nextPayout')]}
          >
            {rows.map((row) => (
              <Tr key={row.propertyId}>
                <Td>
                  <div className="font-semibold">{localizeListingTitle(row.listingTitle, locale)}</div>
                  <div className="text-[11.5px] text-ink-soft">{localizeDistrict(row.district, locale)}</div>
                </Td>
                <Td>{row.tenantName ?? t('notOccupied')}</Td>
                <Td className="tabular-nums">{formatSar(row.grossRent, locale)}</Td>
                <Td className="tabular-nums">−{formatSar(row.feeAmount, locale)}</Td>
                <Td className="tabular-nums font-semibold">{formatSar(row.netPayout, locale)}</Td>
                <Td className="tabular-nums">{row.nextPayoutDate ? formatDate(row.nextPayoutDate, locale) : tc('dash')}</Td>
              </Tr>
            ))}
          </DataTable>
        </Card>
      )}
    </div>
  );
}
