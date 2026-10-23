'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { AdminPage, AdminPageHeader } from '@/components/admin/admin-page';
import { AdminSectionCard, AdminStatus, BilingualField } from '@/components/admin/content-list-editor';
import { Save, Mail } from 'lucide-react';
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

  const setBi = (field: keyof NewsletterContent) => (lang: 'fr' | 'en', v: string) =>
    setNewsletterContent({ ...newsletterContent, [field]: { ...newsletterContent[field], [lang]: v } });

  return (
    <AdminPage>
      <AdminPageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={Mail}
        actions={
          <Button onClick={handleSave} className="gap-2" disabled={saving || !token}>
            <Save className="h-4 w-4" />
            {saving ? '…' : t('save')}
          </Button>
        }
      />

      <AdminStatus error={error} success={success} loading={loading} signedOut={!token} />

      {/* Configuration Newsletter */}
      <AdminSectionCard title={t('configuration')} icon={Mail}>
        <BilingualField label={t('titleLabel')} value={newsletterContent.title} onChange={setBi('title')} />
        <BilingualField label={t('description')} value={newsletterContent.description} onChange={setBi('description')} multiline />
        <BilingualField label={t('placeholder')} value={newsletterContent.placeholder} onChange={setBi('placeholder')} />
        <BilingualField label={t('buttonText')} value={newsletterContent.buttonText} onChange={setBi('buttonText')} />
      </AdminSectionCard>
    </AdminPage>
  );
}
