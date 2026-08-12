import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { getComplianceQueue, primaryVerificationLabel } from '@/lib/data/compliance';
import { formatDate } from '@/lib/format';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { DataTable, Td, Tr } from '@/components/ui/DataTable';

export const dynamic = 'force-dynamic';

export default async function CompliancePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ applicant?: string }>;
}) {
  const { locale } = await params;
  const { applicant } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'ops.compliance' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const rows = await getComplianceQueue();
  const selected = rows.find((r) => r.key === applicant) ?? rows[0];

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-4">
        <h1 className="font-heading text-xl font-bold sm:text-2xl">{t('title')}</h1>
        <p className="mt-1 text-[12.5px] text-ink-soft">
          {rows.length} {t('metaCount')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px] lg:items-start">
        <Card className="p-1">
          <DataTable columns={[t('th.applicant'), t('th.type'), t('th.submitted'), t('th.verification'), t('th.docs')]}>
            {rows.map((row) => {
              const isSmb = Boolean(row.latest.account?.company);
              const name = row.latest.account?.company?.legalName ?? row.latest.account?.fullName ?? row.latest.property?.address ?? '—';
              const sub = isSmb
                ? `CR ${row.latest.account?.company?.crNumber ?? ''}`
                : row.latest.account?.properties[0]
                  ? `Owner · ${row.latest.account.properties[0].address}`
                  : 'Owner';
              const verification = primaryVerificationLabel(row.allChecks);
              return (
                <Tr key={row.key}>
                  <Td>
                    <Link href={`/compliance?applicant=${encodeURIComponent(row.key)}`} className="block">
                      <div className={`font-semibold ${row.key === selected?.key ? 'text-accent-strong' : ''}`}>{name}</div>
                      <div className="text-[11.5px] text-ink-soft">{sub}</div>
                    </Link>
                  </Td>
                  <Td>{isSmb ? t('typeSmb') : t('typeOwner')}</Td>
                  <Td className="tabular-nums">{formatDate(row.latest.createdAt, locale)}</Td>
                  <Td>
                    <Chip variant={verification.variant}>
                      {verification.variant === 'warning' ? <Icon name="clock" className="h-2.5 w-2.5" /> : null}
                      {verification.variant === 'critical' ? <Icon name="x" className="h-2.5 w-2.5" /> : null}
                      {verification.label}
                    </Chip>
                  </Td>
                  <Td className="tabular-nums">
                    {row.approvedCount}/{row.totalCount}
                  </Td>
                </Tr>
              );
            })}
          </DataTable>
        </Card>

        {selected ? <ApplicantPanel selected={selected} locale={locale} t={t} tc={tc} /> : null}
      </div>
    </div>
  );
}

async function ApplicantPanel({
  selected,
  locale,
  t,
  tc,
}: {
  selected: Awaited<ReturnType<typeof getComplianceQueue>>[number];
  locale: string;
  t: Awaited<ReturnType<typeof getTranslations>>;
  tc: Awaited<ReturnType<typeof getTranslations>>;
}) {
  const isSmb = Boolean(selected.latest.account?.company);
  const name = selected.latest.account?.company?.legalName ?? selected.latest.account?.fullName ?? '—';
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Card className="flex flex-col gap-4 p-4 lg:sticky lg:top-4">
      <div className="flex items-center gap-2.5">
        <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-surface-2 font-bold text-ink-soft">
          {initials}
        </div>
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-[11.5px] text-ink-soft">
            {isSmb ? t('typeSmb') : t('typeOwner')} · submitted {formatDate(selected.latest.createdAt, locale)}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        {selected.allChecks.map((check) => (
          <div key={check.id} className="flex flex-wrap items-center gap-2.5 text-[13px]">
            <Icon
              name={check.status === 'approved' ? 'shield' : 'clock'}
              className={`h-4 w-4 ${check.status === 'approved' ? 'text-success' : 'text-warning'}`}
            />
            <span>{docLabel(check.docType)}</span>
            <span className="ms-auto text-[11.5px] text-ink-soft">{docNote(check)}</span>
          </div>
        ))}
      </div>

      {selected.latest.verificationResult ? (
        <div className="flex flex-col gap-1 rounded-lg bg-surface-2 p-2.5 text-[12px] text-ink-soft">
          {JSON.stringify(selected.latest.verificationResult)}
        </div>
      ) : null}

      <textarea rows={3} placeholder={t('notePlaceholder')} className="resize-none rounded-lg border border-line bg-white p-2.5 text-[13px]" />

      <div className="flex flex-wrap gap-2">
        <Button variant="primary">{tc('buttons.approve')}</Button>
        <Button variant="outline">{tc('buttons.requestInfo')}</Button>
        <Button variant="text-critical">{tc('buttons.reject')}</Button>
      </div>
    </Card>
  );
}

function docLabel(docType: string) {
  return docType
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

function docNote(check: { status: string }) {
  if (check.status === 'approved') return 'Verified';
  if (check.status === 'rejected') return 'Mismatch';
  return 'Pending';
}
