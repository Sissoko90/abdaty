import { ServicesHero } from '@/features/services/services-hero';
import { ServicesGrid } from '@/features/services/services-grid';
import { ProcessSection } from '@/features/services/process-section';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === 'fr' 
      ? 'Nos Services - Abdaty Technologie' 
      : 'Our Services - Abdaty Technologie',
    description: locale === 'fr'
      ? 'Découvrez nos services de développement web, mobile, UI/UX design, cybersécurité et intelligence artificielle au Mali.'
      : 'Discover our web development, mobile, UI/UX design, cybersecurity and artificial intelligence services in Mali.',
  };
}

export default function ServicesPage() {
  return (
    <>
      <main>
        <ServicesHero />
        <ServicesGrid />
        <ProcessSection />
      </main>
    </>
  );
}
