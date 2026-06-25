'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { useEffect, useState } from 'react';
import { useSiteContentSection } from '@/hooks/use-site-content-section';

type Bi = { fr: string; en: string };

interface FooterSettings {
  description: Bi;
  quickLinks: Bi;
  services: Bi;
  legal: Bi;
  termsOfService: Bi;
  privacyPolicy: Bi;
  rights: Bi;
  isActive: boolean;
}

/** Valeurs par défaut (repli si la section n'a pas encore de contenu en base). */
const DEFAULTS: FooterSettings = {
  description: { fr: 'Solutions digitales innovantes pour transformer votre entreprise', en: 'Innovative digital solutions to transform your business' },
  quickLinks: { fr: 'Liens Rapides', en: 'Quick Links' },
  services: { fr: 'Services', en: 'Services' },
  legal: { fr: 'Légal', en: 'Legal' },
  termsOfService: { fr: "Conditions d'utilisation", en: 'Terms of Service' },
  privacyPolicy: { fr: 'Politique de confidentialité', en: 'Privacy Policy' },
  rights: { fr: 'Tous droits réservés.', en: 'All rights reserved.' },
  isActive: true,
};

export default function AdminFooterPage() {
  const t = useTranslations('admin.content.footer');
  const tBreadcrumb = useTranslations('admin.breadcrumb');

  const { token, blocks, loading, saving, error, success, saveAll, value } =
    useSiteContentSection('footer');

  const [footer, setFooter] = useState<FooterSettings>(DEFAULTS);

  useEffect(() => {
    const pair = (key: string, def: Bi) => ({ fr: value(key, 'fr', def.fr), en: value(key, 'en', def.en) });
    setFooter({
      description: pair('description', DEFAULTS.description),
      quickLinks: pair('quickLinks', DEFAULTS.quickLinks),
      services: pair('services', DEFAULTS.services),
      legal: pair('legal', DEFAULTS.legal),
      termsOfService: pair('termsOfService', DEFAULTS.termsOfService),
      privacyPolicy: pair('privacyPolicy', DEFAULTS.privacyPolicy),
      rights: pair('rights', DEFAULTS.rights),
      isActive: blocks['isActive'] ? blocks['isActive'].valueFr !== 'false' : DEFAULTS.isActive,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  const handleSave = () => {
    const f = footer;
    const text = (v: Bi, order: number) => ({ valueFr: v.fr, valueEn: v.en, contentType: 'text', displayOrder: order });
    saveAll({
      description: text(f.description, 1),
      quickLinks: text(f.quickLinks, 2),
      services: text(f.services, 3),
      legal: text(f.legal, 4),
      termsOfService: text(f.termsOfService, 5),
      privacyPolicy: text(f.privacyPolicy, 6),
      rights: text(f.rights, 7),
      isActive: { valueFr: String(f.isActive), contentType: 'boolean', displayOrder: 8 },
    });
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: tBreadcrumb('dashboard'), href: `/admin` },
            { label: tBreadcrumb('admin'), href: `/admin` },
            { label: t('title') },
          ]}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
              {t('title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300 mt-2">
              {t('subtitle')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={footer.isActive}
              onChange={(e) => setFooter({ ...footer, isActive: e.target.checked })}
              className="w-4 h-4"
            />
            <Label>{t('active')}</Label>
            <Button onClick={handleSave} className="gap-2" disabled={saving || !token}>
              <Save className="w-4 h-4" />
              {saving ? '…' : t('save')}
            </Button>
          </div>
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
            Connectez-vous en tant qu&apos;administrateur pour modifier le pied de page.
          </p>
        )}
        {loading && <p className="text-sm text-gray-500 mb-4">Chargement…</p>}

        {/* Footer Settings Form */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 border border-gray-200 transition-colors duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white transition-colors duration-300">
              <Layers className="w-5 h-5" />
              {t('footerSettings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('description')} (Français)</Label>
              <Input value={footer.description.fr} onChange={(e) => setFooter({ ...footer, description: { ...footer.description, fr: e.target.value } })} className="mt-1" />
            </div>
            <div>
              <Label>{t('description')} (English)</Label>
              <Input value={footer.description.en} onChange={(e) => setFooter({ ...footer, description: { ...footer.description, en: e.target.value } })} className="mt-1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('quickLinks')} (Français)</Label>
                <Input value={footer.quickLinks.fr} onChange={(e) => setFooter({ ...footer, quickLinks: { ...footer.quickLinks, fr: e.target.value } })} className="mt-1" />
              </div>
              <div>
                <Label>{t('quickLinks')} (English)</Label>
                <Input value={footer.quickLinks.en} onChange={(e) => setFooter({ ...footer, quickLinks: { ...footer.quickLinks, en: e.target.value } })} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('services')} (Français)</Label>
                <Input value={footer.services.fr} onChange={(e) => setFooter({ ...footer, services: { ...footer.services, fr: e.target.value } })} className="mt-1" />
              </div>
              <div>
                <Label>{t('services')} (English)</Label>
                <Input value={footer.services.en} onChange={(e) => setFooter({ ...footer, services: { ...footer.services, en: e.target.value } })} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('legal')} (Français)</Label>
                <Input value={footer.legal.fr} onChange={(e) => setFooter({ ...footer, legal: { ...footer.legal, fr: e.target.value } })} className="mt-1" />
              </div>
              <div>
                <Label>{t('legal')} (English)</Label>
                <Input value={footer.legal.en} onChange={(e) => setFooter({ ...footer, legal: { ...footer.legal, en: e.target.value } })} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('termsOfService')} (Français)</Label>
                <Input value={footer.termsOfService.fr} onChange={(e) => setFooter({ ...footer, termsOfService: { ...footer.termsOfService, fr: e.target.value } })} className="mt-1" />
              </div>
              <div>
                <Label>{t('termsOfService')} (English)</Label>
                <Input value={footer.termsOfService.en} onChange={(e) => setFooter({ ...footer, termsOfService: { ...footer.termsOfService, en: e.target.value } })} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('privacyPolicy')} (Français)</Label>
                <Input value={footer.privacyPolicy.fr} onChange={(e) => setFooter({ ...footer, privacyPolicy: { ...footer.privacyPolicy, fr: e.target.value } })} className="mt-1" />
              </div>
              <div>
                <Label>{t('privacyPolicy')} (English)</Label>
                <Input value={footer.privacyPolicy.en} onChange={(e) => setFooter({ ...footer, privacyPolicy: { ...footer.privacyPolicy, en: e.target.value } })} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('rights')} (Français)</Label>
                <Input value={footer.rights.fr} onChange={(e) => setFooter({ ...footer, rights: { ...footer.rights, fr: e.target.value } })} className="mt-1" />
              </div>
              <div>
                <Label>{t('rights')} (English)</Label>
                <Input value={footer.rights.en} onChange={(e) => setFooter({ ...footer, rights: { ...footer.rights, en: e.target.value } })} className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
