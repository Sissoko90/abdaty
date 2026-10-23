'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AdminPage, AdminPageHeader } from '@/components/admin/admin-page';
import { AdminSectionCard, AdminStatus, LangChip } from '@/components/admin/content-list-editor';
import { Save, Scale, Shield } from 'lucide-react';
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

  /** Met à jour le contenu d'un document légal pour une langue. */
  const setContent = (doc: keyof LegalContent, lang: 'fr' | 'en', v: string) =>
    setLegalContent({
      ...legalContent,
      [doc]: { ...legalContent[doc], content: { ...legalContent[doc].content, [lang]: v } },
    });

  const docs = [
    { key: 'termsOfService' as const, tab: 'terms', icon: Scale, label: t('termsOfService') },
    { key: 'privacyPolicy' as const, tab: 'privacy', icon: Shield, label: t('privacyPolicy') },
  ];

  return (
    <AdminPage>
      <AdminPageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={Scale}
        actions={
          <Button onClick={handleSave} className="gap-2" disabled={saving || !token}>
            <Save className="h-4 w-4" />
            {saving ? '…' : t('save')}
          </Button>
        }
      />

      <AdminStatus
        error={error}
        success={success}
        loading={loading}
        signedOut={!token}
        signedOutMessage="Connectez-vous en tant qu’administrateur pour modifier les pages légales."
      />

      <Tabs defaultValue="terms" className="space-y-6">
        <TabsList className="w-full justify-start sm:w-auto">
          {docs.map(({ tab, icon: Icon, label }) => (
            <TabsTrigger key={tab} value={tab} className="gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        {docs.map(({ key, tab, icon, label }) => (
          <TabsContent key={tab} value={tab} className="mt-0">
            <AdminSectionCard
              title={label}
              icon={icon}
              description={`${t('lastUpdated')} : ${legalContent[key].lastUpdated}`}
            >
              <div className="grid gap-4 lg:grid-cols-2">
                {(['fr', 'en'] as const).map((lang) => (
                  <div key={lang} className="space-y-2">
                    <Label className="flex items-center gap-2">
                      {t('content')}
                      <LangChip lang={lang} />
                    </Label>
                    <Textarea
                      value={legalContent[key].content[lang]}
                      onChange={(e) => setContent(key, lang, e.target.value)}
                      rows={20}
                      className="font-mono text-sm"
                    />
                  </div>
                ))}
              </div>
            </AdminSectionCard>
          </TabsContent>
        ))}
      </Tabs>
    </AdminPage>
  );
}
