/**
 * Service Contact : envoi public d'un message + gestion admin (liste, lu, suppression).
 */

import { api } from '@/lib/api';

export interface ContactInput {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  service?: string;
  message: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  service?: string;
  message: string;
  ipAddress?: string;
  isRead: boolean;
  createdAt?: string;
}

export interface ContactStats {
  total: number;
  unread: number;
}

/** Envoi public du formulaire de contact. */
export function submitContact(input: ContactInput): Promise<{ message: string; id: string }> {
  return api.post('/contact', input);
}

/** Liste paginée des messages (admin). */
export function listContactMessages(token: string, page = 0, size = 50): Promise<ContactMessage[]> {
  return api.get<ContactMessage[]>(`/contact?page=${page}&size=${size}`, { token });
}

export function getContactStats(token: string): Promise<ContactStats> {
  return api.get<ContactStats>('/contact/stats', { token });
}

export function markContactRead(token: string, id: string, value: boolean): Promise<ContactMessage> {
  return api.patch<ContactMessage>(`/contact/${id}/read?value=${value}`, undefined, { token });
}

export function deleteContactMessage(token: string, id: string): Promise<void> {
  return api.delete<void>(`/contact/${id}`, { token });
}
