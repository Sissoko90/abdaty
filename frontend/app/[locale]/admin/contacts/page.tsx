'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, MailOpen, Trash2, RefreshCw, Loader2, Inbox, Phone, Building2, Tag, AlertCircle } from 'lucide-react';
import {
  listContactMessages,
  getContactStats,
  markContactRead,
  deleteContactMessage,
  type ContactMessage,
  type ContactStats,
} from '@/services/contact.service';
import { ApiRequestError } from '@/lib/api';
import { AdminPage, AdminPageHeader, AdminStatCard } from '@/components/admin/admin-page';

const PAGE_SIZE = 20;

/** Initiales d'un expéditeur (« Awa Traoré » -> « AT »). */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

export default function AdminContactsPage() {
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [items, setItems] = useState<ContactMessage[]>([]);
  const [stats, setStats] = useState<ContactStats | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    Promise.all([
      listContactMessages(token, page, PAGE_SIZE).catch(() => [] as ContactMessage[]),
      getContactStats(token).catch(() => null),
    ])
      .then(([list, st]) => {
        setItems(list);
        setStats(st);
      })
      .catch((e) => setError(e instanceof ApiRequestError ? e.message : 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, [token, page]);

  useEffect(() => {
    reload();
  }, [reload]);

  const toggleRead = async (m: ContactMessage) => {
    if (!token) return;
    setBusy(m.id);
    try {
      await markContactRead(token, m.id, !m.isRead);
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Action impossible.');
    } finally {
      setBusy(null);
    }
  };

  const remove = async (m: ContactMessage) => {
    if (!token || !confirm(`Supprimer le message de ${m.name} ?`)) return;
    setBusy(m.id);
    try {
      await deleteContactMessage(token, m.id);
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Suppression impossible.');
    } finally {
      setBusy(null);
    }
  };

  const total = stats?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AdminPage>
      <AdminPageHeader
        title="Messages de contact"
        description={`${total} message${total > 1 ? 's' : ''}${stats ? ` — ${stats.unread} non lu${stats.unread > 1 ? 's' : ''}` : ''}.`}
        icon={Inbox}
        actions={
          <Button variant="outline" onClick={reload} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        }
      />

      {stats && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <AdminStatCard label="Messages reçus" value={total} icon={Inbox} />
          <AdminStatCard label="Non lus" value={stats.unread} icon={Mail} tone="ochre" />
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-500 dark:text-gray-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary-600" /> Chargement…
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center dark:border-white/10 dark:bg-white/[0.03]">
          <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
            <Inbox className="h-7 w-7" />
          </span>
          <p className="text-gray-600 dark:text-gray-400">Aucun message pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((m) => (
            <article
              key={m.id}
              className={`rounded-2xl border bg-white p-5 dark:bg-white/[0.03] ${
                m.isRead
                  ? 'border-gray-200 dark:border-white/10'
                  : 'border-primary-200 ring-1 ring-primary-100 dark:border-primary-500/30 dark:ring-primary-500/10'
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      m.isRead ? 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300' : 'bg-primary-600 text-white'
                    }`}
                  >
                    {initials(m.name)}
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-ink dark:text-white">{m.name}</h2>
                      {!m.isRead && <Badge variant="default">Nouveau</Badge>}
                    </div>
                    <a href={`mailto:${m.email}`} className="text-sm text-primary-600 hover:underline dark:text-primary-400">
                      {m.email}
                    </a>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    title={m.isRead ? 'Marquer non lu' : 'Marquer lu'}
                    aria-label={m.isRead ? 'Marquer non lu' : 'Marquer lu'}
                    disabled={busy === m.id}
                    onClick={() => toggleRead(m)}
                  >
                    {m.isRead ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    title="Supprimer"
                    aria-label="Supprimer"
                    disabled={busy === m.id}
                    onClick={() => remove(m)}
                    className="hover:border-red-300 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {(m.company || m.phone || m.service) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {m.company && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-white/5 dark:text-gray-300">
                      <Building2 className="h-3 w-3" /> {m.company}
                    </span>
                  )}
                  {m.phone && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-white/5 dark:text-gray-300">
                      <Phone className="h-3 w-3" /> {m.phone}
                    </span>
                  )}
                  {m.service && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-ochre/15 px-3 py-1 text-xs text-amber-800 dark:text-ochre">
                      <Tag className="h-3 w-3" /> {m.service}
                    </span>
                  )}
                </div>
              )}
              <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-200">{m.message}</p>
            </article>
          ))}

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Page {page + 1} / {totalPages}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
                Précédent
              </Button>
              <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Suivant
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminPage>
  );
}
