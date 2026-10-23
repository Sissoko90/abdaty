'use client';

import { useTranslations } from 'next-intl';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';
import { usePublicSection, usePublicList } from '@/hooks/use-public-content';
import { useContactDetails } from '@/hooks/use-contact-details';
import { resolveSocialIcon, socialLabel } from '@/lib/social-icons';

export function ContactInfo() {
  const t = useTranslations('contact.info');

  // Coordonnées gérées dans l'admin (section "contact"), avec repli.
  const { cv } = usePublicSection('contact');
  const contact = useContactDetails();

  const contactDetails = [
    { icon: Mail, key: 'email', value: contact.email, link: contact.emailHref },
    { icon: Phone, key: 'phone', value: contact.phone, link: contact.phoneHref },
    { icon: MapPin, key: 'address', value: contact.address, link: null },
    { icon: Clock, key: 'hours', value: cv('hours', t('hoursValue')), link: null },
  ];

  // Réseaux sociaux (section "socials", actifs uniquement) — partagés avec le footer.
  const socialItems = usePublicList('socials');
  const socials = socialItems
    .filter((s) => s.url && s.platform)
    .map((s) => ({ platform: s.platform as string, url: s.url as string, label: (s.label as string) || '' }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-3 text-3xl font-bold text-ink dark:text-white">{cv('title', t('title'))}</h2>
        <p className="leading-relaxed text-gray-600 dark:text-gray-300">{cv('description', t('description'))}</p>
      </div>

      <ul className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-white/[0.03]">
        {contactDetails.map((detail) => {
          const Icon = detail.icon;
          return (
            <li key={detail.key} className="flex items-start gap-4 p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm text-gray-500 dark:text-gray-400">{t(detail.key)}</p>
                {detail.link ? (
                  <a href={detail.link} className="break-words font-semibold text-ink hover:text-primary-600 dark:text-white dark:hover:text-primary-400">
                    {detail.value}
                  </a>
                ) : (
                  <p className="font-semibold text-ink dark:text-white">{detail.value}</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {socials.length > 0 && (
        <div>
          <h3 className="mb-3 text-base font-semibold text-ink dark:text-white">
            {t.has('followUs') ? t('followUs') : 'Suivez-nous'}
          </h3>
          <div className="flex flex-wrap gap-2">
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
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 transition-colors hover:border-primary-600 hover:bg-primary-600 hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-gray-300"
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </div>
      )}

      <div className="bogolan-texture rounded-2xl bg-ink p-8 text-white dark:ring-1 dark:ring-white/10">
        <h3 className="mb-3 text-2xl font-bold">{t('cta.title')}</h3>
        <p className="mb-6 leading-relaxed text-gray-300">{t('cta.description')}</p>
        <p className="flex items-center gap-2 text-sm font-semibold text-ochre">
          <Clock className="h-5 w-5" />
          {t('cta.responseTime')}
        </p>
      </div>
    </div>
  );
}
