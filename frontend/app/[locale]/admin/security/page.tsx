'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AdminPage, AdminPageHeader, AdminStatCard } from '@/components/admin/admin-page';
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
  ShieldCheck,
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
    const variants: Record<string, { variant: 'secondary' | 'warning' | 'destructive'; className?: string; label: string }> = {
      low: { variant: 'secondary', label: t('threatLow') },
      medium: { variant: 'warning', label: t('threatMedium') },
      high: { variant: 'warning', className: 'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300', label: t('threatHigh') },
      critical: { variant: 'destructive', label: t('threatCritical') },
    };
    const config = variants[key] || variants.low;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (ip: SuspiciousIP) =>
    isBlocked(ip) ? (
      <Badge variant="destructive">{t('statusBlocked')}</Badge>
    ) : (
      <Badge variant="secondary">{t('statusMonitoring')}</Badge>
    );

  const th = 'h-11 bg-gray-50 px-4 text-left text-xs font-semibold text-gray-500 first:rounded-l-lg last:rounded-r-lg dark:bg-white/[0.03] dark:text-gray-400';

  return (
    <AdminPage>
      <AdminPageHeader
        icon={Shield}
        title={t('title')}
        description={t('subtitle')}
        actions={
          <Button variant="outline" onClick={reload} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {t.has('refresh') ? t('refresh') : 'Actualiser'}
          </Button>
        }
      />

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Chiffres clés */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label={t('suspiciousIPs')} value={totalIps} icon={AlertTriangle} tone="ochre" />
        <AdminStatCard label={t('blockedIPs')} value={blockedCount} icon={Ban} tone="primary" />
        <AdminStatCard label={t('criticalThreats')} value={criticalCount} icon={Shield} tone="ink" />
        <AdminStatCard label={t('totalAttempts')} value={totalAttempts} icon={Activity} tone="emerald" />
      </div>

      {/* Bloquer une IP manuellement */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-ink dark:text-white">
          <Ban className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          Bloquer une IP
        </h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          L&apos;IP est ajoutée à la liste et immédiatement bloquée (créée si elle n&apos;existait pas).
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Adresse IP (ex: 185.220.101.45)"
            value={newIp}
            onChange={(e) => setNewIp(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleBlockNewIp();
            }}
            className="flex-1 font-mono"
          />
          <Button onClick={handleBlockNewIp} disabled={!newIp.trim() || blocking} variant="destructive" className="h-11 gap-2">
            {blocking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
            Bloquer
          </Button>
        </div>
      </section>

      {/* Liste des IPs */}
      <section className="rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 border-b border-gray-100 p-6 dark:border-white/10 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-bold text-ink dark:text-white">{t('ipList')}</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative sm:w-72">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                aria-label={t('searchPlaceholder')}
              />
            </div>
            <select
              value={filterThreat}
              onChange={(e) => setFilterThreat(e.target.value)}
              aria-label={t('threat')}
              className="h-11 rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-white/15 dark:bg-white/5 dark:text-white"
            >
              <option value="all">{t('allThreats')}</option>
              <option value="low">{t('threatLow')}</option>
              <option value="medium">{t('threatMedium')}</option>
              <option value="high">{t('threatHigh')}</option>
              <option value="critical">{t('threatCritical')}</option>
            </select>
          </div>
        </div>

        <div className="p-2 sm:p-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-sm text-gray-500 dark:text-gray-400">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary-600" />
              {t.has('loading') ? t('loading') : 'Chargement…'}
            </div>
          ) : filteredIPs.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t.has('empty') ? t('empty') : 'Aucune IP suspecte détectée.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className={th}>{t('ipAddress')}</th>
                    <th className={th}>{t('location')}</th>
                    <th className={th}>{t('isp')}</th>
                    <th className={th}>{t('threat')}</th>
                    <th className={th}>{t('attempts')}</th>
                    <th className={th}>{t('status')}</th>
                    <th className={`${th} text-right`}>{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIPs.map((ip) => (
                    <tr key={ip.id || ip.ipAddress} className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50/70 dark:border-white/5 dark:hover:bg-white/[0.03]">
                      <td className="px-4 py-4">
                        <div className="font-mono text-xs font-semibold text-ink dark:text-white">{ip.ipAddress}</div>
                        {ip.suspicionReason && (
                          <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{ip.suspicionReason}</div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                          <div>
                            <p className="text-ink dark:text-white">
                              {[ip.city, ip.region].filter(Boolean).join(', ') || '—'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{ip.country}</p>
                            {ip.latitude != null && ip.longitude != null && (
                              <p className="font-mono text-xs text-gray-400">
                                {ip.latitude.toFixed(4)}, {ip.longitude.toFixed(4)}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <Globe className="h-4 w-4 shrink-0 text-gray-400" />
                          {ip.isp || '—'}
                        </div>
                      </td>
                      <td className="px-4 py-4">{getThreatBadge(ip.threatLevel)}</td>
                      <td className="px-4 py-4">
                        <div className="font-semibold tabular-nums text-ink dark:text-white">{ip.attemptCount ?? 0}</div>
                        {ip.lastAttempt && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(ip.lastAttempt).toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">{getStatusBadge(ip)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end">
                          {isBlocked(ip) ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnblock(ip)}
                              disabled={actionIp === ip.ipAddress}
                              className="gap-1.5"
                            >
                              {actionIp === ip.ipAddress ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Unlock className="h-3.5 w-3.5" />}
                              {t('unblock')}
                            </Button>
                          ) : (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleBlock(ip)}
                              disabled={actionIp === ip.ipAddress}
                              className="gap-1.5"
                            >
                              {actionIp === ip.ipAddress ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
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
        </div>
      </section>
    </AdminPage>
  );
}
