'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-primary-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="border-0 shadow-2xl">
            <CardContent className="p-8 md:p-12">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {cv('title', t('title'))}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  {cv('description', t('description'))}
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{t('benefit1')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{t('benefit2')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{t('benefit3')}</span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={cv('placeholder', t('placeholder'))}
                    className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={status === 'loading' || status === 'success'}
                  />
                  <Button
                    type="submit"
                    disabled={status === 'loading' || status === 'success' || !email}
                    className="px-6 py-3"
                  >
                    {status === 'loading' ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t('sending')}
                      </span>
                    ) : status === 'success' ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        {cv('successMessage', t('subscribed'))}
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        {cv('buttonText', t('subscribe'))}
                      </span>
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                  {cv('privacyNote', t('privacy'))}
                </p>
                {status === 'error' && errorMsg && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2 text-center">{errorMsg}</p>
                )}
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
