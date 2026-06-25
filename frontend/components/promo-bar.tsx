'use client';

import type { Route } from 'next';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { usePublicSection } from '@/hooks/use-public-content';
import { useLocale } from 'next-intl';
import { parseSlides, isActiveNow, type PromoSlide } from '@/lib/promo';

/** Hash stable du contenu → la bannière réapparaît si l'admin la modifie. */
function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return String(h >>> 0);
}

const ROTATE_MS = 6000;

/**
 * Bannière promotionnelle fine, fixée juste sous la navbar (top-16). Gère
 * PLUSIEURS slides en ROTATION automatique, filtrés par leurs dates de campagne
 * (début/fin). Contenu géré dans l'admin (section `promo`). Bilingue, couleurs du
 * thème par défaut (surchargeables par slide), masquable (mémorisé par contenu).
 */
export function PromoBar() {
  const locale = useLocale();
  const { blocks } = usePublicSection('promo');
  const [dismissed, setDismissed] = useState(true);
  const [index, setIndex] = useState(0);

  const enabled = blocks.barEnabled?.valueFr === 'true';

  // Slides actifs (texte présent + dans la fenêtre de campagne).
  const active: PromoSlide[] = useMemo(() => {
    if (!enabled) return [];
    return parseSlides(blocks.barItems?.valueFr).filter(
      (s) => (s.textFr || s.textEn) && isActiveNow(s.start, s.end)
    );
  }, [enabled, blocks.barItems?.valueFr]);

  // Clé de fermeture basée sur le contenu actif → réapparaît si ça change.
  const key = active.length ? `promo-bar:${hash(JSON.stringify(active.map((s) => s.id + s.textFr)))}` : '';

  useEffect(() => {
    if (!key) return;
    setDismissed(localStorage.getItem(key) === '1');
  }, [key]);

  // Rotation automatique entre les slides actifs.
  useEffect(() => {
    setIndex(0);
    if (active.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % active.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [active.length]);

  if (!enabled || active.length === 0 || dismissed) return null;

  const slide = active[Math.min(index, active.length - 1)];
  const text = (locale === 'fr' ? slide.textFr : slide.textEn) || slide.textFr;
  const ctaLabel = (locale === 'fr' ? slide.ctaFr : slide.ctaEn) || slide.ctaFr;
  const ctaHref = (slide.href || '').trim();
  const bg = (slide.bg || '').trim();

  const close = () => {
    if (key) localStorage.setItem(key, '1');
    setDismissed(true);
  };

  const isExternal = /^https?:\/\//.test(ctaHref);
  const href = ctaHref ? (isExternal ? ctaHref : `/${locale}${ctaHref.startsWith('/') ? '' : '/'}${ctaHref}`) : '';

  return (
    <div
      className="fixed top-16 inset-x-0 z-40 h-10 flex items-center justify-center px-10 text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-primary-700 shadow-sm"
      style={bg ? { background: bg } : {}}
      role="region"
      aria-label="Bannière promotionnelle"
    >
      <p className="truncate text-center transition-opacity duration-300">
        {text}
        {href && ctaLabel && (
          isExternal ? (
            <a href={href} target="_blank" rel="noopener noreferrer" className="ml-2 underline underline-offset-2 font-semibold hover:opacity-90">
              {ctaLabel}
            </a>
          ) : (
            <Link href={href as Route} className="ml-2 underline underline-offset-2 font-semibold hover:opacity-90">
              {ctaLabel}
            </Link>
          )
        )}
      </p>

      {/* Indicateurs de slides (si plusieurs). */}
      {active.length > 1 && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 hidden sm:flex gap-1">
          {active.map((s, i) => (
            <span
              key={s.id}
              className={`h-1.5 w-1.5 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/40'}`}
            />
          ))}
        </div>
      )}

      <button
        onClick={close}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/20 transition-colors"
        aria-label="Fermer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
