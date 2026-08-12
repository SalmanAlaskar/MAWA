import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getBookingById, bookingRef, bookingStepStatus, paymentScheduleGroups } from '@/lib/data/bookings';
import { formatSar, formatDate, formatDateTime } from '@/lib/format';
import { localizeAddress, localizeListingTitle } from '@/lib/i18n-data';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Icon } from '@/components/ui/Icon';
import { Stepper, type StepDef } from '@/components/ui/Stepper';

export const dynamic = 'force-dynamic';

export default async function BookingPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = await params;
  const booking = await getBookingById(id);
  if (!booking) notFound();

  const t = await getTranslations({ locale, namespace: 'booking' });
  const tc = await getTranslations({ locale, namespace: 'common' });
  const property = booking.listing.unit.property;
  const contract = booking.contract;
  const stepState = bookingStepStatus(booking);

  const steps: StepDef[] = [
    { key: 'requested', label: t('steps.requested'), sub: formatDate(booking.createdAt, locale), state: stepState.requested },
    { key: 'termsReviewed', label: t('steps.termsReviewed'), state: stepState.termsReviewed },
    { key: 'signed', label: t('steps.signed'), state: stepState.signed },
    {
      key: 'ejar',
      label: t('steps.ejar'),
      sub: contract?.ejarStatus === 'registered' ? undefined : t('ejarInProgress'),
      state: stepState.ejar,
    },
    {
      key: 'payment',
      label: t('steps.payment'),
      sub: stepState.payment === 'upcoming' ? t('paymentPending') : undefined,
      state: stepState.payment,
    },
  ];

  return (
    <div className="px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="font-heading text-xl font-bold sm:text-2xl">
        {t('titlePrefix')} #{bookingRef(booking.id)} — {localizeListingTitle(booking.listing.title, locale)}
      </h1>
      <p className="mt-1 text-[12.5px] text-ink-soft">
        {tc('nav.bookings')}: {formatDate(booking.createdAt, locale)} · {booking.smbCompany.legalName}
      </p>

      <Stepper steps={steps} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_320px] lg:items-start">
        <Card className="flex flex-col gap-4 p-4">
          <h3 className="font-heading text-[15.5px] font-bold">{t('contractSummary')}</h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">
            <Kv label={t('landlord')} value={localizeAddress(property.address, locale)} />
            <Kv label={t('tenant')} value={booking.smbCompany.legalName} />
            <Kv label={t('term')} value={`${formatDate(booking.leaseStart, locale)} – ${formatDate(booking.leaseEnd, locale)}`} />
            <Kv label={t('monthlyRent')} value={formatSar(Number(booking.listing.priceMonthly), locale)} />
            <Kv label={t('deposit')} value={formatSar(Number(booking.listing.priceMonthly), locale)} />
            <Kv label={t('ejarRef')} value={contract?.ejarContractId ?? t('ejarSubmittedAwaiting')} />
          </div>

          <div>
            <SignRow
              icon="shield"
              tone="success"
              label={t('ownerSigned')}
              time={contract?.signedOwnerAt ? formatDateTime(contract.signedOwnerAt, locale) : '—'}
            />
            <SignRow
              icon="shield"
              tone="success"
              label={t('tenantSigned')}
              time={contract?.signedSmbAt ? formatDateTime(contract.signedSmbAt, locale) : '—'}
            />
            <SignRow
              icon="clock"
              tone={contract?.ejarStatus === 'registered' ? 'success' : 'warning'}
              label={t('ejarRegistrationRow')}
              time={contract?.ejarStatus === 'registered' ? formatDate(contract.updatedAt, locale) : t('ejarEstDays')}
            />
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="flex flex-col gap-3.5 p-4">
            <h4 className="flex items-center gap-1.5 font-heading text-[13.5px] font-bold">
              <Icon name="shield" className="h-4 w-4 text-accent" /> {t('guaranteeTitle')}
            </h4>
            <ul className="flex flex-col gap-1.5 ps-4 text-[12.5px] text-ink-soft" style={{ listStyleType: 'disc' }}>
              <li>{t('guaranteePoints.smb')}</li>
              <li>{t('guaranteePoints.owner')}</li>
              <li>{t('guaranteePoints.disputes')}</li>
            </ul>
          </Card>

          <Card className="p-4">
            <p className="mb-1.5 text-[11.5px] font-semibold uppercase tracking-wide text-ink-soft">{t('paySchedule')}</p>
            {paymentScheduleGroups(booking.payments).map((group) => {
              const month = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA-u-nu-latn' : 'en-US', { month: 'short' }).format(
                group.dueDate
              );
              const label = group.isDepositOnly ? t('depositLabel') : t('monthRentFees', { month });
              return (
                <div
                  key={group.dueDate.toISOString()}
                  className="flex items-center justify-between gap-2 border-t border-line py-2.5 text-[12.5px] first:border-t-0"
                >
                  <span>{label}</span>
                  <PaymentChip status={group.status} tc={tc} />
                  <span className="font-semibold tabular-nums">{formatSar(group.totalAmount, locale)}</span>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </div>
  );
}

function Kv({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="mb-0.5 block text-[11.5px] text-ink-soft">{label}</span>
      <b className="text-[13.5px] tabular-nums">{value}</b>
    </div>
  );
}

function SignRow({
  icon,
  tone,
  label,
  time,
}: {
  icon: 'shield' | 'clock';
  tone: 'success' | 'warning';
  label: string;
  time: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-1 border-t border-line py-2.5 text-[13px] first:border-t-0">
      <div className={`flex items-center gap-2 ${tone === 'warning' ? 'text-warning' : ''}`}>
        <Icon name={icon} className={`h-4 w-4 ${tone === 'warning' ? 'text-warning' : 'text-success'}`} />
        <span>{label}</span>
      </div>
      <div className="text-[11.5px] text-ink-soft">{time}</div>
    </div>
  );
}

function PaymentChip({ status, tc }: { status: string; tc: Awaited<ReturnType<typeof getTranslations>> }) {
  if (status === 'paid') return <Chip variant="success">{tc('chips.paid')}</Chip>;
  if (status === 'pending') return <Chip variant="warning">{tc('chips.upcoming')}</Chip>;
  return <Chip variant="neutral">{tc('chips.scheduled')}</Chip>;
}
