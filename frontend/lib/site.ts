/**
 * Constantes liées au site public, centralisées pour le SEO.
 *
 * `SITE_URL` est l'URL publique canonique (sans slash final), configurable via
 * la variable d'environnement NEXT_PUBLIC_SITE_URL — indispensable pour des
 * URLs correctes dans le sitemap, robots.txt, les balises canoniques et Open Graph.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://abdatytechnologie.com').replace(/\/$/, '');

/** Nom du site (repli SEO). */
export const SITE_NAME = 'Abdaty Technologie';
