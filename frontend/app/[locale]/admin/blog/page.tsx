'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Edit,
  Trash2,
  Save,
  FileText,
  Search,
  AlertCircle,
  CheckCircle2,
  PenLine,
  X,
} from 'lucide-react';
import { AdminPage, AdminPageHeader, AdminStatCard } from '@/components/admin/admin-page';
import { useCallback, useEffect, useState } from 'react';
import { useLocale } from 'next-intl';
import { useSession } from 'next-auth/react';
import * as content from '@/services/content.service';
import type { BlogPost as ApiBlogPost, BlogPostInput } from '@/types/content';
import { ApiRequestError } from '@/lib/api';

/** Modèle local de la page (titres/contenus en objets {fr,en}). */
interface BlogPost {
  id: string;
  slug: string;
  title: { fr: string; en: string };
  excerpt: { fr: string; en: string };
  content: { fr: string; en: string };
  author: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

/** Convertit un article du backend (champs plats) vers le modèle local. */
function toLocal(p: ApiBlogPost): BlogPost {
  return {
    id: p.id,
    slug: p.slug,
    title: { fr: p.titleFr, en: p.titleEn },
    excerpt: { fr: p.excerptFr ?? '', en: p.excerptEn ?? '' },
    content: { fr: p.contentFr ?? '', en: p.contentEn ?? '' },
    author: p.authorId ?? '',
    category: p.category ?? '',
    tags: p.tags ?? [],
    status: p.status === 'published' ? 'published' : 'draft',
    createdAt: p.createdAt ?? '',
    updatedAt: p.updatedAt ?? '',
  };
}

/** Convertit le modèle local vers la charge utile attendue par le backend. */
function toInput(p: BlogPost): BlogPostInput {
  return {
    titleFr: p.title.fr,
    titleEn: p.title.en,
    slug: p.slug,
    excerptFr: p.excerpt.fr,
    excerptEn: p.excerpt.en,
    contentFr: p.content.fr,
    contentEn: p.content.en,
    category: p.category,
    tags: p.tags,
    status: p.status,
  };
}

// Un auteur stocké sous forme d'UUID n'a pas de sens à l'écran.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Petite étiquette de langue pour les paires de champs FR/EN. */
function LangChip({ code }: { code: 'FR' | 'EN' }) {
  return (
    <span className="ml-2 rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 dark:bg-white/10 dark:text-gray-400">
      {code}
    </span>
  );
}

const selectCls =
  'h-11 w-full rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-white/15 dark:bg-white/5 dark:text-white';

export default function AdminBlogPage() {
  const t = useTranslations('admin.blog');
  const locale = useLocale();
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /** Recharge la liste des articles depuis le backend (vue admin = tous). */
  const reload = useCallback(() => {
    if (!token) return;
    setLoading(true);
    setError('');
    content
      .listAllPosts(token)
      .then((list) => setPosts(list.map(toLocal)))
      .catch((e) => setError(e instanceof ApiRequestError ? e.message : 'Erreur de chargement des articles.'))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  const filteredPosts = posts.filter(
    (post) =>
      (statusFilter === 'all' || post.status === statusFilter) &&
      (post.title[locale as keyof typeof post.title].toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const publishedCount = posts.filter((p) => p.status === 'published').length;

  const handleSave = async () => {
    if (!token || !editingPost) return;
    setError('');
    try {
      if (isCreating) {
        await content.createPost(toInput(editingPost), token);
      } else {
        await content.updatePost(editingPost.id, toInput(editingPost), token);
      }
      setEditingPost(null);
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
      await content.deletePost(id, token);
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Erreur lors de la suppression.');
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setEditingPost({
      id: '',
      slug: '',
      title: { fr: '', en: '' },
      excerpt: { fr: '', en: '' },
      content: { fr: '', en: '' },
      author: '',
      category: '',
      tags: [],
      status: 'draft',
      createdAt: '',
      updatedAt: '',
    });
    setIsCreating(true);
  };

  const toggleStatus = async (id: string) => {
    if (!token) return;
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    setError('');
    try {
      if (post.status === 'published') {
        await content.unpublishPost(id, token);
      } else {
        await content.publishPost(id, token);
      }
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Erreur lors du changement de statut.');
    }
  };

  return (
    <AdminPage>
      <AdminPageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={FileText}
        actions={
          <Button onClick={handleCreate} className="gap-2" disabled={!token}>
            <Plus className="h-4 w-4" />
            {t('addPost')}
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
          Connectez-vous en tant qu&apos;administrateur pour gérer les articles.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard label={t('total')} value={posts.length} icon={FileText} tone="ink" />
        <AdminStatCard label={t('published')} value={publishedCount} icon={CheckCircle2} tone="emerald" />
        <AdminStatCard label={t('draft')} value={posts.length - publishedCount} icon={PenLine} tone="ochre" />
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
        {/* Recherche et filtre */}
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 dark:border-white/5 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={t('searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              aria-label={t('searchPlaceholder')}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'published')}
            className={`${selectCls} sm:w-48`}
            aria-label={t('filter')}
          >
            <option value="all">{t('allStatuses')}</option>
            <option value="published">{t('published')}</option>
            <option value="draft">{t('draft')}</option>
          </select>
        </div>

        {loading && token ? (
          <div className="space-y-3 p-4" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
              <FileText className="h-6 w-6" />
            </span>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('noPosts')}</p>
            <Button onClick={handleCreate} variant="outline" className="gap-2" disabled={!token}>
              <Plus className="h-4 w-4" />
              {t('addPost')}
            </Button>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-white/5">
            {filteredPosts.map((post) => (
              <li key={post.id} className="flex flex-col gap-4 p-4 transition-colors hover:bg-gray-50/70 dark:hover:bg-white/[0.02] sm:p-5 lg:flex-row lg:items-center">
                <div className="flex min-w-0 flex-1 items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold text-ink dark:text-white">
                        {post.title[locale as keyof typeof post.title]}
                      </h3>
                      <Badge variant={post.status === 'published' ? 'success' : 'warning'}>
                        {post.status === 'published' ? t('published') : t('draft')}
                      </Badge>
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-gray-600 dark:text-gray-400">
                      {post.excerpt[locale as keyof typeof post.excerpt]}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      {post.category && <span className="font-medium text-gray-700 dark:text-gray-300">{post.category}</span>}
                      {post.author && !UUID_RE.test(post.author) && <span>{post.author}</span>}
                      {post.tags.filter(Boolean).map((tag, index) => (
                        <span key={index} className="rounded-full bg-gray-100 px-2 py-0.5 dark:bg-white/5">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 lg:pl-4">
                  <Button variant="outline" size="sm" onClick={() => toggleStatus(post.id)}>
                    {post.status === 'published' ? t('unpublish') : t('publish')}
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleEdit(post)} aria-label={t('editPost')}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(post.id)}
                    aria-label={t('confirmDelete')}
                    className="hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Edit/Create Modal */}
      {editingPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="blog-editor-title"
            className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-ink/20 dark:border-white/10 dark:bg-[#121c2e]"
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-white/10">
              <h2 id="blog-editor-title" className="text-lg font-bold text-ink dark:text-white">
                {isCreating ? t('createPost') : t('editPost')}
              </h2>
              <button
                type="button"
                onClick={() => setEditingPost(null)}
                aria-label={t('cancel')}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('slug')}</Label>
                  <Input
                    value={editingPost.slug}
                    onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('status')}</Label>
                  <select
                    value={editingPost.status}
                    onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as 'draft' | 'published' })}
                    className={selectCls}
                  >
                    <option value="draft">{t('draft')}</option>
                    <option value="published">{t('published')}</option>
                  </select>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('titleLabel')}<LangChip code="FR" /></Label>
                  <Input
                    value={editingPost.title.fr}
                    onChange={(e) => setEditingPost({ ...editingPost, title: { ...editingPost.title, fr: e.target.value } })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('titleLabel')}<LangChip code="EN" /></Label>
                  <Input
                    value={editingPost.title.en}
                    onChange={(e) => setEditingPost({ ...editingPost, title: { ...editingPost.title, en: e.target.value } })}
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('excerpt')}<LangChip code="FR" /></Label>
                  <Textarea
                    value={editingPost.excerpt.fr}
                    onChange={(e) => setEditingPost({ ...editingPost, excerpt: { ...editingPost.excerpt, fr: e.target.value } })}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('excerpt')}<LangChip code="EN" /></Label>
                  <Textarea
                    value={editingPost.excerpt.en}
                    onChange={(e) => setEditingPost({ ...editingPost, excerpt: { ...editingPost.excerpt, en: e.target.value } })}
                    rows={3}
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>{t('content')}<LangChip code="FR" /></Label>
                  <Textarea
                    value={editingPost.content.fr}
                    onChange={(e) => setEditingPost({ ...editingPost, content: { ...editingPost.content, fr: e.target.value } })}
                    rows={10}
                    className="font-mono text-[13px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('content')}<LangChip code="EN" /></Label>
                  <Textarea
                    value={editingPost.content.en}
                    onChange={(e) => setEditingPost({ ...editingPost, content: { ...editingPost.content, en: e.target.value } })}
                    rows={10}
                    className="font-mono text-[13px]"
                  />
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>{t('author')}</Label>
                  <Input
                    value={editingPost.author}
                    onChange={(e) => setEditingPost({ ...editingPost, author: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('category')}</Label>
                  <Input
                    value={editingPost.category}
                    onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('tags')}</Label>
                  <Input
                    value={editingPost.tags.join(', ')}
                    onChange={(e) => setEditingPost({ ...editingPost, tags: e.target.value.split(',').map((t) => t.trim()) })}
                    placeholder="api, sms, mali"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('tagsHint')}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-gray-100 bg-paper px-6 py-4 dark:border-white/10 dark:bg-white/[0.02]">
              <Button variant="outline" onClick={() => setEditingPost(null)}>
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
