'use client';

import { useTranslations } from 'next-intl';
import { PageHero } from '@/components/page-hero';
import { usePublicSection } from '@/hooks/use-public-content';

export function AboutHero() {
  const t = useTranslations('about');
  // Contenu géré dans l'admin (section "about"), avec repli i18n.
  const { cv } = usePublicSection('about');

  return (
    <PageHero
      title={cv('title', t('title'))}
      subtitle={cv('subtitle', t('subtitle'))}
      description={cv('description', t('description'))}
    />
  );
}
