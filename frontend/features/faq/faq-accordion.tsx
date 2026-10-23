'use client';

import { useTranslations, useLocale } from 'next-intl';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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

/** Identifiant d'ancre stable pour une catégorie (« Tarifs & paiement » -> « faq-tarifs-paiement »). */
function anchorId(key: string): string {
  return `faq-${key.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
}

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
    <section className="py-20 lg:py-28">
      <JsonLd id="faq" schema={faqSchema} />
      <div className="site-container grid gap-12 lg:grid-cols-12">
        {/* Sommaire des catégories (desktop) */}
        {displayCategories.length > 1 && (
          <nav aria-label={t('hero.title')} className="hidden lg:col-span-3 lg:block">
            <ul className="sticky top-28 space-y-1 border-l border-gray-200 dark:border-white/10">
              {displayCategories.map((category) => (
                <li key={category.key}>
                  <a
                    href={`#${anchorId(category.key)}`}
                    className="-ml-px flex items-center justify-between border-l-2 border-transparent py-2 pl-4 text-sm font-medium text-gray-600 transition-colors hover:border-primary-600 hover:text-ink dark:text-gray-400 dark:hover:text-white"
                  >
                    {category.title}
                    <span className="ml-3 rounded-full bg-gray-100 px-2 py-0.5 text-xs tabular-nums text-gray-500 dark:bg-white/5 dark:text-gray-400">
                      {category.items.length}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className={`space-y-14 ${displayCategories.length > 1 ? 'lg:col-span-9' : 'lg:col-span-12'}`}>
          {displayCategories.map((category) => (
            <div key={category.key} id={anchorId(category.key)} className="scroll-mt-28">
              <h2 className="mb-6 text-3xl font-bold text-ink dark:text-white">{category.title}</h2>
              <Accordion
                type="single"
                collapsible
                className="divide-y divide-gray-200 rounded-2xl border border-gray-200 bg-white px-6 dark:divide-white/10 dark:border-white/10 dark:bg-white/[0.03]"
              >
                {category.items.map((qa) => (
                  <AccordionItem key={qa.id} value={qa.id} className="border-b-0">
                    <AccordionTrigger className="py-5 text-left text-lg font-semibold text-ink hover:text-primary-600 hover:no-underline dark:text-white dark:hover:text-primary-400">
                      {qa.question}
                    </AccordionTrigger>
                    <AccordionContent className="pb-5 text-base leading-relaxed text-gray-600 dark:text-gray-400">
                      {qa.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
