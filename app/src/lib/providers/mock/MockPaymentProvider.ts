import type {
  FeeSplit,
  PaymentCallbackResult,
  PaymentProvider,
  RecurringChargeInput,
} from '../types';
import { assertMockConstructible } from '../guard';

/**
 * Simulates charge creation, the fee/VAT split calculation, recurring
 * monthly triggering, and success/failure callbacks (SPEC.md §11.1) — enough
 * to build and demo the full booking -> payment -> payout flow before
 * Tap/Moyasar's recurring+split combination is confirmed (SPEC.md §7, open
 * question 6).
 *
 * The split calculation itself is real business logic per SPEC.md §11.2
 * ("what stays real even while mocked") — only the external charge/payout
 * *calls* are faked below.
 */
export class MockPaymentProvider implements PaymentProvider {
  constructor() {
    assertMockConstructible('PaymentProvider');
  }

  calculateSplit(input: {
    rent: number;
    ownerFeePct: number;
    smbFeePct: number;
    vatPct: number;
  }): FeeSplit {
    const platformFeeOwnerSide = round2(input.rent * (input.ownerFeePct / 100));
    const platformFeeSmbSide = round2(input.rent * (input.smbFeePct / 100));
    const vatOnFee = round2(platformFeeSmbSide * (input.vatPct / 100));
    const totalChargedToSmb = round2(input.rent + platformFeeSmbSide + vatOnFee);
    const netToOwner = round2(input.rent - platformFeeOwnerSide);

    return {
      rent: input.rent,
      platformFeeOwnerSide,
      platformFeeSmbSide,
      vatOnFee,
      totalChargedToSmb,
      netToOwner,
    };
  }

  async collectInitialPayment(input: {
    bookingId: string;
    amount: number;
    currency: string;
  }): Promise<PaymentCallbackResult> {
    await delay(300);
    // Deterministic-ish "success" for demo purposes: sandbox charges always
    // succeed unless the amount is exactly zero/negative (a caller bug).
    const succeeded = input.amount > 0;
    return {
      paymentRef: `PAY-SANDBOX-${randomRef()}`,
      status: succeeded ? 'succeeded' : 'failed',
      processedAt: new Date(),
      failureReason: succeeded ? null : 'Invalid charge amount',
      sandbox: true,
    };
  }

  async disburseToOwner(input: {
    bookingId: string;
    ownerAccountId: string;
    amount: number;
    currency: string;
  }): Promise<PaymentCallbackResult> {
    await delay(300);
    return {
      paymentRef: `PAYOUT-SANDBOX-${randomRef()}`,
      status: 'succeeded',
      processedAt: new Date(),
      failureReason: null,
      sandbox: true,
    };
  }

  async triggerRecurringCharge(input: RecurringChargeInput): Promise<PaymentCallbackResult> {
    await delay(200);
    return {
      paymentRef: `RECUR-SANDBOX-${randomRef()}`,
      status: 'succeeded',
      processedAt: new Date(),
      failureReason: null,
      sandbox: true,
    };
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function randomRef() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
