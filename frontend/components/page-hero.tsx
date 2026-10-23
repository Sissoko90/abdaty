'use client';

import { motion, useReducedMotion } from 'framer-motion';

/**
 * En-tête commun des pages intérieures (services, à propos, contact, FAQ, blog) :
 * même alignement, même rythme et même bande bogolan que la page d'accueil.
 */
export function PageHero({
  title,
  subtitle,
  description,
  children,
}: {
  title: string;
  subtitle?: string;
  description?: string;
  children?: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const fade = reduce ? {} : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 } };

  return (
    <>
      <section className="relative overflow-hidden bg-white pb-16 pt-32 dark:bg-white/[0.02] lg:pb-20 lg:pt-40">
        <div className="pointer-events-none absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full bg-primary-400/15 blur-3xl dark:bg-primary-600/15" />
        <motion.div {...fade} className="site-container relative">
          <div className="max-w-3xl">
            <h1 className="mb-5 text-5xl font-extrabold leading-[1.05] text-ink dark:text-white md:text-6xl">{title}</h1>
            {subtitle && <p className="text-xl leading-relaxed text-gray-600 dark:text-gray-300">{subtitle}</p>}
            {description && <p className="mt-5 max-w-2xl leading-relaxed text-gray-600 dark:text-gray-400">{description}</p>}
            {children}
          </div>
        </motion.div>
      </section>
      <div className="bogolan-band" />
    </>
  );
}
