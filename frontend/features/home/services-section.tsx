'use client';

import type { Route } from 'next';
import { useTranslations, useLocale } from 'next-intl';
import {
  Code, Smartphone, Monitor, Palette, Network, Shield, Brain,
  Globe, Lock, TabletSmartphone, Server, Database, Cpu, Cloud,
  ArrowRight, ArrowUpRight, Check, MessageSquare,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePublicSection } from '@/hooks/use-public-content';
import type { SiteContent } from '@/types/content';

/** Services par défaut (repli i18n) avec leur icône et slug de page. */
const defaultServices = [
  { icon: Code, key: 'web', slug: 'web-development' },
  { icon: Smartphone, key: 'mobile', slug: 'mobile-apps' },
  { icon: Monitor, key: 'desktop', slug: 'desktop-apps' },
  { icon: Palette, key: 'design', slug: 'ui-ux-design' },
  { icon: Network, key: 'network', slug: 'network-infrastructure' },
  { icon: Shield, key: 'security', slug: 'cybersecurity' },
  { icon: Brain, key: 'dataAi', slug: 'data-ai' },
];

/**
 * Mappe le nom d'icône (stocké en base) vers le composant Lucide.
 * Couvre l'union des icônes utilisées par le seed ET par le sélecteur de l'admin
 * (Globe, TabletSmartphone, Server, Lock...). Recherche insensible à la casse.
 */
const ICONS: Record<string, LucideIcon> = {
  Code, Smartphone, Monitor, Palette, Network, Shield, Brain,
  Globe, Lock, TabletSmartphone, Server, Database, Cpu, Cloud,
};

/** Retourne le composant d'icône pour un nom donné (insensible à la casse), défaut Code. */
function resolveIcon(name?: string): LucideIcon {
  if (!name) return Code;
  if (ICONS[name]) return ICONS[name];
  const found = Object.keys(ICONS).find((k) => k.toLowerCase() === name.toLowerCase());
  return found ? ICONS[found] : Code;
}

/** Forme normalisée d'un service pour l'affichage. */
interface DisplayService {
  key: string;
  icon: LucideIcon;
  slug: string;
  title: string;
  description: string;
  features: string[];
}

// Classes statiques (Tailwind ne détecte pas les classes construites dynamiquement).
const LG_SPAN: Record<number, string> = { 1: 'lg:col-span-1', 2: 'lg:col-span-2', 3: 'lg:col-span-3' };

