'use client';

import type { Route } from 'next';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { useBranding } from '@/hooks/use-branding';
import { 
  LayoutDashboard,
  FileText,
  BookOpen,
  Package,
  MessageSquare,
  Settings,
  Globe,
  Image as ImageIcon,
  Shield,
  BarChart3,
  ChevronDown,
  Layers,
  LogOut,
  Users,
  Activity,
  FileCode,
  Megaphone,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useLocale } from 'next-intl';

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  children?: NavItem[];
}

export function AdminSidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const t = useTranslations('admin.sidebar');
  const pathname = usePathname();
  const locale = useLocale();
  const { logo } = useBranding();
  const [openSections, setOpenSections] = useState<string[]>(['content']);

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: t('dashboard'),
      icon: LayoutDashboard,
      href: '/admin',
    },
    {
      id: 'content',
      label: t('content'),
      icon: FileText,
      children: [
        {
          id: 'hero',
          label: t('hero'),
          icon: Layers,
          href: '/admin/content/hero',
        },
        {
          id: 'services',
          label: t('services'),
          icon: Package,
          href: '/admin/content/services',
        },
        {
          id: 'testimonials',
          label: t('testimonials'),
          icon: MessageSquare,
          href: '/admin/content/testimonials',
        },
        {
          id: 'footer',
          label: t('footer'),
          icon: Layers,
          href: '/admin/content/footer',
        },
        {
          id: 'navigation',
          label: t('navigation'),
          icon: Globe,
          href: '/admin/content/navigation',
        },
        {
          id: 'about',
          label: t('about'),
          icon: FileText,
          href: '/admin/content/about',
        },
        {
          id: 'contact',
          label: t('contact'),
          icon: MessageSquare,
          href: '/admin/content/contact',
        },
        {
          id: 'faq',
          label: 'FAQ',
          icon: MessageSquare,
          href: '/admin/content/faq',
        },
        {
          id: 'sla',
          label: 'SLA',
          icon: Shield,
          href: '/admin/content/sla',
        },
        {
          id: 'newsletter',
          label: 'Newsletter',
          icon: MessageSquare,
          href: '/admin/content/newsletter',
        },
        {
          id: 'cookies',
          label: 'Cookies',
          icon: Shield,
          href: '/admin/content/cookies',
        },
        {
          id: 'partners',
          label: 'Partenaires',
          icon: Globe,
          href: '/admin/content/partners',
        },
        {
          id: 'sms-api',
          label: t('smsApi'),
          icon: Globe,
          href: '/admin/content/sms-api',
        },
        {
          id: 'legal',
          label: t('legal'),
          icon: Shield,
          href: '/admin/content/legal',
        },
      ],
    },
    {
      id: 'blog',
      label: t('blog'),
      icon: FileText,
      href: '/admin/blog',
    },
    {
      id: 'docs',
      label: t('docs'),
      icon: BookOpen,
      href: '/admin/docs',
    },
    {
      id: 'media',
      label: t('media'),
      icon: ImageIcon,
      href: '/admin/media',
    },
    {
      id: 'promotions',
      label: 'Promotions',
      icon: Megaphone,
      href: '/admin/promotions',
    },
    {
      id: 'management',
      label: t('management'),
      icon: Users,
      children: [
        {
          id: 'users',
          label: t('users'),
          icon: Users,
          href: '/admin/users',
        },
        {
          id: 'sms-subscribers',
          label: t('smsSubscribers'),
          icon: MessageSquare,
          href: '/admin/sms-subscribers',
        },
        {
          id: 'newsletter-manage',
          label: 'Newsletter',
          icon: MessageSquare,
          href: '/admin/newsletter',
        },
        {
          id: 'contacts',
          label: 'Messages de contact',
          icon: MessageSquare,
          href: '/admin/contacts',
        },
      ],
    },
    {
      id: 'security',
      label: t('security'),
      icon: Shield,
      children: [
        {
          id: 'security-ips',
          label: t('securityIps'),
          icon: Shield,
          href: '/admin/security',
        },
        {
          id: 'geo-blocking',
          label: t('geoBlocking'),
          icon: Globe,
          href: '/admin/geo-blocking',
        },
        {
          id: 'logs',
          label: t('logs'),
          icon: Activity,
          href: '/admin/logs',
        },
        {
          id: 'api-docs',
          label: t('apiDocs'),
          icon: FileCode,
          href: '/admin/api-docs',
        },
      ],
    },
    {
      id: 'settings',
      label: t('settings'),
      icon: Settings,
      children: [
        {
          id: 'languages',
          label: t('languages'),
          icon: Globe,
          href: '/admin/settings/languages',
        },
        {
          id: 'theme',
          label: t('theme'),
          icon: Layers,
          href: '/admin/settings/theme',
        },
        {
          id: 'seo',
          label: t('seo'),
          icon: BarChart3,
          href: '/admin/settings/seo',
        },
        {
          id: 'social',
          label: t('social'),
          icon: Globe,
          href: '/admin/settings/social',
        },
      ],
    },
  ];

  const toggleSection = (id: string) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((section) => section !== id) : [...prev, id]
    );
  };

  const isActive = (href: string) => {
    if (!href) return false;
    // pathname inclut le préfixe de locale (/fr/admin/...) ; les href n'en ont pas.
    const current = pathname.replace(`/${locale}`, '') || '/';
    return current === href;
  };

  // Ouvre automatiquement le groupe qui contient la page courante.
  const activeGroup = navItems.find((item) => item.children?.some((c) => isActive(c.href || '')))?.id;
  const isOpen = (id: string) => openSections.includes(id) || id === activeGroup;

  const itemCls = (active: boolean) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
      active ? 'bg-primary-600 text-white shadow-sm shadow-primary-900/30' : 'text-gray-300 hover:bg-white/5 hover:text-white'
    }`;

  return (
    <>
      {/* Voile derrière le tiroir (mobile/tablette) */}
      {open && <div className="fixed inset-0 z-40 bg-ink/60 backdrop-blur-sm lg:hidden" onClick={onClose} aria-hidden="true" />}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-ink text-white transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 px-5">
          <Link href={`/${locale}/admin` as Route} onClick={onClose} className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element -- logo dynamique (CMS) */}
            <img src={logo} alt="Abdaty" className="h-9 w-9 rounded-lg bg-white object-contain p-1" />
            <span className="leading-tight">
              <span className="block font-display text-base font-bold">Abdaty</span>
              <span className="block text-xs text-gray-400">{locale === 'fr' ? 'Administration' : 'Administration'}</span>
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label={locale === 'fr' ? 'Fermer le menu' : 'Close menu'}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-300 hover:bg-white/10 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="bogolan-band shrink-0" />

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <div key={item.id}>
              {item.href ? (
                <Link href={item.href as Route} onClick={onClose} className={itemCls(isActive(item.href))}>
                  <item.icon className="h-5 w-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              ) : (
                <div>
                  <button
                    type="button"
                    onClick={() => toggleSection(item.id)}
                    aria-expanded={isOpen(item.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      item.id === activeGroup ? 'text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 shrink-0" />
                      {item.label}
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isOpen(item.id) ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen(item.id) && item.children && (
                    <div className="mb-2 ml-5 mt-1 space-y-0.5 border-l border-white/10 pl-3">
                      {item.children.map((child) => {
                        const active = isActive(child.href || '');
                        return (
                          <Link
                            key={child.id}
                            href={child.href as Route}
                            onClick={onClose}
                            aria-current={active ? 'page' : undefined}
                            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                              active ? 'bg-white/10 font-semibold text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Déconnexion */}
        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            <span>{locale === 'fr' ? 'Déconnexion' : 'Logout'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
