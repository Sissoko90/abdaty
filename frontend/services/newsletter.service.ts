/**
 * Service Newsletter : pont typé entre le frontend et le domaine newsletter
 * du backend (inscription publique, gestion des abonnés et des campagnes, stats).
 *
 * - `subscribeNewsletter` est PUBLIC (aucun token).
 * - Les autres fonctions sont ADMIN (token de session NextAuth requis).
 */

import { api } from '@/lib/api';

/* ============================ Types ============================ */

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  locale?: string;
  subscribed: boolean;
  source?: string;
  createdAt?: string;
}

export type CampaignStatus = 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'FAILED';

/** Pièce jointe d'une campagne (URL servie sous /uploads + nom d'affichage). */
export interface CampaignAttachment {
  url: string;
  filename: string;
}

export interface NewsletterCampaign {
  id: string;
  subject: string;
  contentHtml: string;
  campaignStatus: CampaignStatus;
  scheduledAt?: string | null;
  sentAt?: string | null;
  recipientCount?: number;
  sentCount?: number;
  openCount?: number;
  clickCount?: number;
  attachments?: CampaignAttachment[];
  createdAt?: string;
}

export interface CampaignInput {
  subject: string;
  contentHtml: string;
  /** ISO local date-time (sans timezone), ex "2026-06-30T09:00:00". */
  scheduledAt?: string | null;
  attachments?: CampaignAttachment[];
}

export interface NewsletterStats {
  totalSubscribers: number;
  activeSubscribers: number;
  unsubscribed: number;
  totalCampaigns: number;
  emailsSent: number;
  totalOpens: number;
  totalClicks: number;
}

/* ====================== Inscription (public) ====================== */

/** Inscrit un email à la newsletter (endpoint public). */
export function subscribeNewsletter(
  email: string,
  opts: { name?: string; locale?: string; source?: string } = {}
): Promise<{ message: string; email: string }> {
  return api.post('/newsletter/subscribe', { email, ...opts });
}

/* ====================== Abonnés (admin) ====================== */

/** Liste paginée des abonnés (page 0-based). */
export function listSubscribers(token: string, page = 0, size = 50): Promise<NewsletterSubscriber[]> {
  return api.get<NewsletterSubscriber[]>(`/newsletter/subscribers?page=${page}&size=${size}`, { token });
}

export function setSubscriberActive(token: string, id: string, value: boolean): Promise<NewsletterSubscriber> {
  return api.patch<NewsletterSubscriber>(`/newsletter/subscribers/${id}/active?value=${value}`, undefined, { token });
}

export function deleteSubscriber(token: string, id: string): Promise<void> {
  return api.delete<void>(`/newsletter/subscribers/${id}`, { token });
}

/* ====================== Campagnes (admin) ====================== */

export function listCampaigns(token: string): Promise<NewsletterCampaign[]> {
  return api.get<NewsletterCampaign[]>('/newsletter/campaigns', { token });
}

export function getCampaign(token: string, id: string): Promise<NewsletterCampaign> {
  return api.get<NewsletterCampaign>(`/newsletter/campaigns/${id}`, { token });
}

export function createCampaign(token: string, input: CampaignInput): Promise<NewsletterCampaign> {
  return api.post<NewsletterCampaign>('/newsletter/campaigns', input, { token });
}

export function updateCampaign(token: string, id: string, input: CampaignInput): Promise<NewsletterCampaign> {
  return api.put<NewsletterCampaign>(`/newsletter/campaigns/${id}`, input, { token });
}

export function deleteCampaign(token: string, id: string): Promise<void> {
  return api.delete<void>(`/newsletter/campaigns/${id}`, { token });
}

/** Envoi immédiat d'une campagne. */
export function sendCampaignNow(token: string, id: string): Promise<NewsletterCampaign> {
  return api.post<NewsletterCampaign>(`/newsletter/campaigns/${id}/send`, undefined, { token });
}

/** Programme l'envoi d'une campagne à une date (ISO local). */
export function scheduleCampaign(token: string, id: string, at: string): Promise<NewsletterCampaign> {
  return api.post<NewsletterCampaign>(`/newsletter/campaigns/${id}/schedule?at=${encodeURIComponent(at)}`, undefined, { token });
}

/* ====================== Statistiques (admin) ====================== */

export function getNewsletterStats(token: string): Promise<NewsletterStats> {
  return api.get<NewsletterStats>('/newsletter/stats', { token });
}
