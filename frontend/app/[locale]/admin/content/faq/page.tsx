'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Plus, Save, Trash2, HelpCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
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
  const tBreadcrumb = useTranslations('admin.breadcrumb');

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
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: tBreadcrumb('dashboard'), href: `/admin` },
            { label: tBreadcrumb('admin'), href: `/admin` },
            { label: t('title') },
          ]}
        />

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
            {t('addQuestion')}
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
            Connectez-vous en tant qu&apos;administrateur pour gérer la FAQ.
          </p>
        )}
        {loading && <p className="text-sm text-gray-500 mb-4">Chargement…</p>}

        {/* Liste des FAQ */}
        <div className="grid gap-4 mb-8">
          {faqItems.map((item) => (
            <Card key={item.id} className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <HelpCircle className="w-5 h-5 text-blue-600" />
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {item.question.fr}
                      </h3>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {item.answer.fr}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-500">Catégorie: {item.category}</span>
                      <span className="text-gray-500">Ordre: {item.order}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={item.isActive} onCheckedChange={() => toggleActive(item)} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingItem(item);
                        setIsCreating(false);
                      }}
                    >
                      {t('edit')}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Modale d'édition (overlay centré) */}
        {editingItem && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle>{isCreating ? t('createQuestion') : t('editQuestion')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('question')} (Français)</Label>
                  <Input
                    value={editingItem.question.fr}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        question: { ...editingItem.question, fr: e.target.value },
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t('question')} (English)</Label>
                  <Input
                    value={editingItem.question.en}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        question: { ...editingItem.question, en: e.target.value },
                      })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('answer')} (Français)</Label>
                  <Textarea
                    value={editingItem.answer.fr}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        answer: { ...editingItem.answer, fr: e.target.value },
                      })
                    }
                    rows={4}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t('answer')} (English)</Label>
                  <Textarea
                    value={editingItem.answer.en}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        answer: { ...editingItem.answer, en: e.target.value },
                      })
                    }
                    rows={4}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('category')}</Label>
                  <Input
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t('order')}</Label>
                  <Input
                    type="number"
                    value={editingItem.order}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, order: parseInt(e.target.value) || 0 })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingItem(null)}>
                  {t('cancel')}
                </Button>
                <Button onClick={handleSave} className="gap-2" disabled={saving || !token}>
                  <Save className="w-4 h-4" />
                  {saving ? '…' : t('save')}
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
