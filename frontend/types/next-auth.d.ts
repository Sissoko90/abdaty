import 'next-auth';

/**
 * Extensions des types NextAuth pour transporter les informations issues du
 * backend Abdaty : les tokens JWT (access + refresh) et le rôle applicatif.
 *
 * Ces données sont stockées dans le token NextAuth (callback `jwt`) puis
 * exposées à la session (callback `session`) afin que les composants et les
 * appels API puissent récupérer l'access token et le rôle de l'utilisateur.
 */
declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    accessToken: string;
    refreshToken: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
    /** Access token JWT à transmettre au backend (en-tête Authorization). */
    accessToken: string;
    /** Indique qu'une erreur de rafraîchissement est survenue (reconnexion requise). */
    error?: 'RefreshAccessTokenError';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    accessToken: string;
    refreshToken: string;
    /** Date d'expiration de l'access token (epoch ms). */
    accessTokenExpires: number;
    error?: 'RefreshAccessTokenError';
  }
}
