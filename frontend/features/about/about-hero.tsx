'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { AnimatedBlobRed } from '@/components/animated-blob-red';
import { VibrantBg } from '@/components/vibrant-bg';
import { usePublicSection } from '@/hooks/use-public-content';

export function AboutHero() {
  const t = useTranslations('about');
  // Contenu géré dans l'admin (section "about"), avec repli i18n.
  const { cv } = usePublicSection('about');

  return (
    <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors duration-300 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <VibrantBg variant="subtle" />
        <AnimatedBlobRed className="top-10 right-10 opacity-30" />
        <AnimatedBlobRed className="bottom-10 left-10 opacity-20 animation-delay-2000" />
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
            {cv('title', t('title'))}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8 transition-colors duration-300">
            {cv('subtitle', t('subtitle'))}
          </p>
          <p className="text-lg text-gray-700 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed transition-colors duration-300">
            {cv('description', t('description'))}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
