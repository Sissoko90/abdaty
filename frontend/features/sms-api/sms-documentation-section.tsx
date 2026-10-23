'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Book } from 'lucide-react';

export function SMSDocumentationSection() {
  const t = useTranslations('smsApi');
  const locale = useLocale();

  const codeExample = `curl -X POST https://api.abdaty-tech.com/v1/sms/send \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+223XXXXXXXX",
    "message": "Hello from Abdaty Technologie!",
    "from": "AbdatyTech"
  }'`;

  return (
    <section className="py-20 lg:py-28">
      <div className="site-container">
        <div className="grid items-center gap-10 rounded-3xl border border-gray-200 bg-white p-8 dark:border-white/10 dark:bg-white/[0.03] sm:p-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
              <Book className="h-6 w-6" />
            </div>
            <h2 className="mb-4 text-3xl font-bold text-ink dark:text-white md:text-4xl">{t('documentation.title')}</h2>
            <p className="mb-8 text-lg text-gray-600 dark:text-gray-300">{t('documentation.subtitle')}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={`/${locale}/sms-api/docs`}>
                <Button size="lg" className="group w-full sm:w-auto">
                  {t('documentation.viewDocs')}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href={`/${locale}/sms-api/swagger`}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10">
                  {t('documentation.tryNow')}
                </Button>
              </Link>
            </div>
          </div>
          <div className="min-w-0 lg:col-span-7">
            <pre className="overflow-x-auto rounded-2xl bg-ink p-6 font-mono text-[13px] leading-relaxed text-gray-200 ring-1 ring-white/10">
              <code>{codeExample}</code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
