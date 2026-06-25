'use client';

import type { Route } from 'next';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, ChevronDown, LogIn, LogOut, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/language-switcher';
import { ThemeToggle } from '@/components/theme-toggle';
import { usePublicSection, usePublicList } from '@/hooks/use-public-content';
import { useBranding } from '@/hooks/use-branding';

/** Un lien de navigation de premier niveau. */
interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

// Bouton de connexion masqué dans la navbar tant que l'espace utilisateur et
// l'API SMS ne sont pas prêts. Les administrateurs se connectent en allant
// directement sur /{locale}/login. Repasser à true pour le réactiver.
const LOGIN_ENABLED = false;

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logo } = useBranding();
  const { data: session, status } = useSession();
  // Une session dont le rafraîchissement a échoué (refresh token expiré/révoqué)
  // est techniquement « authenticated » côté NextAuth mais son access token est
  // mort : les pages protégées renverraient vers /login. On la traite donc comme
  // déconnectée pour ne pas afficher un bouton « Tableau de bord » trompeur.
  const isAuthenticated = status === 'authenticated' && session?.error !== 'RefreshAccessTokenError';
  // Espace de l'utilisateur selon son rôle : admin → /admin, sinon → /dashboard.
  const isAdminRole = (session?.user?.role || '').toString().toUpperCase() === 'ADMIN';
  const spaceHref = `/${locale}${isAdminRole ? '/admin' : '/dashboard'}`;

  // Liens de navigation gérés dans l'admin (section "navigation"). Le backend ne
  // renvoie que les items ACTIFS : créer un item le fait apparaître, le désactiver
  // le masque — sans toucher au code. Repli statique si la section est vide.
  const { items: navBlocks } = usePublicSection('navigation');
  const navItems: NavItem[] =
    navBlocks.filter((b) => b.contentKey.startsWith('item-')).length > 0
      ? navBlocks
          .filter((b) => b.contentKey.startsWith('item-'))
          .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
          .map((b) => {
            let d: { label?: { fr?: string; en?: string }; href?: string; isExternal?: boolean } = {};
            try {
              d = b.valueFr ? JSON.parse(b.valueFr) : {};
            } catch {
              /* ignore */
            }
            return {
              label: (locale === 'fr' ? d.label?.fr : d.label?.en) || '',
              href: d.href || '/',
              isExternal: !!d.isExternal,
            };
          })
          .filter((i) => i.label)
      : [
          { label: t('home'), href: '/' },
          { label: t('services'), href: '/services' },
          { label: t('docs'), href: '/docs' },
          { label: t('blog'), href: '/blog' },
          { label: t('about'), href: '/about' },
          { label: t('faq'), href: '/faq' },
          { label: t('contact'), href: '/contact' },
        ];

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setServicesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /** Construit l'URL locale-préfixée d'un href interne ("/" -> "/fr"). */
  const localized = (href: string) => `/${locale}${href === '/' ? '' : href}`;

  const isActive = (href: string) => {
    if (!mounted) return false;
    const full = localized(href); // '/fr' pour l'accueil, '/fr/about' sinon
    // Accueil : égalité stricte (sinon `/fr/...` matcherait toujours « Accueil »).
    if (href === '/') {
      return pathname === full || pathname === `${full}/`;
    }
    return pathname === full || pathname.startsWith(`${full}/`);
  };

  // Sous-menu Services alimenté UNIQUEMENT par la section "services" de la base
  // (le backend ne renvoie que les services actifs). Repli statique si vide.
  const serviceItems = usePublicList('services');
  const servicesMenu =
    serviceItems.length > 0
      ? serviceItems
          .filter((s) => s.title)
          .map((s) => ({
            name: s.title as string,
            href: s.slug ? `/${locale}/services/${s.slug}` : `/${locale}/services`,
          }))
      : [
          { name: 'Web Development', href: `/${locale}/services/web-development` },
          { name: 'Mobile Development', href: `/${locale}/services/mobile-apps` },
          { name: 'UI/UX Design', href: `/${locale}/services/ui-ux-design` },
          { name: 'Cybersecurity', href: `/${locale}/services/cybersecurity` },
          { name: 'Data & AI', href: `/${locale}/services/data-ai` },
        ];

  const servicesActive = mounted && (pathname?.includes('/services') || pathname?.includes('/sms-api'));

  /** Rendu du déclencheur + panneau du sous-menu Services. */
  const renderServicesDropdown = (label: string) => (
    <div className="relative" ref={dropdownRef} key="services-dropdown">
      <button
        onClick={() => setServicesOpen(!servicesOpen)}
        className={`flex items-center gap-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium${
          servicesActive ? ' text-primary-600 dark:text-primary-400' : ' text-gray-700 dark:text-gray-300'
        }`}
      >
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform${servicesOpen ? ' rotate-180' : ''}`} />
      </button>

      {servicesOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
          <div className="bg-gradient-to-r from-primary-500 to-primary-700 px-6 py-4">
            <h3 className="text-white font-semibold text-lg">{label}</h3>
            <p className="text-primary-100 text-sm mt-1">Nos solutions digitales</p>
          </div>
          <div className="grid grid-cols-2 gap-1 p-2">
            {servicesMenu.map((item) => (
              <Link
                key={item.name}
                href={item.href as Route}
                onClick={() => setServicesOpen(false)}
                className="group px-4 py-3 rounded-lg hover:bg-primary-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors duration-300">
                  {item.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      {servicesActive && <span className="absolute -bottom-6 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400" />}
    </div>
  );

  /** Rendu d'un lien de navigation simple (interne ou externe). */
  const renderNavLink = (item: NavItem) => {
    const active = isActive(item.href);
    const className = `relative text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors font-medium${
      active ? ' text-primary-600' : ''
    }`;
    if (item.isExternal) {
      return (
        <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
          {item.label}
        </a>
      );
    }
    return (
      <Link key={item.href} href={localized(item.href) as Route} className={className}>
        {item.label}
        {active && <span className="absolute -bottom-6 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400" />}
      </Link>
    );
  };

  return (
    <nav className="fixed top-0 w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm z-50 border-b dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href={`/${locale}`} className="flex items-center space-x-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- logo dynamique (CMS), ratio inconnu, non LCP */}
              <img src={logo} alt="Abdaty Tech" className="h-10 w-auto" />
              <span className="font-bold text-xl text-gray-900 dark:text-white">Abdaty Technologie</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            {/* Les items "/services" sont rendus comme un menu déroulant ; les
                autres comme de simples liens. */}
            {navItems.map((item) =>
              item.href === '/services' ? renderServicesDropdown(item.label) : renderNavLink(item)
            )}

            <LanguageSwitcher />
            <ThemeToggle />

            {/* Boutons d'authentification : changent selon l'état de connexion. */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href={spaceHref as Route}>
                  <Button variant="default" size="sm" className="gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    {t('dashboard')}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => signOut({ callbackUrl: `/${locale}` })}
                  title={t('logout')}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : LOGIN_ENABLED ? (
              <Link href={`/${locale}/login`}>
                <Button variant="outline" size="sm">
                  <LogIn className="w-4 h-4 mr-2" />
                  {t('login')}
                </Button>
              </Link>
            ) : null}
          </div>

          <div className="md:hidden flex items-center">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 border-t dark:border-gray-800">
            {navItems.map((item) =>
              item.isExternal ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={localized(item.href) as Route}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              )
            )}
            <div className="px-3 py-2">
              <LanguageSwitcher />
            </div>
            <div className="px-3 py-2">
              <ThemeToggle />
            </div>
            {/* Auth (mobile) selon l'état de connexion */}
            <div className="px-3 py-2 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link href={spaceHref as Route} onClick={() => setIsOpen(false)}>
                    <Button variant="default" size="sm" className="w-full gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      {t('dashboard')}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => {
                      setIsOpen(false);
                      signOut({ callbackUrl: `/${locale}` });
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    {t('logout')}
                  </Button>
                </>
              ) : LOGIN_ENABLED ? (
                <Link href={`/${locale}/login`} onClick={() => setIsOpen(false)}>
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <LogIn className="w-4 h-4" />
                    {t('login')}
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
