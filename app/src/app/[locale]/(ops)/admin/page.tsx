import { getTranslations } from 'next-intl/server';
import { getAdminOverview } from '@/lib/data/admin';
import { formatSar, formatDate } from '@/lib/format';
import { PLATFORM_CONFIG } from '@/lib/config';
import { toggleFeatureFlag } from '@/lib/admin-actions';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Switch } from '@/components/ui/Switch';
import { StatTile } from '@/components/ui/StatTile';
import { Button } from '@/components/ui/Button';
import { DataTable, Td, Tr } from '@/components/ui/DataTable';
import type { FeatureFlag } from '@prisma/client';

export const dynamic = 'force-dynamic';

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ops.admin' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const { accountCount, pendingAccountCount, openDisputeCount, claims, accounts, featureFlags } = await getAdminOverview();
  const providerFlags = featureFlags.filter((f) => f.category === 'provider');
  const productFlags = featureFlags.filter((f) => f.category === 'product');

  const blendedTakeRate = ((PLATFORM_CONFIG.ownerFeePct + PLATFORM_CONFIG.smbFeePct) / 2).toFixed(1);

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="mb-5">
        <h1 className="font-serif text-xl font-semibold sm:text-2xl">{t('title')}</h1>
        <p className="mt-1 text-[12.5px] text-ink-soft">{t('meta')}</p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:gap-3.5 lg:grid-cols-4">
        <StatTile
          label={t('stat.reserve')}
          value={formatSar(PLATFORM_CONFIG.guaranteeFundReserveSar, locale)}
          delta={t('stat.payoutCap', { amount: PLATFORM_CONFIG.guaranteeClaimCapSar.toLocaleString('en-US') })}
        />
        <StatTile
          label={t('stat.activeAccounts')}
          value={String(accountCount)}
          delta={t('stat.pendingApproval', { count: pendingAccountCount })}
        />
        <StatTile
          label={t('stat.openDisputes')}
          value={String(openDisputeCount)}
          delta={openDisputeCount > 0 ? t('stat.escalated', { count: 1 }) : undefined}
          deltaTone="warning"
        />
        <StatTile label={t('stat.takeRate')} value={`${blendedTakeRate}%`} delta={t('stat.blended')} />
      </div>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card className="flex flex-col gap-0.5 p-4">
          <FeeRow label={t('feeOwner')} value={`${PLATFORM_CONFIG.ownerFeePct.toFixed(1)}%`} tc={tc} />
          <FeeRow label={t('feeSmb')} value={`${PLATFORM_CONFIG.smbFeePct.toFixed(1)}%`} tc={tc} />
          <FeeRow label={t('feeVat')} value={`${PLATFORM_CONFIG.vatPct.toFixed(1)}%`} tc={tc} />
          <h3 className="order-first mb-1 font-serif text-[15.5px] font-semibold">{t('feeTitle')}</h3>
        </Card>

        <Card className="p-1">
          <h3 className="p-3 pb-1 font-serif text-[15.5px] font-semibold">{t('claimsTitle')}</h3>
          <DataTable columns={[t('claimsTh.booking'), t('claimsTh.type'), t('claimsTh.status'), t('claimsTh.amount')]}>
            {claims.map((claim) => (
              <Tr key={claim.id}>
                <Td className="tabular-nums">#{claim.bookingId.slice(-5).toUpperCase()}</Td>
                <Td>{claim.reason}</Td>
                <Td>
                  <ClaimStatusChip status={claim.status} />
                </Td>
                <Td className="tabular-nums">{claim.payoutAmount ? formatSar(Number(claim.payoutAmount), locale) : tc('dash')}</Td>
              </Tr>
            ))}
          </DataTable>
        </Card>
      </div>

      <Card className="mb-5 p-1">
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 pb-1">
          <h3 className="font-serif text-base font-semibold">{t('flags.title')}</h3>
          <span className="text-[12.5px] text-ink-soft">{t('flags.subtitle')}</span>
        </div>
        <div className="px-3.5 pb-4">
          <p className="mb-2 text-[11.5px] font-semibold uppercase tracking-wide text-ink-soft">{t('flags.categoryProvider')}</p>
          <div className="flex flex-col">
            {providerFlags.map((flag) => (
              <FeatureFlagRow key={flag.key} flag={flag} locale={locale} t={t} />
            ))}
          </div>
          <p className="mb-2 mt-3.5 text-[11.5px] font-semibold uppercase tracking-wide text-ink-soft">{t('flags.categoryProduct')}</p>
          <div className="flex flex-col">
            {productFlags.map((flag) => (
              <FeatureFlagRow key={flag.key} flag={flag} locale={locale} t={t} />
            ))}
          </div>
        </div>
      </Card>

      <Card className="p-1">
        <div className="p-3">
          <h3 className="font-serif text-base font-semibold">{t('accountsTitle')}</h3>
        </div>
        <DataTable
          columns={[t('accountsTh.account'), t('accountsTh.role'), t('accountsTh.status'), t('accountsTh.joined'), t('accountsTh.action')]}
        >
          {accounts.map((account) => (
            <Tr key={account.id}>
              <Td className="font-semibold">{account.company?.legalName ?? account.fullName}</Td>
              <Td>{roleLabel(account.role, t)}</Td>
              <Td>
                <AccountStatusChip status={account.status} t={t} />
              </Td>
              <Td className="tabular-nums">{formatDate(account.createdAt, locale)}</Td>
              <Td>
                <Button variant="text">{tc('buttons.manage')}</Button>
              </Td>
            </Tr>
          ))}
        </DataTable>
      </Card>
    </div>
  );
}

