'use client';

import { useTranslations } from 'next-intl';
import { Handshake } from 'lucide-react';
import { AdminPage, AdminPageHeader } from '@/components/admin/admin-page';
import { ContentListEditor, type FieldDef } from '@/components/admin/content-list-editor';

const PARTNER_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Nom du partenaire' },
  { name: 'logo', label: 'Logo', type: 'image' },
  { name: 'website', label: 'Site web (URL)', hint: 'https://...' },
];

export default function AdminPartnersPage() {
  const t = useTranslations('admin.content.partners');

  return (
    <AdminPage>
      <AdminPageHeader title={t('title')} description={t('subtitle')} icon={Handshake} />

      {/* Liste des partenaires (logo uploadable) — affichés dans « Ils nous font confiance ». */}
      <ContentListEditor
        section="partners"
        heading="Partenaires"
        fields={PARTNER_FIELDS}
        titleField="name"
        addLabel="Ajouter un partenaire"
      />
    </AdminPage>
  );
}
