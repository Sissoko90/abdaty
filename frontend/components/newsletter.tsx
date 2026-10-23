'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Send, CheckCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePublicSection } from '@/hooks/use-public-content';
import { subscribeNewsletter } from '@/services/newsletter.service';

export function Newsletter() {
  const t = useTranslations('newsletter');
  const locale = useLocale();
  const { cv } = usePublicSection('newsletter');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setErrorMsg('');
    try {
      // Inscription réelle via le backend (idempotent : réactive si déjà connu).
      await subscribeNewsletter(email, { locale, source: 'newsletter-section' });
      setStatus('success');
      setEmail('');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue.');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <section className="pb-20 lg:pb-28">
      <div className="site-container">
        <div className="grid items-center gap-10 rounded-3xl bg-white p-8 ring-1 ring-gray-200 dark:bg-white/[0.03] dark:ring-white/10 sm:p-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="mb-3 text-3xl font-bold text-ink dark:text-white md:text-4xl">{cv('title', t('title'))}</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">{cv('description', t('description'))}</p>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {[t('benefit1'), t('benefit2'), t('benefit3')].map((b) => (
                <li key={b} className="flex items-center gap-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-ochre/20">
                    <Check className="h-3 w-3 text-ink dark:text-ochre" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="newsletter-email" className="sr-only">
              {cv('placeholder', t('placeholder'))}
            </label>
            <div className="flex flex-col gap-3 rounded-2xl bg-paper p-2 ring-1 ring-gray-200 focus-within:ring-2 focus-within:ring-primary-500 dark:bg-white/5 dark:ring-white/10 sm:flex-row">
              <input
                id="newsletter-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={cv('placeholder', t('placeholder'))}
                className="h-12 flex-1 bg-transparent px-4 text-ink placeholder-gray-500 focus:outline-none dark:text-white dark:placeholder-gray-400"
                disabled={status === 'loading' || status === 'success'}
              />
              <Button type="submit" size="lg" disabled={status === 'loading' || status === 'success' || !email}>
                {status === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t('sending')}
                  </span>
                ) : status === 'success' ? (
                  <span className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {cv('successMessage', t('subscribed'))}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    {cv('buttonText', t('subscribe'))}
                  </span>
                )}
              </Button>
            </div>
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">{cv('privacyNote', t('privacy'))}</p>
            {status === 'error' && errorMsg && (
              <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
                {errorMsg}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
