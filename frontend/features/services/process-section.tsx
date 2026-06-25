'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Lightbulb, Code2, Rocket, HeadphonesIcon } from 'lucide-react';

const steps = [
  { icon: Lightbulb, key: 'discovery' },
  { icon: Code2, key: 'development' },
  { icon: Rocket, key: 'launch' },
  { icon: HeadphonesIcon, key: 'support' },
];

export function ProcessSection() {
  const t = useTranslations('services.process');

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('title')}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-300">{t('subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg text-center">
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {index + 1}
                    </div>
                  </div>
                  <div className="mt-8 mb-4">
                    <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto">
                      <Icon className="w-8 h-8 text-primary-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{t(`${step.key}.title`)}</h3>
                  <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{t(`${step.key}.description`)}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
