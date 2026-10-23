'use client';

import type { Route } from 'next';
import { useTranslations, useLocale } from 'next-intl';
import { Calendar, Clock, ArrowRight, Smartphone, Globe, Lock, Palette, TabletSmartphone, Brain, LucideIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listPublishedPosts, mediaUrl } from '@/services/content.service';
import type { BlogPost } from '@/types/content';
import { BlogCategories } from '@/features/blog/blog-categories';

/**
 * Articles de démonstration (mock).
 * Servent de REPLI lorsque le backend ne renvoie aucun article (table vide)
 * ou qu'il est injoignable, afin que la page reste toujours fonctionnelle.
 */
const mockPosts: Array<{
  id: number;
  slug: string;
  icon: LucideIcon;
  category: string;
  date: string;
  author: string;
  readTime: string;
}> = [
  { id: 1, slug: 'api-sms-mali-guide', icon: Smartphone, category: 'API', date: '2024-05-01', author: 'Abdoulaye Diarra', readTime: '5 min' },
  { id: 2, slug: 'web-development-trends-2024', icon: Globe, category: 'Development', date: '2024-04-28', author: 'Fatoumata Touré', readTime: '8 min' },
  { id: 3, slug: 'cybersecurity-best-practices', icon: Lock, category: 'Security', date: '2024-04-25', author: 'Mamadou Keita', readTime: '10 min' },
  { id: 4, slug: 'ui-ux-design-principles', icon: Palette, category: 'Design', date: '2024-04-22', author: 'Aminata Coulibaly', readTime: '6 min' },
  { id: 5, slug: 'mobile-app-development-flutter', icon: TabletSmartphone, category: 'Mobile', date: '2024-04-20', author: 'Abdoulaye Diarra', readTime: '12 min' },
  { id: 6, slug: 'data-ai-machine-learning', icon: Brain, category: 'AI', date: '2024-04-18', author: 'Fatoumata Touré', readTime: '15 min' },
];

/** Forme normalisée d'un article pour l'affichage (backend OU mock). */
interface DisplayPost {
  key: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  author: string;
  icon: LucideIcon;
  image?: string;
  readTime?: string;
}

/** Associe une catégorie à une icône (icône générique par défaut). */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  API: Smartphone,
  Development: Globe,
  Security: Lock,
  Design: Palette,
  Mobile: TabletSmartphone,
  AI: Brain,
};

export function iconForCategory(category?: string): LucideIcon {
  return (category && CATEGORY_ICONS[category]) || Globe;
}

/** Un identifiant technique (UUID) n'est pas un nom d'auteur affichable. */
export function displayAuthor(author?: string): string {
  if (!author) return '';
  return /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(author) ? '' : author;
}

/** Date lisible dans la langue courante (« 1 mai 2024 »). */
export function formatPostDate(date: string, locale: string): string {
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

// Couvertures de repli (sans image) : encre, rouge primaire, ocre en alternance.
const COVER_STYLES = [
  { bg: 'bg-ink', tile: 'bg-ochre text-ink' },
  { bg: 'bg-primary-600', tile: 'bg-white text-primary-600' },
  { bg: 'bg-ochre', tile: 'bg-ink text-ochre' },
];

/** Couverture d'article : image si disponible, sinon motif bogolan + icône de catégorie. */
export function PostCover({
  image,
  icon: Icon,
  index = 0,
  alt,
  className = '',
}: {
  image?: string;
  icon: LucideIcon;
  index?: number;
  alt: string;
  className?: string;
}) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- image CMS, dimensions inconnues
      <img src={mediaUrl(image)} alt={alt} className={`h-full w-full object-cover ${className}`} />
    );
  }
  const style = COVER_STYLES[index % COVER_STYLES.length];
  return (
    <div className={`bogolan-texture flex h-full w-full items-center justify-center ${style.bg} ${className}`} aria-hidden="true">
      <span className={`flex h-16 w-16 items-center justify-center rounded-2xl ${style.tile}`}>
        <Icon className="h-8 w-8" />
      </span>
    </div>
  );
}

const POSTS_PER_PAGE = 7;

