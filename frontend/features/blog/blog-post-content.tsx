'use client';

import type { Route } from 'next';
import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Calendar, Clock, ArrowLeft, ArrowRight, Smartphone, Globe, Lock, Palette, TabletSmartphone, Brain, LucideIcon, FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getPostBySlug } from '@/services/content.service';
import { useSanitizedHtml } from '@/hooks/use-sanitized-html';
import type { BlogPost } from '@/types/content';
import { PostCover, displayAuthor, formatPostDate, iconForCategory } from '@/features/blog/blog-grid';

const blogPostsData: Record<string, { icon: LucideIcon; category: string; date: string; author: string; readTime: string }> = {
  'api-sms-mali-guide': {
    icon: Smartphone,
    category: 'API',
    date: '2024-05-01',
    author: 'Abdoulaye Diarra',
    readTime: '5 min',
  },
  'web-development-trends-2024': {
    icon: Globe,
    category: 'Development',
    date: '2024-04-28',
    author: 'Fatoumata Touré',
    readTime: '8 min',
  },
  'cybersecurity-best-practices': {
    icon: Lock,
    category: 'Security',
    date: '2024-04-25',
    author: 'Mamadou Keita',
    readTime: '10 min',
  },
  'ui-ux-design-principles': {
    icon: Palette,
    category: 'Design',
    date: '2024-04-22',
    author: 'Aminata Coulibaly',
    readTime: '6 min',
  },
  'mobile-app-development-flutter': {
    icon: TabletSmartphone,
    category: 'Mobile',
    date: '2024-04-20',
    author: 'Abdoulaye Diarra',
    readTime: '12 min',
  },
  'data-ai-machine-learning': {
    icon: Brain,
    category: 'AI',
    date: '2024-04-18',
    author: 'Fatoumata Touré',
    readTime: '15 min',
  },
};

/**
 * Typographie de lecture (le plugin @tailwindcss/typography n'est pas installé) :
 * appliquée au contenu de l'article, qu'il vienne du CMS (HTML assaini) ou du repli.
 */
const PROSE = [
  '[&_h2]:mt-12 [&_h2]:mb-4 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:text-ink dark:[&_h2]:text-white',
  '[&_h3]:mt-10 [&_h3]:mb-3 [&_h3]:font-display [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-ink dark:[&_h3]:text-white',
  '[&_p]:mb-6 [&_p]:text-lg [&_p]:leading-8 [&_p]:text-gray-700 dark:[&_p]:text-gray-300',
  '[&_ul]:mb-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mb-6 [&_ol]:list-decimal [&_ol]:pl-6',
  '[&_li]:mb-2 [&_li]:pl-1 [&_li]:text-lg [&_li]:leading-8 [&_li]:text-gray-700 dark:[&_li]:text-gray-300 [&_li::marker]:text-primary-600',
  '[&_blockquote]:my-10 [&_blockquote]:border-l-4 [&_blockquote]:border-ochre [&_blockquote]:pl-6 [&_blockquote]:font-display [&_blockquote]:text-2xl [&_blockquote]:font-medium [&_blockquote]:leading-snug [&_blockquote]:text-ink dark:[&_blockquote]:text-white',
  '[&_a]:font-medium [&_a]:text-primary-600 [&_a]:underline [&_a]:underline-offset-4 dark:[&_a]:text-primary-400',
  '[&_img]:my-8 [&_img]:rounded-2xl',
  '[&_pre]:my-8 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:bg-ink [&_pre]:p-6 [&_pre]:text-sm [&_pre]:leading-relaxed [&_pre]:text-gray-100',
  '[&_:not(pre)>code]:rounded-md [&_:not(pre)>code]:bg-gray-100 [&_:not(pre)>code]:px-1.5 [&_:not(pre)>code]:py-0.5 [&_:not(pre)>code]:text-[0.9em] dark:[&_:not(pre)>code]:bg-white/10',
  '[&_strong]:font-semibold [&_strong]:text-ink dark:[&_strong]:text-white',
].join(' ');

/** Initiales d'un nom (« Abdoulaye Diarra » -> « AD »). */
function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('');
}

