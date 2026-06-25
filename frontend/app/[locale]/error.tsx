'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-red-950 flex items-center justify-center px-4 py-20 transition-colors duration-300">
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-24 h-24 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h1 className="text-9xl font-bold text-red-600 dark:text-red-500 mb-4">500</h1>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 transition-colors duration-300">
            {t('description')}
          </p>
          {error.message && (
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-4 font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded transition-colors duration-300">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            onClick={reset}
            size="lg"
            className="gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            {t('retry')}
          </Button>
          
          <Link href={`/${locale}`}>
            <Button size="lg" variant="outline" className="gap-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 transition-colors duration-300">
              <Home className="w-5 h-5" />
              {t('backHome')}
            </Button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300">{t('suggestions')}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href={`/${locale}/contact`} className="text-primary-600 dark:text-primary-400 hover:underline transition-colors duration-300">
              {t('contact')}
            </Link>
            <span className="text-gray-400 dark:text-gray-600">•</span>
            <Link href={`/${locale}/faq`} className="text-primary-600 dark:text-primary-400 hover:underline transition-colors duration-300">
              {t('faq')}
            </Link>
            <span className="text-gray-400 dark:text-gray-600">•</span>
            <Link href={`/${locale}/services`} className="text-primary-600 dark:text-primary-400 hover:underline transition-colors duration-300">
              {t('services')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
