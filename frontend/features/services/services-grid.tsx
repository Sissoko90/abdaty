'use client';

import type { Route } from 'next';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
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

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = resolveServiceIcon(service.icon);
            const href = `/${locale}/services${service.slug ? `/${service.slug}` : ''}`;
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={href as Route}>
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary-200 group cursor-pointer">
                    <CardHeader>
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl flex items-center justify-between">
                        {service.title}
                        <ArrowRight className="w-5 h-5 text-primary-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </CardTitle>
                      <CardDescription className="text-base">{service.description}</CardDescription>
                    </CardHeader>
                    {service.features.length > 0 && (
                      <CardContent>
                        <ul className="space-y-3">
                          {service.features.filter(Boolean).map((feature, i) => (
                            <li key={i} className="flex items-start">
                              <span className="text-primary-600 mr-3 mt-1">✓</span>
                              <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    )}
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
