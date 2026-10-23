'use client';

import { useTranslations } from 'next-intl';
import { PageHero } from '@/components/page-hero';

export function ServicesHero() {
  const t = useTranslations('services');
  return <PageHero title={t('title')} subtitle={t('subtitle')} />;
}
