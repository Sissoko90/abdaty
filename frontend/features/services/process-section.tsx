'use client';

import { useTranslations } from 'next-intl';
import { ProcessSteps } from './process-steps';
import { Lightbulb, Code2, Rocket, HeadphonesIcon } from 'lucide-react';

const steps = [
  { icon: Lightbulb, key: 'discovery' },
  { icon: Code2, key: 'development' },
  { icon: Rocket, key: 'launch' },
  { icon: HeadphonesIcon, key: 'support' },
];

export function ProcessSection() {
  const t = useTranslations('services.process');

  return (
    <section className="bg-white py-20 dark:bg-white/[0.02] lg:py-28">
      <div className="site-container">
        <div className="mb-12">
          <h2 className="mb-4 text-4xl font-bold text-ink dark:text-white md:text-5xl">{t('title')}</h2>
          <p className="max-w-2xl text-lg text-gray-600 dark:text-gray-300">{t('subtitle')}</p>
        </div>
        <ProcessSteps
          steps={steps.map((s) => ({ icon: s.icon, title: t(`${s.key}.title`), description: t(`${s.key}.description`) }))}
        />
      </div>
    </section>
  );
}
