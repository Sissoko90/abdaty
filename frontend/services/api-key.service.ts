/**
 * Service des clés API de l'espace utilisateur (dashboard).
 *
 * Les opérations sont à portée utilisateur : on transmet l'access token (Bearer)
 * et l'identifiant utilisateur (en-tête X-User-Id) attendus par le backend.
 */

import { api } from '@/lib/api';

/** Clé API renvoyée par le backend (valeur masquée en liste, complète à la création). */
export interface ApiKey {
  id: string;
  name: string;
  key: string;
  status: string; // 'active' | 'revoked'
  permissions?: string[];
  rateLimit?: number;
  createdAt?: string;
  lastUsedAt?: string;
}

/** Charge utile de création d'une clé API. */
export interface ApiKeyInput {
  name: string;
  permissions?: string[];
  rateLimit?: number;
}

/** Liste les clés API de l'utilisateur (valeurs masquées). */
export function listApiKeys(token: string, userId: string): Promise<ApiKey[]> {
  return api.get<ApiKey[]>('/api-keys', { token, userId });
}

/**
 * Crée une clé API. La réponse contient la clé COMPLÈTE en clair :
 * elle doit être copiée immédiatement (non récupérable ensuite).
 */
export function createApiKey(input: ApiKeyInput, token: string, userId: string): Promise<ApiKey> {
  return api.post<ApiKey>('/api-keys', input, { token, userId });
}

/** Révoque une clé API de l'utilisateur. */
export function revokeApiKey(id: string, token: string, userId: string): Promise<{ message?: string }> {
  return api.delete<{ message?: string }>(`/api-keys/${id}`, { token, userId });
}
