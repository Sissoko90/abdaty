'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Save, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSiteContentSection } from '@/hooks/use-site-content-section';
import { ContentListEditor, type FieldDef } from '@/components/admin/content-list-editor';

type Bi = { fr: string; en: string };
interface AboutBlocks {
  title: Bi;
  subtitle: Bi;
  description: Bi;
  mission: Bi;
  vision: Bi;
}

const DEFAULTS: AboutBlocks = {
  title: { fr: "À propos d'Abdaty Technologie", en: 'About Abdaty Technologie' },
  subtitle: { fr: 'Votre Partenaire Technologique de Confiance', en: 'Your Trusted Technology Partner' },
  description: { fr: 'Abdaty Technologie est une entreprise innovante...', en: 'Abdaty Technologie is an innovative company...' },
  mission: { fr: 'Notre mission...', en: 'Our mission...' },
  vision: { fr: 'Notre vision...', en: 'Our vision...' },
};

// Définition des champs de chaque sous-section de type liste.
const STATS_FIELDS: FieldDef[] = [
  { name: 'value', label: 'Valeur', hint: 'ex: 500+' },
  { name: 'label', label: 'Libellé', translated: true },
  { name: 'icon', label: 'Icône', hint: 'Briefcase, Users, Award, Globe' },
];
const VALUES_FIELDS: FieldDef[] = [
  { name: 'icon', label: 'Icône', hint: 'Heart, Lightbulb, Target, Users' },
  { name: 'title', label: 'Titre', translated: true },
  { name: 'description', label: 'Description', type: 'textarea', translated: true },
];
const TIMELINE_FIELDS: FieldDef[] = [
  { name: 'year', label: 'Année', hint: 'ex: 2020' },
  { name: 'title', label: 'Titre', translated: true },
  { name: 'description', label: 'Description', type: 'textarea', translated: true },
];
const TEAM_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Nom' },
  { name: 'role', label: 'Rôle' },
  { name: 'email', label: 'Email' },
  { name: 'linkedin', label: 'LinkedIn (URL)', hint: 'https://linkedin.com/in/...' },
  { name: 'github', label: 'GitHub (URL)', hint: 'https://github.com/...' },
  { name: 'image', label: 'Photo', type: 'image' },
  { name: 'bio', label: 'Bio', type: 'textarea', translated: true },
];
const WHY_FIELDS: FieldDef[] = [
  { name: 'icon', label: 'Icône', hint: 'Award, Users, Zap, Shield, Clock, TrendingUp' },
  { name: 'title', label: 'Titre', translated: true },
  { name: 'description', label: 'Description', type: 'textarea', translated: true },
];
const CERT_FIELDS: FieldDef[] = [
  { name: 'icon', label: 'Icône', hint: 'Shield, Lock, Award, CheckCircle' },
  { name: 'badge', label: 'Badge', hint: 'ex: SSL/TLS' },
  { name: 'title', label: 'Titre', translated: true },
  { name: 'description', label: 'Description', type: 'textarea', translated: true },
];

export default function AdminAboutPage() {
  const t = useTranslations('admin.content.about');
  const tBreadcrumb = useTranslations('admin.breadcrumb');

  // Champs "blocs" de la section about (héro + mission/vision).
  const { token, blocks, saving, error, success, saveAll, value } = useSiteContentSection('about');
  const [about, setAbout] = useState<AboutBlocks>(DEFAULTS);

  useEffect(() => {
    const pair = (key: string, def: Bi) => ({ fr: value(key, 'fr', def.fr), en: value(key, 'en', def.en) });
    setAbout({
      title: pair('title', DEFAULTS.title),
      subtitle: pair('subtitle', DEFAULTS.subtitle),
      description: pair('description', DEFAULTS.description),
      mission: pair('mission', DEFAULTS.mission),
      vision: pair('vision', DEFAULTS.vision),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  const saveBlocks = () => {
    const c = about;
    const block = (v: Bi, order: number) => ({ valueFr: v.fr, valueEn: v.en, contentType: 'text', displayOrder: order });
    saveAll({
      title: block(c.title, 1),
      subtitle: block(c.subtitle, 2),
      description: block(c.description, 3),
      mission: block(c.mission, 4),
      vision: block(c.vision, 5),
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

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300 mt-2">
            Gérez l&apos;ensemble des sections de la page « À propos ».
          </p>
        </div>

        {!token && (
          <p className="text-sm text-gray-500 mb-4">
            Connectez-vous en tant qu&apos;administrateur pour modifier cette page.
          </p>
        )}

        <div className="space-y-6">
          {/* Section principale + Mission/Vision (champs blocs) */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Users className="w-5 h-5" />
                  En-tête & Mission / Vision
                </CardTitle>
                <Button onClick={saveBlocks} className="gap-2" disabled={saving || !token}>
                  <Save className="w-4 h-4" />
                  {saving ? '…' : 'Enregistrer'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div role="alert" className="flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div role="status" className="flex items-center gap-2 rounded-md bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 px-3 py-2 text-sm text-green-700 dark:text-green-300">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {(['title', 'subtitle'] as const).map((k) => (
                <div key={k} className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{k === 'title' ? 'Titre' : 'Sous-titre'} (FR)</Label>
                    <Input value={about[k].fr} onChange={(e) => setAbout({ ...about, [k]: { ...about[k], fr: e.target.value } })} className="mt-1" />
                  </div>
                  <div>
                    <Label>{k === 'title' ? 'Titre' : 'Sous-titre'} (EN)</Label>
                    <Input value={about[k].en} onChange={(e) => setAbout({ ...about, [k]: { ...about[k], en: e.target.value } })} className="mt-1" />
                  </div>
                </div>
              ))}

              {(['description', 'mission', 'vision'] as const).map((k) => (
                <div key={k} className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{k === 'description' ? 'Description' : k === 'mission' ? 'Mission' : 'Vision'} (FR)</Label>
                    <Textarea value={about[k].fr} onChange={(e) => setAbout({ ...about, [k]: { ...about[k], fr: e.target.value } })} rows={3} className="mt-1" />
                  </div>
                  <div>
                    <Label>{k === 'description' ? 'Description' : k === 'mission' ? 'Mission' : 'Vision'} (EN)</Label>
                    <Textarea value={about[k].en} onChange={(e) => setAbout({ ...about, [k]: { ...about[k], en: e.target.value } })} rows={3} className="mt-1" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Sous-sections de type liste */}
          <ContentListEditor section="about-stats" heading="Chiffres clés" fields={STATS_FIELDS} titleField="label" addLabel="Ajouter un chiffre" />
          <ContentListEditor section="about-values" heading="Valeurs" fields={VALUES_FIELDS} titleField="title" addLabel="Ajouter une valeur" />
          <ContentListEditor section="about-timeline" heading="Historique (timeline)" fields={TIMELINE_FIELDS} titleField="title" addLabel="Ajouter une étape" />
          <ContentListEditor section="about-team" heading="Équipe" fields={TEAM_FIELDS} titleField="name" addLabel="Ajouter un membre" />
          <ContentListEditor section="about-why" heading="Pourquoi nous choisir" fields={WHY_FIELDS} titleField="title" addLabel="Ajouter une raison" />
          <ContentListEditor section="about-certifications" heading="Certifications" fields={CERT_FIELDS} titleField="title" addLabel="Ajouter une certification" />
        </div>
      </div>
    </div>
  );
}
