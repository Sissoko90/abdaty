'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
          <DialogTitle className="flex items-center gap-3 font-display text-2xl text-ink dark:text-white">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
              <plan.icon className="h-6 w-6" />
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
            <div className="bogolan-texture rounded-2xl bg-ink p-6 text-white">
              <div className="mb-1 flex items-baseline gap-2">
                <span className="font-display text-5xl font-extrabold">{plan.price}</span>
                <span className="text-lg font-semibold text-gray-300">{plan.currency}</span>
              </div>
              <p className="text-gray-300">par SMS</p>
              <p className="mt-2 text-sm text-ochre">{plan.volume} SMS/mois</p>
            </div>

            {/* Features */}
            <div>
              <h3 className="mb-4 text-lg font-bold text-ink dark:text-white">Fonctionnalités incluses</h3>
              <ul className="grid gap-3 sm:grid-cols-2">
                {planFeatures[plan.plan as keyof typeof planFeatures]?.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ochre/20">
                      <Check className="h-3 w-3 text-ink dark:text-ochre" />
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
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
            <div className="rounded-2xl border border-gray-200 bg-paper p-5 dark:border-white/10 dark:bg-white/5">
              <div>
                <h3 className="mb-3 font-bold text-ink dark:text-white">Récapitulatif</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400 transition-colors duration-300">Plan:</span>
                    <span className="font-medium">{plan.plan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Volume:</span>
                    <span className="font-medium">{plan.volume} SMS/mois</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Prix unitaire:</span>
                    <span className="font-medium">{plan.price} {plan.currency}/SMS</span>
                  </div>
                  <div className="mt-2 flex justify-between border-t border-gray-200 pt-2 font-bold dark:border-white/10">
                    <span>Total estimé:</span>
                    <span className="text-primary-600">
                      {parseInt(plan.volume.replace(/,/g, '')) * plan.price} {plan.currency}/mois
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div>
              <h3 className="mb-4 text-lg font-bold text-ink dark:text-white">Méthode de paiement</h3>
              <div className="grid gap-3">
                <Button variant="outline" className="h-auto justify-start rounded-xl p-4 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10">
                  <CreditCard className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Orange Money</div>
                    <div className="text-xs text-gray-500">Paiement mobile sécurisé</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto justify-start rounded-xl p-4 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10">
                  <CreditCard className="w-5 h-5 mr-3" />
                  <div className="text-left">
                    <div className="font-medium">Moov Money</div>
                    <div className="text-xs text-gray-500">Paiement mobile sécurisé</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto justify-start rounded-xl p-4 dark:border-white/15 dark:bg-transparent dark:text-white dark:hover:bg-white/10">
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
              <Button className="flex-1">
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
