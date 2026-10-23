'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Download,
  Search,
  AlertCircle,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { AdminPage, AdminPageHeader } from '@/components/admin/admin-page';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import * as content from '@/services/content.service';
import { mediaUrl } from '@/services/content.service';
import type { Media } from '@/types/content';
import { ApiRequestError } from '@/lib/api';

/** Modèle local d'affichage d'un média. */
interface MediaFile {
  id: string;
  filename: string;
  originalFilename: string;
  url: string;
  altText: string;
  size: number;
  mimeType: string;
  createdAt: string;
  /** Contexte d'upload (blog, services, newsletter, general…) — déduit du domaine. */
  domain: string;
}

/** Déduit le domaine/contexte depuis l'URL (/uploads/<domain>/<fichier>). */
function domainFromUrl(url: string): string {
  const parts = (url || '').split('/').filter(Boolean); // ["uploads","blog","x.png"]
  return parts.length >= 2 ? parts[1] : 'general';
}

/** Convertit un média backend vers le modèle local d'affichage. */
function toLocal(m: Media): MediaFile {
  return {
    id: m.id,
    filename: m.filename,
    originalFilename: m.originalFilename,
    url: m.url,
    altText: m.originalFilename,
    size: m.fileSize ?? 0,
    mimeType: m.fileType ?? '',
    createdAt: m.createdAt ?? '',
    domain: m.domain || domainFromUrl(m.url),
  };
}

/** Taille de page pour l'affichage des médias. */
const MEDIA_PAGE_SIZE = 12;

