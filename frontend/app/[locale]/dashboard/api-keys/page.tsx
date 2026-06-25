'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Key, Plus, Copy, Trash2, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'API Keys' },
          ]}
        />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
              {t('title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
              {t('subtitle')}
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} disabled={!token}>
            <Plus className="w-4 h-4 mr-2" />
            {t('createKey')}
          </Button>
        </div>

        {/* Bandeaux d'état */}
        {error && (
          <div role="alert" className="flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {createdNotice && (
          <div role="status" className="flex items-center gap-2 rounded-md bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 px-3 py-2 text-sm text-green-700 dark:text-green-300 mb-4">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{createdNotice}</span>
          </div>
        )}
        {!token && (
          <p className="text-sm text-gray-500 mb-4">Connectez-vous pour gérer vos clés API.</p>
        )}
        {loading && <p className="text-sm text-gray-500 mb-4">Chargement…</p>}

        {/* Create Modal */}
        {showCreateModal && (
          <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white transition-colors duration-300">
                {t('createNewKey')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="keyName">{t('keyName')}</Label>
                  <Input
                    id="keyName"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder={t('keyNamePlaceholder')}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-300"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={createNewKey}>
                    <Plus className="w-4 h-4 mr-2" />
                    {t('create')}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    {t('cancel')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {apiKeys.map((apiKey) => (
            <Card key={apiKey.id} className="dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300 hover:shadow-xl shadow-lg border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Key className="w-5 h-5 text-primary-600" />
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white transition-colors duration-300">
                        {apiKey.name}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
                          apiKey.status === 'active'
                            ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {apiKey.status === 'active' ? t('active') : t('revoked')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <Input
                        type={visibleKeys[apiKey.id] ? 'text' : 'password'}
                        value={apiKey.key}
                        readOnly
                        className="font-mono text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors duration-300"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 transition-colors duration-300"
                      >
                        {visibleKeys[apiKey.id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-gray-600 transition-colors duration-300"
                      >
                        {copiedKey === apiKey.id ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                      <div>
                        <span className="font-medium">{t('createdAt')}</span> {apiKey.createdAt}
                      </div>
                      <div>
                        <span className="font-medium">{t('lastUsed')}</span> {apiKey.lastUsed}
                      </div>
                    </div>
                  </div>

                  {apiKey.status === 'active' && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => revokeKey(apiKey.id)}
                      className="ml-4 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:bg-red-600 dark:hover:text-white transition-colors duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {!loading && apiKeys.length === 0 && (
            <p className="text-sm text-gray-500">Aucune clé API pour le moment.</p>
          )}
        </div>

        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg transition-colors duration-300">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <strong>{t('important')}</strong> {t('securityWarning')}
          </p>
        </div>
      </div>
    </div>
  );
}
