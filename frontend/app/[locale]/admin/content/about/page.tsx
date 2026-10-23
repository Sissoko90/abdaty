'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminPage, AdminPageHeader } from '@/components/admin/admin-page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    <AdminPage>

      <AdminPageHeader
        title={t('title')}
        description={<>Gérez l&apos;ensemble des sections de la page « À propos ».</>}
        icon={Users}
      />

      {!token && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          Connectez-vous en tant qu&apos;administrateur pour modifier cette page.
        </p>
      )}

      <div className="space-y-6">
        {/* Section principale + Mission/Vision (champs blocs) */}
        <Card>
          <CardHeader className="border-b border-gray-100 dark:border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>En-tête & Mission / Vision</CardTitle>
              <Button onClick={saveBlocks} className="gap-2" disabled={saving || !token}>
                <Save className="w-4 h-4" />
                {saving ? '…' : 'Enregistrer'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
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

            {(['title', 'subtitle'] as const).map((k) => (
              <div key={k} className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">{k === 'title' ? 'Titre' : 'Sous-titre'}<LangChip lang="FR" /></Label>
                  <Input value={about[k].fr} onChange={(e) => setAbout({ ...about, [k]: { ...about[k], fr: e.target.value } })} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">{k === 'title' ? 'Titre' : 'Sous-titre'}<LangChip lang="EN" /></Label>
                  <Input value={about[k].en} onChange={(e) => setAbout({ ...about, [k]: { ...about[k], en: e.target.value } })} />
                </div>
              </div>
            ))}

            {(['description', 'mission', 'vision'] as const).map((k) => (
              <div key={k} className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">{k === 'description' ? 'Description' : k === 'mission' ? 'Mission' : 'Vision'}<LangChip lang="FR" /></Label>
                  <Textarea value={about[k].fr} onChange={(e) => setAbout({ ...about, [k]: { ...about[k], fr: e.target.value } })} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">{k === 'description' ? 'Description' : k === 'mission' ? 'Mission' : 'Vision'}<LangChip lang="EN" /></Label>
                  <Textarea value={about[k].en} onChange={(e) => setAbout({ ...about, [k]: { ...about[k], en: e.target.value } })} rows={3} />
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
