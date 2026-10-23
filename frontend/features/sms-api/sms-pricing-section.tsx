'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Smartphone, Briefcase, Building2 } from 'lucide-react';
import { PlanModal } from './plan-modal';

const pricingData = [
  { plan: 'Starter', icon: Smartphone, volume: '1,000', price: 20, currency: 'FCFA', popular: false },
  { plan: 'Business', icon: Briefcase, volume: '10,000', price: 18, currency: 'FCFA', popular: true },
  { plan: 'Enterprise', icon: Building2, volume: '100,000+', price: 15, currency: 'FCFA', popular: false },
];

const features = [
  'Livraison instantanée',
  'Rapports en temps réel',
  'Support technique 24/7',
  'API REST simple',
  'Webhooks pour notifications',
  'Aucun engagement',
];

export function SMSPricingSection() {
  const t = useTranslations('smsApi.pricing');
  const tPlans = useTranslations('smsApi.plans');
  const [selectedPlan, setSelectedPlan] = useState<typeof pricingData[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePlanClick = (plan: typeof pricingData[0]) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <section className="bg-white py-20 dark:bg-white/[0.02] lg:py-28">
      <div className="site-container">
        <div className="mb-12">
          <h2 className="mb-4 text-4xl font-bold text-ink dark:text-white md:text-5xl">{t('title')}</h2>
          <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-300">{t('subtitle')}</p>
        </div>

        <div className="mb-8 grid gap-5 md:grid-cols-3">
          {pricingData.map((item) => {
            const Icon = item.icon;
            const featured = item.popular;
            return (
              <div
                key={item.plan}
                className={`relative flex flex-col rounded-2xl p-8 ${
                  featured
                    ? 'bogolan-texture bg-ink text-white ring-1 ring-ink dark:ring-white/10'
                    : 'border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]'
                }`}
              >
                {featured && (
                  <span className="absolute right-6 top-6 rounded-full bg-ochre px-3 py-1 text-xs font-bold text-ink">
                    {tPlans('popular')}
                  </span>
                )}
                <div
                  className={`mb-6 flex h-12 w-12 items-center justify-center rounded-xl ${
                    featured ? 'bg-white/10 text-ochre' : 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className={`mb-1 text-xl font-bold ${featured ? 'text-white' : 'text-ink dark:text-white'}`}>{item.plan}</h3>
                <p className={`mb-6 text-sm ${featured ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                  {item.volume} {t('perMonth')}
                </p>
                <div className="mb-1 flex items-baseline gap-2">
                  <span className={`font-display text-5xl font-extrabold ${featured ? 'text-white' : 'text-ink dark:text-white'}`}>{item.price}</span>
                  <span className={`text-lg font-semibold ${featured ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>{item.currency}</span>
                </div>
                <p className={`mb-8 text-sm ${featured ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>{t('perSMS')}</p>
                <Button
                  onClick={() => handlePlanClick(item)}
                  variant={featured ? 'default' : 'outline'}
                  className={`group mt-auto w-full ${featured ? '' : 'dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10'}`}
                >
                  {t('details')}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Plan Modal */}
        <PlanModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} plan={selectedPlan} />

        <div className="rounded-2xl border border-gray-200 bg-paper p-8 dark:border-white/10 dark:bg-white/[0.03]">
          <h3 className="mb-6 text-xl font-bold text-ink dark:text-white">{t('included')}</h3>
          <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ochre/20">
                  <Check className="h-3.5 w-3.5 text-ink dark:text-ochre" />
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
