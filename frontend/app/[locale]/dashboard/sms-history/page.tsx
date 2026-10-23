'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight, MessageSquare, CheckCheck, CalendarClock, XCircle, Inbox } from 'lucide-react';
import { useState } from 'react';

const CARD = 'rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]';
const ICON_TILE =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400';
const INPUT =
  'h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-ink placeholder-gray-400 dark:border-white/15 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500';

// Pastilles de statut : vert = livré, bleu = envoyé, ambre = en attente, rouge = échoué.
const STATUS_STYLES: Record<string, string> = {
  delivered: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  sent: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-300',
  pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  failed: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
};

export default function SmsHistoryPage() {
  const t = useTranslations('dashboard.smsHistory');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Mock data for SMS history
  const smsHistory = [
    {
      id: 1,
      date: '2024-01-15 14:30',
      recipient: '+223 70 00 00 00',
      status: 'delivered',
      message: 'Votre code de vérification est 123456'
    },
    {
      id: 2,
      date: '2024-01-15 14:25',
      recipient: '+223 71 00 00 00',
      status: 'sent',
      message: 'Bienvenue sur notre service !'
    },
    {
      id: 3,
      date: '2024-01-15 14:20',
      recipient: '+223 72 00 00 00',
      status: 'failed',
      message: 'Votre commande a été expédiée'
    },
    {
      id: 4,
      date: '2024-01-15 14:15',
      recipient: '+223 73 00 00 00',
      status: 'delivered',
      message: 'Rappel de rendez-vous demain à 10h'
    },
  ];

  const filteredSmsHistory = smsHistory.filter(sms => {
    const matchesSearch = sms.recipient.includes(searchTerm) || sms.message.includes(searchTerm);
    const matchesFilter = filterStatus === 'all' || sms.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = [
    { value: '1,234', label: t('totalSms'), icon: MessageSquare },
    { value: '98.5%', label: t('deliveryRate'), icon: CheckCheck },
    { value: '45', label: t('smsToday'), icon: CalendarClock },
    { value: '12', label: t('failedCount'), icon: XCircle },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold text-ink dark:text-white">{t('title')}</h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
      </header>

      {/* Indicateurs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ value, label, icon: Icon }) => (
          <div key={label} className={CARD}>
            <div className="mb-4 flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
              <span className={ICON_TILE}>
                <Icon className="h-5 w-5" />
              </span>
            </div>
            <p className="font-display text-3xl font-bold text-ink dark:text-white">{value}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
        {/* Filtres */}
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:p-6">
          <div className="relative flex-1">
            <label htmlFor="sms-search" className="sr-only">{t('searchPlaceholder')}</label>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              id="sms-search"
              type="search"
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${INPUT} pl-11`}
            />
          </div>
          <label htmlFor="sms-status" className="sr-only">{t('status')}</label>
          <select
            id="sms-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`${INPUT} sm:w-56`}
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="delivered">{t('delivered')}</option>
            <option value="sent">{t('sent')}</option>
            <option value="failed">{t('failed')}</option>
            <option value="pending">{t('pending')}</option>
          </select>
        </div>

        {/* Tableau */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-y border-gray-100 bg-paper text-gray-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium">{t('date')}</th>
                <th scope="col" className="px-6 py-3 font-medium">{t('recipient')}</th>
                <th scope="col" className="px-6 py-3 font-medium">{t('status')}</th>
                <th scope="col" className="px-6 py-3 font-medium">{t('message')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {filteredSmsHistory.length > 0 ? (
                filteredSmsHistory.map((sms) => (
                  <tr key={sms.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]">
                    <td className="whitespace-nowrap px-6 py-4 tabular-nums text-gray-600 dark:text-gray-300">{sms.date}</td>
                    <td className="whitespace-nowrap px-6 py-4 font-medium tabular-nums text-ink dark:text-white">{sms.recipient}</td>
                    <td className="px-6 py-4">
                      <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[sms.status] ?? STATUS_STYLES.pending}`}>
                        {t(sms.status)}
                      </span>
                    </td>
                    <td className="max-w-md truncate px-6 py-4 text-gray-700 dark:text-gray-300" title={sms.message}>
                      {sms.message}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-14">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <span className={ICON_TILE}>
                        <Inbox className="h-5 w-5" />
                      </span>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{t('noResults')}</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-gray-100 px-6 py-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('showing')}</p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled className="dark:border-white/15">
              <ChevronLeft className="h-4 w-4" />
              {t('previous')}
            </Button>
            <Button size="sm" aria-current="page">1</Button>
            <Button variant="ghost" size="sm">2</Button>
            <Button variant="ghost" size="sm">3</Button>
            <Button variant="outline" size="sm" className="dark:border-white/15">
              {t('next')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
