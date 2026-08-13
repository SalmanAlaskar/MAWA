'use client';

import { useState } from 'react';
import { loginAsPersona } from '@/lib/session-actions';
import { NAFATH_PERSONA_ID } from '@/lib/personas';
import { Icon } from '@/components/ui/Icon';

type Step = 'idle' | 'waiting' | 'success';

/**
 * Mocked Nafath sign-in — no real Nafath integration exists (see SPEC.md
 * §8.3, still a follow-up). Mirrors the real app's trust-number
 * confirmation UX, then logs in as the demo owner persona once "approved".
 */
export function NafathButton({
  locale,
  buttonLabel,
  waitingTitle,
  waitingHint,
  successTitle,
}: {
  locale: string;
  buttonLabel: string;
  waitingTitle: string;
  waitingHint: string;
  successTitle: string;
}) {
  const [step, setStep] = useState<Step>('idle');
  const [trustNumber, setTrustNumber] = useState<number | null>(null);

  function start() {
    setTrustNumber(10 + Math.floor(Math.random() * 90));
    setStep('waiting');
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        loginAsPersona(locale, NAFATH_PERSONA_ID);
      }, 800);
    }, 2600);
  }

  if (step === 'idle') {
    return (
      <button
        type="button"
        onClick={start}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-[13.5px] font-semibold text-ink hover:border-accent hover:text-accent-strong"
      >
        <Icon name="shield" className="h-4 w-4" />
        {buttonLabel}
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-line bg-surface-2 px-4 py-6 text-center">
      {step === 'waiting' ? (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent-tint font-heading text-2xl font-bold tabular-nums text-accent-strong">
            {trustNumber}
          </div>
          <p className="text-[13px] font-semibold text-ink">{waitingTitle}</p>
          <p className="flex items-center gap-1.5 text-[12px] text-ink-soft">
            <Icon name="clock" className="h-3.5 w-3.5 animate-spin" />
            {waitingHint}
          </p>
        </>
      ) : (
        <>
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-tint text-success">
            <Icon name="shield" className="h-7 w-7" />
          </div>
          <p className="text-[13px] font-semibold text-success">{successTitle}</p>
        </>
      )}
    </div>
  );
}
