'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Save, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSiteContentSection } from '@/hooks/use-site-content-section';

interface NewsletterContent {
  title: { fr: string; en: string };
  description: { fr: string; en: string };
  placeholder: { fr: string; en: string };
  buttonText: { fr: string; en: string };
  successMessage: { fr: string; en: string };
  errorMessage: { fr: string; en: string };
  privacyNote: { fr: string; en: string };
}

/** Valeurs par défaut (repli si la section n'a pas encore de contenu en base). */
const DEFAULTS: NewsletterContent = {
  title: { fr: 'Restez informé', en: 'Stay Informed' },
  description: {
    fr: 'Rejoignez notre newsletter pour recevoir les dernières actualités',
    en: 'Join our newsletter to receive the latest news',
  },
  placeholder: { fr: 'Votre adresse email', en: 'Your email address' },
  buttonText: { fr: "S'abonner", en: 'Subscribe' },
  successMessage: { fr: 'Merci de vous être abonné !', en: 'Thank you for subscribing!' },
  errorMessage: { fr: "Une erreur s'est produite", en: 'An error occurred' },
  privacyNote: {
    fr: 'Nous respectons votre vie privée. Désabonnement possible à tout moment.',
    en: 'We respect your privacy. Unsubscribe anytime.',
  },
};

export default function AdminNewsletterPage() {
  const t = useTranslations('admin.content.newsletter');
  const tBreadcrumb = useTranslations('admin.breadcrumb');

  const { token, blocks, loading, saving, error, success, saveAll, value } =
    useSiteContentSection('newsletter');

  const [newsletterContent, setNewsletterContent] = useState<NewsletterContent>(DEFAULTS);

  // Synchronise le formulaire avec les blocs chargés.
  useEffect(() => {
    const pair = (key: string, def: { fr: string; en: string }) => ({
      fr: value(key, 'fr', def.fr),
      en: value(key, 'en', def.en),
    });
    setNewsletterContent({
      title: pair('title', DEFAULTS.title),
      description: pair('description', DEFAULTS.description),
      placeholder: pair('placeholder', DEFAULTS.placeholder),
      buttonText: pair('buttonText', DEFAULTS.buttonText),
      successMessage: pair('successMessage', DEFAULTS.successMessage),
      errorMessage: pair('errorMessage', DEFAULTS.errorMessage),
      privacyNote: pair('privacyNote', DEFAULTS.privacyNote),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  const handleSave = () => {
    const c = newsletterContent;
    const block = (v: { fr: string; en: string }, order: number) => ({
      valueFr: v.fr,
      valueEn: v.en,
      contentType: 'text',
      displayOrder: order,
    });
    saveAll({
      title: block(c.title, 1),
      description: block(c.description, 2),
      placeholder: block(c.placeholder, 3),
      buttonText: block(c.buttonText, 4),
      successMessage: block(c.successMessage, 5),
      errorMessage: block(c.errorMessage, 6),
      privacyNote: block(c.privacyNote, 7),
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
          {/* Configuration Newsletter */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                {t('configuration')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('titleLabel')} (Français)</Label>
                  <Input
                    value={newsletterContent.title.fr}
                    onChange={(e) =>
                      setNewsletterContent({ ...newsletterContent, title: { ...newsletterContent.title, fr: e.target.value } })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t('titleLabel')} (English)</Label>
                  <Input
                    value={newsletterContent.title.en}
                    onChange={(e) =>
                      setNewsletterContent({ ...newsletterContent, title: { ...newsletterContent.title, en: e.target.value } })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('description')} (Français)</Label>
                  <Textarea
                    value={newsletterContent.description.fr}
                    onChange={(e) =>
                      setNewsletterContent({ ...newsletterContent, description: { ...newsletterContent.description, fr: e.target.value } })
                    }
                    rows={3}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t('description')} (English)</Label>
                  <Textarea
                    value={newsletterContent.description.en}
                    onChange={(e) =>
                      setNewsletterContent({ ...newsletterContent, description: { ...newsletterContent.description, en: e.target.value } })
                    }
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('placeholder')} (Français)</Label>
                  <Input
                    value={newsletterContent.placeholder.fr}
                    onChange={(e) =>
                      setNewsletterContent({ ...newsletterContent, placeholder: { ...newsletterContent.placeholder, fr: e.target.value } })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t('placeholder')} (English)</Label>
                  <Input
                    value={newsletterContent.placeholder.en}
                    onChange={(e) =>
                      setNewsletterContent({ ...newsletterContent, placeholder: { ...newsletterContent.placeholder, en: e.target.value } })
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('buttonText')} (Français)</Label>
                  <Input
                    value={newsletterContent.buttonText.fr}
                    onChange={(e) =>
                      setNewsletterContent({ ...newsletterContent, buttonText: { ...newsletterContent.buttonText, fr: e.target.value } })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>{t('buttonText')} (English)</Label>
                  <Input
                    value={newsletterContent.buttonText.en}
                    onChange={(e) =>
                      setNewsletterContent({ ...newsletterContent, buttonText: { ...newsletterContent.buttonText, en: e.target.value } })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
