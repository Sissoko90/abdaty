'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Megaphone, Upload, AlertCircle, CheckCircle2, Loader2, Plus, Trash2 } from 'lucide-react';
import { useSiteContentSection } from '@/hooks/use-site-content-section';
import { uploadMedia, mediaUrl } from '@/services/content.service';
import { type PromoSlide, emptySlide, parseSlides, isActiveNow } from '@/lib/promo';

/** Interrupteur on/off accessible. */
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-2" aria-pressed={checked}>
      <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
      </span>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
    </button>
  );
}

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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Megaphone className="w-7 h-7 text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Promotions & publicités</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bannière à rotation sous la navbar et carte promotionnelle en coin, avec planification de campagne.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm">
          <CheckCircle2 className="w-4 h-4" /> Enregistré avec succès.
        </div>
      )}

      {/* BANNIÈRE — slides en rotation */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Bannière (sous la navbar)</CardTitle>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {slides.length} slide(s) · {activeSlides} active(s) actuellement · rotation auto toutes les 6 s
            </p>
          </div>
          <Toggle checked={barEnabled} onChange={setBarEnabled} label={barEnabled ? 'Activée' : 'Désactivée'} />
        </CardHeader>
        <CardContent className="space-y-4">
          {slides.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">Aucun slide. Ajoutez-en un pour afficher la bannière.</p>
          )}

          {slides.map((s, i) => {
            const live = (s.textFr || s.textEn) && isActiveNow(s.start, s.end);
            return (
              <div key={s.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    Slide {i + 1}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${live ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                      {live ? 'actif' : 'inactif'}
                    </span>
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => removeSlide(s.id)} className="text-red-600 gap-1">
                    <Trash2 className="w-4 h-4" /> Supprimer
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div><Label>Texte (FR)</Label><Input value={s.textFr} onChange={(e) => updateSlide(s.id, { textFr: e.target.value })} placeholder="-20% ce mois-ci !" /></div>
                  <div><Label>Texte (EN)</Label><Input value={s.textEn} onChange={(e) => updateSlide(s.id, { textEn: e.target.value })} placeholder="-20% this month!" /></div>
                  <div><Label>Bouton (FR)</Label><Input value={s.ctaFr} onChange={(e) => updateSlide(s.id, { ctaFr: e.target.value })} placeholder="J'en profite" /></div>
                  <div><Label>Bouton (EN)</Label><Input value={s.ctaEn} onChange={(e) => updateSlide(s.id, { ctaEn: e.target.value })} placeholder="Get the deal" /></div>
                  <div><Label>Lien</Label><Input value={s.href} onChange={(e) => updateSlide(s.id, { href: e.target.value })} placeholder="/services ou https://…" /></div>
                  <div><Label>Fond (optionnel)</Label><Input value={s.bg} onChange={(e) => updateSlide(s.id, { bg: e.target.value })} placeholder="#7c3aed ou linear-gradient(...)" /></div>
                  <div><Label>Début de campagne</Label><Input type="date" value={s.start} onChange={(e) => updateSlide(s.id, { start: e.target.value })} /></div>
                  <div><Label>Fin de campagne</Label><Input type="date" value={s.end} onChange={(e) => updateSlide(s.id, { end: e.target.value })} /></div>
                </div>
              </div>
            );
          })}

          <Button variant="outline" onClick={addSlide} className="gap-2">
            <Plus className="w-4 h-4" /> Ajouter un slide
          </Button>
        </CardContent>
      </Card>

      {/* CARTE PROMO COIN */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Carte promo (coin bas-gauche)</CardTitle>
          <Toggle checked={cornerEnabled} onChange={setCornerEnabled} label={cornerEnabled ? 'Activée' : 'Désactivée'} />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>Titre (FR)</Label><Input value={cornerTitleFr} onChange={(e) => setCornerTitleFr(e.target.value)} placeholder="Offre spéciale" /></div>
            <div><Label>Titre (EN)</Label><Input value={cornerTitleEn} onChange={(e) => setCornerTitleEn(e.target.value)} placeholder="Special offer" /></div>
            <div><Label>Texte (FR)</Label><Textarea rows={2} value={cornerTextFr} onChange={(e) => setCornerTextFr(e.target.value)} /></div>
            <div><Label>Texte (EN)</Label><Textarea rows={2} value={cornerTextEn} onChange={(e) => setCornerTextEn(e.target.value)} /></div>
            <div><Label>Bouton (FR)</Label><Input value={cornerCtaFr} onChange={(e) => setCornerCtaFr(e.target.value)} placeholder="Découvrir" /></div>
            <div><Label>Bouton (EN)</Label><Input value={cornerCtaEn} onChange={(e) => setCornerCtaEn(e.target.value)} placeholder="Discover" /></div>
            <div><Label>Lien</Label><Input value={cornerHref} onChange={(e) => setCornerHref(e.target.value)} placeholder="/contact ou https://…" /></div>
            <div>
              <Label>Image (optionnel)</Label>
              <div className="flex items-center gap-3">
                {cornerImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={mediaUrl(cornerImage)} alt="" className="h-12 w-16 object-cover rounded" />
                )}
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  Téléverser
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
                </label>
                {cornerImage && <Button variant="ghost" size="sm" onClick={() => setCornerImage('')}>Retirer</Button>}
              </div>
            </div>
            <div><Label>Début de campagne</Label><Input type="date" value={cornerStart} onChange={(e) => setCornerStart(e.target.value)} /></div>
            <div><Label>Fin de campagne</Label><Input type="date" value={cornerEnd} onChange={(e) => setCornerEnd(e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
