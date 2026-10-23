'use client';

import type { Route } from 'next';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, ChevronDown, LogIn, LogOut, LayoutDashboard, ArrowRight } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations('nav');
  const tServices = useTranslations('services');
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
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setServicesOpen(false);
        setIsOpen(false);
      }
    };
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
      window.removeEventListener('scroll', handleScroll);
    };
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
          { name: tServices('web.title'), href: `/${locale}/services/web-development` },
          { name: tServices('mobile.title'), href: `/${locale}/services/mobile-apps` },
          { name: tServices('design.title'), href: `/${locale}/services/ui-ux-design` },
          { name: tServices('security.title'), href: `/${locale}/services/cybersecurity` },
          { name: tServices('dataAi.title'), href: `/${locale}/services/data-ai` },
        ];

  const servicesActive = mounted && (pathname?.includes('/services') || pathname?.includes('/sms-api'));

  const linkBase = 'relative whitespace-nowrap rounded-full px-3 py-2 text-[15px] font-medium transition-colors';
  const linkIdle = 'text-gray-700 hover:bg-gray-100 hover:text-ink dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white';
  const linkActive = 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300';

  /** Rendu du déclencheur + panneau du sous-menu Services. */
  const renderServicesDropdown = (label: string) => (
    <div className="relative" ref={dropdownRef} key="services-dropdown">
      <button
        type="button"
        onClick={() => setServicesOpen(!servicesOpen)}
        aria-expanded={servicesOpen}
        aria-haspopup="true"
        className={`flex items-center gap-1 ${linkBase} ${servicesActive ? linkActive : linkIdle}`}
      >
        {label}
        <ChevronDown className={`h-4 w-4 transition-transform${servicesOpen ? ' rotate-180' : ''}`} />
      </button>

      {servicesOpen && (
        <div className="absolute left-1/2 top-full z-50 mt-3 w-[26rem] -translate-x-1/2 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-ink/10 dark:border-white/10 dark:bg-[#121c2e]">
          <p className="px-5 pb-2 pt-4 text-sm font-semibold text-gray-500 dark:text-gray-400">{t('ourSolutions')}</p>
          <div className="grid grid-cols-2 gap-1 px-2 pb-2">
            {servicesMenu.map((item) => (
              <Link
                key={item.href + item.name}
                href={item.href as Route}
                onClick={() => setServicesOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-primary-50 hover:text-primary-700 dark:text-white dark:hover:bg-white/5 dark:hover:text-primary-300"
              >
                {item.name}
              </Link>
            ))}
          </div>
          <Link
            href={`/${locale}/services`}
            onClick={() => setServicesOpen(false)}
            className="group flex items-center justify-between border-t border-gray-100 bg-paper px-5 py-3 text-sm font-semibold text-primary-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-primary-400"
          >
            {tServices('viewAll')}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </div>
  );

  /** Rendu d'un lien de navigation simple (interne ou externe). */
  const renderNavLink = (item: NavItem) => {
    const active = isActive(item.href);
    const className = `${linkBase} ${active ? linkActive : linkIdle}`;
    if (item.isExternal) {
      return (
        <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
          {item.label}
        </a>
      );
    }
    return (
      <Link key={item.href} href={localized(item.href) as Route} className={className} aria-current={active ? 'page' : undefined}>
        {item.label}
      </Link>
    );
  };

  return (
    <nav
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled || isOpen
          ? 'border-b border-gray-200/80 bg-white/90 shadow-sm backdrop-blur-md dark:border-white/10 dark:bg-[#0b1322]/90'
          : 'border-b border-transparent bg-white/60 backdrop-blur-sm dark:bg-transparent'
      }`}
    >
      <div className="site-container">
        <div className="flex h-[72px] items-center justify-between gap-4">
          <Link href={`/${locale}`} className="flex shrink-0 items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element -- logo dynamique (CMS), ratio inconnu, non LCP */}
            <img src={logo} alt="Abdaty Tech" className="h-10 w-auto" />
            <span className="font-display text-lg font-bold text-ink dark:text-white lg:hidden xl:inline">Abdaty Technologie</span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {/* Les items "/services" sont rendus comme un menu déroulant ; les
                autres comme de simples liens. */}
            {navItems.map((item) =>
              item.href === '/services' ? renderServicesDropdown(item.label) : renderNavLink(item)
            )}
          </div>

          <div className="hidden items-center gap-2 lg:flex">
            <LanguageSwitcher />
            <ThemeToggle />

            {/* Boutons d'authentification : changent selon l'état de connexion. */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link href={spaceHref as Route}>
                  <Button variant="default" size="sm" className="gap-2">
                    <LayoutDashboard className="h-4 w-4" />
                    {t('dashboard')}
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => signOut({ callbackUrl: `/${locale}` })}
                  title={t('logout')}
                  aria-label={t('logout')}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <>
                {LOGIN_ENABLED && (
                  <Link href={`/${locale}/login`}>
                    <Button variant="outline" size="sm">
                      <LogIn className="mr-2 h-4 w-4" />
                      {t('login')}
                    </Button>
                  </Link>
                )}
                {/* Vrai lien stylé en bouton (pas de <button> imbriqué dans <a>) ; l'ancre
                    fait défiler jusqu'au formulaire, même si l'on est déjà sur /contact. */}
                <Link href={`/${locale}/contact#contact-form`} className={cn(buttonVariants({ size: 'sm' }), 'hidden h-10 px-4 xl:inline-flex')}>
                  {t('startProject')}
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              aria-label={t('menu')}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-gray-200 bg-white dark:border-white/10 dark:bg-[#0b1322] lg:hidden">
          <div className="site-container space-y-1 py-4">
            {navItems.map((item) => {
              const active = !item.isExternal && isActive(item.href);
              const cls = `block rounded-xl px-4 py-3 text-base font-medium ${
                active
                  ? 'bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-300'
                  : 'text-gray-800 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-white/5'
              }`;
              return item.isExternal ? (
                <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className={cls} onClick={() => setIsOpen(false)}>
                  {item.label}
                </a>
              ) : (
                <Link key={item.href} href={localized(item.href) as Route} className={cls} onClick={() => setIsOpen(false)}>
                  {item.label}
                </Link>
              );
            })}

            <div className="flex items-center justify-between gap-3 border-t border-gray-200 px-1 pt-4 dark:border-white/10">
              <LanguageSwitcher />
            </div>

            {/* Auth (mobile) selon l'état de connexion */}
            <div className="space-y-2 pt-2">
              {isAuthenticated ? (
                <>
                  <Link href={spaceHref as Route} onClick={() => setIsOpen(false)} className="block">
                    <Button variant="default" className="w-full gap-2">
                      <LayoutDashboard className="h-4 w-4" />
                      {t('dashboard')}
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => {
                      setIsOpen(false);
                      signOut({ callbackUrl: `/${locale}` });
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    {t('logout')}
                  </Button>
                </>
              ) : (
                <>
                  {LOGIN_ENABLED && (
                    <Link href={`/${locale}/login`} onClick={() => setIsOpen(false)} className="block">
                      <Button variant="outline" className="w-full gap-2">
                        <LogIn className="h-4 w-4" />
                        {t('login')}
                      </Button>
                    </Link>
                  )}
                  <Link
                    href={`/${locale}/contact#contact-form`}
                    onClick={() => setIsOpen(false)}
                    className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
                  >
                    {t('startProject')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
