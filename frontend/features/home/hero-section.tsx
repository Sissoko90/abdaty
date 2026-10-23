'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useCounter } from '@/hooks/use-counter';
import { usePublicSection } from '@/hooks/use-public-content';
import { HeroVisual } from './hero-visual';

export function HeroSection() {
  const t = useTranslations('hero');
  const locale = useLocale();
  const reduce = useReducedMotion();

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

  // Repli : compteurs animés si aucun chiffre n'est saisi dans l'admin.
  const projectsCount = useCounter(500);
  const clientsCount = useCounter(200);
  const experienceCount = useCounter(10);
  const satisfactionCount = useCounter(99);
  const fallbackStats = [
    { ref: projectsCount.ref, value: `${projectsCount.count}+`, label: t('stats.projects') },
    { ref: clientsCount.ref, value: `${clientsCount.count}+`, label: t('stats.clients') },
    { ref: experienceCount.ref, value: `${experienceCount.count}+`, label: t('stats.experience') },
    { ref: satisfactionCount.ref, value: `${satisfactionCount.count}%`, label: t('stats.satisfaction') },
  ];
  const stats = heroStats.length > 0 ? heroStats.map((s) => ({ ...s, ref: undefined })) : fallbackStats;

  const fade = (delay: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay } };

  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-28 sm:pt-32 lg:pb-24 lg:pt-36">
        {/* Halo de couleur primaire + trame de points, discrets */}
        <div className="pointer-events-none absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-primary-400/20 blur-3xl dark:bg-primary-600/20" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35] dark:opacity-[0.12]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgb(15 27 45 / 0.12) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage: 'linear-gradient(to bottom, black, transparent 85%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 85%)',
          }}
        />

        <div className="site-container relative grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <motion.div
              {...fade(0)}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-3.5 py-1.5 text-sm font-medium text-primary-700 shadow-sm dark:border-primary-500/30 dark:bg-white/5 dark:text-primary-300"
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ochre opacity-75 motion-reduce:hidden" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-ochre" />
              </span>
              {cv('subtitle', t('subtitle'))}
            </motion.div>

            <motion.h1
              {...fade(0.05)}
              className="mb-6 text-[2.75rem] font-extrabold leading-[1.04] text-ink dark:text-white sm:text-6xl lg:text-[4.25rem]"
            >
              {cv('title', t('title'))}
            </motion.h1>

            <motion.p {...fade(0.1)} className="mb-9 max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              {cv('description', t('description'))}
            </motion.p>

            <motion.div {...fade(0.15)} className="flex flex-col gap-3 sm:flex-row">
              <Link href={`/${locale}/contact#contact-form`} className={cn(buttonVariants({ size: 'lg' }), 'group w-full sm:w-auto')}>
                {cv('ctaText', t('cta'))}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href={`/${locale}/services`}
                className={cn(
                  buttonVariants({ size: 'lg', variant: 'outline' }),
                  'w-full border-gray-300 bg-white/70 sm:w-auto dark:border-white/15 dark:bg-white/5'
                )}
              >
                {cv('ctaSecondaryText', t('ctaSecondary'))}
              </Link>
            </motion.div>

            <dl className="mt-12 grid grid-cols-2 gap-y-6 border-t border-gray-200 pt-8 sm:grid-cols-4 dark:border-white/10">
              {stats.map((s, i) => (
                <div
                  key={i}
                  ref={s.ref}
                  className={`flex flex-col-reverse justify-end pr-4 ${i > 0 ? 'sm:border-l sm:border-gray-200 sm:pl-5 sm:dark:border-white/10' : ''}`}
                >
                  <dt className="text-sm text-gray-500 dark:text-gray-400">{s.label}</dt>
                  <dd className="font-display text-3xl font-bold text-ink dark:text-white">{s.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="lg:col-span-6">
            <HeroVisual />
          </div>
        </div>
      </section>
      <div className="bogolan-band" />
    </>
  );
}
