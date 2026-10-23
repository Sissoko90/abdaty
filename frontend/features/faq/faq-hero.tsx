'use client';

import { useTranslations } from 'next-intl';
import { PageHero } from '@/components/page-hero';

export function FAQHero() {
  const t = useTranslations('faq.hero');
  return <PageHero title={t('title')} subtitle={t('subtitle')} />;
}
