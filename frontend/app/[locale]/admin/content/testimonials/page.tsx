'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2, Save, MessageSquare, Star, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
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
  const tBreadcrumb = useTranslations('admin.breadcrumb');
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
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
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
            {t('addTestimonial')}
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
            Connectez-vous en tant qu&apos;administrateur pour gérer les témoignages.
          </p>
        )}
        {loading && <p className="text-sm text-gray-500 mb-4">Chargement…</p>}

        {/* Testimonials List */}
        <div className="space-y-4">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="dark:bg-gray-800 dark:border-gray-700 border border-gray-200 transition-colors duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-900 dark:text-white transition-colors duration-300">
                        {testimonial.clientName}
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                        {testimonial.role} • {testimonial.company}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {renderStars(testimonial.rating)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={testimonial.isActive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleActive(testimonial)}
                    >
                      {testimonial.isActive ? t('active') : t('inactive')}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleEdit(testimonial)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(testimonial.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  {testimonial.content[locale as keyof typeof testimonial.content]}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit/Create Modal */}
        {editingTestimonial && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700 border border-gray-200 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white transition-colors duration-300">
                  {isCreating ? t('createTestimonial') : t('editTestimonial')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('clientName')}</Label>
                    <Input
                      value={editingTestimonial.clientName}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, clientName: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>{t('company')}</Label>
                    <Input
                      value={editingTestimonial.company}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, company: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>{t('role')}</Label>
                  <Input
                    value={editingTestimonial.role}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, role: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>{t('content')} (Français)</Label>
                  <Textarea
                    value={editingTestimonial.content.fr}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, content: { ...editingTestimonial.content, fr: e.target.value } })}
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <div>
                  <Label>{t('content')} (English)</Label>
                  <Textarea
                    value={editingTestimonial.content.en}
                    onChange={(e) => setEditingTestimonial({ ...editingTestimonial, content: { ...editingTestimonial.content, en: e.target.value } })}
                    className="mt-1"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('rating')}</Label>
                    <select
                      value={editingTestimonial.rating}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, rating: parseInt(e.target.value) })}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                    >
                      <option value={1}>1 ⭐</option>
                      <option value={2}>2 ⭐⭐</option>
                      <option value={3}>3 ⭐⭐⭐</option>
                      <option value={4}>4 ⭐⭐⭐⭐</option>
                      <option value={5}>5 ⭐⭐⭐⭐⭐</option>
                    </select>
                  </div>
                  <div>
                    <Label>{t('order')}</Label>
                    <Input
                      type="number"
                      value={editingTestimonial.order}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, order: parseInt(e.target.value) || 0 })}
                      className="mt-1"
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

                <div className="flex justify-end gap-2 pt-4">
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
      </div>
    </div>
  );
}
