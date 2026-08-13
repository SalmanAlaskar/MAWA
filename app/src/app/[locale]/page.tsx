import { redirect } from '@/i18n/navigation';
import { getSession, hasSession } from '@/lib/session';

const HOME_PATH = {
  owner: '/dashboard',
  smb_admin: '/search',
  ops: '/compliance',
} as const;

export default async function RootIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasSession()) {
    redirect({ href: '/login', locale });
  }
  const session = getSession();
  redirect({ href: HOME_PATH[session.role], locale });
}
