import { prisma } from '../prisma';

const bookingInclude = {
  listing: { include: { unit: { include: { property: true } } } },
  smbCompany: true,
  contract: true,
  payments: { orderBy: { dueDate: 'asc' as const } },
} as const;

export async function getBookingById(id: string) {
  return prisma.booking.findUnique({
    where: { id },
    include: bookingInclude,
  });
}

export type BookingDetail = NonNullable<Awaited<ReturnType<typeof getBookingById>>>;

/** Human-friendly reference shown in the UI (SPEC.md doesn't define a separate booking-number field). */
export function bookingRef(id: string) {
  return `SK-${id.slice(-5).toUpperCase()}`;
}

/**
 * Derives the 5-step booking stepper state (SPEC.md §3.4) from the
 * booking/contract's actual status fields, rather than storing a redundant
 * "current step" column.
 */
export type BookingStepKey = 'requested' | 'termsReviewed' | 'signed' | 'ejar' | 'payment';

export function bookingStepStatus(booking: BookingDetail): Record<BookingStepKey, 'done' | 'current' | 'upcoming'> {
  const contract = booking.contract;
  const bothSigned = Boolean(contract?.signedOwnerAt && contract?.signedSmbAt);
  const ejarRegistered = contract?.ejarStatus === 'registered';
  const paymentDone = booking.payments.some((p) => p.type === 'deposit' && p.status === 'paid');

  const steps: BookingStepKey[] = ['requested', 'termsReviewed', 'signed', 'ejar', 'payment'];
  const doneFlags: Record<BookingStepKey, boolean> = {
    requested: true,
    termsReviewed: booking.status !== 'requested',
    signed: bothSigned,
    ejar: ejarRegistered,
    payment: ejarRegistered && paymentDone,
  };

  const result = {} as Record<BookingStepKey, 'done' | 'current' | 'upcoming'>;
  let currentAssigned = false;
  for (const step of steps) {
    if (doneFlags[step]) {
      result[step] = 'done';
    } else if (!currentAssigned) {
      result[step] = 'current';
      currentAssigned = true;
    } else {
      result[step] = 'upcoming';
    }
  }
  return result;
}

/**
 * The data model (SPEC.md §5) records rent/platform_fee/vat as separate
 * Payment rows per due date — accurate for ledger/reconciliation purposes,
 * but the booking screen's payment schedule (per the approved mockup)
 * shows one bundled row per due date (e.g. "Oct rent + fees SAR 4,538").
 * This groups the raw rows back into that display shape.
 */
export interface PaymentScheduleGroup {
  dueDate: Date;
  label: string;
  status: 'paid' | 'pending' | 'scheduled' | 'failed' | 'refunded';
  totalAmount: number;
}

export function paymentScheduleGroups(payments: BookingDetail['payments']): PaymentScheduleGroup[] {
  const byDueDate = new Map<string, BookingDetail['payments']>();
  for (const p of payments) {
    const key = p.dueDate.toISOString();
    const list = byDueDate.get(key) ?? [];
    list.push(p);
    byDueDate.set(key, list);
  }

  return Array.from(byDueDate.entries())
    .map(([key, group]) => {
      const totalAmount = group.reduce((sum, p) => sum + Number(p.amount), 0);
      const isDepositOnly = group.every((p) => p.type === 'deposit');
      const month = new Date(key).toLocaleDateString('en-US', { month: 'short' });
      const label = isDepositOnly ? 'Deposit' : `${month} rent + fees`;
      // "paid" only if every component paid; otherwise reflect the earliest due row's status as pending/scheduled.
      const allPaid = group.every((p) => p.status === 'paid');
      const status: PaymentScheduleGroup['status'] = allPaid ? 'paid' : (group[0].status as PaymentScheduleGroup['status']);
      return { dueDate: new Date(key), label, status, totalAmount };
    })
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}
