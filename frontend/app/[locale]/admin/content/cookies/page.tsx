'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminPage, AdminPageHeader } from '@/components/admin/admin-page';
import { AdminSectionCard, AdminStatus, BilingualField, LangChip } from '@/components/admin/content-list-editor';
import { Save, Cookie, Layers } from 'lucide-react';
import { useSiteContentSection } from '@/hooks/use-site-content-section';
import { CookieConsentAnalytics } from '@/components/admin/cookie-consent-analytics';

type Bi = { fr: string; en: string };
type Category = { title: Bi; description: Bi };

interface CookiesContent {
  title: Bi;
  description: Bi;
  acceptAll: Bi;
  rejectAll: Bi;
  customize: Bi;
  categories: { essential: Category; analytics: Category; marketing: Category };
}

/** Valeurs par défaut (repli si la section n'a pas encore de contenu en base). */
const DEFAULTS: CookiesContent = {
  title: { fr: 'Nous utilisons des cookies', en: 'We use cookies' },
  description: { fr: 'Nous utilisons des cookies pour améliorer votre expérience', en: 'We use cookies to improve your experience' },
  acceptAll: { fr: 'Tout accepter', en: 'Accept all' },
  rejectAll: { fr: 'Tout refuser', en: 'Reject all' },
  customize: { fr: 'Personnaliser', en: 'Customize' },
  categories: {
    essential: { title: { fr: 'Cookies essentiels', en: 'Essential cookies' }, description: { fr: 'Nécessaires au fonctionnement du site', en: 'Necessary for the site to function' } },
    analytics: { title: { fr: 'Cookies analytiques', en: 'Analytics cookies' }, description: { fr: 'Nous aident à comprendre comment vous utilisez le site', en: 'Help us understand how you use the site' } },
    marketing: { title: { fr: 'Cookies marketing', en: 'Marketing cookies' }, description: { fr: 'Utilisés pour personnaliser les publicités', en: 'Used to personalize advertisements' } },
  },
};

export default function AdminCookiesPage() {
  const t = useTranslations('admin.content.cookies');

  const { token, blocks, loading, saving, error, success, saveAll, value } =
    useSiteContentSection('cookies');

  const [cookiesContent, setCookiesContent] = useState<CookiesContent>(DEFAULTS);

  useEffect(() => {
    const pair = (key: string, def: Bi) => ({ fr: value(key, 'fr', def.fr), en: value(key, 'en', def.en) });
    let categories = DEFAULTS.categories;
    if (blocks['categories']?.valueFr) {
      try {
        categories = JSON.parse(blocks['categories'].valueFr);
      } catch {
        /* JSON invalide */
      }
    }
    setCookiesContent({
      title: pair('title', DEFAULTS.title),
      description: pair('description', DEFAULTS.description),
      acceptAll: pair('acceptAll', DEFAULTS.acceptAll),
      rejectAll: pair('rejectAll', DEFAULTS.rejectAll),
      customize: pair('customize', DEFAULTS.customize),
      categories,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  const handleSave = () => {
    const c = cookiesContent;
    const text = (v: Bi, order: number) => ({ valueFr: v.fr, valueEn: v.en, contentType: 'text', displayOrder: order });
    saveAll({
      title: text(c.title, 1),
      description: text(c.description, 2),
      acceptAll: text(c.acceptAll, 3),
      rejectAll: text(c.rejectAll, 4),
      customize: text(c.customize, 5),
      categories: { valueFr: JSON.stringify(c.categories), contentType: 'json', displayOrder: 6 },
    });
  };

  const setBi = (field: 'title' | 'description' | 'acceptAll' | 'rejectAll' | 'customize') => (lang: 'fr' | 'en', v: string) =>
    setCookiesContent({ ...cookiesContent, [field]: { ...cookiesContent[field], [lang]: v } });

  const categoryKeys = ['essential', 'analytics', 'marketing'] as const;

  return (
    <AdminPage>
      <AdminPageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={Cookie}
        actions={
          <Button onClick={handleSave} className="gap-2" disabled={saving || !token}>
            <Save className="h-4 w-4" />
            {saving ? '…' : t('save')}
          </Button>
        }
      />

      <AdminStatus error={error} success={success} loading={loading} signedOut={!token} />

      {/* Configuration principale */}
      <AdminSectionCard title={t('mainConfiguration')} icon={Cookie}>
        <BilingualField label={t('titleLabel')} value={cookiesContent.title} onChange={setBi('title')} />
        <BilingualField label={t('description')} value={cookiesContent.description} onChange={setBi('description')} multiline />
        <div className="space-y-6 rounded-xl bg-gray-50 p-4 dark:bg-white/[0.02] sm:p-5">
          <BilingualField label={t('acceptAll')} value={cookiesContent.acceptAll} onChange={setBi('acceptAll')} />
          <BilingualField label={t('rejectAll')} value={cookiesContent.rejectAll} onChange={setBi('rejectAll')} />
          <BilingualField label={t('customize')} value={cookiesContent.customize} onChange={setBi('customize')} />
        </div>
      </AdminSectionCard>

      {/* Catégories de cookies (affichage ; édition fine à venir) */}
      <AdminSectionCard title={t('categories')} icon={Layers}>
        <ul className="grid gap-4 lg:grid-cols-3">
          {categoryKeys.map((key) => (
            <li key={key} className="space-y-4 rounded-xl border border-gray-200 p-4 dark:border-white/10">
              <h3 className="font-semibold text-ink dark:text-white">{t(key)}</h3>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">{t('categoryTitle')} <LangChip lang="fr" /></Label>
                <Input defaultValue={cookiesContent.categories[key].title.fr} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">{t('categoryTitle')} <LangChip lang="en" /></Label>
                <Input defaultValue={cookiesContent.categories[key].title.en} />
              </div>
            </li>
          ))}
        </ul>
      </AdminSectionCard>

      {/* Consentements enregistrés + statistiques (RGPD) */}
      <CookieConsentAnalytics />
    </AdminPage>
  );
}
