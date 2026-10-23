'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { User, Bell, Shield, Globe, KeyRound, type LucideIcon } from 'lucide-react';
import { useState } from 'react';

const CARD = 'rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]';
const INPUT =
  'h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-ink dark:border-white/15 dark:bg-white/5 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500';
const LABEL = 'mb-2 block text-sm font-medium text-ink dark:text-gray-200';

/** Carte de réglages avec en-tête iconé. */
function SettingsCard({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: React.ReactNode }) {
  return (
    <section className={CARD}>
      <h2 className="mb-6 flex items-center gap-3 font-display text-lg font-semibold text-ink dark:text-white">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
          <Icon className="h-5 w-5" />
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Ligne libellé + description + interrupteur. */
function ToggleRow({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <label htmlFor={id} className="block text-sm font-medium text-ink dark:text-gray-200">
          {label}
        </label>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export default function SettingsPage() {
  const t = useTranslations('dashboard.settings');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('fr');

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink dark:text-white">{t('title')}</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">{t('subtitle')}</p>
        </div>
        <Button className="hidden sm:inline-flex">{t('save')}</Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsCard icon={User} title={t('profile')}>
          <div className="space-y-5">
            <div>
              <label htmlFor="email" className={LABEL}>{t('email')}</label>
              <input id="email" type="email" defaultValue="user@example.com" className={INPUT} />
            </div>
            <div>
              <label htmlFor="phone" className={LABEL}>{t('phone')}</label>
              <input id="phone" type="tel" defaultValue="+223 76 71 41 42" className={INPUT} />
            </div>
            <div>
              <label htmlFor="company" className={LABEL}>{t('company')}</label>
              <input id="company" type="text" defaultValue="Abdaty Technologie" className={INPUT} />
            </div>
          </div>
        </SettingsCard>

        <SettingsCard icon={Bell} title={t('notifications')}>
          <div className="divide-y divide-gray-100 dark:divide-white/10">
            <ToggleRow
              id="emailNotifications"
              label={t('emailNotifications')}
              description={t('emailNotificationsDesc')}
              checked={emailNotifications}
              onChange={setEmailNotifications}
            />
            <ToggleRow
              id="smsNotifications"
              label={t('smsNotifications')}
              description={t('smsNotificationsDesc')}
              checked={smsNotifications}
              onChange={setSmsNotifications}
            />
          </div>
        </SettingsCard>

        <SettingsCard icon={Shield} title={t('security')}>
          <Button variant="outline" className="w-full justify-start gap-2 dark:border-white/15 dark:bg-white/5">
            <KeyRound className="h-4 w-4" />
            {t('changePassword')}
          </Button>
          <div className="mt-2 divide-y divide-gray-100 dark:divide-white/10">
            <ToggleRow
              id="twoFactor"
              label={t('twoFactor')}
              description={t('twoFactorDesc')}
              checked={twoFactor}
              onChange={setTwoFactor}
            />
          </div>
        </SettingsCard>

        <SettingsCard icon={Globe} title={t('preferences')}>
          <div>
            <label htmlFor="language" className={LABEL}>{t('language')}</label>
            <select id="language" className={INPUT} value={language} onChange={(e) => setLanguage(e.target.value)}>
              <option value="fr">{t('french')}</option>
              <option value="en">{t('english')}</option>
            </select>
          </div>
          <div className="mt-2 divide-y divide-gray-100 dark:divide-white/10">
            <ToggleRow id="darkMode" label={t('theme')} description={t('themeDesc')} checked={darkMode} onChange={setDarkMode} />
          </div>
        </SettingsCard>
      </div>

      <div className="flex justify-end border-t border-gray-200 pt-6 dark:border-white/10">
        <Button size="lg">{t('save')}</Button>
      </div>
    </div>
  );
}
