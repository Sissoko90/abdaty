'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronRight } from 'lucide-react';

export function DocsSidebar() {
  const t = useTranslations('docs.sidebar');
  const [openSections, setOpenSections] = useState<string[]>(['getting-started']);

  const sections = [
    {
      key: 'getting-started',
      items: ['introduction', 'installation', 'quickstart'],
    },
    {
      key: 'api-reference',
      items: ['authentication', 'endpoints', 'errors'],
    },
    {
      key: 'guides',
      items: ['sms-api', 'webhooks', 'best-practices'],
    },
    {
      key: 'examples',
      items: ['nodejs', 'python', 'php', 'java'],
    },
  ];

  const toggleSection = (key: string) => {
    setOpenSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <nav className="sticky top-24">
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('title')}</h3>
        <div className="space-y-2">
          {sections.map((section) => (
            <div key={section.key}>
              <button
                onClick={() => toggleSection(section.key)}
                className="flex items-center justify-between w-full text-left py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">{t(`${section.key}.title`)}</span>
                {openSections.includes(section.key) ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>
              {openSections.includes(section.key) && (
                <div className="ml-4 mt-1 space-y-1">
                  {section.items.map((item) => (
                    <a
                      key={item}
                      href={`#${item}`}
                      className="block py-2 px-3 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      {t(`${section.key}.${item}`)}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}
