'use client';

import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Mail, Phone, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export function FAQContact() {
  const t = useTranslations('faq.contact');
  const locale = useLocale();

  const contactMethods = [
    {
      icon: Mail,
      titleKey: 'email',
      value: 'contact@abdatytch.com',
      link: 'mailto:contact@abdatytch.com',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: Phone,
      titleKey: 'phone',
      value: '+223 76 71 41 42',
      link: 'tel:+223 76 71 41 42',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: MessageCircle,
      titleKey: 'chat',
      value: t('chatDescription'),
      link: '#',
      color: 'from-primary-500 to-primary-700',
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('title')}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-300">{t('subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {contactMethods.map((method, index) => (
            <motion.div
              key={method.titleKey}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${method.color} rounded-2xl flex items-center justify-center`}>
                    <method.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">{t(method.titleKey)}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 transition-colors duration-300">{method.value}</p>
                  <a
                    href={method.link}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {t('contactUs')}
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href={`/${locale}/contact`}>
            <Button size="lg" className="bg-gradient-to-r from-primary-500 to-primary-700">
              {t('fullContactForm')}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
