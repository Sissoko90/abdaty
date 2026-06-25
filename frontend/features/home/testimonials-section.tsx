'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCounter } from '@/hooks/use-counter';
import { usePublicSection } from '@/hooks/use-public-content';

interface DisplayTestimonial {
  name: string;
  role: string;
  image: string;
  rating: number;
  text: string;
}

/** Témoignages par défaut (repli si la base est vide). */
const defaultTestimonials: DisplayTestimonial[] = [
  {
    name: 'Moussa DEMBELE',
    role: 'CEO, TechStart MALI',
    image: '👨‍💼',
    rating: 5,
    text: 'Abdaty Technologie a transformé notre vision en réalité. Leur expertise en développement web et leur professionnalisme sont exceptionnels.',
  },
  {
    name: 'Marie TRAORE',
    role: 'Directrice Marketing, E-Shop MALI',
    image: '👩‍💼',
    rating: 5,
    text: 'L\'application mobile développée par Abdaty a augmenté nos ventes de 300%. Une équipe réactive et à l\'écoute de nos besoins.',
  },
  {
    name: 'Ahmed SOW',
    role: 'CTO, FinTech Solutions',
    image: '👨‍💻',
    rating: 5,
    text: 'Leur expertise en cybersécurité nous a permis de sécuriser nos systèmes. Des professionnels de confiance avec qui nous continuons à travailler.',
  },
  {
    name: 'Mariam MAIGA',
    role: 'Fondatrice, Digital Agency',
    image: '👩‍🎨',
    rating: 5,
    text: 'Le design UI/UX créé par Abdaty est magnifique et fonctionnel. Nos clients adorent la nouvelle interface de notre plateforme.',
  },
  {
    name: 'Ibrahim DIALLO',
    role: 'Directeur IT, Bank Corp',
    image: '👨‍💼',
    rating: 5,
    text: 'Infrastructure réseau impeccable et support technique 24/7. Abdaty Technologie est notre partenaire de confiance depuis 3 ans.',
  },
  {
    name: 'Fatou DIALLO',
    role: 'CEO, Health Plus',
    image: '👩‍⚕️',
    rating: 5,
    text: 'L\'API SMS d\'Abdaty nous permet d\'envoyer des rappels de rendez-vous à nos patients. Service fiable et prix compétitifs.',
  },
];

export function TestimonialsSection() {
  const t = useTranslations('testimonials');
  const locale = useLocale();

  // Témoignages gérés dans l'admin (section "testimonials"), avec repli.
  const { items } = usePublicSection('testimonials');
  const backendTestimonials: DisplayTestimonial[] = items
    .filter((b) => b.contentKey.startsWith('item-'))
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((b) => {
      let fr: { content?: string; clientName?: string; role?: string; company?: string; rating?: number; value?: string; label?: string } = {};
      let en: { content?: string; clientName?: string; role?: string; company?: string; rating?: number; value?: string; label?: string } = {};
      try { fr = b.valueFr ? JSON.parse(b.valueFr) : {}; } catch { /* ignore */ }
      try { en = b.valueEn ? JSON.parse(b.valueEn) : {}; } catch { /* ignore */ }
      const content = (locale === 'fr' ? fr.content : en.content) ?? fr.content ?? '';
      return {
        name: fr.clientName ?? '',
        role: [fr.role, fr.company].filter(Boolean).join(', '),
        image: '🧑‍💼',
        rating: fr.rating ?? 5,
        text: content,
      };
    });
  const displayTestimonials = backendTestimonials.length > 0 ? backendTestimonials : defaultTestimonials;

  // Chiffres clés gérés dans l'admin (section "stats").
  const { items: statItems } = usePublicSection('stats');
  const backendStats = statItems
    .filter((b) => b.contentKey.startsWith('item-'))
    .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0))
    .map((b) => {
      let fr: { content?: string; clientName?: string; role?: string; company?: string; rating?: number; value?: string; label?: string } = {};
      let en: { content?: string; clientName?: string; role?: string; company?: string; rating?: number; value?: string; label?: string } = {};
      try { fr = b.valueFr ? JSON.parse(b.valueFr) : {}; } catch { /* ignore */ }
      try { en = b.valueEn ? JSON.parse(b.valueEn) : {}; } catch { /* ignore */ }
      const loc = locale === 'fr' ? fr : en;
      return { value: loc.value ?? fr.value ?? '', label: loc.label ?? fr.label ?? '' };
    });

  const clientsCount = useCounter(200, 2000);
  const projectsCount = useCounter(500, 2000);
  const satisfactionCount = useCounter(99, 2000);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Horizontal scrolling testimonials */}
        <div className="relative">
          <div className="overflow-x-auto pb-4 hide-scrollbar">
            <div className="flex gap-6 min-w-max px-4">
              {displayTestimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="w-[400px] flex-shrink-0"
                >
                  <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary-200 hover:scale-105">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>

                      <div className="relative mb-4">
                        <Quote className="absolute -top-2 -left-2 w-8 h-8 text-primary-200" />
                        <p className="text-gray-700 dark:text-gray-300 italic pl-6 transition-colors duration-300">
                          "{testimonial.text}"
                        </p>
                      </div>

                      <div className="flex items-center gap-3 mt-6 pt-6 border-t">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-2xl">
                          {testimonial.image}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white transition-colors duration-300">
                            {testimonial.name}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                            {testimonial.role}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="flex justify-center mt-4 gap-2">
            {displayTestimonials.map((_, index) => (
              <div key={index} className="w-2 h-2 rounded-full bg-primary-200" />
            ))}
          </div>
        </div>

        {/* Stats : chiffres gérés dans l'admin (section "stats"), sinon compteurs animés. */}
        {backendStats.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {backendStats.slice(0, 4).map((s, i) => (
              <div className="text-center" key={i}>
                <div className="text-4xl font-bold text-primary-600 mb-2">{s.value}</div>
                <div className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{s.label}</div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            <div className="text-center" ref={clientsCount.ref}>
              <div className="text-4xl font-bold text-primary-600 mb-2">{clientsCount.count}+</div>
              <div className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{t('stats.clients')}</div>
            </div>
            <div className="text-center" ref={projectsCount.ref}>
              <div className="text-4xl font-bold text-primary-600 mb-2">{projectsCount.count}+</div>
              <div className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{t('stats.projects')}</div>
            </div>
            <div className="text-center" ref={satisfactionCount.ref}>
              <div className="text-4xl font-bold text-primary-600 mb-2">{satisfactionCount.count}%</div>
              <div className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{t('stats.satisfaction')}</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">24/7</div>
              <div className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{t('stats.support')}</div>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
