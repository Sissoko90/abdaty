'use client';

import type { Route } from 'next';
import { useLocale, useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Smartphone, 
  Key, 
  TrendingUp, 
  FileText, 
  Plus,
  Settings,
  Bell,
  BarChart3,
  PieChart,
  Activity,
  ArrowUp,
  ArrowDown,
  LogOut
} from 'lucide-react';
import Link from 'next/link';
import NotificationSidebar from '@/components/notification-sidebar';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useNotifications } from '@/contexts/notification-context';
import { Badge } from '@/components/ui/badge';
import { listApiKeys, type ApiKey } from '@/services/api-key.service';

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pt-20">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                {t('title')}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                {t('welcome')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => setShowNotifications(true)} className="relative">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center p-0 rounded-full">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
              <Link href={`/${locale}/dashboard/settings`}>
                <Button variant="outline" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => signOut({ callbackUrl: `/${locale}/login` })}
              >
                <LogOut className="w-4 h-4" />
                {locale === 'fr' ? 'Déconnexion' : 'Logout'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="dark:bg-gray-800 dark:border-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300 hover:shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors duration-300">
                    {stat.title}
                  </CardTitle>
                  <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900">
                    <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
                    {stat.value}
                  </div>
                  <p className={`text-xs mt-1 flex items-center gap-1 transition-colors duration-300 text-primary-600 dark:text-primary-400`}>
                    {stat.changeType === 'positive' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {stat.change} {t('thisMonth')}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Analytics Charts */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="dark:bg-gray-800 dark:border-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300 hover:shadow-xl">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                {t('smsAnalytics')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.map((data, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{data.name}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{data.sms} SMS</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-primary-600 dark:bg-primary-400 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${(data.sms / 100) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300 hover:shadow-xl">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                {t('distributionByType')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">78%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('transactionalSms')}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">22%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('marketingSms')}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">98.5%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('deliveryRateMain')}</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">1.5%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{t('failureRate')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Chart */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300 mb-8 hover:shadow-xl">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {t('last30DaysActivity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between gap-2">
              {[45, 52, 38, 65, 72, 48, 55, 62, 58, 71, 68, 59, 63, 70, 75, 69, 62, 58, 66, 73, 68, 61, 57, 64, 71, 67, 60, 55, 62, 69, 74].map((value, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                  <div 
                    className="w-full bg-primary-600 dark:bg-primary-400 rounded-t-lg transition-all duration-300 hover:bg-primary-700 dark:hover:bg-primary-500"
                    style={{ height: `${value}%` }}
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">{index + 1}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href={`/${locale}/dashboard/api-keys` as Route}>
            <Button className="w-full h-20 dark:bg-gray-800 dark:border dark:border-gray-700 dark:text-white transition-colors duration-300">
              <div className="flex flex-col items-center gap-2">
                <Key className="w-6 h-6" />
                <span>{t('manageApiKeys')}</span>
              </div>
            </Button>
          </Link>
          <Link href={`/${locale}/dashboard/sms-history` as Route}>
            <Button variant="outline" className="w-full h-20 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors duration-300">
              <div className="flex flex-col items-center gap-2">
                <Smartphone className="w-6 h-6" />
                <span>{t('smsHistoryLink')}</span>
              </div>
            </Button>
          </Link>
          <Link href={`/${locale}/dashboard/billing` as Route}>
            <Button variant="outline" className="w-full h-20 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors duration-300">
              <div className="flex flex-col items-center gap-2">
                <FileText className="w-6 h-6" />
                <span>{t('billingLink')}</span>
              </div>
            </Button>
          </Link>
          <Link href={`/${locale}/dashboard/settings` as Route}>
            <Button variant="outline" className="w-full h-20 dark:bg-gray-800 dark:border-gray-700 dark:text-white transition-colors duration-300">
              <div className="flex flex-col items-center gap-2">
                <Settings className="w-6 h-6" />
                <span>{t('settingsLink')}</span>
              </div>
            </Button>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300 hover:shadow-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white transition-colors duration-300">
                {t('recentSms')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                          +223XXXXXXXX
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
                          {t('minutesAgo', { count: i * 10 })}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded-full transition-colors duration-300">
                      {t('sent')}
                    </span>
                  </div>
                ))}
              </div>
              <Link href={`/${locale}/dashboard/sms-history` as Route}>
                <Button variant="link" className="w-full mt-4 text-primary-600 dark:text-primary-400 transition-colors duration-300">
                  {t('viewAllHistory')}
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300 hover:shadow-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white transition-colors duration-300">
                {t('apiKeys.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {apiKeys.slice(0, 3).map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300">
                    <div className="flex items-center gap-3">
                      <Key className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                          {key.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400 transition-colors duration-300">
                          {t('createdOn', { date: key.createdAt ? key.createdAt.split('T')[0] : '—' })}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full transition-colors duration-300 ${
                      key.status === 'active'
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                    }`}>
                      {key.status === 'active' ? t('active') : locale === 'fr' ? 'Révoquée' : 'Revoked'}
                    </span>
                  </div>
                ))}
                {apiKeys.length === 0 && (
                  <p className="text-sm text-gray-500">
                    {locale === 'fr' ? 'Aucune clé API' : 'No API keys'}
                  </p>
                )}
              </div>
              <Link href={`/${locale}/dashboard/api-keys` as Route}>
                <Button variant="link" className="w-full mt-4 text-primary-600 dark:text-primary-400 transition-colors duration-300">
                  {t('manageAllKeys')}
                </Button>
              </Link>
              <Button className="w-full mt-2">
                <Plus className="w-4 h-4 mr-2" />
                {t('createNewKey')}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <NotificationSidebar isOpen={showNotifications} onClose={() => setShowNotifications(false)} />
    </div>
  );
}
