import type { LicenseRegistryProvider } from '../types';

/**
 * Placeholder for the real REGA / Fal integration.
 *
 * Wires up once the REGA brokerage license and Fal advertising license are
 * granted (SPEC.md §8.1, §9 Stage 1). Do not implement against undocumented
 * or assumed API shapes — confirm the actual REGA/Fal integration contract
 * (direct API vs. partner portal) once the license process reaches that
 * stage, then fill this in and update the provider factory
 * (src/lib/providers/index.ts) to select it under PROVIDER_MODE=live.
 */
export class RegaFalLicenseProvider implements LicenseRegistryProvider {
  constructor() {
    throw new Error(
      'RegaFalLicenseProvider is not implemented. The REGA brokerage ' +
        'license and Fal advertising license are still pending (SPEC.md ' +
        '§8.1) — this class is a placeholder for once they are granted and ' +
        'the real integration contract is confirmed.'
    );
  }

  issueAdLicense(): never {
    throw new Error('Not implemented.');
  }

  validateAdLicense(): never {
    throw new Error('Not implemented.');
  }

  getPlatformLicenseStatus(): never {
    throw new Error('Not implemented.');
  }
}
