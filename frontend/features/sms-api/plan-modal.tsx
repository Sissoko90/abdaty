'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Check, CreditCard, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

import { LucideIcon } from 'lucide-react';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: {
    plan: string;
    icon: LucideIcon;
    volume: string;
    price: number;
    currency: string;
  } | null;
}

export function PlanModal({ isOpen, onClose, plan }: PlanModalProps) {
  const [step, setStep] = useState<'details' | 'signup' | 'payment'>('details');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  });

  if (!plan) return null;

  const planFeatures = {
    Starter: [
      '1,000 SMS par mois',
      'API REST complète',
      'Rapports en temps réel',
      'Support par email',
      'Webhooks inclus',
    ],
    Business: [
      '10,000 SMS par mois',
      'API REST complète',
      'Rapports en temps réel',
      'Support prioritaire 24/7',
      'Webhooks inclus',
      'Numéro dédié',
      'Statistiques avancées',
    ],
    Enterprise: [
      '100,000+ SMS par mois',
      'API REST complète',
      'Rapports en temps réel',
      'Support dédié 24/7',
      'Webhooks inclus',
      'Numéros dédiés multiples',
      'Statistiques avancées',
      'SLA garanti 99.9%',
      'Gestionnaire de compte',
    ],
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'details') {
      setStep('signup');
    } else if (step === 'signup') {
      setStep('payment');
    }
  };

  const resetAndClose = () => {
    setStep('details');
    setFormData({ name: '', email: '', phone: '', company: '' });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
              <plan.icon className="w-6 h-6 text-white" />
            </div>
            Plan {plan.plan}
          </DialogTitle>
          <DialogDescription>
            {step === 'details' && 'Découvrez tous les détails de ce plan'}
            {step === 'signup' && 'Créez votre compte pour commencer'}
            {step === 'payment' && 'Finalisez votre abonnement'}
          </DialogDescription>
        </DialogHeader>

        {/* Step: Details */}
        {step === 'details' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Pricing */}
            <Card className="bg-gradient-to-br from-primary-50 to-primary-50 border-2 border-primary-200">
              <CardContent className="p-6 text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent mb-2">
                  {plan.price} {plan.currency}
                </div>
                <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">par SMS</p>
                <p className="text-sm text-gray-500 mt-2">{plan.volume} SMS/mois</p>
              </CardContent>
            </Card>

            {/* Features */}
            <div>
              <h3 className="font-bold text-lg mb-4">Fonctionnalités incluses</h3>
              <div className="space-y-3">
                {planFeatures[plan.plan as keyof typeof planFeatures]?.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300 transition-colors duration-300">{feature}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <Button onClick={() => setStep('signup')} className="w-full" size="lg">
              S'inscrire à ce plan
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        )}

        {/* Step: Signup */}
        {step === 'signup' && (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Votre nom complet"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Téléphone *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+223XXXXXXXX"
                />
              </div>
              <div>
                <Label htmlFor="company">Entreprise (optionnel)</Label>
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Abdaty Tech"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setStep('details')} className="flex-1">
                Retour
              </Button>
              <Button type="submit" className="flex-1">
                Continuer vers le paiement
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.form>
        )}

        {/* Step: Payment */}
        {step === 'payment' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Summary */}
            <Card className="bg-gray-50 dark:bg-gray-800">
              <CardContent className="p-4">
                <h3 className="font-bold mb-2">Récapitulatif</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Plan:</span>
                    <span className="font-medium">{plan.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Volume:</span>
                    <span className="font-medium">{plan.volume} SMS/mois</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prix unitaire:</span>
                    <span className="font-medium">{plan.price} {plan.currency}/SMS</span>
                  </div>
                  <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                    <span>Total estimé:</span>
                    <span className="text-primary-600">
                      {parseInt(plan.volume.replace(/,/g, '')) * plan.price} {plan.currency}/mois
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <div>
              <h3 className="font-bold text-lg mb-4">Méthode de paiement</h3>
              <div className="grid gap-3">
                <Button variant="outline" className="justify-start h-auto p-4">
                  <CreditCard className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Orange Money</div>
                    <div className="text-xs text-gray-500">Paiement mobile sécurisé</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <CreditCard className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Moov Money</div>
                    <div className="text-xs text-gray-500">Paiement mobile sécurisé</div>
                  </div>
                </Button>
                <Button variant="outline" className="justify-start h-auto p-4">
                  <CreditCard className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Carte Bancaire</div>
                    <div className="text-xs text-gray-500">Visa, Mastercard</div>
                  </div>
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep('signup')} className="flex-1">
                Retour
              </Button>
              <Button className="flex-1 bg-gradient-to-r from-primary-500 to-primary-700">
                Confirmer le paiement
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
}
