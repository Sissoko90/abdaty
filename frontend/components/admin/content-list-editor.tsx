'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Save, AlertCircle, CheckCircle2, Upload, X, Eye, EyeOff } from 'lucide-react';
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
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-900 dark:text-white">{heading}</CardTitle>
          <Button
            size="sm"
            className="gap-2"
            disabled={!token}
            onClick={() => {
              setEditing(emptyItem());
              setIsCreating(true);
            }}
          >
            <Plus className="w-4 h-4" />
            {addLabel ?? 'Ajouter'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
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

        {/* Liste des items */}
        <div className="space-y-2">
          {items.map((it) => (
            <div
              key={it.id}
              className={`flex items-center justify-between p-3 border rounded-lg dark:border-gray-700 ${it.active ? '' : 'opacity-60'}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{itemLabel(it)}</span>
                {!it.active && (
                  <span className="shrink-0 px-2 py-0.5 rounded-full text-xs bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                    Désactivé
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  title={it.active ? 'Désactiver' : 'Activer'}
                  disabled={saving || !token}
                  onClick={() => toggleActive(it)}
                >
                  {it.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button variant="outline" size="icon" onClick={() => { setEditing(it); setIsCreating(false); }}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleDelete(it.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-gray-500">Aucun élément.</p>}
        </div>

        {/* Formulaire d'édition */}
        {editing && (
          <div className="mt-4 p-4 border-2 border-primary-200 dark:border-primary-900 rounded-lg space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">
              {isCreating ? 'Nouvel élément' : 'Modifier l’élément'}
            </h4>
            {uploadError && (
              <div role="alert" className="flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}
            {fields.map((f) => {
              const v = editing.values[f.name];

              // Champ image : aperçu + upload de fichier (URL stockée en base).
              if (f.type === 'image') {
                const url = (v as string) || '';
                return (
                  <div key={f.name}>
                    <Label>{f.label}</Label>
                    <div className="flex items-center gap-3 mt-1">
                      {url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={mediaUrl(url)} alt="" className="h-16 w-16 rounded object-cover border border-gray-200 dark:border-gray-700" />
                      ) : (
                        <div className="h-16 w-16 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-400">—</div>
                      )}
                      <div className="flex-1 flex items-center gap-2">
                        <label className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                          <Upload className="w-4 h-4" />
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
                          <button type="button" onClick={() => setField(f.name, null, '')} className="inline-flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                            <X className="w-3 h-3" /> Retirer
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
                  <div key={f.name}>
                    <Label>{f.label}</Label>
                    <select
                      value={(v as string) || ''}
                      onChange={(e) => setField(f.name, null, e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="">—</option>
                      {(f.options ?? []).map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {f.hint && <p className="text-xs text-gray-500 mt-1">{f.hint}</p>}
                  </div>
                );
              }

              if (f.translated && typeof v === 'object') {
                return (
                  <div key={f.name} className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>{f.label} (FR)</Label>
                      {f.type === 'textarea' ? (
                        <Textarea value={v.fr} onChange={(e) => setField(f.name, 'fr', e.target.value)} rows={3} className="mt-1" />
                      ) : (
                        <Input value={v.fr} onChange={(e) => setField(f.name, 'fr', e.target.value)} className="mt-1" />
                      )}
                    </div>
                    <div>
                      <Label>{f.label} (EN)</Label>
                      {f.type === 'textarea' ? (
                        <Textarea value={v.en} onChange={(e) => setField(f.name, 'en', e.target.value)} rows={3} className="mt-1" />
                      ) : (
                        <Input value={v.en} onChange={(e) => setField(f.name, 'en', e.target.value)} className="mt-1" />
                      )}
                    </div>
                  </div>
                );
              }
              return (
                <div key={f.name}>
                  <Label>{f.label}</Label>
                  <Input
                    value={v as string}
                    onChange={(e) => setField(f.name, null, e.target.value)}
                    placeholder={f.hint}
                    className="mt-1"
                  />
                  {f.hint && <p className="text-xs text-gray-500 mt-1">{f.hint}</p>}
                </div>
              );
            })}
            <div className="grid grid-cols-2 gap-3 items-end">
              <div>
                <Label>Ordre d&apos;affichage</Label>
                <Input
                  type="number"
                  value={editing.order}
                  onChange={(e) => setEditing({ ...editing, order: parseInt(e.target.value) || 0 })}
                  className="mt-1"
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer pb-2">
                <input
                  type="checkbox"
                  checked={editing.active}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                  className="rounded"
                />
                Actif (visible sur le site)
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
              <Button onClick={handleSave} className="gap-2" disabled={saving || !token}>
                <Save className="w-4 h-4" />
                {saving ? '…' : 'Enregistrer'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
