'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Save, BookOpen, AlertCircle, X, CornerDownRight } from 'lucide-react';
import { AdminPage, AdminPageHeader } from '@/components/admin/admin-page';
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

/** Petite étiquette de langue pour les paires de champs FR/EN. */
function LangChip({ code }: { code: 'FR' | 'EN' }) {
  return (
    <span className="ml-2 rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-white/10 dark:text-gray-400">
      {code}
    </span>
  );
}

export default function AdminDocsPage() {
  const t = useTranslations('admin.docs');
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
  // Sous-sections affichées sous leur parent (elles n'apparaissaient nulle part auparavant).
  const childrenOf = (id: string) => sections.filter((s) => s.parentId === id).sort((a, b) => a.order - b.order);

  const renderRow = (section: DocSection, child = false) => (
    <div
      key={section.id}
      className={`flex flex-col gap-4 p-4 transition-colors hover:bg-gray-50/70 dark:hover:bg-white/[0.02] sm:flex-row sm:items-center sm:p-5 ${child ? 'bg-paper/60 pl-8 dark:bg-white/[0.01] sm:pl-14' : ''}`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-4">
        {child ? (
          <CornerDownRight className="mt-1 h-4 w-4 shrink-0 text-gray-400" />
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
            <BookOpen className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-gray-500 dark:bg-white/10 dark:text-gray-400">
              {section.order}
            </span>
            <h3 className="truncate font-semibold text-ink dark:text-white">{section.title[locale as keyof typeof section.title]}</h3>
          </div>
          <p className="mt-0.5 font-mono text-xs text-gray-500 dark:text-gray-400">/{section.slug}</p>
          <p className="mt-1 line-clamp-1 text-sm text-gray-600 dark:text-gray-400">
            {section.content[locale as keyof typeof section.content]}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <Switch checked={section.isActive} onCheckedChange={() => handleToggleActive(section.id)} disabled={!token} />
          {section.isActive ? t('active') : t('inactive')}
        </label>
        <Button variant="outline" size="icon" onClick={() => handleEdit(section)} aria-label={t('editSection')}>
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => handleDelete(section.id)}
          aria-label={t('confirmDelete')}
          className="hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <AdminPage>
      <AdminPageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={BookOpen}
        actions={
          <Button onClick={handleCreate} className="gap-2" disabled={!token}>
            <Plus className="h-4 w-4" />
            {t('addSection')}
          </Button>
        }
      />

      {/* Bandeau d'erreur / d'état */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {!token && (
        <p className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-400">
          Connectez-vous en tant qu&apos;administrateur pour gérer la documentation.
        </p>
      )}

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
        {loading && token ? (
          <div className="space-y-3 p-4" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />
            ))}
          </div>
        ) : rootSections.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
              <BookOpen className="h-6 w-6" />
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('noSections')}</p>
            <Button onClick={handleCreate} variant="outline" className="gap-2" disabled={!token}>
              <Plus className="h-4 w-4" />
              {t('addSection')}
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {rootSections.map((section) => (
              <div key={section.id} className="divide-y divide-gray-100 dark:divide-white/5">
                {renderRow(section)}
                {childrenOf(section.id).map((c) => renderRow(c, true))}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Edit/Create Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="doc-editor-title"
            className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-ink/20 dark:border-white/10 dark:bg-[#121c2e]"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-white/10">
              <h2 id="doc-editor-title" className="text-lg font-bold text-ink dark:text-white">
                {isCreating ? t('createSection') : t('editSection')}
              </h2>
              <button
                type="button"
                onClick={() => setEditingSection(null)}
                aria-label={t('cancel')}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2 md:col-span-1">
                  <Label>{t('slug')}</Label>
                  <Input
                    value={editingSection.slug}
                    onChange={(e) => setEditingSection({ ...editingSection, slug: e.target.value })}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('order')}</Label>
                  <Input
                    type="number"
                    value={editingSection.order}
                    onChange={(e) => setEditingSection({ ...editingSection, order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('parent')}</Label>
                  <select
                    value={editingSection.parentId || ''}
                    onChange={(e) => setEditingSection({ ...editingSection, parentId: e.target.value || null })}
                    className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-white/15 dark:bg-white/5 dark:text-white"
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

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('titleLabel')}<LangChip code="FR" /></Label>
                  <Input
                    value={editingSection.title.fr}
                    onChange={(e) => setEditingSection({ ...editingSection, title: { ...editingSection.title, fr: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('titleLabel')}<LangChip code="EN" /></Label>
                  <Input
                    value={editingSection.title.en}
                    onChange={(e) => setEditingSection({ ...editingSection, title: { ...editingSection.title, en: e.target.value } })}
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('content')}<LangChip code="FR" /></Label>
                  <Textarea
                    value={editingSection.content.fr}
                    onChange={(e) => setEditingSection({ ...editingSection, content: { ...editingSection.content, fr: e.target.value } })}
                    rows={10}
                    className="font-mono text-[13px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('content')}<LangChip code="EN" /></Label>
                  <Textarea
                    value={editingSection.content.en}
                    onChange={(e) => setEditingSection({ ...editingSection, content: { ...editingSection.content, en: e.target.value } })}
                    rows={10}
                    className="font-mono text-[13px]"
                  />
                </div>
              </div>

              <label className="flex w-fit cursor-pointer items-center gap-3">
                <Switch
                  checked={editingSection.isActive}
                  onCheckedChange={(checked) => setEditingSection({ ...editingSection, isActive: checked })}
                />
                <span className="text-sm font-medium text-ink dark:text-gray-200">{t('active')}</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 bg-paper px-6 py-4 dark:border-white/10 dark:bg-white/[0.02]">
              <Button variant="outline" onClick={() => setEditingSection(null)}>
                {t('cancel')}
              </Button>
              <Button onClick={handleSave} className="gap-2" disabled={!token}>
                <Save className="h-4 w-4" />
                {t('save')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminPage>
  );
}
