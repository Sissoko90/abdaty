'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Download, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Breadcrumb } from '@/components/ui/breadcrumb';

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

  const getStatusColor = () => {
    return 'bg-primary-600 dark:bg-primary-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-red-950 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: t('title') },
          ]}
        />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">50,000 FCFA</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('expensesThisMonth')}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">12</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('paidInvoices')}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">1</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('pendingInvoice')}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">0</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('overdueInvoices')}</div>
          </div>
        </div>

        {/* Current Plan Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <CardHeader className="bg-gray-50 dark:bg-gray-900">
              <CardTitle className="text-gray-900 dark:text-white">{t('currentPlan')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {t('professionalPlan')}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                50,000 FCFA {t('perMonth')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <CardHeader className="bg-gray-50 dark:bg-gray-900">
              <CardTitle className="text-gray-900 dark:text-white">{t('nextBilling')}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                {t('nextBillingDate')}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {t('nextBillingAmount')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Payment Method */}
        <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-8 border border-gray-200 dark:border-gray-700">
          <CardHeader className="bg-gray-50 dark:bg-gray-900">
            <CardTitle className="text-gray-900 dark:text-white">{t('paymentMethod')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <CreditCard className="w-8 h-8 text-primary-600 dark:text-primary-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  **** **** **** 4242
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('expires')}
                </p>
              </div>
              <Button variant="outline" className="ml-auto">
                {t('edit')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table */}
        <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <CardHeader className="bg-gray-50 dark:bg-gray-900">
            <CardTitle className="text-gray-900 dark:text-white">{t('invoices')}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-900">
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('id')}</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('date')}</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('amount')}</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('status')}</TableHead>
                  <TableHead className="text-gray-900 dark:text-white font-semibold">{t('download')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors border-b border-gray-100 dark:border-gray-800">
                    <TableCell className="text-gray-900 dark:text-white font-medium">{invoice.id}</TableCell>
                    <TableCell className="text-gray-900 dark:text-white">{invoice.date}</TableCell>
                    <TableCell className="text-gray-900 dark:text-white font-semibold">{invoice.amount}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor()} text-white font-medium`}>
                        {t(invoice.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <Download className="w-4 h-4" />
                        {t('download')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('showing')}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="w-4 h-4" />
              {t('previous')}
            </Button>
            <Button variant="outline" size="sm" className="bg-primary-600 text-white border-primary-600">
              1
            </Button>
            <Button variant="outline" size="sm">
              2
            </Button>
            <Button variant="outline" size="sm">
              3
            </Button>
            <Button variant="outline" size="sm">
              <ChevronRight className="w-4 h-4" />
              {t('next')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
