import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Key, Check, Info } from 'lucide-react';

const INPUT =
  'h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-ink placeholder-gray-400 dark:border-white/15 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500';
const LABEL = 'mb-2 block text-sm font-medium text-ink dark:text-gray-200';

export default async function CreateApiKeyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('dashboard.createApiKey');

  const permissions = [
    { id: 'read', label: t('read'), defaultChecked: true },
    { id: 'write', label: t('write'), defaultChecked: false },
    { id: 'delete', label: t('delete'), defaultChecked: false },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <header>
        <Link
          href={`/${locale}/dashboard/api-keys`}
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('back')}
        </Link>
        <h1 className="font-display text-3xl font-bold text-ink dark:text-white">{t('title')}</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03] sm:p-8">
        <h2 className="mb-6 flex items-center gap-3 font-display text-lg font-semibold text-ink dark:text-white">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
            <Key className="h-5 w-5" />
          </span>
          {t('detailsTitle')}
        </h2>

        <div className="space-y-6">
          <div>
            <label htmlFor="keyName" className={LABEL}>
              {t('name')}
            </label>
            <input id="keyName" type="text" placeholder={t('namePlaceholder')} className={INPUT} />
          </div>

          <fieldset>
            <legend className={LABEL}>{t('permissions')}</legend>
            <div className="space-y-2">
              {permissions.map((p) => (
                <label
                  key={p.id}
                  htmlFor={p.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm text-ink transition-colors hover:border-primary-300 has-[:checked]:border-primary-300 has-[:checked]:bg-primary-50 dark:border-white/10 dark:text-gray-200 dark:has-[:checked]:border-primary-500/40 dark:has-[:checked]:bg-primary-500/10"
                >
                  <input
                    type="checkbox"
                    id={p.id}
                    defaultChecked={p.defaultChecked}
                    className="h-4 w-4 rounded border-gray-300 accent-primary-600"
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor="expiry" className={LABEL}>
              {t('expiry')}
            </label>
            <input id="expiry" type="date" className={INPUT} />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{t('noExpiry')}</p>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-6 dark:border-white/10 sm:flex-row sm:justify-end">
            <Link href={`/${locale}/dashboard/api-keys`}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                {t('cancel')}
              </Button>
            </Link>
            <Button size="lg" className="gap-2">
              <Check className="h-4 w-4" />
              {t('create')}
            </Button>
          </div>
        </div>
      </section>

      <div className="flex items-start gap-3 rounded-2xl border border-ochre/40 bg-ochre/10 p-4 text-sm text-ink dark:text-gray-200">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-ochre" />
        <p>{t('oneTimeNote')}</p>
      </div>
    </div>
  );
}
