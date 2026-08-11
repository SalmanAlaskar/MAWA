/**
 * Runtime guard (SPEC.md §11.3): "Enforce with an environment check, not
 * convention: no Mock* provider should be constructible in a production
 * environment once its corresponding Live* provider exists for that
 * concern."
 *
 * Every Mock* provider constructor calls this first. It throws if the app
 * is running in production AND has been explicitly configured for live
 * providers (PROVIDER_MODE=live) — the only combination where a sandbox
 * record could plausibly be mistaken for a real one.
 */
export function assertMockConstructible(providerName: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  const providerMode = (process.env.PROVIDER_MODE ?? 'sandbox').toLowerCase();

  if (isProduction && providerMode === 'live') {
    throw new Error(
      `Refusing to construct Mock${providerName}: NODE_ENV=production and ` +
        `PROVIDER_MODE=live. A mock provider must never run where real, ` +
        `legally-binding records (Fal licenses, Ejar registrations, ` +
        `payments) are expected. Fix the deployment config, or if this is ` +
        `intentional (e.g. a staging environment with NODE_ENV=production), ` +
        `set PROVIDER_MODE=sandbox explicitly.`
    );
  }
}
