'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] py-20 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-3xl font-bold text-center">{t('title')}</CardTitle>
            <CardDescription className="text-center">{t('description')}</CardDescription>
          </CardHeader>
          <CardContent>
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="space-y-6">
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
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? t('loading') : t('submit')}
                  {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">{t('success.title')}</h3>
                <p className="text-gray-600">{t('success.description')}</p>
                <p className="text-sm text-gray-500">{t('success.instructions')}</p>
              </div>
            )}
            <div className="mt-6 text-center">
              <Link href={`/${locale}/login`} className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('backToLogin')}
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
