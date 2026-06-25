import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * robots.txt — politique de crawl.
 *
 * On AUTORISE explicitement les crawlers d'IA / de recherche générative (agentic
 * search de Google, AI Overviews, ChatGPT Search, Perplexity, Gemini, Claude…)
 * afin que le site puisse être indexé ET cité par ces moteurs (GEO/AIO). Les
 * zones privées (API, back-office, espaces connectés) restent interdites pour tous.
 */
const DISALLOW = [
  '/api/',
  '/admin/',
  '/_next/',
  '/fr/login',
  '/en/login',
  '/fr/dashboard',
  '/en/dashboard',
];

// Crawlers IA / recherche générative explicitement bienvenus.
const AI_AGENTS = [
  'Googlebot',
  'Google-Extended', // Gemini / Vertex AI
  'GPTBot', // OpenAI (entraînement)
  'OAI-SearchBot', // ChatGPT Search
  'ChatGPT-User', // navigation ChatGPT
  'ClaudeBot',
  'anthropic-ai',
  'Claude-Web',
  'PerplexityBot',
  'Perplexity-User',
  'Applebot',
  'Applebot-Extended',
  'Bingbot',
  'CCBot', // Common Crawl (alimente de nombreux LLM)
  'Amazonbot',
  'Meta-ExternalAgent',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Règle générique (tous les autres robots).
      { userAgent: '*', allow: '/', disallow: DISALLOW },
      // Règles nommées : on signale explicitement notre accueil aux agents IA.
      ...AI_AGENTS.map((userAgent) => ({ userAgent, allow: '/', disallow: DISALLOW })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
