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
    // Attend le choix cookies : la bannière occupe le même coin de l'écran.
    const sync = () => setDismissed(localStorage.getItem(key) === '1' || !localStorage.getItem('cookieConsent'));
    sync();
    window.addEventListener('cookie-consent', sync);
    return () => window.removeEventListener('cookie-consent', sync);
  }, [key]);

  if (!enabled || (!title && !text) || dismissed) return null;

  const close = () => {
    if (key) localStorage.setItem(key, '1');
    setDismissed(true);
  };

  const isExternal = /^https?:\/\//.test(ctaHref);
  const href = ctaHref ? (isExternal ? ctaHref : `/${locale}${ctaHref.startsWith('/') ? '' : '/'}${ctaHref}`) : '';

  return (
    <div className="fixed bottom-6 left-6 z-40 w-72 max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-ink/15 animate-in fade-in slide-in-from-bottom-4 dark:border-white/10 dark:bg-[#121c2e]">
      {!image && <div className="bogolan-band" aria-hidden="true" />}
      <button
        onClick={close}
        className={`absolute right-2 z-10 rounded-full p-1 transition-colors ${
          image ? 'top-2 bg-ink/60 text-white hover:bg-ink/80' : 'top-5 text-gray-500 hover:bg-gray-100 hover:text-ink dark:hover:bg-white/10 dark:hover:text-white'
        }`}
        aria-label="Fermer"
      >
        <X className="w-4 h-4" />
      </button>

      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image} alt={title || 'Promotion'} className="w-full h-28 object-cover" />
      )}

      <div className="p-5">
        {title && <p className="mb-1 pr-6 font-display font-bold text-ink dark:text-white">{title}</p>}
        {text && <p className="line-clamp-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">{text}</p>}
        {href && ctaLabel && (
          <div className="mt-4">
            {isExternal ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                {ctaLabel}
              </a>
            ) : (
              <Link
                href={href as Route}
                className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
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
