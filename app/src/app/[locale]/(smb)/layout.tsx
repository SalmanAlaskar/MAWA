import { getTranslations } from 'next-intl/server';
import { getSession } from '@/lib/session';
import { Topbar } from '@/components/layout/Topbar';
import { SandboxBanner } from '@/components/layout/SandboxBanner';
import { RoleGateNotice } from '@/components/layout/RoleGateNotice';

export default async function SmbLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = getSession();
  const t = await getTranslations({ locale, namespace: 'common' });
  const roleLabels = {
    label: t('roleSwitcher.label'),
    owner: t('roleSwitcher.owner'),
    smb_admin: t('roleSwitcher.smb_admin'),
    ops: t('roleSwitcher.ops'),
  } as const;

  if (session.role !== 'smb_admin') {
    return <RoleGateNotice locale={locale} currentRole={session.role} requiredRole="smb_admin" labels={roleLabels} />;
  }

  const navItems = [
    { key: 'search', label: t('nav.search'), href: '/search' },
    { key: 'shortlist', label: t('nav.shortlist'), href: '/shortlist' },
    { key: 'bookings', label: t('nav.bookings'), href: '/bookings' },
    { key: 'company', label: t('nav.company'), href: '/company' },
  ];

  return (
    <div className="min-h-screen">
      <Topbar
        locale={locale}
        brand={t('brand')}
        brandAr={t('brandAr')}
        navItems={navItems}
        avatarInitials={initials(session.name)}
        displayName={session.name}
        role={session.role}
        roleSwitcherLabels={roleLabels}
      />
      <SandboxBanner text={t('sandboxBanner')} />
      <main>{children}</main>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
