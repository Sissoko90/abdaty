'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Layers, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
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
  const tBreadcrumb = useTranslations('admin.breadcrumb');

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
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: tBreadcrumb('dashboard'), href: '/admin' },
            { label: tBreadcrumb('admin'), href: '/admin' },
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
              checked={hero.isActive}
              onChange={(e) => setHero({ ...hero, isActive: e.target.checked })}
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
            Connectez-vous en tant qu&apos;administrateur pour modifier cette section.
          </p>
        )}
        {loading && <p className="text-sm text-gray-500 mb-4">Chargement…</p>}

        {/* Hero Section Form */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 border border-gray-200 transition-colors duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white transition-colors duration-300">
              <Layers className="w-5 h-5" />
              {t('sectionSettings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>{t('titleLabel')} (Français)</Label>
              <Input
                value={hero.title.fr}
                onChange={(e) => setHero({ ...hero, title: { ...hero.title, fr: e.target.value } })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t('titleLabel')} (English)</Label>
              <Input
                value={hero.title.en}
                onChange={(e) => setHero({ ...hero, title: { ...hero.title, en: e.target.value } })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t('subtitleLabel')} (Français)</Label>
              <Input
                value={hero.subtitle.fr}
                onChange={(e) => setHero({ ...hero, subtitle: { ...hero.subtitle, fr: e.target.value } })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t('subtitleLabel')} (English)</Label>
              <Input
                value={hero.subtitle.en}
                onChange={(e) => setHero({ ...hero, subtitle: { ...hero.subtitle, en: e.target.value } })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>{t('description')} (Français)</Label>
              <Textarea
                value={hero.description.fr}
                onChange={(e) => setHero({ ...hero, description: { ...hero.description, fr: e.target.value } })}
                className="mt-1"
                rows={4}
              />
            </div>
            <div>
              <Label>{t('description')} (English)</Label>
              <Textarea
                value={hero.description.en}
                onChange={(e) => setHero({ ...hero, description: { ...hero.description, en: e.target.value } })}
                className="mt-1"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('ctaText')} (Français)</Label>
                <Input
                  value={hero.ctaText.fr}
                  onChange={(e) => setHero({ ...hero, ctaText: { ...hero.ctaText, fr: e.target.value } })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t('ctaText')} (English)</Label>
                <Input
                  value={hero.ctaText.en}
                  onChange={(e) => setHero({ ...hero, ctaText: { ...hero.ctaText, en: e.target.value } })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('ctaSecondaryText')} (Français)</Label>
                <Input
                  value={hero.ctaSecondaryText.fr}
                  onChange={(e) => setHero({ ...hero, ctaSecondaryText: { ...hero.ctaSecondaryText, fr: e.target.value } })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t('ctaSecondaryText')} (English)</Label>
                <Input
                  value={hero.ctaSecondaryText.en}
                  onChange={(e) => setHero({ ...hero, ctaSecondaryText: { ...hero.ctaSecondaryText, en: e.target.value } })}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>{t('ctaLink')}</Label>
                <Input
                  value={hero.ctaLink}
                  onChange={(e) => setHero({ ...hero, ctaLink: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>{t('ctaSecondaryLink')}</Label>
                <Input
                  value={hero.ctaSecondaryLink}
                  onChange={(e) => setHero({ ...hero, ctaSecondaryLink: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
