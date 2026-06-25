'use client';

import { useTranslations } from 'next-intl';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ContentListEditor, type FieldDef } from '@/components/admin/content-list-editor';

const PARTNER_FIELDS: FieldDef[] = [
  { name: 'name', label: 'Nom du partenaire' },
  { name: 'logo', label: 'Logo', type: 'image' },
  { name: 'website', label: 'Site web (URL)', hint: 'https://...' },
];

export default function AdminPartnersPage() {
  const t = useTranslations('admin.content.partners');
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
          <p className="text-gray-600 dark:text-gray-400 mt-2">{t('subtitle')}</p>
        </div>

        {/* Liste des partenaires (logo uploadable) — affichés dans « Ils nous font confiance ». */}
        <ContentListEditor
          section="partners"
          heading="Partenaires"
          fields={PARTNER_FIELDS}
          titleField="name"
          addLabel="Ajouter un partenaire"
        />
      </div>
    </div>
  );
}
