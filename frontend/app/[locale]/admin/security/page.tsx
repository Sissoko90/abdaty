'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Search,
  Ban,
  AlertTriangle,
  MapPin,
  Globe,
  Unlock,
  Activity,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import {
  listSuspiciousIPs,
  getSuspiciousIPStatistics,
  blockIP,
  unblockIP,
  type SuspiciousIP,
  type SuspiciousIPStatistics,
} from '@/services/security.service';
import { ApiRequestError } from '@/lib/api';

export default function AdminSecurityPage() {
  const t = useTranslations('admin.security');
  const tBreadcrumb = useTranslations('admin.breadcrumb');
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [ips, setIps] = useState<SuspiciousIP[]>([]);
  const [stats, setStats] = useState<SuspiciousIPStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionIp, setActionIp] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterThreat, setFilterThreat] = useState<string>('all');
  const [newIp, setNewIp] = useState('');
  const [blocking, setBlocking] = useState(false);

  /** Bloque manuellement une adresse IP (créée si elle n'existe pas encore). */
  const handleBlockNewIp = async () => {
    const ip = newIp.trim();
    if (!token || !ip) return;
    setBlocking(true);
    setError('');
    try {
      await blockIP(token, ip);
      setNewIp('');
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Blocage impossible.');
    } finally {
      setBlocking(false);
    }
  };

  /** Charge la liste des IPs et les statistiques depuis le backend. */
  const reload = useCallback(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    Promise.all([listSuspiciousIPs(token), getSuspiciousIPStatistics(token).catch(() => null)])
      .then(([list, statistics]) => {
        setIps(list);
        setStats(statistics);
      })
      .catch((e) => setError(e instanceof ApiRequestError ? e.message : 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleBlock = async (ip: SuspiciousIP) => {
    if (!token || !confirm(t('confirmBlock'))) return;
    setActionIp(ip.ipAddress);
    try {
      await blockIP(token, ip.ipAddress);
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Échec du blocage.');
    } finally {
      setActionIp(null);
    }
  };

  const handleUnblock = async (ip: SuspiciousIP) => {
    if (!token) return;
    setActionIp(ip.ipAddress);
    try {
      await unblockIP(token, ip.ipAddress);
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Échec du déblocage.');
    } finally {
      setActionIp(null);
    }
  };

  /** Filtrage client (recherche + niveau de menace) sur la liste chargée. */
  const filteredIPs = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return ips.filter((ip) => {
      const matchesSearch =
        !term ||
        ip.ipAddress?.toLowerCase().includes(term) ||
        ip.country?.toLowerCase().includes(term) ||
        ip.city?.toLowerCase().includes(term);
      const matchesThreat =
        filterThreat === 'all' || (ip.threatLevel ?? '').toLowerCase() === filterThreat;
      return matchesSearch && matchesThreat;
    });
  }, [ips, searchTerm, filterThreat]);

  const isBlocked = (ip: SuspiciousIP) => (ip.blockStatus ?? '').toLowerCase().includes('block');

  // Statistiques : on privilégie celles du backend, avec repli sur le calcul local.
  const totalIps = stats?.totalSuspiciousIPs ?? ips.length;
  const blockedCount = stats?.totalBlockedIPs ?? ips.filter(isBlocked).length;
  const criticalCount =
    stats?.criticalThreats ?? ips.filter((ip) => (ip.threatLevel ?? '').toLowerCase() === 'critical').length;
  const totalAttempts = stats?.totalAttempts ?? ips.reduce((sum, ip) => sum + (ip.attemptCount ?? 0), 0);

  const getThreatBadge = (level?: string) => {
    const key = (level ?? 'low').toLowerCase();
    const variants: Record<string, { color: string; label: string }> = {
      low: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', label: t('threatLow') },
      medium: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', label: t('threatMedium') },
      high: { color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', label: t('threatHigh') },
      critical: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', label: t('threatCritical') },
    };
    const config = variants[key] || variants.low;
    return <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>{config.label}</span>;
  };

  const getStatusBadge = (ip: SuspiciousIP) =>
    isBlocked(ip) ? (
      <Badge variant="destructive">{t('statusBlocked')}</Badge>
    ) : (
      <Badge variant="secondary">{t('statusMonitoring')}</Badge>
    );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: tBreadcrumb('dashboard'), href: `/admin` },
            { label: tBreadcrumb('admin'), href: `/admin` },
            { label: t('title') },
          ]}
        />

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Shield className="w-8 h-8" />
              {t('title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t('subtitle')}</p>
          </div>
          <Button variant="outline" size="sm" onClick={reload} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t.has('refresh') ? t('refresh') : 'Actualiser'}
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('suspiciousIPs')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalIps}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('blockedIPs')}</p>
                  <p className="text-2xl font-bold text-red-600">{blockedCount}</p>
                </div>
                <Ban className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('criticalThreats')}</p>
                  <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
                </div>
                <Shield className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalAttempts')}</p>
                  <p className="text-2xl font-bold text-orange-600">{totalAttempts}</p>
                </div>
                <Activity className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bloquer une IP manuellement */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Ban className="w-5 h-5 text-red-500" />
              Bloquer une IP
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Adresse IP (ex: 185.220.101.45)"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleBlockNewIp();
                }}
                className="flex-1"
              />
              <Button onClick={handleBlockNewIp} disabled={!newIp.trim() || blocking} variant="destructive" className="gap-2">
                {blocking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Ban className="w-4 h-4" />}
                Bloquer
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              L&apos;IP est ajoutée à la liste et immédiatement bloquée (créée si elle n&apos;existait pas).
            </p>
          </CardContent>
        </Card>

        {/* Search and Filter */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={filterThreat}
                onChange={(e) => setFilterThreat(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">{t('allThreats')}</option>
                <option value="low">{t('threatLow')}</option>
                <option value="medium">{t('threatMedium')}</option>
                <option value="high">{t('threatHigh')}</option>
                <option value="critical">{t('threatCritical')}</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* IPs Table */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle>{t('ipList')}</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12 text-gray-500">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                {t.has('loading') ? t('loading') : 'Chargement…'}
              </div>
            ) : filteredIPs.length === 0 ? (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                {t.has('empty') ? t('empty') : 'Aucune IP suspecte détectée.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t('ipAddress')}</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t('location')}</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t('isp')}</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t('threat')}</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t('attempts')}</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t('status')}</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIPs.map((ip) => (
                      <tr key={ip.id || ip.ipAddress} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="py-4 px-4">
                          <div className="font-mono text-sm font-medium text-gray-900 dark:text-white">{ip.ipAddress}</div>
                          {ip.suspicionReason && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">{ip.suspicionReason}</div>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-blue-500 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-900 dark:text-white">
                                {[ip.city, ip.region].filter(Boolean).join(', ') || '—'}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400">{ip.country}</p>
                              {ip.latitude != null && ip.longitude != null && (
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                  {ip.latitude.toFixed(4)}, {ip.longitude.toFixed(4)}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-white">{ip.isp || '—'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">{getThreatBadge(ip.threatLevel)}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{ip.attemptCount ?? 0}</span>
                          </div>
                          {ip.lastAttempt && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(ip.lastAttempt).toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-4">{getStatusBadge(ip)}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-end gap-2">
                            {isBlocked(ip) ? (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => handleUnblock(ip)}
                                disabled={actionIp === ip.ipAddress}
                                className="gap-1"
                              >
                                {actionIp === ip.ipAddress ? <Loader2 className="w-3 h-3 animate-spin" /> : <Unlock className="w-3 h-3" />}
                                {t('unblock')}
                              </Button>
                            ) : (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleBlock(ip)}
                                disabled={actionIp === ip.ipAddress}
                                className="gap-1"
                              >
                                {actionIp === ip.ipAddress ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-3 h-3" />}
                                {t('block')}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
