/**
 * Service Utilisateurs (admin) : pont typé vers le domaine users du backend.
 * Toutes les opérations exigent l'access token de la session NextAuth.
 */

import { api } from '@/lib/api';

/** Utilisateur tel que renvoyé par le backend (UserResponseDTO). */
export interface BackendUser {
  id: string;
  username?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  role?: string;
  /** ACTIVE | INACTIVE | BANNED | BLOCKED */
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Charge utile de création d'un utilisateur. */
export interface CreateUserInput {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

/** Liste tous les utilisateurs. */
export function listUsers(token: string): Promise<BackendUser[]> {
  return api.get<BackendUser[]>('/users', { token });
}

/** Crée un utilisateur. */
export function createUser(token: string, input: CreateUserInput): Promise<BackendUser> {
  return api.post<BackendUser>('/users', input, { token });
}

/** Supprime un utilisateur. */
export function deleteUser(token: string, id: string): Promise<void> {
  return api.delete<void>(`/users/${id}`, { token });
}

/** Change le statut d'un utilisateur via l'action dédiée du backend. */
export function setUserStatus(
  token: string,
  id: string,
  action: 'activate' | 'deactivate' | 'ban' | 'unban' | 'block' | 'unblock'
): Promise<BackendUser> {
  return api.patch<BackendUser>(`/users/${id}/${action}`, undefined, { token });
}
