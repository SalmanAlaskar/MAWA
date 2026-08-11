import type {
  FalLicenseResult,
  LicenseRegistryProvider,
  PlatformLicenseInfo,
} from '../types';
import { assertMockConstructible } from '../guard';

/**
 * Simulates Fal ad-license issuance and reports the platform's own REGA
 * brokerage license as "pending" (SPEC.md §8.1, §11.1) — both are real
 * external dependencies engineering does not control yet.
 */
export class MockLicenseRegistryProvider implements LicenseRegistryProvider {
  constructor() {
    assertMockConstructible('LicenseRegistryProvider');
  }

  async issueAdLicense(input: { listingId: string }): Promise<FalLicenseResult> {
    // Simulate a brief async round-trip to a licensing registry.
    await delay(150);
    const suffix = input.listingId.slice(-6).toUpperCase();
    return {
      falAdLicenseNo: `FAL-SANDBOX-${suffix}`,
      issuedAt: new Date(),
      sandbox: true,
    };
  }

  async validateAdLicense(falAdLicenseNo: string): Promise<boolean> {
    await delay(80);
    return falAdLicenseNo.startsWith('FAL-SANDBOX-');
  }

  async getPlatformLicenseStatus(): Promise<PlatformLicenseInfo> {
    await delay(50);
    return {
      status: 'pending',
      regaBrokerageLicenseNo: null,
      falAdvertiserLicenseNo: null,
      checkedAt: new Date(),
    };
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
