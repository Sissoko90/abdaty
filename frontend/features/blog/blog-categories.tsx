'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Tag } from 'lucide-react';

export function BlogCategories() {
  const t = useTranslations('blog.categories');

  const categories = [
    { key: 'all', count: 24 },
    { key: 'api', count: 8 },
    { key: 'development', count: 12 },
    { key: 'design', count: 6 },
    { key: 'security', count: 5 },
    { key: 'mobile', count: 7 },
    { key: 'ai', count: 4 },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 transition-colors duration-300">
            <Tag className="w-5 h-5 text-primary-600" />
            {t('title')}
          </h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category.key}
                className="w-full flex items-center justify-between py-2 px-3 rounded-lg hover:bg-primary-50 transition-colors text-left group"
              >
                <span className="text-gray-700 dark:text-gray-300 group-hover:text-primary-600 transition-colors">
                  {t(category.key)}
                </span>
                <span className="text-xs bg-gray-100 dark:bg-gray-800 group-hover:bg-primary-100 text-gray-600 dark:text-gray-400 group-hover:text-primary-600 px-2 py-1 rounded-full transition-colors">
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('recentPosts')}</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-lg flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 mb-1 transition-colors duration-300">
                    Article récent {i}
                  </h4>
                  <p className="text-xs text-gray-500">Il y a {i} jours</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