export function BlogPostContent({ slug }: { slug: string }) {
  const t = useTranslations('blog.posts');
  const tBlog = useTranslations('blog');
  const locale = useLocale();
  const mock = blogPostsData[slug];

  // Article publié dans le CMS (prioritaire) ; repli sur les articles de démonstration.
  const [remote, setRemote] = useState<BlogPost | null>(null);
  const [status, setStatus] = useState<'loading' | 'done'>('loading');
  useEffect(() => {
    let cancelled = false;
    getPostBySlug(slug)
      .then((p) => {
        if (!cancelled) setRemote(p && p.status !== 'draft' ? p : null);
      })
      .catch(() => {
        if (!cancelled) setRemote(null);
      })
      .finally(() => {
        if (!cancelled) setStatus('done');
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const remoteHtml = useSanitizedHtml(remote ? (locale === 'fr' ? remote.contentFr : remote.contentEn) || remote.contentFr : '');

  const post = remote
    ? {
        title: (locale === 'fr' ? remote.titleFr : remote.titleEn) || remote.titleFr,
        excerpt: (locale === 'fr' ? remote.excerptFr : remote.excerptEn) || remote.excerptFr || '',
        category: remote.category ?? '',
        date: remote.publishedAt ?? remote.createdAt ?? '',
        author: displayAuthor(remote.authorId),
        readTime: '',
        icon: iconForCategory(remote.category),
        image: remote.featuredImage,
      }
    : mock
      ? { ...mock, title: t(`${slug}.title`), excerpt: t(`${slug}.excerpt`), image: undefined as string | undefined }
      : null;

  const categoryLabel = (value: string) => {
    const key = `categories.${value.toLowerCase()}`;
    return tBlog.has(key) ? tBlog(key) : value;
  };

  const backLink = (
    <Link
      href={`/${locale}/blog` as Route}
      className="group mb-8 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
    >
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
      {tBlog('ui.backToBlog')}
    </Link>
  );

  if (!post) {
    if (status === 'loading') {
      return (
        <div className="site-container pb-24 pt-36" aria-busy="true">
          <div className="mx-auto max-w-3xl animate-pulse space-y-5 motion-reduce:animate-none">
            <span className="sr-only">{tBlog('ui.loading')}</span>
            <div className="h-6 w-32 rounded-full bg-gray-200 dark:bg-white/10" />
            <div className="h-12 w-full rounded-xl bg-gray-200 dark:bg-white/10" />
            <div className="h-12 w-2/3 rounded-xl bg-gray-200 dark:bg-white/10" />
            <div className="h-5 w-1/2 rounded-full bg-gray-200 dark:bg-white/10" />
          </div>
        </div>
      );
    }
    return (
      <div className="site-container pb-24 pt-36">
        <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-10 text-center dark:border-white/10 dark:bg-white/[0.03]">
          <span className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
            <FileQuestion className="h-7 w-7" />
          </span>
          <h1 className="mb-3 text-3xl font-bold text-ink dark:text-white">{tBlog('ui.notFoundTitle')}</h1>
          <p className="mb-8 text-gray-600 dark:text-gray-400">{tBlog('ui.notFoundText')}</p>
          <Link href={`/${locale}/blog` as Route}>
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {tBlog('ui.backToBlog')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <article>
      {/* En-tête */}
      <header className="bg-white pb-12 pt-32 dark:bg-white/[0.02] lg:pt-40">
        <div className="site-container">
          <div className="mx-auto max-w-3xl">
            {backLink}
            <div className="mb-5 flex flex-wrap items-center gap-3">
              {post.category && (
                <span className="rounded-full bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-700 dark:bg-primary-500/10 dark:text-primary-300">
                  {categoryLabel(post.category)}
                </span>
              )}
              {post.readTime && (
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  {tBlog('ui.readTime', { time: post.readTime })}
                </span>
              )}
            </div>
            <h1 className="mb-6 text-4xl font-extrabold leading-[1.1] text-ink dark:text-white md:text-5xl">{post.title}</h1>
            {post.excerpt && <p className="mb-8 text-xl leading-relaxed text-gray-600 dark:text-gray-300">{post.excerpt}</p>}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-gray-200 pt-6 text-sm text-gray-600 dark:border-white/10 dark:text-gray-400">
              {post.author && (
                <span className="inline-flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-bold text-white dark:bg-white dark:text-ink">
                    {initials(post.author)}
                  </span>
                  <span className="font-semibold text-ink dark:text-white">{post.author}</span>
                </span>
              )}
              {post.date && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatPostDate(post.date, locale)}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>
      <div className="bogolan-band" />

      <div className="site-container py-12 lg:py-16">
        {/* Couverture */}
        <div className="mx-auto mb-12 aspect-[21/9] max-w-5xl overflow-hidden rounded-3xl">
          <PostCover image={post.image} icon={post.icon} alt={post.title} />
        </div>

        {/* Corps */}
        <div className={`mx-auto max-w-3xl ${PROSE}`}>
          {remote ? (
            // HTML du CMS assaini par DOMPurify (useSanitizedHtml) avant injection.
            <div dangerouslySetInnerHTML={{ __html: remoteHtml }} />
          ) : (
            <>
              <h2>Introduction</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>

              <h2>Points Clés</h2>
              <ul>
                <li>Premier point important de l&apos;article</li>
                <li>Deuxième point essentiel à retenir</li>
                <li>Troisième élément crucial</li>
                <li>Quatrième aspect fondamental</li>
              </ul>

              <h2>Développement</h2>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>

              <blockquote>
                Une citation inspirante en rapport avec le sujet de l&apos;article qui apporte une perspective intéressante.
              </blockquote>

              <h2>Conclusion</h2>
              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
              </p>
            </>
          )}
        </div>

        {/* Pied d'article */}
        <div className="mx-auto mt-14 flex max-w-3xl flex-col gap-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03] sm:flex-row sm:items-center sm:justify-between">
          {post.author ? (
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ochre font-bold text-ink">{initials(post.author)}</span>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{tBlog('ui.writtenBy')}</p>
                <p className="font-semibold text-ink dark:text-white">{post.author}</p>
              </div>
            </div>
          ) : (
            <span />
          )}
          <Link href={`/${locale}/blog` as Route}>
            <Button className="group w-full sm:w-auto">
              {tBlog('ui.morePosts')}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
