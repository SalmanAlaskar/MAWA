import type { ContractRegistrationProvider } from '../types';

/**
 * Placeholder for the real Ejar contract-registration integration.
 *
 * SPEC.md §8.2 leaves the integration path open: either a direct REGA/Ejar
 * API partnership, or a manual/semi-automated step where ops registers each
 * signed contract on Ejar on behalf of both parties. Do not assume which
 * one until that's resolved (SPEC.md §10, open question 2) — this class is
 * intentionally unimplemented until then.
 */
export class EjarContractRegistrationProvider implements ContractRegistrationProvider {
  constructor() {
    throw new Error(
      'EjarContractRegistrationProvider is not implemented. Ejar ' +
        'integration path (direct API vs. ops-manual registration) is an ' +
        'open question (SPEC.md §10.2) pending REGA access.'
    );
  }

  submitContract(): never {
    throw new Error('Not implemented.');
  }

  pollStatus(): never {
    throw new Error('Not implemented.');
  }
}
