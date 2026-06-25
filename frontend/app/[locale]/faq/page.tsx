import { FAQHero } from '@/features/faq/faq-hero';
import { FAQAccordion } from '@/features/faq/faq-accordion';
import { FAQContact } from '@/features/faq/faq-contact';

export default function FAQPage() {
  return (
    <>
      <main>
        <FAQHero />
        <FAQAccordion />
        <FAQContact />
      </main>
    </>
  );
}
