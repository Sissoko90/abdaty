'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Save, Scale, Shield, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSiteContentSection } from '@/hooks/use-site-content-section';

type Bi = { fr: string; en: string };
type LegalDoc = { title: Bi; content: Bi; lastUpdated: string };

interface LegalContent {
  termsOfService: LegalDoc;
  privacyPolicy: LegalDoc;
}

/** Valeurs par défaut (repli si la section n'a pas encore de contenu en base). */
const DEFAULTS: LegalContent = {
  termsOfService: {
    title: { fr: "Conditions Générales d'Utilisation", en: 'Terms of Service' },
    content: { fr: '1. Acceptation des conditions\n\nEn accédant et en utilisant ce site...', en: '1. Acceptance of Terms\n\nBy accessing and using this site...' },
    lastUpdated: '2024-01-01',
  },
  privacyPolicy: {
    title: { fr: 'Politique de Confidentialité', en: 'Privacy Policy' },
    content: { fr: '1. Collecte des données\n\nNous collectons les informations suivantes...', en: '1. Data Collection\n\nWe collect the following information...' },
    lastUpdated: '2024-01-01',
  },
};

export default function AdminLegalPage() {
  const t = useTranslations('admin.content.legal');
  const tBreadcrumb = useTranslations('admin.breadcrumb');

  const { token, blocks, loading, saving, error, success, saveAll, value } =
    useSiteContentSection('legal');

  const [legalContent, setLegalContent] = useState<LegalContent>(DEFAULTS);

  useEffect(() => {
    const pair = (key: string, def: Bi) => ({ fr: value(key, 'fr', def.fr), en: value(key, 'en', def.en) });
    setLegalContent({
      termsOfService: {
        title: pair('terms.title', DEFAULTS.termsOfService.title),
        content: pair('terms.content', DEFAULTS.termsOfService.content),
        lastUpdated: value('terms.lastUpdated', 'fr', DEFAULTS.termsOfService.lastUpdated),
      },
      privacyPolicy: {
        title: pair('privacy.title', DEFAULTS.privacyPolicy.title),
        content: pair('privacy.content', DEFAULTS.privacyPolicy.content),
        lastUpdated: value('privacy.lastUpdated', 'fr', DEFAULTS.privacyPolicy.lastUpdated),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  const handleSave = () => {
    const c = legalContent;
    const text = (v: Bi, order: number) => ({ valueFr: v.fr, valueEn: v.en, contentType: 'text', displayOrder: order });
    saveAll({
      'terms.title': text(c.termsOfService.title, 1),
      'terms.content': text(c.termsOfService.content, 2),
      'terms.lastUpdated': { valueFr: c.termsOfService.lastUpdated, contentType: 'text', displayOrder: 3 },
      'privacy.title': text(c.privacyPolicy.title, 4),
      'privacy.content': text(c.privacyPolicy.content, 5),
      'privacy.lastUpdated': { valueFr: c.privacyPolicy.lastUpdated, contentType: 'text', displayOrder: 6 },
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
            Connectez-vous en tant qu&apos;administrateur pour modifier les pages légales.
          </p>
        )}
        {loading && <p className="text-sm text-gray-500 mb-4">Chargement…</p>}

        <Tabs defaultValue="terms" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="terms" className="gap-2">
              <Scale className="w-4 h-4" />
              {t('termsOfService')}
            </TabsTrigger>
            <TabsTrigger value="privacy" className="gap-2">
              <Shield className="w-4 h-4" />
              {t('privacyPolicy')}
            </TabsTrigger>
          </TabsList>

          {/* Conditions d'utilisation */}
          <TabsContent value="terms">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  {t('termsOfService')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('content')} (Français)</Label>
                    <Textarea
                      value={legalContent.termsOfService.content.fr}
                      onChange={(e) =>
                        setLegalContent({
                          ...legalContent,
                          termsOfService: { ...legalContent.termsOfService, content: { ...legalContent.termsOfService.content, fr: e.target.value } },
                        })
                      }
                      rows={20}
                      className="mt-1 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <Label>{t('content')} (English)</Label>
                    <Textarea
                      value={legalContent.termsOfService.content.en}
                      onChange={(e) =>
                        setLegalContent({
                          ...legalContent,
                          termsOfService: { ...legalContent.termsOfService, content: { ...legalContent.termsOfService.content, en: e.target.value } },
                        })
                      }
                      rows={20}
                      className="mt-1 font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {t('lastUpdated')}: {legalContent.termsOfService.lastUpdated}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Politique de confidentialité */}
          <TabsContent value="privacy">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {t('privacyPolicy')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('content')} (Français)</Label>
                    <Textarea
                      value={legalContent.privacyPolicy.content.fr}
                      onChange={(e) =>
                        setLegalContent({
                          ...legalContent,
                          privacyPolicy: { ...legalContent.privacyPolicy, content: { ...legalContent.privacyPolicy.content, fr: e.target.value } },
                        })
                      }
                      rows={20}
                      className="mt-1 font-mono text-sm"
                    />
                  </div>
                  <div>
                    <Label>{t('content')} (English)</Label>
                    <Textarea
                      value={legalContent.privacyPolicy.content.en}
                      onChange={(e) =>
                        setLegalContent({
                          ...legalContent,
                          privacyPolicy: { ...legalContent.privacyPolicy, content: { ...legalContent.privacyPolicy.content, en: e.target.value } },
                        })
                      }
                      rows={20}
                      className="mt-1 font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {t('lastUpdated')}: {legalContent.privacyPolicy.lastUpdated}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
