'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminPage, AdminPageHeader } from '@/components/admin/admin-page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Mail, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSiteContentSection } from '@/hooks/use-site-content-section';

interface ContactInfo {
  title: { fr: string; en: string };
  subtitle: { fr: string; en: string };
  description: { fr: string; en: string };
  email: string;
  phone: string;
  address: { fr: string; en: string };
  hours: { fr: string; en: string };
}

/** Valeurs par défaut (repli si la section n'a pas encore de contenu en base). */
const DEFAULTS: ContactInfo = {
  title: { fr: 'Contactez-nous', en: 'Contact Us' },
  subtitle: { fr: 'Discutons de votre projet', en: "Let's discuss your project" },
  description: {
    fr: 'Notre équipe est à votre disposition pour répondre à toutes vos questions',
    en: 'Our team is available to answer all your questions',
  },
  email: 'contact@abdatytch.com',
  phone: '+223 76 71 41 42',
  address: { fr: 'Bamako, Mali', en: 'Bamako, Mali' },
  hours: { fr: 'Lun - Ven: 8h - 18h', en: 'Mon - Fri: 8am - 6pm' },
};

export default function AdminContactPage() {
  const t = useTranslations('admin.content.contact');

  const { token, blocks, loading, saving, error, success, saveAll, value } =
    useSiteContentSection('contact');

  const [contactInfo, setContactInfo] = useState<ContactInfo>(DEFAULTS);

  // Synchronise le formulaire avec les blocs chargés.
  useEffect(() => {
    setContactInfo({
      title: { fr: value('title', 'fr', DEFAULTS.title.fr), en: value('title', 'en', DEFAULTS.title.en) },
      subtitle: { fr: value('subtitle', 'fr', DEFAULTS.subtitle.fr), en: value('subtitle', 'en', DEFAULTS.subtitle.en) },
      description: { fr: value('description', 'fr', DEFAULTS.description.fr), en: value('description', 'en', DEFAULTS.description.en) },
      email: value('email', 'fr', DEFAULTS.email),
      phone: value('phone', 'fr', DEFAULTS.phone),
      address: { fr: value('address', 'fr', DEFAULTS.address.fr), en: value('address', 'en', DEFAULTS.address.en) },
      hours: { fr: value('hours', 'fr', DEFAULTS.hours.fr), en: value('hours', 'en', DEFAULTS.hours.en) },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  const handleSave = () => {
    saveAll({
      title: { valueFr: contactInfo.title.fr, valueEn: contactInfo.title.en, contentType: 'text', displayOrder: 1 },
      subtitle: { valueFr: contactInfo.subtitle.fr, valueEn: contactInfo.subtitle.en, contentType: 'text', displayOrder: 2 },
      description: { valueFr: contactInfo.description.fr, valueEn: contactInfo.description.en, contentType: 'text', displayOrder: 3 },
      email: { valueFr: contactInfo.email, contentType: 'text', displayOrder: 4 },
      phone: { valueFr: contactInfo.phone, contentType: 'text', displayOrder: 5 },
      address: { valueFr: contactInfo.address.fr, valueEn: contactInfo.address.en, contentType: 'text', displayOrder: 6 },
      hours: { valueFr: contactInfo.hours.fr, valueEn: contactInfo.hours.en, contentType: 'text', displayOrder: 7 },
    });
  };

  return (
    <AdminPage>

      <AdminPageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={Mail}
        actions={
          <>
            <Button onClick={handleSave} size="lg" className="gap-2" disabled={saving || !token}>
              <Save className="w-4 h-4" />
              {saving ? '…' : t('save')}
            </Button>
          </>
        }
      />

      {/* Bandeaux d'état */}
      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {!token && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          Connectez-vous en tant qu&apos;administrateur pour modifier cette section.
        </p>
      )}
      {loading && <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"><span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />Chargement…</p>}

      <div className="space-y-6">
        {/* Informations principales */}
        <Card>
          <CardHeader className="border-b border-gray-100 dark:border-white/10">
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              {t('mainInfo')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">{t('titleLabel')}<LangChip lang="FR" /></Label>
                <Input
                  value={contactInfo.title.fr}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, title: { ...contactInfo.title, fr: e.target.value } })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">{t('titleLabel')}<LangChip lang="EN" /></Label>
                <Input
                  value={contactInfo.title.en}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, title: { ...contactInfo.title, en: e.target.value } })
                  }
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">{t('subtitleLabel')}<LangChip lang="FR" /></Label>
                <Input
                  value={contactInfo.subtitle.fr}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, subtitle: { ...contactInfo.subtitle, fr: e.target.value } })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">{t('subtitleLabel')}<LangChip lang="EN" /></Label>
                <Input
                  value={contactInfo.subtitle.en}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, subtitle: { ...contactInfo.subtitle, en: e.target.value } })
                  }
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">{t('description')}<LangChip lang="FR" /></Label>
                <Textarea
                  value={contactInfo.description.fr}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, description: { ...contactInfo.description, fr: e.target.value } })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">{t('description')}<LangChip lang="EN" /></Label>
                <Textarea
                  value={contactInfo.description.en}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, description: { ...contactInfo.description, en: e.target.value } })
                  }
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coordonnées */}
        <Card>
          <CardHeader className="border-b border-gray-100 dark:border-white/10">
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              {t('contactDetails')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t('email')}</Label>
                <Input
                  type="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('phone')}</Label>
                <Input
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">{t('address')}<LangChip lang="FR" /></Label>
                <Input
                  value={contactInfo.address.fr}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, address: { ...contactInfo.address, fr: e.target.value } })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">{t('address')}<LangChip lang="EN" /></Label>
                <Input
                  value={contactInfo.address.en}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, address: { ...contactInfo.address, en: e.target.value } })
                  }
                />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">{t('hours')}<LangChip lang="FR" /></Label>
                <Input
                  value={contactInfo.hours.fr}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, hours: { ...contactInfo.hours, fr: e.target.value } })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">{t('hours')}<LangChip lang="EN" /></Label>
                <Input
                  value={contactInfo.hours.en}
                  onChange={(e) =>
                    setContactInfo({ ...contactInfo, hours: { ...contactInfo.hours, en: e.target.value } })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Les réseaux sociaux sont désormais gérés à un seul endroit
            (Paramètres → Réseaux sociaux) pour éviter les doublons : ces liens
            alimentent à la fois la page Contact et le pied de page. */}
        <Card>
          <CardHeader className="border-b border-gray-100 dark:border-white/10">
            <CardTitle>{t('socialMedia')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Les réseaux sociaux se gèrent désormais dans{' '}
              <Link href={'/admin/settings/social' as Route} className="text-primary-600 dark:text-primary-400 underline">
                Paramètres → Réseaux sociaux
              </Link>{' '}
              (source unique, affichée sur la page Contact et le pied de page).
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminPage>
  );
}


/** Petite pastille de langue (FR / EN) accolée aux libellés des champs traduits. */
function LangChip({ lang }: { lang: 'FR' | 'EN' }) {
  return (
    <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-white/10 dark:text-gray-400">
      {lang}
    </span>
  );
}
