'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { useBranding } from '@/hooks/use-branding';

const INPUT =
  'h-12 w-full rounded-xl border border-gray-300 bg-white pl-11 pr-4 text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-white/15 dark:bg-white/5 dark:text-white';
const LABEL = 'mb-2 block text-sm font-medium text-ink dark:text-gray-200';

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
    // Destination demandée : même origine uniquement (URL résolue, ce qui couvre aussi
    // « //hôte » et « /\hôte »), et jamais une page de connexion (ex. /fr/admin/login → 404).
    let callbackUrl = defaultTarget;
    const requested = searchParams.get('callbackUrl');
    if (requested) {
      try {
        const target = new URL(requested, window.location.origin);
        if (target.origin === window.location.origin && !/\/login\/?$/.test(target.pathname)) {
          callbackUrl = target.pathname + target.search + target.hash;
        }
      } catch {
        /* URL invalide : destination par défaut */
      }
    }
    // Cast nécessaire car `experimental.typedRoutes` interdit les chaînes dynamiques.
    router.push(callbackUrl as Parameters<typeof router.push>[0]);
    router.refresh();
  };

  return (
    <AuthShell title={t('title')} description={t('description')}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div>
          <label htmlFor="email" className={LABEL}>{t('email')}</label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={INPUT}
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="password" className={LABEL}>{t('password')}</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder={t('passwordPlaceholder')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={INPUT}
              required
            />
          </div>
        </div>
        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-gray-700 dark:text-gray-300">
            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 accent-primary-600" />
            <span>{t('rememberMe')}</span>
          </label>
          <Link href={`/${locale}/forgot-password`} className="font-medium text-primary-600 hover:underline dark:text-primary-400">
            {t('forgotPassword')}
          </Link>
        </div>
        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? t('loading') : t('submit')}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        {t('noAccount')}{' '}
        <Link href={`/${locale}/register`} className="font-semibold text-primary-600 hover:underline dark:text-primary-400">
          {t('register')}
        </Link>
      </p>
    </AuthShell>
  );
}

/** Mise en page des écrans d'authentification : formulaire + panneau de marque (desktop). */
function AuthShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  const tHero = useTranslations('hero');
  const tFooter = useTranslations('footer');
  const { logo } = useBranding();

  return (
    <main className="pb-16 pt-28 lg:pb-24 lg:pt-32">
      <div className="site-container">
        <div className="grid overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl shadow-ink/5 dark:border-white/10 dark:bg-white/[0.03] lg:grid-cols-2">
          <div className="flex items-center justify-center p-8 sm:p-12 lg:p-16">
            <div className="w-full max-w-md">
              <h1 className="mb-2 text-4xl font-bold text-ink dark:text-white">{title}</h1>
              <p className="mb-8 text-gray-600 dark:text-gray-400">{description}</p>
              {children}
            </div>
          </div>
          <div className="bogolan-texture relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-white lg:flex">
            {/* eslint-disable-next-line @next/next/no-img-element -- logo dynamique (CMS), ratio inconnu, non LCP */}
            <img src={logo} alt="Abdaty Tech" className="relative h-12 w-12 rounded-xl bg-white p-1.5" />
            <div className="relative">
              <p className="mb-4 font-display text-4xl font-bold leading-tight">{tHero('subtitle')}</p>
              <p className="max-w-sm text-lg text-gray-300">{tFooter('description')}</p>
            </div>
            <div className="bogolan-band relative -mx-12 -mb-12" />
          </div>
        </div>
      </div>
    </main>
  );
}
