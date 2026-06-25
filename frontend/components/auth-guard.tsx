'use client';

import { useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';

/**
 * Garde d'authentification pour les espaces protégés (dashboard, admin).
 *
 * Redirige vers la page de connexion si :
 *  - aucune session (non authentifié) ;
 *  - le rafraîchissement du token a échoué (session.error = RefreshAccessTokenError),
 *    c'est-à-dire que l'access token est expiré et non renouvelable.
 *
 * Si `requiredRole` est fourni (ex. "ADMIN"), un utilisateur authentifié mais
 * d'un rôle différent est renvoyé vers son espace (/dashboard) : il ne doit pas
 * voir l'UI admin. (Contrôle doublé côté serveur dans middleware.ts.)
 *
 * La page demandée est passée en `callbackUrl` pour y revenir après reconnexion.
 */
export function AuthGuard({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: string;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  const role = (session?.user?.role || '').toString().toUpperCase();
  const unauthenticated =
    status === 'unauthenticated' || session?.error === 'RefreshAccessTokenError';
  const roleMismatch =
    !!requiredRole && status === 'authenticated' && role !== requiredRole.toUpperCase();
  const invalid = unauthenticated || roleMismatch;

  useEffect(() => {
    if (status === 'loading') return;
    if (unauthenticated) {
      const callbackUrl = encodeURIComponent(pathname || `/${locale}/dashboard`);
      const loginUrl = `/${locale}/login?callbackUrl=${callbackUrl}`;
      // Déconnexion propre (purge du cookie de session) puis redirection.
      signOut({ redirect: false }).finally(() => {
        router.replace(loginUrl as Parameters<typeof router.replace>[0]);
      });
    } else if (roleMismatch) {
      // Authentifié mais rôle insuffisant : retour à l'espace utilisateur.
      router.replace(`/${locale}/dashboard` as Parameters<typeof router.replace>[0]);
    }
  }, [status, unauthenticated, roleMismatch, pathname, locale, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500 dark:text-gray-400">
        Chargement…
      </div>
    );
  }

  // En cours de redirection : on n'affiche pas le contenu protégé.
  if (invalid) {
    return null;
  }

  return <>{children}</>;
}
