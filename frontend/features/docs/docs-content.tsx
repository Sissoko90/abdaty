'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Code } from 'lucide-react';

export function DocsContent() {
  const t = useTranslations('docs.content');

  return (
    <div className="prose prose-lg max-w-none">
      <section id="introduction" className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('introduction.title')}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-300">{t('introduction.description')}</p>
        
        <Card className="bg-primary-50 border-primary-200 dark:bg-gray-800 dark:border-gray-700 transition-colors duration-300">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Code className="w-6 h-6 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{t('introduction.note.title')}</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">{t('introduction.note.text')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section id="installation" className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('installation.title')}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-300">{t('installation.description')}</p>
        
        <div className="bg-gray-900 rounded-lg p-6 mb-6">
          <pre className="text-gray-100 overflow-x-auto">
            <code>{`npm install abdaty-sdk\n# or\nyarn add abdaty-sdk`}</code>
          </pre>
        </div>
      </section>

      <section id="quickstart" className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('quickstart.title')}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-300">{t('quickstart.description')}</p>
        
        <div className="bg-gray-900 rounded-lg p-6">
          <pre className="text-gray-100 overflow-x-auto">
            <code>{`import { AbdatyClient } from 'abdaty-sdk';

const client = new AbdatyClient({
  apiKey: 'your-api-key'
});

// Send SMS
await client.sms.send({
  to: '+223XXXXXXXX',
  message: 'Hello from Abdaty!'
});`}</code>
          </pre>
        </div>
      </section>

      <section id="authentication" className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('authentication.title')}</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 transition-colors duration-300">{t('authentication.description')}</p>
      </section>
    </div>
  );
}
