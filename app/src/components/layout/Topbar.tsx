'use client';

import { Link, usePathname } from '@/i18n/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { Logo } from './Logo';
import { RoleSwitcher } from './RoleSwitcher';
import type { SessionRole } from '@/lib/session';

export interface NavItem {
  key: string;
  label: string;
  href: string;
}

export function Topbar({
  locale,
  navItems,
  avatarInitials,
  displayName,
  role,
  roleSwitcherLabels,
  contextChip,
}: {
  locale: string;
  navItems: NavItem[];
  avatarInitials: string;
  displayName: string;
  role: SessionRole;
  roleSwitcherLabels: Record<SessionRole, string> & { label: string };
  contextChip?: string;
}) {
  const pathname = usePathname();
  return (
    <div className="flex flex-wrap items-center gap-4 border-b border-line bg-surface px-4 py-3 sm:gap-7 sm:px-6">
      <Link href="/search" className="flex items-center whitespace-nowrap">
        <Logo />
        {contextChip ? (
          <span className="ms-1.5 rounded-full bg-accent-tint px-2 py-0.5 text-[11.5px] font-bold text-accent-strong">
            {contextChip}
          </span>
        ) : null}
      </Link>
      <nav className="hidden gap-5 text-[13.5px] md:flex">
        {navItems.map((item) => {
          const current = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`border-b-2 py-1 ${
                current ? 'border-accent font-semibold text-ink' : 'border-transparent text-ink-soft hover:text-ink'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="flex-1" />
      <RoleSwitcher locale={locale} currentRole={role} labels={roleSwitcherLabels} />
      <LanguageSwitcher locale={locale} />
      <div className="flex items-center gap-2 whitespace-nowrap text-[12.5px] text-ink-soft">
        <div className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-accent-tint text-[11px] font-bold text-accent-strong">
          {avatarInitials}
        </div>
        <span className="hidden sm:inline">{displayName}</span>
      </div>
    </div>
  );
}
