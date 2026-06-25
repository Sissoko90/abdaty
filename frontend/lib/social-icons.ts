/**
 * Vocabulaire partagé des réseaux sociaux.
 *
 * L'admin enregistre la plateforme sous forme de chaîne (ex. "facebook").
 * Les composants publics (footer, page contact) résolvent cette chaîne vers
 * l'icône lucide-react correspondante via `resolveSocialIcon`.
 */

import {
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Github,
  Globe,
  Mail,
  MessageCircle,
  Send,
  type LucideIcon,
} from 'lucide-react';

/** Plateformes proposées dans l'admin (valeur → libellé). */
export const SOCIAL_PLATFORMS: { value: string; label: string }[] = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'twitter', label: 'Twitter / X' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'github', label: 'GitHub' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'email', label: 'Email' },
  { value: 'website', label: 'Site web' },
];

const ICONS: Record<string, LucideIcon> = {
  facebook: Facebook,
  twitter: Twitter,
  x: Twitter,
  linkedin: Linkedin,
  instagram: Instagram,
  youtube: Youtube,
  github: Github,
  whatsapp: MessageCircle,
  telegram: Send,
  email: Mail,
  website: Globe,
};

/** Résout une plateforme (insensible à la casse) vers une icône lucide-react. */
export function resolveSocialIcon(platform?: string): LucideIcon {
  if (!platform) return Globe;
  return ICONS[platform.toLowerCase()] ?? Globe;
}

/** Libellé lisible d'une plateforme. */
export function socialLabel(platform?: string): string {
  const p = SOCIAL_PLATFORMS.find((s) => s.value === (platform ?? '').toLowerCase());
  return p?.label ?? (platform ?? '');
}
