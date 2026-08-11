import type { PaymentProvider } from '../types';

/**
 * Placeholder for the real payment orchestrator integration.
 *
 * SPEC.md §7 narrows the shortlist to Tap Payments (strongest fit — the
 * `destinations` split-charge API plus documented mada recurring support)
 * or Moyasar (close second — dedicated marketplace/sub-merchant product).
 * Neither provider's public docs confirm that a split payment can run on an
 * automated recurring schedule (SPEC.md §10, open question 6) — that must
 * be confirmed with their solutions team before this is implemented. Once
 * resolved, this class wraps whichever orchestrator is chosen; rename the
 * file accordingly if it ends up being Moyasar instead of Tap.
 */
export class TapPaymentProvider implements PaymentProvider {
  constructor() {
    throw new Error(
      'TapPaymentProvider is not implemented. The payment orchestrator ' +
        "(Tap Payments or Moyasar) hasn't confirmed automated recurring + " +
        'split settlement yet (SPEC.md §10, open question 6).'
    );
  }

  calculateSplit(): never {
    throw new Error('Not implemented.');
  }

  collectInitialPayment(): never {
    throw new Error('Not implemented.');
  }

  disburseToOwner(): never {
    throw new Error('Not implemented.');
  }

  triggerRecurringCharge(): never {
    throw new Error('Not implemented.');
  }
}
