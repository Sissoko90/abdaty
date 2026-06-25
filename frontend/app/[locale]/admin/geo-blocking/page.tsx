'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Switch } from '@/components/ui/switch';
import { Globe, Search, Ban, CheckCircle, MapPin, Shield, Loader2, RefreshCw, Plus } from 'lucide-react';
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
  const tBreadcrumb = useTranslations('admin.breadcrumb');
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
              <Globe className="w-8 h-8" />
              {t('title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t('subtitle')}</p>
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

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalCountries')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCountries}</p>
                </div>
                <Globe className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('blockedCountries')}</p>
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
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('allowedCountries')}</p>
                  <p className="text-2xl font-bold text-green-600">{allowedCount}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalRequests')}</p>
                  <p className="text-2xl font-bold text-purple-600">{totalRequests.toLocaleString()}</p>
                </div>
                <Shield className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bloquer un pays */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Ban className="w-5 h-5 text-red-500" />
              Bloquer un pays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={blockCode}
                onChange={(e) => setBlockCode(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
              <Button onClick={handleBlockNew} disabled={!blockCode || busyCode === 'new'} variant="destructive" className="gap-2">
                {busyCode === 'new' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Bloquer
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Le pays est ajouté aux règles et immédiatement bloqué. Vous pouvez le débloquer ensuite dans la liste.
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
                value={filterContinent}
                onChange={(e) => setFilterContinent(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">{t('allContinents')}</option>
                {continents.map((continent) => (
                  <option key={continent} value={continent}>
                    {continent}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Chargement…
          </div>
        ) : rules.length === 0 ? (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">
              Aucune règle géographique. Utilisez « Bloquer un pays » ci-dessus pour en créer une.
            </CardContent>
          </Card>
        ) : (
          continents.map((continent) => {
            const continentRules = filteredRules.filter((r) => r._continentName === continent);
            if (continentRules.length === 0) return null;

            return (
              <Card key={continent} className="dark:bg-gray-800 dark:border-gray-700 mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      {continent}
                      <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                        ({continentRules.length} {t('countries')})
                      </span>
                    </CardTitle>
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
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t('country')}</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t('code')}</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t('requests')}</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t('threatScore')}</th>
                          <th className="text-right py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">{t('access')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {continentRules.map((country) => {
                          const score = country.threatScore ?? 0;
                          return (
                            <tr key={country.countryCode} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{country._flag}</span>
                                  <span className="font-medium text-gray-900 dark:text-white">{country._name}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <span className="font-mono text-sm text-gray-600 dark:text-gray-400">{country.countryCode}</span>
                              </td>
                              <td className="py-4 px-4">
                                <span className="text-sm text-gray-900 dark:text-white">{(country.requestCount ?? 0).toLocaleString()}</span>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
                                    <div
                                      className={`h-2 rounded-full ${
                                        score >= 8 ? 'bg-red-500' : score >= 5 ? 'bg-orange-500' : score >= 3 ? 'bg-yellow-500' : 'bg-green-500'
                                      }`}
                                      style={{ width: `${Math.min(score, 10) * 10}%` }}
                                    />
                                  </div>
                                  <span className={`text-sm font-medium ${getThreatColor(score)}`}>{score}/10</span>
                                </div>
                              </td>
                              <td className="py-4 px-4">
                                <div className="flex items-center justify-end gap-3">
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {isBlocked(country) ? t('blocked') : t('allowed')}
                                  </span>
                                  <Switch
                                    checked={!isBlocked(country)}
                                    disabled={busyCode === country.countryCode}
                                    onCheckedChange={() => handleToggle(country)}
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
