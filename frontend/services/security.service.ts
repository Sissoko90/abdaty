/**
 * Service Sécurité & Monitoring : pont typé entre le frontend admin et les
 * endpoints de sécurité du backend Abdaty.
 *
 * Domaines couverts :
 *  - IPs suspectes          → /suspicious-ips
 *  - Blocage géographique   → /geo-blocking
 *  - Journaux applicatifs   → /logs
 *
 * Toutes ces opérations sont réservées aux administrateurs : l'access token de
 * la session NextAuth doit être fourni explicitement (session.accessToken).
 */

import { api } from '@/lib/api';

/* ========================= IPs SUSPECTES ========================= */

/** IP suspecte telle que renvoyée par le backend. */
export interface SuspiciousIP {
  id: string;
  ipAddress: string;
  city?: string;
  region?: string;
  country?: string;
  countryCode?: string;
  latitude?: number;
  longitude?: number;
  isp?: string;
  /** LOW | MEDIUM | HIGH | CRITICAL */
  threatLevel?: string;
  attemptCount?: number;
  lastAttempt?: string;
  /** Statut de blocage (ex: MONITORING | BLOCKED | WHITELISTED) */
  blockStatus?: string;
  suspicionReason?: string;
  details?: string;
}

/** Statistiques agrégées des IPs suspectes. */
export interface SuspiciousIPStatistics {
  totalSuspiciousIPs: number;
  totalBlockedIPs: number;
  criticalThreats: number;
  totalAttempts: number;
}

/** Statistiques des IPs suspectes. */
export function getSuspiciousIPStatistics(token: string): Promise<SuspiciousIPStatistics> {
  return api.get<SuspiciousIPStatistics>('/suspicious-ips/statistics', { token });
}

/** Liste paginée des IPs suspectes. */
export function listSuspiciousIPs(token: string, page = 0, size = 100): Promise<SuspiciousIP[]> {
  return api.get<SuspiciousIP[]>(`/suspicious-ips?page=${page}&size=${size}`, { token });
}

/** Filtre les IPs par niveau de menace (LOW, MEDIUM, HIGH, CRITICAL). */
export function listSuspiciousIPsByThreat(token: string, threatLevel: string): Promise<SuspiciousIP[]> {
  return api.get<SuspiciousIP[]>(`/suspicious-ips/threat/${encodeURIComponent(threatLevel)}`, { token });
}

/** Recherche d'IPs suspectes (terme libre). */
export function searchSuspiciousIPs(token: string, term: string): Promise<SuspiciousIP[]> {
  return api.get<SuspiciousIP[]>(`/suspicious-ips/search?searchTerm=${encodeURIComponent(term)}`, { token });
}

/** Bloque une IP. */
export function blockIP(token: string, ipAddress: string): Promise<SuspiciousIP> {
  return api.post<SuspiciousIP>(`/suspicious-ips/block/${encodeURIComponent(ipAddress)}`, undefined, { token });
}

/** Débloque une IP. */
export function unblockIP(token: string, ipAddress: string): Promise<SuspiciousIP> {
  return api.post<SuspiciousIP>(`/suspicious-ips/unblock/${encodeURIComponent(ipAddress)}`, undefined, { token });
}

/* ========================= GEO-BLOCKING ========================= */

/** Règle de blocage géographique. */
export interface GeoBlockingRule {
  id: string;
  countryCode: string;
  countryName?: string;
  continentCode?: string;
  continentName?: string;
  /** ALLOWED | BLOCKED */
  accessStatus?: string;
  threatScore?: number;
  requestCount?: number;
  flagEmoji?: string;
}

/** Statistiques du blocage géographique. */
export interface GeoBlockingStats {
  totalCountries: number;
  blockedCountries: number;
  allowedCountries: number;
  totalRequests: number;
}

/** Statistiques géographiques. */
export function getGeoBlockingStats(token: string): Promise<GeoBlockingStats> {
  return api.get<GeoBlockingStats>('/geo-blocking/statistics', { token });
}

