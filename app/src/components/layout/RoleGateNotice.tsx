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
}: {
  locale: string;
  currentRole: SessionRole;
  requiredRole: SessionRole;
  labels: Record<SessionRole, string> & { label: string };
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <div className="max-w-sm rounded-card border border-line bg-surface p-6 text-center">
        <p className="font-serif text-lg font-semibold text-ink">This area is for {labels[requiredRole]} accounts</p>
        <p className="mt-2 text-[13px] text-ink-soft">
          You're currently viewing as {labels[currentRole]}. This is a stub, cookie-based session (no real auth yet) — switch
          roles below to continue.
        </p>
        <div className="mt-4 flex justify-center">
          <RoleSwitcher locale={locale} currentRole={currentRole} labels={labels} />
        </div>
      </div>
    </div>
  );
}
