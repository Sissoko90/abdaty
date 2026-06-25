import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

export default async function NotFound({ params }: { params?: Promise<{ locale?: string }> }) {
  const locale = (await params)?.locale || 'fr';
  const t = await getTranslations('notFound');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-red-950 flex items-center justify-center px-4 py-20 transition-colors duration-300">
      <div className="text-center max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="mb-8 animate-in zoom-in duration-500 delay-100">
          <h1 className="text-9xl font-bold text-primary-600 mb-4 animate-bounce">404</h1>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300 animate-in slide-in-from-top-2 duration-500 delay-200">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 transition-colors duration-300 animate-in fade-in duration-500 delay-300">
            {t('description')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in slide-in-from-bottom-2 duration-500 delay-400">
          <Link href={`/${locale}`}>
            <Button size="lg" className="gap-2 hover:scale-105 transition-transform duration-200">
              <Home className="w-5 h-5" />
              {t('backHome')}
            </Button>
          </Link>
          
          <Link href={`/${locale}/contact`}>
            <Button size="lg" variant="outline" className="gap-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 transition-colors duration-300 hover:scale-105 transition-transform duration-200">
              <Search className="w-5 h-5" />
              {t('contact')}
            </Button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300 animate-in fade-in duration-500 delay-500">
          <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300">{t('suggestions')}</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href={`/${locale}/services`} className="text-primary-600 dark:text-primary-400 hover:underline transition-colors duration-300 hover:scale-110 transition-transform duration-200">
              {t('services')}
            </Link>
            <span className="text-gray-400 dark:text-gray-600">•</span>
            <Link href={`/${locale}/about`} className="text-primary-600 dark:text-primary-400 hover:underline transition-colors duration-300 hover:scale-110 transition-transform duration-200">
              {t('about')}
            </Link>
            <span className="text-gray-400 dark:text-gray-600">•</span>
            <Link href={`/${locale}/blog`} className="text-primary-600 dark:text-primary-400 hover:underline transition-colors duration-300 hover:scale-110 transition-transform duration-200">
              {t('blog')}
            </Link>
            <span className="text-gray-400 dark:text-gray-600">•</span>
            <Link href={`/${locale}/faq`} className="text-primary-600 dark:text-primary-400 hover:underline transition-colors duration-300 hover:scale-110 transition-transform duration-200">
              {t('faq')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
