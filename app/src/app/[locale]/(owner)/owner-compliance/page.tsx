import { getTranslations } from 'next-intl/server';
import { getSession } from '@/lib/session';
import { getOwnerCompliance } from '@/lib/data/owner';
import { formatDate } from '@/lib/format';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';

export const dynamic = 'force-dynamic';

export default async function OwnerCompliancePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = getSession();
  const t = await getTranslations({ locale, namespace: 'owner.compliance' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const td = await getTranslations({ locale, namespace: 'ops.compliance' });
  const { checks, approvedCount, totalCount } = await getOwnerCompliance(session.userId);

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-5">
        <h1 className="font-heading text-xl font-bold sm:text-2xl">{tc('nav.compliance')}</h1>
        <p className="mt-1 text-[12.5px] text-ink-soft">{t('meta', { approved: approvedCount, total: totalCount })}</p>
      </div>

      {checks.length === 0 ? (
        <Card className="p-6 text-center text-[13px] text-ink-soft">{t('emptyState')}</Card>
      ) : (
        <Card className="flex flex-col gap-2.5 p-4">
          {checks.map((check) => (
            <div key={check.id} className="flex flex-wrap items-center gap-2.5 border-t border-line py-2.5 text-[13px] first:border-t-0 first:pt-0">
              <Icon
                name={check.status === 'approved' ? 'shield' : 'clock'}
                className={`h-4 w-4 ${check.status === 'approved' ? 'text-success' : 'text-warning'}`}
              />
              <span className="font-semibold">{docLabel(check.docType, td)}</span>
              <ComplianceStatusChip status={check.status} t={t} />
              {check.status === 'approved' && check.reviewedAt ? (
                <span className="ms-auto text-[11.5px] text-ink-soft">{t('reviewedOn', { date: formatDate(check.reviewedAt, locale) })}</span>
              ) : null}
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function docLabel(docType: string, t: Awaited<ReturnType<typeof getTranslations>>) {
  try {
    return t(`docTypes.${docType}` as never);
  } catch {
    return docType
      .split('_')
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(' ');
  }
}

function ComplianceStatusChip({ status, t }: { status: string; t: Awaited<ReturnType<typeof getTranslations>> }) {
  if (status === 'approved') return <Chip variant="success">{t('statusApproved')}</Chip>;
  if (status === 'rejected') return <Chip variant="critical">{t('statusRejected')}</Chip>;
  if (status === 'expired') return <Chip variant="critical">{t('statusExpired')}</Chip>;
  if (status === 'resubmission_required') return <Chip variant="warning">{t('statusResubmission')}</Chip>;
  return <Chip variant="warning">{t('statusPending')}</Chip>;
}
