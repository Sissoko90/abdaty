'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminPage, AdminPageHeader } from '@/components/admin/admin-page';
import { AdminSectionCard, AdminStatus, BilingualField, LangChip } from '@/components/admin/content-list-editor';
import { Save, Shield, Clock, CheckCircle } from 'lucide-react';
import { useSiteContentSection } from '@/hooks/use-site-content-section';

type Bi = { fr: string; en: string };

interface SLAContent {
  title: Bi;
  subtitle: Bi;
  description: Bi;
  guarantees: Array<{ id: string; title: Bi; description: Bi; percentage: string }>;
  responseTime: { critical: Bi; high: Bi; medium: Bi; low: Bi };
}

/** Valeurs par défaut (repli si la section n'a pas encore de contenu en base). */
const DEFAULTS: SLAContent = {
  title: { fr: 'SLA et Garanties', en: 'SLA and Guarantees' },
  subtitle: { fr: 'Nos engagements de qualité et de disponibilité', en: 'Our quality and availability commitments' },
  description: {
    fr: 'Nous nous engageons à fournir des services de haute qualité avec des garanties claires',
    en: 'We are committed to providing high-quality services with clear guarantees',
  },
  guarantees: [
    { id: '1', title: { fr: 'Disponibilité 99.9%', en: '99.9% Uptime' }, description: { fr: 'Garantie de disponibilité de nos services', en: 'Service availability guarantee' }, percentage: '99.9' },
    { id: '2', title: { fr: 'Support 24/7', en: '24/7 Support' }, description: { fr: 'Support technique disponible en permanence', en: 'Technical support available at all times' }, percentage: '100' },
  ],
  responseTime: {
    critical: { fr: '1 heure', en: '1 hour' },
    high: { fr: '4 heures', en: '4 hours' },
    medium: { fr: '24 heures', en: '24 hours' },
    low: { fr: '48 heures', en: '48 hours' },
  },
};

export default function AdminSLAPage() {
  const t = useTranslations('admin.content.sla');

  const { token, blocks, loading, saving, error, success, saveAll, value } =
    useSiteContentSection('sla');

  const [slaContent, setSlaContent] = useState<SLAContent>(DEFAULTS);

  useEffect(() => {
    const pair = (key: string, def: Bi) => ({ fr: value(key, 'fr', def.fr), en: value(key, 'en', def.en) });
    const json = <T,>(key: string, def: T): T => {
      const raw = blocks[key]?.valueFr;
      if (!raw) return def;
      try {
        return JSON.parse(raw) as T;
      } catch {
        return def;
      }
    };
    setSlaContent({
      title: pair('title', DEFAULTS.title),
      subtitle: pair('subtitle', DEFAULTS.subtitle),
      description: pair('description', DEFAULTS.description),
      guarantees: json('guarantees', DEFAULTS.guarantees),
      responseTime: json('responseTime', DEFAULTS.responseTime),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  const handleSave = () => {
    const c = slaContent;
    const text = (v: Bi, order: number) => ({ valueFr: v.fr, valueEn: v.en, contentType: 'text', displayOrder: order });
    saveAll({
      title: text(c.title, 1),
      subtitle: text(c.subtitle, 2),
      description: text(c.description, 3),
      responseTime: { valueFr: JSON.stringify(c.responseTime), contentType: 'json', displayOrder: 4 },
      guarantees: { valueFr: JSON.stringify(c.guarantees), contentType: 'json', displayOrder: 5 },
    });
  };

  const setRT = (level: keyof SLAContent['responseTime'], lang: 'fr' | 'en', v: string) =>
    setSlaContent({
      ...slaContent,
      responseTime: {
        ...slaContent.responseTime,
        [level]: { ...slaContent.responseTime[level], [lang]: v },
      },
    });

  const setBi = (field: 'title' | 'subtitle' | 'description') => (lang: 'fr' | 'en', v: string) =>
    setSlaContent({ ...slaContent, [field]: { ...slaContent[field], [lang]: v } });

  return (
    <AdminPage>
      <AdminPageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={Shield}
        actions={
          <Button onClick={handleSave} className="gap-2" disabled={saving || !token}>
            <Save className="h-4 w-4" />
            {saving ? '…' : t('save')}
          </Button>
        }
      />

      <AdminStatus error={error} success={success} loading={loading} signedOut={!token} />

      {/* Section principale */}
      <AdminSectionCard title={t('mainSection')} icon={Shield}>
        <BilingualField label={t('titleLabel')} value={slaContent.title} onChange={setBi('title')} />
        <BilingualField label={t('subtitleLabel')} value={slaContent.subtitle} onChange={setBi('subtitle')} />
        <BilingualField label={t('description')} value={slaContent.description} onChange={setBi('description')} multiline />
      </AdminSectionCard>

      {/* Temps de réponse */}
      <AdminSectionCard title={t('responseTime')} icon={Clock}>
        <BilingualField label={t('critical')} value={slaContent.responseTime.critical} onChange={(lang, v) => setRT('critical', lang, v)} />
        <BilingualField label={t('high')} value={slaContent.responseTime.high} onChange={(lang, v) => setRT('high', lang, v)} />
      </AdminSectionCard>

      {/* Garanties (affichage ; édition fine à venir) */}
      <AdminSectionCard title={t('guarantees')} icon={CheckCircle}>
        <ul className="space-y-3">
          {slaContent.guarantees.map((guarantee) => (
            <li key={guarantee.id} className="rounded-xl border border-gray-200 p-4 dark:border-white/10">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">{t('guaranteeTitle')} <LangChip lang="fr" /></Label>
                  <Input defaultValue={guarantee.title.fr} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">{t('guaranteeTitle')} <LangChip lang="en" /></Label>
                  <Input defaultValue={guarantee.title.en} />
                </div>
                <div className="space-y-2">
                  <Label>{t('percentage')}</Label>
                  <Input defaultValue={guarantee.percentage} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </AdminSectionCard>
    </AdminPage>
  );
}
