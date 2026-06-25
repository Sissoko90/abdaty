'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-500 to-primary-700">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayStats.map((stat, index) => {
            const Icon = stat.Icon;
            return (
              <motion.div
                key={stat.key}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="text-5xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-primary-100 font-medium">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
