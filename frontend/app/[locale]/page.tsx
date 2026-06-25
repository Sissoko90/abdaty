import { HeroSection } from '@/features/home/hero-section';
import { ServicesSection } from '@/features/home/services-section';
import { PartnersSection } from '@/features/home/partners-section';
import { TestimonialsSection } from '@/features/home/testimonials-section';
import { CTASection } from '@/features/home/cta-section';
import { Newsletter } from '@/components/newsletter';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  
  return {
    title: locale === 'fr' 
      ? 'Abdaty Technologie - Solutions Digitales Innovantes au Mali' 
      : 'Abdaty Technologie - Innovative Digital Solutions in Mali',
    description: locale === 'fr'
      ? 'Expert en développement web, mobile, UI/UX design, cybersécurité et intelligence artificielle au Mali. Transformez votre entreprise avec nos solutions technologiques.'
      : 'Expert in web development, mobile, UI/UX design, cybersecurity and artificial intelligence in Mali. Transform your business with our technological solutions.',
  };
}

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PartnersSection />
      <ServicesSection />
      <TestimonialsSection />
      <CTASection />
      <Newsletter />
    </>
  );
}
