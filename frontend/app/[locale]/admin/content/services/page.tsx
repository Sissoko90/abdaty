'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Smartphone,
  Globe,
  Lock,
  Palette,
  TabletSmartphone,
  Brain,
  Shield,
  Server,
  Code,
  Monitor,
  Network,
  Database,
  Cpu,
  Cloud,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { useSiteContentSection } from '@/hooks/use-site-content-section';
import type { SiteContent } from '@/types/content';

/** Valeur de texte traduite (français / anglais). */
type TL = { fr: string; en: string };

interface Service {
  id: string;
  icon: string;
  slug: string;
  title: { fr: string; en: string };
  subtitle: { fr: string; en: string };
  description: { fr: string; en: string };
  features: { fr: string[]; en: string[] };
  // Sous-sections riches de la page détail. Champs partagés (value/icon/name)
  // en chaîne ; champs traduisibles (label/title/description/category) en {fr,en}.
  stats: { value: string; label: TL }[];
  benefits: { icon: string; title: TL; description: TL }[];
  process: { title: TL; description: TL }[];
  technologies: { name: string; category: TL }[];
  isActive: boolean;
  order: number;
}

/** Décrit, par sous-section, les clés partagées et traduisibles (parse/persist). */
const RICH_FIELDS = {
  stats: { shared: ['value'], translated: ['label'] },
  benefits: { shared: ['icon'], translated: ['title', 'description'] },
  process: { shared: [] as string[], translated: ['title', 'description'] },
  technologies: { shared: ['name'], translated: ['category'] },
} as const;

/** Ligne de contenu riche : valeur partagée (string) ou traduite ({fr,en}). */
type RichRow = Record<string, string | { fr: string; en: string }>;

/** Fusionne un tableau FR et son équivalent EN en lignes {champ partagé | {fr,en}}. */
function mergeRichArray(
  frArr: Record<string, string>[] | undefined,
  enArr: Record<string, string>[] | undefined,
  shared: readonly string[],
  translated: readonly string[]
): RichRow[] {
  return (Array.isArray(frArr) ? frArr : []).map((item, i) => {
    const e = (Array.isArray(enArr) ? enArr : [])[i] ?? {};
    const out: RichRow = {};
    shared.forEach((k) => (out[k] = item?.[k] ?? ''));
    translated.forEach((k) => (out[k] = { fr: item?.[k] ?? '', en: e?.[k] ?? '' }));
    return out;
  });
}

/** Sépare un tableau de lignes {fr,en} en deux tableaux (FR / EN) pour le stockage. */
function splitRichArray(
  rows: RichRow[],
  shared: readonly string[],
  translated: readonly string[]
): { fr: Record<string, string>[]; en: Record<string, string>[] } {
  const nonEmpty = rows.filter((r) =>
    [...shared, ...translated].some((k) => {
      const v = r[k];
      return typeof v === 'object' && v ? v.fr || v.en : v;
    })
  );
  const build = (lang: 'fr' | 'en') =>
    nonEmpty.map((r) => {
      const o: Record<string, string> = {};
      shared.forEach((k) => {
        const v = r[k];
        o[k] = typeof v === 'string' ? v : '';
      });
      translated.forEach((k) => {
        const v = r[k];
        o[k] = (typeof v === 'object' && v ? v[lang] : v) ?? '';
      });
      return o;
    });
  return { fr: build('fr'), en: build('en') };
}

/** Génère un slug à partir d'un texte (minuscules, tirets). */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const serviceIcons = {
  Code,
  Smartphone,
  Monitor,
  Palette,
  Network,
  Shield,
  Brain,
  Globe,
  Lock,
  TabletSmartphone,
  Server,
  Database,
  Cpu,
  Cloud,
};

/** Forme du JSON stocké pour un service (valeurs FR/EN parsées). */
interface ParsedService {
  icon?: string;
  slug?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  features?: string[];
  stats?: Record<string, string>[];
  benefits?: Record<string, string>[];
  process?: Record<string, string>[];
  technologies?: Record<string, string>[];
}

