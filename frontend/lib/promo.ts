/**
 * Types et helpers partagés pour les promotions (bannière à slides + carte coin).
 */

/** Un « slide » de la bannière promotionnelle (rotation). */
export interface PromoSlide {
  id: string;
  textFr: string;
  textEn: string;
  ctaFr: string;
  ctaEn: string;
  href: string;
  bg: string; // couleur/gradient de fond (optionnel)
  start: string; // date de début YYYY-MM-DD (optionnel)
  end: string; // date de fin YYYY-MM-DD (optionnel, incluse)
}

/** Slide vide (pour l'ajout d'une nouvelle ligne dans l'admin). */
export function emptySlide(): PromoSlide {
  let id: string;
  try {
    id = crypto.randomUUID();
  } catch {
    id = `s_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  }
  return { id, textFr: '', textEn: '', ctaFr: '', ctaEn: '', href: '', bg: '', start: '', end: '' };
}

/** Parse en sécurité un tableau de slides depuis une chaîne JSON. */
export function parseSlides(raw?: string | null): PromoSlide[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as PromoSlide[]) : [];
  } catch {
    return [];
  }
}

/**
 * Indique si une campagne est active à l'instant présent, selon ses dates de
 * début/fin (au format YYYY-MM-DD). Champs vides = pas de borne.
 */
export function isActiveNow(start?: string, end?: string): boolean {
  const now = Date.now();
  if (start) {
    const s = Date.parse(start); // minuit (début de journée)
    if (!Number.isNaN(s) && now < s) return false;
  }
  if (end) {
    const e = Date.parse(`${end}T23:59:59`); // fin de journée incluse
    if (!Number.isNaN(e) && now > e) return false;
  }
  return true;
}
