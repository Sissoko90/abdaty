'use client';

import { useTranslations } from 'next-intl';
import { ArrowDown } from 'lucide-react';
import { PageHero } from '@/components/page-hero';

/** Sections présentes dans la page (raccourcis vers les ancres de DocsContent). */
const QUICK_LINKS = ['introduction', 'installation', 'quickstart', 'authentication'];

export function DocsHero() {
  const t = useTranslations('docs');

  return (
    <PageHero title={t('hero.title')} subtitle={t('hero.subtitle')}>
      <div className="mt-8">
        <p className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">{t('ui.jumpTo')}</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_LINKS.map((id) => (
            <a
              key={id}
              href={`#${id}`}
              className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-primary-300 hover:text-primary-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:hover:border-primary-500/40 dark:hover:text-primary-300"
            >
              {t(`content.${id}.title`)}
              <ArrowDown className="h-3.5 w-3.5 text-gray-400 transition-transform group-hover:translate-y-0.5" />
            </a>
          ))}
        </div>
      </div>
    </PageHero>
  );
}
