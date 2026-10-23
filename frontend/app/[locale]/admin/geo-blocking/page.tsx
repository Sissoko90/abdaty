'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AdminPage, AdminPageHeader, AdminStatCard } from '@/components/admin/admin-page';
import { Switch } from '@/components/ui/switch';
import { Globe, Search, Ban, CheckCircle, MapPin, Shield, Loader2, RefreshCw, Plus, AlertTriangle } from 'lucide-react';
import {
  listGeoRules,
  getGeoBlockingStats,
  blockCountry,
  unblockCountry,
  type GeoBlockingRule,
  type GeoBlockingStats,
} from '@/services/security.service';
import { ApiRequestError } from '@/lib/api';
import { COUNTRIES, COUNTRY_BY_CODE, flagFromCode } from '@/lib/countries';

/** Règle enrichie avec le référentiel pays (nom, continent, drapeau). */
interface EnrichedRule extends GeoBlockingRule {
  _name: string;
  _continentCode: string;
  _continentName: string;
  _flag: string;
}

export default function AdminGeoBlockingPage() {
  const t = useTranslations('admin.geoBlocking');
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [rules, setRules] = useState<GeoBlockingRule[]>([]);
  const [stats, setStats] = useState<GeoBlockingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyCode, setBusyCode] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterContinent, setFilterContinent] = useState<string>('all');
  const [blockCode, setBlockCode] = useState(''); // pays à bloquer (sélecteur)

  const reload = useCallback(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    Promise.all([listGeoRules(token), getGeoBlockingStats(token).catch(() => null)])
      .then(([list, statistics]) => {
        setRules(list);
        setStats(statistics);
      })
      .catch((e) => setError(e instanceof ApiRequestError ? e.message : 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  const isBlocked = (r: GeoBlockingRule) => (r.accessStatus ?? '').toLowerCase().includes('block');

  // Enrichissement : le backend stocke souvent countryName = code et pas de
  // continent ; on complète depuis le référentiel pour un affichage lisible.
  const enriched: EnrichedRule[] = useMemo(
    () =>
      rules.map((r) => {
        const c = COUNTRY_BY_CODE[r.countryCode];
        return {
          ...r,
          _name: r.countryName && r.countryName !== r.countryCode ? r.countryName : c?.name || r.countryCode,
          _continentCode: r.continentCode || c?.continentCode || 'XX',
          _continentName: r.continentName || c?.continentName || 'Autres',
          _flag: r.flagEmoji || flagFromCode(r.countryCode),
        };
      }),
    [rules]
  );

  const handleBlockNew = async () => {
    if (!token || !blockCode) return;
    setBusyCode('new');
    try {
      await blockCountry(token, blockCode);
      setBlockCode('');
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Blocage impossible.');
    } finally {
      setBusyCode(null);
    }
  };

  const handleToggle = async (r: EnrichedRule) => {
    if (!token) return;
    setBusyCode(r.countryCode);
    try {
      if (isBlocked(r)) await unblockCountry(token, r.countryCode);
      else await blockCountry(token, r.countryCode);
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Action impossible.');
    } finally {
      setBusyCode(null);
    }
  };

  // Bloque/débloque tous les pays AFFICHÉS d'un continent. On agit pays par pays
  // (les règles créées manuellement n'ont pas de continentCode en base, donc
  // l'action « par continent » du backend ne les retrouverait pas).
  const handleBlockContinent = async (codes: string[], name: string) => {
    if (!token || codes.length === 0) return;
    // `t(..., { continent })` : le message contient un placeholder ICU {continent}.
    if (!confirm(t('confirmBlockContinent', { continent: name }))) return;
    setBusyCode('continent:' + name);
    try {
      await Promise.all(codes.map((c) => blockCountry(token, c)));
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Action impossible.');
    } finally {
      setBusyCode(null);
    }
  };

  const handleUnblockContinent = async (codes: string[], name: string) => {
    if (!token || codes.length === 0) return;
    setBusyCode('continent:' + name);
    try {
      await Promise.all(codes.map((c) => unblockCountry(token, c)));
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Action impossible.');
    } finally {
      setBusyCode(null);
    }
  };

  const filteredRules = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return enriched.filter((r) => {
      const matchesSearch =
        !term || r._name.toLowerCase().includes(term) || (r.countryCode ?? '').toLowerCase().includes(term);
      const matchesContinent = filterContinent === 'all' || r._continentName === filterContinent;
      return matchesSearch && matchesContinent;
    });
  }, [enriched, searchTerm, filterContinent]);

  const continents = useMemo(() => [...new Set(enriched.map((r) => r._continentName))].sort(), [enriched]);

  const totalCountries = stats?.totalCountries ?? rules.length;
  const blockedCount = stats?.blockedCountries ?? rules.filter(isBlocked).length;
  const allowedCount = stats?.allowedCountries ?? rules.length - rules.filter(isBlocked).length;
  const totalRequests = stats?.totalRequests ?? rules.reduce((s, r) => s + (r.requestCount ?? 0), 0);

  const getThreatColor = (score: number) => {
    if (score >= 8) return 'text-red-600 dark:text-red-400';
    if (score >= 5) return 'text-orange-600 dark:text-orange-400';
    if (score >= 3) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const th = 'h-11 bg-gray-50 px-4 text-left text-xs font-semibold text-gray-500 first:rounded-l-lg last:rounded-r-lg dark:bg-white/[0.03] dark:text-gray-400';
  const selectCls =
    'h-11 rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-white/15 dark:bg-white/5 dark:text-white';

  return (
    <AdminPage>
      <AdminPageHeader
        icon={Globe}
        title={t('title')}
        description={t('subtitle')}
        actions={
          <Button variant="outline" onClick={reload} disabled={loading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
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
        <AdminStatCard label={t('totalCountries')} value={totalCountries} icon={Globe} tone="ink" />
        <AdminStatCard label={t('blockedCountries')} value={blockedCount} icon={Ban} tone="primary" />
        <AdminStatCard label={t('allowedCountries')} value={allowedCount} icon={CheckCircle} tone="emerald" />
        <AdminStatCard label={t('totalRequests')} value={totalRequests.toLocaleString()} icon={Shield} tone="ochre" />
      </div>

      {/* Bloquer un pays */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]">
        <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-ink dark:text-white">
          <Ban className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          Bloquer un pays
        </h2>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Le pays est ajouté aux règles et immédiatement bloqué. Vous pouvez le débloquer ensuite dans la liste.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select
            value={blockCode}
            onChange={(e) => setBlockCode(e.target.value)}
            aria-label="Choisir un pays à bloquer"
            className={`flex-1 ${selectCls}`}
          >
            <option value="">Choisir un pays à bloquer…</option>
            {COUNTRIES.slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((c) => (
                <option key={c.code} value={c.code}>
                  {flagFromCode(c.code)} {c.name} ({c.code}) — {c.continentName}
                </option>
              ))}
          </select>
          <Button onClick={handleBlockNew} disabled={!blockCode || busyCode === 'new'} variant="destructive" className="h-11 gap-2">
            {busyCode === 'new' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Bloquer
          </Button>
        </div>
      </section>

      {/* Recherche et filtre */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
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
          value={filterContinent}
          onChange={(e) => setFilterContinent(e.target.value)}
          aria-label={t('allContinents')}
          className={selectCls}
        >
          <option value="all">{t('allContinents')}</option>
          {continents.map((continent) => (
            <option key={continent} value={continent}>
              {continent}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-sm text-gray-500 dark:text-gray-400">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary-600" />
          Chargement…
        </div>
      ) : rules.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-white/15 dark:bg-white/[0.02]">
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
            <Globe className="h-6 w-6" />
          </span>
          <p className="max-w-md text-sm text-gray-600 dark:text-gray-400">
            Aucune règle géographique. Utilisez « Bloquer un pays » ci-dessus pour en créer une.
          </p>
        </div>
      ) : (
        continents.map((continent) => {
          const continentRules = filteredRules.filter((r) => r._continentName === continent);
          if (continentRules.length === 0) return null;

          return (
            <section key={continent} className="rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex flex-col gap-3 border-b border-gray-100 p-6 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-ink dark:text-white">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  {continent}
                  <Badge variant="secondary">
                    {continentRules.length} {t('countries')}
                  </Badge>
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={busyCode === 'continent:' + continent}
                    onClick={() => handleBlockContinent(continentRules.map((r) => r.countryCode), continent)}
                  >
                    {t('blockAll')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={busyCode === 'continent:' + continent}
                    onClick={() => handleUnblockContinent(continentRules.map((r) => r.countryCode), continent)}
                  >
                    {t('unblockAll')}
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto p-2 sm:p-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className={th}>{t('country')}</th>
                      <th className={th}>{t('code')}</th>
                      <th className={th}>{t('requests')}</th>
                      <th className={th}>{t('threatScore')}</th>
                      <th className={`${th} text-right`}>{t('access')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {continentRules.map((country) => {
                      const score = country.threatScore ?? 0;
                      return (
                        <tr key={country.countryCode} className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50/70 dark:border-white/5 dark:hover:bg-white/[0.03]">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl leading-none">{country._flag}</span>
                              <span className="font-medium text-ink dark:text-white">{country._name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{country.countryCode}</span>
                          </td>
                          <td className="px-4 py-3.5 tabular-nums text-gray-700 dark:text-gray-300">
                            {(country.requestCount ?? 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="h-1.5 w-full max-w-[100px] rounded-full bg-gray-100 dark:bg-white/10">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    score >= 8 ? 'bg-red-500' : score >= 5 ? 'bg-orange-500' : score >= 3 ? 'bg-amber-400' : 'bg-emerald-500'
                                  }`}
                                  style={{ width: `${Math.min(score, 10) * 10}%` }}
                                />
                              </div>
                              <span className={`text-xs font-semibold tabular-nums ${getThreatColor(score)}`}>{score}/10</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-end gap-3">
                              {isBlocked(country) ? (
                                <Badge variant="destructive">{t('blocked')}</Badge>
                              ) : (
                                <Badge variant="success">{t('allowed')}</Badge>
                              )}
                              <Switch
                                checked={!isBlocked(country)}
                                disabled={busyCode === country.countryCode}
                                onCheckedChange={() => handleToggle(country)}
                                aria-label={`${country._name} : ${isBlocked(country) ? t('blocked') : t('allowed')}`}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })
      )}
    </AdminPage>
  );
}