/** Reconstruit un service à partir d'un bloc de contenu (valeurs JSON). */
function parseService(block: SiteContent): Service {
  let fr: ParsedService = {};
  let en: ParsedService = {};
  try {
    fr = block.valueFr ? JSON.parse(block.valueFr) : {};
    en = block.valueEn ? JSON.parse(block.valueEn) : {};
  } catch {
    /* JSON invalide */
  }
  return {
    id: block.contentKey,
    icon: fr.icon ?? 'Smartphone',
    slug: fr.slug ?? '',
    title: { fr: fr.title ?? '', en: en.title ?? '' },
    subtitle: { fr: fr.subtitle ?? '', en: en.subtitle ?? '' },
    description: { fr: fr.description ?? '', en: en.description ?? '' },
    features: { fr: fr.features ?? ['', '', '', ''], en: en.features ?? ['', '', '', ''] },
    stats: mergeRichArray(fr.stats, en.stats, RICH_FIELDS.stats.shared, RICH_FIELDS.stats.translated) as Service['stats'],
    benefits: mergeRichArray(fr.benefits, en.benefits, RICH_FIELDS.benefits.shared, RICH_FIELDS.benefits.translated) as Service['benefits'],
    process: mergeRichArray(fr.process, en.process, RICH_FIELDS.process.shared, RICH_FIELDS.process.translated) as Service['process'],
    technologies: mergeRichArray(fr.technologies, en.technologies, RICH_FIELDS.technologies.shared, RICH_FIELDS.technologies.translated) as Service['technologies'],
    isActive: block.active ?? true,
    order: block.displayOrder ?? 0,
  };
}

/** Colonne d'un éditeur de liste (clé + placeholder). */
interface EditorColumn {
  key: string;
  placeholder: string;
  /** true = champ bilingue : deux saisies FR / EN (valeur stockée en {fr,en}). */
  translated?: boolean;
}

/**
 * Éditeur générique d'une liste de lignes (objets clé→valeur), repliable.
 * Utilisé pour les sous-sections riches d'un service (stats, avantages, etc.).
 */
