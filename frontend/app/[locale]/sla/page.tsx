'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Shield, Clock, Headphones, RefreshCw, AlertCircle, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/page-hero';
import { usePublicSection } from '@/hooks/use-public-content';

export default function SLAPage() {
  const t = useTranslations('sla');
  const locale = useLocale();
  // Titre / sous-titre gérés dans l'admin (section "sla"), avec repli i18n.
  const { cv } = usePublicSection('sla');

  const metrics = [
    { icon: Clock, value: t('uptime.percentage'), label: t('uptime.description') },
    { icon: RefreshCw, value: t('response.time'), label: t('response.description') },
    { icon: Headphones, value: t('support.hours'), label: t('support.description') },
    { icon: Shield, value: t('security.level'), label: t('security.description') },
  ];

  const levels = [
    { key: 'standard', features: 4, highlighted: false },
    { key: 'professional', features: 5, highlighted: true },
    { key: 'enterprise', features: 6, highlighted: false },
  ];

  const guarantees = [
    { icon: Shield, key: 'dataProtection' },
    { icon: RefreshCw, key: 'backups' },
    { icon: Headphones, key: 'support' },
    { icon: AlertCircle, key: 'incidentResponse' },
  ];

  return (
    <main>
      <PageHero title={cv('title', t('title'))} subtitle={cv('subtitle', t('subtitle'))} />

      {/* Engagements chiffrés */}
      <section className="pt-16 lg:pt-24">
        <div className="site-container">
          {/* gap-px sur fond gris = filets réguliers entre les cellules, quel que soit le nombre de colonnes */}
          <dl className="grid gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:grid-cols-4 dark:border-white/10 dark:bg-white/10">
            {metrics.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col-reverse justify-end gap-1 bg-white p-6 dark:bg-[#0f182a] lg:p-8">
                <dt className="text-sm text-gray-600 dark:text-gray-400">{label}</dt>
                <dd className="font-display text-3xl font-bold text-ink dark:text-white">{value}</dd>
                <Icon className="mb-4 h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Niveaux de service */}
      <section className="py-20 lg:py-28">
        <div className="site-container">
          <h2 className="mb-12 text-4xl font-bold text-ink dark:text-white md:text-5xl">{t('serviceLevels.title')}</h2>
          <div className="grid gap-5 md:grid-cols-3">
            {levels.map(({ key, features, highlighted }) => (
              <div
                key={key}
                className={`relative flex flex-col rounded-2xl p-8 ${
                  highlighted
                    ? 'bogolan-texture bg-ink text-white ring-1 ring-ink dark:ring-white/10'
                    : 'border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]'
                }`}
              >
                {highlighted && (
                  <span className="absolute right-6 top-6 rounded-full bg-ochre px-3 py-1 text-xs font-semibold text-ink">
                    {t('serviceLevels.popular')}
                  </span>
                )}
                <h3 className={`mb-2 text-xl font-bold ${highlighted ? 'text-white' : 'text-ink dark:text-white'}`}>
                  {t(`serviceLevels.${key}.title`)}
                </h3>
                <p className={`mb-6 font-display text-3xl font-bold ${highlighted ? 'text-ochre' : 'text-primary-600 dark:text-primary-400'}`}>
                  {t(`serviceLevels.${key}.uptime`)}
                </p>
                <ul className="space-y-3">
                  {Array.from({ length: features }).map((_, i) => (
                    <li key={i} className={`flex items-start gap-3 text-sm ${highlighted ? 'text-gray-200' : 'text-gray-700 dark:text-gray-300'}`}>
                      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${highlighted ? 'text-ochre' : 'text-primary-600 dark:text-primary-400'}`} />
                      {t(`serviceLevels.${key}.feature${i + 1}`)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Garanties */}
      <section className="bg-white pb-20 pt-20 dark:bg-white/[0.02] lg:py-28">
        <div className="site-container">
          <h2 className="mb-12 text-4xl font-bold text-ink dark:text-white md:text-5xl">{t('guarantees.title')}</h2>
          <div className="grid gap-5 md:grid-cols-2">
            {guarantees.map(({ icon: Icon, key }) => (
              <div key={key} className="flex gap-5 rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="mb-2 text-lg font-bold text-ink dark:text-white">{t(`guarantees.${key}.title`)}</h3>
                  <p className="leading-relaxed text-gray-600 dark:text-gray-400">{t(`guarantees.${key}.description`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Appel à l'action */}
      <section className="py-20 lg:py-28">
        <div className="site-container">
          <div className="bogolan-texture flex flex-col gap-8 rounded-3xl bg-ink p-8 text-white sm:p-12 lg:flex-row lg:items-center lg:justify-between lg:p-16">
            <div className="max-w-2xl">
              <h2 className="mb-3 text-3xl font-bold md:text-4xl">{t('cta.title')}</h2>
              <p className="text-lg text-gray-300">{t('cta.description')}</p>
            </div>
            <Link href={`/${locale}/contact`} className="shrink-0">
              <Button size="lg" className="group w-full sm:w-auto">
                {t('cta.button')}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
