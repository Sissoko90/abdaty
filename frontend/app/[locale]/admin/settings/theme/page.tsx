'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import type { LucideIcon } from 'lucide-react';
import { Save, Palette, Upload, AlertCircle, CheckCircle2, Monitor, Sun, Moon, Loader2 } from 'lucide-react';
import { useSiteContentSection } from '@/hooks/use-site-content-section';
import { uploadMedia, mediaUrl } from '@/services/content.service';
import { buildShades } from '@/lib/color';

type Mode = 'system' | 'light' | 'dark';

export default function AdminThemePage() {
  const t = useTranslations('admin.settings.theme');
  const tBreadcrumb = useTranslations('admin.breadcrumb');
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const { token, blocks, saving, error, success, saveAll, value } = useSiteContentSection('branding');

  const [logo, setLogo] = useState('');
  const [defaultMode, setDefaultMode] = useState<Mode>('system');
  const [primaryColor, setPrimaryColor] = useState('#ef4444');
  const [secondaryColor, setSecondaryColor] = useState('#64748b');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    setLogo(value('logo', 'fr', ''));
    setDefaultMode((value('defaultMode', 'fr', 'system') as Mode) || 'system');
    setPrimaryColor(value('primaryColor', 'fr', '#ef4444') || '#ef4444');
    setSecondaryColor(value('secondaryColor', 'fr', '#64748b') || '#64748b');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  const handleLogoUpload = async (file: File) => {
    if (!token) return;
    setUploading(true);
    setUploadError('');
    try {
      const media = await uploadMedia(file, 'branding', token, userId);
      setLogo(media.url);
    } catch {
      setUploadError("Échec de l'upload du logo.");
    } finally {
      setUploading(false);
    }
  };

  /** Sauvegarde le branding (logo + mode). `logoValue` permet de forcer une valeur
   *  (ex: '' lors de la réinitialisation) sans dépendre de l'état asynchrone. */
  const persist = (logoValue: string, mode: Mode) => {
    saveAll({
      logo: { valueFr: logoValue, contentType: 'text', displayOrder: 1 },
      defaultMode: { valueFr: mode, contentType: 'text', displayOrder: 2 },
      primaryColor: { valueFr: primaryColor, contentType: 'text', displayOrder: 3 },
      secondaryColor: { valueFr: secondaryColor, contentType: 'text', displayOrder: 4 },
    });
  };

  const handleSave = () => persist(logo, defaultMode);

  /** Réinitialise au logo par défaut ET enregistre immédiatement. */
  const handleResetLogo = () => {
    setLogo('');
    persist('', defaultMode);
  };

  const modeOptions: { value: Mode; label: string; icon: LucideIcon }[] = [
    { value: 'system', label: 'Système', icon: Monitor },
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
  ];

  const logoSrc = logo ? mediaUrl(logo) : '/logo.png';

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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">{t('subtitle')}</p>
          </div>
          <Button onClick={handleSave} className="gap-2" disabled={saving || !token}>
            <Save className="w-4 h-4" />
            {saving ? '…' : t('save')}
          </Button>
        </div>

        {error && (
          <div role="alert" className="flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" /> <span>{error}</span>
          </div>
        )}
        {success && (
          <div role="status" className="flex items-center gap-2 rounded-md bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 px-3 py-2 text-sm text-green-700 dark:text-green-300 mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> <span>{success}</span>
          </div>
        )}

        {/* Logo */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Logo du site
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="w-32 h-20 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoSrc} alt="Logo" className="max-h-16 max-w-full object-contain" />
              </div>
              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 w-fit">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Choisir un logo
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif"
                    className="hidden"
                    disabled={uploading || !token}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleLogoUpload(f);
                      e.target.value = '';
                    }}
                  />
                </label>
                {logo && (
                  <button type="button" onClick={handleResetLogo} disabled={saving} className="block text-xs text-red-600 dark:text-red-400">
                    Réinitialiser au logo par défaut
                  </button>
                )}
                {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
                <p className="text-xs text-gray-500">Formats acceptés : PNG, JPG, WEBP, SVG, GIF.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Couleurs du site (appliquées partout : vitrine + admin) */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Couleurs du site
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label>Couleur primaire</Label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer bg-transparent"
                  />
                  <input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 font-mono text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Boutons, liens, accents (toute la palette en est dérivée).</p>
              </div>
              <div>
                <Label>Couleur secondaire</Label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-12 h-10 rounded border border-gray-300 dark:border-gray-600 cursor-pointer bg-transparent"
                  />
                  <input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 font-mono text-sm px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
            {/* Aperçu de la palette générée */}
            <div>
              <Label className="mb-1 block">Aperçu de la palette</Label>
              <div className="flex flex-wrap gap-1">
                {Object.entries(buildShades(primaryColor.startsWith('#') ? primaryColor : `#${primaryColor}`)).map(([k, v]) => (
                  <div key={k} className="text-center">
                    <div className="w-12 h-8 rounded" style={{ backgroundColor: v as string }} />
                    <span className="text-[10px] text-gray-500">{k}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Le changement s'applique <strong>partout</strong> (site vitrine et panel admin) après enregistrement et rechargement.
            </p>
          </CardContent>
        </Card>

        {/* Mode d'apparence par défaut */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Apparence par défaut
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label className="mb-2 block">Mode appliqué aux nouveaux visiteurs</Label>
            <div className="flex flex-wrap gap-3">
              {modeOptions.map((m) => {
                const Icon = m.icon;
                const active = defaultMode === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setDefaultMode(m.value)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                      active
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                        : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {m.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              « Système » suit les préférences de l'appareil. Le visiteur peut toujours basculer manuellement (son choix est mémorisé).
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