function FeeRow({ label, value, tc }: { label: string; value: string; tc: Awaited<ReturnType<typeof getTranslations>> }) {
  return (
    <div className="flex items-center justify-between gap-2.5 border-t border-line py-2.5 first:border-t-0">
      <span>{label}</span>
      <div className="flex items-center gap-2.5">
        <b className="text-sm tabular-nums">{value}</b>
        <Button variant="text">{tc('buttons.edit')}</Button>
      </div>
    </div>
  );
}

function ClaimStatusChip({ status }: { status: string }) {
  if (status === 'approved' || status === 'paid_out') return <Chip variant="success">Approved</Chip>;
  if (status === 'rejected') return <Chip variant="critical">Rejected</Chip>;
  return <Chip variant="warning">Under review</Chip>;
}

function AccountStatusChip({ status, t }: { status: string; t: Awaited<ReturnType<typeof getTranslations>> }) {
  if (status === 'approved') return <Chip variant="success">{t('statusActive')}</Chip>;
  if (status === 'suspended') return <Chip variant="critical">{t('statusSuspended')}</Chip>;
  return <Chip variant="neutral">{t('statusPending')}</Chip>;
}

function roleLabel(role: string, t: Awaited<ReturnType<typeof getTranslations>>) {
  if (role === 'owner') return t('roleOwner');
  if (role === 'smb_admin') return t('roleSmb');
  return t('roleOps');
}

function FeatureFlagRow({
  flag,
  locale,
  t,
}: {
  flag: FeatureFlag;
  locale: string;
  t: Awaited<ReturnType<typeof getTranslations>>;
}) {
  // Every seeded flag key (prisma/seed.ts) has a matching flags.keys.* entry
  // in both locale files — falls back to the DB label if a new flag is added
  // without a translation yet.
  let label: string;
  try {
    label = t(`flags.keys.${flag.key}` as never);
  } catch {
    label = flag.label;
  }
  const onLabel = t('flags.live');
  const offLabel = flag.category === 'provider' ? t('flags.sandbox') : t('flags.off');

  const toggle = toggleFeatureFlag.bind(null, locale, flag.key, !flag.enabled);

  return (
    <form action={toggle} className="flex items-center justify-between gap-2.5 border-t border-line py-2.5 first:border-t-0">
      <span>{label}</span>
      <button type="submit" className="flex items-center gap-2.5" aria-label={label}>
        <Chip variant={flag.enabled ? 'success' : 'neutral'}>{flag.enabled ? onLabel : offLabel}</Chip>
        <Switch on={flag.enabled} />
      </button>
    </form>
  );
}
