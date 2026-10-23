'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Save, AlertCircle, CheckCircle2, Upload, X, Eye, EyeOff, Inbox, ImageIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useSiteContentSection } from '@/hooks/use-site-content-section';
import { uploadMedia, mediaUrl } from '@/services/content.service';
import type { SiteContent } from '@/types/content';

/** Définition d'un champ éditable d'un item de liste. */
export interface FieldDef {
  /** Clé du champ dans l'objet stocké en JSON. */
  name: string;
  /** Libellé affiché. */
  label: string;
  /** Type de saisie. 'image' = upload de fichier (URL stockée en base). */
  type?: 'text' | 'textarea' | 'image' | 'select';
  /** true = champ traduit (fr/en) ; false/absent = champ partagé (icône, année...). */
  translated?: boolean;
  /** Indication / placeholder (ex: liste d'icônes valides). */
  hint?: string;
  /** Options pour le type 'select'. */
  options?: { value: string; label: string }[];
}

interface Props {
  /** Section de contenu unifié (ex: "about-team"). */
  section: string;
  /** Titre affiché de l'éditeur. */
  heading: string;
  /** Champs éditables. */
  fields: FieldDef[];
  /** Nom du champ servant de titre dans la liste (par défaut le 1er champ traduit). */
  titleField?: string;
  /** Libellé du bouton d'ajout. */
  addLabel?: string;
}

/** Valeur interne d'un champ : objet {fr,en} si traduit, sinon chaîne. */
type FieldValue = string | { fr: string; en: string };
interface EditItem {
  id: string;
  order: number;
  active: boolean;
  values: Record<string, FieldValue>;
}

/**
 * Éditeur générique d'une SECTION de contenu de type LISTE (items `item-*`).
 *
 * Convention de stockage (compatible avec usePublicList côté public) :
 *  - champ traduit  -> valeur fr dans valueFr, valeur en dans valueEn ;
 *  - champ partagé  -> même valeur dans valueFr et valueEn.
 */
