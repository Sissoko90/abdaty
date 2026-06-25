/**
 * Service Consentements cookies : enregistrement public + lecture/statistiques admin.
 */

import { api } from '@/lib/api';

export interface CookieConsentRecord {
  id: string;
  visitorId: string;
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  ipAddress?: string;
  locale?: string;
  page?: string;
  createdAt?: string;
}

export interface CookieConsentStats {
  total: number;
  analyticsAccepted: number;
  marketingAccepted: number;
  preferencesAccepted: number;
  rejectedAll: number;
  analyticsRate: number;
}

export interface CookieConsentInput {
  visitorId: string;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
  locale?: string;
  page?: string;
}

/** Enregistre un consentement (public, sans token). */
export function recordCookieConsent(input: CookieConsentInput): Promise<CookieConsentRecord> {
  return api.post<CookieConsentRecord>('/cookie-consents', input);
}

/** Liste paginée des consentements (admin, page 0-based). */
export function listCookieConsents(token: string, page = 0, size = 50): Promise<CookieConsentRecord[]> {
  return api.get<CookieConsentRecord[]>(`/cookie-consents?page=${page}&size=${size}`, { token });
}

/** Statistiques des consentements (admin). */
export function getCookieConsentStats(token: string): Promise<CookieConsentStats> {
  return api.get<CookieConsentStats>('/cookie-consents/stats', { token });
}
