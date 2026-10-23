'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import type { LucideIcon } from 'lucide-react';
import { Save, Palette, Upload, AlertCircle, CheckCircle2, Monitor, Sun, Moon, Loader2, ImageIcon, RotateCcw } from 'lucide-react';
import { useSiteContentSection } from '@/hooks/use-site-content-section';
import { uploadMedia, mediaUrl } from '@/services/content.service';
import { buildShades } from '@/lib/color';
import { AdminPage, AdminPageHeader } from '@/components/admin/admin-page';

type Mode = 'system' | 'light' | 'dark';

const cardCls = 'rounded-2xl border border-gray-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.03]';

/** Sélecteur de couleur : pastille native + saisie hexadécimale. */
function ColorField({ label, hint, value, onChange }: { label: string; hint?: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={label}
          className="h-11 w-14 cursor-pointer rounded-xl border border-gray-300 bg-transparent p-1 dark:border-white/15"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label={`${label} (hex)`}
          className="h-11 flex-1 rounded-xl border border-gray-300 bg-white px-3.5 font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-white/15 dark:bg-white/5 dark:text-white"
        />
      </div>
      {hint && <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
}

export default function AdminThemePage() {
  const t = useTranslations('admin.settings.theme');
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
  const hex = primaryColor.startsWith('#') ? primaryColor : `#${primaryColor}`;
  const validHex = /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/.test(hex);
  const shades = validHex ? buildShades(hex) : null;

  return (
    <AdminPage>
      <AdminPageHeader
        icon={Palette}
        title={t('title')}
        description={t('subtitle')}
        actions={
          <Button onClick={handleSave} className="gap-2" disabled={saving || !token}>
            <Save className="h-4 w-4" />
            {saving ? '…' : t('save')}
          </Button>
        }
      />

      {error && (
        <div role="alert" className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" /> <span>{error}</span>
        </div>
      )}
      {success && (
        <div role="status" className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> <span>{success}</span>
        </div>
      )}

      {/* Logo */}
      <section className={cardCls}>
        <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-ink dark:text-white">
          <ImageIcon className="h-5 w-5 text-gray-400" />
          Logo du site
        </h2>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          Vérifiez qu&apos;il reste lisible sur fond clair (navigation) comme sur fond sombre (pied de page, admin).
        </p>
        <div className="grid gap-6 md:grid-cols-12 md:items-center">
          <div className="grid grid-cols-2 gap-3 md:col-span-7">
            <div className="flex h-28 items-center justify-center rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} alt="Logo sur fond clair" className="max-h-16 max-w-full object-contain" />
            </div>
            <div className="bogolan-texture flex h-28 items-center justify-center rounded-xl bg-ink p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoSrc} alt="Logo sur fond sombre" className="max-h-16 max-w-full object-contain" />
            </div>
          </div>
          <div className="space-y-3 md:col-span-5">
            <label
              className={`inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 text-sm font-semibold text-ink transition-colors hover:bg-gray-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 ${
                uploading || !token ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
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
              <button
                type="button"
                onClick={handleResetLogo}
                disabled={saving}
                className="flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Réinitialiser au logo par défaut
              </button>
            )}
            {uploadError && <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>}
            <p className="text-xs text-gray-500 dark:text-gray-400">Formats acceptés : PNG, JPG, WEBP, SVG, GIF.</p>
          </div>
        </div>
      </section>

      {/* Couleurs du site (appliquées partout : vitrine + admin) */}
      <section className={cardCls}>
        <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-ink dark:text-white">
          <Palette className="h-5 w-5 text-gray-400" />
          Couleurs du site
        </h2>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">
          Le changement s&apos;applique <strong>partout</strong> (site vitrine et panel admin) après enregistrement et rechargement.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          <ColorField
            label="Couleur primaire"
            hint="Boutons, liens, accents (toute la palette en est dérivée)."
            value={primaryColor}
            onChange={setPrimaryColor}
          />
          <ColorField label="Couleur secondaire" value={secondaryColor} onChange={setSecondaryColor} />
        </div>

        {/* Aperçu de la palette générée + rendu des éléments clés */}
        <div className="mt-6 grid gap-6 border-t border-gray-100 pt-6 dark:border-white/10 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-medium text-ink dark:text-gray-200">Aperçu de la palette</p>
            {shades ? (
              <div className="flex overflow-hidden rounded-xl ring-1 ring-gray-200 dark:ring-white/10">
                {Object.entries(shades).map(([k, v]) => (
                  <div key={k} className="flex-1">
                    <div className="h-12" style={{ backgroundColor: v as string }} title={`${k} : ${v}`} />
                    <p className="bg-white py-1 text-center text-[10px] text-gray-500 dark:bg-transparent dark:text-gray-400">{k}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-amber-600 dark:text-ochre">Code couleur invalide (format attendu : #RRGGBB).</p>
            )}
          </div>
          <div>
            <p className="mb-3 text-sm font-medium text-ink dark:text-gray-200">Rendu des éléments</p>
            <div className="flex flex-wrap items-center gap-3 rounded-xl bg-paper p-4 dark:bg-white/5">
              <span className="inline-flex h-10 items-center rounded-lg px-4 text-sm font-semibold text-white" style={{ backgroundColor: validHex ? hex : undefined }}>
                Démarrer un projet
              </span>
              <span className="text-sm font-semibold underline-offset-4 hover:underline" style={{ color: validHex ? hex : undefined }}>
                Lien d&apos;exemple
              </span>
              {shades && (
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: shades['50' as keyof typeof shades] as string, color: shades['700' as keyof typeof shades] as string }}
                >
                  Badge
                </span>
              )}
              <span className="h-10 w-10 rounded-lg" style={{ backgroundColor: secondaryColor }} title="Couleur secondaire" />
            </div>
          </div>
        </div>
      </section>

      {/* Mode d'apparence par défaut */}
      <section className={cardCls}>
        <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-ink dark:text-white">
          <Monitor className="h-5 w-5 text-gray-400" />
          Apparence par défaut
        </h2>
        <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">Mode appliqué aux nouveaux visiteurs.</p>
        <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Apparence par défaut">
          {modeOptions.map((m) => {
            const Icon = m.icon;
            const active = defaultMode === m.value;
            return (
              <button
                key={m.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setDefaultMode(m.value)}
                className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-colors ${
                  active
                    ? 'border-primary-500 bg-primary-50 text-primary-700 ring-1 ring-primary-500 dark:bg-primary-500/10 dark:text-primary-300'
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5'
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    active ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-semibold">{m.label}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          « Système » suit les préférences de l&apos;appareil. Le visiteur peut toujours basculer manuellement (son choix est mémorisé).
        </p>
      </section>
    </AdminPage>
  );
}
