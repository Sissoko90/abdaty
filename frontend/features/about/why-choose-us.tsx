'use client';

import { useTranslations } from 'next-intl';
import { Award, Users, Zap, Shield, Clock, TrendingUp, type LucideIcon } from 'lucide-react';
import { usePublicList } from '@/hooks/use-public-content';

const ICONS: Record<string, LucideIcon> = { Award, Users, Zap, Shield, Clock, TrendingUp };

export function WhyChooseUs() {
  const t = useTranslations('about.whyChooseUs');

  // Raisons gérées dans l'admin (section "about-why"), avec repli i18n.
  const backend = usePublicList('about-why');
  const displayReasons =
    backend.length > 0
      ? backend.map((r) => ({ key: r.id, Icon: ICONS[r.icon] || Award, title: r.title as string, description: r.description as string }))
      : [
          { key: 'expertise', Icon: Award, title: t('expertise.title'), description: t('expertise.description') },
          { key: 'clientFocused', Icon: Users, title: t('clientFocused.title'), description: t('clientFocused.description') },
          { key: 'fastDelivery', Icon: Zap, title: t('fastDelivery.title'), description: t('fastDelivery.description') },
          { key: 'secure', Icon: Shield, title: t('secure.title'), description: t('secure.description') },
          { key: 'support', Icon: Clock, title: t('support.title'), description: t('support.description') },
          { key: 'scalable', Icon: TrendingUp, title: t('scalable.title'), description: t('scalable.description') },
        ];

  return (
    <section className="py-20 lg:py-28">
      <div className="site-container">
        <div className="mb-12">
          <h2 className="mb-4 text-4xl font-bold text-ink dark:text-white md:text-5xl">{t('title')}</h2>
          <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-300">{t('subtitle')}</p>
        </div>

        <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {displayReasons.map((reason) => {
            const Icon = reason.Icon;
            return (
              <div key={reason.key} className="flex gap-4 border-t border-gray-200 pt-6 dark:border-white/10">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="mb-2 text-lg font-bold text-ink dark:text-white">{reason.title}</h3>
                  <p className="leading-relaxed text-gray-600 dark:text-gray-400">{reason.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
