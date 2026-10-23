import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Conteneur commun des pages admin : même largeur, mêmes marges, même rythme vertical. */
export function AdminPage({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8', className)}>{children}</div>;
}

/** En-tête de page admin : icône, titre, description et actions alignées à droite. */
export function AdminPageHeader({
  title,
  description,
  icon: Icon,
  actions,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: LucideIcon;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-start gap-4">
        {Icon && (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
            <Icon className="h-6 w-6" />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white sm:text-3xl">{title}</h1>
          {description && <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-400">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

const TONES = {
  primary: 'bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400',
  ochre: 'bg-ochre/15 text-amber-700 dark:text-ochre',
  emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  ink: 'bg-ink text-white dark:bg-white/10',
} as const;

/** Tuile de chiffre clé (tableaux de bord, listes). */
export function AdminStatCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = 'primary',
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  icon?: LucideIcon;
  hint?: React.ReactNode;
  tone?: keyof typeof TONES;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
        {Icon && (
          <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', TONES[tone])}>
            <Icon className="h-5 w-5" />
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-3xl font-bold text-ink dark:text-white">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
}
