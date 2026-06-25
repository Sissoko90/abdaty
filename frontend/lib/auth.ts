import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { JWT } from 'next-auth/jwt';
import { apiFetch } from '@/lib/api';
import { decodeJwt, getJwtExpiry } from '@/lib/jwt';

/**
 * Options NextAuth branchées sur le backend Abdaty (Spring Boot).
 *
 * Définies ici (et non dans le route handler) car un fichier `route.ts` de
 * l'App Router ne doit exporter que des handlers HTTP (GET/POST/...). Ce module
 * peut en revanche être importé partout où l'on a besoin de `getServerSession`.
 *
 * Flux :
 *  1. `authorize` appelle POST /auth/login → { accessToken, refreshToken }.
 *  2. On décode l'access token (claims userId/email/role) et on récupère le
 *     profil via GET /auth/me (best effort) pour afficher le nom complet.
 *  3. Le callback `jwt` stocke tokens + rôle + expiration et rafraîchit l'access
 *     token via /auth/refresh-token lorsqu'il expire.
 *  4. Le callback `session` expose l'access token et le rôle aux composants.
 */

/** Réponse du backend pour /auth/login et /auth/refresh-token. */
interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
}

/** Profil renvoyé par GET /auth/me (sous-ensemble utilisé ici). */
interface MeResponse {
  id?: string;
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Rafraîchit l'access token à partir du refresh token.
 *
 * NB : l'endpoint /auth/refresh-token du backend est annoté `isAuthenticated()`,
 * on transmet donc l'access token courant dans l'en-tête Authorization en plus
 * du refresh token dans le corps. Le rafraîchissement doit donc intervenir
 * AVANT l'expiration effective de l'access token (cf. callback `jwt`).
 */
async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const data = await apiFetch<AuthResponse>('/auth/refresh-token', {
      method: 'POST',
      token: token.accessToken,
      body: { refreshToken: token.refreshToken },
    });

    const claims = decodeJwt(data.accessToken);
    return {
      ...token,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? token.refreshToken,
      accessTokenExpires: getJwtExpiry(data.accessToken),
      role: claims?.role ?? token.role,
      error: undefined,
    };
  } catch {
    // En cas d'échec, on marque la session : l'utilisateur devra se reconnecter.
    return { ...token, error: 'RefreshAccessTokenError' };
  }
}

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // 1. Authentification auprès du backend.
          const auth = await apiFetch<AuthResponse>('/auth/login', {
            method: 'POST',
            body: { email: credentials.email, password: credentials.password },
          });

          // 2. Lecture des claims de l'access token (userId, email, rôle).
          const claims = decodeJwt(auth.accessToken);
          if (!claims) return null;

          // 3. Récupération du profil pour le nom affiché (best effort).
          let name = claims.email;
          try {
            const me = await apiFetch<MeResponse>('/auth/me', {
              token: auth.accessToken,
              userId: claims.userId,
            });
            name =
              [me.firstName, me.lastName].filter(Boolean).join(' ') ||
              me.username ||
              me.email ||
              claims.email;
          } catch {
            /* profil indisponible : on garde l'email comme nom */
          }

          return {
            id: claims.userId,
            email: claims.email,
            name,
            role: claims.role,
            accessToken: auth.accessToken,
            refreshToken: auth.refreshToken,
          };
        } catch (e: unknown) {
          // On propage le message du backend (compte désactivé, non vérifié, banni,
          // identifiants invalides…) pour l'afficher tel quel à l'utilisateur.
          const err = e as { message?: string; body?: { message?: string } };
          const msg = err?.message || err?.body?.message;
          throw new Error(typeof msg === 'string' && msg.trim() ? msg : 'Identifiants invalides');
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Connexion initiale : on hydrate le token avec les données du backend.
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          accessTokenExpires: getJwtExpiry(user.accessToken),
        };
      }

      // Token encore valide (marge de 6 min, > refetchInterval de 5 min) : on le
      // réutilise. La marge garantit qu'une re-lecture périodique de la session
      // déclenche le rafraîchissement AVANT l'expiration → pas de 401, pas de
      // déconnexion intempestive.
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires - 6 * 60_000) {
        return token;
      }

      // Token expiré (ou sur le point de l'être) : on tente un rafraîchissement.
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.accessToken = token.accessToken;
        session.error = token.error;
      }
      return session;
    },
  },
};
