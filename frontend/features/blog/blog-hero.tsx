'use client';

import { useTranslations } from 'next-intl';
import { PageHero } from '@/components/page-hero';

export function BlogHero() {
  const t = useTranslations('blog.hero');
  return <PageHero title={t('title')} subtitle={t('subtitle')} />;
}
