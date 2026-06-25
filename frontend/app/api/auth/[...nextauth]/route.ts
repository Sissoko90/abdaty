import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Route handler NextAuth (App Router).
 * Un fichier `route.ts` ne doit exporter que des handlers HTTP : la
 * configuration NextAuth est définie dans `@/lib/auth` (réutilisable par
 * getServerSession).
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
