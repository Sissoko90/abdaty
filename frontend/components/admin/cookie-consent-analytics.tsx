'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Check, X, RefreshCw, Loader2 } from 'lucide-react';
import {
  listCookieConsents,
  getCookieConsentStats,
  type CookieConsentRecord,
  type CookieConsentStats,
} from '@/services/cookie.service';
import { ApiRequestError } from '@/lib/api';

/**
 * Vue admin des consentements cookies : statistiques agrégées + journal des
 * derniers choix exprimés par les visiteurs (RGPD).
 */
export function CookieConsentAnalytics() {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const PAGE_SIZE = 50;
  const [stats, setStats] = useState<CookieConsentStats | null>(null);
  const [items, setItems] = useState<CookieConsentRecord[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    Promise.all([
      getCookieConsentStats(token).catch(() => null),
      // Page courante uniquement (table non bornée : pagination obligatoire).
      listCookieConsents(token, page, PAGE_SIZE).catch(() => [] as CookieConsentRecord[]),
    ])
      .then(([s, list]) => {
        setStats(s);
        setItems(list);
      })
      .catch((e) => setError(e instanceof ApiRequestError ? e.message : 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, [token, page]);

  useEffect(() => {
    reload();
  }, [reload]);

  const yesNo = (v?: boolean) =>
    v ? <Check className="w-4 h-4 text-green-600 inline" /> : <X className="w-4 h-4 text-gray-400 inline" />;

  const cards = [
    { label: 'Total consentements', value: stats?.total ?? 0 },
    { label: 'Analytics acceptés', value: stats?.analyticsAccepted ?? 0 },
    { label: 'Marketing acceptés', value: stats?.marketingAccepted ?? 0 },
    { label: 'Tout refusé', value: stats?.rejectedAll ?? 0 },
    { label: "Taux d'acceptation analytics", value: `${stats?.analyticsRate ?? 0}%` },
  ];

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700 mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Consentements &amp; analytics
          </CardTitle>
          <Button variant="outline" size="sm" onClick={reload} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <p className="text-xs text-gray-600 dark:text-gray-400">{c.label}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{c.value}</p>
            </div>
          ))}
        </div>

        {/* Journal des consentements */}
        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Chargement…
          </div>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-gray-500 dark:text-gray-400">
            Aucun consentement enregistré pour le moment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-600 dark:text-gray-400">
                  <th className="py-2 px-3">Date</th>
                  <th className="py-2 px-3">Visiteur</th>
                  <th className="py-2 px-3 text-center">Essentiels</th>
                  <th className="py-2 px-3 text-center">Analytics</th>
                  <th className="py-2 px-3 text-center">Marketing</th>
                  <th className="py-2 px-3">Page</th>
                  <th className="py-2 px-3">IP</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="border-b border-gray-100 dark:border-gray-700">
                    <td className="py-2 px-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                      {c.createdAt ? new Date(c.createdAt).toLocaleString() : '—'}
                    </td>
                    <td className="py-2 px-3">
                      <Badge variant="outline" className="font-mono text-xs">{(c.visitorId || '').slice(0, 8)}</Badge>
                    </td>
                    <td className="py-2 px-3 text-center">{yesNo(c.necessary)}</td>
                    <td className="py-2 px-3 text-center">{yesNo(c.analytics)}</td>
                    <td className="py-2 px-3 text-center">{yesNo(c.marketing)}</td>
                    <td className="py-2 px-3 text-gray-500 dark:text-gray-400 max-w-[160px] truncate">{c.page || '—'}</td>
                    <td className="py-2 px-3 text-gray-500 dark:text-gray-400">{c.ipAddress || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination serveur */}
            {(() => {
              const total = stats?.total ?? 0;
              const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
              return (
                <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100 dark:border-gray-700">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Page {page + 1} / {totalPages} — {total} consentement{total > 1 ? 's' : ''}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page === 0 || loading} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                      Précédent
                    </Button>
                    <Button variant="outline" size="sm" disabled={page + 1 >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>
                      Suivant
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
