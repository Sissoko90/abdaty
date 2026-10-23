'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FileCode, Download, Code, Shield, Zap, Loader2, Layers } from 'lucide-react';
import { AdminPage, AdminPageHeader, AdminStatCard } from '@/components/admin/admin-page';
import { BACKEND_ORIGIN } from '@/lib/api';
import 'swagger-ui-react/swagger-ui.css';

// Swagger UI chargé uniquement côté client (pas de SSR).
const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

interface Endpoint {
  method: string;
  path: string;
  description: string;
  category: string;
}

/** Forme minimale d'une opération OpenAPI (ce qu'on lit du spec springdoc). */
type OpenApiOp = { summary?: string; description?: string; tags?: string[] };

/** Repli si l'OpenAPI live n'est pas joignable (reflète les vrais controllers). */
const FALLBACK_ENDPOINTS: Endpoint[] = [
  { method: 'POST', path: '/api/v1/auth/login', description: 'Authentification, renvoie un token JWT', category: 'Auth' },
  { method: 'POST', path: '/api/v1/auth/register', description: 'Création de compte', category: 'Auth' },
  { method: 'GET', path: '/api/v1/users', description: 'Liste des utilisateurs', category: 'Users' },
  { method: 'GET', path: '/api/v1/blog', description: 'Articles publiés', category: 'Blog' },
  { method: 'GET', path: '/api/v1/content/section/{section}', description: 'Contenu éditorial d’une section', category: 'Content' },
  { method: 'POST', path: '/api/v1/newsletter/subscribe', description: 'Inscription newsletter', category: 'Newsletter' },
  { method: 'GET', path: '/api/v1/suspicious-ips', description: 'IPs suspectes', category: 'Security' },
  { method: 'GET', path: '/api/v1/geo-blocking', description: 'Règles de blocage géographique', category: 'Security' },
  { method: 'GET', path: '/api/v1/logs', description: 'Journaux applicatifs', category: 'Monitoring' },
  { method: 'GET', path: '/api/v1/system-metrics', description: 'Métriques système', category: 'Monitoring' },
];

const METHOD_STYLES: Record<string, string> = {
  GET: 'bg-sky-50 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300',
  POST: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  PUT: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  PATCH: 'bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  DELETE: 'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300',
};

