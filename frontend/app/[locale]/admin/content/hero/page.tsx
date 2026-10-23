'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminPage, AdminPageHeader } from '@/components/admin/admin-page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSiteContentSection } from '@/hooks/use-site-content-section';

interface HeroSection {
  title: { fr: string; en: string };
  subtitle: { fr: string; en: string };
  description: { fr: string; en: string };
  ctaText: { fr: string; en: string };
  ctaSecondaryText: { fr: string; en: string };
  ctaLink: string;
  ctaSecondaryLink: string;
  isActive: boolean;
}

/** Valeurs par défaut (repli si la section n'a pas encore de contenu en base). */
const DEFAULTS: HeroSection = {
  title: {
    fr: 'Solutions Digitales pour Votre Entreprise',
    en: 'Digital Solutions for Your Business',
  },
  subtitle: {
    fr: 'Innovation & Excellence Technologique',
    en: 'Innovation & Technological Excellence',
  },
  description: {
    fr: 'Nous concevons et développons des solutions digitales de pointe : applications web, applications mobiles, logiciels desktop, design UI/UX, infrastructure réseau et cybersécurité.',
    en: 'We design and develop cutting-edge digital solutions: web applications, mobile apps, desktop software, UI/UX design, network infrastructure, and cybersecurity.',
  },
  ctaText: { fr: 'Démarrer un Projet', en: 'Start a Project' },
  ctaSecondaryText: { fr: 'Découvrir Nos Services', en: 'Discover Our Services' },
  ctaLink: '/contact',
  ctaSecondaryLink: '/services',
  isActive: true,
};

export default function AdminHeroPage() {
  const t = useTranslations('admin.content.hero');

  // Gestion de la section "hero" du contenu unifié.
  const { token, blocks, loading, saving, error, success, saveAll, value } =
    useSiteContentSection('hero');

  const [hero, setHero] = useState<HeroSection>(DEFAULTS);

  // Synchronise le formulaire avec les blocs chargés depuis le backend.
  useEffect(() => {
    setHero({
      title: { fr: value('title', 'fr', DEFAULTS.title.fr), en: value('title', 'en', DEFAULTS.title.en) },
      subtitle: { fr: value('subtitle', 'fr', DEFAULTS.subtitle.fr), en: value('subtitle', 'en', DEFAULTS.subtitle.en) },
      description: { fr: value('description', 'fr', DEFAULTS.description.fr), en: value('description', 'en', DEFAULTS.description.en) },
      ctaText: { fr: value('ctaText', 'fr', DEFAULTS.ctaText.fr), en: value('ctaText', 'en', DEFAULTS.ctaText.en) },
      ctaSecondaryText: { fr: value('ctaSecondaryText', 'fr', DEFAULTS.ctaSecondaryText.fr), en: value('ctaSecondaryText', 'en', DEFAULTS.ctaSecondaryText.en) },
      ctaLink: value('ctaLink', 'fr', DEFAULTS.ctaLink),
      ctaSecondaryLink: value('ctaSecondaryLink', 'fr', DEFAULTS.ctaSecondaryLink),
      isActive: blocks['isActive'] ? blocks['isActive'].valueFr !== 'false' : DEFAULTS.isActive,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  const handleSave = () => {
    // Chaque champ devient un bloc (hero, clé). Les liens et le drapeau actif
    // sont stockés dans valueFr (contenu non traduit).
    saveAll({
      title: { valueFr: hero.title.fr, valueEn: hero.title.en, contentType: 'text', displayOrder: 1 },
      subtitle: { valueFr: hero.subtitle.fr, valueEn: hero.subtitle.en, contentType: 'text', displayOrder: 2 },
      description: { valueFr: hero.description.fr, valueEn: hero.description.en, contentType: 'text', displayOrder: 3 },
      ctaText: { valueFr: hero.ctaText.fr, valueEn: hero.ctaText.en, contentType: 'text', displayOrder: 4 },
      ctaSecondaryText: { valueFr: hero.ctaSecondaryText.fr, valueEn: hero.ctaSecondaryText.en, contentType: 'text', displayOrder: 5 },
      ctaLink: { valueFr: hero.ctaLink, contentType: 'text', displayOrder: 6 },
      ctaSecondaryLink: { valueFr: hero.ctaSecondaryLink, contentType: 'text', displayOrder: 7 },
      isActive: { valueFr: String(hero.isActive), contentType: 'boolean', displayOrder: 8 },
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
                checked={hero.isActive}
                onChange={(e) => setHero({ ...hero, isActive: e.target.checked })}
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
          Connectez-vous en tant qu&apos;administrateur pour modifier cette section.
        </p>
      )}
      {loading && <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"><span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />Chargement…</p>}

      {/* Formulaire : chaque champ traduit en paire FR / EN côte à côte */}
      <Card>
        <CardHeader className="border-b border-gray-100 dark:border-white/10">
          <CardTitle>{t('sectionSettings')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <BiField
            label={t('titleLabel')}
            fr={<Input value={hero.title.fr} onChange={(e) => setHero({ ...hero, title: { ...hero.title, fr: e.target.value } })} />}
            en={<Input value={hero.title.en} onChange={(e) => setHero({ ...hero, title: { ...hero.title, en: e.target.value } })} />}
          />
          <BiField
            label={t('subtitleLabel')}
            fr={<Input value={hero.subtitle.fr} onChange={(e) => setHero({ ...hero, subtitle: { ...hero.subtitle, fr: e.target.value } })} />}
            en={<Input value={hero.subtitle.en} onChange={(e) => setHero({ ...hero, subtitle: { ...hero.subtitle, en: e.target.value } })} />}
          />
          <BiField
            label={t('description')}
            fr={<Textarea rows={4} value={hero.description.fr} onChange={(e) => setHero({ ...hero, description: { ...hero.description, fr: e.target.value } })} />}
            en={<Textarea rows={4} value={hero.description.en} onChange={(e) => setHero({ ...hero, description: { ...hero.description, en: e.target.value } })} />}
          />
          <BiField
            label={t('ctaText')}
            fr={<Input value={hero.ctaText.fr} onChange={(e) => setHero({ ...hero, ctaText: { ...hero.ctaText, fr: e.target.value } })} />}
            en={<Input value={hero.ctaText.en} onChange={(e) => setHero({ ...hero, ctaText: { ...hero.ctaText, en: e.target.value } })} />}
          />
          <BiField
            label={t('ctaSecondaryText')}
            fr={<Input value={hero.ctaSecondaryText.fr} onChange={(e) => setHero({ ...hero, ctaSecondaryText: { ...hero.ctaSecondaryText, fr: e.target.value } })} />}
            en={<Input value={hero.ctaSecondaryText.en} onChange={(e) => setHero({ ...hero, ctaSecondaryText: { ...hero.ctaSecondaryText, en: e.target.value } })} />}
          />
          <div className="grid gap-6 border-t border-gray-100 pt-6 dark:border-white/10 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t('ctaLink')}</Label>
              <Input value={hero.ctaLink} onChange={(e) => setHero({ ...hero, ctaLink: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{t('ctaSecondaryLink')}</Label>
              <Input value={hero.ctaSecondaryLink} onChange={(e) => setHero({ ...hero, ctaSecondaryLink: e.target.value })} />
            </div>
          </div>
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
