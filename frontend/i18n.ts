/**
 * Liste des locales supportées et type associé.
 *
 * La configuration de requête next-intl (messages par locale) vit désormais dans
 * `./i18n/request.ts` (emplacement recommandé depuis next-intl 3.22).
 */
export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];
