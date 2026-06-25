'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Calendar, User, Clock, ArrowLeft, Smartphone, Globe, Lock, Palette, TabletSmartphone, Brain, LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/ui/breadcrumb';

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

export function BlogPostContent({ slug }: { slug: string }) {
  const t = useTranslations('blog.posts');
  const locale = useLocale();
  const post = blogPostsData[slug];

  if (!post) {
    return <div>Article non trouvé</div>;
  }

  const PostIcon = post.icon;

  return (
    <article className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Breadcrumb
          items={[
            { label: 'Blog', href: '/blog' },
            { label: t(`${slug}.title`) },
          ]}
        />

        <Link href={`/${locale}/blog`}>
          <Button variant="ghost" className="mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au blog
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              {post.category}
            </span>
            <span className="text-sm text-gray-500">{post.readTime}</span>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
            {t(`${slug}.title`)}
          </h1>

          <div className="flex items-center gap-6 text-gray-600 dark:text-gray-400 mb-8 transition-colors duration-300">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{new Date(post.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{post.readTime} de lecture</span>
            </div>
          </div>

          <div className="w-full h-96 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center mb-12">
            <PostIcon className="w-48 h-48 text-primary-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-lg max-w-none"
        >
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 lead transition-colors duration-300">
            {t(`${slug}.excerpt`)}
          </p>

          <h2>Introduction</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>

          <h2>Points Clés</h2>
          <ul>
            <li>Premier point important de l'article</li>
            <li>Deuxième point essentiel à retenir</li>
            <li>Troisième élément crucial</li>
            <li>Quatrième aspect fondamental</li>
          </ul>

          <h2>Développement</h2>
          <p>
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>

          <blockquote>
            "Une citation inspirante en rapport avec le sujet de l'article qui apporte une perspective intéressante."
          </blockquote>

          <h2>Conclusion</h2>
          <p>
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 pt-8 border-t"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Écrit par</p>
              <p className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">{post.author}</p>
            </div>
            <Link href={`/${locale}/blog`}>
              <Button>
                Voir plus d'articles
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </article>
  );
}
