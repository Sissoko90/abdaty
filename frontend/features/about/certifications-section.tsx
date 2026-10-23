'use client';

import { useTranslations } from 'next-intl';
import { Shield, Lock, Award, CheckCircle, type LucideIcon } from 'lucide-react';
import { usePublicList } from '@/hooks/use-public-content';

const ICONS: Record<string, LucideIcon> = { Shield, Lock, Award, CheckCircle };

export function CertificationsSection() {
  const t = useTranslations('about.certifications');

  // Certifications gérées dans l'admin (section "about-certifications"), repli i18n.
  const backend = usePublicList('about-certifications');
  const certifications =
    backend.length > 0
      ? backend.map((c) => ({ Icon: ICONS[c.icon] || Shield, title: c.title as string, description: c.description as string, badge: c.badge as string }))
      : [
          { Icon: Shield, title: t('ssl.title'), description: t('ssl.description'), badge: 'SSL/TLS' },
          { Icon: Lock, title: t('pci.title'), description: t('pci.description'), badge: 'PCI-DSS' },
          { Icon: Award, title: t('iso.title'), description: t('iso.description'), badge: 'ISO 27001' },
          { Icon: CheckCircle, title: t('gdpr.title'), description: t('gdpr.description'), badge: 'RGPD' },
        ];

  return (
    <section className="bg-white py-20 dark:bg-white/[0.02] lg:py-28">
      <div className="site-container">
        <div className="mb-12">
          <h2 className="mb-4 text-4xl font-bold text-ink dark:text-white md:text-5xl">{t('title')}</h2>
          <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-300">{t('subtitle')}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {certifications.map((cert, index) => {
            const Icon = cert.Icon;
            return (
              <article
                key={`${cert.badge}-${index}`}
                className="h-full rounded-2xl border border-gray-200 bg-paper p-6 dark:border-white/10 dark:bg-white/[0.03]"
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                    <Icon className="h-6 w-6" />
                  </div>
                  {cert.badge && (
                    <span className="rounded-full bg-ochre/20 px-3 py-1 text-xs font-bold text-ink dark:text-ochre">{cert.badge}</span>
                  )}
                </div>
                <h3 className="mb-2 text-lg font-bold text-ink dark:text-white">{cert.title}</h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{cert.description}</p>
              </article>
            );
          })}
        </div>

        <div className="bogolan-texture mt-10 grid gap-8 rounded-3xl bg-ink p-8 text-white dark:ring-1 dark:ring-white/10 sm:p-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-7">
            <h3 className="mb-3 text-2xl font-bold">{t('cta.title')}</h3>
            <p className="leading-relaxed text-gray-300">{t('cta.description')}</p>
          </div>
          <ul className="space-y-3 lg:col-span-5 lg:border-l lg:border-white/10 lg:pl-10">
            {[t('cta.audit'), t('cta.compliance'), t('cta.security')].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm">
                <CheckCircle className="h-5 w-5 shrink-0 text-ochre" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
