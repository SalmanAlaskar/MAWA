import { prisma } from '../prisma';

/**
 * Vetting queue (SPEC.md §4): the most recent compliance submission per
 * account/property, regardless of final status, so ops can see what's
 * recently moved through the pipeline (not only what's still pending).
 */
export async function getComplianceQueue() {
  const checks = await prisma.complianceCheck.findMany({
    include: {
      account: { include: { company: true, properties: { take: 1 } } },
      property: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  // Group by the applicant (account or property), keep most recent check per group as the "row",
  // and count how many required docs are approved out of the total submitted for that applicant.
  const groups = new Map<string, typeof checks>();
  for (const check of checks) {
    const key = check.accountId ?? `property:${check.propertyId}`;
    const list = groups.get(key) ?? [];
    list.push(check);
    groups.set(key, list);
  }

  return Array.from(groups.entries()).map(([key, group]) => {
    const latest = group[0];
    const approvedCount = group.filter((c) => c.status === 'approved').length;
    return {
      key,
      latest,
      allChecks: group,
      approvedCount,
      totalCount: group.length,
    };
  });
}

export type ComplianceQueueRow = Awaited<ReturnType<typeof getComplianceQueue>>[number];

export async function getApplicantChecks(key: string) {
  const rows = await getComplianceQueue();
  return rows.find((r) => r.key === key) ?? null;
}

/**
 * The compliance queue table shows one summarized verification chip per
 * applicant (SPEC.md §4's Wathq/Nafath checks), derived from whichever
 * check represents the primary external lookup for that actor type.
 * Returns a translation key + variant rather than a literal label so the
 * caller can localize it via next-intl.
 */
export function primaryVerificationStatus(
  group: ComplianceQueueRow['allChecks']
): { key: 'pending' | 'wathqVerified' | 'nafathVerified' | 'crMismatch' | 'idMismatch' | 'wathqPending' | 'nafathPending'; variant: 'success' | 'warning' | 'critical' } {
  const primary = group.find((c) => c.docType === 'commercial_registration') ?? group.find((c) => c.docType === 'national_id');
  if (!primary) return { key: 'pending', variant: 'warning' };

  const isCr = primary.docType === 'commercial_registration';
  if (primary.status === 'approved') return { key: isCr ? 'wathqVerified' : 'nafathVerified', variant: 'success' };
  if (primary.status === 'rejected') return { key: isCr ? 'crMismatch' : 'idMismatch', variant: 'critical' };
  return { key: isCr ? 'wathqPending' : 'nafathPending', variant: 'warning' };
}
