'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Save, Cookie, AlertCircle, CheckCircle2 } from 'lucide-react';
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
  const tBreadcrumb = useTranslations('admin.breadcrumb');

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
          {/* Configuration principale */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="w-5 h-5" />
                {t('mainConfiguration')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('titleLabel')} (Français)</Label>
                  <Input value={cookiesContent.title.fr} onChange={(e) => setCookiesContent({ ...cookiesContent, title: { ...cookiesContent.title, fr: e.target.value } })} className="mt-1" />
                </div>
                <div>
                  <Label>{t('titleLabel')} (English)</Label>
                  <Input value={cookiesContent.title.en} onChange={(e) => setCookiesContent({ ...cookiesContent, title: { ...cookiesContent.title, en: e.target.value } })} className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('description')} (Français)</Label>
                  <Textarea value={cookiesContent.description.fr} onChange={(e) => setCookiesContent({ ...cookiesContent, description: { ...cookiesContent.description, fr: e.target.value } })} rows={3} className="mt-1" />
                </div>
                <div>
                  <Label>{t('description')} (English)</Label>
                  <Textarea value={cookiesContent.description.en} onChange={(e) => setCookiesContent({ ...cookiesContent, description: { ...cookiesContent.description, en: e.target.value } })} rows={3} className="mt-1" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>{t('acceptAll')} (FR)</Label>
                  <Input value={cookiesContent.acceptAll.fr} onChange={(e) => setCookiesContent({ ...cookiesContent, acceptAll: { ...cookiesContent.acceptAll, fr: e.target.value } })} className="mt-1" />
                </div>
                <div>
                  <Label>{t('rejectAll')} (FR)</Label>
                  <Input value={cookiesContent.rejectAll.fr} onChange={(e) => setCookiesContent({ ...cookiesContent, rejectAll: { ...cookiesContent.rejectAll, fr: e.target.value } })} className="mt-1" />
                </div>
                <div>
                  <Label>{t('customize')} (FR)</Label>
                  <Input value={cookiesContent.customize.fr} onChange={(e) => setCookiesContent({ ...cookiesContent, customize: { ...cookiesContent.customize, fr: e.target.value } })} className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Catégories de cookies (affichage ; édition fine à venir) */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle>{t('categories')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg dark:border-gray-700">
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">{t('essential')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('categoryTitle')} (FR)</Label>
                    <Input defaultValue={cookiesContent.categories.essential.title.fr} className="mt-1" />
                  </div>
                  <div>
                    <Label>{t('categoryTitle')} (EN)</Label>
                    <Input defaultValue={cookiesContent.categories.essential.title.en} className="mt-1" />
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg dark:border-gray-700">
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">{t('analytics')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('categoryTitle')} (FR)</Label>
                    <Input defaultValue={cookiesContent.categories.analytics.title.fr} className="mt-1" />
                  </div>
                  <div>
                    <Label>{t('categoryTitle')} (EN)</Label>
                    <Input defaultValue={cookiesContent.categories.analytics.title.en} className="mt-1" />
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded-lg dark:border-gray-700">
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">{t('marketing')}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('categoryTitle')} (FR)</Label>
                    <Input defaultValue={cookiesContent.categories.marketing.title.fr} className="mt-1" />
                  </div>
                  <div>
                    <Label>{t('categoryTitle')} (EN)</Label>
                    <Input defaultValue={cookiesContent.categories.marketing.title.en} className="mt-1" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Consentements enregistrés + statistiques (RGPD) */}
          <CookieConsentAnalytics />
        </div>
      </div>
    </div>
  );
}
