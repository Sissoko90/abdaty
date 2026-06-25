'use client';

import type { Route } from 'next';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import { useLocale } from 'next-intl';
import { usePublicSection } from '@/hooks/use-public-content';
import { mediaUrl } from '@/services/content.service';
import { isActiveNow } from '@/lib/promo';

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return String(h >>> 0);
}

/**
 * Carte de promotion en coin (bas-gauche — le chatbot occupe le bas-droit).
 * Contenu géré dans l'admin (section `promo`, clés `corner*`). Image optionnelle,
 * titre/texte bilingues, CTA, et fermeture mémorisée par contenu.
 */
export function PromoCorner() {
  const locale = useLocale();
  const { cv, blocks } = usePublicSection('promo');
  const [dismissed, setDismissed] = useState(true);

  // Activée + dans la fenêtre de campagne (dates début/fin optionnelles).
  const scheduled = isActiveNow(blocks.cornerStart?.valueFr, blocks.cornerEnd?.valueFr);
  const enabled = blocks.cornerEnabled?.valueFr === 'true' && scheduled;
  const title = cv('cornerTitle', '');
  const text = cv('cornerText', '');
  const ctaLabel = cv('cornerCtaLabel', '');
  const ctaHref = (blocks.cornerCtaHref?.valueFr || '').trim();
  const rawImage = (blocks.cornerImage?.valueFr || '').trim();
  const image = rawImage ? mediaUrl(rawImage) : '';

  const key = enabled && (title || text) ? `promo-corner:${hash(title + text + ctaLabel + ctaHref + rawImage)}` : '';

  useEffect(() => {
    if (!key) return;
    setDismissed(localStorage.getItem(key) === '1');
  }, [key]);

  if (!enabled || (!title && !text) || dismissed) return null;

  const close = () => {
    if (key) localStorage.setItem(key, '1');
    setDismissed(true);
  };

  const isExternal = /^https?:\/\//.test(ctaHref);
  const href = ctaHref ? (isExternal ? ctaHref : `/${locale}${ctaHref.startsWith('/') ? '' : '/'}${ctaHref}`) : '';

  return (
    <div className="fixed bottom-4 left-4 z-40 w-72 max-w-[calc(100vw-2rem)] rounded-xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 animate-in fade-in slide-in-from-bottom-4">
      <button
        onClick={close}
        className="absolute right-2 top-2 z-10 p-1 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
        aria-label="Fermer"
      >
        <X className="w-4 h-4" />
      </button>

      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={title || 'Promotion'} className="w-full h-28 object-cover" />
      )}

      <div className="p-4">
        {title && <p className="font-semibold text-gray-900 dark:text-white mb-1">{title}</p>}
        {text && <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{text}</p>}
        {href && ctaLabel && (
          <div className="mt-3">
            {isExternal ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                {ctaLabel}
              </a>
            ) : (
              <Link
                href={href as Route}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
              >
                {ctaLabel}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
