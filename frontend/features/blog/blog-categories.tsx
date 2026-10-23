'use client';

import { useTranslations } from 'next-intl';

/**
 * Filtre par catégorie, en pastilles. Les catégories proviennent des articles
 * réellement publiés (calculées par la grille), sans compteurs inventés.
 */
export function BlogCategories({
  categories,
  active,
  onSelect,
}: {
  categories: Array<{ value: string; label: string }>;
  active: string | null;
  onSelect: (value: string | null) => void;
}) {
  const t = useTranslations('blog');

  const pill = (selected: boolean) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
      selected
        ? 'bg-ink text-white dark:bg-white dark:text-ink'
        : 'border border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:text-primary-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300 dark:hover:border-primary-500/40 dark:hover:text-primary-300'
    }`;

  return (
    <div role="group" aria-label={t('ui.filterLabel')} className="mb-10 flex flex-wrap gap-2">
      <button type="button" onClick={() => onSelect(null)} aria-pressed={active === null} className={pill(active === null)}>
        {t('categories.all')}
      </button>
      {categories.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => onSelect(c.value)}
          aria-pressed={active === c.value}
          className={pill(active === c.value)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}
