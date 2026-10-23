'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminPage, AdminPageHeader } from '@/components/admin/admin-page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';
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

/** Champs traduits, dans l'ordre d'affichage du footer. */
const FIELDS: (keyof Omit<FooterSettings, 'isActive'>)[] = [
  'description',
  'quickLinks',
  'services',
  'legal',
  'termsOfService',
  'privacyPolicy',
  'rights',
];

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
    <AdminPage>

      <AdminPageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={Layers}
        actions={
          <>
            <label className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 text-sm font-medium text-ink dark:border-white/10 dark:bg-white/5 dark:text-gray-200">
              <input
                type="checkbox"
                checked={footer.isActive}
                onChange={(e) => setFooter({ ...footer, isActive: e.target.checked })}
                className="h-4 w-4 accent-primary-600"
              />
              {t('active')}
            </label>
            <Button onClick={handleSave} size="lg" className="gap-2" disabled={saving || !token}>
              <Save className="w-4 h-4" />
              {saving ? '…' : t('save')}
            </Button>
          </>
        }
      />

      {/* Bandeaux d'état */}
      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {!token && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          Connectez-vous en tant qu&apos;administrateur pour modifier le pied de page.
        </p>
      )}
      {loading && <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"><span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />Chargement…</p>}

      {/* Footer Settings Form */}
      {/* Formulaire : chaque libellé traduit en paire FR / EN côte à côte */}
      <Card>
        <CardHeader className="border-b border-gray-100 dark:border-white/10">
          <CardTitle>{t('footerSettings')}</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-gray-100 pt-0 dark:divide-white/10">
          {FIELDS.map((key) => (
            <div key={key} className="py-6 first:pt-6 last:pb-0">
              <BiField
                label={t(key)}
                fr={<Input value={footer[key].fr} onChange={(e) => setFooter({ ...footer, [key]: { ...footer[key], fr: e.target.value } })} />}
                en={<Input value={footer[key].en} onChange={(e) => setFooter({ ...footer, [key]: { ...footer[key], en: e.target.value } })} />}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </AdminPage>
  );
}

/** Petite pastille de langue (FR / EN) accolée aux libellés des champs traduits. */
function LangChip({ lang }: { lang: 'FR' | 'EN' }) {
  return (
    <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-white/10 dark:text-gray-400">
      {lang}
    </span>
  );
}

/** Champ traduit : version française et anglaise côte à côte. */
function BiField({ label, fr, en }: { label: React.ReactNode; fr: React.ReactNode; en: React.ReactNode }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          {label}
          <LangChip lang="FR" />
        </Label>
        {fr}
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          {label}
          <LangChip lang="EN" />
        </Label>
        {en}
      </div>
    </div>
  );
}
