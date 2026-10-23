'use client';


import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Cookie, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { recordCookieConsent } from '@/services/cookie.service';

/** Récupère (ou génère) l'identifiant visiteur persistant. */
function getVisitorId(): string {
  let id = localStorage.getItem('cookieVisitorId');
  if (!id) {
    id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `v-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;
    localStorage.setItem('cookieVisitorId', id);
  }
  return id;
}

export function CookieBanner() {
  const t = useTranslations('cookies');
  const locale = useLocale();
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  /** Persiste le choix : localStorage + enregistrement en base (analytics admin). */
  const persistConsent = (prefs: { necessary: boolean; analytics: boolean; marketing: boolean }) => {
    localStorage.setItem('cookieConsent', JSON.stringify(prefs));
    // Prévient la carte promo (même coin de l'écran) qu'elle peut s'afficher.
    window.dispatchEvent(new Event('cookie-consent'));
    recordCookieConsent({
      visitorId: getVisitorId(),
      analytics: prefs.analytics,
      marketing: prefs.marketing,
      preferences: false,
      locale,
      page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    }).catch(() => {
      /* enregistrement best-effort : l'UX ne dépend pas du backend */
    });
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    const prefs = { necessary: true, analytics: true, marketing: true };
    setPreferences(prefs);
    persistConsent(prefs);
  };

  const handleAcceptSelected = () => {
    persistConsent(preferences);
  };

  const handleRejectAll = () => {
    const prefs = { necessary: true, analytics: false, marketing: false };
    setPreferences(prefs);
    persistConsent(prefs);
  };

  const togglePreference = (key: keyof typeof preferences) => {
    if (key === 'necessary') return;
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isVisible) return null;

  const options: { key: keyof typeof preferences; label: string; description: string }[] = [
    { key: 'necessary', label: t('necessary'), description: t('necessaryDescription') },
    { key: 'analytics', label: t('analytics'), description: t('analyticsDescription') },
    { key: 'marketing', label: t('marketing'), description: t('marketingDescription') },
  ];

  const secondaryBtn =
    'border-gray-300 bg-white text-ink hover:bg-gray-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10';

  return (
    <AnimatePresence>
      <motion.div
        role="dialog"
        aria-labelledby="cookie-banner-title"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-x-4 bottom-4 z-50 rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl shadow-ink/15 dark:border-white/10 dark:bg-[#121c2e] sm:inset-x-auto sm:left-6 sm:bottom-6 sm:w-full sm:max-w-md"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-ochre/20 text-ink dark:text-ochre">
            <Cookie className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 id="cookie-banner-title" className="mb-1 font-display text-base font-bold text-ink dark:text-white">
              {t('title')}
            </h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {t('description')}{' '}
              <Link href={`/${locale}/privacy-policy`} className="font-medium text-primary-600 hover:underline dark:text-primary-400">
                {t('learnMore')}
              </Link>
            </p>
          </div>
        </div>

        {showSettings && (
          <motion.ul
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-5 space-y-2 overflow-hidden"
          >
            {options.map(({ key, label, description }) => (
              <li key={key}>
                <label
                  className={`flex items-start gap-3 rounded-xl border border-gray-200 p-3 dark:border-white/10 ${
                    key === 'necessary' ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={preferences[key]}
                    disabled={key === 'necessary'}
                    onChange={() => togglePreference(key)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-primary-600"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-ink dark:text-white">{label}</span>
                    <span className="block text-xs leading-relaxed text-gray-600 dark:text-gray-400">{description}</span>
                  </span>
                </label>
              </li>
            ))}
            <li className="pt-1">
              <Button variant="outline" size="sm" onClick={handleAcceptSelected} className={`w-full ${secondaryBtn}`}>
                {t('acceptSelected')}
              </Button>
            </li>
          </motion.ul>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
            aria-expanded={showSettings}
            className="gap-2 px-2 text-gray-600 hover:text-ink dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <Settings className="h-4 w-4" />
            {t('settings')}
          </Button>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRejectAll} className={secondaryBtn}>
              {t('rejectAll')}
            </Button>
            <Button size="sm" onClick={handleAcceptAll}>
              {t('acceptAll')}
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
