/**
 * Types correspondant aux DTO de contenu exposés par le backend Abdaty.
 * (domaines Blog, Documentation, Paramètres du site)
 *
 * Ces interfaces reflètent les *ResponseDTO Java côté backend.
 */

/** Article de blog (BlogPostResponseDTO). */
export interface BlogPost {
  id: string;
  titleFr: string;
  titleEn: string;
  slug: string;
  excerptFr?: string;
  excerptEn?: string;
  contentFr?: string;
  contentEn?: string;
  authorId?: string;
  category?: string;
  tags?: string[];
  featuredImage?: string;
  status: string; // 'draft' | 'published'
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Charge utile de création / mise à jour d'un article (BlogPostRequestDTO). */
export interface BlogPostInput {
  titleFr: string;
  titleEn: string;
  slug: string;
  excerptFr?: string;
  excerptEn?: string;
  contentFr?: string;
  contentEn?: string;
  authorId?: string;
  category?: string;
  tags?: string[];
  featuredImage?: string;
  status?: string;
}

/** Entrée de documentation (DocumentationResponseDTO). */
export interface DocumentationEntry {
  id: string;
  titleFr: string;
  titleEn: string;
  slug: string;
  contentFr?: string;
  contentEn?: string;
  parentId?: string;
  displayOrder?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Charge utile de création / mise à jour d'une entrée de documentation. */
export interface DocumentationInput {
  titleFr: string;
  titleEn: string;
  slug: string;
  contentFr?: string;
  contentEn?: string;
  parentId?: string;
  displayOrder?: number;
  active?: boolean;
}

/** Paramètre du site (SiteSettingResponseDTO). */
export interface SiteSetting {
  id: string;
  key: string;
  value?: string;
  type?: string;
  category?: string;
  updatedAt?: string;
}

/** Charge utile d'upsert d'un paramètre du site. */
export interface SiteSettingInput {
  key?: string;
  value?: string;
  type?: string;
  category?: string;
}

/* ----------------------- Contenu éditorial unifié ----------------------- */

/** Bloc de contenu éditorial (SiteContentResponseDTO). */
export interface SiteContent {
  id: string;
  section: string;
  contentKey: string;
  valueFr?: string;
  valueEn?: string;
  contentType?: string; // 'text' | 'html' | 'image' | 'json' | 'number' | 'boolean'
  displayOrder?: number;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Charge utile de création / mise à jour d'un bloc de contenu. */
export interface SiteContentInput {
  section: string;
  contentKey: string;
  valueFr?: string;
  valueEn?: string;
  contentType?: string;
  displayOrder?: number;
  active?: boolean;
}

/* ----------------------------- Médias ----------------------------- */

/** Média / fichier uploadé (MediaResponseDTO). */
export interface Media {
  id: string;
  filename: string;
  originalFilename: string;
  fileType?: string;
  fileSize?: number;
  /** URL relative servie par le backend (ex: /uploads/blog/<uuid>.png). */
  url: string;
  thumbnailUrl?: string;
  uploadedBy?: string;
  domain?: string;
  createdAt?: string;
}
