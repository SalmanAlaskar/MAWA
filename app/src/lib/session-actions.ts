'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE_NAMES } from './session';
import { PERSONAS, type SessionRole } from './personas';

const ONE_YEAR = 60 * 60 * 24 * 365;

const HOME_PATH: Record<SessionRole, string> = {
  owner: '/dashboard',
  smb_admin: '/search',
  ops: '/compliance',
};

/**
 * Stub login (no real auth provider — see src/lib/session.ts): sets the
 * session cookie to the chosen seeded persona and lands on that role's
 * home page. Used by both the persona picker and the mock Nafath flow.
 */
export async function loginAsPersona(locale: string, personaId: string) {
  const persona = PERSONAS.find((p) => p.id === personaId);
  if (!persona) return;

  const store = cookies();
  store.set(SESSION_COOKIE_NAMES.ROLE_COOKIE, persona.role, { maxAge: ONE_YEAR, path: '/' });
  store.set(SESSION_COOKIE_NAMES.USER_ID_COOKIE, persona.userId, { maxAge: ONE_YEAR, path: '/' });
  store.set(SESSION_COOKIE_NAMES.NAME_COOKIE, persona.name, { maxAge: ONE_YEAR, path: '/' });
  redirect(`/${locale}${HOME_PATH[persona.role]}`);
}

export async function logout(locale: string) {
  const store = cookies();
  store.delete(SESSION_COOKIE_NAMES.ROLE_COOKIE);
  store.delete(SESSION_COOKIE_NAMES.USER_ID_COOKIE);
  store.delete(SESSION_COOKIE_NAMES.NAME_COOKIE);
  redirect(`/${locale}/login`);
}
