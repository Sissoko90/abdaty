import { AuthGuard } from '@/components/auth-guard';

/**
 * Layout de l'espace dashboard : protège toutes les sous-pages.
 * Redirige vers /login si la session est absente ou le token expiré.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
