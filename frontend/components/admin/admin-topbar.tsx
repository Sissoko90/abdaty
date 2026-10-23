'use client';

import type { Route } from 'next';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { ExternalLink, Menu } from 'lucide-react';
import { NotificationBell } from '@/components/notification-bell';
import { ThemeToggle } from '@/components/theme-toggle';

/** Barre supérieure de l'admin : menu (mobile), lien vers le site, thème, langue, notifications. */
export function AdminTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (next: string) => {
    if (next === locale) return;
    const currentPath = pathname.replace(`/${locale}`, '');
    router.push(`/${next}${currentPath}` as Route);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-gray-200 bg-white/85 px-4 backdrop-blur-md dark:border-white/10 dark:bg-[#0b1322]/85 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuClick}
        aria-label={locale === 'fr' ? 'Ouvrir le menu' : 'Open menu'}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-ink hover:bg-gray-100 dark:text-white dark:hover:bg-white/10 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="ml-auto flex items-center gap-2">
        <a
          href={`/${locale}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-ink dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white sm:inline-flex"
        >
          <ExternalLink className="h-4 w-4" />
          {locale === 'fr' ? 'Voir le site' : 'View site'}
        </a>
        <div className="flex rounded-xl bg-gray-100 p-1 dark:bg-white/5" role="group" aria-label="Langue">
          {['fr', 'en'].map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => switchLocale(code)}
              aria-pressed={locale === code}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold uppercase transition-colors ${
                locale === code ? 'bg-white text-ink shadow-sm dark:bg-white/10 dark:text-white' : 'text-gray-500 hover:text-ink dark:text-gray-400 dark:hover:text-white'
              }`}
            >
              {code}
            </button>
          ))}
        </div>
        <ThemeToggle />
        <NotificationBell />
      </div>
    </header>
  );
}
