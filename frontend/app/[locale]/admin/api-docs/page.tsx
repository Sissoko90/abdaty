'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import {
  FileCode,
  Download,
  ExternalLink,
  Code,
  Key,
  Shield,
  Zap,
  Loader2,
} from 'lucide-react';
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

export default function AdminAPIDocsPage() {
  const t = useTranslations('admin.apiDocs');
  const tBreadcrumb = useTranslations('admin.breadcrumb');
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [endpoints, setEndpoints] = useState<Endpoint[]>(FALLBACK_ENDPOINTS);
  const [live, setLive] = useState(false);
  const [spec, setSpec] = useState<Record<string, unknown> | null>(null);

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

  const getMethodBadge = (method: string) => {
    const variants: Record<string, string> = {
      GET: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      POST: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      PUT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      DELETE: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    };
    return (
      <span className={`px-2 py-1 rounded text-xs font-mono font-medium ${variants[method] || variants.GET}`}>
        {method}
      </span>
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: tBreadcrumb('dashboard'), href: `/admin` },
            { label: tBreadcrumb('admin'), href: `/admin` },
            { label: t('title') },
          ]}
        />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FileCode className="w-8 h-8" />
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('subtitle')}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <FileCode className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t('swaggerUI')}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('interactive')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Download className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t('downloadSpec')}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">OpenAPI 3.0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t('apiKeys')}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{t('manage')}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700 hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t('authentication')}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">OAuth 2.0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Swagger UI Embed */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                {t('swaggerUI')}
              </CardTitle>
              <Badge variant="secondary" className="gap-1">
                <Shield className="w-3 h-3" /> Admin uniquement
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {spec ? (
              // Swagger UI interactif embarqué : admin-only (panel protégé) + jeton
              // injecté automatiquement dans les requêtes « Try it out ».
              <div className="bg-white rounded-lg border border-gray-200 dark:border-gray-700 overflow-auto swagger-embed">
                <SwaggerUI spec={spec} requestInterceptor={requestInterceptor} docExpansion="none" />
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-center h-96">
                  <div className="text-center max-w-md">
                    <Loader2 className="w-10 h-10 text-gray-400 mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Chargement sécurisé de la documentation OpenAPI (réservée aux administrateurs)…
                    </p>
                    <p className="text-xs text-gray-500">
                      Si rien ne s'affiche, vérifiez que le backend est démarré (Swagger doit être activé).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{t('endpoints')} ({endpoints.length})</CardTitle>
              <Badge variant={live ? 'default' : 'secondary'}>
                {live ? 'OpenAPI live' : 'Liste de repli'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {endpoints.map((endpoint, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {getMethodBadge(endpoint.method)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono text-gray-900 dark:text-white">
                          {endpoint.path}
                        </code>
                        <Badge variant="outline">{endpoint.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {endpoint.description}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* API Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalEndpoints')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{endpoints.length}</p>
                </div>
                <Code className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('apiVersion')}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">v1.0</p>
                </div>
                <Zap className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('apiStatus')}</p>
                  <p className="text-2xl font-bold text-green-600">{t('operational')}</p>
                </div>
                <Shield className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
