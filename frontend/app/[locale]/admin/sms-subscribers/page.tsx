'use client';

import { useState } from 'react';
import { useTranslations, useFormatter } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { AdminPage, AdminPageHeader, AdminStatCard } from '@/components/admin/admin-page';
import { 
  MessageSquare, 
  Search, 
  Ban, 
  CheckCircle, 
  XCircle, 
  Wallet,
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
    const variants: Record<string, { variant: NonNullable<BadgeProps['variant']>; label: string }> = {
      active: { variant: 'success', label: t('statusActive') },
      suspended: { variant: 'destructive', label: t('statusSuspended') },
      cancelled: { variant: 'secondary', label: t('statusCancelled') },
    };
    const config = variants[status] || variants.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      starter: { color: 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300', label: 'Starter' },
      business: { color: 'bg-ink text-white dark:bg-white dark:text-ink', label: 'Business' },
      enterprise: { color: 'bg-ochre/20 text-amber-800 dark:text-ochre', label: 'Enterprise' },
    };
    const config = variants[plan] || variants.starter;
    return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.color}`}>{config.label}</span>;
  };

  const totalRevenue = subscribers.reduce((sum, sub) => sum + sub.balance, 0);
  const totalMessages = subscribers.reduce((sum, sub) => sum + sub.messagesSent, 0);

  return (
    <AdminPage>
      <AdminPageHeader title={t('title')} description={t('subtitle')} icon={MessageSquare} />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label={t('totalSubscribers')} value={subscribers.length} icon={MessageSquare} />
        <AdminStatCard label={t('activeSubscribers')} value={subscribers.filter((s) => s.status === 'active').length} icon={CheckCircle} tone="emerald" />
        <AdminStatCard label={t('totalMessages')} value={fmtNumber(totalMessages)} icon={Send} tone="ink" />
        <AdminStatCard label={t('totalRevenue')} value={`${fmtNumber(totalRevenue)} FCFA`} icon={Wallet} tone="ochre" />
      </div>

      {/* Subscribers Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-5 dark:border-white/10 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-bold text-ink dark:text-white">{t('subscribersList')}</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative sm:w-72">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                aria-label={t('searchPlaceholder')}
              />
            </div>
            <select
              value={filterPlan}
              onChange={(e) => setFilterPlan(e.target.value)}
              aria-label={t('plan')}
              className="h-11 rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-white/15 dark:bg-white/5 dark:text-white"
            >
              <option value="all">{t('allPlans')}</option>
              <option value="starter">Starter</option>
              <option value="business">Business</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 dark:bg-white/[0.03] dark:text-gray-400">
                <th className="h-11 px-5">{t('subscriber')}</th>
                <th className="h-11 px-5">{t('plan')}</th>
                <th className="h-11 px-5">{t('status')}</th>
                <th className="h-11 px-5">{t('usage')}</th>
                <th className="h-11 px-5">{t('balance')}</th>
                <th className="h-11 px-5 text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.map((sub) => (
                <tr key={sub.id} className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50/70 dark:border-white/5 dark:hover:bg-white/[0.03]">
                  <td className="px-5 py-4">
                    <p className="font-medium text-ink dark:text-white">{sub.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{sub.email}</p>
                    <p className="text-xs text-gray-500">{sub.phone}</p>
                  </td>
                  <td className="px-5 py-4">{getPlanBadge(sub.plan)}</td>
                  <td className="px-5 py-4">{getStatusBadge(sub.status)}</td>
                  <td className="px-5 py-4">
                    <span className="font-display font-semibold text-ink dark:text-white">{fmtNumber(sub.messagesSent)}</span>{' '}
                    <span className="text-xs text-gray-500">{t('messages')}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="font-display font-semibold text-ink dark:text-white">{fmtNumber(sub.balance)}</span>{' '}
                    <span className="text-xs text-gray-500">FCFA</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {sub.status === 'active' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSuspend(sub.id)}
                          className="gap-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                        >
                          <Ban className="h-3.5 w-3.5" />
                          {t('suspend')}
                        </Button>
                      )}
                      {sub.status === 'suspended' && (
                        <>
                          <Button variant="default" size="sm" onClick={() => handleActivate(sub.id)} className="gap-1">
                            <CheckCircle className="h-3.5 w-3.5" />
                            {t('activate')}
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleCancel(sub.id)} className="gap-1">
                            <XCircle className="h-3.5 w-3.5" />
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
          {filteredSubscribers.length === 0 && (
            <div className="px-6 py-14 text-center">
              <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                <Search className="h-6 w-6" />
              </span>
              <p className="text-gray-600 dark:text-gray-400">{t('noResults')}</p>
            </div>
          )}
        </div>
      </div>
    </AdminPage>
  );
}
