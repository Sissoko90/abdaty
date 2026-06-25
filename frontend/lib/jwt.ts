/**
 * Utilitaires de décodage des JSON Web Tokens (JWT) émis par le backend.
 *
 * IMPORTANT : ce module ne fait QUE décoder la charge utile (payload) du token
 * pour en lire les informations publiques (userId, email, rôle, expiration).
 * Il ne VÉRIFIE PAS la signature — la vérification cryptographique (RSA) est de
 * la responsabilité exclusive du backend. Côté frontend on se contente de lire
 * les claims afin d'alimenter la session NextAuth et de gérer l'expiration.
 *
 * Le backend (JwtService) place les claims suivants dans l'access token :
 *   - sub    : email de l'utilisateur (subject standard JWT)
 *   - userId : identifiant unique de l'utilisateur
 *   - email  : email de l'utilisateur
 *   - role   : rôle applicatif ("USER" | "ADMIN")
 *   - type   : "access" | "refresh"
 *   - exp    : date d'expiration (timestamp UNIX en secondes)
 */

/** Claims attendus dans un access token Abdaty. */
export interface AccessTokenClaims {
  sub: string;
  userId: string;
  email: string;
  role: string;
  type: string;
  /** Expiration en secondes depuis l'epoch UNIX. */
  exp: number;
  /** Émission en secondes depuis l'epoch UNIX. */
  iat?: number;
}

/**
 * Décode la partie « payload » d'un JWT (base64url) sans vérifier la signature.
 *
 * Fonctionne aussi bien côté serveur (Node : Buffer) que côté navigateur (atob),
 * ce qui permet de l'utiliser dans la route NextAuth comme dans des composants.
 *
 * @param token le JWT complet (header.payload.signature)
 * @returns les claims décodés, ou `null` si le token est malformé
 */
export function decodeJwt<T = AccessTokenClaims>(token: string): T | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    // base64url -> base64 standard
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json =
      typeof window === 'undefined'
        ? Buffer.from(base64, 'base64').toString('utf-8')
        : decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );

    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

/**
 * Retourne la date d'expiration d'un token en millisecondes (epoch),
 * ou `0` si le token est invalide / sans claim `exp`.
 */
export function getJwtExpiry(token: string): number {
  const claims = decodeJwt<AccessTokenClaims>(token);
  return claims?.exp ? claims.exp * 1000 : 0;
}

/**
 * Indique si un token est expiré (avec une marge de sécurité optionnelle).
 *
 * @param token le JWT à tester
 * @param skewMs marge appliquée avant l'expiration réelle (par défaut 30s)
 */
export function isJwtExpired(token: string, skewMs = 30_000): boolean {
  const expiry = getJwtExpiry(token);
  if (!expiry) return true;
  return Date.now() + skewMs >= expiry;
}
