import { cookies } from 'next/headers';

/**
 * Stub role-based session (per project brief: "No real auth provider yet").
 *
 * There is no login flow, password, or token — just a cookie holding a role
 * and a demo user id/name, enough for route groups to role-gate pages. Real
 * auth (NextAuth or similar, plus Nafath SSO per SPEC.md §8.3) is a
 * follow-up, not built here. See README.md "What's stubbed vs. real."
 */

export type SessionRole = 'owner' | 'smb_admin' | 'ops';

export interface Session {
  role: SessionRole;
  userId: string;
  name: string;
}

const ROLE_COOKIE = 'mawa_role';
const USER_ID_COOKIE = 'mawa_user_id';
const NAME_COOKIE = 'mawa_name';

/** Illustrative demo identities, matching prisma/seed.ts, keyed by role. */
export const DEMO_IDENTITIES: Record<SessionRole, { userId: string; name: string }> = {
  owner: { userId: 'seed-owner-fahad', name: 'Fahad Al-Otaibi' },
  smb_admin: { userId: 'seed-smb-alfanar', name: 'Al-Fanar Logistics LLC' },
  ops: { userId: 'seed-ops-lama', name: 'Lama K.' },
};

function isSessionRole(value: string | undefined): value is SessionRole {
  return value === 'owner' || value === 'smb_admin' || value === 'ops';
}

/** Read the current stub session from cookies. Falls back to a default demo owner session if unset. */
export function getSession(): Session {
  const store = cookies();
  const role = store.get(ROLE_COOKIE)?.value;
  const userId = store.get(USER_ID_COOKIE)?.value;
  const name = store.get(NAME_COOKIE)?.value;

  if (isSessionRole(role) && userId && name) {
    return { role, userId, name };
  }

  const fallbackRole: SessionRole = 'smb_admin';
  return { role: fallbackRole, ...DEMO_IDENTITIES[fallbackRole] };
}

export const SESSION_COOKIE_NAMES = { ROLE_COOKIE, USER_ID_COOKIE, NAME_COOKIE };
