'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Key, Plus, Copy, Trash2, Eye, EyeOff, CheckCircle, AlertCircle, ShieldAlert, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import * as apiKeysService from '@/services/api-key.service';
import type { ApiKey as BackendApiKey } from '@/services/api-key.service';
import { ApiRequestError } from '@/lib/api';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
  status: 'active' | 'revoked';
}

const CARD = 'rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]';
const INPUT =
  'h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-ink placeholder-gray-400 dark:border-white/15 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500';
const ICON_BTN =
  'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-gray-300 bg-white text-gray-600 transition-colors hover:border-primary-400 hover:text-primary-600 dark:border-white/15 dark:bg-white/5 dark:text-gray-300 dark:hover:text-primary-300';

/** Convertit une clé du backend vers le modèle d'affichage. */
function toLocal(k: BackendApiKey): ApiKey {
  return {
    id: k.id,
    name: k.name,
    key: k.key,
    createdAt: k.createdAt ? k.createdAt.split('T')[0] : '',
    lastUsed: k.lastUsedAt ? k.lastUsedAt.split('T')[0] : '-',
    status: k.status === 'revoked' ? 'revoked' : 'active',
  };
}

export default function ApiKeysPage() {
  const t = useTranslations('dashboard.apiKeys');
  const { data: session } = useSession();
  const token = session?.accessToken;
  const userId = session?.user?.id;

  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createdNotice, setCreatedNotice] = useState('');

  /** Recharge les clés de l'utilisateur depuis le backend. */
  const reload = useCallback(() => {
    if (!token || !userId) return;
    setLoading(true);
    setError('');
    apiKeysService
      .listApiKeys(token, userId)
      .then((list) => setApiKeys(list.map(toLocal)))
      .catch((e) => setError(e instanceof ApiRequestError ? e.message : 'Erreur de chargement des clés API.'))
      .finally(() => setLoading(false));
  }, [token, userId]);

  useEffect(() => {
    reload();
  }, [reload]);

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const revokeKey = async (id: string) => {
    if (!token || !userId) return;
    setError('');
    try {
      await apiKeysService.revokeApiKey(id, token, userId);
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Erreur lors de la révocation.');
    }
  };

  const createNewKey = async () => {
    if (!newKeyName.trim() || !token || !userId) return;
    setError('');
    setCreatedNotice('');
    try {
      const created = await apiKeysService.createApiKey({ name: newKeyName.trim() }, token, userId);
      const local = toLocal(created);
      // La clé complète n'est renvoyée qu'ici : on l'affiche et on la révèle.
      setApiKeys((prev) => [local, ...prev]);
      setVisibleKeys((prev) => ({ ...prev, [local.id]: true }));
      setCreatedNotice(
        'Votre clé a été créée. Copiez-la maintenant : elle ne sera plus affichée en entier ensuite.'
      );
      setNewKeyName('');
      setShowCreateModal(false);
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Erreur lors de la création.');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink dark:text-white">{t('title')}</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} disabled={!token}>
          <Plus className="mr-2 h-4 w-4" />
          {t('createKey')}
        </Button>
      </header>

      {/* Bandeaux d'état */}
      {error && (
        <div role="alert" className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {createdNotice && (
        <div role="status" className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{createdNotice}</span>
        </div>
      )}
      {!token && <p className="text-sm text-gray-500 dark:text-gray-400">{t('signInRequired')}</p>}

      {/* Formulaire de création */}
      {showCreateModal && (
        <section className={CARD}>
          <h2 className="mb-4 font-display text-lg font-semibold text-ink dark:text-white">{t('createNewKey')}</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createNewKey();
            }}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="flex-1">
              <label htmlFor="keyName" className="mb-2 block text-sm font-medium text-ink dark:text-gray-200">
                {t('keyName')}
              </label>
              <input
                id="keyName"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder={t('keyNamePlaceholder')}
                className={INPUT}
                autoFocus
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="lg" disabled={!newKeyName.trim()}>
                <Plus className="mr-2 h-4 w-4" />
                {t('create')}
              </Button>
              <Button type="button" size="lg" variant="outline" onClick={() => setShowCreateModal(false)}>
                {t('cancel')}
              </Button>
            </div>
          </form>
        </section>
      )}

      {loading && token ? (
        <div className={`${CARD} flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400`}>
          <Loader2 className="h-4 w-4 animate-spin" />
          {t('loading')}
        </div>
      ) : apiKeys.length > 0 ? (
        <ul className="space-y-4">
          {apiKeys.map((apiKey) => (
            <li key={apiKey.id} className={CARD}>
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                    <Key className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-lg font-semibold text-ink dark:text-white">{apiKey.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('createdAt')} {apiKey.createdAt} <span aria-hidden="true">/</span> {t('lastUsed')} {apiKey.lastUsed}
                    </p>
                  </div>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                    apiKey.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                      : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300'
                  }`}
                >
                  {apiKey.status === 'active' ? t('active') : t('revoked')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type={visibleKeys[apiKey.id] ? 'text' : 'password'}
                  value={apiKey.key}
                  readOnly
                  aria-label={apiKey.name}
                  className={`${INPUT} bg-paper font-mono text-sm dark:bg-white/5`}
                />
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility(apiKey.id)}
                  className={ICON_BTN}
                  aria-label={visibleKeys[apiKey.id] ? t('hide') : t('show')}
                  title={visibleKeys[apiKey.id] ? t('hide') : t('show')}
                >
                  {visibleKeys[apiKey.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                  className={ICON_BTN}
                  aria-label={t('copy')}
                  title={t('copy')}
                >
                  {copiedKey === apiKey.id ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
                {apiKey.status === 'active' && (
                  <button
                    type="button"
                    onClick={() => revokeKey(apiKey.id)}
                    className={`${ICON_BTN} hover:border-red-400 hover:text-red-600 dark:hover:text-red-300`}
                    aria-label={t('revoke')}
                    title={t('revoke')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        token && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center dark:border-white/15 dark:bg-white/[0.02]">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
              <Key className="h-6 w-6" />
            </span>
            <h2 className="font-display text-lg font-semibold text-ink dark:text-white">{t('emptyTitle')}</h2>
            <p className="max-w-sm text-sm text-gray-600 dark:text-gray-400">{t('emptyText')}</p>
            <Button onClick={() => setShowCreateModal(true)} className="mt-2">
              <Plus className="mr-2 h-4 w-4" />
              {t('createKey')}
            </Button>
          </div>
        )
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-ochre/40 bg-ochre/10 p-4 text-sm text-ink dark:text-gray-200">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-ochre" />
        <p>
          <strong className="font-semibold">{t('important')}</strong> {t('securityWarning')}
        </p>
      </div>
    </div>
  );
}
