'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Save, Languages } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export default function AdminLanguagesPage() {
  const t = useTranslations('admin.settings.languages');
  const tBreadcrumb = useTranslations('admin.breadcrumb');

  const [languages, setLanguages] = useState([
    { code: 'fr', name: 'Français', enabled: true, default: true },
    { code: 'en', name: 'English', enabled: true, default: false },
  ]);

  const handleSave = () => {
    alert(t('saved'));
  };

  const toggleLanguage = (code: string) => {
    setLanguages(
      languages.map((lang) =>
        lang.code === code ? { ...lang, enabled: !lang.enabled } : lang
      )
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: tBreadcrumb('dashboard'), href: `/admin` },
            { label: tBreadcrumb('admin'), href: `/admin` },
            { label: t('title') },
          ]}
        />

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('subtitle')}
            </p>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            {t('save')}
          </Button>
        </div>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="w-5 h-5" />
              {t('availableLanguages')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  className="flex items-center justify-between p-4 border rounded-lg dark:border-gray-700"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {lang.name}
                      </p>
                      <p className="text-sm text-gray-500">{lang.code.toUpperCase()}</p>
                    </div>
                    {lang.default && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded dark:bg-blue-900 dark:text-blue-200">
                        {t('default')}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`lang-${lang.code}`}>{t('enabled')}</Label>
                    <Switch
                      id={`lang-${lang.code}`}
                      checked={lang.enabled}
                      onCheckedChange={() => toggleLanguage(lang.code)}
                      disabled={lang.default}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
