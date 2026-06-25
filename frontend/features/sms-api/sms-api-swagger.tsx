'use client';

import { motion } from 'framer-motion';
import { FileCode, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function SmsApiSwagger() {
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
            <FileCode className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
            Swagger API Documentation
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
            Documentation interactive de l'API SMS avec Swagger UI
          </p>
        </motion.div>

        {/* Swagger UI Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-8">
              <div className="text-center py-20">
                <FileCode className="w-24 h-24 mx-auto mb-6 text-gray-300" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">
                  Swagger UI
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto transition-colors duration-300">
                  L'interface Swagger UI interactive sera disponible ici. Elle vous permettra de tester directement les endpoints de l'API SMS.
                </p>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 max-w-2xl mx-auto">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Endpoints disponibles :</h3>
                    <ul className="text-left space-y-2 text-gray-600 dark:text-gray-400 transition-colors duration-300">
                      <li className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-mono">POST</span>
                        <code className="text-sm">/v1/sms/send</code>
                        <span className="text-sm">- Envoyer un SMS</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">GET</span>
                        <code className="text-sm">/v1/sms/status/:id</code>
                        <span className="text-sm">- Statut d'un SMS</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">GET</span>
                        <code className="text-sm">/v1/sms/balance</code>
                        <span className="text-sm">- Solde du compte</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">GET</span>
                        <code className="text-sm">/v1/sms/history</code>
                        <span className="text-sm">- Historique des SMS</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <Button size="lg">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Voir la documentation complète
                    </Button>
                    <Button size="lg" variant="outline">
                      Télécharger OpenAPI Spec
                    </Button>
                  </div>
                </div>
              </div>

              {/* OpenAPI Spec Preview */}
              <div className="mt-12 border-t pt-8">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Spécification OpenAPI 3.0</h3>
                <div className="bg-gray-900 rounded-lg p-6">
                  <pre className="text-gray-100 text-sm overflow-x-auto">
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
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
