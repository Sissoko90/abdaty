'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminPage, AdminPageHeader } from '@/components/admin/admin-page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Save, MessageSquare, Star, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useLocale } from 'next-intl';
import { useSiteContentSection } from '@/hooks/use-site-content-section';
import type { SiteContent } from '@/types/content';

interface Testimonial {
  id: string;
  clientName: string;
  company: string;
  role: string;
  content: { fr: string; en: string };
  rating: number;
  order: number;
  isActive: boolean;
}

/** Reconstruit un témoignage à partir d'un bloc de contenu (valeurs JSON). */
function parseTestimonial(block: SiteContent): Testimonial {
  let fr: { clientName?: string; company?: string; role?: string; rating?: number; content?: string } = {};
  let en: { content?: string } = {};
  try {
    fr = block.valueFr ? JSON.parse(block.valueFr) : {};
    en = block.valueEn ? JSON.parse(block.valueEn) : {};
  } catch {
    /* JSON invalide */
  }
  return {
    id: block.contentKey,
    clientName: fr.clientName ?? '',
    company: fr.company ?? '',
    role: fr.role ?? '',
    content: { fr: fr.content ?? '', en: en.content ?? '' },
    rating: fr.rating ?? 5,
    order: block.displayOrder ?? 0,
    isActive: block.active ?? true,
  };
}

export default function AdminTestimonialsPage() {
  const t = useTranslations('admin.content.testimonials');
  const locale = useLocale();

  const { token, blocks, loading, saving, error, success, saveAll, remove } =
    useSiteContentSection('testimonials');

  const testimonials = useMemo(
    () => Object.values(blocks).map(parseTestimonial).sort((a, b) => a.order - b.order),
    [blocks]
  );

  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  /** Sérialise un témoignage en bloc et l'upsert. */
  const persist = (item: Testimonial) => {
    const key = item.id || `item-${Date.now()}`;
    return saveAll({
      [key]: {
        valueFr: JSON.stringify({
          clientName: item.clientName,
          company: item.company,
          role: item.role,
          rating: item.rating,
          content: item.content.fr,
        }),
        valueEn: JSON.stringify({ content: item.content.en }),
        contentType: 'json',
        displayOrder: item.order,
        active: item.isActive,
      },
    });
  };

  const handleSave = async () => {
    if (!editingTestimonial) return;
    await persist(editingTestimonial);
    setEditingTestimonial(null);
    setIsCreating(false);
  };

  const handleDelete = (id: string) => {
    if (confirm(t('confirmDelete'))) {
      remove(id);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingTestimonial({
      id: '',
      clientName: '',
      company: '',
      role: '',
      content: { fr: '', en: '' },
      rating: 5,
      order: testimonials.length + 1,
      isActive: true,
    });
    setIsCreating(true);
  };

  const handleToggleActive = (item: Testimonial) => {
    persist({ ...item, isActive: !item.isActive });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-ochre text-ochre' : 'text-gray-300 dark:text-gray-600'}`}
      />
    ));
  };

  return (
    <AdminPage>

      <AdminPageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={MessageSquare}
        actions={
          <>
            <Button onClick={handleCreate} size="lg" className="gap-2" disabled={!token}>
              <Plus className="w-4 h-4" />
              {t('addTestimonial')}
            </Button>
          </>
        }
      />

      {/* Bandeaux d'état */}
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
      {!token && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          Connectez-vous en tant qu&apos;administrateur pour gérer les témoignages.
        </p>
      )}
      {loading && <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"><span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />Chargement…</p>}

      {/* Liste des témoignages (état vide si aucun) */}
      {!loading && testimonials.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center dark:border-white/15 dark:bg-white/[0.02]">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
            <MessageSquare className="h-6 w-6" />
          </span>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('empty')}</p>
          <Button onClick={handleCreate} className="gap-2" disabled={!token}>
            <Plus className="h-4 w-4" />
            {t('addTestimonial')}
          </Button>
        </div>
      )}
      <div className="space-y-4">
        {testimonials.map((testimonial) => (
          <Card key={testimonial.id}>
            <CardHeader className="border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-500/10">
                    <MessageSquare className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <CardTitle>
                      {testimonial.clientName}
                    </CardTitle>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {testimonial.role} • {testimonial.company}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(testimonial)}
                    aria-pressed={testimonial.isActive}
                    className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-colors ${
                      testimonial.isActive
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/10 dark:text-gray-300'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${testimonial.isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                    {testimonial.isActive ? t('active') : t('inactive')}
                  </button>
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(testimonial)} aria-label="Modifier">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(testimonial.id)} aria-label="Supprimer" className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-5">
              <p className="line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                {testimonial.content[locale as keyof typeof testimonial.content]}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit/Create Modal */}
      {editingTestimonial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b border-gray-100 dark:border-white/10">
              <CardTitle>
                {isCreating ? t('createTestimonial') : t('editTestimonial')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('clientName')}</Label>
                  <Input
                    value={editingTestimonial.clientName}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, clientName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('company')}</Label>
                  <Input
                    value={editingTestimonial.company}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, company: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('role')}</Label>
                <Input
                  value={editingTestimonial.role}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">{t('content')}<LangChip lang="FR" /></Label>
                <Textarea
                  value={editingTestimonial.content.fr}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, content: { ...editingTestimonial.content, fr: e.target.value } })}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">{t('content')}<LangChip lang="EN" /></Label>
                <Textarea
                  value={editingTestimonial.content.en}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, content: { ...editingTestimonial.content, en: e.target.value } })}
                  rows={4}
                />
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('rating')}</Label>
                  <select
                    value={editingTestimonial.rating}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, rating: parseInt(e.target.value) })}
                    className="h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-white/15 dark:bg-white/5 dark:text-white"
                  >
                    <option value={1}>1 / 5</option>
                    <option value={2}>2 / 5</option>
                    <option value={3}>3 / 5</option>
                    <option value={4}>4 / 5</option>
                    <option value={5}>5 / 5</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>{t('order')}</Label>
                  <Input
                    type="number"
                    value={editingTestimonial.order}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingTestimonial.isActive}
                  onChange={(e) => setEditingTestimonial({ ...editingTestimonial, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label>{t('active')}</Label>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-6 dark:border-white/10">
                <Button variant="outline" onClick={() => setEditingTestimonial(null)}>
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
