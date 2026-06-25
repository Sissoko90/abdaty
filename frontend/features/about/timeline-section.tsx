'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { usePublicList } from '@/hooks/use-public-content';

export function TimelineSection() {
  const t = useTranslations('about.timeline');

  // Historique géré dans l'admin (section "about-timeline"), avec repli i18n.
  const backend = usePublicList('about-timeline');
  const displayTimeline =
    backend.length > 0
      ? backend.map((it) => ({ key: it.id, year: it.year as string, title: it.title as string, description: it.description as string }))
      : [
          { key: '2020', year: '2020', title: t('founded.title'), description: t('founded.description') },
          { key: '2021', year: '2021', title: t('firstOffice.title'), description: t('firstOffice.description') },
          { key: '2022', year: '2022', title: t('expansion.title'), description: t('expansion.description') },
          { key: '2023', year: '2023', title: t('awards.title'), description: t('awards.description') },
          { key: '2024', year: '2024', title: t('international.title'), description: t('international.description') },
        ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('title')}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-300">{t('subtitle')}</p>
        </motion.div>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary-500 to-primary-700" />

          <div className="space-y-12">
            {displayTimeline.map((item, index) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-20"
              >
                {/* Timeline dot */}
                <div className="absolute left-5 top-2 w-6 h-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                  <Calendar className="w-3 h-3 text-white" />
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border-2 border-gray-100 dark:border-gray-700 hover:border-primary-300 transition-all">
                  <div className="text-2xl font-bold text-primary-600 mb-2">{item.year}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
