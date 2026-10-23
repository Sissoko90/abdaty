import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, MessageSquare } from 'lucide-react';

export default async function NotFound({ params }: { params?: Promise<{ locale?: string }> }) {
  const locale = (await params)?.locale || 'fr';
  const t = await getTranslations('notFound');

  const suggestions = [
    { href: `/${locale}/services`, label: t('services') },
    { href: `/${locale}/about`, label: t('about') },
    { href: `/${locale}/blog`, label: t('blog') },
    { href: `/${locale}/faq`, label: t('faq') },
  ];

  return (
    <main>
      <section className="pb-20 pt-32 lg:pb-28 lg:pt-40">
        <div className="site-container grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h1 className="mb-6 text-5xl font-extrabold leading-[1.05] text-ink dark:text-white md:text-6xl">{t('title')}</h1>
            <p className="mb-9 max-w-xl text-lg leading-relaxed text-gray-600 dark:text-gray-300">{t('description')}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={`/${locale}`}>
                <Button size="lg" className="w-full gap-2 sm:w-auto">
                  <Home className="h-5 w-5" />
                  {t('backHome')}
                </Button>
              </Link>
              <Link href={`/${locale}/contact`}>
                <Button size="lg" variant="outline" className="w-full gap-2 border-gray-300 bg-white sm:w-auto dark:border-white/15 dark:bg-white/5 dark:text-white">
                  <MessageSquare className="h-5 w-5" />
                  {t('contact')}
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
              <span className="font-display text-[8rem] font-extrabold leading-none text-ochre sm:text-[10rem]">404</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
