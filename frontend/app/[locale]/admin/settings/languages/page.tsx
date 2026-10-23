'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Save, Languages } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { AdminPage, AdminPageHeader } from '@/components/admin/admin-page';

export default function AdminLanguagesPage() {
  const t = useTranslations('admin.settings.languages');

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
    <AdminPage>
      <AdminPageHeader
        icon={Languages}
        title={t('title')}
        description={t('subtitle')}
        actions={
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            {t('save')}
          </Button>
        }
      />

      <section className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]">
        <h2 className="mb-5 text-lg font-bold text-ink dark:text-white">{t('availableLanguages')}</h2>
        <ul className="divide-y divide-gray-100 dark:divide-white/5">
          {languages.map((lang) => (
            <li key={lang.code} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <div className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink font-display text-sm font-bold uppercase text-white dark:bg-white/10">
                  {lang.code}
                </span>
                <div>
                  <p className="flex items-center gap-2 font-semibold text-ink dark:text-white">
                    {lang.name}
                    {lang.default && <Badge>{t('default')}</Badge>}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{lang.code.toUpperCase()}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor={`lang-${lang.code}`} className="text-gray-600 dark:text-gray-400">
                  {t('enabled')}
                </Label>
                <Switch
                  id={`lang-${lang.code}`}
                  checked={lang.enabled}
                  onCheckedChange={() => toggleLanguage(lang.code)}
                  disabled={lang.default}
                />
              </div>
            </li>
          ))}
        </ul>
      </section>
    </AdminPage>
  );
}
