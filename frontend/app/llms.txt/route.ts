import { SITE_URL, SITE_NAME } from '@/lib/site';

/**
 * /llms.txt — standard émergent (llmstxt.org) de découverte pour les agents IA et
 * moteurs de recherche génératifs : un résumé concis et factuel du site + les
 * liens essentiels, dans un format markdown facile à extraire/citer (GEO/AIO).
 *
 * Servi en text/plain (markdown) avec un cache long côté CDN.
 */
export const dynamic = 'force-static';

export function GET() {
  const body = `# ${SITE_NAME}

> Entreprise technologique basée à Bamako (Mali), experte en développement web et mobile, UI/UX design, cybersécurité, et data & intelligence artificielle. Nous concevons des solutions digitales sur mesure pour les entreprises.

Abdaty Technologie accompagne ses clients de la conception au déploiement : applications web et mobiles, audits et services de cybersécurité, design d'interfaces, et solutions data/IA (machine learning, analyse prédictive). Une API SMS est également proposée.

## Pages principales
- [Accueil](${SITE_URL}/fr): présentation de l'entreprise et de ses services.
- [Services](${SITE_URL}/fr/services): catalogue complet des prestations.
- [À propos](${SITE_URL}/fr/about): mission, équipe et valeurs.
- [Blog](${SITE_URL}/fr/blog): articles et actualités tech.
- [Documentation](${SITE_URL}/fr/docs): guides et références techniques.
- [FAQ](${SITE_URL}/fr/faq): réponses aux questions fréquentes.
- [Contact](${SITE_URL}/fr/contact): prise de contact et devis.

## Services
- [Développement Web](${SITE_URL}/fr/services/web-development): sites et applications web performants.
- [Développement Mobile](${SITE_URL}/fr/services/mobile-apps): applications iOS et Android.
- [UI/UX Design](${SITE_URL}/fr/services/ui-ux-design): conception d'interfaces et d'expériences utilisateur.
- [Cybersécurité](${SITE_URL}/fr/services/cybersecurity): audits, protection et sécurisation des systèmes.
- [Data & IA](${SITE_URL}/fr/services/data-ai): machine learning, analyse de données et IA.
- [API SMS](${SITE_URL}/fr/sms-api): envoi de SMS programmatique pour les entreprises.

## Ressources
- [Plan du site (sitemap)](${SITE_URL}/sitemap.xml): liste complète et à jour des URLs indexables.
- Versions linguistiques : français (\`/fr\`) et anglais (\`/en\`).
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