export function BlogGrid() {
  const t = useTranslations('blog.posts');
  const tBlog = useTranslations('blog');
  const locale = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
  const [category, setCategory] = useState<string | null>(null);
  const [backendPosts, setBackendPosts] = useState<BlogPost[] | null>(null);

  // Récupération des articles publiés depuis le backend (lecture publique).
  useEffect(() => {
    let cancelled = false;
    listPublishedPosts()
      .then((posts) => {
        if (!cancelled) setBackendPosts(posts);
      })
      .catch(() => {
        // Backend indisponible : on conserve le repli mock (backendPosts reste null).
        if (!cancelled) setBackendPosts(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Construit la liste affichée : articles du backend si présents, sinon mock.
  const displayPosts: DisplayPost[] =
    backendPosts && backendPosts.length > 0
      ? backendPosts.map((p) => ({
          key: p.id,
          slug: p.slug,
          title: locale === 'fr' ? p.titleFr : p.titleEn,
          excerpt: (locale === 'fr' ? p.excerptFr : p.excerptEn) ?? '',
          category: p.category ?? '',
          date: p.publishedAt ?? p.createdAt ?? '',
          author: displayAuthor(p.authorId),
          icon: iconForCategory(p.category),
          image: p.featuredImage,
        }))
      : mockPosts.map((p) => ({
          key: String(p.id),
          slug: p.slug,
          title: t(`${p.slug}.title`),
          excerpt: t(`${p.slug}.excerpt`),
          category: p.category,
          date: p.date,
          author: p.author,
          icon: p.icon,
          readTime: p.readTime,
        }));

  // Catégories réellement présentes dans les articles (filtre côté client).
  const categories = Array.from(new Set(displayPosts.map((p) => p.category).filter(Boolean)));
  const filtered = category ? displayPosts.filter((p) => p.category === category) : displayPosts;

  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const page = Math.min(currentPage, totalPages);
  const startIndex = (page - 1) * POSTS_PER_PAGE;
  const currentPosts = filtered.slice(startIndex, startIndex + POSTS_PER_PAGE);
  // L'article le plus récent est mis en avant sur la première page.
  const [featured, ...others] = page === 1 ? currentPosts : [undefined, ...currentPosts];

  const selectCategory = (value: string | null) => {
    setCategory(value);
    setCurrentPage(1);
  };

  const categoryLabel = (value: string) => {
    const key = `categories.${value.toLowerCase()}`;
    return tBlog.has(key) ? tBlog(key) : value;
  };

  const href = (post: DisplayPost) => `/${locale}/blog/${post.slug}` as Route;

  const meta = (post: DisplayPost) => (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
      {post.date && (
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {formatPostDate(post.date, locale)}
        </span>
      )}
      {post.readTime && (
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {tBlog('ui.readTime', { time: post.readTime })}
        </span>
      )}
    </div>
  );

  const chip = (post: DisplayPost) =>
    post.category ? (
      <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
        {categoryLabel(post.category)}
      </span>
    ) : null;

  return (
    <div>
      {categories.length > 1 && (
        <BlogCategories
          categories={categories.map((c) => ({ value: c, label: categoryLabel(c) }))}
          active={category}
          onSelect={selectCategory}
        />
      )}

      {featured && (
        <Link href={href(featured)} className="group mb-8 block">
          <article className="grid overflow-hidden rounded-3xl border border-gray-200 bg-white transition-shadow group-hover:shadow-xl group-hover:shadow-ink/5 dark:border-white/10 dark:bg-white/[0.03] lg:grid-cols-12">
            <div className="aspect-[16/9] overflow-hidden lg:col-span-7 lg:aspect-auto lg:min-h-[360px]">
              <PostCover image={featured.image} icon={featured.icon} index={0} alt={featured.title} className="transition-transform duration-500 group-hover:scale-[1.03]" />
            </div>
            <div className="flex flex-col p-8 lg:col-span-5 lg:p-10">
              <div className="mb-5 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-ochre px-3 py-1 text-xs font-semibold text-ink">{tBlog('ui.featured')}</span>
                {chip(featured)}
              </div>
              <h2 className="mb-4 text-3xl font-bold leading-tight text-ink transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400 md:text-4xl">
                {featured.title}
              </h2>
              <p className="mb-6 line-clamp-3 text-lg leading-relaxed text-gray-600 dark:text-gray-300">{featured.excerpt}</p>
              <div className="mt-auto space-y-5">
                {meta(featured)}
                <span className="inline-flex items-center gap-2 font-semibold text-primary-600 dark:text-primary-400">
                  {tBlog('ui.readMore')}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </article>
        </Link>
      )}

      {others.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {others.map((post, i) =>
            post ? (
              <Link key={post.key} href={href(post)} className="group block">
                <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 group-hover:-translate-y-1 group-hover:border-primary-300 group-hover:shadow-xl group-hover:shadow-primary-600/5 dark:border-white/10 dark:bg-white/[0.03] dark:group-hover:border-primary-500/40">
                  <div className="aspect-[16/10] overflow-hidden">
                    <PostCover image={post.image} icon={post.icon} index={i + 1} alt={post.title} className="transition-transform duration-500 group-hover:scale-[1.04]" />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-3">{chip(post)}</div>
                    <h3 className="mb-3 text-xl font-bold leading-snug text-ink transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
                      {post.title}
                    </h3>
                    <p className="mb-5 line-clamp-2 text-gray-600 dark:text-gray-400">{post.excerpt}</p>
                    <div className="mt-auto">{meta(post)}</div>
                  </div>
                </article>
              </Link>
            ) : null
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-14 flex items-center justify-center gap-2" aria-label="Pagination">
          <button
            type="button"
            onClick={() => setCurrentPage(Math.max(page - 1, 1))}
            disabled={page === 1}
            aria-label={tBlog('ui.prevPage')}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-ink transition-colors hover:border-primary-500 hover:text-primary-600 disabled:pointer-events-none disabled:opacity-40 dark:border-white/15 dark:bg-transparent dark:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setCurrentPage(p)}
              aria-label={tBlog('ui.page', { page: p })}
              aria-current={page === p ? 'page' : undefined}
              className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                page === p
                  ? 'bg-ink text-white dark:bg-white dark:text-ink'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCurrentPage(Math.min(page + 1, totalPages))}
            disabled={page === totalPages}
            aria-label={tBlog('ui.nextPage')}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-ink transition-colors hover:border-primary-500 hover:text-primary-600 disabled:pointer-events-none disabled:opacity-40 dark:border-white/15 dark:bg-transparent dark:text-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </nav>
      )}
    </div>
  );
}