export default function AdminMediaPage() {
  const t = useTranslations('admin.content.media');
  const { data: session } = useSession();
  const token = session?.accessToken;
  const userId = session?.user?.id;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');

  /** Recharge la liste des médias depuis le backend. */
  const reload = useCallback(() => {
    if (!token) return;
    setError('');
    content
      .listMedia(token)
      .then((list) => setMediaFiles(list.map(toLocal)))
      .catch((e) => setError(e instanceof ApiRequestError ? e.message : 'Erreur de chargement des médias.'));
  }, [token]);

  useEffect(() => {
    reload();
  }, [reload]);

  const domains = Array.from(new Set(mediaFiles.map((f) => f.domain))).sort();

  const filteredFiles = mediaFiles.filter(
    (file) =>
      (domainFilter === 'all' || file.domain === domainFilter) &&
      (file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.altText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.domain.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Pagination de l'affichage.
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(filteredFiles.length / MEDIA_PAGE_SIZE));
  const pagedFiles = filteredFiles.slice(page * MEDIA_PAGE_SIZE, page * MEDIA_PAGE_SIZE + MEDIA_PAGE_SIZE);
  // Revenir page 0 si la recherche réduit la liste sous la page courante.
  useEffect(() => {
    if (page > 0 && page >= totalPages) setPage(0);
  }, [page, totalPages]);

  /** Copie l'URL absolue d'un média dans le presse-papiers. */
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const copyUrl = async (file: MediaFile) => {
    try {
      await navigator.clipboard.writeText(mediaUrl(file.url));
      setCopiedId(file.id);
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      /* presse-papiers indisponible */
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Le texte « glisser-déposer » est maintenant tenu : un fichier image déposé est sélectionné.
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !token) return;
    setUploading(true);
    setError('');
    try {
      // Domaine "general" pour le gestionnaire de médias générique.
      await content.uploadMedia(selectedFile, 'general', token, userId);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : "Erreur lors de l'upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!token) return;
    if (!confirm(t('confirmDelete'))) return;
    setError('');
    try {
      await content.deleteMedia(id, token);
      reload();
    } catch (e) {
      setError(e instanceof ApiRequestError ? e.message : 'Erreur lors de la suppression.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const actionBtn =
    'flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 text-ink shadow-sm transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500';

  return (
    <AdminPage>
      <AdminPageHeader
        title={t('title')}
        description={t('subtitle')}
        icon={ImageIcon}
        actions={
          <Button onClick={() => fileInputRef.current?.click()} className="gap-2" disabled={!token}>
            <Upload className="h-4 w-4" />
            {t('uploadFile')}
          </Button>
        }
      />

      {/* Bandeau d'erreur */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {!token && (
        <p className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-400">
          Connectez-vous en tant qu&apos;administrateur pour gérer les médias.
        </p>
      )}

      {/* Zone d'upload */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
            : 'border-gray-300 bg-white dark:border-white/15 dark:bg-white/[0.02]'
        }`}
      >
        <input ref={fileInputRef} type="file" onChange={handleFileSelect} accept="image/*" className="sr-only" id="media-upload" />
        {selectedFile ? (
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <div className="flex items-center gap-3 rounded-xl bg-paper px-4 py-3 text-left dark:bg-white/5">
              <ImageIcon className="h-5 w-5 shrink-0 text-primary-600 dark:text-primary-400" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink dark:text-white">
                  {t('selectedFile')} : {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                aria-label="Retirer le fichier"
                className="ml-2 rounded-md p-1 text-gray-400 hover:bg-gray-200 hover:text-ink dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={handleUpload} className="gap-2" disabled={uploading || !token}>
              <Upload className="h-4 w-4" />
              {uploading ? '…' : t('upload')}
            </Button>
          </div>
        ) : (
          <label htmlFor="media-upload" className="flex cursor-pointer flex-col items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
              <Upload className="h-6 w-6" />
            </span>
            <span className="font-medium text-ink dark:text-white">{t('dragDrop')}</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t('or')} <span className="font-semibold text-primary-600 dark:text-primary-400">{t('uploadFile')}</span>
            </span>
          </label>
        )}
      </div>

      {/* Recherche et filtre */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            aria-label={t('searchPlaceholder')}
          />
        </div>
        <select
          value={domainFilter}
          onChange={(e) => setDomainFilter(e.target.value)}
          aria-label={t('filter')}
          className="h-11 rounded-xl border border-gray-300 bg-white px-3.5 text-sm text-ink focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-white/15 dark:bg-white/5 dark:text-white sm:w-48"
        >
          <option value="all">{t('allDomains')}</option>
          {domains.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </div>

      {/* Grille des médias */}
      {filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-16 text-center dark:border-white/10 dark:bg-white/[0.03]">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400">
            <ImageIcon className="h-6 w-6" />
          </span>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t('noFiles')}</p>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2" disabled={!token}>
            <Upload className="h-4 w-4" />
            {t('uploadFile')}
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {pagedFiles.map((file) => (
            <figure
              key={file.id}
              className="group overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.03]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-white/5">
                {file.mimeType.startsWith('image/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mediaUrl(file.url)}
                    alt={file.altText}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <ImageIcon className="h-10 w-10 text-gray-400" />
                  </div>
                )}
                <span className="absolute left-2 top-2 rounded-full bg-ink/80 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                  {file.domain}
                </span>
                {/* Actions : visibles au survol/focus (toujours visibles sur mobile) */}
                <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1.5 bg-gradient-to-t from-ink/70 to-transparent p-2 opacity-100 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
                  <button type="button" onClick={() => copyUrl(file)} className={actionBtn} aria-label="Copier le lien" title={mediaUrl(file.url)}>
                    {copiedId === file.id ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                  <a
                    href={mediaUrl(file.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className={actionBtn}
                    aria-label={t('download')}
                    title={t('download')}
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(file.id)}
                    className={`${actionBtn} hover:text-red-600`}
                    aria-label={t('confirmDelete')}
                    title={t('confirmDelete')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <figcaption className="p-3">
                <p className="truncate text-sm font-medium text-ink dark:text-white" title={file.originalFilename}>
                  {file.originalFilename}
                </p>
                <div className="mt-1 flex items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatFileSize(file.size)}</span>
                  <span title="Servi publiquement sous /uploads (accessible via son lien)" className="text-emerald-600 dark:text-emerald-400">
                    Public
                  </span>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredFiles.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {page + 1} / {totalPages} — {filteredFiles.length} fichier{filteredFiles.length > 1 ? 's' : ''}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1" disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            <Button variant="outline" size="sm" className="gap-1" disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </AdminPage>
  );
}
