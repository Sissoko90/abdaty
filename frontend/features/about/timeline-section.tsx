'use client';

import { useTranslations } from 'next-intl';
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
    <section className="py-20 lg:py-28">
      <div className="site-container grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h2 className="mb-4 text-4xl font-bold text-ink dark:text-white md:text-5xl">{t('title')}</h2>
            <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-300">{t('subtitle')}</p>
          </div>
        </div>

        <ol className="relative lg:col-span-8">
          {/* Fil chronologique */}
          <span aria-hidden="true" className="absolute bottom-2 left-[7px] top-2 w-0.5 bg-gray-200 dark:bg-white/10" />
          {displayTimeline.map((item, index) => {
            const last = index === displayTimeline.length - 1;
            return (
              <li key={item.key} className={`relative pl-10 ${last ? '' : 'pb-10'}`}>
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-1.5 h-4 w-4 rounded-full ring-4 ring-paper ${last ? 'bg-primary-600' : 'bg-ochre'}`}
                />
                <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]">
                  <p className="mb-1 font-display text-2xl font-bold text-primary-600 dark:text-primary-400">{item.year}</p>
                  <h3 className="mb-2 text-xl font-bold text-ink dark:text-white">{item.title}</h3>
                  <p className="leading-relaxed text-gray-600 dark:text-gray-400">{item.description}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
