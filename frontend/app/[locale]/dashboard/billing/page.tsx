'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Download, CreditCard, ChevronLeft, ChevronRight, Wallet, CheckCircle2, Clock, AlertTriangle, CalendarDays, Layers } from 'lucide-react';

const CARD = 'rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]';
const ICON_TILE =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400';

// Pastilles de statut : vert = payé, ambre = non payé, rouge = en retard.
const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  unpaid: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  overdue: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
};

export default function BillingPage() {
  const t = useTranslations('dashboard.billing');

  // Mock data for billing
  const invoices = [
    {
      id: 'INV-2024-001',
      date: '2024-01-15',
      amount: '50,000 FCFA',
      status: 'paid'
    },
    {
      id: 'INV-2024-002',
      date: '2024-02-15',
      amount: '50,000 FCFA',
      status: 'paid'
    },
    {
      id: 'INV-2024-003',
      date: '2024-03-15',
      amount: '50,000 FCFA',
      status: 'unpaid'
    },
  ];

  const stats = [
    { value: '50,000 FCFA', label: t('expensesThisMonth'), icon: Wallet },
    { value: '12', label: t('paidInvoices'), icon: CheckCircle2 },
    { value: '1', label: t('pendingInvoice'), icon: Clock },
    { value: '0', label: t('overdueInvoices'), icon: AlertTriangle },
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

      {/* Plan, prochaine échéance, moyen de paiement */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="bogolan-texture rounded-2xl bg-ink p-6 text-white">
          <div className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-300">
            <Layers className="h-4 w-4 text-ochre" />
            {t('currentPlan')}
          </div>
          <p className="font-display text-2xl font-bold">{t('professionalPlan')}</p>
          <p className="mt-1 text-gray-300">
            50,000 FCFA {t('perMonth')}
          </p>
        </section>

        <section className={CARD}>
          <div className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
            <CalendarDays className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            {t('nextBilling')}
          </div>
          <p className="font-display text-2xl font-bold text-ink dark:text-white">{t('nextBillingDate')}</p>
          <p className="mt-1 text-gray-600 dark:text-gray-400">{t('nextBillingAmount')}</p>
        </section>

        <section className={CARD}>
          <div className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400">
            <CreditCard className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            {t('paymentMethod')}
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="font-mono font-medium text-ink dark:text-white">**** **** **** 4242</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{t('expires')}</p>
            </div>
            <Button variant="outline" size="sm" className="dark:border-white/15 dark:bg-white/5">
              {t('edit')}
            </Button>
          </div>
        </section>
      </div>

      {/* Factures */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
        <h2 className="px-6 pb-4 pt-6 font-display text-lg font-semibold text-ink dark:text-white">{t('invoices')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-y border-gray-100 bg-paper text-gray-500 dark:border-white/10 dark:bg-white/[0.02] dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium">{t('id')}</th>
                <th scope="col" className="px-6 py-3 font-medium">{t('date')}</th>
                <th scope="col" className="px-6 py-3 font-medium">{t('amount')}</th>
                <th scope="col" className="px-6 py-3 font-medium">{t('status')}</th>
                <th scope="col" className="px-6 py-3 text-right font-medium">
                  <span className="sr-only">{t('download')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/10">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.03]">
                  <td className="whitespace-nowrap px-6 py-4 font-medium text-ink dark:text-white">{invoice.id}</td>
                  <td className="whitespace-nowrap px-6 py-4 tabular-nums text-gray-600 dark:text-gray-300">{invoice.date}</td>
                  <td className="whitespace-nowrap px-6 py-4 font-semibold tabular-nums text-ink dark:text-white">{invoice.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[invoice.status] ?? STATUS_STYLES.unpaid}`}>
                      {t(invoice.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button variant="ghost" size="sm" className="gap-2 dark:hover:bg-white/10">
                      <Download className="h-4 w-4" />
                      {t('download')}
                    </Button>
                  </td>
                </tr>
              ))}
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
