'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, Smartphone, Globe, Lock, Palette, TabletSmartphone, Brain, LucideIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { listPublishedPosts } from '@/services/content.service';
import type { BlogPost } from '@/types/content';

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

function iconForCategory(category?: string): LucideIcon {
  return (category && CATEGORY_ICONS[category]) || Globe;
}

const POSTS_PER_PAGE = 3;

export function BlogGrid() {
  const t = useTranslations('blog.posts');
  const locale = useLocale();
  const [currentPage, setCurrentPage] = useState(1);
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
          author: p.authorId ?? '',
          icon: iconForCategory(p.category),
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

  const totalPages = Math.ceil(displayPosts.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const currentPosts = displayPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);

  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <>
      <div className="grid md:grid-cols-2 gap-8">
        {currentPosts.map((post, index) => (
          <motion.div
            key={post.key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <Link href={`/${locale}/blog/${post.slug}`}>
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary-200 group cursor-pointer">
                <div className="relative h-48 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                  <post.icon className="w-24 h-24 text-primary-600" />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {post.category && (
                      <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                        {post.category}
                      </span>
                    )}
                    {post.readTime && <span className="text-xs text-gray-500">{post.readTime}</span>}
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 transition-colors">
                    {post.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 transition-colors duration-300">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      {post.author && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{post.author}</span>
                        </div>
                      )}
                      {post.date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(post.date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-primary-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-12">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 transition-colors duration-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size="icon"
                onClick={() => setCurrentPage(page)}
                className={currentPage === page ? 'dark:bg-primary-600 dark:text-white' : 'dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700'}
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 transition-colors duration-300"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </>
  );
}
