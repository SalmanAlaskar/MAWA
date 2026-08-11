import { Icon } from '@/components/ui/Icon';

/**
 * Persistent sandbox banner (SPEC.md §11.3 guardrail): "a persistent banner
 * in the UI. A mock listing must never be visually indistinguishable from a
 * real, legally-binding one." Shown on every page while PROVIDER_MODE is
 * sandbox (the only mode this scaffold implements — see README).
 */
export function SandboxBanner({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 bg-warning-tint px-4 py-2 text-[12px] leading-snug text-warning sm:items-center sm:px-6">
      <Icon name="clock" className="mt-0.5 h-3.5 w-3.5 shrink-0 sm:mt-0" />
      <span>{text}</span>
    </div>
  );
}
