'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Search, AlertCircle, CheckCircle2, Globe } from 'lucide-react';
import { useSiteContentSection } from '@/hooks/use-site-content-section';
import { AdminPage, AdminPageHeader } from '@/components/admin/admin-page';
import { SITE_URL } from '@/lib/site';

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

/** Compteur de caractères : passe en ocre au-delà de la longueur conseillée. */
function CharCount({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return (
    <p className={`text-xs ${over ? 'font-medium text-amber-600 dark:text-ochre' : 'text-gray-500 dark:text-gray-400'}`}>
      {value.length}/{max} caractères conseillés
    </p>
  );
}

/** Pastille de langue au-dessus d'un champ bilingue. */
function LangChip({ code }: { code: string }) {
  return (
    <span className="ml-2 rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-gray-600 dark:bg-white/10 dark:text-gray-300">
      {code}
    </span>
  );
}

export default function AdminSEOPage() {
  const t = useTranslations('admin.settings.seo');

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

  // Aperçu Google : titre ~60 caractères, description ~160 (tronqués comme dans les résultats).
  const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1).trimEnd()}…` : s);
  const host = SITE_URL.replace(/^https?:\/\//, '');

  return (
    <AdminPage>
      <AdminPageHeader
        icon={Search}
        title={t('title')}
        description={
          <>
            {t('subtitle')} — ces balises alimentent le &lt;head&gt; du site (titre, description, mots-clés, image de partage) pour le référencement.
          </>
        }
        actions={
          <Button onClick={handleSave} className="gap-2" disabled={saving || !token}>
            <Save className="h-4 w-4" />
            {saving ? '…' : t('save')}
          </Button>
        }
      />

      {error && (
        <div role="alert" className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" /> <span>{error}</span>
        </div>
      )}
      {success && (
        <div role="status" className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> <span>{success}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Formulaire */}
        <section className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03] lg:col-span-7">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>
                {t('metaTitle')}
                <LangChip code="fr" />
              </Label>
              <Input value={metaTitle.fr} onChange={(e) => setMetaTitle({ ...metaTitle, fr: e.target.value })} />
              <CharCount value={metaTitle.fr} max={60} />
            </div>
            <div className="space-y-2">
              <Label>
                {t('metaTitle')}
                <LangChip code="en" />
              </Label>
              <Input value={metaTitle.en} onChange={(e) => setMetaTitle({ ...metaTitle, en: e.target.value })} />
              <CharCount value={metaTitle.en} max={60} />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>
                {t('metaDescription')}
                <LangChip code="fr" />
              </Label>
              <Textarea value={metaDescription.fr} onChange={(e) => setMetaDescription({ ...metaDescription, fr: e.target.value })} rows={4} />
              <CharCount value={metaDescription.fr} max={160} />
            </div>
            <div className="space-y-2">
              <Label>
                {t('metaDescription')}
                <LangChip code="en" />
              </Label>
              <Textarea value={metaDescription.en} onChange={(e) => setMetaDescription({ ...metaDescription, en: e.target.value })} rows={4} />
              <CharCount value={metaDescription.en} max={160} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>{t('keywords')}</Label>
            <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="mot1, mot2, mot3" />
            {keywords.trim() && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {keywords
                  .split(',')
                  .map((k) => k.trim())
                  .filter(Boolean)
                  .map((k, i) => (
                    <span key={`${k}-${i}`} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-white/5 dark:text-gray-300">
                      {k}
                    </span>
                  ))}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>{t('ogImage')}</Label>
            <Input value={ogImage} onChange={(e) => setOgImage(e.target.value)} placeholder="/og-image.jpg ou https://…" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Image affichée lors du partage sur les réseaux (recommandé 1200×630).</p>
          </div>
        </section>

        {/* Aperçu du résultat de recherche */}
        <aside className="space-y-4 lg:col-span-5">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03] lg:sticky lg:top-24">
            <h2 className="mb-1 text-lg font-bold text-ink dark:text-white">Aperçu dans Google</h2>
            <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">Rendu approximatif du résultat de recherche (version FR).</p>
            <div className="rounded-xl border border-gray-100 bg-white p-4 dark:border-white/10 dark:bg-white">
              <div className="mb-1 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
                  <Globe className="h-3.5 w-3.5 text-gray-500" />
                </span>
                <div className="leading-tight">
                  <p className="text-[13px] text-[#202124]">Abdaty Technologie</p>
                  <p className="text-xs text-[#4d5156]">{host} › fr</p>
                </div>
              </div>
              <p className="mt-1 text-lg leading-snug text-[#1a0dab]">{truncate(metaTitle.fr || DEFAULTS.metaTitle.fr, 60)}</p>
              <p className="mt-1 text-sm leading-relaxed text-[#4d5156]">{truncate(metaDescription.fr || DEFAULTS.metaDescription.fr, 160)}</p>
            </div>
          </div>
        </aside>
      </div>
    </AdminPage>
  );
}
