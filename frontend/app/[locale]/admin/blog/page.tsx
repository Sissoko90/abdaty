'use client';

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
  FileText,
  Search,
  Filter,
  AlertCircle,
} from 'lucide-react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
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

export default function AdminBlogPage() {
  const t = useTranslations('admin.blog');
  const tBreadcrumb = useTranslations('admin.breadcrumb');
  const locale = useLocale();
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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
      post.title[locale as keyof typeof post.title].toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            {t('addPost')}
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
            Connectez-vous en tant qu&apos;administrateur pour gérer les articles.
          </p>
        )}

        {/* Search and Filter */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 border border-gray-200 transition-colors duration-300 mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={t('searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                {t('filter')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Indicateur de chargement */}
        {loading && <p className="text-sm text-gray-500 mb-4">Chargement…</p>}

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="dark:bg-gray-800 dark:border-gray-700 border border-gray-200 transition-colors duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                      <FileText className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <CardTitle className="text-gray-900 dark:text-white transition-colors duration-300">
                        {post.title[locale as keyof typeof post.title]}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {post.author}
                        </span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {post.category}
                        </span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          post.status === 'published'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                        }`}>
                          {post.status === 'published' ? t('published') : t('draft')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStatus(post.id)}
                    >
                      {post.status === 'published' ? t('unpublish') : t('publish')}
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleEdit(post)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(post.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                  {post.excerpt[locale as keyof typeof post.excerpt]}
                </p>
                <div className="flex gap-2 mt-3">
                  {post.tags.map((tag, index) => (
                    <span key={index} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Edit/Create Modal */}
        {editingPost && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700 border border-gray-200 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white transition-colors duration-300">
                  {isCreating ? t('createPost') : t('editPost')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>{t('slug')}</Label>
                  <Input
                    value={editingPost.slug}
                    onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('titleLabel')} (Français)</Label>
                    <Input
                      value={editingPost.title.fr}
                      onChange={(e) => setEditingPost({ ...editingPost, title: { ...editingPost.title, fr: e.target.value } })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>{t('titleLabel')} (English)</Label>
                    <Input
                      value={editingPost.title.en}
                      onChange={(e) => setEditingPost({ ...editingPost, title: { ...editingPost.title, en: e.target.value } })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('excerpt')} (Français)</Label>
                    <Textarea
                      value={editingPost.excerpt.fr}
                      onChange={(e) => setEditingPost({ ...editingPost, excerpt: { ...editingPost.excerpt, fr: e.target.value } })}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>{t('excerpt')} (English)</Label>
                    <Textarea
                      value={editingPost.excerpt.en}
                      onChange={(e) => setEditingPost({ ...editingPost, excerpt: { ...editingPost.excerpt, en: e.target.value } })}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('content')} (Français)</Label>
                    <Textarea
                      value={editingPost.content.fr}
                      onChange={(e) => setEditingPost({ ...editingPost, content: { ...editingPost.content, fr: e.target.value } })}
                      className="mt-1"
                      rows={8}
                    />
                  </div>
                  <div>
                    <Label>{t('content')} (English)</Label>
                    <Textarea
                      value={editingPost.content.en}
                      onChange={(e) => setEditingPost({ ...editingPost, content: { ...editingPost.content, en: e.target.value } })}
                      className="mt-1"
                      rows={8}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('author')}</Label>
                    <Input
                      value={editingPost.author}
                      onChange={(e) => setEditingPost({ ...editingPost, author: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>{t('category')}</Label>
                    <Input
                      value={editingPost.category}
                      onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>{t('tags')} (séparés par des virgules)</Label>
                  <Input
                    value={editingPost.tags.join(', ')}
                    onChange={(e) => setEditingPost({ ...editingPost, tags: e.target.value.split(',').map((t) => t.trim()) })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>{t('status')}</Label>
                  <select
                    value={editingPost.status}
                    onChange={(e) => setEditingPost({ ...editingPost, status: e.target.value as 'draft' | 'published' })}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-colors duration-300"
                  >
                    <option value="draft">{t('draft')}</option>
                    <option value="published">{t('published')}</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setEditingPost(null)}>
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
