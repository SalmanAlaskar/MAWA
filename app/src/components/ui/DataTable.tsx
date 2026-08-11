import type { ReactNode } from 'react';

export function DataTable({ columns, children }: { columns: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] border-collapse text-[13px] sm:min-w-0">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="whitespace-nowrap border-b border-line px-3.5 pb-2.5 text-start text-[11px] font-semibold uppercase tracking-wide text-ink-soft"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Td({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <td className={`border-b border-line px-3.5 py-3 align-middle ${className}`}>{children}</td>;
}

export function Tr({ children }: { children: ReactNode }) {
  return <tr className="hover:bg-surface-2 [&:last-child>td]:border-b-0">{children}</tr>;
}
