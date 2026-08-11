import type { ReactNode } from 'react';

const VARIANTS = {
  accent: 'bg-accent-tint text-accent-strong',
  success: 'bg-success-tint text-success',
  warning: 'bg-warning-tint text-warning',
  critical: 'bg-critical-tint text-critical',
  neutral: 'bg-neutral-tint text-ink-soft',
} as const;

export function Chip({
  variant = 'neutral',
  children,
  className = '',
}: {
  variant?: keyof typeof VARIANTS;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${VARIANTS[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
