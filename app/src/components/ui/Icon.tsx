import type { ReactNode } from 'react';

/**
 * Small inline icon set, ported 1:1 from the approved mockup's SVG
 * `<symbol>` defs (scratchpad/mockups.html) so the product visually matches
 * without pulling in an icon library dependency.
 */
const PATHS: Record<string, ReactNode> = {
  bed: (
    <>
      <rect x="3" y="11" width="18" height="7" rx="1.5" />
      <path d="M3 18v2M21 18v2" />
      <path d="M3 11V8a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3" />
    </>
  ),
  bath: (
    <>
      <path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z" />
      <path d="M7 12V6a2 2 0 0 1 4 0" />
      <path d="M4 19v1M18 19v1" />
    </>
  ),
  parking: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M10 16V8h3a2.5 2.5 0 0 1 0 5h-3" />
    </>
  ),
  train: (
    <>
      <rect x="5" y="4" width="14" height="12" rx="4" />
      <path d="M5 11h14" />
      <circle cx="9" cy="17.5" r="1" />
      <circle cx="15" cy="17.5" r="1" />
      <path d="M8 20l-2 2M16 20l2 2" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-7.58 7-12A7 7 0 0 0 5 9c0 4.42 7 12 7 12Z" />
      <circle cx="12" cy="9" r="2.5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  chevron: <path d="M6 9l6 6 6-6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </>
  ),
  x: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 9l6 6M15 9l-6 6" />
    </>
  ),
  house: (
    <>
      <path d="M4 11L12 4l8 7" />
      <path d="M6 10v9a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-9" />
      <rect x="10" y="14" width="4" height="6" />
    </>
  ),
  building: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="1" />
      <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" />
    </>
  ),
  doc: (
    <>
      <path d="M6 3h9l3 3v15H6Z" />
      <path d="M15 3v3h3" />
      <path d="M9 12h6M9 16h6" />
    </>
  ),
  menu: (
    <>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </>
  ),
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = 'h-4 w-4' }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      stroke="currentColor"
      strokeWidth={1.6}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  );
}
