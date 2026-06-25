'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Globe, ArrowUp, ArrowDown, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Breadcrumb } from '@/components/ui/breadcrumb';
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
  const tBreadcrumb = useTranslations('admin.breadcrumb');

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
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: tBreadcrumb('dashboard'), href: `/admin` },
            { label: tBreadcrumb('admin'), href: `/admin` },
            { label: t('title') },
          ]}
        />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">
              {t('title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300 mt-2">
              {t('subtitle')}
            </p>
          </div>
          <Button onClick={handleSave} className="gap-2" disabled={saving || !token}>
            <Save className="w-4 h-4" />
            {saving ? '…' : t('save')}
          </Button>
        </div>

        {/* Bandeaux d'état */}
        {error && (
          <div role="alert" className="flex items-center gap-2 rounded-md bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 text-sm text-red-700 dark:text-red-300 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div role="status" className="flex items-center gap-2 rounded-md bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 px-3 py-2 text-sm text-green-700 dark:text-green-300 mb-4">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}
        {!token && (
          <p className="text-sm text-gray-500 mb-4">
            Connectez-vous en tant qu&apos;administrateur pour modifier la navigation.
          </p>
        )}
        {loading && <p className="text-sm text-gray-500 mb-4">Chargement…</p>}

        {/* Navigation Items List */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 border border-gray-200 transition-colors duration-300 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white transition-colors duration-300">
              <Globe className="w-5 h-5" />
              {t('navItems')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sortedNavItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300"
                >
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => handleMoveUp(index)} disabled={index === 0} className="h-8 w-8">
                      <ArrowUp className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleMoveDown(index)} disabled={index === sortedNavItems.length - 1} className="h-8 w-8">
                      <ArrowDown className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">{t('label')} (FR)</Label>
                        <Input
                          value={item.label.fr}
                          onChange={(e) => setNavItems(navItems.map((n) => (n.id === item.id ? { ...n, label: { ...n.label, fr: e.target.value } } : n)))}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">{t('label')} (EN)</Label>
                        <Input
                          value={item.label.en}
                          onChange={(e) => setNavItems(navItems.map((n) => (n.id === item.id ? { ...n, label: { ...n.label, en: e.target.value } } : n)))}
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <Label className="text-xs">{t('href')}</Label>
                      <Input
                        value={item.href}
                        onChange={(e) => setNavItems(navItems.map((n) => (n.id === item.id ? { ...n, href: e.target.value } : n)))}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <input type="checkbox" checked={item.isActive} onChange={() => handleToggleActive(item.id)} className="w-4 h-4" />
                      <Label className="text-xs">{t('active')}</Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <input type="checkbox" checked={item.isExternal} onChange={() => handleToggleExternal(item.id)} className="w-4 h-4" />
                      <Label className="text-xs">{t('external')}</Label>
                    </div>
                    <Button variant="outline" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Add New Item */}
        <Card className="dark:bg-gray-800 dark:border-gray-700 border border-gray-200 transition-colors duration-300">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white transition-colors duration-300">
              {t('addNewItem')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <Label>{t('label')} (Français)</Label>
                <Input value={newItem.label.fr} onChange={(e) => setNewItem({ ...newItem, label: { ...newItem.label, fr: e.target.value } })} className="mt-1" />
              </div>
              <div>
                <Label>{t('label')} (English)</Label>
                <Input value={newItem.label.en} onChange={(e) => setNewItem({ ...newItem, label: { ...newItem.label, en: e.target.value } })} className="mt-1" />
              </div>
            </div>
            <div className="mb-4">
              <Label>{t('href')}</Label>
              <Input value={newItem.href} onChange={(e) => setNewItem({ ...newItem, href: e.target.value })} className="mt-1" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={newItem.isActive} onChange={(e) => setNewItem({ ...newItem, isActive: e.target.checked })} className="w-4 h-4" />
                <Label>{t('active')}</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={newItem.isExternal} onChange={(e) => setNewItem({ ...newItem, isExternal: e.target.checked })} className="w-4 h-4" />
                <Label>{t('external')}</Label>
              </div>
              <Button onClick={handleAddNewItem}>
                {t('add')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
