'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AdminPage, AdminPageHeader } from '@/components/admin/admin-page';
import { LangChip } from '@/components/admin/content-list-editor';
import { Plus, Save, Trash2, HelpCircle, AlertCircle, CheckCircle2, Pencil, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useSiteContentSection } from '@/hooks/use-site-content-section';
import type { SiteContent } from '@/types/content';

interface FAQItem {
  id: string;
  question: { fr: string; en: string };
  answer: { fr: string; en: string };
  category: string;
  order: number;
  isActive: boolean;
}

/** Reconstruit un item FAQ à partir d'un bloc de contenu (valeurs JSON). */
function parseItem(block: SiteContent): FAQItem {
  let fr: { question?: string; answer?: string; category?: string } = {};
  let en: { question?: string; answer?: string } = {};
  try {
    fr = block.valueFr ? JSON.parse(block.valueFr) : {};
    en = block.valueEn ? JSON.parse(block.valueEn) : {};
  } catch {
    /* JSON invalide : item vide */
  }
  return {
    id: block.contentKey,
    question: { fr: fr.question ?? '', en: en.question ?? '' },
    answer: { fr: fr.answer ?? '', en: en.answer ?? '' },
    category: fr.category ?? 'general',
    order: block.displayOrder ?? 0,
    isActive: block.active ?? true,
  };
}

export default function AdminFAQPage() {
  const t = useTranslations('admin.content.faq');

  const { token, blocks, loading, saving, error, success, saveAll, remove } =
    useSiteContentSection('faq');

  // La liste affichée dérive directement des blocs chargés.
  const faqItems = useMemo(
    () => Object.values(blocks).map(parseItem).sort((a, b) => a.order - b.order),
    [blocks]
  );

  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = () => {
    setEditingItem({
      id: '',
      question: { fr: '', en: '' },
      answer: { fr: '', en: '' },
      category: 'general',
      order: faqItems.length + 1,
      isActive: true,
    });
    setIsCreating(true);
  };

  /** Sérialise un item en bloc (clé = id) et l'upsert. */
  const persist = (item: FAQItem) => {
    const key = item.id || `item-${Date.now()}`;
    return saveAll({
      [key]: {
        valueFr: JSON.stringify({ question: item.question.fr, answer: item.answer.fr, category: item.category }),
        valueEn: JSON.stringify({ question: item.question.en, answer: item.answer.en }),
        contentType: 'json',
        displayOrder: item.order,
        active: item.isActive,
      },
    });
  };

  const handleSave = async () => {
    if (!editingItem) return;
    await persist(editingItem);
    setEditingItem(null);
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('confirmDelete'))) {
      remove(id);
    }
  };

  const toggleActive = (item: FAQItem) => {
    persist({ ...item, isActive: !item.isActive });
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={HelpCircle}
        actions={
          <Button onClick={handleCreate} className="gap-2" disabled={!token}>
            <Plus className="h-4 w-4" />
            {t('addQuestion')}
          </Button>
        }
      />

      {/* Bandeaux d'état */}
      {(error || success || !token || loading) && (
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
          {!token && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Connectez-vous en tant qu&apos;administrateur pour gérer la FAQ.
            </p>
          )}
          {loading && (
            <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-500 border-t-transparent" />
              Chargement…
            </p>
          )}
        </div>
      )}

      {/* Liste des FAQ */}
      {faqItems.length === 0 && !loading ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center dark:border-white/15 dark:bg-white/[0.02]">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
            <HelpCircle className="h-6 w-6" />
          </span>
          <p className="text-sm text-gray-600 dark:text-gray-400">Aucune question pour le moment.</p>
          <Button variant="outline" size="sm" onClick={handleCreate} className="gap-2" disabled={!token}>
            <Plus className="h-4 w-4" />
            {t('addQuestion')}
          </Button>
        </div>
      ) : (
        <ul className="space-y-3">
          {faqItems.map((item) => (
            <li
              key={item.id}
              className={`rounded-2xl border border-gray-200 bg-white p-5 transition-colors hover:border-gray-300 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-white/20 sm:p-6 ${
                item.isActive ? '' : 'opacity-60'
              }`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">{item.category}</Badge>
                    <span className="text-xs text-gray-500 dark:text-gray-400">Ordre {item.order}</span>
                    {!item.isActive && <Badge variant="outline">Désactivé</Badge>}
                  </div>
                  <h3 className="font-semibold text-ink dark:text-white">{item.question.fr}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-gray-600 dark:text-gray-400">{item.answer.fr}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Switch
                    checked={item.isActive}
                    onCheckedChange={() => toggleActive(item)}
                    aria-label={item.isActive ? 'Désactiver' : 'Activer'}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => {
                      setEditingItem(item);
                      setIsCreating(false);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                    {t('edit')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Supprimer"
                    title="Supprimer"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modale d'édition (overlay centré) */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
          <Card className="max-h-[90vh] w-full max-w-3xl overflow-y-auto bg-white shadow-2xl dark:bg-[#121c2e]">
            <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0 border-b border-gray-100 dark:border-white/10">
              <CardTitle className="text-lg">{isCreating ? t('createQuestion') : t('editQuestion')}</CardTitle>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                aria-label={t('cancel')}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-ink dark:hover:bg-white/10 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                {(['fr', 'en'] as const).map((lang) => (
                  <div key={lang} className="space-y-2">
                    <Label className="flex items-center gap-2">
                      {t('question')}
                      <LangChip lang={lang} />
                    </Label>
                    <Input
                      value={editingItem.question[lang]}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          question: { ...editingItem.question, [lang]: e.target.value },
                        })
                      }
                    />
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {(['fr', 'en'] as const).map((lang) => (
                  <div key={lang} className="space-y-2">
                    <Label className="flex items-center gap-2">
                      {t('answer')}
                      <LangChip lang={lang} />
                    </Label>
                    <Textarea
                      value={editingItem.answer[lang]}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          answer: { ...editingItem.answer, [lang]: e.target.value },
                        })
                      }
                      rows={5}
                    />
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('category')}</Label>
                  <Input
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('order')}</Label>
                  <Input
                    type="number"
                    value={editingItem.order}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, order: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-5 dark:border-white/10">
                <Button variant="outline" onClick={() => setEditingItem(null)}>
                  {t('cancel')}
                </Button>
                <Button onClick={handleSave} className="gap-2" disabled={saving || !token}>
                  <Save className="h-4 w-4" />
                  {saving ? '…' : t('save')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AdminPage>
  );
}

