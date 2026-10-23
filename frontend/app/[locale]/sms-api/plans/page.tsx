'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/page-hero';
import { Check, ArrowRight, Zap, Shield, HeadphonesIcon } from 'lucide-react';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: '10,000',
    period: 'mois',
    description: 'Parfait pour les startups et petits projets',
    features: [
      '1,000 SMS par mois',
      'Support par email',
      'API REST complète',
      'Webhooks',
      'Rapports de base',
      'Test gratuit 7 jours'
    ],
    popular: false
  },
  {
    id: 'pro',
    name: 'Professional',
    price: '50,000',
    period: 'mois',
    description: 'Idéal pour les entreprises en croissance',
    features: [
      '10,000 SMS par mois',
      'Support prioritaire 24/7',
      'API REST + SDK',
      'Webhooks avancés',
      'Rapports détaillés',
      'Personnalisation',
      'SLA 99.9%',
      'Test gratuit 14 jours'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Sur mesure',
    period: '',
    description: 'Solutions personnalisées pour grandes entreprises',
    features: [
      'SMS illimités',
      'Support dédié',
      'API personnalisée',
      'Intégration sur mesure',
      'Rapports personnalisés',
      'Formation équipe',
      'SLA 99.99%',
      'Infrastructure dédiée'
    ],
    popular: false
  }
];

export default function PlansPage() {
  const t = useTranslations('smsApi.plans');
  const locale = useLocale();

  const handleSubscribe = () => {
    // TODO: Implement subscription logic
  };

  const perks = [
    { icon: Zap, key: 'fast' },
    { icon: Shield, key: 'secure' },
    { icon: HeadphonesIcon, key: 'support' },
  ] as const;

  return (
    <main>
      <PageHero title={t('title')} subtitle={t('description')} />

      <section className="py-20 lg:py-28">
        <div className="site-container">
          <div className="grid gap-5 md:grid-cols-3">
            {plans.map((plan) => {
              const featured = plan.popular;
              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-2xl p-8 ${
                    featured
                      ? 'bogolan-texture bg-ink text-white ring-1 ring-ink dark:ring-white/10'
                      : 'border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]'
                  }`}
                >
                  {featured && (
                    <span className="absolute right-6 top-6 rounded-full bg-ochre px-3 py-1 text-xs font-bold text-ink">{t('popular')}</span>
                  )}
                  <h2 className={`mb-2 text-2xl font-bold ${featured ? 'text-white' : 'text-ink dark:text-white'}`}>{plan.name}</h2>
                  <p className={`mb-6 text-sm ${featured ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'}`}>{plan.description}</p>
                  <div className="mb-8 flex items-baseline gap-1">
                    <span className={`font-display text-4xl font-extrabold ${featured ? 'text-white' : 'text-ink dark:text-white'}`}>{plan.price}</span>
                    {plan.period && <span className={featured ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'}>FCFA/{plan.period}</span>}
                  </div>
                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className={`flex items-start gap-3 text-sm ${featured ? 'text-gray-200' : 'text-gray-700 dark:text-gray-300'}`}>
                        <Check className={`mt-0.5 h-4 w-4 shrink-0 ${featured ? 'text-ochre' : 'text-primary-600 dark:text-primary-400'}`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={featured ? 'default' : 'outline'}
                    className={`group mt-auto w-full ${featured ? '' : 'dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10'}`}
                    onClick={() => handleSubscribe()}
                  >
                    {t('subscribe')}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="mt-16 grid gap-8 border-t border-gray-200 pt-12 dark:border-white/10 md:grid-cols-3">
            {perks.map(({ icon: Icon, key }) => (
              <div key={key} className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="mb-1 font-semibold text-ink dark:text-white">{t(`features.${key}.title`)}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t(`features.${key}.description`)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-col items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-8 dark:border-white/10 dark:bg-white/[0.03] sm:flex-row sm:items-center">
            <p className="text-lg font-semibold text-ink dark:text-white">{t('faq.title')}</p>
            <Link href={`/${locale}/contact`}>
              <Button variant="outline" className="dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10">
                {t('faq.contact')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
