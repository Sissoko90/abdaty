import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Key, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default async function CreateApiKeyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('dashboard.createApiKey');

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-950 dark:to-red-950 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <Link href={`/${locale}/dashboard/api-keys`}>
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                {t('back')}
              </Button>
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {t('title')}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-2xl mx-auto">
          <CardHeader className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/10">
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Key className="w-5 h-5" />
              Détails de la clé API
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Name */}
            <div>
              <Label htmlFor="keyName" className="text-gray-900 dark:text-white">{t('name')}</Label>
              <Input
                id="keyName"
                type="text"
                placeholder={t('namePlaceholder')}
                className="mt-1"
              />
            </div>

            {/* Permissions */}
            <div>
              <Label className="text-gray-900 dark:text-white mb-3 block">{t('permissions')}</Label>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <input type="checkbox" id="read" defaultChecked className="w-5 h-5 rounded dark:bg-gray-700 dark:border-gray-600" />
                  <Label htmlFor="read" className="text-gray-900 dark:text-white cursor-pointer">
                    {t('read')}
                  </Label>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <input type="checkbox" id="write" className="w-5 h-5 rounded dark:bg-gray-700 dark:border-gray-600" />
                  <Label htmlFor="write" className="text-gray-900 dark:text-white cursor-pointer">
                    {t('write')}
                  </Label>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <input type="checkbox" id="delete" className="w-5 h-5 rounded dark:bg-gray-700 dark:border-gray-600" />
                  <Label htmlFor="delete" className="text-gray-900 dark:text-white cursor-pointer">
                    {t('delete')}
                  </Label>
                </div>
              </div>
            </div>

            {/* Expiry */}
            <div>
              <Label htmlFor="expiry" className="text-gray-900 dark:text-white">{t('expiry')}</Label>
              <Input
                id="expiry"
                type="date"
                className="mt-1"
              />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('noExpiry')}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button variant="outline" className="flex-1">
                {t('cancel')}
              </Button>
              <Button className="flex-1 gap-2">
                <Check className="w-4 h-4" />
                {t('create')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-800 rounded-xl max-w-2xl mx-auto mt-6">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900 dark:text-blue-300">
              <strong>Note :</strong> Votre clé API sera affichée une seule fois après sa création. Assurez-vous de la copier et de la stocker en lieu sûr.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
