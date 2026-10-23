'use client';

import { useTranslations } from 'next-intl';
import { Heart, Lightbulb, Target, Users, type LucideIcon } from 'lucide-react';
import { usePublicList } from '@/hooks/use-public-content';

const ICONS: Record<string, LucideIcon> = { Heart, Lightbulb, Target, Users };

export function ValuesSection() {
  const t = useTranslations('about.values');

  // Valeurs gérées dans l'admin (section "about-values"), avec repli i18n.
  const backend = usePublicList('about-values');
  const displayValues =
    backend.length > 0
      ? backend.map((v) => ({ key: v.id, Icon: ICONS[v.icon] || Heart, title: v.title as string, description: v.description as string }))
      : [
          { key: 'passion', Icon: Heart, title: t('passion.title'), description: t('passion.description') },
          { key: 'innovation', Icon: Lightbulb, title: t('innovation.title'), description: t('innovation.description') },
          { key: 'excellence', Icon: Target, title: t('excellence.title'), description: t('excellence.description') },
          { key: 'collaboration', Icon: Users, title: t('collaboration.title'), description: t('collaboration.description') },
        ];

  return (
    <section className="bg-white py-20 dark:bg-white/[0.02] lg:py-28">
      <div className="site-container">
        <div className="mb-12">
          <h2 className="mb-4 text-4xl font-bold text-ink dark:text-white md:text-5xl">{t('title')}</h2>
          <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-300">{t('subtitle')}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {displayValues.map((value) => {
            const Icon = value.Icon;
            return (
              <article
                key={value.key}
                className="group h-full rounded-2xl border border-gray-200 bg-paper p-6 transition-colors hover:border-primary-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-primary-500/40"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white dark:bg-primary-500/10 dark:text-primary-400">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-ink dark:text-white">{value.title}</h3>
                <p className="leading-relaxed text-gray-600 dark:text-gray-400">{value.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
