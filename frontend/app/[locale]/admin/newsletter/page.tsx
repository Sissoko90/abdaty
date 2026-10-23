'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { uploadMedia, mediaUrl } from '@/services/content.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge, type BadgeProps } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminPage, AdminPageHeader, AdminStatCard } from '@/components/admin/admin-page';
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
  AlertCircle,
  Save,
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
    const map: Record<string, { variant: NonNullable<BadgeProps['variant']>; label: string }> = {
      DRAFT: { variant: 'secondary', label: 'Brouillon' },
      SCHEDULED: { variant: 'warning', label: 'Programmée' },
      SENDING: { variant: 'default', label: 'En cours…' },
      SENT: { variant: 'success', label: 'Envoyée' },
      FAILED: { variant: 'destructive', label: 'Échec' },
    };
    const c = map[s] || map.DRAFT;
    return <Badge variant={c.variant}>{c.label}</Badge>;
  };

  const statCards = useMemo(
    () => [
      { label: 'Abonnés', value: stats?.totalSubscribers ?? subscribers.length, icon: Users, tone: 'primary' as const },
      { label: 'Actifs', value: stats?.activeSubscribers ?? subscribers.filter((s) => s.subscribed).length, icon: UserCheck, tone: 'emerald' as const },
      { label: 'Désinscrits', value: stats?.unsubscribed ?? subscribers.filter((s) => !s.subscribed).length, icon: UserX, tone: 'ink' as const },
      { label: 'Emails envoyés', value: stats?.emailsSent ?? 0, icon: Send, tone: 'primary' as const },
      { label: 'Ouvertures', value: stats?.totalOpens ?? 0, icon: Eye, tone: 'ochre' as const },
      { label: 'Clics', value: stats?.totalClicks ?? 0, icon: MousePointerClick, tone: 'emerald' as const },
    ],
    [stats, subscribers]
  );

  return (
    <>
      <AdminPage>
        <AdminPageHeader
          title="Newsletter"
          description="Abonnés, campagnes (envoi immédiat ou programmé) et statistiques."
          icon={Mail}
          actions={
            <>
              <Button variant="outline" onClick={reload} disabled={loading} className="gap-2">
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Button onClick={newCampaign} className="gap-2" disabled={!token}>
                <Plus className="h-4 w-4" />
                Nouvelle campagne
              </Button>
            </>
          }
        />

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statCards.map((s) => (
            <AdminStatCard key={s.label} label={s.label} value={s.value} icon={s.icon} tone={s.tone} />
          ))}
        </div>

        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList>
            <TabsTrigger value="campaigns">Campagnes</TabsTrigger>
            <TabsTrigger value="subscribers">Abonnés ({stats?.totalSubscribers ?? subscribers.length})</TabsTrigger>
          </TabsList>

          {/* Campagnes */}
          <TabsContent value="campaigns" className="space-y-4">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary-600" /> Chargement…
                  </div>
                ) : campaigns.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                      <Send className="h-6 w-6" />
                    </span>
                    <p className="mb-5 text-gray-600 dark:text-gray-400">Aucune campagne. Créez-en une.</p>
                    <Button onClick={newCampaign} className="gap-2" disabled={!token}>
                      <Plus className="h-4 w-4" />
                      Nouvelle campagne
                    </Button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-white/5">
                    {campaigns.map((c) => {
                      const sent = c.campaignStatus === 'SENT';
                      return (
                        <div key={c.id} className="flex flex-col gap-3 p-5 transition-colors hover:bg-gray-50/70 dark:hover:bg-white/[0.03] md:flex-row md:items-center">
                          <div className="flex-1 min-w-0">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              {statusBadge(c.campaignStatus)}
                              <span className="truncate font-semibold text-ink dark:text-white">{c.subject}</span>
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
                                <Button size="sm" variant="outline" onClick={() => editCampaign(c)} className="gap-1" aria-label="Modifier" title="Modifier">
                                  <Edit className="w-3 h-3" />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeCampaign(c)}
                              disabled={busy === 'camp:' + c.id}
                              aria-label="Supprimer"
                              title="Supprimer"
                              className="hover:border-red-300 hover:text-red-600"
                            >
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
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Abonnés</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                    <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary-600" /> Chargement…
                  </div>
                ) : subscribers.length === 0 ? (
                  <div className="py-12 text-center">
                    <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
                      <Users className="h-6 w-6" />
                    </span>
                    <p className="text-gray-600 dark:text-gray-400">Aucun abonné pour le moment.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400">
                          <th className="h-11 rounded-l-lg bg-gray-50 px-3 dark:bg-white/[0.03]">Email</th>
                          <th className="h-11 bg-gray-50 px-3 dark:bg-white/[0.03]">Nom</th>
                          <th className="h-11 bg-gray-50 px-3 dark:bg-white/[0.03]">Statut</th>
                          <th className="h-11 bg-gray-50 px-3 dark:bg-white/[0.03]">Source</th>
                          <th className="h-11 bg-gray-50 px-3 dark:bg-white/[0.03]">Inscrit le</th>
                          <th className="h-11 rounded-r-lg bg-gray-50 px-3 text-right dark:bg-white/[0.03]">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subscribers.map((s) => (
                          <tr key={s.id} className="border-b border-gray-100 transition-colors hover:bg-gray-50/70 dark:border-white/5 dark:hover:bg-white/[0.03]">
                            <td className="py-3 px-3 text-sm font-medium text-ink dark:text-white">{s.email}</td>
                            <td className="py-3 px-3 text-sm text-gray-700 dark:text-gray-300">{s.name || '—'}</td>
                            <td className="py-3 px-3">
                              {s.subscribed ? (
                                <Badge variant="success">Actif</Badge>
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
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => removeSubscriber(s)}
                                  disabled={busy === 'sub:' + s.id}
                                  aria-label="Supprimer"
                                  title="Supprimer"
                                  className="hover:border-red-300 hover:text-red-600"
                                >
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
                    <div className="mt-2 flex items-center justify-between border-t border-gray-100 pt-4 dark:border-white/5">
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
      </AdminPage>

      {/* Modal composition de campagne */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <Card className="max-h-[90vh] w-full max-w-3xl overflow-y-auto shadow-2xl shadow-ink/20 dark:bg-[#121c2e]" onClick={(e) => e.stopPropagation()}>
            <CardHeader className="border-b border-gray-100 dark:border-white/10">
              <div className="flex items-center justify-between">
                <CardTitle>{editing.id ? 'Modifier la campagne' : 'Nouvelle campagne'}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setEditing(null)} aria-label="Fermer">
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <Label>Objet</Label>
                <Input value={editing.subject} onChange={(e) => setEditing({ ...editing, subject: e.target.value })} />
              </div>
              <div>
                <Label>Contenu</Label>

                {/* Barre d'outils : mise en forme + insertion de médias n'importe où */}
                <div className="mb-2 mt-2 flex flex-wrap items-center gap-1 rounded-xl border border-gray-200 bg-gray-50 p-1.5 dark:border-white/10 dark:bg-white/5">
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
                  <span className="mx-1 h-5 w-px bg-gray-300 dark:bg-white/15" />
                  <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-sm text-gray-700 hover:bg-white dark:text-gray-300 dark:hover:bg-white/10">
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
                  <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-sm text-gray-700 hover:bg-white dark:text-gray-300 dark:hover:bg-white/10">
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
                  <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-sm text-gray-700 hover:bg-white dark:text-gray-300 dark:hover:bg-white/10">
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
                  <div className="max-h-[360px] overflow-auto rounded-xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-[#0b1322]">
                    <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">Aperçu</p>
                    <div
                      className="prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: previewHtml || '<p style="color:#9ca3af">L’aperçu s’affiche ici…</p>' }}
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Insérez images, GIF ou vidéos n’importe où via la barre d’outils. Les liens et ouvertures sont suivis automatiquement ;
                  un lien « Se désinscrire » natif apparaît à côté de l’expéditeur (et en bas de l’email).
                </p>
              </div>
              <div className="space-y-2">
                <Label>Programmer l&apos;envoi (optionnel)</Label>
                <Input
                  type="datetime-local"
                  value={editing.scheduledAt}
                  onChange={(e) => setEditing({ ...editing, scheduledAt: e.target.value })}
                />
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Laissez vide pour un brouillon (envoi manuel via « Envoyer »).</p>
              </div>

              {/* Pièces jointes (PDF, CSV, …) — différentes des images inline */}
              <div>
                <Label>Pièces jointes (PDF, CSV, …)</Label>
                <div className="mt-2 space-y-2">
                  {editing.attachments.length > 0 && (
                    <ul className="space-y-1">
                      {editing.attachments.map((a, i) => (
                        <li
                          key={i}
                          className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm dark:border-white/10"
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
                  <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm font-medium text-ink hover:bg-gray-50 dark:border-white/15 dark:text-white dark:hover:bg-white/5">
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
                  <p className="text-xs text-gray-500 dark:text-gray-400">Les fichiers sont joints à l’email (et non insérés dans le texte).</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-gray-100 pt-5 dark:border-white/10">
                <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
                <Button onClick={saveCampaign} disabled={busy === 'save'} className="gap-2">
                  {busy === 'save' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Enregistrer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
