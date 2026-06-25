'use client';

import type { Route } from 'next';
import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { NotificationBell } from '@/components/notification-bell';
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
  ChevronRight,
  ChevronDown,
  Layers,
  Languages,
  LogOut,
  Users,
  Activity,
  FileCode,
  Megaphone
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

export function AdminSidebar() {
  const t = useTranslations('admin.sidebar');
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const [openSections, setOpenSections] = useState<string[]>(['content']);

  const handleLanguageChange = (newLocale: string) => {
    const currentPath = pathname.replace(`/${locale}`, '');
    router.push(`/${newLocale}${currentPath}`);
  };

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

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen fixed left-0 top-0 transition-colors duration-300 z-40 flex flex-col">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Admin Panel</h2>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <button
              onClick={() => handleLanguageChange('fr')}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                locale === 'fr'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              FR
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                locale === 'en'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              EN
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Languages className="w-3 h-3" />
          <span>{locale === 'fr' ? 'Français' : 'English'}</span>
        </div>
      </div>
      <nav className="p-4 space-y-2 overflow-y-auto flex-1">
        {navItems.map((item) => (
          <div key={item.id}>
            {item.href ? (
              <Link
                href={item.href as Route}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ) : (
              <div>
                <button
                  onClick={() => toggleSection(item.id)}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {openSections.includes(item.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {openSections.includes(item.id) && item.children && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.id}
                        href={child.href as Route}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                          isActive(child.href || '')
                            ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <child.icon className="w-4 h-4" />
                        <span className="text-sm">{child.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Déconnexion */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
          className="flex items-center gap-2 w-full px-4 py-3 rounded-lg transition-colors duration-200 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/40 font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>{locale === 'fr' ? 'Déconnexion' : 'Logout'}</span>
        </button>
      </div>
    </aside>
  );
}
