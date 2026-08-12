import { Icon } from '@/components/ui/Icon';

export function NotBuiltYet({ title }: { title: string }) {
  return (
    <div className="mx-auto max-w-md rounded-card border border-line bg-surface p-6 text-center">
      <Icon name="doc" className="mx-auto mb-3 h-6 w-6 text-ink-soft" />
      <p className="font-heading text-base font-bold text-ink">{title}</p>
      <p className="mt-2 text-[13px] text-ink-soft">
        Not built out in this scaffold — the brief calls for real layout/components on the six approved mockup screens; this
        section is a placeholder so navigation doesn't 404.
      </p>
    </div>
  );
}
