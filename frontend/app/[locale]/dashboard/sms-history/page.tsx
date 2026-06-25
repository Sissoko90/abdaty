'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Breadcrumb } from '@/components/ui/breadcrumb';

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

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={t('recipient')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="all">Tous les statuts</option>
            <option value="delivered">{t('delivered')}</option>
            <option value="sent">{t('sent')}</option>
            <option value="failed">{t('failed')}</option>
            <option value="pending">{t('pending')}</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">1,234</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('totalSms')}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">98.5%</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('deliveryRate')}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">45</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('smsToday')}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow duration-300">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">12</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('failedCount')}</div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <Table>
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <TableHead className="text-gray-900 dark:text-white font-semibold">{t('date')}</TableHead>
                <TableHead className="text-gray-900 dark:text-white font-semibold">{t('recipient')}</TableHead>
                <TableHead className="text-gray-900 dark:text-white font-semibold">{t('status')}</TableHead>
                <TableHead className="text-gray-900 dark:text-white font-semibold">{t('message')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSmsHistory.length > 0 ? (
                filteredSmsHistory.map((sms) => (
                  <TableRow key={sms.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors border-b border-gray-100 dark:border-gray-800">
                    <TableCell className="text-gray-900 dark:text-white font-medium">{sms.date}</TableCell>
                    <TableCell className="text-gray-900 dark:text-white">{sms.recipient}</TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor()} text-white font-medium`}>
                        {t(sms.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-white">{sms.message}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-gray-600 dark:text-gray-400">
                    {t('noResults')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Affichage de 1 à 4 sur 1,234 résultats
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              <ChevronLeft className="w-4 h-4" />
              Précédent
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
              Suivant
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
