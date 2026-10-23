'use client';

import { useTranslations } from 'next-intl';
import { motion, useReducedMotion } from 'framer-motion';
import { CheckCheck, Lock, ShoppingBag } from 'lucide-react';

/**
 * Composition du hero : une fenêtre de site web et un téléphone qui reçoit un
 * SMS envoyé via l'API. Montre concrètement ce que l'agence livre (web, mobile,
 * SMS) plutôt que des chiffres. Une seule séquence d'animation au chargement.
 */
export function HeroVisual() {
  const t = useTranslations('hero.visual');
  const reduce = useReducedMotion();
  const enter = (delay: number, y = 24) =>
    reduce
      ? {}
      : { initial: { opacity: 0, y }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const } };

  return (
    <div className="relative mx-auto h-[420px] w-full max-w-[560px] sm:h-[480px]" aria-hidden="true">
      {/* Fenêtre navigateur */}
      <motion.div
        {...enter(0.1)}
        className="absolute left-0 top-4 w-[88%] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-ink/10 dark:border-white/10 dark:bg-[#121c2e]"
      >
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 dark:border-white/10">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary-500" />
            <span className="h-2.5 w-2.5 rounded-full bg-ochre" />
            <span className="h-2.5 w-2.5 rounded-full bg-gray-300 dark:bg-white/20" />
          </div>
          <div className="flex flex-1 items-center gap-2 rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-500 dark:bg-white/5 dark:text-gray-400">
            <Lock className="h-3 w-3" />
            {t('url')}
          </div>
        </div>
        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="h-3 w-20 rounded-full bg-ink/80 dark:bg-white/70" />
            <div className="flex gap-3">
              <div className="h-2 w-10 rounded-full bg-gray-200 dark:bg-white/15" />
              <div className="h-2 w-10 rounded-full bg-gray-200 dark:bg-white/15" />
              <div className="h-2 w-10 rounded-full bg-gray-200 dark:bg-white/15" />
            </div>
          </div>
          <div className="grid grid-cols-5 items-center gap-4">
            <div className="col-span-3 space-y-3">
              <p className="font-display text-lg font-bold leading-tight text-ink dark:text-white sm:text-xl">{t('siteTitle')}</p>
              <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-white/10" />
              <div className="h-2 w-4/5 rounded-full bg-gray-100 dark:bg-white/10" />
              <div className="inline-flex h-8 w-28 items-center justify-center rounded-lg bg-primary-600">
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="bogolan-texture col-span-2 aspect-square rounded-xl bg-ochre/90" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2 rounded-lg border border-gray-100 p-3 dark:border-white/10">
                <div className={`h-12 rounded-md ${i === 1 ? 'bg-primary-100 dark:bg-primary-500/20' : 'bg-gray-100 dark:bg-white/10'}`} />
                <div className="h-1.5 w-3/4 rounded-full bg-gray-200 dark:bg-white/15" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Téléphone */}
      <motion.div
        {...enter(0.35, 48)}
        className="absolute bottom-0 right-0 w-[46%] max-w-[220px] rounded-[2.25rem] bg-ink p-2 shadow-2xl shadow-ink/30 ring-1 ring-white/10"
      >
        <div className="relative overflow-hidden rounded-[1.8rem] bg-paper px-3 pb-6 pt-8 dark:bg-[#0b1322]">
          <div className="absolute left-1/2 top-2 h-4 w-16 -translate-x-1/2 rounded-full bg-ink" />
          <p className="mb-3 text-center text-[10px] font-medium text-gray-500">{t('today')} 09:41</p>
          <motion.div
            {...(reduce
              ? {}
              : { initial: { opacity: 0, scale: 0.85 }, animate: { opacity: 1, scale: 1 }, transition: { delay: 1, type: 'spring' as const, stiffness: 260, damping: 20 } })}
            className="origin-bottom-left rounded-2xl rounded-bl-md bg-white p-3 shadow-md dark:bg-[#18243a]"
          >
            <p className="mb-1 text-[11px] font-bold tracking-wide text-primary-600">{t('smsSender')}</p>
            <p className="text-[12px] leading-snug text-ink dark:text-gray-100">{t('smsText')}</p>
          </motion.div>
          <motion.p
            {...(reduce ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 1.4 } })}
            className="mt-2 flex items-center gap-1 text-[10px] font-medium text-emerald-600"
          >
            <CheckCheck className="h-3 w-3" />
            {t('delivered')}
          </motion.p>
          <div className="mt-6 space-y-2">
            <div className="h-8 rounded-xl bg-white dark:bg-white/5" />
            <div className="h-8 w-4/5 rounded-xl bg-white dark:bg-white/5" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
