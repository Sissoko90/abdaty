'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { signOut } from 'next-auth/react';
import { LayoutDashboard, Key, MessageSquare, FileText, Settings, LogOut, type LucideIcon } from 'lucide-react';
import { AuthGuard } from '@/components/auth-guard';

/** Entrées de navigation de l'espace client. */
const NAV: { href: string; labelKey: string; icon: LucideIcon }[] = [
  { href: '', labelKey: 'nav.overview', icon: LayoutDashboard },
  { href: '/api-keys', labelKey: 'manageApiKeys', icon: Key },
  { href: '/sms-history', labelKey: 'smsHistoryLink', icon: MessageSquare },
  { href: '/billing', labelKey: 'billingLink', icon: FileText },
  { href: '/settings', labelKey: 'settingsLink', icon: Settings },
];

/**
 * Layout de l'espace dashboard : protège toutes les sous-pages et fournit la
 * navigation latérale (onglets défilants en mobile).
 * Redirige vers /login si la session est absente ou le token expiré.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('dashboard');
  const tNav = useTranslations('nav');
  const base = `/${locale}/dashboard`;

  const isActive = (href: string) => {
    const full = `${base}${href}`;
    return href === '' ? pathname === full || pathname === `${full}/` : pathname === full || pathname.startsWith(`${full}/`);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-paper pt-[72px]">
        <div className="site-container grid gap-8 py-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:py-10">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <nav
              aria-label={t('nav.label')}
              className="rounded-2xl border border-gray-200 bg-white p-2 dark:border-white/10 dark:bg-white/[0.03]"
            >
              <ul className="hide-scrollbar flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
                {NAV.map(({ href, labelKey, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <li key={href} className="shrink-0">
                      <Link
                        href={`${base}${href}` as Route}
                        aria-current={active ? 'page' : undefined}
                        className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                          active
                            ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-ink dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        {t(labelKey)}
                      </Link>
                    </li>
                  );
                })}
                <li className="shrink-0 lg:mt-2 lg:border-t lg:border-gray-100 lg:pt-2 lg:dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
                    className="flex w-full items-center gap-3 whitespace-nowrap rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-700 dark:text-gray-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    {tNav('logout')}
                  </button>
                </li>
              </ul>
            </nav>
          </aside>
          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </AuthGuard>
  );
}
