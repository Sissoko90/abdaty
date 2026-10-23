'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Save, Megaphone, Upload, AlertCircle, CheckCircle2, Loader2, Plus, Trash2, GalleryHorizontal, PanelBottomOpen } from 'lucide-react';
import { AdminPage, AdminPageHeader, AdminStatCard } from '@/components/admin/admin-page';
import { useSiteContentSection } from '@/hooks/use-site-content-section';
import { uploadMedia, mediaUrl } from '@/services/content.service';
import { type PromoSlide, emptySlide, parseSlides, isActiveNow } from '@/lib/promo';

/** Interrupteur on/off accessible (Switch partagé + libellé d'état). */
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <Switch checked={checked} onCheckedChange={onChange} />
      <span className="text-sm font-medium text-ink dark:text-gray-200">{label}</span>
    </label>
  );
}

/** Champ libellé + contrôle, espacement commun. */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

const cardCls = 'rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]';

export default function AdminPromotionsPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const { token, blocks, saving, error, success, saveAll, value } = useSiteContentSection('promo');

  // Bannière (liste de slides en rotation)
  const [barEnabled, setBarEnabled] = useState(false);
  const [slides, setSlides] = useState<PromoSlide[]>([]);

  // Carte promo (coin)
  const [cornerEnabled, setCornerEnabled] = useState(false);
  const [cornerTitleFr, setCornerTitleFr] = useState('');
  const [cornerTitleEn, setCornerTitleEn] = useState('');
  const [cornerTextFr, setCornerTextFr] = useState('');
  const [cornerTextEn, setCornerTextEn] = useState('');
  const [cornerCtaFr, setCornerCtaFr] = useState('');
  const [cornerCtaEn, setCornerCtaEn] = useState('');
  const [cornerHref, setCornerHref] = useState('');
  const [cornerImage, setCornerImage] = useState('');
  const [cornerStart, setCornerStart] = useState('');
  const [cornerEnd, setCornerEnd] = useState('');

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setBarEnabled(value('barEnabled', 'fr', 'false') === 'true');
    setSlides(parseSlides(value('barItems', 'fr', '')));

    setCornerEnabled(value('cornerEnabled', 'fr', 'false') === 'true');
    setCornerTitleFr(value('cornerTitle', 'fr', ''));
    setCornerTitleEn(value('cornerTitle', 'en', ''));
    setCornerTextFr(value('cornerText', 'fr', ''));
    setCornerTextEn(value('cornerText', 'en', ''));
    setCornerCtaFr(value('cornerCtaLabel', 'fr', ''));
    setCornerCtaEn(value('cornerCtaLabel', 'en', ''));
    setCornerHref(value('cornerCtaHref', 'fr', ''));
    setCornerImage(value('cornerImage', 'fr', ''));
    setCornerStart(value('cornerStart', 'fr', ''));
    setCornerEnd(value('cornerEnd', 'fr', ''));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blocks]);

  const updateSlide = (id: string, patch: Partial<PromoSlide>) =>
    setSlides((arr) => arr.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const addSlide = () => setSlides((arr) => [...arr, emptySlide()]);
  const removeSlide = (id: string) => setSlides((arr) => arr.filter((s) => s.id !== id));

  const handleImageUpload = async (file: File) => {
    if (!token) return;
    setUploading(true);
    try {
      const media = await uploadMedia(file, 'promo', token, userId);
      setCornerImage(media.url);
    } finally {
      setUploading(false);
    }
  };

  const save = () => {
    saveAll({
      barEnabled: { valueFr: barEnabled ? 'true' : 'false', contentType: 'text', displayOrder: 1 },
      barItems: { valueFr: JSON.stringify(slides), contentType: 'json', displayOrder: 2 },
      cornerEnabled: { valueFr: cornerEnabled ? 'true' : 'false', contentType: 'text', displayOrder: 6 },
      cornerTitle: { valueFr: cornerTitleFr, valueEn: cornerTitleEn, contentType: 'text', displayOrder: 7 },
      cornerText: { valueFr: cornerTextFr, valueEn: cornerTextEn, contentType: 'text', displayOrder: 8 },
      cornerCtaLabel: { valueFr: cornerCtaFr, valueEn: cornerCtaEn, contentType: 'text', displayOrder: 9 },
      cornerCtaHref: { valueFr: cornerHref, contentType: 'text', displayOrder: 10 },
      cornerImage: { valueFr: cornerImage, contentType: 'text', displayOrder: 11 },
      cornerStart: { valueFr: cornerStart, contentType: 'text', displayOrder: 12 },
      cornerEnd: { valueFr: cornerEnd, contentType: 'text', displayOrder: 13 },
    });
  };

  const activeSlides = slides.filter((s) => (s.textFr || s.textEn) && isActiveNow(s.start, s.end)).length;

  const saveButton = (
    <Button onClick={save} disabled={saving} className="gap-2">
      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      Enregistrer
    </Button>
  );

  return (
    <AdminPage>
      <AdminPageHeader
        title="Promotions & publicités"
        description="Bannière à rotation sous la navbar et carte promotionnelle en coin, avec planification de campagne."
        icon={Megaphone}
        actions={saveButton}
      />

      {error && (
        <div role="alert" className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {success && (
        <div role="status" className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> Enregistré avec succès.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <AdminStatCard label="Slides de la bannière" value={slides.length} icon={GalleryHorizontal} tone="ink" hint="Rotation automatique toutes les 6 s" />
        <AdminStatCard label="Slides actifs aujourd'hui" value={activeSlides} icon={CheckCircle2} tone="emerald" />
        <AdminStatCard label="Carte promo" value={cornerEnabled ? 'Activée' : 'Désactivée'} icon={PanelBottomOpen} tone="ochre" />
      </div>

      {/* BANNIÈRE — slides en rotation */}
      <section className={cardCls}>
        <div className="flex flex-col gap-3 border-b border-gray-100 p-6 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink dark:text-white">Bannière (sous la navbar)</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Les slides s&apos;affichent dans l&apos;ordre ci-dessous, pendant leur période de campagne.</p>
          </div>
          <Toggle checked={barEnabled} onChange={setBarEnabled} label={barEnabled ? 'Activée' : 'Désactivée'} />
        </div>
        <div className="space-y-4 p-6">
          {slides.length === 0 && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-300 px-6 py-10 text-center dark:border-white/15">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                <GalleryHorizontal className="h-5 w-5" />
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400">Aucun slide. Ajoutez-en un pour afficher la bannière.</p>
            </div>
          )}

          {slides.map((s, i) => {
            const live = (s.textFr || s.textEn) && isActiveNow(s.start, s.end);
            return (
              <div key={s.id} className="rounded-xl border border-gray-200 bg-paper/60 p-5 dark:border-white/10 dark:bg-white/[0.02]">
                <div className="mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-3 text-sm font-semibold text-ink dark:text-white">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-xs text-white dark:bg-white dark:text-ink">{i + 1}</span>
                    Slide {i + 1}
                    <Badge variant={live ? 'success' : 'secondary'}>{live ? 'actif' : 'inactif'}</Badge>
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => removeSlide(s.id)} className="gap-1 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" /> Supprimer
                  </Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Texte (FR)"><Input value={s.textFr} onChange={(e) => updateSlide(s.id, { textFr: e.target.value })} placeholder="-20% ce mois-ci !" /></Field>
                  <Field label="Texte (EN)"><Input value={s.textEn} onChange={(e) => updateSlide(s.id, { textEn: e.target.value })} placeholder="-20% this month!" /></Field>
                  <Field label="Bouton (FR)"><Input value={s.ctaFr} onChange={(e) => updateSlide(s.id, { ctaFr: e.target.value })} placeholder="J'en profite" /></Field>
                  <Field label="Bouton (EN)"><Input value={s.ctaEn} onChange={(e) => updateSlide(s.id, { ctaEn: e.target.value })} placeholder="Get the deal" /></Field>
                  <Field label="Lien"><Input value={s.href} onChange={(e) => updateSlide(s.id, { href: e.target.value })} placeholder="/services ou https://…" /></Field>
                  <Field label="Fond (optionnel)"><Input value={s.bg} onChange={(e) => updateSlide(s.id, { bg: e.target.value })} placeholder="#7c3aed ou linear-gradient(...)" className="font-mono" /></Field>
                  <Field label="Début de campagne"><Input type="date" value={s.start} onChange={(e) => updateSlide(s.id, { start: e.target.value })} /></Field>
                  <Field label="Fin de campagne"><Input type="date" value={s.end} onChange={(e) => updateSlide(s.id, { end: e.target.value })} /></Field>
                </div>
              </div>
            );
          })}

          <Button variant="outline" onClick={addSlide} className="gap-2">
            <Plus className="h-4 w-4" /> Ajouter un slide
          </Button>
        </div>
      </section>

      {/* CARTE PROMO COIN */}
      <section className={cardCls}>
        <div className="flex flex-col gap-3 border-b border-gray-100 p-6 dark:border-white/5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink dark:text-white">Carte promo (coin bas-gauche)</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">S&apos;affiche après le choix des cookies du visiteur, jusqu&apos;à ce qu&apos;il la ferme.</p>
          </div>
          <Toggle checked={cornerEnabled} onChange={setCornerEnabled} label={cornerEnabled ? 'Activée' : 'Désactivée'} />
        </div>
        <div className="grid gap-6 p-6 md:grid-cols-2">
          <Field label="Titre (FR)"><Input value={cornerTitleFr} onChange={(e) => setCornerTitleFr(e.target.value)} placeholder="Offre spéciale" /></Field>
          <Field label="Titre (EN)"><Input value={cornerTitleEn} onChange={(e) => setCornerTitleEn(e.target.value)} placeholder="Special offer" /></Field>
          <Field label="Texte (FR)"><Textarea rows={2} value={cornerTextFr} onChange={(e) => setCornerTextFr(e.target.value)} /></Field>
          <Field label="Texte (EN)"><Textarea rows={2} value={cornerTextEn} onChange={(e) => setCornerTextEn(e.target.value)} /></Field>
          <Field label="Bouton (FR)"><Input value={cornerCtaFr} onChange={(e) => setCornerCtaFr(e.target.value)} placeholder="Découvrir" /></Field>
          <Field label="Bouton (EN)"><Input value={cornerCtaEn} onChange={(e) => setCornerCtaEn(e.target.value)} placeholder="Discover" /></Field>
          <Field label="Lien"><Input value={cornerHref} onChange={(e) => setCornerHref(e.target.value)} placeholder="/contact ou https://…" /></Field>
          <Field label="Image (optionnel)">
            <div className="flex flex-wrap items-center gap-3">
              {cornerImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={mediaUrl(cornerImage)} alt="" className="h-11 w-16 rounded-lg object-cover ring-1 ring-gray-200 dark:ring-white/10" />
              )}
              <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-gray-300 px-4 text-sm font-medium text-ink transition-colors hover:bg-gray-50 dark:border-white/15 dark:text-white dark:hover:bg-white/5">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Téléverser
                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
              </label>
              {cornerImage && <Button variant="ghost" size="sm" onClick={() => setCornerImage('')}>Retirer</Button>}
            </div>
          </Field>
          <Field label="Début de campagne"><Input type="date" value={cornerStart} onChange={(e) => setCornerStart(e.target.value)} /></Field>
          <Field label="Fin de campagne"><Input type="date" value={cornerEnd} onChange={(e) => setCornerEnd(e.target.value)} /></Field>
        </div>
      </section>

      <div className="flex justify-end">{saveButton}</div>
    </AdminPage>
  );
}
