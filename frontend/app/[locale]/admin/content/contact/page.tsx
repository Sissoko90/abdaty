'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Breadcrumb } from '@/components/ui/breadcrumb';
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
  const tBreadcrumb = useTranslations('admin.breadcrumb');

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
              {t('title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300 mt-2">
              {t('subtitle')}
            </p>
          </div>
          <Button onClick={handleSave} className="gap-2" disabled={saving || !token}>
            <Save className="w-4 h-4" />
            {saving ? '…' : t('save')}
          </Button>
        </div>

        {/* Bandeaux d'état */}
        {error && (
          <div role="alert" className="flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div role="status" className="flex items-center gap-2 rounded-md bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 px-3 py-2 text-sm text-green-700 dark:text-green-300 mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}
        {!token && (
          <p className="text-sm text-gray-500 mb-4">
            Connectez-vous en tant qu&apos;administrateur pour modifier cette section.
          </p>
        )}
        {loading && <p className="text-sm text-gray-500 mb-4">Chargement…</p>}

        <div className="space-y-6">
          {/* Informations principales */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                {t('mainInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('titleLabel')} (Français)</Label>
                  <Input
                    value={contactInfo.title.fr}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, title: { ...contactInfo.title, fr: e.target.value } })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t('titleLabel')} (English)</Label>
                  <Input
                    value={contactInfo.title.en}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, title: { ...contactInfo.title, en: e.target.value } })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('subtitleLabel')} (Français)</Label>
                  <Input
                    value={contactInfo.subtitle.fr}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, subtitle: { ...contactInfo.subtitle, fr: e.target.value } })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t('subtitleLabel')} (English)</Label>
                  <Input
                    value={contactInfo.subtitle.en}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, subtitle: { ...contactInfo.subtitle, en: e.target.value } })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('description')} (Français)</Label>
                  <Textarea
                    value={contactInfo.description.fr}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, description: { ...contactInfo.description, fr: e.target.value } })
                    }
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t('description')} (English)</Label>
                  <Textarea
                    value={contactInfo.description.en}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, description: { ...contactInfo.description, en: e.target.value } })
                    }
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Coordonnées */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                {t('contactDetails')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('email')}</Label>
                  <Input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t('phone')}</Label>
                  <Input
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('address')} (Français)</Label>
                  <Input
                    value={contactInfo.address.fr}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, address: { ...contactInfo.address, fr: e.target.value } })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t('address')} (English)</Label>
                  <Input
                    value={contactInfo.address.en}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, address: { ...contactInfo.address, en: e.target.value } })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('hours')} (Français)</Label>
                  <Input
                    value={contactInfo.hours.fr}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, hours: { ...contactInfo.hours, fr: e.target.value } })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t('hours')} (English)</Label>
                  <Input
                    value={contactInfo.hours.en}
                    onChange={(e) =>
                      setContactInfo({ ...contactInfo, hours: { ...contactInfo.hours, en: e.target.value } })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Les réseaux sociaux sont désormais gérés à un seul endroit
              (Paramètres → Réseaux sociaux) pour éviter les doublons : ces liens
              alimentent à la fois la page Contact et le pied de page. */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
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
      </div>
    </div>
  );
}
