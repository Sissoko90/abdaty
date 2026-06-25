/**
 * Service de contenu : pont typé entre le frontend et les endpoints de contenu
 * du backend Abdaty (Blog, Documentation, Paramètres du site).
 *
 * - Les fonctions « publiques » n'exigent pas d'authentification (lecture du
 *   contenu publié) et sont utilisables côté serveur comme côté navigateur.
 * - Les fonctions « admin » exigent l'access token de la session NextAuth, à
 *   passer explicitement (depuis useSession().data.accessToken).
 */

import { api, apiFetch, BACKEND_ORIGIN } from '@/lib/api';
import type {
  BlogPost,
  BlogPostInput,
  DocumentationEntry,
  DocumentationInput,
  SiteSetting,
  SiteSettingInput,
  SiteContent,
  SiteContentInput,
  Media,
} from '@/types/content';

/** Aide : encode un segment de chemin URL. */
const seg = (s: string) => encodeURIComponent(s);

/* ============================ BLOG ============================ */

/** Liste les articles publiés (public). */
export function listPublishedPosts(): Promise<BlogPost[]> {
  return api.get<BlogPost[]>('/blog');
}

/** Liste les articles publiés d'une catégorie (public). */
export function listPublishedPostsByCategory(category: string): Promise<BlogPost[]> {
  return api.get<BlogPost[]>(`/blog/category/${encodeURIComponent(category)}`);
}

/** Récupère un article publié par son slug (public). */
export function getPostBySlug(slug: string): Promise<BlogPost> {
  return api.get<BlogPost>(`/blog/slug/${encodeURIComponent(slug)}`);
}

/** Liste TOUS les articles, brouillons inclus (admin). */
export function listAllPosts(token: string): Promise<BlogPost[]> {
  return api.get<BlogPost[]>('/blog/admin', { token });
}

/** Récupère un article par id (admin). */
export function getPostById(id: string, token: string): Promise<BlogPost> {
  return api.get<BlogPost>(`/blog/admin/${id}`, { token });
}

/** Crée un article (admin). */
export function createPost(input: BlogPostInput, token: string): Promise<BlogPost> {
  return api.post<BlogPost>('/blog', input, { token });
}

/** Met à jour un article (admin). */
export function updatePost(id: string, input: BlogPostInput, token: string): Promise<BlogPost> {
  return api.put<BlogPost>(`/blog/${id}`, input, { token });
}

/** Supprime un article (admin). */
export function deletePost(id: string, token: string): Promise<void> {
  return api.delete<void>(`/blog/${id}`, { token });
}

/** Publie un article (admin). */
export function publishPost(id: string, token: string): Promise<BlogPost> {
  return api.patch<BlogPost>(`/blog/${id}/publish`, undefined, { token });
}

/** Dépublie un article (admin). */
export function unpublishPost(id: string, token: string): Promise<BlogPost> {
  return api.patch<BlogPost>(`/blog/${id}/unpublish`, undefined, { token });
}

/* ========================= DOCUMENTATION ========================= */

/** Liste les entrées de documentation actives (public). */
export function listDocumentation(): Promise<DocumentationEntry[]> {
  return api.get<DocumentationEntry[]>('/documentation');
}

/** Récupère une entrée de documentation par slug (public). */
export function getDocumentationBySlug(slug: string): Promise<DocumentationEntry> {
  return api.get<DocumentationEntry>(`/documentation/slug/${encodeURIComponent(slug)}`);
}

/** Liste toutes les entrées de documentation (admin). */
export function listAllDocumentation(token: string): Promise<DocumentationEntry[]> {
  return api.get<DocumentationEntry[]>('/documentation/admin', { token });
}

/** Crée une entrée de documentation (admin). */
export function createDocumentation(input: DocumentationInput, token: string): Promise<DocumentationEntry> {
  return api.post<DocumentationEntry>('/documentation', input, { token });
}

/** Met à jour une entrée de documentation (admin). */
export function updateDocumentation(id: string, input: DocumentationInput, token: string): Promise<DocumentationEntry> {
  return api.put<DocumentationEntry>(`/documentation/${id}`, input, { token });
}

/** Supprime une entrée de documentation (admin). */
export function deleteDocumentation(id: string, token: string): Promise<void> {
  return api.delete<void>(`/documentation/${id}`, { token });
}

/* ========================= SITE SETTINGS ========================= */

