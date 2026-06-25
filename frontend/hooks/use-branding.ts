'use client';

import { usePublicSection } from '@/hooks/use-public-content';
import { mediaUrl } from '@/services/content.service';

/**
 * Identité visuelle gérée dans l'admin (section "branding") : logo et mode
 * d'apparence par défaut. Consommé par la navbar, le footer, etc.
 *
 * Le logo par défaut `/logo.png` est un fichier statique du frontend ; un logo
 * uploadé est servi sous `/uploads/...` (backend) → résolu via `mediaUrl`.
 */
export function useBranding() {
  // Le logo et le mode sont des champs PARTAGÉS (stockés en valueFr uniquement).
  // On lit donc la valeur brute du bloc — pas via cv() qui dépend de la locale
  // (sinon le logo serait vide sur la version anglaise).
  const { blocks } = usePublicSection('branding');
  // Champ partagé stocké en valueFr. Vide => logo par défaut (pas de repli valueEn
  // qui pourrait réafficher un ancien logo après réinitialisation).
  const rawLogo = (blocks.logo?.valueFr || '').trim();
  const logo = rawLogo ? mediaUrl(rawLogo) : '/logo.png';
  const defaultMode = blocks.defaultMode?.valueFr || 'system'; // light | dark | system
  const primaryColor = (blocks.primaryColor?.valueFr || '').trim(); // hex ou vide
  const secondaryColor = (blocks.secondaryColor?.valueFr || '').trim();
  return { logo, defaultMode, primaryColor, secondaryColor };
}
