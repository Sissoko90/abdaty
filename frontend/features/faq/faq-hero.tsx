'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { AnimatedBlobRed } from '@/components/animated-blob-red';
import { HelpCircle } from 'lucide-react';
import { VibrantBg } from '@/components/vibrant-bg';

export function FAQHero() {
  const t = useTranslations('faq.hero');

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-primary-50 dark:from-gray-900 dark:to-gray-950 overflow-hidden transition-colors duration-300">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <VibrantBg variant="subtle" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        <AnimatedBlobRed className="top-20 right-20 opacity-30 animation-delay-1000" />
        <AnimatedBlobRed className="bottom-20 left-20 opacity-25 animation-delay-3000" />
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center"
        >
          <HelpCircle className="w-10 h-10 text-white" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300"
        >
          {t('title')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl text-gray-600 dark:text-gray-300 mb-8 transition-colors duration-300"
        >
          {t('subtitle')}
        </motion.p>
      </div>
    </section>
  );
}
