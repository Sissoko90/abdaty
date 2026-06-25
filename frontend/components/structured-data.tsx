import Script from 'next/script';
import { SITE_URL, SITE_NAME } from '@/lib/site';

const LOGO = `${SITE_URL}/logo.png`;
const DESCRIPTION =
  'Expert en développement web, mobile, UI/UX design, cybersécurité et intelligence artificielle au Mali.';

// Domaines d'expertise — `knowsAbout` aide les moteurs génératifs (AI Overviews,
// Perplexity, ChatGPT Search) à comprendre et CITER l'entreprise sur ces sujets.
const KNOWS_ABOUT = [
  'Développement web',
  'Développement mobile',
  'UI/UX Design',
  'Cybersécurité',
  'Intelligence artificielle',
  'Data science',
  'API SMS',
];

interface StructuredDataProps {
  type: 'Organization' | 'WebSite' | 'Article' | 'LocalBusiness';
  data?: Record<string, unknown>;
}

/**
 * Injecte les schémas JSON-LD statiques (Organization, WebSite, Article,
 * LocalBusiness) — base SEO + GEO/AIO. Les URLs sont dérivées de SITE_URL.
 */
export function StructuredData({ type, data }: StructuredDataProps) {
  const schemas: Record<string, Record<string, unknown>> = {
    Organization: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: LOGO,
      description: DESCRIPTION,
      foundingDate: '2023',
      areaServed: { '@type': 'Country', name: 'Mali' },
      knowsAbout: KNOWS_ABOUT,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Bamako',
        addressCountry: 'ML',
      },
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+223XXXXXXXX',
        contactType: 'customer service',
        email: 'contact@abdatytechnologie.com',
      },
      sameAs: [
        'https://www.facebook.com/abdatytechnologie',
        'https://www.twitter.com/abdatytech',
        'https://www.linkedin.com/company/abdatytechnologie',
      ],
    },
    WebSite: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      description: DESCRIPTION,
      inLanguage: ['fr', 'en'],
      publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SITE_URL}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    Article: {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: data?.headline,
      description: data?.description,
      image: data?.image,
      author: { '@type': 'Person', name: data?.author },
      datePublished: data?.datePublished,
      dateModified: data?.dateModified,
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: { '@type': 'ImageObject', url: LOGO },
      },
    },
    LocalBusiness: {
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: SITE_NAME,
      image: LOGO,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Bamako',
        addressRegion: 'Bamako',
        addressCountry: 'ML',
      },
      geo: { '@type': 'GeoCoordinates', latitude: 12.6392, longitude: -8.0029 },
      url: SITE_URL,
      telephone: '+223XXXXXXXX',
      openingHoursSpecification: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
      priceRange: '$$',
    },
  };

  const schema = schemas[type] || data;

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/**
 * Injecte un schéma JSON-LD ARBITRAIRE (FAQPage, Service, BreadcrumbList…),
 * construit dynamiquement par l'appelant. Idéal pour les moteurs génératifs qui
 * extraient les Q/R et les services structurés.
 */
export function JsonLd({ id, schema }: { id: string; schema: Record<string, unknown> }) {
  return (
    <Script
      id={`jsonld-${id}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

/** Construit un schéma FAQPage à partir d'une liste de questions/réponses. */
export function buildFaqSchema(qa: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qa
      .filter((x) => x.question && x.answer)
      .map((x) => ({
        '@type': 'Question',
        name: x.question,
        acceptedAnswer: { '@type': 'Answer', text: x.answer },
      })),
  };
}

/** Construit un schéma Service. */
export function buildServiceSchema(opts: {
  name: string;
  description?: string;
  url?: string;
  serviceType?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    url: opts.url,
    serviceType: opts.serviceType || opts.name,
    provider: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    areaServed: { '@type': 'Country', name: 'Mali' },
  };
}

/** Construit un schéma BreadcrumbList (fil d'Ariane) pour la navigation IA. */
export function buildBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}
