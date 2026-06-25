/**
 * Utilitaires couleur pour le thème dynamique : génération d'une palette de
 * nuances (50–900) à partir d'une couleur de base, et conversion hex → HSL.
 */

function clamp(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('');
}

/** Mélange deux couleurs (t = part de `b`, 0→a, 1→b). */
function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return rgbToHex(r1 + (r2 - r1) * t, g1 + (g2 - g1) * t, b1 + (b2 - b1) * t);
}

/**
 * Construit une palette 50–900 à partir d'une couleur de base (considérée comme
 * la nuance 500). Les nuances claires sont mélangées au blanc, les foncées au noir.
 */
export function buildShades(base: string): Record<string, string> {
  const W = '#ffffff';
  const B = '#000000';
  return {
    '50': mix(base, W, 0.92),
    '100': mix(base, W, 0.84),
    '200': mix(base, W, 0.66),
    '300': mix(base, W, 0.48),
    '400': mix(base, W, 0.24),
    '500': base,
    '600': mix(base, B, 0.12),
    '700': mix(base, B, 0.28),
    '800': mix(base, B, 0.44),
    '900': mix(base, B, 0.58),
    '950': mix(base, B, 0.72),
  };
}

/** Convertit un hex en triplet HSL au format CSS « H S% L% » (pour les variables hsl()). */
export function hexToHslString(hex: string): string {
  let [r, g, b] = hexToRgb(hex);
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }
  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
