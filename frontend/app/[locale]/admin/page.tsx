'use client';

import type { Route } from 'next';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  FileText,
  Package,
  Layout,
  Settings,
  Users,
  BookOpen,
  LayoutDashboard,
  ArrowUpRight,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { listAllPosts, listAllContent, getSectionContent } from '@/services/content.service';
import { getNewsletterStats } from '@/services/newsletter.service';
import { AdminPage, AdminPageHeader, AdminStatCard } from '@/components/admin/admin-page';

export default function AdminDashboardPage() {
  const t = useTranslations('admin.dashboard');
  const { data: session } = useSession();
  const token = session?.accessToken;

  // Compteurs réels agrégés depuis les endpoints existants.
  const [counts, setCounts] = useState({ articles: 0, services: 0, sections: 0, users: 0, subscribers: 0 });

  useEffect(() => {
    // Services actifs (public).
    getSectionContent('services')
      .then((list) => setCounts((c) => ({ ...c, services: list.length })))
      .catch(() => {});
    if (!token) return;
    listAllPosts(token).then((list) => setCounts((c) => ({ ...c, articles: list.length }))).catch(() => {});
    listAllContent(token)
      .then((list) => setCounts((c) => ({ ...c, sections: new Set(list.map((b) => b.section)).size })))
      .catch(() => {});
    api.get<unknown[]>('/users', { token })
      .then((list) => setCounts((c) => ({ ...c, users: Array.isArray(list) ? list.length : 0 })))
      .catch(() => {});
    getNewsletterStats(token)
      .then((s) => setCounts((c) => ({ ...c, subscribers: s.activeSubscribers ?? 0 })))
      .catch(() => {});
  }, [token]);

  const stats = [
    { title: t('stats.totalArticles'), value: String(counts.articles), icon: FileText, tone: 'primary' as const },
    { title: t('stats.activeServices'), value: String(counts.services), icon: Package, tone: 'emerald' as const },
    { title: t('stats.sitePages'), value: String(counts.sections), icon: Layout, tone: 'ochre' as const },
    { title: t('stats.users'), value: String(counts.users), icon: Users, tone: 'ink' as const },
  ];

  const quickActions = [
    {
      title: t('actions.manageServices.title'),
      description: t('actions.manageServices.description'),
      icon: Package,
      href: `/admin/content/services`,
    },
    {
      title: t('actions.manageBlog.title'),
      description: t('actions.manageBlog.description'),
      icon: FileText,
      href: `/admin/blog`,
    },
    {
      title: t('actions.manageDocs.title'),
      description: t('actions.manageDocs.description'),
      icon: BookOpen,
      href: `/admin/docs`,
    },
    {
      title: t('actions.siteSettings.title'),
      description: t('actions.siteSettings.description'),
      icon: Settings,
      href: `/admin/settings/theme`,
    },
  ];

  // Activité récente (exemples statiques, comme auparavant).
  const recentActivity = [
    { icon: FileText, label: 'Nouvel article de blog créé', time: 'Il y a 2 heures' },
    { icon: Package, label: 'Service "Cybersécurité" modifié', time: 'Il y a 5 heures' },
    { icon: Settings, label: 'Paramètres du site mis à jour', time: 'Il y a 1 jour' },
  ];

  return (
    <AdminPage>
      <AdminPageHeader title={t('title')} description={t('subtitle')} icon={LayoutDashboard} />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <AdminStatCard key={stat.title} label={stat.title} value={stat.value} icon={stat.icon} tone={stat.tone} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <section className="lg:col-span-2">
          <h2 className="mb-4 text-lg font-bold text-ink dark:text-white">{t('quickActions')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {quickActions.map((action) => (
              <Link
                key={action.href}
                href={action.href as Route}
                className="group flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-primary-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-primary-500/40"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white dark:bg-primary-500/10 dark:text-primary-400">
                  <action.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-ink dark:text-white">{action.title}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{action.description}</p>
                </div>
                <ArrowUpRight className="h-5 w-5 shrink-0 text-gray-300 transition-colors group-hover:text-primary-600 dark:text-gray-600" />
              </Link>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]">
          <h2 className="mb-4 text-lg font-bold text-ink dark:text-white">{t('recentActivity')}</h2>
          <ul className="divide-y divide-gray-100 dark:divide-white/5">
            {recentActivity.map((item) => (
              <li key={item.label} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300">
                  <item.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink dark:text-white">{item.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </AdminPage>
  );
}