function ArrayEditor({
  label,
  hint,
  items,
  columns,
  onChange,
  newRow,
}: {
  label: string;
  hint?: string;
  items: RichRow[];
  columns: EditorColumn[];
  onChange: (items: RichRow[]) => void;
  newRow: () => RichRow;
}) {
  const [open, setOpen] = useState(false);
  const setCell = (i: number, key: string, value: string | { fr: string; en: string }) =>
    onChange(items.map((r, idx) => (idx === i ? { ...r, [key]: value } : r)));
  return (
    <div className="border-t pt-4 mt-4">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {label} <span className="text-sm font-normal text-gray-500">({items.length})</span>
        </h3>
        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="space-y-3 mt-3">
          {hint && <p className="text-xs text-gray-500">{hint}</p>}
          {items.map((row, i) => (
            <div key={i} className="flex items-start gap-2 border-b border-dashed dark:border-gray-700 pb-3">
              <div className="flex-1 space-y-2">
                {columns.map((c) => {
                  const raw = row[c.key];
                  if (c.translated) {
                    const tv = typeof raw === 'object' && raw ? raw : { fr: '', en: '' };
                    return (
                      <div key={c.key} className="grid grid-cols-2 gap-2">
                        <Input
                          value={tv.fr || ''}
                          placeholder={`${c.placeholder} (FR)`}
                          onChange={(e) => setCell(i, c.key, { ...tv, fr: e.target.value })}
                        />
                        <Input
                          value={tv.en || ''}
                          placeholder={`${c.placeholder} (EN)`}
                          onChange={(e) => setCell(i, c.key, { ...tv, en: e.target.value })}
                        />
                      </div>
                    );
                  }
                  return (
                    <Input
                      key={c.key}
                      value={(typeof raw === 'string' ? raw : '') || ''}
                      placeholder={c.placeholder}
                      onChange={(e) => setCell(i, c.key, e.target.value)}
                    />
                  );
                })}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0"
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" className="gap-1" onClick={() => onChange([...items, newRow()])}>
            <Plus className="w-4 h-4" />
            Ajouter
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AdminServicesPage() {
  const t = useTranslations('admin.content.services');
  const tBreadcrumb = useTranslations('admin.breadcrumb');
  const locale = useLocale();

  const { token, blocks, loading, saving, error, success, saveAll, remove } =
    useSiteContentSection('services');

  const services = useMemo(
    () => Object.values(blocks).map(parseService).sort((a, b) => a.order - b.order),
    [blocks]
  );

  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  /** Sérialise un service en bloc et l'upsert. */
  const persist = (s: Service) => {
    const key = s.id || `item-${Date.now()}`;
    // Le slug pilote l'URL publique (/services/<slug>) et le lien du menu navbar.
    // S'il est vide, on le dérive automatiquement du titre FR pour ne jamais le perdre.
    const slug = s.slug?.trim() || slugify(s.title.fr || s.title.en || key);
    // Sépare chaque sous-section riche en versions FR / EN.
    const stats = splitRichArray(s.stats as RichRow[], RICH_FIELDS.stats.shared, RICH_FIELDS.stats.translated);
    const benefits = splitRichArray(s.benefits as RichRow[], RICH_FIELDS.benefits.shared, RICH_FIELDS.benefits.translated);
    const process = splitRichArray(s.process as RichRow[], RICH_FIELDS.process.shared, RICH_FIELDS.process.translated);
    const technologies = splitRichArray(s.technologies as RichRow[], RICH_FIELDS.technologies.shared, RICH_FIELDS.technologies.translated);
    return saveAll({
      [key]: {
        valueFr: JSON.stringify({
          icon: s.icon,
          slug,
          title: s.title.fr,
          subtitle: s.subtitle.fr,
          description: s.description.fr,
          features: s.features.fr,
          stats: stats.fr,
          benefits: benefits.fr,
          process: process.fr,
          technologies: technologies.fr,
        }),
        valueEn: JSON.stringify({
          title: s.title.en,
          subtitle: s.subtitle.en,
          description: s.description.en,
          features: s.features.en,
          // Tableaux EN complets (champs partagés + texte traduit) pour la
          // fusion par locale côté public.
          stats: stats.en,
          benefits: benefits.en,
          process: process.en,
          technologies: technologies.en,
        }),
        contentType: 'json',
        displayOrder: s.order,
        active: s.isActive,
      },
    });
  };

  const handleToggleActive = (s: Service) => {
    persist({ ...s, isActive: !s.isActive });
  };

  const handleSave = async () => {
    if (!editingService) return;
    await persist(editingService);
    setEditingService(null);
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('confirmDelete'))) {
      remove(id);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingService({
      id: '',
      icon: 'Smartphone',
      slug: '',
      title: { fr: '', en: '' },
      subtitle: { fr: '', en: '' },
      description: { fr: '', en: '' },
      features: { fr: ['', '', '', ''], en: ['', '', '', ''] },
      stats: [],
      benefits: [],
      process: [],
      technologies: [],
      isActive: true,
      order: services.length + 1,
    });
    setIsCreating(true);
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
          <Button onClick={handleCreate} className="gap-2" disabled={!token}>
            <Plus className="w-4 h-4" />
            {t('addService')}
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
            Connectez-vous en tant qu&apos;administrateur pour gérer les services.
          </p>
        )}
        {loading && <p className="text-sm text-gray-500 mb-4">Chargement…</p>}

        {/* Services List */}
        <div className="space-y-4">
          {services.map((service) => (
            <Card key={service.id} className="dark:bg-gray-800 dark:border-gray-700 border border-gray-200 transition-colors duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                      {serviceIcons[service.icon as keyof typeof serviceIcons] &&
                        React.createElement(serviceIcons[service.icon as keyof typeof serviceIcons], { className: 'w-6 h-6 text-primary-600 dark:text-primary-400' })}
                    </div>
                    <div>
                      <CardTitle className="text-gray-900 dark:text-white transition-colors duration-300">
                        {service.title[locale as keyof typeof service.title]}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                        {service.subtitle[locale as keyof typeof service.subtitle]}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={service.isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleActive(service)}
                    >
                      {service.isActive ? t('active') : t('inactive')}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleEdit(service)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(service.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  {service.description[locale as keyof typeof service.description]}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit/Create Modal */}
        {editingService && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700 border border-gray-200 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white transition-colors duration-300">
                  {isCreating ? t('createService') : t('editService')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t('icon')}</Label>
                  <select
                    value={editingService.icon}
                    onChange={(e) => setEditingService({ ...editingService, icon: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                  >
                    {Object.keys(serviceIcons).map((icon) => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Slug (URL)</Label>
                  <Input
                    value={editingService.slug}
                    onChange={(e) => setEditingService({ ...editingService, slug: e.target.value })}
                    className="mt-1"
                    placeholder="ex: reseau-infrastructure"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Identifiant d'URL (/services/&lt;slug&gt;). Laissez vide pour le générer automatiquement depuis le titre.
                  </p>
                </div>

                <div>
                  <Label>{t('titleLabel')} (Français)</Label>
                  <Input
                    value={editingService.title.fr}
                    onChange={(e) => setEditingService({ ...editingService, title: { ...editingService.title, fr: e.target.value } })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>{t('titleLabel')} (English)</Label>
                  <Input
                    value={editingService.title.en}
                    onChange={(e) => setEditingService({ ...editingService, title: { ...editingService.title, en: e.target.value } })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>{t('subtitleLabel')} (Français)</Label>
                  <Input
                    value={editingService.subtitle.fr}
                    onChange={(e) => setEditingService({ ...editingService, subtitle: { ...editingService.subtitle, fr: e.target.value } })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>{t('subtitleLabel')} (English)</Label>
                  <Input
                    value={editingService.subtitle.en}
                    onChange={(e) => setEditingService({ ...editingService, subtitle: { ...editingService.subtitle, en: e.target.value } })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>{t('description')} (Français)</Label>
                  <Textarea
                    value={editingService.description.fr}
                    onChange={(e) => setEditingService({ ...editingService, description: { ...editingService.description, fr: e.target.value } })}
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <div>
                  <Label>{t('description')} (English)</Label>
                  <Textarea
                    value={editingService.description.en}
                    onChange={(e) => setEditingService({ ...editingService, description: { ...editingService.description, en: e.target.value } })}
                    className="mt-1"
                    rows={4}
                  />
                </div>

                {/* Features Section */}
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Features (4 points)</h3>

                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-medium">Features (Français)</Label>
                      <div className="space-y-2 mt-2">
                        {[0, 1, 2, 3].map((index) => (
                          <div key={`fr-${index}`} className="flex items-center gap-2">
                            <span className="text-primary-600">✓</span>
                            <Input
                              value={editingService.features.fr[index] || ''}
                              onChange={(e) => {
                                const newFeatures = [...editingService.features.fr];
                                newFeatures[index] = e.target.value;
                                setEditingService({
                                  ...editingService,
                                  features: { ...editingService.features, fr: newFeatures },
                                });
                              }}
                              placeholder={`Feature ${index + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="text-base font-medium">Features (English)</Label>
                      <div className="space-y-2 mt-2">
                        {[0, 1, 2, 3].map((index) => (
                          <div key={`en-${index}`} className="flex items-center gap-2">
                            <span className="text-primary-600">✓</span>
                            <Input
                              value={editingService.features.en[index] || ''}
                              onChange={(e) => {
                                const newFeatures = [...editingService.features.en];
                                newFeatures[index] = e.target.value;
                                setEditingService({
                                  ...editingService,
                                  features: { ...editingService.features, en: newFeatures },
                                });
                              }}
                              placeholder={`Feature ${index + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sous-sections riches de la page détail (partagées FR/EN) */}
                <ArrayEditor
                  label="Statistiques"
                  hint="Chiffres clés affichés en haut de la page détail (ex: 50+ / Web Apps). Le libellé est bilingue."
                  items={editingService.stats}
                  columns={[
                    { key: 'value', placeholder: 'Valeur (ex: 99.9%)' },
                    { key: 'label', placeholder: 'Libellé', translated: true },
                  ]}
                  newRow={() => ({ value: '', label: { fr: '', en: '' } })}
                  onChange={(items) => setEditingService({ ...editingService, stats: items as Service['stats'] })}
                />

                <ArrayEditor
                  label="Avantages"
                  hint="Cartes « Pourquoi nous choisir ». Icône = nom lucide (ex: Zap, Shield, Users, Layers). Titre et description bilingues."
                  items={editingService.benefits}
                  columns={[
                    { key: 'icon', placeholder: 'Icône (ex: Zap)' },
                    { key: 'title', placeholder: 'Titre', translated: true },
                    { key: 'description', placeholder: 'Description', translated: true },
                  ]}
                  newRow={() => ({ icon: 'Zap', title: { fr: '', en: '' }, description: { fr: '', en: '' } })}
                  onChange={(items) => setEditingService({ ...editingService, benefits: items as Service['benefits'] })}
                />

                <ArrayEditor
                  label="Processus"
                  hint="Étapes de travail (numérotées automatiquement). Titre et description bilingues."
                  items={editingService.process}
                  columns={[
                    { key: 'title', placeholder: 'Titre de l’étape', translated: true },
                    { key: 'description', placeholder: 'Description', translated: true },
                  ]}
                  newRow={() => ({ title: { fr: '', en: '' }, description: { fr: '', en: '' } })}
                  onChange={(items) => setEditingService({ ...editingService, process: items as Service['process'] })}
                />

                <ArrayEditor
                  label="Technologies"
                  hint="Tags de technologies maîtrisées. La catégorie est bilingue."
                  items={editingService.technologies}
                  columns={[
                    { key: 'name', placeholder: 'Nom (ex: React)' },
                    { key: 'category', placeholder: 'Catégorie', translated: true },
                  ]}
                  newRow={() => ({ name: '', category: { fr: '', en: '' } })}
                  onChange={(items) => setEditingService({ ...editingService, technologies: items as Service['technologies'] })}
                />

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={editingService.isActive}
                      onChange={(e) => setEditingService({ ...editingService, isActive: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <Label>{t('active')}</Label>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setEditingService(null)}>
                      {t('cancel')}
                    </Button>
                    <Button onClick={handleSave} className="gap-2" disabled={saving || !token}>
                      <Save className="w-4 h-4" />
                      {saving ? '…' : t('save')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
