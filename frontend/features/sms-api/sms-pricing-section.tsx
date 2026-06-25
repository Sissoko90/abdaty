'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Smartphone, Briefcase, Building2 } from 'lucide-react';
import { PlanModal } from './plan-modal';

const pricingData = [
  { plan: 'Starter', icon: Smartphone, volume: '1,000', price: 20, currency: 'FCFA', popular: false },
  { plan: 'Business', icon: Briefcase, volume: '10,000', price: 18, currency: 'FCFA', popular: true },
  { plan: 'Enterprise', icon: Building2, volume: '100,000+', price: 15, currency: 'FCFA', popular: false },
];

const features = [
  'Livraison instantanée',
  'Rapports en temps réel',
  'Support technique 24/7',
  'API REST simple',
  'Webhooks pour notifications',
  'Aucun engagement',
];

export function SMSPricingSection() {
  const t = useTranslations('smsApi.pricing');
  const [selectedPlan, setSelectedPlan] = useState<typeof pricingData[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePlanClick = (plan: typeof pricingData[0]) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">{t('title')}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-2 transition-colors duration-300">{t('subtitle')}</p>
          <p className="text-lg text-gray-500 dark:text-gray-400 transition-colors duration-300">Envoyez vos SMS au Mali avec notre plateforme indépendante</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {pricingData.map((item, index) => (
            <motion.div
              key={item.plan}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`hover:shadow-xl transition-all duration-300 border-2 relative ${
                item.popular ? 'border-primary-500 shadow-lg' : 'hover:border-primary-200'
              }`}>
                {item.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-primary-500 to-primary-700 text-white">
                      Populaire
                    </Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center">
                    <item.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{item.plan}</CardTitle>
                  <p className="text-sm text-gray-500 mt-2">{item.volume} SMS/mois</p>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="mb-4">
                    <span className="text-5xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                      {item.price}
                    </span>
                    <span className="text-2xl font-semibold text-gray-600 dark:text-gray-400 ml-2 transition-colors duration-300">{item.currency}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{t('perSMS')}</p>
                  <Button 
                    onClick={() => handlePlanClick(item)}
                    className="w-full bg-gradient-to-r from-primary-500 to-primary-700 hover:opacity-90"
                  >
                    Voir les détails
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Plan Modal */}
        <PlanModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          plan={selectedPlan}
        />

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 border-2 border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center transition-colors duration-300">
            Inclus dans tous les forfaits
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={`feature-${index}`}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
