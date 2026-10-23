'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useBranding } from '@/hooks/use-branding';

const INPUT =
  'h-12 w-full rounded-xl border border-gray-300 bg-white pl-11 pr-4 text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-white/15 dark:bg-white/5 dark:text-white';
const LABEL = 'mb-2 block text-sm font-medium text-ink dark:text-gray-200';

export default function ForgotPasswordPage() {
  const t = useTranslations('auth.forgotPassword');
  const locale = useLocale();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // POST /auth/forgot-password : le backend envoie un code de réinitialisation par email.
      // La réponse est toujours « succès » (anti-énumération d'emails) côté backend.
      await apiFetch('/auth/forgot-password', { method: 'POST', body: { email } });
    } catch {
      /* on affiche le succès dans tous les cas pour ne pas révéler l'existence du compte */
    } finally {
      setIsLoading(false);
      setIsSuccess(true);
    }
  };

  return (
    <AuthShell title={t('title')} description={t('description')}>
      {!isSuccess ? (
        <form onSubmit={handleSubmit} className="space-y-5">
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
          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? t('loading') : t('submit')}
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      ) : (
        <div role="status" className="rounded-2xl border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950/30">
          <CheckCircle2 className="mb-4 h-10 w-10 text-green-600 dark:text-green-400" />
          <h2 className="mb-2 text-xl font-bold text-ink dark:text-white">{t('success.title')}</h2>
          <p className="mb-2 text-gray-700 dark:text-gray-300">{t('success.description')}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('success.instructions')}</p>
        </div>
      )}
      <Link
        href={`/${locale}/login`}
        className="mt-8 inline-flex items-center text-sm font-medium text-gray-600 transition-colors hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t('backToLogin')}
      </Link>
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
