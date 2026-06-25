import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

/**
 * Configuration de requête next-intl (emplacement recommandé depuis next-intl 3.22).
 * Utilise `requestLocale` (au lieu du paramètre `locale` déprécié).
 */
const locales = ['en', 'fr'] as const;

export default getRequestConfig(async ({ requestLocale }) => {
  // `requestLocale` est une promesse résolvant la locale du segment courant.
  const requested = await requestLocale;
  const locale = requested && (locales as readonly string[]).includes(requested) ? requested : undefined;
  if (!locale) notFound();

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
