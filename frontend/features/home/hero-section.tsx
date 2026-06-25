'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { PromoBanner } from './promo-banner';
import { useCounter } from '@/hooks/use-counter';
import { AnimatedBlobRed } from '@/components/animated-blob-red';
import { VibrantBg } from '@/components/vibrant-bg';
import { usePublicSection } from '@/hooks/use-public-content';

export function HeroSection() {
  const t = useTranslations('hero');
  const locale = useLocale();

  // Contenu géré dans l'admin (section "hero"), avec repli sur l'i18n statique.
  const { cv } = usePublicSection('hero');

  // Chiffres clés gérés dans l'admin (section "stats").
  const { items: statItems } = usePublicSection('stats');
  const heroStats = statItems
    .filter((b) => b.contentKey.startsWith('item-'))
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((b) => {
      let fr: { value?: string; label?: string } = {};
      let en: { value?: string; label?: string } = {};
      try { fr = b.valueFr ? JSON.parse(b.valueFr) : {}; } catch { /* ignore */ }
      try { en = b.valueEn ? JSON.parse(b.valueEn) : {}; } catch { /* ignore */ }
      const loc = locale === 'fr' ? fr : en;
      return { value: loc.value ?? fr.value ?? '', label: loc.label ?? fr.label ?? '' };
    })
    .slice(0, 4);

  const projectsCount = useCounter(500);
  const satisfactionCount = useCounter(99);
  const experienceCount = useCounter(10);

  return (
    <>
      <PromoBanner />
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-gray-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 transition-colors duration-300">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-primary-100 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-primary-600 mr-2" />
              <span className="text-sm font-medium text-primary-700">{cv('subtitle', t('subtitle'))}</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight transition-colors duration-300">
              {cv('title', t('title'))}
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed transition-colors duration-300">
              {cv('description', t('description'))}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href={`/${locale}/contact`}>
                <Button size="lg" className="w-full sm:w-auto group">
                  {cv('ctaText', t('cta'))}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href={`/${locale}/services`}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  {cv('ctaSecondaryText', t('ctaSecondary'))}
                </Button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            {/* Illustration moderne avec statistiques */}
            <div className="relative w-full h-[500px]">
              {/* Blobs animés en arrière-plan */}
              <div className="absolute inset-0">
                <VibrantBg variant="default" />
                <div className="absolute top-20 left-10 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
                <div className="absolute top-40 right-10 w-64 h-64 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute bottom-20 left-20 w-64 h-64 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
                <AnimatedBlobRed className="top-10 right-20 w-96 h-96 opacity-40 animation-delay-1000" />
                <AnimatedBlobRed className="bottom-10 left-10 w-80 h-80 opacity-30 animation-delay-3000" />
              </div>

              {/* Statistiques flottantes */}
              <div className="relative h-full flex items-center justify-center">
                <div className="grid grid-cols-2 gap-6 max-w-md">
                  {heroStats.length > 0 ? (
                    heroStats.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100"
                      >
                        <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
                          {s.value}
                        </div>
                        <div className="text-sm text-gray-600">{s.label}</div>
                      </motion.div>
                    ))
                  ) : (
                    <>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100"
                        ref={projectsCount.ref}
                      >
                        <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
                          {projectsCount.count}+
                        </div>
                        <div className="text-sm text-gray-600">{t('stats.projects')}</div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100"
                        ref={satisfactionCount.ref}
                      >
                        <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
                          {satisfactionCount.count}%
                        </div>
                        <div className="text-sm text-gray-600">{t('stats.satisfaction')}</div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100"
                      >
                        <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
                          24/7
                        </div>
                        <div className="text-sm text-gray-600">Support</div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100"
                        ref={experienceCount.ref}
                      >
                        <div className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
                          {experienceCount.count}+
                        </div>
                        <div className="text-sm text-gray-600">{t('stats.experience')}</div>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
    </>
  );
}