export function ServicesSection() {
  const t = useTranslations('services');
  const locale = useLocale();

  // Items gérés dans l'admin (section "services"), avec repli sur l'i18n.
  const { items } = usePublicSection('services');

  const backendServices: DisplayService[] = items
    .filter((b) => b.contentKey.startsWith('item-'))
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((b: SiteContent) => {
      let fr: { icon?: string; slug?: string; title?: string; description?: string; features?: string[] } = {};
      let en: { icon?: string; slug?: string; title?: string; description?: string; features?: string[] } = {};
      try { fr = b.valueFr ? JSON.parse(b.valueFr) : {}; } catch { /* ignore */ }
      try { en = b.valueEn ? JSON.parse(b.valueEn) : {}; } catch { /* ignore */ }
      const loc = locale === 'fr' ? fr : en;
      return {
        key: b.contentKey,
        icon: resolveIcon(fr.icon),
        slug: fr.slug ?? '',
        title: loc.title ?? fr.title ?? '',
        description: loc.description ?? fr.description ?? '',
        features: (loc.features ?? fr.features ?? []) as string[],
      };
    });

  const displayServices: DisplayService[] =
    backendServices.length > 0
      ? backendServices
      : defaultServices.map((s) => ({
          key: s.key,
          icon: s.icon,
          slug: s.slug,
          title: t(`${s.key}.title`),
          description: t(`${s.key}.description`),
          features: [0, 1, 2, 3].map((i) => t(`${s.key}.features.${i}`)),
        }));

  // Grille sans trou : le 1er service est mis en avant (2 rangées en desktop,
  // 2 colonnes en tablette) et la tuile « sur mesure » comble la dernière ligne.
  const [featured, ...rest] = displayServices;
  const hasFeatured = displayServices.length >= 4;
  const regular = hasFeatured ? rest : displayServices;
  const cells = regular.length + (hasFeatured ? 2 : 0) + 1;
  const ctaSpanLg = 1 + ((3 - (cells % 3)) % 3);
  const ctaSpanMd = cells % 2 === 1 ? 'md:col-span-2' : '';

  const href = (s: DisplayService) => `/${locale}/services/${s.slug}`;

  return (
    <section className="py-20 lg:py-28">
      <div className="site-container">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="mb-4 text-4xl font-bold text-ink dark:text-white md:text-5xl">{t('title')}</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">{t('subtitle')}</p>
          </div>
          <Link
            href={`/${locale}/services`}
            className="group inline-flex shrink-0 items-center gap-2 font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400"
          >
            {t('viewAll')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {hasFeatured && featured && (
            <ServiceLink service={featured} href={href(featured)} className="md:col-span-2 lg:col-span-1 lg:row-span-2">
              <div className="bogolan-texture flex h-full flex-col rounded-2xl bg-ink p-8 text-white ring-1 ring-ink transition-transform duration-300 group-hover:-translate-y-1 dark:ring-white/10">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-ochre text-ink">
                  <featured.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-2xl font-bold">{featured.title}</h3>
                <p className="mb-6 leading-relaxed text-gray-300">{featured.description}</p>
                <ul className="mb-8 space-y-3">
                  {featured.features.slice(0, 4).map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-200">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-ochre" />
                      {f}
                    </li>
                  ))}
                </ul>
                <span className="mt-auto inline-flex items-center gap-2 font-semibold text-ochre">
                  {t('learnMore')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </ServiceLink>
          )}

          {regular.map((service) => {
            const Icon = service.icon;
            return (
              <ServiceLink key={service.key} service={service} href={href(service)}>
                <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary-300 group-hover:shadow-xl group-hover:shadow-primary-600/5 dark:border-white/10 dark:bg-white/[0.03] dark:group-hover:border-primary-500/40">
                  <div className="mb-5 flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white dark:bg-primary-500/10 dark:text-primary-400">
                      <Icon className="h-6 w-6" />
                    </div>
                    <ArrowUpRight className="h-5 w-5 text-gray-300 transition-colors group-hover:text-primary-600 dark:text-gray-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-ink dark:text-white">{service.title}</h3>
                  <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{service.description}</p>
                  {service.features.length > 0 && (
                    <ul className="mt-auto flex flex-wrap gap-2">
                      {service.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-white/5 dark:text-gray-300">
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </ServiceLink>
            );
          })}

          <Link href={`/${locale}/contact`} className={`group block ${LG_SPAN[ctaSpanLg]} ${ctaSpanMd}`}>
            <div className="flex h-full min-h-[220px] flex-col justify-between gap-6 rounded-2xl bg-primary-600 p-6 text-white transition-colors group-hover:bg-primary-700">
              <MessageSquare className="h-8 w-8 text-white/80" />
              <div>
                <h3 className="mb-2 text-xl font-bold">{t('customTitle')}</h3>
                <p className="mb-5 max-w-md text-sm leading-relaxed text-primary-100">{t('customText')}</p>
                <span className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-primary-700">
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

/** Enveloppe une carte de service dans un lien si le service a une page dédiée. */
function ServiceLink({
  service,
  href,
  className = '',
  children,
}: {
  service: DisplayService;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (!service.slug) return <div className={`group ${className}`}>{children}</div>;
  return (
    <Link href={href as Route} className={`group block ${className}`}>
      {children}
    </Link>
  );
}
