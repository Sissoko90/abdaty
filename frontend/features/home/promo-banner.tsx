'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone, Sparkles, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';

const promos = [
  {
    id: 1,
    icon: Gift,
    text: '🎉 Offre Spéciale : -20% sur tous les projets web ce mois-ci !',
    cta: 'En profiter',
    color: 'from-purple-500 to-pink-500',
  },
  {
    id: 2,
    icon: Sparkles,
    text: '✨ Nouveau : API SMS Mali - Livraison en moins de 3 secondes !',
    cta: 'Découvrir',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    id: 3,
    icon: Megaphone,
    text: '🚀 Consultation gratuite pour votre prochain projet digital !',
    cta: 'Réserver',
    color: 'from-orange-500 to-primary-500',
  },
];

export function PromoBanner() {
  const [currentPromo, setCurrentPromo] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % promos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const promo = promos[currentPromo];
  const Icon = promo.icon;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPromo}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`relative overflow-hidden bg-gradient-to-r ${promo.color} text-white`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <Icon className="w-5 h-5 flex-shrink-0 animate-pulse" />
              <p className="text-sm md:text-base font-medium">{promo.text}</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="hidden sm:inline-flex bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                {promo.cta}
              </Button>
              
              <button
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
          <motion.div
            className="h-full bg-white"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 5, ease: 'linear' }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
