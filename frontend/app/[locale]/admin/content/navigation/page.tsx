'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AdminPage, AdminPageHeader } from '@/components/admin/admin-page';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Globe, ArrowUp, ArrowDown, Trash2, AlertCircle, CheckCircle2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSiteContentSection, type ContentBlockInput } from '@/hooks/use-site-content-section';
import type { SiteContent } from '@/types/content';

interface NavItem {
  id: string;
  label: { fr: string; en: string };
  href: string;
  order: number;
  isActive: boolean;
  isExternal: boolean;
}

/** Éléments de navigation par défaut (repli si rien en base). */
const DEFAULTS: NavItem[] = [
  { id: '1', label: { fr: 'Accueil', en: 'Home' }, href: '/', order: 1, isActive: true, isExternal: false },
  { id: '2', label: { fr: 'Services', en: 'Services' }, href: '/services', order: 2, isActive: true, isExternal: false },
  { id: '3', label: { fr: 'API SMS', en: 'SMS API' }, href: '/sms-api', order: 3, isActive: true, isExternal: false },
  { id: '4', label: { fr: 'Documentation', en: 'Documentation' }, href: '/docs', order: 4, isActive: true, isExternal: false },
  { id: '5', label: { fr: 'Blog', en: 'Blog' }, href: '/blog', order: 5, isActive: true, isExternal: false },
  { id: '6', label: { fr: 'À propos', en: 'About' }, href: '/about', order: 6, isActive: true, isExternal: false },
  { id: '7', label: { fr: 'FAQ', en: 'FAQ' }, href: '/faq', order: 7, isActive: true, isExternal: false },
  { id: '8', label: { fr: 'Contact', en: 'Contact' }, href: '/contact', order: 8, isActive: true, isExternal: false },
];

/** Reconstruit un élément de navigation à partir d'un bloc de contenu. */
function parseNav(block: SiteContent): NavItem {
  let data: { label?: { fr: string; en: string }; href?: string; isExternal?: boolean } = {};
  try {
    data = block.valueFr ? JSON.parse(block.valueFr) : {};
  } catch {
    /* JSON invalide */
  }
  return {
    id: block.contentKey,
    label: { fr: data.label?.fr ?? '', en: data.label?.en ?? '' },
    href: data.href ?? '',
    order: block.displayOrder ?? 0,
    isActive: block.active ?? true,
    isExternal: data.isExternal ?? false,
  };
}

