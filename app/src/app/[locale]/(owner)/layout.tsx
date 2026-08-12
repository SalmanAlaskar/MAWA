import { getTranslations } from 'next-intl/server';
import { getSession } from '@/lib/session';
import { Topbar } from '@/components/layout/Topbar';
import { SandboxBanner } from '@/components/layout/SandboxBanner';
import { RoleGateNotice } from '@/components/layout/RoleGateNotice';

export default async function OwnerLayout({
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

  if (session.role !== 'owner') {
    return <RoleGateNotice locale={locale} currentRole={session.role} requiredRole="owner" labels={roleLabels} tc={t} />;
  }

  const navItems = [
    { key: 'properties', label: t('nav.properties'), href: '/dashboard' },
    { key: 'payouts', label: t('nav.payouts'), href: '/payouts' },
    { key: 'compliance', label: t('nav.compliance'), href: '/owner-compliance' },
  ];

  return (
    <div className="min-h-screen">
      <Topbar
        locale={locale}
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
