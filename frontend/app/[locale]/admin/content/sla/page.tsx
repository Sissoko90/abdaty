'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Save, Shield, Clock, CheckCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
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
  const tBreadcrumb = useTranslations('admin.breadcrumb');

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
                <Shield className="w-5 h-5" />
                {t('mainSection')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('titleLabel')} (Français)</Label>
                  <Input value={slaContent.title.fr} onChange={(e) => setSlaContent({ ...slaContent, title: { ...slaContent.title, fr: e.target.value } })} className="mt-1" />
                </div>
                <div>
                  <Label>{t('titleLabel')} (English)</Label>
                  <Input value={slaContent.title.en} onChange={(e) => setSlaContent({ ...slaContent, title: { ...slaContent.title, en: e.target.value } })} className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('subtitleLabel')} (Français)</Label>
                  <Input value={slaContent.subtitle.fr} onChange={(e) => setSlaContent({ ...slaContent, subtitle: { ...slaContent.subtitle, fr: e.target.value } })} className="mt-1" />
                </div>
                <div>
                  <Label>{t('subtitleLabel')} (English)</Label>
                  <Input value={slaContent.subtitle.en} onChange={(e) => setSlaContent({ ...slaContent, subtitle: { ...slaContent.subtitle, en: e.target.value } })} className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('description')} (Français)</Label>
                  <Textarea value={slaContent.description.fr} onChange={(e) => setSlaContent({ ...slaContent, description: { ...slaContent.description, fr: e.target.value } })} rows={3} className="mt-1" />
                </div>
                <div>
                  <Label>{t('description')} (English)</Label>
                  <Textarea value={slaContent.description.en} onChange={(e) => setSlaContent({ ...slaContent, description: { ...slaContent.description, en: e.target.value } })} rows={3} className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Temps de réponse */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {t('responseTime')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('critical')} (Français)</Label>
                  <Input value={slaContent.responseTime.critical.fr} onChange={(e) => setRT('critical', 'fr', e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>{t('critical')} (English)</Label>
                  <Input value={slaContent.responseTime.critical.en} onChange={(e) => setRT('critical', 'en', e.target.value)} className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('high')} (Français)</Label>
                  <Input value={slaContent.responseTime.high.fr} onChange={(e) => setRT('high', 'fr', e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label>{t('high')} (English)</Label>
                  <Input value={slaContent.responseTime.high.en} onChange={(e) => setRT('high', 'en', e.target.value)} className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Garanties (affichage ; édition fine à venir) */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {t('guarantees')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {slaContent.guarantees.map((guarantee) => (
                  <div key={guarantee.id} className="p-4 border rounded-lg dark:border-gray-700">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>{t('guaranteeTitle')} (FR)</Label>
                        <Input defaultValue={guarantee.title.fr} className="mt-1" />
                      </div>
                      <div>
                        <Label>{t('guaranteeTitle')} (EN)</Label>
                        <Input defaultValue={guarantee.title.en} className="mt-1" />
                      </div>
                      <div>
                        <Label>{t('percentage')}</Label>
                        <Input defaultValue={guarantee.percentage} className="mt-1" />
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
