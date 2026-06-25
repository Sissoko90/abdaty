import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { getToken } from 'next-auth/jwt';

const locales = ['fr', 'en'];
const defaultLocale = 'fr';

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = locales.includes(pathname.split('/')[1]) ? pathname.split('/')[1] : defaultLocale;

  // Routes protégées nécessitant une authentification
  const protectedPaths = ['/sms-api/swagger'];
  const isProtectedPath = protectedPaths.some((path) => pathname.includes(path));

  // Routes admin : authentification + rôle ADMIN obligatoires (défense côté
  // serveur, en plus de l'AuthGuard client — un USER ne doit pas charger l'UI admin).
  const isAdminPath = /^\/(fr|en)\/admin(\/|$)/.test(pathname);

  if (isProtectedPath || isAdminPath) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token) {
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Contrôle du rôle pour l'espace admin.
    if (isAdminPath) {
      const role = String((token as { role?: string }).role || '').toUpperCase();
      if (role !== 'ADMIN') {
        // Authentifié mais non-admin : on renvoie vers l'espace utilisateur.
        return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
      }
    }
  }

  // Appliquer le middleware i18n pour toutes les routes
  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
