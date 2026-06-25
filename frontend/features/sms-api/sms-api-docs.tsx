'use client';

import { motion } from 'framer-motion';
import { Book, Code, Send, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function SmsApiDocs() {

  return (
    <div className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center">
            <Book className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            Documentation API SMS
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
            Guide complet pour intégrer notre API SMS dans vos applications
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Navigation</h3>
                <nav className="space-y-2">
                  {['introduction', 'authentication', 'send-sms', 'responses', 'errors', 'examples'].map((item) => (
                    <a
                      key={item}
                      href={`#${item}`}
                      className="block py-2 px-3 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      {item.charAt(0).toUpperCase() + item.slice(1).replace('-', ' ')}
                    </a>
                  ))}
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Content */}
          <div className="lg:col-span-3 space-y-12">
            {/* Introduction */}
            <section id="introduction">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Introduction</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300">
                L'API SMS d'Abdaty Tech vous permet d'envoyer des messages SMS au Mali de manière simple et fiable. Notre API REST est facile à intégrer et offre une livraison rapide en moins de 3 secondes.
              </p>
              <Card className="bg-primary-50 border-primary-200 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <Code className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Base URL</h4>
                      <code className="text-sm bg-white dark:bg-gray-900 px-3 py-1 rounded dark:text-gray-100 transition-colors duration-300">
                        https://api.abdaty-tech.com/v1
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Authentication */}
            <section id="authentication">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Authentification</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300">
                Toutes les requêtes API nécessitent une clé API valide. Vous pouvez obtenir votre clé depuis votre tableau de bord.
              </p>
              <div className="bg-gray-900 rounded-lg p-6">
                <pre className="text-gray-100 overflow-x-auto">
                  <code>{`curl -X POST https://api.abdaty-tech.com/v1/sms/send \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</code>
                </pre>
              </div>
            </section>

            {/* Send SMS */}
            <section id="send-sms">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Envoyer un SMS</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300">
                Endpoint pour envoyer un SMS unique ou en masse.
              </p>
              
              <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white transition-colors duration-300">
                    <Send className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    POST /sms/send
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white transition-colors duration-300">Paramètres</h4>
                  <div className="space-y-2 mb-4">
                    <div className="flex gap-2">
                      <code className="text-sm bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded dark:text-gray-100 transition-colors duration-300">to</code>
                      <span className="text-sm text-gray-600 dark:text-gray-400">string - Numéro de téléphone (+223XXXXXXXX)</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="text-sm bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded dark:text-gray-100 transition-colors duration-300">message</code>
                      <span className="text-sm text-gray-600 dark:text-gray-400">string - Contenu du message (max 160 caractères)</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="text-sm bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded dark:text-gray-100 transition-colors duration-300">sender</code>
                      <span className="text-sm text-gray-600 dark:text-gray-400">string (optionnel) - Nom de l'expéditeur (max 11 caractères)</span>
                    </div>
                  </div>

                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white transition-colors duration-300">Exemple de requête</h4>
                  <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 transition-colors duration-300">
                    <pre className="text-gray-100 dark:text-gray-200 text-sm overflow-x-auto transition-colors duration-300">
                      <code>{`{
  "to": "+223XXXXXXXX",
  "message": "Bonjour de Abdaty Tech!",
  "sender": "AbdatyTech"
}`}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Responses */}
            <section id="responses">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Réponses</h2>
              
              <Card className="mb-4 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white transition-colors duration-300">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    Succès (200)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <pre className="text-gray-100 text-sm overflow-x-auto">
                      <code>{`{
  "success": true,
  "messageId": "msg_abc123",
  "status": "sent",
  "to": "+223XXXXXXXX",
  "cost": 20,
  "currency": "FCFA"
}`}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Errors */}
            <section id="errors">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Codes d'erreur</h2>
              
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <code className="text-sm font-semibold">400 Bad Request</code>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Paramètres invalides ou manquants</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <code className="text-sm font-semibold">401 Unauthorized</code>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Clé API invalide ou manquante</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <code className="text-sm font-semibold">402 Payment Required</code>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Crédits insuffisants</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <code className="text-sm font-semibold">429 Too Many Requests</code>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Limite de taux dépassée</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-1" />
                      <div>
                        <code className="text-sm font-semibold">500 Internal Server Error</code>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Erreur serveur</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Examples */}
            <section id="examples">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Exemples de code</h2>
              
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Node.js</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-gray-100 text-sm overflow-x-auto">
                        <code>{`const axios = require('axios');

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

sendSMS();`}</code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Python</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-900 rounded-lg p-4">
                      <pre className="text-gray-100 text-sm overflow-x-auto">
                        <code>{`import requests

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
print(response.json())`}</code>
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
