'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiFetch, ApiRequestError } from '@/lib/api';
import { useBranding } from '@/hooks/use-branding';

const INPUT =
  'h-12 w-full rounded-xl border border-gray-300 bg-white pl-11 pr-4 text-ink placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-white/15 dark:bg-white/5 dark:text-white';
const LABEL = 'mb-2 block text-sm font-medium text-ink dark:text-gray-200';

export default function RegisterPage() {
  const t = useTranslations('auth.register');
  const locale = useLocale();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError(t('passwordMismatch'));
      return;
    }

    // Le backend attend prénom + nom séparés ; on découpe le « nom complet ».
    const parts = name.trim().split(/\s+/);
    const firstName = parts[0] ?? '';
    const lastName = parts.slice(1).join(' ');
    if (!lastName) {
      setError(
        locale === 'fr'
          ? 'Veuillez saisir votre prénom et votre nom.'
          : 'Please enter both your first and last name.'
      );
      return;
    }

    setIsLoading(true);
    try {
      // POST /auth/register : crée le compte (statut INACTIVE) et envoie un code par email.
      await apiFetch('/auth/register', {
        method: 'POST',
        body: { email, password, firstName, lastName },
      });
      setSuccess(
        locale === 'fr'
          ? 'Compte créé. Vérifiez votre email pour activer votre compte, puis connectez-vous.'
          : 'Account created. Check your email to activate your account, then sign in.'
      );
      setTimeout(() => router.push(`/${locale}/login`), 2500);
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : locale === 'fr'
            ? "Une erreur est survenue lors de l'inscription."
            : 'An error occurred during registration.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const fields = [
    { id: 'name', type: 'text', icon: User, label: t('name'), placeholder: t('namePlaceholder'), value: name, set: setName, auto: 'name' },
    { id: 'email', type: 'email', icon: Mail, label: t('email'), placeholder: t('emailPlaceholder'), value: email, set: setEmail, auto: 'email' },
    { id: 'password', type: 'password', icon: Lock, label: t('password'), placeholder: t('passwordPlaceholder'), value: password, set: setPassword, auto: 'new-password' },
    { id: 'confirmPassword', type: 'password', icon: Lock, label: t('confirmPassword'), placeholder: t('confirmPasswordPlaceholder'), value: confirmPassword, set: setConfirmPassword, auto: 'new-password' },
  ];

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
        {success && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"
          >
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}
        {fields.map(({ id, type, icon: Icon, label, placeholder, value, set, auto }) => (
          <div key={id}>
            <label htmlFor={id} className={LABEL}>{label}</label>
            <div className="relative">
              <Icon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                id={id}
                type={type}
                autoComplete={auto}
                placeholder={placeholder}
                value={value}
                onChange={(e) => set(e.target.value)}
                className={INPUT}
                required
              />
            </div>
          </div>
        ))}
        <label className="flex cursor-pointer items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-primary-600" required />
          <span>
            {t('agreeTerms')}{' '}
            <Link href={`/${locale}/terms-of-service`} className="font-medium text-primary-600 hover:underline dark:text-primary-400">
              {t('termsLink')}
            </Link>
          </span>
        </label>
        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? t('loading') : t('submit')}
          {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </form>
      <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
        {t('haveAccount')}{' '}
        <Link href={`/${locale}/login`} className="font-semibold text-primary-600 hover:underline dark:text-primary-400">
          {t('login')}
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
