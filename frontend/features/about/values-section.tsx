'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Heart, Lightbulb, Target, Users, type LucideIcon } from 'lucide-react';
import { usePublicList } from '@/hooks/use-public-content';

const ICONS: Record<string, LucideIcon> = { Heart, Lightbulb, Target, Users };
const COLORS = [
  'from-primary-500 to-pink-500',
  'from-yellow-500 to-orange-500',
  'from-blue-500 to-indigo-500',
  'from-green-500 to-emerald-500',
];

export function ValuesSection() {
  const t = useTranslations('about.values');

  // Valeurs gérées dans l'admin (section "about-values"), avec repli i18n.
  const backend = usePublicList('about-values');
  const displayValues =
    backend.length > 0
      ? backend.map((v, i) => ({ key: v.id, Icon: ICONS[v.icon] || Heart, color: COLORS[i % COLORS.length], title: v.title as string, description: v.description as string }))
      : [
          { key: 'passion', Icon: Heart, color: COLORS[0], title: t('passion.title'), description: t('passion.description') },
          { key: 'innovation', Icon: Lightbulb, color: COLORS[1], title: t('innovation.title'), description: t('innovation.description') },
          { key: 'excellence', Icon: Target, color: COLORS[2], title: t('excellence.title'), description: t('excellence.description') },
          { key: 'collaboration', Icon: Users, color: COLORS[3], title: t('collaboration.title'), description: t('collaboration.description') },
        ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('title')}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">{t('subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {displayValues.map((value, index) => {
            const Icon = value.Icon;
            return (
              <motion.div
                key={value.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary-300">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 transition-colors duration-300">{value.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{value.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
