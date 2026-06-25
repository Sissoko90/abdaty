'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Save, BookOpen, AlertCircle } from 'lucide-react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import * as content from '@/services/content.service';
import type { DocumentationEntry, DocumentationInput } from '@/types/content';
import { ApiRequestError } from '@/lib/api';

/** Modèle local de la page (titre/contenu en objets {fr,en}). */
interface DocSection {
  id: string;
  slug: string;
  parentId: string | null;
  order: number;
  title: { fr: string; en: string };
  content: { fr: string; en: string };
  isActive: boolean;
}

/** Convertit une entrée de documentation backend vers le modèle local. */
function toLocal(d: DocumentationEntry): DocSection {
  return {
    id: d.id,
    slug: d.slug,
    parentId: d.parentId ?? null,
    order: d.displayOrder ?? 0,
    title: { fr: d.titleFr, en: d.titleEn },
    content: { fr: d.contentFr ?? '', en: d.contentEn ?? '' },
    isActive: d.active ?? true,
  };
}

/** Convertit le modèle local vers la charge utile backend. */
function toInput(s: DocSection): DocumentationInput {
  return {
    titleFr: s.title.fr,
    titleEn: s.title.en,
    slug: s.slug,
    contentFr: s.content.fr,
    contentEn: s.content.en,
    parentId: s.parentId ?? undefined,
    displayOrder: s.order,
    active: s.isActive,
  };
}

export default function AdminDocsPage() {
  const t = useTranslations('admin.docs');
  const tBreadcrumb = useTranslations('admin.breadcrumb');
  const locale = useLocale();
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [sections, setSections] = useState<DocSection[]>([]);
  const [editingSection, setEditingSection] = useState<DocSection | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /** Recharge la documentation depuis le backend (vue admin = toutes). */
  const reload = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError('');
    content
      .listAllDocumentation(token)
      .then((list) => setSections(list.map(toLocal)))
      .catch((e) => setError(e instanceof ApiRequestError ? e.message : 'Erreur de chargement de la documentation.'))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  const handleSave = async () => {
    if (!token || !editingSection) return;
    setError('');
    try {
      if (isCreating) {
        await content.createDocumentation(toInput(editingSection), token);
      } else {
        await content.updateDocumentation(editingSection.id, toInput(editingSection), token);
      }
      setEditingSection(null);
      setIsCreating(false);
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : "Erreur lors de l'enregistrement.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm(t('confirmDelete'))) return;
    setError('');
    try {
      await content.deleteDocumentation(id, token);
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Erreur lors de la suppression.');
    }
  };

  const handleEdit = (section: DocSection) => {
    setEditingSection(section);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingSection({
      id: '',
      slug: '',
      parentId: null,
      order: sections.length + 1,
      title: { fr: '', en: '' },
      content: { fr: '', en: '' },
      isActive: true,
    });
    setIsCreating(true);
  };

  const handleToggleActive = async (id: string) => {
    if (!token) return;
    const section = sections.find((s) => s.id === id);
    if (!section) return;
    setError('');
    try {
      await content.updateDocumentation(id, toInput({ ...section, isActive: !section.isActive }), token);
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Erreur lors du changement de statut.');
    }
  };

  const rootSections = sections.filter((s) => s.parentId === null).sort((a, b) => a.order - b.order);

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
            {t('addSection')}
          </Button>
        </div>

        {/* Bandeau d'erreur / d'état */}
        {error && (
          <div
            role="alert"
            className="flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300 mb-4"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {!token && (
          <p className="text-sm text-gray-500 mb-4">
            Connectez-vous en tant qu&apos;administrateur pour gérer la documentation.
          </p>
        )}
        {loading && <p className="text-sm text-gray-500 mb-4">Chargement…</p>}

        {/* Sections List */}
        <div className="space-y-4">
          {rootSections.map((section) => (
            <Card key={section.id} className="dark:bg-gray-800 dark:border-gray-700 border border-gray-200 transition-colors duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                      <BookOpen className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-900 dark:text-white transition-colors duration-300">
                        {section.title[locale as keyof typeof section.title]}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                        {section.slug}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={section.isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleActive(section.id)}
                    >
                      {section.isActive ? t('active') : t('inactive')}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleEdit(section)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(section.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300 line-clamp-2">
                  {section.content[locale as keyof typeof section.content]}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit/Create Modal */}
        {editingSection && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700 border border-gray-200 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white transition-colors duration-300">
                  {isCreating ? t('createSection') : t('editSection')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t('slug')}</Label>
                  <Input
                    value={editingSection.slug}
                    onChange={(e) => setEditingSection({ ...editingSection, slug: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('titleLabel')} (Français)</Label>
                    <Input
                      value={editingSection.title.fr}
                      onChange={(e) => setEditingSection({ ...editingSection, title: { ...editingSection.title, fr: e.target.value } })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>{t('titleLabel')} (English)</Label>
                    <Input
                      value={editingSection.title.en}
                      onChange={(e) => setEditingSection({ ...editingSection, title: { ...editingSection.title, en: e.target.value } })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('content')} (Français)</Label>
                    <Textarea
                      value={editingSection.content.fr}
                      onChange={(e) => setEditingSection({ ...editingSection, content: { ...editingSection.content, fr: e.target.value } })}
                      className="mt-1"
                      rows={8}
                    />
                  </div>
                  <div>
                    <Label>{t('content')} (English)</Label>
                    <Textarea
                      value={editingSection.content.en}
                      onChange={(e) => setEditingSection({ ...editingSection, content: { ...editingSection.content, en: e.target.value } })}
                      className="mt-1"
                      rows={8}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('order')}</Label>
                    <Input
                      type="number"
                      value={editingSection.order}
                      onChange={(e) => setEditingSection({ ...editingSection, order: parseInt(e.target.value) || 0 })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>{t('parent')}</Label>
                    <select
                      value={editingSection.parentId || ''}
                      onChange={(e) => setEditingSection({ ...editingSection, parentId: e.target.value || null })}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                    >
                      <option value="">Aucun parent</option>
                      {rootSections
                        .filter((s) => s.id !== editingSection.id)
                        .map((s) => (
                          <option key={s.id} value={s.id}>{s.title[locale as keyof typeof s.title]}</option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editingSection.isActive}
                    onChange={(e) => setEditingSection({ ...editingSection, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label>{t('active')}</Label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setEditingSection(null)}>
                    {t('cancel')}
                  </Button>
                  <Button onClick={handleSave} className="gap-2" disabled={!token}>
                    <Save className="w-4 h-4" />
                    {t('save')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
