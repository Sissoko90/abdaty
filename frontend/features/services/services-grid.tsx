'use client';

import type { Route } from 'next';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Check, MessageSquare } from 'lucide-react';
import { usePublicList } from '@/hooks/use-public-content';
import { resolveServiceIcon } from '@/lib/service-icons';

/**
 * Repli statique utilisé uniquement si la base ne renvoie aucun service
 * (backend indisponible ou section vide). Les clés pointent vers les
 * traductions i18n `services.*`.
 */
const fallbackServices = [
  { icon: 'Code', key: 'web', slug: 'web-development' },
  { icon: 'Smartphone', key: 'mobile', slug: 'mobile-apps' },
  { icon: 'Monitor', key: 'desktop', slug: 'desktop-apps' },
  { icon: 'Palette', key: 'design', slug: 'ui-ux-design' },
  { icon: 'Network', key: 'network', slug: 'network-infrastructure' },
  { icon: 'Shield', key: 'security', slug: 'cybersecurity' },
  { icon: 'TrendingUp', key: 'data', slug: 'data-ai' },
];

// Classes statiques (Tailwind ne détecte pas les classes construites dynamiquement).
const LG_SPAN: Record<number, string> = { 1: 'lg:col-span-1', 2: 'lg:col-span-2', 3: 'lg:col-span-3' };

export function ServicesGrid() {
  const t = useTranslations('services');
  const locale = useLocale();

  // Services gérés dans l'admin (le backend ne renvoie que les services actifs,
  // déjà fusionnés pour la locale courante par usePublicList).
  const dbServices = usePublicList('services');

  // Normalisation : on construit une liste homogène, qu'elle vienne de la base
  // ou du repli statique, pour partager le même rendu.
  const services =
    dbServices.length > 0
      ? dbServices
          .filter((s) => s.title)
          .map((s) => ({
            id: s.id,
            icon: s.icon as string | undefined,
            title: s.title as string,
            description: (s.description as string) ?? (s.subtitle as string) ?? '',
            features: Array.isArray(s.features) ? (s.features as string[]) : [],
            slug: s.slug ? (s.slug as string) : '',
          }))
      : fallbackServices.map((s) => ({
          id: s.key,
          icon: s.icon,
          title: t(`${s.key}.title`),
          description: t(`${s.key}.description`),
          features: [0, 1, 2, 3].map((i) => t(`${s.key}.features.${i}`)),
          slug: s.slug,
        }));

  // La tuile « sur mesure » comble la dernière ligne de la grille (pas de trou).
  const cells = services.length + 1;
  const ctaSpanLg = 1 + ((3 - (cells % 3)) % 3);
  const ctaSpanMd = cells % 2 === 1 ? 'md:col-span-2' : '';

  return (
    <section className="py-20 lg:py-28">
      <div className="site-container">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => {
            const Icon = resolveServiceIcon(service.icon);
            const href = `/${locale}/services${service.slug ? `/${service.slug}` : ''}`;
            const features = service.features.filter(Boolean);
            return (
              <Link key={service.id} href={href as Route} className="group block">
                <article className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary-300 group-hover:shadow-xl group-hover:shadow-primary-600/5 dark:border-white/10 dark:bg-white/[0.03] dark:group-hover:border-primary-500/40 sm:p-7">
                  <div className="mb-6 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white dark:bg-primary-500/10 dark:text-primary-400">
                      <Icon className="h-6 w-6" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-primary-600 dark:text-gray-600" />
                  </div>
                  <h2 className="mb-3 text-2xl font-bold text-ink dark:text-white">{service.title}</h2>
                  <p className="mb-6 leading-relaxed text-gray-600 dark:text-gray-400">{service.description}</p>
                  {features.length > 0 && (
                    <ul className="mt-auto space-y-2.5 border-t border-gray-100 pt-5 dark:border-white/10">
                      {features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary-600 dark:text-primary-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              </Link>
            );
          })}

          <Link href={`/${locale}/contact`} className={`group block ${LG_SPAN[ctaSpanLg]} ${ctaSpanMd}`}>
            <div className="bogolan-texture flex h-full min-h-[240px] flex-col justify-between gap-6 rounded-2xl bg-ink p-7 text-white">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ochre text-ink">
                <MessageSquare className="h-6 w-6" />
              </span>
              <div>
                <h2 className="mb-2 text-2xl font-bold">{t('customTitle')}</h2>
                <p className="mb-6 max-w-md leading-relaxed text-gray-300">{t('customText')}</p>
                <span className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors group-hover:bg-primary-700">
                  {t('customCta')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
