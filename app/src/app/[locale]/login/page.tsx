import { getTranslations } from 'next-intl/server';
import { PERSONAS } from '@/lib/personas';
import { loginAsPersona } from '@/lib/session-actions';
import { Logo } from '@/components/layout/Logo';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { SandboxBanner } from '@/components/layout/SandboxBanner';
import { NafathButton } from './NafathButton';

export const dynamic = 'force-dynamic';

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'login' });
  const tc = await getTranslations({ locale, namespace: 'common' });

  return (
    <div className="min-h-screen">
      <div className="flex justify-end px-4 py-3 sm:px-6">
        <LanguageSwitcher locale={locale} />
      </div>
      <SandboxBanner text={tc('sandboxBanner')} />

      <div className="flex flex-col items-center px-4 py-10 sm:py-16">
        <Logo className="mb-6" />
        <div className="w-full max-w-sm rounded-card border border-line bg-surface p-6">
          <h1 className="text-center font-heading text-xl font-bold text-ink">{t('title')}</h1>
          <p className="mt-1.5 text-center text-[12.5px] text-ink-soft">{t('subtitle')}</p>

          <p className="mb-2 mt-6 text-[11.5px] font-semibold uppercase tracking-wide text-ink-soft">{t('personasHeading')}</p>
          <div className="flex flex-col gap-2">
            {PERSONAS.map((persona) => (
              <form key={persona.id} action={loginAsPersona.bind(null, locale, persona.id)}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 rounded-lg border border-line bg-white px-3 py-2.5 text-start hover:border-accent"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-tint text-[11px] font-bold text-accent-strong">
                    {initials(persona.name)}
                  </span>
                  <span className="flex-1">
                    <span className="block text-[13px] font-semibold text-ink">{persona.name}</span>
                    <span className="block text-[11px] text-ink-soft">{tc(`roleSwitcher.${persona.role}`)}</span>
                  </span>
                </button>
              </form>
            ))}
          </div>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wide text-ink-soft">
            <span className="h-px flex-1 bg-line" />
            {t('orDivider')}
            <span className="h-px flex-1 bg-line" />
          </div>

          <NafathButton
            locale={locale}
            buttonLabel={t('nafathButton')}
            waitingTitle={t('nafathWaitingTitle')}
            waitingHint={t('nafathWaitingHint')}
            successTitle={t('nafathSuccessTitle')}
          />
        </div>
      </div>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
