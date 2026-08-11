/**
 * Provider interfaces — SPEC.md §11.
 *
 * Three external dependencies are pending and outside engineering's control:
 * the REGA brokerage license, Fal ad-licensing, Ejar contract registration
 * (SPEC.md §8.1-8.2), and the payment orchestrator's confirmed recurring +
 * split behavior (SPEC.md §7, open question 6). Business logic (booking,
 * contract, payout flows) must call ONLY these interfaces — never a concrete
 * Mock or Live class directly — so that swapping mock -> live is a config
 * change (PROVIDER_MODE env var), not a rewrite of booking/contract/payment
 * logic. See src/lib/providers/index.ts for how the concrete instance is
 * selected, and src/lib/providers/guard.ts for the production safety net.
 */

// ---------------------------------------------------------------------------
// LicenseRegistryProvider — Fal ad-license issuance/validation, and the
// platform's own REGA brokerage license status.
// ---------------------------------------------------------------------------

export type PlatformLicenseStatus = 'pending' | 'granted' | 'revoked';

export interface PlatformLicenseInfo {
  status: PlatformLicenseStatus;
  regaBrokerageLicenseNo: string | null;
  falAdvertiserLicenseNo: string | null;
  checkedAt: Date;
}

export interface FalLicenseResult {
  falAdLicenseNo: string;
  issuedAt: Date;
  sandbox: boolean;
}

export interface LicenseRegistryProvider {
  /**
   * Issue (or return an already-issued) Fal advertising license number for a
   * listing. In sandbox mode this stamps a clearly-fake, consistently
   * formatted number and never represents a real, legally-postable ad.
   */
  issueAdLicense(input: { listingId: string }): Promise<FalLicenseResult>;

  /** Validate a previously-issued Fal ad-license number is still active. */
  validateAdLicense(falAdLicenseNo: string): Promise<boolean>;

  /** Report the platform's own REGA brokerage + Fal license status. */
  getPlatformLicenseStatus(): Promise<PlatformLicenseInfo>;
}

// ---------------------------------------------------------------------------
// ContractRegistrationProvider — Ejar lease registration.
// ---------------------------------------------------------------------------

export type EjarRegistrationStatus = 'submitted' | 'registered' | 'failed';

export interface EjarRegistrationResult {
  ejarContractId: string | null;
  status: EjarRegistrationStatus;
  submittedAt: Date;
  registeredAt: Date | null;
  sandbox: boolean;
}

export interface ContractRegistrationProvider {
  /**
   * Submit a signed contract for registration on Ejar. Returns immediately
   * with status "submitted" — registration itself is async (real Ejar takes
   * 1-2 business days; the mock simulates this with an artificial delay and
   * a callback-shaped result via `pollStatus`).
   */
  submitContract(input: {
    contractId: string;
    ownerAccountId: string;
    smbCompanyId: string;
    termsJson: unknown;
  }): Promise<EjarRegistrationResult>;

  /** Poll (or, on Live*, be webhook-notified of) the current registration status. */
  pollStatus(ejarSubmissionRef: string): Promise<EjarRegistrationResult>;
}

// ---------------------------------------------------------------------------
// PaymentProvider — collection, fee/VAT split, disbursement, recurring billing.
// ---------------------------------------------------------------------------

export interface FeeSplit {
  rent: number;
  platformFeeOwnerSide: number;
  platformFeeSmbSide: number;
  vatOnFee: number;
  totalChargedToSmb: number;
  netToOwner: number;
}

export type PaymentOutcomeStatus = 'succeeded' | 'failed' | 'pending';

export interface PaymentCallbackResult {
  paymentRef: string;
  status: PaymentOutcomeStatus;
  processedAt: Date;
  failureReason: string | null;
  sandbox: boolean;
}

export interface RecurringChargeInput {
  bookingId: string;
  amount: number;
  currency: string;
  dueDate: Date;
}

export interface PaymentProvider {
  /** Calculate the rent / platform-fee / VAT split for a given booking. Pure, real business logic — not mocked. */
  calculateSplit(input: {
    rent: number;
    ownerFeePct: number;
    smbFeePct: number;
    vatPct: number;
  }): FeeSplit;

  /** Collect an initial charge (e.g. deposit + first month) from the SMB payer. */
  collectInitialPayment(input: {
    bookingId: string;
    amount: number;
    currency: string;
  }): Promise<PaymentCallbackResult>;

  /** Disburse the owner's net share after platform fee deduction. */
  disburseToOwner(input: {
    bookingId: string;
    ownerAccountId: string;
    amount: number;
    currency: string;
  }): Promise<PaymentCallbackResult>;

  /** Trigger (or, on Live*, be scheduled to trigger) a recurring monthly charge. */
  triggerRecurringCharge(input: RecurringChargeInput): Promise<PaymentCallbackResult>;
}
