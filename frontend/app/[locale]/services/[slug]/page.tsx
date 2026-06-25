import { ServiceDetailEnhanced } from '@/features/services/service-detail-enhanced';
import { JsonLd, buildServiceSchema, buildBreadcrumbSchema } from '@/components/structured-data';
import { SITE_URL } from '@/lib/site';

interface ServicePageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

/** Noms lisibles des services connus (repli : slug « humanisé »). */
const SERVICE_NAMES: Record<string, string> = {
  'web-development': 'Développement Web',
  'mobile-apps': 'Développement Mobile',
  'ui-ux-design': 'UI/UX Design',
  cybersecurity: 'Cybersécurité',
  'data-ai': 'Data & IA',
};

function humanize(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { locale, slug } = await params;
  const name = SERVICE_NAMES[slug] || humanize(slug);
  const url = `${SITE_URL}/${locale}/services/${slug}`;

  // JSON-LD : Service + fil d'Ariane → aide l'agentic search et les moteurs
  // génératifs (AI Overviews, Perplexity…) à comprendre et citer la prestation.
  const serviceSchema = buildServiceSchema({ name, url, serviceType: name });
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Accueil', url: `${SITE_URL}/${locale}` },
    { name: 'Services', url: `${SITE_URL}/${locale}/services` },
    { name, url },
  ]);

  return (
    <>
      <JsonLd id={`service-${slug}`} schema={serviceSchema} />
      <JsonLd id={`breadcrumb-${slug}`} schema={breadcrumbSchema} />
      <main>
        <ServiceDetailEnhanced slug={slug} />
      </main>
    </>
  );
}
