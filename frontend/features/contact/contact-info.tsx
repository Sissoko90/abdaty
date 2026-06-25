'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePublicSection, usePublicList } from '@/hooks/use-public-content';
import { resolveSocialIcon, socialLabel } from '@/lib/social-icons';

const contactDetails = [
  {
    icon: Mail,
    key: 'email',
    value: 'contact@abdatytch.com',
    link: 'mailto:contact@abdatytch.com',
  },
  {
    icon: Phone,
    key: 'phone',
    value: '+223 76 71 41 42',
    link: 'tel:+22376714142',
  },
  {
    icon: MapPin,
    key: 'address',
    value: 'Hamdallaye, Bamako Mali',
    link: null,
  },
  {
    icon: Clock,
    key: 'hours',
    value: null,
    link: null,
  },
];

export function ContactInfo() {
  const t = useTranslations('contact.info');

  // Coordonnées gérées dans l'admin (section "contact"), avec repli.
  const { cv } = usePublicSection('contact');

  // Réseaux sociaux (section "socials", actifs uniquement) — partagés avec le footer.
  const socialItems = usePublicList('socials');
  const socials = socialItems
    .filter((s) => s.url && s.platform)
    .map((s) => ({ platform: s.platform as string, url: s.url as string, label: (s.label as string) || '' }));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{cv('title', t('title'))}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 transition-colors duration-300">
          {cv('description', t('description'))}
        </p>
      </div>

      <div className="space-y-4">
        {contactDetails.map((detail, index) => {
          const Icon = detail.icon;
          const fallbackValue = detail.value || (detail.key === 'hours' ? t('hoursValue') : '');
          const displayValue = cv(detail.key, fallbackValue);
          const content = (
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1 transition-colors duration-300">{t(detail.key)}</h3>
                    <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{displayValue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );

          return (
            <motion.div
              key={detail.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {detail.link ? (
                <a href={detail.link} className="block">
                  {content}
                </a>
              ) : (
                content
              )}
            </motion.div>
          );
        })}
      </div>

      {socials.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 transition-colors duration-300">
            {t.has('followUs') ? t('followUs') : 'Suivez-nous'}
          </h3>
          <div className="flex flex-wrap gap-3">
            {socials.map((s, i) => {
              const Icon = resolveSocialIcon(s.platform);
              return (
                <a
                  key={`${s.platform}-${i}`}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label || socialLabel(s.platform)}
                  title={s.label || socialLabel(s.platform)}
                  className="w-11 h-11 rounded-lg bg-primary-100 dark:bg-gray-800 flex items-center justify-center text-primary-600 dark:text-primary-400 hover:bg-primary-600 hover:text-white transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        </div>
      )}

      <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white border-0">
        <CardContent className="p-8">
          <h3 className="text-2xl font-bold mb-4">{t('cta.title')}</h3>
          <p className="text-primary-100 mb-6">
            {t('cta.description')}
          </p>
          <div className="flex items-center gap-2 text-primary-100">
            <Clock className="w-5 h-5" />
            <span>{t('cta.responseTime')}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
