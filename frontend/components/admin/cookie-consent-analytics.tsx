'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { AdminStatCard } from '@/components/admin/admin-page';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Check, X, RefreshCw, Loader2, Users, Megaphone, Ban, Percent, Inbox } from 'lucide-react';
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
    v ? (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
        <Check className="h-3.5 w-3.5" aria-label="Oui" />
      </span>
    ) : (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-white/10">
        <X className="h-3.5 w-3.5" aria-label="Non" />
      </span>
    );

  const cards = [
    { label: 'Total consentements', value: stats?.total ?? 0, icon: Users, tone: 'ink' as const },
    { label: 'Analytics acceptés', value: stats?.analyticsAccepted ?? 0, icon: BarChart3, tone: 'primary' as const },
    { label: 'Marketing acceptés', value: stats?.marketingAccepted ?? 0, icon: Megaphone, tone: 'ochre' as const },
    { label: 'Tout refusé', value: stats?.rejectedAll ?? 0, icon: Ban, tone: 'primary' as const },
    { label: "Taux d'acceptation analytics", value: `${stats?.analyticsRate ?? 0}%`, icon: Percent, tone: 'emerald' as const },
  ];

  return (
    <section className="rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-6 py-5 dark:border-white/10">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
            <BarChart3 className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-lg font-bold text-ink dark:text-white">Consentements &amp; analytics</h2>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">Choix exprimés par les visiteurs (RGPD).</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={reload} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Actualiser
        </Button>
      </div>

      <div className="space-y-6 p-6">
        {error && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Statistiques */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {cards.map((c) => (
            <AdminStatCard key={c.label} label={c.label} value={c.value} icon={c.icon} tone={c.tone} />
          ))}
        </div>

        {/* Journal des consentements */}
        {loading ? (
          <div className="flex items-center justify-center py-10 text-sm text-gray-500 dark:text-gray-400">
            <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary-600" /> Chargement…
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center dark:border-white/15">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
              <Inbox className="h-6 w-6" />
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400">Aucun consentement enregistré pour le moment.</p>
          </div>
        ) : (
          <div>
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 dark:bg-white/[0.03] dark:text-gray-400">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Visiteur</th>
                    <th className="px-4 py-3 text-center">Essentiels</th>
                    <th className="px-4 py-3 text-center">Analytics</th>
                    <th className="px-4 py-3 text-center">Marketing</th>
                    <th className="px-4 py-3">Page</th>
                    <th className="px-4 py-3">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {items.map((c) => (
                    <tr key={c.id} className="transition-colors hover:bg-gray-50/70 dark:hover:bg-white/[0.03]">
                      <td className="whitespace-nowrap px-4 py-3 text-gray-700 dark:text-gray-300">
                        {c.createdAt ? new Date(c.createdAt).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="font-mono text-xs">{(c.visitorId || '').slice(0, 8)}</Badge>
                      </td>
                      <td className="px-4 py-3 text-center">{yesNo(c.necessary)}</td>
                      <td className="px-4 py-3 text-center">{yesNo(c.analytics)}</td>
                      <td className="px-4 py-3 text-center">{yesNo(c.marketing)}</td>
                      <td className="max-w-[160px] truncate px-4 py-3 text-gray-500 dark:text-gray-400">{c.page || '—'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">{c.ipAddress || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination serveur */}
            {(() => {
              const total = stats?.total ?? 0;
              const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
              return (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Page {page + 1} / {totalPages}, {total} consentement{total > 1 ? 's' : ''}
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
      </div>
    </section>
  );
}
