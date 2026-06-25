/**
 * Service des notifications de l'espace utilisateur.
 *
 * Opérations à portée utilisateur : on transmet l'access token (Bearer) et
 * l'identifiant utilisateur (en-tête X-User-Id) attendus par le backend.
 */

import { api } from '@/lib/api';

/** Notification telle que renvoyée par le backend. */
export interface BackendNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt?: string;
}

/** Liste les notifications de l'utilisateur. */
export function listNotifications(token: string, userId: string): Promise<BackendNotification[]> {
  return api.get<BackendNotification[]>('/notifications', { token, userId });
}

/** Marque une notification comme lue. */
export function markNotificationRead(id: string, token: string, userId: string): Promise<{ message?: string }> {
  return api.put<{ message?: string }>(`/notifications/${id}/read`, undefined, { token, userId });
}

/** Marque toutes les notifications comme lues. */
export function markAllNotificationsRead(token: string, userId: string): Promise<{ message?: string }> {
  return api.put<{ message?: string }>('/notifications/read-all', undefined, { token, userId });
}

/** Supprime une notification. */
export function deleteNotificationApi(id: string, token: string, userId: string): Promise<{ message?: string }> {
  return api.delete<{ message?: string }>(`/notifications/${id}`, { token, userId });
}

// --- Notifications « broadcast » admin (nouveaux messages de contact, alertes…) ---

/** Historique des notifications globales admin (rôle ADMIN requis). */
export function listAdminNotifications(token: string): Promise<BackendNotification[]> {
  return api.get<BackendNotification[]>('/notifications/admin', { token });
}

/** Marque une notification admin comme lue. */
export function markAdminNotificationRead(id: string, token: string): Promise<{ message?: string }> {
  return api.put<{ message?: string }>(`/notifications/admin/${id}/read`, undefined, { token });
}

/** Marque toutes les notifications admin comme lues. */
export function markAllAdminNotificationsRead(token: string): Promise<{ message?: string }> {
  return api.put<{ message?: string }>('/notifications/admin/read-all', undefined, { token });
}
