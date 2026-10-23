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

  const suggestions = [
    { href: `/${locale}/contact`, label: t('contact') },
    { href: `/${locale}/faq`, label: t('faq') },
    { href: `/${locale}/services`, label: t('services') },
  ];

  return (
    <main>
      <section className="pb-20 pt-32 lg:pb-28 lg:pt-40">
        <div className="site-container grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <span className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <AlertTriangle className="h-7 w-7" />
            </span>
            <h1 className="mb-6 text-5xl font-extrabold leading-[1.05] text-ink dark:text-white md:text-6xl">{t('title')}</h1>
            <p className="mb-6 max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">{t('description')}</p>
            {error.message && (
              <p className="mb-8 max-w-xl break-words rounded-xl border border-gray-200 bg-white px-4 py-3 font-mono text-sm text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-400">
                {error.message}
              </p>
            )}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button onClick={reset} size="lg" className="w-full gap-2 sm:w-auto">
                <RefreshCw className="h-5 w-5" />
                {t('retry')}
              </Button>
              <Link href={`/${locale}`}>
                <Button size="lg" variant="outline" className="w-full gap-2 border-gray-300 bg-white sm:w-auto dark:border-white/15 dark:bg-white/5 dark:text-white">
                  <Home className="h-5 w-5" />
                  {t('backHome')}
                </Button>
              </Link>
            </div>
            <div className="mt-12 border-t border-gray-200 pt-8 dark:border-white/10">
              <p className="mb-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t('suggestions')}</p>
              <ul className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <li key={s.href}>
                    <Link
                      href={s.href as Parameters<typeof Link>[0]['href']}
                      className="inline-block rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-primary-300 hover:text-primary-700 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:text-primary-300"
                    >
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="lg:col-span-5" aria-hidden="true">
            <div className="bogolan-texture flex aspect-square items-center justify-center rounded-3xl bg-ink">
              <span className="font-display text-[8rem] font-extrabold leading-none text-ochre sm:text-[10rem]">500</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