/** Liste toutes les règles géographiques. */
export function listGeoRules(token: string): Promise<GeoBlockingRule[]> {
  return api.get<GeoBlockingRule[]>('/geo-blocking', { token });
}

/** Filtre les règles par statut d'accès (ALLOWED, BLOCKED). */
export function listGeoRulesByStatus(token: string, accessStatus: string): Promise<GeoBlockingRule[]> {
  return api.get<GeoBlockingRule[]>(`/geo-blocking/status/${encodeURIComponent(accessStatus)}`, { token });
}

/** Recherche de règles par nom de pays. */
export function searchGeoRules(token: string, countryName: string): Promise<GeoBlockingRule[]> {
  return api.get<GeoBlockingRule[]>(`/geo-blocking/search?countryName=${encodeURIComponent(countryName)}`, { token });
}

/** Bloque un pays par code ISO. */
export function blockCountry(token: string, countryCode: string): Promise<GeoBlockingRule> {
  return api.post<GeoBlockingRule>(`/geo-blocking/block/${encodeURIComponent(countryCode)}`, undefined, { token });
}

/** Débloque un pays par code ISO. */
export function unblockCountry(token: string, countryCode: string): Promise<GeoBlockingRule> {
  return api.post<GeoBlockingRule>(`/geo-blocking/unblock/${encodeURIComponent(countryCode)}`, undefined, { token });
}

/** Bloque tout un continent (renvoie le nombre de pays affectés). */
export function blockContinent(token: string, continentCode: string): Promise<number> {
  return api.post<number>(`/geo-blocking/block-continent/${encodeURIComponent(continentCode)}`, undefined, { token });
}

/** Débloque tout un continent (renvoie le nombre de pays affectés). */
export function unblockContinent(token: string, continentCode: string): Promise<number> {
  return api.post<number>(`/geo-blocking/unblock-continent/${encodeURIComponent(continentCode)}`, undefined, { token });
}

/* ============================ LOGS ============================ */

/** Entrée de journal applicatif. */
export interface LogEntry {
  level: string;
  timestamp: string;
  logger?: string;
  message: string;
  details?: Record<string, string>;
}

/** Statistiques des journaux. */
export interface LogStatistics {
  totalLogs: number;
  errorCount: number;
  warningCount: number;
  infoCount: number;
}

/** Statistiques des journaux. */
export function getLogStatistics(token: string): Promise<LogStatistics> {
  return api.get<LogStatistics>('/logs/statistics', { token });
}

/**
 * Liste filtrée des journaux (niveau et/ou terme de recherche, paginée).
 * Sans filtre, renvoie les journaux les plus récents.
 */
export function listLogs(
  token: string,
  opts: { level?: string; searchTerm?: string; page?: number; size?: number } = {}
): Promise<LogEntry[]> {
  const params = new URLSearchParams();
  if (opts.level) params.set('level', opts.level);
  if (opts.searchTerm) params.set('searchTerm', opts.searchTerm);
  params.set('page', String(opts.page ?? 0));
  params.set('size', String(opts.size ?? 100));
  return api.get<LogEntry[]>(`/logs/filter?${params.toString()}`, { token });
}

/** Vide tous les journaux. */
export function clearLogs(token: string): Promise<unknown> {
  return api.delete('/logs', { token });
}

/* ====================== MÉTRIQUES SYSTÈME ====================== */

/**
 * Métriques système temps réel (carte clé→valeur).
 * Clés connues : cpuUsage, memoryUsage, diskUsage, avgResponseTime,
 * activeUsers, errorRate, apiRequests, smsSent, serverAvailability,
 * et leurs deltas *Change.
 */
export type SystemMetrics = Record<string, number>;

/** Récupère les métriques système courantes. */
export function getSystemMetrics(token: string): Promise<SystemMetrics> {
  return api.get<SystemMetrics>('/system-metrics', { token });
}
