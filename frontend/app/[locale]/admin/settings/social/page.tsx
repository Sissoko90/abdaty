'use client';

import { useTranslations } from 'next-intl';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ContentListEditor, type FieldDef } from '@/components/admin/content-list-editor';
import { SOCIAL_PLATFORMS } from '@/lib/social-icons';

/**
 * Champs d'un réseau social. La plateforme détermine l'icône affichée côté
 * public (footer + page contact). L'URL est le lien cliquable.
 */
const SOCIAL_FIELDS: FieldDef[] = [
  { name: 'platform', label: 'Plateforme', type: 'select', options: SOCIAL_PLATFORMS },
  { name: 'url', label: 'Lien (URL)', hint: 'https://… (ou mailto:contact@… pour Email)' },
  { name: 'label', label: 'Libellé (optionnel)', hint: 'Texte affiché au survol ; par défaut le nom de la plateforme' },
];

export default function AdminSocialPage() {
  const t = useTranslations('admin.settings.social');
  const tBreadcrumb = useTranslations('admin.breadcrumb');

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

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('subtitle')} — ces liens alimentent le pied de page et la page Contact. Vous pouvez en
            ajouter, en désactiver (masqués sans suppression) ou en supprimer.
          </p>
        </div>

        <ContentListEditor
          section="socials"
          heading="Réseaux sociaux"
          fields={SOCIAL_FIELDS}
          titleField="platform"
          addLabel="Ajouter un réseau"
        />
      </div>
    </div>
  );
}
