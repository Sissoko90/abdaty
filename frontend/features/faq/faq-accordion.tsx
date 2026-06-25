'use client';

import { useTranslations, useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { usePublicSection } from '@/hooks/use-public-content';
import { JsonLd, buildFaqSchema } from '@/components/structured-data';

interface FaqQA {
  id: string;
  question: string;
  answer: string;
}
interface FaqCategory {
  key: string;
  title: string;
  items: FaqQA[];
}

/** Catégories i18n par défaut (repli si la base est vide). */
const DEFAULT_CATEGORIES = [
  { key: 'general', questions: ['what', 'where', 'how', 'who'] },
  { key: 'services', questions: ['types', 'custom', 'timeline', 'support'] },
  { key: 'pricing', questions: ['cost', 'payment', 'refund', 'discount'] },
  { key: 'technical', questions: ['technologies', 'security', 'hosting', 'maintenance'] },
];
const KNOWN_CATEGORIES = ['general', 'services', 'pricing', 'technical', 'contact'];

export function FAQAccordion() {
  const t = useTranslations('faq');
  const locale = useLocale();

  // Questions gérées dans l'admin (section "faq"), avec repli i18n.
  const { items } = usePublicSection('faq');
  const catTitle = (cat: string) => (KNOWN_CATEGORIES.includes(cat) ? t(`${cat}.title`) : cat);

  const backendItems = items
    .filter((b) => b.contentKey.startsWith('item-'))
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((b) => {
      let fr: { category?: string; question?: string; answer?: string } = {};
      let en: { category?: string; question?: string; answer?: string } = {};
      try { fr = b.valueFr ? JSON.parse(b.valueFr) : {}; } catch { /* ignore */ }
      try { en = b.valueEn ? JSON.parse(b.valueEn) : {}; } catch { /* ignore */ }
      const loc = locale === 'fr' ? fr : en;
      return {
        id: b.contentKey,
        category: fr.category || 'general',
        question: loc.question ?? fr.question ?? '',
        answer: loc.answer ?? fr.answer ?? '',
      };
    });

  let displayCategories: FaqCategory[];
  if (backendItems.length > 0) {
    const grouped: Record<string, FaqQA[]> = {};
    const order: string[] = [];
    backendItems.forEach((it) => {
      if (!grouped[it.category]) {
        grouped[it.category] = [];
        order.push(it.category);
      }
      grouped[it.category].push({ id: it.id, question: it.question, answer: it.answer });
    });
    displayCategories = order.map((cat) => ({ key: cat, title: catTitle(cat), items: grouped[cat] }));
  } else {
    displayCategories = DEFAULT_CATEGORIES.map((c) => ({
      key: c.key,
      title: t(`${c.key}.title`),
      items: c.questions.map((q) => ({
        id: `${c.key}-${q}`,
        question: t(`${c.key}.${q}.question`),
        answer: t(`${c.key}.${q}.answer`),
      })),
    }));
  }

  // Schéma FAQPage (JSON-LD) : permet aux moteurs génératifs / AI Overviews
  // d'extraire et citer directement les questions/réponses.
  const faqSchema = buildFaqSchema(
    displayCategories.flatMap((c) => c.items.map((qa) => ({ question: qa.question, answer: qa.answer })))
  );

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
      <JsonLd id="faq" schema={faqSchema} />
      <div className="max-w-4xl mx-auto">
        {displayCategories.map((category, categoryIndex) => (
          <motion.div
            key={category.key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: categoryIndex * 0.1 }}
            className="mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
              {category.title}
            </h2>

            <Card className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {category.items.map((qa) => (
                  <AccordionItem key={qa.id} value={qa.id}>
                    <AccordionTrigger className="text-left text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 transition-colors duration-300">
                      {qa.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
                      {qa.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
