/**
 * Plain persona data — deliberately separate from session.ts (which pulls
 * in next/headers via cookies()) so client components can import this
 * without dragging a server-only module into the client bundle.
 */

export type SessionRole = 'owner' | 'smb_admin' | 'ops';

export interface Persona {
  id: string;
  role: SessionRole;
  userId: string;
  name: string;
}

/** The illustrative seeded identities (prisma/seed.ts) selectable on the login page. */
export const PERSONAS: Persona[] = [
  { id: 'fahad', role: 'owner', userId: 'seed-owner-fahad', name: 'Fahad Al-Otaibi' },
  { id: 'sultan', role: 'owner', userId: 'seed-owner-sultan', name: 'Sultan Al-Dossari' },
  { id: 'alfanar', role: 'smb_admin', userId: 'seed-smb-alfanar', name: 'Al-Fanar Logistics LLC' },
  { id: 'nour', role: 'smb_admin', userId: 'seed-smb-nour', name: 'Nour Retail Group' },
  { id: 'lama', role: 'ops', userId: 'seed-ops-lama', name: 'Lama K.' },
];

/** Persona the mock "Sign in with Nafath" button verifies as — Nafath is individual-identity verification, so it logs in as an owner, not a company. */
export const NAFATH_PERSONA_ID = 'fahad';
