'use client';

import { useTranslations } from 'next-intl';
import { Share2 } from 'lucide-react';
import { ContentListEditor, type FieldDef } from '@/components/admin/content-list-editor';
import { AdminPage, AdminPageHeader } from '@/components/admin/admin-page';
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

  return (
    <AdminPage>
      <AdminPageHeader
        icon={Share2}
        title={t('title')}
        description={
          <>
            {t('subtitle')} — ces liens alimentent le pied de page et la page Contact. Vous pouvez en
            ajouter, en désactiver (masqués sans suppression) ou en supprimer.
          </>
        }
      />

      <ContentListEditor
        section="socials"
        heading="Réseaux sociaux"
        fields={SOCIAL_FIELDS}
        titleField="platform"
        addLabel="Ajouter un réseau"
      />
    </AdminPage>
  );
}
