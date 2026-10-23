'use client';

import type { Route } from 'next';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Smartphone,
  Key,
  TrendingUp,
  FileText,
  Plus,
  Bell,
  BarChart3,
  PieChart,
  Activity,
  ArrowUp,
  ArrowDown,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import NotificationSidebar from '@/components/notification-sidebar';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useNotifications } from '@/contexts/notification-context';
import { listApiKeys, type ApiKey } from '@/services/api-key.service';

const CARD = 'rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]';
const ICON_TILE =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400';

export default function DashboardPage() {
  const locale = useLocale();
  const t = useTranslations('dashboard');
  const [showNotifications, setShowNotifications] = useState(false);
  const { unreadCount } = useNotifications();

  const { data: session } = useSession();
  const token = session?.accessToken;
  const userId = session?.user?.id;

  // Clés API réelles (les autres statistiques restent des placeholders tant que
  // les domaines SMS / facturation ne sont pas branchés).
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  useEffect(() => {
    if (!token || !userId) return;
    listApiKeys(token, userId)
      .then(setApiKeys)
      .catch(() => setApiKeys([]));
  }, [token, userId]);

  const activeApiKeys = apiKeys.filter((k) => k.status === 'active').length;

  const stats = [
    {
      title: t('sentSms'),
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: Smartphone,
    },
    {
      title: t('apiKeysCount'),
      value: String(activeApiKeys),
      change: `${apiKeys.length} total`,
      changeType: 'positive',
      icon: Key,
    },
    {
      title: t('consumption'),
      value: '2,450 FCFA',
      change: '+8%',
      changeType: 'positive',
      icon: TrendingUp,
    },
    {
      title: t('invoicesCount'),
      value: '12',
      change: '-2',
      changeType: 'negative',
      icon: FileText,
    },
  ];

  const analyticsData = [
    { name: 'Lun', sms: 65, calls: 28 },
    { name: 'Mar', sms: 59, calls: 48 },
    { name: 'Mer', sms: 80, calls: 40 },
    { name: 'Jeu', sms: 81, calls: 19 },
    { name: 'Ven', sms: 56, calls: 86 },
    { name: 'Sam', sms: 55, calls: 27 },
    { name: 'Dim', sms: 40, calls: 90 },
  ];

  const distribution = [
    { value: '78%', label: t('transactionalSms') },
    { value: '22%', label: t('marketingSms') },
    { value: '98.5%', label: t('deliveryRateMain') },
    { value: '1.5%', label: t('failureRate') },
  ];

  const activity = [45, 52, 38, 65, 72, 48, 55, 62, 58, 71, 68, 59, 63, 70, 75, 69, 62, 58, 66, 73, 68, 61, 57, 64, 71, 67, 60, 55, 62, 69, 74];

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink dark:text-white">{t('title')}</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">{t('welcome')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowNotifications(true)}
            className="relative bg-white dark:border-white/15 dark:bg-white/5"
            aria-label={t('nav.notifications')}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1 text-[11px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </Button>
          <Link href={`/${locale}/dashboard/api-keys` as Route}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('createNewKey')}
            </Button>
          </Link>
        </div>
      </header>

      {/* Indicateurs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className={CARD}>
              <div className="mb-4 flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</p>
                <span className={ICON_TILE}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="font-display text-3xl font-bold text-ink dark:text-white">{stat.value}</p>
              <p
                className={`mt-2 flex items-center gap-1 text-xs font-medium ${
                  stat.changeType === 'positive' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {stat.changeType === 'positive' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {stat.change} {t('thisMonth')}
              </p>
            </div>
          );
        })}
      </div>

      {/* Analyses */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className={CARD}>
          <h2 className="mb-6 flex items-center gap-2 font-display text-lg font-semibold text-ink dark:text-white">
            <BarChart3 className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t('smsAnalytics')}
          </h2>
          <ul className="space-y-4">
            {analyticsData.map((data) => (
              <li key={data.name} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{data.name}</span>
                  <span className="font-semibold tabular-nums text-ink dark:text-white">{data.sms} SMS</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-white/10">
                  <div className="h-2 rounded-full bg-primary-600 dark:bg-primary-400" style={{ width: `${data.sms}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={CARD}>
          <h2 className="mb-6 flex items-center gap-2 font-display text-lg font-semibold text-ink dark:text-white">
            <PieChart className="h-5 w-5 text-primary-600 dark:text-primary-400" />
            {t('distributionByType')}
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {distribution.map((d) => (
              <div key={d.label} className="rounded-xl bg-paper p-5 dark:bg-white/5">
                <p className="font-display text-3xl font-bold text-ink dark:text-white">{d.value}</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{d.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Activité 30 jours */}
      <section className={CARD}>
        <h2 className="mb-6 flex items-center gap-2 font-display text-lg font-semibold text-ink dark:text-white">
          <Activity className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          {t('last30DaysActivity')}
        </h2>
        <div className="flex h-48 items-end gap-1 sm:gap-1.5">
          {activity.map((value, index) => (
            <div key={index} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
              <div
                className="w-full rounded-t-md bg-primary-600/80 transition-colors hover:bg-primary-600 dark:bg-primary-400/80 dark:hover:bg-primary-400"
                style={{ height: `${value}%` }}
                title={String(value)}
              />
              <span className="hidden text-[10px] tabular-nums text-gray-500 sm:block">{index + 1}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Activité récente */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className={CARD}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink dark:text-white">{t('recentSms')}</h2>
            <Link
              href={`/${locale}/dashboard/sms-history` as Route}
              className="group inline-flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-primary-400"
            >
              {t('viewAllHistory')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <ul className="divide-y divide-gray-100 dark:divide-white/10">
            {[1, 2, 3, 4, 5].map((i) => (
              <li key={i} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <span className={ICON_TILE}>
                    <Smartphone className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-medium text-ink dark:text-white">+223XXXXXXXX</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t('minutesAgo', { count: i * 10 })}</p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                  {t('sent')}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className={`${CARD} flex flex-col`}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-ink dark:text-white">{t('apiKeys.title')}</h2>
            <Link
              href={`/${locale}/dashboard/api-keys` as Route}
              className="group inline-flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-primary-400"
            >
              {t('manageAllKeys')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          {apiKeys.length > 0 ? (
            <ul className="divide-y divide-gray-100 dark:divide-white/10">
              {apiKeys.slice(0, 3).map((key) => (
                <li key={key.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={ICON_TILE}>
                      <Key className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-ink dark:text-white">{key.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t('createdOn', { date: key.createdAt ? key.createdAt.split('T')[0] : '—' })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                      key.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300'
                    }`}
                  >
                    {key.status === 'active' ? t('active') : t('revoked')}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center dark:border-white/15">
              <span className={ICON_TILE}>
                <Key className="h-5 w-5" />
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('noApiKeys')}</p>
              <Link href={`/${locale}/dashboard/api-keys` as Route}>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('createNewKey')}
                </Button>
              </Link>
            </div>
          )}
        </section>
      </div>
      <NotificationSidebar isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  );
}
