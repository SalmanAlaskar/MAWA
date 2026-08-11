import type {
  ContractRegistrationProvider,
  LicenseRegistryProvider,
  PaymentProvider,
} from './types';
import { MockLicenseRegistryProvider } from './mock/MockLicenseRegistryProvider';
import { MockContractRegistrationProvider } from './mock/MockContractRegistrationProvider';
import { MockPaymentProvider } from './mock/MockPaymentProvider';
import { RegaFalLicenseProvider } from './live/RegaFalLicenseProvider';
import { EjarContractRegistrationProvider } from './live/EjarContractRegistrationProvider';
import { TapPaymentProvider } from './live/TapPaymentProvider';

/**
 * Single choke point for provider selection (SPEC.md §11.1). Business logic
 * (booking/contract/payment flows, server actions, data-loading functions)
 * must import from here — never construct a Mock or Live class directly.
 * Swapping mock -> live per concern is just this env var, independently per
 * provider, exactly as SPEC.md §11.3 describes ("Going live is not one
 * switch").
 */
export type ProviderMode = 'sandbox' | 'live';

export function getProviderMode(): ProviderMode {
  const mode = (process.env.PROVIDER_MODE ?? 'sandbox').toLowerCase();
  return mode === 'live' ? 'live' : 'sandbox';
}

export function getLicenseRegistryProvider(): LicenseRegistryProvider {
  return getProviderMode() === 'live'
    ? new RegaFalLicenseProvider()
    : new MockLicenseRegistryProvider();
}

export function getContractRegistrationProvider(): ContractRegistrationProvider {
  return getProviderMode() === 'live'
    ? new EjarContractRegistrationProvider()
    : new MockContractRegistrationProvider();
}

export function getPaymentProvider(): PaymentProvider {
  return getProviderMode() === 'live' ? new TapPaymentProvider() : new MockPaymentProvider();
}

export type {
  ContractRegistrationProvider,
  LicenseRegistryProvider,
  PaymentProvider,
  FeeSplit,
  FalLicenseResult,
  EjarRegistrationResult,
  PaymentCallbackResult,
  PlatformLicenseInfo,
} from './types';
