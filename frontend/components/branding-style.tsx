'use client';

import { useEffect } from 'react';
import { useBranding } from '@/hooks/use-branding';
import { buildShades, hexToHslString } from '@/lib/color';

/**
 * Applique la couleur primaire (et secondaire) gérée dans l'admin sous forme de
 * variables CSS sur :root. Comme Tailwind référence ces variables (`--primary-*`,
 * `--primary`, `--secondary`), le changement se répercute PARTOUT : site vitrine
 * ET panel admin. Monté une fois dans le layout racine. Ne rend rien.
 */
export function BrandingStyle() {
  const { primaryColor, secondaryColor } = useBranding();

  useEffect(() => {
    const root = document.documentElement;
    if (primaryColor && /^#?[0-9a-fA-F]{3,6}$/.test(primaryColor)) {
      const hex = primaryColor.startsWith('#') ? primaryColor : `#${primaryColor}`;
      const shades = buildShades(hex);
      Object.entries(shades).forEach(([k, v]) => root.style.setProperty(`--primary-${k}`, v));
      const hsl = hexToHslString(hex);
      // DEFAULT (boutons shadcn) utilise hsl(var(--primary)).
      root.style.setProperty('--primary', hsl);
      // --ring : anneau de focus des champs (inputs login/register, etc.).
      root.style.setProperty('--ring', hsl);
    }
    if (secondaryColor && /^#?[0-9a-fA-F]{3,6}$/.test(secondaryColor)) {
      const hex = secondaryColor.startsWith('#') ? secondaryColor : `#${secondaryColor}`;
      root.style.setProperty('--secondary', hexToHslString(hex));
    }
  }, [primaryColor, secondaryColor]);

  return null;
}
