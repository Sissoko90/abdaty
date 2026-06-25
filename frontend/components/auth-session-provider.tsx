'use client';

import { useEffect } from 'react';
import { SessionProvider, useSession, signOut } from 'next-auth/react';

/**
 * Surveille l'état de la session : si le rafraîchissement de l'access token a
 * échoué (refresh token expiré/révoqué), NextAuth garde une session « valide »
 * dont le token est pourtant mort. On la purge alors silencieusement (sans
 * redirection forcée, pour éviter toute boucle) : le cookie de session est
 * effacé, la navbar repasse en « Se connecter » et les pages protégées
 * renvoient proprement vers /login lorsqu'on y accède.
 */
function SessionErrorWatcher() {
  const { data: session } = useSession();
  useEffect(() => {
    if (session?.error === 'RefreshAccessTokenError') {
      signOut({ redirect: false });
    }
  }, [session?.error]);
  return null;
}

/**
 * Fournit le contexte de session NextAuth à l'arbre React côté client.
 *
 * Indispensable pour que les hooks `useSession()` / `signIn()` / `signOut()`
 * fonctionnent dans les composants clients (pages d'auth, dashboard, admin).
 */
export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  // refetchInterval : la session est re-lue périodiquement, ce qui déclenche le
  // callback `jwt` côté serveur et rafraîchit l'access token AVANT son expiration
  // (refresh proactif). refetchOnWindowFocus : idem au retour sur l'onglet.
  // Résultat : l'utilisateur n'est plus déconnecté à l'expiration du token.
  return (
    <SessionProvider refetchInterval={5 * 60} refetchOnWindowFocus>
      <SessionErrorWatcher />
      {children}
    </SessionProvider>
  );
}
