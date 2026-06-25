'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Save, MessageSquare, Key, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
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
  const tBreadcrumb = useTranslations('admin.breadcrumb');

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

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: tBreadcrumb('dashboard'), href: `/admin` },
            { label: tBreadcrumb('admin'), href: `/admin` },
            { label: t('title') },
          ]}
        />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
              {t('title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300 mt-2">
              {t('subtitle')}
            </p>
          </div>
          <Button onClick={handleSave} className="gap-2" disabled={saving || !token}>
            <Save className="w-4 h-4" />
            {saving ? '…' : t('save')}
          </Button>
        </div>

        {/* Bandeaux d'état */}
        {error && (
          <div role="alert" className="flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div role="status" className="flex items-center gap-2 rounded-md bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 px-3 py-2 text-sm text-green-700 dark:text-green-300 mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}
        {!token && (
          <p className="text-sm text-gray-500 mb-4">
            Connectez-vous en tant qu&apos;administrateur pour modifier cette section.
          </p>
        )}
        {loading && <p className="text-sm text-gray-500 mb-4">Chargement…</p>}

        <div className="space-y-6">
          {/* Section principale */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                {t('mainSection')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('titleLabel')} (Français)</Label>
                  <Input value={smsApiContent.title.fr} onChange={(e) => setSmsApiContent({ ...smsApiContent, title: { ...smsApiContent.title, fr: e.target.value } })} className="mt-1" />
                </div>
                <div>
                  <Label>{t('titleLabel')} (English)</Label>
                  <Input value={smsApiContent.title.en} onChange={(e) => setSmsApiContent({ ...smsApiContent, title: { ...smsApiContent.title, en: e.target.value } })} className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('subtitleLabel')} (Français)</Label>
                  <Input value={smsApiContent.subtitle.fr} onChange={(e) => setSmsApiContent({ ...smsApiContent, subtitle: { ...smsApiContent.subtitle, fr: e.target.value } })} className="mt-1" />
                </div>
                <div>
                  <Label>{t('subtitleLabel')} (English)</Label>
                  <Input value={smsApiContent.subtitle.en} onChange={(e) => setSmsApiContent({ ...smsApiContent, subtitle: { ...smsApiContent.subtitle, en: e.target.value } })} className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('description')} (Français)</Label>
                  <Textarea value={smsApiContent.description.fr} onChange={(e) => setSmsApiContent({ ...smsApiContent, description: { ...smsApiContent.description, fr: e.target.value } })} rows={3} className="mt-1" />
                </div>
                <div>
                  <Label>{t('description')} (English)</Label>
                  <Textarea value={smsApiContent.description.en} onChange={(e) => setSmsApiContent({ ...smsApiContent, description: { ...smsApiContent.description, en: e.target.value } })} rows={3} className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tarification */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                {t('pricing')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('pricePerSMS')}</Label>
                  <Input value={smsApiContent.pricing.perSMS} onChange={(e) => setSmsApiContent({ ...smsApiContent, pricing: { ...smsApiContent.pricing, perSMS: e.target.value } })} className="mt-1" />
                </div>
                <div>
                  <Label>{t('currency')}</Label>
                  <Input value={smsApiContent.pricing.currency} onChange={(e) => setSmsApiContent({ ...smsApiContent, pricing: { ...smsApiContent.pricing, currency: e.target.value } })} className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fonctionnalités (affichage ; édition fine à venir) */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                {t('features')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {smsApiContent.features.map((feature) => (
                  <div key={feature.id} className="p-4 border rounded-lg dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>{t('featureTitle')} (FR)</Label>
                        <Input defaultValue={feature.title.fr} className="mt-1" />
                      </div>
                      <div>
                        <Label>{t('featureTitle')} (EN)</Label>
                        <Input defaultValue={feature.title.en} className="mt-1" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
