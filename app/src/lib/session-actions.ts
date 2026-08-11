'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DEMO_IDENTITIES, SESSION_COOKIE_NAMES, type SessionRole } from './session';

const ONE_YEAR = 60 * 60 * 24 * 365;

const HOME_PATH: Record<SessionRole, string> = {
  owner: '/dashboard',
  smb_admin: '/search',
  ops: '/compliance',
};

/**
 * Dev/demo role switcher (stub auth — see src/lib/session.ts). Sets the
 * session cookie to one of the illustrative seeded identities and lands the
 * reviewer on that role's home page.
 */
export async function switchRole(locale: string, role: SessionRole) {
  const store = cookies();
  const identity = DEMO_IDENTITIES[role];
  store.set(SESSION_COOKIE_NAMES.ROLE_COOKIE, role, { maxAge: ONE_YEAR, path: '/' });
  store.set(SESSION_COOKIE_NAMES.USER_ID_COOKIE, identity.userId, { maxAge: ONE_YEAR, path: '/' });
  store.set(SESSION_COOKIE_NAMES.NAME_COOKIE, identity.name, { maxAge: ONE_YEAR, path: '/' });
  redirect(`/${locale}${HOME_PATH[role]}`);
}
