import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';
import { listPublishedPosts, getSectionContent } from '@/services/content.service';

/** Pages statiques du site vitrine (hors blog/services dynamiques). */
const STATIC_PATHS: { path: string; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']; priority: number }[] = [
  { path: '', changeFrequency: 'daily', priority: 1 },
  { path: '/services', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/sms-api', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/about', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/docs', changeFrequency: 'weekly', priority: 0.7 },
  { path: '/faq', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.7 },
  { path: '/sla', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/terms-of-service', changeFrequency: 'monthly', priority: 0.4 },
  { path: '/privacy-policy', changeFrequency: 'monthly', priority: 0.4 },
];

const LOCALES = ['fr', 'en'];

/** Génère une entrée par locale pour un chemin donné. */
function localized(path: string, changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'], priority: number): MetadataRoute.Sitemap {
  return LOCALES.map((loc) => ({
    url: `${SITE_URL}/${loc}${path}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
  ];

  // Pages statiques (par locale).
  for (const s of STATIC_PATHS) {
    entries.push(...localized(s.path, s.changeFrequency, s.priority));
  }

  // Articles de blog réels (résilient : repli silencieux si backend indisponible).
  try {
    const posts = await listPublishedPosts();
    for (const post of posts) {
      if (post.slug) entries.push(...localized(`/blog/${post.slug}`, 'weekly', 0.7));
    }
  } catch {
    /* backend indisponible au build : on garde les pages statiques */
  }

  // Pages détail des services réels (slugs gérés dans l'admin).
  try {
    const blocks = await getSectionContent('services');
    for (const b of blocks) {
      try {
        const slug = b.valueFr ? JSON.parse(b.valueFr).slug : null;
        if (slug) entries.push(...localized(`/services/${slug}`, 'weekly', 0.8));
      } catch {
        /* bloc non JSON */
      }
    }
  } catch {
    /* ignore */
  }

  return entries;
}
