import type { getTranslations } from 'next-intl/server';
import { RoleSwitcher } from './RoleSwitcher';
import type { SessionRole } from '@/lib/session';

/**
 * Shown instead of a route group's content when the stub session's role
 * doesn't match what that group requires (see src/lib/session.ts — there's
 * no real auth yet, just a cookie). Rather than a bare 403, this offers the
 * one-click demo role switch so reviewers aren't stuck.
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
        <div className="mt-4 flex justify-center">
          <RoleSwitcher locale={locale} currentRole={currentRole} labels={labels} />
        </div>
      </div>
    </div>
  );
}
