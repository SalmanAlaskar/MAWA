import { getTranslations } from 'next-intl/server';
import { NotBuiltYet } from '@/components/layout/NotBuiltYet';

export default async function PayoutsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'common' });
  return (
    <div className="px-4 py-10 sm:px-6">
      <NotBuiltYet title={t('nav.payouts')} body={t('notBuiltYetBody')} />
    </div>
  );
}
