import { SMSHeroSection } from '@/features/sms-api/sms-hero-section';
import { SMSPricingSection } from '@/features/sms-api/sms-pricing-section';
import { CodeExamples } from '@/features/sms-api/code-examples';
import { SMSDocumentationSection } from '@/features/sms-api/sms-documentation-section';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return {
    title: locale === 'fr' 
      ? 'API SMS - Abdaty Technologie' 
      : 'SMS API - Abdaty Technologie',
    description: locale === 'fr'
      ? 'Intégrez facilement l\'envoi de SMS dans vos applications avec notre API SMS puissante et fiable au Mali.'
      : 'Easily integrate SMS sending into your applications with our powerful and reliable SMS API in Mali.',
  };
}

export default function SMSAPIPage() {
  return (
    <>
      <main>
        <SMSHeroSection />
        <CodeExamples />
        <SMSPricingSection />
        <SMSDocumentationSection />
      </main>
    </>
  );
}
