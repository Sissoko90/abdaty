'use client';


import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { usePublicSection } from '@/hooks/use-public-content';
import { useBranding } from '@/hooks/use-branding';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function Chatbot() {
  const t = useTranslations('chatbot');
  // Coordonnées réelles gérées dans l'admin (section "contact").
  const { cv } = usePublicSection('contact');
  const contactEmail = cv('email', 'contact@abdatytch.com');
  const contactPhone = cv('phone', '+223 76 71 41 42');
  const { logo } = useBranding();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      // Message de bienvenue
      setTimeout(() => {
        addBotMessage(t('welcome'));
      }, 500);
    }
  }, [isOpen]);

  const addBotMessage = (text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'bot',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setIsTyping(false);
  };

  // `override` : texte d'une question rapide (setInputValue n'est pas encore appliqué à ce moment-là).
  const handleSendMessage = async (override?: string) => {
    const text = override ?? inputValue;
    if (!text.trim()) return;

    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simuler une réponse du bot (à remplacer par une vraie API)
    setTimeout(() => {
      const response = getBotResponse(text.toLowerCase());
      addBotMessage(response);
    }, 1000);
  };

  /** Détecte si l'un des mots-clés est présent dans le message. */
  const has = (input: string, words: string[]) => words.some((w) => input.includes(w));

  const getBotResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();

    // Inscription / abonnement / création de compte (priorité haute).
    if (has(lowerInput, ['inscrire', 'inscription', "m'inscrire", 's inscrire', 'abonner', 'abonn', 'souscrire',
      'register', 'sign up', 'signup', 'créer un compte', 'creer un compte', 'compte', 'rejoindre', 'démarrer',
      'demarrer', 'commencer', 'get started', 'how to sign'])) {
      return (
        `Pour vous inscrire, c'est simple :\n` +
        `1) Créez votre compte sur la page Connexion (/${'fr'}/login).\n` +
        `2) Choisissez votre plan (Starter, Business ou Enterprise) sur la page API SMS (/fr/sms-api).\n` +
        `3) Vous recevez vos identifiants/clé API pour commencer à envoyer des SMS.\n\n` +
        `Besoin d'aide ?  📧 ${contactEmail}  •  ☎️ ${contactPhone}`
      );
    }

    // Réponses prédéfinies (à remplacer par une vraie IA)
    if (lowerInput.includes('prix') || lowerInput.includes('tarif') || lowerInput.includes('cost') || lowerInput.includes('price') || lowerInput.includes('combien')) {
      return t('responses.pricing');
    }
    if (lowerInput.includes('service') || lowerInput.includes('offre') || lowerInput.includes('offrez')) {
      return t('responses.services');
    }
    if (lowerInput.includes('merci') || lowerInput.includes('thanks') || lowerInput.includes('thank you')) {
      return t('responses.greeting');
    }
    if (lowerInput.includes('devis') || lowerInput.includes('quote') || lowerInput.includes('estimation')) {
      return `${t('responses.pricing')}\n\n📧 ${contactEmail}  •  ☎️ ${contactPhone}`;
    }
    if (lowerInput.includes('horaire') || lowerInput.includes('ouvert') || lowerInput.includes('hours') || lowerInput.includes('disponible')) {
      return `${cv('hours', 'Lun - Ven : 8h - 18h')}\n\n📧 ${contactEmail}  •  ☎️ ${contactPhone}`;
    }
    if (lowerInput.includes('contact') || lowerInput.includes('email') || lowerInput.includes('téléphone') || lowerInput.includes('phone') || lowerInput.includes('appeler')) {
      return `${t('responses.contact')}\n\n📧 ${contactEmail}  •  ☎️ ${contactPhone}`;
    }
    if (lowerInput.includes('sms') || lowerInput.includes('api sms') || lowerInput.includes('message')) {
      return t('responses.sms');
    }
    if (lowerInput.includes('qui êtes-vous') || lowerInput.includes('à propos') || lowerInput.includes('about') || lowerInput.includes('entreprise') || lowerInput.includes('abdaty')) {
      return t('responses.about');
    }
    if (lowerInput.includes('web') || lowerInput.includes('site') || lowerInput.includes('internet') || lowerInput.includes('website')) {
      return t('responses.web');
    }
    if (lowerInput.includes('mobile') || lowerInput.includes('application') || lowerInput.includes('app') || lowerInput.includes('ios') || lowerInput.includes('android')) {
      return t('responses.mobile');
    }
    if (lowerInput.includes('sécurité') || lowerInput.includes('cyber') || lowerInput.includes('hack') || lowerInput.includes('protection') || lowerInput.includes('security')) {
      return t('responses.security');
    }
    if (lowerInput.includes('technologie') || lowerInput.includes('tech') || lowerInput.includes('framework') || lowerInput.includes('react') || lowerInput.includes('node')) {
      return t('responses.technologies');
    }
    if (lowerInput.includes('projet') || lowerInput.includes('portfolio') || lowerInput.includes('client') || lowerInput.includes('réalisé')) {
      return t('responses.portfolio');
    }
    if (lowerInput.includes('où') || lowerInput.includes('localisation') || lowerInput.includes('mali') || lowerInput.includes('bureau') || lowerInput.includes('location')) {
      return t('responses.location');
    }
    if (lowerInput.includes('délai') || lowerInput.includes('temps') || lowerInput.includes('combien de temps') || lowerInput.includes('timeline') || lowerInput.includes('durée')) {
      return t('responses.timeline');
    }
    if (lowerInput.includes('support') || lowerInput.includes('maintenance') || lowerInput.includes('aide') || lowerInput.includes('après-vente')) {
      return t('responses.support');
    }
    if (lowerInput.includes('bonjour') || lowerInput.includes('salut') || lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      return t('responses.greeting');
    }
    return t('responses.default');
  };

  const quickQuestions = [
    { key: 'services', text: t('quickQuestions.services') },
    { key: 'pricing', text: t('quickQuestions.pricing') },
    { key: 'contact', text: t('quickQuestions.contact') },
    { key: 'about', text: t('quickQuestions.about') },
    { key: 'web', text: t('quickQuestions.web') },
    { key: 'mobile', text: t('quickQuestions.mobile') },
    { key: 'security', text: t('quickQuestions.security') },
  ];

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-[9999]">
          <button
            onClick={() => setIsOpen(true)}
            aria-label="Ouvrir le chat"
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 shadow-xl shadow-primary-600/30 ring-2 ring-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-700 dark:ring-white/20"
          >
            <MessageSquare className="h-6 w-6 text-white" />
          </button>
        </div>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)]"
          >
            <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-2xl shadow-ink/20 dark:border-white/10 dark:bg-[#121c2e]">
              {/* Header */}
              <div className="bogolan-texture flex items-center justify-between bg-ink p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element -- logo dynamique (CMS), ratio inconnu, non LCP */}
                    <img src={logo} alt="Abdaty" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white">{t('title')}</h3>
                    <p className="flex items-center gap-1.5 text-xs text-gray-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      {t('status')}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/15 hover:text-white"
                  aria-label="Fermer le chat"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="h-96 overflow-y-auto bg-paper p-4 dark:bg-[#0b1322]">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                        message.sender === 'user'
                          ? 'bg-ink dark:bg-white/10'
                          : 'bg-white ring-1 ring-gray-200 dark:ring-white/10'
                      }`}>
                        {message.sender === 'user' ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element -- logo dynamique (CMS), ratio inconnu, non LCP
                          <img src={logo} alt="Abdaty" className="w-6 h-6 object-contain" />
                        )}
                      </div>
                      <div
                        className={`rounded-2xl px-4 py-3 ${
                          message.sender === 'user'
                            ? 'rounded-br-md bg-primary-600 text-white'
                            : 'rounded-bl-md border border-gray-200 bg-white text-ink dark:border-white/10 dark:bg-white/5 dark:text-white'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{message.text}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2 mb-4"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white ring-1 ring-gray-200 dark:ring-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element -- logo dynamique (CMS), ratio inconnu, non LCP */}
                      <img src={logo} alt="Abdaty" className="w-6 h-6 object-contain" />
                    </div>
                    <div className="rounded-2xl rounded-bl-md border border-gray-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/5">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-200" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce animation-delay-400" />
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Questions */}
              {messages.length === 1 && (
                <div className="border-t border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#121c2e]">
                  <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">{t('quickQuestionsTitle')}</p>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((q) => (
                      <button
                        key={q.key}
                        onClick={() => {
                          handleSendMessage(q.text);
                        }}
                        className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-primary-300 hover:text-primary-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:text-primary-300"
                      >
                        {q.text}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="border-t border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-[#121c2e]">
                <div className="flex gap-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={t('placeholder')}
                    aria-label={t('placeholder')}
                    className="h-11 flex-1 rounded-xl border-gray-300 bg-white text-ink dark:border-white/15 dark:bg-white/5 dark:text-white"
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    size="icon"
                    className="h-11 w-11 rounded-xl"
                    aria-label="Envoyer"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
