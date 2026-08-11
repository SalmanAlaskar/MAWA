export interface StepDef {
  key: string;
  label: string;
  sub?: string;
  state: 'done' | 'current' | 'upcoming';
}

export function Stepper({ steps }: { steps: StepDef[] }) {
  return (
    <div className="mb-6 mt-1.5 flex items-start overflow-x-auto">
      {steps.map((step, i) => (
        <div key={step.key} className="relative flex flex-1 min-w-[64px] flex-col items-center gap-2 text-center">
          <div
            className={`z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 text-[11px] font-bold sm:h-7 sm:w-7 sm:text-xs ${
              step.state === 'done'
                ? 'border-accent bg-accent text-white'
                : step.state === 'current'
                  ? 'border-accent text-accent bg-surface'
                  : 'border-line bg-surface text-ink-soft'
            }`}
          >
            {step.state === 'done' ? '✓' : i + 1}
          </div>
          <div className="text-[10.5px] font-semibold sm:text-xs">{step.label}</div>
          {step.sub ? <div className="hidden text-[11px] text-ink-soft sm:block">{step.sub}</div> : null}
          {i < steps.length - 1 ? (
            <div
              className={`absolute top-3 h-0.5 sm:top-3.5 ${step.state === 'done' ? 'bg-accent' : 'bg-line'}`}
              style={{ insetInlineStart: 'calc(50% + 18px)', insetInlineEnd: 'calc(-50% + 18px)' }}
            />
          ) : null}
        </div>
      ))}
    </div>
  );
}
