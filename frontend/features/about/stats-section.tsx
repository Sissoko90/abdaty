'use client';

import { useTranslations } from 'next-intl';
import { Users, Briefcase, Award, Globe, type LucideIcon } from 'lucide-react';
import { usePublicList } from '@/hooks/use-public-content';

const ICONS: Record<string, LucideIcon> = { Users, Briefcase, Award, Globe };

export function StatsSection() {
  const t = useTranslations('about.stats');

  // Chiffres gérés dans l'admin (section "about-stats"), avec repli i18n.
  const backend = usePublicList('about-stats');
  const displayStats =
    backend.length > 0
      ? backend.map((s) => ({ key: s.id, Icon: ICONS[s.icon] || Briefcase, value: s.value as string, label: s.label as string }))
      : [
          { key: 'projects', Icon: Briefcase, value: '500+', label: t('projects') },
          { key: 'clients', Icon: Users, value: '200+', label: t('clients') },
          { key: 'awards', Icon: Award, value: '50+', label: t('awards') },
          { key: 'countries', Icon: Globe, value: '10+', label: t('countries') },
        ];

  return (
    <section className="bogolan-texture bg-ink py-16 text-white lg:py-20">
      <div className="site-container">
        <dl className="grid grid-cols-2 gap-y-10 lg:grid-cols-4">
          {displayStats.map((stat, index) => {
            const Icon = stat.Icon;
            return (
              <div
                key={stat.key}
                className={`flex flex-col-reverse justify-end gap-2 px-2 sm:px-6 ${index > 0 ? 'lg:border-l lg:border-white/10' : ''} ${index % 2 === 1 ? 'border-l border-white/10 lg:border-l' : ''}`}
              >
                <dt className="flex items-center gap-2 text-sm text-gray-300">
                  <Icon className="h-4 w-4 shrink-0 text-ochre" />
                  {stat.label}
                </dt>
                <dd className="font-display text-4xl font-bold sm:text-5xl">{stat.value}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
