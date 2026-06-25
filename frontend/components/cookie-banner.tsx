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

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.5 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-2xl transition-colors duration-300"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                <Cookie className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 transition-colors duration-300">{t('title')}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 transition-colors duration-300">{t('description')}</p>
                {!showSettings && (
                  <Link href={`/${locale}/privacy-policy`} className="text-primary-600 dark:text-primary-400 hover:underline text-sm transition-colors duration-300">
                    {t('learnMore')}
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-2 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 transition-colors duration-300"
              >
                <Settings className="w-4 h-4" />
                {t('settings')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRejectAll}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 transition-colors duration-300"
              >
                {t('rejectAll')}
              </Button>
              <Button
                size="sm"
                onClick={handleAcceptAll}
              >
                {t('acceptAll')}
              </Button>
            </div>
          </div>

          {showSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300"
            >
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={preferences.necessary}
                    disabled
                    className="mt-1 w-4 h-4 rounded dark:bg-gray-700 dark:border-gray-600 transition-colors duration-300"
                  />
                  <div>
                    <label className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{t('necessary')}</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">{t('necessaryDescription')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={() => togglePreference('analytics')}
                    className="mt-1 w-4 h-4 rounded dark:bg-gray-700 dark:border-gray-600 transition-colors duration-300"
                  />
                  <div>
                    <label className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{t('analytics')}</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">{t('analyticsDescription')}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={() => togglePreference('marketing')}
                    className="mt-1 w-4 h-4 rounded dark:bg-gray-700 dark:border-gray-600 transition-colors duration-300"
                  />
                  <div>
                    <label className="font-medium text-gray-900 dark:text-white transition-colors duration-300">{t('marketing')}</label>
                    <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">{t('marketingDescription')}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button variant="outline" size="sm" onClick={handleRejectAll} className="dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:hover:bg-gray-700 transition-colors duration-300">
                  {t('rejectAll')}
                </Button>
                <Button size="sm" onClick={handleAcceptSelected}>
                  {t('acceptSelected')}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
