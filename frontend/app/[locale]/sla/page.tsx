'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Shield, Clock, Headphones, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePublicSection } from '@/hooks/use-public-content';

export default function SLAPage() {
  const t = useTranslations('sla');
  // Titre / sous-titre gérés dans l'admin (section "sla"), avec repli i18n.
  const { cv } = usePublicSection('sla');

  return (
    <>
      <main>
        <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
              {cv('title', t('title'))}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto transition-colors duration-300">
              {cv('subtitle', t('subtitle'))}
            </p>
          </div>
        </section>

        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 transition-colors duration-300">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <Card className="border-2 hover:border-primary-200 dark:border-gray-700 dark:hover:border-primary-400 dark:bg-gray-800 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {t('uptime.percentage')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{t('uptime.description')}</p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary-200 dark:border-gray-700 dark:hover:border-primary-400 dark:bg-gray-800 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                    <RefreshCw className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {t('response.time')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{t('response.description')}</p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary-200 dark:border-gray-700 dark:hover:border-primary-400 dark:bg-gray-800 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                    <Headphones className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {t('support.hours')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{t('support.description')}</p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary-200 dark:border-gray-700 dark:hover:border-primary-400 dark:bg-gray-800 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center mb-4">
                    <Shield className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <CardTitle className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {t('security.level')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300">{t('security.description')}</p>
                </CardContent>
              </Card>
            </div>

            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center transition-colors duration-300">
                {t('serviceLevels.title')}
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-900 dark:text-white transition-colors duration-300">{t('serviceLevels.standard.title')}</CardTitle>
                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-2 transition-colors duration-300">
                      {t('serviceLevels.standard.uptime')}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5 transition-colors duration-300" />
                        <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{t('serviceLevels.standard.feature1')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5 transition-colors duration-300" />
                        <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{t('serviceLevels.standard.feature2')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5 transition-colors duration-300" />
                        <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{t('serviceLevels.standard.feature3')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5 transition-colors duration-300" />
                        <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{t('serviceLevels.standard.feature4')}</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 border-primary-500 relative dark:border-primary-600 dark:bg-gray-800 transition-colors">
                  <div className="absolute top-0 right-0 bg-primary-500 dark:bg-primary-600 text-white px-3 py-1 text-sm font-medium transition-colors duration-300">
                    {t('serviceLevels.popular')}
                  </div>
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-900 dark:text-white transition-colors duration-300">{t('serviceLevels.professional.title')}</CardTitle>
                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-2 transition-colors duration-300">
                      {t('serviceLevels.professional.uptime')}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5 transition-colors duration-300" />
                        <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{t('serviceLevels.professional.feature1')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5 transition-colors duration-300" />
                        <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{t('serviceLevels.professional.feature2')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5 transition-colors duration-300" />
                        <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{t('serviceLevels.professional.feature3')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5 transition-colors duration-300" />
                        <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{t('serviceLevels.professional.feature4')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5 transition-colors duration-300" />
                        <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{t('serviceLevels.professional.feature5')}</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="border-2 border-gray-200 dark:border-gray-700 dark:bg-gray-800 transition-colors">
                  <CardHeader>
                    <CardTitle className="text-2xl text-gray-900 dark:text-white transition-colors duration-300">{t('serviceLevels.enterprise.title')}</CardTitle>
                    <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-2 transition-colors duration-300">
                      {t('serviceLevels.enterprise.uptime')}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5 transition-colors duration-300" />
                        <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{t('serviceLevels.enterprise.feature1')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5 transition-colors duration-300" />
                        <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{t('serviceLevels.enterprise.feature2')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5 transition-colors duration-300" />
                        <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{t('serviceLevels.enterprise.feature3')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5 transition-colors duration-300" />
                        <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{t('serviceLevels.enterprise.feature4')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5 transition-colors duration-300" />
                        <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{t('serviceLevels.enterprise.feature5')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5 transition-colors duration-300" />
                        <span className="text-gray-600 dark:text-gray-300 transition-colors duration-300">{t('serviceLevels.enterprise.feature6')}</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center transition-colors duration-300">
                {t('guarantees.title')}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="dark:bg-gray-800 dark:border-gray-700 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Shield className="w-8 h-8 text-primary-600 dark:text-primary-400 transition-colors duration-300" />
                      <CardTitle className="text-xl text-gray-900 dark:text-white transition-colors duration-300">{t('guarantees.dataProtection.title')}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">{t('guarantees.dataProtection.description')}</p>
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <RefreshCw className="w-8 h-8 text-primary-600 dark:text-primary-400 transition-colors duration-300" />
                      <CardTitle className="text-xl text-gray-900 dark:text-white transition-colors duration-300">{t('guarantees.backups.title')}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">{t('guarantees.backups.description')}</p>
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Headphones className="w-8 h-8 text-primary-600 dark:text-primary-400 transition-colors duration-300" />
                      <CardTitle className="text-xl text-gray-900 dark:text-white transition-colors duration-300">{t('guarantees.support.title')}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">{t('guarantees.support.description')}</p>
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-800 dark:border-gray-700 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-8 h-8 text-primary-600 dark:text-primary-400 transition-colors duration-300" />
                      <CardTitle className="text-xl text-gray-900 dark:text-white transition-colors duration-300">{t('guarantees.incidentResponse.title')}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">{t('guarantees.incidentResponse.description')}</p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Card className="bg-gradient-to-br from-primary-600 to-primary-700 text-white border-0 dark:from-primary-700 dark:to-primary-800 transition-colors duration-300">
              <CardContent className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">{t('cta.title')}</h2>
                <p className="text-primary-100 mb-6">{t('cta.description')}</p>
                <Link href="/contact" className="inline-block bg-white dark:bg-gray-200 text-primary-600 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 dark:hover:bg-gray-300 transition-colors duration-300">
                  {t('cta.button')}
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}
