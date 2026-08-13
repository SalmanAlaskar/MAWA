import { cookies } from 'next/headers';
import { PERSONAS, type SessionRole } from './personas';

/**
 * Stub role-based session (per project brief: "No real auth provider yet").
 *
 * There is no login flow, password, or token — just a cookie holding a role
 * and a demo user id/name, enough for route groups to role-gate pages. Real
 * auth (NextAuth or similar, plus Nafath SSO per SPEC.md §8.3) is a
 * follow-up, not built here. See README.md "What's stubbed vs. real."
 */

export type { SessionRole } from './personas';

export interface Session {
  role: SessionRole;
  userId: string;
  name: string;
}

const ROLE_COOKIE = 'mawa_role';
const USER_ID_COOKIE = 'mawa_user_id';
const NAME_COOKIE = 'mawa_name';

function isSessionRole(value: string | undefined): value is SessionRole {
  return value === 'owner' || value === 'smb_admin' || value === 'ops';
}

/** True if a session cookie is actually set — unlike getSession(), this doesn't fall back to a default persona. Used to gate protected routes. */
export function hasSession(): boolean {
  const store = cookies();
  return isSessionRole(store.get(ROLE_COOKIE)?.value) && Boolean(store.get(USER_ID_COOKIE)?.value);
}

/** Read the current stub session from cookies. Falls back to the first demo owner persona if unset (e.g. mid-refactor or a stale cookie). */
export function getSession(): Session {
  const store = cookies();
  const role = store.get(ROLE_COOKIE)?.value;
  const userId = store.get(USER_ID_COOKIE)?.value;
  const name = store.get(NAME_COOKIE)?.value;

  if (isSessionRole(role) && userId && name) {
    return { role, userId, name };
  }

  const fallback = PERSONAS[0];
  return { role: fallback.role, userId: fallback.userId, name: fallback.name };
}

export const SESSION_COOKIE_NAMES = { ROLE_COOKIE, USER_ID_COOKIE, NAME_COOKIE };
