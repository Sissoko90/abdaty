'use client';

import { useTranslations } from 'next-intl';
import { PageHero } from '@/components/page-hero';

export function ContactHero() {
  const t = useTranslations('contact');
  return <PageHero title={t('title')} subtitle={t('subtitle')} />;
}
