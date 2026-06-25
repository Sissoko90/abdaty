'use client';

import { useEffect, useState } from 'react';

/**
 * Assainit du HTML arbitraire avec DOMPurify avant injection via
 * `dangerouslySetInnerHTML`, empêchant tout XSS stocké (scripts, handlers
 * d'événements, etc.).
 *
 * DOMPurify est importé DYNAMIQUEMENT (et exécuté dans un effet) : il dépend du
 * DOM, donc on ne l'évalue jamais côté serveur. Tant que la sanitisation n'a pas
 * eu lieu, on renvoie une chaîne vide (aucun HTML brut n'est rendu).
 */
export function useSanitizedHtml(dirty: string | undefined | null): string {
  const [clean, setClean] = useState('');

  useEffect(() => {
    let active = true;
    import('dompurify').then((mod) => {
      const DOMPurify = mod.default;
      const sanitized = DOMPurify.sanitize(dirty || '', { USE_PROFILES: { html: true } });
      if (active) setClean(sanitized);
    });
    return () => {
      active = false;
    };
  }, [dirty]);

  return clean;
}
