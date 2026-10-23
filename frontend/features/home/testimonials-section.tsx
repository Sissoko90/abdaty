'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePublicSection } from '@/hooks/use-public-content';

interface DisplayTestimonial {
  name: string;
  role: string;
  rating: number;
  text: string;
}

/** Témoignages par défaut (repli si la base est vide). */
const defaultTestimonials: DisplayTestimonial[] = [
  {
    name: 'Moussa DEMBELE',
    role: 'CEO, TechStart MALI',
    rating: 5,
    text: 'Abdaty Technologie a transformé notre vision en réalité. Leur expertise en développement web et leur professionnalisme sont exceptionnels.',
  },
  {
    name: 'Marie TRAORE',
    role: 'Directrice Marketing, E-Shop MALI',
    rating: 5,
    text: 'L\'application mobile développée par Abdaty a augmenté nos ventes de 300%. Une équipe réactive et à l\'écoute de nos besoins.',
  },
  {
    name: 'Ahmed SOW',
    role: 'CTO, FinTech Solutions',
    rating: 5,
    text: 'Leur expertise en cybersécurité nous a permis de sécuriser nos systèmes. Des professionnels de confiance avec qui nous continuons à travailler.',
  },
  {
    name: 'Mariam MAIGA',
    role: 'Fondatrice, Digital Agency',
    rating: 5,
    text: 'Le design UI/UX créé par Abdaty est magnifique et fonctionnel. Nos clients adorent la nouvelle interface de notre plateforme.',
  },
  {
    name: 'Ibrahim DIALLO',
    role: 'Directeur IT, Bank Corp',
    rating: 5,
    text: 'Infrastructure réseau impeccable et support technique 24/7. Abdaty Technologie est notre partenaire de confiance depuis 3 ans.',
  },
  {
    name: 'Fatou DIALLO',
    role: 'CEO, Health Plus',
    rating: 5,
    text: 'L\'API SMS d\'Abdaty nous permet d\'envoyer des rappels de rendez-vous à nos patients. Service fiable et prix compétitifs.',
  },
];

// Couleurs d'avatar en alternance (primaire, ocre, encre).
const AVATAR_STYLES = ['bg-primary-600 text-white', 'bg-ochre text-ink', 'bg-ink text-white dark:bg-white dark:text-ink'];

/** Initiales d'un nom (« Moussa DEMBELE » -> « MD »). */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');
}

function Avatar({ name, index, size = 'md' }: { name: string; index: number; size?: 'md' | 'lg' }) {
  const dims = size === 'lg' ? 'h-14 w-14 text-lg' : 'h-11 w-11 text-sm';
  return (
    <span className={`flex shrink-0 items-center justify-center rounded-full font-bold ${dims} ${AVATAR_STYLES[index % AVATAR_STYLES.length]}`}>
      {initials(name)}
    </span>
  );
}

export function TestimonialsSection() {
  const t = useTranslations('testimonials');
  const locale = useLocale();
  const [active, setActive] = useState(0);

  // Témoignages gérés dans l'admin (section "testimonials"), avec repli.
  const { items } = usePublicSection('testimonials');
  const backendTestimonials: DisplayTestimonial[] = items
    .filter((b) => b.contentKey.startsWith('item-'))
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((b) => {
      let fr: { content?: string; clientName?: string; role?: string; company?: string; rating?: number } = {};
      let en: { content?: string; clientName?: string; role?: string; company?: string; rating?: number } = {};
      try { fr = b.valueFr ? JSON.parse(b.valueFr) : {}; } catch { /* ignore */ }
      try { en = b.valueEn ? JSON.parse(b.valueEn) : {}; } catch { /* ignore */ }
      const content = (locale === 'fr' ? fr.content : en.content) ?? fr.content ?? '';
      return {
        name: fr.clientName ?? '',
        role: [fr.role, fr.company].filter(Boolean).join(', '),
        rating: fr.rating ?? 5,
        text: content,
      };
    });
  const testimonials = backendTestimonials.length > 0 ? backendTestimonials : defaultTestimonials;
  const count = testimonials.length;
  const index = Math.min(active, count - 1);
  const current = testimonials[index];

  if (!current) return null;

  const go = (delta: number) => setActive((i) => (i + delta + count) % count);

  return (
    <section className="bg-white py-20 dark:bg-white/[0.02] lg:py-28">
      <div className="site-container">
        <div className="mb-12 max-w-2xl">
          <h2 className="mb-4 text-4xl font-bold text-ink dark:text-white md:text-5xl">{t('title')}</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">{t('subtitle')}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Témoignage mis en avant */}
          <div className="relative flex flex-col overflow-hidden rounded-3xl bg-paper p-8 ring-1 ring-gray-200 dark:bg-white/[0.04] dark:ring-white/10 sm:p-12 lg:col-span-7">
            <span aria-hidden="true" className="pointer-events-none absolute -top-6 right-8 font-display text-[10rem] font-extrabold leading-none text-ochre/40">
              &rdquo;
            </span>

            <AnimatePresence mode="wait">
              <motion.figure
                key={index}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="relative flex flex-1 flex-col"
              >
                <div className="mb-6 flex gap-1" role="img" aria-label={`${current.rating}/5`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-5 w-5 ${i < current.rating ? 'fill-ochre text-ochre' : 'text-gray-300 dark:text-gray-600'}`} />
                  ))}
                </div>
                <blockquote className="mb-10 font-display text-2xl font-medium leading-snug text-ink dark:text-white sm:text-[1.7rem]">
                  {current.text}
                </blockquote>
                <figcaption className="mt-auto flex items-center gap-4">
                  <Avatar name={current.name} index={index} size="lg" />
                  <div>
                    <div className="font-semibold text-ink dark:text-white">{current.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{current.role}</div>
                  </div>
                </figcaption>
              </motion.figure>
            </AnimatePresence>

            {count > 1 && (
              <div className="mt-10 flex items-center justify-between border-t border-gray-200 pt-6 dark:border-white/10">
                <span className="text-sm font-medium tabular-nums text-gray-500 dark:text-gray-400">
                  {index + 1} / {count}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => go(-1)}
                    aria-label={t('prev')}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-300 bg-white text-ink transition-colors hover:border-primary-500 hover:text-primary-600 dark:border-white/15 dark:bg-transparent dark:text-white"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => go(1)}
                    aria-label={t('next')}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white transition-colors hover:bg-primary-600 dark:bg-white dark:text-ink dark:hover:bg-primary-500 dark:hover:text-white"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Liste des clients (desktop) : choisir un témoignage */}
          <ul className="hidden flex-col gap-2 lg:col-span-5 lg:flex">
            {testimonials.map((item, i) => {
              const selected = i === index;
              return (
                <li key={`${item.name}-${i}`}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-pressed={selected}
                    className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${
                      selected
                        ? 'border-primary-300 bg-primary-50 dark:border-primary-500/40 dark:bg-primary-500/10'
                        : 'border-transparent hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <Avatar name={item.name} index={i} />
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-ink dark:text-white">{item.name}</div>
                      <div className="truncate text-sm text-gray-600 dark:text-gray-400">{item.role}</div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
