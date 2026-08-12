/**
 * MAWA wordmark. The brand name stays "MAWA" (Latin) in both locales —
 * per brand guidance, it is not transliterated to Arabic script. Overall
 * placement (left in LTR pages, right in RTL pages) comes from the
 * surrounding flex layout responding to the page's `dir` attribute; the
 * mark's own internal layout (badge-then-text) stays fixed, as is standard
 * for wordmarks.
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 28 28"
        className="h-7 w-7 shrink-0"
        aria-hidden="true"
      >
        <rect x="0" y="0" width="28" height="28" rx="7" fill="#0C7B85" />
        <path
          d="M6.5 15.5L14 8.5l7.5 7"
          fill="none"
          stroke="#F7F3EA"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M9 14v6a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-6"
          fill="none"
          stroke="#F7F3EA"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-heading text-[19px] font-bold tracking-wide text-ink" dir="ltr">
        MAWA
      </span>
    </span>
  );
}
