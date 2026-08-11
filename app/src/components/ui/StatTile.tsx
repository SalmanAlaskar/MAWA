import { Card } from './Card';

export function StatTile({
  label,
  value,
  delta,
  deltaTone = 'success',
}: {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: 'success' | 'warning';
}) {
  return (
    <Card className="flex flex-col gap-1.5 p-4">
      <span className="text-xs text-ink-soft">{label}</span>
      <span className="font-serif text-2xl font-semibold tabular-nums">{value}</span>
      {delta ? (
        <span className={`text-[11.5px] ${deltaTone === 'warning' ? 'text-warning' : 'text-success'}`}>{delta}</span>
      ) : null}
    </Card>
  );
}
