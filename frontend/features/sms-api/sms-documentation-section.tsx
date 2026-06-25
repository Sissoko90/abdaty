'use client';

import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code } from 'lucide-react';
import { motion } from 'framer-motion';

export function SMSDocumentationSection() {
  const t = useTranslations('smsApi');
  const locale = useLocale();

  const codeExample = `curl -X POST https://api.abdaty-tech.com/v1/sms/send \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+243123456789",
    "message": "Hello from Abdaty Technologie!",
    "from": "AbdatyTech"
  }'`;

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('integration.title')}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-300">{t('integration.description')}</p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white transition-colors duration-300">
                  <Code className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" />
                  {t('integration.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm dark:bg-gray-950 dark:text-gray-200 transition-colors duration-300">
                  <code>{codeExample}</code>
                </pre>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Card className="h-full flex flex-col justify-center dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white transition-colors duration-300">{t('documentation.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">{t('documentation.subtitle')}</p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href={`/${locale}/sms-api/docs`} className="flex-1">
                    <Button className="w-full dark:bg-primary-600 dark:hover:bg-primary-700 transition-colors duration-300">{t('documentation.viewDocs')}</Button>
                  </Link>
                  <Link href={`/${locale}/sms-api/swagger`} className="flex-1">
                    <Button variant="outline" className="w-full dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white transition-colors duration-300">
                      {t('documentation.tryNow')}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
