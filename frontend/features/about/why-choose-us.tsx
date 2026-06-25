'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('title')}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-300">{t('subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayReasons.map((reason, index) => {
            const Icon = reason.Icon;
            return (
              <motion.div
                key={reason.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{reason.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{reason.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
