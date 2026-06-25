'use client';

import { useState } from 'react';
import { useTranslations, useFormatter } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  Search, 
  Ban, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  DollarSign,
  Send,
} from 'lucide-react';

interface Subscriber {
  id: string;
  name: string;
  email: string;
  phone: string;
  plan: 'starter' | 'business' | 'enterprise';
  status: 'active' | 'suspended' | 'cancelled';
  apiKey: string;
  messagesSent: number;
  balance: number;
  createdAt: string;
  lastUsed: string;
}

export default function AdminSMSSubscribersPage() {
  const t = useTranslations('admin.smsSubscribers');
  const tBreadcrumb = useTranslations('admin.breadcrumb');
  const format = useFormatter();
  const fmtNumber = (n: number) => format.number(n);

  const [subscribers, setSubscribers] = useState<Subscriber[]>([
    {
      id: '1',
      name: 'Bakary Sanogo',
      email: 'bakary@company.ml',
      phone: '+223 70 11 22 33',
      plan: 'business',
      status: 'active',
      apiKey: 'sk_live_abc123...',
      messagesSent: 15420,
      balance: 250000,
      createdAt: '2024-01-10',
      lastUsed: '2024-05-11 09:15'
    },
    {
      id: '2',
      name: 'Mariam Coulibaly',
      email: 'mariam@startup.ml',
      phone: '+223 70 44 55 66',
      plan: 'starter',
      status: 'active',
      apiKey: 'sk_live_def456...',
      messagesSent: 3200,
      balance: 50000,
      createdAt: '2024-03-15',
      lastUsed: '2024-05-10 14:30'
    },
    {
      id: '3',
      name: 'Ibrahim Keita',
      email: 'ibrahim@enterprise.ml',
      phone: '+223 70 77 88 99',
      plan: 'enterprise',
      status: 'suspended',
      apiKey: 'sk_live_ghi789...',
      messagesSent: 45000,
      balance: 0,
      createdAt: '2023-11-20',
      lastUsed: '2024-04-28 16:45'
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');

  const filteredSubscribers = subscribers.filter(sub => {
    const matchesSearch = sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sub.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === 'all' || sub.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  const handleSuspend = (subId: string) => {
    if (confirm(t('confirmSuspend'))) {
      setSubscribers(subscribers.map(s => s.id === subId ? { ...s, status: 'suspended' } : s));
    }
  };

  const handleActivate = (subId: string) => {
    setSubscribers(subscribers.map(s => s.id === subId ? { ...s, status: 'active' } : s));
  };

  const handleCancel = (subId: string) => {
    if (confirm(t('confirmCancel'))) {
      setSubscribers(subscribers.map(s => s.id === subId ? { ...s, status: 'cancelled' } : s));
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      active: { variant: 'default', label: t('statusActive') },
      suspended: { variant: 'destructive', label: t('statusSuspended') },
      cancelled: { variant: 'secondary', label: t('statusCancelled') },
    };
    const config = variants[status] || variants.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      starter: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: 'Starter' },
      business: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', label: 'Business' },
      enterprise: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', label: 'Enterprise' },
    };
    const config = variants[plan] || variants.starter;
    return <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>{config.label}</span>;
  };

  const totalRevenue = subscribers.reduce((sum, sub) => sum + sub.balance, 0);
  const totalMessages = subscribers.reduce((sum, sub) => sum + sub.messagesSent, 0);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: tBreadcrumb('dashboard'), href: `/admin` },
            { label: tBreadcrumb('admin'), href: `/admin` },
            { label: t('title') },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <MessageSquare className="w-8 h-8" />
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('subtitle')}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalSubscribers')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{subscribers.length}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('activeSubscribers')}</p>
                  <p className="text-2xl font-bold text-green-600">{subscribers.filter(s => s.status === 'active').length}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalMessages')}</p>
                  <p className="text-2xl font-bold text-purple-600">{fmtNumber(totalMessages)}</p>
                </div>
                <Send className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalRevenue')}</p>
                  <p className="text-2xl font-bold text-orange-600">{fmtNumber(totalRevenue)} FCFA</p>
                </div>
                <DollarSign className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">{t('allPlans')}</option>
                <option value="starter">Starter</option>
                <option value="business">Business</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Subscribers Table */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle>{t('subscribersList')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t('subscriber')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t('plan')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t('status')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t('usage')}</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t('balance')}</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscribers.map((sub) => (
                    <tr key={sub.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{sub.name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{sub.email}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">{sub.phone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getPlanBadge(sub.plan)}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(sub.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-900 dark:text-white font-medium">
                            {fmtNumber(sub.messagesSent)}
                          </span>
                          <span className="text-xs text-gray-500">{t('messages')}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-gray-900 dark:text-white font-medium">
                            {fmtNumber(sub.balance)}
                          </span>
                          <span className="text-xs text-gray-500">FCFA</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          {sub.status === 'active' && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleSuspend(sub.id)}
                              className="gap-1"
                            >
                              <Ban className="w-3 h-3" />
                              {t('suspend')}
                            </Button>
                          )}
                          {sub.status === 'suspended' && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleActivate(sub.id)}
                                className="gap-1"
                              >
                                <CheckCircle className="w-3 h-3" />
                                {t('activate')}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancel(sub.id)}
                                className="gap-1"
                              >
                                <XCircle className="w-3 h-3" />
                                {t('cancel')}
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
