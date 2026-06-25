import createNextIntlPlugin from 'next-intl/plugin';

// Chemin explicite vers la configuration de requête (next-intl 3.22+).
const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const isDev = process.env.NODE_ENV !== 'production';

// Origine du backend (pour autoriser images + appels XHR/fetch dans la CSP),
// dérivée de NEXT_PUBLIC_API_URL (ex. http://localhost:8080/api/v1 → :8080).
const backendOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').origin;
  } catch {
    return 'http://localhost:8080';
  }
})();
const backendUrl = new URL(backendOrigin);
// Origine WebSocket du backend (ws:// ou wss://) pour /ws/notifications — doit
// figurer dans connect-src de la CSP, y compris en production.
const backendWsOrigin = backendOrigin.replace(/^http/, 'ws');

// Content-Security-Policy compatible avec Next.js : 'unsafe-inline' est requis
// pour le bootstrap du framework et le script anti-FOUC de thème (à remplacer par
// une CSP à nonce ultérieurement). 'unsafe-eval' n'est toléré qu'en dev.
const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${backendOrigin}`,
  `connect-src 'self' ${backendOrigin} ${backendWsOrigin}${isDev ? ' ws: http://localhost:*' : ''}`,
  "font-src 'self' data:",
  "frame-src 'self'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
  // HSTS seulement en production (jamais sur http://localhost en dev).
  ...(isDev
    ? []
    : [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' }]),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Build autonome (serveur Node minimal) pour une image Docker légère.
  output: 'standalone',
  images: {
    // remotePatterns (et non `domains`, déprécié) : les médias sont servis par le
    // backend. En prod, définir NEXT_PUBLIC_API_URL sur le vrai domaine backend.
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost' },
      {
        protocol: backendUrl.protocol.replace(':', ''),
        hostname: backendUrl.hostname,
        ...(backendUrl.port ? { port: backendUrl.port } : {}),
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // typedRoutes est stable depuis Next 15 (n'est plus sous `experimental`).
  typedRoutes: true,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
