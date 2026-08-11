import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from '@/i18n/navigation';

const VARIANTS = {
  primary: 'bg-accent text-white hover:bg-accent-strong',
  outline: 'border border-line text-ink hover:border-ink-soft',
  text: 'text-ink-soft hover:text-ink',
  'text-critical': 'text-critical hover:opacity-80',
} as const;

type Variant = keyof typeof VARIANTS;

const base =
  'inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50';

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button className={`${base} ${VARIANTS[variant]} ${className}`} {...props} />;
}

export function LinkButton({
  href,
  variant = 'primary',
  className = '',
  children,
}: {
  href: string;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={`${base} ${VARIANTS[variant]} ${className}`}>
      {children}
    </Link>
  );
}
