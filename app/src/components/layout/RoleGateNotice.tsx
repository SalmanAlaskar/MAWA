import type { getTranslations } from 'next-intl/server';
import { logout } from '@/lib/session-actions';
import type { SessionRole } from '@/lib/session';

/**
 * Shown instead of a route group's content when the signed-in persona's
 * role doesn't match what that group requires (see src/lib/session.ts —
 * stub auth, no real provider). Points to logging out and picking the
 * right persona on /login rather than a bare 403.
 */
export function RoleGateNotice({
  locale,
  currentRole,
  requiredRole,
  labels,
  tc,
}: {
  locale: string;
  currentRole: SessionRole;
  requiredRole: SessionRole;
  labels: Record<SessionRole, string> & { label: string };
  tc: Awaited<ReturnType<typeof getTranslations>>;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <div className="max-w-sm rounded-card border border-line bg-surface p-6 text-center">
        <p className="font-heading text-lg font-bold text-ink">{tc('roleGateTitle', { role: labels[requiredRole] })}</p>
        <p className="mt-2 text-[13px] text-ink-soft">{tc('roleGateDescription', { role: labels[currentRole] })}</p>
        <form action={logout.bind(null, locale)} className="mt-4 flex justify-center">
          <button type="submit" className="rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-white">
            {tc('logout')}
          </button>
        </form>
      </div>
    </div>
  );
}
