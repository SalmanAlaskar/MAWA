/**
 * Platform-wide fee configuration and guarantee-fund reserve figures.
 *
 * SPEC.md §3.6 calls for these to be "configurable per listing/segment, not
 * hardcoded." There is no dedicated config entity in SPEC.md §5's data
 * model, so this scaffold keeps them as a single constant object rather
 * than inventing a new Prisma model the spec doesn't define. The
 * Administration page (§ops/admin) renders these values and their "Edit"
 * affordance is presentational only — wiring persistence is a follow-up
 * once a PlatformConfig-style table (or per-segment override table) is
 * actually designed.
 */
export const PLATFORM_CONFIG = {
  ownerFeePct: 9.0,
  smbFeePct: 7.0,
  vatPct: 15.0,
  guaranteeFundReserveSar: 1_240_000,
  guaranteeClaimCapSar: 150_000,
} as const;
