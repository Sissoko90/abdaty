'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const t = useTranslations('auth.login');
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Authentification via le provider Credentials de NextAuth (→ backend /auth/login).
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);

    if (result?.error) {
      // NextAuth renvoie le message levé par `authorize` (message du backend :
      // compte désactivé, non vérifié, identifiants invalides…). On l'affiche tel
      // quel ; on ne retombe sur un message générique que pour les erreurs internes.
      const generic =
        locale === 'fr'
          ? 'Email ou mot de passe incorrect.'
          : 'Invalid email or password.';
      const backendMsg = result.error.trim();
      setError(
        !backendMsg || backendMsg === 'CredentialsSignin' ? generic : backendMsg
      );
      return;
    }

    // Connexion réussie : on lit la session pour router selon le rôle.
    const session = await getSession();
    const role = session?.user?.role;
    const defaultTarget =
      role === 'ADMIN' ? `/${locale}/admin` : `/${locale}/dashboard`;
    const callbackUrl = searchParams.get('callbackUrl') ?? defaultTarget;
    // Cast nécessaire car `experimental.typedRoutes` interdit les chaînes dynamiques.
    router.push(callbackUrl as Parameters<typeof router.push>[0]);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] py-20 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center">{t('title')}</CardTitle>
            <CardDescription className="text-center">{t('description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div
                  role="alert"
                  className="flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">{t('email')}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t('emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">{t('password')}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder={t('passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="rounded" />
                  <span>{t('rememberMe')}</span>
                </label>
                <Link href={`/${locale}/forgot-password`} className="text-primary-600 hover:underline">
                  {t('forgotPassword')}
                </Link>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t('loading') : t('submit')}
                {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              <span className="text-gray-600">{t('noAccount')} </span>
              <Link href={`/${locale}/register`} className="text-primary-600 hover:underline font-medium">
                {t('register')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
