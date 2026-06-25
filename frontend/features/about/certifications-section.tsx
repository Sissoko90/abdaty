'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, Award, CheckCircle, type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('title')}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">{t('subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {certifications.map((cert, index) => {
            const Icon = cert.Icon;
            return (
              <motion.div
                key={cert.badge}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary-200">
                  <CardContent className="p-6">
                    <div className="relative mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {cert.badge}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{cert.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">{cert.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white border-0">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">{t('cta.title')}</h3>
              <p className="text-primary-100 mb-6">{t('cta.description')}</p>
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">{t('cta.audit')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">{t('cta.compliance')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm">{t('cta.security')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
