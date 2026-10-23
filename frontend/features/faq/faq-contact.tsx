'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, Phone, MessageCircle, ArrowRight } from 'lucide-react';
import { useContactDetails } from '@/hooks/use-contact-details';

export function FAQContact() {
  const t = useTranslations('faq.contact');
  const locale = useLocale();
  const contact = useContactDetails();

  const contactMethods = [
    { icon: Mail, titleKey: 'email', value: contact.email, link: contact.emailHref },
    { icon: Phone, titleKey: 'phone', value: contact.phone, link: contact.phoneHref },
    // Le chat ouvre la page contact (le widget de discussion reste accessible en bas de page).
    { icon: MessageCircle, titleKey: 'chat', value: t('chatDescription'), link: `/${locale}/contact` },
  ];

  return (
    <section className="pb-20 lg:pb-28">
      <div className="site-container">
        <div className="bogolan-texture grid gap-10 rounded-3xl bg-ink p-8 text-white dark:ring-1 dark:ring-white/10 sm:p-12 lg:grid-cols-12 lg:p-14">
          <div className="lg:col-span-5">
            <h2 className="mb-4 text-4xl font-bold">{t('title')}</h2>
            <p className="mb-8 text-lg leading-relaxed text-gray-300">{t('subtitle')}</p>
            <Link href={`/${locale}/contact`}>
              <Button size="lg" className="group">
                {t('fullContactForm')}
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>

          <ul className="grid gap-3 lg:col-span-7">
            {contactMethods.map((method) => (
              <li key={method.titleKey}>
                <a
                  href={method.link}
                  className="group flex items-center gap-4 rounded-2xl bg-white/5 p-5 ring-1 ring-white/10 transition-colors hover:bg-white/10"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-ochre text-ink">
                    <method.icon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{t(method.titleKey)}</p>
                    <p className="break-words text-sm text-gray-300">{method.value}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-ochre" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
