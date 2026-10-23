'use client';

import { FileCode, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHero } from '@/components/page-hero';

const endpoints = [
  { method: 'POST', path: '/v1/sms/send', label: 'Envoyer un SMS' },
  { method: 'GET', path: '/v1/sms/status/:id', label: "Statut d'un SMS" },
  { method: 'GET', path: '/v1/sms/balance', label: 'Solde du compte' },
  { method: 'GET', path: '/v1/sms/history', label: 'Historique des SMS' },
];

export function SmsApiSwagger() {
  return (
    <>
      <PageHero title="Swagger API Documentation" subtitle="Documentation interactive de l'API SMS avec Swagger UI" />

      <section className="py-16 lg:py-20">
        <div className="site-container grid gap-5 lg:grid-cols-12">
          <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-white/10 dark:bg-white/[0.03] lg:col-span-5">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
              <FileCode className="h-6 w-6" />
            </div>
            <h2 className="mb-3 text-2xl font-bold text-ink dark:text-white">Swagger UI</h2>
            <p className="mb-8 leading-relaxed text-gray-600 dark:text-gray-400">
              L&apos;interface Swagger UI interactive sera disponible ici. Elle vous permettra de tester directement les endpoints de l&apos;API SMS.
            </p>

            <h3 className="mb-3 font-semibold text-ink dark:text-white">Endpoints disponibles :</h3>
            <ul className="mb-8 divide-y divide-gray-100 rounded-xl border border-gray-100 dark:divide-white/10 dark:border-white/10">
              {endpoints.map((e) => (
                <li key={e.path} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <span
                    className={`w-14 rounded-md py-1 text-center font-mono text-xs font-bold ${
                      e.method === 'POST'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                        : 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400'
                    }`}
                  >
                    {e.method}
                  </span>
                  <code className="font-mono text-sm text-ink dark:text-white">{e.path}</code>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{e.label}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col xl:flex-row">
              <Button size="lg">
                <ExternalLink className="mr-2 h-4 w-4" />
                Voir la documentation complète
              </Button>
              <Button size="lg" variant="outline" className="dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10">
                Télécharger OpenAPI Spec
              </Button>
            </div>
          </div>

          <div className="min-w-0 overflow-hidden rounded-2xl bg-ink ring-1 ring-white/10 lg:col-span-7">
            <div className="border-b border-white/10 px-5 py-3 font-mono text-xs text-gray-400">Spécification OpenAPI 3.0</div>
            <pre className="max-h-[640px] overflow-auto p-5 font-mono text-[13px] leading-relaxed text-gray-200">
              <code>{`openapi: 3.0.0
info:
  title: Abdaty SMS API
  version: 1.0.0
  description: API pour envoyer des SMS au Mali
  contact:
    email: support@abdaty-tech.com

servers:
  - url: https://api.abdaty-tech.com/v1
    description: Production server

paths:
  /sms/send:
    post:
      summary: Envoyer un SMS
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - to
                - message
              properties:
                to:
                  type: string
                  example: "+223XXXXXXXX"
                message:
                  type: string
                  maxLength: 160
                sender:
                  type: string
                  maxLength: 11
      responses:
        '200':
          description: SMS envoyé avec succès
        '400':
          description: Paramètres invalides
        '401':
          description: Non autorisé

components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer`}</code>
            </pre>
          </div>
        </div>
      </section>
    </>
  );
}
