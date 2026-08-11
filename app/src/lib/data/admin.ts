import { prisma } from '../prisma';

export async function getAdminOverview() {
  const [accountCount, pendingAccountCount, openDisputeCount, claims, accounts] = await Promise.all([
    prisma.account.count(),
    prisma.account.count({ where: { status: 'pending' } }),
    prisma.guaranteeClaim.count({ where: { status: { in: ['filed', 'evidence_collection', 'under_review'] } } }),
    prisma.guaranteeClaim.findMany({
      include: { booking: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.account.findMany({
      include: { company: true },
      orderBy: { createdAt: 'asc' },
      take: 20,
    }),
  ]);

  return {
    accountCount,
    pendingAccountCount,
    openDisputeCount,
    claims,
    accounts,
  };
}

export type AdminOverview = Awaited<ReturnType<typeof getAdminOverview>>;
