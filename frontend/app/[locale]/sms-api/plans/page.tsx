'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              {t('title')}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t('description')}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular
                    ? 'border-2 border-primary-500 shadow-2xl scale-105'
                    : 'border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      {t('popular')}
                    </span>
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && (
                      <span className="text-gray-600">/{plan.period}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-primary-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? 'bg-primary-600 hover:bg-primary-700'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                    onClick={() => handleSubscribe()}
                  >
                    {t('subscribe')}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('features.fast.title')}</h3>
                <p className="text-gray-600">{t('features.fast.description')}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('features.secure.title')}</h3>
                <p className="text-gray-600">{t('features.secure.description')}</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <HeadphonesIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('features.support.title')}</h3>
                <p className="text-gray-600">{t('features.support.description')}</p>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-4">{t('faq.title')}</p>
            <Link href={`/${locale}/contact`}>
              <Button variant="outline">
                {t('faq.contact')}
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
