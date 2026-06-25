'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { usePublicSection } from '@/hooks/use-public-content';

export default function TermsOfServicePage() {
  const t = useTranslations('legal.termsOfService');
  const locale = useLocale();

  // Contenu géré dans l'admin (section "legal", clés terms.*).
  const { cv } = usePublicSection('legal');
  const baseTitle = cv('terms.title');
  const baseContent = cv('terms.content');
  const baseUpdated = cv('terms.lastUpdated');
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
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('acceptance.title')}</h2>
              <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{t('acceptance.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('services.title')}</h2>
              <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{t('services.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('userAccount.title')}</h2>
              <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{t('userAccount.content')}</p>
              <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700 dark:text-gray-300 transition-colors duration-300">
                <li>{t('userAccount.points.accuracy')}</li>
                <li>{t('userAccount.points.security')}</li>
                <li>{t('userAccount.points.responsibility')}</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('payment.title')}</h2>
              <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{t('payment.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('cancellation.title')}</h2>
              <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{t('cancellation.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('limitation.title')}</h2>
              <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{t('limitation.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('intellectual.title')}</h2>
              <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{t('intellectual.content')}</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('privacy.title')}</h2>
              <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{t('privacy.content')}</p>
              <Link href={`/${locale}/privacy-policy`} className="text-primary-600 dark:text-primary-400 hover:underline transition-colors duration-300">
                {t('privacy.link')}
              </Link>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('modifications.title')}</h2>
              <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{t('modifications.content')}</p>
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
