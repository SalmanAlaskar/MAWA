import type {
  ContractRegistrationProvider,
  EjarRegistrationResult,
} from '../types';
import { assertMockConstructible } from '../guard';

/**
 * Simulates the real Ejar lifecycle: submitted -> (delay) -> registered,
 * with a fake-but-consistently-formatted reference number (SPEC.md §11.1).
 * `pollStatus` mimics a webhook-shaped result once "enough time" has
 * elapsed since submission, so the booking stepper (SPEC.md §3.4) can be
 * built and demoed end-to-end today without real Ejar/REGA access.
 */
export class MockContractRegistrationProvider implements ContractRegistrationProvider {
  // In-memory submission clock, keyed by submission ref. A real deployment
  // would persist this via the Contract row itself; this scaffold keeps the
  // mock provider stateless-ish and lets callers re-derive status from
  // `submittedAt` stored on the Contract record instead.
  private static REGISTRATION_DELAY_MS = 4000;

  constructor() {
    assertMockConstructible('ContractRegistrationProvider');
  }

  async submitContract(input: {
    contractId: string;
    ownerAccountId: string;
    smbCompanyId: string;
    termsJson: unknown;
  }): Promise<EjarRegistrationResult> {
    await delay(150);
    return {
      ejarContractId: null,
      status: 'submitted',
      submittedAt: new Date(),
      registeredAt: null,
      sandbox: true,
    };
  }

  /**
   * `ejarSubmissionRef` here is the contract's `submittedAt` ISO timestamp —
   * good enough for a mock that just needs to simulate "registration takes
   * a while." A Live* implementation would instead look up a real Ejar
   * submission ID.
   */
  async pollStatus(ejarSubmissionRef: string): Promise<EjarRegistrationResult> {
    await delay(80);
    const submittedAt = new Date(ejarSubmissionRef);
    const elapsed = Date.now() - submittedAt.getTime();

    if (Number.isNaN(submittedAt.getTime()) || elapsed < MockContractRegistrationProvider.REGISTRATION_DELAY_MS) {
      return {
        ejarContractId: null,
        status: 'submitted',
        submittedAt,
        registeredAt: null,
        sandbox: true,
      };
    }

    const fakeRef = `EJAR-SANDBOX-${submittedAt.getTime().toString().slice(-8)}`;
    return {
      ejarContractId: fakeRef,
      status: 'registered',
      submittedAt,
      registeredAt: new Date(submittedAt.getTime() + MockContractRegistrationProvider.REGISTRATION_DELAY_MS),
      sandbox: true,
    };
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
