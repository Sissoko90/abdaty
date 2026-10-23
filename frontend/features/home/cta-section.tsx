'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import { useContactDetails } from '@/hooks/use-contact-details';

export function CTASection() {
  const t = useTranslations('cta');
  const locale = useLocale();
  const contact = useContactDetails();

  const details = [
    { icon: Phone, label: t('phone'), value: contact.phone, href: contact.phoneHref },
    { icon: Mail, label: t('email'), value: contact.email, href: contact.emailHref },
    { icon: MapPin, label: t('address'), value: contact.address, href: null },
  ];

  return (
    <section className="py-20 lg:py-28">
      <div className="site-container">
        <div className="bogolan-texture relative grid gap-12 overflow-hidden rounded-3xl bg-ink p-8 text-white sm:p-12 lg:grid-cols-12 lg:p-16">
          <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-primary-600/40 blur-3xl" />

          <div className="relative lg:col-span-7">
            <h2 className="mb-5 text-4xl font-bold leading-tight md:text-5xl">{t('title')}</h2>
            <p className="mb-9 max-w-xl text-lg leading-relaxed text-gray-300">{t('description')}</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={`/${locale}/contact`}>
                <Button size="lg" className="group w-full sm:w-auto">
                  {t('button')}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <a href={contact.phoneHref}>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-white/25 bg-transparent text-white hover:bg-white/10 hover:text-white sm:w-auto"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  {t('call')}
                </Button>
              </a>
            </div>
          </div>

          <div className="relative lg:col-span-5 lg:border-l lg:border-white/10 lg:pl-12">
            <h3 className="mb-6 text-lg font-semibold text-ochre">{t('reach')}</h3>
            <ul className="space-y-5">
              {details.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <Icon className="h-5 w-5 text-ochre" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm text-gray-400">{label}</div>
                    {href ? (
                      <a href={href} className="break-words font-semibold text-white hover:text-ochre">
                        {value}
                      </a>
                    ) : (
                      <span className="font-semibold text-white">{value}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
