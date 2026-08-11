export function PillOption({ label, on = false }: { label: string; on?: boolean }) {
  return (
    <span
      className={`inline-flex cursor-default items-center rounded-full border px-3 py-1 text-[12.5px] ${
        on ? 'border-accent bg-accent font-semibold text-white' : 'border-line text-ink'
      }`}
    >
      {label}
    </span>
  );
}
