/**
 * Client HTTP centralisé pour communiquer avec le backend Abdaty (Spring Boot).
 *
 * Objectifs :
 *  - Une seule source de vérité pour l'URL de base de l'API (NEXT_PUBLIC_API_URL).
 *  - Injection automatique de l'en-tête `Authorization: Bearer <accessToken>`.
 *  - Support des en-têtes spécifiques attendus par certains endpoints du backend
 *    (`X-User-Id` pour /auth/me, `X-Refresh-Token` pour /auth/logout).
 *  - Normalisation des erreurs en une exception typée `ApiRequestError`.
 *
 * Ce module est isomorphe : il fonctionne côté serveur (route handlers, RSC)
 * comme côté navigateur (composants clients). Le token est toujours fourni
 * explicitement par l'appelant (depuis la session NextAuth), ce qui évite tout
 * couplage implicite avec le contexte d'exécution.
 */

/** URL de base de l'API backend côté NAVIGATEUR, ex. http://localhost:8080/api/v1 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:8080/api/v1';

/**
 * URL de base utilisée CÔTÉ SERVEUR (SSR, route handlers, callback `authorize` de
 * NextAuth). En conteneur Docker, le backend n'est PAS sur `localhost` : on le joint
 * via le réseau interne (`INTERNAL_API_URL`, ex. http://backend:8080/api/v1).
 * Repli sur l'URL navigateur si non défini (dev natif).
 */
const SERVER_API_BASE_URL =
  process.env.INTERNAL_API_URL?.replace(/\/$/, '') ?? API_BASE_URL;

/** Base à utiliser selon le contexte : serveur (interne) vs navigateur. */
const resolveBaseUrl = (): string =>
  typeof window === 'undefined' ? SERVER_API_BASE_URL : API_BASE_URL;

/**
 * Origine du backend SANS le préfixe d'API (ex. http://localhost:8080).
 * Utile pour construire l'URL des fichiers statiques servis hors /api (ex. /uploads/...).
 */
export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/v\d+\/?$/, '');

/**
 * Erreur normalisée renvoyée par le client API.
 * `status` reprend le code HTTP, `body` la charge utile d'erreur si disponible.
 */
export class ApiRequestError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.body = body;
  }
}

/** Options d'une requête vers le backend. */
export interface ApiRequestOptions {
  /** Méthode HTTP (par défaut GET). */
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  /** Corps de la requête : sérialisé en JSON automatiquement si ce n'est pas déjà une string. */
  body?: unknown;
  /** Access token JWT à placer dans l'en-tête Authorization. */
  token?: string | null;
  /** Identifiant utilisateur (en-tête X-User-Id), requis par /auth/me et /auth/logout. */
  userId?: string | null;
  /** Refresh token (en-tête X-Refresh-Token), requis par /auth/logout. */
  refreshToken?: string | null;
  /** En-têtes additionnels éventuels. */
  headers?: Record<string, string>;
  /** Signal d'annulation (AbortController). */
  signal?: AbortSignal;
  /** Active la révalidation Next.js (uniquement côté serveur). */
  cache?: RequestCache;
}

/**
 * Effectue une requête vers le backend et renvoie le corps désérialisé.
 *
 * @typeParam T type attendu de la réponse
 * @param path chemin relatif à la base de l'API (ex. "/auth/login")
 * @param options options de la requête
 * @throws {ApiRequestError} si la réponse HTTP n'est pas un succès (>= 400)
 */
export async function apiFetch<T = unknown>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, token, userId, refreshToken, headers = {}, signal, cache } =
    options;

  const finalHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  if (token) finalHeaders['Authorization'] = `Bearer ${token}`;
  if (userId) finalHeaders['X-User-Id'] = userId;
  if (refreshToken) finalHeaders['X-Refresh-Token'] = refreshToken;

  const url = `${resolveBaseUrl()}${path.startsWith('/') ? path : `/${path}`}`;

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body:
      body === undefined
        ? undefined
        : body instanceof FormData || typeof body === 'string'
          ? (body as BodyInit)
          : JSON.stringify(body),
    signal,
    cache,
  });

  // 204 No Content : pas de corps à parser.
  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    // 401 dans le navigateur = session / JWT invalide ou expiré.
    // Redirection SILENCIEUSE vers la connexion (aucun message affiché).
    if (response.status === 401 && typeof window !== 'undefined') {
      const seg = window.location.pathname.split('/')[1];
      const loc = seg === 'fr' || seg === 'en' ? seg : 'fr';
      if (!window.location.pathname.includes('/login')) {
        window.location.href = `/${loc}/login`;
      }
    }
    // Extraction d'un message lisible depuis la charge utile d'erreur du backend.
    let message = `Requête échouée (${response.status})`;
    if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>;
      if (typeof obj.message === 'string') message = obj.message;
      else if (typeof obj.error === 'string') message = obj.error;
    }
    throw new ApiRequestError(message, response.status, data);
  }

  return data as T;
}

/** Parse JSON sans lever d'exception (retourne la string brute en cas d'échec). */
function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

/* ------------------------------------------------------------------ */
/* Raccourcis pratiques                                                */
/* ------------------------------------------------------------------ */

export const api = {
  get: <T>(path: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiFetch<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiFetch<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiFetch<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiFetch<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) =>
    apiFetch<T>(path, { ...options, method: 'DELETE' }),
};
