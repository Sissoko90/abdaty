'use client';

import type { Route } from 'next';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FileText,
  Package,
  Layout,
  Settings,
  Users,
  BookOpen
} from 'lucide-react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { api } from '@/lib/api';
import { listAllPosts, listAllContent, getSectionContent } from '@/services/content.service';
import { getNewsletterStats } from '@/services/newsletter.service';

export default function AdminDashboardPage() {
  const t = useTranslations('admin.dashboard');
  const tBreadcrumb = useTranslations('admin.breadcrumb');
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
    {
      title: t('stats.totalArticles'),
      value: String(counts.articles),
      change: '',
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      title: t('stats.activeServices'),
      value: String(counts.services),
      change: '',
      icon: Package,
      color: 'bg-green-500',
    },
    {
      title: t('stats.sitePages'),
      value: String(counts.sections),
      change: '',
      icon: Layout,
      color: 'bg-purple-500',
    },
    {
      title: t('stats.users'),
      value: String(counts.users),
      change: '',
      icon: Users,
      color: 'bg-orange-500',
    },
  ];

  const quickActions = [
    {
      title: t('actions.manageServices.title'),
      description: t('actions.manageServices.description'),
      icon: Package,
      href: `/admin/content/services`,
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: t('actions.manageBlog.title'),
      description: t('actions.manageBlog.description'),
      icon: FileText,
      href: `/admin/blog`,
      color: 'text-green-600 bg-green-50 dark:bg-green-900/20',
    },
    {
      title: t('actions.manageDocs.title'),
      description: t('actions.manageDocs.description'),
      icon: BookOpen,
      href: `/admin/docs`,
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20',
    },
    {
      title: t('actions.siteSettings.title'),
      description: t('actions.siteSettings.description'),
      icon: Settings,
      href: `/admin/settings/general`,
      color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20',
    },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: tBreadcrumb('dashboard'), href: `/admin` },
            { label: tBreadcrumb('admin') },
          ]}
        />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300 mt-2">
            {t('subtitle')}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="dark:bg-gray-800 dark:border-gray-700 border border-gray-200 transition-colors duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300 mt-1">
                      {stat.value}
                    </p>
                    {stat.change && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {stat.change}
                      </p>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-300 mb-4">
            {t('quickActions')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href as Route}>
                <Card className="dark:bg-gray-800 dark:border-gray-700 border border-gray-200 transition-colors duration-300 hover:shadow-lg cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-lg ${action.color}`}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300 mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 border border-gray-200 transition-colors duration-300">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white transition-colors duration-300">
              {t('recentActivity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                    Nouvel article de blog créé
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    Il y a 2 heures
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Package className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                    Service "Cybersécurité" modifié
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    Il y a 5 heures
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Settings className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-300">
                    Paramètres du site mis à jour
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    Il y a 1 jour
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