export default function AdminAPIDocsPage() {
  const t = useTranslations('admin.apiDocs');
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [endpoints, setEndpoints] = useState<Endpoint[]>(FALLBACK_ENDPOINTS);
  const [live, setLive] = useState(false);
  const [spec, setSpec] = useState<Record<string, unknown> | null>(null);
  const [specUrl, setSpecUrl] = useState<string | null>(null);

  // Récupère le spec OpenAPI réel du backend (springdoc) et en extrait les routes.
  useEffect(() => {
    let cancelled = false;
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    const tryUrls = [`${BACKEND_ORIGIN}/v3/api-docs`, `${BACKEND_ORIGIN}/api-docs`];
    (async () => {
      for (const url of tryUrls) {
        try {
          const res = await fetch(url, { headers });
          if (!res.ok) continue;
          const data = await res.json();
          if (!data?.paths) continue;
          const list: Endpoint[] = [];
          for (const [path, methods] of Object.entries<Record<string, OpenApiOp>>(data.paths)) {
            for (const [method, op] of Object.entries<OpenApiOp>(methods)) {
              if (!['get', 'post', 'put', 'patch', 'delete'].includes(method)) continue;
              list.push({
                method: method.toUpperCase(),
                path,
                description: op?.summary || op?.description || '',
                category: (op?.tags && op.tags[0]) || 'API',
              });
            }
          }
          if (!cancelled && list.length > 0) {
            list.sort((a, b) => a.category.localeCompare(b.category) || a.path.localeCompare(b.path));
            setEndpoints(list);
            setSpec(data);
            setSpecUrl(url);
            setLive(true);
          }
          return;
        } catch {
          /* essaie l'URL suivante */
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  // Injecte le jeton admin dans chaque requête « Try it out » du Swagger UI.
  // Le type Request de swagger-ui-react n'est pas exporté → any toléré ici.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const requestInterceptor = (req: any) => {
    if (token) req.headers['Authorization'] = `Bearer ${token}`;
    return req;
  };

  const categories = new Set(endpoints.map((e) => e.category)).size;
  const version = (spec?.info as { version?: string } | undefined)?.version || 'v1.0';

  return (
    <AdminPage>
      <AdminPageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={FileCode}
        actions={
          specUrl ? (
            // Téléchargement du spec OpenAPI réellement chargé (avant : carte sans action).
            <a href={specUrl} target="_blank" rel="noopener noreferrer" download="openapi.json" className={cn(buttonVariants({ variant: 'outline' }), 'gap-2')}>
              <Download className="h-4 w-4" />
              {t('downloadSpec')}
            </a>
          ) : undefined
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard label={t('totalEndpoints')} value={endpoints.length} icon={Code} tone="ink" />
        <AdminStatCard label={t('categories')} value={categories} icon={Layers} tone="primary" />
        <AdminStatCard label={t('apiVersion')} value={version} icon={Zap} tone="ochre" />
        <AdminStatCard
          label={t('apiStatus')}
          value={live ? t('operational') : '—'}
          icon={Shield}
          tone="emerald"
          hint={live ? 'OpenAPI live' : 'Liste de repli (backend injoignable)'}
        />
      </div>

      {/* Swagger UI Embed */}
      <section className="rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 p-6 dark:border-white/5">
          <div>
            <h2 className="text-lg font-bold text-ink dark:text-white">{t('swaggerUI')}</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{t('interactive')}</p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <Shield className="h-3 w-3" /> Admin uniquement
          </Badge>
        </div>
        <div className="p-4 sm:p-6">
          {spec ? (
            // Swagger UI interactif embarqué : admin-only (panel protégé) + jeton
            // injecté automatiquement dans les requêtes « Try it out ».
            <div className="swagger-embed overflow-auto rounded-xl border border-gray-200 bg-white dark:border-white/10">
              <SwaggerUI spec={spec} requestInterceptor={requestInterceptor} docExpansion="none" />
            </div>
          ) : (
            <div className="flex h-72 items-center justify-center rounded-xl border border-dashed border-gray-300 dark:border-white/15">
              <div className="max-w-md px-6 text-center">
                <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary-500" />
                <p className="mb-2 text-sm text-gray-700 dark:text-gray-300">
                  Chargement sécurisé de la documentation OpenAPI (réservée aux administrateurs)…
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Si rien ne s&apos;affiche, vérifiez que le backend est démarré (Swagger doit être activé).
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* API Endpoints */}
      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 p-6 dark:border-white/5">
          <h2 className="text-lg font-bold text-ink dark:text-white">
            {t('endpoints')} <span className="font-normal text-gray-500 dark:text-gray-400">({endpoints.length})</span>
          </h2>
          <Badge variant={live ? 'success' : 'secondary'}>{live ? 'OpenAPI live' : 'Liste de repli'}</Badge>
        </div>
        <ul className="divide-y divide-gray-100 dark:divide-white/5">
          {endpoints.map((endpoint, index) => (
            <li key={index} className="flex flex-col gap-2 px-6 py-4 transition-colors hover:bg-gray-50/70 dark:hover:bg-white/[0.02] sm:flex-row sm:items-center sm:gap-4">
              <span
                className={`inline-flex w-16 shrink-0 justify-center rounded-md px-2 py-1 font-mono text-xs font-semibold ${METHOD_STYLES[endpoint.method] || METHOD_STYLES.GET}`}
              >
                {endpoint.method}
              </span>
              <div className="min-w-0 flex-1">
                <code className="break-all font-mono text-sm text-ink dark:text-white">{endpoint.path}</code>
                {endpoint.description && <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">{endpoint.description}</p>}
              </div>
              <Badge variant="outline" className="w-fit shrink-0">
                {endpoint.category}
              </Badge>
            </li>
          ))}
        </ul>
      </section>
    </AdminPage>
  );
}
