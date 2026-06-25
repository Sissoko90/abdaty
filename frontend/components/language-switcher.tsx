'use client';

import type { Route } from 'next';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'fr', name: 'Français', flag: '' },
  { code: 'en', name: 'English', flag: '' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (newLocale: string) => {
    // Si le pathname commence par la locale actuelle, remplace-la
    if (pathname.startsWith(`/${locale}`)) {
      const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
      router.push(newPathname as Route);
    } else {
      // Sinon, ajoute la nouvelle locale au début
      router.push(`/${newLocale}${pathname}` as Route);
    }
  };

  const currentLanguage = languages.find((lang) => lang.code === locale);

  return (
    <Select value={locale} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[140px] border-none bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          <SelectValue>
            <span className="flex items-center gap-2">
              <span>{currentLanguage?.flag}</span>
              <span className="hidden sm:inline">{currentLanguage?.name}</span>
            </span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <div className="flex items-center gap-2">
              <span>{language.flag}</span>
              <span>{language.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
