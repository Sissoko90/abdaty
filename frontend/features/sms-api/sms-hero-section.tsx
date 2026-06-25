'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Zap, MessageSquare, Shield, ArrowRight, Smartphone, MapPin, Book, Code } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { AnimatedBlobRed } from '@/components/animated-blob-red';
import { VibrantBg } from '@/components/vibrant-bg';

export function SMSHeroSection() {
  const t = useTranslations('smsApi');
  const locale = useLocale();

  const features = [
    { icon: CheckCircle, key: 'reliable', color: 'from-green-500 to-emerald-500' },
    { icon: MessageSquare, key: 'mali', color: 'from-primary-500 to-primary-700' },
    { icon: Zap, key: 'fast', color: 'from-yellow-500 to-orange-500' },
    { icon: Shield, key: 'secure', color: 'from-blue-500 to-indigo-500' },
  ];

  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary-50 to-primary-50 dark:from-gray-900 dark:to-gray-950 relative overflow-hidden transition-colors duration-300">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden">
        <VibrantBg variant="subtle" />
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-gradient-to-br from-primary-500 to-primary-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        <AnimatedBlobRed className="top-10 right-20 w-[500px] h-[500px] opacity-30 animation-delay-1000" />
        <AnimatedBlobRed className="bottom-10 left-20 w-[400px] h-[400px] opacity-25 animation-delay-3000" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-full mb-6 shadow-sm">
              <Smartphone className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">API SMS Professionnelle</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">
              {t('title')}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-300">{t('subtitle')}</p>
            <p className="text-lg text-gray-500 mb-8">{t('description')}</p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link href={`/${locale}/contact`}>
                <Button size="lg" className="w-full sm:w-auto group">
                  {t('hero.cta')}
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href={`/${locale}/sms-api/docs`}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                  <Book className="w-5 h-5" />
                  {t('hero.ctaDocs')}
                </Button>
              </Link>
              <Link href={`/${locale}/sms-api/swagger`}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2">
                  <Code className="w-5 h-5" />
                  {t('hero.ctaSwagger')}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right: Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 hover:border-primary-300 transition-all">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent mb-2">
                  99.9%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors duration-300">Disponibilité</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 hover:border-primary-300 transition-all">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent mb-2">
                  &lt;3s
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors duration-300">Livraison</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 hover:border-primary-300 transition-all">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent mb-2">
                  24/7
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors duration-300">Support</div>
              </CardContent>
            </Card>
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 hover:border-primary-300 transition-all">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors duration-300">Mali</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
              >
                <Card className="text-center h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary-200 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm group">
                  <CardContent className="pt-6 pb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <p className="font-semibold text-gray-900 dark:text-white text-lg transition-colors duration-300">
                      {t(`features.${feature.key}`)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
