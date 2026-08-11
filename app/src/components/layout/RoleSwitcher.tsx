import { switchRole } from '@/lib/session-actions';
import type { SessionRole } from '@/lib/session';

/**
 * Dev/demo affordance for the stub session (see src/lib/session.ts) — lets
 * a reviewer jump between the three role-gated route groups without a real
 * login flow. Not part of the product's real navigation.
 */
export function RoleSwitcher({
  locale,
  currentRole,
  labels,
}: {
  locale: string;
  currentRole: SessionRole;
  labels: Record<SessionRole, string> & { label: string };
}) {
  const roles: SessionRole[] = ['owner', 'smb_admin', 'ops'];
  return (
    <form className="flex flex-wrap items-center gap-1.5 text-[11.5px] text-ink-soft">
      <span className="hidden sm:inline">{labels.label}:</span>
      {roles.map((role) => (
        <button
          key={role}
          formAction={switchRole.bind(null, locale, role)}
          className={`rounded-full border px-2.5 py-1 ${
            role === currentRole ? 'border-accent bg-accent-tint font-semibold text-accent-strong' : 'border-line text-ink-soft'
          }`}
        >
          {labels[role]}
        </button>
      ))}
    </form>
  );
}