/** Liste tous les paramètres du site (public). */
export function listSettings(): Promise<SiteSetting[]> {
  return api.get<SiteSetting[]>('/site-settings');
}

/** Liste les paramètres d'une catégorie (public). */
export function listSettingsByCategory(category: string): Promise<SiteSetting[]> {
  return api.get<SiteSetting[]>(`/site-settings/category/${encodeURIComponent(category)}`);
}

/** Crée ou met à jour un paramètre par sa clé (admin). */
export function upsertSetting(key: string, input: SiteSettingInput, token: string): Promise<SiteSetting> {
  return api.put<SiteSetting>(`/site-settings/key/${encodeURIComponent(key)}`, input, { token });
}

/** Supprime un paramètre par sa clé (admin). */
export function deleteSetting(key: string, token: string): Promise<void> {
  return api.delete<void>(`/site-settings/key/${encodeURIComponent(key)}`, { token });
}

/* ========================= SITE CONTENT (unifié) ========================= */

/** Récupère les blocs actifs d'une section (public).
 *  `no-store` : on veut toujours le contenu frais (un item ajouté/désactivé
 *  dans l'admin doit se refléter immédiatement, sans cache navigateur). */
export function getSectionContent(section: string): Promise<SiteContent[]> {
  return api.get<SiteContent[]>(`/content/section/${seg(section)}`, { cache: 'no-store' });
}

/** Récupère un bloc de contenu par (section, clé) (public). */
export function getContentItem(section: string, key: string): Promise<SiteContent> {
  return api.get<SiteContent>(`/content/section/${seg(section)}/${seg(key)}`);
}

/** Liste tout le contenu, groupé par section (admin). */
export function listAllContent(token: string): Promise<SiteContent[]> {
  return api.get<SiteContent[]>('/content/admin', { token });
}

/** Liste tous les blocs d'une section, inactifs inclus (admin). */
export function listSectionContent(section: string, token: string): Promise<SiteContent[]> {
  return api.get<SiteContent[]>(`/content/admin/section/${seg(section)}`, { token });
}

/** Crée un bloc de contenu (admin). */
export function createContent(input: SiteContentInput, token: string): Promise<SiteContent> {
  return api.post<SiteContent>('/content', input, { token });
}

/** Met à jour un bloc de contenu par id (admin). */
export function updateContent(id: string, input: SiteContentInput, token: string): Promise<SiteContent> {
  return api.put<SiteContent>(`/content/${id}`, input, { token });
}

/** Crée ou met à jour un bloc identifié par (section, clé) — upsert (admin). */
export function upsertContent(
  section: string,
  key: string,
  input: SiteContentInput,
  token: string
): Promise<SiteContent> {
  return api.put<SiteContent>(`/content/upsert/${seg(section)}/${seg(key)}`, input, { token });
}

/** Supprime un bloc de contenu par id (admin). */
export function deleteContent(id: string, token: string): Promise<void> {
  return api.delete<void>(`/content/${id}`, { token });
}

/* ============================ MÉDIAS ============================ */

/** Liste tous les médias (admin). */
export function listMedia(token: string): Promise<Media[]> {
  return api.get<Media[]>('/media', { token });
}

/** Liste les médias d'un domaine (admin). */
export function listMediaByDomain(domain: string, token: string): Promise<Media[]> {
  return api.get<Media[]>(`/media/domain/${seg(domain)}`, { token });
}

/**
 * Uploade un fichier dans un domaine donné (admin).
 * Le fichier est envoyé en multipart/form-data ; le domaine est passé en query.
 */
export function uploadMedia(
  file: File,
  domain: string,
  token: string,
  userId?: string
): Promise<Media> {
  const form = new FormData();
  form.append('file', file);
  return apiFetch<Media>(`/media/upload?domain=${seg(domain)}`, {
    method: 'POST',
    body: form,
    token,
    userId,
  });
}

/** Supprime un média (admin). */
export function deleteMedia(id: string, token: string): Promise<void> {
  return api.delete<void>(`/media/${id}`, { token });
}

/**
 * Construit l'URL absolue d'un média à partir de son URL relative renvoyée par
 * le backend (ex: "/uploads/blog/x.png" -> "http://localhost:8080/uploads/blog/x.png").
 */
export function mediaUrl(url: string): string {
  if (!url) return url;
  return url.startsWith('http') ? url : `${BACKEND_ORIGIN}${url}`;
}
