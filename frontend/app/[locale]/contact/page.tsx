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
      <ContactHero />
      <section className="py-20 lg:py-28">
        <div className="site-container grid items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
          <div className="lg:col-span-5">
            <ContactInfo />
          </div>
        </div>
      </section>
    </>
  );
}
