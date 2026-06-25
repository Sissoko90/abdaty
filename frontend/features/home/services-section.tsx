'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Code, Smartphone, Monitor, Palette, Network, Shield, Brain,
  Globe, Lock, TabletSmartphone, Server, Database, Cpu, Cloud,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';
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

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300"
          >
            {t('title')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-300"
          >
            {t('subtitle')}
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayServices.map((service, index) => {
            const Icon = service.icon;
            const card = (
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-2 hover:border-primary-200 cursor-pointer">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription>{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.slice(0, 4).map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <span className="text-primary-600 mr-2">✓</span>
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
            return (
              <motion.div
                key={service.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                {service.slug ? (
                  <Link href={`/${locale}/services/${service.slug}`}>{card}</Link>
                ) : (
                  card
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
