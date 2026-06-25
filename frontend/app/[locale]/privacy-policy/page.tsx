'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { usePublicSection } from '@/hooks/use-public-content';

export default function PrivacyPolicyPage() {
  const t = useTranslations('legal.privacyPolicy');
  const locale = useLocale();

  // Contenu géré dans l'admin (section "legal", clés privacy.*). Si renseigné,
  // il remplace le contenu i18n statique.
  const { cv } = usePublicSection('legal');
  const baseTitle = cv('privacy.title');
  const baseContent = cv('privacy.content');
  const baseUpdated = cv('privacy.lastUpdated');
  const hasBase = baseContent.trim().length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <main className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <Link href={`/${locale}`} className="text-primary-600 dark:text-primary-400 hover:underline transition-colors duration-300">
              ← {t('backToHome')}
            </Link>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">{baseTitle || t('title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 transition-colors duration-300">
            {baseUpdated ? `${locale === 'fr' ? 'Dernière mise à jour' : 'Last updated'} : ${baseUpdated}` : t('lastUpdated')}
          </p>

          {hasBase ? (
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-line text-gray-700 dark:text-gray-300 transition-colors duration-300">{baseContent}</div>
            </div>
          ) : (
          <div className="prose prose-lg max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('introduction.title')}</h2>
              <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{t('introduction.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('information.title')}</h2>
              <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{t('information.content')}</p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                <li>{t('information.points.personal')}</li>
                <li>{t('information.points.contact')}</li>
                <li>{t('information.points.usage')}</li>
                <li>{t('information.points.payment')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('collection.title')}</h2>
              <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{t('collection.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('usage.title')}</h2>
              <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{t('usage.content')}</p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                <li>{t('usage.points.service')}</li>
                <li>{t('usage.points.communication')}</li>
                <li>{t('usage.points.security')}</li>
                <li>{t('usage.points.analytics')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('sharing.title')}</h2>
              <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{t('sharing.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('security.title')}</h2>
              <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{t('security.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('cookies.title')}</h2>
              <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{t('cookies.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('rights.title')}</h2>
              <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{t('rights.content')}</p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                <li>{t('rights.points.access')}</li>
                <li>{t('rights.points.correction')}</li>
                <li>{t('rights.points.deletion')}</li>
                <li>{t('rights.points.objection')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('retention.title')}</h2>
              <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{t('retention.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('gdpr.title')}</h2>
              <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{t('gdpr.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('contact.title')}</h2>
              <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{t('contact.content')}</p>
              <Link href={`/${locale}/contact`} className="text-primary-600 dark:text-primary-400 hover:underline transition-colors duration-300">
                {t('contact.link')}
              </Link>
            </section>
          </div>
          )}
        </div>
      </main>
    </div>
  );
}
