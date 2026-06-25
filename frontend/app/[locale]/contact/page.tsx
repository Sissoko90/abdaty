import { ContactHero } from '@/features/contact/contact-hero';
import { ContactForm } from '@/features/contact/contact-form';
import { ContactInfo } from '@/features/contact/contact-info';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === 'fr' 
      ? 'Contactez-nous - Abdaty Technologie' 
      : 'Contact Us - Abdaty Technologie',
    description: locale === 'fr'
      ? 'Contactez Abdaty Technologie pour vos projets de développement web, mobile, UI/UX design, cybersécurité et IA au Mali.'
      : 'Contact Abdaty Technologie for your web development, mobile, UI/UX design, cybersecurity and AI projects in Mali.',
  };
}

export default function ContactPage() {
  return (
    <>
      <main>
        <ContactHero />
        <div className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
            <ContactForm />
            <ContactInfo />
          </div>
        </div>
      </main>
    </>
  );
}
