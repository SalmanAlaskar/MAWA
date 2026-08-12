'use client';

import { Link, usePathname } from '@/i18n/navigation';

/** Shows the label of the language you'd switch TO, in that language's own script. */
export function LanguageSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();
  const other = locale === 'en' ? 'ar' : 'en';
  const label = locale === 'en' ? 'العربية' : 'English';

  return (
    <Link
      href={pathname}
      locale={other}
      className="rounded-full border border-line px-2.5 py-1 text-[11.5px] font-semibold text-ink-soft hover:border-accent hover:text-accent-strong"
    >
      {label}
    </Link>
  );
}
