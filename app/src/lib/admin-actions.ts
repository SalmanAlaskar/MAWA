'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from './prisma';
import { getSession } from './session';

/**
 * Toggles a FeatureFlag row (SPEC.md §12). This only flips the operator-
 * facing display state in the database — it does NOT make a Mock* provider
 * live. Provider selection is still governed by PROVIDER_MODE and the
 * guard in src/lib/providers/guard.ts (§11.3): a `provider`-category flag
 * turned on here is a statement of intent for ops to see, not a bypass.
 * TODO: once a real provider is confirmed (§10), wire PROVIDER_MODE (or an
 * equivalent per-provider runtime switch) to read from this table instead
 * of being env-only, so the panel becomes the actual source of truth.
 */
export async function toggleFeatureFlag(locale: string, key: string, nextEnabled: boolean) {
  const session = getSession();

  await prisma.featureFlag.update({
    where: { key },
    data: { enabled: nextEnabled, updatedBy: session.userId },
  });

  revalidatePath(`/${locale}/admin`);
}