export default function AdminNavigationPage() {
  const t = useTranslations('admin.content.navigation');

  const { token, blocks, loading, saving, error, success, saveAll, remove } =
    useSiteContentSection('navigation');

  const [navItems, setNavItems] = useState<NavItem[]>(DEFAULTS);
  const [newItem, setNewItem] = useState<NavItem>({
    id: '',
    label: { fr: '', en: '' },
    href: '',
    order: DEFAULTS.length + 1,
    isActive: true,
    isExternal: false,
  });

  // Charge les éléments depuis le backend s'il en existe (sinon défauts).
  useEffect(() => {
    const list = Object.values(blocks);
    if (list.length > 0) {
      setNavItems(list.map(parseNav).sort((a, b) => a.order - b.order));
    }
  }, [blocks]);

  const handleSave = async () => {
    if (!token) return;
    const entries: Record<string, ContentBlockInput> = {};
    navItems.forEach((item, i) => {
      const key = item.id || `item-${i + 1}`;
      entries[key] = {
        valueFr: JSON.stringify({ label: item.label, href: item.href, isExternal: item.isExternal }),
        contentType: 'json',
        displayOrder: item.order,
        active: item.isActive,
      };
    });
    await saveAll(entries);
    // Réconciliation : supprime du backend les blocs absents de la liste courante.
    const keep = new Set(navItems.map((i) => i.id));
    await Promise.all(Object.keys(blocks).filter((k) => !keep.has(k)).map((k) => remove(k)));
  };

  const handleDelete = (id: string) => {
    if (confirm(t('confirmDelete'))) {
      // Suppression locale ; la persistance se fait à l'enregistrement (réconciliation).
      setNavItems(navItems.filter((item) => item.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setNavItems(navItems.map((item) => (item.id === id ? { ...item, isActive: !item.isActive } : item)));
  };

  const handleToggleExternal = (id: string) => {
    setNavItems(navItems.map((item) => (item.id === id ? { ...item, isExternal: !item.isExternal } : item)));
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newItems = [...navItems];
      [newItems[index], newItems[index - 1]] = [newItems[index - 1], newItems[index]];
      setNavItems(newItems.map((item, i) => ({ ...item, order: i + 1 })));
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < navItems.length - 1) {
      const newItems = [...navItems];
      [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
      setNavItems(newItems.map((item, i) => ({ ...item, order: i + 1 })));
    }
  };

  const handleAddNewItem = () => {
    if (newItem.label.fr && newItem.href) {
      setNavItems([...navItems, { ...newItem, id: `item-${Date.now()}` }]);
      setNewItem({
        id: '',
        label: { fr: '', en: '' },
        href: '',
        order: navItems.length + 2,
        isActive: true,
        isExternal: false,
      });
    }
  };

  const sortedNavItems = [...navItems].sort((a, b) => a.order - b.order);

  return (
    <AdminPage>

      <AdminPageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={Globe}
        actions={
          <>
            <Button onClick={handleSave} size="lg" className="gap-2" disabled={saving || !token}>
              <Save className="w-4 h-4" />
              {saving ? '…' : t('save')}
            </Button>
          </>
        }
      />

      {/* Bandeaux d'état */}
      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {!token && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          Connectez-vous en tant qu&apos;administrateur pour modifier la navigation.
        </p>
      )}
      {loading && <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400"><span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-600 border-t-transparent" />Chargement…</p>}

      {/* Liens existants : une ligne par lien (ordre, libellés FR/EN, URL, options) */}
      <Card>
        <CardHeader className="border-b border-gray-100 dark:border-white/10">
          <CardTitle>{t('navItems')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-6">
          {sortedNavItems.map((item, index) => (
            <div
              key={item.id}
              className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.02] lg:flex-row lg:items-end"
            >
              <div className="flex gap-1 lg:flex-col">
                <Button variant="outline" size="icon" onClick={() => handleMoveUp(index)} disabled={index === 0} className="h-8 w-8" aria-label="Monter">
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => handleMoveDown(index)} disabled={index === sortedNavItems.length - 1} className="h-8 w-8" aria-label="Descendre">
                  <ArrowDown className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid flex-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs">{t('label')}<LangChip lang="FR" /></Label>
                  <Input
                    value={item.label.fr}
                    onChange={(e) => setNavItems(navItems.map((n) => (n.id === item.id ? { ...n, label: { ...n.label, fr: e.target.value } } : n)))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-xs">{t('label')}<LangChip lang="EN" /></Label>
                  <Input
                    value={item.label.en}
                    onChange={(e) => setNavItems(navItems.map((n) => (n.id === item.id ? { ...n, label: { ...n.label, en: e.target.value } } : n)))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">{t('href')}</Label>
                  <Input
                    value={item.href}
                    onChange={(e) => setNavItems(navItems.map((n) => (n.id === item.id ? { ...n, href: e.target.value } : n)))}
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <OptionToggle checked={item.isActive} onChange={() => handleToggleActive(item.id)} label={t('active')} />
                <OptionToggle checked={item.isExternal} onChange={() => handleToggleExternal(item.id)} label={t('external')} />
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} aria-label="Supprimer" className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Ajout d'un lien */}
      <Card>
        <CardHeader className="border-b border-gray-100 dark:border-white/10">
          <CardTitle>{t('addNewItem')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">{t('label')}<LangChip lang="FR" /></Label>
              <Input value={newItem.label.fr} onChange={(e) => setNewItem({ ...newItem, label: { ...newItem.label, fr: e.target.value } })} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">{t('label')}<LangChip lang="EN" /></Label>
              <Input value={newItem.label.en} onChange={(e) => setNewItem({ ...newItem, label: { ...newItem.label, en: e.target.value } })} />
            </div>
            <div className="space-y-2">
              <Label>{t('href')}</Label>
              <Input value={newItem.href} onChange={(e) => setNewItem({ ...newItem, href: e.target.value })} />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <OptionToggle checked={newItem.isActive} onChange={(v) => setNewItem({ ...newItem, isActive: v })} label={t('active')} />
            <OptionToggle checked={newItem.isExternal} onChange={(v) => setNewItem({ ...newItem, isExternal: v })} label={t('external')} />
            <Button onClick={handleAddNewItem} className="ml-auto gap-2">
              <Plus className="h-4 w-4" />
              {t('add')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </AdminPage>
  );
}


/** Petite pastille de langue (FR / EN) accolée aux libellés des champs traduits. */
function LangChip({ lang }: { lang: 'FR' | 'EN' }) {
  return (
    <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-white/10 dark:text-gray-400">
      {lang}
    </span>
  );
}

/** Option cochable présentée comme une pastille (actif, lien externe…). */
function OptionToggle({ checked, onChange, label }: { checked: boolean; onChange: (checked: boolean) => void; label: string }) {
  return (
    <label
      className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border px-3 text-xs font-semibold transition-colors ${
        checked
          ? 'border-primary-200 bg-primary-50 text-primary-700 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-300'
          : 'border-gray-200 bg-white text-gray-600 dark:border-white/10 dark:bg-white/5 dark:text-gray-300'
      }`}
    >
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-3.5 w-3.5 accent-primary-600" />
      {label}
    </label>
  );
}
