'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { User, Bell, Shield, Globe, Palette } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { useState } from 'react';

export default function SettingsPage() {
  const t = useTranslations('dashboard.settings');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('fr');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-red-950 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: t('title') },
          ]}
        />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Section */}
          <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10">
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5" />
                {t('profile')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <Label htmlFor="email" className="text-gray-900 dark:text-white">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue="user@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-gray-900 dark:text-white">{t('phone')}</Label>
                <Input
                  id="phone"
                  type="tel"
                  defaultValue="+223 76 71 41 42"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="company" className="text-gray-900 dark:text-white">{t('company')}</Label>
                <Input
                  id="company"
                  type="text"
                  defaultValue="Abdaty Technologie"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/10">
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5" />
                {t('notifications')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <Label className="text-gray-900 dark:text-white">{t('emailNotifications')}</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('emailNotificationsDesc')}
                  </p>
                </div>
                <input type="checkbox" checked={emailNotifications} onChange={(e) => setEmailNotifications(e.target.checked)} className="w-5 h-5 rounded dark:bg-gray-700 dark:border-gray-600" />
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <Label className="text-gray-900 dark:text-white">{t('smsNotifications')}</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('smsNotificationsDesc')}
                  </p>
                </div>
                <input type="checkbox" checked={smsNotifications} onChange={(e) => setSmsNotifications(e.target.checked)} className="w-5 h-5 rounded dark:bg-gray-700 dark:border-gray-600" />
              </div>
            </CardContent>
          </Card>

          {/* Security Section */}
          <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/10">
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {t('security')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <Button variant="outline" className="w-full justify-start gap-2">
                {t('changePassword')}
              </Button>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <Label className="text-gray-900 dark:text-white">{t('twoFactor')}</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('twoFactorDesc')}
                  </p>
                </div>
                <input type="checkbox" checked={twoFactor} onChange={(e) => setTwoFactor(e.target.checked)} className="w-5 h-5 rounded dark:bg-gray-700 dark:border-gray-600" />
              </div>
            </CardContent>
          </Card>

          {/* Preferences Section */}
          <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10">
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {t('preferences')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <Label htmlFor="language" className="text-gray-900 dark:text-white">{t('language')}</Label>
                <select
                  id="language"
                  className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="fr">{t('french')}</option>
                  <option value="en">{t('english')}</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div>
                  <Label className="text-gray-900 dark:text-white flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    {t('theme')}
                  </Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('themeDesc')}
                  </p>
                </div>
                <input type="checkbox" checked={darkMode} onChange={(e) => setDarkMode(e.target.checked)} className="w-5 h-5 rounded dark:bg-gray-700 dark:border-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button size="lg" className="gap-2">
            {t('save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
