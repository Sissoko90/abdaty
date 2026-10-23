'use client';

import { Code, Send, CheckCircle } from 'lucide-react';
import { PageHero } from '@/components/page-hero';

const sections = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'authentication', label: 'Authentification' },
  { id: 'send-sms', label: 'Envoyer un SMS' },
  { id: 'responses', label: 'Réponses' },
  { id: 'errors', label: "Codes d'erreur" },
  { id: 'examples', label: 'Exemples de code' },
];

const params = [
  { name: 'to', description: 'string - Numéro de téléphone (+223XXXXXXXX)' },
  { name: 'message', description: 'string - Contenu du message (max 160 caractères)' },
  { name: 'sender', description: "string (optionnel) - Nom de l'expéditeur (max 11 caractères)" },
];

const errors = [
  { code: '400 Bad Request', description: 'Paramètres invalides ou manquants' },
  { code: '401 Unauthorized', description: 'Clé API invalide ou manquante' },
  { code: '402 Payment Required', description: 'Crédits insuffisants' },
  { code: '429 Too Many Requests', description: 'Limite de taux dépassée' },
  { code: '500 Internal Server Error', description: 'Erreur serveur' },
];

const h2 = 'mb-4 scroll-mt-28 text-3xl font-bold text-ink dark:text-white';
const lead = 'mb-6 leading-relaxed text-gray-600 dark:text-gray-400';
const card = 'rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]';

/** Panneau de code (fond encre). */
function CodeBlock({ title, children }: { title?: string; children: string }) {
  return (
    <div className="overflow-hidden rounded-2xl bg-ink ring-1 ring-white/10">
      {title && <div className="border-b border-white/10 px-5 py-3 font-mono text-xs text-gray-400">{title}</div>}
      <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-gray-200">
        <code>{children}</code>
      </pre>
    </div>
  );
}

export function SmsApiDocs() {
  return (
    <>
      <PageHero title="Documentation API SMS" subtitle="Guide complet pour intégrer notre API SMS dans vos applications" />

      <section className="py-16 lg:py-20">
        <div className="site-container grid gap-10 lg:grid-cols-12">
          {/* Sommaire */}
          <aside className="lg:col-span-3">
            <nav aria-label="Sommaire" className="sticky top-28 rounded-2xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.03]">
              <ul className="space-y-1">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className="block rounded-xl px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-primary-50 hover:text-primary-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Contenu */}
          <div className="min-w-0 max-w-3xl space-y-16 lg:col-span-9">
            <section id="introduction">
              <h2 className={h2}>Introduction</h2>
              <p className={lead}>
                L&apos;API SMS d&apos;Abdaty Tech vous permet d&apos;envoyer des messages SMS au Mali de manière simple et fiable. Notre API REST est facile à intégrer et offre une livraison rapide en moins de 3 secondes.
              </p>
              <div className={`${card} flex items-start gap-4`}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                  <Code className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="mb-2 font-semibold text-ink dark:text-white">Base URL</h3>
                  <code className="break-all rounded-lg bg-paper px-3 py-1.5 font-mono text-sm text-ink dark:bg-white/5 dark:text-gray-100">
                    https://api.abdaty-tech.com/v1
                  </code>
                </div>
              </div>
            </section>

            <section id="authentication">
              <h2 className={h2}>Authentification</h2>
              <p className={lead}>
                Toutes les requêtes API nécessitent une clé API valide. Vous pouvez obtenir votre clé depuis votre tableau de bord.
              </p>
              <CodeBlock>{`curl -X POST https://api.abdaty-tech.com/v1/sms/send \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</CodeBlock>
            </section>

            <section id="send-sms">
              <h2 className={h2}>Envoyer un SMS</h2>
              <p className={lead}>Endpoint pour envoyer un SMS unique ou en masse.</p>
              <div className={card}>
                <div className="mb-6 flex items-center gap-3">
                  <span className="rounded-md bg-emerald-100 px-2 py-1 font-mono text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                    POST
                  </span>
                  <code className="font-mono font-semibold text-ink dark:text-white">/sms/send</code>
                  <Send className="ml-auto h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="mb-3 font-semibold text-ink dark:text-white">Paramètres</h3>
                <dl className="mb-6 divide-y divide-gray-100 rounded-xl border border-gray-100 dark:divide-white/10 dark:border-white/10">
                  {params.map((p) => (
                    <div key={p.name} className="grid gap-1 px-4 py-3 sm:grid-cols-[8rem_1fr] sm:gap-4">
                      <dt>
                        <code className="font-mono text-sm font-semibold text-primary-700 dark:text-primary-300">{p.name}</code>
                      </dt>
                      <dd className="text-sm text-gray-600 dark:text-gray-400">{p.description}</dd>
                    </div>
                  ))}
                </dl>
                <h3 className="mb-3 font-semibold text-ink dark:text-white">Exemple de requête</h3>
                <CodeBlock>{`{
  "to": "+223XXXXXXXX",
  "message": "Bonjour de Abdaty Tech!",
  "sender": "AbdatyTech"
}`}</CodeBlock>
              </div>
            </section>

            <section id="responses">
              <h2 className={h2}>Réponses</h2>
              <p className="mb-4 flex items-center gap-2 font-semibold text-ink dark:text-white">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                Succès (200)
              </p>
              <CodeBlock>{`{
  "success": true,
  "messageId": "msg_abc123",
  "status": "sent",
  "to": "+223XXXXXXXX",
  "cost": 20,
  "currency": "FCFA"
}`}</CodeBlock>
            </section>

            <section id="errors">
              <h2 className={h2}>Codes d&apos;erreur</h2>
              <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-white/[0.03]">
                {errors.map((e) => (
                  <li key={e.code} className="grid gap-1 px-5 py-4 sm:grid-cols-[14rem_1fr] sm:gap-4">
                    <code className="font-mono text-sm font-semibold text-primary-700 dark:text-primary-300">{e.code}</code>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{e.description}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section id="examples">
              <h2 className={h2}>Exemples de code</h2>
              <div className="space-y-6">
                <CodeBlock title="Node.js">{`const axios = require('axios');

const sendSMS = async () => {
  try {
    const response = await axios.post(
      'https://api.abdaty-tech.com/v1/sms/send',
      {
        to: '+223XXXXXXXX',
        message: 'Hello from Abdaty!',
        sender: 'AbdatyTech'
      },
      {
        headers: {
          'Authorization': 'Bearer YOUR_API_KEY',
          'Content-Type': 'application/json'
        }
      }
    );
    console.log(response.data);
  } catch (error) {
    console.error(error.response.data);
  }
};

sendSMS();`}</CodeBlock>
                <CodeBlock title="Python">{`import requests

url = 'https://api.abdaty-tech.com/v1/sms/send'
headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}
data = {
    'to': '+223XXXXXXXX',
    'message': 'Hello from Abdaty!',
    'sender': 'AbdatyTech'
}

response = requests.post(url, json=data, headers=headers)
print(response.json())`}</CodeBlock>
              </div>
            </section>
          </div>
        </div>
      </section>
    </>
  );
}
