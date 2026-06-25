'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Save, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSiteContentSection } from '@/hooks/use-site-content-section';

type Bi = { fr: string; en: string };

const DEFAULTS = {
  metaTitle: { fr: 'Abdaty Technologie - Solutions Digitales Innovantes', en: 'Abdaty Technologie - Innovative Digital Solutions' },
  metaDescription: {
    fr: 'Expert en développement web, mobile, UI/UX design, cybersécurité et intelligence artificielle au Mali.',
    en: 'Expert in web/mobile development, UI/UX design, cybersecurity and AI in Mali.',
  },
  keywords: 'développement web, développement mobile, UI/UX, cybersécurité, intelligence artificielle, Mali, Afrique',
  ogImage: '/og-image.jpg',
};

export default function AdminSEOPage() {
  const t = useTranslations('admin.settings.seo');
  const tBreadcrumb = useTranslations('admin.breadcrumb');

  const { token, blocks, saving, error, success, saveAll, value } = useSiteContentSection('seo');

  const [metaTitle, setMetaTitle] = useState<Bi>(DEFAULTS.metaTitle);
  const [metaDescription, setMetaDescription] = useState<Bi>(DEFAULTS.metaDescription);
  const [keywords, setKeywords] = useState(DEFAULTS.keywords);
  const [ogImage, setOgImage] = useState(DEFAULTS.ogImage);

  useEffect(() => {
    setMetaTitle({ fr: value('metaTitle', 'fr', DEFAULTS.metaTitle.fr), en: value('metaTitle', 'en', DEFAULTS.metaTitle.en) });
    setMetaDescription({ fr: value('metaDescription', 'fr', DEFAULTS.metaDescription.fr), en: value('metaDescription', 'en', DEFAULTS.metaDescription.en) });
    setKeywords(value('keywords', 'fr', DEFAULTS.keywords));
    setOgImage(value('ogImage', 'fr', DEFAULTS.ogImage));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  const handleSave = () => {
    saveAll({
      metaTitle: { valueFr: metaTitle.fr, valueEn: metaTitle.en, contentType: 'text', displayOrder: 1 },
      metaDescription: { valueFr: metaDescription.fr, valueEn: metaDescription.en, contentType: 'text', displayOrder: 2 },
      keywords: { valueFr: keywords, contentType: 'text', displayOrder: 3 },
      ogImage: { valueFr: ogImage, contentType: 'text', displayOrder: 4 },
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('subtitle')} — ces balises alimentent le &lt;head&gt; du site (titre, description, mots-clés, image de partage) pour le référencement.
            </p>
          </div>
          <Button onClick={handleSave} className="gap-2" disabled={saving || !token}>
            <Save className="w-4 h-4" />
            {saving ? '…' : t('save')}
          </Button>
        </div>

        {error && (
          <div role="alert" className="flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" /> <span>{error}</span>
          </div>
        )}
        {success && (
          <div role="status" className="flex items-center gap-2 rounded-md bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 px-3 py-2 text-sm text-green-700 dark:text-green-300 mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> <span>{success}</span>
          </div>
        )}

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              {t('title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('metaTitle')} (FR)</Label>
                <Input value={metaTitle.fr} onChange={(e) => setMetaTitle({ ...metaTitle, fr: e.target.value })} className="mt-1" />
                <p className="text-xs text-gray-500 mt-1">{metaTitle.fr.length}/60 caractères conseillés</p>
              </div>
              <div>
                <Label>{t('metaTitle')} (EN)</Label>
                <Input value={metaTitle.en} onChange={(e) => setMetaTitle({ ...metaTitle, en: e.target.value })} className="mt-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('metaDescription')} (FR)</Label>
                <Textarea value={metaDescription.fr} onChange={(e) => setMetaDescription({ ...metaDescription, fr: e.target.value })} rows={3} className="mt-1" />
                <p className="text-xs text-gray-500 mt-1">{metaDescription.fr.length}/160 caractères conseillés</p>
              </div>
              <div>
                <Label>{t('metaDescription')} (EN)</Label>
                <Textarea value={metaDescription.en} onChange={(e) => setMetaDescription({ ...metaDescription, en: e.target.value })} rows={3} className="mt-1" />
              </div>
            </div>
            <div>
              <Label>{t('keywords')}</Label>
              <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} className="mt-1" placeholder="mot1, mot2, mot3" />
            </div>
            <div>
              <Label>{t('ogImage')}</Label>
              <Input value={ogImage} onChange={(e) => setOgImage(e.target.value)} className="mt-1" placeholder="/og-image.jpg ou https://…" />
              <p className="text-xs text-gray-500 mt-1">Image affichée lors du partage sur les réseaux (recommandé 1200×630).</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
