import { redirect } from '@/i18n/navigation';
import { prisma } from '@/lib/prisma';
import { NotBuiltYet } from '@/components/layout/NotBuiltYet';

export const dynamic = 'force-dynamic';

/**
 * There's no bookings *list* UI in the six approved mockup screens (only the
 * single booking/contract flow screen) — this redirects to the most recent
 * seeded booking so the nav link demoes something real instead of 404ing.
 */
export default async function BookingsIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const latest = await prisma.booking.findFirst({ orderBy: { createdAt: 'desc' }, select: { id: true } });
  if (latest) {
    redirect({ href: `/bookings/${latest.id}`, locale });
  }
  return (
    <div className="px-4 py-10 sm:px-6">
      <NotBuiltYet title="No bookings yet" />
    </div>
  );
}