export function ContentListEditor({ section, heading, fields, titleField, addLabel }: Props) {
  const { token, blocks, saving, error, success, saveAll, remove } = useSiteContentSection(section);
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');

  const firstTranslated = fields.find((f) => f.translated)?.name ?? fields[0]?.name;
  const labelKey = titleField ?? firstTranslated;

  /** Reconstruit les items éditables depuis les blocs. */
  const items = useMemo<EditItem[]>(() => {
    return Object.values(blocks)
      .filter((b) => b.contentKey.startsWith('item-'))
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
      .map((b: SiteContent) => {
        let fr: Record<string, string> = {};
        let en: Record<string, string> = {};
        try { fr = b.valueFr ? JSON.parse(b.valueFr) : {}; } catch { /* ignore */ }
        try { en = b.valueEn ? JSON.parse(b.valueEn) : {}; } catch { /* ignore */ }
        const values: Record<string, FieldValue> = {};
        fields.forEach((f) => {
          values[f.name] = f.translated
            ? { fr: fr[f.name] ?? '', en: en[f.name] ?? '' }
            : fr[f.name] ?? '';
        });
        return { id: b.contentKey, order: b.displayOrder ?? 0, active: b.active ?? true, values };
      });
  }, [blocks, fields]);

  const [editing, setEditing] = useState<EditItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const emptyItem = (): EditItem => {
    const values: Record<string, FieldValue> = {};
    fields.forEach((f) => {
      values[f.name] = f.translated ? { fr: '', en: '' } : '';
    });
    return { id: '', order: items.length + 1, active: true, values };
  };

  const persist = (item: EditItem) => {
    const key = item.id || `item-${Date.now()}`;
    const valueFr: Record<string, string> = {};
    const valueEn: Record<string, string> = {};
    fields.forEach((f) => {
      const v = item.values[f.name];
      if (f.translated && typeof v === 'object') {
        valueFr[f.name] = v.fr;
        valueEn[f.name] = v.en;
      } else {
        valueFr[f.name] = v as string;
        valueEn[f.name] = v as string;
      }
    });
    return saveAll({
      [key]: {
        valueFr: JSON.stringify(valueFr),
        valueEn: JSON.stringify(valueEn),
        contentType: 'json',
        displayOrder: item.order,
        active: item.active,
      },
    });
  };

  /** Bascule l'état actif/inactif d'un item et persiste immédiatement. */
  const toggleActive = (it: EditItem) => persist({ ...it, active: !it.active });

  const handleSave = async () => {
    if (!editing) return;
    await persist(editing);
    setEditing(null);
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer cet élément ?')) remove(id);
  };

  /** Met à jour un champ de l'item en cours d'édition (mise à jour fonctionnelle). */
  const setField = (name: string, lang: 'fr' | 'en' | null, value: string) => {
    setEditing((prev) => {
      if (!prev) return prev;
      const current = prev.values[name];
      const next = lang && typeof current === 'object' ? { ...current, [lang]: value } : value;
      return { ...prev, values: { ...prev.values, [name]: next } };
    });
  };

  /** Uploade une image et stocke son URL dans le champ ; fichier rangé dans uploads/<section>/. */
  const handleImageUpload = async (fieldName: string, file: File) => {
    if (!token || !userId) return;
    setUploadingField(fieldName);
    setUploadError('');
    try {
      const media = await uploadMedia(file, section, token, userId);
      setField(fieldName, null, media.url);
    } catch {
      setUploadError("Échec de l'upload de l'image.");
    } finally {
      setUploadingField(null);
    }
  };

  const itemLabel = (it: EditItem): string => {
    const v = it.values[labelKey];
    if (typeof v === 'object') return v.fr || v.en || '(sans titre)';
    return (v as string) || '(sans titre)';
  };

  return (
    <Card>
      <CardHeader className="border-b border-gray-100 dark:border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{heading}</CardTitle>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {items.length} {items.length > 1 ? 'éléments' : 'élément'}
            </p>
          </div>
          <Button
            className="gap-2"
            disabled={!token}
            onClick={() => {
              setEditing(emptyItem());
              setIsCreating(true);
            }}
          >
            <Plus className="h-4 w-4" />
            {addLabel ?? 'Ajouter'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        {error && (
          <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Liste des items */}
        <ul className="space-y-2">
          {items.map((it) => (
            <li
              key={it.id}
              className={`flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 transition-colors hover:border-gray-300 dark:border-white/10 dark:bg-white/[0.02] dark:hover:border-white/20 ${
                editing?.id === it.id && !isCreating ? 'ring-2 ring-primary-500' : ''
              } ${it.active ? '' : 'opacity-60'}`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold tabular-nums text-gray-600 dark:bg-white/10 dark:text-gray-300">
                  {it.order}
                </span>
                <span className="truncate text-sm font-medium text-ink dark:text-white">{itemLabel(it)}</span>
                {!it.active && <Badge variant="secondary" className="shrink-0">Désactivé</Badge>}
              </div>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  title={it.active ? 'Désactiver' : 'Activer'}
                  aria-label={it.active ? 'Désactiver' : 'Activer'}
                  disabled={saving || !token}
                  onClick={() => toggleActive(it)}
                >
                  {it.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Modifier"
                  aria-label="Modifier"
                  onClick={() => { setEditing(it); setIsCreating(false); }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  title="Supprimer"
                  aria-label="Supprimer"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10"
                  onClick={() => handleDelete(it.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
        {items.length === 0 && !editing && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center dark:border-white/15">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
              <Inbox className="h-6 w-6" />
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400">Aucun élément pour le moment.</p>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={!token}
              onClick={() => {
                setEditing(emptyItem());
                setIsCreating(true);
              }}
            >
              <Plus className="h-4 w-4" />
              {addLabel ?? 'Ajouter'}
            </Button>
          </div>
        )}

        {/* Formulaire d'édition */}
        {editing && (
          <div className="space-y-5 rounded-2xl border border-primary-200 bg-primary-50/40 p-5 dark:border-primary-500/30 dark:bg-primary-500/5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-base font-bold text-ink dark:text-white">
                {isCreating ? 'Nouvel élément' : 'Modifier l’élément'}
              </h4>
              <button
                type="button"
                onClick={() => setEditing(null)}
                aria-label="Fermer"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-ink dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            {uploadError && (
              <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
            {fields.map((f) => {
              const v = editing.values[f.name];

              // Champ image : aperçu + upload de fichier (URL stockée en base).
              if (f.type === 'image') {
                const url = (v as string) || '';
                return (
                  <div key={f.name} className="space-y-2">
                    <Label>{f.label}</Label>
                    <div className="flex items-center gap-4">
                      {url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mediaUrl(url)} alt="" className="h-16 w-16 rounded-xl border border-gray-200 bg-white object-contain p-1 dark:border-white/10" />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white text-gray-400 dark:border-white/15 dark:bg-white/5">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                      )}
                      <div className="flex flex-1 flex-wrap items-center gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-ink transition-colors hover:bg-gray-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10">
                          <Upload className="h-4 w-4" />
                          {uploadingField === f.name ? 'Upload…' : 'Choisir une image'}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingField === f.name || !token}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleImageUpload(f.name, file);
                            }}
                          />
                        </label>
                        {url && (
                          <button type="button" onClick={() => setField(f.name, null, '')} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
                            <X className="h-3 w-3" /> Retirer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }

              // Champ select : liste déroulante d'options prédéfinies.
              if (f.type === 'select') {
                return (
                  <div key={f.name} className="space-y-2">
                    <Label>{f.label}</Label>
                    <select
                      value={(v as string) || ''}
                      onChange={(e) => setField(f.name, null, e.target.value)}
                      className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-white/15 dark:bg-white/5 dark:text-white"
                    >
                      <option value="">—</option>
                      {(f.options ?? []).map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {f.hint && <p className="text-xs text-gray-500 dark:text-gray-400">{f.hint}</p>}
                  </div>
                );
              }

              if (f.translated && typeof v === 'object') {
                return (
                  <div key={f.name} className="grid gap-4 md:grid-cols-2">
                    {(['fr', 'en'] as const).map((lang) => (
                      <div key={lang} className="space-y-2">
                        <Label className="flex items-center gap-2">
                          {f.label}
                          <LangChip lang={lang} />
                        </Label>
                        {f.type === 'textarea' ? (
                          <Textarea value={v[lang]} onChange={(e) => setField(f.name, lang, e.target.value)} rows={3} />
                        ) : (
                          <Input value={v[lang]} onChange={(e) => setField(f.name, lang, e.target.value)} />
                        )}
                      </div>
                    ))}
                  </div>
                );
              }
              return (
                <div key={f.name} className="space-y-2">
                  <Label>{f.label}</Label>
                  <Input
                    value={v as string}
                    onChange={(e) => setField(f.name, null, e.target.value)}
                    placeholder={f.hint}
                  />
                  {f.hint && <p className="text-xs text-gray-500 dark:text-gray-400">{f.hint}</p>}
                </div>
              );
            })}
            <div className="grid items-end gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Ordre d&apos;affichage</Label>
                <Input
                  type="number"
                  value={editing.order}
                  onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })}
                />
              </div>
              <label className="flex h-11 cursor-pointer items-center gap-3 text-sm font-medium text-ink dark:text-gray-200">
                <Switch
                  checked={editing.active}
                  onCheckedChange={(checked) => setEditing({ ...editing, active: checked })}
                />
                Actif (visible sur le site)
              </label>
            </div>
            <div className="flex justify-end gap-2 border-t border-primary-200/60 pt-4 dark:border-white/10">
              <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
              <Button onClick={handleSave} className="gap-2" disabled={saving || !token}>
                <Save className="h-4 w-4" />
                {saving ? '…' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/** Petite pastille de langue pour les champs bilingues (réutilisée par les pages de contenu). */
export function LangChip({ lang }: { lang: 'fr' | 'en' }) {
  return (
    <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-600 dark:bg-white/10 dark:text-gray-300">
      {lang}
    </span>
  );
}

/**
 * Paire de champs bilingues FR / EN côte à côte (Input ou Textarea).
 * `onChange(lang, valeur)` reçoit la langue modifiée.
 */
export function BilingualField({
  label,
  value,
  onChange,
  multiline = false,
  rows = 3,
}: {
  label: React.ReactNode;
  value: { fr: string; en: string };
  onChange: (lang: 'fr' | 'en', v: string) => void;
  multiline?: boolean;
  rows?: number;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {(['fr', 'en'] as const).map((lang) => (
        <div key={lang} className="space-y-2">
          <Label className="flex items-center gap-2">
            {label}
            <LangChip lang={lang} />
          </Label>
          {multiline ? (
            <Textarea value={value[lang]} onChange={(e) => onChange(lang, e.target.value)} rows={rows} />
          ) : (
            <Input value={value[lang]} onChange={(e) => onChange(lang, e.target.value)} />
          )}
        </div>
      ))}
    </div>
  );
}

/** Carte de section d'un formulaire admin : icône + titre + description, puis contenu. */
export function AdminSectionCard({
  title,
  description,
  icon: Icon,
  actions,
  children,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-gray-100 px-6 py-5 dark:border-white/10">
        <div className="flex items-start gap-3">
          {Icon && (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
              <Icon className="h-5 w-5" />
            </span>
          )}
          <div>
            <h2 className="text-lg font-bold text-ink dark:text-white">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
          </div>
        </div>
        {actions}
      </div>
      <div className="space-y-6 p-6">{children}</div>
    </section>
  );
}

/** Bandeaux d'état communs (erreur, succès, non connecté, chargement). */
export function AdminStatus({
  error,
  success,
  loading,
  signedOut,
  signedOutMessage = 'Connectez-vous en tant qu’administrateur pour modifier cette section.',
}: {
  error?: string | null;
  success?: string | null;
  loading?: boolean;
  signedOut?: boolean;
  signedOutMessage?: React.ReactNode;
}) {
  if (!error && !success && !loading && !signedOut) return null;
  return (
    <div className="space-y-3">
      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {signedOut && <p className="text-sm text-gray-500 dark:text-gray-400">{signedOutMessage}</p>}
      {loading && (
        <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
          Chargement…
        </p>
      )}
    </div>
  );
}
