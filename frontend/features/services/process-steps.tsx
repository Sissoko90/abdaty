import type { LucideIcon } from 'lucide-react';

/**
 * Étapes numérotées d'un processus (vraie séquence) : partagé par la page
 * Services et les pages de détail pour un rendu identique.
 */
export function ProcessSteps({ steps }: { steps: { icon?: LucideIcon; title: string; description: string }[] }) {
  return (
    <ol className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        return (
          <li
            key={`${step.title}-${index}`}
            className="relative rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]"
          >
            {/* Liaison entre les étapes (desktop) */}
            {index < steps.length - 1 && (
              <span aria-hidden="true" className="absolute left-full top-[2.875rem] hidden h-px w-5 bg-gray-300 dark:bg-white/20 lg:block" />
            )}
            <div className="mb-6 flex items-center justify-between">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink font-display text-lg font-bold text-white dark:bg-white dark:text-ink">
                {index + 1}
              </span>
              {Icon && <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />}
            </div>
            <h3 className="mb-2 text-lg font-bold text-ink dark:text-white">{step.title}</h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{step.description}</p>
          </li>
        );
      })}
    </ol>
  );
}
