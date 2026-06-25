'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Mail, MailOpen, Trash2, RefreshCw, Loader2, Inbox, Phone, Building2, Tag } from 'lucide-react';
import {
  listContactMessages,
  getContactStats,
  markContactRead,
  deleteContactMessage,
  type ContactMessage,
  type ContactStats,
} from '@/services/contact.service';
import { ApiRequestError } from '@/lib/api';

const PAGE_SIZE = 20;

export default function AdminContactsPage() {
  const tBreadcrumb = useTranslations('admin.breadcrumb');
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
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: tBreadcrumb('dashboard'), href: `/admin` },
            { label: tBreadcrumb('admin'), href: `/admin` },
            { label: 'Messages de contact' },
          ]}
        />

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Inbox className="w-8 h-8" />
              Messages de contact
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {total} message{total > 1 ? 's' : ''}
              {stats ? ` — ${stats.unread} non lu${stats.unread > 1 ? 's' : ''}` : ''}.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={reload} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Chargement…
          </div>
        ) : items.length === 0 ? (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="py-16 text-center text-gray-500 dark:text-gray-400">
              <Inbox className="w-12 h-12 mx-auto mb-3 opacity-50" />
              Aucun message pour le moment.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((m) => (
              <Card
                key={m.id}
                className={`dark:bg-gray-800 dark:border-gray-700 ${m.isRead ? '' : 'border-l-4 border-l-primary-500'}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                        {m.name}
                        {!m.isRead && <Badge variant="default">Nouveau</Badge>}
                      </CardTitle>
                      <a href={`mailto:${m.email}`} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                        {m.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {m.createdAt ? new Date(m.createdAt).toLocaleString() : ''}
                      </span>
                      <Button variant="outline" size="icon" title={m.isRead ? 'Marquer non lu' : 'Marquer lu'} disabled={busy === m.id} onClick={() => toggleRead(m)}>
                        {m.isRead ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                      </Button>
                      <Button variant="outline" size="icon" disabled={busy === m.id} onClick={() => remove(m)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {m.company && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {m.company}</span>}
                    {m.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {m.phone}</span>}
                    {m.service && <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> {m.service}</span>}
                  </div>
                  <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-line">{m.message}</p>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Page {page + 1} / {totalPages}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>Précédent</Button>
                <Button variant="outline" size="sm" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>Suivant</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
