/**
 * Vocabulaire d'icônes partagé pour les services.
 *
 * L'admin enregistre l'icône d'un service sous forme de chaîne (ex. "Network").
 * Les composants publics (grille, page détail, navbar) résolvent cette chaîne
 * vers le composant lucide-react correspondant via `resolveServiceIcon`.
 *
 * La résolution est insensible à la casse et tolère quelques alias historiques,
 * afin d'éviter tout décalage de vocabulaire entre l'admin et le site vitrine.
 */

import {
  Code,
  Smartphone,
  Monitor,
  Palette,
  Network,
  Shield,
  Brain,
  Globe,
  Lock,
  TabletSmartphone,
  Server,
  Database,
  Cpu,
  Cloud,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

/** Table principale nom → composant icône. */
export const SERVICE_ICONS: Record<string, LucideIcon> = {
  Code,
  Smartphone,
  Monitor,
  Palette,
  Network,
  Shield,
  Brain,
  Globe,
  Lock,
  TabletSmartphone,
  Server,
  Database,
  Cpu,
  Cloud,
  TrendingUp,
};

/** Alias (en minuscules) tolérés pour d'anciens libellés. */
const ALIASES: Record<string, LucideIcon> = {
  mobile: Smartphone,
  desktop: Monitor,
  design: Palette,
  security: Shield,
  data: TrendingUp,
  ai: Brain,
  web: Code,
  infrastructure: Network,
};

/**
 * Résout un nom d'icône (insensible à la casse) vers un composant lucide-react.
 * Retourne `fallback` (Code par défaut) si le nom est inconnu.
 */
export function resolveServiceIcon(name?: string, fallback: LucideIcon = Code): LucideIcon {
  if (!name) return fallback;
  const direct = SERVICE_ICONS[name];
  if (direct) return direct;
  const lower = name.toLowerCase();
  const ci = Object.entries(SERVICE_ICONS).find(([k]) => k.toLowerCase() === lower);
  if (ci) return ci[1];
  return ALIASES[lower] ?? fallback;
}
