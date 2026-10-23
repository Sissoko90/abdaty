'use client';

import { useTranslations } from 'next-intl';
import { Target, Eye } from 'lucide-react';
import { usePublicSection } from '@/hooks/use-public-content';

export function MissionVision() {
  const t = useTranslations('about');
  // Contenu géré dans l'admin (section "about"), avec repli i18n.
  const { cv } = usePublicSection('about');

  return (
    <section className="py-20 lg:py-28">
      <div className="site-container">
        <div className="grid gap-5 md:grid-cols-2">
          <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-8 dark:border-white/10 dark:bg-white/[0.03] lg:p-10">
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
              <Target className="h-7 w-7" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-ink dark:text-white">{t('mission')}</h2>
            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">{cv('mission', t('missionText'))}</p>
          </article>

          <article className="bogolan-texture flex h-full flex-col rounded-2xl bg-ink p-8 text-white ring-1 ring-ink dark:ring-white/10 lg:p-10">
            <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-ochre text-ink">
              <Eye className="h-7 w-7" />
            </div>
            <h2 className="mb-4 text-3xl font-bold">{t('vision')}</h2>
            <p className="text-lg leading-relaxed text-gray-300">{cv('vision', t('visionText'))}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
