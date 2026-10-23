'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, Book, Code } from 'lucide-react';

/** Jetons colorés du terminal (encre + ocre + primaire). */
const Str = ({ children }: { children: React.ReactNode }) => <span className="text-ochre">{children}</span>;
const Key = ({ children }: { children: React.ReactNode }) => <span className="text-primary-300">{children}</span>;
const Dim = ({ children }: { children: React.ReactNode }) => <span className="text-gray-500">{children}</span>;

export function SMSHeroSection() {
  const t = useTranslations('smsApi');
  const locale = useLocale();

  const features = ['reliable', 'mali', 'fast', 'secure'] as const;

  // Chiffres déjà annoncés par le service (cf. features.*).
  const stats = [
    { value: '99,9 %', label: t('stats.uptime') },
    { value: '< 3 s', label: t('stats.delivery') },
    { value: '24/7', label: t('stats.support') },
    { value: 'Mali', label: t('stats.coverage') },
  ];

  return (
    <>
      <section className="relative overflow-hidden pb-16 pt-32 lg:pb-20 lg:pt-40">
        <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-primary-400/15 blur-3xl dark:bg-primary-600/15" />

        <div className="site-container relative grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-6">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-white px-3.5 py-1.5 text-sm font-medium text-primary-700 shadow-sm dark:border-primary-500/30 dark:bg-white/5 dark:text-primary-300">
              <span className="h-2 w-2 rounded-full bg-ochre" />
              {t('hero.badge')}
            </div>

            <h1 className="mb-5 text-5xl font-extrabold leading-[1.05] text-ink dark:text-white md:text-6xl">{t('title')}</h1>
            <p className="mb-3 text-xl text-gray-700 dark:text-gray-200">{t('subtitle')}</p>
            <p className="mb-8 max-w-xl leading-relaxed text-gray-600 dark:text-gray-400">{t('description')}</p>

            <ul className="mb-9 grid gap-3 sm:grid-cols-2">
              {features.map((key) => (
                <li key={key} className="flex items-start gap-3 text-sm font-medium text-gray-800 dark:text-gray-200">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" />
                  {t(`features.${key}`)}
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href={`/${locale}/contact`}>
                <Button size="lg" className="group w-full sm:w-auto">
                  {t('hero.cta')}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href={`/${locale}/sms-api/docs`}>
                <Button size="lg" variant="outline" className="w-full gap-2 border-gray-300 bg-white/70 sm:w-auto dark:border-white/15 dark:bg-white/5">
                  <Book className="h-5 w-5" />
                  {t('hero.ctaDocs')}
                </Button>
              </Link>
              <Link href={`/${locale}/sms-api/swagger`}>
                <Button size="lg" variant="ghost" className="w-full gap-2 sm:w-auto">
                  <Code className="h-5 w-5" />
                  {t('hero.ctaSwagger')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Terminal : requête d'envoi + réponse de l'API */}
          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-2xl bg-ink shadow-2xl shadow-ink/20 ring-1 ring-white/10">
              <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-primary-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-ochre" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                </div>
                <span className="font-mono text-xs text-gray-400">POST /v1/sms/send</span>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-gray-200 sm:p-6" aria-label="curl">
                <code>
                  <Dim>$</Dim> curl -X POST <Str>https://api.abdaty-tech.com/v1/sms/send</Str> \{'\n'}
                  {'  '}-H <Str>&quot;Authorization: Bearer YOUR_API_KEY&quot;</Str> \{'\n'}
                  {'  '}-d <Str>&apos;{'{'}</Str>{'\n'}
                  {'    '}<Key>&quot;to&quot;</Key>: <Str>&quot;+223XXXXXXXX&quot;</Str>,{'\n'}
                  {'    '}<Key>&quot;message&quot;</Key>: <Str>&quot;Bonjour du Mali!&quot;</Str>,{'\n'}
                  {'    '}<Key>&quot;from&quot;</Key>: <Str>&quot;AbdatyTech&quot;</Str>{'\n'}
                  {'  '}<Str>{'}'}&apos;</Str>
                </code>
              </pre>
              <div className="border-t border-white/10 bg-white/[0.03] px-5 py-4 sm:px-6">
                <p className="mb-2 flex items-center gap-2 text-xs font-medium text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  {t('hero.terminalResponse')}
                </p>
                <pre className="overflow-x-auto font-mono text-[13px] leading-relaxed text-gray-300">
                  <code>
                    {'{ '}<Key>&quot;success&quot;</Key>: <span className="text-emerald-400">true</span>, <Key>&quot;status&quot;</Key>: <Str>&quot;sent&quot;</Str>{' }'}
                  </code>
                </pre>
              </div>
              <dl className="grid grid-cols-4 divide-x divide-white/10 border-t border-white/10">
                {stats.map((s) => (
                  <div key={s.label} className="flex flex-col-reverse px-3 py-4 text-center">
                    <dt className="text-[11px] text-gray-400">{s.label}</dt>
                    <dd className="font-display text-lg font-bold text-white">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>
      <div className="bogolan-band" />
    </>
  );
}
