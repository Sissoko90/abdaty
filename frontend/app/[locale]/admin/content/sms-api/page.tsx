'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminPage, AdminPageHeader } from '@/components/admin/admin-page';
import { AdminSectionCard, AdminStatus, BilingualField, LangChip } from '@/components/admin/content-list-editor';
import { Save, MessageSquare, Key, Send } from 'lucide-react';
import { useSiteContentSection } from '@/hooks/use-site-content-section';

type Bi = { fr: string; en: string };

interface SMSAPIContent {
  title: Bi;
  subtitle: Bi;
  description: Bi;
  features: Array<{ id: string; title: Bi; description: Bi }>;
  pricing: { perSMS: string; currency: string };
}

/** Valeurs par défaut (repli si la section n'a pas encore de contenu en base). */
const DEFAULTS: SMSAPIContent = {
  title: { fr: 'API SMS Professionnelle', en: 'Professional SMS API' },
  subtitle: { fr: "Intégrez facilement l'envoi de SMS dans vos applications", en: 'Easily integrate SMS sending into your applications' },
  description: {
    fr: "Notre API SMS vous permet d'envoyer des messages à vos clients de manière simple et fiable",
    en: 'Our SMS API allows you to send messages to your customers simply and reliably',
  },
  features: [
    { id: '1', title: { fr: 'Envoi en masse', en: 'Bulk sending' }, description: { fr: 'Envoyez des milliers de SMS simultanément', en: 'Send thousands of SMS simultaneously' } },
    { id: '2', title: { fr: 'API RESTful', en: 'RESTful API' }, description: { fr: 'Interface simple et documentée', en: 'Simple and documented interface' } },
  ],
  pricing: { perSMS: '25', currency: 'FCFA' },
};

export default function AdminSMSAPIPage() {
  const t = useTranslations('admin.content.smsApi');

  const { token, blocks, loading, saving, error, success, saveAll, value } =
    useSiteContentSection('sms-api');

  const [smsApiContent, setSmsApiContent] = useState<SMSAPIContent>(DEFAULTS);

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
    setSmsApiContent({
      title: pair('title', DEFAULTS.title),
      subtitle: pair('subtitle', DEFAULTS.subtitle),
      description: pair('description', DEFAULTS.description),
      features: json('features', DEFAULTS.features),
      pricing: json('pricing', DEFAULTS.pricing),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  const handleSave = () => {
    const c = smsApiContent;
    const text = (v: Bi, order: number) => ({ valueFr: v.fr, valueEn: v.en, contentType: 'text', displayOrder: order });
    saveAll({
      title: text(c.title, 1),
      subtitle: text(c.subtitle, 2),
      description: text(c.description, 3),
      pricing: { valueFr: JSON.stringify(c.pricing), contentType: 'json', displayOrder: 4 },
      features: { valueFr: JSON.stringify(c.features), contentType: 'json', displayOrder: 5 },
    });
  };

  const setBi = (field: 'title' | 'subtitle' | 'description') => (lang: 'fr' | 'en', v: string) =>
    setSmsApiContent({ ...smsApiContent, [field]: { ...smsApiContent[field], [lang]: v } });

  return (
    <AdminPage>
      <AdminPageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={MessageSquare}
        actions={
          <Button onClick={handleSave} className="gap-2" disabled={saving || !token}>
            <Save className="h-4 w-4" />
            {saving ? '…' : t('save')}
          </Button>
        }
      />

      <AdminStatus error={error} success={success} loading={loading} signedOut={!token} />

      {/* Section principale */}
      <AdminSectionCard title={t('mainSection')} icon={MessageSquare}>
        <BilingualField label={t('titleLabel')} value={smsApiContent.title} onChange={setBi('title')} />
        <BilingualField label={t('subtitleLabel')} value={smsApiContent.subtitle} onChange={setBi('subtitle')} />
        <BilingualField label={t('description')} value={smsApiContent.description} onChange={setBi('description')} multiline />
      </AdminSectionCard>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Tarification */}
        <div className="lg:col-span-1">
          <AdminSectionCard title={t('pricing')} icon={Key}>
            <div className="space-y-2">
              <Label>{t('pricePerSMS')}</Label>
              <Input
                value={smsApiContent.pricing.perSMS}
                onChange={(e) => setSmsApiContent({ ...smsApiContent, pricing: { ...smsApiContent.pricing, perSMS: e.target.value } })}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('currency')}</Label>
              <Input
                value={smsApiContent.pricing.currency}
                onChange={(e) => setSmsApiContent({ ...smsApiContent, pricing: { ...smsApiContent.pricing, currency: e.target.value } })}
              />
            </div>
            <div className="rounded-xl bg-ink px-4 py-3 text-white">
              <p className="text-xs text-gray-400">Aperçu</p>
              <p className="font-display text-2xl font-bold">
                {smsApiContent.pricing.perSMS || '0'} <span className="text-base font-medium text-ochre">{smsApiContent.pricing.currency}</span>
              </p>
            </div>
          </AdminSectionCard>
        </div>

        {/* Fonctionnalités (affichage ; édition fine à venir) */}
        <div className="lg:col-span-2">
          <AdminSectionCard title={t('features')} icon={Send}>
            <ul className="space-y-3">
              {smsApiContent.features.map((feature) => (
                <li key={feature.id} className="rounded-xl border border-gray-200 p-4 dark:border-white/10">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">{t('featureTitle')} <LangChip lang="fr" /></Label>
                      <Input defaultValue={feature.title.fr} />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">{t('featureTitle')} <LangChip lang="en" /></Label>
                      <Input defaultValue={feature.title.en} />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </AdminSectionCard>
        </div>
      </div>
    </AdminPage>
  );
}
