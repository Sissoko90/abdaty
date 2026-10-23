'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { submitContact } from '@/services/contact.service';

const labelCls = 'mb-2 block text-sm font-medium text-ink dark:text-gray-200';
const fieldCls =
  'w-full rounded-xl border border-gray-300 bg-white px-4 text-ink placeholder-gray-400 transition-shadow focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60 dark:border-white/15 dark:bg-white/5 dark:text-white dark:placeholder-gray-500';

export function ContactForm() {
  const t = useTranslations('contact.form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus('idle');

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      company: String(formData.get('company') || ''),
      phone: String(formData.get('phone') || ''),
      service: String(formData.get('service') || ''),
      message: String(formData.get('message') || ''),
    };

    try {
      // Envoi réel vers le backend : enregistre le message + déclenche les emails.
      await submitContact(data);
      setStatus('success');
      form.reset();
    } catch {
      setStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // id : cible des boutons « Démarrer un projet » (scroll-mt compense la navbar fixe).
    <div id="contact-form" className="scroll-mt-28 rounded-3xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03] sm:p-10">
      <h2 className="mb-8 text-3xl font-bold text-ink dark:text-white">{t('title') || 'Send us a message'}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="name" className={labelCls}>
              {t('name')} <span className="text-primary-600">*</span>
            </label>
            <input id="name" name="name" type="text" required autoComplete="name" placeholder={t('namePlaceholder')} className={`h-12 ${fieldCls}`} />
          </div>
          <div>
            <label htmlFor="email" className={labelCls}>
              {t('email')} <span className="text-primary-600">*</span>
            </label>
            <input id="email" name="email" type="email" required autoComplete="email" placeholder={t('emailPlaceholder')} className={`h-12 ${fieldCls}`} />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label htmlFor="company" className={labelCls}>
              {t('company')}
            </label>
            <input id="company" name="company" type="text" autoComplete="organization" placeholder={t('companyPlaceholder')} className={`h-12 ${fieldCls}`} />
          </div>
          <div>
            <label htmlFor="phone" className={labelCls}>
              {t('phone')}
            </label>
            <input id="phone" name="phone" type="tel" autoComplete="tel" placeholder={t('phonePlaceholder')} className={`h-12 ${fieldCls}`} />
          </div>
        </div>

        <div>
          <label htmlFor="service" className={labelCls}>
            {t('service')}
          </label>
          <input id="service" name="service" type="text" placeholder={t('servicePlaceholder')} className={`h-12 ${fieldCls}`} />
        </div>

        <div>
          <label htmlFor="message" className={labelCls}>
            {t('message')} <span className="text-primary-600">*</span>
          </label>
          <textarea id="message" name="message" required rows={6} placeholder={t('messagePlaceholder')} className={`resize-y py-3 ${fieldCls}`} />
        </div>

        {status === 'success' && (
          <div role="status" className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            {t('success')}
          </div>
        )}

        {status === 'error' && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            {t('error')}
          </div>
        )}

        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
          {isSubmitting ? t('sending') : t('submit')}
          <Send className="ml-2 h-5 w-5" />
        </Button>
      </form>
    </div>
  );
}
