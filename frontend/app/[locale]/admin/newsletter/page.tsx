'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { uploadMedia, mediaUrl } from '@/services/content.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Mail,
  Users,
  UserCheck,
  UserX,
  Send,
  Eye,
  MousePointerClick,
  Trash2,
  Plus,
  Edit,
  Clock,
  Loader2,
  RefreshCw,
  X,
  Image as ImageIcon,
  Film,
  Bold,
  Heading,
  Link2,
} from 'lucide-react';
import {
  listSubscribers,
  setSubscriberActive,
  deleteSubscriber,
  listCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  sendCampaignNow,
  scheduleCampaign,
  getNewsletterStats,
  type NewsletterSubscriber,
  type NewsletterCampaign,
  type NewsletterStats,
  type CampaignAttachment,
} from '@/services/newsletter.service';
import { ApiRequestError } from '@/lib/api';
import { useSanitizedHtml } from '@/hooks/use-sanitized-html';

/** Nombre d'abonnés par page (pagination côté serveur). */
const SUB_PAGE_SIZE = 50;

interface CampaignDraft {
  id: string;
  subject: string;
  contentHtml: string;
  scheduledAt: string; // datetime-local ("" = aucun)
  attachments: CampaignAttachment[];
}

export default function AdminNewsletterPage() {
  const tBreadcrumb = useTranslations('admin.breadcrumb');
  const { data: session } = useSession();
  const token = session?.accessToken;

  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [campaigns, setCampaigns] = useState<NewsletterCampaign[]>([]);
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<CampaignDraft | null>(null);
  const [subPage, setSubPage] = useState(0); // page d'abonnés (0-based)
  const userId = session?.user?.id;
  // HTML de l'aperçu ASSAINI (anti-XSS) avant injection via dangerouslySetInnerHTML.
  const previewHtml = useSanitizedHtml(editing?.contentHtml);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState(false);

  /** Insère un fragment HTML à la position du curseur dans le contenu. */
  const insertAtCursor = (snippet: string) => {
    setEditing((prev) => {
      if (!prev) return prev;
      const el = contentRef.current;
      const start = el ? el.selectionStart : prev.contentHtml.length;
      const end = el ? el.selectionEnd : prev.contentHtml.length;
      const next = prev.contentHtml.slice(0, start) + snippet + prev.contentHtml.slice(end);
      // Replace le curseur après l'insertion (au prochain tick).
      setTimeout(() => {
        if (el) {
          const pos = start + snippet.length;
          el.focus();
          el.setSelectionRange(pos, pos);
        }
      }, 0);
      return { ...prev, contentHtml: next };
    });
  };

  /** Entoure la sélection courante de `before`/`after` (mise en forme). */
  const wrapSelection = (before: string, after: string) => {
    setEditing((prev) => {
      if (!prev) return prev;
      const el = contentRef.current;
      const start = el ? el.selectionStart : prev.contentHtml.length;
      const end = el ? el.selectionEnd : prev.contentHtml.length;
      const sel = prev.contentHtml.slice(start, end) || 'texte';
      const next = prev.contentHtml.slice(0, start) + before + sel + after + prev.contentHtml.slice(end);
      return { ...prev, contentHtml: next };
    });
  };

  /** Uploade un média (image/gif/vidéo) et l'insère en absolu à la position du curseur. */
  const handleMediaUpload = async (file: File, kind: 'image' | 'video') => {
    if (!token) return;
    setUploading(true);
    try {
      const media = await uploadMedia(file, 'newsletter', token, userId);
      const abs = mediaUrl(media.url); // URL absolue : indispensable pour les emails
      const snippet =
        kind === 'video'
          ? `\n<video src="${abs}" controls style="max-width:100%;border-radius:8px"></video>\n`
          : `\n<img src="${abs}" alt="" style="max-width:100%;height:auto;border-radius:8px" />\n`;
      insertAtCursor(snippet);
    } catch {
      setError("Échec de l'upload du média.");
    } finally {
      setUploading(false);
    }
  };

  const reload = useCallback(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    Promise.all([
      // Page courante d'abonnés (jamais toute la table : passage à l'échelle).
      listSubscribers(token, subPage, SUB_PAGE_SIZE).catch(() => [] as NewsletterSubscriber[]),
      listCampaigns(token).catch(() => [] as NewsletterCampaign[]),
      getNewsletterStats(token).catch(() => null),
    ])
      .then(([subs, camps, st]) => {
        setSubscribers(subs);
        setCampaigns(camps);
        setStats(st);
      })
      .catch((e) => setError(e instanceof ApiRequestError ? e.message : 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, [token, subPage]);

  useEffect(() => {
    reload();
  }, [reload]);

  /* ----------------------------- Abonnés ----------------------------- */

  const toggleSubscriber = async (s: NewsletterSubscriber) => {
    if (!token) return;
    setBusy('sub:' + s.id);
    try {
      await setSubscriberActive(token, s.id, !s.subscribed);
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Action impossible.');
    } finally {
      setBusy(null);
    }
  };

  const removeSubscriber = async (s: NewsletterSubscriber) => {
    if (!token || !confirm(`Supprimer définitivement ${s.email} ?`)) return;
    setBusy('sub:' + s.id);
    try {
      await deleteSubscriber(token, s.id);
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Suppression impossible.');
    } finally {
      setBusy(null);
    }
  };

  /* ----------------------------- Campagnes ----------------------------- */

  const newCampaign = () =>
    setEditing({ id: '', subject: '', contentHtml: '', scheduledAt: '', attachments: [] });

  const editCampaign = (c: NewsletterCampaign) =>
    setEditing({
      id: c.id,
      subject: c.subject,
      contentHtml: c.contentHtml,
      scheduledAt: c.scheduledAt ? c.scheduledAt.slice(0, 16) : '',
      attachments: c.attachments ?? [],
    });

  /** Uploade une pièce jointe (PDF, CSV, …) et l'ajoute à la campagne. */
  const handleAttachmentUpload = async (file: File) => {
    if (!token || !editing) return;
    setUploading(true);
    try {
      const media = await uploadMedia(file, 'newsletter', token, userId);
      setEditing((prev) =>
        prev ? { ...prev, attachments: [...prev.attachments, { url: media.url, filename: file.name }] } : prev
      );
    } catch {
      setError("Échec de l'upload de la pièce jointe.");
    } finally {
      setUploading(false);
    }
  };

  const removeAttachment = (idx: number) =>
    setEditing((prev) => (prev ? { ...prev, attachments: prev.attachments.filter((_, i) => i !== idx) } : prev));

  const saveCampaign = async () => {
    if (!token || !editing) return;
    if (!editing.subject.trim() || !editing.contentHtml.trim()) {
      setError('Objet et contenu sont requis.');
      return;
    }
    setBusy('save');
    try {
      const input = {
        subject: editing.subject,
        contentHtml: editing.contentHtml,
        scheduledAt: editing.scheduledAt ? `${editing.scheduledAt}:00` : null,
        attachments: editing.attachments,
      };
      if (editing.id) await updateCampaign(token, editing.id, input);
      else await createCampaign(token, input);
      setEditing(null);
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Enregistrement impossible.');
    } finally {
      setBusy(null);
    }
  };

  const sendNow = async (c: NewsletterCampaign) => {
    if (!token) return;
    if (!confirm(`Envoyer « ${c.subject} » à tous les abonnés actifs maintenant ?`)) return;
    setBusy('camp:' + c.id);
    try {
      await sendCampaignNow(token, c.id);
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Envoi impossible.');
    } finally {
      setBusy(null);
    }
  };

  const schedule = async (c: NewsletterCampaign) => {
    if (!token) return;
    const input = prompt('Date d\'envoi (AAAA-MM-JJ HH:MM)', new Date().toISOString().slice(0, 16).replace('T', ' '));
    if (!input) return;
    const iso = input.replace(' ', 'T');
    setBusy('camp:' + c.id);
    try {
      await scheduleCampaign(token, c.id, iso.length === 16 ? `${iso}:00` : iso);
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Programmation impossible.');
    } finally {
      setBusy(null);
    }
  };

  const removeCampaign = async (c: NewsletterCampaign) => {
    if (!token || !confirm(`Supprimer la campagne « ${c.subject} » ?`)) return;
    setBusy('camp:' + c.id);
    try {
      await deleteCampaign(token, c.id);
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Suppression impossible.');
    } finally {
      setBusy(null);
    }
  };

  const statusBadge = (s: NewsletterCampaign['campaignStatus']) => {
    const map: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      DRAFT: { variant: 'secondary', label: 'Brouillon' },
      SCHEDULED: { variant: 'default', label: 'Programmée' },
      SENDING: { variant: 'default', label: 'En cours…' },
      SENT: { variant: 'outline', label: 'Envoyée' },
      FAILED: { variant: 'destructive', label: 'Échec' },
    };
    const c = map[s] || map.DRAFT;
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const statCards = useMemo(
    () => [
      { label: 'Abonnés', value: stats?.totalSubscribers ?? subscribers.length, icon: Users, cls: 'text-blue-500' },
      { label: 'Actifs', value: stats?.activeSubscribers ?? subscribers.filter((s) => s.subscribed).length, icon: UserCheck, cls: 'text-green-500' },
      { label: 'Désinscrits', value: stats?.unsubscribed ?? subscribers.filter((s) => !s.subscribed).length, icon: UserX, cls: 'text-gray-500' },
      { label: 'Emails envoyés', value: stats?.emailsSent ?? 0, icon: Send, cls: 'text-purple-500' },
      { label: 'Ouvertures', value: stats?.totalOpens ?? 0, icon: Eye, cls: 'text-orange-500' },
      { label: 'Clics', value: stats?.totalClicks ?? 0, icon: MousePointerClick, cls: 'text-red-500' },
    ],
    [stats, subscribers]
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb
          items={[
            { label: tBreadcrumb('dashboard'), href: `/admin` },
            { label: tBreadcrumb('admin'), href: `/admin` },
            { label: 'Newsletter' },
          ]}
        />

        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Mail className="w-8 h-8" />
              Newsletter
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Abonnés, campagnes (envoi immédiat ou programmé) et statistiques.</p>
          </div>
          <Button variant="outline" size="sm" onClick={reload} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-900 px-4 py-3 text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <Card key={s.label} className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{s.label}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                    </div>
                    <Icon className={`w-7 h-7 ${s.cls}`} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList>
            <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
            <TabsTrigger value="subscribers">Abonnés ({stats?.totalSubscribers ?? subscribers.length})</TabsTrigger>
          </TabsList>

          {/* Campagnes */}
          <TabsContent value="campaigns" className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={newCampaign} className="gap-2" disabled={!token}>
                <Plus className="w-4 h-4" />
                Nouvelle campagne
              </Button>
            </div>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-12 text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Chargement…
                  </div>
                ) : campaigns.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 dark:text-gray-400">Aucune campagne. Créez-en une.</div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {campaigns.map((c) => {
                      const sent = c.campaignStatus === 'SENT';
                      return (
                        <div key={c.id} className="p-4 flex flex-col md:flex-row md:items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              {statusBadge(c.campaignStatus)}
                              <span className="font-medium text-gray-900 dark:text-white truncate">{c.subject}</span>
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-4 gap-y-1">
                              {c.scheduledAt && !sent && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {new Date(c.scheduledAt).toLocaleString()}
                                </span>
                              )}
                              {sent && (
                                <>
                                  <span>Envoyés : {c.sentCount}/{c.recipientCount}</span>
                                  <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {c.openCount}</span>
                                  <span className="flex items-center gap-1"><MousePointerClick className="w-3 h-3" /> {c.clickCount}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {!sent && (
                              <>
                                <Button size="sm" onClick={() => sendNow(c)} disabled={busy === 'camp:' + c.id} className="gap-1">
                                  {busy === 'camp:' + c.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                                  Envoyer
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => schedule(c)} disabled={busy === 'camp:' + c.id} className="gap-1">
                                  <Clock className="w-3 h-3" /> Programmer
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => editCampaign(c)} className="gap-1">
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="outline" onClick={() => removeCampaign(c)} disabled={busy === 'camp:' + c.id}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Abonnés */}
          <TabsContent value="subscribers">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Abonnés</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12 text-gray-500">
                    <Loader2 className="w-6 h-6 animate-spin mr-2" /> Chargement…
                  </div>
                ) : subscribers.length === 0 ? (
                  <div className="py-12 text-center text-gray-500 dark:text-gray-400">Aucun abonné pour le moment.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-sm text-gray-600 dark:text-gray-400">
                          <th className="py-3 px-3">Email</th>
                          <th className="py-3 px-3">Nom</th>
                          <th className="py-3 px-3">Statut</th>
                          <th className="py-3 px-3">Source</th>
                          <th className="py-3 px-3">Inscrit le</th>
                          <th className="py-3 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscribers.map((s) => (
                          <tr key={s.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="py-3 px-3 text-sm font-medium text-gray-900 dark:text-white">{s.email}</td>
                            <td className="py-3 px-3 text-sm text-gray-700 dark:text-gray-300">{s.name || '—'}</td>
                            <td className="py-3 px-3">
                              {s.subscribed ? (
                                <Badge variant="default">Actif</Badge>
                              ) : (
                                <Badge variant="secondary">Désactivé</Badge>
                              )}
                            </td>
                            <td className="py-3 px-3 text-xs text-gray-500 dark:text-gray-400">{s.source || '—'}</td>
                            <td className="py-3 px-3 text-xs text-gray-500 dark:text-gray-400">
                              {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => toggleSubscriber(s)}
                                  disabled={busy === 'sub:' + s.id}
                                  className="gap-1"
                                >
                                  {s.subscribed ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                                  {s.subscribed ? 'Désactiver' : 'Activer'}
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => removeSubscriber(s)} disabled={busy === 'sub:' + s.id}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination serveur des abonnés */}
                {(() => {
                  const total = stats?.totalSubscribers ?? 0;
                  const totalPages = Math.max(1, Math.ceil(total / SUB_PAGE_SIZE));
                  return (
                    <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100 dark:border-gray-700">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Page {subPage + 1} / {totalPages} — {total} abonné{total > 1 ? 's' : ''}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={subPage === 0 || loading}
                          onClick={() => setSubPage((p) => Math.max(0, p - 1))}
                        >
                          Précédent
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={subPage + 1 >= totalPages || loading}
                          onClick={() => setSubPage((p) => p + 1)}
                        >
                          Suivant
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal composition de campagne */}
      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-gray-800 dark:border-gray-700" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editing.id ? 'Modifier la campagne' : 'Nouvelle campagne'}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setEditing(null)}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Objet</Label>
                <Input value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label>Contenu</Label>

                {/* Barre d'outils : mise en forme + insertion de médias n'importe où */}
                <div className="flex flex-wrap items-center gap-1 mt-1 mb-2 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <Button type="button" variant="ghost" size="sm" title="Titre" onClick={() => insertAtCursor('\n<h2>Titre</h2>\n')}>
                    <Heading className="w-4 h-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" title="Gras" onClick={() => wrapSelection('<strong>', '</strong>')}>
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" title="Paragraphe" onClick={() => insertAtCursor('\n<p>Votre texte…</p>\n')}>
                    ¶
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    title="Lien"
                    onClick={() => {
                      const url = prompt('URL du lien', 'https://');
                      if (url) wrapSelection(`<a href="${url}">`, '</a>');
                    }}
                  >
                    <Link2 className="w-4 h-4" />
                  </Button>
                  <span className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
                  <label className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">
                    <ImageIcon className="w-4 h-4" /> Image
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      disabled={uploading || !token}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleMediaUpload(f, 'image');
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <label className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">
                    <ImageIcon className="w-4 h-4" /> GIF
                    <input
                      type="file"
                      accept="image/gif"
                      className="hidden"
                      disabled={uploading || !token}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleMediaUpload(f, 'image');
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <label className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700">
                    <Film className="w-4 h-4" /> Vidéo
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      className="hidden"
                      disabled={uploading || !token}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleMediaUpload(f, 'video');
                        e.target.value = '';
                      }}
                    />
                  </label>
                  {uploading && <Loader2 className="w-4 h-4 animate-spin text-gray-500 ml-1" />}
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <Textarea
                    ref={contentRef}
                    value={editing.contentHtml}
                    onChange={(e) => setEditing({ ...editing, contentHtml: e.target.value })}
                    rows={14}
                    className="font-mono text-sm"
                    placeholder="<p>Bonjour,</p><p>Votre actualité…</p>"
                  />
                  {/* Aperçu en direct (comme dans la boîte mail) */}
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 overflow-auto bg-white dark:bg-gray-950 max-h-[360px]">
                    <p className="text-xs uppercase tracking-wide text-gray-400 mb-2">Aperçu</p>
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: previewHtml || '<p style="color:#9ca3af">L’aperçu s’affiche ici…</p>' }}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Insérez images, GIF ou vidéos n’importe où via la barre d’outils. Les liens et ouvertures sont suivis automatiquement ;
                  un lien « Se désinscrire » natif apparaît à côté de l’expéditeur (et en bas de l’email).
                </p>
              </div>
              <div>
                <Label>Programmer l&apos;envoi (optionnel)</Label>
                <Input
                  type="datetime-local"
                  value={editing.scheduledAt}
                  onChange={(e) => setEditing({ ...editing, scheduledAt: e.target.value })}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">Laissez vide pour un brouillon (envoi manuel via « Envoyer »).</p>
              </div>

              {/* Pièces jointes (PDF, CSV, …) — différentes des images inline */}
              <div>
                <Label>Pièces jointes (PDF, CSV, …)</Label>
                <div className="mt-1 space-y-2">
                  {editing.attachments.length > 0 && (
                    <ul className="space-y-1">
                      {editing.attachments.map((a, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between gap-2 rounded-md border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm"
                        >
                          <span className="truncate text-gray-800 dark:text-gray-200">{a.filename}</span>
                          <button
                            type="button"
                            onClick={() => removeAttachment(i)}
                            className="text-red-600 dark:text-red-400 hover:underline shrink-0"
                          >
                            Retirer
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <label className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gray-300 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 w-fit">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Ajouter un fichier
                    <input
                      type="file"
                      accept=".pdf,.csv,.xlsx,.xls,.doc,.docx,.txt,.zip"
                      className="hidden"
                      disabled={uploading || !token}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleAttachmentUpload(f);
                        e.target.value = '';
                      }}
                    />
                  </label>
                  <p className="text-xs text-gray-500">Les fichiers sont joints à l’email (et non insérés dans le texte).</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
                <Button onClick={saveCampaign} disabled={busy === 'save'} className="gap-2">
                  {busy === 'save' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Enregistrer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
